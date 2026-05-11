import { Dimensions, PixelRatio, NativeModules } from 'react-native';

const { width, height } = Dimensions.get('window');

const guidelineBaseWidth = '375';
const guidelineBaseHeight = '812';

const horizontalScale = size => {
    return Math.ceil((width / guidelineBaseWidth) * size);
};

const verticalScale = size => {
    return Math.ceil((height / guidelineBaseHeight) * size);
};

const hSize = (size, factor = 1) => {
    return Math.ceil(size + (horizontalScale(size) - size) * factor);
};

const wSize = (size, factor = 1) => {
    return Math.ceil(size + (verticalScale(size) - size) * factor);
};

const fS = size => {
    return size * PixelRatio.getFontScale();
};

export default {
    fS,
    wSize,
    hSize,
};
