import React from 'react';
import { View, StyleSheet, KeyboardAvoidingView } from 'react-native';

import { COLORS, WINDOW } from '../globalStyle/Theme';

const Container = ({ children, conStyle = {}, isKeyboardView = false }) => {
    const WrapperComp = isKeyboardView ? KeyboardAvoidingView : View;
    return (
        <WrapperComp style={[styles.container, conStyle]}>{children}</WrapperComp>
    );
};

export default Container;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
        paddingHorizontal: WINDOW.fixPadding,
    },
});
