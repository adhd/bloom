import { useState, useEffect, useRef } from 'react';
import { Text, View, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView, StatusBar, Animated, Platform, Modal, TextInput, useColorScheme, PanResponder, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { EnergyEntry } from './types';
import Insights from './insights';
import { saveEntry, getEntries, updateEntry, deleteEntry } from './firebase';
import * as Notifications from 'expo-notifications';
import { registerForPushNotificationsAsync, scheduleDailyNotifications, handleNotificationResponse } from './notifications';

const ENERGY_LEVELS = [
  { value: 1, emoji: '😴', label: '1' },
  { value: 2, emoji: '😪', label: '2' },
  { value: 3, emoji: '😐', label: '3' },
  { value: 4, emoji: '😊', label: '4' },
  { value: 5, emoji: '⚡️', label: '5' },
];

const HOLD_DURATION = 500;

export default function App() {
  const [entries, setEntries] = useState<EnergyEntry[]>([]);
  const systemColorScheme = useColorScheme();
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>(systemColorScheme || 'dark');
  const [activeLevel, setActiveLevel] = useState<number | null>(null);
  const activeLevelRef = useRef<number | null>(null);
  const progressAnim = useState(() => new Animated.Value(0))[0];
  const buttonScales = ENERGY_LEVELS.reduce((acc, level) => {
    acc[level.value] = new Animated.Value(1);
    return acc;
  }, {} as { [key: number]: Animated.Value });
  const [activeTab, setActiveTab] = useState<'log' | 'insights'>('log');
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [pendingComment, setPendingComment] = useState('');
  const [selectedEntryForComment, setSelectedEntryForComment] = useState<EnergyEntry | null>(null);
  const [expandedCommentId, setExpandedCommentId] = useState<number | null>(null);
  const [swipingId, setSwipingId] = useState<string | null>(null);
  const swipeAnims = useRef<{ [key: string]: Animated.Value }>({}).current;
  const swipeThreshold = -80;
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    if (systemColorScheme) {
      setColorScheme(systemColorScheme);
    }
  }, [systemColorScheme]);

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => {
      if (!token) {
        Alert.alert(
          "Notifications Disabled",
          "Enable notifications to get daily energy check-in reminders.",
          [{ text: "OK" }]
        );
      } else {
        scheduleDailyNotifications();
      }
    });

    // Listen for incoming notifications while app is foregrounded
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Received notification:', notification);
    });

    // Listen for user interaction with notifications
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      handleNotificationResponse(response);
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  const toggleTheme = () => {
    setColorScheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const theme = {
    background: colorScheme === 'dark' ? '#0A0A0A' : '#FFFFFF',
    text: colorScheme === 'dark' ? '#FFFFFF' : '#0A0A0A',
    textSecondary: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
    surface: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
    surfacePressed: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)',
    border: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
  };

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      const loadedEntries = await getEntries();
      console.log('📚 Loaded entries:', loadedEntries.length);
      setEntries(loadedEntries);
    } catch (error) {
      console.error('Error loading entries:', error);
      // Could add a retry mechanism here if needed
    }
  };

  const animateSuccess = (level: number) => {
    console.log('🎉 Animation success triggered for level:', level);
    const scaleAnim = buttonScales[level];
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 100,
        useNativeDriver: false,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: false,
      })
    ]).start(() => {
      console.log('✨ Success animation completed');
    });
  };

  const handleSaveEntry = async (level: number) => {
    console.log('💾 Saving entry for level:', level);
    const newEntry: EnergyEntry = {
      timestamp: Date.now(),
      level
    };

    try {
      console.log('📝 Saving to Firestore');
      const docRef = await saveEntry(newEntry);
      
      console.log('🔄 Updating state with new entry');
      setEntries(prevEntries => [{
        ...newEntry,
        id: docRef.id
      }, ...prevEntries]);
      
      console.log('📳 Triggering haptic feedback');
      if (Platform.OS !== 'web') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }
      animateSuccess(level);
    } catch (error) {
      console.error('❌ Error saving entry:', error);
      activeLevelRef.current = null;
      setActiveLevel(null);
      progressAnim.setValue(0);
      
      const scaleAnim = buttonScales[level];
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: false,
      }).start();
    }
  };

  const handlePressIn = (level: number) => {
    console.log('👇 Press started on level:', level);
    setActiveLevel(level);
    activeLevelRef.current = level;
    progressAnim.setValue(0);
    
    console.log('⏳ Starting progress animation');
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: HOLD_DURATION,
      useNativeDriver: false,
    }).start(({ finished }) => {
      console.log('🏁 Progress animation finished:', finished, 'Active level ref:', activeLevelRef.current, 'Level:', level);
      if (finished && activeLevelRef.current === level) {
        console.log('✅ Conditions met, saving entry');
        handleSaveEntry(level).then(() => {
          activeLevelRef.current = null;
          setActiveLevel(null);
        });
      } else {
        console.log('❌ Conditions not met - animation was cancelled or level changed');
      }
    });

    const scaleAnim = buttonScales[level];
    Animated.timing(scaleAnim, {
      toValue: 0.95,
      duration: 100,
      useNativeDriver: false,
    }).start(() => {
      console.log('⬇️ Button scaled down');
    });
  };

  const handlePressOut = () => {
    const currentLevel = activeLevelRef.current;
    console.log('👆 Press released, active level was:', currentLevel);
    if (!currentLevel) return;

    progressAnim.stopAnimation();
    activeLevelRef.current = null;
    
    console.log('↩️ Resetting button scale for level:', currentLevel);
    const scaleAnim = buttonScales[currentLevel];
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 100,
      useNativeDriver: false,
    }).start(() => {
      console.log('⬆️ Button scale reset complete');
      setActiveLevel(null);
    });
  };

  const getEnergyColor = (level: number, isLight: boolean = false) => {
    switch (level) {
      case 1: return isLight ? '#FFB5B5' : '#FF6B6B';
      case 2: return isLight ? '#FFD1B0' : '#FF9F68';
      case 3: return isLight ? '#FFE8A3' : '#FFD93D';
      case 4: return isLight ? '#B8EBBD' : '#6BCB77';
      case 5: return isLight ? '#98D89B' : '#4CAF50';
      default: return '#A0A0A0';
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString([], { month: 'short', day: 'numeric' }),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const handleCommentIconPress = (entry: EnergyEntry) => {
    setSelectedEntryForComment(entry);
    if (entry.comment) {
      setPendingComment(entry.comment);
    } else {
      setPendingComment('');
    }
    setShowCommentModal(true);
  };

  const handleAddComment = async () => {
    if (!selectedEntryForComment?.id) return;

    try {
      await updateEntry(selectedEntryForComment.id, {
        comment: pendingComment.trim() || null
      });

      const updatedEntries = entries.map(entry => 
        entry.id === selectedEntryForComment.id
          ? { ...entry, comment: pendingComment.trim() || null }
          : entry
      );

      setEntries(updatedEntries);
      setShowCommentModal(false);
      setPendingComment('');
      setSelectedEntryForComment(null);
      setExpandedCommentId(null);
      if (Platform.OS !== 'web') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (error) {
      console.error('Error saving comment:', error);
    }
  };

  const groupEntriesByDate = (entries: EnergyEntry[]) => {
    const groups: { [key: string]: EnergyEntry[] } = {};
    entries.forEach(entry => {
      const date = new Date(entry.timestamp).toLocaleDateString([], { month: 'long', day: 'numeric' });
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(entry);
    });
    return groups;
  };

  const handleDelete = async (entryId: string) => {
    try {
      await deleteEntry(entryId);
      setEntries(prevEntries => prevEntries.filter(entry => entry.id !== entryId));
      if (Platform.OS !== 'web') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } catch (error) {
      console.error('Error deleting entry:', error);
    }
  };

  const getSwipeAnim = (entryId: string) => {
    if (!swipeAnims[entryId]) {
      swipeAnims[entryId] = new Animated.Value(0);
    }
    return swipeAnims[entryId];
  };

  const createPanResponder = (entryId: string) => PanResponder.create({
    onMoveShouldSetPanResponder: (_, gestureState) => {
      return Math.abs(gestureState.dx) > Math.abs(gestureState.dy * 2);
    },
    onPanResponderGrant: () => {
      setSwipingId(entryId);
    },
    onPanResponderMove: (_, gestureState) => {
      const swipeAnim = getSwipeAnim(entryId);
      if (gestureState.dx < 0) {
        swipeAnim.setValue(Math.max(gestureState.dx, swipeThreshold));
      }
    },
    onPanResponderRelease: (_, gestureState) => {
      const swipeAnim = getSwipeAnim(entryId);
      if (gestureState.dx < swipeThreshold) {
        Animated.spring(swipeAnim, {
          toValue: swipeThreshold,
          useNativeDriver: false,
          tension: 40,
          friction: 8
        }).start();
      } else {
        Animated.spring(swipeAnim, {
          toValue: 0,
          useNativeDriver: false,
          tension: 40,
          friction: 8
        }).start(() => {
          setSwipingId(null);
        });
      }
    }
  });

  const renderContent = () => {
    if (activeTab === 'insights') {
      return <Insights entries={entries} theme={theme} />;
    }

    const groupedEntries = groupEntriesByDate(entries);

    return (
      <View style={[styles.container, { backgroundColor: theme.background, paddingTop: 24 }]}>
        <View style={styles.energyLevels}>
          {ENERGY_LEVELS.map((level) => (
            <Animated.View
              key={level.value} 
              style={[
                styles.buttonContainer,
                {
                  transform: [{
                    scale: buttonScales[level.value]
                  }]
                }
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.levelButton,
                  { backgroundColor: getEnergyColor(level.value, colorScheme === 'light') },
                ]}
                onPressIn={() => handlePressIn(level.value)}
                onPressOut={handlePressOut}
                activeOpacity={1}
              >
                <Text style={styles.levelEmoji}>{level.emoji}</Text>
                <Text style={[styles.levelLabel, { 
                  color: colorScheme === 'light' ? '#000000' : '#FFFFFF',
                  opacity: 0.9
                }]}>{level.label}</Text>
                {activeLevel === level.value && (
                  <Animated.View 
                    style={[
                      styles.progressOverlay,
                      {
                        height: progressAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0%', '100%']
                        }),
                        backgroundColor: colorScheme === 'light' ? 
                          'rgba(0, 0, 0, 0.1)' : 
                          'rgba(255, 255, 255, 0.2)'
                      }
                    ]}
                  />
                )}
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>

        <View style={styles.content}>
          <Text style={[styles.historyTitle, { color: theme.text }]}>History</Text>
          <ScrollView 
            style={styles.entriesList}
            showsVerticalScrollIndicator={false}
          >
            {Object.entries(groupedEntries).map(([date, dateEntries]) => (
              <View key={date}>
                <Text style={[styles.dateHeader, { color: theme.textSecondary }]}>{date}</Text>
                {dateEntries.map((entry) => {
                  const panResponder = createPanResponder(entry.id || '');
                  const swipeAnim = getSwipeAnim(entry.id || '');
                  
                  return (
                    <View key={entry.timestamp} style={{ position: 'relative' }}>
                      <Animated.View 
                        style={[
                          styles.deleteButton,
                          {
                            opacity: swipeAnim.interpolate({
                              inputRange: [swipeThreshold, 0],
                              outputRange: [1, 0],
                              extrapolate: 'clamp'
                            })
                          }
                        ]}
                      >
                        <TouchableOpacity 
                          onPress={() => handleDelete(entry.id || '')}
                          style={styles.deleteButtonInner}
                        >
                          <Text style={styles.deleteButtonText}>🗑️</Text>
                        </TouchableOpacity>
                      </Animated.View>
                      <Animated.View 
                        {...panResponder.panHandlers}
                        style={[
                          styles.entryItem,
                          { 
                            backgroundColor: theme.surface,
                            transform: [{
                              translateX: swipeAnim
                            }]
                          }
                        ]}
                      >
                        <View style={styles.entryHeader}>
                          <View style={styles.entryInfo}>
                            <View style={[styles.energyBadge, { 
                              backgroundColor: getEnergyColor(entry.level, colorScheme === 'light') 
                            }]}>
                              <Text style={[styles.energyLevel, { 
                                color: colorScheme === 'light' ? '#000000' : '#FFFFFF',
                                opacity: 0.9
                              }]}>{entry.level}</Text>
                            </View>
                          </View>
                          <View style={styles.entryActions}>
                            <Text style={[styles.entryTime, { color: theme.textSecondary }]}>
                              {formatDate(entry.timestamp).time}
                            </Text>
                            <TouchableOpacity 
                              onPress={() => handleCommentIconPress(entry)}
                              style={styles.commentButton}
                            >
                              <Text style={[
                                styles.commentIcon,
                                { opacity: entry.comment ? 1 : 0.3 }
                              ]}>💭</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                        {expandedCommentId === entry.timestamp && entry.comment && (
                          <View style={[styles.commentContainer, { borderTopColor: theme.border }]}>
                            <Text style={[styles.commentText, { color: theme.textSecondary }]}>{entry.comment}</Text>
                          </View>
                        )}
                      </Animated.View>
                    </View>
                  );
                })}
              </View>
            ))}
          </ScrollView>
        </View>

        <Modal
          visible={showCommentModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowCommentModal(false)}
        >
          <TouchableOpacity 
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowCommentModal(false)}
          >
            <View style={[styles.modalContent, { 
              backgroundColor: theme.background,
              borderColor: theme.border
            }]}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                {selectedEntryForComment?.comment ? 'Edit Note' : 'Add Note'}
              </Text>
              <TextInput
                style={[styles.commentInput, { 
                  backgroundColor: theme.surface,
                  color: theme.text
                }]}
                value={pendingComment}
                onChangeText={setPendingComment}
                placeholder="What's on your mind?"
                placeholderTextColor={theme.textSecondary}
                multiline
                maxLength={280}
                autoFocus
              />
              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={styles.modalButton}
                  onPress={() => {
                    setShowCommentModal(false);
                    setPendingComment('');
                    setSelectedEntryForComment(null);
                  }}
                >
                  <Text style={[styles.modalButtonText, { color: theme.textSecondary }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.modalButtonPrimary]}
                  onPress={handleAddComment}
                >
                  <Text style={styles.modalButtonTextPrimary}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    );
  };

  return (
    <>
      <StatusBar 
        barStyle={colorScheme === 'dark' ? "light-content" : "dark-content"}
        backgroundColor={theme.background}
      />
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { backgroundColor: theme.background }]}>
          <View style={styles.headerTop}>
            <Text style={[styles.title, { color: theme.text }]}>bloom</Text>
            <TouchableOpacity 
              style={[styles.profileButton, { backgroundColor: theme.surface }]}
              onPress={toggleTheme}
            >
              <Text style={styles.profileEmoji}>{colorScheme === 'dark' ? '🌙' : '☀️'}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.pageIndicator}>
            <TouchableOpacity 
              onPress={() => setActiveTab('log')}
              style={styles.indicatorButton}
            >
              <Text style={[
                styles.indicatorText,
                { color: theme.textSecondary },
                activeTab === 'log' && [styles.activeIndicatorText, { color: theme.text }]
              ]}>
                today
              </Text>
              {activeTab === 'log' && <View style={[styles.activeDot, { backgroundColor: theme.text }]} />}
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setActiveTab('insights')}
              style={styles.indicatorButton}
            >
              <Text style={[
                styles.indicatorText,
                { color: theme.textSecondary },
                activeTab === 'insights' && [styles.activeIndicatorText, { color: theme.text }]
              ]}>
                patterns
              </Text>
              {activeTab === 'insights' && <View style={[styles.activeDot, { backgroundColor: theme.text }]} />}
            </TouchableOpacity>
          </View>
        </View>
        {renderContent()}
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 12,
    paddingBottom: 12,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    letterSpacing: -0.5,
  },
  profileButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileEmoji: {
    fontSize: 16,
  },
  pageIndicator: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 32,
  },
  indicatorButton: {
    position: 'relative',
    paddingVertical: 4,
  },
  indicatorText: {
    fontSize: 15,
    fontWeight: '600',
    textTransform: 'lowercase',
  },
  energyLevels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  buttonContainer: {
    width: '18%',
    aspectRatio: 1,
    position: 'relative',
  },
  levelButton: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  levelEmoji: {
    fontSize: 28,
    marginBottom: 4,
  },
  levelLabel: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  historyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  entriesList: {
    flex: 1,
  },
  entryItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  entryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  energyBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  energyLevel: {
    fontSize: 17,
    fontWeight: '600',
  },
  entryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  entryActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  entryTime: {
    fontSize: 15,
  },
  commentButton: {
    padding: 4,
    marginLeft: 4,
  },
  commentIcon: {
    fontSize: 16,
  },
  dateHeader: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  commentInput: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  modalButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginLeft: 8,
  },
  modalButtonPrimary: {
    backgroundColor: '#007AFF',
  },
  modalButtonText: {
    fontSize: 16,
  },
  modalButtonTextPrimary: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  commentContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  commentText: {
    fontSize: 15,
    lineHeight: 20,
  },
  activeIndicatorText: {
    color: '#FFFFFF',
  },
  activeDot: {
    position: 'absolute',
    bottom: -4,
    left: '50%',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
    marginLeft: -2,
  },
  inputContainer: {
    padding: 24,
    marginBottom: 12,
  },
  label: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  placeholderText: {
    color: 'rgba(255, 255, 255, 0.4)',
  },
  typeSelector: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  selectedType: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  typeText: {
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
  },
  selectedTypeText: {
    color: '#FFFFFF',
  },
  additionalInput: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  additionalInputLabel: {
    fontSize: 13,
    marginBottom: 4,
  },
  additionalInputValue: {
    fontSize: 17,
    fontWeight: '500',
  },
  completedTask: {
    color: '#4CAF50',
  },
  progressOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  activeLevel: {
    opacity: 1,
  },
  commentIconFilled: {
    opacity: 1,
  },
  entryDetails: {
    marginLeft: 12,
  },
  entryType: {
    fontSize: 15,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  entrySubtext: {
    fontSize: 13,
    marginTop: 2,
  },
  deleteButton: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 80,
    backgroundColor: '#FF3B30',
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonInner: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 17,
    color: '#FFFFFF',
  },
});
