import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { HomeScreen, SplashScreen } from '../screens'

const Stack = createNativeStackNavigator()

const RootNavigator = () => {
    const screenOptions = {
        headerShown: false,
        headerTransparent: true,
        animationTypeForReplace: 'push',
        animation: 'slide_from_right',
        tabBarHideOnKeyboard: true,
    };
    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={screenOptions} initialRouteName="SplashScreen">
                <Stack.Screen name="SplashScreen" component={SplashScreen} />
                <Stack.Screen name="HomeScreen" component={HomeScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    )
}

export default RootNavigator;