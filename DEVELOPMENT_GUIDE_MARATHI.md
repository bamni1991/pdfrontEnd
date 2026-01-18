# लॉगिन नेव्हिगेशन आणि डॅशबोर्ड डेव्हलपमेंट गाईड (मराठी)

## १. लॉगिन केल्यानंतर नेव्हिगेशन कुठे होते? (Explanation of Navigation)

सध्याच्या कोडनुसार तुमच्या ॲपचा फ्लो खालीलप्रमाणे आहे:

1.  युजर **LoginScreen.js** मध्ये लॉगिन करतो.
2.  लॉगिन यशस्वी झाल्यावर, कोड `navigation.replace("DrawerNavigator")` रन करतो.
3.  **DrawerNavigator.js** मध्ये फक्त एकच नेव्हिगेटर कॉल केला आहे तो म्हणजे **AdminNavigator**.
4.  **AdminNavigator.js** ची पहिली स्क्रीन **AdminDashboard** आहे.

**निष्कर्ष:** त्यामुळे सध्या **शिक्षक (Teacher)**, **विद्यार्थी (Student)** किंवा **ॲडमिन (Admin)** कोणीही लॉगिन केले तरी ते थेट **Admin Dashboard** वरच जातात. सध्या रोल-आधारित (Role-Based) नेव्हिगेशन अस्तित्वात नाही.

---

## २. शिक्षक आणि युजर (Student) डॅशबोर्ड कसे डेव्हलप करावे? (Step-by-Step Guide)

तुम्हाला जर शिक्षकांसाठी आणि विद्यार्थ्यांसाठी वेगळे डॅशबोर्ड हवे असतील, तर खालील स्टेप्स फॉलो करा:

### स्टेप १: नवीन डॅशबोर्ड स्क्रीन तयार करा (Create Screens)

तुम्हाला शिक्षकांसाठी आणि विद्यार्थ्यांसाठी स्वतंत्र स्क्रीन फाईल्स तयार कराव्या लागतील.

*   **Teacher Dashboard:** `src/screens/teacher/TeacherDashboard.js`
*   **Student Dashboard:** `src/screens/student/StudentDashboard.js`

या फाईल्समध्ये त्या त्या रोलसाठी आवश्यक असलेली माहिती (उदा. शिक्षकांसाठी अटेंडन्स, विद्यार्थ्यांसाठी फी डिटेल्स) दाखवा.

### स्टेप २: नेव्हिगेशन स्टॅक अपडेट करा (Update Navigation)

तुम्हाला `AdminNavigator.js` मध्ये हे नवीन स्क्रीन्स ऍड करावे लागतील किंवा (अधिक चांगल्या पद्धतीसाठी) तुम्ही वेगळे नेव्हिगेटर्स बनवू शकता.

सोप्या पद्धतीसाठी, `AdminNavigator.js` मध्ये हे स्क्रीन्स असल्याची खात्री करा (जे आधीच आहेत):

```javascript
<Stack.Screen name="TeacherDashboard" component={TeacherDashboard} />
<Stack.Screen name="StudentDashboard" component={StudentDashboard} />
```

### स्टेप ३: लॉगिन लॉजिक बदला (Update Login Logic)

जेव्हा युजर लॉगिन करतो, तेव्हा त्याचा **Role** चेक करून त्याला योग्य स्क्रीनवर पाठवणे गरजेचे आहे.

**LoginScreen.js** मध्ये `useEffect` हुक खालीलप्रमाणे अपडेट करा:

```javascript
useEffect(() => {
  if (user) {
    // युजरचा रोल तपासा आणि त्यानुसार नेव्हिगेट करा
    if (user.role === 'teacher') {
      navigation.replace("TeacherDashboard"); // किंवा DrawerNavigator मध्ये रोल पास करा
    } else if (user.role === 'student') {
      navigation.replace("StudentDashboard");
    } else {
      navigation.replace("DrawerNavigator"); // ॲडमिनसाठी
    }
  }
}, [user, navigation]);
```

> **टीप:** हे अधिक चांगल्या प्रकारे करण्यासाठी तुम्ही `DrawerNavigator` मध्येच कंडिशनल रेंडरिंग (Conditional Rendering) वापरू शकता.

### स्टेप ४: Drawer Navigator मध्ये बदल (Advanced/Better Way)

`src/navigation/DrawerNavigator.js` मध्ये तुम्ही `user.role` नुसार मेनू आयटम्स बदलू शकता.

```javascript
const { user } = useAuth(); // AuthContext मधून युजर घ्या

return (
  <Drawer.Navigator drawerContent={(props) => <CustomDrawerContent {...props} />}>
    
    {user?.role === 'admin' && (
       <Drawer.Screen name="AdminDashboard" component={AdminNavigator} />
    )}

    {user?.role === 'teacher' && (
       <Drawer.Screen name="TeacherDashboard" component={TeacherDashboard} />
    )}

    {user?.role === 'student' && (
       <Drawer.Screen name="StudentDashboard" component={StudentDashboard} />
    )}

  </Drawer.Navigator>
);
```

### सारांश (Summary)

1.  **Screens बनवा:** `TeacherDashboard.js` आणि `StudentDashboard.js`.
2.  **Role चेक करा:** लॉगिन झाल्यावर `user.role` काय आहे ते पहा.
3.  **Redirect करा:** जर शिक्षक असेल तर Teacher Dashboard कडे आणि विद्यार्थी असेल तर Student Dashboard कडे पाठवा.
