import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text, Card } from 'react-native-paper';
import { testPushToken, registerPushToken } from '../../utils/pushNotifications';
import { useAuth } from '../../context/AuthContext';

const PushNotificationTest = () => {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const { userId } = useAuth();

  const handleTestToken = async () => {
    setLoading(true);
    try {
      const pushToken = await testPushToken();
      setToken(pushToken);
    } catch (error) {
      console.error('Test failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterToken = async () => {
    if (!userId) {
      console.log('No user ID available');
      return;
    }
    
    setLoading(true);
    try {
      await registerPushToken(userId);
      console.log('Token registered successfully');
    } catch (error) {
      console.error('Registration failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text variant="titleMedium" style={styles.title}>
          Push Notification Test
        </Text>
        
        <Button
          mode="outlined"
          onPress={handleTestToken}
          loading={loading}
          style={styles.button}
        >
          Get Push Token
        </Button>
        
        <Button
          mode="contained"
          onPress={handleRegisterToken}
          loading={loading}
          disabled={!userId}
          style={styles.button}
        >
          Register Token with Backend
        </Button>
        
        {token && (
          <View style={styles.tokenContainer}>
            <Text variant="bodySmall" style={styles.tokenLabel}>
              Push Token:
            </Text>
            <Text variant="bodySmall" style={styles.tokenText}>
              {token}
            </Text>
          </View>
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 16,
  },
  title: {
    marginBottom: 16,
    textAlign: 'center',
  },
  button: {
    marginVertical: 8,
  },
  tokenContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  tokenLabel: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  tokenText: {
    fontFamily: 'monospace',
    fontSize: 10,
  },
});

export default PushNotificationTest;