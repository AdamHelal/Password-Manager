import React, { useState, useEffect } from 'react'
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, Image, ScrollView, SafeAreaView } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import {useNetInfo} from "@react-native-community/netinfo";
import { Formik } from 'formik';
import * as yup from 'yup';
import RNPasswordStrengthMeter from 'react-native-password-strength-meter';
import { BarPasswordStrengthDisplay } from 'react-native-password-strength-meter';

import Loading_Screen from '../components/loading';

const errorForm = yup.object({
  title: yup.string()
    .required(),
  body: yup.string()
    .required(),
  rating: yup.string()
    .required(),
});

export default function AddPassword({ navigation }) {

  const [loading, setLoading] = useState(false)
  const netInfo = useNetInfo();

    return (
      <>
      {loading == false ? (
        
      <Formik
        initialValues={{ 
            webapp_name: '',
            username_email: '', 
          password: '',
        }}

        onSubmit={async (values,actions) => {
          actions.resetForm();
          setLoading(true);
          navigation.getParam('function')({name:values.webapp_name, username:values.username_email, password:values.password},netInfo.isConnected);
        }}

        validationSchema={yup.object().shape({
          webapp_name: yup
          .string()
          .required('Must specify the name of the Website/App.'),
          username_email: yup
          .string()
          .required('Must specify your Username or E-Mail.'),
          password: yup
            .string()
            .required('Must provide your password.')
          })}
      >
      {({ values, handleChange, handleBlur,errors, setFieldValue,setFieldTouched, touched, isValid, handleSubmit, enableReinitialize }) => (

          <SafeAreaView style={styles.container}>

            <View style={styles.title}>
                <FontAwesome style={styles.spacingIcon} name="lock" size={28} color="#FA8E00"/>
                <Text style={styles.sectionTitle}>Add Password</Text>
            </View>

                
                <View style={styles.forms}>
                <TextInput style={styles.input}
                  value={values.webapp_name}
                  onChangeText={handleChange('webapp_name')}
                  onBlur={() => setFieldTouched('webapp_name')}
                  placeholder="Website/App"
                  placeholderTextColor = "#606060"
                  selectionColor="black"
                  keyboardType="default"
                  autoCorrect={false}
                />

                {touched.webapp_name && errors.webapp_name &&
                <Text style={styles.textError}>{errors.webapp_name}</Text>
                } 

                <View style={styles.space}></View>

                <TextInput style={styles.input}
                  value={values.username_email}
                  onChangeText={handleChange('username_email')}
                  onBlur={() => setFieldTouched('username_email')}
                  placeholder="Username/E-Mail"
                  placeholderTextColor = "#606060"
                  selectionColor="black"
                  keyboardType="default"
                  autoCorrect={false}
                />

                {touched.username_email && errors.username_email &&
                <Text style={styles.textError}>{errors.username_email}</Text>
                } 
                  
                <View style={styles.space}></View>
            
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

                <View style={styles.space}></View>

              <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.button} onPress={()=>
{        
        var temp=Array(30).fill('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz#$%&()*+,-./:;<=>?@[\]^_{|}~').map(function(x) { return x[Math.floor(Math.random() * x.length)] }).join('');
        Alert.alert(
          "Auto-Generated Password",
          `Your auto-generated password is ${temp}. Would like to continue?`,
          [
            {
              text: "Cancel",
              onPress: () => console.log("Cancel Pressed"),
              style: "cancel"
            },
            { text: "Yes", onPress: () => {
              console.log("OK Pressed")
              setFieldTouched('password');
              handleBlur('password'); 
              handleChange('password');
              values.password=temp;
              Alert.alert(
                "Auto-Generated Password",
                `Your new Password has been auto-generated.`,
                [
                  { text: "OK" }
                ]
              );
              handleSubmit();
            } }
          ],
          { cancelable: false }
        );
           }}>
                    <Text style={styles.buttonText}>Auto-Generate Password and Add</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                    <Text style={styles.buttonText}>Add</Text>
                </TouchableOpacity>
              </View>
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
    },
    forms : {
        justifyContent: "center",
        marginTop: "10%",
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
        fontSize:16,
        color:'black',
        borderBottomColor: '#E6E6E6',
        borderBottomWidth: 1,
    },
    textError: {
        fontSize: 12, 
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