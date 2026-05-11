import React from 'react';
import { View } from 'react-native';

import Sizer from '../helpers/Sizer';

const Flex = ({
    children = '',
    direction,
    flex,
    jusContent,
    algItems,
    flexWrap,
    flexShrink,
    mT,
    mB,
    gap,
    flexStyle = '',
    extraStyle = {},
}) => {
    return (
        <View
            style={[
                {
                    flex: flex || 'unset',
                    flexDirection: direction || 'row',
                    justifyContent: jusContent || 'flex-start',
                    alignItems: algItems || 'flex-start',
                    flexWrap: flexWrap || 'nowrap',
                    flexShrink: flexShrink || undefined,
                    gap: gap || 0,
                    marginTop: Sizer.hSize(mT) || 0,
                    marginBottom: Sizer.hSize(mB) || 0,
                    ...flexStyle,
                },
                extraStyle,
            ]}>
            {children}
        </View>
    );
};

export default Flex;
