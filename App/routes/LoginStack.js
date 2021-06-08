import React from 'react';
import { createStackNavigator } from 'react-navigation-stack';
import { createAppContainer } from 'react-navigation';

import Login from '../screens/Login_Screen';
import SignUp from '../screens/SignUp_Screen';

import PasswordList from '../screens/PasswordList';

import AskForPassword from '../screens/AskForPassword';

import AddPassword from '../screens/AddPassword';

import Password_details from '../screens/PasswordDetails';

import EditPassword from '../screens/EditPassword';

import TFAVerification from '../screens/TFAVerification';
import TFAAuthentication from '../screens/TFAAuthentication';

import Settings from '../screens/Settings_Screen';

import NoInternetScreen from '../components/noInternet';

const screens = {
    Login: {
      screen: Login,
      navigationOptions: ({ navigation }) => {
        return {
          title: '',
          headerLeft: () => null,
          animationEnabled: false,
          headerShown: false,
        }
    }},
    SignUp: {
      screen: SignUp,
      navigationOptions: {
        headerBackTitle: 'Login',
        title: '',
      }
    },
    PasswordList: {
      screen: PasswordList,
      navigationOptions: ({ navigation }) => {
        return {
          title: '',
          headerShown: false,
          headerLeft: () => null,
          animationEnabled: false,
          gestureEnabled: false,
        }
      },
    },
    AskForPassword: {
      screen: AskForPassword,
      navigationOptions: ({ navigation }) => {
        return {
          title: '',
          headerLeft: () => null,
          animationEnabled: false,
          gestureEnabled: false,
        }
    }},
    AddPassword: {
      screen: AddPassword,
      navigationOptions: ({navigation}) => ({
        title: '',
        headerBackTitle:'Cancel',
      })
    },
    EditPassword: {
      screen: EditPassword,
      navigationOptions: ({navigation}) => ({
        title: '',
        headerBackTitle:'Cancel',
      })
    },
    Password_details: {
      screen: Password_details,
      navigationOptions: ({navigation}) => ({
        title: '',
        headerBackTitle:'Cancel',
      })
    },
    TFAVerification: {
      screen: TFAVerification,
      navigationOptions: ({navigation}) => ({
        title: '',
        headerLeft: () => null,
        animationEnabled: false,
        gestureEnabled: false,
      })
    },
    TFAAuthentication: {
      screen: TFAAuthentication,
      navigationOptions: ({navigation}) => ({
        title: '',
        headerLeft: () => null,
        animationEnabled: false,
        gestureEnabled: false,
      })
    },
    Settings: {
      screen: Settings,
      navigationOptions: ({navigation}) => ({
        title: '',
      })
    },
    NoInternetScreen: {
      screen: NoInternetScreen,
      navigationOptions: ({navigation}) => ({
        title: '',
      //   headerLeft: () => null,
      //   animationEnabled: false,
      //   gestureEnabled: false,
      })
    },
}

const LoginStack = createStackNavigator(screens, {
  defaultNavigationOptions: {
    headerTitleStyle: { color:'#497ADB' },
    headerTintColor: '#FA8E00',
    headerStyle: { backgroundColor: 'white', shadowRadius: 0, borderBottomWidth: 0, shadowOffset: {height: 0, width: 0}, shadowOpacity: 0, elevation: 0 },
  }
});

const App = createAppContainer(LoginStack);

export default App;