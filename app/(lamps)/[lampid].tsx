import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Platform,
    Alert,
    StyleSheet,
    SafeAreaView,
    StatusBar,
    ScrollView
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { getDatabase, ref, onValue, set, remove } from "firebase/database";
import { app } from "@/firebase/config";
import { FontAwesome5 } from "@expo/vector-icons";
import { colors } from "../../styles/colors";

export default function LampDetail() {
    const { lampid, lampName, roomName } = useLocalSearchParams();
    const router = useRouter();
    const db = getDatabase(app);

    const [onTime, setOnTime] = useState<Date | null>(null);
    const [offTime, setOffTime] = useState<Date | null>(null);
    const [showPicker, setShowPicker] = useState<"on" | "off" | null>(null);
    const [loading, setLoading] = useState(true);
    const [hasSchedule, setHasSchedule] = useState(false);

    // Helper to parse time string "HH:mm" to Date
    const parseTime = (timeStr: string): Date => {
        const [hours, minutes] = timeStr.split(":").map(Number);
        const date = new Date();
        date.setHours(hours, minutes, 0, 0);
        return date;
    };

    // Helper to format Date to string "HH:mm"
    const formatTime = (date: Date | null): string => {
        if (!date) return "--:--";
        const pad = (n: number) => String(n).padStart(2, "0");
        return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
    };

    useEffect(() => {
        const scheduleRef = ref(db, `jadwal/${lampid}`);
        const unsubscribe = onValue(scheduleRef, (snapshot) => {
            const data = snapshot.val();
            if (data && (data.on || data.off)) {
                if (data.on) setOnTime(parseTime(data.on));
                if (data.off) setOffTime(parseTime(data.off));
                setHasSchedule(true);
            } else {
                setOnTime(null);
                setOffTime(null);
                setHasSchedule(false);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [lampid]);

    const handleSave = async () => {
        if (!onTime || !offTime) {
            Alert.alert("Error", "Please set both on and off times");
            return;
        }

        const scheduleRef = ref(db, `jadwal/${lampid}`);
        await set(scheduleRef, {
            on: formatTime(onTime),
            off: formatTime(offTime),
        });
        Alert.alert("Success", "Schedule saved successfully!");
        setHasSchedule(true);
    };

    const handleDelete = () => {
        if (!hasSchedule) {
            Alert.alert("Info", "No schedule to delete");
            return;
        }

        Alert.alert(
            "Delete Schedule",
            "Are you sure you want to delete this schedule?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        const scheduleRef = ref(db, `jadwal/${lampid}`);
                        await remove(scheduleRef);
                        setOnTime(null);
                        setOffTime(null);
                        setHasSchedule(false);
                        Alert.alert("Success", "Schedule deleted.");
                    },
                },
            ]
        );
    };

    const handleBack = () => {
        router.back();
    };

    const handleSetTime = (type: "on" | "off") => {
        // Initialize with current time if no time is set
        if (type === "on" && !onTime) {
            setOnTime(new Date());
        } else if (type === "off" && !offTime) {
            setOffTime(new Date());
        }
        setShowPicker(type);
    };

    const renderTimePicker = () => {
        if (!showPicker) return null;

        const isOn = showPicker === "on";
        const currentValue = isOn ? (onTime || new Date()) : (offTime || new Date());

        return (
            <DateTimePicker
                value={currentValue}
                mode="time"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={(_, selectedDate) => {
                    setShowPicker(null);
                    if (!selectedDate) return;
                    if (isOn) setOnTime(selectedDate);
                    else setOffTime(selectedDate);
                }}
                themeVariant="dark"
                textColor="#FFFFFF"
            />
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="light-content" backgroundColor={colors.darkBackground} />
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Loading schedule...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={colors.darkBackground} />

            {/* Header with back button */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <FontAwesome5 name="arrow-left" size={18} color={colors.cardBackground} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Schedule Settings</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Lamp info card */}
                <View style={styles.lampInfoCard}>
                    <View style={styles.lampIconContainer}>
                        <FontAwesome5 name="lightbulb" size={20} color={colors.yellowSun} />
                    </View>
                    <View style={styles.lampInfo}>
                        <Text style={styles.lampName}>{roomName || "Room"}</Text>
                        <Text style={styles.roomName}>{lampName || `Light ${lampid}`}</Text>
                    </View>
                </View>

                {/* Schedule card */}
                <View style={styles.scheduleCard}>
                    <Text style={styles.sectionTitle}>Light Schedule</Text>

                    {!hasSchedule && (
                        <View style={styles.noScheduleContainer}>
                            <FontAwesome5 name="clock" size={24} color={colors.inactive} />
                            <Text style={styles.noScheduleText}>No schedule set</Text>
                            <Text style={styles.noScheduleSubtext}>
                                Set on and off times to create a schedule
                            </Text>
                        </View>
                    )}

                    <View style={styles.timeRow}>
                        <View style={styles.timeInfo}>
                            <Text style={styles.timeLabel}>Turn On Time</Text>
                            <Text style={styles.timeValue}>{formatTime(onTime)}</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.timeButton}
                            onPress={() => handleSetTime("on")}
                        >
                            <FontAwesome5 name="clock" size={14} color={colors.darkBackground} />
                            <Text style={styles.timeButtonText}>Set Time</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.timeRow}>
                        <View style={styles.timeInfo}>
                            <Text style={styles.timeLabel}>Turn Off Time</Text>
                            <Text style={styles.timeValue}>{formatTime(offTime)}</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.timeButton}
                            onPress={() => handleSetTime("off")}
                        >
                            <FontAwesome5 name="clock" size={14} color={colors.darkBackground} />
                            <Text style={styles.timeButtonText}>Set Time</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Schedule visualization - only show if there's a schedule */}
                {hasSchedule && onTime && offTime && (
                    <View style={styles.scheduleCard}>
                        <Text style={styles.sectionTitle}>Daily Schedule</Text>
                        <View style={styles.timelineContainer}>
                            <View style={styles.timeline}>
                                <View
                                    style={[
                                        styles.activeTimeline,
                                        {
                                            left: `${(onTime.getHours() * 60 + onTime.getMinutes()) / 14.4}%`,
                                            width: `${((offTime.getHours() * 60 + offTime.getMinutes()) -
                                                (onTime.getHours() * 60 + onTime.getMinutes())) / 14.4}%`
                                        }
                                    ]}
                                />
                                {[0, 6, 12, 18, 24].map(hour => (
                                    <View
                                        key={hour}
                                        style={[
                                            styles.timeMarker,
                                            { left: `${(hour * 60) / 14.4}%` }
                                        ]}
                                    >
                                        <Text style={styles.timeMarkerText}>{hour}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    </View>
                )}

                {/* Action buttons */}
                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        style={styles.saveButton}
                        onPress={handleSave}
                    >
                        <FontAwesome5 name="save" size={16} color={colors.darkBackground} />
                        <Text style={styles.saveButtonText}>Save Schedule</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.deleteButton,
                            !hasSchedule && styles.disabledButton
                        ]}
                        onPress={handleDelete}
                    >
                        <FontAwesome5 name="trash" size={16} color={colors.cardBackground} />
                        <Text style={styles.deleteButtonText}>Delete Schedule</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {renderTimePicker()}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.darkBackground,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        fontSize: 16,
        color: colors.inactive,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(255,255,255,0.1)",
        justifyContent: "center",
        alignItems: "center",
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: colors.cardBackground,
    },
    scrollContent: {
        padding: 16,
    },
    lampInfoCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.cardBackground,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    lampIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.background,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    lampInfo: {
        flex: 1,
    },
    lampName: {
        fontSize: 16,
        fontWeight: "600",
        color: colors.darkBackground,
    },
    roomName: {
        fontSize: 14,
        color: colors.inactive,
    },
    scheduleCard: {
        backgroundColor: colors.cardBackground,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: colors.darkBackground,
        marginBottom: 16,
    },
    noScheduleContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 16,
        marginBottom: 8,
    },
    noScheduleText: {
        fontSize: 16,
        fontWeight: "500",
        color: colors.darkBackground,
        marginTop: 8,
    },
    noScheduleSubtext: {
        fontSize: 14,
        color: colors.inactive,
        textAlign: "center",
        marginTop: 4,
    },
    timeRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 8,
    },
    timeInfo: {
        flex: 1,
    },
    timeLabel: {
        fontSize: 14,
        color: colors.inactive,
        marginBottom: 4,
    },
    timeValue: {
        fontSize: 20,
        fontWeight: "600",
        color: colors.darkBackground,
    },
    timeButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.highlight,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
    },
    timeButtonText: {
        color: colors.darkBackground,
        fontWeight: "600",
        marginLeft: 6,
        fontSize: 14,
    },
    divider: {
        height: 1,
        backgroundColor: "rgba(0,0,0,0.1)",
        marginVertical: 12,
    },
    timelineContainer: {
        paddingVertical: 8,
    },
    timeline: {
        height: 30,
        backgroundColor: "rgba(0,0,0,0.1)",
        borderRadius: 15,
        position: "relative",
        marginVertical: 8,
    },
    activeTimeline: {
        position: "absolute",
        height: "100%",
        backgroundColor: colors.highlight,
        borderRadius: 15,
    },
    timeMarker: {
        position: "absolute",
        alignItems: "center",
        top: 30,
    },
    timeMarkerText: {
        fontSize: 10,
        color: colors.inactive,
    },
    actionButtons: {
        gap: 12,
        marginTop: 8,
    },
    saveButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.highlight,
        paddingVertical: 14,
        borderRadius: 12,
    },
    saveButtonText: {
        color: colors.darkBackground,
        fontWeight: "600",
        fontSize: 16,
        marginLeft: 8,
    },
    deleteButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(255,255,255,0.1)",
        paddingVertical: 14,
        borderRadius: 12,
    },
    disabledButton: {
        opacity: 0.5,
    },
    deleteButtonText: {
        color: colors.cardBackground,
        fontWeight: "600",
        fontSize: 16,
        marginLeft: 8,
    },
});