import React, { useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  StatusBar,
  Animated,
} from "react-native";
import { Text, Avatar, Card, Surface } from "react-native-paper";
import { useAuth } from "../context/AuthContext";

const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const waveAnimation = useRef(new Animated.Value(0)).current;

  const menuItems = [
    {
      title: "Tasks",
      icon: "clipboard-text",
      screen: "Task Management",
      params: { screen: "AssignedTasks" },
      color: "#6366f1",
    },
    {
      title: "Archive",
      icon: "archive",
      screen: "ArchiveTask Drawer",
      color: "#8b5cf6",
    },
    {
      title: "Employee",
      icon: "account-group",
      screen: "UserScreen",
      color: "#10b981",
    },
    {
      title: "Projects",
      icon: "briefcase",
      screen: "ProjectsScreen",
      color: "#f59e0b",
    },
    {
      title: "Clients",
      icon: "handshake",
      screen: "ClientsScreen",
      color: "#ef4444",
    },
    {
      title: "Password",
      icon: "key",
      screen: "ChangePasswordScreen",
      color: "#06b6d4",
    },
  ];

  useEffect(() => {
    const wave = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(waveAnimation, {
            toValue: 1,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.timing(waveAnimation, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.timing(waveAnimation, {
            toValue: 1,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.timing(waveAnimation, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.delay(1500), // Wait 1.5s before repeating
        ])
      ).start();
    };
    wave();
  }, [waveAnimation]);

  const renderGridItem = ({ item }) => (
    <TouchableOpacity
      style={styles.cardContainer}
      onPress={() => navigation.navigate(item.screen, item.params)}
      activeOpacity={0.7}
    >
      <Card style={[styles.card, { borderLeftColor: item.color }]}>
        <Card.Content style={styles.cardContent}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: item.color + "15" },
            ]}
          >
            <Avatar.Icon
              size={32}
              icon={item.icon}
              style={[styles.icon, { backgroundColor: item.color }]}
              color="white"
            />
          </View>
          <Text style={styles.title}>{item.title}</Text>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      <Surface style={styles.headerSurface}>
        <View style={styles.header}>
          <View>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Animated.Text
                style={[
                  styles.headerText,
                  {
                    transform: [
                      {
                        rotate: waveAnimation.interpolate({
                          inputRange: [0, 1],
                          outputRange: ["0deg", "25deg"],
                        }),
                      },
                    ],
                  },
                ]}
              >
                👋
              </Animated.Text>
              <Text style={styles.headerText}>
                {" "}
                Hi, {user?.name.split(" ")[0] || "Guest"}
              </Text>
            </View>
            <Text style={styles.subHeaderText}>
              {user?.task_role || "Guest"} • Ready to work?
            </Text>
          </View>
          <Avatar.Image
            size={48}
            source={{
              uri: `https://ui-avatars.com/api/?name=${user?.name}&background=6366f1&color=fff&rounded=true`,
            }}
          />
        </View>
      </Surface>
      <FlatList
        data={menuItems}
        renderItem={renderGridItem}
        keyExtractor={(item, index) => index.toString()}
        numColumns={3}
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  headerSurface: {
    backgroundColor: "#fff",
    paddingHorizontal: 24,
    paddingTop: 50,
    paddingBottom: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerText: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1f2937",
    letterSpacing: -0.5,
  },
  subHeaderText: {
    fontSize: 15,
    color: "#6b7280",
    marginTop: 4,
    fontWeight: "500",
  },
  grid: {
    padding: 16,
  },
  cardContainer: {
    flex: 1,
    margin: 4,
  },
  card: {
    borderRadius: 16,
    backgroundColor: "#fff",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    borderLeftWidth: 3,
    overflow: "hidden",
  },
  cardContent: {
    alignItems: "center",
    padding: 14,
  },
  iconContainer: {
    borderRadius: 12,
    padding: 6,
    marginBottom: 8,
  },
  icon: {
    marginBottom: 0,
  },
  title: {
    fontWeight: "600",
    textAlign: "center",
    fontSize: 12,
    color: "#374151",
    letterSpacing: 0.1,
  },
});

export default HomeScreen;
