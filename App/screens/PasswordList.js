import React, { useState,useEffect } from 'react';
import { View, FlatList, SafeAreaView, StyleSheet, Text, Image, TouchableOpacity, Button } from 'react-native';
import { FontAwesome } from '@expo/vector-icons'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationEvents, withNavigation } from 'react-navigation';
import NetInfo,{useNetInfo} from "@react-native-community/netinfo";
import Loading_Screen from '../components/loading';

const Item = ({ item, onPress}) => (
  <TouchableOpacity onPress={onPress} style={styles.item}>
    <Text style={styles.list_item}>{item.name}</Text>
  </TouchableOpacity>
);

export default function PasswordList ({ navigation }) {
  const [selectedId, setSelectedId] = useState(null);
  const [DATA, setDATA] = useState([
    
  ]);
  const [loading, setLoading] = useState(false);
  const [focus,setFocus]=useState(false);
  const [first,setFirst]=useState(false);
  const netInfo = useNetInfo();
  const addPassword = async (item,isConnected) => {
    setLoading(true);
    if(DATA.length!=0){
    let length=DATA.length-1
    item.id = (parseInt(DATA[length].id)+1).toString();}
    else{
      item.id = (1).toString();
    }
    var newArray = DATA.push(item);
    setDATA(newArray);
    await saveData(isConnected);
    navigation.navigate("PasswordList");
  };

  const editPassword = async(item,newitem,isConnected) => {
    DATA[DATA.findIndex((element)=> element.id==item.id)]=newitem;
    setLoading(true);
    await saveData(isConnected);
    setLoading(false);
    navigation.navigate("Password_details", {"item":DATA[DATA.findIndex((element)=> element.id==item.id)],"function":(input,newinput,isConnected)=>editPassword(input,newinput,isConnected),"function2":(input,isConnected)=>deletePassword(input,isConnected)});
  };

  const deletePassword =  async (item,isConnected) => {
    console.log("START LOAD TO DELETE");
    setLoading(true);
    (DATA.splice(DATA.findIndex((element)=> element.id==item.id),1));
    setDATA(DATA)
    navigation.navigate("PasswordList");
    await saveData(isConnected);
    setLoading(false);
    console.log("STOP LOAD TO DELETE");
  };
  async function getVault() {
    try {
      return await AsyncStorage.getItem('@password_vault')
    } catch(e) {
      console.log(e)
    }
  }
  async function getProfileID(){
    try {
        return await AsyncStorage.getItem('@save_ProfileID');
    } catch (e) {
      console.log(e);
      return -1;
    }
}
  const readData = async (isConnected) => {
    alert("Getting Passwords...");
    setLoading(true);
    const id= await getProfileID();
    console.log("NETWORK:"+isConnected);
    var CryptoJS = require("crypto-js");
    if(isConnected){
      await getPasswordsOnline(parseInt(id));
    }
    else{
    try {
      const vault = await getVault();
      if (vault !== null) {
        console.log("offline gotten cipher: "+vault)
        var bytes  = CryptoJS.AES.decrypt(vault,navigation.getParam("key"));
        var originalText = bytes.toString(CryptoJS.enc.Utf8);
        console.log(originalText);
        console.log("gott it")
        setDATA(JSON.parse(originalText));
        setLoading(false);
      }
    } catch (e) {
      alert('Failed to fetch the data from storage')
    }
  }  
}

  const saveData = async (isConnected) => {
    alert("Saving Passwords...");
    setLoading(true);
    var CryptoJS = require("crypto-js");
    console.log(JSON.stringify(DATA));
    console.log(navigation.getParam("key"));
    var ciphertext = CryptoJS.AES.encrypt(JSON.stringify(DATA), navigation.getParam("key")).toString();
    console.log("Network: "+isConnected)
    if(isConnected){
      const id= await getProfileID();
      console.log("online saved cipher: "+ciphertext);
      await savePasswordsOnline(ciphertext,parseInt(id));
      console.log("adsdsadsaddddddddddddddddd");
      try {
        console.log("offline saved cipher: "+ciphertext);
        await AsyncStorage.setItem('@password_vault',ciphertext);
        console.log("saved");
      } catch (e) {
        alert('Failed to save the data to the storage')
      }
      setLoading(false);
    }
    else{
      try {
        console.log("offline saved cipher: "+ciphertext);
        await AsyncStorage.setItem('@password_vault',ciphertext);
        console.log("saved");
      } catch (e) {
        alert('Failed to save the data to the storage')
      }
      setLoading(false);
    }
  }
  const removeData = async () => {
    try {
      await AsyncStorage.removeItem('@password_vault');
    } catch (error) {
      throw new Error(error);
    }
  };
  async function savePasswordsOnline(ciphertext,id){
    var myHeaders = new Headers();
      myHeaders.append("Ocp-Apim-Trace", "true");
      myHeaders.append("Host", "passwordmanagerapi.azure-api.net");
      myHeaders.append("Ocp-Apim-Subscription-Key", "a8ba8548752f4f499e56299174f2b2bd");

      var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        redirect: 'follow'
      };

      await fetch(`https://passwordmanagerapi.azure-api.net/PasswordManager/load_vault?profile_id=${id}&encrypted_vault=${ciphertext}`, requestOptions)
        .then(response => response.json())
        .then(result =>{ console.log("DATABASE RETURN");console.log(result);})
        .catch(error => console.log('error', error));
  }
  async function getPasswordsOnline(id){
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
        .then(async (result) =>{
          var CryptoJS = require("crypto-js");
          console.log(result);
          let vault=result.encrypted_vault.replace(/ /g,'+');
          await checkToSave(vault);
          console.log("online retreived cipher: "+vault);
          var bytes  = CryptoJS.AES.decrypt(vault,navigation.getParam("key"));
          var originalText = bytes.toString(CryptoJS.enc.Utf8);
          console.log(originalText);
          console.log("gott it")
          setDATA(JSON.parse(originalText));
          setLoading(false);
        })
        .catch(error => console.log('error', error));
  }

  async function onConnection(isConnected){
    alert("Syncing...");
    await saveData(isConnected);
    alert("Synced!");
  }

useEffect( () => {
  console.log(focus)
  if((!first)&&(!netInfo.isConnected)==false && netInfo.isConnected){onConnection(netInfo.isConnected);}
}, [netInfo.isConnected])

async function checkToSave(newVault){
const vault = await getVault();
  if(vault==null){
    try {
      console.log("NULL overturned cipher: "+newVault);
      await AsyncStorage.setItem('@password_vault',newVault);
      console.log("saved");
    } catch (e) {
      alert('Failed to save the data to the storage')
    };
}
}

useEffect( () => {
  setFirst(true);
  console.log("FIRST"+first);
}, [])


  const renderItem = ({ item }) => {
    return <Item item={item} onPress={() => {setFocus(false);console.log(item);setSelectedId(DATA); navigation.navigate("Password_details", {"item":item,"function":(input,newinput,isConnected)=>editPassword(input,newinput,isConnected),"function2":(input,isConnected)=>deletePassword(input,isConnected)})}} />;
  };
  return (
    <>
    
    {loading == false ?(
      <SafeAreaView style={styles.container}>
      <NavigationEvents
      onDidFocus={ async ()=>{ 
        setFocus(true);
        console.log("LOADING:"+loading);
        await readData(netInfo.isConnected);
        setFirst(false);
        }}
    />
      <Text style={styles.text}>Your Passwords</Text>

      {/* -------------------------------------------------------------------------------------------------- */}
      <View style={styles.SettingsButtonContainer}>
        <TouchableOpacity style={styles.SettingsButton} onPress={() => navigation.navigate('Settings')}>
        <View style={styles.buttonText}>
            <FontAwesome name="gear" size={28} color="grey"/>
            <Text style={styles.SettingsButtonText}> Settings</Text>
        </View>
        </TouchableOpacity>  
      </View>
      {/* -------------------------------------------------------------------------------------------------- */}

      <FlatList
        data={DATA}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        extraData={selectedId}
        vertical={true}
      />
      <View style={styles.buttonHolder}>
        <TouchableOpacity style={styles.button} onPress={() => {setFocus(false);navigation.navigate('AddPassword', {function:(input,isConnected)=>addPassword(input,isConnected)}) }} >
            <Image style={styles.image} source={require("../assets/addPassword.png")}/>
        </TouchableOpacity>
      </View>
    </SafeAreaView>) : (<Loading_Screen/>)}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor:"white",
    flex:1,
    flexDirection:"column",
    justifyContent:"flex-start",
  },
  LogoutButton: {
    width: 100,
    backgroundColor:'#FA8E00',
    borderRadius: 15,
    paddingVertical: 7,
  },
  LogoutButtonText: {
    fontSize:16,
    fontWeight:'500',
    color:'white',
    textAlign:'center'
  },
  LogoutButtonContainer: {
    marginLeft: '70%',  
  },
  text: {
    fontSize: 32, 
    fontWeight: "bold",
    color: '#FA8E00', 
    textAlign: "center",
    margin: 20,
  },
  item: {
    padding: 15,
    borderBottomWidth:0.5
  },
  list_item: {
    fontSize: 25,
  },
  buttonHolder:{
    position:"absolute",
    flex:1,
    right:15,
    bottom:40,
    flexDirection:'row',
    justifyContent: 'flex-end',
    alignItems:'center',
    marginRight: 10,
  },
  button:{
    width: 75,
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
    padding:10,
    backgroundColor:'#ffffff',
    borderRadius:100,
  },
  image: {
    height:100,
    width:102
  },
    //----------------------------------//
    SettingsButton: {
      borderRadius: 15,
    },
    SettingsButtonText: {
      fontSize: 18,
      fontWeight:'500',
      color:'grey',
      textAlign:'center',
    },
    SettingsButtonContainer: {
      marginLeft: '65%',  
      borderColor: 'grey', 
      borderWidth: 2,
      borderRadius: 15,
      marginRight: 10,
      padding: 3,
    },
    buttonText: {
      flexDirection: 'row', 
      alignItems: 'center',
      textAlign: "center",
      justifyContent: "center",
    },
    //----------------------------------//
});