// utils/firebaseUtils.ts
import { ref, onValue, set, update, Unsubscribe, DataSnapshot } from 'firebase/database';
import { database } from '../firebase/config';

// Interface for lamp objects
export interface Lamp {
    id: number;
    name: string;
    isOn: boolean;
}

export interface DeviceStatus {
    online: boolean;
    lastSeen?: string;
}

// Listen for device status
export const listenForDeviceStatus = (callback: (status: DeviceStatus) => void) => {
    const statusRef = ref(database, 'device_status/esp32_1');

    const unsubscribe = onValue(statusRef, (snapshot) => {
        const data = snapshot.val() || {};
        const status: DeviceStatus = {
            online: data.online || false,
            lastSeen: data.lastSeen || new Date().toISOString()
        };
        callback(status);
    });

    return unsubscribe;
};

// Listen for lamp statuses
export const listenForLamps = (callback: (lamps: Lamp[]) => void): Unsubscribe => {
    const lampuRef = ref(database, 'lampu');
    return onValue(lampuRef, (snapshot: DataSnapshot) => {
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

            callback(lampArray);
        } else {
            callback([]);
        }
    });
};

// Add this to your firebaseUtils.js file
export const updateDeviceOnlineStatus = async (online: boolean) => {
    try {
        const deviceStatusRef = ref(database, 'device_status/esp32_1/online');
        await set(deviceStatusRef, online);
        return true;
    } catch (error) {
        console.error('Error updating device online status:', error);
        return false;
    }
};

// Toggle a single light
export const toggleLight = async (lightId: number, isCurrentlyOn: boolean): Promise<boolean> => {
    try {
        const lampRef = ref(database, `lampu/${lightId}`);
        await set(lampRef, !isCurrentlyOn);
        return true;
    } catch (error) {
        console.error('Error toggling light:', error);
        return false;
    }
};

// Toggle all lights
export const toggleAllLights = async (lamps: Lamp[], turnOn: boolean): Promise<boolean> => {
    try {
        const updates: { [key: string]: boolean } = {};

        // Create updates for all lamps
        lamps.forEach(lamp => {
            updates[`lampu/${lamp.id}`] = turnOn;
        });

        // Update all lamps at once
        await update(ref(database), updates);
        return true;
    } catch (error) {
        console.error(`Error turning all lights ${turnOn ? 'on' : 'off'}:`, error);
        return false;
    }
};