import type { Face } from "@/lib/types";

/** Cartoon head-and-shoulders portrait, drawn in a 64×64 box. */
export function Avatar({ face, className, title }: { face: Face; className?: string; title?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} role="img" aria-label={title}>
      <rect width="64" height="64" fill={face.bg} />
      {face.dog ? <Dog face={face} /> : <Person face={face} />}
    </svg>
  );
}

function Person({ face }: { face: Face }) {
  const { skin, hair, hairStyle, shirt, acc, mood = "smile" } = face;
  return (
    <g>
      {/* hair behind the head */}
      {hairStyle === "long" && <path d="M15 30 Q14 12 32 11 Q50 12 49 30 L51 52 L13 52 Z" fill={hair} />}
      {/* shoulders */}
      <path d="M8 64 Q10 47 32 46 Q54 47 56 64 Z" fill={shirt} />
      <path d="M26 46 L32 54 L38 46 Z" fill="#0B0E0F" opacity="0.35" />
      <rect x="27" y="38" width="10" height="10" rx="4" fill={skin} />
      {/* head */}
      <ellipse cx="32" cy="28" rx="13" ry="14.5" fill={skin} />
      <ellipse cx="19.5" cy="29" rx="2.5" ry="3.5" fill={skin} />
      <ellipse cx="44.5" cy="29" rx="2.5" ry="3.5" fill={skin} />
      <Hair style={hairStyle} color={hair} />
      {/* eyes */}
      <ellipse cx="27" cy="29" rx="1.8" ry={mood === "flat" ? 1.2 : 2} fill="#141414" />
      <ellipse cx="37" cy="29" rx="1.8" ry={mood === "flat" ? 1.2 : 2} fill="#141414" />
      <circle cx="27.6" cy="28.3" r="0.6" fill="#fff" />
      <circle cx="37.6" cy="28.3" r="0.6" fill="#fff" />
      {mood === "worried" && (
        <path d="M24 24.5 L29 23.5 M35 23.5 L40 24.5" stroke="#141414" strokeWidth="1.2" strokeLinecap="round" />
      )}
      {/* cheeks + mouth */}
      <circle cx="23.5" cy="34" r="2" fill="#ff7a7a" opacity="0.25" />
      <circle cx="40.5" cy="34" r="2" fill="#ff7a7a" opacity="0.25" />
      <Mouth mood={mood} />
      {acc && <Accessory kind={acc} hair={hair} color={face.accColor ?? "#53FC18"} />}
    </g>
  );
}

function Mouth({ mood }: { mood: NonNullable<Face["mood"]> }) {
  const d = {
    smile: "M27.5 35 Q32 39.5 36.5 35",
    smirk: "M28 36.5 Q33 38.5 37 34.5",
    flat: "M28.5 36.5 L35.5 36.5",
    worried: "M28 37.5 Q32 34.5 36 37.5",
  }[mood];
  return <path d={d} stroke="#3a1a1a" strokeWidth="1.6" fill="none" strokeLinecap="round" />;
}

function Hair({ style, color }: { style: Face["hairStyle"]; color: string }) {
  switch (style) {
    case "short":
      return <path d="M18.5 26 Q18 12 32 12.5 Q46 12 45.5 26 Q42 18 32 18.5 Q23 18 18.5 26 Z" fill={color} />;
    case "slick":
      return <path d="M18.5 25 Q17 11 33 12 Q47 13 45.5 25 Q44 17 36 16.5 Q28 17 25 21 Q22 19 18.5 25 Z" fill={color} />;
    case "buzz":
      return <path d="M19 24 Q19 13.5 32 13.5 Q45 13.5 45 24 Q40 17.5 32 17.5 Q24 17.5 19 24 Z" fill={color} opacity="0.85" />;
    case "long":
      return <path d="M18 27 Q17 11.5 32 12 Q47 11.5 46 27 Q42 17 32 17.5 Q22 17 18 27 Z" fill={color} />;
    case "bun":
      return (
        <g fill={color}>
          <circle cx="32" cy="10" r="5.5" />
          <path d="M18.5 26 Q18 13 32 13 Q46 13 45.5 26 Q41 18 32 18 Q23 18 18.5 26 Z" />
        </g>
      );
    case "curly":
      return (
        <g fill={color}>
          {[20, 25, 30, 35, 40, 44].map((x, i) => (
            <circle key={x} cx={x} cy={i % 2 ? 14 : 16.5} r="5" />
          ))}
          <circle cx="18.5" cy="21" r="4" />
          <circle cx="45.5" cy="21" r="4" />
        </g>
      );
    case "mohawk":
      return <path d="M28 20 Q27 6 32 4 Q37 6 36 20 Q32 17.5 28 20 Z" fill={color} />;
    case "bald":
      return <path d="M19 27 Q18 22 21 20 L21 27 Z M45 27 Q46 22 43 20 L43 27 Z" fill={color} />;
  }
}

function Accessory({ kind, hair, color }: { kind: NonNullable<Face["acc"]>; hair: string; color: string }) {
  switch (kind) {
    case "gele":
      // Yoruba head-tie: a wrapped band with fanned pleats on top
      return (
        <g fill={color}>
          <path d="M33 13 Q40 -2 58 4 Q54 14 42 17 Z" />
          <path d="M31 13 Q22 -3 6 3 Q10 14 22 17 Z" opacity="0.9" />
          <path d="M26 12 Q32 1 38 12 Z" />
          <path d="M16.5 27 Q15 10 32 10.5 Q49 10 47.5 27 Q42 19 32 19.5 Q22 19 16.5 27 Z" />
          <path d="M18 23 Q32 15 46 23 M20 18 Q32 11 44 18" stroke="#000" strokeOpacity="0.18" strokeWidth="1.2" fill="none" />
          <path d="M33 13 Q44 6 54 6" stroke="#fff" strokeOpacity="0.25" strokeWidth="1" fill="none" />
        </g>
      );
    case "fila":
      // Yoruba cap, worn folded over to one side
      return (
        <g>
          <path d="M18.5 24 Q18 11 32 11 Q44 11 46 17 L52 13 Q53 21 46 25 Z" fill={color} />
          <path d="M20 21 L45 21" stroke="#000" strokeOpacity="0.2" strokeWidth="1.5" />
          {[24, 30, 36, 42].map((x) => (
            <path key={x} d={`M${x} 13 L${x + 2} 20`} stroke="#fff" strokeOpacity="0.22" strokeWidth="1.2" />
          ))}
        </g>
      );
    case "glasses":
      return (
        <g stroke="#e8e8e8" strokeWidth="1.3" fill="none">
          <circle cx="27" cy="29" r="4" />
          <circle cx="37" cy="29" r="4" />
          <path d="M31 29 L33 29" />
        </g>
      );
    case "shades":
      return (
        <g>
          <path d="M21.5 26 L42.5 26 L41.5 31 Q37 33.5 33 30 L31 30 Q27 33.5 22.5 31 Z" fill="#0B0E0F" />
          <path d="M24 27 L27 27" stroke="#53FC18" strokeWidth="0.8" />
        </g>
      );
    case "visor":
      return (
        <g>
          <rect x="19.5" y="25" width="25" height="7" rx="3.5" fill="#53FC18" opacity="0.9" />
          <rect x="21" y="26.2" width="22" height="1.5" rx="0.75" fill="#fff" opacity="0.6" />
        </g>
      );
    case "goggles":
      return (
        <g>
          <path d="M18.5 28 L45.5 28" stroke="#2A323D" strokeWidth="2.5" />
          <circle cx="27" cy="29" r="4.6" fill="#9fe8ff" opacity="0.55" stroke="#2A323D" strokeWidth="1.8" />
          <circle cx="37" cy="29" r="4.6" fill="#9fe8ff" opacity="0.55" stroke="#2A323D" strokeWidth="1.8" />
        </g>
      );
    case "mask":
      return <path d="M23 32 Q32 30 41 32 L40 39 Q32 43 24 39 Z" fill="#cfe8f0" />;
    case "cap":
      return (
        <g>
          <path d="M18.5 23 Q19 12 32 12 Q45 12 45.5 23 Z" fill="#1d2f5a" />
          <path d="M30 23 L50 23 Q50 26.5 44 26 L30 25.5 Z" fill="#14213f" />
          <circle cx="32" cy="17" r="2.2" fill="#53FC18" />
        </g>
      );
    case "fedora":
      return (
        <g>
          <ellipse cx="32" cy="20" rx="19" ry="3.5" fill="#3a2f22" />
          <path d="M21 20 Q21 7 32 8 Q43 7 43 20 Z" fill="#4a3c2b" />
          <path d="M21.3 17 L42.7 17 L42.9 19.5 L21.1 19.5 Z" fill="#53FC18" />
        </g>
      );
    case "beard":
      return <path d="M20 31 Q21 45 32 45.5 Q43 45 44 31 Q41 39 32 39.5 Q23 39 20 31 Z" fill={hair} />;
    case "monocle":
      return (
        <g stroke="#e6c35a" strokeWidth="1.3" fill="none">
          <circle cx="37" cy="29" r="4.2" />
          <path d="M41 31 Q43 40 40 46" />
        </g>
      );
    case "earring":
      return <circle cx="44.5" cy="34.5" r="1.6" fill="#53FC18" />;
  }
}

function Dog({ face }: { face: Face }) {
  const fur = face.skin;
  return (
    <g>
      <path d="M8 64 Q10 48 32 47 Q54 48 56 64 Z" fill={face.shirt} />
      <path d="M22 50 L42 50 L40 56 L24 56 Z" fill="#53FC18" />
      <circle cx="32" cy="56" r="2" fill="#e6c35a" />
      {/* ears */}
      <path d="M15 18 Q12 34 20 38 L24 22 Z" fill={face.hair} />
      <path d="M49 18 Q52 34 44 38 L40 22 Z" fill={face.hair} />
      <ellipse cx="32" cy="30" rx="14" ry="15" fill={fur} />
      <ellipse cx="32" cy="37" rx="8.5" ry="6.5" fill="#f3dfc4" />
      <ellipse cx="32" cy="33.5" rx="3.2" ry="2.3" fill="#141414" />
      <path d="M32 36 L32 39 M28.5 39.5 Q32 42 35.5 39.5" stroke="#141414" strokeWidth="1.3" fill="none" strokeLinecap="round" />
      <path d="M33 41 Q34 45 31.5 44.5" fill="#ff7a8a" />
      <circle cx="26.5" cy="27" r="2" fill="#141414" />
      <circle cx="37.5" cy="27" r="2" fill="#141414" />
      <circle cx="27.1" cy="26.4" r="0.6" fill="#fff" />
      <circle cx="38.1" cy="26.4" r="0.6" fill="#fff" />
    </g>
  );
}
