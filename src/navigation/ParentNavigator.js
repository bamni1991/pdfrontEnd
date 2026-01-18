import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import StudentDashboard from '../screens/student/StudentDashboard';
import StudentDetails from '../screens/student/StudentDetails';
import FeesDetails from '../screens/student/FeesDetails';

const Stack = createStackNavigator();

const ParentNavigator = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="StudentDashboard" component={StudentDashboard} />
            <Stack.Screen name="StudentDetails" component={StudentDetails} />
            <Stack.Screen name="FeesDetails" component={FeesDetails} />
        </Stack.Navigator>
    );
};

export default ParentNavigator;
