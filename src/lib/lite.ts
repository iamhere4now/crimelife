/**
 * Lite mode: drawn scenes instead of 3D and no street recording. Easier on
 * data, battery and older phones. On by choice (Profile › App & data), or by
 * itself when the phone's Data Saver is on and the player hasn't chosen.
 */

const KEY = "crime-life:lite";

function chosen(): boolean | null {
  try {
    const v = localStorage.getItem(KEY);
    return v === "1" ? true : v === "0" ? false : null;
  } catch {
    return null;
  }
}

/** The phone asks sites to save data (Chrome on Android's Data Saver / Lite mode). */
export function saveDataOn() {
  if (typeof navigator === "undefined") return false;
  return !!(navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
}

export function isLite() {
  if (typeof window === "undefined") return false;
  return chosen() ?? saveDataOn();
}

/** True when lite mode is on only because of Data Saver. */
export const liteIsAuto = () => chosen() === null && saveDataOn();

export function setLite(on: boolean) {
  try {
    localStorage.setItem(KEY, on ? "1" : "0");
  } catch {
    // private mode: this visit only
  }
}
