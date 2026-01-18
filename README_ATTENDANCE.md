# Teacher Attendance Backend Logic (शिक्षक उपस्थिती बॅकएंड लॉजिक)

ही फाईल तुम्हाला **"Teacher Attendance System"** साठी बॅकएंड कसे तयार करावे याबद्दल मार्गदर्शन करेल. आपल्याला शिक्षकांना **"Check In"** (येताना) आणि **"Check Out"** (जाताना) करण्याची सुविधा द्यायची आहे.

---

## 1. Database Table Structure (डेटाबेस टेबल रचना)

आपल्याला `teacher_attendance` नावाचे टेबल तयार करावे लागेल. यासाठी खालील SQL वापरा:

```sql
CREATE TABLE teacher_attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    teacher_id INT NOT NULL,
    academic_session_id INT NOT NULL, -- चालू शैक्षणिक वर्ष ID (उदा. 1 for 2025-26)
    attendance_date DATE NOT NULL,
    status ENUM('present', 'absent', 'half_day', 'leave', 'outdoor') NOT NULL DEFAULT 'present',
    in_time TIME DEFAULT NULL, -- येण्याची वेळ
    out_time TIME DEFAULT NULL, -- जाण्याची वेळ
    remarks VARCHAR(255) DEFAULT NULL,
    marked_by ENUM('teacher','admin') DEFAULT 'teacher',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- एका शिक्षकाची एका दिवसात एकदाच एन्ट्री असावी
    UNIQUE KEY unique_teacher_day (teacher_id, attendance_date),
    
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
    FOREIGN KEY (academic_session_id) REFERENCES academic_sessions(id)
);
```

---

## 2. API Endpoints आणि Logic (API आणि लॉजिक)

तुम्हाला खालील ३ मुख्य API तयार कराव्या लागतील:

### A. आजची उपस्थिती तपासा (Check Today's Status)
हे API स्क्रीन लोड झाल्यावर कॉल होईल. हे तपासेल की शिक्षकाने 'आज' Check In किंवा Check Out केले आहे का.

*   **Endpoint:** `GET /api/teacher-attendance/today/{teacherId}`
*   **Logic (मराठीत):**
    1.  दिलेल्या `teacherId` आणि `current_date` (आजची तारीख) साठी `teacher_attendance` टेबलमध्ये रेकॉर्ड शोधा.
    2.  जर रेकॉर्ड सापडले नाही -> तर User ला **"Check In"** बटन दाखवा.
    3.  जर रेकॉर्ड सापडले आणि `in_time` आहे पण `out_time` NULL आहे -> तर User ला **"Check Out"** बटन दाखवा.
    4.  जर `out_time` पण भरलेला असेल -> तर **"Attendance Completed"** दाखवा.

### B. उपस्थिती नोंदवा (Mark Attendance - Check In / Out)
जेव्हा शिक्षक बटणावर क्लिक करतील तेव्हा हे API कॉल होईल.

*   **Endpoint:** `POST /api/teacher-attendance/mark`
*   **Request Data:**
    ```json
    {
        "teacher_id": 101,
        "type": "in",  // किंवा "out"
        "time": "10:30:00",
        "date": "2026-01-18"
    }
    ```
*   **Logic (मराठीत):**
    1.  **Check In साठी:**
        *   `teacher_attendance` टेबलमध्ये नवीन रेकॉर्ड **INSERT** करा.
        *   `in_time` सेट करा आणि `status` = 'present' सेट करा.
    2.  **Check Out साठी:**
        *   त्या `teacher_id` आणि `date` साठी असलेले जुने रेकॉर्ड शोधा.
        *   त्या रेकॉर्डला **UPDATE** करा आणि `out_time` सेट करा.

### C. उपस्थिती इतिहास (View Monthly History)
हे `TeacherAttendance.js` स्क्रीनसाठी लागेल जिथे पूर्ण महिन्याचा रिपोर्ट दिसतो.

*   **Endpoint:** `GET /api/teacher-attendance/history/{teacherId}?month=01&year=2026`
*   **Logic:**
    *   दिलेल्या महिन्यातील त्या शिक्षकाचे सर्व रेकॉर्ड्स SELECT करा.
    *   ते JSON फॉरमॅटमध्ये परत पाठवा.

---

## 3. Laravel Controller Example (लॅरावेल उदाहरण)

तुम्ही तुमच्या Laravel Controller मध्ये असा कोड लिहू शकता:

```php
public function markAttendance(Request $request) {
    $teacherId = $request->teacher_id;
    $date = date('Y-m-d');
    $time = date('H:i:s');
    $sessionId = 1; // Default active session ID

    if ($request->type == 'in') {
        // Check In (Insert New Record)
        DB::table('teacher_attendance')->insert([
            'teacher_id' => $teacherId,
            'academic_session_id' => $sessionId,
            'attendance_date' => $date,
            'in_time' => $time,
            'status' => 'present',
            'created_at' => now(),
        ]);
        return response()->json(['status' => true, 'message' => 'Checked In Successfully']);
    } 
    else if ($request->type == 'out') {
        // Check Out (Update Existing Record)
        DB::table('teacher_attendance')
            ->where('teacher_id', $teacherId)
            ->where('attendance_date', $date)
            ->update([
                'out_time' => $time,
                'updated_at' => now()
            ]);
        return response()->json(['status' => true, 'message' => 'Checked Out Successfully']);
    }
}
```

---

**या सूचनांचे पालन करून तुम्ही एक मजबूत (Robust) सिस्टीम बनवू शकता.**
