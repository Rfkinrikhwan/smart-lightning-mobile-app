import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { colors } from '../styles/colors';

interface StatusCardProps {
    esp32Online: boolean;
}

const StatusCard: React.FC<StatusCardProps> = ({ esp32Online }) => {
    return (
        <View style={styles.card} >
            <View style={styles.headerContainer}>
                <View style={styles.titleHeader}>
                    <FontAwesome5 name="database" size={20} color={colors.secondary} />
                    <Text style={styles.sectionTitle}> Smart Home Control </Text>
                </View>
                < View style={styles.statusContainer} >
                    <View style={
                        [
                            styles.statusIndicator,
                            esp32Online ? styles.statusOnline : styles.statusOffline
                        ]
                    } />
                    < Text style={styles.statusText} >
                        ESP32 Status: {esp32Online ? 'Online' : 'Offline'}
                    </Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.cardBackground,
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
        color: colors.textPrimary,
        marginLeft: 10,
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.background,
        borderRadius: 10,
        padding: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        borderColor: colors.secondary,
        borderWidth: 1.5,
    },
    statusIndicator: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 8,
    },
    statusOnline: {
        backgroundColor: colors.success,
    },
    statusOffline: {
        backgroundColor: colors.error,
    },
    statusText: {
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
        fontWeight: '700',
        color: colors.textPrimary,
    },
});

export default StatusCard;