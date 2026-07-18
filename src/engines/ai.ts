/* ═══════════════════════════════════════════════════════════════
   DRIFT AI Engine — Gemini Integration
   Handles all LLM calls: coaching, reflection, rewards, explanations.
   ═══════════════════════════════════════════════════════════════ */

import type {
  BehaviorProfile,
  FutureSelfProfile,
  DriftSnapshot,
  MoodCheckIn,
  CoachingResponse,
  ReflectionResponse,
  DriftExplanation,
  OfflineActivity,
  TriggerType,
} from '@/types';

// ─── API Call ──────────────────────────────────────────────────

async function callGemini(prompt: string): Promise<string> {
  try {
    const res = await fetch('/api/coach', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const data = await res.json() as { response: string };
    return data.response;
  } catch (error) {
    console.error('Gemini API error:', error);
    throw error;
  }
}

async function callGeminiJSON<T>(prompt: string): Promise<T> {
  const raw = await callGemini(prompt);
  // Extract JSON from response (handle markdown code blocks)
  const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, raw];
  const jsonStr = (jsonMatch[1] ?? raw).trim();
  return JSON.parse(jsonStr) as T;
}

// ─── System Prompt ─────────────────────────────────────────────

function getSystemContext(
  profile: BehaviorProfile | null,
  futureSelf: FutureSelfProfile | null,
): string {
  return `You are DRIFT's AI Coach — a warm, insightful behavioral coach grounded in behavioral science and psychology.

CORE PRINCIPLES:
- You explain behavior, never determine it.
- You NEVER shame, diagnose, manipulate, or create fear.
- You celebrate real life, not screen-time reductions.
- You use Habit Loop theory, Replacement Theory, and Identity Reinforcement.
- You are a coach, NEVER a therapist or doctor.
- You are concise — users should spend less than 1 minute reading your responses.
- You always reference the user's personal goals and future identity.

${profile ? `USER'S BEHAVIOR PROFILE:
- Primary Goal: ${profile.primaryGoal}
- Distractions: ${profile.distractions.join(', ')}
- Triggers: ${profile.triggers.join(', ')}
- Coaching Style: ${profile.coachingStyle}` : ''}

${futureSelf ? `USER'S FUTURE SELF:
- Aspirations: ${futureSelf.aspirations.join(', ')}
- Identity: "${futureSelf.identity}"` : ''}

Always respond with warmth, empathy, and actionable guidance. Keep responses short (2-4 sentences max).`;
}

// ─── Coaching ──────────────────────────────────────────────────

export async function getCoachingResponse(
  profile: BehaviorProfile | null,
  futureSelf: FutureSelfProfile | null,
  drift: DriftSnapshot | null,
  mood: MoodCheckIn | null,
  trigger: TriggerType,
): Promise<CoachingResponse> {
  const systemContext = getSystemContext(profile, futureSelf);

  const prompt = `${systemContext}

The user is experiencing a "${trigger}" trigger right now.
${mood ? `Their current mood is "${mood.mood}" with "${mood.energy}" energy.` : ''}
${drift ? `Their Drift Score is ${drift.score}/100 (${drift.riskLevel} risk).` : ''}

Generate a personalized coaching intervention. Follow the Trigger → Need → Replacement → Action framework.
Reference their future self aspirations when suggesting replacements.

Respond in this exact JSON format:
{
  "message": "A warm, personalized coaching message (2-3 sentences)",
  "trigger": "What triggered this moment",
  "need": "The underlying emotional need",
  "replacement": "A specific healthy replacement activity",
  "action": "One concrete next step they can take right now",
  "futureReference": "A brief reference to who they want to become"
}`;

  try {
    return await callGeminiJSON<CoachingResponse>(prompt);
  } catch {
    return getFallbackCoaching(trigger, futureSelf);
  }
}

// ─── Drift Explanation ─────────────────────────────────────────

export async function getDriftExplanation(
  profile: BehaviorProfile | null,
  futureSelf: FutureSelfProfile | null,
  drift: DriftSnapshot,
): Promise<DriftExplanation> {
  const systemContext = getSystemContext(profile, futureSelf);
  const topFactor = [...drift.factors].sort((a, b) => b.value * b.weight - a.value * a.weight)[0];

  const prompt = `${systemContext}

The user's current Drift Score is ${drift.score}/100 (${drift.riskLevel} risk).
The biggest contributing factor is "${topFactor?.name}" at ${topFactor?.value}/100.

All factors:
${drift.factors.map((f) => `- ${f.name}: ${f.value}/100 (${f.trend})`).join('\n')}

Explain WHY their attention is drifting in a compassionate, non-judgmental way.
Reference their future self goals.

Respond in this exact JSON format:
{
  "explanation": "A warm, insightful explanation of why drift is happening (2-3 sentences)",
  "primaryFactor": "The main contributing factor in plain language",
  "suggestion": "One gentle suggestion to address it"
}`;

  try {
    return await callGeminiJSON<DriftExplanation>(prompt);
  } catch {
    return {
      explanation: `Your attention seems to be drifting a bit, mainly due to ${topFactor?.name?.toLowerCase() ?? 'recent patterns'}. This is completely normal — what matters is that you noticed.`,
      primaryFactor: topFactor?.name ?? 'General drift',
      suggestion: 'Take a moment to check in with yourself and consider a brief offline activity.',
    };
  }
}

// ─── Weekly Reflection ─────────────────────────────────────────

export async function getWeeklyReflection(
  profile: BehaviorProfile | null,
  futureSelf: FutureSelfProfile | null,
  driftHistory: DriftSnapshot[],
  activities: OfflineActivity[],
  moods: MoodCheckIn[],
): Promise<ReflectionResponse> {
  const systemContext = getSystemContext(profile, futureSelf);

  const avgDrift = driftHistory.length > 0
    ? Math.round(driftHistory.reduce((s, d) => s + d.score, 0) / driftHistory.length)
    : 50;

  const completedActivities = activities.filter((a) => a.completedAt);

  const prompt = `${systemContext}

Generate a weekly reflection narrative. This week's data:
- Average Drift Score: ${avgDrift}/100
- Drift snapshots: ${driftHistory.length}
- Completed offline activities: ${completedActivities.length} (${completedActivities.map((a) => a.name).join(', ') || 'none'})
- Mood check-ins: ${moods.length}
- Mood trend: ${moods.length > 0 ? moods.map((m) => m.mood).join(' → ') : 'no data'}

Create a warm, narrative-style reflection (not charts). Celebrate real-life moments.
Reference their future self aspirations.

Respond in this exact JSON format:
{
  "narrative": "A warm, narrative paragraph summarizing their week (3-4 sentences)",
  "wins": ["Win 1", "Win 2", "Win 3"],
  "patterns": ["Pattern 1", "Pattern 2"],
  "nextFocus": "One clear focus for next week"
}`;

  try {
    return await callGeminiJSON<ReflectionResponse>(prompt);
  } catch {
    return {
      narrative: "This week was about building awareness. Every moment you checked in with yourself was a step toward the person you're becoming. Remember — progress isn't always linear, but your intention to grow is what matters most.",
      wins: ['Checked in with DRIFT', 'Showed self-awareness', 'Took time to reflect'],
      patterns: ['Evening tends to be your drift-prone time', 'You respond well to gentle reminders'],
      nextFocus: 'Try one offline activity each day this week',
    };
  }
}

// ─── Emotional Rewards ─────────────────────────────────────────

export async function getEmotionalReward(
  profile: BehaviorProfile | null,
  futureSelf: FutureSelfProfile | null,
  activity: OfflineActivity,
): Promise<string> {
  const systemContext = getSystemContext(profile, futureSelf);

  const prompt = `${systemContext}

The user just completed an offline activity: "${activity.name}" (${activity.category}) for ${activity.duration} minutes.

Generate a warm, emotional reward message that celebrates the LIFE they lived, not the screen time they saved.
Reference their future self aspirations.
Frame it as what they gained, not what they avoided.

Respond with ONLY the reward message string (1-2 sentences, no JSON).`;

  try {
    const reward = await callGemini(prompt);
    return reward.replace(/^["']|["']$/g, '').trim();
  } catch {
    return `You just invested ${activity.duration} minutes in your real life. That's ${activity.duration} minutes closer to the person you want to become. 🌟`;
  }
}

// ─── Fallbacks ─────────────────────────────────────────────────

function getFallbackCoaching(trigger: TriggerType, futureSelf: FutureSelfProfile | null): CoachingResponse {
  const identity = futureSelf?.identity ?? 'the person you want to become';
  const aspiration = futureSelf?.aspirations?.[0] ?? 'your goals';

  const fallbacks: Record<TriggerType, CoachingResponse> = {
    stress: {
      message: `I notice you're feeling stressed. That's your mind looking for relief — and that's okay. Instead of reaching for your phone, what if you took three deep breaths and stepped outside for 5 minutes?`,
      trigger: 'Stress',
      need: 'Emotional relief',
      replacement: 'A brief walk or breathing exercise',
      action: 'Take 3 deep breaths right now',
      futureReference: `Remember — ${identity}. This moment is practice.`,
    },
    boredom: {
      message: `Boredom is actually your creative mind asking for something meaningful. Instead of scrolling, this could be your chance to work on ${aspiration}.`,
      trigger: 'Boredom',
      need: 'Mental stimulation',
      replacement: `Work on ${aspiration}`,
      action: 'Spend 15 minutes on something creative',
      futureReference: `This is how you become ${identity}.`,
    },
    loneliness: {
      message: `Feeling lonely is a signal that you need real connection. Social media often makes this worse. Would you consider reaching out to someone you care about?`,
      trigger: 'Loneliness',
      need: 'Human connection',
      replacement: 'Call or text a friend',
      action: 'Send a message to someone you haven\'t talked to in a while',
      futureReference: `Building real relationships is part of becoming ${identity}.`,
    },
    fatigue: {
      message: `When you're tired, your phone becomes an easy escape. But what your body really needs is rest. Consider putting your phone in another room and resting for 20 minutes.`,
      trigger: 'Fatigue',
      need: 'Rest and recovery',
      replacement: 'A short rest or gentle stretch',
      action: 'Put your phone down and rest for 20 minutes',
      futureReference: `Rest is how you sustain the energy to become ${identity}.`,
    },
    anxiety: {
      message: `Anxiety makes us seek distraction, but mindless scrolling rarely helps. Try grounding yourself — notice 5 things you can see, 4 you can touch, 3 you can hear.`,
      trigger: 'Anxiety',
      need: 'Calm and grounding',
      replacement: '5-4-3-2-1 grounding exercise',
      action: 'Start the grounding exercise now',
      futureReference: `Managing anxiety is a strength that serves ${identity}.`,
    },
    procrastination: {
      message: `Procrastination is often about avoiding discomfort. What if you committed to just 5 minutes on the task? That's all — just start.`,
      trigger: 'Procrastination',
      need: 'Momentum',
      replacement: 'The 5-minute start technique',
      action: 'Work on your most important task for just 5 minutes',
      futureReference: `${identity} starts small and builds momentum.`,
    },
    habit: {
      message: `You've reached for your phone out of habit — not intention. This awareness is powerful. Take a breath and ask yourself: "What do I actually want right now?"`,
      trigger: 'Unconscious habit',
      need: 'Intentional presence',
      replacement: 'A moment of mindful awareness',
      action: 'Pause and ask yourself what you truly need right now',
      futureReference: `Awareness is the first step toward becoming ${identity}.`,
    },
    fomo: {
      message: `FOMO is your mind tricking you into thinking you're missing out. But the richest moments happen offline, in your own life. What's happening around you right now?`,
      trigger: 'Fear of missing out',
      need: 'Presence and contentment',
      replacement: 'Engage with your immediate surroundings',
      action: 'Notice one beautiful thing in your environment right now',
      futureReference: `${identity} finds joy in the present moment.`,
    },
  };

  return fallbacks[trigger] ?? fallbacks.stress;
}
