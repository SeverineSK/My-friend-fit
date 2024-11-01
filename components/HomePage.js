import React from 'react';
import { View, Image, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import logo from '../assets/LOGO.png'; 

const HomePage = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image source={logo} style={styles.logo} resizeMode="contain" />
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('SignUp')}
        >
          <Text style={styles.buttonText}>Inscription</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const { height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: '100%',
    paddingTop: 50,
  },
  logo: {
    width: '180%',
    height: undefined,
    aspectRatio: 2,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 250,
    alignItems: 'center',
    width: '100%',
  },
  button: {
    backgroundColor: '#DFD0D0',
    borderRadius: 25, 
    paddingVertical: 12, 
    paddingHorizontal: 32, 
    elevation: 3, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  buttonText: {
    fontSize: 16,
    color: '#000', 
    fontWeight: 'bold',
  },
});

export default HomePage;
