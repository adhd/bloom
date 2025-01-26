import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { EnergyEntry } from './types';

interface InsightsProps {
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

interface GradientCardProps {
  title: string;
  colors: readonly [string, string];
  children: React.ReactNode;
}

const GradientCard: React.FC<GradientCardProps> = ({ title, colors, children }) => (
  <View style={styles.cardWrapper}>
    <LinearGradient
      colors={colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.insightText}>{children}</Text>
      </View>
    </LinearGradient>
  </View>
);

export default function Insights({ entries, theme }: InsightsProps) {
  const getEnergyInsight = () => {
    if (entries.length === 0) {
      return "No data yet! Keep logging your energy 🌱";
    }

    const avgEnergy = entries.reduce((sum, e) => sum + e.level, 0) / entries.length;
    const emoji = avgEnergy >= 4 ? "⚡️" : "🫂";
    
    return `Your average energy is **${avgEnergy.toFixed(1)}** ${emoji}`;
  };

  const getWeekdayInsight = () => {
    const dayAverages = new Array(7).fill({ sum: 0, count: 0 });
    
    entries.forEach((entry: EnergyEntry) => {
      const day = new Date(entry.timestamp).getDay();
      dayAverages[day].sum += entry.level;
      dayAverages[day].count++;
    });

    const avgByDay = dayAverages.map((day, index) => ({
      day: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][index],
      avg: day.count > 0 ? day.sum / day.count : 0
    }));

    const bestDay = avgByDay.reduce((best, current) => 
      current.avg > best.avg ? current : best
    );

    const worstDay = avgByDay.reduce((worst, current) => 
      current.avg > 0 && current.avg < worst.avg ? current : worst
    );

    if (bestDay.avg === 0) {
      return "Keep logging to discover your weekly patterns! 📊";
    }

    return `**${bestDay.day}s** are your power days ⚡️\n**${worstDay.day}s** might need extra self-care 🫂`;
  };

  const getStreakInsight = () => {
    let currentStreak = 0;
    let maxStreak = 0;
    
    // Sort entries by date
    const sortedEntries = [...entries].sort((a, b) => b.timestamp - a.timestamp);
    
    // Get unique dates
    const uniqueDates = new Set(sortedEntries.map(e => 
      new Date(e.timestamp).toDateString()
    ));
    
    // Convert to array and sort
    const dates = Array.from(uniqueDates).map(d => new Date(d));
    dates.sort((a, b) => b.getTime() - a.getTime());
    
    // Calculate streak
    let lastDate = new Date();
    dates.forEach(date => {
      if ((lastDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24) <= 1) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
      lastDate = date;
    });

    if (maxStreak === 0) {
      return "Start your streak today! 🎯";
    }

    let emoji = "🔥";
    if (currentStreak >= 7) emoji = "🚀";
    else if (currentStreak >= 3) emoji = "⚡️";
    else if (currentStreak === 0) emoji = "✨";

    return `${emoji} **${currentStreak} day streak**\n${currentStreak === maxStreak ? "This is your **best streak** yet!" : `Your best streak was **${maxStreak} days**`}`;
  };

  const formatText = (text: string) => {
    return text.split('**').map((part, index) => 
      index % 2 === 1 ? // If it's between ** **
        <Text key={index} style={styles.boldText}>{part}</Text> :
        part
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={styles.contentContainer}>
      <GradientCard 
        title="energy pattern" 
        colors={['#FF6B6B', '#FFA06B'] as const}
      >
        {formatText(getEnergyInsight())}
      </GradientCard>

      <GradientCard 
        title="weekly vibes" 
        colors={['#4E65FF', '#92EFFD'] as const}
      >
        {formatText(getWeekdayInsight())}
      </GradientCard>

      <GradientCard 
        title="streak" 
        colors={['#6BCB77', '#92EFFD'] as const}
      >
        {formatText(getStreakInsight())}
      </GradientCard>
    </ScrollView>
  );
}

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
  },
  card: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  cardContent: {
    padding: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '400',
    marginBottom: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textTransform: 'lowercase',
  },
  insightText: {
    fontSize: 22,
    lineHeight: 32,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  boldText: {
    fontWeight: '600',
  },
}); 