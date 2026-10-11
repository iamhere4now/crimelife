/**
 * State packs for the case generator: each state's well-known places, local
 * products, names, nickname and colours. The generator (stateGames.ts) sets
 * its storylines in these places so every state's cases feel local.
 */

import type { MusicStyle } from "../types";

export type PlaceKind =
  | "market" | "motorpark" | "palace" | "rocks" | "hills" | "falls" | "lake" | "waterfront" | "beach"
  | "park" | "reserve" | "campus" | "stadium" | "museum" | "mall" | "hotel" | "office" | "factory"
  | "farm" | "bridge" | "square" | "craft";

export interface Place {
  name: string;
  kind: PlaceKind;
}

type Pool = "hausa" | "kanuri" | "fulani" | "yoruba" | "igbo" | "edo" | "urhobo" | "ijaw" | "efik" | "tiv" | "idoma" | "nupe" | "berom";

export interface StatePack {
  /** Must match the state on a city in lib/cities. */
  state: string;
  /** Short key for case ids. */
  key: string;
  nickname: string;
  colors: { a: string; b: string };
  music: MusicStyle;
  places: Place[];
  products: string[];
  /** Name pools, most common first. */
  pools: Pool[];
}

const p = (name: string, kind: PlaceKind): Place => ({ name, kind });

export const NAMES: Record<Pool, { m: string[]; f: string[]; last: string[] }> = {
  hausa: {
    m: ["Abubakar", "Sani", "Musa", "Ibrahim", "Bello", "Usman", "Aliyu", "Garba", "Kabiru", "Nasiru", "Yusuf", "Haruna"],
    f: ["Aisha", "Hauwa", "Zainab", "Fatima", "Hadiza", "Binta", "Amina", "Rakiya", "Maryam", "Hafsat"],
    last: ["Abdullahi", "Lawal", "Danjuma", "Bala", "Sule", "Idris", "Yakubu", "Umar", "Shehu", "Tanko", "Gambo", "Isa"],
  },
  kanuri: { m: ["Babagana", "Modu", "Bukar", "Kyari", "Goni", "Lawan"], f: ["Falmata", "Kellu", "Fanna", "Yagana"], last: ["Kolo", "Gana", "Mustapha", "Zanna", "Bulama", "Mai"] },
  fulani: { m: ["Adamu", "Jibril", "Buba", "Hamman", "Bappa"], f: ["Jummai", "Ladi", "Asta", "Dije"], last: ["Jalo", "Ardo", "Bello", "Sambo", "Dahiru"] },
  yoruba: {
    m: ["Tunde", "Segun", "Kunle", "Femi", "Bayo", "Dapo", "Wale", "Gbenga", "Tayo", "Sola", "Lanre", "Yemi"],
    f: ["Funmi", "Yetunde", "Bisi", "Kemi", "Ronke", "Toyin", "Titi", "Bukola", "Shade", "Folake"],
    last: ["Adeyemi", "Ogunleye", "Akinola", "Olawale", "Adebayo", "Ojo", "Oladipo", "Afolabi", "Ogundipe", "Alabi", "Ajayi", "Oyelaran"],
  },
  igbo: {
    m: ["Chinedu", "Emeka", "Obinna", "Ikenna", "Chukwudi", "Uche", "Nnamdi", "Kelechi", "Ifeanyi", "Chidi"],
    f: ["Ngozi", "Chioma", "Adaeze", "Nneka", "Amaka", "Ifeoma", "Uju", "Ebere", "Chinyere", "Obiageli"],
    last: ["Okafor", "Eze", "Nwosu", "Okeke", "Obi", "Nwachukwu", "Okonkwo", "Uzor", "Onyeka", "Anyanwu", "Ibe", "Agu"],
  },
  edo: { m: ["Osaro", "Osagie", "Efosa", "Ehis", "Iyobosa", "Eghosa"], f: ["Osas", "Ivie", "Uyi", "Omosede", "Efe"], last: ["Omoruyi", "Ehigiator", "Aigbe", "Edosomwan", "Idahosa", "Ogbebor"] },
  urhobo: { m: ["Ejiro", "Oghenekaro", "Tega", "Ovie", "Onome"], f: ["Ese", "Oghenetega", "Rukevwe", "Mamuyovwi"], last: ["Ighorodje", "Omonigho", "Erhire", "Akpofure", "Okiemute"] },
  ijaw: { m: ["Preye", "Tari", "Ebi", "Tonye", "Ayibatonye", "Ebikabowei"], f: ["Ebiere", "Tamara", "Boma", "Ere", "Timi"], last: ["Ebiye", "Dikibo", "Okoko", "Tuoyo", "Seiyefa", "Amakiri"] },
  efik: { m: ["Etim", "Ekpo", "Bassey", "Edet", "Effiong", "Aniekan"], f: ["Imaobong", "Ekaette", "Uduak", "Itoro", "Arit", "Eno"], last: ["Ekpenyong", "Udoh", "Archibong", "Essien", "Inyang", "Okon"] },
  tiv: { m: ["Terver", "Aondona", "Orduen", "Tersoo", "Iorliam"], f: ["Doosuur", "Mnena", "Ngodoo", "Seember"], last: ["Akaa", "Ityav", "Hembe", "Shija", "Iorhemen"] },
  idoma: { m: ["Ochai", "Ojochide", "Ameh", "Ocholi", "Agbo"], f: ["Ene", "Ufedo", "Ojonugwa", "Onyeje"], last: ["Abah", "Idakwo", "Ogwuche", "Adejoh", "Onoja"] },
  nupe: { m: ["Ndagi", "Ndako", "Baba", "Jiya", "Kolo"], f: ["Nnadzu", "Hajara", "Fatsuma"], last: ["Jiya", "Kolo", "Gana", "Ndayako", "Mahmud"] },
  berom: { m: ["Dachung", "Pam", "Gyang", "Davou", "Choji"], f: ["Lami", "Nanle", "Rifkatu", "Kaneng"], last: ["Dalyop", "Choji", "Bot", "Mangut", "Pam"] },
};

export const PACKS: StatePack[] = [
  {
    state: "FCT", key: "abj", nickname: "Centre of Unity", colors: { a: "#1d6a3a", b: "#e6b422" }, music: "abuja", pools: ["hausa", "igbo", "yoruba"],
    products: ["suya", "zobo drinks", "phone accessories", "fresh bread", "designer perfume"],
    places: [p("Wuse Market", "market"), p("Millennium Park", "park"), p("Jabi Lake", "lake"), p("Utako Motor Park", "motorpark"), p("Zuma Rock view", "rocks"), p("Eagle Square", "square"), p("National Stadium", "stadium"), p("Garki Area 11 shops", "mall"), p("Maitama hotel", "hotel"), p("Federal Secretariat", "office"), p("Jabi Lake Mall", "mall")],
  },
  {
    state: "Kano", key: "kano", nickname: "Centre of Commerce", colors: { a: "#a8401f", b: "#e6b422" }, music: "sahel", pools: ["hausa", "fulani"],
    products: ["groundnuts", "dyed indigo cloth", "leather bags", "kola nuts", "tomatoes"],
    places: [p("Kurmi Market", "market"), p("Kofar Mata dye pits", "craft"), p("Emir's Palace (Gidan Rumfa)", "palace"), p("Kano City Walls", "rocks"), p("Kantin Kwari textile market", "market"), p("Sabon Gari Market", "market"), p("Dala Hill", "hills"), p("Bayero University", "campus"), p("Sani Abacha Stadium", "stadium"), p("Kano Zoo", "reserve"), p("Kano groundnut depot", "factory")],
  },
  {
    state: "Oyo", key: "oyo", nickname: "Pace Setter State", colors: { a: "#7a3a1d", b: "#53a03a" }, music: "fuji", pools: ["yoruba"],
    products: ["elubo (yam flour)", "cocoa beans", "aso-oke cloth", "kola nuts", "ofada rice"],
    places: [p("Bower's Tower", "hills"), p("Cocoa House", "office"), p("Dugbe Market", "market"), p("Bodija Market", "market"), p("University of Ibadan", "campus"), p("Agodi Gardens", "park"), p("Mapo Hall", "square"), p("Iwo Road Motor Park", "motorpark"), p("Lekan Salami Stadium", "stadium"), p("Old Oyo National Park", "reserve")],
  },
  {
    state: "Rivers", key: "riv", nickname: "Treasure Base of the Nation", colors: { a: "#1d4a8a", b: "#1aa0a0" }, music: "rivers", pools: ["ijaw", "igbo"],
    products: ["fresh fish", "periwinkle", "generator parts", "diesel", "plantain chips"],
    places: [p("Port Harcourt Waterfront", "waterfront"), p("Mile One Market", "market"), p("Pleasure Park", "park"), p("Isaac Boro Park", "park"), p("Creek Road Market", "market"), p("Rumuokoro Motor Park", "motorpark"), p("University of Port Harcourt", "campus"), p("Trans-Amadi warehouse", "factory"), p("Liberation Stadium", "stadium"), p("Bonny Island jetty", "waterfront")],
  },
  {
    state: "Kwara", key: "kwa", nickname: "State of Harmony", colors: { a: "#1d6a6a", b: "#c06a1a" }, music: "fuji", pools: ["yoruba", "hausa", "nupe"],
    products: ["clay pots", "shea butter", "rams", "locust beans", "aso-oke"],
    places: [p("Emir's Palace, Ilorin", "palace"), p("Oja Oba Market", "market"), p("Ipata Market", "market"), p("Okelele potters' quarter", "craft"), p("University of Ilorin", "campus"), p("Owu Falls", "falls"), p("Esie Museum", "museum"), p("Taiwo Road", "square"), p("Kwara Hotel", "hotel"), p("Ilorin Metropolitan Square", "square")],
  },
  {
    state: "Ogun", key: "ogun", nickname: "Gateway State", colors: { a: "#2a3a8a", b: "#3aa0c0" }, music: "juju", pools: ["yoruba"],
    products: ["adire cloth", "kola nuts", "garri", "palm oil", "indigo dye"],
    places: [p("Olumo Rock", "rocks"), p("Itoku Adire Market", "market"), p("Kuto Market", "market"), p("Centenary Hall, Ake", "museum"), p("Ake Palace", "palace"), p("Kuto Motor Park", "motorpark"), p("FUNAAB campus", "campus"), p("Ogun River bank", "lake"), p("Lafenwa", "square"), p("Panseke", "square")],
  },
  {
    state: "Edo", key: "edo", nickname: "Heartbeat of the Nation", colors: { a: "#8a1d1d", b: "#c08a2a" }, music: "benin", pools: ["edo"],
    products: ["bronze castings", "coral beads", "plantain", "garri", "rubber"],
    places: [p("Oba's Palace", "palace"), p("Igun Street bronze casters", "craft"), p("National Museum, Benin", "museum"), p("King's Square (Ring Road)", "square"), p("Oba Market", "market"), p("New Benin Market", "market"), p("University of Benin", "campus"), p("Ogba Zoo", "reserve"), p("Uselu Market", "market"), p("Benin Moat", "hills")],
  },
  {
    state: "Abia", key: "abia", nickname: "God's Own State", colors: { a: "#1d6a3a", b: "#c0182b" }, music: "highlife", pools: ["igbo"],
    products: ["made-in-Aba shoes", "leather bags", "palm oil", "fabrics", "cosmetics"],
    places: [p("Ariaria International Market", "market"), p("Ahia Ohuru (New Market)", "market"), p("Ngwa Road", "square"), p("Enyimba Stadium", "stadium"), p("National War Museum, Umuahia", "museum"), p("Osisioma junction", "motorpark"), p("Aba shoe factory", "factory"), p("Umuahia Main Market", "market"), p("Abia State University", "campus")],
  },
  {
    state: "Enugu", key: "enu", nickname: "Coal City State", colors: { a: "#2a2a2a", b: "#3a8a4a" }, music: "highlife", pools: ["igbo"],
    products: ["coal", "okpa", "palm wine", "abacha", "ugba"],
    places: [p("Coal Camp", "market"), p("Ogbete Main Market", "market"), p("Polo Park Mall", "mall"), p("Okpara Square", "square"), p("Milliken Hill", "hills"), p("Ngwo Pine Forest", "reserve"), p("Nike Lake Resort", "lake"), p("Hotel Presidential", "hotel"), p("University of Nigeria, Enugu Campus", "campus"), p("Abakpa Market", "market")],
  },
  {
    state: "Kaduna", key: "kad", nickname: "Centre of Learning", colors: { a: "#3a6a3a", b: "#c0a01a" }, music: "sahel", pools: ["hausa", "fulani"],
    products: ["ginger", "textiles", "maize", "beans", "tomatoes"],
    places: [p("Kaduna Central Market", "market"), p("Lugard Hall", "office"), p("Kajuru Castle", "palace"), p("Murtala Square", "square"), p("Ahmadu Bello Stadium", "stadium"), p("Gamji Gate Park", "park"), p("Kaduna National Museum", "museum"), p("Kawo Motor Park", "motorpark"), p("Kakuri textile mill", "factory"), p("Kaduna Polytechnic", "campus")],
  },
  {
    state: "Katsina", key: "kat", nickname: "Home of Hospitality", colors: { a: "#8a5a2a", b: "#2a6a8a" }, music: "sahel", pools: ["hausa", "fulani"],
    products: ["groundnuts", "leather", "millet", "cotton", "beans"],
    places: [p("Gobarau Minaret", "palace"), p("Emir's Palace, Katsina", "palace"), p("Katsina Central Market", "market"), p("Kofar Kaura", "square"), p("Kusugu Well, Daura", "rocks"), p("Katsina Polo Ground", "stadium"), p("Umaru Musa Yar'Adua University", "campus"), p("Katsina motor park", "motorpark"), p("Funtua cotton mill", "factory")],
  },
  {
    state: "Zamfara", key: "zam", nickname: "Farming is Our Pride", colors: { a: "#a8803a", b: "#3a6a3a" }, music: "sahel", pools: ["hausa", "fulani"],
    products: ["gold dust", "cotton", "millet", "tobacco", "onions"],
    places: [p("Gusau Central Market", "market"), p("Gusau Dam", "lake"), p("Emir's Palace, Gusau", "palace"), p("Kaura Namoda", "square"), p("Sokoto Road motor park", "motorpark"), p("Gusau grain store", "factory"), p("Federal University Gusau", "campus"), p("Bakura farms", "farm")],
  },
  {
    state: "Kebbi", key: "keb", nickname: "Land of Equity", colors: { a: "#6a8a3a", b: "#1d6a8a" }, music: "sahel", pools: ["hausa", "fulani"],
    products: ["rice", "fish", "onions", "beans", "dried pepper"],
    places: [p("Argungu festival grounds", "lake"), p("Kanta Museum, Argungu", "museum"), p("Birnin Kebbi Central Market", "market"), p("Emir's Palace, Birnin Kebbi", "palace"), p("Haliru Abdu Stadium", "stadium"), p("Suru rice fields", "farm"), p("Kebbi rice mill", "factory"), p("Birnin Kebbi motor park", "motorpark")],
  },
  {
    state: "Sokoto", key: "sok", nickname: "Seat of the Caliphate", colors: { a: "#2a6a5a", b: "#c0a01a" }, music: "sahel", pools: ["hausa", "fulani"],
    products: ["rams", "leather", "millet", "onions", "hides and skins"],
    places: [p("Sultan's Palace", "palace"), p("Kara Market", "market"), p("Sokoto Central Market", "market"), p("Giginya Memorial Stadium", "stadium"), p("Goronyo Dam", "lake"), p("Usmanu Danfodiyo University", "campus"), p("Sokoto tannery", "factory"), p("Sokoto motor park", "motorpark")],
  },
  {
    state: "Bauchi", key: "bau", nickname: "Pearl of Tourism", colors: { a: "#5a7a3a", b: "#c06a1a" }, music: "sahel", pools: ["hausa", "fulani"],
    products: ["honey", "cattle", "tomatoes", "groundnut oil", "maize"],
    places: [p("Yankari Game Reserve", "reserve"), p("Wikki Warm Springs", "falls"), p("Sumu Wildlife Park", "reserve"), p("Bauchi Central Market", "market"), p("Emir's Palace, Bauchi", "palace"), p("Abubakar Tafawa Balewa Stadium", "stadium"), p("ATBU campus", "campus"), p("Bauchi motor park", "motorpark")],
  },
  {
    state: "Gombe", key: "gom", nickname: "Jewel in the Savannah", colors: { a: "#3a7a6a", b: "#c0a01a" }, music: "sahel", pools: ["hausa", "fulani"],
    products: ["groundnut oil", "cotton", "sorghum", "beans", "cattle"],
    places: [p("Gombe Main Market", "market"), p("Pantami Stadium", "stadium"), p("Dadin Kowa Dam", "lake"), p("Emir's Palace, Gombe", "palace"), p("Tula hills", "hills"), p("Gombe Line", "square"), p("Federal University Kashere", "campus"), p("Gombe motor park", "motorpark")],
  },
  {
    state: "Borno", key: "bor", nickname: "Home of Peace", colors: { a: "#7a5a3a", b: "#1d6a8a" }, music: "sahel", pools: ["kanuri", "hausa"],
    products: ["dried fish", "gum arabic", "dates", "beans", "cattle"],
    places: [p("Monday Market", "market"), p("Shehu's Palace", "palace"), p("Kyarimi Park", "reserve"), p("Baga Road fish market", "market"), p("University of Maiduguri", "campus"), p("Ramat Square", "square"), p("Maiduguri motor park", "motorpark"), p("Lake Chad shore", "lake")],
  },
  {
    state: "Yobe", key: "yob", nickname: "Pride of the Sahel", colors: { a: "#8a6a3a", b: "#3a6a3a" }, music: "sahel", pools: ["kanuri", "hausa", "fulani"],
    products: ["dates", "cattle", "millet", "gum arabic", "groundnuts"],
    places: [p("Potiskum Cattle Market", "market"), p("Damaturu Central Market", "market"), p("Dufuna Canoe site", "museum"), p("Gashua palace", "palace"), p("Nguru wetlands", "lake"), p("Yobe State University", "campus"), p("Damaturu motor park", "motorpark"), p("Potiskum grain store", "factory")],
  },
  {
    state: "Jigawa", key: "jig", nickname: "The New World", colors: { a: "#4a6a8a", b: "#c0a01a" }, music: "sahel", pools: ["hausa", "fulani"],
    products: ["sesame", "millet", "solar lamps", "groundnuts", "hibiscus"],
    places: [p("Dutse Rock", "rocks"), p("Emir's Palace, Dutse", "palace"), p("Hadejia-Nguru Wetlands", "lake"), p("Birnin Kudu rock paintings", "rocks"), p("Dutse Central Market", "market"), p("Federal University Dutse", "campus"), p("Kiyawa Road", "square"), p("Hadejia motor park", "motorpark")],
  },
  {
    state: "Benue", key: "bnu", nickname: "Food Basket of the Nation", colors: { a: "#2a6a3a", b: "#e2730a" }, music: "plateau", pools: ["tiv", "idoma"],
    products: ["yams", "oranges", "soybeans", "rice", "sesame"],
    places: [p("Benue Bridge", "bridge"), p("Wurukum Market", "market"), p("Makurdi Modern Market", "market"), p("High Level", "square"), p("Federal University of Agriculture, Makurdi", "campus"), p("Aper Aku Stadium", "stadium"), p("Benue riverside", "waterfront"), p("Makurdi yam depot", "farm")],
  },
  {
    state: "Kogi", key: "kog", nickname: "Confluence State", colors: { a: "#5a4a8a", b: "#1d6a8a" }, music: "plateau", pools: ["idoma", "yoruba", "hausa"],
    products: ["cashew nuts", "coal", "fish", "yams", "palm oil"],
    places: [p("Niger–Benue Confluence", "waterfront"), p("Mount Patti", "hills"), p("Lord Lugard's House", "museum"), p("Lokoja Central Market", "market"), p("Ganaja junction", "motorpark"), p("Lokoja cenotaph", "square"), p("Federal University Lokoja", "campus"), p("Okene market", "market")],
  },
  {
    state: "Nasarawa", key: "nas", nickname: "Home of Solid Minerals", colors: { a: "#6a6a3a", b: "#1d6a8a" }, music: "plateau", pools: ["hausa", "idoma"],
    products: ["salt", "cassava", "tin ore", "yams", "sesame"],
    places: [p("Farin Ruwa Falls", "falls"), p("Lafia Central Market", "market"), p("Emir's Palace, Lafia", "palace"), p("Keffi market", "market"), p("Akwanga junction", "motorpark"), p("Doma Dam", "lake"), p("Federal University Lafia", "campus"), p("Keana salt ponds", "farm")],
  },
  {
    state: "Niger", key: "ngr", nickname: "Power State", colors: { a: "#3a5a7a", b: "#c0a01a" }, music: "sahel", pools: ["nupe", "hausa"],
    products: ["rice", "Bida brassware", "shea butter", "yams", "fish"],
    places: [p("Zuma Rock", "rocks"), p("Gurara Falls", "falls"), p("Kainji Lake National Park", "reserve"), p("Shiroro Dam", "lake"), p("Minna Central Market", "market"), p("Bida brass and glass quarter", "craft"), p("Paiko motor park", "motorpark"), p("Bosso campus (FUT Minna)", "campus")],
  },
  {
    state: "Plateau", key: "pla", nickname: "Home of Peace and Tourism", colors: { a: "#4a6a5a", b: "#8a3a6a" }, music: "plateau", pools: ["berom", "hausa"],
    products: ["Irish potatoes", "strawberries", "cabbages", "tin ore", "carrots"],
    places: [p("Jos Wildlife Park", "reserve"), p("Rayfield", "lake"), p("Terminus Market", "market"), p("Shere Hills", "hills"), p("Assop Falls", "falls"), p("Riyom Rock", "rocks"), p("National Museum, Jos", "museum"), p("Jos Polo Field", "stadium"), p("University of Jos", "campus"), p("Bukuru market", "market")],
  },
  {
    state: "Adamawa", key: "ada", nickname: "Land of Beauty", colors: { a: "#8a6a4a", b: "#2a6a3a" }, music: "sahel", pools: ["fulani", "hausa"],
    products: ["cattle", "sugarcane", "honey", "groundnuts", "fish"],
    places: [p("Jimeta Modern Market", "market"), p("Lamido's Palace", "palace"), p("Sukur cultural landscape", "hills"), p("Mandara Mountains", "rocks"), p("Yola cattle market", "market"), p("American University of Nigeria", "campus"), p("Jimeta bridge", "bridge"), p("Benue River at Yola", "waterfront")],
  },
  {
    state: "Taraba", key: "tar", nickname: "Nature's Gift to the Nation", colors: { a: "#5a7a4a", b: "#1d6a8a" }, music: "plateau", pools: ["tiv", "hausa", "fulani"],
    products: ["Mambilla tea", "yams", "cattle", "coffee", "honey"],
    places: [p("Mambilla Plateau", "hills"), p("Gashaka-Gumti National Park", "reserve"), p("Jalingo Central Market", "market"), p("Aku Uka's palace, Wukari", "palace"), p("Wukari yam market", "market"), p("Taraba State University", "campus"), p("Mambilla tea estate", "farm"), p("Jalingo motor park", "motorpark")],
  },
  {
    state: "Anambra", key: "ana", nickname: "Light of the Nation", colors: { a: "#1d5a8a", b: "#c0182b" }, music: "highlife", pools: ["igbo"],
    products: ["spare parts", "fabrics", "palm oil", "phones", "pharmaceuticals"],
    places: [p("Onitsha Main Market", "market"), p("Upper Iweka", "motorpark"), p("Niger Bridge", "bridge"), p("Agulu Lake", "lake"), p("Ogbunike Caves", "rocks"), p("Nnamdi Azikiwe University", "campus"), p("Eke Awka market", "market"), p("Igbo-Ukwu museum", "museum"), p("Nnewi auto parts market", "market"), p("Onitsha waterside", "waterfront")],
  },
  {
    state: "Imo", key: "imo", nickname: "Eastern Heartland", colors: { a: "#6a3a6a", b: "#1d6a3a" }, music: "highlife", pools: ["igbo"],
    products: ["palm oil", "ugu leaves", "kola nuts", "garri", "palm wine"],
    places: [p("Oguta Lake", "lake"), p("Douglas Road", "square"), p("Wetheral Road", "square"), p("Mbari Cultural Centre", "museum"), p("Imo Concorde Hotel", "hotel"), p("Dan Anyiam Stadium", "stadium"), p("Owerri Relief Market", "market"), p("Ekeukwu Owerri market", "market"), p("Federal University of Technology, Owerri", "campus")],
  },
  {
    state: "Delta", key: "del", nickname: "The Big Heart", colors: { a: "#2a5a7a", b: "#c06a1a" }, music: "rivers", pools: ["urhobo", "igbo", "ijaw"],
    products: ["palm oil", "fresh fish", "garri", "plantain", "starch"],
    places: [p("Warri Main Market", "market"), p("Effurun Roundabout", "motorpark"), p("Jakpa Road", "square"), p("Asaba Cable Point", "waterfront"), p("Niger Bridge head, Asaba", "bridge"), p("Delta State University, Abraka", "campus"), p("Ogbe-Ijoh waterside", "waterfront"), p("Effurun mall", "mall"), p("Abraka river beach", "beach")],
  },
  {
    state: "Bayelsa", key: "bay", nickname: "Glory of All Lands", colors: { a: "#1d6a8a", b: "#3aa05a" }, music: "rivers", pools: ["ijaw"],
    products: ["fresh fish", "periwinkle", "plantain", "palm oil", "canoes"],
    places: [p("Swali Market", "market"), p("Ox-Bow Lake", "lake"), p("Peace Park, Yenagoa", "park"), p("Oloibiri oil well site", "museum"), p("Akassa beach", "beach"), p("Brass jetty", "waterfront"), p("Niger Delta University, Amassoma", "campus"), p("Yenagoa waterside", "waterfront")],
  },
  {
    state: "Akwa Ibom", key: "akw", nickname: "Land of Promise", colors: { a: "#3a6a8a", b: "#c0a01a" }, music: "calabar", pools: ["efik"],
    products: ["palm oil", "raffia baskets", "edikang ikong vegetables", "fresh fish", "garri"],
    places: [p("Ibom Plaza", "square"), p("Itam Market", "market"), p("Godswill Akpabio Stadium", "stadium"), p("Ibeno Beach", "beach"), p("Ikot Ekpene raffia market", "craft"), p("Oron Museum", "museum"), p("Uyo Village Road", "square"), p("Ibom Icon Hotel", "hotel"), p("University of Uyo", "campus")],
  },
  {
    state: "Cross River", key: "crs", nickname: "The People's Paradise", colors: { a: "#8a2a5a", b: "#e6b422" }, music: "calabar", pools: ["efik"],
    products: ["cocoa", "afang leaves", "bananas", "palm oil", "crayfish"],
    places: [p("Calabar Carnival route", "square"), p("Marina Resort", "waterfront"), p("Watt Market", "market"), p("Obudu Mountain Resort", "hills"), p("Tinapa", "mall"), p("Slave History Museum", "museum"), p("Drill Ranch, Afi", "reserve"), p("Calabar Botanical Garden", "park"), p("Kwa Falls", "falls"), p("University of Calabar", "campus")],
  },
  {
    state: "Ebonyi", key: "ebo", nickname: "Salt of the Nation", colors: { a: "#5a6a2a", b: "#e8e0d0" }, music: "highlife", pools: ["igbo"],
    products: ["Abakaliki rice", "salt", "yams", "groundnuts", "palm wine"],
    places: [p("Abakaliki Rice Mill", "factory"), p("Okposi salt lake", "lake"), p("Uburu salt lake", "lake"), p("Abakpa Market", "market"), p("Ebonyi State University", "campus"), p("Abakaliki International Market", "market"), p("Ezza farmlands", "farm"), p("Abakaliki motor park", "motorpark")],
  },
  {
    state: "Ekiti", key: "eki", nickname: "Fountain of Knowledge", colors: { a: "#2a4a6a", b: "#3a8a4a" }, music: "juju", pools: ["yoruba"],
    products: ["cocoa", "kola nuts", "Igbemo rice", "yams", "cashew"],
    places: [p("Ikogosi Warm Springs", "falls"), p("Arinta Waterfalls", "falls"), p("Fajuyi Park", "park"), p("Oja Oba, Ado-Ekiti", "market"), p("Ekiti State University", "campus"), p("Olosunta Hills, Ikere", "hills"), p("Ado-Ekiti motor park", "motorpark"), p("Ikere cocoa store", "factory")],
  },
  {
    state: "Ondo", key: "ond", nickname: "Sunshine State", colors: { a: "#c0801a", b: "#2a6a3a" }, music: "juju", pools: ["yoruba"],
    products: ["cocoa", "timber", "fresh fish", "kola nuts", "cassava"],
    places: [p("Idanre Hills", "hills"), p("Deji's Palace, Akure", "palace"), p("FUTA campus", "campus"), p("Oja Oba, Akure", "market"), p("Owo Museum", "museum"), p("Igbokoda waterside", "waterfront"), p("Ebomi Lake", "lake"), p("Alagbaka", "square"), p("Ondo cocoa warehouse", "factory")],
  },
  {
    state: "Osun", key: "osu", nickname: "State of the Living Spring", colors: { a: "#8a6a2a", b: "#1d6a8a" }, music: "juju", pools: ["yoruba"],
    products: ["adire cloth", "cocoa", "kola nuts", "palm oil", "beads"],
    places: [p("Osun-Osogbo Sacred Grove", "reserve"), p("Oja Oba, Osogbo", "market"), p("Olumirin Waterfalls, Erin-Ijesha", "falls"), p("Ooni's Palace, Ile-Ife", "palace"), p("Obafemi Awolowo University", "campus"), p("Natural History Museum, Ife", "museum"), p("Olaiya junction", "motorpark"), p("Ilesha market", "market")],
  },
];
