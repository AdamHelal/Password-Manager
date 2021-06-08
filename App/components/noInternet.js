import React, { useState } from 'react';
import {SafeAreaView, StyleSheet, Image, View, Text } from 'react-native';

import { MaterialIcons } from '@expo/vector-icons';

export default function NoInternetScreen() {

    return(
       <SafeAreaView style={styles.container}>
            <MaterialIcons style={styles.iconStyle} name="wifi-off" size={150} color="#FA8E00"/>
            <View style={styles.internetTextContainer}>
                <Text style={styles.internetText}>Sorry, you need Internet to login.</Text>
                <Text style={styles.internetText}>Please check your Internet connection and try again.</Text>
            </View>
       </SafeAreaView> 
);}

const styles =StyleSheet.create({
    container:{
        backgroundColor:"#fff",
        flex:1,
        justifyContent:"center",
        alignItems: 'center',    
    },
    imageStyle:{
        marginLeft: 10,
        maxHeight: 200,
        maxWidth: 340,
    },
    imageContainer: {
        backgroundColor: "#fff",
        justifyContent: "center",
        alignItems: 'center',
    },
    internetText:{
        fontSize: 20, 
        fontWeight: "bold",
        color: '#FA8E00', 
        textAlign: "center",
        padding: 5,
    },
    internetTextContainer: {
        borderColor: '#FA8E00', 
        borderWidth: 2,
        borderRadius: 15,
        padding: 10,
        fontSize:16,
        color:'black',
        margin: 10,
    },
    iconStyle: {
        marginBottom: "15%",
    }
})