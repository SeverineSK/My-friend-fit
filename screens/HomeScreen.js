import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, Image, FlatList, Platform, Linking, TouchableOpacity, ScrollView } from 'react-native';
import { Appbar } from 'react-native-paper';
import MapView, { Marker, Callout } from 'react-native-maps';
import * as Location from 'expo-location';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/FontAwesome';

const weatherIcons = {
    'clear': 'sun-o',
    'clouds': 'cloud',
    'rain': 'tint',
    'snow': 'snowflake-o',
    'thunderstorm': 'bolt',
};

const HomeScreen = ({ navigation, route }) => {
    const { username: initialUsername, email: initialEmail, image: initialImage } = route.params || {};
    const [username, setUsername] = useState(initialUsername);
    const [email, setEmail] = useState(initialEmail);
    const [image, setImage] = useState(initialImage);
    const [location, setLocation] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const [weather, setWeather] = useState(null);
    const [weatherError, setWeatherError] = useState(null);
    const [sportsPlaces, setSportsPlaces] = useState([]);
    const [sportsPlacesError, setSportsPlacesError] = useState(null);
    const [selectedTime, setSelectedTime] = useState(new Date());
    const [showTimePicker, setShowTimePicker] = useState(false);

    const handleLogout = () => {
        Alert.alert('Logout', 'You have been logged out', [
            {
                text: 'OK',
                onPress: () => {
                    // Clear user data if necessary
                    setLocation(null);
                    navigation.reset({
                        index: 0,
                        routes: [{ name: 'HomePage' }],
                    });
                },
            },
        ]);
    };

    const handleAccount = () => {
        navigation.navigate('AccountScreen', {
            username,
            email,
            image,
            updateUser: (updatedInfo) => {
                setUsername(updatedInfo.username);
                setEmail(updatedInfo.email);
                setImage(updatedInfo.image);
            },
        });
    };

    const handleFoods = () => {
        navigation.navigate('FoodScreen');
    };

    const handleFriends = () => {
        navigation.navigate('FriendsScreen');
    };

    const handleStoreScreen = () => {
        if (location) {
            navigation.navigate('StoreScreen', {
                latitude: location.latitude,
                longitude: location.longitude,
            });
        } else {
            Alert.alert('No Location', 'Please request location first.');
        }
    };

    const requestLocation = async () => {
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            setLocation(location.coords);
            setErrorMsg(null);

            await fetchWeather(location.coords.latitude, location.coords.longitude);
            await fetchNearbySportsPlaces(location.coords.latitude, location.coords.longitude);
        } catch (error) {
            setErrorMsg('Unable to retrieve location');
        }
    };

    const fetchWeather = async (latitude, longitude) => {
        try {
            const apiKey = 'b3693aa597cf4a0403a9b4929815b043';
            const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            setWeather(data);
            setWeatherError(null);
        } catch (error) {
            console.error('Error fetching weather data:', error);
            setWeatherError('Unable to retrieve weather data');
        }
    };

    const fetchNearbySportsPlaces = async (latitude, longitude) => {
        try {
            const apiKey = 'AIzaSyB0FjLVbLD2tj5xFuIm8i2-Kzxcy2yS8s0';
            const keywords = 'gym, sports complex, outdoor gym, public sports facilities';
            const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=5000&keyword=${encodeURIComponent(keywords)}&key=${apiKey}`;

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            console.log('Sports places data:', data);

            if (data.results) {
                const filteredResults = data.results.filter(result =>
                    result.types.includes('gym') ||
                    result.types.includes('park') ||
                    result.types.includes('stadium')
                );
                setSportsPlaces(filteredResults);
                setSportsPlacesError(null);
            } else {
                setSportsPlacesError('No sports places data available');
            }
        } catch (error) {
            console.error('Error fetching sports places data:', error);
            setSportsPlacesError('Unable to retrieve sports places data');
        }
    };

    const handleInvite = (placeName) => {
        if (!selectedTime) {
            Alert.alert('No Time Selected', 'Please select a time for the session.');
            return;
        }

        const inviteDetails = {
            placeName,
            time: selectedTime,
            username
        };

        navigation.navigate('FriendsScreen', {
            inviteDetails
        });
    };

    const handleTimeChange = (event, selectedDate) => {
        setShowTimePicker(Platform.OS === 'ios');
        if (selectedDate) {
            setSelectedTime(selectedDate);
        }
    };

    const handleDirections = (latitude, longitude) => {
        const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
        Linking.openURL(url).catch(err => {
            console.error('Failed to open URL:', err);
            Alert.alert('Error', 'Unable to open directions.');
        });
    };

    const getWeatherIcon = (weatherCondition) => {
        if (weatherCondition.includes('clear')) return weatherIcons.clear;
        if (weatherCondition.includes('clouds')) return weatherIcons.clouds;
        if (weatherCondition.includes('rain')) return weatherIcons.rain;
        if (weatherCondition.includes('snow')) return weatherIcons.snow;
        if (weatherCondition.includes('thunderstorm')) return weatherIcons.thunderstorm;
        return weatherIcons.clear;
    };

    return (
        <View style={styles.container}>
            <Appbar.Header style={styles.appbar}>
                <Appbar.Content title="Home" titleStyle={styles.appbarTitle} />
                <Appbar.Action icon="account" onPress={handleAccount} />
                <Appbar.Action icon="phone" onPress={handleFriends} />
                <Appbar.Action icon="food" onPress={handleFoods} />
                <Appbar.Action icon="store" onPress={handleStoreScreen} />
                <Appbar.Action icon="logout" onPress={handleLogout} />
            </Appbar.Header>
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.title}>Salut, {username} !</Text>
                {image && <Image source={{ uri: image }} style={styles.image} />}
                <TouchableOpacity style={styles.locationButton} onPress={requestLocation}>
                    <Icon name="location-arrow" size={24} color="#000" />
                    <Text style={styles.buttonText}>Localisation</Text>
                </TouchableOpacity>

                {location ? (
                    <>
                        {weather ? (
                            <View style={styles.weather}>
                                <View style={styles.weatherContainer}>
                                    <Icon
                                        name={getWeatherIcon(weather.weather[0].main.toLowerCase())}
                                        size={50}
                                        color="#000"
                                        style={styles.weatherIcon}
                                    />
                                    <View style={styles.weatherInfo}>
                                        <Text style={styles.weatherText}>Météo: {weather.weather[0].description}</Text>
                                        <Text style={styles.weatherText}>Température: {weather.main.temp}°C</Text>
                                    </View>
                                </View>
                            </View>
                        ) : weatherError ? (
                            <Text style={styles.error}>{weatherError}</Text>
                        ) : (
                            <Text>Fetching weather...</Text>
                        )}

                        <MapView
                            style={styles.map}
                            initialRegion={{
                                latitude: location.latitude,
                                longitude: location.longitude,
                                latitudeDelta: 0.0922,
                                longitudeDelta: 0.0421,
                            }}
                        >
                            <Marker
                                coordinate={{
                                    latitude: location.latitude,
                                    longitude: location.longitude,
                                }}
                                title="Your Location"
                            />
                            {sportsPlaces.map((place) => (
                                <Marker
                                    key={place.place_id}
                                    coordinate={{
                                        latitude: place.geometry.location.lat,
                                        longitude: place.geometry.location.lng,
                                    }}
                                    title={place.name}
                                    description={place.vicinity}
                                >
                                    <Callout>
                                        <View style={styles.calloutContainer}>
                                            <Text style={styles.placeName}>{place.name}</Text>
                                            <Text style={styles.placeDetail}>{place.vicinity}</Text>
                                            <TouchableOpacity style={styles.button} onPress={() => handleInvite(place.name)}>
                                                <Icon name="user-plus" size={20} color="#000" />
                                                <Text style={styles.buttonText}>Inviter</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity style={styles.button} onPress={() => handleDirections(place.geometry.location.lat, place.geometry.location.lng)}>
                                                <Icon name="location-arrow" size={20} color="#000" />
                                                <Text style={styles.buttonText}>Itinéraire</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </Callout>
                                </Marker>
                            ))}
                        </MapView>
                        {sportsPlaces.length > 0 ? (
                            <FlatList
                                data={sportsPlaces}
                                keyExtractor={(item) => item.place_id}
                                renderItem={({ item }) => (
                                    <View style={styles.placeItem}>
                                        <Text style={styles.placeName}>{item.name}</Text>
                                        <Text style={styles.placeDetail}>{item.vicinity}</Text>
                                        <TouchableOpacity style={styles.button} onPress={() => handleInvite(item.name)}>
                                            <Icon name="user-plus" size={20} color="#000" />
                                            <Text style={styles.buttonText}>Inviter</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.button} onPress={() => handleDirections(item.geometry.location.lat, item.geometry.location.lng)}>
                                            <Icon name="location-arrow" size={20} color="#000" />
                                            <Text style={styles.buttonText}>Itinéraire</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            />
                        ) : sportsPlacesError ? (
                            <Text style={styles.error}>{sportsPlacesError}</Text>
                        ) : (
                            <Text>Fetching sports places...</Text>
                        )}
                        {showTimePicker && (
                            <DateTimePicker
                                value={selectedTime}
                                mode="time"
                                display="default"
                                onChange={handleTimeChange}
                            />
                        )}
                    </>
                ) : (
                    <Text style={styles.error}>{errorMsg || 'Fetching location...'}</Text>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    appbar: {
        height: 50,
    },
    appbarTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    content: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 14,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    image: {
        width: 100,
        height: 100,
        marginVertical: 20,
        alignSelf: 'center',
    },
    map: {
        width: '100%',
        height: 200,
        marginTop: 20,
        marginBottom: 30,
    },
    weather: {
        marginTop: 20,
        width: '100%',
        alignItems: 'center',
    },
    weatherContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    weatherIcon: {
        marginRight: 15,
    },
    weatherInfo: {
        flexDirection: 'column',
        alignItems: 'flex-start',
    },
    weatherText: {
        fontSize: 18,
        marginVertical: 5,
    },
    locationButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#DFD0D0',
        borderRadius: 5,
        marginVertical: 10,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#DFD0D0',
        borderRadius: 5,
        marginVertical: 5,
        width: '100%',
    },
    buttonText: {
        marginLeft: 10,
        fontSize: 16,
    },
    placeItem: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    placeName: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    placeDetail: {
        fontSize: 16,
    },
    calloutContainer: {
        padding: 10,
        maxWidth: 150,
    },
    error: {
        fontSize: 18,
        color: 'red',
    },
});

export default HomeScreen;
