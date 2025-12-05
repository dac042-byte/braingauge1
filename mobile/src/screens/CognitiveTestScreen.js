/**
 * Cognitive Test Screen - Reaction time and working memory tests
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { CONFIG } from '../config';
import ApiService from '../services/api';
import { calculateAverage, calculateStdDev, randomBetween } from '../utils/helpers';

const CognitiveTestScreen = ({ route, navigation }) => {
  const { assessmentId } = route.params;
  const [currentTest, setCurrentTest] = useState('intro'); // intro, reaction, memory, complete
  const [submitting, setSubmitting] = useState(false);

  // Reaction test state
  const [reactionTrials, setReactionTrials] = useState([]);
  const [reactionWaiting, setReactionWaiting] = useState(false);
  const [reactionStartTime, setReactionStartTime] = useState(null);
  const [reactionTimeout, setReactionTimeout] = useState(null);

  // Memory test state
  const [memorySequence, setMemorySequence] = useState([]);
  const [memoryTrials, setMemoryTrials] = useState([]);
  const [memoryCurrentIndex, setMemoryCurrentIndex] = useState(0);
  const [memoryShowingStimulus, setMemoryShowingStimulus] = useState(false);
  const [memoryCurrentNumber, setMemoryCurrentNumber] = useState(null);

  useEffect(() => {
    return () => {
      if (reactionTimeout) {
        clearTimeout(reactionTimeout);
      }
    };
  }, [reactionTimeout]);

  // ========== REACTION TIME TEST ==========

  const startReactionTest = () => {
    setCurrentTest('reaction');
    setReactionTrials([]);
    scheduleReactionStimulus();
  };

  const scheduleReactionStimulus = () => {
    setReactionWaiting(true);
    const delay = randomBetween(2000, 5000);

    const timeout = setTimeout(() => {
      setReactionWaiting(false);
      setReactionStartTime(Date.now());
    }, delay);

    setReactionTimeout(timeout);
  };

  const handleReactionTap = () => {
    if (reactionWaiting) {
      // Too early
      Alert.alert('Too Early!', 'Wait for the screen to turn green.');
      if (reactionTimeout) {
        clearTimeout(reactionTimeout);
      }
      scheduleReactionStimulus();
      return;
    }

    if (!reactionStartTime) {
      return; // Not started yet
    }

    const reactionTime = Date.now() - reactionStartTime;
    const newTrials = [...reactionTrials, { time: reactionTime, correct: true }];
    setReactionTrials(newTrials);
    setReactionStartTime(null);

    if (newTrials.length < CONFIG.REACTION_TEST_TRIALS) {
      setTimeout(() => {
        scheduleReactionStimulus();
      }, 1000);
    } else {
      finishReactionTest(newTrials);
    }
  };

  const finishReactionTest = (trials) => {
    setCurrentTest('memory-intro');
  };

  // ========== WORKING MEMORY TEST (2-BACK) ==========

  const startMemoryTest = () => {
    setCurrentTest('memory');
    setMemoryTrials([]);
    setMemoryCurrentIndex(0);

    // Generate sequence (0-9 numbers)
    const sequence = [];
    for (let i = 0; i < CONFIG.MEMORY_TEST_TRIALS; i++) {
      sequence.push(Math.floor(Math.random() * 10));
    }
    setMemorySequence(sequence);

    showNextMemoryStimulus(sequence, 0);
  };

  const showNextMemoryStimulus = (sequence, index) => {
    if (index >= sequence.length) {
      finishMemoryTest();
      return;
    }

    setMemoryCurrentNumber(sequence[index]);
    setMemoryShowingStimulus(true);
    setMemoryCurrentIndex(index);

    setTimeout(() => {
      setMemoryShowingStimulus(false);
      setMemoryCurrentNumber(null);
    }, 1500);
  };

  const handleMemoryResponse = (isMatch) => {
    const index = memoryCurrentIndex;
    const sequence = memorySequence;

    // Check if there's a 2-back match
    const actualMatch = index >= 2 && sequence[index] === sequence[index - 2];
    const correct = isMatch === actualMatch;

    const responseTime = Date.now();

    const trial = {
      index,
      value: sequence[index],
      response: isMatch,
      correct,
      responseTime
    };

    const newTrials = [...memoryTrials, trial];
    setMemoryTrials(newTrials);

    setTimeout(() => {
      showNextMemoryStimulus(sequence, index + 1);
    }, 500);
  };

  const finishMemoryTest = () => {
    submitResults();
  };

  // ========== SUBMIT RESULTS ==========

  const submitResults = async () => {
    setSubmitting(true);

    try {
      const reactionTimes = reactionTrials.map(t => t.time);
      const avgReactionTime = calculateAverage(reactionTimes);
      const reactionStd = calculateStdDev(reactionTimes);
      const reactionAccuracy = reactionTrials.filter(t => t.correct).length / reactionTrials.length;

      const memoryAccuracy = memoryTrials.filter(t => t.correct).length / memoryTrials.length;
      const memoryResponseTimes = memoryTrials.map(t => t.responseTime);
      const avgMemoryResponseTime = calculateAverage(memoryResponseTimes);

      const metrics = {
        avg_reaction_time: avgReactionTime,
        reaction_time_std: reactionStd,
        reaction_accuracy: reactionAccuracy,
        memory_accuracy: memoryAccuracy,
        memory_response_time: avgMemoryResponseTime,
        reaction_trials: reactionTrials,
        memory_trials: memoryTrials
      };

      await ApiService.submitCognitiveTest(assessmentId, metrics);

      Alert.alert(
        'Test Complete!',
        'Cognitive test results submitted successfully.',
        [
          {
            text: 'Continue',
            onPress: () => {
              navigation.navigate('CheckInMain', { testCompleted: 'cognitive' });
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error submitting cognitive test:', error);
      Alert.alert('Error', 'Could not submit test results. Please try again.');
      setSubmitting(false);
    }
  };

  // ========== RENDER ==========

  if (currentTest === 'intro') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color={CONFIG.COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Cognitive Tests</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.introCard}>
            <Icon name="flash" size={64} color={CONFIG.COLORS.primary} />
            <Text style={styles.introTitle}>Reaction Time Test</Text>
            <Text style={styles.introText}>
              Tap the screen as quickly as possible when it turns green.
              Wait for the color change - tapping too early will restart the trial.
            </Text>
            <Text style={styles.introDetail}>
              {CONFIG.REACTION_TEST_TRIALS} trials
            </Text>
            <TouchableOpacity
              style={styles.startButton}
              onPress={startReactionTest}
            >
              <Text style={styles.startButtonText}>Start Test</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  if (currentTest === 'reaction') {
    const backgroundColor = reactionWaiting
      ? CONFIG.COLORS.warning
      : reactionStartTime
      ? CONFIG.COLORS.success
      : CONFIG.COLORS.background;

    return (
      <TouchableOpacity
        style={[styles.reactionContainer, { backgroundColor }]}
        onPress={handleReactionTap}
        activeOpacity={1}
      >
        <Text style={styles.reactionText}>
          {reactionWaiting
            ? 'Wait...'
            : reactionStartTime
            ? 'TAP NOW!'
            : 'Get Ready...'}
        </Text>
        <Text style={styles.reactionProgress}>
          {reactionTrials.length} / {CONFIG.REACTION_TEST_TRIALS}
        </Text>
      </TouchableOpacity>
    );
  }

  if (currentTest === 'memory-intro') {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.introCard}>
            <Icon name="layers" size={64} color={CONFIG.COLORS.primary} />
            <Text style={styles.introTitle}>Working Memory Test</Text>
            <Text style={styles.introText}>
              Numbers will appear on screen. Tap "Match" if the current number
              matches the number from 2 steps back. Otherwise, tap "No Match".
            </Text>
            <Text style={styles.introDetail}>
              {CONFIG.MEMORY_TEST_TRIALS} trials
            </Text>
            <TouchableOpacity
              style={styles.startButton}
              onPress={startMemoryTest}
            >
              <Text style={styles.startButtonText}>Start Test</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  if (currentTest === 'memory') {
    return (
      <View style={styles.memoryContainer}>
        {memoryShowingStimulus ? (
          <Text style={styles.memoryNumber}>{memoryCurrentNumber}</Text>
        ) : (
          <View style={styles.memoryButtons}>
            <TouchableOpacity
              style={[styles.memoryButton, styles.memoryButtonMatch]}
              onPress={() => handleMemoryResponse(true)}
            >
              <Text style={styles.memoryButtonText}>Match</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.memoryButton, styles.memoryButtonNoMatch]}
              onPress={() => handleMemoryResponse(false)}
            >
              <Text style={styles.memoryButtonText}>No Match</Text>
            </TouchableOpacity>
          </View>
        )}
        <Text style={styles.memoryProgress}>
          {memoryCurrentIndex + 1} / {CONFIG.MEMORY_TEST_TRIALS}
        </Text>
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

  return null;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CONFIG.COLORS.background,
    justifyContent: 'center',
    alignItems: 'center'
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
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
    marginBottom: 16
  },
  introDetail: {
    fontSize: 14,
    color: CONFIG.COLORS.primary,
    fontWeight: '600',
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
  reactionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  reactionText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: CONFIG.COLORS.text,
    marginBottom: 24
  },
  reactionProgress: {
    fontSize: 24,
    color: CONFIG.COLORS.textSecondary
  },
  memoryContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: CONFIG.COLORS.background
  },
  memoryNumber: {
    fontSize: 120,
    fontWeight: 'bold',
    color: CONFIG.COLORS.primary
  },
  memoryButtons: {
    flexDirection: 'row',
    gap: 20
  },
  memoryButton: {
    width: 140,
    height: 140,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10
  },
  memoryButtonMatch: {
    backgroundColor: CONFIG.COLORS.success
  },
  memoryButtonNoMatch: {
    backgroundColor: CONFIG.COLORS.danger
  },
  memoryButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold'
  },
  memoryProgress: {
    position: 'absolute',
    top: 80,
    fontSize: 18,
    color: CONFIG.COLORS.textSecondary
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: CONFIG.COLORS.textSecondary
  }
});

export default CognitiveTestScreen;
