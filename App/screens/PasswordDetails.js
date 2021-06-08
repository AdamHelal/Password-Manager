import React, { useState, useEffect } from 'react'
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, Image, ScrollView, SafeAreaView } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { EvilIcons,MaterialIcons } from '@expo/vector-icons';
import Loading_Screen from '../components/loading';
import {useNetInfo} from "@react-native-community/netinfo";



export default function Password_details({ navigation }) {

    const [secure, setSecure] = useState(true);
    const [loading, setLoading] = useState(false);
    const netInfo = useNetInfo();

    return (
      <>
      {loading == false ?(
          <SafeAreaView style={styles.container}>

            <View style={styles.title}>
                <Icon style={styles.spacingIcon} name="lock" size={28} color="#FA8E00"/>
                <Text style={styles.sectionTitle}>Password Details</Text>
            </View>
           
                
                <View style={styles.forms}>
                <TextInput style={styles.input}
                value={navigation.getParam("item").name}
                editable={false}
                  placeholder="Website/App"
                  placeholderTextColor = "#606060"
                  selectionColor="black"
                  keyboardType="default"
                  autoCorrect={false}
                />



                <View style={styles.space}></View>

                <TextInput style={styles.input}
                editable={false}
                value={navigation.getParam("item").username}
                  placeholder="Username/E-Mail"
                  placeholderTextColor = "#606060"
                  selectionColor="black"
                  keyboardType="default"
                  autoCorrect={false}
                />

                  
                <View style={styles.space}></View>
                <View style={styles.input,{marginLeft:10,marginRight:10,flexDirection:"row",justifyContent:"space-between",alignItems:"center",borderBottomColor: '#E6E6E6',
        borderBottomWidth: 1,}}>
                <TextInput style={styles.input,{alignSelf:"stretch"}}
                editable={false}
                value={navigation.getParam("item").password}
                textContentType={"password"}
                secureTextEntry={secure}
                placeholder="Password"
                placeholderTextColor = "#606060"
                selectionColor="black"
                keyboardType="default"
                autoCorrect={false}
                />
                <Icon style={{} }name={secure ? "eye" : 'eye-slash'}size={22} color='gray' onPress={() => setSecure(!secure)} />
                </View>

                <View style={styles.space}></View>
                <View style={styles.space}></View>
              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.button} onPress={()=>navigation.navigate("EditPassword",{"item":navigation.getParam("item"),"function": navigation.getParam("function")})} >
                <View style={{flexDirection:"row",justifyContent:"center",alignItems:"center"}}>
                    <MaterialIcons name="edit" size={22} color="white" />
                    <Text style={styles.buttonText}>Edit</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={()=>{
                  Alert.alert(
                    "Delete Password",
                    `Are you sure you want to delete this password ?`,
                    [
                      {
                        text: "Cancel",
                        onPress: () => console.log("Cancel Pressed"),
                        style: "cancel"
                      },
                      { text: "Yes", onPress: () => {
                        console.log("OK Pressed");
                        navigation.getParam('function2')(navigation.getParam("item"),netInfo.isConnected);
                        alert("Password Successfully Deleted");
                      } }
                    ],
                    { cancelable: false }
                  );
                  
                  }} >
                    <View style={{flexDirection:"row",justifyContent:"center",alignItems:"center"}}>
                    <EvilIcons name="trash" size={30} color="white" />
                    <Text style={styles.buttonText}>Delete</Text>
                    </View>
                </TouchableOpacity>
                
              </View>
              </View>


        </SafeAreaView> ): (<Loading_Screen/>)}
        </>

    );
}

const styles = StyleSheet.create({
    container : {
        backgroundColor: "#fff",
        flex: 1,
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