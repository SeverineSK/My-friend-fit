import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import HomePage from './components/HomePage';
import SignUp from './screens/SignUp';
import HomeScreen from './screens/HomeScreen';
import AccountScreen from './screens/AccountScreen';
import FriendsScreen from './screens/FriendsScreen';
import FoodScreen from './screens/FoodScreen';
import StoreScreen from './screens/StoreScreen';
import RecipeDetailScreen from './screens/RecipeDetailScreen';

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="HomePage" component={HomePage} />
        <Stack.Screen name="SignUp" component={SignUp} />
        <Stack.Screen name="HomeScreen" component={HomeScreen} />
        <Stack.Screen name="AccountScreen" component={AccountScreen} />
        <Stack.Screen name="FriendsScreen" component={FriendsScreen} />
        <Stack.Screen name="FoodScreen" component={FoodScreen} />
        <Stack.Screen name="RecipeDetailScreen" component={RecipeDetailScreen} />
        <Stack.Screen name="StoreScreen" component={StoreScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
