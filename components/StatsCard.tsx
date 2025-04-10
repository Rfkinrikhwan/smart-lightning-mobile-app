// components/StatsCard.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

interface StatsCardProps {
    title: string;
    icon: string;
    iconColor: string;
    value: string;
    subtitle: string;
    valueColor?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
    title,
    icon,
    iconColor,
    value,
    subtitle,
    valueColor = '#1e293b',
}) => {
    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <Text style={styles.title}>{title}</Text>
                <View style={styles.iconContainer}>
                    <FontAwesome5 name={icon} size={20} color={iconColor} />
                </View>
            </View>
            <Text style={[styles.value, { color: valueColor }]}>{value}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#f0f4f8',
        borderRadius: 24,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f0f4f8',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    value: {
        fontSize: 28,
        fontWeight: '700',
        marginVertical: 6,
    },
    subtitle: {
        fontSize: 14,
        color: '#64748b',
    },
});

export default StatsCard;