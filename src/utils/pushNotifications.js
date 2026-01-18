// notificationService.js
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";
import axios from "axios";
import { getPushToken, storePushToken } from "./storage";

// Configure how notifications behave when received
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// 🔹 Helper: Get Expo projectId safely
function getProjectId() {
  return (
    Constants?.expoConfig?.extra?.eas?.projectId ??
    Constants?.easConfig?.projectId ??
    null
  );
}

// 🔹 Register device for push notifications
export async function registerForPushNotificationsAsync() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (!Device.isDevice) {
    throw new Error("Must use a physical device for push notifications.");
  }

  // Check permissions
  let { status } = await Notifications.getPermissionsAsync();
  if (status !== "granted") {
    ({ status } = await Notifications.requestPermissionsAsync());
  }
  if (status !== "granted") {
    throw new Error("Push notification permission not granted.");
  }

  const projectId = getProjectId();
  if (!projectId) throw new Error("Expo project ID not found.");

  try {
    const { data: pushToken } = await Notifications.getExpoPushTokenAsync({
      projectId,
    });
    return pushToken;
  } catch (err) {
    throw new Error(`Failed to fetch push token: ${err.message}`);
  }
}

// 🔹 Foreground + tap listeners
export function setupNotificationListeners(onReceive, onTap) {
  const notificationListener = Notifications.addNotificationReceivedListener(
    (notification) => onReceive?.(notification)
  );

  const responseListener =
    Notifications.addNotificationResponseReceivedListener((response) =>
      onTap?.(response)
    );

  return () => {
    notificationListener.remove();
    responseListener.remove();
  };
}

// 🔹 Send push token to backend
export async function registerPushToken(userId) {
  try {
    // 1. Try cached token
    let token = await getPushToken();
    // debugger;
    // 2. If not available, request a new one
    if (!token) {
      token = await registerForPushNotificationsAsync();
      if (token) await storePushToken(token);
    }

    if (!token) return null;

    const backendUrl =
      Constants.expoConfig?.extra?.backendUrl ??
      Constants.manifest?.extra?.backendUrl;

    if (!backendUrl) {
      throw new Error("Backend URL not configured in app constants.");
    }

    await axios.post(
      `${backendUrl}register-push-token`,
      {
        user_id: userId,
        push_token: token,
        device_type: Platform.OS,
      },
      { headers: { "Content-Type": "application/json" } }
    );

    console.log("✅ Push token registered successfully");
    return token;
  } catch (error) {
    console.error(
      "❌ Failed to register push token:",
      error.response?.data || error.message
    );
    throw error;
  }
}

// 🔹 For testing token generation
export async function testPushToken() {
  try {
    const token = await registerForPushNotificationsAsync();
    console.log("Test push token:", token);
    return token;
  } catch (err) {
    console.error("Test failed:", err.message);
    return null;
  }
}

// Store pending navigation for when app is ready
let pendingNavigation = null;

// 🔹 Handle notification tap navigation
export const handleNotificationTap = (navigate) => (response) => {
  console.log("👉 User tapped notification:", response);
  const data = response?.notification?.request?.content?.data;

  if (!data) {
    console.warn("Notification response missing data.");
    return;
  }

  const { navigate_to, task_id } = data;
  console.log("Navigating to", navigate_to, "with task_id", task_id);
  // Store navigation intent
  if (navigate_to === "ViewComment" && task_id) {
    console.log("Navigating to ViewComment");

    pendingNavigation = {
      screen: "Task Management",
      params: {
        screen: "ViewComment",
        params: { taskId: task_id },
      },
    };
  } else if (navigate_to === "TaskDetail" && task_id) {
    pendingNavigation = {
      screen: "Task Management",
      params: {
        screen: "TaskDetail",
        params: { taskId: task_id },
      },
    };
  }

  // Try immediate navigation
  if (pendingNavigation) {
    executeNavigation(navigate, pendingNavigation);
  }
};

// 🔹 Execute navigation with retry logic
function executeNavigation(navigate, navigationData, retryCount = 0) {
  const maxRetries = 5;
  const delay = Math.min(1000 * Math.pow(2, retryCount), 5000); // Exponential backoff

  setTimeout(() => {
    try {
      navigate(navigationData.screen, navigationData.params);
      pendingNavigation = null; // Clear after successful navigation
      console.log("✅ Navigation successful");
    } catch (error) {
      console.error(`Navigation attempt ${retryCount + 1} failed:`, error);

      if (retryCount < maxRetries) {
        executeNavigation(navigate, navigationData, retryCount + 1);
      } else {
        console.error("❌ Navigation failed after all retries");
        pendingNavigation = null;
      }
    }
  }, delay);
}

// 🔹 Execute pending navigation (call this when app is ready)
export function executePendingNavigation(navigate) {
  if (pendingNavigation) {
    console.log("🔄 Executing pending navigation:", pendingNavigation);
    executeNavigation(navigate, pendingNavigation);
  }
}
