import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, Appbar } from "react-native-paper";

const ManageTeachers = ({ navigation }) => {
  return (
    <>
      <Appbar.Header>
        <Appbar.Action icon="menu" onPress={() => navigation.openDrawer()} />
        <Appbar.Content title="Manage Teachers" />
      </Appbar.Header>
      <View style={styles.container}>
        <Text>Manage Teachers Screen</Text>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
});

export default ManageTeachers;
