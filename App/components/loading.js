import React, { useState } from 'react';
import {SafeAreaView, StyleSheet, Image } from 'react-native';

export default function Loading_Screen() {

    return(
       <SafeAreaView style={styles.container}>
           <Image source={require('../assets/loading_lock.gif')} style={styles.loading_gif}/>
       </SafeAreaView> 
    
);}

const styles =StyleSheet.create({
    container:{
        backgroundColor:"#fff",
        flex:1,
        flexDirection:"column",
        justifyContent:"center",
        alignContent:"flex-end"    },
    loading_gif:{
        marginLeft:25,
        maxHeight:400,
        maxWidth:335,
    }
})