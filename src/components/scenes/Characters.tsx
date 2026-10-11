/**
 * Quirky cartoon detectives that stand around the crime scenes.
 * Each one is drawn with its feet at (0, 0), so place them with a translate.
 */

interface Placed {
  x: number;
  y: number;
  scale?: number;
  flip?: boolean;
  delay?: string;
}

function Place({ x, y, scale = 1, flip, delay, children }: Placed & { children: React.ReactNode }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -scale : scale} ${scale})`}>
      <g className="bob" style={{ animationDelay: delay }}>
        <ellipse cx="0" cy="0" rx="26" ry="5" fill="#000" opacity="0.35" />
        {children}
      </g>
    </g>
  );
}

/** Trench-coat detective holding a magnifying glass. */
export function Gumshoe({ skin = "#8D5524", coat = "#b08a5a", hat = "#4a3c2b", ...p }: Placed & { skin?: string; coat?: string; hat?: string }) {
  return (
    <Place {...p}>
      <rect x="-12" y="-30" width="9" height="30" rx="3" fill="#2b2f36" />
      <rect x="3" y="-30" width="9" height="30" rx="3" fill="#2b2f36" />
      <ellipse cx="-8" cy="-1" rx="8" ry="3.5" fill="#141414" />
      <ellipse cx="8" cy="-1" rx="8" ry="3.5" fill="#141414" />
      {/* coat */}
      <path d="M-20 -26 L-16 -78 Q0 -86 16 -78 L20 -26 Q0 -20 -20 -26 Z" fill={coat} />
      <path d="M0 -82 L0 -24" stroke="#000" strokeOpacity="0.25" strokeWidth="1.5" />
      <path d="M-8 -82 L0 -66 L8 -82" fill="#e8e8e8" />
      <path d="M-18 -52 L18 -52" stroke="#6b5434" strokeWidth="4" />
      {/* arm with magnifier */}
      <path d="M14 -74 Q30 -64 30 -54" stroke={coat} strokeWidth="9" strokeLinecap="round" fill="none" />
      <circle cx="30" cy="-52" r="4.5" fill={skin} />
      <path d="M32 -56 L38 -66" stroke="#5a4020" strokeWidth="3" strokeLinecap="round" />
      <circle cx="42" cy="-72" r="8" fill="#bff7ff" fillOpacity="0.35" stroke="#e6c35a" strokeWidth="2.5" />
      {/* head */}
      <circle cx="0" cy="-96" r="14" fill={skin} />
      <circle cx="-5" cy="-96" r="1.8" fill="#141414" />
      <circle cx="6" cy="-96" r="1.8" fill="#141414" />
      <path d="M-4 -88 Q1 -85 6 -89" stroke="#3a1a1a" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <path d="M-6 -89 L-1 -90" stroke="#3a1a1a" strokeWidth="2.5" strokeLinecap="round" />
      {/* fedora */}
      <ellipse cx="0" cy="-104" rx="22" ry="4" fill={hat} />
      <path d="M-12 -104 Q-13 -122 0 -120 Q13 -122 12 -104 Z" fill={hat} />
      <rect x="-12.5" y="-108" width="25" height="3.5" fill="#53FC18" />
    </Place>
  );
}

/** Forensic tech in a white suit, mid-photo. */
export function LabTech({ skin = "#6b4226", ...p }: Placed & { skin?: string }) {
  return (
    <Place {...p}>
      <rect x="-12" y="-30" width="10" height="30" rx="4" fill="#dfe6ea" />
      <rect x="2" y="-30" width="10" height="30" rx="4" fill="#dfe6ea" />
      <ellipse cx="-7" cy="-1" rx="7.5" ry="3.5" fill="#6ec1ff" />
      <ellipse cx="7" cy="-1" rx="7.5" ry="3.5" fill="#6ec1ff" />
      <path d="M-18 -28 L-17 -76 Q0 -84 17 -76 L18 -28 Z" fill="#f2f5f7" />
      <path d="M0 -80 L0 -30" stroke="#b9c3c9" strokeWidth="1.5" />
      <rect x="-15" y="-60" width="10" height="4" rx="1" fill="#53FC18" />
      {/* camera arms */}
      <path d="M-14 -72 Q-10 -60 -2 -62" stroke="#f2f5f7" strokeWidth="8" strokeLinecap="round" fill="none" />
      <path d="M14 -72 Q12 -60 4 -62" stroke="#f2f5f7" strokeWidth="8" strokeLinecap="round" fill="none" />
      <rect x="-10" y="-74" width="20" height="13" rx="3" fill="#2b2f36" />
      <circle cx="0" cy="-67.5" r="4.5" fill="#53FC18" stroke="#141414" strokeWidth="1.5" />
      <rect x="4" y="-77" width="6" height="3" rx="1" fill="#fff" className="flash" />
      {/* head in hood */}
      <circle cx="0" cy="-93" r="15" fill="#f2f5f7" />
      <circle cx="0" cy="-91" r="11" fill={skin} />
      <circle cx="-4.5" cy="-93" r="1.6" fill="#141414" />
      <circle cx="4.5" cy="-93" r="1.6" fill="#141414" />
      <path d="M-8 -88 Q0 -90 8 -88 L7 -82 Q0 -79 -7 -82 Z" fill="#cfe8f0" />
    </Place>
  );
}

/** K9 unit dog in a police vest, sniffing around. */
export function K9({ ...p }: Placed) {
  return (
    <Place {...p}>
      <path d="M-24 -4 Q-30 -26 -12 -32 L14 -32 Q24 -28 22 -4 Z" fill="#b07a45" />
      <rect x="-20" y="-14" width="7" height="14" rx="3" fill="#b07a45" />
      <rect x="10" y="-14" width="7" height="14" rx="3" fill="#b07a45" />
      <path d="M-22 -26 Q-34 -34 -32 -44" stroke="#b07a45" strokeWidth="5" strokeLinecap="round" fill="none" className="wag" />
      <path d="M-14 -31 L14 -31 L15 -14 L-15 -14 Z" fill="#1d2f5a" />
      <text x="0" y="-19" textAnchor="middle" fontSize="7" fontWeight="800" fill="#53FC18">K9</text>
      {/* head */}
      <path d="M8 -54 Q2 -40 10 -34" fill="#5a3a1a" />
      <circle cx="18" cy="-44" r="13" fill="#b07a45" />
      <path d="M9 -54 Q4 -42 11 -36 L14 -50 Z" fill="#5a3a1a" />
      <ellipse cx="29" cy="-40" rx="8" ry="6" fill="#f3dfc4" />
      <ellipse cx="35" cy="-42" rx="3" ry="2.2" fill="#141414" />
      <circle cx="20" cy="-48" r="2" fill="#141414" />
      <circle cx="20.6" cy="-48.6" r="0.6" fill="#fff" />
    </Place>
  );
}
