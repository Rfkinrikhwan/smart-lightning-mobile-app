import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { colors } from '../styles/colors';

interface Room {
    id: string;
    name: string;
}

interface RoomSelectorProps {
    rooms: Room[];
    selectedRoom: string;
    onSelectRoom: (roomId: string) => void;
}

const RoomSelector: React.FC<RoomSelectorProps> = ({ rooms, selectedRoom, onSelectRoom }) => {
    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.container}
        >
            <TouchableOpacity
                style={[styles.roomButton, selectedRoom === 'all' && styles.selectedRoom]}
                onPress={() => onSelectRoom('all')}
            >
                <Text style={[styles.roomText, selectedRoom === 'all' && styles.selectedRoomText]}>All rooms</Text>
            </TouchableOpacity>

            {rooms.map((room) => (
                <TouchableOpacity
                    key={room.id}
                    style={[styles.roomButton, selectedRoom === room.id && styles.selectedRoom]}
                    onPress={() => onSelectRoom(room.id)}
                >
                    <Text style={[styles.roomText, selectedRoom === room.id && styles.selectedRoomText]}>{room.name}</Text>
                </TouchableOpacity>
            ))}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: 16,
        paddingHorizontal: 4,
    },
    roomButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 8,
        backgroundColor: colors.cardBackground,
    },
    selectedRoom: {
        backgroundColor: colors.highlight,
    },
    roomText: {
        color: colors.textSecondary,
        fontWeight: '500',
    },
    selectedRoomText: {
        color: colors.cardBackground,
        fontWeight: '600',
    },
});

export default RoomSelector;