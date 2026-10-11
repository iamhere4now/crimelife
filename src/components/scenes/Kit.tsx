import type { KitProp, KitScene } from "@/lib/types";
import { Gumshoe, K9, LabTech } from "./Characters";

/**
 * Scene kit for the Naija Files: a backdrop plus props placed by percentage,
 * so each new location is a few lines of data instead of a hand-drawn scene.
 * Props are drawn centred on their (x, y) so clue hotspots land on them.
 */

const W = 360;
const H = 400;

export function KitSceneView({ kit, cast }: { kit: KitScene; cast: boolean }) {
  return (
    <g>
      {kit.backdrop.kind === "indoor" ? (
        <Indoor b={kit.backdrop} />
      ) : kit.backdrop.kind === "alley" ? (
        <Outdoor b={{ kind: "outdoor", sky: "night", ground: kit.backdrop.ground, horizon: "city" }} />
      ) : (
        <Outdoor b={kit.backdrop} />
      )}
      {kit.props.map((p, i) => (
        <Prop key={i} p={p} />
      ))}
      {cast && (
        <>
          {kit.castSide === "right" ? (
            <>
              <Gumshoe x={322} y={396} scale={0.8} flip />
              <K9 x={262} y={396} scale={0.65} flip delay="0.5s" />
            </>
          ) : (
            <>
              <Gumshoe x={38} y={396} scale={0.8} />
              <K9 x={98} y={396} scale={0.65} delay="0.5s" />
            </>
          )}
          {kit.tech && <LabTech x={kit.tech[0] * 3.6} y={kit.tech[1] * 4} scale={0.5} delay="0.9s" />}
        </>
      )}
    </g>
  );
}

/* ---------------------------------------------------------------- backdrops */

type IndoorB = Extract<KitScene["backdrop"], { kind: "indoor" }>;
type OutdoorB = Extract<KitScene["backdrop"], { kind: "outdoor" }>;

function Indoor({ b }: { b: IndoorB }) {
  return (
    <g>
      <rect width={W} height={H} fill={b.wall} />
      {Array.from({ length: 7 }, (_, i) => (
        <rect key={i} x={i * 56 - 8} y="0" width="2" height="262" fill="#000" opacity="0.12" />
      ))}
      {b.window && b.window !== "none" && <Window view={b.window} />}
      <rect x="0" y="258" width={W} height="6" fill={b.trim ?? "#c9a34a"} opacity="0.7" />
      <rect x="0" y="264" width={W} height="136" fill={b.floor} />
      {Array.from({ length: 6 }, (_, i) => (
        <path key={i} d={`M0 ${284 + i * 22} L${W} ${284 + i * 22}`} stroke="#000" strokeOpacity="0.15" />
      ))}
    </g>
  );
}

function Window({ view }: { view: "city-night" | "city-day" | "sea" | "hills" }) {
  const sky = { "city-night": "#0a1030", "city-day": "#8fd0ff", sea: "#8fd0ff", hills: "#bfe3ff" }[view];
  return (
    <g>
      <rect x="110" y="34" width="140" height="130" fill={sky} stroke="#c9a34a" strokeWidth="5" />
      {view.startsWith("city") && (
        <g fill={view === "city-night" ? "#0d1022" : "#5a6a7a"}>
          <path d="M112 162 L112 120 L132 120 L132 96 L150 96 L150 130 L170 130 L170 82 L188 82 L188 124 L208 124 L208 104 L228 104 L228 140 L248 140 L248 162 Z" />
          {view === "city-night" &&
            [[118, 128], [138, 104], [156, 138], [176, 92], [194, 132], [214, 112], [234, 146]].map(([x, y]) => (
              <rect key={`${x}`} x={x} y={y} width="4" height="5" fill="#ffd36b" />
            ))}
        </g>
      )}
      {view === "sea" && <rect x="112" y="110" width="136" height="52" fill="#1d6a9a" />}
      {view === "hills" && <path d="M112 162 Q150 100 190 140 Q220 110 248 150 L248 162 Z" fill="#3a8a4a" />}
      <path d="M180 34 L180 164 M110 99 L250 99" stroke="#c9a34a" strokeWidth="3" />
    </g>
  );
}

function Outdoor({ b }: { b: OutdoorB }) {
  const sky = {
    day: ["#6ec1ff", "#c8ecff"],
    dawn: ["#3a4a8a", "#ffb07a"],
    dusk: ["#2a1a4a", "#ff8a4a"],
    night: ["#070b1e", "#1a1f4a"],
  }[b.sky];
  const ground = { dirt: "#9a6a4a", sand: "#e8cf9a", grass: "#4a8a3a", road: "#2b2f36", concrete: "#7a8088", rails: "#6a5a4a", deck: "#c9a374" }[b.ground];
  const gid = `kit-sky-${b.sky}`;
  return (
    <g>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={sky[0]} />
          <stop offset="1" stopColor={sky[1]} />
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill={`url(#${gid})`} />
      {b.sky === "night" &&
        Array.from({ length: 30 }, (_, i) => <circle key={i} cx={(i * 67) % W} cy={(i * 29) % 170} r={i % 4 ? 1 : 1.6} fill="#fff" opacity="0.8" className="sparkle" />)}
      {b.sky === "night" ? <circle cx="290" cy="60" r="16" fill="#f5f0d8" /> : <circle cx="292" cy={b.sky === "day" ? 56 : 160} r="22" fill="#ffd36b" opacity="0.95" />}
      <Horizon kind={b.horizon ?? "none"} night={b.sky === "night"} />
      <rect x="0" y="222" width={W} height="178" fill={ground} />
      {b.ground === "road" && <path d="M0 330 L360 330" stroke="#f2f2e8" strokeWidth="3" strokeDasharray="22 16" />}
      {b.ground === "rails" &&
        (
          <g>
            {Array.from({ length: 14 }, (_, i) => (
              <rect key={i} x={i * 27} y="300" width="14" height="40" fill="#4a3424" />
            ))}
            <rect x="0" y="306" width={W} height="5" fill="#9aa3ab" />
            <rect x="0" y="330" width={W} height="5" fill="#9aa3ab" />
          </g>
        )}
      {b.ground === "sand" && <path d="M0 222 Q90 214 180 222 T360 222" stroke="#fff" strokeOpacity="0.5" strokeWidth="3" fill="none" />}
      {b.ground === "deck" &&
        Array.from({ length: 8 }, (_, i) => <path key={i} d={`M0 ${236 + i * 22} L360 ${236 + i * 22}`} stroke="#8a6a44" strokeWidth="2" />)}
    </g>
  );
}

function Horizon({ kind, night }: { kind: NonNullable<OutdoorB["horizon"]>; night: boolean }) {
  const dark = night ? "#0d1022" : "#4a5a6a";
  switch (kind) {
    case "city":
      return (
        <g fill={dark}>
          <path d="M0 222 L0 170 L24 170 L24 140 L44 140 L44 176 L70 176 L70 118 L92 118 L92 180 L120 180 L120 150 L146 150 L146 186 L176 186 L176 128 L200 128 L200 182 L230 182 L230 156 L258 156 L258 190 L290 190 L290 146 L316 146 L316 184 L340 184 L340 160 L360 160 L360 222 Z" />
          {night && [[30, 150], [78, 128], [100, 190], [184, 140], [240, 166], [300, 158]].map(([x, y]) => <rect key={`${x}`} x={x} y={y} width="4" height="5" fill="#ffd36b" />)}
        </g>
      );
    case "sea":
    case "mainland":
      return (
        <g>
          <rect x="0" y="176" width={W} height="46" fill={night ? "#0a2a4a" : "#1d6a9a"} />
          {[186, 198, 210].map((y) => (
            <path key={y} d={`M${y % 50} ${y} l50 0 M${180 + (y % 40)} ${y + 4} l60 0`} stroke="#fff" strokeOpacity="0.35" strokeWidth="1.5" />
          ))}
        </g>
      );
    case "hills":
      return <path d="M0 222 Q60 150 130 200 Q200 130 270 196 Q320 160 360 190 L360 222 Z" fill={night ? "#14261a" : "#3a7a3a"} />;
    case "rocks":
      return (
        <g fill={night ? "#2a2a3a" : "#8a7a6a"}>
          <ellipse cx="60" cy="210" rx="56" ry="36" />
          <ellipse cx="110" cy="196" rx="30" ry="34" />
          <ellipse cx="300" cy="206" rx="64" ry="34" />
          <ellipse cx="250" cy="200" rx="24" ry="26" />
        </g>
      );
    case "savanna":
      return (
        <g fill={night ? "#1a1a14" : "#5a5a2a"}>
          <rect x="0" y="210" width={W} height="12" />
          {[60, 230, 320].map((x) => (
            <g key={x}>
              <rect x={x - 2} y="176" width="4" height="36" />
              <ellipse cx={x} cy="174" rx="26" ry="8" />
            </g>
          ))}
        </g>
      );
    case "bridge":
      return (
        <g>
          <rect x="0" y="176" width={W} height="46" fill={night ? "#0a2a4a" : "#1d6a9a"} />
          <path d="M240 222 L250 60 L262 60 L272 222 Z" fill="#cfd6dc" />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <path key={i} d={`M256 ${70 + i * 8} L${40 + i * 30} 214 M256 ${70 + i * 8} L${360 - i * 4} ${214 - i * 2}`} stroke="#e8eef2" strokeWidth="1.2" opacity="0.8" />
          ))}
          <rect x="0" y="212" width={W} height="10" fill="#9aa3ab" />
        </g>
      );
    default:
      return null;
  }
}

/* ---------------------------------------------------------------- props */

function Prop({ p }: { p: KitProp }) {
  const s = p.s ?? 1;
  return (
    <g transform={`translate(${(p.x / 100) * W} ${(p.y / 100) * H}) scale(${p.flip ? -s : s} ${s})`}>
      <PropArt kind={p.kind} color={p.color ?? "#53FC18"} />
    </g>
  );
}

function PropArt({ kind, color }: { kind: KitProp["kind"]; color: string }) {
  switch (kind) {
    case "desk":
      return (
        <g>
          <rect x="-50" y="-10" width="100" height="10" fill="#6a4a2a" />
          <rect x="-46" y="0" width="8" height="36" fill="#4a2a10" />
          <rect x="38" y="0" width="8" height="36" fill="#4a2a10" />
          <rect x="-30" y="0" width="40" height="22" fill="#5a3a1a" />
        </g>
      );
    case "door":
      return (
        <g>
          <rect x="-24" y="-60" width="48" height="120" fill={color} stroke="#1a1a1a" strokeWidth="3" />
          <rect x="-16" y="-50" width="32" height="44" fill="#000" opacity="0.15" />
          <rect x="12" y="2" width="8" height="14" rx="2" fill="#1a1a1a" />
          <circle cx="16" cy="6" r="2" fill="#53FC18" className="neon-flicker" />
        </g>
      );
    case "bookshelf":
      return (
        <g>
          <rect x="-40" y="-70" width="80" height="140" fill="#5a3a1a" />
          {[0, 1, 2, 3].map((r) =>
            Array.from({ length: 7 }, (_, c) => (
              <rect key={`${r}-${c}`} x={-36 + c * 10.5} y={-64 + r * 34} width="8" height="28" fill={["#c0182b", "#1d6a8a", "#f5c518", "#3a8a4a", "#7a3aff"][(r + c) % 5]} />
            )),
          )}
        </g>
      );
    case "cabinet":
      return (
        <g>
          <rect x="-22" y="-40" width="44" height="80" fill="#6c7884" stroke="#2b3238" strokeWidth="2" />
          {[-28, -2, 24].map((y) => (
            <g key={y}>
              <rect x="-18" y={y - 8} width="36" height="22" fill="#5a6672" />
              <rect x="-6" y={y} width="12" height="3" fill="#cfd6dc" />
            </g>
          ))}
        </g>
      );
    case "clock":
      return (
        <g>
          <rect x="-20" y="-44" width="40" height="88" rx="8" fill="#6a4a2a" stroke="#c9a34a" strokeWidth="2" />
          <circle cx="0" cy="-20" r="15" fill="#f2ead2" stroke="#c9a34a" strokeWidth="2" />
          <path d="M0 -20 L0 -32 M0 -20 L1 -18" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" />
          <path d="M0 4 L0 26" stroke="#c9a34a" strokeWidth="2" />
          <circle cx="0" cy="28" r="6" fill="#e6c35a" />
        </g>
      );
    case "cog":
      return (
        <g>
          {Array.from({ length: 8 }, (_, i) => (
            <rect key={i} x="-3" y="-15" width="6" height="8" fill="#c9a34a" transform={`rotate(${i * 45})`} />
          ))}
          <circle r="10" fill="#e6c35a" stroke="#8a6a2a" strokeWidth="2" />
          <circle r="3" fill="#8a6a2a" />
        </g>
      );
    case "safe":
      return (
        <g>
          <rect x="-28" y="-30" width="56" height="60" rx="4" fill="#3b4148" stroke="#22272c" strokeWidth="3" />
          <circle cx="0" cy="0" r="10" fill="#22272c" stroke="#9aa3ab" strokeWidth="2" />
          <path d="M0 -8 L0 8 M-8 0 L8 0" stroke="#9aa3ab" strokeWidth="2" />
        </g>
      );
    case "cctv":
      return (
        <g>
          <rect x="-4" y="-16" width="8" height="12" fill="#2b3440" />
          <rect x="-20" y="-6" width="34" height="14" rx="3" fill="#cfd6dc" transform="rotate(14)" />
          <circle cx="12" cy="8" r="3" fill="#ff2a2a" className="neon-flicker" />
        </g>
      );
    case "laptop":
      return (
        <g>
          <path d="M-22 -20 L22 -20 L22 6 L-22 6 Z" fill="#1a1a1a" stroke="#4c5660" strokeWidth="2" />
          <rect x="-18" y="-16" width="36" height="18" fill={color} opacity="0.75" />
          <path d="M-28 6 L28 6 L32 12 L-32 12 Z" fill="#6c7884" />
        </g>
      );
    case "phone":
      return (
        <g>
          <rect x="-8" y="-14" width="16" height="28" rx="3" fill="#1a1a1a" />
          <rect x="-6" y="-11" width="12" height="20" fill={color} opacity="0.8" />
        </g>
      );
    case "paper":
      return (
        <g transform="rotate(-8)">
          <rect x="-14" y="-10" width="28" height="20" fill="#f2ead2" />
          <path d="M-10 -5 L10 -5 M-10 0 L8 0 M-10 5 L6 5" stroke="#7a6a4a" strokeWidth="1.2" />
        </g>
      );
    case "inhaler":
      return (
        <g>
          <rect x="-5" y="-14" width="10" height="20" rx="3" fill="#1d6a8a" />
          <rect x="-8" y="4" width="16" height="8" rx="2" fill="#9fd4ff" />
        </g>
      );
    case "stall":
      return (
        <g>
          <path d="M-44 -50 L44 -50 L50 -36 L-50 -36 Z" fill={color} />
          <rect x="-46" y="-36" width="4" height="70" fill="#5a3a1a" />
          <rect x="42" y="-36" width="4" height="70" fill="#5a3a1a" />
          <rect x="-46" y="0" width="92" height="10" fill="#8a6a3a" />
          {[-34, -16, 2, 20].map((x, i) => (
            <rect key={x} x={x} y="-14" width="14" height="14" rx="3" fill={["#f5c518", "#c0182b", "#e8e0d0", "#3a8a4a"][i]} />
          ))}
        </g>
      );
    case "sack":
      return (
        <g>
          <path d="M-18 20 Q-22 -10 -12 -20 L12 -20 Q22 -10 18 20 Z" fill="#d8c8a0" stroke="#a8946a" strokeWidth="2" />
          <path d="M-12 -20 Q0 -28 12 -20" stroke="#a8946a" strokeWidth="2" fill="none" />
        </g>
      );
    case "pyramid":
      return (
        <g>
          {[0, 1, 2, 3].map((r) => (
            <rect key={r} x={-40 + r * 10} y={20 - r * 14} width={80 - r * 20} height="14" fill="#e8cf9a" stroke="#a8946a" strokeWidth="1.5" />
          ))}
        </g>
      );
    case "hole":
      return (
        <g>
          <ellipse rx="26" ry="10" fill="#1a120a" />
          <ellipse cx="0" cy="-4" rx="34" ry="6" fill="#6a4a2a" opacity="0.6" />
        </g>
      );
    case "suv":
      return (
        <g>
          <path d="M-70 10 L-64 -20 L-38 -36 L34 -36 L56 -16 L72 -12 L74 10 Z" fill={color} />
          <path d="M-34 -32 L-12 -32 L-12 -16 L-50 -16 Z M-6 -32 L28 -32 L44 -16 L-6 -16 Z" fill="#9fd4ff" opacity="0.7" />
          <circle cx="-42" cy="12" r="12" fill="#141414" />
          <circle cx="44" cy="12" r="12" fill="#141414" />
          <ellipse cx="70" cy="-4" rx="5" ry="3" fill="#ffe08a" className="neon-flicker" />
          <path d="M-74 2 Q-86 -2 -92 -10" stroke="#cfd6dc" strokeWidth="3" fill="none" opacity="0.6" className="sparkle" />
        </g>
      );
    case "ladder":
      return (
        <g stroke="#c9a374" strokeWidth="2">
          <path d="M-6 -30 L-6 40 M6 -30 L6 40" />
          {[-22, -10, 2, 14, 26].map((y) => (
            <path key={y} d={`M-6 ${y} L6 ${y}`} />
          ))}
        </g>
      );
    case "boat":
      return (
        <g>
          <path d="M-40 -4 L40 -4 L30 12 L-30 12 Z" fill="#ffffff" stroke="#1d2f5a" strokeWidth="2" />
          <rect x="-12" y="-16" width="24" height="12" fill="#1d2f5a" />
          <path d="M-44 14 Q0 22 44 14" stroke="#ffffff" strokeOpacity="0.6" strokeWidth="2" fill="none" />
        </g>
      );
    case "dining":
      return (
        <g>
          <ellipse cx="0" cy="0" rx="90" ry="22" fill="#f4f1ea" />
          <path d="M-90 0 L-86 30 Q0 44 86 30 L90 0 Q0 26 -90 0 Z" fill="#e3ded2" />
          {[-66, -40, -14, 12, 38, 64].map((x) => (
            <g key={x}>
              <ellipse cx={x} cy={-4} rx="9" ry="4" fill="#ffffff" stroke="#c9a34a" />
              <ellipse cx={x} cy={-5} rx="5" ry="2" fill="#d9481a" />
            </g>
          ))}
          <path d="M-4 -18 L-4 -4 M4 -18 L4 -4" stroke="#e6c35a" strokeWidth="2" />
          <circle cx="0" cy="-22" r="4" fill="#ffd36b" className="sparkle" />
        </g>
      );
    case "chandelier":
      return (
        <g>
          <path d="M0 -40 L0 -14" stroke="#c9a34a" strokeWidth="2" />
          <path d="M-30 -10 Q0 10 30 -10" stroke="#c9a34a" strokeWidth="3" fill="none" />
          {[-30, -15, 0, 15, 30].map((x) => (
            <circle key={x} cx={x} cy={x === 0 ? 4 : Math.abs(x) === 15 ? 0 : -8} r="3.5" fill="#fff6d0" className="sparkle" />
          ))}
        </g>
      );
    case "knife":
      return (
        <g transform="rotate(-20)">
          <path d="M-16 -2 L12 -2 L16 0 L12 2 L-16 2 Z" fill="#cfd6dc" />
          <rect x="-26" y="-3" width="10" height="6" rx="2" fill="#4a2a10" />
        </g>
      );
    case "books":
      return (
        <g>
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={-20 + i * 2} y={8 - i * 7} width="40" height="7" fill={["#c0182b", "#1d6a8a", "#f5c518", "#3a8a4a"][i]} transform={`rotate(${(i % 2 ? 4 : -3) * 1})`} />
          ))}
        </g>
      );
    case "lamp":
      return (
        <g>
          <path d="M-14 -20 L14 -20 L8 -6 L-8 -6 Z" fill="#3a8a4a" />
          <path d="M0 -6 L0 14 M-10 16 L10 16" stroke="#c9a34a" strokeWidth="3" />
          <path d="M-14 -6 L-30 30 L30 30 L14 -6 Z" fill="#ffe9a8" opacity="0.18" />
        </g>
      );
    case "cup":
      return (
        <g>
          <path d="M-8 -10 L8 -10 L6 10 L-6 10 Z" fill={color} opacity="0.9" />
          <ellipse cx="0" cy="-10" rx="8" ry="2" fill="#7a1a3a" />
        </g>
      );
    case "vault":
      return (
        <g>
          <circle r="62" fill="#5a6672" stroke="#2b333b" strokeWidth="6" />
          <circle r="44" fill="#6c7884" />
          <circle r="14" fill="#3b4652" stroke="#9aa3ab" strokeWidth="3" />
          {[0, 60, 120].map((a) => (
            <path key={a} d="M0 -28 L0 28" stroke="#9aa3ab" strokeWidth="4" transform={`rotate(${a})`} />
          ))}
        </g>
      );
    case "pedestal":
      return (
        <g>
          <rect x="-22" y="-10" width="44" height="60" fill="#e8e0d0" />
          <rect x="-26" y="-14" width="52" height="6" fill="#f4efe6" />
          <rect x="-24" y="-56" width="48" height="42" fill="#bfe7ff" fillOpacity="0.18" stroke="#dff4ff" strokeWidth="1.5" />
        </g>
      );
    case "terracotta":
      return (
        <g>
          <ellipse cx="0" cy="-2" rx="14" ry="18" fill="#b5653a" />
          <path d="M-14 -8 Q0 -26 14 -8" fill="#8a4a2a" />
          <path d="M-7 -2 L-2 -2 M3 -2 L8 -2" stroke="#3a1a0a" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="-4" cy="-2" r="2" fill="#1a0a05" />
          <circle cx="5" cy="-2" r="2" fill="#1a0a05" />
          <path d="M-4 8 Q1 11 6 8" stroke="#3a1a0a" strokeWidth="1.5" fill="none" />
        </g>
      );
    case "panel":
      return (
        <g>
          <rect x="-20" y="-24" width="40" height="48" rx="3" fill="#1a1a1a" stroke="#4c5660" strokeWidth="2" />
          <rect x="-15" y="-19" width="30" height="16" fill={color} opacity="0.75" />
          {[-12, -2, 8].map((x) => [4, 12].map((y) => <rect key={`${x}-${y}`} x={x} y={y} width="6" height="5" fill="#6c7884" />))}
        </g>
      );
    case "hut":
      return (
        <g>
          <rect x="-34" y="-20" width="68" height="46" fill="#b5803a" />
          <path d="M-46 -18 L0 -62 L46 -18 Z" fill="#c9a34a" stroke="#8a6a2a" strokeWidth="2" />
          <rect x="-10" y="0" width="20" height="26" fill="#3a2a1a" />
        </g>
      );
    case "goat":
      return (
        <g>
          <ellipse cx="0" cy="0" rx="18" ry="10" fill="#f2f2e8" />
          <circle cx="18" cy="-10" r="7" fill="#f2f2e8" />
          <path d="M16 -16 L12 -24 M20 -16 L22 -24" stroke="#8a7a6a" strokeWidth="2" />
          <path d="M-10 8 L-10 18 M-2 8 L-2 18 M6 8 L6 18 M12 8 L12 18" stroke="#4a3a2a" strokeWidth="2.5" />
          <circle cx="20" cy="-11" r="1.4" fill="#141414" />
        </g>
      );
    case "stake":
      return (
        <g>
          <path d="M0 -24 L0 20" stroke="#c9a374" strokeWidth="4" />
          <path d="M0 -24 L16 -18 L0 -12 Z" fill="#ff7a3a" />
        </g>
      );
    case "easel":
      return (
        <g>
          <path d="M-26 50 L0 -56 L26 50 M0 -56 L0 50" stroke="#8a6a3a" strokeWidth="4" />
          <rect x="-36" y="-44" width="72" height="56" fill="#f2ead2" stroke="#6a4a2a" strokeWidth="3" />
          <path d="M-28 4 Q-10 -30 6 -10 Q18 4 28 -24" stroke={color} strokeWidth="5" fill="none" strokeLinecap="round" />
          <circle cx="-14" cy="-24" r="8" fill="#c0182b" opacity="0.8" />
        </g>
      );
    case "paint":
      return (
        <g>
          <ellipse rx="24" ry="14" fill="#c9a374" />
          {[[-12, -4, "#c0182b"], [-2, -8, "#53FC18"], [9, -4, "#1d6a8a"], [12, 5, "#f5c518"]].map(([x, y, c]) => (
            <circle key={`${x}`} cx={x as number} cy={y as number} r="4" fill={c as string} />
          ))}
          <rect x="16" y="2" width="16" height="6" rx="2" fill="#53FC18" transform="rotate(20)" />
        </g>
      );
    case "carriage":
      return (
        <g>
          <rect x="-110" y="-56" width="220" height="80" rx="8" fill={color} />
          <rect x="-110" y="0" width="220" height="8" fill="#1a1a1a" opacity="0.4" />
          {[-90, -54, -18, 18, 54].map((x) => (
            <rect key={x} x={x} y="-44" width="28" height="26" rx="3" fill="#20262e" />
          ))}
          <rect x="88" y="-46" width="16" height="62" fill="#20262e" />
          {[-80, 80].map((x) => (
            <circle key={x} cx={x} cy="30" r="12" fill="#141414" />
          ))}
          <rect x="108" y="10" width="20" height="8" fill="#6c7884" />
        </g>
      );
    case "coupling":
      return (
        <g>
          <rect x="-16" y="-6" width="32" height="12" rx="3" fill="#6c7884" stroke="#2b3238" strokeWidth="2" />
          <circle cx="0" cy="0" r="4" fill="#1a1a1a" />
        </g>
      );
    case "luggage":
      return (
        <g>
          <rect x="-18" y="-14" width="36" height="28" rx="4" fill={color} stroke="#1a1a1a" strokeWidth="2" />
          <path d="M-8 -14 L-8 -20 L8 -20 L8 -14" stroke="#1a1a1a" strokeWidth="2.5" fill="none" />
          <rect x="-26" y="-6" width="12" height="20" rx="3" fill="#c9a34a" />
        </g>
      );
    case "throne":
      return (
        <g>
          <path d="M-34 40 L-34 -50 Q0 -80 34 -50 L34 40 Z" fill="#c9a34a" />
          <path d="M-24 34 L-24 -42 Q0 -64 24 -42 L24 34 Z" fill="#8a1a2a" />
          <rect x="-40" y="0" width="80" height="14" fill="#e6c35a" />
          {[-20, 0, 20].map((x) => (
            <circle key={x} cx={x} cy="-54" r="4" fill="#c0182b" />
          ))}
        </g>
      );
    case "cushion":
      return (
        <g>
          <ellipse rx="26" ry="10" fill="#8a1a2a" stroke="#e6c35a" strokeWidth="2" />
          <path d="M-12 -2 Q0 -6 12 -2" stroke="#e6c35a" strokeWidth="1" fill="none" strokeDasharray="2 2" />
        </g>
      );
    case "gourd":
      return (
        <g>
          <circle cx="0" cy="6" r="14" fill="#c9a374" stroke="#8a6a3a" strokeWidth="2" />
          <circle cx="0" cy="-12" r="7" fill="#c9a374" stroke="#8a6a3a" strokeWidth="2" />
          <rect x="-3" y="-22" width="6" height="6" fill="#6a4a2a" />
        </g>
      );
    case "bonfire":
      return (
        <g>
          <path d="M-26 14 L26 4 M-26 4 L26 14" stroke="#5a3a1a" strokeWidth="6" strokeLinecap="round" />
          <path d="M-16 8 Q-20 -20 -2 -36 Q-6 -16 6 -24 Q18 -6 14 8 Z" fill="#ff7a1a" className="neon-flicker" />
          <path d="M-6 8 Q-8 -10 2 -18 Q4 -6 8 8 Z" fill="#ffd36b" />
        </g>
      );
    case "drum":
      return (
        <g>
          <path d="M-14 -24 L14 -24 L10 24 L-10 24 Z" fill="#8a4a2a" />
          <ellipse cx="0" cy="-24" rx="14" ry="5" fill="#f2ead2" />
          <path d="M-12 -20 L10 20 M12 -20 L-10 20" stroke="#e8e0d0" strokeWidth="1" opacity="0.7" />
        </g>
      );
    case "guitar":
      return (
        <g transform="rotate(-30)">
          <ellipse cx="0" cy="10" rx="14" ry="16" fill="#b5653a" />
          <circle cx="0" cy="8" r="4" fill="#1a1a1a" />
          <rect x="-3" y="-36" width="6" height="36" fill="#5a3a1a" />
        </g>
      );
    case "server":
      return (
        <g>
          <rect x="-24" y="-70" width="48" height="140" fill="#1d2328" stroke="#3b4652" strokeWidth="2" />
          {Array.from({ length: 8 }, (_, i) => (
            <g key={i}>
              <rect x="-20" y={-64 + i * 17} width="40" height="12" fill="#2b3238" />
              <circle cx="14" cy={-58 + i * 17} r="2" fill={i % 3 ? color : "#ff2a2a"} className="neon-flicker" />
            </g>
          ))}
        </g>
      );
    case "smashed":
      return (
        <g>
          <rect x="-24" y="-40" width="48" height="110" fill="#1d2328" stroke="#3b4652" strokeWidth="2" transform="rotate(-14)" />
          {[[-30, 60], [-10, 66], [16, 58], [30, 66]].map(([x, y], i) => (
            <path key={i} d={`M${x} ${y} l8 -6 l6 8 z`} fill="#6c7884" />
          ))}
        </g>
      );
    case "chair":
      return (
        <g>
          <rect x="-16" y="-40" width="32" height="34" rx="4" fill={color} />
          <rect x="-18" y="-6" width="36" height="8" fill={color} />
          <path d="M-14 2 L-14 30 M14 2 L14 30" stroke="#1a1a1a" strokeWidth="3" />
        </g>
      );
    case "spray":
      return (
        <g>
          <rect x="-7" y="-16" width="14" height="30" rx="3" fill="#c0182b" />
          <rect x="-4" y="-22" width="8" height="6" fill="#cfd6dc" />
          <path d="M-14 -24 L-6 -20" stroke="#cfd6dc" strokeWidth="2" opacity="0.6" />
        </g>
      );
    case "banquet":
      return (
        <g>
          <rect x="-110" y="-8" width="220" height="14" fill="#f4f1ea" />
          <rect x="-110" y="6" width="220" height="30" fill="#e3ded2" />
          {[-90, -54, -18, 18, 54, 90].map((x) => (
            <g key={x}>
              <ellipse cx={x} cy={-10} rx="12" ry="5" fill="#ffffff" stroke="#c9a34a" />
              <ellipse cx={x} cy={-11} rx="7" ry="2.5" fill="#c0182b" />
            </g>
          ))}
        </g>
      );
    case "bowl":
      return (
        <g>
          <path d="M-18 -4 Q0 22 18 -4 Z" fill="#ffffff" stroke="#c9a34a" strokeWidth="1.5" />
          <ellipse cx="0" cy="-4" rx="18" ry="4" fill="#c0182b" />
          <path d="M-6 -12 Q-8 -20 -4 -26 M4 -12 Q2 -20 6 -26" stroke="#fff" strokeOpacity="0.5" strokeWidth="1.5" fill="none" className="sparkle" />
        </g>
      );
    case "coatrack":
      return (
        <g>
          <path d="M0 -60 L0 50 M-14 50 L14 50" stroke="#5a3a1a" strokeWidth="4" />
          <path d="M-14 -40 Q-22 -20 -16 10 L-4 10 L-6 -40 Z" fill={color} />
        </g>
      );
    case "plant":
      return (
        <g>
          <path d="M-10 30 L10 30 L8 10 L-8 10 Z" fill="#b5653a" />
          {[-30, -10, 10, 30].map((a) => (
            <path key={a} d="M0 10 Q4 -14 0 -30" stroke="#3a8a4a" strokeWidth="6" fill="none" strokeLinecap="round" transform={`rotate(${a})`} />
          ))}
        </g>
      );
    case "orchid":
      return (
        <g>
          <path d="M0 30 L0 -10" stroke="#3a8a4a" strokeWidth="3" />
          {[0, 72, 144, 216, 288].map((a) => (
            <ellipse key={a} cx="0" cy="-20" rx="5" ry="10" fill={color} transform={`rotate(${a} 0 -14)`} />
          ))}
          <circle cx="0" cy="-14" r="4" fill="#f5c518" />
        </g>
      );
    case "tank":
      return (
        <g>
          <rect x="-24" y="-40" width="48" height="80" rx="10" fill="#1d4a8a" />
          <rect x="-24" y="0" width="48" height="40" fill="#1d4a8a" opacity="0.4" />
          <path d="M-24 -10 L24 -10" stroke="#9fd4ff" strokeWidth="2" strokeDasharray="4 3" />
        </g>
      );
    case "greenhouse":
      return (
        <g>
          <path d="M-150 60 L-150 -40 Q0 -110 150 -40 L150 60 Z" fill="#bfe7ff" fillOpacity="0.15" stroke="#dff4ff" strokeWidth="3" />
          {[-100, -50, 0, 50, 100].map((x) => (
            <path key={x} d={`M${x} 60 L${x} ${-40 - (50 - Math.abs(x) / 3)}`} stroke="#dff4ff" strokeWidth="2" opacity="0.6" />
          ))}
        </g>
      );
    case "arch":
      return (
        <g>
          <path d="M-60 60 L-60 -20 Q0 -90 60 -20 L60 60" stroke="#f2f2e8" strokeWidth="10" fill="none" />
          {Array.from({ length: 12 }, (_, i) => {
            const a = Math.PI - (i / 11) * Math.PI;
            return <circle key={i} cx={Math.cos(a) * 60} cy={-20 - Math.sin(a) * 50} r="7" fill={i % 2 ? color : "#ffffff"} />;
          })}
        </g>
      );
    case "seats":
      return (
        <g>
          {[0, 1].map((r) =>
            Array.from({ length: 6 }, (_, c) => (
              <rect key={`${r}-${c}`} x={-100 + c * 34 + r * 6} y={r * 30} width="28" height="24" rx="4" fill={color} opacity={1 - r * 0.2} />
            )),
          )}
        </g>
      );
    case "cake":
      return (
        <g>
          <rect x="-22" y="0" width="44" height="30" fill="#f2f2e8" />
          <rect x="-16" y="-24" width="32" height="24" fill="#f2f2e8" />
          <rect x="-10" y="-42" width="20" height="18" fill="#f2f2e8" />
          <path d="M-22 14 L22 14 M-16 -10 L16 -10" stroke="#e6c35a" strokeWidth="2" />
        </g>
      );
    case "jewelbox":
      return (
        <g>
          <rect x="-18" y="-6" width="36" height="20" rx="3" fill="#8a1a2a" stroke="#e6c35a" strokeWidth="2" />
          <path d="M-18 -6 L-14 -22 L22 -22 L18 -6" fill="#a8243a" stroke="#e6c35a" strokeWidth="2" />
        </g>
      );
    case "camera":
      return (
        <g>
          <rect x="-16" y="-10" width="32" height="22" rx="3" fill="#2b2f36" />
          <circle cx="2" cy="1" r="7" fill="#1a1a1a" stroke={color} strokeWidth="2" />
          <rect x="-12" y="-14" width="8" height="5" fill="#2b2f36" />
        </g>
      );
    case "yacht":
      return (
        <g>
          <path d="M-150 10 L150 10 L120 50 L-130 50 Z" fill="#ffffff" stroke="#1d2f5a" strokeWidth="3" />
          <rect x="-60" y="-34" width="120" height="44" rx="6" fill="#f2f2e8" stroke="#1d2f5a" strokeWidth="2" />
          {[-44, -16, 12, 40].map((x) => (
            <rect key={x} x={x - 10} y="-24" width="20" height="14" rx="3" fill="#20262e" />
          ))}
          <path d="M0 -34 L0 -90" stroke="#9aa3ab" strokeWidth="3" />
        </g>
      );
    case "chess":
      return (
        <g>
          <rect x="-24" y="-24" width="48" height="48" fill="#f2ead2" stroke="#5a3a1a" strokeWidth="3" />
          {Array.from({ length: 16 }, (_, i) => {
            const r = Math.floor(i / 4);
            const c = i % 4;
            return (r + c) % 2 ? <rect key={i} x={-24 + c * 12} y={-24 + r * 12} width="12" height="12" fill="#5a3a1a" /> : null;
          })}
          <circle cx="-6" cy="-6" r="4" fill="#ffffff" stroke="#1a1a1a" />
          <circle cx="6" cy="10" r="4" fill="#1a1a1a" />
          <path d="M14 -16 l3 -6 l3 6 z" fill="#1a1a1a" />
        </g>
      );
    case "lifebuoy":
      return (
        <g>
          <circle r="18" fill="none" stroke="#ff4a1a" strokeWidth="9" />
          {[0, 90, 180, 270].map((a) => (
            <rect key={a} x="-4" y="-22" width="8" height="9" fill="#ffffff" transform={`rotate(${a + 45})`} />
          ))}
        </g>
      );
    case "console":
      return (
        <g>
          <path d="M-90 10 L90 10 L80 40 L-80 40 Z" fill="#2b2f36" />
          <rect x="-60" y="-50" width="120" height="56" rx="4" fill="#0b0e0f" stroke="#4c5660" strokeWidth="3" />
          <text x="0" y="-26" textAnchor="middle" fontSize="10" fontWeight="900" fill="#ff3b4e" className="neon-flicker">END OF</text>
          <text x="0" y="-12" textAnchor="middle" fontSize="10" fontWeight="900" fill="#ff3b4e" className="neon-flicker">TRANSMISSION</text>
          {Array.from({ length: 10 }, (_, i) => (
            <rect key={i} x={-76 + i * 16} y="18" width="6" height="14" rx="2" fill={i % 3 ? "#6c7884" : color} />
          ))}
        </g>
      );
    case "mic":
      return (
        <g>
          <rect x="-7" y="-26" width="14" height="22" rx="7" fill="#4c5660" stroke="#1a1a1a" strokeWidth="2" />
          <path d="M0 -4 L0 26 M-12 26 L12 26" stroke="#1a1a1a" strokeWidth="3" />
        </g>
      );
    case "onair":
      return (
        <g>
          <rect x="-30" y="-10" width="60" height="20" rx="4" fill="#2a1416" stroke="#5a2026" strokeWidth="2" />
          <text x="0" y="5" textAnchor="middle" fontSize="10" fontWeight="900" fill="#5a2026">ON AIR</text>
        </g>
      );
    case "crate":
      return (
        <g>
          <rect x="-28" y="-20" width="56" height="40" fill="#a8783a" stroke="#6a4a20" strokeWidth="2" />
          <path d="M-28 -20 L28 20 M28 -20 L-28 20" stroke="#6a4a20" strokeWidth="2" />
        </g>
      );
    case "crane":
      return (
        <g>
          <path d="M0 80 L0 -120" stroke={color} strokeWidth="8" />
          <path d="M-10 -120 L120 -120" stroke={color} strokeWidth="6" />
          <path d="M-4 80 L4 -110 M4 80 L-4 -110" stroke="#1a1a1a" strokeWidth="1" opacity="0.4" />
          <path d="M100 -120 L100 -50" stroke="#1a1a1a" strokeWidth="1.5" />
          <rect x="92" y="-50" width="16" height="10" fill="#6c7884" />
        </g>
      );
    case "lunchbox":
      return (
        <g>
          <rect x="-16" y="-8" width="32" height="18" rx="4" fill={color} stroke="#1a1a1a" strokeWidth="1.5" />
          <path d="M-6 -8 L-6 -14 L6 -14 L6 -8" stroke="#1a1a1a" strokeWidth="2" fill="none" />
        </g>
      );
    case "hardhat":
      return (
        <g>
          <path d="M-18 4 Q-18 -16 0 -16 Q18 -16 18 4 Z" fill="#f5c518" />
          <rect x="-22" y="2" width="44" height="5" rx="2" fill="#e0a818" />
        </g>
      );
    case "mixer":
      return (
        <g>
          <ellipse cx="0" cy="-10" rx="30" ry="24" fill="#ff7a1a" transform="rotate(-20)" />
          <rect x="-36" y="10" width="72" height="12" fill="#4c5660" />
          {[-24, 24].map((x) => (
            <circle key={x} cx={x} cy="26" r="8" fill="#141414" />
          ))}
        </g>
      );
    case "screen":
      return (
        <g>
          <rect x="-130" y="-70" width="260" height="130" fill="#1a1a1a" />
          {Array.from({ length: 160 }, (_, i) => (
            <rect key={i} x={-126 + ((i * 37) % 252)} y={-66 + ((i * 53) % 122)} width="4" height="3" fill="#ffffff" opacity={((i * 13) % 10) / 12} className={i % 7 ? "" : "sparkle"} />
          ))}
        </g>
      );
    case "popcorn":
      return (
        <g>
          <path d="M-12 -10 L12 -10 L8 16 L-8 16 Z" fill="#ffffff" />
          {[-8, -2, 4, 10].map((x) => (
            <path key={x} d={`M${x} -10 L${x} 16`} stroke="#c0182b" strokeWidth="3" opacity="0.8" />
          ))}
          {[-8, 0, 8, -4, 4].map((x, i) => (
            <circle key={i} cx={x} cy={-14 - (i % 2) * 4} r="4" fill="#fff6d0" />
          ))}
        </g>
      );
    case "projector":
      return (
        <g>
          <rect x="-30" y="-24" width="60" height="40" fill="#20262e" stroke="#4c5660" strokeWidth="2" />
          <circle cx="-30" cy="-4" r="8" fill="#ffe9a8" />
          <path d="M-36 -4 L-150 -60 L-150 50 Z" fill="#ffe9a8" opacity="0.08" />
        </g>
      );
    case "wine":
      return (
        <g>
          <rect x="-6" y="-24" width="12" height="36" rx="3" fill="#2a4a2a" />
          <rect x="-3" y="-34" width="6" height="12" fill="#2a4a2a" />
          <rect x="-6" y="-8" width="12" height="10" fill="#f2ead2" />
        </g>
      );
    case "footprints":
      return (
        <g fill="#000" opacity="0.35">
          {[0, 1, 2, 3].map((i) => (
            <ellipse key={i} cx={-30 + i * 20} cy={i % 2 ? 4 : -4} rx="5" ry="8" transform={`rotate(80 ${-30 + i * 20} ${i % 2 ? 4 : -4})`} />
          ))}
        </g>
      );
    case "flyer":
      return (
        <g transform="rotate(10)">
          <rect x="-16" y="-20" width="32" height="40" fill={color} />
          <rect x="-12" y="-16" width="24" height="10" fill="#ffffff" opacity="0.8" />
          <path d="M-10 0 L10 0 M-10 6 L8 6 M-10 12 L6 12" stroke="#ffffff" strokeWidth="2" opacity="0.8" />
        </g>
      );
  }
}
