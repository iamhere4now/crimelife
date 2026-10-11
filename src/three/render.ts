/**
 * How every 3D scene is drawn: true-to-colour tone mapping, matte materials
 * with a little soft studio fill (no glare, no bloom), and crisp shadows.
 */

import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

export function setupRenderer(renderer: THREE.WebGLRenderer) {
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1.0;
}

const envs = new WeakMap<THREE.WebGLRenderer, THREE.Texture>();

/** A soft studio environment, used only as a gentle fill light. */
export function environmentFor(renderer: THREE.WebGLRenderer) {
  let env = envs.get(renderer);
  if (!env) {
    const pmrem = new THREE.PMREMGenerator(renderer);
    env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();
    envs.set(renderer, env);
  }
  return env;
}

export function lightScene(renderer: THREE.WebGLRenderer, scene: THREE.Scene) {
  scene.environment = environmentFor(renderer);
  scene.environmentIntensity = (scene.userData.envIntensity as number | undefined) ?? 0.25;
}

export interface Pipeline {
  render: () => void;
  setSize: (w: number, h: number) => void;
  dispose: () => void;
}

export function makePipeline(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera): Pipeline {
  return { render: () => renderer.render(scene, camera), setSize: () => {}, dispose: () => {} };
}
