import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

import { Container, Typography } from '../../../atomComponents'
import { HomeHeader } from '../../../components'

const HomeScreen = ({ navigation }) => {
    return (
        <React.Fragment>
            <HomeHeader />
            <Container>
                <Typography size={20}>HomeScreen</Typography>
            </Container>
        </React.Fragment>
    )
}

export default HomeScreen

const styles = StyleSheet.create({})