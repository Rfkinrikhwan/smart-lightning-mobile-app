// components/ColorPicker.tsx
import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { ColorPicker as RNColorPicker } from 'react-native-color-picker';

interface ColorPickerProps {
    currentColor: string;
    isEnabled: boolean;
    onColorChange: (color: string) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({
    currentColor,
    isEnabled,
    onColorChange
}) => {
    const [modalVisible, setModalVisible] = useState(false);

    const handleColorSelect = (color: string) => {
        onColorChange(color.replace('#', ''));
        setModalVisible(false);
    };

    return (
        <View>
            <TouchableOpacity
                style={[
                    styles.colorButton,
                    { backgroundColor: `#${currentColor}` },
                    !isEnabled && styles.disabled
                ]}
                onPress={() => isEnabled && setModalVisible(true)}
                disabled={!isEnabled}
            />

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <RNColorPicker
                            color={`#${currentColor}`}
                            onColorSelected={handleColorSelect}
                            style={styles.colorPickerWheel}
                        />
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => setModalVisible(false)}
                        >
                            <View style={styles.cancelButtonInner} />
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    colorButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 2,
        borderColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3,
    },
    disabled: {
        opacity: 0.5,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    modalContent: {
        width: '80%',
        height: 400,
        backgroundColor: '#f0f4f8',
        borderRadius: 24,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 20,
    },
    colorPickerWheel: {
        width: '100%',
        height: 300,
    },
    cancelButton: {
        marginTop: 20,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#f0f4f8',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    cancelButtonInner: {
        width: 30,
        height: 6,
        backgroundColor: '#64748b',
        borderRadius: 3,
    },
});

export default ColorPicker;