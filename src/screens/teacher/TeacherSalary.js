import React, { useState, useLayoutEffect, useEffect } from "react";
import axios from "axios";
import Constants from "expo-constants";
import {
    View,
    ScrollView,
    StyleSheet,
    StatusBar,
    FlatList,
    TouchableOpacity,
    Modal,
    KeyboardAvoidingView,
    Platform,
    Alert
} from "react-native";
import {
    Text,
    Button,
    TextInput,
    RadioButton,
    Divider,
    Surface,
    useTheme,
    DataTable
} from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../../context/AuthContext";
import Toast from "react-native-toast-message";
import DateTimePicker from "@react-native-community/datetimepicker";

const TeacherSalary = ({ route, navigation }) => {



    useLayoutEffect(() => {
        navigation.getParent()?.setOptions({
            title: "Salary Details",
        });
    }, [navigation]);











    const { studentId, studentName = "Student Name", className = "Class X" } = route.params || {};
    const theme = useTheme();

    useLayoutEffect(() => {
        navigation.setOptions({
            title: "Salary Details",
            headerStyle: { backgroundColor: '#5E72EB' },
            headerTintColor: '#fff',
        });
    }, [navigation]);

    const backendUrl = Constants?.expoConfig.extra.backendUrl;
    const [isLoading, setIsLoading] = useState(false);
    const { user } = useAuth();
    console.log("User:", user?.name);
    // Fees State
    const [totalClassFees, setTotalClassFees] = useState(0);
    const [transactions, setTransactions] = useState([]);

    // Fetch Fees Data
    // Fetch Fees Data
    const fetchFeesHistory = async () => {
        if (!studentId) return;
        setIsLoading(true);
        try {

            const response = await axios.get(`${backendUrl}students/getUserFeesHistoryData/${studentId}`);

            if (response.data && response.data.status) {
                const { totalClassFees, transactions } = response.data.data;
                console.log("Fees Data:", response.data);
                setTotalClassFees(Number(totalClassFees) || 0);
                setTransactions(transactions || []);
            }
        } catch (error) {
            console.error("Error fetching fees data:", error);
            // Optional: Alert.alert("Error", "Failed to fetch fees details");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchFeesHistory();
    }, [studentId, backendUrl]);

    // Derived Logic
    const paidFees = transactions
        .filter(t => t.status === 'Paid')
        .reduce((sum, t) => sum + t.amount, 0);

    const remainingFees = totalClassFees - paidFees;

    // Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [collectionAmount, setCollectionAmount] = useState('');
    const [paidBy, setPaidBy] = useState('');
    const [collectedBy, setCollectedBy] = useState('Admin'); // Default
    const [paymentMode, setPaymentMode] = useState('cash'); // cash, online, cheque
    const [remarks, setRemarks] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);

    const onDateChange = (event, selected) => {
        const currentDate = selected || selectedDate;
        setShowDatePicker(Platform.OS === 'ios');
        setSelectedDate(currentDate);
    };

    const handleCollectFees = async () => {
        const amount = parseFloat(collectionAmount);
        if (isNaN(amount) || amount <= 0) {
            // Alert.alert("Invalid Input", "Please enter a valid amount");
            Toast.show({
                type: "error",
                text1: "Invalid Input",
                text2: "Please enter a valid amount",
            });
            return;
        }

        const payload = {
            student_id: studentId,
            date: selectedDate.toISOString().split('T')[0],
            amount: amount,
            type: 'fees', // Default or selectable
            mode: paymentMode === 'cash' ? 'Cash' : (paymentMode === 'online' ? 'Online' : 'Cheque'),
            status: 'Paid',
            paidBy: paidBy,
            collectedBy: collectedBy,
            remarks: remarks
        };

        try {
            setIsLoading(true);
            let response;
            if (editingId) {
                // Update Existing
                response = await axios.post(`${backendUrl}students/updateFees/${editingId}`, payload);
            } else {
                // Create New
                response = await axios.post(`${backendUrl}students/collectFees`, payload);
            }

            if (response.data && response.data.status) {
                Toast.show({
                    type: "success",
                    text1: "Success",
                    text2: editingId ? "Transaction updated successfully" : "Fees collected successfully",
                });
                fetchFeesHistory(); // Refresh data from server
                handleCloseModal();
            } else {
                Toast.show({
                    type: "error",
                    text1: "Error",
                    text2: response.data.message || "Operation failed",
                });
            }
        } catch (error) {
            console.error("Error submitting fees:", error);
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Failed to submit fees details",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const resetFields = () => {
        setCollectionAmount('');
        setPaidBy('');
        setCollectedBy(user?.name);
        setRemarks('');
        setPaymentMode('cash');
        setEditingId(null);
        setSelectedDate(new Date());
    };

    const handleCloseModal = () => {
        resetFields();
        setModalVisible(false);
    };

    const confirmDelete = (id) => {
        Alert.alert(
            "Delete Transaction",
            "Are you sure you want to delete this transaction? This action cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => handleDelete(id)
                }
            ]
        );
    };

    const handleDelete = async (id) => {
        try {
            setIsLoading(true);
            const response = await axios.delete(`${backendUrl}students/deleteFees/${id}`);
            if (response.data && response.data.status) {
                // Alert.alert("Success", "Transaction deleted successfully");
                Toast.show({
                    type: "success",
                    text1: "Success",
                    text2: "Transaction deleted successfully",
                });
                fetchFeesHistory(); // Refresh data
            } else {
                Toast.show({
                    type: "error",
                    text1: "Error",
                    text2: response.data.message || "Failed to delete transaction",
                });
            }
        } catch (error) {
            console.error("Error deleting fees:", error);
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Failed to delete transaction",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const openEditModal = (item) => {
        setEditingId(item.id);
        setCollectionAmount(item.amount.toString());
        setPaidBy(item.paidBy || '');
        setCollectedBy(item.collectedBy || user?.name);
        setPaymentMode(item.mode ? item.mode.toLowerCase() : 'cash');
        if (item.date) {
            setSelectedDate(new Date(item.date));
        }
        setModalVisible(true);
    };

    const TransactionItem = ({ item }) => (
        <View style={styles.transactionCard}>
            <View style={styles.cardMainRow}>
                <View style={styles.transactionLeft}>
                    <View style={[styles.iconContainer,
                    { backgroundColor: item.status === 'Paid' ? '#DCFCE7' : '#FEF2F2' }]}>
                        <MaterialCommunityIcons
                            name={item.status === 'Paid' ? "check-circle" : "clock-alert"}
                            size={18}
                            color={item.status === 'Paid' ? "#10B981" : "#EF4444"}
                        />
                    </View>
                    <View>
                        <Text style={styles.transactionType}>{item.type}</Text>
                        <Text style={styles.transactionDate}>
                            {new Date(item.date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })} • {item.mode}
                        </Text>
                    </View>
                </View>
                <View style={styles.transactionRight}>
                    <Text style={styles.transactionAmount}>₹{item.amount.toLocaleString()}</Text>
                    <Text style={[styles.transactionStatus,
                    { color: item.status === 'Paid' ? "#10B981" : "#EF4444" }]}>
                        {item.status}
                    </Text>
                </View>
            </View>

            {/* Combined Footer: Details + Actions */}
            <View style={styles.cardFooter}>
                <View style={styles.footerInfo}>
                    {(item.paidBy || item.collectedBy) && (
                        <>
                            {item.paidBy ? <Text style={styles.footerText} numberOfLines={1}>Paid: {item.paidBy}</Text> : null}
                            {item.collectedBy ? <Text style={styles.footerText} numberOfLines={1}>Col: {item.collectedBy}</Text> : null}
                        </>
                    )}
                </View>
                <View style={styles.footerActions}>
                    <TouchableOpacity onPress={() => openEditModal(item)} style={styles.iconBtn}>
                        <MaterialCommunityIcons name="pencil" size={16} color="#5E72EB" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => confirmDelete(item.id)} style={styles.iconBtn}>
                        <MaterialCommunityIcons name="trash-can-outline" size={16} color="#EF4444" />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#5E72EB" />

            {/* Header Summary */}
            <LinearGradient colors={["#5E72EB", "#4a5edb"]} style={styles.header}>
                <View style={styles.studentInfo}>
                    <Text style={styles.studentName}>{studentName}</Text>
                    <Text style={styles.studentClass}>{className}</Text>
                </View>

                <View style={styles.summaryContainer}>
                    <View style={styles.summaryCard}>
                        <Text style={styles.summaryLabel}>Total</Text>
                        <Text style={[styles.summaryValue, { color: '#EF4444' }]}>₹{totalClassFees.toLocaleString()}</Text>
                    </View>
                    <View style={styles.summaryDivider} />
                    <View style={styles.summaryCard}>
                        <Text style={styles.summaryLabel}>Paid</Text>
                        <Text style={[styles.summaryValue, { color: '#10B981' }]}>₹{paidFees.toLocaleString()}</Text>
                    </View>
                    <View style={styles.summaryDivider} />
                    <View style={styles.summaryCard}>
                        <Text style={styles.summaryLabel}>Remaining</Text>
                        <Text style={[styles.summaryValue, { color: '#F59E0B' }]}>₹{remainingFees.toLocaleString()}</Text>
                    </View>
                </View>
            </LinearGradient>

            <View style={styles.contentContainer}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Transaction History</Text>
                    <TouchableOpacity onPress={() => { }}>
                        <Text style={styles.seeAllText}>Filter</Text>
                    </TouchableOpacity>
                </View>

                <FlatList
                    data={transactions}
                    renderItem={({ item }) => <TransactionItem item={item} />}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            </View>

            {/* Collect Fees FAB */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => {
                    resetFields(); // Ensure clean state
                    setModalVisible(true);
                }}
            >
                <MaterialCommunityIcons name="plus" size={24} color="white" />
                <Text style={styles.fabText}>Collect Fees</Text>
            </TouchableOpacity>

            {/* Collection Modal */}
            <Modal
                visible={modalVisible}
                animationType="fade"
                transparent={true}
                onRequestClose={handleCloseModal}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.modalOverlay}
                >
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{editingId ? "Edit Fees" : "Collect Fees"}</Text>
                            <TouchableOpacity onPress={handleCloseModal} style={styles.closeButton}>
                                <MaterialCommunityIcons name="close" size={20} color="#6B7280" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView
                            style={styles.modalBody}
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator={false}
                        >
                            <Text style={styles.inputLabel}>Date</Text>
                            <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                                <View pointerEvents="none">
                                    <TextInput
                                        mode="outlined"
                                        dense
                                        value={`${String(selectedDate.getDate()).padStart(2, '0')}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${selectedDate.getFullYear()}`}
                                        editable={false}
                                        right={<TextInput.Icon icon="calendar" />}
                                        style={styles.input}
                                        outlineColor="#E5E7EB"
                                        activeOutlineColor="#5E72EB"
                                    />
                                </View>
                            </TouchableOpacity>
                            {showDatePicker && (
                                <DateTimePicker
                                    testID="dateTimePicker"
                                    value={selectedDate}
                                    mode="date"
                                    display="default"
                                    onChange={onDateChange}
                                />
                            )}

                            <Text style={styles.inputLabel}>Amount (₹)</Text>
                            <TextInput
                                mode="outlined"
                                dense
                                value={collectionAmount}
                                onChangeText={setCollectionAmount}
                                keyboardType="numeric"
                                placeholder="0.00"
                                style={styles.input}
                                outlineColor="#E5E7EB"
                                activeOutlineColor="#5E72EB"
                            />

                            <Text style={styles.inputLabel}>Paid By</Text>
                            <TextInput
                                mode="outlined"
                                dense
                                value={paidBy}
                                onChangeText={setPaidBy}
                                placeholder="Name"
                                style={styles.input}
                                outlineColor="#E5E7EB"
                                activeOutlineColor="#5E72EB"
                            />

                            <Text style={styles.inputLabel}>Collected By</Text>
                            <TextInput
                                mode="outlined"
                                dense
                                value={collectedBy}
                                onChangeText={setCollectedBy}
                                placeholder="Collector"
                                style={styles.input}
                                outlineColor="#E5E7EB"
                                activeOutlineColor="#5E72EB"
                            />

                            <Text style={styles.inputLabel}>Mode</Text>
                            <View style={styles.radioGroup}>
                                {['cash', 'online', 'cheque'].map((mode) => (
                                    <TouchableOpacity
                                        key={mode}
                                        style={[styles.radioOption, paymentMode === mode && styles.radioActive]}
                                        onPress={() => setPaymentMode(mode)}
                                    >
                                        <Text style={[styles.radioText, paymentMode === mode && styles.radioTextActive]}>
                                            {mode.charAt(0).toUpperCase() + mode.slice(1)}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>


                        </ScrollView>

                        <View style={styles.modalFooter}>
                            <Button
                                mode="contained"
                                onPress={handleCollectFees}
                                style={styles.submitButton}
                                contentStyle={{ height: 44 }}
                                labelStyle={{ fontSize: 13 }}
                            >
                                {editingId ? "Update" : "Submit"}
                            </Button>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    header: {
        paddingTop: Constants.statusBarHeight + 5,
        paddingBottom: 15,
        paddingHorizontal: 16,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    studentInfo: {
        alignItems: 'center',
        marginBottom: 10,
    },
    studentName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
        letterSpacing: 0.5,
    },
    studentClass: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.9)',
        marginTop: 2,
    },
    summaryContainer: {
        flexDirection: 'row',
        backgroundColor: 'white',
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 4,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 2,
    },
    summaryCard: {
        flex: 1,
        alignItems: 'center',
    },
    summaryDivider: {
        width: 1,
        backgroundColor: '#F1F5F9',
        height: '70%',
        alignSelf: 'center',
    },
    summaryLabel: {
        fontSize: 10,
        color: '#64748B',
        marginBottom: 2,
        textTransform: 'uppercase',
        fontWeight: '600',
        letterSpacing: 0.3,
    },
    summaryValue: {
        fontSize: 15,
        fontWeight: '700',
        letterSpacing: -0.3,
    },
    contentContainer: {
        flex: 1,
        paddingTop: 10,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 8,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: '#334155',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    seeAllText: {
        fontSize: 11,
        color: '#5E72EB',
        fontWeight: '600',
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 80,
    },
    transactionCard: {
        marginBottom: 8,
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 10,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        elevation: 0, // Flat design for cleaner look
    },
    cardMainRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    transactionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconContainer: {
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    transactionType: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1E293B',
    },
    transactionDate: {
        fontSize: 11,
        color: '#64748B',
    },
    transactionRight: {
        alignItems: 'flex-end',
    },
    transactionAmount: {
        fontSize: 14,
        fontWeight: '700',
        color: '#0F172A',
    },
    transactionStatus: {
        fontSize: 10,
        fontWeight: '600',
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        paddingTop: 8,
        marginTop: 2,
    },
    footerInfo: {
        flex: 1,
        marginRight: 8,
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
    },
    footerText: {
        fontSize: 10,
        color: '#64748B',
        backgroundColor: '#F8FAFC',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        overflow: 'hidden',
    },
    footerActions: {
        flexDirection: 'row',
        gap: 12,
    },
    iconBtn: {
        padding: 4,
        backgroundColor: '#F1F5F9',
        borderRadius: 6,
    },
    fab: {
        position: 'absolute',
        bottom: 20,
        right: 16,
        left: 16,
        backgroundColor: '#5E72EB',
        borderRadius: 14,
        height: 48,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: "#5E72EB",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    fabText: {
        color: 'white',
        fontSize: 15,
        fontWeight: '700',
        marginLeft: 8,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.7)', // Darker backdrop
        justifyContent: 'flex-start',
        paddingTop: Platform.OS === 'ios' ? 50 : 30,
        paddingHorizontal: 12,
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 20,
        maxHeight: '90%',
        elevation: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    closeButton: {
        padding: 6,
        backgroundColor: '#F8FAFC',
        borderRadius: 8,
    },
    modalTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#0F172A',
    },
    modalBody: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    inputLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#475569',
        marginBottom: 6,
        marginTop: 12,
    },
    input: {
        backgroundColor: 'white',
        height: 44,
        fontSize: 14,
    },
    radioGroup: {
        flexDirection: 'row',
        gap: 8,
    },
    radioOption: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        paddingHorizontal: 4,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        backgroundColor: 'white',
    },
    radioActive: {
        borderColor: '#5E72EB',
        backgroundColor: '#EEF2FF',
    },
    radioText: {
        fontSize: 12,
        color: '#64748B',
        fontWeight: '500',
    },
    radioTextActive: {
        color: '#5E72EB',
        fontWeight: '700',
    },
    modalFooter: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
    submitButton: {
        backgroundColor: '#5E72EB',
        borderRadius: 10, // Softer corners
    },
});

export default TeacherSalary;
