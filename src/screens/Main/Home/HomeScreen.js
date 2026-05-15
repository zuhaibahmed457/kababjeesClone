import React, { useCallback, useEffect, useRef, useState, useMemo, memo } from 'react'
import { ImageBackground, Pressable, StyleSheet, View, Image, FlatList } from 'react-native'

import Carousel from 'react-native-reanimated-carousel'
import Animated, {
    runOnJS,
    runOnUI,
    scrollTo,
    useAnimatedReaction,
    useAnimatedRef,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
    useAnimatedScrollHandler,
} from 'react-native-reanimated'

import { HomeHeader } from '../../../components'
import { Typography } from '../../../atomComponents'
import { COLORS, WINDOW } from '../../../globalStyle/Theme'

import Images from '../../../assets'
import Sizer from '../../../helpers/Sizer'
import { menuResponse } from '../../../api/menuApi'

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList)
const SPY_INSET = Sizer.hSize(12)

// Memoized Tab Component
const TabItem = memo(({ title, isActive, onPress, onLayout }) => (
    <Pressable style={styles.tab} onPress={onPress} onLayout={onLayout}>
        <Typography
            size={14}
            fFamily={isActive ? 'bold' : 'medium'}
            color={isActive ? COLORS.primary : COLORS.grey}
        >
            {title}
        </Typography>
    </Pressable>
))

// Memoized TabsRow Component
const TabsRow = memo(({ sections, activeSection, onScrollTo, onLayout, tabMetrics, tabRowWidth, indicatorStyle, tabsScrollRef }) => {
    return (
        <View style={styles.stickyTabHost} onLayout={onLayout}>
            <Animated.ScrollView
                ref={tabsScrollRef}
                horizontal
                nestedScrollEnabled
                showsHorizontalScrollIndicator={false}
                bounces={false}
                contentContainerStyle={styles.tabScrollContent}
            >
                <View
                    style={styles.tabRow}
                    onLayout={(e) => {
                        tabRowWidth.value = e.nativeEvent.layout.width
                    }}
                >
                    {sections.map((s, i) => (
                        <TabItem
                            key={s.key}
                            title={s.title}
                            isActive={activeSection === i}
                            onPress={() => onScrollTo(i)}
                            onLayout={(e) => {
                                const { x, width } = e.nativeEvent.layout
                                const updated = [...tabMetrics.value]
                                updated[i] = { x, width }
                                tabMetrics.value = updated
                            }}
                        />
                    ))}
                    <Animated.View pointerEvents="none" style={[styles.indicator, indicatorStyle]} />
                </View>
            </Animated.ScrollView>
        </View>
    )
})

const SectionBanner = memo(({ banner }) => (
    <View style={styles.sectionBannerContainer}>
        <Image
            source={{ uri: banner }}
            style={styles.sectionBannerImage}
            resizeMode="contain"
        />
    </View>
))

const ProductCard = memo(({ product }) => (
    <View style={styles.section}>
        <View style={styles.itemCard}>
            <View style={styles.itemInfo}>
                <Typography size={22} fWeight="700" transform="uppercase" numberOfLines={2}>
                    {product.item_name}
                </Typography>
                <Typography size={12} color={COLORS.grey} mT={6} numberOfLines={3}>
                    {product.item_description}
                </Typography>
                <Typography size={18} color={COLORS.primary} fWeight="700" mT={12}>
                    {product.prices[0]?.pretty_price}
                </Typography>
            </View>
            <View style={styles.imageWrapper}>
                <Image
                    source={{ uri: product.photo }}
                    style={styles.itemImage}
                />
                <Pressable style={styles.addButton}>
                    <Typography size={18} color={COLORS.white} fFamily="bold">+</Typography>
                </Pressable>
            </View>
        </View>
    </View>
))

const HomeScreen = () => {
    const scrollRef = useAnimatedRef()
    const tabsScrollRef = useAnimatedRef()
    const scrollY = useSharedValue(0)

    // Programmatic scroll control
    const isProgrammaticScroll = useSharedValue(false)
    const targetSection = useSharedValue(-1)

    const SECTIONS = useMemo(() => {
        const seen = new Set()
        const filtered = []
        Object.values(menuResponse.details).forEach(cat => {
            const cleanTitle = cat.title.trim().replace(/\.$/, '').toLowerCase()
            if (!seen.has(cleanTitle)) {
                seen.add(cleanTitle)
                filtered.push({
                    key: cat.id,
                    title: cat.title.trim().replace(/\.$/, ''),
                    banner: cat.image,
                    items: Object.values(cat.items || {}),
                })
            }
        })
        return filtered
    }, [])

    const [activeSection, setActiveSection] = useState(0)
    const sectionYs = useSharedValue(new Array(SECTIONS.length).fill(-1))
    const sectionTopsRef = useRef(new Array(SECTIONS.length).fill(null))

    const tabMetrics = useSharedValue(SECTIONS.map(() => ({ x: 0, width: 0 })))
    const tabRowWidth = useSharedValue(0)

    const indicatorX = useSharedValue(0)
    const indicatorW = useSharedValue(0)
    const tabsHeight = useSharedValue(0)

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollY.value = event.contentOffset.y
        },
        onBeginDrag: () => {
            isProgrammaticScroll.value = false
            targetSection.value = -1
        },
    })

    const onSectionLayout = (index) => (e) => {
        'worklet'
        const y = e.nativeEvent.layout.y
        if (index === -2) {
            tabsHeight.value = e.nativeEvent.layout.height
        } else if (index >= 0) {
            runOnJS((idx, val) => {
                sectionTopsRef.current[idx] = val
            })(index, y)

            const newYs = [...sectionYs.value]
            newYs[index] = y
            sectionYs.value = newYs
        }
    }

    const scrollTabStrip = (index) => {
        'worklet'
        const metrics = tabMetrics.value[index]
        const rowW = tabRowWidth.value
        if (!metrics || metrics.width <= 0 || rowW <= 0) return

        const centerTab = metrics.x + metrics.width / 2
        const targetX = Math.max(0, centerTab - WINDOW.width / 2)
        const maxScroll = Math.max(0, rowW - WINDOW.width)
        scrollTo(tabsScrollRef, Math.min(targetX, maxScroll), 0, true)
    }

    useAnimatedReaction(
        () => {
            if (isProgrammaticScroll.value) {
                return targetSection.value
            }

            const y = scrollY.value + tabsHeight.value + SPY_INSET
            const ys = sectionYs.value

            let currentIndex = 0

            for (let i = 0; i < ys.length; i++) {
                if (ys[i] !== -1 && ys[i] <= y) {
                    currentIndex = i
                }
            }

            return currentIndex
        },
        (current, prev) => {
            if (current !== prev && current >= 0) {
                runOnJS(setActiveSection)(current)
            }
        }
    )

    useEffect(() => {
        const metrics = tabMetrics.value[activeSection]

        if (metrics?.width) {
            indicatorX.value = withTiming(metrics.x, { duration: 220 })
            indicatorW.value = withTiming(metrics.width, { duration: 220 })

            runOnUI(scrollTabStrip)(activeSection)
        }
    }, [activeSection])

    const indicatorStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: indicatorX.value }],
            width: indicatorW.value,
        }
    })

    const scrollToSection = useCallback((index) => {
        const y = sectionTopsRef.current[index]

        if (y == null) return

        isProgrammaticScroll.value = true
        targetSection.value = index

        setActiveSection(index)

        const offset = Math.max(0, y - tabsHeight.value - SPY_INSET)

        runOnUI((scrollYPos) => {
            'worklet'
            scrollTo(scrollRef, 0, scrollYPos, true)
        })(offset)
    }, [])

    const listData = useMemo(() => {
        const data = [{ type: 'banner_carousel' }, { type: 'tabs' }]
        SECTIONS.forEach((section, sIndex) => {
            data.push({
                type: 'sectionStart',
                section,
                sectionIndex: sIndex,
            })
        })
        return data
    }, [SECTIONS])

    const renderItem = useCallback(({ item, index }) => {
        if (item.type === 'banner_carousel') {
            const bannerData = [
                { id: 1, image: Images.friedSlide1 },
                { id: 2, image: Images.friedSlide2 },
            ]
            return (
                <View style={styles.carouselWrapper}>
                    <Carousel
                        width={WINDOW.width - Sizer.wSize(16)}
                        height={WINDOW.width / 2.4}
                        data={bannerData}
                        loop
                        pagingEnabled
                        style={styles.carouselContainer}
                        renderItem={({ item: bItem }) => (
                            <View key={bItem.id} style={styles.bannerContainer}>
                                <ImageBackground
                                    source={bItem.image}
                                    style={styles.bannerImage}
                                    resizeMode="cover"
                                />
                            </View>
                        )}
                    />
                </View>
            )
        }

        if (item.type === 'tabs') {
            return (
                <TabsRow
                    sections={SECTIONS}
                    activeSection={activeSection}
                    onScrollTo={scrollToSection}
                    onLayout={onSectionLayout(-2)}
                    tabMetrics={tabMetrics}
                    tabRowWidth={tabRowWidth}
                    indicatorStyle={indicatorStyle}
                    tabsScrollRef={tabsScrollRef}
                />
            )
        }

        if (item.type === 'sectionStart') {
            return (
                <View onLayout={onSectionLayout(item.sectionIndex)}>
                    {!!item.section.banner && (
                        <SectionBanner banner={item.section.banner} />
                    )}

                    {item.section.items.map((product) => (
                        <ProductCard
                            key={product.item_id}
                            product={product}
                        />
                    ))}
                </View>
            )
        }

        return null
    }, [SECTIONS, activeSection, scrollToSection, indicatorStyle])

    return (
        <View style={styles.screen}>
            <HomeHeader />
            <AnimatedFlatList
                ref={scrollRef}
                data={listData}
                renderItem={renderItem}
                keyExtractor={(item, index) => {
                    if (item.type === 'tabs') return 'tabs'
                    if (item.type === 'banner_carousel') return 'banner_carousel'
                    if (item.type === 'sectionStart') return `section-${item.sectionIndex}`
                    return index.toString()
                }}
                stickyHeaderIndices={[1]}
                onScroll={scrollHandler}
                onMomentumScrollEnd={() => {
                    isProgrammaticScroll.value = false
                    targetSection.value = -1
                }}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                scrollEventThrottle={16}
            />
        </View>
    )
}

export default HomeScreen

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    carouselWrapper: {
        paddingHorizontal: Sizer.wSize(8),
        paddingVertical: Sizer.hSize(4),
    },
    carouselContainer: {
        borderRadius: Sizer.fS(8),
        overflow: 'hidden',
    },
    bannerContainer: {
        width: '100%',
        height: '100%',
    },
    bannerImage: {
        width: '100%',
        height: '100%',
    },
    stickyTabHost: {
        backgroundColor: COLORS.white,
        zIndex: 10,
        borderBottomWidth: Sizer.hSize(1),
        borderBottomColor: '#F5F5F5',
    },
    tabScrollContent: {
        paddingHorizontal: Sizer.wSize(8),
    },
    tabRow: {
        flexDirection: 'row',
        alignItems: 'center',
        position: 'relative',
        minHeight: Sizer.hSize(48),
    },
    tab: {
        paddingVertical: Sizer.hSize(12),
        paddingHorizontal: Sizer.wSize(8),
        alignItems: 'center',
        justifyContent: 'center',
    },
    indicator: {
        position: 'absolute',
        left: 0,
        bottom: 0,
        height: Sizer.hSize(1),
        backgroundColor: COLORS.primary,
    },
    scrollContent: {
        paddingBottom: Sizer.hSize(24),
    },
    section: {
        paddingHorizontal: Sizer.wSize(8),
    },
    sectionBannerContainer: {
        marginHorizontal: Sizer.wSize(8),
        marginTop: Sizer.hSize(12),
        marginBottom: Sizer.hSize(4),
        height: Sizer.hSize(80),
        borderRadius: Sizer.fS(12),
        overflow: 'hidden',
    },
    sectionBannerImage: {
        width: '100%',
        height: '100%',
        borderRadius: Sizer.fS(8),
    },
    itemCard: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: Sizer.fS(8),
        marginVertical: Sizer.hSize(6),
        padding: Sizer.wSize(12),
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    itemInfo: {
        flex: 1,
        marginRight: Sizer.wSize(12),
    },
    imageWrapper: {
        position: 'relative',
        width: Sizer.wSize(120),
        height: Sizer.wSize(120),
    },
    itemImage: {
        width: '100%',
        height: '100%',
        borderRadius: Sizer.fS(8),
    },
    addButton: {
        position: 'absolute',
        right: -Sizer.wSize(4),
        bottom: -Sizer.hSize(4),
        backgroundColor: COLORS.primary,
        width: Sizer.wSize(28),
        height: Sizer.wSize(28),
        borderRadius: Sizer.wSize(14),
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 4,
    },
})
