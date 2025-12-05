/**
 * Helper Utility Functions
 */
import { CONFIG } from '../config';

/**
 * Get color based on Neuro Load Score
 */
export const getScoreColor = (score) => {
  if (score === null || score === undefined) {
    return CONFIG.COLORS.textSecondary;
  }

  if (score < CONFIG.SCORE_THRESHOLDS.STABLE) {
    return CONFIG.COLORS.success;
  } else if (score < CONFIG.SCORE_THRESHOLDS.MINOR) {
    return CONFIG.COLORS.warning;
  } else {
    return CONFIG.COLORS.danger;
  }
};

/**
 * Get status text based on Neuro Load Score
 */
export const getScoreStatus = (score) => {
  if (score === null || score === undefined) {
    return 'No Data';
  }

  if (score < CONFIG.SCORE_THRESHOLDS.STABLE) {
    return 'Stable';
  } else if (score < CONFIG.SCORE_THRESHOLDS.MINOR) {
    return 'Minor Changes';
  } else if (score < CONFIG.SCORE_THRESHOLDS.MODERATE) {
    return 'Moderate Changes';
  } else {
    return 'Significant Changes';
  }
};

/**
 * Format date to readable string
 */
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

/**
 * Calculate average from array of numbers
 */
export const calculateAverage = (numbers) => {
  if (!numbers || numbers.length === 0) return 0;
  const sum = numbers.reduce((acc, val) => acc + val, 0);
  return sum / numbers.length;
};

/**
 * Calculate standard deviation
 */
export const calculateStdDev = (numbers) => {
  if (!numbers || numbers.length === 0) return 0;
  const avg = calculateAverage(numbers);
  const squareDiffs = numbers.map(value => Math.pow(value - avg, 2));
  const avgSquareDiff = calculateAverage(squareDiffs);
  return Math.sqrt(avgSquareDiff);
};

/**
 * Format time in MM:SS format
 */
export const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Shuffle array
 */
export const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Generate random number between min and max
 */
export const randomBetween = (min, max) => {
  return Math.random() * (max - min) + min;
};
