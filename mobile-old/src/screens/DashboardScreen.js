/**
 * Dashboard Screen - Main overview of Neuro Load Score and trends
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { CONFIG } from '../config';
import ApiService from '../services/api';
import StorageService from '../services/storage';
import { getScoreColor, getScoreStatus } from '../utils/helpers';

const DashboardScreen = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const id = await StorageService.getUserId();
      setUserId(id);

      if (id) {
        const data = await ApiService.getDashboard(id);
        setDashboardData(data);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={CONFIG.COLORS.primary} />
      </View>
    );
  }

  const latestScore = dashboardData?.latest_score?.neuro_load_score;
  const scoreColor = getScoreColor(latestScore);
  const scoreStatus = getScoreStatus(latestScore);

  // Prepare chart data
  const chartData = {
    labels: dashboardData?.weekly_history?.slice(0, 8).reverse().map(a => `W${a.week_number}`) || [],
    datasets: [{
      data: dashboardData?.weekly_history?.slice(0, 8).reverse().map(a => a.neuro_load_score || 0) || [0]
    }]
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <Text style={styles.headerSubtitle}>
          Week {dashboardData?.current_week || 1}
        </Text>
      </View>

      {/* Neuro Load Score Card */}
      <View style={styles.scoreCard}>
        <Text style={styles.scoreLabel}>Your Neuro Load Score</Text>
        <Text style={[styles.scoreValue, { color: scoreColor }]}>
          {latestScore !== null && latestScore !== undefined
            ? latestScore.toFixed(1)
            : '--'}
        </Text>
        <Text style={[styles.scoreStatus, { color: scoreColor }]}>
          {scoreStatus}
        </Text>

        {dashboardData?.insights?.message && (
          <Text style={styles.scoreMessage}>
            {dashboardData.insights.message}
          </Text>
        )}
      </View>

      {/* Breakdown Card */}
      {dashboardData?.latest_score && (
        <View style={styles.breakdownCard}>
          <Text style={styles.cardTitle}>Score Breakdown</Text>

          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Speech</Text>
            <Text style={styles.breakdownValue}>
              {dashboardData.latest_score.speech_drift_score?.toFixed(1) || '--'}
            </Text>
          </View>

          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Cognitive</Text>
            <Text style={styles.breakdownValue}>
              {dashboardData.latest_score.cognitive_drift_score?.toFixed(1) || '--'}
            </Text>
          </View>

          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Visual-Motor</Text>
            <Text style={styles.breakdownValue}>
              {dashboardData.latest_score.visual_drift_score?.toFixed(1) || '--'}
            </Text>
          </View>
        </View>
      )}

      {/* Trend Chart */}
      {chartData.labels.length > 0 && (
        <View style={styles.chartCard}>
          <Text style={styles.cardTitle}>Weekly Trend</Text>
          <LineChart
            data={chartData}
            width={Dimensions.get('window').width - 40}
            height={220}
            chartConfig={{
              backgroundColor: CONFIG.COLORS.card,
              backgroundGradientFrom: CONFIG.COLORS.card,
              backgroundGradientTo: CONFIG.COLORS.card,
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16
              },
              propsForDots: {
                r: '6',
                strokeWidth: '2',
                stroke: CONFIG.COLORS.primary
              }
            }}
            bezier
            style={styles.chart}
          />
        </View>
      )}

      {/* Baseline Status */}
      {!dashboardData?.baseline_completed && (
        <View style={styles.warningCard}>
          <Text style={styles.warningText}>
            Complete your baseline assessment to start tracking changes
          </Text>
        </View>
      )}
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
  headerSubtitle: {
    fontSize: 16,
    color: CONFIG.COLORS.textSecondary,
    marginTop: 4
  },
  scoreCard: {
    backgroundColor: CONFIG.COLORS.card,
    margin: 20,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center'
  },
  scoreLabel: {
    fontSize: 16,
    color: CONFIG.COLORS.textSecondary,
    marginBottom: 12
  },
  scoreValue: {
    fontSize: 64,
    fontWeight: 'bold',
    marginBottom: 8
  },
  scoreStatus: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16
  },
  scoreMessage: {
    fontSize: 14,
    color: CONFIG.COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 8
  },
  breakdownCard: {
    backgroundColor: CONFIG.COLORS.card,
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: CONFIG.COLORS.text,
    marginBottom: 16
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: CONFIG.COLORS.border
  },
  breakdownLabel: {
    fontSize: 16,
    color: CONFIG.COLORS.text
  },
  breakdownValue: {
    fontSize: 16,
    fontWeight: '600',
    color: CONFIG.COLORS.text
  },
  chartCard: {
    backgroundColor: CONFIG.COLORS.card,
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16
  },
  warningCard: {
    backgroundColor: CONFIG.COLORS.warning,
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12
  },
  warningText: {
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '600'
  }
});

export default DashboardScreen;
