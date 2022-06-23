import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';
import { Image, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import AzureAuth from 'react-native-azure-auth';
import WebView from 'react-native-webview';
import Scope from './config/scope';
import url from 'url';
import Agent from './config/agent';

const CLIENT_ID = 'japri dulu'
const TENANT_ID = 'japri dulu'

const azureAuth = new AzureAuth({
    clientId: CLIENT_ID,
})

const INITSTATE = {
    accessToken: null,
}

const App = () => {

    const [state, setState] = React.useState(INITSTATE);

    const [isLogOut, setIsLogout] = React.useState(false);
    const [agentData, setAgenData] = React.useState({
        state: '',
        nonce: '',
        verifier: ''
    });

    var angka = 0;

    const [logoutLink, setLogoutLink] = React.useState('');
    const webViewRef = React.useRef(null);

    const agent = new Agent();

    React.useEffect(() => {
        if (state.accessToken != null) AsyncStorage.setItem('kunci', JSON.stringify(state));
    }, [state]);

    React.useEffect(() => {
        AsyncStorage.getItem('kunci').then((value) => {
            const res = value;
            if (value?.length) {
                setState(JSON.parse(res));
            }
        });
    }, [])

    const _onLogin = async () => {
        try {
            // let tokens = await azureAuth.webAuth.authorize({ scope: 'openid profile User.Read' })
            // console.log('CRED>>>', tokens)
            // getInfo(tokens);
            const scope = new Scope('openid profile email');
            const output = await agent.generateRequestParams();
            setAgenData(output);
            setLogoutLink(azureAuth.auth.loginUrl({
                responseType: 'code',
                scope: scope.toString(),
                state: output.state,
                nonce: output.nonce,
                code_challenge: output.verifier
            }));
            setTimeout(() => {
                setIsLogout(true);
            }, 1000);
        } catch (error) {
            console.log('Error during Azure operation', error)
        }
    };

    const getInfo = async (tokens) => {
        try {
            let info = await azureAuth.auth.msGraphRequest({ token: tokens.accessToken, path: 'me' })
            console.log('info', info)
            setState({ user: info.displayName, userId: tokens.userId, accessToken: tokens.accessToken })
        } catch (error) {
            console.log('Error during Azure operation', error)
        }
    }

    const getToken = async (code) => {
        const scope = new Scope('openid profile email');
        const response = await azureAuth.auth.exchange({
            code: code,
            scope: scope.toString(),
            redirectUri: '"com.testloginazure://com.testloginazure/android/callback',
            code_verifier: agentData.verifier
        });
        setLogoutLink('');
        setState({
            accessToken: response.accessToken,
        });
    }
    // Masih ada bug di android, ketika selesai logout browser tidak close sendiri!!!
    const _onLogout = () => {
        setLogoutLink(azureAuth.auth.logoutUrl());
    }

    if (logoutLink.length) {
        return <View style={{
            flex: 1,
        }}>
            <View>
                <Text>Berhasil</Text>
            </View>
            <WebView
                source={{
                    uri: logoutLink,
                }}
                style={{
                    flex: 1,
                }}
                ref={webViewRef}
                onNavigationStateChange={res => {
                    console.log(res.url);
                    console.log(res.title);
                    if (res.url.match('logoutsession')) {
                        angka = angka + 1;
                        if (angka > 1) {
                            angka = 0;
                            setLogoutLink('');
                            AsyncStorage.removeItem('kunci');
                            setState(INITSTATE);
                        }
                    } else if (res.url.match('code=')) {
                        // console.log()
                        const response = res.url.replace('#', '?')
                        const urlHashParsed = url.parse(response, true).query
                        const {
                            code,
                            state,
                        } = urlHashParsed
                        if (code.length) {
                            getToken(code);
                        }
                    } else {

                    }
                }}
            />
        </View>
    }

    return (
        <View style={{
            backgroundColor: '#0b5aa4',
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
        }}>
            <StatusBar
                backgroundColor={'#0b5aa4'}
            />
            <View style={{
                width: 160,
                height: 160,
                backgroundColor: 'white',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 200,
                borderRadius: 160,
            }}>
                <Image
                    source={require('./azure.png')}
                    style={{
                        width: 100,
                        height: 100,
                        resizeMode: 'contain',
                    }}
                />
            </View>
            <TouchableOpacity style={{
                backgroundColor: 'white',
                paddingHorizontal: 20,
                paddingVertical: 5,
                borderRadius: 5,
                flexDirection: 'row',
                alignItems: 'center',
            }} onPress={() => state.accessToken ? _onLogout() : _onLogin()}>
                <Image
                    source={require('./azure.png')}
                    style={{
                        width: 30,
                        height: 30,
                        resizeMode: 'contain',
                        marginRight: 10,
                    }}
                />
                <Text style={{
                    color: '#3ac5f2',
                    fontWeight: 'bold',
                    fontSize: 30,
                }}>{state.accessToken ? "Logout" : "Login"} Azure</Text>
            </TouchableOpacity>
        </View>
    )
};

export default App;
