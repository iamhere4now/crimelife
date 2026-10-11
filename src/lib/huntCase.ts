/**
 * Where a sponsored hunt takes place: an outdoor scene in the sponsor's city
 * (streets have the most boards for their poster), Lagos for nationwide ones.
 */

import { kitOf } from "@/three/sceneKits";
import { setHuntCasePicker, type AdCity } from "./ads";
import { CASES } from "./cases";
import { cityOf } from "./cities";

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

export function huntCaseFor(city: AdCity, seed: string): string {
  const where = city === "all" ? "lagos" : city;
  const inCity = CASES.filter((c) => cityOf(c) === where);
  const outdoor = inCity.filter((c) => kitOf(c).backdrop.kind === "outdoor");
  const pool = outdoor.length ? outdoor : inCity.length ? inCity : CASES;
  return pool[hash(seed) % pool.length].id;
}

setHuntCasePicker(huntCaseFor);
