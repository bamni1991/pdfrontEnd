import axios from "axios";
import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  StatusBar,
  Animated,
  Easing,
  Image,
} from "react-native";
import { TextInput, Button, Text, Card, Surface } from "react-native-paper";
import Constants from "expo-constants";
import Toast from "react-native-toast-message";
import { useAuth } from "../../context/AuthContext";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ActivityIndicator } from "react-native";
const icon = require("../../../assets/loginicon.png");

const LoginScreen = ({ navigation }) => {
  const backendUrl = Constants.expoConfig?.extra.backendUrl;
  const { login, user } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    mobile_no: "",
    password: "",
  });

  const logoScale = useMemo(() => new Animated.Value(1), []);
  const phoneRegex = useMemo(() => /^[0-9]{10}$/, []);
  const { mobile_no, password } = formData;
  const isFormValid = phoneRegex.test(mobile_no) && password.trim();

  // Pulse animation for logo
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(logoScale, {
          toValue: 1.05,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(logoScale, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [logoScale]);

  const onChange = useCallback(
    (field) => (value) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const handleLogin = useCallback(async () => {
    if (!isFormValid) return;
    setIsLoading(true);

    try {
      console.log("backendUrl", backendUrl);
      const response = await axios.post(
        `${backendUrl}login`,
        { mobile_no: mobile_no.trim(), password },
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          timeout: 10000,
        }
      );

      const userData = response.data?.user;
      if (userData?.id) {
        await login(userData);
        Toast.show({
          type: "success",
          text1: "Welcome! 🎉",
          text2: "Login successful",
          visibilityTime: 2000,
        });
      }
    } catch (error) {
      let errorMessage = "Something went wrong. Please try again.";

      if (error.response?.data?.messages?.message) {
        errorMessage = error.response.data.messages.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.request) {
        console.log("error.request", error.request);

        errorMessage = "Network error. Please check your connection.";
      }

      Toast.show({
        type: "error",
        text1: "Login Failed",
        text2: errorMessage,
        position: "top",
        visibilityTime: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  }, [mobile_no, password, login, isFormValid, backendUrl]);

  useEffect(() => {
    if (user) {
      navigation.replace("DrawerNavigator");
    }
  }, [user, navigation]);

  if (user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Redirecting...</Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#1e40af" />
      <LinearGradient colors={["#1e40af", "#2563eb"]} style={styles.gradient}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.container}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Logo Section */}
            <Animated.View
              style={[
                styles.logoContainer,
                { transform: [{ scale: logoScale }] },
              ]}
            >
              <Surface style={styles.logoSurface} elevation={8}>
                <Image source={icon} style={styles.logo} resizeMode="contain" />
              </Surface>
              <Text style={styles.schoolName}>Padmavati School</Text>
              <View style={styles.taglineContainer}>
                <MaterialCommunityIcons
                  name="shield-check"
                  size={16}
                  color="rgba(255,255,255,0.9)"
                />
                <Text style={styles.tagline}>Student & Staff Portal</Text>
              </View>
            </Animated.View>

            {/* Login Card */}
            <Card style={styles.card} elevation={8}>
              <Card.Content style={styles.cardContent}>
                <View style={styles.header}>
                  <MaterialCommunityIcons
                    name="login-variant"
                    size={28}
                    color="#2563eb"
                  />
                  <Text style={styles.title}>Sign In</Text>
                </View>

                {/* Mobile Input */}
                <TextInput
                  value={mobile_no}
                  onChangeText={onChange("mobile_no")}
                  mode="outlined"
                  style={styles.input}
                  outlineColor="#e2e8f0"
                  activeOutlineColor="#2563eb"
                  keyboardType="phone-pad"
                  maxLength={10}
                  placeholder="Mobile Number"
                  placeholderTextColor="#94a3b8"
                  left={<TextInput.Icon icon="phone" color="#64748b" />}
                  right={
                    phoneRegex.test(mobile_no) && (
                      <TextInput.Icon icon="check-circle" color="#10b981" />
                    )
                  }
                />
                {mobile_no.length > 0 && !phoneRegex.test(mobile_no) && (
                  <Text style={styles.errorText}>
                    Enter valid 10-digit number
                  </Text>
                )}

                {/* Password Input */}
                <TextInput
                  value={password}
                  onChangeText={onChange("password")}
                  mode="outlined"
                  style={styles.input}
                  outlineColor="#e2e8f0"
                  activeOutlineColor="#2563eb"
                  secureTextEntry={!showPassword}
                  placeholder="Password"
                  placeholderTextColor="#94a3b8"
                  left={<TextInput.Icon icon="lock" color="#64748b" />}
                  right={
                    <TextInput.Icon
                      icon={showPassword ? "eye-off" : "eye"}
                      onPress={togglePasswordVisibility}
                      color="#64748b"
                    />
                  }
                />

                {/* Forgot Password */}
                <Button
                  mode="text"
                  style={styles.forgotButton}
                  labelStyle={styles.forgotText}
                  compact
                >
                  Forgot Password?
                </Button>

                {/* Sign In Button */}
                <Button
                  mode="contained"
                  onPress={handleLogin}
                  style={[
                    styles.signInButton,
                    !isFormValid && styles.disabledButton,
                  ]}
                  contentStyle={styles.buttonContent}
                  labelStyle={styles.buttonLabel}
                  disabled={!isFormValid || isLoading}
                  loading={isLoading}
                >
                  {isLoading ? "Signing In..." : "Sign In"}
                </Button>

                {/* Help Text */}
                <View style={styles.helpContainer}>
                  <MaterialCommunityIcons
                    name="help-circle-outline"
                    size={14}
                    color="#94a3b8"
                  />
                  <Text style={styles.helpText}>
                    Need help? Contact administrator
                  </Text>
                </View>
              </Card.Content>
            </Card>

            {/* Footer */}
            <Text style={styles.footer}>
              © {new Date().getFullYear()} Padmavati School
            </Text>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
    paddingTop: Platform.OS === "ios" ? 60 : 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  logoSurface: {
    borderRadius: 24,
    marginBottom: 16,
    backgroundColor: "#ffffff",
    padding: 8,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 16,
  },
  schoolName: {
    color: "#ffffff",
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 8,
    textShadowColor: "rgba(0,0,0,0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  taglineContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 16,
  },
  tagline: {
    color: "rgba(255,255,255,0.95)",
    fontSize: 13,
    fontWeight: "600",
  },
  card: {
    borderRadius: 24,
    backgroundColor: "#ffffff",
    marginBottom: 16,
  },
  cardContent: {
    padding: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1e293b",
  },
  input: {
    marginBottom: 16,
    backgroundColor: "#ffffff",
  },
  errorText: {
    color: "#ef4444",
    fontSize: 12,
    marginTop: -12,
    marginBottom: 12,
    marginLeft: 12,
  },
  forgotButton: {
    alignSelf: "flex-end",
    marginTop: -8,
    marginBottom: 16,
  },
  forgotText: {
    color: "#2563eb",
    fontSize: 13,
    fontWeight: "600",
  },
  signInButton: {
    borderRadius: 12,
    backgroundColor: "#2563eb",
    marginBottom: 16,
  },
  disabledButton: {
    backgroundColor: "#cbd5e1",
  },
  buttonContent: {
    paddingVertical: 8,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  helpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
    marginTop: 8,
  },
  helpText: {
    color: "#94a3b8",
    fontSize: 12,
  },
  footer: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    textAlign: "center",
    marginTop: 8,
  },
});

export default LoginScreen;
