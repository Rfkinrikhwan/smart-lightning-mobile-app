// App.tsx
import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform
} from 'react-native';
import { FontAwesome5, FontAwesome6 } from '@expo/vector-icons';

// Import Firebase
import { initializeApp } from 'firebase/app';
import {
  getDatabase,
  ref,
  onValue,
  set,
  update
} from 'firebase/database';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBDajKmo4JpXoYS7Xu0c3QBIImlanvOFFY",
  authDomain: "smartlightingproject-d599e.firebaseapp.com",
  databaseURL: "https://smartlightingproject-d599e-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "smartlightingproject-d599e",
  storageBucket: "smartlightingproject-d599e.firebasestorage.app",
  messagingSenderId: "734122093067",
  appId: "1:734122093067:web:0b28135e8fd72ac35af50e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

import StatsCard from '@/components/StatsCard';

// Simplified lamp interface
interface Lamp {
  id: number;
  name: string;
  isOn: boolean;
}

const App: React.FC = () => {
  const [lamps, setLamps] = useState<Lamp[]>([]);
  const [onAllLights, setOnAllLights] = useState<boolean>(false);
  const [activeLights, setActiveLights] = useState<number>(0);
  const [totalLights, setTotalLights] = useState<number>(0);
  const [energyUsage, setEnergyUsage] = useState<string>('0 kWh');
  const [systemStatus, setSystemStatus] = useState<{ status: string; detail: string }>({
    status: 'Loading...',
    detail: 'Checking systems',
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [esp32Online, setEsp32Online] = useState<boolean>(false);

  useEffect(() => {
    // Set up Firebase listeners
    setupFirebaseListeners();
  }, []);

  const setupFirebaseListeners = () => {
    setIsLoading(true);

    // Listen for device status
    const deviceStatusRef = ref(database, 'device_status/esp32_1');
    onValue(deviceStatusRef, (snapshot) => {
      const data = snapshot.val();
      setEsp32Online(data?.online || false);

      if (data?.online) {
        setSystemStatus({
          status: 'Online',
          detail: 'All systems operational',
        });
      } else {
        setSystemStatus({
          status: 'Offline',
          detail: 'Device disconnected',
        });
      }
    });

    // Listen for lamp statuses
    const lampuRef = ref(database, 'lampu');
    onValue(lampuRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Convert Firebase data to lamp array
        const lampArray: Lamp[] = [];

        // Process each lamp entry from Firebase
        Object.keys(data).forEach((key) => {
          const lampId = parseInt(key);
          const isOn = data[key];

          // Create lamp object with simplified structure
          lampArray.push({
            id: lampId,
            name: `Light ${lampId}`,
            isOn: isOn
          });
        });

        setLamps(lampArray);
        const active = lampArray.filter(lamp => lamp.isOn).length;
        setActiveLights(active);
        setTotalLights(lampArray.length);
        setEnergyUsage((active * 0.06).toFixed(2) + ' kWh');

        // Check if all lights are on
        const allLightsOn = lampArray.every(lamp => lamp.isOn);
        setOnAllLights(allLightsOn && lampArray.length > 0);
      }

      setIsLoading(false);
    });
  };

  const toggleLight = async (lightId: number, isCurrentlyOn: boolean) => {
    try {
      const lampRef = ref(database, `lampu/${lightId}`);
      await set(lampRef, !isCurrentlyOn);
    } catch (error) {
      console.error('Error toggling light:', error);
      Alert.alert('Error', 'Failed to toggle light. Please try again.');
    }
  };

  const toggleAllLights = async (turnOn: boolean) => {
    try {
      const updates: { [key: string]: boolean } = {};

      // Create updates for all lamps
      lamps.forEach(lamp => {
        updates[`lampu/${lamp.id}`] = turnOn;
      });

      // Update all lamps at once
      await update(ref(database), updates);
    } catch (error) {
      console.error(`Error turning all lights ${turnOn ? 'on' : 'off'}:`, error);
      Alert.alert('Error', `Failed to turn all lights ${turnOn ? 'on' : 'off'}`);
    }
  };

  // Simplified light card component directly in the file since it's simpler now
  const SimpleLightCard = ({ lamp, onToggle, disabled }: {
    lamp: Lamp,
    onToggle: (id: number, isOn: boolean) => void,
    disabled: boolean
  }) => {
    return (
      <View style={[styles.lightCard, disabled && styles.disabledCard]}>
        <View style={styles.lightCardContent}>
          <View style={styles.lightInfo}>
            <View style={[styles.statusDot, { backgroundColor: lamp.isOn ? '#10b981' : '#94a3b8' }]} />
            <Text style={styles.lightName}>{lamp.name}</Text>
          </View>
          <TouchableOpacity
            style={[styles.toggleButton, lamp.isOn ? styles.onButton : styles.offButton]}
            onPress={() => onToggle(lamp.id, lamp.isOn)}
            disabled={disabled}
          >
            <FontAwesome5 name="power-off" size={14} color="#fff" />
            <Text style={styles.toggleText}>{lamp.isOn ? 'ON' : 'OFF'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f0f4f8" />
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.card}>
          <View style={styles.headerContainer}>
            <View style={styles.titleHeader}>
              <FontAwesome5 name="database" size={20} color="#3b82f6" />
              <Text style={styles.sectionTitle}>Firebase Smart Lighting</Text>
            </View>
            <View style={styles.statusContainer}>
              <View style={[
                styles.statusIndicator,
                esp32Online ? styles.statusOnline : styles.statusOffline
              ]} />
              <Text style={styles.statusText}>
                ESP32 Status: {esp32Online ? 'Online' : 'Offline'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.controlsHeader}>
            <View style={styles.titleContainer}>
              <FontAwesome6 name="house-signal" size={20} color="#3b82f6" />
              <Text style={styles.sectionTitle}>Light Controls</Text>
            </View>
            <View style={styles.controlButtonsContainer}>
              {onAllLights ? (
                <TouchableOpacity
                  style={[styles.controlButton, styles.grayButton]}
                  onPress={() => toggleAllLights(false)}
                  disabled={!esp32Online}
                >
                  <FontAwesome5 name="power-off" size={16} color="#fff" />
                  <Text style={styles.buttonText}>All Off</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.controlButton, styles.greenButton]}
                  onPress={() => toggleAllLights(true)}
                  disabled={!esp32Online}
                >
                  <FontAwesome5 name="power-off" size={16} color="#fff" />
                  <Text style={styles.buttonText}>All On</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View style={styles.lightsContainer}>
            {lamps.map((lamp) => (
              <SimpleLightCard
                key={lamp.id}
                lamp={lamp}
                onToggle={toggleLight}
                disabled={!esp32Online}
              />
            ))}
            {lamps.length === 0 && !isLoading && (
              <Text style={styles.noLightsText}>
                No lights found. Check device connection.
              </Text>
            )}
          </View>
        </View>

        <View style={styles.statsContainer}>
          <StatsCard
            title="Active Lights"
            icon="lightbulb"
            iconColor="#3b82f6"
            value={`${activeLights}`}
            subtitle={`of ${totalLights} lights`}
          />
          <StatsCard
            title="Energy Usage"
            icon="bolt"
            iconColor="#10b981"
            value={energyUsage}
            subtitle="Estimated daily usage"
          />
          <StatsCard
            title="System Status"
            icon="wifi"
            iconColor="#8b5cf6"
            value={systemStatus.status}
            subtitle={systemStatus.detail}
            valueColor={systemStatus.status === 'Online' ? '#10b981' : '#ef4444'}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  scrollView: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  headerContainer: {
    width: '100%',
  },
  titleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginLeft: 10,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f4f8',
    borderRadius: 10,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderColor: '#3b82f6',
    borderWidth: 1.5,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusOnline: {
    backgroundColor: '#10b981',
  },
  statusOffline: {
    backgroundColor: '#ef4444',
  },
  statusText: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: '700',
    color: '#1e293b',
  },
  controlsHeader: {
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  controlButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginLeft: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  greenButton: {
    backgroundColor: '#10b981',
  },
  grayButton: {
    backgroundColor: '#94a3b8',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '500',
    marginLeft: 8,
  },
  lightsContainer: {
    marginTop: 8,
  },
  statsContainer: {
    flexDirection: 'column',
  },
  noLightsText: {
    textAlign: 'center',
    padding: 20,
    color: '#64748b',
    fontStyle: 'italic',
  },
  lightCard: {
    backgroundColor: 'white',
    borderRadius: 16,
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
  lightCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lightInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  lightName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  onButton: {
    backgroundColor: '#10b981',
  },
  offButton: {
    backgroundColor: '#94a3b8',
  },
  toggleText: {
    color: '#fff',
    marginLeft: 6,
    fontWeight: '500',
  },
});

export default App;