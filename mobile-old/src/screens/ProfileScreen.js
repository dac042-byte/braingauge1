/**
 * Profile Screen - User settings and data management
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { CONFIG } from '../config';
import ApiService from '../services/api';
import StorageService from '../services/storage';

const ProfileScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userId = await StorageService.getUserId();
      if (userId) {
        const userData = await ApiService.getUser(userId);
        const dashboard = await ApiService.getDashboard(userId);

        setUser(userData);
        setStats({
          totalAssessments: dashboard.total_assessments,
          currentWeek: dashboard.current_week,
          baselineCompleted: dashboard.baseline_completed
        });
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResetBaseline = () => {
    Alert.alert(
      'Reset Baseline',
      'Are you sure you want to reset your baseline? This will require you to complete a new baseline assessment.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              await StorageService.saveBaselineCompleted(false);
              await StorageService.saveCurrentWeek(1);
              Alert.alert('Success', 'Baseline reset. Complete a new baseline assessment.');
              loadUserData();
            } catch (error) {
              Alert.alert('Error', 'Could not reset baseline.');
            }
          }
        }
      ]
    );
  };

  const handleExportData = () => {
    Alert.alert(
      'Export Data',
      'Data export feature coming soon. Your data is stored securely and can be accessed anytime.'
    );
  };

  const handleAbout = () => {
    Alert.alert(
      'About NeuroLoad',
      'NeuroLoad v1.0.0\n\nA cognitive performance tracking tool for combat athletes.\n\nThis is not a medical device. Consult healthcare professionals for medical advice.'
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout? Your data will remain saved.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await StorageService.clearAll();
            navigation.reset({
              index: 0,
              routes: [{ name: 'Onboarding' }]
            });
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={CONFIG.COLORS.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      {/* User Info */}
      <View style={styles.section}>
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Icon name="person" size={48} color={CONFIG.COLORS.primary} />
          </View>
          <Text style={styles.username}>{user?.username}</Text>
          {user?.email && <Text style={styles.email}>{user.email}</Text>}
        </View>
      </View>

      {/* Stats */}
      {stats && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Statistics</Text>
          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.currentWeek}</Text>
              <Text style={styles.statLabel}>Current Week</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.totalAssessments}</Text>
              <Text style={styles.statLabel}>Total Assessments</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Icon
                name={stats.baselineCompleted ? 'checkmark-circle' : 'close-circle'}
                size={32}
                color={stats.baselineCompleted ? CONFIG.COLORS.success : CONFIG.COLORS.textSecondary}
              />
              <Text style={styles.statLabel}>Baseline</Text>
            </View>
          </View>
        </View>
      )}

      {/* Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Management</Text>

        <TouchableOpacity style={styles.actionButton} onPress={handleResetBaseline}>
          <Icon name="refresh" size={24} color={CONFIG.COLORS.text} />
          <Text style={styles.actionButtonText}>Reset Baseline</Text>
          <Icon name="chevron-forward" size={24} color={CONFIG.COLORS.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleExportData}>
          <Icon name="download" size={24} color={CONFIG.COLORS.text} />
          <Text style={styles.actionButtonText}>Export Data</Text>
          <Icon name="chevron-forward" size={24} color={CONFIG.COLORS.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Information</Text>

        <TouchableOpacity style={styles.actionButton} onPress={handleAbout}>
          <Icon name="information-circle" size={24} color={CONFIG.COLORS.text} />
          <Text style={styles.actionButtonText}>About NeuroLoad</Text>
          <Icon name="chevron-forward" size={24} color={CONFIG.COLORS.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Logout */}
      <View style={styles.section}>
        <TouchableOpacity
          style={[styles.actionButton, styles.logoutButton]}
          onPress={handleLogout}
        >
          <Icon name="log-out" size={24} color={CONFIG.COLORS.danger} />
          <Text style={[styles.actionButtonText, styles.logoutText]}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          NeuroLoad is a performance tracking tool, not a medical device.
        </Text>
      </View>
    </ScrollView>
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
  section: {
    marginTop: 20,
    paddingHorizontal: 20
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: CONFIG.COLORS.textSecondary,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  userCard: {
    backgroundColor: CONFIG.COLORS.card,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center'
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: CONFIG.COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: CONFIG.COLORS.text,
    marginBottom: 4
  },
  email: {
    fontSize: 16,
    color: CONFIG.COLORS.textSecondary
  },
  statsCard: {
    backgroundColor: CONFIG.COLORS.card,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  statItem: {
    alignItems: 'center',
    flex: 1
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: CONFIG.COLORS.primary,
    marginBottom: 4
  },
  statLabel: {
    fontSize: 12,
    color: CONFIG.COLORS.textSecondary,
    textAlign: 'center'
  },
  statDivider: {
    width: 1,
    backgroundColor: CONFIG.COLORS.border,
    marginHorizontal: 16
  },
  actionButton: {
    backgroundColor: CONFIG.COLORS.card,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  actionButtonText: {
    flex: 1,
    fontSize: 16,
    color: CONFIG.COLORS.text,
    marginLeft: 12
  },
  logoutButton: {
    borderWidth: 1,
    borderColor: CONFIG.COLORS.danger
  },
  logoutText: {
    color: CONFIG.COLORS.danger
  },
  footer: {
    padding: 40,
    alignItems: 'center'
  },
  footerText: {
    fontSize: 12,
    color: CONFIG.COLORS.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic'
  }
});

export default ProfileScreen;
