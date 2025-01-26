import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Sheet } from './ui/sheet';
import { Tracker, AVAILABLE_TRACKERS } from '../types';

interface TrackerSettingsProps {
  theme: {
    background: string;
    text: string;
    textSecondary: string;
    surface: string;
    surfacePressed: string;
    border: string;
  };
}

const TrackerSettings: React.FC<TrackerSettingsProps> = ({ theme }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTrackers, setSelectedTrackers] = useState<Tracker[]>(
    AVAILABLE_TRACKERS.slice(0, 3) // Default to first 3 trackers
  );

  const handleTrackerSelect = (tracker: Tracker) => {
    setSelectedTrackers(current => {
      if (current.find(t => t.id === tracker.id)) {
        // Remove if already selected
        return current.filter(t => t.id !== tracker.id);
      } else if (current.length < 3) {
        // Add if less than 3 selected
        return [...current, tracker];
      }
      return current;
    });
  };

  const renderSelectedTrackers = () => (
    <View style={styles.selectedTrackers}>
      {selectedTrackers.map(tracker => (
        <Text key={tracker.id} style={styles.trackerEmoji}>
          {tracker.emoji}
        </Text>
      ))}
    </View>
  );

  return (
    <View>
      <TouchableOpacity
        style={[styles.settingsRow, { backgroundColor: theme.surface }]}
        onPress={() => setIsOpen(true)}
      >
        <View style={styles.rowContent}>
          <View style={styles.rowHeader}>
            <Text style={[styles.rowLabel, { color: theme.text }]}>Active Trackers</Text>
            {renderSelectedTrackers()}
          </View>
        </View>
      </TouchableOpacity>

      <Sheet
        isVisible={isOpen}
        onClose={() => setIsOpen(false)}
        snapPoints={['60%']}
        backgroundStyle={{ backgroundColor: theme.background }}
      >
        <View style={[styles.sheetContent, { backgroundColor: theme.background }]}>
          <Text style={[styles.sheetTitle, { color: theme.text }]}>
            Select Trackers
          </Text>
          <Text style={[styles.sheetSubtitle, { color: theme.textSecondary }]}>
            Choose up to 3 trackers to monitor
          </Text>
          
          <ScrollView style={styles.trackerList}>
            {AVAILABLE_TRACKERS.map(tracker => {
              const isSelected = selectedTrackers.some(t => t.id === tracker.id);
              return (
                <TouchableOpacity
                  key={tracker.id}
                  style={[
                    styles.trackerOption,
                    { backgroundColor: theme.surface },
                    isSelected && { backgroundColor: theme.surfacePressed }
                  ]}
                  onPress={() => handleTrackerSelect(tracker)}
                >
                  <View style={styles.trackerInfo}>
                    <Text style={styles.trackerEmoji}>{tracker.emoji}</Text>
                    <View style={styles.trackerDetails}>
                      <Text style={[styles.trackerLabel, { color: theme.text }]}>
                        {tracker.label}
                      </Text>
                      <Text style={[styles.trackerStates, { color: theme.textSecondary }]}>
                        {tracker.states.join(' • ')}
                      </Text>
                    </View>
                  </View>
                  <View style={[
                    styles.radioOuter,
                    { borderColor: theme.border },
                    isSelected && { borderColor: theme.text }
                  ]}>
                    {isSelected && (
                      <View style={[styles.radioInner, { backgroundColor: theme.text }]} />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <TouchableOpacity
            style={[styles.doneButton, { backgroundColor: theme.surface }]}
            onPress={() => setIsOpen(false)}
          >
            <Text style={[styles.doneButtonText, { color: theme.text }]}>Done</Text>
          </TouchableOpacity>
        </View>
      </Sheet>
    </View>
  );
};

const styles = StyleSheet.create({
  settingsRow: {
    borderRadius: 12,
    marginBottom: 8,
  },
  rowContent: {
    padding: 16,
  },
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLabel: {
    fontSize: 17,
    fontWeight: '400',
  },
  selectedTrackers: {
    flexDirection: 'row',
    gap: 16,
  },
  trackerEmoji: {
    fontSize: 22,
  },
  sheetContent: {
    flex: 1,
    padding: 20,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  sheetSubtitle: {
    fontSize: 15,
    marginBottom: 20,
  },
  trackerList: {
    flex: 1,
  },
  trackerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  trackerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  trackerDetails: {
    flex: 1,
  },
  trackerLabel: {
    fontSize: 17,
    fontWeight: '500',
    marginBottom: 4,
  },
  trackerStates: {
    fontSize: 13,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  doneButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  doneButtonText: {
    fontSize: 17,
    fontWeight: '600',
  },
});

export default TrackerSettings; 