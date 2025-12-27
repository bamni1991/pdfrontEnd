import HomeScreen from "../screens/HomeScreen";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import ChangePasswordScreen from "../screens/auth/ChangePasswordScreen";

const HomeNavigator = () => {
  const Stack = createNativeStackNavigator();

  
  return (
    <Stack.Navigator 
      initialRouteName="MainHomeScreen"
      screenOptions={{
        gestureEnabled: true,
        animationTypeForReplace: 'push'
      }}
    >
      <Stack.Screen name="MainHomeScreen" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ChangePasswordScreen" component={ChangePasswordScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
};

export default HomeNavigator;