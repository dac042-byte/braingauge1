/**
 * Onboarding Screen - User Registration
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator
} from 'react-native';
import { CONFIG } from '../config';
import ApiService from '../services/api';
import StorageService from '../services/storage';

const OnboardingScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkExistingUser();
  }, []);

  const checkExistingUser = async () => {
    try {
      const userId = await StorageService.getUserId();
      if (userId) {
        // User already registered, navigate to main app
        navigation.replace('Main');
      }
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setChecking(false);
    }
  };

  const handleRegister = async () => {
    if (!username.trim()) {
      Alert.alert('Error', 'Please enter a username');
      return;
    }

    setLoading(true);

    try {
      // Create user
      const user = await ApiService.createUser(username.trim(), email.trim() || null);

      // Save user data
      await StorageService.saveUserId(user.id);
      await StorageService.saveUsername(user.username);
      await StorageService.saveCurrentWeek(1);
      await StorageService.saveBaselineCompleted(false);

      // Navigate to main app
      navigation.replace('Main');
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert(
        'Registration Failed',
        error.response?.data?.detail || 'Could not create account. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={CONFIG.COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to NeuroLoad</Text>
        <Text style={styles.subtitle}>
          Track your cognitive performance and stay ahead of fatigue
        </Text>

        <View style={styles.form}>
          <Text style={styles.label}>Username *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.label}>Email (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Get Started</Text>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.disclaimer}>
          NeuroLoad is a performance tracking tool, not a medical device.
          Consult healthcare professionals for medical advice.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CONFIG.COLORS.background,
    justifyContent: 'center',
    alignItems: 'center'
  },
  content: {
    width: '90%',
    maxWidth: 400
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: CONFIG.COLORS.text,
    marginBottom: 12,
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 16,
    color: CONFIG.COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 40
  },
  form: {
    backgroundColor: CONFIG.COLORS.card,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: CONFIG.COLORS.text,
    marginBottom: 8,
    marginTop: 12
  },
  input: {
    backgroundColor: CONFIG.COLORS.background,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: CONFIG.COLORS.border
  },
  button: {
    backgroundColor: CONFIG.COLORS.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 24
  },
  buttonDisabled: {
    opacity: 0.6
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600'
  },
  disclaimer: {
    fontSize: 12,
    color: CONFIG.COLORS.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic'
  }
});

export default OnboardingScreen;
