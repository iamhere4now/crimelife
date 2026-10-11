/**
 * Low-poly props for the 3D scenes. Each builder returns a group standing on
 * y = 0 (or hung from a wall, facing +z), roughly to real-world scale in metres.
 */

import * as THREE from "three";
import type { KitProp, PropKind } from "@/lib/types";
import { box, capsule, cone, cyl, lampPost, makePerson, mat, sphere, textPanel, textTexture } from "./world";

/** Props that hang on a wall or from the ceiling rather than stand on the floor. */
export const WALL_KINDS = new Set<PropKind>(["cctv", "onair", "scorch", "painting", "pipe", "laser", "pans", "sign"]);
export const CEILING_KINDS = new Set<PropKind>(["chandelier", "spotlight"]);

type Tick = (t: number) => void;

export function makeProp(p: KitProp, tickers: Tick[]): THREE.Group {
  const g = new THREE.Group();
  const c = p.color ?? "#53FC18";
  const glow = (color: string) => mat(color, { emissive: color, emissiveIntensity: 1.2 });

  switch (p.kind) {
    /* ---------------- furniture & rooms */
    case "desk":
      box(g, 2, 0.1, 0.9, "#6a4a2a", 0, 0.75, 0);
      for (const x of [-0.9, 0.9]) box(g, 0.1, 0.75, 0.8, "#4a2a10", x, 0, 0);
      box(g, 0.7, 0.55, 0.75, "#5a3a1a", -0.5, 0.15, 0);
      break;
    case "door":
      box(g, 1.3, 2.5, 0.12, c, 0, 0, 0);
      box(g, 1.5, 0.12, 0.16, "#1a1a1a", 0, 2.5, 0);
      box(g, 0.08, 0.2, 0.08, "#e6c35a", 0.45, 1.1, 0.08);
      box(g, 0.14, 0.1, 0.04, glow("#53FC18"), 0.45, 1.35, 0.08);
      break;
    case "bookshelf":
      box(g, 1.6, 2.6, 0.45, "#5a3a1a", 0, 0, 0);
      for (let r = 0; r < 4; r++)
        for (let k = 0; k < 7; k++)
          box(g, 0.18, 0.5, 0.3, ["#c0182b", "#1d6a8a", "#f5c518", "#3a8a4a", "#7a3aff"][(r + k) % 5], -0.6 + k * 0.2, 0.15 + r * 0.62, 0.1);
      break;
    case "cabinet":
      box(g, 0.8, 1.5, 0.6, "#6c7884", 0, 0, 0);
      for (let i = 0; i < 3; i++) box(g, 0.3, 0.06, 0.04, "#cfd6dc", 0, 0.3 + i * 0.45, 0.31);
      break;
    case "chair":
      box(g, 0.6, 0.1, 0.6, c, 0, 0.5, 0);
      box(g, 0.6, 0.8, 0.1, c, 0, 0.55, -0.27);
      for (const [x, z] of [[-0.25, 0.25], [0.25, 0.25], [-0.25, -0.25], [0.25, -0.25]]) box(g, 0.06, 0.5, 0.06, "#1a1a1a", x, 0, z);
      break;
    case "bench":
      box(g, 2.2, 0.12, 0.5, "#2b2f36", 0, 0.45, 0);
      for (const x of [-0.95, 0.95]) box(g, 0.12, 0.45, 0.45, "#1d2126", x, 0, 0);
      break;
    case "rug": {
      const r = new THREE.Mesh(new THREE.CircleGeometry(3.2, 24), mat(c === "#53FC18" ? "#6a1a2a" : c));
      r.rotation.x = -Math.PI / 2;
      r.position.y = 0.01;
      r.scale.y = 0.55;
      r.receiveShadow = true;
      g.add(r);
      break;
    }
    case "dining":
    case "banquet": {
      const long = p.kind === "banquet";
      box(g, long ? 4.6 : 3, 0.12, long ? 1.2 : 1.6, "#f4f1ea", 0, 0.78, 0);
      box(g, long ? 4.6 : 3, 0.7, long ? 1.2 : 1.6, "#e3ded2", 0, 0.08, 0);
      const n = long ? 6 : 5;
      for (let i = 0; i < n; i++) {
        const x = -((n - 1) * 0.36) + i * 0.72;
        cyl(g, 0.17, 0.12, 0.05, "#ffffff", x, 0.9, 0.35, 12);
        cyl(g, 0.11, 0.11, 0.02, long ? "#c0182b" : "#d9481a", x, 0.94, 0.35, 10);
      }
      cyl(g, 0.04, 0.06, 0.4, "#e6c35a", 0, 0.9, -0.2, 6);
      sphere(g, 0.06, mat("#ffd36b", { emissive: "#ffd36b" }), 0, 1.36, -0.2, 6);
      break;
    }
    case "chandelier": {
      cyl(g, 0.02, 0.02, 1.2, "#c9a34a", 0, 0.6, 0, 4);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.7, 0.05, 6, 16), mat("#c9a34a", { metal: 0.5 }));
      ring.rotation.x = Math.PI / 2;
      ring.position.y = 0.6;
      g.add(ring);
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        sphere(g, 0.09, mat("#fff6d0", { emissive: "#fff6d0" }), Math.cos(a) * 0.7, 0.72, Math.sin(a) * 0.7, 6);
      }
      const l = new THREE.PointLight("#ffe9a8", 10, 10, 1.6);
      l.position.y = 0.4;
      g.add(l);
      break;
    }
    case "spotlight":
      box(g, 0.3, 0.3, 0.5, "#3b4148", 0, 0, 0).rotation.x = 0.6;
      sphere(g, 0.12, mat("#fff2c8", { emissive: "#fff2c8" }), 0, 0.05, 0.25, 6);
      break;
    case "lamp":
      cyl(g, 0.25, 0.3, 0.05, "#c9a34a", 0, 0, 0);
      cyl(g, 0.03, 0.03, 0.6, "#c9a34a", 0, 0.05, 0, 5);
      cone(g, 0.35, 0.35, "#3a8a4a", 0, 0.6, 0, 8);
      {
        const bulb = new THREE.PointLight("#ffe9a8", 4, 5, 1.5);
        bulb.position.set(0, 0.55, 0);
        g.add(bulb);
      }
      break;
    case "rope":
      for (const x of [-1.6, 1.6]) {
        cyl(g, 0.06, 0.08, 1, "#c9a34a", x, 0, 0, 8);
        sphere(g, 0.1, "#e6c35a", x, 1.05, 0, 6);
      }
      {
        const curve = new THREE.QuadraticBezierCurve3(new THREE.Vector3(-1.6, 0.95, 0), new THREE.Vector3(0, 0.55, 0), new THREE.Vector3(1.6, 0.95, 0));
        g.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 16, 0.05, 6), mat("#8a1a2a")));
      }
      break;
    case "pedestal":
      box(g, 0.8, 1.1, 0.8, "#e8e0d0", 0, 0, 0);
      box(g, 0.9, 0.08, 0.9, "#f4efe6", 0, 1.1, 0);
      box(g, 0.75, 0.7, 0.75, mat("#bfe7ff", { opacity: 0.25, rough: 0.1 }), 0, 1.18, 0);
      break;
    case "painting": {
      box(g, 2.2, 1.7, 0.12, "#c9a34a", 0, 0, 0);
      const art = new THREE.Group();
      art.position.z = 0.07;
      box(art, 1.95, 1.45, 0.02, c === "#53FC18" ? "#1f5a3a" : c, 0, 0.12, 0);
      if (p.label === "lady") {
        sphere(art, 0.2, "#8D5524", 0, 1.0, 0.05, 8);
        sphere(art, 0.28, "#53FC18", 0, 1.2, 0.04, 7).scale.set(1.3, 0.6, 0.4);
        cyl(art, 0.25, 0.45, 0.6, "#2f8a4a", 0, 0.25, 0.04, 8);
      } else {
        sphere(art, 0.3, ["#f5c518", "#1d3a8a", "#c0182b"][Math.round(p.x) % 3], -0.3, 0.8, 0.03, 7).scale.z = 0.2;
        box(art, 0.7, 0.4, 0.04, "#e8e0d0", 0.35, 0.35, 0.02);
      }
      g.add(art);
      break;
    }
    case "pans":
      box(g, 3, 0.06, 0.06, "#9aa3ab", 0, 1, 0);
      for (let i = 0; i < 4; i++) {
        cyl(g, 0.01, 0.01, 0.3, "#9aa3ab", -1.1 + i * 0.75, 0.7, 0.05, 4);
        cyl(g, 0.28 - (i % 2) * 0.06, 0.2, 0.25, i % 2 ? "#9aa3ab" : "#b87333", -1.1 + i * 0.75, 0.45, 0.1, 10);
      }
      break;
    case "stove":
      box(g, 1.4, 0.95, 0.8, "#4c5660", 0, 0, 0);
      box(g, 1.1, 0.5, 0.02, "#2b3238", 0, 0.2, 0.41);
      box(g, 0.9, 0.25, 0.02, glow("#ff8a00"), 0, 0.32, 0.42);
      cyl(g, 0.38, 0.32, 0.45, "#9aa3ab", 0.15, 0.95, 0, 12);
      cyl(g, 0.36, 0.36, 0.02, "#d9481a", 0.15, 1.39, 0, 12);
      break;
    case "fridge":
      box(g, 1.5, 2.8, 0.9, "#b6bfc6", 0, 0, 0);
      box(g, 0.1, 0.9, 0.1, "#4c5660", 0.6, 1.1, 0.46);
      textPanel(g, "WALK-IN", 1, 0.25, "#4c5660", "#b6bfc6", 0, 2.4, 0.46);
      break;
    case "counter":
      box(g, 2.8, 0.08, 0.9, "#c3ccd3", 0, 0.9, 0);
      for (const x of [-1.3, 1.3]) for (const z of [-0.38, 0.38]) box(g, 0.06, 0.9, 0.06, "#8a949c", x, 0, z);
      box(g, 2.6, 0.04, 0.8, "#8a949c", 0, 0.3, 0);
      break;
    case "dogbed":
      cyl(g, 0.8, 0.85, 0.22, "#c0182b", 0, 0, 0, 16);
      cyl(g, 0.6, 0.6, 0.06, "#ffb3c0", 0, 0.2, 0, 16);
      break;
    case "bowl":
      cyl(g, 0.3, 0.2, 0.18, "#ffffff", 0, 0, 0, 12);
      cyl(g, 0.27, 0.27, 0.02, p.color ?? "#6ec1ff", 0, 0.16, 0, 12);
      break;
    case "throne":
      box(g, 1.2, 0.5, 1, "#c9a34a", 0, 0, 0);
      box(g, 1.2, 1.9, 0.2, "#c9a34a", 0, 0.5, -0.4);
      box(g, 0.9, 1.5, 0.05, "#8a1a2a", 0, 0.7, -0.29);
      box(g, 1, 0.12, 0.9, "#8a1a2a", 0, 0.5, 0.02);
      for (const x of [-0.4, 0, 0.4]) sphere(g, 0.08, "#c0182b", x, 2.45, -0.4, 6);
      break;
    case "cushion":
      cyl(g, 0.45, 0.45, 0.16, p.color ?? "#8a1a2a", 0, 0.4, 0, 14);
      box(g, 0.5, 0.4, 0.5, "#3a2418", 0, 0, 0);
      break;
    case "coatrack":
      cyl(g, 0.04, 0.05, 2, "#5a3a1a", 0, 0, 0, 6);
      box(g, 0.5, 1.1, 0.25, c, -0.15, 0.7, 0.12);
      break;
    case "seats":
      for (let r = 0; r < 2; r++)
        for (let k = 0; k < 6; k++) {
          const x = -2.5 + k * 1 + r * 0.2;
          box(g, 0.8, 0.45, 0.8, c, x, 0, r * -1.2);
          box(g, 0.8, 0.7, 0.15, c, x, 0.45, r * -1.2 - 0.33);
        }
      break;
    case "arch":
      for (const x of [-1.5, 1.5]) cyl(g, 0.08, 0.08, 2.4, "#f2f2e8", x, 0, 0, 6);
      for (let i = 0; i <= 12; i++) {
        const a = Math.PI - (i / 12) * Math.PI;
        sphere(g, 0.18, i % 2 ? c : "#ffffff", Math.cos(a) * 1.5, 2.4 + Math.sin(a) * 1.1, 0, 6);
      }
      break;
    case "cake":
      cyl(g, 0.45, 0.45, 0.4, "#f2f2e8", 0, 0.8, 0, 16);
      cyl(g, 0.33, 0.33, 0.35, "#f2f2e8", 0, 1.2, 0, 16);
      cyl(g, 0.22, 0.22, 0.3, "#f2f2e8", 0, 1.55, 0, 16);
      sphere(g, 0.08, "#c0182b", 0, 1.92, 0, 6);
      box(g, 1, 0.8, 0.7, "#e3ded2", 0, 0, 0);
      break;

    /* ---------------- small evidence */
    case "paper":
      box(g, 0.45, 0.01, 0.35, "#f2ead2", 0, 0.01, 0).rotation.y = 0.3;
      box(g, 0.3, 0.012, 0.25, "#e8dfc4", 0.15, 0.012, 0.1).rotation.y = -0.5;
      break;
    case "card":
      box(g, 0.4, 0.015, 0.26, "#e8eef2", 0, 0.01, 0).rotation.y = -0.4;
      break;
    case "playingcard":
      box(g, 0.24, 0.015, 0.34, "#ffffff", 0, 0.01, 0).rotation.y = 0.5;
      break;
    case "chip":
      box(g, 0.24, 0.05, 0.16, "#2b3440", 0, 0, 0);
      box(g, 0.12, 0.052, 0.07, glow("#53FC18"), 0, 0, 0);
      break;
    case "phone":
      box(g, 0.2, 0.36, 0.04, "#1a1a1a", 0, 0.1, 0).rotation.x = -0.4;
      box(g, 0.16, 0.28, 0.01, glow(c), 0, 0.14, 0.03).rotation.x = -0.4;
      break;
    case "inhaler":
      cyl(g, 0.06, 0.06, 0.25, "#1d6a8a", 0, 0, 0, 8).rotation.z = 0.2;
      box(g, 0.14, 0.08, 0.1, "#9fd4ff", 0, 0, 0.05);
      break;
    case "cog": {
      const gear = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.05, 10), mat("#e6c35a", { metal: 0.6, rough: 0.4 }));
      gear.position.y = 0.03;
      g.add(gear);
      break;
    }
    case "glass":
      cyl(g, 0.08, 0.04, 0.25, mat("#dff4ff", { opacity: 0.6, rough: 0.1 }), 0, 0, 0, 8);
      break;
    case "cup":
      cyl(g, 0.12, 0.09, 0.3, c, 0, 0, 0, 10);
      break;
    case "wine":
      cyl(g, 0.09, 0.09, 0.4, "#2a4a2a", 0, 0, 0, 8);
      cyl(g, 0.03, 0.04, 0.16, "#2a4a2a", 0, 0.4, 0, 6);
      break;
    case "knife":
      box(g, 0.35, 0.25, 0.25, "#6a4a20", 0, 0, 0);
      for (const x of [-0.08, 0.02, 0.1]) box(g, 0.03, 0.25, 0.05, "#c3ccd3", x, 0.25, 0);
      break;
    case "books":
      for (let i = 0; i < 4; i++) box(g, 0.6, 0.12, 0.42, ["#c0182b", "#1d6a8a", "#f5c518", "#3a8a4a"][i], (i % 2) * 0.05, i * 0.12, 0).rotation.y = i * 0.2;
      break;
    case "luggage":
      box(g, 0.7, 0.5, 0.3, c, 0, 0, 0);
      box(g, 0.3, 0.08, 0.06, "#1a1a1a", 0, 0.5, 0);
      break;
    case "jewelbox":
      box(g, 0.5, 0.25, 0.35, "#8a1a2a", 0, 0.8, 0);
      box(g, 0.5, 0.2, 0.06, "#a8243a", 0, 1.05, -0.15).rotation.x = -0.6;
      box(g, 0.9, 0.8, 0.6, "#3a2a3a", 0, 0, 0);
      break;
    case "camera":
      box(g, 0.45, 0.3, 0.28, "#2b2f36", 0, 0, 0);
      cyl(g, 0.11, 0.11, 0.18, "#1a1a1a", 0.05, 0.15, 0.2, 10).rotation.x = Math.PI / 2;
      break;
    case "spray":
      cyl(g, 0.08, 0.08, 0.32, "#c0182b", 0, 0, 0, 10);
      cyl(g, 0.04, 0.04, 0.06, "#cfd6dc", 0, 0.32, 0, 6);
      break;
    case "popcorn":
      cyl(g, 0.22, 0.16, 0.45, "#ffffff", 0, 0.45, 0, 10);
      sphere(g, 0.2, "#fff6d0", 0, 0.95, 0, 6);
      box(g, 0.6, 0.45, 0.6, "#7a1f2a", 0, 0, 0);
      break;
    case "lunchbox":
      box(g, 0.45, 0.22, 0.3, c, 0, 0, 0);
      box(g, 0.4, 0.04, 0.26, "#f2ead2", 0, 0.22, 0);
      break;
    case "hardhat":
      sphere(g, 0.22, "#f5c518", 0, 0.05, 0, 8).scale.y = 0.7;
      cyl(g, 0.3, 0.3, 0.03, "#e0a818", 0, 0, 0, 12);
      break;
    case "notes":
      for (let i = 0; i < 14; i++) {
        const n = box(g, 0.32, 0.01, 0.15, ["#d97aa8", "#5a8ab8", "#6aa84a"][i % 3], ((i * 71) % 40) / 10 - 2, 0.005 + i * 0.001, ((i * 37) % 20) / 10 - 1);
        n.rotation.y = i;
      }
      break;
    case "footprints":
      for (let i = 0; i < 5; i++) {
        const f = new THREE.Mesh(new THREE.CircleGeometry(0.12, 8), mat("#000000", { opacity: 0.35 }));
        f.rotation.x = -Math.PI / 2;
        f.scale.y = 1.8;
        f.position.set(-0.8 + i * 0.4, 0.01, i % 2 ? 0.12 : -0.12);
        g.add(f);
      }
      break;
    case "flyer":
      box(g, 0.45, 0.01, 0.6, c, 0, 0.01, 0).rotation.y = 0.5;
      break;
    case "puddle": {
      const pd = new THREE.Mesh(new THREE.CircleGeometry(1, 20), mat(p.color ?? "#2a1840", { rough: 0.05, metal: 0.4 }));
      pd.rotation.x = -Math.PI / 2;
      pd.position.y = 0.01;
      pd.scale.y = 0.45;
      g.add(pd);
      break;
    }
    case "chalk": {
      const pts = [[-0.9, 0], [-0.5, 0.5], [0, 0.35], [0.7, 0.6], [1, 0.1], [0.4, -0.2], [0.8, -0.6], [0, -0.4], [-0.6, -0.55], [-0.9, 0]];
      const curve = new THREE.CatmullRomCurve3(pts.map(([x, z]) => new THREE.Vector3(x, 0.02, z)));
      g.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 40, 0.025, 4), mat("#e8e8e8", { emissive: "#666666" })));
      break;
    }
    case "scorch": {
      const star = new THREE.Shape();
      for (let i = 0; i < 10; i++) {
        const r = i % 2 ? 0.25 : 0.6;
        const a = (i / 10) * Math.PI * 2;
        if (i === 0) star.moveTo(Math.cos(a) * r, Math.sin(a) * r);
        else star.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      }
      const s = new THREE.Mesh(new THREE.ShapeGeometry(star), mat("#141014"));
      s.position.set(0, 0.6, 0.02);
      g.add(s);
      const glowDisc = new THREE.Mesh(new THREE.CircleGeometry(0.9, 16), mat("#ff8a00", { emissive: "#ff8a00", emissiveIntensity: 0.6, opacity: 0.35 }));
      glowDisc.position.set(0, 0.6, 0.01);
      g.add(glowDisc);
      break;
    }

    /* ---------------- street & market */
    case "stall": {
      // a wooden market stall with a tarpaulin roof and goods
      const wood = mat("#7a5a36", { rough: 0.95 });
      for (const x of [-1.4, 1.4]) for (const z of [-0.55, 0.55]) box(g, 0.1, 2.5, 0.1, wood, x, 0, z);
      box(g, 3.1, 0.1, 1.3, mat("#ffffff", { map: woodTexture(), rough: 0.9 }), 0, 0.92, 0);
      box(g, 3.0, 0.8, 0.06, wood, 0, 0.12, 0.6);
      const tarp = box(g, 3.5, 0.06, 1.9, mat("#ffffff", { map: stripeTexture(c === "#53FC18" ? "#1d6a8a" : c, "#f2efe6"), rough: 0.9 }), 0, 2.45, 0.05);
      tarp.rotation.x = 0.16;
      const goods = ["#f5c518", "#c0182b", "#e8e0d0", "#3a8a4a", "#e07a2a", "#7a3aff"];
      for (let i = 0; i < 6; i++) {
        const col = goods[i % goods.length];
        if (i % 2) box(g, 0.42, 0.34, 0.42, col, -1.2 + i * 0.48, 1.02, -0.1);
        else {
          const pile = sphere(g, 0.22, col, -1.2 + i * 0.48, 1.18, -0.1, 10);
          pile.scale.y = 0.7;
        }
      }
      for (let i = 0; i < 3; i++) cyl(g, 0.22, 0.26, 0.22, mat("#c9a374", { rough: 1 }), -0.9 + i * 0.9, 1.02, 0.35, 16);
      break;
    }
    case "umbrella": {
      // a big striped market umbrella
      cyl(g, 0.035, 0.035, 2.5, "#3c434c", 0, 0, 0, 10);
      const canopy = new THREE.Mesh(new THREE.ConeGeometry(1.7, 0.65, 16, 1, true), new THREE.MeshStandardMaterial({ map: segmentTexture(c === "#53FC18" ? "#c0182b" : c), roughness: 0.9, side: THREE.DoubleSide }));
      canopy.position.y = 2.75;
      canopy.castShadow = true;
      g.add(canopy);
      sphere(g, 0.06, "#3c434c", 0, 3.1, 0, 8);
      break;
    }
    case "sack":
      cyl(g, 0.3, 0.38, 0.7, "#d8c8a0", 0, 0, 0, 8);
      sphere(g, 0.18, "#d8c8a0", 0, 0.75, 0, 6);
      break;
    case "pyramid":
      for (let r = 0; r < 5; r++) box(g, 2.2 - r * 0.42, 0.32, 2.2 - r * 0.42, r % 2 ? "#e8cf9a" : "#d8be86", 0, r * 0.32, 0);
      break;
    case "chest":
      box(g, 1, 0.6, 0.6, c === "#53FC18" ? "#7a4a1a" : c, 0, 0.75, 0);
      textPanel(g, p.label ?? "", 0.9, 0.25, "#f5c518", "transparent", 0, 1.1, 0.31);
      box(g, 0.18, 0.18, 0.06, "#c9a34a", 0, 0.82, 0.32);
      box(g, 1.3, 0.75, 0.8, "#8a6a3a", 0, 0, 0);
      break;
    case "barrow":
      box(g, 1.1, 0.4, 0.7, "#4c5660", 0, 0.35, 0);
      cyl(g, 0.2, 0.2, 0.1, "#141414", -0.6, 0.0, 0, 10).rotation.z = Math.PI / 2;
      box(g, 0.8, 0.05, 0.05, "#4c5660", 0.8, 0.6, 0.25);
      for (let i = 0; i < 3; i++) cyl(g, 0.06, 0.06, 0.6, "#f5c518", -0.2 + i * 0.2, 0.75, 0, 6).rotation.z = 0.6;
      break;
    case "generator":
      box(g, 0.9, 0.6, 0.6, "#c0182b", 0, 0, 0);
      box(g, 0.4, 0.25, 0.02, "#141414", -0.15, 0.2, 0.31);
      cyl(g, 0.05, 0.05, 0.3, "#4c5660", 0.35, 0.6, 0, 5);
      smoke(g, tickers, [0.35, 0.95, 0], { color: "#8a8a88", size: 0.35, rise: 1.8, opacity: 0.3 });
      break;
    case "chicken":
      sphere(g, 0.2, "#f2f2e8", 0, 0.3, 0, 6).scale.z = 1.3;
      sphere(g, 0.12, "#f2f2e8", 0, 0.5, 0.18, 6);
      box(g, 0.06, 0.08, 0.06, "#c0182b", 0, 0.62, 0.18);
      box(g, 0.05, 0.05, 0.08, "#f5a018", 0, 0.5, 0.31);
      for (const x of [-0.07, 0.07]) box(g, 0.03, 0.2, 0.03, "#f5a018", x, 0, 0);
      break;
    case "hut":
      cyl(g, 1.4, 1.4, 1.8, "#b5803a", 0, 0, 0, 10);
      cone(g, 1.9, 1.6, "#c9a34a", 0, 1.8, 0, 10);
      box(g, 0.7, 1.2, 0.1, "#3a2a1a", 0, 0, 1.38);
      break;
    case "goat":
      box(g, 0.35, 0.35, 0.7, "#f2f2e8", 0, 0.35, 0);
      box(g, 0.24, 0.26, 0.3, "#f2f2e8", 0, 0.6, 0.42);
      for (const [x, z] of [[-0.12, 0.25], [0.12, 0.25], [-0.12, -0.25], [0.12, -0.25]]) box(g, 0.08, 0.35, 0.08, "#4a3a2a", x, 0, z);
      for (const x of [-0.08, 0.08]) box(g, 0.04, 0.18, 0.04, "#8a7a6a", x, 0.86, 0.38).rotation.x = -0.5;
      break;
    case "stake":
      cyl(g, 0.03, 0.03, 1, "#c9a374", 0, 0, 0, 5);
      box(g, 0.35, 0.2, 0.02, "#ff7a3a", 0.18, 0.75, 0);
      break;
    case "hole":
      {
        const h = new THREE.Mesh(new THREE.CircleGeometry(0.8, 14), mat("#140c06"));
        h.rotation.x = -Math.PI / 2;
        h.position.y = 0.02;
        g.add(h);
        const rim = new THREE.Mesh(new THREE.TorusGeometry(0.85, 0.12, 5, 14), mat("#6a4a2a"));
        rim.rotation.x = -Math.PI / 2;
        rim.position.y = 0.04;
        g.add(rim);
      }
      break;
    case "bin":
      box(g, 2.2, 1.3, 1.1, c === "#53FC18" ? "#1f5a3a" : c, 0, 0.25, 0);
      box(g, 2.3, 0.12, 1.2, "#163f2a", 0, 1.55, 0).rotation.x = -0.1;
      for (const x of [-0.9, 0.9]) cyl(g, 0.15, 0.15, 0.1, "#141414", x, 0.1, 0.45, 8).rotation.x = Math.PI / 2;
      if (p.label) textPanel(g, p.label, 1.3, 0.35, "#0f2e1f", "#1f5a3a", 0, 0.95, 0.56);
      break;
    case "pipe":
      cyl(g, 0.12, 0.12, 5, "#3d3346", 0, 0, 0, 8);
      box(g, 0.6, 0.18, 0.18, "#3d3346", 0.25, 2.5, 0);
      break;
    case "lamppost":
      lampPost(g, 0, 0, false);
      break;
    case "sign": {
      const label = p.label ?? "";
      const w = Math.max(1.6, label.length * 0.32);
      const vertical = label.length <= 4 && p.label !== "LOG";
      const panel = vertical ? textPanel(g, label.split("").join("\n"), 0.9, 2.4, c, "#0b0e0f", 0, 1.2, 0.07, true) : textPanel(g, label, w, 0.6, c, "#0b0e0f", 0, 0.3, 0.07, true);
      if (vertical) {
        panel.material = new THREE.MeshBasicMaterial({ map: verticalText(label, c) });
        box(g, 1.05, 2.6, 0.12, "#0b0e0f", 0, -0.1, 0);
      } else box(g, w + 0.15, 0.75, 0.12, "#0b0e0f", 0, -0.075, 0);
      const l = new THREE.PointLight(c, 5, 6, 1.8);
      l.position.set(0, vertical ? 1.2 : 0.3, 0.8);
      g.add(l);
      const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloTexture(), color: c, transparent: true, opacity: 0.35, depthWrite: false, blending: THREE.AdditiveBlending }));
      halo.scale.set(vertical ? 2.4 : w + 1.4, vertical ? 3.6 : 1.6, 1);
      halo.position.set(0, vertical ? 1.2 : 0.3, 0.15);
      halo.raycast = () => {}; // decoration only: never in the way of taps or clue placement
      g.add(halo);
      let on = true;
      tickers.push((t) => {
        const flick = Math.sin(t * 7 + p.x) > 0.96 ? !on : on;
        on = !(Math.sin(t * 1.3 + p.x) > 0.985) ? true : flick;
        l.intensity = on ? 5 : 1;
      });
      break;
    }
    case "lifebuoy": {
      const t = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.13, 8, 16), mat("#ff4a1a"));
      t.position.y = 0.4;
      g.add(t);
      break;
    }
    case "ladder":
      for (const x of [-0.25, 0.25]) box(g, 0.05, 2.4, 0.05, "#c9a374", x, 0, 0);
      for (let i = 0; i < 6; i++) box(g, 0.5, 0.04, 0.04, "#c9a374", 0, 0.2 + i * 0.4, 0);
      break;
    case "coupling":
      box(g, 0.8, 0.3, 0.4, "#6c7884", 0, 0.5, 0);
      cyl(g, 0.08, 0.08, 0.5, "#1a1a1a", 0, 0.4, 0, 6);
      break;

    /* ---------------- vehicles & big set pieces */
    case "suv":
      box(g, 4.4, 0.9, 1.9, c, 0, 0.45, 0);
      box(g, 3, 0.8, 1.8, c, -0.3, 1.35, 0);
      box(g, 2.8, 0.6, 1.82, mat("#9fd4ff", { opacity: 0.55, rough: 0.1 }), -0.3, 1.42, 0);
      for (const x of [-1.4, 1.4]) for (const z of [-0.95, 0.95]) cyl(g, 0.42, 0.42, 0.3, "#141414", x, 0.42, z, 12).rotation.x = Math.PI / 2;
      for (const z of [-0.6, 0.6]) box(g, 0.05, 0.18, 0.3, glow("#ffe08a"), 2.21, 0.75, z);
      break;
    case "bus": {
      // a Lagos danfo: yellow with black stripes, windows, roof rack and luggage
      const yellow = mat("#f2b705", { rough: 0.55 });
      const black = mat("#151515", { rough: 0.6 });
      const glass = mat("#3a4a58", { rough: 0.15, metal: 0.2 });
      box(g, 6.2, 1.3, 2.2, yellow, 0, 0.45, 0);
      box(g, 6.2, 0.16, 2.24, black, 0, 1.3, 0);
      box(g, 6.2, 0.16, 2.24, black, 0, 0.62, 0);
      box(g, 5.2, 1.05, 2.1, yellow, -0.4, 1.75, 0);
      for (let i = 0; i < 5; i++) box(g, 0.82, 0.62, 2.14, glass, -2.5 + i * 0.98, 1.95, 0);
      box(g, 0.08, 0.95, 1.9, glass, 2.25, 1.8, 0).rotation.z = -0.22;
      box(g, 0.9, 0.5, 2.18, yellow, 2.8, 1.75, 0);
      for (const z of [-0.75, 0.75]) {
        box(g, 0.06, 0.2, 0.32, mat("#fff3c4", { emissive: "#fff3c4", emissiveIntensity: 0.4 }), 3.11, 0.95, z);
        box(g, 0.06, 0.16, 0.24, mat("#c0182b", { emissive: "#c0182b", emissiveIntensity: 0.3 }), -3.11, 0.95, z);
      }
      box(g, 0.08, 0.35, 2.0, black, 3.12, 0.5, 0);
      for (const x of [-2.1, 2.1])
        for (const z of [-1.1, 1.1]) {
          const tyre = cyl(g, 0.46, 0.46, 0.32, black, x, 0.46, z, 24);
          tyre.rotation.x = Math.PI / 2;
          tyre.position.y = 0.46;
          const hub = cyl(g, 0.22, 0.22, 0.34, mat("#c8ccd0", { metal: 0.6, rough: 0.35 }), x, 0.46, z, 16);
          hub.rotation.x = Math.PI / 2;
          hub.position.y = 0.46;
        }
      // roof rack with luggage
      const rack = mat("#3c434c", { metal: 0.4, rough: 0.6 });
      box(g, 4.6, 0.06, 1.8, rack, -0.5, 2.32, 0);
      for (const x of [-2.7, 1.7]) box(g, 0.06, 0.25, 1.8, rack, x, 2.32, 0);
      box(g, 1.1, 0.6, 1.0, mat("#ffffff", { map: stripeTexture("#2a4aa8", "#f2efe6"), rough: 0.9 }), -1.6, 2.38, -0.2);
      cyl(g, 0.3, 0.3, 1.2, "#1d4a8a", -0.2, 2.38, 0.3, 16).rotation.z = Math.PI / 2;
      box(g, 0.8, 0.5, 0.7, "#e8e0d0", 0.9, 2.38, -0.2);
      // route board and passengers in the windows
      textPanel(g, p.label ?? "OSHODI–CMS", 2.2, 0.32, "#141414", "#f2b705", -1.0, 2.62, 1.06);
      for (let i = 0; i < 4; i++) {
        const head = box(g, 0.26, 0.28, 0.26, ["#5C3A1E", "#6b4226", "#8D5524", "#4a2c17"][i], -2.5 + i * 0.98, 1.95, 0.85);
        head.castShadow = false;
      }
      textPanel(g, "NO SHAKING", 1.1, 0.22, "#c0182b", "#f2b705", 2.2, 1.0, 1.13);
      break;
    }
    case "boat":
      box(g, 2.6, 0.5, 1, "#ffffff", 0, 0.1, 0);
      box(g, 0.9, 0.4, 0.8, "#1d2f5a", 0.2, 0.6, 0);
      break;
    case "yacht":
      box(g, 8, 1, 2.6, "#ffffff", 0, 0, 0);
      box(g, 4, 1.2, 2.2, "#f2f2e8", 0, 1, 0);
      cyl(g, 0.05, 0.05, 3, "#9aa3ab", 0, 2.2, 0, 4);
      break;
    case "carriage":
      box(g, 9, 2.6, 2.6, c, 0, 0.5, 0);
      box(g, 9, 0.2, 2.62, "#141414", 0, 1.3, 0);
      for (let i = 0; i < 6; i++) box(g, 1, 0.9, 2.64, mat("#20262e", { rough: 0.3 }), -3.6 + i * 1.45, 1.8, 0);
      for (const x of [-3.4, 3.4]) cyl(g, 0.4, 0.4, 2.7, "#141414", x, 0.35, 0, 10).rotation.x = Math.PI / 2;
      break;
    case "crane":
      box(g, 0.5, 9, 0.5, c, 0, 0, 0);
      box(g, 6, 0.4, 0.4, c, 2.4, 9, 0);
      box(g, 1, 0.8, 0.6, "#4c5660", -0.6, 8.5, 0);
      cyl(g, 0.01, 0.01, 4, "#1a1a1a", 4.5, 5, 0, 3);
      box(g, 0.5, 0.4, 0.5, "#6c7884", 4.5, 4.6, 0);
      break;
    case "mixer": {
      box(g, 1.6, 0.4, 0.8, "#4c5660", 0, 0.3, 0);
      const drum = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.6, 1.2, 10), mat("#ff7a1a"));
      drum.rotation.z = 1.1;
      drum.position.set(0, 1.1, 0);
      shadowed(drum);
      g.add(drum);
      tickers.push((t) => (drum.rotation.y = t * 1.5));
      for (const x of [-0.6, 0.6]) cyl(g, 0.25, 0.25, 0.2, "#141414", x, 0.25, 0.42, 10).rotation.x = Math.PI / 2;
      break;
    }
    case "greenhouse": {
      const glass = mat("#bfe7ff", { opacity: 0.18, rough: 0.05 });
      box(g, 8, 3, 5, glass, 0, 0, 0);
      const roof = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 2.5, 8, 10, 1, true, 0, Math.PI), glass);
      roof.rotation.z = Math.PI / 2;
      roof.position.y = 3;
      g.add(roof);
      for (let i = -4; i <= 4; i += 2) box(g, 0.08, 3, 0.08, "#dff4ff", i, 0, 2.5);
      break;
    }
    case "screen": {
      box(g, 9, 4.6, 0.2, "#111111", 0, 0, 0);
      const c2 = document.createElement("canvas");
      c2.width = 128;
      c2.height = 64;
      const tex = new THREE.CanvasTexture(c2);
      const scr = new THREE.Mesh(new THREE.PlaneGeometry(8.6, 4.2), new THREE.MeshBasicMaterial({ map: tex }));
      scr.position.set(0, 2.3, 0.11);
      g.add(scr);
      const ctx = c2.getContext("2d")!;
      tickers.push(() => {
        const img = ctx.createImageData(128, 64);
        for (let i = 0; i < img.data.length; i += 4) {
          const v = Math.random() * 200;
          img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
          img.data[i + 3] = 255;
        }
        ctx.putImageData(img, 0, 0);
        tex.needsUpdate = true;
      });
      const l = new THREE.PointLight("#c8d0ff", 8, 14, 1.4);
      l.position.set(0, 2.3, 2);
      g.add(l);
      break;
    }
    case "projector":
      box(g, 0.8, 0.5, 0.6, "#20262e", 0, 0, 0);
      cyl(g, 0.12, 0.12, 0.2, glow("#ffe9a8"), 0, 0.25, 0.35, 10).rotation.x = Math.PI / 2;
      break;
    case "vault": {
      const door = new THREE.Mesh(new THREE.CylinderGeometry(2, 2, 0.5, 20), mat("#5a6672", { metal: 0.6, rough: 0.4 }));
      door.rotation.x = Math.PI / 2;
      door.position.set(0, 2, 0);
      shadowed(door);
      g.add(door);
      const inner = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 0.52, 20), mat("#6c7884", { metal: 0.5, rough: 0.4 }));
      inner.rotation.x = Math.PI / 2;
      inner.position.set(0, 2, 0.02);
      g.add(inner);
      const wheel = new THREE.Group();
      wheel.position.set(0, 2, 0.32);
      for (const a of [0, Math.PI / 3, (2 * Math.PI) / 3]) {
        const spoke = box(wheel, 0.12, 1.4, 0.08, "#9aa3ab", 0, -0.7, 0);
        spoke.rotation.z = a;
        spoke.position.set(0, 0, 0);
      }
      g.add(wheel);
      tickers.push((t) => (wheel.rotation.z = Math.sin(t * 0.3) * 0.2));
      break;
    }
    case "goldbars":
      for (let r = 0; r < 3; r++) for (let k = 0; k < 4 - r; k++) box(g, 0.45, 0.18, 0.22, mat("#e6b84a", { metal: 0.8, rough: 0.3 }), -0.7 + k * 0.48 + r * 0.24, r * 0.18, 0);
      break;
    case "laser": {
      box(g, 0.5, 0.8, 0.3, "#2b333b", 0, 0, 0);
      sphere(g, 0.08, mat("#ffb000", { emissive: "#ffb000" }), 0, 0.6, 0.16, 6);
      const beams = new THREE.Group();
      for (let i = 0; i < 4; i++) {
        const beam = new THREE.Mesh(new THREE.BoxGeometry(14, 0.03, 0.03), new THREE.MeshBasicMaterial({ color: "#ff2a2a", transparent: true, opacity: 0.8 }));
        beam.position.set(7, 0.2 + i * 0.15, 0.4 + i * 0.6);
        beam.rotation.y = -0.15 + i * 0.08;
        beams.add(beam);
      }
      g.add(beams);
      tickers.push((t) => beams.children.forEach((b) => (((b as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = 0.5 + Math.sin(t * 4) * 0.3)));
      break;
    }
    case "monitor": {
      cyl(g, 0.25, 0.3, 0.05, "#3a3346", 0, 0, 0, 8);
      box(g, 0.08, 0.35, 0.08, "#3a3346", 0, 0.03, 0);
      box(g, 1.6, 1, 0.1, "#0b0e0f", 0, 0.38, 0);
      textPanel(g, p.label ?? "", 1.45, 0.85, p.color ?? "#ff7af5", "#1a1030", 0, 0.88, 0.06, true);
      break;
    }
    case "ringlight": {
      cyl(g, 0.03, 0.03, 2, "#3a3346", 0, 0, 0, 5);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.08, 8, 24), mat("#fff6e0", { emissive: "#fff6e0", emissiveIntensity: 1.4 }));
      ring.position.y = 2.4;
      g.add(ring);
      const l = new THREE.PointLight("#fff6e0", 8, 7, 1.6);
      l.position.set(0, 2.4, 0.5);
      g.add(l);
      break;
    }
    case "router":
      box(g, 0.5, 0.12, 0.3, "#1d1830", 0, 0, 0);
      for (const x of [-0.18, 0.18]) box(g, 0.03, 0.3, 0.03, "#3a3346", x, 0.12, -0.1);
      for (let i = 0; i < 4; i++) box(g, 0.03, 0.03, 0.01, glow("#53FC18"), -0.12 + i * 0.08, 0.05, 0.16);
      break;
    case "laptop":
      box(g, 0.6, 0.03, 0.4, "#6c7884", 0, 0, 0);
      box(g, 0.6, 0.38, 0.03, "#1a1a1a", 0, 0.02, -0.2).rotation.x = -0.25;
      box(g, 0.52, 0.3, 0.01, glow(p.color ?? "#53FC18"), 0, 0.06, -0.18).rotation.x = -0.25;
      break;
    case "panel":
      box(g, 0.1, 1, 0.1, "#4c5660", 0, 0, 0);
      box(g, 0.8, 1, 0.12, "#1a1a1a", 0, 1, 0);
      box(g, 0.6, 0.35, 0.01, glow(p.color ?? "#53FC18"), 0, 1.5, 0.07);
      break;
    case "console":
      box(g, 3.6, 0.9, 1.1, "#2b2f36", 0, 0, 0);
      box(g, 2.8, 1.3, 0.15, "#0b0e0f", 0, 0.95, -0.3);
      textPanel(g, "END OF TRANSMISSION", 2.6, 0.6, "#ff3b4e", "#0b0e0f", 0, 1.6, -0.21, true);
      for (let i = 0; i < 10; i++) box(g, 0.12, 0.06, 0.2, i % 3 ? "#6c7884" : glow("#53FC18"), -1.4 + i * 0.3, 0.9, 0.2);
      break;
    case "server":
    case "smashed": {
      const rack = new THREE.Group();
      box(rack, 1, 2.6, 0.9, "#1d2328", 0, 0, 0);
      for (let i = 0; i < 9; i++) {
        box(rack, 0.85, 0.2, 0.02, "#2b3238", 0, 0.2 + i * 0.26, 0.46);
        box(rack, 0.06, 0.06, 0.02, glow(i % 3 ? (p.color ?? "#53FC18") : "#ff2a2a"), 0.32, 0.27 + i * 0.26, 0.47);
      }
      if (p.kind === "smashed") {
        rack.rotation.z = -0.25;
        rack.position.x = 0.3;
        for (let i = 0; i < 6; i++) box(g, 0.25, 0.04, 0.2, "#6c7884", -0.8 + i * 0.35, 0, 0.6 + (i % 2) * 0.2).rotation.y = i;
      }
      g.add(rack);
      break;
    }
    case "speaker":
      box(g, 0.8, 2.8, 0.7, "#1a1a1a", 0, 0, 0);
      for (const y of [0.8, 1.9]) cyl(g, 0.28, 0.28, 0.04, "#2b2f36", 0, y, 0.36, 14).rotation.x = Math.PI / 2;
      break;
    case "djbooth":
      box(g, 2.2, 1.1, 0.9, "#141414", 0, 0, 0);
      textPanel(g, p.label ?? "DJ", 1.6, 0.35, "#53FC18", "#141414", 0, 0.6, 0.46, true);
      box(g, 0.6, 0.04, 0.4, "#4c5660", 0.4, 1.1, 0);
      break;
    case "mic":
      cyl(g, 0.02, 0.02, 1.4, "#1a1a1a", 0, 0, 0, 5);
      sphere(g, 0.1, "#4c5660", 0, 1.45, 0, 6).scale.y = 1.5;
      break;
    case "onair":
      box(g, 1.4, 0.45, 0.1, "#2a1416", 0, 0, 0);
      textPanel(g, "ON AIR", 1.2, 0.35, "#5a2026", "#2a1416", 0, 0.22, 0.06);
      break;
    case "cctv":
      box(g, 0.12, 0.3, 0.12, "#2b3440", 0, 0.3, -0.05);
      box(g, 0.25, 0.22, 0.55, "#cfd6dc", 0, 0.15, 0.2).rotation.x = 0.4;
      sphere(g, 0.04, mat("#ff2a2a", { emissive: "#ff2a2a" }), 0, 0.1, 0.48, 5);
      break;
    case "safe":
      box(g, 1.1, 1.1, 0.8, "#3b4148", 0, 0, 0);
      cyl(g, 0.18, 0.18, 0.06, "#9aa3ab", 0, 0.55, 0.41, 12).rotation.x = Math.PI / 2;
      break;
    case "clock":
      box(g, 0.7, 2, 0.4, "#6a4a2a", 0, 0, 0);
      cyl(g, 0.26, 0.26, 0.04, "#f2ead2", 0, 1.55, 0.21, 16).rotation.x = Math.PI / 2;
      box(g, 0.03, 0.18, 0.01, "#1a1a1a", 0, 1.6, 0.24);
      box(g, 0.12, 0.03, 0.01, "#1a1a1a", 0.05, 1.55, 0.24);
      sphere(g, 0.08, "#e6c35a", 0, 0.7, 0.21, 6);
      break;
    case "terracotta":
      sphere(g, 0.32, "#b5653a", 0, 0.38, 0, 8).scale.y = 1.2;
      for (const x of [-0.11, 0.11]) sphere(g, 0.05, "#1a0a05", x, 0.43, 0.28, 5);
      break;
    case "easel":
      for (const x of [-0.45, 0.45]) box(g, 0.06, 2.2, 0.06, "#8a6a3a", x, 0, 0).rotation.z = x > 0 ? -0.15 : 0.15;
      box(g, 1.3, 1, 0.05, "#f2ead2", 0, 1.2, 0.05);
      box(g, 0.8, 0.12, 0.02, c, 0, 1.6, 0.09).rotation.z = 0.4;
      sphere(g, 0.18, "#c0182b", -0.2, 1.75, 0.08, 6).scale.z = 0.2;
      break;
    case "paint":
      cyl(g, 0.45, 0.45, 0.04, "#c9a374", 0, 0.02, 0, 14).scale.z = 0.6;
      for (const [x, z, col] of [[-0.2, 0, "#c0182b"], [0, -0.1, "#53FC18"], [0.2, 0, "#1d6a8a"]] as const) sphere(g, 0.06, col, x, 0.07, z, 5);
      break;
    case "plant":
      cyl(g, 0.22, 0.18, 0.4, "#b5653a", 0, 0, 0, 8);
      for (let i = 0; i < 5; i++) {
        const leaf = cone(g, 0.12, 0.8, "#3a8a4a", Math.cos(i) * 0.1, 0.35, Math.sin(i) * 0.1, 5);
        leaf.rotation.z = Math.cos(i * 1.3) * 0.5;
      }
      break;
    case "orchid":
      cyl(g, 0.02, 0.02, 0.8, "#3a8a4a", 0, 0, 0, 4);
      for (let i = 0; i < 5; i++) sphere(g, 0.1, c, Math.cos((i / 5) * 6.28) * 0.12, 0.85, Math.sin((i / 5) * 6.28) * 0.12, 5);
      sphere(g, 0.06, "#f5c518", 0, 0.85, 0, 5);
      break;
    case "tank":
      cyl(g, 0.7, 0.7, 2, "#1d4a8a", 0, 0, 0, 12);
      break;
    case "gourd":
      sphere(g, 0.3, "#c9a374", 0, 0.3, 0, 8);
      sphere(g, 0.16, "#c9a374", 0, 0.68, 0, 7);
      break;
    case "bonfire": {
      for (let i = 0; i < 4; i++) box(g, 1.4, 0.15, 0.15, "#5a3a1a", 0, 0.05, 0).rotation.y = (i * Math.PI) / 4;
      const flame = cone(g, 0.5, 1.4, "#ff7a1a", 0, 0.1, 0, 7);
      flame.material = mat("#ff7a1a", { emissive: "#ff5a00", emissiveIntensity: 1.5 });
      const inner = cone(g, 0.28, 0.9, "#ffd36b", 0, 0.1, 0, 6);
      inner.material = mat("#ffd36b", { emissive: "#ffd36b", emissiveIntensity: 1.5 });
      const l = new THREE.PointLight("#ff8a3a", 30, 14, 1.6);
      l.position.y = 1.2;
      g.add(l);
      smoke(g, tickers, [0, 1.5, 0], { color: "#5a5654", size: 0.8, rise: 3.5, opacity: 0.3, count: 8 });
      tickers.push((t) => {
        const f = 1 + Math.sin(t * 9) * 0.08 + Math.sin(t * 13) * 0.05;
        flame.scale.set(f, 1 + Math.sin(t * 7) * 0.12, f);
        l.intensity = 26 + Math.sin(t * 11) * 6;
      });
      break;
    }
    case "drum":
      cyl(g, 0.3, 0.24, 0.8, "#8a4a2a", 0, 0, 0, 10);
      cyl(g, 0.31, 0.31, 0.02, "#f2ead2", 0, 0.8, 0, 10);
      break;
    case "guitar":
      g.rotation.z = -0.4;
      sphere(g, 0.3, "#b5653a", 0, 0.3, 0, 8).scale.z = 0.3;
      box(g, 0.08, 0.8, 0.05, "#5a3a1a", 0, 0.55, 0);
      break;
    case "chess":
      box(g, 0.7, 0.75, 0.7, "#5a3a1a", 0, 0, 0);
      for (let r = 0; r < 4; r++) for (let k = 0; k < 4; k++) box(g, 0.15, 0.02, 0.15, (r + k) % 2 ? "#3a2418" : "#f2ead2", -0.225 + k * 0.15, 0.75, -0.225 + r * 0.15);
      cyl(g, 0.04, 0.05, 0.12, "#ffffff", -0.07, 0.77, 0.07, 6);
      cyl(g, 0.04, 0.05, 0.12, "#1a1a1a", 0.08, 0.77, -0.08, 6);
      break;
    case "crate":
      box(g, 1.2, 0.9, 0.9, "#a8783a", 0, 0, 0);
      for (const y of [0.15, 0.75]) box(g, 1.22, 0.08, 0.92, "#6a4a20", 0, y, 0);
      if (p.label) textPanel(g, p.label, 0.8, 0.22, "#c0182b", "#f2f2e8", 0, 0.45, 0.46);
      break;
    /* ---------------------------------------------------------------- city scenes */
    case "keke": {
      // tricycle ("keke napep")
      const body = c === "#53FC18" ? "#f5c518" : c;
      box(g, 1.3, 0.55, 1.9, body, 0, 0.35, -0.1);
      box(g, 1.26, 0.9, 0.06, mat("#9fd4ff", { opacity: 0.45, rough: 0.1 }), 0, 0.95, 0.75);
      box(g, 1.4, 0.08, 2.1, body, 0, 1.85, -0.1);
      for (const x of [-0.62, 0.62]) for (const z of [0.7, -0.95]) box(g, 0.05, 1.0, 0.05, "#1a1a1a", x, 0.9, z);
      box(g, 1.2, 0.35, 0.7, "#2b2f36", 0, 0.9, -0.6);
      for (const x of [-0.6, 0.6]) cyl(g, 0.26, 0.26, 0.16, "#141414", x, 0.26, -0.75, 16).rotation.z = Math.PI / 2;
      cyl(g, 0.24, 0.24, 0.14, "#141414", 0, 0.24, 0.95, 16).rotation.z = Math.PI / 2;
      box(g, 0.7, 0.05, 0.05, "#9aa3ab", 0, 1.15, 0.8);
      sphere(g, 0.08, mat("#fff3c4", { emissive: "#fff3c4", emissiveIntensity: 0.6 }), 0, 0.75, 1.05, 10);
      break;
    }
    case "okada": {
      const body = c === "#53FC18" ? "#c0182b" : c;
      for (const z of [-0.55, 0.6]) {
        const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.07, 12, 28), mat("#141414", { rough: 0.6 }));
        wheel.rotation.y = Math.PI / 2;
        wheel.position.set(0, 0.32, z);
        g.add(wheel);
      }
      box(g, 0.16, 0.18, 1.0, "#2b2f36", 0, 0.42, 0);
      box(g, 0.3, 0.26, 0.45, body, 0, 0.6, 0.15);
      box(g, 0.28, 0.1, 0.6, "#1a1a1a", 0, 0.78, -0.25);
      box(g, 0.05, 0.5, 0.05, "#9aa3ab", 0, 0.55, 0.55);
      box(g, 0.7, 0.04, 0.04, "#1a1a1a", 0, 1.05, 0.5);
      sphere(g, 0.07, mat("#fff3c4", { emissive: "#fff3c4", emissiveIntensity: 0.6 }), 0, 0.95, 0.62, 10);
      break;
    }
    case "adire": {
      // a line of indigo tie-dye cloth drying
      for (const x of [-1.6, 1.6]) cyl(g, 0.05, 0.05, 2.3, "#6a4a2a", x, 0, 0, 8);
      box(g, 3.3, 0.03, 0.03, "#e8e0d0", 0, 2.2, 0);
      const cloths: THREE.Mesh[] = [];
      for (let i = 0; i < 4; i++) {
        const m = new THREE.Mesh(new THREE.PlaneGeometry(0.72, 1.5), new THREE.MeshStandardMaterial({ map: adireTexture(i), side: THREE.DoubleSide, roughness: 0.9 }));
        m.position.set(-1.15 + i * 0.77, 1.45, 0);
        m.castShadow = true;
        g.add(m);
        cloths.push(m);
      }
      tickers.push((t) => cloths.forEach((m, i) => (m.rotation.x = Math.sin(t * 1.3 + i) * 0.08)));
      break;
    }
    case "dyepit": {
      // a clay-lined indigo dye pit in the ground
      const rim = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.14, 12, 32), mat("#8a6a4a", { rough: 0.95 }));
      rim.rotation.x = -Math.PI / 2;
      rim.position.y = 0.06;
      g.add(rim);
      const dye = new THREE.Mesh(new THREE.CircleGeometry(0.58, 32), mat("#141a4a", { rough: 0.15, metal: 0.2 }));
      dye.rotation.x = -Math.PI / 2;
      dye.position.y = 0.05;
      g.add(dye);
      break;
    }
    case "furnace": {
      // a bronze-casting clay furnace with a glowing mouth
      const dome = sphere(g, 0.75, mat("#8a5a3a", { rough: 0.95 }), 0, 0, 0, 16);
      dome.scale.y = 0.9;
      const mouth = new THREE.Mesh(new THREE.CircleGeometry(0.25, 20), mat("#ff6a00", { emissive: "#ff5a00", emissiveIntensity: 1.6 }));
      mouth.position.set(0, 0.3, 0.72);
      g.add(mouth);
      cyl(g, 0.12, 0.15, 0.7, "#6a4a2a", 0, 0.6, -0.1, 12);
      const glow = new THREE.PointLight("#ff7a1a", 6, 6, 1.6);
      glow.position.set(0, 0.4, 1.1);
      g.add(glow);
      tickers.push((t) => (glow.intensity = 5 + Math.sin(t * 9) * 1.2 + Math.sin(t * 13) * 0.6));
      smoke(g, tickers, [0, 1.35, -0.1], { color: "#6a6460", size: 0.6, rise: 3, opacity: 0.35 });
      break;
    }
    case "bronze": {
      // a cast bronze head on a stand
      const bronzeMat = mat("#a8763a", { metal: 0.9, rough: 0.32 });
      box(g, 0.5, 0.9, 0.5, "#3a2a1a", 0, 0, 0);
      cyl(g, 0.17, 0.2, 0.22, bronzeMat, 0, 0.9, 0, 24);
      for (let i = 0; i < 4; i++) cyl(g, 0.19 - i * 0.005, 0.19 - i * 0.005, 0.04, bronzeMat, 0, 0.92 + i * 0.05, 0, 24);
      const head = sphere(g, 0.2, bronzeMat, 0, 1.3, 0, 16);
      head.scale.set(0.9, 1.15, 0.95);
      cyl(g, 0.17, 0.12, 0.18, bronzeMat, 0, 1.48, -0.02, 20);
      break;
    }
    case "shoerack": {
      box(g, 2.0, 2.0, 0.5, "#6a4a2a", 0, 0, 0);
      const colors = ["#3a2418", "#141414", "#8a1a2a", "#c9a34a", "#f2f2e8", "#1d2f5a"];
      for (let r = 0; r < 4; r++) {
        box(g, 1.9, 0.04, 0.46, "#4a3020", 0, 0.1 + r * 0.48, 0.02);
        for (let k = 0; k < 5; k++) {
          const shoe = capsule(g, 0.07, 0.18, colors[(r * 5 + k) % colors.length], -0.76 + k * 0.38, 0.2 + r * 0.48, 0.08);
          shoe.rotation.x = Math.PI / 2;
        }
      }
      break;
    }
    case "sewing": {
      // a tailor's table with a sewing machine and fabric
      box(g, 1.4, 0.06, 0.7, "#6a4a2a", 0, 0.78, 0);
      for (const x of [-0.62, 0.62]) for (const z of [-0.28, 0.28]) box(g, 0.05, 0.78, 0.05, "#3a2a1a", x, 0, z);
      box(g, 0.55, 0.14, 0.24, "#1d1d22", -0.1, 0.84, 0);
      box(g, 0.14, 0.32, 0.22, "#1d1d22", 0.12, 0.84, 0);
      box(g, 0.5, 0.12, 0.2, "#1d1d22", -0.08, 1.12, 0);
      cyl(g, 0.07, 0.07, 0.05, "#c9a34a", 0.22, 1.08, 0.12, 16).rotation.x = Math.PI / 2;
      box(g, 0.6, 0.02, 0.45, c === "#53FC18" ? "#c0182b" : c, -0.3, 0.84, 0.1).rotation.y = 0.3;
      break;
    }
    case "kiosk": {
      // a roadside kiosk: painted booth, zinc roof, sign board and a window counter
      const body = c === "#53FC18" ? "#1d6a8a" : c;
      box(g, 1.7, 2.2, 1.3, mat(body, { rough: 0.85 }), 0, 0, 0);
      box(g, 1.3, 0.85, 0.05, "#141618", 0, 0.95, 0.66);
      box(g, 1.85, 0.08, 0.5, mat("#ffffff", { map: woodTexture(), rough: 0.9 }), 0, 0.92, 0.82);
      const roof = box(g, 2.1, 0.1, 1.8, mat("#ffffff", { map: zincTex(), rough: 0.7, metal: 0.3 }), 0, 2.3, 0.1);
      roof.rotation.x = -0.12;
      box(g, 1.8, 0.48, 0.08, "#f2efe6", 0, 2.55, 0.62);
      if (p.label) textPanel(g, p.label, 1.66, 0.42, "#ffffff", "#c0182b", 0, 2.79, 0.67, false);
      box(g, 0.25, 0.3, 0.06, "#f5c518", 0.45, 1.3, 0.68);
      break;
    }
    case "boulder": {
      const r = new THREE.Mesh(new THREE.DodecahedronGeometry(1.2, 1), mat(c === "#53FC18" ? "#8a7a6a" : c, { rough: 1 }));
      r.position.y = 0.9;
      r.scale.set(1.3, 0.85, 1);
      r.rotation.set(0.3, 0.7, 0.1);
      g.add(r);
      break;
    }
    case "tanker": {
      const body = c === "#53FC18" ? "#e8e0d0" : c;
      box(g, 2.2, 1.6, 1.8, "#c0182b", 2.6, 0.5, 0);
      box(g, 1.2, 0.8, 1.82, mat("#9fd4ff", { opacity: 0.55, rough: 0.1 }), 3.0, 1.2, 0);
      const tank = cyl(g, 0.95, 0.95, 5, mat(body, { metal: 0.6, rough: 0.3 }), -0.8, 0.5 + 0.95, 0, 24);
      tank.rotation.z = Math.PI / 2;
      tank.position.y = 1.55;
      box(g, 5.6, 0.25, 1.4, "#2b2f36", -0.3, 0.45, 0);
      for (const x of [-2.6, -1.4, 2.6]) for (const z of [-0.85, 0.85]) cyl(g, 0.42, 0.42, 0.3, "#141414", x, 0.42, z, 16).rotation.x = Math.PI / 2;
      if (p.label) textPanel(g, p.label, 2.2, 0.5, "#c0182b", body, -0.8, 1.6, 0.96, false);
      break;
    }
    /* ---------------------------------------------------------------- roads and the lagoon */
    case "cone": {
      box(g, 0.44, 0.04, 0.44, "#1d1f22", 0, 0, 0);
      cone(g, 0.18, 0.74, c === "#53FC18" ? "#ff6a1a" : c, 0, 0.04, 0, 18);
      cyl(g, 0.1, 0.12, 0.1, "#f4f4f0", 0, 0.38, 0, 18);
      cyl(g, 0.055, 0.075, 0.08, "#f4f4f0", 0, 0.6, 0, 18);
      break;
    }
    case "tape": {
      // police line: two posts and tape that flutters
      const w = 3.6;
      for (const x of [-w / 2, w / 2]) {
        cyl(g, 0.045, 0.06, 1.1, "#f5c518", x, 0, 0, 10);
        cyl(g, 0.16, 0.18, 0.08, "#2b2f36", x, 0, 0, 14);
      }
      const tapeMat = new THREE.MeshStandardMaterial({ map: textTexture("POLICE LINE  \u2022  DO NOT CROSS  \u2022  POLICE LINE", "#141414", "#f5c518", 1024, 40), side: THREE.DoubleSide, roughness: 0.6 });
      const strips: THREE.Mesh[] = [];
      for (const y of [1.0, 0.62]) {
        const m = new THREE.Mesh(new THREE.PlaneGeometry(w, 0.1, 12, 1), tapeMat);
        m.position.set(0, y, 0);
        g.add(m);
        strips.push(m);
      }
      tickers.push((t) =>
        strips.forEach((m, i) => {
          const pos = m.geometry.attributes.position as THREE.BufferAttribute;
          for (let k = 0; k < pos.count; k++) {
            const x = pos.getX(k);
            const sag = 1 - (2 * x / w) ** 2;
            pos.setZ(k, Math.sin(t * 3 + x * 2 + i) * 0.05 * sag);
            pos.setY(k, (k < pos.count / 2 ? 0.05 : -0.05) - sag * 0.06);
          }
          pos.needsUpdate = true;
        }),
      );
      break;
    }
    case "patrol": {
      // a police pickup with a flashing light bar (front faces +x)
      const blue = mat("#1d2f5a", { rough: 0.5 });
      const black = mat("#151515", { rough: 0.6 });
      const glass = mat("#2a3a48", { rough: 0.15, metal: 0.2 });
      box(g, 5, 0.5, 1.86, black, 0, 0.3, 0);
      box(g, 1.3, 0.55, 1.84, blue, 1.85, 0.75, 0);
      box(g, 1.7, 1.0, 1.84, blue, 0.45, 0.75, 0);
      box(g, 1.5, 0.55, 1.88, glass, 0.4, 1.12, 0);
      box(g, 0.08, 0.6, 1.7, glass, 1.33, 1.08, 0).rotation.z = -0.35;
      for (const z of [-0.9, 0.9]) box(g, 2.0, 0.55, 0.08, blue, -1.45, 0.75, z);
      box(g, 0.08, 0.55, 1.86, blue, -2.45, 0.75, 0);
      box(g, 2.0, 0.08, 1.8, black, -1.45, 0.75, 0);
      textPanel(g, "POLICE", 1.6, 0.36, "#ffffff", "#1d2f5a", -1.4, 1.0, 0.95, false);
      textPanel(g, "POLICE", 1.2, 0.3, "#ffffff", "#1d2f5a", 0.45, 0.95, 0.93, false);
      for (const x of [-1.6, 1.6])
        for (const z of [-0.95, 0.95]) {
          const tyre = cyl(g, 0.4, 0.4, 0.3, black, x, 0.4, z, 24);
          tyre.rotation.x = Math.PI / 2;
          tyre.position.y = 0.4;
        }
      for (const z of [-0.65, 0.65]) box(g, 0.06, 0.16, 0.3, mat("#fff3c4", { emissive: "#fff3c4", emissiveIntensity: 0.5 }), 2.5, 0.85, z);
      const red = new THREE.MeshStandardMaterial({ color: "#c0182b", emissive: "#ff2a3a", emissiveIntensity: 1 });
      const blu = new THREE.MeshStandardMaterial({ color: "#1d4aff", emissive: "#3a6aff", emissiveIntensity: 1 });
      box(g, 0.3, 0.14, 0.7, red, 0.5, 1.76, -0.4);
      box(g, 0.3, 0.14, 0.7, blu, 0.5, 1.76, 0.4);
      const flash = new THREE.PointLight("#ff2a3a", 6, 9, 1.6);
      flash.position.set(0.5, 2.2, 0);
      g.add(flash);
      tickers.push((t) => {
        const on = Math.floor(t * 4) % 2 === 0;
        red.emissiveIntensity = on ? 2.2 : 0.15;
        blu.emissiveIntensity = on ? 0.15 : 2.2;
        flash.color.set(on ? "#ff2a3a" : "#3a6aff");
      });
      break;
    }
    case "diversion": {
      // a yellow DIVERSION board on legs, with a striped bar
      for (const x of [-0.9, 0.9]) box(g, 0.08, 1.2, 0.08, "#2b2f36", x, 0, 0);
      box(g, 2.3, 0.3, 0.06, mat("#ffffff", { map: stripeTexture("#c0182b", "#f4f0e4") }), 0, 0.5, 0);
      box(g, 2.3, 1.05, 0.06, "#141414", 0, 1.2, -0.02);
      textPanel(g, p.label ?? "DIVERSION \u2192", 2.2, 0.95, "#141414", "#f5c518", 0, 1.72, 0.02);
      break;
    }
    case "car": {
      // a saloon car (front faces +x)
      const body = mat(c === "#53FC18" ? "#c8ccd0" : c, { rough: 0.35, metal: 0.3 });
      const black = mat("#151515", { rough: 0.6 });
      box(g, 4.3, 0.62, 1.78, body, 0, 0.3, 0);
      box(g, 2.2, 0.52, 1.62, body, -0.25, 0.92, 0);
      box(g, 2.24, 0.38, 1.66, mat("#22303c", { rough: 0.12, metal: 0.3 }), -0.25, 0.98, 0);
      box(g, 4.36, 0.16, 1.82, black, 0, 0.24, 0);
      for (const x of [-1.35, 1.35])
        for (const z of [-0.86, 0.86]) {
          const tyre = cyl(g, 0.33, 0.33, 0.24, black, x, 0.33, z, 22);
          tyre.rotation.x = Math.PI / 2;
          tyre.position.y = 0.33;
          const hub = cyl(g, 0.17, 0.17, 0.26, mat("#b8bcc0", { metal: 0.6, rough: 0.35 }), x, 0.33, z, 14);
          hub.rotation.x = Math.PI / 2;
          hub.position.y = 0.33;
        }
      for (const z of [-0.62, 0.62]) {
        box(g, 0.05, 0.14, 0.34, mat("#fff3c4", { emissive: "#fff3c4", emissiveIntensity: 0.5 }), 2.16, 0.7, z);
        box(g, 0.05, 0.14, 0.3, mat("#c0182b", { emissive: "#c0182b", emissiveIntensity: 0.5 }), -2.16, 0.7, z);
      }
      if (p.label) textPanel(g, p.label, 0.56, 0.16, "#141414", "#f2f2e8", -2.19, 0.45, 0, false).rotation.y = -Math.PI / 2;
      break;
    }
    case "van": {
      // a cash-in-transit van with its back doors open and hazards blinking (front faces +x)
      const white = mat("#e8ebee", { rough: 0.45, metal: 0.2 });
      const black = mat("#151515", { rough: 0.6 });
      box(g, 4.0, 2.0, 2.0, white, -0.7, 0.45, 0);
      box(g, 1.5, 1.45, 2.0, white, 2.05, 0.45, 0);
      box(g, 0.08, 0.7, 1.8, mat("#22303c", { rough: 0.12, metal: 0.3 }), 2.78, 1.2, 0).rotation.z = -0.2;
      box(g, 4.0, 0.35, 2.04, mat("#1d6a3a", { rough: 0.5 }), -0.7, 1.15, 0);
      textPanel(g, p.label ?? "SECURECASH", 2.6, 0.42, "#1d6a3a", "#e8ebee", -0.7, 1.95, 1.02, false);
      box(g, 0.5, 0.36, 0.04, "#2b2f36", -1.6, 0.95, 1.01);
      for (const side of [-1, 1]) {
        const door = new THREE.Group();
        box(door, 0.06, 1.85, 0.98, white, 0, 0, side * 0.49);
        door.position.set(-2.72, 0.5, side * 0.98);
        door.rotation.y = side * 1.25;
        g.add(door);
      }
      box(g, 0.05, 1.6, 1.8, "#3a3f46", -2.66, 0.55, 0);
      for (const x of [-1.9, 1.9])
        for (const z of [-1.0, 1.0]) {
          const tyre = cyl(g, 0.42, 0.42, 0.3, black, x, 0.42, z, 22);
          tyre.rotation.x = Math.PI / 2;
          tyre.position.y = 0.42;
        }
      const amber = new THREE.MeshStandardMaterial({ color: "#e08a1a", emissive: "#ffae2a", emissiveIntensity: 1 });
      for (const z of [-0.8, 0.8]) {
        box(g, 0.06, 0.16, 0.24, amber, 2.82, 0.85, z);
        box(g, 0.06, 0.16, 0.24, amber, -2.72, 0.6, z);
      }
      tickers.push((t) => (amber.emissiveIntensity = Math.floor(t * 1.6) % 2 ? 2 : 0.1));
      break;
    }
    case "canoe": {
      // a dugout canoe: a long, shallow hull with thwarts, a paddle and a small outboard engine
      const wood = mat(c === "#53FC18" ? "#6a4426" : c, { rough: 0.95 });
      const hull = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), wood);
      hull.scale.set(2.2, 0.42, 0.48);
      hull.position.y = 0.42;
      g.add(hull);
      const inside = new THREE.Mesh(new THREE.CircleGeometry(1, 32), mat("#3a2414", { rough: 1 }));
      inside.rotation.x = -Math.PI / 2;
      inside.scale.set(2.1, 0.44, 1);
      inside.position.y = 0.34;
      g.add(inside);
      for (const x of [-0.7, 0.5]) box(g, 0.12, 0.05, 0.8, "#8a6a42", x, 0.36, 0);
      box(g, 0.06, 0.06, 1.8, "#8a6a42", 0.2, 0.42, 0.1).rotation.y = 0.6;
      if (p.label !== "no-engine") {
        box(g, 0.34, 0.46, 0.3, "#2b2f36", -2.25, 0.36, 0);
        box(g, 0.08, 0.6, 0.08, "#2b2f36", -2.32, -0.1, 0);
      } else box(g, 0.1, 0.16, 0.34, "#8a8f94", -2.12, 0.34, 0);
      break;
    }
    case "tollbooth": {
      // a toll lane: booth, canopy and a striped barrier arm that rises and falls
      const body = c === "#53FC18" ? "#1d4a8a" : c;
      box(g, 1.5, 2.4, 1.5, "#f2f2ec", 0, 0.2, 0);
      box(g, 1.52, 0.4, 1.52, body, 0, 2.2, 0);
      box(g, 1.0, 0.8, 0.04, mat("#22303c", { rough: 0.12, metal: 0.3 }), 0, 1.25, 0.76);
      box(g, 1.7, 0.2, 1.7, "#c8ccd0", 0, 0, 0);
      box(g, 0.24, 1.0, 0.24, "#c0182b", 1.0, 0.2, 0.5);
      const arm = new THREE.Group();
      box(arm, 3.2, 0.1, 0.1, mat("#ffffff", { map: stripeTexture("#c0182b", "#f4f0e4") }), 1.6, -0.05, 0);
      arm.position.set(1.0, 1.15, 0.5);
      g.add(arm);
      tickers.push((t) => (arm.rotation.z = Math.max(0, Math.sin(t * 0.5)) * 1.2));
      const light = new THREE.MeshStandardMaterial({ color: "#1aa34a", emissive: "#2aff6a", emissiveIntensity: 1 });
      box(g, 0.2, 0.2, 0.06, light, 0.5, 1.95, 0.77);
      tickers.push((t) => {
        const up = Math.sin(t * 0.5) > 0.2;
        light.color.set(up ? "#1aa34a" : "#c0182b");
        light.emissive.set(up ? "#2aff6a" : "#ff2a3a");
      });
      if (p.label) textPanel(g, p.label, 1.4, 0.36, "#ffffff", body, 0, 2.4, 0.77, false);
      break;
    }
    case "coil": {
      // a coil of rope lying on the ground
      const rope = mat(c === "#53FC18" ? "#1d6ac8" : c, { rough: 0.9 });
      for (let i = 0; i < 4; i++) {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(0.34 - i * 0.02, 0.045, 10, 32), rope);
        ring.rotation.x = -Math.PI / 2;
        ring.position.set(i * 0.02, 0.05 + i * 0.07, 0);
        g.add(ring);
      }
      const tail = cyl(g, 0.04, 0.04, 0.9, rope, 0.55, 0.04, 0.2, 8);
      tail.rotation.z = Math.PI / 2;
      tail.rotation.y = 0.5;
      break;
    }
    case "lantern": {
      // a hurricane lantern with a warm flicker
      const metal = mat("#b84a1a", { metal: 0.5, rough: 0.5 });
      cyl(g, 0.17, 0.2, 0.16, metal, 0, 0, 0, 16);
      const flame = new THREE.MeshStandardMaterial({ color: "#ffd27a", emissive: "#ffb347", emissiveIntensity: 1.6, transparent: true, opacity: 0.85 });
      cyl(g, 0.12, 0.14, 0.3, flame, 0, 0.16, 0, 16);
      cyl(g, 0.08, 0.16, 0.08, metal, 0, 0.46, 0, 16);
      const handle = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.015, 6, 20, Math.PI), metal);
      handle.position.y = 0.54;
      g.add(handle);
      const light = new THREE.PointLight("#ffb35a", 5, 7, 1.6);
      light.position.y = 0.3;
      g.add(light);
      tickers.push((t) => (light.intensity = 4.4 + Math.sin(t * 13) * 0.5 + Math.sin(t * 7.3) * 0.4));
      break;
    }
    case "snake": {
      // a small grass snake, coiled, its head raised and swaying
      const skin = mat(c === "#53FC18" ? "#4a8a3a" : c, { rough: 0.5 });
      for (let i = 0; i < 3; i++) {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(0.22 - i * 0.05, 0.045, 10, 28), skin);
        ring.rotation.x = -Math.PI / 2;
        ring.position.y = 0.045 + i * 0.075;
        g.add(ring);
      }
      const neck = new THREE.Group();
      neck.position.set(0.1, 0.24, 0.05);
      cyl(neck, 0.035, 0.045, 0.28, skin, 0, 0, 0, 10);
      const head = sphere(neck, 0.055, skin, 0, 0.3, 0.03, 10);
      head.scale.set(1, 0.7, 1.5);
      for (const sx of [-0.025, 0.025]) sphere(neck, 0.012, "#141414", sx, 0.32, 0.09, 6);
      g.add(neck);
      tickers.push((t) => {
        neck.rotation.z = Math.sin(t * 1.4) * 0.25;
        neck.rotation.x = Math.sin(t * 0.9) * 0.15;
      });
      break;
    }
    case "tusk": {
      // a long curved ivory tusk
      const ivory = mat(c === "#53FC18" ? "#efe6cf" : c, { rough: 0.45 });
      const path = new THREE.CatmullRomCurve3([new THREE.Vector3(-0.7, 0.05, 0), new THREE.Vector3(-0.2, 0.18, 0), new THREE.Vector3(0.3, 0.38, 0), new THREE.Vector3(0.65, 0.7, 0)]);
      const tusk = new THREE.Mesh(new THREE.TubeGeometry(path, 24, 0.07, 12, false), ivory);
      g.add(tusk);
      sphere(g, 0.07, ivory, -0.7, 0.05, 0, 10);
      cone(g, 0.06, 0.18, "#efe6cf", 0.68, 0.68, 0, 10).rotation.z = -0.6;
      break;
    }
    case "hawker": {
      const person = makePerson({ skin: "#6b4226", top: "#c0182b", bottom: "#2b2f36", hold: "tray" });
      g.add(person);
      break;
    }
    default:
      box(g, 0.5, 0.5, 0.5, c, 0, 0, 0);
  }
  g.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });
  return g;
}

function shadowed(m: THREE.Mesh) {
  m.castShadow = true;
  m.receiveShadow = true;
}

function verticalText(text: string, color: string) {
  const c = document.createElement("canvas");
  c.width = 128;
  c.height = 340;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#0b0e0f";
  ctx.fillRect(0, 0, 128, 340);
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 16;
  ctx.font = "900 70px Inter, Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  [...text].forEach((ch, i, all) => ctx.fillText(ch, 64, ((i + 0.5) / all.length) * 340));
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** Indigo adire (tie-dye) patterns, a few variations. */
function adireTexture(i: number) {
  const c = document.createElement("canvas");
  c.width = 64;
  c.height = 128;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = ["#1b2a6b", "#22307a", "#18245c", "#2a3a8a"][i % 4];
  ctx.fillRect(0, 0, 64, 128);
  ctx.strokeStyle = "rgba(220,230,255,0.75)";
  ctx.fillStyle = "rgba(220,230,255,0.75)";
  if (i % 2 === 0) {
    for (let y = 8; y < 128; y += 16)
      for (let x = 8; x < 64; x += 16) {
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.stroke();
      }
  } else {
    ctx.lineWidth = 3;
    for (let y = 6; y < 128; y += 12) {
      ctx.beginPath();
      for (let x = 0; x <= 64; x += 8) ctx.lineTo(x, y + (x % 16 ? 3 : -3));
      ctx.stroke();
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/* ---------------------------------------------------------------- prop textures */

const propTex = new Map<string, THREE.Texture>();
function cached(key: string, draw: (ctx: CanvasRenderingContext2D, c: HTMLCanvasElement) => void, w = 128, h = 128, repeat = false) {
  const hit = propTex.get(key);
  if (hit) return hit;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d")!, c);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  propTex.set(key, t);
  return t;
}

function stripeTexture(a: string, b: string) {
  return cached(`stripe|${a}|${b}`, (ctx) => {
    for (let i = 0; i < 8; i++) {
      ctx.fillStyle = i % 2 ? b : a;
      ctx.fillRect(i * 16, 0, 16, 128);
    }
  });
}

/** Alternating panels around an umbrella (u runs round the cone). */
function segmentTexture(a: string) {
  return cached(`seg|${a}`, (ctx) => {
    for (let i = 0; i < 8; i++) {
      ctx.fillStyle = i % 2 ? "#f4f0e4" : a;
      ctx.fillRect(i * 16, 0, 16, 128);
    }
  });
}

function woodTexture() {
  return cached("wood", (ctx) => {
    ctx.fillStyle = "#9a7448";
    ctx.fillRect(0, 0, 128, 128);
    for (let i = 0; i < 40; i++) {
      ctx.strokeStyle = `rgba(70,45,20,${0.15 + Math.random() * 0.25})`;
      ctx.beginPath();
      const y = Math.random() * 128;
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(40, y + 3, 80, y - 3, 128, y + 1);
      ctx.stroke();
    }
    ctx.fillStyle = "rgba(60,35,15,0.6)";
    for (const y of [0, 42, 85]) ctx.fillRect(0, y, 128, 2);
  });
}

function zincTex() {
  return cached("zinc-prop", (ctx) => {
    ctx.fillStyle = "#9aa0a4";
    ctx.fillRect(0, 0, 128, 128);
    for (let x = 0; x < 128; x += 8) {
      ctx.fillStyle = "rgba(255,255,255,0.25)";
      ctx.fillRect(x, 0, 3, 128);
      ctx.fillStyle = "rgba(0,0,0,0.2)";
      ctx.fillRect(x + 4, 0, 2, 128);
    }
    for (let i = 0; i < 12; i++) {
      ctx.fillStyle = "rgba(140,70,30,0.4)";
      ctx.beginPath();
      ctx.arc(Math.random() * 128, Math.random() * 128, 6 + Math.random() * 14, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

function haloTexture() {
  return cached("halo", (ctx) => {
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.4, "rgba(255,255,255,0.35)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
  });
}

/**
 * Soft puffs of smoke rising from a point. The puffs are made on the first
 * frame, after the prop has been placed, so they never change its size, and
 * they ignore taps and raycasts.
 */
function smoke(g: THREE.Group, tickers: Tick[], at: [number, number, number], opts: { color: string; size: number; rise: number; opacity?: number; count?: number }) {
  const n = opts.count ?? 6;
  let puffs: THREE.Sprite[] | null = null;
  tickers.push((t) => {
    if (!puffs) {
      puffs = [];
      for (let i = 0; i < n; i++) {
        const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloTexture(), color: opts.color, transparent: true, opacity: 0, depthWrite: false }));
        sprite.raycast = () => {};
        g.add(sprite);
        puffs.push(sprite);
      }
    }
    puffs.forEach((sprite, i) => {
      const life = (t * 0.3 + i / n) % 1;
      sprite.position.set(at[0] + Math.sin(t * 0.6 + i * 2) * 0.25 * life, at[1] + life * opts.rise, at[2] + Math.cos(t * 0.5 + i) * 0.1 * life);
      const size = opts.size * (0.4 + life * 1.8);
      sprite.scale.set(size, size, 1);
      (sprite.material as THREE.SpriteMaterial).opacity = (opts.opacity ?? 0.35) * Math.sin(life * Math.PI);
    });
  });
}
