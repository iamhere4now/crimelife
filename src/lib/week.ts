/**
 * The weekly tournament runs Monday 00:00 to Sunday 23:59, Nigerian time (WAT,
 * UTC+1), wherever the player is. Weeks are named like "2026-W42".
 */

const WAT = 60 * 60 * 1000;

/** Monday 00:00 WAT of the week containing `at`, as a UTC timestamp. */
export function weekStart(at = Date.now()) {
  const d = new Date(at + WAT);
  const day = (d.getUTCDay() + 6) % 7; // Monday = 0
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - day) - WAT;
}

/** ISO-style week id for the week containing `at`. */
export function weekId(at = Date.now()) {
  const start = weekStart(at) + WAT;
  const d = new Date(start + 3 * 86_400_000); // the Thursday decides the year
  const year = d.getUTCFullYear();
  const jan4 = Date.UTC(year, 0, 4);
  const firstMonday = jan4 - ((new Date(jan4).getUTCDay() + 6) % 7) * 86_400_000;
  const n = Math.round((start - firstMonday) / (7 * 86_400_000)) + 1;
  return `${year}-W${String(n).padStart(2, "0")}`;
}

export const lastWeekId = (at = Date.now()) => weekId(weekStart(at) - 1000);

/** "2d 5h" until the week ends. */
export function timeLeft(at = Date.now()) {
  const ms = weekStart(at) + 7 * 86_400_000 - at;
  const d = Math.floor(ms / 86_400_000);
  const h = Math.floor((ms % 86_400_000) / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  return d ? `${d}d ${h}h` : h ? `${h}h ${m}m` : `${m}m`;
}
