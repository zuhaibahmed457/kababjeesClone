import React, { useCallback, useEffect, useRef, useState } from 'react'
import { ImageBackground, InteractionManager, Pressable, StyleSheet, View } from 'react-native'

import Carousel from 'react-native-reanimated-carousel'
import Animated, {
    runOnJS,
    runOnUI,
    scrollTo,
    useAnimatedReaction,
    useAnimatedRef,
    useAnimatedStyle,
    useScrollOffset,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated'

import { HomeHeader } from '../../../components'
import { Typography } from '../../../atomComponents'
import { COLORS, WINDOW } from '../../../globalStyle/Theme'

import Images from '../../../assets'
import Sizer from '../../../helpers/Sizer'

const SPY_INSET = Sizer.hSize(8)

const SECTIONS = [
    { key: 'featured', title: 'Featured' },
    { key: 'popular', title: 'Popular' },
    { key: 'offers', title: 'Offers' },
    { key: 'desserts', title: 'Desserts' },
    { key: 'drinks', title: 'Drinks' },
]

/** Shared layout Y for each vertical section (spy). Length must match SECTIONS. */
function useSectionTopSharedValues(count) {
    const s0 = useSharedValue(0)
    const s1 = useSharedValue(-1)
    const s2 = useSharedValue(-1)
    const s3 = useSharedValue(-1)
    const s4 = useSharedValue(-1)
    const arr = [s0, s1, s2, s3, s4]
    if (count > arr.length) {
        throw new Error(`HomeScreen supports at most ${arr.length} sections`)
    }
    return arr.slice(0, count)
}

const HomeScreen = () => {
    const scrollRef = useAnimatedRef()
    const tabsScrollRef = useAnimatedRef()
    const scrollY = useScrollOffset(scrollRef)

    const [activeSection, setActiveSection] = useState(0)
    const sectionTopsRef = useRef(SECTIONS.map(() => null))
    const tabMetricsRef = useRef(SECTIONS.map(() => ({ x: 0, width: 0 })))
    const tabRowWidthRef = useRef(0)

    const sectionYs = useSectionTopSharedValues(SECTIONS.length)

    const indicatorX = useSharedValue(0)
    const indicatorW = useSharedValue(0)

    const onSectionLayout = (index) => (e) => {
        const y = e.nativeEvent.layout.y
        sectionTopsRef.current[index] = y
        if (sectionYs[index]) {
            sectionYs[index].value = index === 0 ? y : y
        }
    }

    useAnimatedReaction(
        () => {
            const y = scrollY.value
            let idx = 0
            for (let i = 1; i < SECTIONS.length; i++) {
                const top = sectionYs[i].value
                if (top >= 0 && y >= top - SPY_INSET) idx = i
            }
            return idx
        },
        (idx, prev) => {
            if (idx !== prev) {
                runOnJS(setActiveSection)(idx)
            }
        },
    )

    const syncIndicator = useCallback((index) => {
        const m = tabMetricsRef.current[index]
        if (m && m.width > 0) {
            indicatorX.value = withTiming(m.x, { duration: 200 })
            indicatorW.value = withTiming(m.width, { duration: 200 })
        }
    }, [])

    const indicatorStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: indicatorX.value }],
        width: indicatorW.value,
    }))

    useEffect(() => {
        syncIndicator(activeSection)
    }, [activeSection, syncIndicator])

    const scrollTabStrip = useCallback(
        (index) => {
            const m = tabMetricsRef.current[index]
            const rowW = tabRowWidthRef.current
            if (!m || rowW <= 0) return
            const centerTab = m.x + m.width / 2
            const targetX = Math.max(0, centerTab - WINDOW.width / 2)
            const maxScroll = Math.max(0, rowW - WINDOW.width)
            scrollTo(tabsScrollRef, Math.min(targetX, maxScroll), 0, true)
        },
        [],
    )

    useEffect(() => {
        scrollTabStrip(activeSection)
    }, [activeSection, scrollTabStrip])

    const onTabLayout = (index) => (e) => {
        const { x, width } = e.nativeEvent.layout
        tabMetricsRef.current[index] = { x, width }
        if (index === activeSection) {
            indicatorX.value = x
            indicatorW.value = width
        }
    }

    const onTabRowLayout = (e) => {
        tabRowWidthRef.current = e.nativeEvent.layout.width
    }

    const scrollToSection = (index) => {
        setActiveSection(index)
        scrollTabStrip(index)
        requestAnimationFrame(() => syncIndicator(index))

        const tryScrollMain = (attempt) => {
            const raw = sectionTopsRef.current[index]
            const laidOut = raw != null && typeof raw === 'number' && raw >= 0

            if (!laidOut) {
                if (index === 0) {
                    runOnUI(() => {
                        'worklet'
                        scrollTo(scrollRef, 0, 0, true)
                    })()
                    return
                }
                if (attempt < 16) {
                    requestAnimationFrame(() => tryScrollMain(attempt + 1))
                }
                return
            }

            const offset = Math.max(0, raw)
            runOnUI(() => {
                'worklet'
                scrollTo(scrollRef, 0, offset, true)
            })()
        }

        InteractionManager.runAfterInteractions(() => {
            tryScrollMain(0)
        })
    }

    const data = [
        { id: 1, image: Images.friedSlide1 },
        { id: 2, image: Images.friedSlide2 },
    ]

    const sectionBody = (title, subtitle) => (
        <>
            <Typography size={18} fFamily="bold">
                {title}
            </Typography>
            <Typography size={13} color={COLORS.grey} mT={6}>
                {subtitle}
            </Typography>
        </>
    )

    return (
        <View style={styles.screen}>
            <HomeHeader />
            <Animated.ScrollView
                ref={scrollRef}
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                stickyHeaderIndices={[1]}
            >
                {/* [0] Scrolls away — banner */}
                <View onLayout={onSectionLayout(0)}>
                    <Carousel
                        width={WINDOW.width}
                        height={WINDOW.width / 2.4}
                        data={data}
                        loop
                        pagingEnabled
                        style={styles.carouselContainer}
                        renderItem={({ item }) => (
                            <View key={item.id} style={styles.bannerContainer}>
                                <ImageBackground
                                    source={item.image}
                                    style={styles.bannerImage}
                                    resizeMode="cover"
                                />
                            </View>
                        )}
                    />
                </View>

                {/* [1] Stays pinned under header once it reaches the top */}
                <View style={styles.stickyTabHost}>
                    <Animated.ScrollView
                        ref={tabsScrollRef}
                        horizontal
                        nestedScrollEnabled
                        showsHorizontalScrollIndicator={false}
                        bounces={false}
                        contentContainerStyle={styles.tabScrollContent}
                    >
                        <View style={styles.tabRow} onLayout={onTabRowLayout}>
                            {SECTIONS.map((s, i) => (
                                <Pressable
                                    key={s.key}
                                    style={styles.tab}
                                    onPress={() => scrollToSection(i)}
                                    onLayout={onTabLayout(i)}
                                >
                                    <Typography
                                        size={12}
                                        fFamily={activeSection === i ? 'bold' : 'medium'}
                                        color={activeSection === i ? COLORS.primary : COLORS.grey}
                                    >
                                        {s.title}
                                    </Typography>
                                </Pressable>
                            ))}
                            <Animated.View pointerEvents="none" style={[styles.indicator, indicatorStyle]} />
                        </View>
                    </Animated.ScrollView>
                </View>

                <View
                    onLayout={onSectionLayout(1)}
                    style={[styles.section, { minHeight: WINDOW.height * 0.35 }]}
                >
                    {sectionBody('Popular near you', 'Scroll spy tracks this block while you scroll.')}
                </View>

                <View
                    onLayout={onSectionLayout(2)}
                    style={[styles.section, { minHeight: WINDOW.height * 0.35 }]}
                >
                    {sectionBody('Offers & deals', 'Tap a tab above to jump here.')}
                </View>

                <View
                    onLayout={onSectionLayout(3)}
                    style={[styles.section, { minHeight: WINDOW.height * 0.35 }]}
                >
                    {sectionBody('Desserts', 'Horizontal tab bar scrolls when the active tab changes.')}
                </View>

                <View
                    onLayout={onSectionLayout(4)}
                    style={[styles.section, { minHeight: WINDOW.height * 0.35 }]}
                >
                    {sectionBody('Drinks', 'Tabs use Reanimated for the underline and scrollTo.')}
                </View>
            </Animated.ScrollView>
        </View>
    )
}

export default HomeScreen

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    stickyTabHost: {
        backgroundColor: COLORS.white,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: COLORS.redLight,
        zIndex: 2,
    },
    tabScrollContent: {
        paddingHorizontal: Sizer.wSize(4),
        paddingBottom: Sizer.hSize(2),
    },
    tabRow: {
        flexDirection: 'row',
        alignItems: 'center',
        position: 'relative',
        minHeight: Sizer.hSize(40),
    },
    tab: {
        paddingVertical: Sizer.hSize(10),
        paddingHorizontal: Sizer.wSize(14),
        alignItems: 'center',
        justifyContent: 'center',
    },
    indicator: {
        position: 'absolute',
        left: 0,
        bottom: 0,
        height: Sizer.hSize(2.5),
        backgroundColor: COLORS.primary,
        borderRadius: Sizer.fS(2),
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: Sizer.hSize(24),
    },
    bannerImage: {
        width: '100%',
        height: '100%',
    },
    carouselContainer: {
        marginVertical: Sizer.hSize(2),
    },
    bannerContainer: {
        borderRadius: Sizer.fS(10),
        marginHorizontal: Sizer.wSize(2),
        overflow: 'hidden',
    },
    section: {
        paddingHorizontal: Sizer.wSize(6),
        paddingTop: Sizer.hSize(16),
        paddingBottom: Sizer.hSize(8),
    },
})
