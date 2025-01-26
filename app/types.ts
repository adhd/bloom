export interface EnergyEntry {
  id?: string;  // Firestore document ID
  timestamp: number;
  level: number;
  comment?: string | null;
}

export interface Tracker {
  id: string;
  emoji: string;
  label: string;
  states: string[];
}

export const AVAILABLE_TRACKERS: Tracker[] = [
  {
    id: 'focus',
    emoji: '🧠',
    label: 'Focus',
    states: ['Sharp', 'Moderate', 'Foggy']
  },
  {
    id: 'stress',
    emoji: '😌',
    label: 'Stress',
    states: ['Calm', 'Moderate', 'Tense']
  },
  {
    id: 'motivation',
    emoji: '🎯',
    label: 'Motivation',
    states: ['High', 'Moderate', 'Low']
  },
  {
    id: 'creativity',
    emoji: '💡',
    label: 'Creativity',
    states: ['Flowing', 'Moderate', 'Blocked']
  },
  {
    id: 'sleepiness',
    emoji: '😴',
    label: 'Sleepiness',
    states: ['Alert', 'Moderate', 'Tired']
  },
  {
    id: 'energy',
    emoji: '⚡️',
    label: 'Energy',
    states: ['High', 'Moderate', 'Low']
  },
  {
    id: 'movement',
    emoji: '🏃‍♂️',
    label: 'Movement',
    states: ['Active', 'Moderate', 'Sedentary']
  },
  {
    id: 'hunger',
    emoji: '🍽️',
    label: 'Hunger',
    states: ['Satisfied', 'Moderate', 'Hungry']
  }
];
