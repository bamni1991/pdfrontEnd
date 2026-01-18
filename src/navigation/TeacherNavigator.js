import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import TeacherDashboard from '../screens/teacher/TeacherDashboard';
// import TeacherDetails from '../screens/teacher/TeacherDetails';
// import TeacherSalary from '../screens/teacher/TeacherSalary';
import TeacherAttendance from '../screens/teacher/TeacherAttendance';
// import MarkAttendance from '../screens/teacher/MarkAttendance';
// import MyStudents from '../screens/teacher/MyStudents';
// import AssignHomework from '../screens/teacher/AssignHomework';
// import DailyNotes from '../screens/teacher/DailyNotes';
// import StudentPerformance from '../screens/teacher/StudentPerformance';
// import ContactParent from '../screens/teacher/ContactParent';
// import MyTimetable from '../screens/teacher/MyTimetable';
import TeacherProfile from '../screens/teacher/TeacherProfile';
import TeacherMarkAttendance from '../screens/teacher/TeacherMarkAttendance';

const Stack = createStackNavigator();

const TeacherNavigator = () => {
    console.log("Teacher Navigator loaded - Routes: Dashboard, Attendance, Profile, MarkAttendance");
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="TeacherDashboard" component={TeacherDashboard} />
            {/* <Stack.Screen name="TeacherDetails" component={TeacherDetails} />
            <Stack.Screen name="TeacherSalary" component={TeacherSalary} /> */}
            <Stack.Screen name="TeacherAttendance" component={TeacherAttendance} />
            <Stack.Screen name="TeacherProfile" component={TeacherProfile} />
            <Stack.Screen name="TeacherMarkAttendance" component={TeacherMarkAttendance} />
        </Stack.Navigator>
    );
};

export default TeacherNavigator;
