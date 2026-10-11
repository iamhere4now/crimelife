import { Marker, Tape } from "./Bits";
import { Gumshoe, K9, LabTech } from "./Characters";

/* ---------------------------------------------------------------- Streamer studio */

export function Studio({ cast }: { cast: boolean }) {
  return (
    <g>
      <defs>
        <linearGradient id="st-led" x1="0" x2="1">
          <stop offset="0" stopColor="#ff3df0" />
          <stop offset="0.5" stopColor="#7a3aff" />
          <stop offset="1" stopColor="#53FC18" />
        </linearGradient>
        <radialGradient id="st-ring" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0.6" stopColor="#fff6e0" stopOpacity="0" />
          <stop offset="0.8" stopColor="#fff6e0" stopOpacity="0.35" />
          <stop offset="1" stopColor="#fff6e0" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="st-screen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1a1030" />
          <stop offset="1" stopColor="#0b0e0f" />
        </linearGradient>
      </defs>
      <rect width="360" height="400" fill="#140f22" />
      {/* acoustic foam */}
      {Array.from({ length: 5 }, (_, r) =>
        Array.from({ length: 8 }, (_, c) => (
          <rect key={`${r}-${c}`} x={14 + c * 42} y={24 + r * 40} width="36" height="34" rx="6" fill={(r + c) % 2 ? "#1d1631" : "#231a3b"} />
        )),
      )}
      <rect x="0" y="4" width="360" height="6" fill="url(#st-led)" className="neon-flicker" />
      <rect x="0" y="4" width="360" height="22" fill="url(#st-led)" opacity="0.12" />
      {/* ON AIR sign, off */}
      <rect x="248" y="32" width="56" height="20" rx="4" fill="#2a1416" stroke="#5a2026" strokeWidth="2" />
      <text x="276" y="46" textAnchor="middle" fontSize="10" fontWeight="900" fill="#5a2026">ON AIR</text>
      {/* ring light */}
      <circle cx="58" cy="140" r="54" fill="url(#st-ring)" />
      <circle cx="58" cy="140" r="36" fill="none" stroke="#fff6e0" strokeWidth="8" />
      <path d="M58 176 L58 300 M40 300 L76 300" stroke="#3a3346" strokeWidth="4" />
      {/* main monitor (clue) */}
      <rect x="122" y="104" width="116" height="92" rx="5" fill="#0b0e0f" stroke="#3a3346" strokeWidth="4" />
      <rect x="128" y="110" width="104" height="80" fill="url(#st-screen)" />
      {Array.from({ length: 9 }, (_, i) => (
        <rect key={i} x="128" y={112 + i * 9} width="104" height="2" fill="#ffffff" opacity={0.04 + (i % 3) * 0.03} />
      ))}
      <text x="180" y="146" textAnchor="middle" fontSize="10" fontWeight="900" fill="#ff7af5">STREAM</text>
      <text x="180" y="160" textAnchor="middle" fontSize="10" fontWeight="900" fill="#ff7af5" className="neon-flicker">OFFLINE</text>
      <rect x="168" y="196" width="24" height="14" fill="#3a3346" />
      {/* side monitor with chat */}
      <rect x="244" y="124" width="52" height="70" rx="4" fill="#0b0e0f" stroke="#3a3346" strokeWidth="3" />
      {Array.from({ length: 6 }, (_, i) => (
        <rect key={i} x="250" y={132 + i * 10} width={20 + ((i * 13) % 20)} height="4" rx="2" fill={i % 2 ? "#7a3aff" : "#53FC18"} opacity="0.7" />
      ))}
      {/* desk */}
      <path d="M60 222 L300 222 L312 240 L48 240 Z" fill="#2b2440" />
      <rect x="62" y="240" width="8" height="70" fill="#1d1830" />
      <rect x="290" y="240" width="8" height="70" fill="#1d1830" />
      {/* tablet (clue) */}
      <g transform="rotate(-8 122 232)">
        <rect x="102" y="222" width="40" height="22" rx="3" fill="#0b0e0f" stroke="#7a3aff" strokeWidth="2" />
        <rect x="106" y="226" width="32" height="14" fill="#2a1a3a" />
        <path d="M108 230 L130 230 M108 234 L124 234" stroke="#c9a8ff" strokeWidth="1.5" />
      </g>
      {/* energy drinks */}
      {[262, 274].map((x) => (
        <g key={x}>
          <rect x={x} y="206" width="9" height="16" rx="2" fill="#9a4aff" />
          <rect x={x} y="210" width="9" height="4" fill="#53FC18" />
        </g>
      ))}
      {/* router shelf (clue) */}
      <rect x="268" y="210" width="80" height="5" fill="#3a3346" />
      <rect x="282" y="192" width="36" height="18" rx="3" fill="#1d1830" stroke="#53FC18" strokeWidth="1" />
      <path d="M288 192 L284 176 M312 192 L316 176" stroke="#3a3346" strokeWidth="3" strokeLinecap="round" />
      {[290, 297, 304, 311].map((x) => (
        <circle key={x} cx={x} cy="201" r="1.6" fill="#3a3346" />
      ))}
      <path d="M318 204 Q334 224 326 252" stroke="#141414" strokeWidth="3" fill="none" />
      {/* gaming chair, empty */}
      <path d="M150 196 Q180 186 210 196 L206 268 L154 268 Z" fill="#53FC18" />
      <path d="M156 204 Q180 196 204 204 L202 262 L158 262 Z" fill="#1a1a1a" />
      <rect x="146" y="266" width="68" height="14" rx="6" fill="#1a1a1a" />
      <path d="M180 280 L180 320 M156 330 L204 330" stroke="#3a3346" strokeWidth="5" strokeLinecap="round" />
      {/* floor + cables */}
      <rect x="0" y="300" width="360" height="100" fill="#1b1430" />
      <path d="M0 300 L360 300" stroke="#2b2440" strokeWidth="3" />
      <path d="M70 310 Q140 340 210 312 T340 330" stroke="#0b0e0f" strokeWidth="3" fill="none" />
      {/* closet door */}
      <rect x="318" y="222" width="42" height="160" fill="#2b2440" stroke="#3a3346" strokeWidth="3" />
      <circle cx="326" cy="304" r="3" fill="#e6c35a" />
      <path d="M318 240 L300 262 L300 378 L318 382" fill="#231a3b" opacity="0.8" />
      {/* visitor log clipboard (clue) */}
      <g transform="rotate(14 252 344)">
        <rect x="236" y="324" width="32" height="40" rx="3" fill="#8a6a3a" />
        <rect x="240" y="330" width="24" height="31" fill="#f2f2e8" />
        <rect x="246" y="320" width="12" height="7" rx="2" fill="#9aa3ab" />
        {[336, 342, 348, 354].map((y) => (
          <path key={y} d={`M243 ${y} L261 ${y}`} stroke="#7a7a7a" strokeWidth="1.3" />
        ))}
      </g>
      <Marker x={146} y={256} n={1} />
      <Marker x={278} y={360} n={2} />
      {cast && (
        <>
          <LabTech x={300} y={318} scale={0.6} delay="0.6s" flip />
          <Gumshoe x={36} y={394} scale={0.88} skin="#F1C27D" coat="#3a2a5a" hat="#1b1430" />
          <K9 x={98} y={396} scale={0.72} delay="0.3s" />
        </>
      )}
      <Tape y={384} tilt={-2} />
    </g>
  );
}

/* ---------------------------------------------------------------- Gallery */

export function Gallery({ cast }: { cast: boolean }) {
  return (
    <g>
      <defs>
        <linearGradient id="ga-cone" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff2c8" stopOpacity="0.35" />
          <stop offset="1" stopColor="#fff2c8" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="ga-paint" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#1f5a3a" />
          <stop offset="1" stopColor="#0f2e22" />
        </linearGradient>
      </defs>
      <rect width="360" height="400" fill="#1d2428" />
      <rect x="0" y="214" width="360" height="40" fill="#242d32" />
      <path d="M0 214 L360 214" stroke="#c9a34a" strokeWidth="2" opacity="0.5" />
      {/* track lights */}
      <rect x="0" y="0" width="360" height="8" fill="#0f1416" />
      {[60, 180, 300].map((x) => (
        <g key={x}>
          <path d={`M${x - 8} 8 L${x + 8} 8 L${x + 60} 230 L${x - 60} 230 Z`} fill="url(#ga-cone)" />
          <rect x={x - 6} y="6" width="12" height="10" rx="2" fill="#3b4148" />
        </g>
      ))}
      {/* side paintings */}
      <rect x="18" y="82" width="74" height="62" fill="#c9a34a" />
      <rect x="24" y="88" width="62" height="50" fill="#2a4a6a" />
      <path d="M24 124 L44 104 L58 118 L70 108 L86 124 L86 138 L24 138 Z" fill="#1a2f44" />
      <circle cx="72" cy="98" r="5" fill="#f5e663" />
      <rect x="268" y="82" width="74" height="62" fill="#c9a34a" />
      <rect x="274" y="88" width="62" height="50" fill="#e8e0d0" />
      <rect x="282" y="96" width="20" height="30" fill="#c0182b" />
      <circle cx="318" cy="112" r="11" fill="#1d3a8a" />
      <path d="M276 132 L334 132" stroke="#111" strokeWidth="3" />
      {/* the forged "Gele Queen" (clue) */}
      <rect x="112" y="56" width="136" height="154" fill="#c9a34a" />
      <rect x="118" y="62" width="124" height="142" fill="#8a6a2a" />
      <rect x="124" y="68" width="112" height="130" fill="url(#ga-paint)" />
      <ellipse cx="180" cy="196" rx="38" ry="52" fill="#2f8a4a" />
      <path d="M150 160 Q180 150 210 160" stroke="#e6c35a" strokeWidth="3" fill="none" />
      <rect x="170" y="118" width="20" height="20" fill="#7a4a22" />
      <path d="M168 138 Q180 146 192 138" stroke="#c0182b" strokeWidth="3" fill="none" />
      <ellipse cx="180" cy="110" rx="17" ry="20" fill="#8D5524" />
      {/* emerald gele with fanned pleats */}
      <path d="M182 92 Q194 66 220 72 Q214 88 196 94 Z" fill="#53FC18" opacity="0.9" />
      <path d="M178 92 Q164 64 140 72 Q148 88 164 94 Z" fill="#3fc012" />
      <path d="M172 90 Q180 74 188 90 Z" fill="#7dff4a" />
      <path d="M161 106 Q160 86 180 86 Q200 86 199 106 Q192 96 180 96 Q168 96 161 106 Z" fill="#2f8a4a" />
      <path d="M164 98 Q180 90 196 98" stroke="#0f2e22" strokeOpacity="0.4" strokeWidth="1.2" fill="none" />
      <path d="M174 114 Q180 118 186 114" stroke="#3a1a1a" strokeWidth="1.5" fill="none" />
      <circle cx="174" cy="107" r="1.5" fill="#1a0f0a" />
      <circle cx="186" cy="107" r="1.5" fill="#1a0f0a" />
      <circle cx="163" cy="112" r="2" fill="#e6c35a" />
      <circle cx="197" cy="112" r="2" fill="#e6c35a" />
      <path d="M150 196 Q150 202 151 210" stroke="#53FC18" strokeWidth="3" strokeLinecap="round" />
      <circle cx="151" cy="212" r="2.5" fill="#53FC18" />
      <rect x="160" y="212" width="40" height="8" rx="1" fill="#e8e0d0" />
      {/* velvet rope */}
      {[96, 264].map((x) => (
        <g key={x}>
          <rect x={x - 3} y="236" width="6" height="40" fill="#c9a34a" />
          <circle cx={x} cy="236" r="5" fill="#e6c35a" />
          <ellipse cx={x} cy="278" rx="10" ry="3" fill="#c9a34a" />
        </g>
      ))}
      <path d="M96 240 Q180 270 264 240" stroke="#8a1a2a" strokeWidth="5" fill="none" />
      {/* parquet floor */}
      <rect x="0" y="254" width="360" height="146" fill="#4a3424" />
      {Array.from({ length: 6 }, (_, r) =>
        Array.from({ length: 10 }, (_, c) => (
          <rect key={`${r}-${c}`} x={c * 40 - (r % 2) * 20} y={256 + r * 24} width="38" height="22" fill={(r + c) % 2 ? "#523a28" : "#46301f"} />
        )),
      )}
      {/* restoration kit in a glass case (clue) */}
      <rect x="266" y="262" width="54" height="64" fill="#e8e0d0" />
      <rect x="262" y="256" width="62" height="8" fill="#f4efe6" />
      <rect x="264" y="210" width="58" height="46" fill="#bfe7ff" fillOpacity="0.18" stroke="#dff4ff" strokeWidth="1.5" />
      {[276, 288, 300, 310].map((x, i) => (
        <path key={x} d={`M${x} 250 L${x + 4} ${222 + i * 3}`} stroke={["#c0182b", "#53FC18", "#f5e663", "#9fe8ff"][i]} strokeWidth="3" strokeLinecap="round" />
      ))}
      <rect x="288" y="244" width="10" height="7" rx="1" fill="#c9a34a" />
      {/* bench + photo strip (clue) */}
      <rect x="34" y="288" width="128" height="12" rx="3" fill="#2b2f36" />
      <rect x="42" y="300" width="7" height="26" fill="#1d2126" />
      <rect x="148" y="300" width="7" height="26" fill="#1d2126" />
      <g transform="rotate(-10 101 292)">
        <rect x="94" y="270" width="16" height="40" fill="#fff" />
        {[273, 286, 299].map((y) => (
          <rect key={y} x="96" y={y} width="12" height="10" fill="#2b3440" />
        ))}
      </g>
      {/* courier crate (clue) */}
      <rect x="184" y="322" width="64" height="44" fill="#a8783a" stroke="#6a4a20" strokeWidth="2" />
      <path d="M184 322 L248 366 M248 322 L184 366" stroke="#6a4a20" strokeWidth="2" />
      <rect x="196" y="334" width="40" height="18" fill="#f2f2e8" />
      <text x="216" y="346" textAnchor="middle" fontSize="7" fontWeight="900" fill="#c0182b">FRAGILE</text>
      <Marker x={130} y={300} n={1} />
      <Marker x={258} y={372} n={2} />
      {cast && (
        <>
          <LabTech x={60} y={286} scale={0.6} delay="0.4s" />
          <Gumshoe x={326} y={396} scale={0.9} skin="#8D5524" coat="#2f3a4a" hat="#1b1b1b" flip />
          <K9 x={130} y={396} scale={0.72} delay="0.9s" />
        </>
      )}
    </g>
  );
}

/* ---------------------------------------------------------------- Kitchen */

export function Kitchen({ cast }: { cast: boolean }) {
  return (
    <g>
      <rect width="360" height="400" fill="#2b3238" />
      {/* wall tiles */}
      {Array.from({ length: 10 }, (_, r) =>
        Array.from({ length: 12 }, (_, c) => (
          <rect key={`${r}-${c}`} x={c * 30 + 1} y={r * 29 + 1} width="28" height="27" fill={(r + c) % 2 ? "#3a444c" : "#353f47"} />
        )),
      )}
      {/* pot rail */}
      <path d="M20 34 L250 34" stroke="#9aa3ab" strokeWidth="4" />
      {[
        [44, 26, "#b87333"],
        [92, 20, "#9aa3ab"],
        [140, 30, "#b87333"],
        [196, 22, "#9aa3ab"],
      ].map(([x, r, color]) => (
        <g key={x as number}>
          <path d={`M${x} 34 L${x} 44`} stroke="#9aa3ab" strokeWidth="2" />
          <path d={`M${(x as number) - (r as number)} 46 L${(x as number) + (r as number)} 46 L${(x as number) + (r as number) - 4} ${60 + (r as number) / 2} L${(x as number) - (r as number) + 4} ${60 + (r as number) / 2} Z`} fill={color as string} />
        </g>
      ))}
      {/* loading dock door */}
      <rect x="196" y="94" width="66" height="116" fill="#1d2328" stroke="#9aa3ab" strokeWidth="3" />
      <rect x="200" y="78" width="58" height="14" rx="2" fill="#f5c518" />
      <text x="229" y="88" textAnchor="middle" fontSize="7" fontWeight="900" fill="#0B0E0F">LOADING DOCK</text>
      {/* range */}
      <rect x="8" y="170" width="104" height="122" fill="#4c5660" stroke="#2b3238" strokeWidth="3" />
      <rect x="8" y="166" width="104" height="10" fill="#9aa3ab" />
      <circle cx="34" cy="162" r="10" fill="#1d2328" />
      <circle cx="84" cy="162" r="10" fill="#1d2328" />
      {/* big pot of party jollof */}
      <path d="M64 138 L104 138 L100 162 L68 162 Z" fill="#9aa3ab" />
      <ellipse cx="84" cy="138" rx="20" ry="4" fill="#d9481a" />
      <path d="M62 142 L58 142 M106 142 L110 142" stroke="#6c7884" strokeWidth="3" strokeLinecap="round" />
      <path d="M76 132 Q72 124 77 116 M88 130 Q84 120 90 112" stroke="#ffffff" strokeOpacity="0.4" strokeWidth="2" fill="none" className="sparkle" />
      <rect x="20" y="194" width="80" height="62" rx="4" fill="#2b3238" stroke="#9aa3ab" strokeWidth="2" />
      <rect x="28" y="202" width="64" height="30" fill="#ff8a00" opacity="0.25" />
      {/* steel prep counter */}
      <rect x="112" y="208" width="152" height="14" fill="#c3ccd3" />
      <rect x="112" y="222" width="152" height="4" fill="#8a949c" />
      <rect x="120" y="226" width="6" height="74" fill="#8a949c" />
      <rect x="250" y="226" width="6" height="74" fill="#8a949c" />
      <rect x="122" y="268" width="132" height="5" fill="#8a949c" />
      {/* ransom note (clue) */}
      <g transform="rotate(-6 180 214)">
        <rect x="162" y="200" width="36" height="24" fill="#f6f1e7" />
        {[
          [165, "#f5e663"],
          [172, "#111"],
          [179, "#ff7a8a"],
          [186, "#53FC18"],
        ].map(([x, c], i) => (
          <rect key={i} x={x as number} y={204 + (i % 2) * 8} width="6" height="7" fill={c as string} />
        ))}
      </g>
      {/* knife block + garlic */}
      <rect x="226" y="190" width="18" height="18" fill="#6a4a20" />
      <path d="M230 190 L230 178 M236 190 L237 176 M241 190 L243 180" stroke="#c3ccd3" strokeWidth="2.5" />
      <circle cx="138" cy="203" r="6" fill="#f2ead2" />
      {/* walk-in fridge */}
      <rect x="272" y="70" width="84" height="230" fill="#9aa3ab" stroke="#6c7884" strokeWidth="3" />
      <rect x="278" y="76" width="72" height="218" fill="#b6bfc6" />
      <rect x="334" y="150" width="8" height="54" rx="3" fill="#4c5660" />
      <text x="314" y="98" textAnchor="middle" fontSize="8" fontWeight="900" fill="#4c5660">WALK-IN</text>
      {/* checker floor */}
      <rect x="0" y="292" width="360" height="108" fill="#e8e8e8" />
      {Array.from({ length: 5 }, (_, r) =>
        Array.from({ length: 12 }, (_, c) =>
          (r + c) % 2 ? <rect key={`${r}-${c}`} x={c * 30} y={292 + r * 22} width="30" height="22" fill="#1d2328" /> : null,
        ),
      )}
      {/* trash bin + magazine (clue) */}
      <rect x="26" y="256" width="46" height="46" rx="4" fill="#4c5660" />
      <rect x="22" y="250" width="54" height="8" rx="3" fill="#6c7884" />
      <g transform="rotate(-18 50 248)">
        <rect x="38" y="230" width="26" height="22" fill="#ff7af5" />
        <rect x="42" y="234" width="6" height="6" fill="#f6f1e7" />
        <rect x="52" y="238" width="7" height="6" fill="#f6f1e7" />
        <text x="51" y="250" textAnchor="middle" fontSize="4.5" fontWeight="900" fill="#111">KITCHEN</text>
      </g>
      {/* flour spill + footprints (clue) */}
      <path d="M58 322 Q90 306 128 318 Q150 334 120 350 Q80 362 56 346 Z" fill="#fbf7ee" />
      <rect x="40" y="306" width="26" height="30" rx="4" fill="#d8c8a0" transform="rotate(-30 53 321)" />
      {[
        [104, 336],
        [134, 352],
        [166, 336],
        [196, 352],
      ].map(([x, y], i) => (
        <g key={i} transform={`translate(${x} ${y}) rotate(80)`} opacity={1 - i * 0.2}>
          <rect x="-4" y="-7" width="8" height="10" rx="4" fill="#cfc4a8" />
          <rect x="-3.5" y="4" width="7" height="5" rx="2.5" fill="#cfc4a8" />
        </g>
      ))}
      {/* empty dog bed, bowl, collar (clue) */}
      <ellipse cx="270" cy="356" rx="44" ry="15" fill="#c0182b" />
      <ellipse cx="270" cy="352" rx="32" ry="9" fill="#ffb3c0" />
      <path d="M248 350 Q256 344 262 352" stroke="#ff7a8a" strokeWidth="3" fill="none" />
      <ellipse cx="322" cy="334" rx="14" ry="5" fill="#9aa3ab" />
      <ellipse cx="322" cy="332" rx="10" ry="3" fill="#6ec1ff" />
      <ellipse cx="300" cy="334" rx="10" ry="5" fill="none" stroke="#e6c35a" strokeWidth="3" />
      <circle cx="300" cy="339" r="2.5" fill="#53FC18" className="neon-flicker" />
      <Marker x={210} y={234} n={1} />
      <Marker x={86} y={372} n={2} />
      {cast && (
        <>
          <Gumshoe x={206} y={398} scale={0.86} skin="#8D5524" coat="#1d2f5a" hat="#14213f" flip />
          <K9 x={150} y={396} scale={0.7} delay="0.5s" />
        </>
      )}
      <Tape y={140} tilt={-6} />
    </g>
  );
}
