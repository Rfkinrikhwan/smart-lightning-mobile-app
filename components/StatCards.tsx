import React from "react"
import { StyleSheet, Text, View } from "react-native"
import Icon from "react-native-vector-icons/FontAwesome5"
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    withDelay,
    Easing,
} from "react-native-reanimated"
import { colors, fonts, shadows } from "../styles/theme"

interface StatCardsProps {
    activeCount: number
    totalLights: number
    energyUsage: string
    systemStatus: string
    systemStatusDetail: string
}

const StatCard = ({
    title,
    icon,
    iconColor,
    value,
    subtitle,
    delay = 0,
}: {
    title: string
    icon: string
    iconColor: string
    value: string
    subtitle: string
    delay?: number
}) => {
    const translateY = useSharedValue(0)

    React.useEffect(() => {
        translateY.value = withDelay(
            delay,
            withRepeat(withTiming(-5, { duration: 3000, easing: Easing.inOut(Easing.ease) }), -1, true),
        )
    }, [])

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: translateY.value }],
        }
    })

    return (
        <Animated.View style={[styles.card, animatedStyle]}>
            <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{title}</Text>
                <View style={styles.iconContainer}>
                    <Icon name={icon} size={20} color={iconColor} />
                </View>
            </View>
            <Text style={styles.cardValue}>{value}</Text>
            <Text style={styles.cardSubtitle}>{subtitle}</Text>
        </Animated.View>
    )
}

const StatCards = ({ activeCount, totalLights, energyUsage, systemStatus, systemStatusDetail }: StatCardsProps) => {
    return (
        <View style={styles.container}>
            <StatCard
                title="Active Lights"
                icon="lightbulb"
                iconColor={colors.primary}
                value={activeCount.toString()}
                subtitle={`of ${totalLights} lights`}
                delay={0}
            />

            <StatCard
                title="Energy Usage"
                icon="bolt"
                iconColor={colors.success}
                value={`${energyUsage} kWh`}
                subtitle="Estimated daily usage"
                delay={200}
            />

            <StatCard
                title="System Status"
                icon="wifi"
                iconColor={colors.accent}
                value={systemStatus}
                subtitle={systemStatusDetail}
                delay={400}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "column",
        marginBottom: 24,
    },
    card: {
        ...shadows.neumorphic,
        borderRadius: 24,
        padding: 16,
        marginBottom: 16,
        backgroundColor: colors.background,
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: colors.textPrimary,
        fontFamily: fonts.semiBold,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
        // backgroundColor: "#6666",
        shadowColor: "#f0f4f8",
        shadowOffset: {
            width: 8,
            height: 8,
        },
        shadowOpacity: 1,
        shadowRadius: 16,
        elevation: 0,
        shadowColor: "#f0f4f8",
        shadowOffset: {
            width: -8,
            height: -8,
        },
    },
    cardValue: {
        fontSize: 24,
        fontWeight: "bold",
        color: colors.textPrimary,
        marginBottom: 4,
        fontFamily: fonts.bold,
    },
    cardSubtitle: {
        fontSize: 12,
        color: colors.textSecondary,
        fontFamily: fonts.regular,
    },
})

export default StatCards

