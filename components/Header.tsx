import React from "react"
import { StyleSheet, Text, View } from "react-native"
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from "react-native-reanimated"
import { colors, fonts } from "../styles/theme"
import { LinearGradient } from "expo-linear-gradient"

const Header = () => {
    // Animation for floating effect
    const translateY = useSharedValue(0)

    React.useEffect(() => {
        translateY.value = withRepeat(withTiming(-10, { duration: 3000, easing: Easing.inOut(Easing.ease) }), -1, true)
    }, [])

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: translateY.value }],
        }
    })

    return (
        <Animated.View style={[styles.container, animatedStyle]}>
            <View style={styles.titleContainer}>
                {/* <LinearGradient
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                >
                </LinearGradient> */}
                <Text style={styles.title}>Smart Lighting Control Platform</Text>
            </View>
            <Text style={styles.subtitle}>
                Control your home lighting system with ease. Manage individual lights or use master controls for complete
                automation.
            </Text>
        </Animated.View>
    )
}

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        marginBottom: 32,
        paddingHorizontal: 16,
    },
    titleContainer: {
        marginBottom: 12,
        alignSelf: "stretch",
    },
    gradient: {
        borderRadius: 8,
        padding: 4,
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        textAlign: "center",
        // color: "transparent",
        fontFamily: fonts.bold,
        // backgroundColor: "transparent",
        // textShadowColor: "rgba(0, 0, 0, 0.1)",
        textShadowOffset: { width: 0, height: 5 },
        textShadowRadius: 10,
    },
    subtitle: {
        fontSize: 14,
        color: colors.textSecondary,
        textAlign: "center",
        maxWidth: "90%",
        fontFamily: fonts.regular,
    },
})

export default Header