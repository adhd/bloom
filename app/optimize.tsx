import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { EnergyEntry } from './types';

interface OptimizeProps {
  entries: EnergyEntry[];
  theme: {
    background: string;
    text: string;
    textSecondary: string;
    surface: string;
    surfacePressed: string;
    border: string;
  };
}

interface SuggestionCardProps {
  title: string;
  suggestion: string;
  colors: readonly [string, string];
  emoji: string;
}

const SuggestionCard: React.FC<SuggestionCardProps> = ({ title, suggestion, colors, emoji }) => (
  <View style={styles.cardWrapper}>
    <LinearGradient
      colors={colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardEmoji}>{emoji}</Text>
        </View>
        <Text style={styles.suggestionText}>{suggestion}</Text>
      </View>
    </LinearGradient>
  </View>
);

const Optimize: React.FC<OptimizeProps> = ({ entries, theme }) => {
  const getPeakTimeInsight = () => {
    if (entries.length < 5) {
      return "Log more entries to get personalized timing insights 🌱";
    }

    const timeMap = new Map<number, { sum: number; count: number }>();
    
    entries.forEach(entry => {
      const hour = new Date(entry.timestamp).getHours();
      const current = timeMap.get(hour) || { sum: 0, count: 0 };
      timeMap.set(hour, {
        sum: current.sum + entry.level,
        count: current.count + 1
      });
    });

    let peakHour = 0;
    let peakAvg = 0;

    timeMap.forEach((value, hour) => {
      const avg = value.sum / value.count;
      if (avg > peakAvg) {
        peakAvg = avg;
        peakHour = hour;
      }
    });

    const timeStr = `${peakHour % 12 || 12}${peakHour < 12 ? 'am' : 'pm'}`;
    return `Your peak energy time is around ${timeStr} (avg: ${peakAvg.toFixed(1)}/5)`;
  };

  const getConsistencyInsight = () => {
    if (entries.length < 5) {
      return "Keep logging to see consistency patterns 📊";
    }

    const recentEntries = entries.slice(0, 7);
    const avgEnergy = recentEntries.reduce((sum, e) => sum + e.level, 0) / recentEntries.length;
    const variance = recentEntries.reduce((sum, e) => sum + Math.pow(e.level - avgEnergy, 2), 0) / recentEntries.length;

    if (variance < 0.5) {
      return "Your energy levels are very consistent! Great for maintaining steady productivity.";
    } else if (variance < 1.5) {
      return "Your energy varies moderately through the day. Consider matching task difficulty to your energy levels.";
    } else {
      return "Your energy fluctuates significantly. Try to schedule demanding tasks during your high-energy periods.";
    }
  };

  const getTomorrowForecast = () => {
    if (entries.length < 5) {
      return "Need more data to predict tomorrow's energy pattern ⏳";
    }

    const dayAverages = new Array(7).fill({ sum: 0, count: 0 });
    entries.forEach(entry => {
      const day = new Date(entry.timestamp).getDay();
      dayAverages[day].sum += entry.level;
      dayAverages[day].count++;
    });

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowDay = tomorrow.getDay();
    
    const tomorrowAvg = dayAverages[tomorrowDay].count > 0 
      ? dayAverages[tomorrowDay].sum / dayAverages[tomorrowDay].count 
      : null;

    if (!tomorrowAvg) return "Not enough data for tomorrow's forecast yet 🔮";

    const emoji = tomorrowAvg >= 4 ? "⚡️" : tomorrowAvg >= 3 ? "😊" : "🫂";
    return `Expected energy tomorrow: ${tomorrowAvg.toFixed(1)}/5 ${emoji}`;
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.background }]} 
      contentContainerStyle={styles.contentContainer}
    >
      <SuggestionCard
        title="Peak Performance"
        suggestion={getPeakTimeInsight()}
        colors={['#845EF7', '#5B21B6'] as const}
        emoji="⏰"
      />
      
      <SuggestionCard
        title="Energy Pattern"
        suggestion={getConsistencyInsight()}
        colors={['#F59E0B', '#B45309'] as const}
        emoji="📈"
      />

      <SuggestionCard
        title="Tomorrow's Forecast"
        suggestion={getTomorrowForecast()}
        colors={['#10B981', '#047857'] as const}
        emoji="🔮"
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    gap: 16,
  },
  cardWrapper: {
    marginBottom: 16,
    borderRadius: 24,
    overflow: 'hidden',
  },
  card: {
    borderRadius: 24,
  },
  cardContent: {
    padding: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.7)',
    textTransform: 'lowercase',
  },
  cardEmoji: {
    fontSize: 20,
  },
  suggestionText: {
    fontSize: 22,
    lineHeight: 32,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

export default Optimize; 