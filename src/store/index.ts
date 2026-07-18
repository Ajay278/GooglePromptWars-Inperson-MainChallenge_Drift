/* ═══════════════════════════════════════════════════════════════
   DRIFT Store — localStorage Persistence Layer
   ═══════════════════════════════════════════════════════════════ */

import type {
  AppState,
  UserProfile,
  BehaviorProfile,
  FutureSelfProfile,
  MoodCheckIn,
  DriftSnapshot,
  Intervention,
  OfflineActivity,
  Reflection,
  Reward,
} from '@/types';

const STORE_KEY = 'drift_app_state';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function getState(): AppState {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return JSON.parse(raw) as AppState;
  } catch {
    // corrupted state, reset
  }
  return defaultState();
}

function setState(state: AppState): void {
  localStorage.setItem(STORE_KEY, JSON.stringify(state));
}

function defaultState(): AppState {
  return {
    user: null,
    behaviorProfile: null,
    futureSelf: null,
    moodHistory: [],
    driftHistory: [],
    interventions: [],
    offlineActivities: [],
    reflections: [],
    rewards: [],
  };
}

// ─── User ──────────────────────────────────────────────────────

export function getUser(): UserProfile | null {
  return getState().user;
}

export function setUser(user: UserProfile): void {
  const state = getState();
  state.user = user;
  setState(state);
}

export function isOnboarded(): boolean {
  const user = getUser();
  return !!user?.onboardingComplete;
}

// ─── Behavior Profile ──────────────────────────────────────────

export function getBehaviorProfile(): BehaviorProfile | null {
  return getState().behaviorProfile;
}

export function setBehaviorProfile(profile: BehaviorProfile): void {
  const state = getState();
  state.behaviorProfile = profile;
  setState(state);
}

// ─── Future Self ───────────────────────────────────────────────

export function getFutureSelf(): FutureSelfProfile | null {
  return getState().futureSelf;
}

export function setFutureSelf(profile: FutureSelfProfile): void {
  const state = getState();
  state.futureSelf = profile;
  setState(state);
}

// ─── Mood ──────────────────────────────────────────────────────

export function getMoodHistory(): MoodCheckIn[] {
  return getState().moodHistory;
}

export function addMoodCheckIn(mood: Omit<MoodCheckIn, 'id' | 'timestamp'>): MoodCheckIn {
  const state = getState();
  const entry: MoodCheckIn = {
    ...mood,
    id: generateId(),
    timestamp: new Date().toISOString(),
  };
  state.moodHistory.push(entry);
  setState(state);
  return entry;
}

export function getLatestMood(): MoodCheckIn | null {
  const history = getMoodHistory();
  return history.length > 0 ? history[history.length - 1]! : null;
}

// ─── Drift Snapshots ───────────────────────────────────────────

export function getDriftHistory(): DriftSnapshot[] {
  return getState().driftHistory;
}

export function addDriftSnapshot(snapshot: Omit<DriftSnapshot, 'id' | 'timestamp'>): DriftSnapshot {
  const state = getState();
  const entry: DriftSnapshot = {
    ...snapshot,
    id: generateId(),
    timestamp: new Date().toISOString(),
  };
  state.driftHistory.push(entry);
  setState(state);
  return entry;
}

export function getLatestDrift(): DriftSnapshot | null {
  const history = getDriftHistory();
  return history.length > 0 ? history[history.length - 1]! : null;
}

// ─── Interventions ─────────────────────────────────────────────

export function getInterventions(): Intervention[] {
  return getState().interventions;
}

export function addIntervention(intervention: Omit<Intervention, 'id' | 'timestamp'>): Intervention {
  const state = getState();
  const entry: Intervention = {
    ...intervention,
    id: generateId(),
    timestamp: new Date().toISOString(),
  };
  state.interventions.push(entry);
  setState(state);
  return entry;
}

export function updateIntervention(id: string, updates: Partial<Intervention>): void {
  const state = getState();
  const idx = state.interventions.findIndex((i) => i.id === id);
  if (idx !== -1) {
    state.interventions[idx] = { ...state.interventions[idx]!, ...updates };
    setState(state);
  }
}

// ─── Offline Activities ────────────────────────────────────────

export function getOfflineActivities(): OfflineActivity[] {
  return getState().offlineActivities;
}

export function addOfflineActivity(activity: Omit<OfflineActivity, 'id'>): OfflineActivity {
  const state = getState();
  const entry: OfflineActivity = {
    ...activity,
    id: generateId(),
  };
  state.offlineActivities.push(entry);
  setState(state);
  return entry;
}

export function getCompletedActivities(): OfflineActivity[] {
  return getOfflineActivities().filter((a) => a.completedAt);
}

// ─── Reflections ───────────────────────────────────────────────

export function getReflections(): Reflection[] {
  return getState().reflections;
}

export function addReflection(reflection: Omit<Reflection, 'id' | 'createdAt'>): Reflection {
  const state = getState();
  const entry: Reflection = {
    ...reflection,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  state.reflections.push(entry);
  setState(state);
  return entry;
}

// ─── Rewards ───────────────────────────────────────────────────

export function getRewards(): Reward[] {
  return getState().rewards;
}

export function addReward(reward: Omit<Reward, 'id' | 'timestamp'>): Reward {
  const state = getState();
  const entry: Reward = {
    ...reward,
    id: generateId(),
    timestamp: new Date().toISOString(),
  };
  state.rewards.push(entry);
  setState(state);
  return entry;
}

// ─── Full State ────────────────────────────────────────────────

export function getFullState(): AppState {
  return getState();
}

export function resetState(): void {
  localStorage.removeItem(STORE_KEY);
}

export { generateId };
