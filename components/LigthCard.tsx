// components/LightCard.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import ColorPicker from './ColorPicker';
import { Lamp } from '../types';
import { rgbToHex } from '../utils/colorUtils';

interface LightCardProps {
    lamp: Lamp;
    onToggle: (id: number, isOn: boolean) => void;
    onColorChange: (id: number, color: string) => void;
}

const LightCard: React.FC<LightCardProps> = ({ lamp, onToggle, onColorChange }) => {
    const isOn = lamp.status === 'ON';
    const hexColor = rgbToHex(lamp.currentColor.r, lamp.currentColor.g, lamp.currentColor.b);

    return (
        <View style={[styles.card, isOn ? styles.lightOn : styles.lightOff]}>
            <View style={styles.header}>
                <View style={styles.leftContent}>
                    <View style={styles.iconContainer}>
                        <FontAwesome5
                            name="lightbulb"
                            size={24}
                            color={isOn ? '#facc15' : '#94a3b8'}
                            style={isOn && styles.glowEffect}
                        />
                    </View>
                    <Text style={styles.title}>{`Light ${lamp.id + 1}`}</Text>
                </View>
                <View style={styles.rightContent}>
                    <View style={[
                        styles.statusBadge,
                        isOn ? styles.statusOn : styles.statusOff
                    ]}>
                        <Text style={[
                            styles.statusText,
                            isOn ? styles.statusTextOn : styles.statusTextOff
                        ]}>
                            {lamp.status}
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={styles.toggleContainer}
                        onPress={() => onToggle(lamp.id, isOn)}
                    >
                        <View style={[
                            styles.toggleTrack,
                            isOn && styles.toggleTrackActive
                        ]}>
                            <View style={[
                                styles.toggleThumb,
                                isOn && styles.toggleThumbActive
                            ]} />
                        </View>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.colorSection}>
                <ColorPicker
                    currentColor={hexColor}
                    isEnabled={isOn}
                    onColorChange={(color) => onColorChange(lamp.id, color)}
                />
                <View style={styles.colorInfo}>
                    <Text style={styles.colorLabel}>Color:</Text>
                    <Text style={styles.colorValue}>#{hexColor}</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#f0f4f8',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    lightOn: {
        // Additional styles for when light is on
    },
    lightOff: {
        // Additional styles for when light is off
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    leftContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#f0f4f8',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    glowEffect: {
        textShadowColor: 'rgba(250, 204, 21, 0.8)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 10,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1e293b',
    },
    rightContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        marginRight: 10,
    },
    statusOn: {
        backgroundColor: '#10b981',
    },
    statusOff: {
        backgroundColor: '#f0f4f8',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
    },
    statusText: {
        fontWeight: '500',
    },
    statusTextOn: {
        color: 'white',
    },
    statusTextOff: {
        color: '#94a3b8',
    },
    toggleContainer: {
        padding: 4,
    },
    toggleTrack: {
        width: 52,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#f0f4f8',
        justifyContent: 'center',
        paddingHorizontal: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
    },
    toggleTrackActive: {
        backgroundColor: '#10b981',
    },
    toggleThumb: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 2,
    },
    toggleThumbActive: {
        transform: [{ translateX: 22 }],
    },
    colorSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    colorInfo: {
        marginLeft: 12,
    },
    colorLabel: {
        fontSize: 14,
        color: '#64748b',
    },
    colorValue: {
        fontSize: 14,
        color: '#1e293b',
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
});

export default LightCard;