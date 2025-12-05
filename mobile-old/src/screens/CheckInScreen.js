/**
 * Check-In Screen - Weekly assessment coordinator
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { CONFIG } from '../config';
import ApiService from '../services/api';
import StorageService from '../services/storage';

const CheckInScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [baselineCompleted, setBaselineCompleted] = useState(false);
  const [assessmentId, setAssessmentId] = useState(null);
  const [completedTests, setCompletedTests] = useState({
    speech: false,
    cognitive: false,
    visual: false
  });

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    // Listen for test completion (passed via navigation params)
    const unsubscribe = navigation.addListener('focus', () => {
      const params = navigation.getState()?.routes?.find(r => r.name === 'CheckIn')?.params;
      if (params?.testCompleted) {
        setCompletedTests(prev => ({
          ...prev,
          [params.testCompleted]: true
        }));
      }
    });

    return unsubscribe;
  }, [navigation]);

  const loadUserData = async () => {
    try {
      const id = await StorageService.getUserId();
      const week = await StorageService.getCurrentWeek();
      const baseline = await StorageService.getBaselineCompleted();

      setUserId(id);
      setCurrentWeek(week);
      setBaselineCompleted(baseline);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const startAssessment = async () => {
    setLoading(true);

    try {
      const isBaseline = !baselineCompleted;
      const response = await ApiService.startAssessment(userId, currentWeek, isBaseline);

      setAssessmentId(response.assessment_id);
      Alert.alert(
        isBaseline ? 'Baseline Assessment' : 'Weekly Check-In',
        isBaseline
          ? 'This is your baseline assessment. Your results will be used as reference for future comparisons.'
          : 'Complete all three tests to see your Neuro Load Score for this week.'
      );
    } catch (error) {
      console.error('Error starting assessment:', error);
      Alert.alert('Error', 'Could not start assessment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const completeAssessment = async () => {
    setLoading(true);

    try {
      const response = await ApiService.completeAssessment(assessmentId);

      if (!baselineCompleted) {
        await StorageService.saveBaselineCompleted(true);
        setBaselineCompleted(true);
      }

      await StorageService.saveCurrentWeek(currentWeek + 1);

      Alert.alert(
        'Assessment Complete!',
        `Neuro Load Score: ${response.neuro_load_score.toFixed(1)}\n\n${response.insights.message}`,
        [
          {
            text: 'View Dashboard',
            onPress: () => {
              setAssessmentId(null);
              setCompletedTests({ speech: false, cognitive: false, visual: false });
              navigation.navigate('Dashboard');
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error completing assessment:', error);
      Alert.alert('Error', error.response?.data?.detail || 'Could not complete assessment.');
    } finally {
      setLoading(false);
    }
  };

  const allTestsCompleted = completedTests.speech && completedTests.cognitive && completedTests.visual;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Weekly Check-In</Text>
        <Text style={styles.headerSubtitle}>
          {baselineCompleted ? `Week ${currentWeek}` : 'Baseline Assessment'}
        </Text>
      </View>

      <View style={styles.content}>
        {!assessmentId ? (
          <View style={styles.startCard}>
            <Icon name="clipboard-outline" size={64} color={CONFIG.COLORS.primary} />
            <Text style={styles.startTitle}>
              {baselineCompleted ? 'Start Weekly Check-In' : 'Start Baseline Assessment'}
            </Text>
            <Text style={styles.startDescription}>
              {baselineCompleted
                ? 'Complete your weekly cognitive performance assessment. Takes about 5-7 minutes.'
                : 'First, we need to establish your baseline. This will be used to track changes over time.'}
            </Text>
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={startAssessment}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Begin</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <Text style={styles.sectionTitle}>Complete These Tests</Text>

            {/* Speech Test */}
            <TestCard
              title="Speech Recording"
              description="Record a 20-60 second speech sample"
              icon="mic"
              completed={completedTests.speech}
              onPress={() => navigation.navigate('SpeechTest', { assessmentId })}
            />

            {/* Cognitive Test */}
            <TestCard
              title="Cognitive Tests"
              description="Reaction time and memory assessment"
              icon="brain"
              completed={completedTests.cognitive}
              onPress={() => navigation.navigate('CognitiveTest', { assessmentId })}
            />

            {/* Visual Test */}
            <TestCard
              title="Eye Tracking"
              description="Follow the moving target"
              icon="eye"
              completed={completedTests.visual}
              onPress={() => navigation.navigate('VisualTest', { assessmentId })}
            />

            {/* Complete Button */}
            {allTestsCompleted && (
              <TouchableOpacity
                style={[styles.completeButton, loading && styles.buttonDisabled]}
                onPress={completeAssessment}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Icon name="checkmark-circle" size={24} color="#FFFFFF" />
                    <Text style={styles.completeButtonText}>Complete Assessment</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const TestCard = ({ title, description, icon, completed, onPress }) => {
  return (
    <TouchableOpacity
      style={[styles.testCard, completed && styles.testCardCompleted]}
      onPress={onPress}
      disabled={completed}
    >
      <View style={styles.testCardLeft}>
        <Icon
          name={completed ? 'checkmark-circle' : `${icon}-outline`}
          size={32}
          color={completed ? CONFIG.COLORS.success : CONFIG.COLORS.primary}
        />
      </View>
      <View style={styles.testCardContent}>
        <Text style={styles.testCardTitle}>{title}</Text>
        <Text style={styles.testCardDescription}>{description}</Text>
      </View>
      <Icon
        name={completed ? 'checkmark' : 'chevron-forward'}
        size={24}
        color={completed ? CONFIG.COLORS.success : CONFIG.COLORS.textSecondary}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CONFIG.COLORS.background
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: CONFIG.COLORS.card
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: CONFIG.COLORS.text
  },
  headerSubtitle: {
    fontSize: 16,
    color: CONFIG.COLORS.textSecondary,
    marginTop: 4
  },
  content: {
    padding: 20
  },
  startCard: {
    backgroundColor: CONFIG.COLORS.card,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center'
  },
  startTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: CONFIG.COLORS.text,
    marginTop: 16,
    marginBottom: 12
  },
  startDescription: {
    fontSize: 16,
    color: CONFIG.COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24
  },
  button: {
    backgroundColor: CONFIG.COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 48,
    minWidth: 200,
    alignItems: 'center'
  },
  buttonDisabled: {
    opacity: 0.6
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600'
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: CONFIG.COLORS.text,
    marginBottom: 16
  },
  testCard: {
    backgroundColor: CONFIG.COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center'
  },
  testCardCompleted: {
    opacity: 0.7
  },
  testCardLeft: {
    marginRight: 16
  },
  testCardContent: {
    flex: 1
  },
  testCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: CONFIG.COLORS.text,
    marginBottom: 4
  },
  testCardDescription: {
    fontSize: 14,
    color: CONFIG.COLORS.textSecondary
  },
  completeButton: {
    backgroundColor: CONFIG.COLORS.success,
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8
  }
});

export default CheckInScreen;
