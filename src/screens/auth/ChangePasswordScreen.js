import React, { useState } from "react";
import {
  View,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import { TextInput, Button, Text, Card, IconButton } from "react-native-paper";
import axios from "axios";
import Constants from "expo-constants";
import Toast from "react-native-toast-message";
import { useAuth } from "../../context/AuthContext";

const ChangePasswordScreen = ({ navigation }) => {
  const backendUrl = Constants.expoConfig?.extra.backendUrl;
  const { userId } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "New passwords do not match",
      });
      return;
    }

    if (newPassword.length < 6) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Password must be at least 6 characters",
      });
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${backendUrl}change-password`, {
        user_id: userId,
        current_password: currentPassword,
        new_password: newPassword,
      });

      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Password changed successfully",
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      navigation.goBack();
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.response?.data?.message || "Failed to change password",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <ScrollView>
        <View style={styles.container}>
          <StatusBar barStyle="dark-content" backgroundColor="#fff" />

          <View style={styles.header}>
            <IconButton icon="arrow-left" onPress={() => navigation.goBack()} />
            <Text style={styles.title}>Change Password</Text>
            <View style={{ width: 40 }} />
          </View>

          <Card style={styles.card}>
            <Card.Content>
              <TextInput
                label="Current Password"
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry={!showPasswords.current}
                style={styles.input}
                right={
                  <TextInput.Icon
                    icon={showPasswords.current ? "eye-off" : "eye"}
                    onPress={() =>
                      setShowPasswords((prev) => ({
                        ...prev,
                        current: !prev.current,
                      }))
                    }
                  />
                }
              />

              <TextInput
                label="New Password"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showPasswords.new}
                style={styles.input}
                right={
                  <TextInput.Icon
                    icon={showPasswords.new ? "eye-off" : "eye"}
                    onPress={() =>
                      setShowPasswords((prev) => ({ ...prev, new: !prev.new }))
                    }
                  />
                }
              />

              <TextInput
                label="Confirm New Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPasswords.confirm}
                style={styles.input}
                right={
                  <TextInput.Icon
                    icon={showPasswords.confirm ? "eye-off" : "eye"}
                    onPress={() =>
                      setShowPasswords((prev) => ({
                        ...prev,
                        confirm: !prev.confirm,
                      }))
                    }
                  />
                }
              />

              <Button
                mode="contained"
                onPress={handleChangePassword}
                loading={loading}
                disabled={
                  !currentPassword ||
                  !newPassword ||
                  !confirmPassword ||
                  loading
                }
                style={styles.button}
              >
                Change Password
              </Button>
            </Card.Content>
          </Card>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingTop: 40,
    paddingBottom: 16,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
  },
  card: {
    margin: 16,
    borderRadius: 12,
  },
  input: {
    marginBottom: 16,
    backgroundColor: "transparent",
  },
  button: {
    marginTop: 16,
    borderRadius: 8,
  },
});

export default ChangePasswordScreen;
