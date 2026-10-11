import { sceneOf } from "@/lib/cases";
import type { CrimeCase, SceneId } from "@/lib/types";
import { KitSceneView } from "./Kit";
import { Marker, SCENE_H, SCENE_W, Tape } from "./Bits";
import { Gumshoe, K9, LabTech } from "./Characters";
import { Danfo, Market, Owambe } from "./LagosScenes";
import { Gallery, Kitchen, Studio } from "./MoreScenes";

export { SCENE_H, SCENE_W };

interface Props {
  id: SceneId;
  className?: string;
  /** "slice" crops the scene to fill thumbnails; "meet" keeps hotspots aligned. */
  fit?: "slice" | "meet";
  /** Hide the detectives on small thumbnails. */
  cast?: boolean;
}

/** A case's scene: its kit if it has one, otherwise its drawn scene. */
export function CaseScene({ theCase, className, fit = "meet", cast = true }: Omit<Props, "id"> & { theCase: CrimeCase }) {
  if (!theCase.kit) return <CrimeScene id={sceneOf(theCase)} className={className} fit={fit} cast={cast} />;
  return (
    <svg viewBox={`0 0 ${SCENE_W} ${SCENE_H}`} preserveAspectRatio={`xMidYMid ${fit}`} className={className} role="img" aria-label="Crime scene">
      <KitSceneView kit={theCase.kit} cast={cast} />
    </svg>
  );
}

export function CrimeScene({ id, className, fit = "meet", cast = true }: Props) {
  const Scene = {
    "neon-alley": NeonAlley,
    penthouse: Penthouse,
    "bank-vault": BankVault,
    livestream: Studio,
    gallery: Gallery,
    ransom: Kitchen,
    danfo: Danfo,
    market: Market,
    owambe: Owambe,
  }[id];
  return (
    <svg
      viewBox={`0 0 ${SCENE_W} ${SCENE_H}`}
      preserveAspectRatio={`xMidYMid ${fit}`}
      className={className}
      role="img"
      aria-label="Crime scene"
    >
      <Scene cast={cast} />
    </svg>
  );
}

/* ---------------------------------------------------------------- Neon Alley */

function NeonAlley({ cast }: { cast: boolean }) {
  return (
    <g>
      <defs>
        <linearGradient id="na-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1a0f2e" />
          <stop offset="1" stopColor="#3a1450" />
        </linearGradient>
        <linearGradient id="na-floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1b1d24" />
          <stop offset="1" stopColor="#0d0f13" />
        </linearGradient>
        <radialGradient id="na-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ff3df0" stopOpacity="0.5" />
          <stop offset="1" stopColor="#ff3df0" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="na-scorch" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffe066" stopOpacity="0.9" />
          <stop offset="0.35" stopColor="#ff8a00" stopOpacity="0.4" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="360" height="400" fill="url(#na-sky)" />
      {/* distant skyline through the alley mouth */}
      <path d="M120 60 L120 30 L140 30 L140 10 L160 10 L160 40 L185 40 L185 0 L205 0 L205 35 L225 35 L225 20 L240 20 L240 60 Z" fill="#120a20" />
      {[132, 150, 190, 196, 230].map((x, i) => (
        <rect key={x} x={x} y={18 + (i % 3) * 12} width="4" height="5" fill="#53FC18" opacity="0.6" />
      ))}
      {/* back wall with door */}
      <rect x="120" y="60" width="120" height="190" fill="#24202e" />
      <rect x="160" y="160" width="40" height="90" fill="#121016" />
      <rect x="164" y="164" width="32" height="86" fill="#1b1720" />
      <circle cx="191" cy="208" r="2" fill="#e6c35a" />
      <rect x="152" y="140" width="56" height="14" rx="3" fill="#0B0E0F" stroke="#53FC18" strokeWidth="1.5" />
      <text x="180" y="150.5" textAnchor="middle" fontSize="9" fontWeight="900" fill="#53FC18" className="neon-flicker">
        POS 24/7
      </text>
      {/* left wall */}
      <path d="M0 0 L120 60 L120 250 L0 330 Z" fill="#2e2436" />
      {[40, 80, 120, 160, 200, 240].map((y) => (
        <path key={y} d={`M0 ${y} L120 ${60 + (y * 190) / 330}`} stroke="#1c1624" strokeWidth="2" />
      ))}
      {/* right wall */}
      <path d="M360 0 L240 60 L240 250 L360 330 Z" fill="#2a2032" />
      {[40, 80, 120, 160, 200, 240].map((y) => (
        <path key={y} d={`M360 ${y} L240 ${60 + (y * 190) / 330}`} stroke="#1a1422" strokeWidth="2" />
      ))}
      {/* noodle neon sign */}
      <circle cx="300" cy="105" r="60" fill="url(#na-glow)" />
      <path d="M268 60 L330 40 L330 150 L268 160 Z" fill="#0B0E0F" stroke="#ff3df0" strokeWidth="2.5" />
      {["S", "U", "Y", "A"].map((ch, i) => (
        <text key={i} x={299} y={74 + i * 22} textAnchor="middle" fontSize="17" fontWeight="900" fill="#ff7af5" className="neon-flicker" style={{ animationDelay: `${i * 0.3}s` }}>
          {ch}
        </text>
      ))}
      {/* pipes */}
      <path d="M100 0 L100 240" stroke="#3d3346" strokeWidth="6" />
      <path d="M100 120 L120 120" stroke="#3d3346" strokeWidth="6" />
      {/* scorch mark (clue) */}
      <circle cx="72" cy="160" r="26" fill="url(#na-scorch)" />
      <path d="M72 140 L76 155 L92 152 L79 162 L88 176 L72 167 L58 178 L65 162 L52 153 L68 155 Z" fill="#141014" />
      {/* floor */}
      <path d="M0 330 L120 250 L240 250 L360 330 L360 400 L0 400 Z" fill="url(#na-floor)" />
      <path d="M180 250 L180 400" stroke="#2A323D" strokeWidth="2" strokeDasharray="8 10" />
      {/* chalk outline where Jax lay */}
      <path
        d="M150 300 q10 -14 22 -6 q6 -10 18 -4 l30 10 q12 2 6 10 l-26 2 l14 14 q4 8 -6 6 l-20 -12 l-24 10 q-10 2 -6 -8 l10 -10 z"
        fill="none"
        stroke="#e8e8e8"
        strokeWidth="2"
        strokeDasharray="5 3"
        opacity="0.7"
      />
      {/* puddle + boot print (clue) */}
      <ellipse cx="146" cy="352" rx="44" ry="13" fill="#2a1840" />
      <ellipse cx="146" cy="350" rx="30" ry="6" fill="#ff3df0" opacity="0.18" />
      <g transform="translate(146 352) rotate(-20)" fill="#0B0E0F">
        <rect x="-5" y="-12" width="10" height="14" rx="5" />
        <rect x="-4" y="4" width="8" height="7" rx="3.5" />
      </g>
      {/* receipt (clue) */}
      <path d="M212 310 L228 306 L234 320 L218 326 Z" fill="#f2f2e8" />
      <path d="M216 312 L227 309 M218 316 L229 313 M219 320 L226 318" stroke="#888" strokeWidth="1" />
      {/* dumpster + chip (clue) */}
      <path d="M256 222 L344 214 L344 274 L262 280 Z" fill="#1f5a3a" />
      <path d="M250 214 L350 204 L346 218 L254 226 Z" fill="#163f2a" />
      <text x="300" y="252" textAnchor="middle" fontSize="10" fontWeight="900" fill="#0f2e1f" transform="rotate(-4 300 252)">
        LAWMA
      </text>
      <circle cx="272" cy="284" r="6" fill="#141414" />
      <circle cx="334" cy="278" r="6" fill="#141414" />
      <rect x="292" y="286" width="13" height="10" rx="2" fill="#2b3440" stroke="#53FC18" strokeWidth="1.2" />
      <rect x="295" y="289" width="7" height="4" fill="#53FC18" opacity="0.7" />
      <Marker x={60} y={190} n={1} />
      <Marker x={240} y={330} n={2} />
      {cast && (
        <>
          <LabTech x={182} y={256} scale={0.55} delay="0.4s" />
          <Gumshoe x={44} y={392} scale={0.9} />
          <K9 x={92} y={396} scale={0.75} delay="0.8s" />
        </>
      )}
      {/* rain */}
      <g className="rain" stroke="#bfa8ff" strokeOpacity="0.35" strokeWidth="1.2">
        {Array.from({ length: 28 }, (_, i) => {
          const x = (i * 53) % 360;
          const y = (i * 97) % 400;
          return <path key={i} d={`M${x} ${y} l-4 14`} />;
        })}
      </g>
      <Tape y={28} tilt={-8} />
    </g>
  );
}

/* ---------------------------------------------------------------- Penthouse */

function Penthouse({ cast }: { cast: boolean }) {
  return (
    <g>
      <defs>
        <linearGradient id="ph-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1a2a2c" />
          <stop offset="1" stopColor="#223538" />
        </linearGradient>
        <linearGradient id="ph-night" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0a1030" />
          <stop offset="1" stopColor="#2a1a50" />
        </linearGradient>
        <radialGradient id="ph-light" cx="0.5" cy="0" r="0.8">
          <stop offset="0" stopColor="#ffe9a8" stopOpacity="0.35" />
          <stop offset="1" stopColor="#ffe9a8" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="360" height="400" fill="url(#ph-wall)" />
      {/* wainscoting */}
      {[30, 90, 150, 210, 270, 330].map((x) => (
        <rect key={x} x={x - 22} y="40" width="44" height="180" fill="none" stroke="#2c4447" strokeWidth="2" />
      ))}
      {/* window */}
      <rect x="70" y="48" width="180" height="150" fill="url(#ph-night)" stroke="#c9a34a" strokeWidth="5" />
      <circle cx="215" cy="78" r="12" fill="#f5f0d8" />
      <circle cx="210" cy="74" r="12" fill="#1a1440" />
      <path d="M72 198 L72 150 L92 150 L92 120 L110 120 L110 160 L128 160 L128 100 L150 100 L150 140 L170 140 L170 112 L192 112 L192 165 L212 165 L212 130 L232 130 L232 198 Z" fill="#0d1022" />
      {[[80, 160], [98, 130], [134, 110], [140, 130], [176, 120], [182, 150], [198, 172], [218, 140], [222, 160]].map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width="4" height="5" fill="#ffd36b" opacity="0.8" />
      ))}
      <path d="M160 48 L160 198 M70 123 L250 123" stroke="#c9a34a" strokeWidth="3" />
      {/* chandelier */}
      <rect width="360" height="300" fill="url(#ph-light)" />
      <path d="M180 0 L180 22" stroke="#c9a34a" strokeWidth="2" />
      <path d="M150 26 Q180 44 210 26" fill="none" stroke="#c9a34a" strokeWidth="3" />
      {[150, 165, 180, 195, 210].map((x, i) => (
        <g key={x}>
          <path d={`M${x} ${26 + (i === 2 ? 10 : i % 2 ? 7 : 0)} l0 10`} stroke="#ffe9a8" strokeWidth="1.5" />
          <circle cx={x} cy={38 + (i === 2 ? 10 : i % 2 ? 7 : 0)} r="2.5" fill="#fff6d0" className="sparkle" style={{ animationDelay: `${i * 0.25}s` }} />
        </g>
      ))}
      {/* camera (clue) */}
      <path d="M22 50 L64 50 L60 56 L26 56 Z" fill="#2b3440" />
      <path d="M30 56 Q43 82 56 56 Z" fill="#141a20" />
      <circle cx="43" cy="64" r="4" fill="#53FC18" className="neon-flicker" />
      {/* safe (clue) */}
      <rect x="270" y="118" width="66" height="68" rx="4" fill="#3b4148" stroke="#22272c" strokeWidth="3" />
      <rect x="278" y="126" width="50" height="52" fill="#101418" />
      <path d="M262 112 L240 122 L240 190 L262 196 Z" fill="#4c535b" stroke="#22272c" strokeWidth="2" />
      <circle cx="251" cy="155" r="7" fill="#22272c" stroke="#9aa3ab" strokeWidth="1.5" />
      <path d="M284 170 L298 132 M300 172 L318 140" stroke="#a87b2a" strokeWidth="2" opacity="0.6" />
      <path d="M266 192 l20 6 l-6 3 z" fill="#9aa3ab" />
      {/* floor + rug */}
      <rect x="0" y="220" width="360" height="180" fill="#3a2a22" />
      {[240, 270, 305, 345, 390].map((y) => (
        <path key={y} d={`M0 ${y} L360 ${y}`} stroke="#2e2019" strokeWidth="2" />
      ))}
      <ellipse cx="180" cy="320" rx="170" ry="62" fill="#5a1a2a" />
      <ellipse cx="180" cy="320" rx="150" ry="50" fill="none" stroke="#c9a34a" strokeWidth="2" strokeDasharray="6 4" />
      {/* gala table */}
      <ellipse cx="180" cy="266" rx="78" ry="18" fill="#f4f1ea" />
      <path d="M102 266 L108 310 Q180 326 252 310 L258 266 Q180 290 102 266 Z" fill="#e3ded2" />
      <path d="M150 256 l0 -16 m-4 0 l8 0 M206 258 l0 -18 m-4 0 l8 0" stroke="#bfe7ff" strokeWidth="2" />
      <ellipse cx="128" cy="262" rx="9" ry="3" fill="#c9a34a" />
      <path d="M128 262 l0 -20" stroke="#4a8a3a" strokeWidth="3" />
      <circle cx="128" cy="240" r="6" fill="#ff5a7a" />
      {/* tipped glass + spill (clue) */}
      <ellipse cx="172" cy="276" rx="26" ry="6" fill="#f0d36a" opacity="0.6" />
      <g transform="translate(170 272) rotate(-75)">
        <path d="M-6 -16 L6 -16 L3 0 L-3 0 Z" fill="#dff4ff" fillOpacity="0.7" stroke="#fff" strokeWidth="1" />
        <path d="M0 0 L0 10 M-5 10 L5 10" stroke="#fff" strokeWidth="1.5" />
        <path d="M-6 -16 L6 -16" stroke="#ff3a5a" strokeWidth="2" />
      </g>
      {/* torn ledger (clue) */}
      <path d="M44 330 L72 326 L76 350 L50 354 L48 346 L44 344 Z" fill="#f2ead2" />
      <path d="M50 334 L70 331 M51 340 L71 337 M52 346 L66 344" stroke="#7a6a4a" strokeWidth="1" />
      <Marker x={156} y={300} n={1} />
      <Marker x={88} y={352} n={2} />
      {cast && (
        <>
          <LabTech x={248} y={352} scale={0.72} delay="0.5s" flip />
          <Gumshoe x={316} y={396} scale={0.95} skin="#8D5524" coat="#2f3a4a" hat="#1b1b1b" flip />
        </>
      )}
      <Tape y={212} tilt={4} />
    </g>
  );
}

/* ---------------------------------------------------------------- Bank vault */

function BankVault({ cast }: { cast: boolean }) {
  return (
    <g>
      <defs>
        <linearGradient id="bv-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1b2530" />
          <stop offset="1" stopColor="#25313d" />
        </linearGradient>
        <radialGradient id="bv-gold" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffd36b" stopOpacity="0.9" />
          <stop offset="1" stopColor="#ffb000" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="360" height="400" fill="url(#bv-wall)" />
      {[0, 60, 120, 180, 240, 300].map((x) => (
        <rect key={x} x={x + 4} y="6" width="52" height="250" fill="none" stroke="#1a222b" strokeWidth="2" />
      ))}
      {/* vault opening + door */}
      <circle cx="170" cy="140" r="84" fill="#0d1218" stroke="#3b4652" strokeWidth="8" />
      <circle cx="170" cy="140" r="70" fill="url(#bv-gold)" />
      {[[140, 150], [158, 156], [176, 150], [194, 156], [150, 168], [170, 170], [190, 168]].map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x - 10} y={y} width="20" height="12" rx="2" fill="#e6b84a" stroke="#a87b2a" />
      ))}
      <g transform="translate(262 140)">
        <ellipse cx="0" cy="0" rx="28" ry="86" fill="#5a6672" stroke="#2b333b" strokeWidth="4" />
        <ellipse cx="-2" cy="0" rx="18" ry="60" fill="#6c7884" />
        <circle cx="-2" cy="0" r="12" fill="#3b4652" stroke="#9aa3ab" strokeWidth="2" />
        {[0, 60, 120].map((a) => (
          <path key={a} d="M-2 -20 L-2 20" stroke="#9aa3ab" strokeWidth="3" transform={`rotate(${a} -2 0)`} />
        ))}
      </g>
      <text x="170" y="44" textAnchor="middle" fontSize="11" fontWeight="900" fill="#9aa3ab" letterSpacing="2">
        VAULT 7
      </text>
      {/* floor */}
      <rect x="0" y="256" width="360" height="144" fill="#161d24" />
      {Array.from({ length: 7 }, (_, r) =>
        Array.from({ length: 9 }, (_, c) =>
          (r + c) % 2 ? null : <rect key={`${r}-${c}`} x={c * 40} y={256 + r * 22} width="40" height="22" fill="#1d262f" />,
        ),
      )}
      {/* laser emitter (clue) + grid */}
      <rect x="38" y="172" width="24" height="34" rx="3" fill="#2b333b" stroke="#53FC18" strokeWidth="1" />
      <circle cx="50" cy="182" r="3.5" fill="#ffb000" className="neon-flicker" />
      <circle cx="50" cy="196" r="3" fill="#ff2a2a" />
      <g className="laser" stroke="#ff2a2a" strokeWidth="1.6" opacity="0.8">
        <path d="M62 188 L360 150" />
        <path d="M62 196 L360 230" />
        <path d="M62 192 L360 196" />
        <path d="M62 200 L300 270" />
      </g>
      {/* control console (clue) */}
      <path d="M244 230 L344 230 L352 296 L236 296 Z" fill="#2b333b" />
      <rect x="254" y="200" width="44" height="32" rx="3" fill="#0B0E0F" stroke="#3b4652" strokeWidth="2" />
      <rect x="302" y="200" width="40" height="32" rx="3" fill="#0B0E0F" stroke="#3b4652" strokeWidth="2" />
      <text x="276" y="214" textAnchor="middle" fontSize="6.5" fontWeight="800" fill="#53FC18">TIME-LOCK</text>
      <text x="276" y="224" textAnchor="middle" fontSize="6.5" fontWeight="800" fill="#ffb000" className="neon-flicker">OVERRIDE</text>
      <path d="M306 224 l6 -8 l6 4 l6 -10 l8 6" stroke="#53FC18" strokeWidth="1.5" fill="none" />
      {[252, 266, 280, 294, 308, 322].map((x, i) => (
        <rect key={x} x={x} y="246" width="10" height="6" rx="1" fill={i === 2 ? "#53FC18" : "#4c5660"} />
      ))}
      {/* fake ID (clue) */}
      <g transform="translate(108 336) rotate(-12)">
        <rect x="-15" y="-10" width="30" height="20" rx="2.5" fill="#e8eef2" />
        <rect x="-12" y="-6" width="9" height="11" fill="#8D5524" />
        <path d="M0 -4 L11 -4 M0 0 L9 0 M0 4 L11 4" stroke="#7a8590" strokeWidth="1.4" />
        <circle cx="10" cy="-6" r="2.5" fill="#53FC18" opacity="0.7" />
      </g>
      {/* ace of spades (clue) */}
      <g transform="translate(209 348) rotate(18)">
        <rect x="-9" y="-13" width="18" height="26" rx="2" fill="#fff" stroke="#c0c0c0" />
        <path d="M0 -6 Q-7 1 -3 4 Q-1 5 -0.5 3 L-2 8 L2 8 L0.5 3 Q1 5 3 4 Q7 1 0 -6 Z" fill="#0B0E0F" />
      </g>
      <Marker x={136} y={330} n={1} />
      <Marker x={234} y={360} n={2} />
      <Tape y={384} tilt={-3} />
      {cast && (
        <>
          <Gumshoe x={40} y={396} scale={0.92} skin="#8D5524" coat="#1d2f5a" hat="#14213f" />
          <K9 x={314} y={392} scale={0.85} flip delay="0.6s" />
          <LabTech x={152} y={292} scale={0.6} delay="1s" />
        </>
      )}
    </g>
  );
}
