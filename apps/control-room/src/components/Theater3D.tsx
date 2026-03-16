'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { motion, AnimatePresence } from 'framer-motion';
import { SPHERE_FREQUENCY_MAP, ALL_SPHERE_IDS } from '@/shared/sphere-state';
import type { MeetingLocation } from '@/lib/meeting-locations';

// ---------------------------------------------------------------------------
// Agent avatar config — derived from SPHERE_FREQUENCY_MAP (9 Dolores Cannon spheres)
// ---------------------------------------------------------------------------
const AGENT_CONFIG = ALL_SPHERE_IDS.map((id) => {
  const s = SPHERE_FREQUENCY_MAP[id];
  const hexToInt = (h: string) => parseInt(h.replace('#', ''), 16);
  return {
    name: s.displayName,
    color: hexToInt(s.baseColor),
    emissive: hexToInt(s.emissiveColor),
    label: s.displayName.slice(0, 2).toUpperCase(),
    sphereId: id,
    baseColorHex: s.baseColor,
    frequency_hz: s.frequency_hz,
  };
});

// ---------------------------------------------------------------------------
// Scene builders for each location
// ---------------------------------------------------------------------------

function buildKioscoMorisco(scene: THREE.Scene) {
  // Ground – grass
  const grassGeo = new THREE.PlaneGeometry(60, 60);
  const grassMat = new THREE.MeshLambertMaterial({ color: 0x2d5a1b });
  const grass = new THREE.Mesh(grassGeo, grassMat);
  grass.rotation.x = -Math.PI / 2;
  grass.receiveShadow = true;
  scene.add(grass);

  // Cobblestone path (circle around kiosk)
  const pathGeo = new THREE.RingGeometry(4, 7, 48);
  const pathMat = new THREE.MeshLambertMaterial({ color: 0x8a7560, side: THREE.DoubleSide });
  const path = new THREE.Mesh(pathGeo, pathMat);
  path.rotation.x = -Math.PI / 2;
  path.position.y = 0.01;
  scene.add(path);

  // Kiosk base platform (octagonal)
  const baseGeo = new THREE.CylinderGeometry(3.2, 3.5, 0.5, 8);
  const baseMat = new THREE.MeshStandardMaterial({ color: 0x7a6550, roughness: 0.7 });
  const base = new THREE.Mesh(baseGeo, baseMat);
  base.position.y = 0.25;
  base.castShadow = true;
  scene.add(base);

  // Upper floor of kiosk
  const floorGeo = new THREE.CylinderGeometry(3.0, 3.2, 0.2, 8);
  const floorMat = new THREE.MeshStandardMaterial({ color: 0x5a4432, roughness: 0.6 });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.position.y = 0.6;
  scene.add(floor);

  // 8 columns arranged in a circle
  const colGeo = new THREE.CylinderGeometry(0.12, 0.12, 3.5, 12);
  const colMat = new THREE.MeshStandardMaterial({
    color: 0x1a1a2e,
    metalness: 0.8,
    roughness: 0.2,
  });
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const col = new THREE.Mesh(colGeo, colMat);
    col.position.set(Math.cos(angle) * 2.6, 2.4, Math.sin(angle) * 2.6);
    col.castShadow = true;
    scene.add(col);
  }

  // Ornate ring between columns (horizontal torus)
  const ringGeo = new THREE.TorusGeometry(2.6, 0.08, 8, 48);
  const ringMat = new THREE.MeshStandardMaterial({ color: 0x1a1a2e, metalness: 0.9 });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.position.y = 3.8;
  ring.rotation.x = Math.PI / 2;
  scene.add(ring);

  // Dome
  const domeGeo = new THREE.SphereGeometry(2.9, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
  const domeMat = new THREE.MeshStandardMaterial({
    color: 0x1a1a2e,
    metalness: 0.85,
    roughness: 0.15,
    side: THREE.DoubleSide,
  });
  const dome = new THREE.Mesh(domeGeo, domeMat);
  dome.position.y = 3.8;
  dome.castShadow = true;
  scene.add(dome);

  // Dome finial (top spike)
  const finialGeo = new THREE.ConeGeometry(0.15, 1.2, 8);
  const finial = new THREE.Mesh(finialGeo, ringMat);
  finial.position.y = 7.1;
  scene.add(finial);

  // Park trees
  const treePositions = [
    [-10, 6], [-7, -9], [8, 10], [10, -7],
    [-12, -3], [5, 13], [-6, 12], [13, 2],
  ];
  treePositions.forEach(([tx, tz]) => {
    const trunkGeo = new THREE.CylinderGeometry(0.2, 0.3, 2, 8);
    const trunkMat = new THREE.MeshLambertMaterial({ color: 0x5c3d1e });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.set(tx, 1, tz);
    trunk.castShadow = true;
    scene.add(trunk);

    const foliageGeo = new THREE.SphereGeometry(1.5 + Math.random(), 8, 6);
    const foliageMat = new THREE.MeshLambertMaterial({
      color: 0x1a5c0a + Math.floor(Math.random() * 0x102010),
    });
    const foliage = new THREE.Mesh(foliageGeo, foliageMat);
    foliage.position.set(tx, 3.5 + Math.random() * 0.5, tz);
    foliage.castShadow = true;
    scene.add(foliage);
  });

  // Park benches (4 sides)
  const benchAngles = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
  benchAngles.forEach((angle) => {
    const seatGeo = new THREE.BoxGeometry(1.4, 0.1, 0.4);
    const seatMat = new THREE.MeshLambertMaterial({ color: 0x8b6914 });
    const seat = new THREE.Mesh(seatGeo, seatMat);
    seat.position.set(Math.cos(angle) * 5.5, 0.5, Math.sin(angle) * 5.5);
    seat.rotation.y = angle + Math.PI / 2;
    scene.add(seat);

    const legGeo = new THREE.BoxGeometry(0.1, 0.5, 0.1);
    const legMat = new THREE.MeshLambertMaterial({ color: 0x555555 });
    [-0.55, 0.55].forEach((offset) => {
      const leg = new THREE.Mesh(legGeo, legMat);
      leg.position.set(
        Math.cos(angle) * 5.5 + Math.cos(angle + Math.PI / 2) * offset,
        0.25,
        Math.sin(angle) * 5.5 + Math.sin(angle + Math.PI / 2) * offset
      );
      scene.add(leg);
    });
  });

  // Fountain in center under kiosk
  const fountainBaseGeo = new THREE.CylinderGeometry(1.0, 1.2, 0.15, 16);
  const fountainMat = new THREE.MeshStandardMaterial({ color: 0x999999, roughness: 0.4 });
  const fountainBase = new THREE.Mesh(fountainBaseGeo, fountainMat);
  fountainBase.position.y = 0.72;
  scene.add(fountainBase);

  return { agentRingRadius: 2.0, agentY: 1.0 };
}

function buildBalconDelZocalo(scene: THREE.Scene) {
  // Rooftop terrace floor (stone)
  const floorGeo = new THREE.PlaneGeometry(30, 25);
  const floorMat = new THREE.MeshStandardMaterial({ color: 0xa89070, roughness: 0.85 });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  // Parapet walls (low perimeter wall)
  const wallMat = new THREE.MeshStandardMaterial({ color: 0xc8b090, roughness: 0.9 });
  [
    { pos: [0, 0.6, -12.5] as [number, number, number], scale: [30, 1.2, 0.4] as [number, number, number] },
    { pos: [0, 0.6, 12.5] as [number, number, number], scale: [30, 1.2, 0.4] as [number, number, number] },
    { pos: [-15, 0.6, 0] as [number, number, number], scale: [0.4, 1.2, 25] as [number, number, number] },
    { pos: [15, 0.6, 0] as [number, number, number], scale: [0.4, 1.2, 25] as [number, number, number] },
  ].forEach(({ pos, scale }) => {
    const wallGeo = new THREE.BoxGeometry(...scale);
    const wall = new THREE.Mesh(wallGeo, wallMat);
    wall.position.set(...pos);
    wall.castShadow = true;
    scene.add(wall);
  });

  // Metropolitan Cathedral silhouette (background, far behind)
  function buildCathedralTower(x: number, z: number) {
    const towerGeo = new THREE.BoxGeometry(2.5, 14, 2);
    const towerMat = new THREE.MeshLambertMaterial({ color: 0xd4c49a });
    const tower = new THREE.Mesh(towerGeo, towerMat);
    tower.position.set(x, 7, z);
    scene.add(tower);

    const spireGeo = new THREE.ConeGeometry(0.8, 6, 8);
    const spire = new THREE.Mesh(spireGeo, towerMat);
    spire.position.set(x, 17, z);
    scene.add(spire);
  }
  buildCathedralTower(-6, -35);
  buildCathedralTower(6, -35);

  // Cathedral central dome
  const cathedralBodyGeo = new THREE.BoxGeometry(18, 10, 4);
  const cathedralMat = new THREE.MeshLambertMaterial({ color: 0xd4c49a });
  const cathedralBody = new THREE.Mesh(cathedralBodyGeo, cathedralMat);
  cathedralBody.position.set(0, 5, -36);
  scene.add(cathedralBody);

  const catDomeGeo = new THREE.SphereGeometry(2.5, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2);
  const catDome = new THREE.Mesh(catDomeGeo, cathedralMat);
  catDome.position.set(0, 12, -36);
  scene.add(catDome);

  // Zócalo plaza (ground level, viewed from above)
  const zocaloGeo = new THREE.PlaneGeometry(40, 40);
  const zocaloMat = new THREE.MeshLambertMaterial({ color: 0xb8a888 });
  const zocalo = new THREE.Mesh(zocaloGeo, zocaloMat);
  zocalo.rotation.x = -Math.PI / 2;
  zocalo.position.set(0, -8, -20);
  scene.add(zocalo);

  // Restaurant tables – circular arrangement
  const tableMat = new THREE.MeshStandardMaterial({ color: 0x1a0e04, roughness: 0.5 });
  const clothMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 });
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const tx = Math.cos(angle) * 6;
    const tz = Math.sin(angle) * 6;
    const tableGeo = new THREE.CylinderGeometry(0.7, 0.7, 0.08, 16);
    const table = new THREE.Mesh(tableGeo, tableMat);
    table.position.set(tx, 0.78, tz);
    scene.add(table);
    const clothGeo = new THREE.CylinderGeometry(0.75, 0.75, 0.01, 16);
    const cloth = new THREE.Mesh(clothGeo, clothMat);
    cloth.position.set(tx, 0.83, tz);
    scene.add(cloth);
    const legGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.7, 8);
    const leg = new THREE.Mesh(legGeo, tableMat);
    leg.position.set(tx, 0.4, tz);
    scene.add(leg);
  }

  // Hanging string lights
  const lightMat = new THREE.MeshBasicMaterial({ color: 0xfff4aa });
  for (let i = 0; i < 20; i++) {
    const bulbGeo = new THREE.SphereGeometry(0.06, 6, 6);
    const bulb = new THREE.Mesh(bulbGeo, lightMat);
    bulb.position.set(
      (Math.random() - 0.5) * 24,
      3.5,
      (Math.random() - 0.5) * 20
    );
    scene.add(bulb);
  }

  return { agentRingRadius: 4, agentY: 1.1 };
}

function buildManantiales(scene: THREE.Scene) {
  // Water plane
  const waterGeo = new THREE.PlaneGeometry(80, 80);
  const waterMat = new THREE.MeshStandardMaterial({
    color: 0x006994,
    roughness: 0.2,
    metalness: 0.1,
    transparent: true,
    opacity: 0.85,
  });
  const water = new THREE.Mesh(waterGeo, waterMat);
  water.rotation.x = -Math.PI / 2;
  water.position.y = -0.05;
  water.receiveShadow = true;
  scene.add(water);

  // Concrete foundation platform (above water)
  const foundationGeo = new THREE.CylinderGeometry(9, 9, 0.4, 32);
  const concreteMat = new THREE.MeshStandardMaterial({ color: 0xe8dcc8, roughness: 0.9 });
  const foundation = new THREE.Mesh(foundationGeo, concreteMat);
  foundation.position.y = 0.2;
  foundation.receiveShadow = true;
  foundation.castShadow = true;
  scene.add(foundation);

  // ── Los Manantiales iconic HP shell roof ──────────────────────────────────
  // Formula: y = maxHeight * r^1.2 * cos(4θ) / R + centerHeight
  // Creates 8-petal undulating shell
  const SEGMENTS = 64;
  const RINGS = 32;
  const MAX_R = 8.5;
  const MAX_HEIGHT = 3.5;
  const CENTER_H = 3.0;

  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let ri = 0; ri <= RINGS; ri++) {
    for (let si = 0; si <= SEGMENTS; si++) {
      const r = (ri / RINGS) * MAX_R;
      const theta = (si / SEGMENTS) * Math.PI * 2;
      const x = r * Math.cos(theta);
      const z = r * Math.sin(theta);
      const y =
        CENTER_H +
        (MAX_HEIGHT * Math.pow(r / MAX_R, 1.2) * Math.cos(4 * theta));
      positions.push(x, y, z);
      normals.push(0, 1, 0); // will be recomputed
      uvs.push(si / SEGMENTS, ri / RINGS);
    }
  }
  for (let ri = 0; ri < RINGS; ri++) {
    for (let si = 0; si < SEGMENTS; si++) {
      const a = ri * (SEGMENTS + 1) + si;
      const b = a + 1;
      const c = (ri + 1) * (SEGMENTS + 1) + si;
      const d = c + 1;
      indices.push(a, c, b);
      indices.push(b, c, d);
    }
  }

  const roofGeo = new THREE.BufferGeometry();
  roofGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  roofGeo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  roofGeo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  roofGeo.setIndex(indices);
  roofGeo.computeVertexNormals();

  const roofMat = new THREE.MeshStandardMaterial({
    color: 0xf5efe0,
    roughness: 0.75,
    metalness: 0.05,
    side: THREE.DoubleSide,
  });
  const roof = new THREE.Mesh(roofGeo, roofMat);
  roof.castShadow = true;
  roof.receiveShadow = true;
  scene.add(roof);

  // Thin edge beam around the roof perimeter
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2 + Math.PI / 8;
    const petalTip = new THREE.SphereGeometry(0.18, 8, 8);
    const tipMat = new THREE.MeshStandardMaterial({ color: 0xd4c8b0, roughness: 0.7 });
    const tip = new THREE.Mesh(petalTip, tipMat);
    const tipTheta = angle;
    const tipR = MAX_R;
    const tipY =
      CENTER_H +
      MAX_HEIGHT * Math.pow(tipR / MAX_R, 1.2) * Math.cos(4 * tipTheta);
    tip.position.set(tipR * Math.cos(tipTheta), tipY, tipR * Math.sin(tipTheta));
    scene.add(tip);
  }

  // Support columns (8 slim concrete pillars where roof dips meet foundation)
  for (let i = 0; i < 8; i++) {
    const colAngle = (i / 8) * Math.PI * 2 + Math.PI / 8;
    const colR = 7.2;
    const colTheta = colAngle;
    const colTopY =
      CENTER_H +
      MAX_HEIGHT * Math.pow(colR / MAX_R, 1.2) * Math.cos(4 * colTheta);
    const colHeight = colTopY + 0.4;
    const colGeo = new THREE.CylinderGeometry(0.12, 0.14, colHeight, 8);
    const colMat = new THREE.MeshStandardMaterial({ color: 0xe0d8c0, roughness: 0.8 });
    const col = new THREE.Mesh(colGeo, colMat);
    col.position.set(
      colR * Math.cos(colTheta),
      colHeight / 2 + 0.4,
      colR * Math.sin(colTheta)
    );
    col.castShadow = true;
    scene.add(col);
  }

  // Trajineras (traditional colorful Xochimilco boats)
  const boatColors = [0xe63946, 0x2a9d8f, 0xe9c46a, 0xf4a261, 0x9b5de5, 0xf15bb5];
  const boatPositions = [
    [14, -5], [-15, 3], [12, 8], [-10, -8], [5, 16], [-6, -14],
  ];
  boatPositions.forEach(([bx, bz], idx) => {
    // Hull
    const hullGeo = new THREE.BoxGeometry(4, 0.5, 1.4);
    const hullMat = new THREE.MeshLambertMaterial({ color: boatColors[idx % boatColors.length] });
    const hull = new THREE.Mesh(hullGeo, hullMat);
    hull.position.set(bx, 0.2, bz);
    hull.rotation.y = Math.random() * 0.6 - 0.3;
    scene.add(hull);
    // Canopy arch
    const archGeo = new THREE.TorusGeometry(0.65, 0.06, 6, 12, Math.PI);
    const archMat = new THREE.MeshLambertMaterial({ color: boatColors[(idx + 2) % boatColors.length] });
    const arch = new THREE.Mesh(archGeo, archMat);
    arch.position.set(bx, 0.75, bz);
    arch.rotation.z = Math.PI;
    arch.rotation.y = hull.rotation.y;
    scene.add(arch);
  });

  // Willow trees on shore
  const willowPositions = [
    [20, 15], [-22, 10], [18, -16], [-19, -12], [25, 0], [-24, -3],
  ];
  willowPositions.forEach(([wx, wz]) => {
    const trunkGeo = new THREE.CylinderGeometry(0.15, 0.25, 4, 8);
    const trunkMat = new THREE.MeshLambertMaterial({ color: 0x4a3728 });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.set(wx, 2, wz);
    scene.add(trunk);
    for (let w = 0; w < 6; w++) {
      const drapeAngle = (w / 6) * Math.PI * 2;
      const drapeGeo = new THREE.CylinderGeometry(0.02, 0.01, 3.5, 4);
      const drapeMat = new THREE.MeshLambertMaterial({ color: 0x4a7c3f });
      const drape = new THREE.Mesh(drapeGeo, drapeMat);
      drape.position.set(
        wx + Math.cos(drapeAngle) * 0.8,
        2.0,
        wz + Math.sin(drapeAngle) * 0.8
      );
      drape.rotation.z = Math.cos(drapeAngle) * 0.4;
      drape.rotation.x = Math.sin(drapeAngle) * 0.4;
      scene.add(drape);
    }
    const foliageGeo = new THREE.SphereGeometry(1.8, 8, 6);
    const foliageMat = new THREE.MeshLambertMaterial({ color: 0x2d5c1e, transparent: true, opacity: 0.85 });
    const foliage = new THREE.Mesh(foliageGeo, foliageMat);
    foliage.position.set(wx, 5, wz);
    scene.add(foliage);
  });

  // Water lily pads
  for (let i = 0; i < 12; i++) {
    const padGeo = new THREE.CircleGeometry(0.3 + Math.random() * 0.3, 8);
    const padMat = new THREE.MeshLambertMaterial({ color: 0x2d6a1e });
    const pad = new THREE.Mesh(padGeo, padMat);
    const angle = Math.random() * Math.PI * 2;
    const r = 10 + Math.random() * 10;
    pad.position.set(Math.cos(angle) * r, 0.02, Math.sin(angle) * r);
    pad.rotation.x = -Math.PI / 2;
    scene.add(pad);
  }

  return { agentRingRadius: 3.5, agentY: 0.65 };
}

// ---------------------------------------------------------------------------
// Scene 4: Cosmic Field — Dolores Cannon inverted-sphere boundary
// ---------------------------------------------------------------------------
function buildCosmicFieldScene(scene: THREE.Scene) {
  // Inverted boundary sphere — inside-out, deep cosmic
  const boundaryGeo = new THREE.SphereGeometry(28, 64, 64);
  const boundaryMat = new THREE.MeshBasicMaterial({
    color: 0x0a0020,
    side: THREE.BackSide,
  });
  scene.add(new THREE.Mesh(boundaryGeo, boundaryMat));

  // Nebula particle cloud — 3000 points in sphere palette colours
  const nbCount = 3000;
  const nbGeo = new THREE.BufferGeometry();
  const nbPos = new Float32Array(nbCount * 3);
  const nbColors = new Float32Array(nbCount * 3);
  const palette = ALL_SPHERE_IDS.map((id) => {
    const hex = SPHERE_FREQUENCY_MAP[id].baseColor.replace('#', '');
    return new THREE.Color(parseInt(hex, 16));
  });
  for (let i = 0; i < nbCount; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = 8 + Math.random() * 18;
    nbPos[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
    nbPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    nbPos[i * 3 + 2] = r * Math.cos(phi);
    const c = palette[i % palette.length];
    nbColors[i * 3]     = c.r;
    nbColors[i * 3 + 1] = c.g;
    nbColors[i * 3 + 2] = c.b;
  }
  nbGeo.setAttribute('position', new THREE.BufferAttribute(nbPos, 3));
  nbGeo.setAttribute('color', new THREE.BufferAttribute(nbColors, 3));
  const nbMat = new THREE.PointsMaterial({
    size: 0.12,
    vertexColors: true,
    transparent: true,
    opacity: 0.65,
    sizeAttenuation: true,
  });
  scene.add(new THREE.Points(nbGeo, nbMat));

  // Aurora curtain sheets — 9 translucent ribbon planes, one per sphere
  ALL_SPHERE_IDS.forEach((id, i) => {
    const angle = (i / ALL_SPHERE_IDS.length) * Math.PI * 2;
    const auroraGeo = new THREE.PlaneGeometry(6, 16, 1, 24);
    const pos = auroraGeo.attributes.position as THREE.BufferAttribute;
    for (let v = 0; v < pos.count; v++) {
      const yNorm = (pos.getY(v) + 8) / 16;
      pos.setX(v, pos.getX(v) + Math.sin(yNorm * Math.PI * 3) * 0.8);
    }
    pos.needsUpdate = true;
    const hexStr = SPHERE_FREQUENCY_MAP[id].baseColor.replace('#', '');
    const aurMat = new THREE.MeshBasicMaterial({
      color: parseInt(hexStr, 16),
      transparent: true,
      opacity: 0.08,
      side: THREE.DoubleSide,
    });
    const aurora = new THREE.Mesh(auroraGeo, aurMat);
    aurora.position.set(Math.cos(angle) * 12, 4, Math.sin(angle) * 12);
    aurora.rotation.y = -angle;
    scene.add(aurora);
  });

  // Central council ring — glowing ground disc
  const ringGeo = new THREE.RingGeometry(3.8, 4.2, 128);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0x8b5cf6,
    transparent: true,
    opacity: 0.35,
    side: THREE.DoubleSide,
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.01;
  scene.add(ring);

  return { agentRingRadius: 4.2, agentY: 0.6 };
}

// ---------------------------------------------------------------------------
// GLSL for Fresnel + noise sphere shader
// ---------------------------------------------------------------------------
const SPHERE_VERTEX_SHADER = `
  uniform float uTime;
  uniform float uFrequency;
  varying vec3 vNormal;
  varying vec3 vViewDir;
  void main() {
    vec3 pos = position;
    float disp = sin(pos.x * 8.0 + uTime * uFrequency * 6.28) *
                 cos(pos.y * 8.0 + uTime * uFrequency * 4.0) * 0.04;
    pos += normal * disp;
    vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
    vViewDir = normalize(-mvPos.xyz);
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * mvPos;
  }
`;

const SPHERE_FRAGMENT_SHADER = `
  uniform vec3 uBaseColor;
  uniform vec3 uEmissiveColor;
  uniform float uTime;
  uniform float uPulse;
  varying vec3 vNormal;
  varying vec3 vViewDir;
  void main() {
    float fresnel = pow(1.0 - max(dot(vNormal, vViewDir), 0.0), 3.0);
    vec3 core = uEmissiveColor * (0.6 + 0.4 * sin(uTime * 3.0));
    vec3 rim  = uBaseColor * fresnel;
    vec3 col  = mix(core, uBaseColor, 0.5) + rim * 1.2;
    float pulse = uPulse * (1.0 - fresnel) * 0.8;
    col += uBaseColor * pulse;
    gl_FragColor = vec4(col, 1.0);
  }
`;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface TheaterProps {
  meetingId?: string;
  bilingual?: boolean;
  location?: MeetingLocation | null;
}

export function Theater3D({ meetingId, bilingual = true, location }: TheaterProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const composerRef = useRef<EffectComposer | null>(null);
  const animFrameRef = useRef<number>(0);
  const pulseQueueRef = useRef<Array<{ mesh: THREE.Mesh; born: number }>>([]);
  const shaderUniformsRef = useRef<Array<{ [key: string]: THREE.IUniform }>>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [tick, setTick] = useState(0);

  const buildScene = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    // Clean up previous renderer
    if (rendererRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      rendererRef.current.dispose();
      while (container.firstChild) container.removeChild(container.firstChild);
    }

    const locationId = location?.id ?? 'balcon-del-zocalo';
    const bgColor = location?.bgColor ?? 0x1a0e04;
    const ambientColor = location?.ambientColor ?? 0xffc66d;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(bgColor);
    scene.fog = new THREE.Fog(bgColor, 30, 80);

    const camera = new THREE.PerspectiveCamera(
      55,
      container.clientWidth / container.clientHeight,
      0.1,
      200
    );

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // EffectComposer + bloom (skip on low-res mobile)
    const isMobile = container.clientWidth <= 768;
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    if (!isMobile) {
      const bloom = new UnrealBloomPass(
        new THREE.Vector2(container.clientWidth, container.clientHeight),
        0.9,   // strength
        0.4,   // radius
        0.82,  // threshold
      );
      composer.addPass(bloom);
    }
    composerRef.current = composer;

    // Lights
    const ambient = new THREE.AmbientLight(ambientColor, 0.55);
    scene.add(ambient);

    const sun = new THREE.DirectionalLight(0xfff5cc, 1.2);
    sun.position.set(10, 20, 10);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 1024;
    sun.shadow.mapSize.height = 1024;
    scene.add(sun);

    const fill = new THREE.PointLight(ambientColor, 0.4, 40);
    fill.position.set(-8, 5, 8);
    scene.add(fill);

    // Build location-specific scene
    let sceneConfig = { agentRingRadius: 4, agentY: 1.0 };
    if (locationId === 'santa-maria-ribera') {
      sceneConfig = buildKioscoMorisco(scene);
      camera.position.set(0, 8, 18);
    } else if (locationId === 'balcon-del-zocalo') {
      sceneConfig = buildBalconDelZocalo(scene);
      camera.position.set(0, 6, 16);
    } else if (locationId === 'manantiales-xochimilco') {
      sceneConfig = buildManantiales(scene);
      camera.position.set(0, 10, 22);
    } else if (locationId === 'cosmic-field') {
      scene.background = new THREE.Color(0x030010);
      scene.fog = new THREE.FogExp2(0x030010, 0.012);
      sceneConfig = buildCosmicFieldScene(scene);
      camera.position.set(0, 6, 14);
    } else {
      // Default fallback
      const gridHelper = new THREE.GridHelper(20, 20, 0x27272a, 0x18181b);
      scene.add(gridHelper);
      camera.position.set(0, 8, 16);
    }

    camera.lookAt(0, 2, 0);

    // OrbitControls for interaction
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 5;
    controls.maxDistance = 50;
    controls.minPolarAngle = 0.2;
    controls.maxPolarAngle = Math.PI / 2.1;
    controls.target.set(0, 2, 0);
    controls.update();

    // Agent avatars around a central ring
    const avatars: THREE.Mesh[] = [];
    const speakRings: THREE.Mesh[] = [];
    const allUniforms: Array<{ [key: string]: THREE.IUniform }> = [];
    const numAgents = AGENT_CONFIG.length;
    const { agentRingRadius, agentY } = sceneConfig;

    AGENT_CONFIG.forEach((ag, i) => {
      const angle = (i / numAgents) * Math.PI * 2;
      const ox = Math.cos(angle) * agentRingRadius;
      const oz = Math.sin(angle) * agentRingRadius;

      // Body sphere — Fresnel ShaderMaterial
      const bodyGeo = new THREE.SphereGeometry(0.42, 32, 32);
      const baseColorV = new THREE.Color(ag.color);
      const emissiveColorV = new THREE.Color(ag.emissive);
      const uniforms: { [key: string]: THREE.IUniform } = {
        uTime:         { value: 0 },
        uFrequency:    { value: ag.frequency_hz },
        uBaseColor:    { value: baseColorV },
        uEmissiveColor:{ value: emissiveColorV },
        uPulse:        { value: 0 },
      };
      allUniforms.push(uniforms);
      const bodyMat = new THREE.ShaderMaterial({
        vertexShader:   SPHERE_VERTEX_SHADER,
        fragmentShader: SPHERE_FRAGMENT_SHADER,
        uniforms,
      });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.position.set(ox, agentY + 0.42, oz);
      scene.add(body);
      avatars.push(body);

      // Speaking ring (glow)
      const ringGeo = new THREE.TorusGeometry(0.55, 0.04, 8, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: ag.color,
        transparent: true,
        opacity: 0,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.set(ox, agentY + 0.42, oz);
      ring.rotation.x = Math.PI / 2;
      scene.add(ring);
      speakRings.push(ring);

      // Label plane (small colored disc below each avatar)
      const discGeo = new THREE.CircleGeometry(0.35, 16);
      const discMat = new THREE.MeshBasicMaterial({ color: ag.color, transparent: true, opacity: 0.4 });
      const disc = new THREE.Mesh(discGeo, discMat);
      disc.rotation.x = -Math.PI / 2;
      disc.position.set(ox, agentY + 0.01, oz);
      scene.add(disc);
    });

    // Particles (floating specks)
    const particleCount = 120;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let p = 0; p < particleCount; p++) {
      particlePositions[p * 3] = (Math.random() - 0.5) * 30;
      particlePositions[p * 3 + 1] = Math.random() * 8;
      particlePositions[p * 3 + 2] = (Math.random() - 0.5) * 30;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: ambientColor,
      size: 0.06,
      transparent: true,
      opacity: 0.55,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    shaderUniformsRef.current = allUniforms;
    pulseQueueRef.current = [];

    // Animation
    let t = 0;
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      t += 0.01;

      // Avatar float + shader time
      avatars.forEach((av, i) => {
        av.position.y = sceneConfig.agentY + 0.42 + Math.sin(t * 1.2 + i * 1.3) * 0.08;
        av.rotation.y += 0.005;
        const scl = 1 + Math.sin(t * 2 + i) * 0.04;
        av.scale.set(scl, scl, scl);
        if (allUniforms[i]) allUniforms[i].uTime.value = t;
      });

      // Speak ring pulse (demo: rotate through agents)
      const speaker = Math.floor(t * 0.5) % numAgents;
      speakRings.forEach((ring, i) => {
        const mat = ring.material as THREE.MeshBasicMaterial;
        if (i === speaker) {
          mat.opacity = 0.4 + Math.sin(t * 8) * 0.3;
          ring.scale.setScalar(1 + Math.sin(t * 8) * 0.15);
          if (allUniforms[i]) allUniforms[i].uPulse.value = 0.6 + Math.sin(t * 8) * 0.4;
        } else {
          mat.opacity = Math.max(0, mat.opacity - 0.04);
          ring.scale.setScalar(1);
          if (allUniforms[i]) {
            allUniforms[i].uPulse.value = Math.max(0, allUniforms[i].uPulse.value - 0.03);
          }
        }
      });

      // Expand + fade SSE-triggered pulse rings
      const now = Date.now();
      pulseQueueRef.current = pulseQueueRef.current.filter((p) => {
        const age = (now - p.born) / 1000;
        if (age > 1.5) {
          scene.remove(p.mesh);
          p.mesh.geometry.dispose();
          (p.mesh.material as THREE.Material).dispose();
          return false;
        }
        const progress = age / 1.5;
        p.mesh.scale.setScalar(1 + progress * 3);
        (p.mesh.material as THREE.MeshBasicMaterial).opacity = (1 - progress) * 0.8;
        return true;
      });

      // Particle drift
      particles.rotation.y += 0.0003;

      controls.update();
      if (composerRef.current) { composerRef.current.render(); } else { renderer.render(scene, camera); }
    };
    animate();

    // Resize
    const onResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
      composer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', onResize);
      controls.dispose();
      renderer.dispose();
    };
  }, [location?.id]); // rebuild only when location changes

  useEffect(() => {
    const cleanup = buildScene();
    return cleanup;
  }, [buildScene, tick]);

  // SSE connection for live council events
  useEffect(() => {
    if (!meetingId) return;
    const es = new EventSource(`/api/council/orchestrator?meetingId=${meetingId}`);
    setIsConnected(true);

    es.onmessage = (ev) => {
      try {
        const event = JSON.parse(ev.data) as { kind?: string; agentId?: string };
        const uniforms = shaderUniformsRef.current;
        const idx = AGENT_CONFIG.findIndex((a) => a.sphereId === event.agentId);

        if (event.kind === 'sphere.signal' && idx >= 0 && uniforms[idx]) {
          // Trigger pulse ring at that sphere's position
          const ag = AGENT_CONFIG[idx];
          const numAg = AGENT_CONFIG.length;
          const angle = (idx / numAg) * Math.PI * 2;
          const r = 4.2; // approximate ring radius
          const ringGeo = new THREE.RingGeometry(0.5, 0.58, 48);
          const ringMat = new THREE.MeshBasicMaterial({
            color: ag.color,
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide,
          });
          const ringMesh = new THREE.Mesh(ringGeo, ringMat);
          ringMesh.rotation.x = -Math.PI / 2;
          ringMesh.position.set(
            Math.cos(angle) * r,
            0.05,
            Math.sin(angle) * r,
          );
          // Access scene through renderer dom element parent approach is complex;
          // instead we add directly — scene ref not in closure so we use uniforms to trigger pulse
          uniforms[idx].uPulse.value = 1.0;
        }

        if (event.kind === 'meeting.focus' && event.agentId) {
          // ALIGN entrainment — lerp all sphere colors toward focal sphere
          const focalIdx = AGENT_CONFIG.findIndex((a) => a.sphereId === event.agentId);
          if (focalIdx >= 0 && uniforms[focalIdx]) {
            const focalColor = uniforms[focalIdx].uBaseColor.value as THREE.Color;
            uniforms.forEach((u, i) => {
              if (i !== focalIdx) {
                (u.uBaseColor.value as THREE.Color).lerp(focalColor, 0.15);
              }
            });
          }
        }
      } catch {
        // ignore malformed events
      }
    };

    es.onerror = () => { setIsConnected(false); es.close(); };
    return () => es.close();
  }, [meetingId]);

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" style={{ minHeight: '500px' }} />

      {/* Live badge */}
      <AnimatePresence>
        <motion.div
          key={isConnected ? 'live' : 'off'}
          className={`absolute top-4 right-4 px-3 py-1.5 rounded-full text-xs font-bold ${
            isConnected
              ? 'bg-green-500/20 text-green-400 border border-green-500'
              : 'bg-zinc-800/80 text-zinc-400 border border-zinc-700'
          }`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
        >
          {isConnected ? '● EN VIVO' : '○ DEMO'}
        </motion.div>
      </AnimatePresence>

      {/* Location label */}
      {location && (
        <motion.div
          className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/10"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-[10px] uppercase tracking-widest text-zinc-400">{location.neighborhood}</p>
          <p className="text-sm font-bold text-white">{location.nameEs}</p>
        </motion.div>
      )}

      {/* Orbit controls hint */}
      <div className="absolute bottom-4 right-4 text-[9px] uppercase tracking-widest text-zinc-500">
        Drag to orbit · Scroll to zoom
      </div>
    </div>
  );
}
