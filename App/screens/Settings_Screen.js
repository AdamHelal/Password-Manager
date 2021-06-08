
import React, { useState,useEffect } from 'react';
import { View, FlatList, SafeAreaView, StyleSheet, Text, Image, TouchableOpacity, Button, Alert, TextInput } from 'react-native';

import { FontAwesome } from '@expo/vector-icons';

import { Formik } from 'formik';
import * as yup from 'yup';

import { NavigationEvents } from 'react-navigation';
import NetInfo,{useNetInfo} from '@react-native-community/netinfo';

import AsyncStorage from '@react-native-async-storage/async-storage'

import Loading_Screen from '../components/loading';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'


const errorForm = yup.object({
    title: yup.string()
    .required(),
    body: yup.string()
    .required(),
    rating: yup.string()
    .required(),
  });
  

export default function Settings ({ navigation }) {

  const netinfos=useNetInfo();

  const [loading, setLoading] = useState(false)

  //-----------------------------------------------------------------------------------------------//
  const STORAGE_KEY_EMAIL = '@save_Email'
  const [email, setEmail] = useState('')

  async function getEmail(){
      try {
          const email = await AsyncStorage.getItem(STORAGE_KEY_EMAIL);
          console.log("Getting email: " + email);
          setEmail(email);
          return email;
      } catch (error) {
          console.log(error);
      }
  }
  //-----------------------------------------------------------------------------------------------//
  async function Logout(){
    Alert.alert("Successfully logged out!");
    navigation.navigate('Login')
    console.log("Cleared async storage!")
    await AsyncStorage.clear();
  }
  //-----------------------------------------------------------------------------------------------//
  const STORAGE_KEY_PROFILEID = '@save_ProfileID'

  async function getProfileID(){
      try {
          return await AsyncStorage.getItem(STORAGE_KEY_PROFILEID);
      } catch (e) {
        console.log(e);
        return -1;
      }
  }
  //-----------------------------------------------------------------------------------------------//
  async function deleteProfile(url){
  
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
      if(result.message=="Profile does not exist"){
        Alert.alert(result.message)
      }
      else{
        Alert.alert(result.message)
        navigation.navigate('Login')
      }  
      console.log("================================================================");
      console.log(result);
      console.log("================================================================");
    })
    .catch(error => console.log('error', error));
  }
  //-----------------------------------------------------------------------------------------------//

  useEffect (() => {
    getEmail();
    getProfileID();
  })

  return (
      
    <>
    {loading == false ? (

    <Formik
        initialValues={{ 
          confirmationText: '' 
        }}

        onSubmit={
            async (values) => {
              setLoading(true);
              const profileID = await getProfileID();
              deleteProfile(`https://passwordmanagerapi.azure-api.net/PasswordManager/delete_profile?profile_id=${profileID}`)
              console.log(`https://passwordmanagerapi.azure-api.net/PasswordManager/delete_profile?profile_id=${profileID}`);
              await AsyncStorage.clear();
            }
          }


        validationSchema={yup.object().shape({
            confirmationText: yup
              .string()
              .matches(email,  "Must match '" + email + "'.")
              .required('Please confirm your deletion.'),
          })}
        >
        {({ values, handleChange, errors, setFieldTouched, touched, isValid, handleSubmit }) => (

    <SafeAreaView style={styles.container}>

        <View style={styles.title}>
          <FontAwesome style={styles.spacingIcon} name="gear" size={28} color="grey"/>
          <Text style={styles.sectionTitle}>Settings</Text>
        </View>
        
        <KeyboardAwareScrollView
            resetScrollToCoords={{ x: 0, y: 0 }}
            enableOnAndroid={true}>

        <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.LogoutButton} onPress = {async ()=>{ await Logout()}}>
                <Text style={styles.buttonText}>Logout</Text>
            </TouchableOpacity>
        </View>

        <View style={styles.space}></View>

        <View style={styles.confirmationTextContainer}>

            <Text style={styles.dangerZone}>Danger Zone</Text>

            <Text style={styles.warning}>This action cannot be undone.</Text>
            <Text style={styles.warning}>This will permanently delete your profile and stored passwords. </Text>
            <Text style={styles.warning}>Type<Text style={{color:'red'}}> {email} </Text>to confirm.</Text>

            <View style={styles.smallspace}></View>
        
            <TextInput style={styles.input}
              value={values.confirmationText}
              onChangeText={handleChange('confirmationText')}
              onBlur={() => setFieldTouched('confirmationText')}
              placeholder="E-mail"
              placeholderTextColor = "#606060"
              selectionColor="black"
              autoCorrect={false}
            />

            {touched.confirmationText && errors.confirmationText &&
              <Text style={styles.textError}>{errors.confirmationText}</Text>
            }
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.DeleteButton} onPress={() => { console.log(netinfos.isConnected);if(netinfos.isConnected){handleSubmit();}else{alert("No Connection!");}} }>
                  <Text style={styles.buttonText}>Delete Account</Text>
              </TouchableOpacity>
            </View>
        </View>
        </KeyboardAwareScrollView>

    </SafeAreaView>

    )}
    </Formik> 

    ) : (<Loading_Screen/>)}
    </>

  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor:"white",
    flex:1,
  },
  LogoutButton: {
    width:300,
    backgroundColor:'#FA8E00',
    borderRadius: 5,
    marginTop: 30,
    marginVertical: 10,
    paddingVertical: 7
  },
    DeleteButton: {
    width:300,
    backgroundColor:'red',
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
  },
  confirmationTextContainer: {
    borderColor: 'red', 
    borderWidth: 2,
    borderRadius: 15,
    padding: 10,
    fontSize:16,
    color:'black',
    margin: 10,
  },
  warning :{
      fontSize: 16, 
  },
  dangerZone: {
    fontSize: 25, 
    fontWeight: "bold",
    color: 'red', 
    textAlign: "center",
    padding: 10,
  },
  space: {
    justifyContent: "center",
    marginTop: "15%",
  },
  smallspace: {
    justifyContent: "center",
    marginTop: "5%",
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
    color: 'grey', 
    textAlign: "center",
  },
  spacingIcon: {
    marginRight: 10,
  }
});