import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, FlatList, Alert, Linking } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { Appbar, IconButton } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; 

const StoreScreen = ({ route, navigation }) => {
    const { latitude, longitude } = route.params || {};
    const [equipmentStores, setEquipmentStores] = useState([]);
    const [equipmentStoresError, setEquipmentStoresError] = useState(null);

    useEffect(() => {
        const fetchEquipmentStores = async () => {
            try {
                const apiKey = 'AIzaSyB0FjLVbLD2tj5xFuIm8i2-Kzxcy2yS8s0';
                const keywords = 'sporting goods store';
                const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=5000&keyword=${encodeURIComponent(keywords)}&key=${apiKey}`;

                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const data = await response.json();
                console.log('Sporting goods stores data:', data);

                if (data.results) {
                    setEquipmentStores(data.results);
                    setEquipmentStoresError(null);
                } else {
                    setEquipmentStoresError('No sporting goods stores data available');
                }
            } catch (error) {
                console.error('Error fetching sporting goods stores data:', error);
                setEquipmentStoresError('Unable to retrieve sporting goods stores data');
            }
        };

        fetchEquipmentStores();
    }, [latitude, longitude]);

    const handleDirections = (lat, lng) => {
        const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
        Linking.openURL(url).catch(err => {
            console.error('Failed to open URL:', err);
            Alert.alert('Error', 'Unable to open directions.');
        });
    };

    return (
        <View style={styles.container}>
            <Appbar.Header>
                <Appbar.Content
                    title={<Text style={styles.appbarTitle}>Magasins de sport</Text>}
                />
                <Appbar.Action icon="arrow-left" onPress={() => navigation.goBack()} />
            </Appbar.Header>
            <View style={styles.content}>
                <MapView
                    style={styles.map}
                    initialRegion={{
                        latitude,
                        longitude,
                        latitudeDelta: 0.0922,
                        longitudeDelta: 0.0421,
                    }}
                >
                    {equipmentStores.map((store) => (
                        <Marker
                            key={store.place_id}
                            coordinate={{
                                latitude: store.geometry.location.lat,
                                longitude: store.geometry.location.lng,
                            }}
                            title={store.name}
                            description={store.vicinity}
                        >
                            <Callout>
                                <View style={styles.calloutContainer}>
                                    <Text style={styles.placeName}>{store.name}</Text>
                                    <View style={styles.calloutDetails}>
                                        <Text style={styles.placeDetail}>{store.vicinity}</Text>
                                        <IconButton
                                            icon="directions"
                                            color="#000"
                                            size={20}
                                            onPress={() => handleDirections(store.geometry.location.lat, store.geometry.location.lng)}
                                            style={styles.directionsButton}
                                        />
                                    </View>
                                </View>
                            </Callout>
                        </Marker>
                    ))}
                </MapView>
                {equipmentStores.length === 0 ? (
                    <Text style={styles.error}>{equipmentStoresError || 'Fetching sporting goods stores...'}</Text>
                ) : (
                    <FlatList
                        data={equipmentStores}
                        keyExtractor={(item) => item.place_id}
                        renderItem={({ item }) => (
                            <View style={styles.placeItem}>
                                <Text style={styles.placeName}>{item.name}</Text>
                                <View style={styles.placeDetails}>
                                    <Text style={styles.placeDetail}>{item.vicinity}</Text>
                                    <IconButton
                                        icon="directions"
                                        color="#000"
                                        size={30}
                                        onPress={() => handleDirections(item.geometry.location.lat, item.geometry.location.lng)}
                                        style={styles.directionsButton}
                                    />
                                </View>
                            </View>
                        )}
                    />
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        padding: 16,
    },
    map: {
        width: '100%',
        height: 200,
        marginBottom: 20,
    },
    calloutContainer: {
        padding: 10,
        maxWidth: 200,
    },
    calloutDetails: {
        marginTop: 5,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    placeName: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    placeDetail: {
        fontSize: 16,
        flex: 1,
    },
    placeItem: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#DFD0D0',
    },
    placeDetails: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 5,
    },
    error: {
        fontSize: 18,
        color: 'red',
    },
    appbarTitle: {
        fontSize: 18,
        fontWeight: 'bold', 
    },
    directionsButton: {
        marginLeft: 50,
    },
});

export default StoreScreen;
