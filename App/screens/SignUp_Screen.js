import React, { useState, useEffect } from 'react'
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, Image, ScrollView, SafeAreaView } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

import { Formik } from 'formik';
import * as yup from 'yup';
import * as Crypto from 'expo-crypto';

import RNPasswordStrengthMeter from 'react-native-password-strength-meter';
import { BarPasswordStrengthDisplay } from 'react-native-password-strength-meter';

import { NavigationEvents } from 'react-navigation';
import NetInfo,{useNetInfo} from '@react-native-community/netinfo';

import Loading_Screen from '../components/loading';

import AsyncStorage from '@react-native-async-storage/async-storage';


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


export default function SignUp({ navigation }) {

  const netinfos=useNetInfo();

  const [loading, setLoading] = useState(false)
 //----------------------------------------------------------------------------------------------------//
  const STORAGE_KEY_PROFILEID = '@save_ProfileID'
  
  async function saveProfileID(ProfileID) {
    try {
      console.log(ProfileID)
      await AsyncStorage.setItem(STORAGE_KEY_PROFILEID, ProfileID);
      console.log('Saved profile ID!')
    } 
    catch (e) {
      console.log(e)
      console.log('Failed to save profile ID!')
    }
  }
   //--------------------------------------------------------------------//
  async function getProfileID(){
    try {
        return await AsyncStorage.getItem(STORAGE_KEY_PROFILEID);
    } catch (e) {
      console.log(e);
      return -1;
    }
  }
  //----------------------------------------------------------------------------------------------------//
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
    async function signUpVault(url){

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
          console.log("================================================================");
          console.log(result);
          console.log("================================================================");
        })
      .catch(error => console.log('error', error));
    }
  //----------------------------------------------------------------------------------------------------//
  async function createProfile(url, key){

    var myHeaders = new Headers();
    myHeaders.append("Host", "passwordmanagerapi.azure-api.net");
    myHeaders.append("Ocp-Apim-Trace", "true");
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
      if(result.message=="Profile added, please verify your email."){
        Alert.alert(result.message)
        navigation.navigate("TFAVerification", {"key": key})
        console.log("Key: " + key);
        console.log("Profile ID: " + result.profile_id)
        return result.profile_id
      }
      else{
        Alert.alert("Sorry, this email is already in use.")
      } 
      console.log("================================================================");
      console.log(result);
      console.log("================================================================");
    })
    .then(ProfileID => {
      saveProfileID(ProfileID.toString())
      console.log(ProfileID)
    })
    .catch(error => console.log('error', error));
  }
  //----------------------------------------------------------------------------------------------------//
    return (
      <>
      {loading == false ? (
        
      <Formik
        initialValues={{ 
          name: '',
          email: '', 
          password: '',
          confirm_password: '',
        }}

        onSubmit={
          async (values) => {

            setLoading(true);
            console.log("-------------------------------------------------------");
            const name = values.name.replace("'", "[singQ]");
            const email = await saveEmail(values.email);
            const passwordencryption1 = await encrypt512(values.password);
            const passwordencryption2 = await encrypt256(passwordencryption1);
            console.log("Encryption 1: " + passwordencryption1);
            console.log("Encryption 2: " + passwordencryption2);

            console.log("-------------------------------------------------------");
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
            var ciphertext = CryptoJS.AES.encrypt(JSON.stringify([]), key256Bits.toString(CryptoJS.enc.Base64)).toString();
            console.log("cipherText: "+ciphertext);

            try{
              await AsyncStorage.setItem('@password_vault',ciphertext);
              console.log("Password vault saved!");
            }
            catch(e){
              alert(e);
            }      

            createProfile(`https://passwordmanagerapi.azure-api.net/PasswordManager/sign_up?name=${name}&email=${values.email}&password=${passwordencryption2}&encrypted_vault=${ciphertext}`, key256Bits.toString(CryptoJS.enc.Base64));
            console.log(`https://passwordmanagerapi.azure-api.net/PasswordManager/sign_up?name=${name}&email=${values.email}&password=${passwordencryption2}&encrypted_vault=${ciphertext}`);

            console.log("-------------------------------------------------------");
          }
        }

        validationSchema={yup.object().shape({
          name: yup
          .string()
          .required('Provide your Full Name.'),
          email: yup
          .string()
          .email()
          .required('Provide your E-Mail.'),
          password: yup
            .string()
            .required('Provide your password.')
            .matches(/\w*[a-z]\w*/,  "Password must have a small letter.")
            .matches(/\w*[A-Z]\w*/,  "Password must have a capital letter.")
            .matches(/\d/, "Password must have a number.")
            .matches(/[!@#$%^&*()\-_"=+{}; :,<.>]/, "Password must have a special character.")
            .min(8, ({ min }) => `Password must be at least ${min} characters.`),
          confirm_password: yup
            .string()
            .required('You must confirm your password.')
            .oneOf([yup.ref('password'), null], 'Passwords must match')
          })}
      >
      {({ values, handleChange, errors, setFieldTouched, touched, isValid, handleSubmit }) => (

          <SafeAreaView style={styles.container}>

                <View style={styles.imageContainer}>
                  <Image style={{width: 150, height: 185}}
                  source={require('../assets/AppLogo.png')}/>
                </View>
                
                <TextInput style={styles.input}
                  value={values.name}
                  onChangeText={handleChange('name')}
                  onBlur={() => setFieldTouched('name')}
                  placeholder="Full Name"
                  placeholderTextColor = "#606060"
                  selectionColor="black"
                  keyboardType="default"
                  autoCorrect={false}
                />

                {touched.name && errors.name &&
                <Text style={styles.textError}>{errors.name}</Text>
                } 
                  
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
            
              <RNPasswordStrengthMeter
                  value={values.password}
                  onChangeText={handleChange('password')}
                  onBlur={() => setFieldTouched('password')}
                  autoCorrect={false}
                  meterType="bar"
              />

              {touched.password && errors.password &&
                <Text style={styles.textError}>{errors.password}</Text>
              }

              <TextInput style={styles.input}
                  value={values.confirm_password}
                  onChangeText={handleChange('confirm_password')}
                  onBlur={() => setFieldTouched('confirm_password')}
                  secureTextEntry={true}
                  placeholder="Confirm Password"
                  placeholderTextColor = "#606060"
                  keyboardType="default"
                  autoCorrect={false}
                  />

              {touched.confirm_password && errors.confirm_password &&
                <Text style={styles.textError}>{errors.confirm_password}</Text>
              }
  
              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.button} onPress={() => { console.log(netinfos.isConnected);if(netinfos.isConnected){handleSubmit();}else{alert("No Connection!");}} }>
                    <Text style={styles.buttonText}>Sign Up</Text>
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
      marginBottom: 20,
      marginLeft: 15,
    },
    text: {
      fontSize: 32, 
      fontWeight: "bold",
      color: '#FA8E00', 
      textAlign: "center",
      marginBottom: 50
    },
    signupText : {
        flexGrow: 1,
        alignItems: "center",
        justifyContent: "center",
        marginVertical: 16,
        color: '#497ADB',
        fontSize: 16
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
    textError: {
        fontSize: 12, 
        fontWeight: "bold",
        color: '#FF0D10', 
        textAlign: "center" 
    }
});