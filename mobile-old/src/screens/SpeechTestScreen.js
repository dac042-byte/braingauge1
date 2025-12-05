/**
 * Speech Test Screen - Audio recording and analysis
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import { CONFIG } from '../config';
import ApiService from '../services/api';
import { formatTime } from '../utils/helpers';

const audioRecorderPlayer = new AudioRecorderPlayer();

const SAMPLE_PASSAGES = [
  "The quick brown fox jumps over the lazy dog near the riverbank. Children play happily in the warm sunshine while birds sing melodious songs from the treetops.",
  "Technology continues to advance at an incredible pace, transforming the way we communicate and interact with the world around us every single day.",
  "Athletes dedicate countless hours to training their bodies and minds, pushing themselves to achieve new levels of performance and excellence in their chosen sports."
];

const SpeechTestScreen = ({ route, navigation }) => {
  const { assessmentId } = route.params;
  const [recording, setRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioPath, setAudioPath] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [passage] = useState(SAMPLE_PASSAGES[Math.floor(Math.random() * SAMPLE_PASSAGES.length)]);

  useEffect(() => {
    return () => {
      // Cleanup
      audioRecorderPlayer.stopRecorder();
      audioRecorderPlayer.removeRecordBackListener();
    };
  }, []);

  const startRecording = async () => {
    try {
      const path = await audioRecorderPlayer.startRecorder();
      setAudioPath(path);
      setRecording(true);
      setRecordingTime(0);

      audioRecorderPlayer.addRecordBackListener((e) => {
        const seconds = Math.floor(e.currentPosition / 1000);
        setRecordingTime(seconds);

        // Auto-stop at max duration
        if (seconds >= CONFIG.SPEECH_RECORDING_MAX_DURATION) {
          stopRecording();
        }
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      Alert.alert('Error', 'Could not start recording. Please check microphone permissions.');
    }
  };

  const stopRecording = async () => {
    try {
      await audioRecorderPlayer.stopRecorder();
      audioRecorderPlayer.removeRecordBackListener();
      setRecording(false);

      if (recordingTime < CONFIG.SPEECH_RECORDING_MIN_DURATION) {
        Alert.alert(
          'Recording Too Short',
          `Please record for at least ${CONFIG.SPEECH_RECORDING_MIN_DURATION} seconds.`
        );
        setAudioPath(null);
        setRecordingTime(0);
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
    }
  };

  const submitRecording = async () => {
    if (!audioPath) {
      Alert.alert('Error', 'No recording found. Please record audio first.');
      return;
    }

    setUploading(true);

    try {
      const audioFile = {
        uri: `file://${audioPath}`,
        type: 'audio/m4a',
        name: 'speech_recording.m4a'
      };

      await ApiService.uploadSpeechRecording(assessmentId, audioFile);

      Alert.alert(
        'Success!',
        'Speech recording analyzed successfully.',
        [
          {
            text: 'Continue',
            onPress: () => {
              navigation.navigate('CheckInMain', { testCompleted: 'speech' });
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error uploading recording:', error);
      Alert.alert(
        'Upload Failed',
        error.response?.data?.detail || 'Could not analyze recording. Please try again.'
      );
    } finally {
      setUploading(false);
    }
  };

  const canSubmit = audioPath && recordingTime >= CONFIG.SPEECH_RECORDING_MIN_DURATION && !recording;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-back" size={24} color={CONFIG.COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Speech Test</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>Instructions</Text>
          <Text style={styles.instructionsText}>
            Read the passage below out loud at your normal speaking pace.
            Record for 20-60 seconds.
          </Text>
        </View>

        <View style={styles.passageCard}>
          <Text style={styles.passageTitle}>Read This Passage:</Text>
          <Text style={styles.passageText}>{passage}</Text>
        </View>

        <View style={styles.recordingCard}>
          <View style={styles.timerContainer}>
            <Text style={styles.timerText}>{formatTime(recordingTime)}</Text>
            <Text style={styles.timerSubtext}>
              {recording
                ? `Recording... (${CONFIG.SPEECH_RECORDING_MAX_DURATION - recordingTime}s remaining)`
                : audioPath
                ? 'Recording complete'
                : 'Press to start recording'}
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.recordButton,
              recording && styles.recordButtonActive
            ]}
            onPress={recording ? stopRecording : startRecording}
            disabled={uploading}
          >
            <Icon
              name={recording ? 'stop' : 'mic'}
              size={48}
              color="#FFFFFF"
            />
          </TouchableOpacity>

          {audioPath && !recording && (
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => {
                setAudioPath(null);
                setRecordingTime(0);
              }}
            >
              <Text style={styles.retryText}>Record Again</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.submitButton,
            (!canSubmit || uploading) && styles.submitButtonDisabled
          ]}
          onPress={submitRecording}
          disabled={!canSubmit || uploading}
        >
          {uploading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>Submit Recording</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
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
    padding: 20
  },
  instructionsCard: {
    backgroundColor: CONFIG.COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: CONFIG.COLORS.text,
    marginBottom: 8
  },
  instructionsText: {
    fontSize: 14,
    color: CONFIG.COLORS.textSecondary,
    lineHeight: 20
  },
  passageCard: {
    backgroundColor: CONFIG.COLORS.card,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16
  },
  passageTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: CONFIG.COLORS.textSecondary,
    marginBottom: 12
  },
  passageText: {
    fontSize: 18,
    color: CONFIG.COLORS.text,
    lineHeight: 28
  },
  recordingCard: {
    backgroundColor: CONFIG.COLORS.card,
    borderRadius: 12,
    padding: 32,
    marginBottom: 16,
    alignItems: 'center'
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 24
  },
  timerText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: CONFIG.COLORS.text,
    fontVariant: ['tabular-nums']
  },
  timerSubtext: {
    fontSize: 14,
    color: CONFIG.COLORS.textSecondary,
    marginTop: 8
  },
  recordButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: CONFIG.COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  recordButtonActive: {
    backgroundColor: CONFIG.COLORS.danger
  },
  retryButton: {
    marginTop: 16,
    padding: 12
  },
  retryText: {
    color: CONFIG.COLORS.primary,
    fontSize: 16,
    fontWeight: '600'
  },
  submitButton: {
    backgroundColor: CONFIG.COLORS.success,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center'
  },
  submitButtonDisabled: {
    opacity: 0.5
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600'
  }
});

export default SpeechTestScreen;
