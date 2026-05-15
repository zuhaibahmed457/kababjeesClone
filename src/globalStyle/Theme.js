import { Dimensions, Platform, StatusBar } from 'react-native';

import Sizer from '../helpers/Sizer';
const BASEOPACITY = 0.5;

const COLORS = {
    primary: '#ed2221',
    white: '#FFFFFF',
    black100: '#000000',

    redLight: '#ef9494',
    grey: '#505050',
};

export const statusBarHeight =
    Platform.OS === 'ios'
        ? Sizer.hSize(70)
        : StatusBar.currentHeight >= 34
            ? Sizer.hSize(StatusBar.currentHeight)
            : Sizer.hSize(30);

const FONTS = {
    // GILROY
    light: 'Gilroy-Light',
    regular: 'Gilroy-Regular',
    medium: 'Gilroy-Medium',
    semiBold: 'Gilroy-SemiBold',
    bold: 'Gilroy-Bold',
    extraBold: 'Gilroy-Black',
};

const WINDOW = {
    height: Dimensions.get('window').height,
    width: Dimensions.get('window').width,
    fixPadding: 24,
};

const GLOBALSTYLE = {
    wrap: {
        flex: 1,
    },
};

export { COLORS, WINDOW, FONTS, GLOBALSTYLE, BASEOPACITY };
