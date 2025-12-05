/**
 * Insights Screen - Detailed trends and analysis
 */
import React, { useState, useEffect } from 'react';
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
import { getScoreColor, formatDate } from '../utils/helpers';

const InsightsScreen = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [history, setHistory] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const id = await StorageService.getUserId();
      setUserId(id);

      if (id) {
        const data = await ApiService.getUserHistory(id, 12);
        setHistory(data);
      }
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadHistory();
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={CONFIG.COLORS.primary} />
      </View>
    );
  }

  const assessments = history?.assessments || [];
  const nonBaseline = assessments.filter(a => !a.is_baseline);

  // Prepare chart data for each metric
  const prepareChartData = (metric) => {
    const data = nonBaseline.slice(0, 8).reverse();
    return {
      labels: data.map(a => `W${a.week_number}`),
      datasets: [{
        data: data.map(a => a[metric] || 0)
      }]
    };
  };

  const chartConfig = {
    backgroundColor: CONFIG.COLORS.card,
    backgroundGradientFrom: CONFIG.COLORS.card,
    backgroundGradientTo: CONFIG.COLORS.card,
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: CONFIG.COLORS.primary
    }
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Insights</Text>
        <Text style={styles.headerSubtitle}>
          Detailed performance analysis
        </Text>
      </View>

      {nonBaseline.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>
            Complete assessments to see your trends and insights
          </Text>
        </View>
      ) : (
        <>
          {/* Overall Neuro Load */}
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Neuro Load Score</Text>
            <Text style={styles.chartDescription}>
              Overall cognitive drift from baseline
            </Text>
            {nonBaseline.length > 0 && (
              <LineChart
                data={prepareChartData('neuro_load_score')}
                width={Dimensions.get('window').width - 40}
                height={200}
                chartConfig={chartConfig}
                bezier
                style={styles.chart}
              />
            )}
          </View>

          {/* Speech Drift */}
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Speech Patterns</Text>
            <Text style={styles.chartDescription}>
              Changes in speaking rate, fluency, and pauses
            </Text>
            {nonBaseline.length > 0 && (
              <LineChart
                data={prepareChartData('speech_drift')}
                width={Dimensions.get('window').width - 40}
                height={200}
                chartConfig={{
                  ...chartConfig,
                  color: (opacity = 1) => `rgba(52, 199, 89, ${opacity})`
                }}
                bezier
                style={styles.chart}
              />
            )}
          </View>

          {/* Cognitive Drift */}
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Cognitive Performance</Text>
            <Text style={styles.chartDescription}>
              Reaction time and working memory changes
            </Text>
            {nonBaseline.length > 0 && (
              <LineChart
                data={prepareChartData('cognitive_drift')}
                width={Dimensions.get('window').width - 40}
                height={200}
                chartConfig={{
                  ...chartConfig,
                  color: (opacity = 1) => `rgba(255, 149, 0, ${opacity})`
                }}
                bezier
                style={styles.chart}
              />
            )}
          </View>

          {/* Visual Drift */}
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Visual-Motor Coordination</Text>
            <Text style={styles.chartDescription}>
              Eye tracking and smooth pursuit accuracy
            </Text>
            {nonBaseline.length > 0 && (
              <LineChart
                data={prepareChartData('visual_drift')}
                width={Dimensions.get('window').width - 40}
                height={200}
                chartConfig={{
                  ...chartConfig,
                  color: (opacity = 1) => `rgba(255, 59, 48, ${opacity})`
                }}
                bezier
                style={styles.chart}
              />
            )}
          </View>

          {/* Recent Assessments */}
          <View style={styles.historyCard}>
            <Text style={styles.cardTitle}>Recent Assessments</Text>
            {assessments.slice(0, 5).map(assessment => (
              <View key={assessment.id} style={styles.historyItem}>
                <View>
                  <Text style={styles.historyWeek}>
                    {assessment.is_baseline ? 'Baseline' : `Week ${assessment.week_number}`}
                  </Text>
                  <Text style={styles.historyDate}>
                    {formatDate(assessment.date)}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.historyScore,
                    { color: getScoreColor(assessment.neuro_load_score) }
                  ]}
                >
                  {assessment.neuro_load_score !== null
                    ? assessment.neuro_load_score.toFixed(1)
                    : '--'}
                </Text>
              </View>
            ))}
          </View>
        </>
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
  chartCard: {
    backgroundColor: CONFIG.COLORS.card,
    margin: 20,
    marginBottom: 0,
    padding: 20,
    borderRadius: 16
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: CONFIG.COLORS.text,
    marginBottom: 4
  },
  chartDescription: {
    fontSize: 14,
    color: CONFIG.COLORS.textSecondary,
    marginBottom: 16
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16
  },
  historyCard: {
    backgroundColor: CONFIG.COLORS.card,
    margin: 20,
    padding: 20,
    borderRadius: 16
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: CONFIG.COLORS.text,
    marginBottom: 16
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: CONFIG.COLORS.border
  },
  historyWeek: {
    fontSize: 16,
    fontWeight: '600',
    color: CONFIG.COLORS.text
  },
  historyDate: {
    fontSize: 14,
    color: CONFIG.COLORS.textSecondary,
    marginTop: 2
  },
  historyScore: {
    fontSize: 24,
    fontWeight: 'bold'
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginTop: 100
  },
  emptyText: {
    fontSize: 16,
    color: CONFIG.COLORS.textSecondary,
    textAlign: 'center'
  }
});

export default InsightsScreen;
