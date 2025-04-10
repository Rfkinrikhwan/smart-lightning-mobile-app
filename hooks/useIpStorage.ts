// src/hooks/useIpStorage.ts
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const IP_STORAGE_KEY = 'lightingIpAddress';
const DEFAULT_IP = '192.168.117.1';

export function useIpStorage(): [
    string,
    (newIp: string) => Promise<void>,
    boolean
] {
    const [ipAddress, setIpAddress] = useState<string>(DEFAULT_IP);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        loadIpAddress();
    }, []);

    const loadIpAddress = async (): Promise<void> => {
        try {
            setIsLoading(true);
            const savedIp = await AsyncStorage.getItem(IP_STORAGE_KEY);
            if (savedIp) {
                setIpAddress(savedIp);
            }
        } catch (error) {
            console.error('Error loading IP address from storage:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const saveIpAddress = async (newIp: string): Promise<void> => {
        try {
            if (!newIp || newIp.trim() === '') {
                throw new Error('IP address cannot be empty');
            }

            await AsyncStorage.setItem(IP_STORAGE_KEY, newIp);
            setIpAddress(newIp);
        } catch (error) {
            console.error('Error saving IP address to storage:', error);
            throw error;
        }
    };

    return [ipAddress, saveIpAddress, isLoading];
}