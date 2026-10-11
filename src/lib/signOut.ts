/**
 * Signing out on the game's own site: save the latest progress to the player's
 * cloud save first, then forget this device's copy, so the next person on a shared
 * phone can't open their detectives. Signing in again brings everything back.
 */

import { accountLogout } from "./cfRuntime";
import { writeCloudSave } from "./cloudSave";

const KEYS = ["crime-life:v3", "crime-life:v3:savedAt", "crime-life:open-case"];

export async function signOutDevice() {
  try {
    const raw = window.localStorage.getItem("crime-life:v3");
    if (raw) await writeCloudSave({ savedAt: Date.now(), state: JSON.parse(raw) });
  } catch {
    // still sign out: the save sent a moment ago is on the server
  }
  await accountLogout();
  for (const k of KEYS) {
    try {
      window.localStorage.removeItem(k);
    } catch {
      // nothing to clear
    }
  }
}
