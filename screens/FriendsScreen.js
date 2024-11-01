import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, FlatList, TouchableOpacity, Alert, Linking } from 'react-native';
import * as Contacts from 'expo-contacts';

const FriendsScreen = () => {
    const [contacts, setContacts] = useState([]);
    const [filteredContacts, setFilteredContacts] = useState([]);
    const [errorMsg, setErrorMsg] = useState(null);
    const [permissionGranted, setPermissionGranted] = useState(false);
    const [search, setSearch] = useState('');

    const requestContacts = async () => {
        try {
            const { status } = await Contacts.requestPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission to access contacts was denied');
                return;
            }

            setPermissionGranted(true);
            const { data } = await Contacts.getContactsAsync({
                fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Emails],
            });

            if (data.length > 0) {
                const sortedContacts = data.filter(contact => contact.name).sort((a, b) => a.name.localeCompare(b.name));
                setContacts(sortedContacts);
                setFilteredContacts(sortedContacts);
            } else {
                setErrorMsg('No contacts found');
            }
        } catch (error) {
            setErrorMsg('Unable to retrieve contacts');
        }
    };

    const handleSearch = (text) => {
        setSearch(text);
        if (text) {
            const searchLower = text.toLowerCase();
            setFilteredContacts(
                contacts.filter(contact =>
                    contact.name.toLowerCase().startsWith(searchLower)
                )
            );
        } else {
            setFilteredContacts(contacts);
        }
    };

    const handleInvite = (contact) => {
        let contactInfo = '';

        if (contact.phoneNumbers && contact.phoneNumbers.length > 0) {
            contactInfo = `sms:${contact.phoneNumbers[0].number}`;
        } else if (contact.emails && contact.emails.length > 0) {
            contactInfo = `mailto:${contact.emails[0].email}`;
        } else {
            Alert.alert('No contact info', 'This contact does not have a phone number or email.');
            return;
        }

        Linking.openURL(contactInfo)
            .catch((err) => {
                Alert.alert('Error', 'Failed to open messaging app.');
                console.error('Failed to open URL:', err);
            });
    };

    const highlightText = (text, search) => {
        if (!search) return <Text>{text}</Text>;

        const searchLower = search.toLowerCase();
        if (text.toLowerCase().startsWith(searchLower)) {
            const endOfMatch = search.length;
            return (
                <Text>
                    <Text style={styles.highlightedText}>{text.slice(0, endOfMatch)}</Text>
                    {text.slice(endOfMatch)}
                </Text>
            );
        }

        return <Text>{text}</Text>;
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Amis</Text>
            <TouchableOpacity style={styles.contactButton} onPress={requestContacts}>
                <Text style={styles.buttonText}>Afficher vos contacts</Text>
            </TouchableOpacity>
            {permissionGranted && (
                <>
                    <TextInput
                        style={styles.input}
                        placeholder="Rechercher vos contacts..."
                        value={search}
                        onChangeText={handleSearch}
                    />
                    <FlatList
                        data={filteredContacts}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <View style={styles.contactItem}>
                                <Text style={styles.contactName}>
                                    {highlightText(item.name, search)}
                                </Text>
                                <Text style={styles.contactDetail}>
                                    {item.phoneNumbers ? item.phoneNumbers[0].number : item.emails ? item.emails[0].email : 'Pas de contact'}
                                </Text>
                                <TouchableOpacity
                                    style={styles.inviteButton}
                                    onPress={() => handleInvite(item)}
                                >
                                    <Text style={styles.inviteText}>Inviter</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    />
                </>
            )}
            {errorMsg && <Text style={styles.error}>{errorMsg}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    title: {
        fontSize: 24,
        marginBottom: 20,
        fontWeight: 'bold',
    },
    input: {
        height: 40,
        borderColor: '#DFD0D0',
        borderWidth: 1,
        marginBottom: 12,
        padding: 8,
    },
    contactButton: {
        backgroundColor: '#DFD0D0',
        padding: 10,
        borderRadius: 5,
        marginBottom: 20,
        alignItems: 'center',
    },
    buttonText: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 16,
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#DFD0D0',
    },
    contactName: {
        fontSize: 18,
        fontWeight: 'bold',
        flex: 2,
    },
    contactDetail: {
        fontSize: 16,
        flex: 2,
        textAlign: 'right',
    },
    inviteButton: {
        backgroundColor: '#DFD0D0',
        padding: 10,
        borderRadius: 5,
        marginLeft: 10,
    },
    inviteText: {
        color: '#000',
        fontWeight: 'bold',
    },
    error: {
        fontSize: 18,
        color: 'red',
    },
    highlightedText: {
        backgroundColor: '#DFD0D0', 
    },
});

export default FriendsScreen;
