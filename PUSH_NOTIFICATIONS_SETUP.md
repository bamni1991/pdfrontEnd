# Push Notifications Setup

## Frontend Implementation

The app now automatically sends the Expo push notification token to the backend when a user logs in.

### How it works:
1. When user logs in successfully, `AuthContext.login()` is called
2. After storing user data, `registerPushToken(userId)` is called
3. This function gets the Expo push token and sends it to the backend
4. The token is stored on the backend for sending notifications later

### Files modified:
- `src/utils/pushNotifications.js` - Added `registerPushToken()` function
- `src/context/AuthContext.js` - Added push token registration on login
- `app.config.js` - Added notification permissions

## Backend Endpoint Required

You need to create this endpoint on your backend:

### Endpoint: `POST /register-push-token`

**Request Body:**
```json
{
  "user_id": 123,
  "push_token": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
  "device_type": "android" // or "ios"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Push token registered successfully"
}
```

### Database Table (suggested):
```sql
CREATE TABLE push_tokens (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  push_token VARCHAR(255) NOT NULL,
  device_type ENUM('android', 'ios') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_device (user_id, device_type)
);
```

### PHP Backend Example:
```php
// In your Laravel/PHP backend
Route::post('/register-push-token', function(Request $request) {
    $validated = $request->validate([
        'user_id' => 'required|integer',
        'push_token' => 'required|string',
        'device_type' => 'required|in:android,ios'
    ]);
    
    // Update or create push token
    DB::table('push_tokens')->updateOrInsert(
        [
            'user_id' => $validated['user_id'],
            'device_type' => $validated['device_type']
        ],
        [
            'push_token' => $validated['push_token'],
            'updated_at' => now()
        ]
    );
    
    return response()->json([
        'success' => true,
        'message' => 'Push token registered successfully'
    ]);
});
```

## Testing

Use the `PushNotificationTest` component to test the functionality:

```javascript
import PushNotificationTest from './src/components/common/PushNotificationTest';

// Add to any screen for testing
<PushNotificationTest />
```

## Sending Notifications

Once tokens are stored, you can send notifications using Expo's Push API:

```javascript
// Example notification payload
const message = {
  to: 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]',
  sound: 'default',
  title: 'Task Assigned',
  body: 'You have been assigned a new task',
  data: { taskId: 123 }
};

// Send via Expo Push API
fetch('https://exp.host/--/api/v2/push/send', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(message)
});
```