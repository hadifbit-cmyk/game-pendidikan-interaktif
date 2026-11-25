import * as THREE from 'three';
import {
  ALLIED_BASE_POS,
  ENEMY_BASE_POS,
  HEALING_FOUNTAINS,
  JUNGLE_CAMPS,
  LORD_PIT_POS,
  TURTLE_PIT_POS,
  WORLD_RADIUS,
} from '../data/gameData';
import {
  createGrassTexture,
  createLaneStoneTexture,
  createStoneRuneTexture,
  createWaterTexture,
} from './textures';

export interface WorldObstacle {
  x: number;
  z: number;
  radius: number;
}

export interface BushZone {
  x: number;
  z: number;
  radius: number;
}

export interface BuiltWorld {
  obstacles: WorldObstacle[];
  bushes: BushZone[];
  waterMesh: THREE.Mesh;
  waterTexture: THREE.CanvasTexture;
  waterfallMeshes: THREE.Mesh[];
  fountainRings: THREE.Mesh[];
  crystalsGroup: THREE.Group;
  cloudsGroup: THREE.Group;
  ambientParticles: THREE.Points;
  canopiesMesh: THREE.InstancedMesh;
  grassTuftsMesh: THREE.InstancedMesh;
  dispose: () => void;
}

export function groundHeightAt(x: number, z: number): number {
  const distLord = Math.hypot(x - LORD_PIT_POS[0], z - LORD_PIT_POS[1]);
  if (distLord < 17) return 0.26;
  const distTurtle = Math.hypot(x - TURTLE_PIT_POS[0], z - TURTLE_PIT_POS[1]);
  if (distTurtle < 15) return 0.26;
  const distAlliedBase = Math.hypot(x - ALLIED_BASE_POS[0], z - ALLIED_BASE_POS[1]);
  if (distAlliedBase < 18) return 0.24;
  const distEnemyBase = Math.hypot(x - ENEMY_BASE_POS[0], z - ENEMY_BASE_POS[1]);
  if (distEnemyBase < 18) return 0.24;

  const distFromOrigin = Math.hypot(x, z);
  if (distFromOrigin > WORLD_RADIUS - 3) {
    return Math.min(14, (distFromOrigin - (WORLD_RADIUS - 3)) * 0.72);
  }
  const riverPerpDist = Math.abs(x - z) / Math.SQRT2;
  if (riverPerpDist < 6.4) return -0.25;
  return Math.sin(x * 0.04) * Math.cos(z * 0.04) * 0.2;
}

function isOnLane(x: number, z: number): boolean {
  // Mid lane (diagonal x + z = 0 from (-108,108) to (108,-108))
  if (Math.abs(x + z) / Math.SQRT2 < 8.5 && Math.abs(x) < 118 && Math.abs(z) < 118) return true;
  // EXP lane (x ~ -114 or z ~ -114)
  if (Math.abs(x + 114) < 8.0 && z >= -120 && z <= 114) return true;
  if (Math.abs(z + 114) < 8.0 && x >= -120 && x <= 114) return true;
  // GOLD lane (z ~ +114 or x ~ +114)
  if (Math.abs(z - 114) < 8.0 && x >= -114 && x <= 120) return true;
  if (Math.abs(x - 114) < 8.0 && z >= -114 && z <= 120) return true;
  return false;
}

export function buildDawnRealmWorld(
  scene: THREE.Scene,
  renderer: THREE.WebGLRenderer,
  isSoftwareGl: boolean
): BuiltWorld {
  const maxAniso = isSoftwareGl ? 1 : Math.min(8, renderer.capabilities.getMaxAnisotropy());
  const disposables: { dispose: () => void }[] = [];

  const grassTex = createGrassTexture(maxAniso);
  grassTex.repeat.set(38, 38);
  const laneStoneTex = createLaneStoneTexture(maxAniso);
  const stoneTex = createStoneRuneTexture(maxAniso);
  const waterTex = createWaterTexture(maxAniso);
  waterTex.repeat.set(10, 32);
  disposables.push(grassTex, laneStoneTex, stoneTex, waterTex);

  // Gradient Sky Dome Backdrop for Rich Horizon Depth
  const skyGeo = new THREE.SphereGeometry(285, 24, 16);
  const skyMat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: {
      topColor: { value: new THREE.Color('#09132b') },
      horizonColor: { value: new THREE.Color('#1d3b66') },
      bottomColor: { value: new THREE.Color('#0a1428') },
    },
    vertexShader: `
      varying vec3 vWorldPos;
      void main() {
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vWorldPos = wp.xyz;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: `
      uniform vec3 topColor;
      uniform vec3 horizonColor;
      uniform vec3 bottomColor;
      varying vec3 vWorldPos;
      void main() {
        float h = normalize(vWorldPos).y;
        vec3 col = h >= 0.0
          ? mix(horizonColor, topColor, pow(clamp(h, 0.0, 1.0), 0.62))
          : mix(horizonColor, bottomColor, clamp(-h * 2.5, 0.0, 1.0));
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });
  const skyDome = new THREE.Mesh(skyGeo, skyMat);
  scene.add(skyDome);
  disposables.push(skyGeo, skyMat);

  const obstacles: WorldObstacle[] = [];
  const bushes: BushZone[] = [];
  const fountainRings: THREE.Mesh[] = [];
  const waterfallMeshes: THREE.Mesh[] = [];

  // 1. Expanded Land of Dawn Terrain (460x460)
  const terrainGeo = new THREE.PlaneGeometry(460, 460, 112, 112);
  terrainGeo.rotateX(-Math.PI / 2);
  const posAttr = terrainGeo.attributes.position;
  for (let i = 0; i < posAttr.count; i++) {
    const vx = posAttr.getX(i);
    const vz = posAttr.getZ(i);
    posAttr.setY(i, groundHeightAt(vx, vz));
  }
  terrainGeo.computeVertexNormals();
  const terrainMat = new THREE.MeshStandardMaterial({
    map: grassTex,
    roughness: 0.84,
    metalness: 0.03,
  });
  const terrain = new THREE.Mesh(terrainGeo, terrainMat);
  terrain.receiveShadow = true;
  scene.add(terrain);
  disposables.push(terrainGeo, terrainMat);

  // 2. Three MOBA Cobblestone Lanes (EXP, MID, GOLD) with Stone Curbs
  const pathMat = new THREE.MeshStandardMaterial({
    map: laneStoneTex,
    color: '#9e9589',
    roughness: 0.82,
    metalness: 0.08,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  });
  const curbMat = new THREE.MeshStandardMaterial({
    color: '#64748b',
    roughness: 0.72,
    metalness: 0.18,
  });
  disposables.push(pathMat, curbMat);

  const addRoadSegment = (x: number, z: number, width: number, length: number, rotY = 0) => {
    const geo = new THREE.PlaneGeometry(width, length);
    geo.rotateX(-Math.PI / 2);
    const mesh = new THREE.Mesh(geo, pathMat);
    mesh.position.set(x, 0.09, z);
    mesh.rotation.y = rotY;
    mesh.receiveShadow = true;
    scene.add(mesh);
    disposables.push(geo);

    for (const side of [-1, 1]) {
      const cGeo = new THREE.BoxGeometry(0.45, 0.22, length);
      const curb = new THREE.Mesh(cGeo, curbMat);
      const offset = side * (width * 0.5 + 0.22);
      curb.position.set(x + Math.cos(rotY) * offset, 0.1, z - Math.sin(rotY) * offset);
      curb.rotation.y = rotY;
      curb.receiveShadow = true;
      scene.add(curb);
      disposables.push(cGeo);
    }
  };

  // Mid lane diagonal (-108, 108) -> (108, -108)
  addRoadSegment(0, 0, 9.2, 310, Math.PI / 4);
  // EXP Lane (West edge & North edge)
  addRoadSegment(-114, -3, 8.6, 228, 0);
  addRoadSegment(-3, -114, 8.6, 228, Math.PI / 2);
  // GOLD Lane (South edge & East edge)
  addRoadSegment(3, 114, 8.6, 228, Math.PI / 2);
  addRoadSegment(114, 3, 8.6, 228, 0);

  // 3. Symmetrical Crystal River along x - z = 0 (from (-136,-136) to (136,136))
  const riverGeo = new THREE.PlaneGeometry(390, 12.6, 1, 1);
  riverGeo.rotateX(-Math.PI / 2);
  const riverMat = new THREE.MeshPhysicalMaterial({
    map: waterTex,
    color: '#38bdf8',
    emissive: '#0284c7',
    emissiveIntensity: 0.32,
    roughness: 0.09,
    metalness: 0.25,
    clearcoat: 0.9,
    clearcoatRoughness: 0.1,
    transparent: true,
    opacity: 0.92,
  });
  const waterMesh = new THREE.Mesh(riverGeo, riverMat);
  waterMesh.position.set(0, -0.02, 0);
  waterMesh.rotation.y = -Math.PI / 4;
  waterMesh.receiveShadow = true;
  scene.add(waterMesh);
  disposables.push(riverGeo, riverMat);

  // Two Scenic Cliff Waterfalls at NW & SE ends of Crystal River
  const waterfallMat = new THREE.MeshStandardMaterial({
    map: waterTex,
    color: '#bae6fd',
    emissive: '#0ea5e9',
    emissiveIntensity: 0.45,
    roughness: 0.12,
    transparent: true,
    opacity: 0.86,
  });
  const wfGeo = new THREE.PlaneGeometry(14, 16);
  disposables.push(waterfallMat, wfGeo);

  const waterfallCoords: [number, number, number][] = [
    [-132, -132, Math.PI / 4],
    [132, 132, (-3 * Math.PI) / 4],
  ];
  waterfallCoords.forEach(([wx, wz, rotY]) => {
    const wf = new THREE.Mesh(wfGeo, waterfallMat);
    wf.position.set(wx, 6.4, wz);
    wf.rotation.y = rotY;
    scene.add(wf);
    waterfallMeshes.push(wf);

    const cliffMat = new THREE.MeshStandardMaterial({ color: '#475569', roughness: 0.9 });
    const cliffL = new THREE.Mesh(new THREE.DodecahedronGeometry(6.5, 0), cliffMat);
    cliffL.position.set(wx - 7, 5, wz + 5);
    const cliffR = cliffL.clone();
    cliffR.position.set(wx + 7, 5, wz - 5);
    scene.add(cliffL, cliffR);
    disposables.push(cliffMat);
  });

  // 4. Three Ornate Lane Bridges across Crystal River
  const bridgeMat = new THREE.MeshStandardMaterial({
    color: '#78350f',
    roughness: 0.78,
    metalness: 0.08,
  });
  const bridgeTrimMat = new THREE.MeshStandardMaterial({
    color: '#f59e0b',
    roughness: 0.3,
    metalness: 0.7,
  });
  const bridgeGeo = new THREE.BoxGeometry(17.5, 0.54, 9.6);
  disposables.push(bridgeMat, bridgeTrimMat, bridgeGeo);

  const bridgeLocations: [number, number][] = [
    [-112, -112], // EXP Lane corner river crossing
    [0, 0], // Mid Lane center crossing
    [112, 112], // GOLD Lane corner river crossing
  ];
  const postGeo = new THREE.CylinderGeometry(0.28, 0.36, 1.4, 8);
  const lanternGeo = new THREE.OctahedronGeometry(0.32, 0);
  const lanternMat = new THREE.MeshStandardMaterial({
    color: '#fef08a',
    emissive: '#fbbf24',
    emissiveIntensity: 0.95,
    roughness: 0.15,
  });
  disposables.push(postGeo, lanternGeo, lanternMat);

  bridgeLocations.forEach(([bx, bz]) => {
    const bGroup = new THREE.Group();
    bGroup.position.set(bx, 0.24, bz);
    bGroup.rotation.y = Math.PI / 4;
    const deck = new THREE.Mesh(bridgeGeo, bridgeMat);
    deck.receiveShadow = true;
    deck.castShadow = true;
    bGroup.add(deck);
    for (const side of [-4.4, 4.4]) {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(17.5, 0.58, 0.42), bridgeTrimMat);
      rail.position.set(0, 0.42, side);
      bGroup.add(rail);
      for (const endX of [-7.6, 7.6]) {
        const post = new THREE.Mesh(postGeo, bridgeTrimMat);
        post.position.set(endX, 0.85, side);
        const orb = new THREE.Mesh(lanternGeo, lanternMat);
        orb.position.set(endX, 1.72, side);
        bGroup.add(post, orb);
      }
    }
    scene.add(bGroup);
  });

  // 5. Stone Sanctuary Pads: Lord Pit, Turtle Pit, Jungle Camps, Allied/Enemy Base Pads
  const stoneMat = new THREE.MeshStandardMaterial({
    map: stoneTex,
    roughness: 0.65,
    metalness: 0.18,
  });
  disposables.push(stoneMat);

  const buildZonePad = (zx: number, zz: number, r: number, ringColor: string, height = 0.34) => {
    const gy = groundHeightAt(zx, zz);
    const pad = new THREE.Mesh(new THREE.CylinderGeometry(r, r + 1.1, height, 32), stoneMat);
    pad.position.set(zx, gy + height * 0.25, zz);
    pad.receiveShadow = true;
    scene.add(pad);
    const glow = new THREE.Mesh(
      new THREE.RingGeometry(r - 0.55, r, 36),
      new THREE.MeshBasicMaterial({
        color: ringColor,
        transparent: true,
        opacity: 0.65,
        side: THREE.DoubleSide,
        depthWrite: false,
      })
    );
    glow.rotation.x = -Math.PI / 2;
    glow.position.set(zx, gy + height * 0.5 + 0.08, zz);
    scene.add(glow);
  };

  // Lord Sanctuary Pit (NW River)
  buildZonePad(LORD_PIT_POS[0], LORD_PIT_POS[1], 14.5, '#ef4444', 0.55);
  // Turtle Sanctuary Pit (SE River)
  buildZonePad(TURTLE_PIT_POS[0], TURTLE_PIT_POS[1], 12.5, '#10b981', 0.52);

  // Lord Sanctuary Pillars flanking the NW Pit
  const pillarGeo = new THREE.CylinderGeometry(0.95, 1.2, 6.4, 8);
  const pillarCapGeo = new THREE.OctahedronGeometry(0.85, 0);
  const bossCrystalMat = new THREE.MeshStandardMaterial({
    color: '#f43f5e',
    emissive: '#e11d48',
    emissiveIntensity: 0.92,
    roughness: 0.18,
  });
  disposables.push(pillarGeo, pillarCapGeo, bossCrystalMat);

  for (let i = 0; i < 6; i++) {
    const ang = (i / 6) * Math.PI * 2 + 0.25;
    const px = LORD_PIT_POS[0] + Math.cos(ang) * 14.2;
    const pz = LORD_PIT_POS[1] + Math.sin(ang) * 14.2;
    const pGroup = new THREE.Group();
    pGroup.position.set(px, 0.26, pz);
    const pMesh = new THREE.Mesh(pillarGeo, stoneMat);
    pMesh.position.y = 3.2;
    pMesh.castShadow = true;
    const cap = new THREE.Mesh(pillarCapGeo, bossCrystalMat);
    cap.position.y = 7.0;
    pGroup.add(pMesh, cap);
    scene.add(pGroup);
    obstacles.push({ x: px, z: pz, radius: 1.3 });
  }

  // Allied & Enemy Base Platforms
  buildZonePad(ALLIED_BASE_POS[0], ALLIED_BASE_POS[1], 16.5, '#38bdf8', 0.52);
  buildZonePad(ENEMY_BASE_POS[0], ENEMY_BASE_POS[1], 16.5, '#ef4444', 0.52);

  // Buff Sanctums
  JUNGLE_CAMPS.filter((c) => c.type !== 'turtle').forEach((camp) => {
    buildZonePad(camp.pos[0], camp.pos[1], camp.buffType ? 6.4 : 4.8, camp.color, 0.28);
  });

  // 6. Ancient Ruins Decorative Landmarks outside lanes
  const buildTemple = (tx: number, tz: number, colorHex: string) => {
    const tGroup = new THREE.Group();
    const gy = groundHeightAt(tx, tz);
    tGroup.position.set(tx, gy, tz);
    const base = new THREE.Mesh(new THREE.BoxGeometry(11, 0.65, 11), stoneMat);
    base.position.y = 0.32;
    base.receiveShadow = true;
    tGroup.add(base);

    const roof = new THREE.Mesh(
      new THREE.ConeGeometry(7.8, 3.2, 4),
      new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.42, metalness: 0.32 })
    );
    roof.position.y = 7.0;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    tGroup.add(roof);

    for (const [cx, cz] of [
      [-3.8, -3.8],
      [3.8, -3.8],
      [-3.8, 3.8],
      [3.8, 3.8],
    ]) {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.62, 5.4, 8), stoneMat);
      col.position.set(cx, 2.9, cz);
      col.castShadow = true;
      tGroup.add(col);
      obstacles.push({ x: tx + cx, z: tz + cz, radius: 0.85 });
    }
    scene.add(tGroup);
  };

  buildTemple(-136, 48, '#0284c7');
  buildTemple(136, -48, '#dc2626');
  buildTemple(-58, -138, '#7c3aed');
  buildTemple(58, 138, '#d97706');

  // 7. Healing Fountains
  const healMat = new THREE.MeshBasicMaterial({
    color: '#34d399',
    transparent: true,
    opacity: 0.62,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  disposables.push(healMat);

  HEALING_FOUNTAINS.forEach((f) => {
    const gy = groundHeightAt(f.pos[0], f.pos[1]);
    const ring = new THREE.Mesh(new THREE.RingGeometry(f.radius - 0.55, f.radius, 36), healMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(f.pos[0], gy + 0.14, f.pos[1]);
    scene.add(ring);
    fountainRings.push(ring);

    if (f.id !== 'fountain_base') {
      const totem = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.75, 0),
        new THREE.MeshStandardMaterial({
          color: '#10b981',
          emissive: '#059669',
          emissiveIntensity: 0.95,
          roughness: 0.15,
        })
      );
      totem.position.set(f.pos[0], gy + 2.1, f.pos[1]);
      scene.add(totem);
    }
  });

  // 8. Instanced Dense Fantasy Forest (avoiding all 3 lanes, pits, bases & river)
  let seed = 2026;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  const isClearArea = (x: number, z: number) => {
    if (isOnLane(x, z)) return false;
    if (Math.hypot(x - LORD_PIT_POS[0], z - LORD_PIT_POS[1]) < 21) return false;
    if (Math.hypot(x - TURTLE_PIT_POS[0], z - TURTLE_PIT_POS[1]) < 18) return false;
    if (Math.hypot(x - ALLIED_BASE_POS[0], z - ALLIED_BASE_POS[1]) < 24) return false;
    if (Math.hypot(x - ENEMY_BASE_POS[0], z - ENEMY_BASE_POS[1]) < 24) return false;
    if (Math.abs(x - z) / Math.SQRT2 < 10.5) return false; // River
    for (const c of JUNGLE_CAMPS) {
      if (Math.hypot(x - c.pos[0], z - c.pos[1]) < 10.5) return false;
    }
    for (const f of HEALING_FOUNTAINS) {
      if (Math.hypot(x - f.pos[0], z - f.pos[1]) < 9.5) return false;
    }
    if (Math.hypot(x + 136, z - 48) < 12) return false;
    if (Math.hypot(x - 136, z + 48) < 12) return false;
    if (Math.hypot(x + 58, z + 138) < 12) return false;
    if (Math.hypot(x - 58, z - 138) < 12) return false;
    return true;
  };

  const treePositions: [number, number, number][] = [];
  for (let i = 0; i < 460; i++) {
    const ang = rand() * Math.PI * 2;
    const rad = 18 + rand() * (WORLD_RADIUS + 34);
    const tx = Math.cos(ang) * rad;
    const tz = Math.sin(ang) * rad;
    if (!isClearArea(tx, tz)) continue;
    const s = 0.92 + rand() * 0.62;
    treePositions.push([tx, tz, s]);
    if (rad < WORLD_RADIUS - 3) {
      obstacles.push({ x: tx, z: tz, radius: 0.92 * s });
    }
  }

  const trunkGeo = new THREE.CylinderGeometry(0.34, 0.56, 3.0, 7);
  const trunkMat = new THREE.MeshStandardMaterial({ color: '#5c3a21', roughness: 0.9 });
  const canopyGeo = new THREE.ConeGeometry(2.25, 5.0, 7);
  const canopyMat = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.7 });
  disposables.push(trunkGeo, trunkMat, canopyGeo, canopyMat);

  const trunks = new THREE.InstancedMesh(trunkGeo, trunkMat, treePositions.length);
  const canopiesMesh = new THREE.InstancedMesh(canopyGeo, canopyMat, treePositions.length);
  trunks.castShadow = !isSoftwareGl;
  canopiesMesh.castShadow = !isSoftwareGl;

  const dummy = new THREE.Object3D();
  const colorTmp = new THREE.Color();
  treePositions.forEach(([tx, tz, s], idx) => {
    const gy = groundHeightAt(tx, tz);
    dummy.position.set(tx, gy + 1.5 * s, tz);
    dummy.rotation.set(0, rand() * Math.PI * 2, 0);
    dummy.scale.setScalar(s);
    dummy.updateMatrix();
    trunks.setMatrixAt(idx, dummy.matrix);

    dummy.position.set(tx, gy + 4.1 * s, tz);
    dummy.updateMatrix();
    canopiesMesh.setMatrixAt(idx, dummy.matrix);

    const greenHue = 0.27 + rand() * 0.11;
    colorTmp.setHSL(greenHue, 0.55, 0.24 + rand() * 0.14);
    canopiesMesh.setColorAt(idx, colorTmp);
  });
  trunks.instanceMatrix.needsUpdate = true;
  canopiesMesh.instanceMatrix.needsUpdate = true;
  if (canopiesMesh.instanceColor) canopiesMesh.instanceColor.needsUpdate = true;
  trunks.computeBoundingSphere();
  canopiesMesh.computeBoundingSphere();
  scene.add(trunks, canopiesMesh);

  // 9. Animated Instanced Grass Tufts (850 blades)
  const grassBladeGeo = new THREE.ConeGeometry(0.16, 0.8, 4);
  grassBladeGeo.translate(0, 0.4, 0);
  const grassBladeMat = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.8 });
  disposables.push(grassBladeGeo, grassBladeMat);

  const grassSpots: [number, number, number][] = [];
  for (let i = 0; i < 850; i++) {
    const ang = rand() * Math.PI * 2;
    const rad = 16 + rand() * (WORLD_RADIUS - 14);
    const gx = Math.cos(ang) * rad;
    const gz = Math.sin(ang) * rad;
    if (Math.abs(gx - gz) / Math.SQRT2 < 7.8) continue;
    if (isOnLane(gx, gz)) continue;
    grassSpots.push([gx, gz, 0.75 + rand() * 0.75]);
  }
  const grassTuftsMesh = new THREE.InstancedMesh(grassBladeGeo, grassBladeMat, grassSpots.length);
  grassSpots.forEach(([gx, gz, gs], idx) => {
    dummy.position.set(gx, groundHeightAt(gx, gz), gz);
    dummy.rotation.set(0, rand() * Math.PI * 2, 0);
    dummy.scale.setScalar(gs);
    dummy.updateMatrix();
    grassTuftsMesh.setMatrixAt(idx, dummy.matrix);
    colorTmp.setHSL(0.31 + rand() * 0.06, 0.65, 0.32 + rand() * 0.15);
    grassTuftsMesh.setColorAt(idx, colorTmp);
  });
  grassTuftsMesh.instanceMatrix.needsUpdate = true;
  if (grassTuftsMesh.instanceColor) grassTuftsMesh.instanceColor.needsUpdate = true;
  grassTuftsMesh.computeBoundingSphere();
  scene.add(grassTuftsMesh);

  // 10. Instanced Rocky Cliffs & Perimeter Mountains
  const rockGeo = new THREE.DodecahedronGeometry(1.2, 0);
  const rockMat = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.88, metalness: 0.08 });
  disposables.push(rockGeo, rockMat);
  const rockData: [number, number, number][] = [];

  for (let i = 0; i < 130; i++) {
    const ang = (i / 130) * Math.PI * 2 + (rand() - 0.5) * 0.05;
    const rad = WORLD_RADIUS + 4 + rand() * 9;
    rockData.push([Math.cos(ang) * rad, Math.sin(ang) * rad, 3.4 + rand() * 3.2]);
  }
  for (let i = 0; i < 55; i++) {
    const ang = rand() * Math.PI * 2;
    const rad = 22 + rand() * (WORLD_RADIUS - 32);
    const rx = Math.cos(ang) * rad;
    const rz = Math.sin(ang) * rad;
    if (!isClearArea(rx, rz)) continue;
    const rs = 0.75 + rand() * 0.75;
    rockData.push([rx, rz, rs]);
    obstacles.push({ x: rx, z: rz, radius: 1.05 * rs });
  }

  const rocks = new THREE.InstancedMesh(rockGeo, rockMat, rockData.length);
  rocks.castShadow = !isSoftwareGl;
  rocks.receiveShadow = true;
  rockData.forEach(([rx, rz, rs], idx) => {
    const gy = groundHeightAt(rx, rz);
    dummy.position.set(rx, gy + rs * 0.45, rz);
    dummy.rotation.set(rand() * 2, rand() * 2, rand() * 2);
    dummy.scale.set(rs * 1.15, rs * 0.85, rs);
    dummy.updateMatrix();
    rocks.setMatrixAt(idx, dummy.matrix);
    colorTmp.setHSL(0.6, 0.08, 0.26 + rand() * 0.14);
    rocks.setColorAt(idx, colorTmp);
  });
  rocks.instanceMatrix.needsUpdate = true;
  if (rocks.instanceColor) rocks.instanceColor.needsUpdate = true;
  rocks.computeBoundingSphere();
  scene.add(rocks);

  // 11. Bushes / Stealth Grass Zones near Lanes & Riverbanks
  const bushGeo = new THREE.SphereGeometry(1.3, 8, 6);
  const bushMat = new THREE.MeshStandardMaterial({
    color: '#15803d',
    roughness: 0.84,
    transparent: true,
    opacity: 0.84,
  });
  disposables.push(bushGeo, bushMat);
  const bushLocations: [number, number][] = [
    [-22, 14],
    [22, -14],
    [-100, 12],
    [-12, -100],
    [12, 100],
    [100, -12],
    [-58, 36],
    [36, -58],
    [-36, 58],
    [58, -36],
    [-76, -52],
    [76, 52],
  ];
  const bushInst = new THREE.InstancedMesh(bushGeo, bushMat, bushLocations.length * 3);
  let bIdx = 0;
  bushLocations.forEach(([bx, bz]) => {
    bushes.push({ x: bx, z: bz, radius: 3.6 });
    for (let k = 0; k < 3; k++) {
      const ox = bx + (k - 1) * 1.25;
      const oz = bz + (k % 2 === 0 ? 0.65 : -0.65);
      dummy.position.set(ox, groundHeightAt(ox, oz) + 0.52, oz);
      dummy.scale.set(1.25, 0.78, 1.25);
      dummy.rotation.set(0, k, 0);
      dummy.updateMatrix();
      bushInst.setMatrixAt(bIdx++, dummy.matrix);
    }
  });
  bushInst.instanceMatrix.needsUpdate = true;
  bushInst.computeBoundingSphere();
  scene.add(bushInst);

  // 12. Glowing Magic Crystal Formations
  const crystalsGroup = new THREE.Group();
  const crystalGeo = new THREE.OctahedronGeometry(0.7, 0);
  const crystalMat = new THREE.MeshStandardMaterial({
    color: '#38bdf8',
    emissive: '#0284c7',
    emissiveIntensity: 0.95,
    roughness: 0.14,
    metalness: 0.45,
  });
  disposables.push(crystalGeo, crystalMat);

  const crystalSpots: [number, number][] = [
    [-86, 86],
    [-28, 16],
    [-54, -54],
    [54, 54],
    [28, -16],
    [86, -86],
    [-102, 42],
    [102, -42],
    [-42, -102],
    [42, 102],
  ];
  crystalSpots.forEach(([cx, cz], idx) => {
    const c = new THREE.Mesh(crystalGeo, crystalMat);
    const gy = groundHeightAt(cx, cz);
    c.position.set(cx, gy + 1.45, cz);
    c.scale.set(1.0, 2.2, 1.0);
    c.userData.phase = idx * 0.85;
    crystalsGroup.add(c);
  });

  // Base Entrance Crystal Beacons
  const blueBeaconMat = new THREE.MeshStandardMaterial({
    color: '#38bdf8',
    emissive: '#0284c7',
    emissiveIntensity: 1.05,
    roughness: 0.15,
  });
  const redBeaconMat = new THREE.MeshStandardMaterial({
    color: '#fb7185',
    emissive: '#e11d48',
    emissiveIntensity: 1.05,
    roughness: 0.15,
  });
  disposables.push(blueBeaconMat, redBeaconMat);
  const beaconCoords: [number, number, boolean][] = [
    [-92, 96, true],
    [-96, 92, true],
    [92, -96, false],
    [96, -92, false],
  ];
  beaconCoords.forEach(([bx, bz, isBlue], idx) => {
    const b = new THREE.Mesh(crystalGeo, isBlue ? blueBeaconMat : redBeaconMat);
    b.position.set(bx, groundHeightAt(bx, bz) + 2.2, bz);
    b.scale.set(0.85, 1.8, 0.85);
    b.userData.phase = idx * 1.1;
    crystalsGroup.add(b);
  });
  scene.add(crystalsGroup);

  // 13. Drifting Fantasy Clouds
  const cloudsGroup = new THREE.Group();
  const cloudGeo = new THREE.SphereGeometry(5.0, 10, 8);
  const cloudMat = new THREE.MeshStandardMaterial({
    color: '#f8fafc',
    emissive: '#93c5fd',
    emissiveIntensity: 0.16,
    roughness: 0.95,
    transparent: true,
    opacity: 0.65,
  });
  disposables.push(cloudGeo, cloudMat);
  for (let i = 0; i < 24; i++) {
    const cg = new THREE.Group();
    cg.position.set((rand() - 0.5) * 320, 36 + rand() * 16, (rand() - 0.5) * 320);
    for (let k = 0; k < 3; k++) {
      const puff = new THREE.Mesh(cloudGeo, cloudMat);
      puff.position.set((k - 1) * 3.8, k === 1 ? 1.0 : 0, 0);
      puff.scale.set(1.6, 0.55, 0.95);
      cg.add(puff);
    }
    cloudsGroup.add(cg);
  }
  scene.add(cloudsGroup);

  // 14. Floating Ambient Magical Fireflies
  const pCount = 500;
  const pPos = new Float32Array(pCount * 3);
  for (let i = 0; i < pCount; i++) {
    pPos[i * 3] = (rand() - 0.5) * 290;
    pPos[i * 3 + 1] = 0.8 + rand() * 14;
    pPos[i * 3 + 2] = (rand() - 0.5) * 290;
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const pMat = new THREE.PointsMaterial({
    color: '#fde047',
    size: 0.34,
    transparent: true,
    opacity: 0.75,
    depthWrite: false,
  });
  const ambientParticles = new THREE.Points(pGeo, pMat);
  scene.add(ambientParticles);
  disposables.push(pGeo, pMat);

  return {
    obstacles,
    bushes,
    waterMesh,
    waterTexture: waterTex,
    waterfallMeshes,
    fountainRings,
    crystalsGroup,
    cloudsGroup,
    ambientParticles,
    canopiesMesh,
    grassTuftsMesh,
    dispose: () => {
      disposables.forEach((d) => d.dispose());
    },
  };
}
