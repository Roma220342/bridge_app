/** 45 → «45 с», 90 → «1:30» (ChickFocus shows m:ss; under a minute we say seconds). */
export function formatShort(s: number) {
  s = Math.max(0, Math.round(s));
  if (s < 60) return `${s} с`;
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

/** Timer face: always m:ss. */
export function formatClock(s: number) {
  s = Math.max(0, Math.ceil(s));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

/** «закінчиш о 07:42» */
export function endsAt(seconds: number, from = new Date()) {
  const d = new Date(from.getTime() + (seconds + 5) * 1000); // + 5 s countdown
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/** Ukrainian plural: 1 качка, 2 качки, 5 качок. */
export function plural(n: number, one: string, few: string, many: string) {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
  return many;
}
