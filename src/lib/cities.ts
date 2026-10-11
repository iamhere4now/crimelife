/**
 * The cities a detective can work in. Lagos is home; switching city shows
 * that city's own cases (and any Naija Files cases set in its state).
 */

import { CASES, regionOf } from "./cases";
import type { CrimeCase } from "./types";

export type CityId =
  | "lagos" | "abuja" | "kano" | "ibadan" | "portharcourt" | "ilorin" | "abeokuta" | "benin" | "aba" | "enugu"
  | "kaduna" | "katsina" | "gusau" | "birninkebbi" | "sokoto" | "bauchi" | "gombe" | "maiduguri" | "damaturu" | "dutse" | "makurdi" | "lokoja" | "lafia" | "minna" | "jos" | "yola" | "jalingo" | "onitsha" | "owerri" | "warri" | "yenagoa" | "uyo" | "calabar" | "abakaliki" | "adoekiti" | "akure" | "osogbo";

export interface City {
  id: CityId;
  name: string;
  state: string;
  /** A few real places the cases are set around. */
  landmarks: string[];
  /** Accent for its card. */
  color: string;
  tagline: string;
}

export const CITIES: City[] = [
  { id: "lagos", name: "Lagos", state: "Lagos", landmarks: ["Computer Village", "Balogun", "Lekki", "Third Mainland"], color: "#14161b", tagline: "Eko o ni baje. Where it all started." },
  { id: "abuja", name: "Abuja", state: "FCT", landmarks: ["Wuse Market", "Jabi Lake", "Maitama", "Garki"], color: "#1d6a3a", tagline: "Capital city, capital crimes." },
  { id: "kano", name: "Kano", state: "Kano", landmarks: ["Kofar Mata", "Kantin Kwari", "Kurmi Market", "Gidan Makama"], color: "#a3601c", tagline: "Ancient walls, old secrets." },
  { id: "ibadan", name: "Ibadan", state: "Oyo", landmarks: ["Mokola", "Dugbe", "Cocoa House", "Bodija"], color: "#8a3a1a", tagline: "Brown roofs, sharp tongues." },
  { id: "portharcourt", name: "Port Harcourt", state: "Rivers", landmarks: ["Mile One", "Trans-Amadi", "Boat Club", "GRA"], color: "#1d4a8a", tagline: "Garden City, oil money." },
  { id: "ilorin", name: "Ilorin", state: "Kwara", landmarks: ["Oja Oba", "Okelele", "Asa Dam", "Taiwo Road"], color: "#6a3a8a", tagline: "State of Harmony, until today." },
  { id: "abeokuta", name: "Abeokuta", state: "Ogun", landmarks: ["Olumo Rock", "Itoku", "Kuto", "Lafenwa"], color: "#3a5a8a", tagline: "Under the rock, everything hides." },
  { id: "benin", name: "Benin City", state: "Edo", landmarks: ["Igun Street", "Ring Road", "Uniben", "Oba Market"], color: "#8a1a2a", tagline: "Bronze, kings and Ring Road gist." },
  { id: "aba", name: "Aba", state: "Abia", landmarks: ["Ariaria", "Ngwa Road", "Ehi Road", "Cemetery Market"], color: "#2a6a6a", tagline: "Made in Aba. Faked in Aba too." },
  { id: "enugu", name: "Enugu", state: "Enugu", landmarks: ["Coal Camp", "Ogbete Market", "Milliken Hill", "Independence Layout"], color: "#3a3a3a", tagline: "Coal City, cold cases." },
  { id: "kaduna", name: "Kaduna", state: "Kaduna", landmarks: ["Refinery", "Kakuri", "Central Market", "Ahmadu Bello Way"], color: "#3a6a3a", tagline: "Old capital of the north, new tricks." },
  { id: "katsina", name: "Katsina", state: "Katsina", landmarks: ["Emir's Palace", "Gobarau Minaret", "Central Market", "Kofar Kaura"], color: "#8a5a2a", tagline: "Ancient walls, modern wahala." },
  { id: "gusau", name: "Gusau", state: "Zamfara", landmarks: ["Anka goldfields", "Gusau Dam", "Central Market", "Sokoto Road"], color: "#a8803a", tagline: "Gold in the ground, trouble above it." },
  { id: "birninkebbi", name: "Birnin Kebbi", state: "Kebbi", landmarks: ["Rice fields", "Argungu", "Emir's Palace", "Haliru Abdu Stadium"], color: "#6a8a3a", tagline: "Rice, fish and a famous pyramid." },
  { id: "sokoto", name: "Sokoto", state: "Sokoto", landmarks: ["Sultan's Palace", "Shehu Mosque", "Kara Market", "Airport Road"], color: "#2a6a5a", tagline: "Seat of the Caliphate." },
  { id: "bauchi", name: "Bauchi", state: "Bauchi", landmarks: ["Yankari", "Wikki Springs", "Central Market", "Emir's Palace"], color: "#5a7a3a", tagline: "Elephants, springs and secrets." },
  { id: "gombe", name: "Gombe", state: "Gombe", landmarks: ["Farmers' depot", "Tashan Dukku", "Gombe Line", "Pantami"], color: "#3a7a6a", tagline: "Jewel in the Savannah." },
  { id: "maiduguri", name: "Maiduguri", state: "Borno", landmarks: ["Monday Market", "Shehu's Palace", "Post Office", "Baga Road"], color: "#7a5a3a", tagline: "Home of Peace, hungry for justice." },
  { id: "damaturu", name: "Potiskum", state: "Yobe", landmarks: ["Grain store", "Cattle market", "Damaturu Road", "Fika"], color: "#8a6a3a", tagline: "Grain, cattle and clever rats." },
  { id: "dutse", name: "Dutse", state: "Jigawa", landmarks: ["Kiyawa Road", "Dutse Rock", "Emir's Palace", "Hadejia"], color: "#4a6a8a", tagline: "New city, dark streets." },
  { id: "makurdi", name: "Makurdi", state: "Benue", landmarks: ["Benue Bridge", "Wurukum", "Modern Market", "High Level"], color: "#2a6a3a", tagline: "Food basket of the nation." },
  { id: "lokoja", name: "Lokoja", state: "Kogi", landmarks: ["Confluence", "Mount Patti", "Lord Lugard's House", "Ganaja"], color: "#5a4a8a", tagline: "Where two rivers meet." },
  { id: "lafia", name: "Lafia", state: "Nasarawa", landmarks: ["Mining sites", "Lafia Market", "Emir's Palace", "Akwanga"], color: "#6a6a3a", tagline: "Home of solid minerals." },
  { id: "minna", name: "Minna", state: "Niger", landmarks: ["Paiko Road", "Shiroro", "Bosso", "Central Market"], color: "#3a5a7a", tagline: "Power state, big promises." },
  { id: "jos", name: "Jos", state: "Plateau", landmarks: ["Terminus", "Rayfield", "Bukuru", "Potato market"], color: "#4a6a5a", tagline: "Cool weather, hot cases." },
  { id: "yola", name: "Yola", state: "Adamawa", landmarks: ["Cattle market", "Jimeta", "Lamido's Palace", "Benue River"], color: "#8a6a4a", tagline: "Land of beauty, market of tricks." },
  { id: "jalingo", name: "Wukari", state: "Taraba", landmarks: ["Yam farms", "Wukari Palace", "Night market", "Mambilla"], color: "#5a7a4a", tagline: "Nature's gift, yam country." },
  { id: "onitsha", name: "Onitsha", state: "Anambra", landmarks: ["Bridgehead", "Main Market", "Upper Iweka", "Niger Bridge"], color: "#1d5a8a", tagline: "Light of the nation, busiest market." },
  { id: "owerri", name: "Owerri", state: "Imo", landmarks: ["House of Assembly", "Wetheral Road", "Douglas Road", "Ikenegbu"], color: "#6a3a6a", tagline: "Eastern heartland, entertainment capital." },
  { id: "warri", name: "Warri", state: "Delta", landmarks: ["Pipeline", "Effurun", "Okumagba", "Jakpa Road"], color: "#2a5a7a", tagline: "Warri no dey carry last." },
  { id: "yenagoa", name: "Yenagoa", state: "Bayelsa", landmarks: ["Creeks", "Swali Market", "Ox-Bow Lake", "Amarata"], color: "#1d6a8a", tagline: "Glory of all lands." },
  { id: "uyo", name: "Uyo", state: "Akwa Ibom", landmarks: ["Pension office", "Ibom Plaza", "Itam Market", "Ikot Ekpene Road"], color: "#3a6a8a", tagline: "Land of promise, clean streets." },
  { id: "calabar", name: "Calabar", state: "Cross River", landmarks: ["Carnival route", "Marina", "Watt Market", "Obudu"], color: "#8a2a5a", tagline: "People's paradise, carnival city." },
  { id: "abakaliki", name: "Abakaliki", state: "Ebonyi", landmarks: ["Rice mills", "Salt lakes", "Abakpa Market", "Ogoja Road"], color: "#5a6a2a", tagline: "Salt of the nation, rice of the east." },
  { id: "adoekiti", name: "Ado-Ekiti", state: "Ekiti", landmarks: ["Schools", "Fajuyi Park", "Oja Oba", "Ikere Road"], color: "#2a4a6a", tagline: "Fountain of knowledge." },
  { id: "akure", name: "Akure", state: "Ondo", landmarks: ["Oba Adesida Road", "Oja Oba", "Idanre Hills", "FUTA"], color: "#6a4a2a", tagline: "Sunshine state, shady stories." },
  { id: "osogbo", name: "Osogbo", state: "Osun", landmarks: ["Osun Grove", "Oja Oba", "Olaiya", "Ilesha Road"], color: "#8a6a2a", tagline: "State of the living spring." },
];

export const CITY_BY_ID = Object.fromEntries(CITIES.map((c) => [c.id, c])) as Record<CityId, City>;

const BY_STATE = Object.fromEntries(CITIES.map((c) => [c.state, c.id])) as Record<string, CityId>;

/** The city a case belongs to, or null for a Naija Files case in a state without its own city. */
export function cityOf(c: CrimeCase): CityId | null {
  return BY_STATE[regionOf(c).state] ?? null;
}

export function casesIn(city: CityId): CrimeCase[] {
  return CASES.filter((c) => cityOf(c) === city);
}
