import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import AdminDashboard from '../screens/admin/AdminDashBoard';
import StudentDashboard from '../screens/student/StudentDashboard';
import StudentAdmissionFrom from '../screens/student/StudentAdmissionFrom';
import ViewAllAdmissionStudent from '../screens/student/ViewAllAdmissionStudent';
import StudentDetails from '../screens/student/StudentDetails';
import FeesDetails from '../screens/student/FeesDetails';
import TeacherDashboard from '../screens/teacher/TeacherDashboard';
import TeacherAdmission from '../screens/teacher/TeacherAdmission';
import ViewAllTeachers from '../screens/teacher/ViewAllTeachers';
import TeacherSalary from '../screens/teacher/TeacherSalary';
import TeacherAttendance from '../screens/teacher/TeacherAttendance';
import TeacherDetails from '../screens/teacher/TeacherDetails';
import SchoolHoliday from '../screens/admin/SchoolHoliday';
import TeacherAttendanceView from '../screens/teacher/TeacherAttendanceView';

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
      <Stack.Screen name="TeacherDashboard" component={TeacherDashboard} />
      <Stack.Screen name="TeacherAdmission" component={TeacherAdmission} />
      <Stack.Screen name="ViewAllTeachers" component={ViewAllTeachers} />
      <Stack.Screen name="TeacherSalary" component={TeacherSalary} />
      <Stack.Screen name="TeacherAttendance" component={TeacherAttendance} />
      <Stack.Screen name="TeacherDetails" component={TeacherDetails} />
      <Stack.Screen name="SchoolHoliday" component={SchoolHoliday} />
      <Stack.Screen name="TeacherAttendanceView" component={TeacherAttendanceView} />
    </Stack.Navigator>
  );
};

export default AdminNavigator;