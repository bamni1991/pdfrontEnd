import React from "react";
import { View, StyleSheet } from "react-native";
import { useTheme, Text, Surface } from "react-native-paper";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import Constants from "expo-constants";

function SideFooter() {
  const theme = useTheme();
  const appVersion = Constants.expoConfig.version;

  return (
    <Surface style={[styles.footer, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.footerContent}>
        <Icon
          name="copyright"
          size={14}
          color={theme.colors.onSurfaceVariant}
        />
        <Text
          style={[styles.footerText, { color: theme.colors.onSurfaceVariant }]}
        >
          Ceryle Tech @ {new Date().getFullYear()}
        </Text>
      </View>
      <Text
        style={[styles.versionText, { color: theme.colors.onSurfaceVariant }]}
      >
        v{appVersion}
      </Text>
    </Surface>
  );
}

const styles = StyleSheet.create({
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  footerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  footerText: {
    fontSize: 12,
    fontWeight: "500",
  },
  versionText: {
    fontSize: 12,
    fontWeight: "500",
  },
});

export default SideFooter;
