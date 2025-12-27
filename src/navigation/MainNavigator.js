import React, { useContext } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthContext } from '../context/AuthContext';
import AuthNavigator from './AuthNavigator';

import DrawerNavigator from './DrawerNavigator';

const Stack = createStackNavigator();


// Drawer Navigator for authenticated users


const MainNavigator = () => {
  const { isAuthenticated } = useContext(AuthContext);
  
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen name="DrawerNavigator" component={DrawerNavigator} />
      ) : (
        <Stack.Screen name="AuthNavigator" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
};

export default MainNavigator;