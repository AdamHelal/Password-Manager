import React, { useState, useEffect } from 'react'
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, Image, ScrollView, SafeAreaView } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Formik } from 'formik';
import * as yup from 'yup';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNetInfo} from "@react-native-community/netinfo";
import Loading_Screen from '../components/loading';


const errorForm = yup.object({
  title: yup.string()
    .required(),
  body: yup.string()
    .required(),
  rating: yup.string()
    .required(),
});
async function getProfileID(){
  try {
      return await AsyncStorage.getItem('@save_ProfileID');
  } catch (e) {
    console.log(e);
    return -1;
  }
}

const STORAGE_KEY_EMAIL = '@save_Email'
async function getEmail(){
  try {
      const email = await AsyncStorage.getItem(STORAGE_KEY_EMAIL);
      console.log("Getting email: " + email);
      return email;
  } catch (error) {
      console.log(error);
  }
}
export default function AskForPassword({ navigation }) {
  const netInfo = useNetInfo();
  const [loading, setLoading] = useState(false);

  async function getVault() {
    try {
      return await AsyncStorage.getItem('@password_vault')
    } catch(e) {
      console.log(e)
    }
  }
  async function getVaultOnline(key256Bits,id){
    var myHeaders = new Headers();
            myHeaders.append("Ocp-Apim-Trace", "true");
            myHeaders.append("Host", "passwordmanagerapi.azure-api.net");
            myHeaders.append("Ocp-Apim-Subscription-Key", "a8ba8548752f4f499e56299174f2b2bd");

            var requestOptions = {
              method: 'POST',
              headers: myHeaders,
              redirect: 'follow'
            };

            await fetch(`https://passwordmanagerapi.azure-api.net/PasswordManager/load_vault?profile_id=${id}`, requestOptions)
              .then(response => response.json())
              .then((result) =>
              {
                if(result.statusCode==429){
                  Alert.alert(result.message)
              }
              else{
                var CryptoJS = require("crypto-js");
                setLoading(false);
                console.log(result.message);
                try {
                  let vault=result.encrypted_vault.replace(/ /g,'+');
                  console.log(vault)
                  console.log(key256Bits.toString(CryptoJS.enc.Base64));
                  var bytes  = CryptoJS.AES.decrypt(vault,key256Bits.toString(CryptoJS.enc.Base64));
                  var originalText = bytes.toString(CryptoJS.enc.Utf8);
                  console.log(Array.isArray(JSON.parse(originalText)));
                  
                  if(Array.isArray(JSON.parse(originalText))){
                    navigation.navigate('PasswordList',{"key":key256Bits.toString(CryptoJS.enc.Base64)});
                  }
                }
                  catch (e) {
                    Alert.alert(
                      "Wrong Password",
                      "Please try again",
                      [
                        { text: "OK" }
                      ]
                      );
                  }
              }
              })
              .catch(error => console.log('error', error));
  }
    return (
    
      <>
      {loading == false ?(  
      <Formik
        initialValues={{ 
          password: '',
        }}

        onSubmit={ async (values,actions) => {
          const email=await getEmail();
          var CryptoJS = require("crypto-js");
          var key256Bits = CryptoJS.PBKDF2(`${email}${values.password}`,'', {
            keySize: 256 / 32,
            iterations:1000
          });
          console.log("key: "+key256Bits.toString(CryptoJS.enc.Base64));
          const id= await getProfileID();
          actions.resetForm();
          if(netInfo.isConnected){
            setLoading(true);
            await getVaultOnline(key256Bits,parseInt(id));
          }
          else{
            alert("offline");
          try {
            const vault = await getVault();
            if (vault !== null) {
              console.log("verfying:"+vault)
              var bytes  = CryptoJS.AES.decrypt(vault,key256Bits.toString(CryptoJS.enc.Base64));
              var originalText = bytes.toString(CryptoJS.enc.Utf8);
              console.log(Array.isArray(JSON.parse(originalText)));
              if(Array.isArray(JSON.parse(originalText))){
                navigation.navigate('PasswordList',{"key":key256Bits.toString(CryptoJS.enc.Base64)});
              }
            }
           } catch (e) {

            Alert.alert(
              "Wrong Password",
              "Please try again",
              [
                { text: "OK" }
              ]
            );
          }
          }
        }
      }

        validationSchema={yup.object().shape({
          password: yup
            .string()
            .required('Must enter your password before proceeding.')
          })}
      >
      {({ values, handleChange, errors, setFieldTouched, touched, isValid, handleSubmit }) => (

          <SafeAreaView style={styles.container}>

            <View style={styles.title}>
                <Text style={styles.sectionTitle}>Enter Your Password</Text>
            </View>

            <View style={styles.forms}>
                <TextInput style={styles.input}
                  value={values.password}
                  secureTextEntry={true}
                  onChangeText={handleChange('password')}
                  onBlur={() => setFieldTouched('password')}
                  placeholder="Password"
                  placeholderTextColor = "#606060"
                  selectionColor="black"
                  keyboardType="default"
                  autoCorrect={false}
                  />

                {touched.password && errors.password &&
                <Text style={styles.textError}>{errors.password}</Text>
            } 
            </View>

              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                    <Text style={styles.buttonText}>Continue</Text>
                </TouchableOpacity>
              </View>

        </SafeAreaView>

      )}
       </Formik> ): (<Loading_Screen/>)}
       </>
    );
}

const styles = StyleSheet.create({
    container : {
        backgroundColor: "#fff",
        flex: 1,
    },
    forms : {
        justifyContent: "center",
        marginTop: "15%",
        marginBottom: "10%",
    },
    space: {
        justifyContent: "center",
        marginTop: "10%",
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
        fontSize:18,
        color:'black',
        borderBottomColor: '#E6E6E6',
        borderBottomWidth: 1,
    },
    textError: {
        fontSize: 14, 
        fontWeight: "bold",
        color: '#FF0D10', 
        textAlign: "center",
    },
    title: {
        flexDirection: 'row', 
        alignItems: 'center',
        paddingBottom: 15,
        justifyContent: "center",
        marginBottom: 20
      },
      sectionTitle: {
        fontSize: 28,
        fontWeight: "bold",
        color: '#FA8E00', 
        textAlign: "center",
      },
      spacingIcon: {
        marginRight: 10,
      }
});