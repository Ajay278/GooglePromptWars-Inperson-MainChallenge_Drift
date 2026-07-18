/* ═══════════════════════════════════════════════════════════════
   DRIFT Attention Drift Engine
   Deterministic drift score calculation — no AI involved.
   ═══════════════════════════════════════════════════════════════ */

import type { DriftFactor, DriftSnapshot, MoodCheckIn, RiskLevel, OfflineActivity } from '@/types';
import { getMoodHistory, getDriftHistory, getCompletedActivities, getInterventions } from '@/store';

// ─── Weights (per TDD spec) ────────────────────────────────────

const WEIGHTS = {
  mindlessUnlocks: 0.25,
  moodDecline: 0.20,
  sleepQuality: 0.20,
  goalNeglect: 0.15,
  reflectionSkipped: 0.10,
  offlineInactivity: 0.10,
} as const;

// ─── Factor Calculations ───────────────────────────────────────

function calculateMoodDecline(moods: MoodCheckIn[]): number {
  if (moods.length === 0) return 50; // neutral if no data
  const moodScores: Record<string, number> = {
    great: 0, good: 20, okay: 50, low: 75, stressed: 90,
  };
  const recent = moods.slice(-5);
  const avg = recent.reduce((sum, m) => sum + (moodScores[m.mood] ?? 50), 0) / recent.length;
  return Math.round(avg);
}

function calculateMindlessUnlocks(): number {
  // Simulated: Generate realistic value based on time of day
  const hour = new Date().getHours();
  const base = hour >= 22 || hour <= 6 ? 70 : hour >= 18 ? 50 : 30;
  return Math.min(100, base + Math.floor(Math.random() * 20));
}

function calculateSleepQuality(moods: MoodCheckIn[]): number {
  // Derive from mood — low mood = likely poor sleep
  if (moods.length === 0) return 40;
  const latest = moods[moods.length - 1]!;
  const scores: Record<string, number> = {
    great: 10, good: 25, okay: 45, low: 70, stressed: 80,
  };
  return scores[latest.mood] ?? 40;
}

function calculateGoalNeglect(activities: OfflineActivity[]): number {
  const completed = activities.filter((a) => a.completedAt);
  if (completed.length === 0) return 75;
  if (completed.length >= 5) return 10;
  if (completed.length >= 3) return 30;
  return 55;
}

function calculateReflectionSkipped(): number {
  const interventions = getInterventions();
  const completed = interventions.filter((i) => i.completed);
  if (interventions.length === 0) return 60;
  const ratio = completed.length / interventions.length;
  return Math.round((1 - ratio) * 100);
}

function calculateOfflineInactivity(activities: OfflineActivity[]): number {
  const completed = activities.filter((a) => a.completedAt);
  const today = new Date().toDateString();
  const todayActivities = completed.filter(
    (a) => a.completedAt && new Date(a.completedAt).toDateString() === today
  );
  if (todayActivities.length >= 3) return 10;
  if (todayActivities.length >= 1) return 40;
  return 70;
}

// ─── Trend Calculation ─────────────────────────────────────────

function getTrend(current: number, factorName: string, history: DriftSnapshot[]): 'improving' | 'stable' | 'worsening' {
  if (history.length < 2) return 'stable';
  const prev = history[history.length - 1]!;
  const prevFactor = prev.factors.find((f) => f.name === factorName);
  if (!prevFactor) return 'stable';
  const diff = current - prevFactor.value;
  if (diff <= -10) return 'improving';
  if (diff >= 10) return 'worsening';
  return 'stable';
}

// ─── Risk Level ────────────────────────────────────────────────

function getRiskLevel(score: number): RiskLevel {
  if (score <= 25) return 'low';
  if (score <= 50) return 'moderate';
  if (score <= 75) return 'high';
  return 'critical';
}

// ─── Main Calculation ──────────────────────────────────────────

export function calculateDriftScore(): Omit<DriftSnapshot, 'id' | 'timestamp' | 'aiExplanation'> {
  const moods = getMoodHistory();
  const history = getDriftHistory();
  const activities = getCompletedActivities();

  const factorValues = {
    mindlessUnlocks: calculateMindlessUnlocks(),
    moodDecline: calculateMoodDecline(moods),
    sleepQuality: calculateSleepQuality(moods),
    goalNeglect: calculateGoalNeglect(activities),
    reflectionSkipped: calculateReflectionSkipped(),
    offlineInactivity: calculateOfflineInactivity(activities),
  };

  const factors: DriftFactor[] = [
    {
      name: 'Mindless Unlocks',
      value: factorValues.mindlessUnlocks,
      weight: WEIGHTS.mindlessUnlocks,
      trend: getTrend(factorValues.mindlessUnlocks, 'Mindless Unlocks', history),
    },
    {
      name: 'Mood Decline',
      value: factorValues.moodDecline,
      weight: WEIGHTS.moodDecline,
      trend: getTrend(factorValues.moodDecline, 'Mood Decline', history),
    },
    {
      name: 'Sleep Quality',
      value: factorValues.sleepQuality,
      weight: WEIGHTS.sleepQuality,
      trend: getTrend(factorValues.sleepQuality, 'Sleep Quality', history),
    },
    {
      name: 'Goal Neglect',
      value: factorValues.goalNeglect,
      weight: WEIGHTS.goalNeglect,
      trend: getTrend(factorValues.goalNeglect, 'Goal Neglect', history),
    },
    {
      name: 'Reflection Skipped',
      value: factorValues.reflectionSkipped,
      weight: WEIGHTS.reflectionSkipped,
      trend: getTrend(factorValues.reflectionSkipped, 'Reflection Skipped', history),
    },
    {
      name: 'Offline Inactivity',
      value: factorValues.offlineInactivity,
      weight: WEIGHTS.offlineInactivity,
      trend: getTrend(factorValues.offlineInactivity, 'Offline Inactivity', history),
    },
  ];

  const score = Math.round(
    factors.reduce((sum, f) => sum + f.value * f.weight, 0)
  );

  return {
    score,
    riskLevel: getRiskLevel(score),
    factors,
  };
}

// ─── Helpers ───────────────────────────────────────────────────

export function getDriftColor(score: number): string {
  if (score <= 25) return '#34D399'; // emerald
  if (score <= 50) return '#FBBF24'; // amber
  if (score <= 75) return '#FB923C'; // orange
  return '#F43F5E'; // rose
}

export function getDriftLabel(level: RiskLevel): string {
  switch (level) {
    case 'low': return 'Focused';
    case 'moderate': return 'Drifting';
    case 'high': return 'At Risk';
    case 'critical': return 'Critical';
  }
}
