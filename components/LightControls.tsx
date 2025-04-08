import { StyleSheet, Text, View, TouchableOpacity } from "react-native"
import Icon from "react-native-vector-icons/FontAwesome5"
import LightItem from "./LightItem"
import { colors, fonts, shadows } from "../styles/theme"

interface Light {
    id: number
    name: string
    isOn: boolean
    brightness: number
    color: string
}

interface LightControlsProps {
    lights: Light[]
    toggleLight: (id: number) => void
    updateBrightness: (id: number, brightness: number) => void
    updateColor: (id: number, color: string) => void
    toggleAllLights: (on: boolean) => void
}

const LightControls = ({ lights, toggleLight, updateBrightness, updateColor, toggleAllLights }: LightControlsProps) => {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.titleContainer}>
                    <Icon name="wifi" size={20} color={colors.primary} />
                    <Text style={styles.title}>Light Controls</Text>
                </View>

                <View style={styles.buttonsContainer}>
                    <TouchableOpacity style={[styles.button, styles.buttonOn]} onPress={() => toggleAllLights(true)}>
                        <Icon name="power-off" size={16} color={colors.textPrimary} />
                        <Text style={styles.buttonText}>All On</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.button, styles.buttonOff]} onPress={() => toggleAllLights(false)}>
                        <Icon name="power-off" size={16} color={colors.textPrimary} />
                        <Text style={styles.buttonText}>All Off</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.lightsGrid}>
                {lights.map((light) => (
                    <LightItem
                        key={light.id}
                        light={light}
                        toggleLight={toggleLight}
                        updateBrightness={updateBrightness}
                        updateColor={updateColor}
                    />
                ))}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        ...shadows.neumorphic,
        borderRadius: 24,
        padding: 20,
        marginBottom: 24,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 24,
        flexWrap: "wrap",
    },
    titleContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    title: {
        fontSize: 20,
        fontWeight: "600",
        color: colors.textPrimary,
        marginLeft: 12,
        fontFamily: fonts.semiBold,
    },
    buttonsContainer: {
        flexDirection: "row",
        marginTop: 8,
    },
    button: {
        ...shadows.neumorphicButton,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginLeft: 12,
    },
    buttonOn: {
        backgroundColor: colors.success,
    },
    buttonOff: {
        backgroundColor: colors.inactive,
    },
    buttonText: {
        marginLeft: 8,
        fontWeight: "500",
        color: colors.textPrimary,
        fontFamily: fonts.medium,
    },
    lightsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
    },
})

export default LightControls

