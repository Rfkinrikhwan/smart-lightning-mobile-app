import { useState } from "react"
import { StyleSheet, Text, View, TouchableOpacity, Switch } from "react-native"
import Icon from "react-native-vector-icons/FontAwesome5"
import { colors, fonts, shadows } from "../styles/theme"
import ColorPickerSimple from "./ColorPickerSimple"

interface Light {
    id: number
    name: string
    isOn: boolean
    brightness: number
    color: string
}

interface LightItemProps {
    light: Light
    toggleLight: (id: number) => void
    updateBrightness: (id: number, brightness: number) => void
    updateColor: (id: number, color: string) => void
}

const LightItem = ({ light, toggleLight, updateBrightness, updateColor }: LightItemProps) => {
    const [showColorPicker, setShowColorPicker] = useState(false)

    return (
        <View style={[styles.container, light.isOn && styles.containerActive]}>
            <View style={styles.header}>
                <Text style={styles.name}>{light.name}</Text>
                <View style={styles.statusContainer}>
                    <Text style={[styles.status, light.isOn ? styles.statusOn : styles.statusOff]}>
                        {light.isOn ? "ON" : "OFF"}
                    </Text>
                </View>
            </View>

            <View style={styles.controlRow}>
                <View style={styles.iconContainer}>
                    <Icon
                        name="lightbulb"
                        size={24}
                        solid={light.isOn}
                        color={light.isOn ? light.color : colors.textSecondary}
                        style={light.isOn && styles.activeIcon}
                    />
                </View>

                <Switch
                    value={light.isOn}
                    onValueChange={() => toggleLight(light.id)}
                    trackColor={{ false: colors.trackOff, true: colors.success }}
                    thumbColor={colors.thumbColor}
                    ios_backgroundColor={colors.trackOff}
                    style={styles.switch}
                />
            </View>

            <TouchableOpacity
                style={styles.colorButton}
                onPress={() => setShowColorPicker(!showColorPicker)}
                disabled={!light.isOn}
            >
                <View style={[styles.colorPreview, { backgroundColor: light.color }]} />
                <Text style={styles.colorButtonText}>{showColorPicker ? "Hide Color Picker" : "Change Color"}</Text>
            </TouchableOpacity>

            {showColorPicker && light.isOn && (
                <View style={styles.colorPickerContainer}>
                    <ColorPickerSimple
                        initialColor={light.color}
                        onColorChange={(color) => {
                            updateColor(light.id, color)
                        }}
                        onColorSelected={(color) => {
                            updateColor(light.id, color)
                            setShowColorPicker(false)
                        }}
                    />
                </View>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        ...shadows.neumorphicInset,
        width: "100%",
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        backgroundColor: colors.background,
    },
    containerActive: {
        ...shadows.neumorphic,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    name: {
        fontSize: 18,
        fontWeight: "600",
        color: colors.textPrimary,
        fontFamily: fonts.semiBold,
    },
    statusContainer: {
        borderRadius: 12,
        paddingVertical: 4,
        paddingHorizontal: 12,
    },
    status: {
        fontSize: 12,
        fontWeight: "500",
        fontFamily: fonts.medium,
    },
    statusOn: {
        color: colors.white,
        backgroundColor: colors.success,
        ...shadows.statusOn,
        borderRadius: 12,
        paddingVertical: 4,
        paddingHorizontal: 12,
    },
    statusOff: {
        color: colors.textSecondary,
        backgroundColor: colors.background,
        ...shadows.statusOff,
        borderRadius: 12,
        paddingVertical: 4,
        paddingHorizontal: 12,
    },
    controlRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 16,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
        ...shadows.neumorphicInset,
    },
    activeIcon: {
        textShadowColor: "rgba(250, 204, 21, 0.8)",
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 15,
    },
    switch: {
        transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
    },
    colorButton: {
        flexDirection: "row",
        alignItems: "center",
        padding: 8,
        borderRadius: 8,
        ...shadows.neumorphicButton,
    },
    colorPreview: {
        width: 24,
        height: 24,
        borderRadius: 12,
        marginRight: 8,
        borderWidth: 1,
        borderColor: colors.border,
    },
    colorButtonText: {
        fontSize: 14,
        color: colors.textPrimary,
        fontFamily: fonts.medium,
    },
    colorPickerContainer: {
        marginTop: 16,
        height: 150,
        borderRadius: 16,
        overflow: "hidden",
    },
})

export default LightItem

