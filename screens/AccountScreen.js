import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AccountScreen = ({ route, navigation }) => {
    const { username: initialUsername, updateUser } = route.params;
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState(initialUsername);
    const [image, setImage] = useState(null);

    useEffect(() => {
        const loadImage = async () => {
            try {
                const storedImage = await AsyncStorage.getItem('profileImage');
                if (storedImage) {
                    setImage(storedImage);
                }
            } catch (error) {
                console.error('Error loading image:', error);
            }
        };

        loadImage();
    }, []);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            const uri = result.assets[0].uri;
            setImage(uri);
            try {
                await AsyncStorage.setItem('profileImage', uri);
            } catch (error) {
                console.error('Error saving image:', error);
            }
        }
    };

    const handleSave = async () => {
        try {
            Alert.alert('Info', 'Account details saved!');
            await AsyncStorage.setItem('username', username);
            await AsyncStorage.setItem('email', email);
            await AsyncStorage.setItem('password', password);
            await AsyncStorage.setItem('profileImage', image || '');

            updateUser({ username, email, image });

            navigation.goBack();
        } catch (error) {
            console.error('Error saving user data:', error);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Réglage</Text>
            <Text style={styles.username}>{username}</Text>
            <Button title="Choisir une image" onPress={pickImage} />
            {image && <Image source={{ uri: image }} style={styles.image} />}
            <TextInput
                style={styles.input}
                value={username}
                placeholder="Nom d'utilisateur"
                onChangeText={setUsername}
                autoCapitalize="none"
            />
            <TextInput
                style={styles.input}
                value={email}
                placeholder="Email"
                onChangeText={setEmail}
                autoCapitalize="none"
            />
            <TextInput
                style={styles.input}
                value={password}
                placeholder="Mot de passe"
                secureTextEntry
                onChangeText={setPassword}
            />
            <Button title="Enregistrer" onPress={handleSave} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    username: {
        fontSize: 24,
        marginBottom: 10,
        alignSelf: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        alignSelf: 'center',
    },
    input: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        marginBottom: 12,
        padding: 8,
        width: '100%',
    },
    image: {
        width: 100,
        height: 100,
        marginVertical: 20,
        alignSelf: 'center',
        borderRadius: 50,
    },
});

export default AccountScreen;
