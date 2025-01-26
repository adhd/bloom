export interface EnergyEntry {
  id?: string;  // Firestore document ID
  timestamp: number;
  level: number;
  comment?: string | null;
}
