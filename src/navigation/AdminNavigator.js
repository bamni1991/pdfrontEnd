import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import AdminDashboard from '../screens/admin/AdminDashBoard';
import StudentDashboard from '../screens/student/StudentDashboard';
import StudentAdmissionFrom from '../screens/student/StudentAdmissionFrom';
import ViewAllAdmissionStudent from '../screens/student/ViewAllAdmissionStudent';
import StudentDetails from '../screens/student/StudentDetails';
import FeesDetails from '../screens/student/FeesDetails';

const Stack = createStackNavigator();

const AdminNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
      <Stack.Screen name="StudentDashboard" component={StudentDashboard} />
      <Stack.Screen name="StudentAdmissionFrom" component={StudentAdmissionFrom} />
      <Stack.Screen name="ViewAllAdmissionStudent" component={ViewAllAdmissionStudent} />
      <Stack.Screen name="StudentDetails" component={StudentDetails} />
      <Stack.Screen name="FeesDetails" component={FeesDetails} />
    </Stack.Navigator>
  );
};

export default AdminNavigator;