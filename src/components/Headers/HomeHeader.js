import React from 'react'
import { View, Text, StyleSheet, Image, ImageBackground, TextInput } from 'react-native'
import { AntDesign } from '@react-native-vector-icons/ant-design'
import { EvilIcons } from '@react-native-vector-icons/evil-icons'


import { COLORS, statusBarHeight } from '../../globalStyle/Theme'
import { Typography } from '../../atomComponents'
import Sizer from '../../helpers/Sizer'
import Images from '../../assets'

const HomeHeader = ({ }) => {
    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <View style={styles.leftContainer}>
                    <View>
                        <AntDesign name="menu" size={24} color={COLORS.white} />
                    </View>
                    <View>
                        <Typography size={12} color={COLORS.white} fontWeight='bold'>CHANGE</Typography>
                        <Typography size={12} color={COLORS.white} fontWeight='bold'>BRAND</Typography>
                    </View>
                </View>
                <View style={styles.centerContainer}>
                    <View style={styles.logoContainer}>
                        <Image source={Images.friedChickLogo} style={styles.logo} resizeMode='contain' />
                    </View>
                </View>
                <View style={styles.rightContainer}>
                    <Typography size={10} color={COLORS.white} fontWeight='light'>Change Location </Typography>
                    <Typography size={14} color={COLORS.white} fontWeight='bold' numberOfLines={1}>Jinnah Avenue Karachi</Typography>
                </View>
            </View>

            {/* Search Bar */}
            <View style={styles.searchSection}>
                <EvilIcons style={styles.searchIcon} name="search" size={28} color={COLORS.grey} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search Your Favourite Food"
                    underlineColorAndroid="transparent"
                />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.primary,

        paddingTop: Sizer.hSize(30),
        paddingHorizontal: Sizer.wSize(6),
        borderBottomLeftRadius: Sizer.hSize(8),
        borderBottomRightRadius: Sizer.hSize(8),



    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Sizer.hSize(2)
    },
    leftContainer: {
        width: '33%',
        flexDirection: 'row',
        alignItems: 'center',
        gap: Sizer.wSize(12),
    },

    centerContainer: {
        width: '33%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    rightContainer: {
        width: '33%',
        alignItems: 'flex-end',
    },

    logoContainer: {
        width: Sizer.wSize(60),
        height: Sizer.hSize(60),
        backgroundColor: COLORS.white,
        borderRadius: Sizer.fS(10),
        padding: 4
    },
    logo: {
        width: '100%',
        height: '100%',
    },
    searchSection: {
        backgroundColor: COLORS.redLight,
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: Sizer.fS(6),
        height: Sizer.hSize(36),
        paddingHorizontal: Sizer.wSize(6),
        marginVertical: Sizer.hSize(5),
    },
    searchInput: {
        flex: 1,
        fontSize: Sizer.fS(11),
        color: COLORS.grey,
        fontWeight: '600',
    }
})

export default HomeHeader
