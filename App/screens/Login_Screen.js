import React, { useState, useEffect } from 'react'
import { StyleSheet, Text, BackHandler, View, TextInput, TouchableOpacity, Alert, Image, SafeAreaView } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { NavigationEvents } from 'react-navigation';
import { Formik } from 'formik';
import * as yup from 'yup';
import * as Crypto from 'expo-crypto';

import Loading_Screen from '../components/loading';

import AsyncStorage from '@react-native-async-storage/async-storage'

import NetInfo,{useNetInfo} from '@react-native-community/netinfo';

const errorForm = yup.object({
  title: yup.string()
  .required(),
  body: yup.string()
  .required(),
  rating: yup.string()
  .required(),
});
    
async function encrypt512(input){
  const digest = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA512,
    input
    );
    return digest;
  }
  
async function encrypt256(input){
  const digest = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    input
    );
    return digest;
  }
        
export default function Login({ navigation }) {
  
  //----------------------------------------------------------------------------------------------------//
  const STORAGE_KEY_PROFILEID = '@save_ProfileID'

  
  const [netInfo, setNetInfo] = useState('');
  const netinfos = useNetInfo();
          
  async function checkAuto(){
    const ProfileID = await AsyncStorage.getItem(STORAGE_KEY_PROFILEID);
    const Email = await AsyncStorage.getItem(STORAGE_KEY_EMAIL);
    console.log("Offline Profile ID Saved: " + ProfileID);
    console.log("Offline Email Saved: " + Email);
    if(ProfileID !== null & ProfileID !== undefined){
      navigation.navigate('AskForPassword');
      console.log("Has saved Profile ID and didn't logout!");
    }
  }
  useEffect(() => {
    BackHandler.addEventListener("hardwareBackPress", ()=>{return true;});
    checkAuto();
  }, []);
  //----------------------------------------------------------------------------------------------------//

  const [loading, setLoading] = useState(false)

  const STORAGE_KEY_EMAIL = '@save_Email'

  async function saveEmail(Email) {
    try {
      await AsyncStorage.setItem(STORAGE_KEY_EMAIL, Email);
      console.log('Saved Email!')
      console.log("Email: " + Email)
    } 
    catch (e) {
      console.log(e)
      console.log('Failed to save Email!')
    }
  }

  //----------------------------------------------------------------------------------------------------//
  async function loginUser(url, key){
  
    var myHeaders = new Headers();
    myHeaders.append("Ocp-Apim-Trace", "true");
    myHeaders.append("Host", "passwordmanagerapi.azure-api.net");
    myHeaders.append("Ocp-Apim-Subscription-Key", "a8ba8548752f4f499e56299174f2b2bd");

    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      redirect: 'follow'
    };

    await fetch(url, requestOptions)
    .then(response => response.json())
    .then(result => {
      setLoading(false);
      if(result.statusCode==429){
        Alert.alert(result.message)
      }
      else{
        if(result.valid==false){
          Alert.alert("Please create an account.")
        }
        else{
          Alert.alert("Successfully logged in!")
          navigation.navigate("TFAAuthentication", {"key": key, "profile_id": result.profile_id.toString()})
          console.log("Key: " + key);
        }  
      }
      console.log("================================================================");
      console.log(result);
      console.log("================================================================");
    })
    .catch(error => console.log('error', error));
  }

    return (
      <>
      {loading == false ? (
        <Formik
        initialValues={{ 
          email: '', 
          password: '' 
        }}
        
        onSubmit={
          async (values) => {
            const passwordencryption1 = await encrypt512(values.password);
            const passwordencryption2 = await encrypt256(passwordencryption1);
            const email = await saveEmail(values.email);
            setLoading(true);
            
            const userEmail = values.email;
            console.log("Users Email: " + userEmail);
            const userPassword = values.password;
            console.log("Users Password: " + userPassword);
            
            var CryptoJS = require("crypto-js");
            var key256Bits = CryptoJS.PBKDF2(userEmail+userPassword,'', {
            keySize: 256 / 32,
            iterations:1000
          });
          console.log("key: "+key256Bits.toString(CryptoJS.enc.Base64));
          
          loginUser(`https://passwordmanagerapi.azure-api.net/PasswordManager/log_in?email=${values.email}&password=${passwordencryption2}`, key256Bits.toString(CryptoJS.enc.Base64));
          console.log(`https://passwordmanagerapi.azure-api.net/PasswordManager/log_in?email=${values.email}&password=${passwordencryption2}`);
          console.log("Encryption 1: " + passwordencryption1);
          console.log("Encryption 2: " + passwordencryption2);
        }
      }
      
      validationSchema={yup.object().shape({
          email: yup
          .string()
          .email()
          .required('Provide your E-Mail.'),
          password: yup
          .string()
          .required('Provide your password.'),
        })}
        >
          
          
      {({ values, handleChange, errors, setFieldTouched, touched, isValid, handleSubmit }) => (
        
        <SafeAreaView style={styles.container}>

              <View style={styles.imageContainer}>
                <Image style={{width: 150, height: 185}}
          			source={require('../assets/AppLogo.png')}/>
              </View>

              <TextInput style={styles.input}
                  value={values.email}
                  onChangeText={handleChange('email')}
                  onBlur={() => setFieldTouched('email')}
                  placeholder="E-mail"
                  placeholderTextColor = "#606060"
                  selectionColor="black"
                  keyboardType="email-address"
                  autoCorrect={false}
                />

              {touched.email && errors.email &&
                <Text style={styles.textError}>{errors.email}</Text>
              }

              <View style={styles.space}></View>

              <TextInput style={styles.input}
                  value={values.password}
                  onChangeText={handleChange('password')}
                  onBlur={() => setFieldTouched('password')}
                  secureTextEntry={true}
                  placeholder="Password"
                  placeholderTextColor = "#606060"
                  autoCorrect={false}
                />

              {touched.password && errors.password &&
                <Text style={styles.textError}>{errors.password}</Text>
              }

            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.button} onPress={() => { console.log(netinfos.isConnected);if(netinfos.isConnected){handleSubmit();}else{navigation.navigate('NoInternetScreen');}} }>
                  <Text style={styles.buttonText}>Login</Text>
              </TouchableOpacity>
            </View>

              <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                <Text style={styles.signupText}>Don't have an account? </Text>
                  <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                    <Text style={styles.signupTextCont}>Sign Up </Text>
                  </TouchableOpacity>
              </View>
              
          </SafeAreaView>
        )}
       </Formik> 
       
       ) : (<Loading_Screen/>)}
      </>

    );
}

const styles = StyleSheet.create({
  container : {
    backgroundColor: "#fff",
    flex: 1,
    justifyContent: "center",
  },
  imageContainer: {
    backgroundColor: "#fff",
    justifyContent:'flex-end',
		alignItems: 'center',
    marginBottom: 50,
    marginLeft: 15,
  },
  space: {
    justifyContent: "center",
    marginTop: "5%",
},
  signupText : {
      marginVertical: 10,
      color: 'orange',
      fontSize: 16,
  },
  signupTextCont : {
      color: '#1c313a',
      fontWeight: 'bold',
  },
  button: {
    width:300,
    backgroundColor:'#FA8E00',
    borderRadius: 5,
    marginTop: 30,
    marginVertical: 10,
    paddingVertical: 7
  },
  buttonText: {
    fontSize:16,
    fontWeight:'500',
    color:'white',
    textAlign:'center'
  },
buttonContainer: {
    justifyContent:'center',
    alignItems: 'center',
},
  input: {
    margin: 10,
    fontSize:16,
    color:'black',
    borderBottomColor: '#E6E6E6',
    borderBottomWidth: 1,
},
  spacingIcon: {
      marginRight: 10,
  },
  text: {
    fontSize: 32, 
    fontWeight: "bold",
    color: '#FA8E00', 
    textAlign: "center",
    marginBottom: 50
  },
  textError: {
    fontSize: 12, 
    fontWeight: "bold",
    color: '#FF0D10', 
    textAlign: "center" 
}
});