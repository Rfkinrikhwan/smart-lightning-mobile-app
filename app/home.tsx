import React, { useState, useEffect, useRef } from 'react';
import {
    SafeAreaView,
    StatusBar,
    StyleSheet,
    View,
    Text,
    ScrollView,
    Alert,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import DeviceCard from '../components/DeviceCard';
import { colors } from '../styles/colors';
import {
    listenForDeviceStatus,
    listenForLamps,
    toggleLight,
    toggleAllLights,
    Lamp,
    updateDeviceOnlineStatus
} from '../utils/firebaseUtils';
import { onValue, ref } from 'firebase/database';
import { database } from '@/firebase/config';
import { fetchWeatherData, getWeatherIcon, getWeatherIconColor, WeatherData } from '../utils/weatherUtils';

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

const rooms: Room[] = [
    { id: 'living', name: 'Living room' },
    { id: 'bedroom', name: 'Bedroom' },
    { id: 'bathroom', name: 'Bathroom' },
    { id: 'kitchen', name: 'Kitchen' },
];

// Power consumption per lamp in watts
const LAMP_POWER_CONSUMPTION = 10;
// Timeout for device offline status (30 seconds)
const DEVICE_OFFLINE_TIMEOUT = 30000; // 30 seconds in milliseconds

const HomeScreen: React.FC = () => {
    const [devices, setDevices] = useState<Device[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [esp32Online, setEsp32Online] = useState<boolean>(false);
    const [esp32LastSeen, setEsp32LastSeen] = useState<string>('');
    const [weather, setWeather] = useState<WeatherData>({
        temperature: '28° C',
        condition: 'Loading...',
        icon: '01d',
        date: new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        }),
        humidity: 70,
        windSpeed: 3.5,
        location: 'Binjai, ID'
    });
    const [isWeatherLoading, setIsWeatherLoading] = useState<boolean>(true);
    const [userName, setUserName] = useState<string>('Rifki');
    const [location, setLocation] = useState<string>('Binjai, Indonesia');
    const [schedulesData, setSchedulesData] = useState<Record<string, any>>({});

    // Use a ref to store the status check interval
    const statusCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const weatherRefreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Function to check if device is offline based on last seen timestamp
    const checkDeviceStatus = () => {
        if (!esp32LastSeen) return;

        const lastSeenTime = new Date(esp32LastSeen).getTime();
        const currentTime = new Date().getTime();
        const timeDifference = currentTime - lastSeenTime;

        // If last seen is more than 30 seconds ago and device is marked as online
        if (timeDifference > DEVICE_OFFLINE_TIMEOUT && esp32Online) {
            // Update Firebase - only change online status to false
            updateDeviceOnlineStatus(false);
            // Update local state
            setEsp32Online(false);
        }
    };

    // Function to load weather data
    const loadWeatherData = async () => {
        setIsWeatherLoading(true);
        try {
            const data = await fetchWeatherData();
            setWeather(data);
            setLocation(data.location);
        } catch (error) {
            console.error('Failed to load weather data:', error);
        } finally {
            setIsWeatherLoading(false);
        }
    };

    useEffect(() => {
        // Load weather data on component mount
        loadWeatherData();

        // Set up Firebase listeners
        const deviceStatusUnsubscribe = listenForDeviceStatus((status) => {
            setEsp32Online(status.online);
            setEsp32LastSeen(status.lastSeen || new Date().toISOString());
        });

        // Listen for schedules
        const schedulesRef = ref(database, 'jadwal');
        const schedulesUnsubscribe = onValue(schedulesRef, (snapshot) => {
            const data = snapshot.val() || {};
            setSchedulesData(data);
        });

        // Set up interval to check device status every 5 seconds
        statusCheckIntervalRef.current = setInterval(checkDeviceStatus, 5000);

        // Set up interval to refresh weather data every 30 minutes (1800000 ms)
        weatherRefreshIntervalRef.current = setInterval(loadWeatherData, 1800000);

        return () => {
            deviceStatusUnsubscribe();
            schedulesUnsubscribe();

            // Clear intervals on component unmount
            if (statusCheckIntervalRef.current) {
                clearInterval(statusCheckIntervalRef.current);
            }
            if (weatherRefreshIntervalRef.current) {
                clearInterval(weatherRefreshIntervalRef.current);
            }
        };
    }, []); // No dependencies here

    // Effect to run status check when last seen time changes
    useEffect(() => {
        checkDeviceStatus();
    }, [esp32LastSeen]);

    // Separate useEffect for lamp data that depends on schedulesData
    useEffect(() => {
        const lampsUnsubscribe = listenForLamps((lampData) => {

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

    // Calculate power consumption
    const activeLampsCount = devices.filter(device => device.isOn).length;
    const totalPowerConsumption = activeLampsCount * LAMP_POWER_CONSUMPTION;

    // Format the last seen time
    const formatLastSeen = (dateString: string): string => {
        try {
            const date = new Date(dateString);
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) +
                ', ' + date.toLocaleDateString();
        } catch (e) {
            return 'Unknown';
        }
    };

    // Handle refresh button click
    const handleRefresh = () => {
        checkDeviceStatus();
    };

    // Handle weather refresh
    const handleWeatherRefresh = () => {
        loadWeatherData();
    };

    return (
        <>
            <StatusBar barStyle="light-content" backgroundColor={colors.cardBackground} />

            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="light-content" backgroundColor={colors.cardBackground} />

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

                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {/* Weather Card */}
                    <View style={styles.weatherCard}>
                        {isWeatherLoading ? (
                            <ActivityIndicator size="small" color={colors.primary} />
                        ) : (
                            <>
                                <View style={styles.weatherIcon}>
                                    <FontAwesome5
                                        name={getWeatherIcon(weather.icon)}
                                        size={25}
                                        color={getWeatherIconColor(weather.icon)}
                                    />
                                </View>
                                <View style={styles.weatherInfo}>
                                    <Text style={styles.weatherDate}>{weather.date}</Text>
                                    <Text style={styles.weatherCondition}>{weather.condition}</Text>
                                    <View style={styles.weatherDetails}>
                                        <Text style={styles.weatherDetailText}>
                                            <FontAwesome5 name="tint" size={12} color={colors.inactive} /> {weather.humidity}%
                                        </Text>
                                        <Text style={styles.weatherDetailText}>
                                            <FontAwesome5 name="wind" size={12} color={colors.inactive} /> {weather.windSpeed} m/s
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.temperatureContainer}>
                                    <Text style={styles.temperature}>{weather.temperature}</Text>
                                    <TouchableOpacity
                                        style={styles.weatherRefreshButton}
                                        onPress={handleWeatherRefresh}
                                    >
                                        <FontAwesome5 name="sync" size={12} color={colors.inactive} />
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}
                    </View>

                    {/* Power Consumption Card */}
                    <View style={styles.infoCard}>
                        <View style={styles.infoIconContainer}>
                            <FontAwesome5 name="bolt" size={25} color="#FFD700" />
                        </View>
                        <View style={styles.infoContent}>
                            <Text style={styles.infoTitle}>Power Consumption</Text>
                            <Text style={styles.infoSubtitle}>
                                {activeLampsCount} active lamp{activeLampsCount !== 1 ? 's' : ''}
                            </Text>
                        </View>
                        <View style={styles.infoValueContainer}>
                            <Text style={styles.infoValue}>{totalPowerConsumption}</Text>
                            <Text style={styles.infoUnit}>watts</Text>
                        </View>
                    </View>

                    {/* ESP32 Status Card */}
                    <View style={[
                        styles.infoCard,
                        { borderColor: esp32Online ? colors.success : colors.danger }
                    ]}>
                        <View style={[
                            styles.infoIconContainer,
                            { backgroundColor: esp32Online ? colors.success + '20' : colors.danger + '20' }
                        ]}>
                            <FontAwesome5
                                name={esp32Online ? "wifi" : "exclamation-triangle"}
                                size={25}
                                color={esp32Online ? colors.success : colors.danger}
                            />
                        </View>
                        <View style={styles.infoContent}>
                            <Text style={styles.infoTitle}>ESP32 Device</Text>
                            <Text style={[
                                styles.infoSubtitle,
                                { color: esp32Online ? colors.success : colors.danger }
                            ]}>
                                {esp32Online ? 'Online' : 'Offline'}
                            </Text>
                            <Text style={styles.infoLastSeen}>
                                Last seen: {formatLastSeen(esp32LastSeen)}
                            </Text>
                        </View>
                        <TouchableOpacity
                            style={[
                                styles.refreshButton,
                                { backgroundColor: esp32Online ? colors.success + '20' : colors.danger + '20' }
                            ]}
                            onPress={handleRefresh}
                        >
                            <FontAwesome5
                                name="sync"
                                size={16}
                                color={esp32Online ? colors.success : colors.danger}
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Devices Grid */}
                    <Text style={styles.sectionTitle}>Your Lights</Text>
                    <View style={styles.deviceGrid}>
                        {devices.map((device, index) => (
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

                    {devices.length === 0 && !isLoading && (
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
        backgroundColor: colors.cardBackground,
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
        color: colors.primary,
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
    scrollContent: {
        padding: 16,
    },
    weatherCard: {
        flexDirection: 'row',
        backgroundColor: colors.cardBackground,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.secondary,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
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
    weatherDetails: {
        flexDirection: 'row',
        marginTop: 4,
    },
    weatherDetailText: {
        color: colors.inactive,
        fontSize: 12,
        marginRight: 12,
    },
    temperatureContainer: {
        alignItems: 'center',
    },
    temperature: {
        color: colors.darkBackground,
        fontSize: 24,
        fontWeight: 'bold',
    },
    weatherRefreshButton: {
        marginTop: 4,
        padding: 4,
    },
    infoCard: {
        flexDirection: 'row',
        backgroundColor: colors.cardBackground,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.secondary,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    infoIconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(255, 215, 0, 0.2)', // Light gold background
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    infoContent: {
        flex: 1,
    },
    infoTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.darkBackground,
    },
    infoSubtitle: {
        fontSize: 14,
        color: colors.inactive,
        marginTop: 2,
    },
    infoLastSeen: {
        fontSize: 12,
        color: colors.inactive,
        marginTop: 4,
    },
    infoValueContainer: {
        alignItems: 'center',
    },
    infoValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.primary,
    },
    infoUnit: {
        fontSize: 12,
        color: colors.inactive,
    },
    refreshButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.primary,
        marginTop: 8,
        marginBottom: 8,
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