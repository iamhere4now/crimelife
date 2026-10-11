import { Marker, Tape } from "./Bits";
import { Gumshoe, K9, LabTech } from "./Characters";

/* ---------------------------------------------------------------- Danfo on Third Mainland Bridge */

export function Danfo({ cast }: { cast: boolean }) {
  return (
    <g>
      <defs>
        <linearGradient id="df-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2a1a4a" />
          <stop offset="0.55" stopColor="#ff6a3a" />
          <stop offset="1" stopColor="#ffb347" />
        </linearGradient>
        <linearGradient id="df-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ff9a5a" stopOpacity="0.55" />
          <stop offset="0.3" stopColor="#1d4a6a" />
          <stop offset="1" stopColor="#0f2a3a" />
        </linearGradient>
        <radialGradient id="df-sun" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0.4" stopColor="#ffe08a" />
          <stop offset="1" stopColor="#ffe08a" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="360" height="400" fill="url(#df-sky)" />
      <circle cx="96" cy="128" r="46" fill="url(#df-sun)" />
      <circle cx="96" cy="128" r="20" fill="#ffd36b" />
      {/* Lagos Island skyline */}
      <path
        d="M0 182 L0 160 L18 160 L18 140 L34 140 L34 166 L52 166 L52 120 L64 112 L76 120 L76 166 L96 166 L96 150 L120 150 L120 132 L136 132 L136 168 L170 168 L170 104 L186 104 L186 168 L214 168 L214 146 L236 146 L236 124 L250 116 L264 124 L264 170 L300 170 L300 150 L326 150 L326 136 L344 136 L344 172 L360 172 L360 182 Z"
        fill="#3a2246"
      />
      {[[56, 130], [60, 146], [176, 116], [180, 140], [242, 136], [256, 150], [330, 146]].map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width="3" height="4" fill="#ffd36b" opacity="0.8" />
      ))}
      {/* lagoon + canoe */}
      <rect x="0" y="182" width="360" height="80" fill="url(#df-water)" />
      {[196, 214, 232, 248].map((y, i) => (
        <path key={y} d={`M${10 + i * 30} ${y} l40 0 M${200 - i * 20} ${y + 6} l50 0`} stroke="#ffd9a8" strokeOpacity="0.35" strokeWidth="1.5" />
      ))}
      <path d="M300 214 Q320 222 344 214 L340 220 Q320 226 304 220 Z" fill="#3a2a1a" />
      <path d="M320 214 L320 200 M314 206 L326 202" stroke="#1a1a1a" strokeWidth="2" />
      <circle cx="320" cy="196" r="3" fill="#1a1a1a" />
      {/* bridge railing + lamp posts */}
      <rect x="0" y="252" width="360" height="10" fill="#9aa3ab" />
      {Array.from({ length: 13 }, (_, i) => (
        <rect key={i} x={i * 30} y="240" width="5" height="22" fill="#6c7884" />
      ))}
      <rect x="0" y="238" width="360" height="5" fill="#b6bfc6" />
      {[30, 340].map((x) => (
        <g key={x}>
          <rect x={x - 2} y="128" width="4" height="114" fill="#4c5660" />
          <path d={`M${x} 130 Q${x} 118 ${x + (x < 180 ? 16 : -16)} 118`} stroke="#4c5660" strokeWidth="4" fill="none" />
          <ellipse cx={x + (x < 180 ? 18 : -18)} cy="120" rx="7" ry="3" fill="#ffe08a" />
        </g>
      ))}
      {/* road */}
      <rect x="0" y="262" width="360" height="138" fill="#2b2f36" />
      <path d="M0 372 L360 372" stroke="#f2f2e8" strokeWidth="3" strokeDasharray="22 16" />
      {/* the danfo (facing left) */}
      <rect x="36" y="132" width="296" height="150" rx="16" fill="#f5c518" />
      <rect x="36" y="232" width="296" height="8" fill="#141414" />
      <rect x="36" y="246" width="296" height="4" fill="#141414" />
      {/* route board */}
      <rect x="60" y="118" width="96" height="16" rx="3" fill="#141414" />
      <text x="108" y="130" textAnchor="middle" fontSize="9" fontWeight="900" fill="#f5c518">OSHODI–CMS</text>
      {/* windscreen */}
      <path d="M38 150 Q40 140 52 140 L66 140 L66 212 L38 212 Z" fill="#9fd4ff" fillOpacity="0.6" stroke="#141414" strokeWidth="3" />
      <circle cx="30" cy="166" r="6" fill="#141414" />
      <rect x="30" y="162" width="10" height="3" fill="#141414" />
      {/* windows: front row, courier, seat behind */}
      {[
        [72, 56],
        [136, 56],
        [198, 50],
      ].map(([x, w]) => (
        <rect key={x} x={x} y="148" width={w} height="62" rx="4" fill="#20262e" stroke="#141414" strokeWidth="3" />
      ))}
      {/* front-row passenger */}
      <circle cx="100" cy="176" r="10" fill="#5C3A1E" />
      <rect x="88" y="186" width="24" height="24" rx="6" fill="#2b5a8a" />
      {/* the dozing courier with his bag (clue) */}
      <circle cx="160" cy="174" r="10" fill="#6b4226" />
      <path d="M154 172 L158 172 M162 172 L166 172" stroke="#141414" strokeWidth="1.5" />
      <text x="174" y="164" fontSize="9" fontWeight="900" fill="#9fd4ff">z</text>
      <text x="180" y="156" fontSize="7" fontWeight="900" fill="#9fd4ff">z</text>
      <rect x="146" y="184" width="30" height="26" rx="4" fill="#3a3346" />
      <rect x="150" y="186" width="26" height="14" rx="3" fill="#6a4a20" />
      <path d="M152 198 L170 198" stroke="#f5c518" strokeWidth="1.5" strokeDasharray="3 2" />
      {/* seat behind, with a gele just visible (clue) */}
      <rect x="202" y="182" width="42" height="28" rx="4" fill="#4a2a2a" />
      <path d="M212 160 Q222 146 234 158 Q238 168 230 172 L214 172 Q208 168 212 160 Z" fill="#f2ead2" />
      <circle cx="222" cy="178" r="6" fill="#8D5524" />
      {/* open sliding door with conductor and a phone held up (clue) */}
      <rect x="252" y="140" width="48" height="140" fill="#141414" />
      <rect x="256" y="150" width="4" height="110" fill="#9aa3ab" />
      <circle cx="282" cy="196" r="10" fill="#4a2c17" />
      <rect x="270" y="206" width="24" height="40" rx="6" fill="#f5c518" stroke="#141414" strokeWidth="1.5" />
      <path d="M294 214 L312 204" stroke="#4a2c17" strokeWidth="5" strokeLinecap="round" />
      <rect x="268" y="166" width="12" height="20" rx="2" fill="#141414" stroke="#53FC18" strokeWidth="1.5" />
      <rect x="270" y="169" width="8" height="12" fill="#53FC18" opacity="0.6" />
      {/* rear + NO SHAKING sticker */}
      <rect x="304" y="150" width="24" height="56" rx="4" fill="#20262e" stroke="#141414" strokeWidth="3" />
      <rect x="304" y="212" width="26" height="14" rx="2" fill="#ffffff" transform="rotate(-6 317 219)" />
      <text x="317" y="222" textAnchor="middle" fontSize="4.6" fontWeight="900" fill="#c0182b" transform="rotate(-6 317 219)">
        NO SHAKING
      </text>
      {/* wheels */}
      {[92, 286].map((x) => (
        <g key={x}>
          <circle cx={x} cy="284" r="20" fill="#141414" />
          <circle cx={x} cy="284" r="8" fill="#9aa3ab" />
        </g>
      ))}
      {/* hawker with gala tray */}
      <g transform="translate(14 0)">
        <rect x="-10" y="216" width="30" height="7" rx="2" fill="#c9a34a" />
        <rect x="-6" y="208" width="8" height="8" fill="#c0182b" />
        <rect x="4" y="208" width="8" height="8" fill="#53FC18" />
        <circle cx="5" cy="230" r="8" fill="#6b4226" />
        <rect x="-5" y="238" width="20" height="34" rx="5" fill="#c0182b" />
      </g>
      {/* torn invoice + pure water sachet on the road (clue) */}
      {[
        [76, 344, -12],
        [90, 352, 20],
        [80, 358, 4],
      ].map(([x, y, r], i) => (
        <rect key={i} x={x} y={y} width="13" height="10" fill="#f2ead2" transform={`rotate(${r} ${x} ${y})`} />
      ))}
      <path d="M200 330 Q206 324 214 330 L214 340 Q206 344 200 340 Z" fill="#bfe7ff" fillOpacity="0.7" stroke="#ffffff" strokeWidth="1" />
      <Marker x={112} y={344} n={1} />
      <Marker x={232} y={224} n={2} />
      {cast && (
        <>
          <Gumshoe x={316} y={396} scale={0.84} skin="#8D5524" flip />
          <K9 x={176} y={396} scale={0.72} delay="0.4s" />
        </>
      )}
    </g>
  );
}

/* ---------------------------------------------------------------- Balogun Market */

const ANKARA = ["#c0182b", "#1d6a8a", "#f5c518", "#53FC18", "#7a3aff", "#ff7a3a"];

function FabricShelf({ x, y, w, rows }: { x: number; y: number; w: number; rows: number }) {
  return (
    <g>
      {Array.from({ length: rows }, (_, r) =>
        Array.from({ length: Math.floor(w / 18) }, (_, c) => {
          const color = ANKARA[(r * 3 + c) % ANKARA.length];
          const bx = x + c * 18;
          const by = y + r * 22;
          return (
            <g key={`${r}-${c}`}>
              <rect x={bx} y={by} width="16" height="20" rx="2" fill={color} />
              <circle cx={bx + 5} cy={by + 6} r="2" fill="#fff" opacity="0.55" />
              <circle cx={bx + 11} cy={by + 14} r="2" fill="#0B0E0F" opacity="0.35" />
              <path d={`M${bx} ${by + 10} l16 0`} stroke="#fff" strokeOpacity="0.3" strokeDasharray="2 2" />
            </g>
          );
        }),
      )}
    </g>
  );
}

export function Market({ cast }: { cast: boolean }) {
  return (
    <g>
      <rect width="360" height="400" fill="#8fd0ff" />
      {/* market buildings */}
      <rect x="0" y="14" width="360" height="110" fill="#c9b79a" />
      {Array.from({ length: 9 }, (_, i) => (
        <rect key={i} x={10 + i * 40} y="48" width="24" height="18" fill="#5a4a3a" />
      ))}
      <rect x="64" y="20" width="232" height="22" rx="3" fill="#1d6a3a" />
      <text x="180" y="36" textAnchor="middle" fontSize="13" fontWeight="900" fill="#ffffff" letterSpacing="1">
        BALOGUN MARKET
      </text>
      {/* umbrellas */}
      {[
        [40, "#c0182b"],
        [130, "#f5c518"],
        [220, "#1d6a8a"],
        [310, "#53FC18"],
      ].map(([x, c], i) => (
        <g key={i}>
          <path d={`M${(x as number) - 52} 108 Q${x} 50 ${(x as number) + 52} 108 Z`} fill={c as string} />
          <path d={`M${x} 60 L${x} 108 M${(x as number) - 26} 102 Q${x} 76 ${(x as number) + 26} 102`} stroke="#ffffff" strokeOpacity="0.5" strokeWidth="2" fill="none" />
          <rect x={(x as number) - 1.5} y="108" width="3" height="130" fill="#4c5660" />
        </g>
      ))}
      {/* left stall: shelves of ankara + POS board */}
      <rect x="0" y="118" width="112" height="150" fill="#6a4a2a" />
      <FabricShelf x={4} y={124} w={108} rows={5} />
      <rect x="14" y="112" width="80" height="16" rx="3" fill="#141414" />
      <text x="54" y="124" textAnchor="middle" fontSize="9" fontWeight="900" fill="#53FC18">POS • TRANSFER</text>
      {/* right stall + nail with ankara scrap (clue) */}
      <rect x="248" y="118" width="56" height="150" fill="#6a4a2a" />
      <FabricShelf x={250} y={124} w={54} rows={4} />
      <circle cx="256" cy="212" r="2.5" fill="#9aa3ab" />
      <path d="M256 212 L248 226 L262 230 L266 216 Z" fill="#1d6a8a" />
      <circle cx="254" cy="222" r="1.6" fill="#f5c518" />
      <circle cx="260" cy="224" r="1.6" fill="#53FC18" />
      {/* gate post + night logbook (clue) */}
      <rect x="306" y="110" width="22" height="170" fill="#4c5660" />
      <rect x="328" y="110" width="32" height="170" fill="#3b4148" />
      <path d="M332 120 L332 270 M344 120 L344 270 M356 120 L356 270" stroke="#2b3238" strokeWidth="3" />
      <rect x="310" y="146" width="20" height="26" rx="2" fill="#2b5a8a" />
      <rect x="312" y="150" width="16" height="20" fill="#f2f2e8" />
      <circle cx="320" cy="144" r="2" fill="#9aa3ab" />
      {/* Iyaloja's stall: table + ajo box with smashed padlock (clue) */}
      <rect x="118" y="244" width="124" height="10" fill="#8a6a3a" />
      <rect x="124" y="254" width="6" height="40" fill="#6a4a2a" />
      <rect x="230" y="254" width="6" height="40" fill="#6a4a2a" />
      <rect x="150" y="200" width="60" height="44" rx="4" fill="#7a4a1a" stroke="#4a2a10" strokeWidth="2" />
      <path d="M150 214 L210 214" stroke="#4a2a10" strokeWidth="2" />
      <text x="180" y="210" textAnchor="middle" fontSize="7" fontWeight="900" fill="#f5c518">AJO</text>
      <path d="M174 228 Q174 220 180 220 Q186 220 186 226" stroke="#9aa3ab" strokeWidth="2.5" fill="none" />
      <rect x="172" y="227" width="16" height="12" rx="2" fill="#c9a34a" transform="rotate(18 180 233)" />
      {/* ground */}
      <rect x="0" y="268" width="360" height="132" fill="#9a6a4a" />
      <ellipse cx="300" cy="384" rx="40" ry="7" fill="#5a8ab8" opacity="0.5" />
      {/* stool + torn ajo record book (clue) */}
      <ellipse cx="76" cy="304" rx="22" ry="6" fill="#6a4a2a" />
      <rect x="62" y="304" width="5" height="22" fill="#4a2a10" />
      <rect x="86" y="304" width="5" height="22" fill="#4a2a10" />
      {[
        [64, 290, -14],
        [78, 296, 10],
        [70, 300, 30],
      ].map(([x, y, r], i) => (
        <rect key={i} x={x} y={y} width="14" height="11" fill="#f2ead2" transform={`rotate(${r} ${x} ${y})`} />
      ))}
      {/* fallen clock stopped at 2:10 */}
      <circle cx="244" cy="292" r="12" fill="#f2f2e8" stroke="#141414" strokeWidth="2" />
      <path d="M244 292 L244 284 M244 292 L250 292" stroke="#141414" strokeWidth="1.8" />
      {/* generator */}
      <rect x="104" y="318" width="40" height="28" rx="3" fill="#c0182b" />
      <rect x="110" y="324" width="16" height="10" fill="#141414" />
      <path d="M144 324 L152 318" stroke="#4c5660" strokeWidth="3" />
      {/* wheelbarrow with plantain */}
      <path d="M262 324 L314 324 L304 346 L270 346 Z" fill="#4c5660" />
      <circle cx="268" cy="352" r="7" fill="#141414" />
      <path d="M314 324 L334 316" stroke="#4c5660" strokeWidth="3" />
      {[274, 284, 294].map((x) => (
        <path key={x} d={`M${x} 324 Q${x + 4} 306 ${x + 10} 314`} stroke="#f5c518" strokeWidth="5" fill="none" strokeLinecap="round" />
      ))}
      {/* market chicken */}
      <g transform="translate(206 356)">
        <ellipse cx="0" cy="0" rx="11" ry="8" fill="#f2f2e8" />
        <circle cx="9" cy="-8" r="5" fill="#f2f2e8" />
        <path d="M8 -14 L10 -11 L12 -14" fill="#c0182b" />
        <path d="M14 -8 L18 -7 L14 -6 Z" fill="#f5a018" />
        <path d="M-2 8 L-2 14 M3 8 L3 14" stroke="#f5a018" strokeWidth="1.5" />
      </g>
      <Marker x={140} y={292} n={1} />
      <Marker x={226} y={244} n={2} />
      {cast && (
        <>
          <LabTech x={176} y={312} scale={0.55} delay="0.5s" />
          <Gumshoe x={330} y={398} scale={0.84} skin="#5C3A1E" coat="#1d2f5a" hat="#14213f" flip />
          <K9 x={30} y={398} scale={0.7} delay="0.8s" />
        </>
      )}
      <Tape y={262} tilt={-3} />
    </g>
  );
}

/* ---------------------------------------------------------------- Owambe hall */

export function Owambe({ cast }: { cast: boolean }) {
  return (
    <g>
      <defs>
        <radialGradient id="ow-glow" cx="0.5" cy="0.1" r="0.8">
          <stop offset="0" stopColor="#ffe9a8" stopOpacity="0.4" />
          <stop offset="1" stopColor="#ffe9a8" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="ow-floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3a2a1a" />
          <stop offset="1" stopColor="#1a120a" />
        </linearGradient>
      </defs>
      <rect width="360" height="400" fill="#2a1a10" />
      {/* drapes */}
      {Array.from({ length: 8 }, (_, i) => (
        <path key={i} d={`M${i * 46} 0 Q${i * 46 + 23} 60 ${i * 46 + 46} 0 L${i * 46 + 46} 270 L${i * 46} 270 Z`} fill={i % 2 ? "#3a2614" : "#4a3018"} />
      ))}
      {Array.from({ length: 8 }, (_, i) => (
        <path key={`s${i}`} d={`M${i * 46} 8 Q${i * 46 + 23} 44 ${i * 46 + 46} 8`} stroke="#e6c35a" strokeWidth="3" fill="none" />
      ))}
      <rect width="360" height="400" fill="url(#ow-glow)" />
      {/* fairy lights */}
      {Array.from({ length: 24 }, (_, i) => (
        <circle key={i} cx={8 + i * 15} cy={70 + Math.sin(i / 2) * 6} r="2" fill="#fff6d0" className="sparkle" style={{ animationDelay: `${(i % 6) * 0.3}s` }} />
      ))}
      {/* chandelier */}
      <path d="M180 0 L180 18" stroke="#e6c35a" strokeWidth="2" />
      <path d="M156 22 Q180 40 204 22" stroke="#e6c35a" strokeWidth="3" fill="none" />
      {[156, 168, 180, 192, 204].map((x, i) => (
        <circle key={x} cx={x} cy={30 + (i === 2 ? 8 : i % 2 ? 5 : 0)} r="3" fill="#fff6d0" className="sparkle" />
      ))}
      {/* hashtag banner */}
      <rect x="92" y="86" width="176" height="22" rx="4" fill="#f2ead2" />
      <text x="180" y="102" textAnchor="middle" fontSize="12" fontWeight="900" fill="#8a6a2a" fontStyle="italic">
        #TemTunForever
      </text>
      {/* high table with the couple's thrones */}
      <rect x="122" y="196" width="116" height="40" fill="#f2ead2" />
      <path d="M122 196 Q180 210 238 196" stroke="#e6c35a" strokeWidth="3" fill="none" />
      {[150, 210].map((x) => (
        <g key={x}>
          <path d={`M${x - 16} 196 L${x - 16} 150 Q${x} 128 ${x + 16} 150 L${x + 16} 196 Z`} fill="#e6c35a" />
          <path d={`M${x - 10} 192 L${x - 10} 154 Q${x} 140 ${x + 10} 154 L${x + 10} 192 Z`} fill="#f2ead2" />
        </g>
      ))}
      {/* cake */}
      <rect x="86" y="200" width="36" height="36" fill="#f2f2e8" />
      <rect x="92" y="176" width="24" height="24" fill="#f2f2e8" />
      <rect x="97" y="158" width="14" height="18" fill="#f2f2e8" />
      <path d="M86 214 L122 214 M92 188 L116 188" stroke="#e6c35a" strokeWidth="2" />
      <circle cx="104" cy="154" r="4" fill="#c0182b" />
      {/* DJ booth + speakers + laptop (clue) */}
      <rect x="262" y="198" width="72" height="44" rx="4" fill="#141414" />
      <text x="298" y="226" textAnchor="middle" fontSize="8" fontWeight="900" fill="#53FC18" className="neon-flicker">DJ FLEXY</text>
      <path d="M288 196 L294 180 L318 180 L312 196 Z" fill="#4c5660" />
      <rect x="294" y="168" width="22" height="13" rx="1" fill="#141414" stroke="#53FC18" strokeWidth="1" />
      <rect x="338" y="120" width="22" height="122" fill="#1a1a1a" />
      <circle cx="349" cy="150" r="8" fill="#2b2f36" stroke="#53FC18" strokeWidth="1" />
      <circle cx="349" cy="200" r="10" fill="#2b2f36" stroke="#53FC18" strokeWidth="1" />
      <path d="M270 194 Q270 182 280 182 Q290 182 290 194" stroke="#141414" strokeWidth="3" fill="none" />
      {/* side table with the money box (clue) */}
      <rect x="226" y="256" width="58" height="8" fill="#f2ead2" />
      <rect x="236" y="264" width="4" height="22" fill="#c9a34a" />
      <rect x="270" y="264" width="4" height="22" fill="#c9a34a" />
      <rect x="232" y="228" width="46" height="28" rx="3" fill="#e6c35a" stroke="#8a6a2a" strokeWidth="2" />
      <rect x="232" y="236" width="46" height="5" fill="#bfe7ff" opacity="0.7" />
      <text x="255" y="252" textAnchor="middle" fontSize="6" fontWeight="900" fill="#8a6a2a">SPRAY BOX</text>
      {/* chair with abandoned gold gele (clue) */}
      <rect x="60" y="256" width="34" height="8" rx="2" fill="#f2ead2" />
      <rect x="62" y="226" width="6" height="34" fill="#f2ead2" />
      <rect x="64" y="264" width="4" height="26" fill="#c9a34a" />
      <rect x="86" y="264" width="4" height="26" fill="#c9a34a" />
      <path d="M68 254 Q74 238 84 246 Q92 236 98 250 Q90 258 76 258 Z" fill="#e6c35a" />
      <circle cx="90" cy="248" r="2" fill="#141414" />
      {/* dance floor + sprayed naira notes */}
      <rect x="0" y="270" width="360" height="130" fill="url(#ow-floor)" />
      {Array.from({ length: 5 }, (_, r) => (
        <path key={r} d={`M0 ${290 + r * 24} L360 ${290 + r * 24}`} stroke="#4a3a2a" strokeWidth="1" />
      ))}
      {Array.from({ length: 14 }, (_, i) => {
        const x = (i * 71) % 340 + 10;
        const y = 300 + ((i * 37) % 90);
        return (
          <rect key={i} x={x} y={y} width="16" height="8" rx="1" fill={["#d97aa8", "#5a8ab8", "#6aa84a"][i % 3]} transform={`rotate(${(i * 29) % 60 - 30} ${x + 8} ${y + 4})`} opacity="0.9" />
        );
      })}
      {/* torn demand letter under the high table (clue) */}
      {[
        [140, 338, -18],
        [152, 344, 12],
        [146, 352, 28],
      ].map(([x, y, r], i) => (
        <rect key={i} x={x} y={y} width="13" height="11" fill="#ffffff" transform={`rotate(${r} ${x} ${y})`} />
      ))}
      {/* a glass of Chapman */}
      <path d="M200 312 L212 312 L210 330 L202 330 Z" fill="#d9481a" opacity="0.85" />
      <path d="M206 330 L206 336 M201 336 L211 336" stroke="#f2f2e8" strokeWidth="1.5" />
      <circle cx="210" cy="314" r="2" fill="#53FC18" />
      <Marker x={180} y={350} n={1} />
      <Marker x={112} y={290} n={2} />
      {cast && (
        <>
          <Gumshoe x={40} y={398} scale={0.84} skin="#5C3A1E" coat="#2a1a5a" hat="#14142a" />
          <K9 x={318} y={396} scale={0.72} flip delay="0.6s" />
          <LabTech x={250} y={346} scale={0.55} delay="0.2s" />
        </>
      )}
    </g>
  );
}
