// Local data and the plank rules (concept.md §7, screens.md §3). Saved to AsyncStorage.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';

export type Plank = {
  date: string; // YYYY-MM-DD, local
  planned: number; // s
  held: number; // s
  full: boolean;
  ducks: number;
  leaves: number;
  counted: boolean; // first plank of the day moves the plan
};

type State = {
  plan: number; // s, the automatic plan for the next counted plank
  leaves: number;
  planks: Plank[];
};

const KEY = 'bridge/v1';
const PLAN_MIN = 15;
export const PLAN_CAP = 180;
export const CUSTOM_MAX = 600;
export const DUCK_EVERY = 7; // s, concept §7.2
export const CROSSING = 15.8; // s, edge to edge
const DAILY_LEAF_CAP = 30;
const FULL_BONUS = 5;

let state: State = { plan: 45, leaves: 0, planks: [] };
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
  AsyncStorage.setItem(KEY, JSON.stringify(state)).catch(() => {});
}

export async function loadStore() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw) state = { ...state, ...JSON.parse(raw) };
  } catch {}
  listeners.forEach((l) => l());
}

export function useStore<T>(pick: (s: State) => T): T {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => pick(state),
  );
}

export const today = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** Ducks for a plank of `total` s: one every 7 s, the last steps off at 0:00. */
export function duckCount(total: number) {
  const crossing = Math.min(CROSSING, total);
  return Math.floor((total - crossing) / DUCK_EVERY) + 1;
}

/** Ducks that already reached the far edge at second `t`. */
export function ducksCrossed(total: number, t: number) {
  const n = duckCount(total);
  const crossing = Math.min(CROSSING, total);
  const firstSpawn = total - crossing - DUCK_EVERY * (n - 1);
  let crossed = 0;
  for (let i = 0; i < n; i++) if (firstSpawn + DUCK_EVERY * i + crossing <= t + 0.001) crossed++;
  return crossed;
}

const round5 = (s: number) => Math.floor(s / 5) * 5;

/** Next automatic plan (concept §7.1). */
function nextPlan(plan: number, full: boolean, held: number, countedDays: number) {
  if (full) {
    const rest = countedDays > 0 && countedDays % 7 === 0; // every 7th day: no increase
    return Math.min(PLAN_CAP, rest ? plan : plan + 5);
  }
  return Math.max(PLAN_MIN, Math.min(plan, round5(held + 5)));
}

export function finishPlank({ planned, held, auto }: { planned: number; held: number; auto: boolean }) {
  const full = held >= planned;
  const ducks = full ? duckCount(planned) : ducksCrossed(planned, held);
  const date = today();
  const earnedToday = state.planks.filter((p) => p.date === date).reduce((a, p) => a + p.leaves, 0);
  const raw = ducks + (full ? FULL_BONUS : 0);
  const leaves = Math.max(0, Math.min(raw, DAILY_LEAF_CAP - earnedToday));
  const counted = auto && !state.planks.some((p) => p.date === date && p.counted);
  const prevPlan = state.plan;
  const countedDays = new Set(state.planks.filter((p) => p.counted).map((p) => p.date)).size + 1;
  const plank: Plank = { date, planned, held: Math.round(held), full, ducks, leaves, counted };
  state = {
    ...state,
    leaves: state.leaves + leaves,
    plan: counted ? nextPlan(prevPlan, full, held, countedDays) : prevPlan,
    planks: [...state.planks, plank],
  };
  emit();
  return { ...plank, nextPlan: state.plan };
}

/** For the time sheet card «Як росте план»: the plan now and tomorrow's plan if today's plank is held. */
export function planPreview(s: State) {
  const date = today();
  const countedToday = s.planks.some((p) => p.date === date && p.counted);
  if (countedToday) return { today: s.plan, tomorrow: s.plan };
  const countedDays = new Set(s.planks.filter((p) => p.counted).map((p) => p.date)).size + 1;
  return { today: s.plan, tomorrow: nextPlan(s.plan, true, s.plan, countedDays) };
}

/** Distinct days with a plank, most recent last. */
export function plankDays(s: State) {
  return [...new Set(s.planks.map((p) => p.date))];
}
