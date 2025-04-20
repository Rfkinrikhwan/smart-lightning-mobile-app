import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { colors } from '../styles/colors';
import { useRouter } from 'expo-router';

interface Device {
    id: string | number;
    name: string;
    isOn: boolean;
    subtitle?: string;
    hasSchedule?: boolean; // New prop to indicate if device has scheduling
}

interface DeviceCardProps {
    device: Device;
    onToggle: (id: string | number, isOn: boolean) => void;
    disabled?: boolean;
    icon: string;
}

const DeviceCard: React.FC<DeviceCardProps> = ({ device, onToggle, disabled = false, icon }) => {
    const router = useRouter();

    const handleNavigate = () => {
        if (!disabled) {
            router.push({ pathname: `/[lampid]`, params: { lampid: device.id, lampName: device.name, roomName: device.subtitle } });
        }
    };

    return (
        <TouchableOpacity
            onPress={handleNavigate}
            style={[styles.card, disabled && styles.disabledCard, device.isOn ? styles.borderOn : styles.borderOff]}
            activeOpacity={0.9}
        >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <View style={styles.iconContainer}>
                    <FontAwesome5 name={icon} size={30} color={device.isOn ? colors.yellowLight : colors.inactive} />

                    {/* Schedule badge */}
                    {device.hasSchedule && (
                        <View style={[
                            styles.scheduleBadge,
                            { backgroundColor: device.isOn ? colors.yellowLight : colors.inactive }
                        ]}>
                            <FontAwesome5 name="clock" size={8} color={colors.cardBackground} />
                        </View>
                    )}
                </View>
                <View style={styles.infoContainer}>
                    <Text style={styles.deviceName}>{device.name}</Text>
                    <Text style={styles.deviceSubtitle}>{device.subtitle || ''}</Text>
                </View>
            </View>

            <TouchableOpacity
                style={[styles.toggleSwitch, device.isOn ? styles.switchOn : styles.switchOff]}
                onPress={() => onToggle(device.id, device.isOn)}
                disabled={disabled}
            >
                <View style={[styles.switchKnob, device.isOn ? styles.knobOn : styles.knobOff]} />
            </TouchableOpacity>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.cardBackground,
        borderRadius: 10,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    disabledCard: {
        opacity: 0.7,
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 20,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        position: 'relative',
    },
    scheduleBadge: {
        position: 'absolute',
        top: -2,
        right: -2,
        width: 16,
        height: 16,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.cardBackground,
    },
    infoContainer: {
        flex: 1,
    },
    deviceName: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.textPrimary,
    },
    deviceSubtitle: {
        fontSize: 12,
        color: colors.textSecondary,
        marginTop: 2,
    },
    toggleSwitch: {
        width: 50,
        height: 25,
        borderRadius: 14,
        padding: 2,
        justifyContent: 'center',
    },
    switchOn: {
        backgroundColor: colors.yellowLight,
    },
    switchOff: {
        backgroundColor: colors.inactive,
    },
    switchKnob: {
        width: 20,
        height: 20,
        borderRadius: 12,
        backgroundColor: colors.cardBackground,
    },
    knobOn: {
        alignSelf: 'flex-end',
    },
    knobOff: {
        alignSelf: 'flex-start',
    },
    borderOn: {
        borderColor: colors.yellowLight,
        borderWidth: 1,
    },
    borderOff: {
        borderColor: colors.inactive,
        borderWidth: 1,
    },
});

export default DeviceCard;