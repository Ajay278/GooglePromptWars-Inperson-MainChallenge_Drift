/* ═══════════════════════════════════════════════════════════════
   DRIFT Type Definitions
   ═══════════════════════════════════════════════════════════════ */

export interface UserProfile {
  id: string;
  name: string;
  createdAt: string;
  onboardingComplete: boolean;
}

export interface BehaviorProfile {
  primaryGoal: GoalType;
  distractions: DistractionType[];
  triggers: TriggerType[];
  coachingStyle: CoachingStyle;
  dailyRoutine: string;
}

export interface FutureSelfProfile {
  aspirations: string[];
  identity: string; // "I want to be someone who..."
}

export type GoalType =
  | 'focus'
  | 'sleep'
  | 'fitness'
  | 'reading'
  | 'family'
  | 'creativity'
  | 'productivity'
  | 'mindfulness';

export type DistractionType =
  | 'social_media'
  | 'youtube'
  | 'news'
  | 'gaming'
  | 'messaging'
  | 'email'
  | 'shopping'
  | 'doomscrolling';

export type TriggerType =
  | 'stress'
  | 'boredom'
  | 'loneliness'
  | 'fatigue'
  | 'anxiety'
  | 'procrastination'
  | 'habit'
  | 'fomo';

export type CoachingStyle = 'gentle' | 'direct' | 'motivational' | 'analytical';

export type MoodType = 'great' | 'good' | 'okay' | 'low' | 'stressed';
export type EnergyType = 'high' | 'medium' | 'low';

export interface MoodCheckIn {
  id: string;
  timestamp: string;
  mood: MoodType;
  energy: EnergyType;
  note?: string;
}

export interface DriftSnapshot {
  id: string;
  timestamp: string;
  score: number; // 0-100
  riskLevel: RiskLevel;
  factors: DriftFactor[];
  aiExplanation?: string;
}

export type RiskLevel = 'low' | 'moderate' | 'high' | 'critical';

export interface DriftFactor {
  name: string;
  value: number; // 0-100
  weight: number;
  trend: 'improving' | 'stable' | 'worsening';
}

export interface Intervention {
  id: string;
  timestamp: string;
  trigger: TriggerType;
  need: string;
  replacement: string;
  action: string;
  accepted: boolean;
  completed: boolean;
  aiMessage: string;
}

export interface OfflineActivity {
  id: string;
  name: string;
  category: ActivityCategory;
  duration: number; // minutes
  completedAt?: string;
  mood?: MoodType;
  description: string;
  icon: string;
}

export type ActivityCategory = 'health' | 'learning' | 'nature' | 'relationships' | 'creativity';

export interface Reflection {
  id: string;
  weekOf: string;
  narrative: string;
  wins: string[];
  patterns: string[];
  nextFocus: string;
  createdAt: string;
}

export interface Reward {
  id: string;
  timestamp: string;
  message: string;
  type: 'milestone' | 'daily' | 'weekly';
}

export interface CoachingResponse {
  message: string;
  trigger: string;
  need: string;
  replacement: string;
  action: string;
  futureReference: string;
}

export interface ReflectionResponse {
  narrative: string;
  wins: string[];
  patterns: string[];
  nextFocus: string;
}

export interface DriftExplanation {
  explanation: string;
  primaryFactor: string;
  suggestion: string;
}

export interface AppState {
  user: UserProfile | null;
  behaviorProfile: BehaviorProfile | null;
  futureSelf: FutureSelfProfile | null;
  moodHistory: MoodCheckIn[];
  driftHistory: DriftSnapshot[];
  interventions: Intervention[];
  offlineActivities: OfflineActivity[];
  reflections: Reflection[];
  rewards: Reward[];
}
