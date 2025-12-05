/**
 * Visual Test Screen - Eye tracking simulation
 * Note: This is a simplified version using touch tracking as a proxy for eye movement
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Animated
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { CONFIG } from '../config';
import ApiService from '../services/api';

const VisualTestScreen = ({ route, navigation }) => {
  const { assessmentId } = route.params;
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(CONFIG.TRACKING_DURATION);
  const [trackingData, setTrackingData] = useState([]);
  const [blinkCount, setBlinkCount] = useState(0);

  const targetPosition = useRef(new Animated.ValueXY({ x: 150, y: 300 })).current;

  useEffect(() => {
    if (started && !completed) {
      // Start moving target in circular pattern
      animateTarget();

      // Countdown timer
      const interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            finishTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [started, completed]);

  const animateTarget = () => {
    const duration = 2000;
    const radius = 100;
    const centerX = 150;
    const centerY = 300;

    const animate = (angle) => {
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);

      Animated.timing(targetPosition, {
        toValue: { x, y },
        duration: duration,
        useNativeDriver: false
      }).start(() => {
        if (!completed) {
          animate(angle + Math.PI / 4);
        }
      });
    };

    animate(0);
  };

  const handleScreenTouch = (event) => {
    if (!started || completed) return;

    const { locationX, locationY } = event.nativeEvent;

    // Record touch position
    const dataPoint = {
      timestamp: Date.now(),
      x: locationX,
      y: locationY
    };

    setTrackingData(prev => [...prev, dataPoint]);
  };

  const handleBlink = () => {
    setBlinkCount(prev => prev + 1);
  };

  const finishTest = () => {
    setCompleted(true);
    submitResults();
  };

  const calculateAccuracy = () => {
    // Simplified accuracy calculation
    // In a real app, this would compare gaze position to target position
    if (trackingData.length === 0) return 0.5;

    // Assume reasonable tracking if user provided some input
    return Math.min(0.95, 0.6 + (trackingData.length / 100));
  };

  const submitResults = async () => {
    setSubmitting(true);

    try {
      const blinkFrequency = blinkCount / CONFIG.TRACKING_DURATION; // blinks per second
      const smoothPursuitAccuracy = calculateAccuracy();

      const metrics = {
        blink_frequency: blinkFrequency,
        smooth_pursuit_accuracy: smoothPursuitAccuracy,
        tracking_duration: CONFIG.TRACKING_DURATION,
        tracking_data: trackingData.slice(0, 50) // Send sample of data
      };

      await ApiService.submitVisualTracking(assessmentId, metrics);

      Alert.alert(
        'Test Complete!',
        'Visual tracking test submitted successfully.',
        [
          {
            text: 'Continue',
            onPress: () => {
              navigation.navigate('CheckInMain', { testCompleted: 'visual' });
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error submitting visual test:', error);
      Alert.alert('Error', 'Could not submit test results. Please try again.');
      setSubmitting(false);
    }
  };

  if (!started) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color={CONFIG.COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Eye Tracking Test</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.introCard}>
            <Icon name="eye" size={64} color={CONFIG.COLORS.primary} />
            <Text style={styles.introTitle}>Visual Tracking</Text>
            <Text style={styles.introText}>
              Follow the moving dot with your finger for {CONFIG.TRACKING_DURATION} seconds.
              Tap the "Blink" button whenever you blink.
            </Text>
            <Text style={styles.introNote}>
              Note: This is a simplified tracking test. Keep your focus on the moving target.
            </Text>
            <TouchableOpacity
              style={styles.startButton}
              onPress={() => setStarted(true)}
            >
              <Text style={styles.startButtonText}>Start Test</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  if (submitting) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={CONFIG.COLORS.primary} />
        <Text style={styles.loadingText}>Submitting results...</Text>
      </View>
    );
  }

  return (
    <View style={styles.trackingContainer} onTouchMove={handleScreenTouch}>
      <View style={styles.trackingHeader}>
        <Text style={styles.timerText}>{timeRemaining}s</Text>
        <TouchableOpacity
          style={styles.blinkButton}
          onPress={handleBlink}
        >
          <Icon name="eye-off" size={20} color="#FFFFFF" />
          <Text style={styles.blinkButtonText}>Blink ({blinkCount})</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.trackingArea}>
        <Animated.View
          style={[
            styles.target,
            {
              transform: [
                { translateX: targetPosition.x },
                { translateY: targetPosition.y }
              ]
            }
          ]}
        />
        <Text style={styles.instructionText}>Follow the dot with your finger</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CONFIG.COLORS.background
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: CONFIG.COLORS.card
  },
  backButton: {
    marginRight: 16
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: CONFIG.COLORS.text
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  introCard: {
    backgroundColor: CONFIG.COLORS.card,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    maxWidth: 400
  },
  introTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: CONFIG.COLORS.text,
    marginTop: 16,
    marginBottom: 16
  },
  introText: {
    fontSize: 16,
    color: CONFIG.COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 12
  },
  introNote: {
    fontSize: 14,
    color: CONFIG.COLORS.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 24
  },
  startButton: {
    backgroundColor: CONFIG.COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 48
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600'
  },
  trackingContainer: {
    flex: 1,
    backgroundColor: CONFIG.COLORS.background
  },
  trackingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60
  },
  timerText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: CONFIG.COLORS.primary
  },
  blinkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CONFIG.COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20
  },
  blinkButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8
  },
  trackingArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  target: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: CONFIG.COLORS.primary,
    position: 'absolute'
  },
  instructionText: {
    position: 'absolute',
    bottom: 100,
    fontSize: 16,
    color: CONFIG.COLORS.textSecondary,
    textAlign: 'center'
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: CONFIG.COLORS.textSecondary
  }
});

export default VisualTestScreen;
