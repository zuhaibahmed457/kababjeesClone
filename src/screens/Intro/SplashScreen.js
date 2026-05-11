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
            <Animated.View entering={BounceIn} exiting={BounceOut} >
                <Image source={Images.logo} style={styles.logo} />
            </Animated.View>
        </Flex>
    )
}

export default SplashScreen

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.white,
    },
    logo: {
        width: 180,
        height: 180,
    },
})