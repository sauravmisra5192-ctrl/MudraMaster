export interface Landmark {
  x: number;
  y: number;
  z: number;
}

export type Difficulty = "Beginner" | "Intermediate" | "Advanced";

export interface MudraDetails {
  id: string;
  name: string;
  translation: string;
  shastraTerm: string;
  danceForms: string[];
  description: string;
  meaning: string;
  steps: string[];
  tips: string[];
  difficulty: Difficulty;
  iconSvg: string;
}

export interface UserStats {
  uid: string;
  displayName: string;
  email: string | null;
  currentLevel: "Beginner (Sadhaka)" | "Practitioner (Sadhaka)" | "Master (Acharya)";
  streak: number;
  totalMasteryPoints: number;
  preferredDanceForm: string;
  unlockedBadges: string[];
}

export interface MudraProgressState {
  mudraId: string;
  highestScore: number;
  totalPracticeSessions: number;
  tutorialCompleted: boolean;
  lastPracticedAt: string;
}

export interface Badge {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  requirement: string;
  icon: string;
}
