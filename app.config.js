export default {
  expo: {
    name: "padmavati",
    slug: "padmavati",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/newicon_1.png",
    userInterfaceStyle: "light",
    sdkVersion: "54.0.0",
    platforms: ["android"],
    plugins: ["expo-asset"],
    newArchEnabled: true,

    splash: {
      image: "./assets/Newsplash_1.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },

    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.padmavati.padmavati",
      buildNumber: "1.0.0",
      infoPlist: {
        UIBackgroundModes: ["fetch", "remote-notification"],
        NSAppTransportSecurity: { NSAllowsArbitraryLoads: true },
        NSUserNotificationUsageDescription:
          "Allow Padmavati to use notifications to keep you informed about your tasks.",
        NSCameraUsageDescription:
          "Allow Padmavati to access your camera to capture images.",
        NSPhotoLibraryUsageDescription:
          "Allow Padmavati to access your photos to attach images to tasks.",
        ITSAppUsesNonExemptEncryption: false,
      },
      entitlements: { "aps-environment": "production" },
    },

    android: {
      package: "com.padmavati.padmavati",
      versionCode: 1,
      usesCleartextTraffic: true,

      // googleServicesFile: "./google-services.json",
      adaptiveIcon: {
        foregroundImage: "./assets/newicon_1.png",
        backgroundColor: "#ffffff",
      },
      permissions: [
        "RECEIVE_BOOT_COMPLETED",
        "VIBRATE",
        "INTERNET",
        "ACCESS_NETWORK_STATE",
        "WAKE_LOCK",
        "POST_NOTIFICATIONS",
      ],
      notificationIcon: "./assets/newicon_1.png",
    },

    notification: {
      icon: "./assets/newicon_1.png",
      color: "#6366f1",
      androidMode: "default",
      androidCollapsedTitle: "Padmavati Notifications",
    },

    web: {
      favicon: "./assets/newicon_1.png",
    },

    updates: {
      enabled: true,
      checkAutomatically: "ON_LOAD",
      fallbackToCacheTimeout: 0,
    },
    //  IPv4 Address. . . . . . . . . . . : 192.168.221.72
    //  IPv4 Address. . . . . . . . . . . : 192.168.157.72
    extra: {
      appName: "Padmavati",
      backendUrl: "http://192.168.221.72/Pd_backend/api/",
      userImageBaseUrl:
        "http://192.168.221.72/Pd_backend/public/",
      eas: {
        projectId: "79f44ca8-3ec7-4806-b1b4-47a8baba32d5",
      },
    },
    // https://www.ramenterprisepro.com/
    // extra: {
    //   appName: "Ceryletech",
    //   backendUrl: "https://www.ramenterprisepro.com/api/",
    //   userImageBaseUrl:
    //     "https://www.ramenterprisepro.com/public/",
    //   eas: {
    //     projectId: "79f44ca8-3ec7-4806-b1b4-47a8baba32d5",
    //   },
    // },
  },
};
