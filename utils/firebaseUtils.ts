// utils/firebaseUtils.ts
import { ref, onValue, set, update, Unsubscribe, DataSnapshot } from 'firebase/database';
import { database } from '../firebase/config';

// Interface for lamp objects
export interface Lamp {
    id: number;
    name: string;
    isOn: boolean;
}

// Listen for device status
export const listenForDeviceStatus = (callback: (isOnline: boolean) => void): Unsubscribe => {
    const deviceStatusRef = ref(database, 'device_status/esp32_1');
    return onValue(deviceStatusRef, (snapshot: DataSnapshot) => {
        const data = snapshot.val();
        callback(data?.online || false);
    });
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