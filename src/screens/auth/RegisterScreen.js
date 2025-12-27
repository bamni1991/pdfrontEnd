import axios from "axios";
import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Dimensions,
  StatusBar,
  Image,
  Animated,
  Easing,
} from "react-native";
import {
  TextInput,
  Button,
  Text,
  Card,
  Divider,
  Surface,
  ProgressBar,
} from "react-native-paper";
import Toast from "react-native-toast-message";
import Constants from "expo-constants";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

const RegisterScreen = ({ navigation }) => {
  const backendUrl = Constants.expoConfig?.extra?.backendUrl;

  const [formData, setFormData] = useState({
    username: "",
    mobile_no: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);

  const logoScale = useMemo(() => new Animated.Value(1), []);
  const cardTranslateY = useMemo(() => new Animated.Value(0), []);

  const validationState = useMemo(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10}$/;
    return {
      username: formData.username.length >= 2,
      mobile_no: phoneRegex.test(formData.mobile_no),
      email: emailRegex.test(formData.email),
      password: formData.password.length >= 6,
      confirmPassword:
        formData.password === formData.confirmPassword &&
        formData.confirmPassword.length > 0,
    };
  }, [formData]);

  const isFormValid = Object.values(validationState).every(Boolean);
  const completionProgress =
    Object.values(validationState).filter(Boolean).length / 5;

  const handleInputChange = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const onInputFocus = useCallback(
    (inputName) => {
      setFocusedInput(inputName);
      Animated.parallel([
        Animated.timing(logoScale, {
          toValue: 0.7,
          duration: 300,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(cardTranslateY, {
          toValue: -30,
          duration: 300,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();
    },
    [logoScale, cardTranslateY]
  );

  const onInputBlur = useCallback(() => {
    setFocusedInput(null);
    Animated.parallel([
      Animated.timing(logoScale, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(cardTranslateY, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }, [logoScale, cardTranslateY]);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const toggleConfirmPasswordVisibility = useCallback(() => {
    setShowConfirmPassword((prev) => !prev);
  }, []);

  const showToast = useCallback((type, text1, text2) => {
    Toast.show({
      type,
      text1,
      text2,
      position: "top",
      visibilityTime: 3000,
    });
  }, []);

  const handleRegister = async () => {
    if (formData.password !== formData.confirmPassword) {
      showToast("error", "Password Error", "Passwords do not match!");
      return;
    }

    if (!backendUrl) {
      showToast(
        "error",
        "Configuration Error",
        "Backend URL is not configured"
      );
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(
        `${backendUrl}userRegister`,
        {
          name: formData.username,
          mobile_no: formData.mobile_no,
          email: formData.email.toLowerCase().trim(),
          password: formData.password,
        },
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          timeout: 10000,
        }
      );

      if (response.data?.message) {
        showToast("success", "Welcome Aboard! 🎉", response.data.message);
        setTimeout(() => {
          navigation.navigate("Login");
        }, 1500);
      }
    } catch (error) {
      console.error("Registration error:", error);
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApiError = (error) => {
    let errorMessage = "Registration failed. Please try again.";

    if (error.response?.data) {
      const errorData = error.response.data;
      errorMessage =
        errorData.username?.[0] ||
        errorData.email?.[0] ||
        errorData.password?.[0] ||
        errorData.detail ||
        errorMessage;
    } else if (error.request) {
      errorMessage = "Network error. Please check your connection.";
    } else if (error.message) {
      errorMessage = error.message;
    }

    showToast("error", "Registration Failed", errorMessage);
  };

  const navigateToLogin = useCallback(() => {
    navigation.navigate("Login");
  }, [navigation]);

  const getFieldIcon = (field) => {
    const icons = {
      username: "account-outline",
      mobile_no: "phone-outline",
      email: "email-outline",
      password: "lock-outline",
      confirmPassword: "lock-check-outline",
    };
    return (
      <MaterialCommunityIcons name={icons[field]} size={24} color="#6b7280" />
    );
  };

  const getValidationIcon = (field, isValid) => {
    if (!formData[field]) return null;
    const iconName = isValid ? "check-circle" : "alert-circle-outline";
    const color = isValid ? "#10b981" : "#ef4444";
    return <MaterialCommunityIcons name={iconName} size={24} color={color} />;
  };

  const passwordIcon = showPassword ? "eye-off-outline" : "whatsapp";
  const confirmPasswordIcon = showConfirmPassword
    ? "eye-off-outline"
    : "whatsapp";

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#6366f1" />
      <LinearGradient
        colors={["#6366f1", "#8b5cf6", "#a855f7"]}
        style={styles.gradient}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.container}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Animated.View
              style={[
                styles.logoContainer,
                { transform: [{ scale: logoScale }] },
              ]}
            >
              <Surface style={styles.logoSurface} elevation={4}>
                <Image
                  source={{
                    uri: "https://ceryletech.com/img/demos/it-services/logo.png",
                  }}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </Surface>
              <Text variant="headlineLarge" style={styles.appName}>
                Ceryle Tech
              </Text>
              <Text variant="bodyMedium" style={styles.tagline}>
                Create your account and get started
              </Text>
            </Animated.View>

            <Animated.View
              style={[
                styles.formContainer,
                { transform: [{ translateY: cardTranslateY }] },
              ]}
            >
              <Card style={styles.card} elevation={8}>
                <Card.Content style={styles.cardContent}>
                  <Text variant="headlineMedium" style={styles.title}>
                    Create Account
                  </Text>

                  <View style={styles.progressContainer}>
                    <Text variant="bodySmall" style={styles.progressText}>
                      Profile Completion: {Math.round(completionProgress * 100)}
                      %
                    </Text>
                    <ProgressBar
                      progress={completionProgress}
                      color="#6366f1"
                      style={styles.progressBar}
                    />
                  </View>

                  <TextInput
                    label="Full Name"
                    value={formData.username}
                    onChangeText={(value) =>
                      handleInputChange("username", value)
                    }
                    onFocus={() => onInputFocus("username")}
                    onBlur={onInputBlur}
                    mode="outlined"
                    style={[
                      styles.input,
                      focusedInput === "username" && styles.focusedInput,
                    ]}
                    autoCapitalize="words"
                    disabled={isLoading}
                    placeholder="Enter your full name"
                    left={
                      <TextInput.Icon icon={() => getFieldIcon("username")} />
                    }
                    right={
                      <TextInput.Icon
                        icon={() =>
                          getValidationIcon(
                            "username",
                            validationState.username
                          )
                        }
                      />
                    }
                  />

                  <TextInput
                    label="Mobile Number"
                    value={formData.mobile_no}
                    onChangeText={(value) =>
                      handleInputChange("mobile_no", value)
                    }
                    onFocus={() => onInputFocus("mobile_no")}
                    onBlur={onInputBlur}
                    mode="outlined"
                    style={[
                      styles.input,
                      focusedInput === "mobile_no" && styles.focusedInput,
                    ]}
                    keyboardType="phone-pad"
                    disabled={isLoading}
                    placeholder="Enter 10-digit mobile number"
                    maxLength={10}
                    left={
                      <TextInput.Icon icon={() => getFieldIcon("mobile_no")} />
                    }
                    right={
                      <TextInput.Icon
                        icon={() =>
                          getValidationIcon(
                            "mobile_no",
                            validationState.mobile_no
                          )
                        }
                      />
                    }
                  />

                  <TextInput
                    label="Email Address"
                    value={formData.email}
                    onChangeText={(value) => handleInputChange("email", value)}
                    onFocus={() => onInputFocus("email")}
                    onBlur={onInputBlur}
                    mode="outlined"
                    style={[
                      styles.input,
                      focusedInput === "email" && styles.focusedInput,
                    ]}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    disabled={isLoading}
                    placeholder="Enter your email address"
                    left={<TextInput.Icon icon={() => getFieldIcon("email")} />}
                    right={
                      <TextInput.Icon
                        icon={() =>
                          getValidationIcon("email", validationState.email)
                        }
                      />
                    }
                  />

                  <TextInput
                    label="Password"
                    value={formData.password}
                    onChangeText={(value) =>
                      handleInputChange("password", value)
                    }
                    onFocus={() => onInputFocus("password")}
                    onBlur={onInputBlur}
                    mode="outlined"
                    style={[
                      styles.input,
                      focusedInput === "password" && styles.focusedInput,
                    ]}
                    secureTextEntry={!showPassword}
                    disabled={isLoading}
                    placeholder="Create a strong password"
                    left={
                      <TextInput.Icon icon={() => getFieldIcon("password")} />
                    }
                    right={
                      <TextInput.Icon
                        icon={passwordIcon}
                        onPress={togglePasswordVisibility}
                      />
                    }
                  />

                  <TextInput
                    label="Confirm Password"
                    value={formData.confirmPassword}
                    onChangeText={(value) =>
                      handleInputChange("confirmPassword", value)
                    }
                    onFocus={() => onInputFocus("confirmPassword")}
                    onBlur={onInputBlur}
                    mode="outlined"
                    style={[
                      styles.input,
                      focusedInput === "confirmPassword" && styles.focusedInput,
                    ]}
                    secureTextEntry={!showConfirmPassword}
                    disabled={isLoading}
                    placeholder="Confirm your password"
                    left={
                      <TextInput.Icon
                        icon={() => getFieldIcon("confirmPassword")}
                      />
                    }
                    right={
                      <TextInput.Icon
                        icon={confirmPasswordIcon}
                        onPress={toggleConfirmPasswordVisibility}
                      />
                    }
                  />
                  {formData.confirmPassword &&
                    !validationState.confirmPassword && (
                      <Text style={styles.errorText}>
                        Passwords do not match
                      </Text>
                    )}

                  <Button
                    mode="contained"
                    onPress={handleRegister}
                    style={[
                      styles.registerButton,
                      !isFormValid && styles.disabledButton,
                    ]}
                    contentStyle={styles.buttonContent}
                    disabled={!isFormValid || isLoading}
                    loading={isLoading}
                    icon="account-plus"
                  >
                    {isLoading ? "Creating Account..." : "Create Account"}
                  </Button>

                  <View style={styles.loginContainer}>
                    <Text variant="bodyMedium" style={styles.loginText}>
                      Already have an account?
                    </Text>
                    <Button
                      mode="text"
                      onPress={navigateToLogin}
                      style={styles.loginButton}
                      textColor="#6366f1"
                      disabled={isLoading}
                      compact
                    >
                      Sign In
                    </Button>
                  </View>

                  <Text variant="bodySmall" style={styles.termsText}>
                    By creating an account, you agree to our Terms of Service
                    and Privacy Policy
                  </Text>
                </Card.Content>
              </Card>
            </Animated.View>
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
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 24,
    paddingTop: Platform.OS === "ios" ? 40 : 20,
  },
  logoSurface: {
    borderRadius: 50,
    marginBottom: 16,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    padding: 8,
  },
  logo: {
    width: 80,
    height: 80,
  },
  appName: {
    color: "white",
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  tagline: {
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  formContainer: {
    marginBottom: 20,
  },
  card: {
    borderRadius: 24,
    backgroundColor: "white",
  },
  cardContent: {
    padding: 20,
  },
  title: {
    textAlign: "center",
    marginBottom: 16,
    fontWeight: "700",
    color: "#1f2937",
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressText: {
    textAlign: "center",
    color: "#6b7280",
    marginBottom: 6,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "#e5e7eb",
  },
  input: {
    marginBottom: 10,
    backgroundColor: "transparent",
  },
  focusedInput: {
    backgroundColor: "rgba(99, 102, 241, 0.05)",
  },
  errorText: {
    color: "#ef4444",
    fontSize: 12,
    marginTop: -6,
    marginBottom: 6,
    marginLeft: 12,
  },
  registerButton: {
    marginTop: 16,
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: "#6366f1",
    elevation: 2,
  },
  disabledButton: {
    backgroundColor: "#d1d5db",
    elevation: 0,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 4,
    marginBottom: 12,
  },
  loginText: {
    color: "#6b7280",
    marginRight: 4,
  },
  loginButton: {
    marginLeft: -8,
  },
  termsText: {
    textAlign: "center",
    color: "#9ca3af",
    paddingHorizontal: 16,
    lineHeight: 18,
    marginTop: 8,
  },
});

export default RegisterScreen;
