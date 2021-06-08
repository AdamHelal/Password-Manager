import React, {useState} from 'react';
import {SafeAreaView, Text, StyleSheet, View, TouchableOpacity, Alert} from 'react-native';

import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from 'react-native-confirmation-code-field';

import Loading_Screen from '../components/loading';

import AsyncStorage from '@react-native-async-storage/async-storage'


export default function TFAAuthentication ({ navigation }) {

    const CELL_COUNT = 6;
    const [value, setValue] = useState('');
    const ref = useBlurOnFulfill({value, cellCount: CELL_COUNT});
    const [props, getCellOnLayoutHandler] = useClearByFocusCell({
        value,
        setValue,
    });

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
  //----------------------------------------------------------------------------------------------------//
    async function getProfileID(){
        try {
            return await AsyncStorage.getItem(STORAGE_KEY_PROFILEID);
        } catch (e) {
          console.log(e);
          return -1;
        }
    }

    async function authenticateAccount(url){
  
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
        .then(async (result) => {
          setLoading(false);
        if(result.statusCode==429){
            Alert.alert(result.message)
        }
        else{
            if(result.message=="You have been authenticated"){

                const profile_id = navigation.getParam("profile_id");
                await saveProfileID(profile_id);
                console.log("Profile ID: " + profile_id);

                Alert.alert(result.message)

                const key = navigation.getParam("key")
                console.log("Key: " + key)

                navigation.navigate('PasswordList', {"key": key})
            }
            else {
                Alert.alert(result.message)
            }
            console.log("++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
            console.log(result);
            console.log("++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
        }
        })
        .catch(error => console.log('error', error));
      }

      async function submitAuthentication(){
        setLoading(true);
        const profileID = navigation.getParam("profile_id");
        console.log("Profile: " + profileID);
        authenticateAccount(`https://passwordmanagerapi.azure-api.net/PasswordManager/authenticate_profile?profile_id=${profileID}&code=${value}`)
        console.log(`https://passwordmanagerapi.azure-api.net/PasswordManager/authenticate_profile?profile_id=${profileID}&code=${value}`);
      }

  return (
    <>
    {loading == false ? (
      
    <SafeAreaView style={styles.root}>

      <Text style={styles.title}>Authentication</Text>

      <Text style={styles.text}>Welcome back! {'\n'}Please enter the new verification code sent to your E-Mail to access your passwords.</Text>

      <CodeField
        ref={ref}
        {...props}
        // Use `caretHidden={false}` when users can't paste a text value, because context menu doesn't appear
        value={value}
        onChangeText={setValue}
        cellCount={CELL_COUNT}
        rootStyle={styles.codeFieldRoot}
        textContentType="oneTimeCode"
        renderCell={({index, symbol, isFocused}) => (
            <View
              // Make sure that you pass onLayout={getCellOnLayoutHandler(index)} prop to root component of "Cell"
              onLayout={getCellOnLayoutHandler(index)}
              key={index}
              style={[styles.cellRoot, isFocused && styles.focusCell]}>
              <Text style={styles.cellText}>
                {symbol || (isFocused ? <Cursor /> : null)}
              </Text>
            </View>
          )}
      />

        <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} 
                onPress={() => {submitAuthentication()}}
            >
                <Text style={styles.buttonText}>Authenticate</Text>
            </TouchableOpacity>
        </View>

  </SafeAreaView>
  
  ) : (<Loading_Screen/>)}
  </>

  );
}


const styles = StyleSheet.create({
    root: {
        backgroundColor: "#fff",
        flex: 1,
    },
    title: {
        marginTop: "10%",
        fontSize: 32, 
        fontWeight: "bold",
        color: '#FA8E00', 
        textAlign: "center",
        marginBottom: "10%",
    },
    codeFieldRoot: {
        marginLeft: 'auto',
        marginRight: 'auto',
        marginBottom: "5%",
    },
    cellRoot: {
        width: 60,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomColor: '#ccc',
        borderBottomWidth: 1,
    },
    cellText: {
        color: '#000',
        fontSize: 36,
        textAlign: 'center',
    },
    focusCell: {
        borderBottomColor: '#FA8E00',
        borderBottomWidth: 2,
    },
    text: {
        padding: 10, 
        fontSize: 18,
        textAlign: 'center', 
        alignItems: 'center',
        justifyContent: "center",
        marginBottom: 20
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
});