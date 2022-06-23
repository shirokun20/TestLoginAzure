import React from 'react';
import { Image, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import AzureAuth from 'react-native-azure-auth';

const CLIENT_ID = 'isi ajah sendiri'
const TENANT_ID = 'isi ajah sendiri'

const azureAuth = new AzureAuth({
  clientId: CLIENT_ID,
  tenant: TENANT_ID,
  // redirectUri: 'com.bssdexrn://com.bssdexrn/android/callback',
})

const App = () => {

    const [state, setState] = React.useState({
        accessToken: null,
        user: '',
        userId: ''
    });

    const _onLogin = async () => {
        try {
            let tokens = await azureAuth.webAuth.authorize({ scope: 'openid profile User.Read' })
            console.log('CRED>>>', tokens)
            getInfo(tokens);
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
    // Masih ada bug di android, ketika selesai logout browser tidak close sendiri!!!
    const _onLogout = () => {
        azureAuth.webAuth
          .clearSession({
            closeOnLoad: true,
          })
          .then(success => {
            setState({ accessToken: null, user: null });
          })
          .catch(error => {
            setState({ accessToken: null, user: null });
          });
      };

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
            }} onPress={() => state.accessToken ?  _onLogout() : _onLogin()}>
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
