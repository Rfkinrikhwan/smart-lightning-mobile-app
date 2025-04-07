import { useState } from "react"
import { View, StyleSheet, TouchableOpacity, Text } from "react-native"
import { colors, shadows } from "../styles/theme"

interface ColorPickerSimpleProps {
    initialColor: string
    onColorChange: (color: string) => void
    onColorSelected: (color: string) => void
}

const ColorPickerSimple = ({ initialColor, onColorChange, onColorSelected }: ColorPickerSimpleProps) => {
    const [selectedColor, setSelectedColor] = useState(initialColor)

    const colorOptions = [
        // Whites and warm whites
        "#FFFFFF",
        "#F5F5DC",
        "#FFF8E1",
        "#FFFAF0",
        // Blues
        "#E6F2FF",
        "#CCE5FF",
        "#99CCFF",
        "#66B2FF",
        // Greens
        "#E0F7FA",
        "#B2EBF2",
        "#80DEEA",
        "#4DD0E1",
        // Reds and pinks
        "#FFEBEE",
        "#FFCDD2",
        "#EF9A9A",
        "#E57373",
        // Purples
        "#F3E5F5",
        "#E1BEE7",
        "#CE93D8",
        "#BA68C8",
        // Yellows and oranges
        "#FFF8E1",
        "#FFECB3",
        "#FFE082",
        "#FFD54F",
    ]

    const handleColorSelect = (color: string) => {
        setSelectedColor(color)
        onColorChange(color)
    }

    const handleConfirm = () => {
        onColorSelected(selectedColor)
    }

    return (
        <View style={styles.container}>
            <View style={styles.colorsGrid}>
                {colorOptions.map((color, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[styles.colorOption, { backgroundColor: color }, selectedColor === color && styles.selectedColor]}
                        onPress={() => handleColorSelect(color)}
                    />
                ))}
            </View>
            <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
                <Text style={styles.confirmText}>Apply Color</Text>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.background,
        borderRadius: 16,
        padding: 12,
        ...shadows.neumorphicInset,
    },
    colorsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        marginBottom: 12,
    },
    colorOption: {
        width: "22%",
        aspectRatio: 1,
        borderRadius: 8,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: colors.border,
    },
    selectedColor: {
        borderWidth: 3,
        borderColor: colors.primary,
    },
    confirmButton: {
        backgroundColor: colors.primary,
        borderRadius: 8,
        padding: 10,
        alignItems: "center",
        marginTop: 8,
    },
    confirmText: {
        color: "white",
        fontWeight: "600",
    },
})

export default ColorPickerSimple

