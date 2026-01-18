# Teacher Attendance Monthly History & Holidays (शिक्षक उपस्थिती मासिक इतिहास आणि सुट्ट्या)

ही फाईल तुम्हाला **"View Monthly Attendance"** स्क्रीन आणि **"Holiday Management"** सिस्टम बॅकएंडमध्ये कसे तयार करावे याबद्दल मार्गदर्शन करेल.

---

## 1. Holidays & Weekly Offs Table Schema (सुट्टी आणि साप्ताहिक सुट्टी टेबल रचना)

आपल्याला सुट्ट्यांची यादी साठवण्यासाठी `school_holidays` आणि साप्ताहिक सुट्ट्यांसाठी `weekly_offs` टेबलची आवश्यकता आहे. रविवार किंवा इतर कोणताही दिवस "Weekly Off" म्हणून सेट करण्याची लवचिकता (flexibility) देण्यासाठी हे नवीन टेबल्स वापरले जातील.

**SQL Table: School Holidays**
```sql
CREATE TABLE school_holidays (
    id INT AUTO_INCREMENT PRIMARY KEY,
    holiday_date DATE NOT NULL,
    holiday_name VARCHAR(150) NOT NULL,
    holiday_type ENUM('national', 'school', 'festival') DEFAULT 'school',
    academic_session_id INT NOT NULL,
    is_active TINYINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_holiday_day (holiday_date, academic_session_id),
    FOREIGN KEY (academic_session_id) REFERENCES academic_sessions(id)
);
```

**SQL Table: Weekly Offs**
```sql
CREATE TABLE weekly_offs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    day_of_week ENUM('Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday') NOT NULL,
    academic_session_id INT NOT NULL,
    is_off TINYINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_weekly_off (day_of_week, academic_session_id),
    FOREIGN KEY (academic_session_id) REFERENCES academic_sessions(id)
);
```

**उदाहरण डेटा (Sample Data):**
```sql
-- १. रविवार सुट्टी म्हणून सेट करणे
INSERT INTO weekly_offs (day_of_week, academic_session_id, is_off) VALUES ('Sunday', 1, 1);

-- २. प्रजासत्ताक दिन सुट्टी
INSERT INTO school_holidays (holiday_date, holiday_name, holiday_type, academic_session_id) 
VALUES ('2026-01-26', 'Republic Day', 'national', 1);
```

---

## 2. API Logic: Monthly Attendance History (मासिक उपस्थिती API)

जेव्हा शिक्षक एखादा महिना निवडतील, तेव्हा आपल्याला त्या महिन्याच्या प्रत्येक दिवसाचे status पाठवायचे आहे.

*   **Endpoint:** `GET /api/teacher-attendance/history/{teacherId}?month=01&year=2026`
*   **Response Format:**
    ```json
    {
        "stats": {
            "present": 20,
            "absent": 2,
            "leave": 1,
            "holiday": 4,  // National/Festival/School Holidays
            "weekly_off": 4 // Sundays/Other offs
        },
        "attendance_list": [
            { "date": "2026-01-01", "status": "present", "in_time": "10:00", "out_time": "17:00" },
            { "date": "2026-01-02", "status": "absent" },
            { "date": "2026-01-04", "status": "weekly_off", "note": "Sunday" },
            { "date": "2026-01-26", "status": "holiday", "note": "Republic Day (national)" }
        ]
    }
    ```

### Backend Logic Steps (मराठीत):

1.  **सर्व दिवस जनरेट करा (Generate All Dates):**
    *   निवडलेल्या महिन्यातील सर्व तारखांची (1 ते 30/31) लूप बनवा.

2.  **डेटा फेच करा (Fetch Data):**
    *   `teacher_attendance` टेबलमधून त्या महिन्यातील रेकॉर्ड्स काढा.
    *   `school_holidays` टेबलमधून त्या महिन्यातील सुट्ट्या काढा.
    *   `weekly_offs` टेबलमधून कोणते वार सुट्टी आहेत (उदा. Sunday) ते काढा.

3.  **लूप मध्ये चेक करा (Process Each Day):**
    *   **स्टेप १ (Weekly Off):** त्या तारखेचा वार (Day Name) `weekly_offs` लिस्टमध्ये आहे का? -> असल्यास `status = 'weekly_off'`.
    *   **स्टेप २ (Holiday):** ती तारीख `school_holidays` लिस्टमध्ये आहे का? -> असल्यास `status = 'holiday'`.
    *   **स्टेप ३ (Attendance):** `teacher_attendance` मध्ये रेकॉर्ड आहे का?
        *   असल्यास, `status` (present, leave) वापरा.
    *   **स्टेप ४ (Absent/Future):** जर वरीलपैकी काहीच नसेल, तर तारीख भविष्यातील आहे का ते बघा. असल्यास `-`, नसल्यास `absent`.

4.  **Count काढा (Calculate Stats):**
    *   `present`, `absent`, `holiday`, `weekly_off` मोजा.

---

## 3. Sample Laravel Controller Code

```php
public function getMonthlyAttendance($teacherId, Request $request) {
    $month = $request->month; // 01
    $year = $request->year;   // 2026
    $sessionId = 1; // Get active session ID
    
    $startDate = Carbon::createFromDate($year, $month, 1);
    $endDate = $startDate->copy()->endOfMonth();
    
    // १. उपस्थिती डेटा (Attendance)
    $attendanceRecords = DB::table('teacher_attendance')
        ->where('teacher_id', $teacherId)
        ->whereMonth('attendance_date', $month)
        ->whereYear('attendance_date', $year)
        ->get()
        ->keyBy('attendance_date');

    // २. सुट्ट्या (Holidays)
    $holidays = DB::table('school_holidays')
        ->where('academic_session_id', $sessionId)
        ->whereMonth('holiday_date', $month)
        ->whereYear('holiday_date', $year)
        ->get()
        ->keyBy('holiday_date');

    // ३. साप्ताहिक सुट्ट्या (Weekly Offs) - उदा. ['Sunday', 'Saturday']
    $weeklyOffs = DB::table('weekly_offs')
        ->where('academic_session_id', $sessionId)
        ->where('is_off', 1)
        ->pluck('day_of_week')
        ->toArray();

    $finalList = [];
    $stats = ['present' => 0, 'absent' => 0, 'leave' => 0, 'holiday' => 0, 'weekly_off' => 0];

    // ४. लूप (Loop)
    for ($date = $startDate; $date->lte($endDate); $date->addDay()) {
        $dateStr = $date->format('Y-m-d');
        $dayName = $date->format('l'); // Sunday, Monday...
        
        $status = 'absent';
        $note = '';
        $times = [];
        
        // Priority: School Holiday > Weekly Off > Marked Attendance > Absent
        // (कधीकधी सुट्टी असूनही शिक्षक येतात, तेव्हा उपस्थिती चेक केली पाहिजे का? हे धोरणावर अवलंबून आहे. 
        // खालील लॉजिकमध्ये सुट्टीला प्राधान्य दिले आहे, पण उपस्थिती असल्यास ती ओव्हरराईड करेल.)

        if (isset($holidays[$dateStr])) {
            $status = 'holiday';
            $note = $holidays[$dateStr]->holiday_name;
            $stats['holiday']++;
        } elseif (in_array($dayName, $weeklyOffs)) {
            $status = 'weekly_off';
            $note = $dayName;
            $stats['weekly_off']++;
        }
        
        // जर उपस्थिती मार्क केली असेल तर वरचे status बदलून present/leave करा
        if (isset($attendanceRecords[$dateStr])) {
            $rec = $attendanceRecords[$dateStr];
            
            // जर सुट्टी/वीकली ऑफ असेल आणि तरीही शिक्षक आले असतील, तर प्रेझेंट दाखवावे का? 
            // होय. आपण status अपडेट करू.
            if ($status === 'holiday' || $status === 'weekly_off') {
                 // मागील स्टॅट्स कमी करा
                 $stats[$status]--;
            }

            $status = $rec->status;
            $times = ['in' => $rec->in_time, 'out' => $rec->out_time];
            
            if(isset($stats[$status])) $stats[$status]++;
            else $stats['present']++;
        } elseif ($status === 'absent') {
             // उपस्थिती नाही, सुट्टी नाही -> मग non-working day किंवा future check
             if ($date->isFuture()) {
                $status = '-';
            } else {
                $stats['absent']++;
            }
        }

        $finalList[] = [
            'date' => $dateStr,
            'day' => $date->format('D'),
            'status' => $status,
            'note' => $note,
            'times' => $times
        ];
    }
    
    return response()->json([
        'stats' => $stats,
        'attendance_list' => $finalList
    ]);
}
```
