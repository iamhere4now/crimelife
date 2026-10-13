/**
 * The "I cracked it" share card: a portrait picture (1080×1350, the size
 * Instagram and WhatsApp Status like) with the case's scene, its title and
 * place, how fast it was solved and the detective's rank, in the state's
 * colours. Shared as an image where the phone allows it, else saved and the
 * text opened in WhatsApp.
 */

import { thumbnailOf } from "@/components/scenes/SceneThumb";
import { themeFor } from "@/components/StateBanner";
import { isCloudflareRuntime } from "./cfRuntime";
import { CITY_BY_ID, cityOf } from "./cities";
import { GAME_URL } from "./coop";
import { moneyShort } from "./format";
import type { CrimeCase } from "./types";

export interface ShareInfo {
  theCase: CrimeCase;
  /** Seconds from opening the case to the arrest. */
  seconds: number;
  detective: string;
  rank: string;
  bounty: number;
}

export const solveTime = (s: number) => (s < 60 ? `${Math.max(1, Math.round(s))}s` : s < 3600 ? `${Math.floor(s / 60)}m ${Math.round(s % 60)}s` : `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`);

export const gameLink = () => (isCloudflareRuntime() ? window.location.origin : GAME_URL);

function load(src: string) {
  return new Promise<HTMLImageElement | null>((resolve) => {
    if (!src) return resolve(null);
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = () => resolve(null);
    i.src = src;
  });
}

function rounded(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

/** Words onto lines no wider than `max`. */
function wrap(g: CanvasRenderingContext2D, text: string, max: number, lines = 2) {
  const words = text.split(/\s+/);
  const out: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (g.measureText(test).width > max && line) {
      out.push(line);
      line = w;
    } else line = test;
  }
  if (line) out.push(line);
  if (out.length > lines) {
    out.length = lines;
    out[lines - 1] = out[lines - 1].replace(/\s*\S*$/, "…");
  }
  return out;
}

export async function makeShareCard(info: ShareInfo): Promise<Blob | null> {
  const W = 1080;
  const H = 1350;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d");
  if (!g) return null;
  const city = CITY_BY_ID[cityOf(info.theCase) ?? "lagos"];
  const theme = themeFor(city);
  const font = (weight: number, size: number) => `${weight} ${size}px Inter, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`;

  // background in the state's colours, with soft circles
  const bg = g.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, theme.colors.a);
  bg.addColorStop(1, theme.colors.b);
  g.fillStyle = bg;
  g.fillRect(0, 0, W, H);
  g.fillStyle = "rgba(255,255,255,0.08)";
  g.beginPath();
  g.arc(W - 80, 120, 260, 0, Math.PI * 2);
  g.fill();
  g.beginPath();
  g.arc(60, H - 160, 200, 0, Math.PI * 2);
  g.fill();

  // brand
  g.fillStyle = "#ffffff";
  g.textAlign = "center";
  g.font = font(900, 44);
  g.fillText("NAIJA DETECTIVE", W / 2, 96);
  g.font = font(600, 28);
  g.fillStyle = "rgba(255,255,255,0.8)";
  g.fillText(`${city.name} · “${theme.nickname}”`, W / 2, 140);

  // the scene, on a white photo card
  const px = 90;
  const py = 190;
  const pw = W - 180;
  const ph = 620;
  g.save();
  g.shadowColor = "rgba(0,0,0,0.35)";
  g.shadowBlur = 40;
  g.shadowOffsetY = 18;
  g.fillStyle = "#ffffff";
  rounded(g, px - 18, py - 18, pw + 36, ph + 36, 36);
  g.fill();
  g.restore();
  const img = await load(await thumbnailOf(info.theCase));
  g.save();
  rounded(g, px, py, pw, ph, 24);
  g.clip();
  if (img) {
    const scale = Math.max(pw / img.width, ph / img.height);
    const iw = img.width * scale;
    const ih = img.height * scale;
    g.drawImage(img, px + (pw - iw) / 2, py + (ph - ih) / 2, iw, ih);
  } else {
    g.fillStyle = "#14161b";
    g.fillRect(px, py, pw, ph);
  }
  g.restore();

  // CASE CLOSED stamp
  g.save();
  g.translate(px + pw - 170, py + 90);
  g.rotate(-0.18);
  g.strokeStyle = "#e11d48";
  g.lineWidth = 8;
  g.fillStyle = "rgba(255,255,255,0.88)";
  rounded(g, -170, -50, 340, 100, 14);
  g.fill();
  g.stroke();
  g.fillStyle = "#e11d48";
  g.font = font(900, 46);
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText("CASE CLOSED", 0, 4);
  g.restore();

  // title and place
  g.textAlign = "center";
  g.textBaseline = "alphabetic";
  g.fillStyle = "#ffffff";
  g.font = font(900, 64);
  const lines = wrap(g, info.theCase.title, W - 160);
  lines.forEach((l, i) => g.fillText(l, W / 2, 920 + i * 74));
  const after = 920 + lines.length * 74;
  g.font = font(600, 30);
  g.fillStyle = "rgba(255,255,255,0.85)";
  g.fillText(info.theCase.region?.place ?? city.name, W / 2, after + 4);

  // stats
  const stats = [`⏱ ${solveTime(info.seconds)}`, `💰 ${moneyShort(info.bounty)}`, `🎖 ${info.rank}`];
  g.font = font(800, 34);
  const gap = 24;
  const widths = stats.map((s) => g.measureText(s).width + 56);
  let x = (W - widths.reduce((a, b) => a + b, 0) - gap * (stats.length - 1)) / 2;
  const sy = after + 50;
  stats.forEach((s, i) => {
    g.fillStyle = "rgba(0,0,0,0.25)";
    rounded(g, x, sy, widths[i], 70, 35);
    g.fill();
    g.fillStyle = "#ffffff";
    g.fillText(s, x + widths[i] / 2, sy + 47);
    x += widths[i] + gap;
  });

  // the dare
  g.font = font(800, 40);
  g.fillStyle = "#ffffff";
  g.fillText(`Det. ${info.detective} cracked it. Can you beat that?`.slice(0, 60), W / 2, H - 110);
  g.font = font(600, 30);
  g.fillStyle = "rgba(255,255,255,0.85)";
  g.fillText(`Play free: ${gameLink().replace(/^https?:\/\//, "")}`, W / 2, H - 62);

  return await new Promise<Blob | null>((resolve) => c.toBlob((b) => resolve(b), "image/png"));
}

/** Share the card (and a line of text) the best way this phone allows. */
export async function shareResult(info: ShareInfo): Promise<"shared" | "saved" | "failed" | "cancelled"> {
  const text = `I cracked "${info.theCase.title}" in ${solveTime(info.seconds)} on Naija Detective 🔍🇳🇬 Can you beat me? ${gameLink()}`;
  const blob = await makeShareCard(info).catch(() => null);
  if (!blob) return "failed";
  const file = new File([blob], "naija-detective-case.png", { type: "image/png" });
  try {
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], text, title: "Naija Detective" });
      return "shared";
    }
  } catch (e) {
    if ((e as { name?: string }).name === "AbortError") return "cancelled";
  }
  // no picture sharing here: save the picture and open WhatsApp with the text
  try {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "naija-detective-case.png";
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 4000);
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener");
    return "saved";
  } catch {
    return "failed";
  }
}

