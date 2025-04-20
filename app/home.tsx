import React, { useState, useEffect } from 'react';
import {
    SafeAreaView,
    StatusBar,
    StyleSheet,
    View,
    Text,
    ScrollView,
    Alert,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import DeviceCard from '../components/DeviceCard';
import { colors } from '../styles/colors';
import {
    listenForDeviceStatus,
    listenForLamps,
    toggleLight,
    toggleAllLights,
    Lamp
} from '../utils/firebaseUtils';
import { onValue, ref } from 'firebase/database';
import { database } from '@/firebase/config';

interface Room {
    id: string;
    name: string;
}

interface Device {
    id: string | number;
    name: string;
    subtitle?: string;
    isOn: boolean;
    type: string;
    room: string;
    hasSchedule?: boolean;
}

interface Weather {
    temperature: string;
    condition: string;
    date: string;
}

const rooms: Room[] = [
    { id: 'living', name: 'Living room' },
    { id: 'bedroom', name: 'Bedroom' },
    { id: 'bathroom', name: 'Bathroom' },
    { id: 'kitchen', name: 'Kitchen' },
];

const HomeScreen: React.FC = () => {
    const [lamps, setLamps] = useState<Lamp[]>([]);
    const [devices, setDevices] = useState<Device[]>([]);
    const [onAllLights, setOnAllLights] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [esp32Online, setEsp32Online] = useState<boolean>(false);
    const [selectedRoom, setSelectedRoom] = useState<string>('all');
    const [weather, setWeather] = useState<Weather>({
        temperature: '18° C',
        condition: 'Sunny',
        date: 'Sunday, 20 Apr 2025'
    });
    const [userName, setUserName] = useState<string>('Rifki');
    const [location, setLocation] = useState<string>('Binjai, Indonesia');
    const [schedulesData, setSchedulesData] = useState<Record<string, any>>({});

    useEffect(() => {
        // Set up Firebase listeners
        const deviceStatusUnsubscribe = listenForDeviceStatus(setEsp32Online);

        // Listen for schedules
        const schedulesRef = ref(database, 'jadwal');
        const schedulesUnsubscribe = onValue(schedulesRef, (snapshot) => {
            const data = snapshot.val() || {};
            setSchedulesData(data);
        });

        return () => {
            deviceStatusUnsubscribe();
            schedulesUnsubscribe();
        };
    }, []); // No dependencies here

    // Separate useEffect for lamp data that depends on schedulesData
    useEffect(() => {
        const lampsUnsubscribe = listenForLamps((lampData) => {
            setLamps(lampData);

            // Get the lamp IDs that have schedules
            const lampsWithSchedules = Object.keys(schedulesData);

            const newDevices: Device[] = [
                ...lampData.map((lamp, index) => ({
                    ...lamp,
                    subtitle: rooms[index % rooms.length].name, // Use modulo to prevent index out of bounds
                    type: 'lightbulb',
                    room: lamp.id % 2 === 0 ? 'living' : 'bedroom',
                    hasSchedule: lampsWithSchedules.includes(lamp.id.toString())
                }))
            ];

            setDevices(newDevices);

            // Check if all lights are on
            const allLightsOn = lampData.every(lamp => lamp.isOn);
            setOnAllLights(allLightsOn && lampData.length > 0);

            setIsLoading(false);
        });

        return () => {
            lampsUnsubscribe();
        };
    }, [schedulesData]); // This depends on schedulesData, not lampsWithSchedules

    const handleToggleLight = async (lightId: number, isCurrentlyOn: boolean): Promise<void> => {
        const success = await toggleLight(lightId, isCurrentlyOn);
        if (!success) {
            Alert.alert('Error', 'Failed to toggle light. Please try again.');
        }
    };

    const handleToggleDevice = (deviceId: string | number, isOn: boolean): void => {
        // For non-lamp devices (mock toggle)
        if (typeof deviceId === 'number') {
            handleToggleLight(deviceId, isOn);
            return;
        }

        // Mock toggle for other devices
        setDevices(devices.map(device =>
            device.id === deviceId
                ? { ...device, isOn: !device.isOn }
                : device
        ));
    };

    const filteredDevices = selectedRoom === 'all'
        ? devices
        : devices.filter(device => device.room === selectedRoom);

    // Helper function to get icon for device type
    const getIconForDeviceType = (type: string): string => {
        switch (type) {
            case 'lightbulb': return 'lightbulb';
            case 'tv': return 'tv';
            case 'music': return 'music';
            case 'snowflake': return 'snowflake';
            default: return 'power-off';
        }
    };

    return (
        <>
            <StatusBar barStyle="light-content" backgroundColor={colors.darkBackground} />

            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="light-content" backgroundColor={colors.darkBackground} />

                <View style={styles.header}>
                    <View>
                        <View style={styles.locationContainer}>
                            <FontAwesome5 name="map-marker-alt" size={14} color={colors.inactive} />
                            <Text style={styles.locationText}>{location}</Text>
                        </View>

                        <Text style={styles.greetingText}>Hello {userName}</Text>
                        <Text style={styles.welcomeText}>welcome back to your smart lighting system!</Text>
                    </View>
                </View>

                <View style={styles.weatherCard}>
                    <View style={styles.weatherIcon}>
                        <FontAwesome5 name="sun" size={25} color={colors.yellowSun} />
                    </View>
                    <View style={styles.weatherInfo}>
                        <Text style={styles.weatherDate}>{weather.date}</Text>
                        <Text style={styles.weatherCondition}>{weather.condition}</Text>
                    </View>
                    <Text style={styles.temperature}>{weather.temperature}</Text>
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.deviceGrid}>
                        {filteredDevices.map((device, index) => (
                            <View key={device.id} style={[styles.deviceColumn, index % 2 === 1 && styles.deviceColumnRight]}>
                                <DeviceCard
                                    device={device}
                                    onToggle={handleToggleDevice}
                                    disabled={!esp32Online}
                                    icon={getIconForDeviceType(device.type)}
                                />
                            </View>
                        ))}
                    </View>

                    {filteredDevices.length === 0 && !isLoading && (
                        <Text style={styles.noDevicesText}>
                            No devices found in this room.
                        </Text>
                    )}
                </ScrollView>

            </SafeAreaView>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        padding: 16,
        paddingTop: 20,
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    locationText: {
        color: colors.inactive,
        marginLeft: 4,
        fontSize: 12,
    },
    greetingText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.cardBackground,
    },
    welcomeText: {
        color: colors.inactive,
        fontSize: 14,
    },
    profileContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    notificationButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    avatarContainer: {
        width: 40,
        height: 40,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.highlight,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: colors.darkBackground,
        fontWeight: 'bold',
        fontSize: 16,
    },
    weatherCard: {
        flexDirection: 'row',
        backgroundColor: colors.cardBackground,
        borderRadius: 12,
        padding: 16,
        marginHorizontal: 16,
        alignItems: 'center',
    },
    weatherIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    weatherInfo: {
        flex: 1,
    },
    weatherDate: {
        color: colors.inactive,
        fontSize: 12,
    },
    weatherCondition: {
        color: colors.darkBackground,
        fontSize: 16,
        fontWeight: '500',
    },
    temperature: {
        color: colors.darkBackground,
        fontSize: 24,
        fontWeight: 'bold',
    },
    scrollContent: {
        padding: 16,
    },
    noDevicesText: {
        textAlign: 'center',
        padding: 20,
        color: colors.inactive,
        fontStyle: 'italic',
    },
    bottomNavigationBar: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.05)',
        paddingVertical: 16,
        paddingHorizontal: 8,
        justifyContent: 'space-around',
    },
    navButton: {
        width: 60,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
    },
    activeNavButton: {
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    deviceGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingVertical: 16,
    },
    deviceColumn: {
        width: '48%',
    },
    deviceColumnRight: {
        marginLeft: '4%',
    },
});

export default HomeScreen;