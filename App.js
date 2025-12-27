import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { Provider as PaperProvider } from "react-native-paper";
import * as Notifications from "expo-notifications";
import Toast from "react-native-toast-message";

import { AuthProvider } from "./src/context/AuthContext";
import MainNavigator from "./src/navigation/MainNavigator";
import { navigationRef, navigate } from "./src/navigation/navigationService";
import {
  setupNotificationListeners,
  handleNotificationTap,
  executePendingNavigation,
} from "./src/utils/pushNotifications";

export default function App() {
  useEffect(() => {
    const initializeNotifications = async () => {
      // Handle notification that opened the app (cold start)
      const initialNotification = await Notifications.getLastNotificationResponseAsync();
      if (initialNotification) {
        console.log("📱 App opened from notification:", initialNotification);
        handleNotificationTap(navigate)(initialNotification);
      }

      // Setup listeners for foreground/background notifications
      const removeListeners = setupNotificationListeners(
        (notification) => console.log("📩 Notification Received:", notification),
        handleNotificationTap(navigate)
      );

      return removeListeners;
    };

    const cleanup = initializeNotifications();
    return () => {
      cleanup?.then?.((unsubscribe) => unsubscribe?.());
    };
  }, []);

  return (
    <AuthProvider>
      <PaperProvider>
        <NavigationContainer
          ref={navigationRef}
          onReady={() => {
            console.log("✅ Navigation ready");
            executePendingNavigation(navigate);
          }}
        >
          <MainNavigator />
        </NavigationContainer>
        <Toast />
      </PaperProvider>
    </AuthProvider>
  );
}
