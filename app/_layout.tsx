// App.tsx
import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform
} from 'react-native';
import { FontAwesome5, FontAwesome6 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Lamp, LampStatusResponse } from '@/types';
import StatsCard from '@/components/StatsCard';
import LightCard from '@/components/LigthCard';
import { hexToRgb } from '@/utils/colorUtils';

const App: React.FC = () => {
  const [ipAddress, setIpAddress] = useState<string>('192.168.117.1');
  const [lamps, setLamps] = useState<Lamp[]>([]);
  const [onAllLights, setOnAllLights] = useState<boolean>(false);
  const [activeLights, setActiveLights] = useState<number>(0);
  const [totalLights, setTotalLights] = useState<number>(0);
  const [energyUsage, setEnergyUsage] = useState<string>('0 kWh');
  const [systemStatus, setSystemStatus] = useState<{ status: string; detail: string }>({
    status: 'Loading...',
    detail: 'Checking systems',
  });
  const [isRunningLedActive, setIsRunningLedActive] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadIpAddress();
  }, []);

  const loadIpAddress = async () => {
    try {
      const savedIp = await AsyncStorage.getItem('lightingIpAddress');
      if (savedIp) {
        setIpAddress(savedIp);
      }
      fetchLampStatus(savedIp || ipAddress);
    } catch (error) {
      console.error('Error loading IP address:', error);
    }
  };

  const saveIpAddress = async () => {
    try {
      await AsyncStorage.setItem('lightingIpAddress', ipAddress);
      fetchLampStatus(ipAddress);
      Alert.alert('Success', 'IP address saved successfully!');
    } catch (error) {
      console.error('Error saving IP address:', error);
      Alert.alert('Error', 'Failed to save IP address');
    }
  };

  const fetchLampStatus = async (ip: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://${ip}/lamp/status`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data: LampStatusResponse = await response.json();

      if (data.hasOwnProperty('runningLedActive')) {
        setIsRunningLedActive(data.runningLedActive);
      }

      setLamps(data.lamps);
      const active = data.lamps.filter(lamp => lamp.status === 'ON').length;
      setActiveLights(active);
      setTotalLights(data.lamps.length);
      setEnergyUsage((active * 0.06).toFixed(2) + ' kWh');
      setSystemStatus({
        status: 'Online',
        detail: 'All systems operational',
      });
    } catch (error) {
      console.error('Error fetching lamp status:', error);
      setSystemStatus({
        status: 'Offline',
        detail: 'Connection error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleLight = async (lightId: number, isCurrentlyOn: boolean) => {
    try {
      const endpoint = isCurrentlyOn
        ? `http://${ipAddress}/lamp/off`
        : `http://${ipAddress}/lamp/on`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: lightId }),
      });

      if (response.ok) {
        fetchLampStatus(ipAddress);
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.error || 'Failed to toggle light');
      }
    } catch (error) {
      console.error('Error toggling light:', error);
      Alert.alert('Connection Error', 'Failed to connect to the device');
    }
  };

  const changeColor = async (lightId: number, color: string) => {
    try {
      const rgbColor = hexToRgb(color);
      const response = await fetch(`http://${ipAddress}/lamp/color`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: lightId,
          color: rgbColor,
        }),
      });

      if (response.ok) {
        fetchLampStatus(ipAddress);
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.error || 'Failed to change color');
      }
    } catch (error) {
      console.error('Error changing light color:', error);
      Alert.alert('Connection Error', 'Failed to connect to the device');
    }
  };

  const toggleAllLights = async (turnOn: boolean) => {

    try {
      const endpoint = `http://${ipAddress}/lamp/all/${turnOn ? 'on' : 'off'}`;
      const response = await fetch(endpoint);

      if (response.ok) {
        setOnAllLights(turnOn);
        fetchLampStatus(ipAddress);
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.error || `Failed to turn all lights ${turnOn ? 'on' : 'off'}`);
      }
    } catch (error) {
      console.error(`Error turning all lights ${turnOn ? 'on' : 'off'}:`, error);
      Alert.alert('Connection Error', 'Failed to connect to the device');
    }
  };

  const toggleRunningLed = async () => {
    try {
      // Get color from the first active light or use a random color
      let color = {
        r: Math.floor(Math.random() * 256),
        g: Math.floor(Math.random() * 256),
        b: Math.floor(Math.random() * 256),
      };

      const activeLamp = lamps.find(lamp => lamp.status === 'ON');
      if (activeLamp) {
        color = activeLamp.currentColor;
      }

      const response = await fetch(`http://${ipAddress}/lamp/running`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          enable: !isRunningLedActive,
          color: color,
          interval: 200, // Default interval of 200ms
        }),
      });

      if (response.ok) {
        setIsRunningLedActive(!isRunningLedActive);
        fetchLampStatus(ipAddress);
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.error || 'Failed to toggle running LED mode');
      }
    } catch (error) {
      console.error('Error toggling running LED mode:', error);
      Alert.alert('Connection Error', 'Failed to connect to the device');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f0f4f8" />
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.card}>
          <View style={styles.ipAddressContainer}>
            <View style={styles.ipAddressHeader}>
              <FontAwesome5 name="network-wired" size={20} color="#3b82f6" />
              <Text style={styles.sectionTitle}>Device IP Address</Text>
            </View>
            <View style={styles.ipInputContainer}>
              <TextInput
                style={styles.ipInput}
                value={ipAddress}
                onChangeText={setIpAddress}
                placeholder="Enter device IP"
                placeholderTextColor="#94a3b8"
              />
              <TouchableOpacity
                style={styles.saveButton}
                onPress={saveIpAddress}
              >
                <FontAwesome5 name="save" size={16} color="#fff" />
                <Text style={styles.buttonText}>Save & Connect</Text>
              </TouchableOpacity>
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
              <TouchableOpacity
                style={[
                  styles.controlButton,
                  isRunningLedActive ? styles.orangeButton : styles.greenButton
                ]}
                onPress={toggleRunningLed}
              >
                <FontAwesome5
                  name={isRunningLedActive ? "stop" : "play"}
                  size={16}
                  color="#fff"
                />
                <Text style={styles.buttonText}>
                  {isRunningLedActive ? "Stop Running" : "Running Led"}
                </Text>
              </TouchableOpacity>

              <>
                {
                  onAllLights ? (
                    <TouchableOpacity
                      style={[styles.controlButton, styles.grayButton]}
                      onPress={() => toggleAllLights(false)}
                    >
                      <FontAwesome5 name="power-off" size={16} color="#fff" />
                      <Text style={styles.buttonText}>All Off</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={[styles.controlButton, styles.greenButton]}
                      onPress={() => toggleAllLights(true)}
                    >
                      <FontAwesome5 name="power-off" size={16} color="#fff" />
                      <Text style={styles.buttonText}>All On</Text>
                    </TouchableOpacity>
                  )
                }
              </>
            </View>
          </View>

          <View style={styles.lightsContainer}>
            {lamps.map((lamp) => (
              <LightCard
                key={lamp.id}
                lamp={lamp}
                onToggle={toggleLight}
                onColorChange={changeColor}
              />
            ))}
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
    backgroundColor: '#f0f4f8',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  ipAddressContainer: {
    width: '100%',
  },
  ipAddressHeader: {
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
  ipInputContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  ipInput: {
    flex: 1,
    minWidth: 200,
    backgroundColor: '#f0f4f8',
    borderRadius: 10,
    padding: 12,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderColor: '#3b82f6',
    borderWidth: 1.5,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
  orangeButton: {
    backgroundColor: '#f97316',
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
});

export default App;