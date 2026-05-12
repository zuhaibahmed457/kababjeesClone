import React, { useEffect } from 'react'
import { StyleSheet, Image } from 'react-native'
import Animated, { BounceIn, BounceOut } from 'react-native-reanimated'

import Images from '../../assets'
import { Flex } from '../../atomComponents'
import { COLORS } from '../../globalStyle/Theme'

const SplashScreen = ({ navigation }) => {

    useEffect(() => {
        setTimeout(() => {
            navigation.replace('HomeScreen')
        }, 2000)
    }, [])

    return (
        <Flex jusContent="center" algItems="center" flex={1} extraStyle={styles.container}>
            <Animated.View entering={BounceIn} exiting={BounceOut} style={styles.logoContainer}>
                <Image source={Images.friedChickLogo} style={styles.logo} resizeMode='contain' />
            </Animated.View>
        </Flex>
    )
}

export default SplashScreen

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.white,
    },
    logoContainer: {
        width: 200,
        height: 200,
    },
    logo: {
        width: '100%',
        height: '100%',
    },
})