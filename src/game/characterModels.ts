import * as THREE from 'three';
import { HeadgearStyle, HeroAppearance, HeroRoleId, JungleCampDef, WeaponStyle } from '../data/gameData';
import { createHexShieldTexture, createLordArmorTexture } from './textures';

export interface AnimatedRig {
  root: THREE.Group;
  bodyGroup: THREE.Group;
  headGroup: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  weaponMount: THREE.Group;
  cape?: THREE.Mesh;
  auraRing?: THREE.Mesh;
  backOrbit?: THREE.Group;
}

export function disposeObject3D(obj: THREE.Object3D) {
  obj.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (mesh.geometry) {
      mesh.geometry.dispose();
    }
    if (mesh.material) {
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach((m) => m.dispose());
      } else {
        mesh.material.dispose();
      }
    }
  });
}

export function buildWeaponMesh(
  style: WeaponStyle,
  colorHex: string,
  accentHex: string
): THREE.Group {
  const g = new THREE.Group();
  const mainMat = new THREE.MeshStandardMaterial({
    color: colorHex,
    metalness: 0.78,
    roughness: 0.22,
  });
  const accentMat = new THREE.MeshStandardMaterial({
    color: accentHex,
    emissive: accentHex,
    emissiveIntensity: 0.58,
    metalness: 0.35,
    roughness: 0.18,
  });
  const gripMat = new THREE.MeshStandardMaterial({
    color: '#3f2e21',
    roughness: 0.85,
    metalness: 0.05,
  });

  if (style === 'bow') {
    const arc = new THREE.Mesh(
      new THREE.TorusGeometry(0.68, 0.05, 8, 20, Math.PI * 1.2),
      mainMat
    );
    arc.rotation.z = -Math.PI * 0.6;
    arc.position.set(0, 0.1, 0.16);
    g.add(arc);
    const stringMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 1.25, 6), accentMat);
    stringMesh.position.set(0, 0.1, -0.06);
    g.add(stringMesh);
    const arrow = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.9, 6), accentMat);
    arrow.rotation.x = Math.PI / 2;
    arrow.position.set(0, 0.1, 0.28);
    g.add(arrow);
  } else if (
    style === 'cannon' ||
    style === 'violinrifle' ||
    style === 'arc_rifles' ||
    style === 'quad_guns'
  ) {
    const isViolin = style === 'violinrifle';
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(isViolin ? 0.22 : 0.28, isViolin ? 0.36 : 0.24, isViolin ? 0.75 : 0.58),
      mainMat
    );
    body.position.set(0, 0.08, 0.25);
    g.add(body);
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.16, 1.22, 12), mainMat);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 0.09, 0.56);
    g.add(barrel);
    const muzzle = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.036, 8, 16), accentMat);
    muzzle.position.set(0, 0.09, 1.15);
    g.add(muzzle);
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.13, 10, 8), accentMat);
    core.position.set(0, 0.18, 0.28);
    g.add(core);
  } else if (style === 'cowboy_pistols') {
    const grip = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.26, 0.12), gripMat);
    grip.position.set(0, -0.02, 0.02);
    grip.rotation.x = -0.3;
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.065, 0.65, 8), mainMat);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 0.12, 0.28);
    const cyl = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.2, 8), accentMat);
    cyl.rotation.x = Math.PI / 2;
    cyl.position.set(0, 0.12, 0.12);
    g.add(grip, barrel, cyl);
  } else if (style === 'greatsword' || style === 'greathammer') {
    const hilt = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.052, 0.44, 8), gripMat);
    g.add(hilt);
    const guard = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.1, 0.14), accentMat);
    guard.position.y = 0.24;
    g.add(guard);
    const blade = new THREE.Mesh(
      new THREE.BoxGeometry(style === 'greathammer' ? 0.36 : 0.24, 1.56, 0.08),
      mainMat
    );
    blade.position.y = 1.02;
    g.add(blade);
    const vein = new THREE.Mesh(new THREE.BoxGeometry(0.09, 1.32, 0.1), accentMat);
    vein.position.y = 1.0;
    g.add(vein);
    g.rotation.x = Math.PI * 0.35;
  } else if (
    style === 'cyberblades' ||
    style === 'dualblades' ||
    style === 'daggers' ||
    style === 'magicdaggers' ||
    style === 'dualcables' ||
    style === 'rapier' ||
    style === 'abyss_blades' ||
    style === 'shard_blades' ||
    style === 'katana_shuriken' ||
    style === 'moon_twinblades' ||
    style === 'shadow_stingers'
  ) {
    const isShort =
      style === 'daggers' || style === 'magicdaggers' || style === 'shard_blades' || style === 'shadow_stingers';
    const len = isShort ? 0.78 : style === 'rapier' || style === 'katana_shuriken' ? 1.24 : 1.05;
    const width = style === 'rapier' || style === 'katana_shuriken' ? 0.055 : 0.095;
    const hilt = new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.04, 0.26, 8), gripMat);
    g.add(hilt);
    const guard = new THREE.Mesh(
      new THREE.BoxGeometry(style === 'rapier' ? 0.32 : 0.26, 0.05, 0.08),
      mainMat
    );
    guard.position.y = 0.13;
    g.add(guard);
    const blade = new THREE.Mesh(new THREE.BoxGeometry(width, len, 0.03), accentMat);
    blade.position.y = 0.16 + len / 2;
    g.add(blade);
    if (style === 'katana_shuriken') {
      const shuriken = new THREE.Mesh(new THREE.OctahedronGeometry(0.18, 0), accentMat);
      shuriken.scale.set(1, 0.2, 1);
      shuriken.position.set(0.16, 0.25, 0.12);
      g.add(shuriken);
    }
    g.rotation.x = Math.PI * 0.38;
  } else if (
    style === 'gauntlets' ||
    style === 'boxing_gloves' ||
    style === 'dragon_claws' ||
    style === 'assassin_claws' ||
    style === 'bandage_claws' ||
    style === 'fire_gauntlets' ||
    style === 'abyss_gauntlet'
  ) {
    const fistSize = style === 'boxing_gloves' || style === 'abyss_gauntlet' ? 0.34 : 0.28;
    const fist = new THREE.Mesh(new THREE.BoxGeometry(fistSize, fistSize, fistSize + 0.06), mainMat);
    fist.position.set(0, 0.02, 0.08);
    g.add(fist);
    const knuckle = new THREE.Mesh(new THREE.BoxGeometry(fistSize + 0.03, 0.11, fistSize + 0.09), accentMat);
    knuckle.position.set(0, -0.02, 0.12);
    g.add(knuckle);
    if (style === 'dragon_claws' || style === 'assassin_claws') {
      for (const cx of [-0.09, 0, 0.09]) {
        const claw = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.42, 5), accentMat);
        claw.rotation.x = Math.PI * 0.5;
        claw.position.set(cx, -0.04, 0.36);
        g.add(claw);
      }
    }
  } else if (style === 'umbrella') {
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, 1.35, 8), gripMat);
    handle.position.y = 0.42;
    g.add(handle);
    const canopy = new THREE.Mesh(new THREE.ConeGeometry(0.75, 0.38, 10), mainMat);
    canopy.position.y = 1.1;
    g.add(canopy);
    const trim = new THREE.Mesh(new THREE.TorusGeometry(0.74, 0.03, 6, 16), accentMat);
    trim.position.y = 0.92;
    trim.rotation.x = Math.PI / 2;
    g.add(trim);
    g.rotation.x = Math.PI * 0.18;
  } else if (
    style === 'spear' ||
    style === 'halberd_shield' ||
    style === 'golden_spear_shield' ||
    style === 'knight_lance'
  ) {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.038, 2.08, 8), gripMat);
    pole.position.y = 0.55;
    g.add(pole);
    const tip = new THREE.Mesh(
      new THREE.ConeGeometry(style === 'knight_lance' ? 0.15 : 0.11, 0.52, 6),
      accentMat
    );
    tip.position.y = 1.78;
    g.add(tip);
    const tassel = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.24, 8), mainMat);
    tassel.position.y = 1.45;
    tassel.rotation.x = Math.PI;
    g.add(tassel);
    g.rotation.x = Math.PI * 0.32;
  } else if (style === 'axe') {
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.05, 1.45, 8), gripMat);
    shaft.position.y = 0.45;
    g.add(shaft);
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.48, 0.12), mainMat);
    head.position.y = 1.05;
    g.add(head);
    const edge = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.44, 0.05), accentMat);
    edge.position.y = 1.05;
    g.add(edge);
    g.rotation.x = Math.PI * 0.34;
  } else if (
    style === 'lightningstaff' ||
    style === 'staff' ||
    style === 'wand' ||
    style === 'codexstaff' ||
    style === 'birdstaff' ||
    style === 'heartdoll' ||
    style === 'frost_scepter' ||
    style === 'blood_scepter'
  ) {
    const len = style === 'wand' || style === 'heartdoll' ? 1.25 : 1.75;
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.035, len, 8), gripMat);
    pole.position.y = len * 0.32;
    g.add(pole);
    const topY = len * 0.82;
    const halo = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.04, 8, 18), mainMat);
    halo.position.y = topY;
    g.add(halo);
    const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.17, 0), accentMat);
    crystal.position.y = topY;
    g.add(crystal);
    if (style === 'codexstaff') {
      const book = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.36, 0.08), accentMat);
      book.position.set(0.2, topY - 0.35, 0.12);
      book.rotation.y = -0.35;
      g.add(book);
    }
    if (style === 'birdstaff') {
      const wingL = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.06, 0.14), accentMat);
      wingL.position.set(-0.22, topY + 0.06, 0);
      wingL.rotation.z = 0.35;
      const wingR = wingL.clone();
      wingR.position.x = 0.22;
      wingR.rotation.z = -0.35;
      g.add(wingL, wingR);
    }
    g.rotation.x = Math.PI * 0.22;
  } else if (
    style === 'orb' ||
    style === 'magicorb' ||
    style === 'planet_orbs' ||
    style === 'crescent_orb' ||
    style === 'mecha_ball' ||
    style === 'lightwheels'
  ) {
    const orb = new THREE.Mesh(
      style === 'lightwheels' ? new THREE.TorusGeometry(0.32, 0.06, 8, 16) : new THREE.IcosahedronGeometry(0.26, 1),
      accentMat
    );
    orb.position.set(0, 0.24, 0.26);
    g.add(orb);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.03, 8, 20), mainMat);
    ring.position.set(0, 0.24, 0.26);
    ring.rotation.x = Math.PI / 3;
    g.add(ring);
  } else if (style === 'magic_cards' || style === 'yinyang_fan' || style === 'star_board') {
    const fan = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.38, 0.04), mainMat);
    fan.position.set(0, 0.2, 0.28);
    const core = new THREE.Mesh(new THREE.OctahedronGeometry(0.15, 0), accentMat);
    core.position.set(0, 0.2, 0.32);
    g.add(fan, core);
  } else if (style === 'scythe') {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.038, 1.68, 8), gripMat);
    pole.position.y = 0.45;
    g.add(pole);
    const crescent = new THREE.Mesh(
      new THREE.TorusGeometry(0.48, 0.065, 6, 14, Math.PI * 0.85),
      accentMat
    );
    crescent.position.set(0, 1.24, 0.28);
    crescent.rotation.y = Math.PI / 2;
    g.add(crescent);
    g.rotation.x = Math.PI * 0.32;
  } else if (
    style === 'hammer_shield' ||
    style === 'wrench_shield' ||
    style === 'execution_hammer' ||
    style === 'anchor_chains'
  ) {
    const len = style === 'execution_hammer' ? 1.45 : 1.12;
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.048, len, 8), gripMat);
    handle.position.y = len * 0.34;
    g.add(handle);
    const head = new THREE.Mesh(
      new THREE.BoxGeometry(style === 'execution_hammer' ? 0.72 : 0.56, 0.36, 0.36),
      mainMat
    );
    head.position.y = len * 0.84;
    g.add(head);
    const trim = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.14, 0.38), accentMat);
    trim.position.y = len * 0.84;
    g.add(trim);
    g.rotation.x = Math.PI * 0.34;
  }

  g.traverse((obj) => {
    if ((obj as THREE.Mesh).isMesh) {
      obj.castShadow = true;
    }
  });
  return g;
}

export function buildCharacterRig(options: {
  role: HeroRoleId;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  weaponStyle: WeaponStyle;
  headgear?: HeadgearStyle;
  bodyVariant?: HeroAppearance['bodyVariant'];
  scale?: number;
  isBoss?: boolean;
  isEnemy?: boolean;
}): AnimatedRig {
  const {
    role,
    primaryColor,
    secondaryColor,
    accentColor,
    weaponStyle,
    headgear,
    bodyVariant = 'standard',
    scale = 1,
    isBoss = false,
    isEnemy = false,
  } = options;

  if (isBoss) {
    return buildLordBossRig(scale);
  }

  const root = new THREE.Group();
  root.scale.setScalar(scale);

  const bodyGroup = new THREE.Group();
  root.add(bodyGroup);

  const armorMat = new THREE.MeshPhysicalMaterial({
    color: primaryColor,
    roughness: 0.28,
    metalness: role === 'tank' || role === 'fighter' ? 0.68 : 0.36,
    clearcoat: 0.55,
    clearcoatRoughness: 0.22,
  });
  const clothMat = new THREE.MeshStandardMaterial({
    color: secondaryColor,
    roughness: 0.68,
    metalness: 0.12,
  });
  const accentMat = new THREE.MeshPhysicalMaterial({
    color: accentColor,
    emissive: accentColor,
    emissiveIntensity: 0.48,
    roughness: 0.16,
    metalness: 0.72,
    clearcoat: 0.7,
  });
  const skinMat = new THREE.MeshStandardMaterial({
    color: isEnemy ? '#cbd5e1' : '#fde0c5',
    roughness: 0.62,
    metalness: 0.04,
  });

  // Torso
  const torsoWidth = role === 'tank' ? 0.86 : role === 'fighter' ? 0.7 : 0.58;
  const torso = new THREE.Mesh(
    new THREE.CylinderGeometry(torsoWidth * 0.56, torsoWidth * 0.42, 0.9, 12),
    armorMat
  );
  torso.position.y = 1.26;
  torso.castShadow = true;
  bodyGroup.add(torso);

  // Chest Core Emblem
  const chestCore = new THREE.Mesh(new THREE.OctahedronGeometry(0.15, 0), accentMat);
  chestCore.position.set(0, 1.34, torsoWidth * 0.47);
  bodyGroup.add(chestCore);

  const belt = new THREE.Mesh(
    new THREE.CylinderGeometry(torsoWidth * 0.48, torsoWidth * 0.52, 0.16, 12),
    clothMat
  );
  belt.position.y = 0.86;
  bodyGroup.add(belt);

  if (
    headgear === 'guinevere_ribbon' ||
    headgear === 'kagura_hairpin' ||
    headgear === 'angela_bunny' ||
    headgear === 'ruby_hood' ||
    headgear === 'silvanna_tiara' ||
    headgear === 'aurora_crown' ||
    headgear === 'change_buns'
  ) {
    const skirt = new THREE.Mesh(
      new THREE.CylinderGeometry(torsoWidth * 0.46, torsoWidth * 0.86, 0.52, 14),
      armorMat
    );
    skirt.position.y = 0.62;
    skirt.castShadow = true;
    bodyGroup.add(skirt);
  }

  // Unique Body Variants (Centaur Hylos, Mech Johnson, Dragon Yu Zhong, Moon Halo Chang'e)
  if (bodyVariant === 'centaur') {
    const horseBody = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.56, 1.28), armorMat);
    horseBody.position.set(0, 0.74, -0.45);
    horseBody.castShadow = true;
    bodyGroup.add(horseBody);
    for (const [hx, hz] of [
      [-0.24, -0.92],
      [0.24, -0.92],
    ]) {
      const hLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.08, 0.74, 8), clothMat);
      hLeg.position.set(hx, 0.37, hz);
      bodyGroup.add(hLeg);
    }
  } else if (bodyVariant === 'mech') {
    const tireMat = new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.7, metalness: 0.4 });
    for (const sx of [-0.56, 0.56]) {
      const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.08, 8, 14), tireMat);
      wheel.rotation.y = Math.PI / 2;
      wheel.position.set(sx, 1.58, 0);
      bodyGroup.add(wheel);
    }
  } else if (bodyVariant === 'dragon') {
    const wingMat = new THREE.MeshStandardMaterial({ color: '#4c1d95', emissive: '#6d28d9', emissiveIntensity: 0.25 });
    for (const sx of [-1, 1]) {
      const wing = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.48, 0.08), wingMat);
      wing.position.set(sx * 0.62, 1.44, -0.35);
      wing.rotation.set(0.2, sx * -0.32, sx * -0.36);
      bodyGroup.add(wing);
    }
  } else if (bodyVariant === 'moonhalo') {
    const moon = new THREE.Mesh(
      new THREE.TorusGeometry(0.75, 0.1, 8, 20, Math.PI * 1.25),
      accentMat
    );
    moon.rotation.x = Math.PI / 2;
    moon.position.set(0, 0.26, -0.1);
    bodyGroup.add(moon);
  }

  // Shoulder Pauldrons with glowing trim accents & chest emblem
  const pauldronGeo =
    role === 'tank'
      ? new THREE.BoxGeometry(0.42, 0.34, 0.42)
      : new THREE.SphereGeometry(0.23, 12, 10);
  const pauldronTrimGeo = new THREE.TorusGeometry(0.18, 0.025, 6, 14);

  const leftPauldron = new THREE.Mesh(pauldronGeo, armorMat);
  leftPauldron.position.set(-torsoWidth * 0.66, 1.58, 0);
  leftPauldron.castShadow = true;
  const leftPauldronTrim = new THREE.Mesh(pauldronTrimGeo, accentMat);
  leftPauldronTrim.rotation.x = Math.PI / 2;
  leftPauldronTrim.position.set(-torsoWidth * 0.66, 1.66, 0);
  bodyGroup.add(leftPauldron, leftPauldronTrim);

  const rightPauldron = new THREE.Mesh(pauldronGeo, armorMat);
  rightPauldron.position.set(torsoWidth * 0.66, 1.58, 0);
  rightPauldron.castShadow = true;
  const rightPauldronTrim = new THREE.Mesh(pauldronTrimGeo, accentMat);
  rightPauldronTrim.rotation.x = Math.PI / 2;
  rightPauldronTrim.position.set(torsoWidth * 0.66, 1.66, 0);
  bodyGroup.add(rightPauldron, rightPauldronTrim);

  const chestCrest = new THREE.Mesh(new THREE.OctahedronGeometry(0.11, 0), accentMat);
  chestCrest.scale.set(1.0, 1.25, 0.45);
  chestCrest.position.set(0, 1.38, torsoWidth * 0.42);
  bodyGroup.add(chestCrest);

  // Flowing Cape
  let cape: THREE.Mesh | undefined;
  if (role !== 'marksman' || headgear === 'granger_hood') {
    cape = new THREE.Mesh(
      new THREE.BoxGeometry(torsoWidth * 0.94, 1.15, 0.07),
      clothMat
    );
    cape.position.set(0, 1.12, -torsoWidth * 0.48);
    cape.rotation.x = 0.16;
    cape.castShadow = true;
    bodyGroup.add(cape);
  }

  // Pharsa Crow Wings on Back
  if (headgear === 'pharsa_blindfold') {
    const wingMat = new THREE.MeshStandardMaterial({ color: '#3b0764', roughness: 0.55 });
    const lWing = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.46, 0.08), wingMat);
    lWing.position.set(-0.58, 1.38, -0.34);
    lWing.rotation.set(0.2, 0.3, 0.32);
    const rWing = lWing.clone();
    rWing.position.x = 0.58;
    rWing.rotation.set(0.2, -0.3, -0.32);
    bodyGroup.add(lWing, rWing);
  }

  // Back Orbiting Elements (Saber, Gusion, Angela, Cyclops, Karrie, Aamon)
  let backOrbit: THREE.Group | undefined;
  if (
    weaponStyle === 'cyberblades' ||
    weaponStyle === 'magicdaggers' ||
    weaponStyle === 'heartdoll' ||
    weaponStyle === 'planet_orbs' ||
    weaponStyle === 'shard_blades' ||
    weaponStyle === 'lightwheels'
  ) {
    backOrbit = new THREE.Group();
    backOrbit.position.set(0, 1.38, -0.44);
    const count = weaponStyle === 'magicdaggers' || weaponStyle === 'planet_orbs' ? 5 : 4;
    for (let i = 0; i < count; i++) {
      const ang = (i / count) * Math.PI * 2;
      const part =
        weaponStyle === 'heartdoll' || weaponStyle === 'planet_orbs'
          ? new THREE.Mesh(new THREE.OctahedronGeometry(0.14, 0), accentMat)
          : new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.48, 0.03), accentMat);
      part.position.set(Math.cos(ang) * 0.56, Math.sin(ang) * 0.56, 0);
      part.rotation.z = ang + Math.PI / 2;
      backOrbit.add(part);
    }
    bodyGroup.add(backOrbit);
  }

  // Fanny Hip Cable Packs
  if (weaponStyle === 'dualcables') {
    const packGeo = new THREE.BoxGeometry(0.16, 0.32, 0.28);
    const lPack = new THREE.Mesh(packGeo, accentMat);
    lPack.position.set(-0.42, 0.92, -0.1);
    const rPack = lPack.clone();
    rPack.position.x = 0.42;
    bodyGroup.add(lPack, rPack);
  }

  // Head Group
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 1.9, 0);
  bodyGroup.add(headGroup);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.29, 16, 14), skinMat);
  head.castShadow = true;
  headGroup.add(head);

  if (headgear === 'pharsa_blindfold') {
    const blindfold = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.11, 0.36), accentMat);
    blindfold.position.set(0, 0.02, 0.14);
    headGroup.add(blindfold);
  } else {
    const eyeMat = new THREE.MeshStandardMaterial({
      color: isEnemy ? '#ff3b3b' : '#ffffff',
      emissive: isEnemy ? '#ef4444' : accentColor,
      emissiveIntensity: 0.8,
    });
    const leftEye = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.05, 0.05), eyeMat);
    leftEye.position.set(-0.095, 0.02, 0.26);
    const rightEye = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.05, 0.05), eyeMat);
    rightEye.position.set(0.095, 0.02, 0.26);
    headGroup.add(leftEye, rightEye);
  }

  // Hero Headgear Silhouettes (Supporting all 50!)
  if (
    headgear === 'tiara' ||
    headgear === 'moon_crown' ||
    headgear === 'silvanna_tiara' ||
    headgear === 'aurora_crown' ||
    headgear === 'karina_ears'
  ) {
    const hair = new THREE.Mesh(
      new THREE.SphereGeometry(0.31, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.65),
      clothMat
    );
    headGroup.add(hair);
    const tiara = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.035, 8, 16, Math.PI), accentMat);
    tiara.position.set(0, 0.22, 0.16);
    tiara.rotation.x = 0.2;
    headGroup.add(tiara);
    const lEar = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.26, 6), skinMat);
    lEar.position.set(-0.32, 0.06, 0);
    lEar.rotation.z = 1.1;
    const rEar = lEar.clone();
    rEar.position.x = 0.32;
    rEar.rotation.z = -1.1;
    headGroup.add(lEar, rEar);
  } else if (
    headgear === 'twintails' ||
    headgear === 'guinevere_ribbon' ||
    headgear === 'change_buns' ||
    headgear === 'luoyi_bun'
  ) {
    const hairColor = headgear === 'guinevere_ribbon' ? '#c2410c' : primaryColor;
    const hairMat = new THREE.MeshStandardMaterial({ color: hairColor, roughness: 0.55 });
    const hairTop = new THREE.Mesh(
      new THREE.SphereGeometry(0.31, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.6),
      hairMat
    );
    headGroup.add(hairTop);
    const tailGeo = new THREE.ConeGeometry(0.11, 0.68, 8);
    const lTail = new THREE.Mesh(tailGeo, headgear === 'guinevere_ribbon' ? hairMat : accentMat);
    lTail.position.set(-0.34, -0.08, -0.08);
    lTail.rotation.z = -0.35;
    const rTail = new THREE.Mesh(tailGeo, headgear === 'guinevere_ribbon' ? hairMat : accentMat);
    rTail.position.set(0.34, -0.08, -0.08);
    rTail.rotation.z = 0.35;
    headGroup.add(lTail, rTail);
  } else if (
    headgear === 'hair_spiky' ||
    headgear === 'gusion_locks' ||
    headgear === 'fredrinn_pompadour' ||
    headgear === 'paquito_hair' ||
    headgear === 'valir_flame' ||
    headgear === 'brody_dreads'
  ) {
    const hairColor =
      headgear === 'gusion_locks'
        ? '#92400e'
        : headgear === 'valir_flame'
          ? '#f97316'
          : headgear === 'fredrinn_pompadour' || headgear === 'paquito_hair' || headgear === 'brody_dreads'
            ? '#1e293b'
            : '#e2e8f0';
    const hairMat = new THREE.MeshStandardMaterial({
      color: hairColor,
      emissive: headgear === 'valir_flame' ? '#ea580c' : '#000000',
      emissiveIntensity: headgear === 'valir_flame' ? 0.6 : 0,
      roughness: 0.5,
    });
    for (let i = 0; i < 5; i++) {
      const spike = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.34, 6), hairMat);
      spike.position.set((i - 2) * 0.11, 0.28, -0.04);
      spike.rotation.z = (2 - i) * 0.25;
      spike.rotation.x = -0.25;
      headGroup.add(spike);
    }
  } else if (
    headgear === 'cyber_visor' ||
    headgear === 'fanny_goggles' ||
    headgear === 'johnson_visor' ||
    headgear === 'atlas_diver' ||
    headgear === 'yve_visor' ||
    headgear === 'ixia_visor' ||
    headgear === 'bruno_goggles'
  ) {
    const helm = new THREE.Mesh(new THREE.SphereGeometry(0.34, 14, 10), clothMat);
    headGroup.add(helm);
    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.14, 0.18), accentMat);
    visor.position.set(0, headgear === 'fanny_goggles' || headgear === 'bruno_goggles' ? 0.16 : 0.04, 0.24);
    headGroup.add(visor);
  } else if (headgear === 'cat_hood' || headgear === 'angela_bunny' || headgear === 'ruby_hood' || headgear === 'natalia_hood' || headgear === 'aamon_hood' || headgear === 'granger_hood') {
    const hood = new THREE.Mesh(new THREE.SphereGeometry(0.34, 14, 10), armorMat);
    headGroup.add(hood);
    if (headgear === 'cat_hood' || headgear === 'angela_bunny') {
      const earH = headgear === 'angela_bunny' ? 0.38 : 0.26;
      const lCat = new THREE.Mesh(new THREE.ConeGeometry(0.1, earH, 6), accentMat);
      lCat.position.set(-0.2, 0.36, 0.04);
      lCat.rotation.z = 0.25;
      const rCat = lCat.clone();
      rCat.position.x = 0.2;
      rCat.rotation.z = -0.25;
      headGroup.add(lCat, rCat);
    }
  } else if (
    headgear === 'horns' ||
    headgear === 'hylos_antlers' ||
    headgear === 'yuzhong_horns' ||
    headgear === 'dyrroth_horns' ||
    headgear === 'helcurt_crest' ||
    headgear === 'karrie_crest'
  ) {
    const brow = new THREE.Mesh(
      new THREE.SphereGeometry(0.31, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.55),
      clothMat
    );
    headGroup.add(brow);
    const lHorn = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.45, 6), accentMat);
    lHorn.position.set(-0.24, 0.28, 0.05);
    lHorn.rotation.z = 0.65;
    const rHorn = lHorn.clone();
    rHorn.position.x = 0.24;
    rHorn.rotation.z = -0.65;
    headGroup.add(lHorn, rHorn);
  } else if (headgear === 'lightning_crown' || headgear === 'kagura_hairpin' || headgear === 'khufra_crown' || headgear === 'minsitthar_crown') {
    const hair = new THREE.Mesh(
      new THREE.SphereGeometry(0.31, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.62),
      armorMat
    );
    headGroup.add(hair);
    const halo = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.034, 8, 20), accentMat);
    halo.position.set(0, 0.34, 0);
    halo.rotation.x = Math.PI / 2;
    headGroup.add(halo);
  } else if (headgear === 'harley_tophat' || headgear === 'cyclops_hat' || headgear === 'clint_hat') {
    const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 0.05, 16), armorMat);
    brim.position.y = 0.24;
    const cone = new THREE.Mesh(
      headgear === 'cyclops_hat' ? new THREE.ConeGeometry(0.28, 0.58, 12) : new THREE.CylinderGeometry(0.26, 0.3, 0.44, 14),
      clothMat
    );
    cone.position.y = 0.48;
    const band = new THREE.Mesh(new THREE.TorusGeometry(0.29, 0.03, 6, 16), accentMat);
    band.rotation.x = Math.PI / 2;
    band.position.y = 0.28;
    headGroup.add(brim, cone, band);
  } else if (headgear === 'chou_headband' || headgear === 'beatrix_beret' || headgear === 'cecilion_collar') {
    const hair = new THREE.Mesh(
      new THREE.SphereGeometry(0.31, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.6),
      clothMat
    );
    headGroup.add(hair);
    const band = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.045, 6, 16), accentMat);
    band.position.y = 0.14;
    band.rotation.x = Math.PI / 2;
    headGroup.add(band);
  } else {
    // helm_paladin, dragon_plume, lancelot_plume, terizla_mask, hayabusa_mask
    const helm = new THREE.Mesh(
      new THREE.SphereGeometry(0.32, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.58),
      armorMat
    );
    headGroup.add(helm);
    const plume = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.42, 6), accentMat);
    plume.position.set(0, 0.38, -0.06);
    plume.rotation.x = -0.45;
    headGroup.add(plume);
  }

  // Arms
  const leftArm = new THREE.Group();
  leftArm.position.set(-torsoWidth * 0.66, 1.5, 0);
  bodyGroup.add(leftArm);
  const leftArmMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.08, 0.64, 8), clothMat);
  leftArmMesh.position.y = -0.29;
  leftArmMesh.castShadow = true;
  leftArm.add(leftArmMesh);

  if (role === 'tank') {
    const offShield = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.78, 0.56), armorMat);
    offShield.position.set(-0.14, -0.36, 0.16);
    offShield.castShadow = true;
    leftArm.add(offShield);
    const shieldBoss = new THREE.Mesh(new THREE.OctahedronGeometry(0.14, 0), accentMat);
    shieldBoss.position.set(-0.22, -0.36, 0.16);
    leftArm.add(shieldBoss);
  } else if (
    weaponStyle === 'cyberblades' ||
    weaponStyle === 'dualblades' ||
    weaponStyle === 'daggers' ||
    weaponStyle === 'magicdaggers' ||
    weaponStyle === 'dualcables' ||
    weaponStyle === 'gauntlets' ||
    weaponStyle === 'boxing_gloves' ||
    weaponStyle === 'abyss_blades' ||
    weaponStyle === 'moon_twinblades' ||
    weaponStyle === 'dragon_claws' ||
    weaponStyle === 'assassin_claws' ||
    weaponStyle === 'arc_rifles' ||
    weaponStyle === 'cowboy_pistols'
  ) {
    const offWeapon = buildWeaponMesh(weaponStyle, primaryColor, accentColor);
    offWeapon.position.set(0, -0.56, 0.08);
    offWeapon.scale.setScalar(0.88);
    leftArm.add(offWeapon);
  }

  const rightArm = new THREE.Group();
  rightArm.position.set(torsoWidth * 0.66, 1.5, 0);
  bodyGroup.add(rightArm);
  const rightArmMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.08, 0.64, 8), clothMat);
  rightArmMesh.position.y = -0.29;
  rightArmMesh.castShadow = true;
  rightArm.add(rightArmMesh);

  const weaponMount = new THREE.Group();
  weaponMount.position.set(0, -0.56, 0.08);
  rightArm.add(weaponMount);
  weaponMount.add(buildWeaponMesh(weaponStyle, primaryColor, accentColor));

  // Legs (grounded bottom-center at y = 0)
  const leftLeg = new THREE.Group();
  leftLeg.position.set(-torsoWidth * 0.25, 0.78, 0);
  bodyGroup.add(leftLeg);
  const leftLegMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.09, 0.78, 8), clothMat);
  leftLegMesh.position.y = -0.39;
  leftLegMesh.castShadow = true;
  leftLeg.add(leftLegMesh);
  const leftBoot = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.15, 0.3), armorMat);
  leftBoot.position.set(0, -0.71, 0.04);
  leftLeg.add(leftBoot);

  const rightLeg = new THREE.Group();
  rightLeg.position.set(torsoWidth * 0.25, 0.78, 0);
  bodyGroup.add(rightLeg);
  const rightLegMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.09, 0.78, 8), clothMat);
  rightLegMesh.position.y = -0.39;
  rightLegMesh.castShadow = true;
  rightLeg.add(rightLegMesh);
  const rightBoot = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.15, 0.3), armorMat);
  rightBoot.position.set(0, -0.71, 0.04);
  rightLeg.add(rightBoot);

  const auraMat = new THREE.MeshBasicMaterial({
    color: isEnemy ? '#f97316' : accentColor,
    transparent: true,
    opacity: 0.45,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const auraRing = new THREE.Mesh(new THREE.RingGeometry(0.76, 0.98, 28), auraMat);
  auraRing.rotation.x = -Math.PI / 2;
  auraRing.position.y = 0.05;
  root.add(auraRing);

  return {
    root,
    bodyGroup,
    headGroup,
    leftArm,
    rightArm,
    leftLeg,
    rightLeg,
    weaponMount,
    cape,
    auraRing,
    backOrbit,
  };
}

// MASSIVE TOWERING LORD RIG (Neutral crimson-gold or Allied sky-blue-gold)
export function buildLordBossRig(scale = 2.2, allied = false): AnimatedRig {
  const root = new THREE.Group();
  root.scale.setScalar(scale);

  const bodyGroup = new THREE.Group();
  root.add(bodyGroup);

  const armorTex = createLordArmorTexture(4);
  const lordArmorMat = new THREE.MeshStandardMaterial({
    map: armorTex,
    color: allied ? '#0f294a' : '#1e293b',
    roughness: 0.3,
    metalness: 0.78,
  });
  const goldTrimMat = new THREE.MeshStandardMaterial({
    color: '#fbbf24',
    emissive: '#b45309',
    emissiveIntensity: 0.45,
    roughness: 0.2,
    metalness: 0.85,
  });
  const energyMat = new THREE.MeshStandardMaterial({
    color: allied ? '#38bdf8' : '#ef4444',
    emissive: allied ? '#0284c7' : '#dc2626',
    emissiveIntensity: 0.95,
    roughness: 0.15,
  });

  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.44, 1.05, 10), lordArmorMat);
  torso.position.y = 1.32;
  torso.castShadow = true;
  bodyGroup.add(torso);

  const core = new THREE.Mesh(new THREE.OctahedronGeometry(0.24, 0), energyMat);
  core.position.set(0, 1.36, 0.56);
  bodyGroup.add(core);

  for (const side of [-1, 1]) {
    const p = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.44, 0.52), lordArmorMat);
    p.position.set(side * 0.72, 1.72, 0);
    p.rotation.z = side * -0.25;
    p.castShadow = true;
    bodyGroup.add(p);

    const spike = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.64, 6), goldTrimMat);
    spike.position.set(side * 0.86, 2.02, 0);
    spike.rotation.z = side * -0.4;
    bodyGroup.add(spike);
  }

  const cape = new THREE.Mesh(new THREE.BoxGeometry(1.15, 1.45, 0.08), energyMat);
  cape.position.set(0, 1.15, -0.52);
  cape.rotation.x = 0.22;
  bodyGroup.add(cape);

  const backOrbit = new THREE.Group();
  backOrbit.position.set(0, 1.65, -0.45);
  const halo = new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.055, 8, 24), goldTrimMat);
  backOrbit.add(halo);
  for (let i = 0; i < 6; i++) {
    const ang = (i / 6) * Math.PI * 2;
    const rune = new THREE.Mesh(new THREE.OctahedronGeometry(0.12, 0), energyMat);
    rune.position.set(Math.cos(ang) * 0.95, Math.sin(ang) * 0.95, 0);
    backOrbit.add(rune);
  }
  bodyGroup.add(backOrbit);

  const headGroup = new THREE.Group();
  headGroup.position.set(0, 2.05, 0);
  bodyGroup.add(headGroup);

  const helm = new THREE.Mesh(new THREE.DodecahedronGeometry(0.35, 0), lordArmorMat);
  helm.castShadow = true;
  headGroup.add(helm);

  const eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.05, 0.08), energyMat);
  eyeL.position.set(-0.11, 0.04, 0.31);
  const eyeR = eyeL.clone();
  eyeR.position.x = 0.11;
  headGroup.add(eyeL, eyeR);

  const lHorn = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.72, 6), goldTrimMat);
  lHorn.position.set(-0.28, 0.42, 0);
  lHorn.rotation.z = 0.48;
  const rHorn = lHorn.clone();
  rHorn.position.x = 0.28;
  rHorn.rotation.z = -0.48;
  headGroup.add(lHorn, rHorn);

  const leftArm = new THREE.Group();
  leftArm.position.set(-0.74, 1.62, 0);
  bodyGroup.add(leftArm);
  const leftArmMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.12, 0.75, 8), lordArmorMat);
  leftArmMesh.position.y = -0.35;
  leftArm.add(leftArmMesh);
  const shield = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.95, 0.7), goldTrimMat);
  shield.position.set(-0.18, -0.42, 0.18);
  leftArm.add(shield);

  const rightArm = new THREE.Group();
  rightArm.position.set(0.74, 1.62, 0);
  bodyGroup.add(rightArm);
  const rightArmMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.12, 0.75, 8), lordArmorMat);
  rightArmMesh.position.y = -0.35;
  rightArm.add(rightArmMesh);

  const weaponMount = new THREE.Group();
  weaponMount.position.set(0, -0.64, 0.1);
  rightArm.add(weaponMount);
  const lordBlade = buildWeaponMesh('greatsword', '#fbbf24', allied ? '#38bdf8' : '#ef4444');
  lordBlade.scale.setScalar(1.38);
  weaponMount.add(lordBlade);

  const leftLeg = new THREE.Group();
  leftLeg.position.set(-0.24, 0.82, 0);
  bodyGroup.add(leftLeg);
  const lLegM = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.14, 0.82, 8), lordArmorMat);
  lLegM.position.y = -0.41;
  leftLeg.add(lLegM);
  const lFoot = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.18, 0.42), goldTrimMat);
  lFoot.position.set(0, -0.73, 0.06);
  leftLeg.add(lFoot);

  const rightLeg = new THREE.Group();
  rightLeg.position.set(0.24, 0.82, 0);
  bodyGroup.add(rightLeg);
  const rLegM = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.14, 0.82, 8), lordArmorMat);
  rLegM.position.y = -0.41;
  rightLeg.add(rLegM);
  const rFoot = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.18, 0.42), goldTrimMat);
  rFoot.position.set(0, -0.73, 0.06);
  rightLeg.add(rFoot);

  const auraRing = new THREE.Mesh(
    new THREE.RingGeometry(0.95, 1.25, 32),
    new THREE.MeshBasicMaterial({
      color: allied ? '#38bdf8' : '#ef4444',
      transparent: true,
      opacity: 0.72,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
  );
  auraRing.rotation.x = -Math.PI / 2;
  auraRing.position.y = 0.06;
  root.add(auraRing);

  return {
    root,
    bodyGroup,
    headGroup,
    leftArm,
    rightArm,
    leftLeg,
    rightLeg,
    weaponMount,
    cape,
    auraRing,
    backOrbit,
  };
}

// ============================================================
// LANE MINIONS, TURRETS, AND ALLIED/ENEMY BASES
// ============================================================
export function buildMinionMesh(
  team: 'ally' | 'enemy',
  type: 'melee' | 'ranged' | 'siege'
): THREE.Group {
  const g = new THREE.Group();
  const isAlly = team === 'ally';
  const mainMat = new THREE.MeshPhysicalMaterial({
    color: isAlly ? '#0284c7' : '#dc2626',
    roughness: 0.34,
    metalness: 0.45,
    clearcoat: 0.4,
  });
  const darkMat = new THREE.MeshStandardMaterial({
    color: isAlly ? '#0f172a' : '#3b0712',
    roughness: 0.6,
    metalness: 0.35,
  });
  const trimMat = new THREE.MeshStandardMaterial({
    color: isAlly ? '#bae6fd' : '#fca5a5',
    emissive: isAlly ? '#38bdf8' : '#ef4444',
    emissiveIntensity: 0.55,
    roughness: 0.2,
  });

  if (type === 'siege') {
    const cart = new THREE.Mesh(new THREE.BoxGeometry(1.18, 0.62, 1.5), mainMat);
    cart.position.y = 0.58;
    cart.castShadow = true;
    const deckTrim = new THREE.Mesh(new THREE.BoxGeometry(1.26, 0.14, 1.56), darkMat);
    deckTrim.position.y = 0.88;
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.32, 1.28, 10), darkMat);
    barrel.rotation.x = Math.PI * 0.34;
    barrel.position.set(0, 1.08, 0.34);
    const muzzleRing = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.05, 8, 14), trimMat);
    muzzleRing.position.set(0, 1.38, 0.9);
    muzzleRing.rotation.x = Math.PI * 0.34;
    for (const [wx, wz] of [
      [-0.64, 0.48],
      [0.64, 0.48],
      [-0.64, -0.48],
      [0.64, -0.48],
    ]) {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.16, 10), darkMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(wx, 0.28, wz);
      g.add(wheel);
    }
    g.add(cart, deckTrim, barrel, muzzleRing);
    return g;
  }

  const s = type === 'melee' ? 0.82 : 0.76;
  g.scale.setScalar(s);

  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.44, 0.36, 0.92, 10), mainMat);
  body.position.y = 0.74;
  body.castShadow = true;
  const shoulderPadL = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), darkMat);
  shoulderPadL.position.set(-0.42, 1.12, 0);
  const shoulderPadR = shoulderPadL.clone();
  shoulderPadR.position.x = 0.42;

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.3, 12, 10), darkMat);
  head.position.y = 1.42;
  const visor = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.08, 0.12), trimMat);
  visor.position.set(0, 1.44, 0.26);

  if (type === 'melee') {
    const shield = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.72, 0.54), mainMat);
    shield.position.set(-0.5, 0.8, 0.16);
    const shieldRim = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.3, 0.3), trimMat);
    shieldRim.position.set(-0.52, 0.8, 0.16);
    const sword = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.82, 0.08), trimMat);
    sword.position.set(0.48, 0.94, 0.26);
    sword.rotation.x = Math.PI * 0.28;
    g.add(shield, shieldRim, sword);
  } else {
    const hood = new THREE.Mesh(new THREE.ConeGeometry(0.36, 0.48, 10), mainMat);
    hood.position.set(0, 1.72, -0.02);
    const staff = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.4, 8), darkMat);
    staff.position.set(0.46, 0.98, 0.14);
    const orb = new THREE.Mesh(new THREE.OctahedronGeometry(0.18, 0), trimMat);
    orb.position.set(0.46, 1.72, 0.14);
    g.add(hood, staff, orb);
  }
  g.add(body, shoulderPadL, shoulderPadR, head, visor);
  return g;
}

export function buildTurretMesh(team: 'ally' | 'enemy'): {
  group: THREE.Group;
  crystal: THREE.Mesh;
  rangeRing: THREE.Mesh;
  shieldDome: THREE.Mesh;
  shieldRing: THREE.Mesh;
} {
  const g = new THREE.Group();
  const isAlly = team === 'ally';
  const stoneMat = new THREE.MeshPhysicalMaterial({
    color: isAlly ? '#1e3a8a' : '#450a0a',
    roughness: 0.42,
    metalness: 0.42,
    clearcoat: 0.35,
  });
  const goldMat = new THREE.MeshStandardMaterial({
    color: '#fbbf24',
    metalness: 0.82,
    roughness: 0.24,
  });
  const trimMat = new THREE.MeshStandardMaterial({
    color: isAlly ? '#38bdf8' : '#ef4444',
    emissive: isAlly ? '#0284c7' : '#dc2626',
    emissiveIntensity: 0.85,
    roughness: 0.18,
  });

  const plinth = new THREE.Mesh(new THREE.CylinderGeometry(2.25, 2.85, 0.95, 16), stoneMat);
  plinth.position.y = 0.48;
  plinth.receiveShadow = true;
  plinth.castShadow = true;

  const baseTrim = new THREE.Mesh(new THREE.TorusGeometry(2.3, 0.12, 8, 24), goldMat);
  baseTrim.rotation.x = Math.PI / 2;
  baseTrim.position.y = 0.96;

  const tower = new THREE.Mesh(new THREE.CylinderGeometry(1.12, 1.65, 4.7, 12), stoneMat);
  tower.position.y = 3.1;
  tower.castShadow = true;

  // 4 Buttress Fin Ribs
  for (let i = 0; i < 4; i++) {
    const ang = (i / 4) * Math.PI * 2;
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.32, 3.4, 0.72), goldMat);
    fin.position.set(Math.cos(ang) * 1.45, 2.35, Math.sin(ang) * 1.45);
    fin.rotation.y = -ang + Math.PI / 2;
    fin.castShadow = true;
    g.add(fin);
  }

  const collar = new THREE.Mesh(new THREE.TorusGeometry(1.32, 0.15, 8, 22), trimMat);
  collar.rotation.x = Math.PI / 2;
  collar.position.y = 5.35;

  const crownHalo = new THREE.Mesh(new THREE.TorusGeometry(1.52, 0.08, 8, 28), goldMat);
  crownHalo.rotation.x = Math.PI / 2;
  crownHalo.position.y = 6.95;

  const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(1.0, 0), trimMat);
  crystal.scale.set(0.88, 1.65, 0.88);
  crystal.position.y = 7.0;

  // Protective Energy Shield Dome (Hex Energy Pattern) + Ground Shield Ring
  const shieldHexTex = createHexShieldTexture(isAlly ? '#7dd3fc' : '#fbbf24');
  const shieldDome = new THREE.Mesh(
    new THREE.SphereGeometry(3.82, 28, 18, 0, Math.PI * 2, 0, Math.PI * 0.68),
    new THREE.MeshPhysicalMaterial({
      map: shieldHexTex,
      color: isAlly ? '#7dd3fc' : '#fca5a5',
      emissive: isAlly ? '#0ea5e9' : '#f43f5e',
      emissiveIntensity: 0.48,
      transparent: true,
      opacity: 0.28,
      roughness: 0.12,
      metalness: 0.15,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
  );
  shieldDome.position.y = 1.35;

  const shieldRing = new THREE.Mesh(
    new THREE.RingGeometry(3.45, 3.88, 40),
    new THREE.MeshBasicMaterial({
      color: isAlly ? '#38bdf8' : '#fbbf24',
      transparent: true,
      opacity: 0.58,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
  );
  shieldRing.rotation.x = -Math.PI / 2;
  shieldRing.position.y = 0.2;

  const rangeRing = new THREE.Mesh(
    new THREE.RingGeometry(18.2, 18.5, 48),
    new THREE.MeshBasicMaterial({
      color: isAlly ? '#38bdf8' : '#ef4444',
      transparent: true,
      opacity: 0.22,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
  );
  rangeRing.rotation.x = -Math.PI / 2;
  rangeRing.position.y = 0.14;

  g.add(plinth, baseTrim, tower, collar, crownHalo, crystal, shieldDome, shieldRing, rangeRing);
  return { group: g, crystal, rangeRing, shieldDome, shieldRing };
}

export function buildBaseNexusMesh(team: 'ally' | 'enemy'): {
  group: THREE.Group;
  coreCrystal: THREE.Mesh;
  shieldDome?: THREE.Mesh;
} {
  const g = new THREE.Group();
  const isAlly = team === 'ally';
  const stoneMat = new THREE.MeshStandardMaterial({
    color: isAlly ? '#172554' : '#3b0712',
    roughness: 0.38,
    metalness: 0.48,
  });
  const goldMat = new THREE.MeshStandardMaterial({
    color: '#fbbf24',
    roughness: 0.24,
    metalness: 0.82,
  });
  const coreMat = new THREE.MeshStandardMaterial({
    color: isAlly ? '#38bdf8' : '#fb7185',
    emissive: isAlly ? '#0ea5e9' : '#e11d48',
    emissiveIntensity: 1.05,
    roughness: 0.12,
    metalness: 0.25,
  });

  const dais = new THREE.Mesh(new THREE.CylinderGeometry(7.2, 8.4, 1.15, 24), stoneMat);
  dais.position.y = 0.58;
  dais.receiveShadow = true;
  dais.castShadow = true;
  g.add(dais);

  const ring = new THREE.Mesh(new THREE.TorusGeometry(5.6, 0.28, 10, 32), coreMat);
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 1.22;
  g.add(ring);

  const upperHalo = new THREE.Mesh(new THREE.TorusGeometry(3.2, 0.12, 8, 28), goldMat);
  upperHalo.rotation.x = Math.PI / 2;
  upperHalo.position.y = 5.4;
  g.add(upperHalo);

  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.78, 5.2, 8), stoneMat);
    pillar.position.set(Math.cos(a) * 4.8, 3.2, Math.sin(a) * 4.8);
    pillar.castShadow = true;
    const tip = new THREE.Mesh(new THREE.OctahedronGeometry(0.52, 0), coreMat);
    tip.position.set(Math.cos(a) * 4.8, 6.2, Math.sin(a) * 4.8);
    g.add(pillar, tip);
  }

  const coreCrystal = new THREE.Mesh(new THREE.OctahedronGeometry(2.15, 0), coreMat);
  coreCrystal.scale.set(0.95, 1.65, 0.95);
  coreCrystal.position.y = 5.4;
  g.add(coreCrystal);

  let shieldDome: THREE.Mesh | undefined;
  if (!isAlly) {
    const nexusShieldTex = createHexShieldTexture('#fb7185');
    shieldDome = new THREE.Mesh(
      new THREE.SphereGeometry(7.6, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.66),
      new THREE.MeshBasicMaterial({
        map: nexusShieldTex,
        color: '#f43f5e',
        transparent: true,
        opacity: 0.34,
        side: THREE.DoubleSide,
        depthWrite: false,
      })
    );
    shieldDome.position.y = 0.5;
    g.add(shieldDome);
  }

  return { group: g, coreCrystal, shieldDome };
}

// DETAILED JUNGLE MONSTERS: BLUE BUFF, RED BUFF, TURTLE & CAMPS
export function buildJungleMonsterMesh(
  type: JungleCampDef['type'],
  colorHex: string,
  scale = 1
): THREE.Group {
  const g = new THREE.Group();
  g.scale.setScalar(scale);

  const mainMat = new THREE.MeshStandardMaterial({
    color: colorHex,
    roughness: type === 'slime' ? 0.18 : 0.52,
    metalness: type === 'golem' || type === 'blue_buff' || type === 'red_buff' ? 0.35 : 0.15,
  });
  const eyeMat = new THREE.MeshStandardMaterial({
    color: '#fef08a',
    emissive: type === 'blue_buff' ? '#38bdf8' : type === 'red_buff' ? '#f97316' : '#facc15',
    emissiveIntensity: 0.9,
  });

  if (type === 'turtle') {
    const shellMat = new THREE.MeshStandardMaterial({
      color: '#065f46',
      roughness: 0.45,
      metalness: 0.28,
    });
    const goldTrimMat = new THREE.MeshStandardMaterial({
      color: '#fbbf24',
      emissive: '#d97706',
      emissiveIntensity: 0.35,
      metalness: 0.7,
      roughness: 0.25,
    });
    const skinMat = new THREE.MeshStandardMaterial({ color: '#10b981', roughness: 0.6 });

    const shell = new THREE.Mesh(
      new THREE.SphereGeometry(1.05, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.55),
      shellMat
    );
    shell.scale.set(1.12, 0.78, 1.28);
    shell.position.y = 0.35;
    shell.castShadow = true;
    g.add(shell);

    const rim = new THREE.Mesh(new THREE.TorusGeometry(1.14, 0.12, 8, 20), goldTrimMat);
    rim.rotation.x = Math.PI / 2;
    rim.scale.set(1.0, 1.15, 1.0);
    rim.position.y = 0.38;
    g.add(rim);

    const spire = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.36, 0),
      new THREE.MeshStandardMaterial({
        color: '#34d399',
        emissive: '#10b981',
        emissiveIntensity: 0.85,
        roughness: 0.15,
      })
    );
    spire.scale.set(0.9, 1.6, 0.9);
    spire.position.set(0, 1.25, -0.1);
    g.add(spire);

    for (let p = 0; p < 4; p++) {
      const ang = (p / 4) * Math.PI * 2 + Math.PI / 4;
      const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.32, 0.08, 6), goldTrimMat);
      plate.position.set(Math.cos(ang) * 0.52, 0.9, Math.sin(ang) * 0.58);
      plate.rotation.set(Math.sin(ang) * 0.28, 0, -Math.cos(ang) * 0.28);
      g.add(plate);
    }

    const head = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.46, 0.72), skinMat);
    head.position.set(0, 0.56, 1.28);
    head.castShadow = true;
    g.add(head);

    const e1 = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), eyeMat);
    e1.position.set(-0.18, 0.64, 1.58);
    const e2 = e1.clone();
    e2.position.x = 0.18;
    g.add(e1, e2);

    for (const [lx, lz] of [
      [-0.88, 0.72],
      [0.88, 0.72],
      [-0.86, -0.72],
      [0.86, -0.72],
    ]) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.24, 0.46, 8), skinMat);
      leg.position.set(lx, 0.22, lz);
      leg.castShadow = true;
      g.add(leg);
    }
    return g;
  }

  if (type === 'blue_buff' || type === 'red_buff') {
    const isBlue = type === 'blue_buff';
    const rockMat = new THREE.MeshStandardMaterial({
      color: isBlue ? '#1e3a8a' : '#450a0a',
      roughness: 0.65,
      metalness: 0.25,
    });
    const glowMat = new THREE.MeshStandardMaterial({
      color: isBlue ? '#38bdf8' : '#ef4444',
      emissive: isBlue ? '#0284c7' : '#dc2626',
      emissiveIntensity: 0.95,
      roughness: 0.18,
    });

    const torso = new THREE.Mesh(new THREE.DodecahedronGeometry(0.86, 0), rockMat);
    torso.position.y = 1.42;
    torso.castShadow = true;
    g.add(torso);

    const core = new THREE.Mesh(new THREE.OctahedronGeometry(0.36, 0), glowMat);
    core.position.set(0, 1.42, 0.72);
    g.add(core);

    const head = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.46, 0.5), rockMat);
    head.position.set(0, 2.22, 0.1);
    g.add(head);
    const lEye = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.06, 0.06), glowMat);
    lEye.position.set(-0.13, 2.25, 0.36);
    const rEye = lEye.clone();
    rEye.position.x = 0.13;
    g.add(lEye, rEye);

    for (const side of [-1, 1]) {
      const crystalShoulder = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.85, 6), glowMat);
      crystalShoulder.position.set(side * 0.88, 1.98, 0);
      crystalShoulder.rotation.z = side * -0.45;
      g.add(crystalShoulder);

      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.42, 1.08, 0.42), rockMat);
      arm.position.set(side * 1.02, 1.18, 0.12);
      arm.castShadow = true;
      g.add(arm);

      const fist = new THREE.Mesh(new THREE.OctahedronGeometry(0.28, 0), glowMat);
      fist.position.set(side * 1.02, 0.62, 0.18);
      g.add(fist);

      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.7, 0.42), rockMat);
      leg.position.set(side * 0.38, 0.35, 0);
      g.add(leg);
    }
    return g;
  }

  if (type === 'dummy') {
    const post = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.16, 1.5, 8),
      new THREE.MeshStandardMaterial({ color: '#78350f', roughness: 0.9 })
    );
    post.position.y = 0.75;
    post.castShadow = true;
    g.add(post);
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.36, 0.9, 10), mainMat);
    body.position.y = 1.1;
    body.castShadow = true;
    g.add(body);
    const crossbar = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.14, 0.14), mainMat);
    crossbar.position.y = 1.25;
    g.add(crossbar);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.28, 10, 10), mainMat);
    head.position.y = 1.75;
    g.add(head);
    return g;
  }

  if (type === 'slime') {
    const dome = new THREE.Mesh(
      new THREE.SphereGeometry(0.75, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.64),
      mainMat
    );
    dome.position.y = 0.05;
    dome.castShadow = true;
    g.add(dome);
    const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.3, 0), eyeMat);
    crystal.position.y = 0.68;
    g.add(crystal);
    const e1 = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), eyeMat);
    e1.position.set(-0.22, 0.38, 0.58);
    const e2 = e1.clone();
    e2.position.x = 0.22;
    g.add(e1, e2);
  } else if (type === 'wolf') {
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.64, 0.56, 1.28), mainMat);
    body.position.y = 0.62;
    body.castShadow = true;
    g.add(body);
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.42, 0.54), mainMat);
    head.position.set(0, 0.88, 0.68);
    g.add(head);
    const e1 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.06, 0.06), eyeMat);
    e1.position.set(-0.12, 0.94, 0.96);
    const e2 = e1.clone();
    e2.position.x = 0.12;
    g.add(e1, e2);
    for (const [lx, lz] of [
      [-0.22, 0.42],
      [0.22, 0.42],
      [-0.22, -0.42],
      [0.22, -0.42],
    ]) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.52, 6), mainMat);
      leg.position.set(lx, 0.26, lz);
      g.add(leg);
    }
  } else if (type === 'golem') {
    const torso = new THREE.Mesh(new THREE.DodecahedronGeometry(0.78, 0), mainMat);
    torso.position.y = 1.28;
    torso.castShadow = true;
    g.add(torso);
    const core = new THREE.Mesh(new THREE.OctahedronGeometry(0.28, 0), eyeMat);
    core.position.set(0, 1.28, 0.68);
    g.add(core);
    const lArm = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.92, 0.38), mainMat);
    lArm.position.set(-0.92, 1.1, 0);
    const rArm = lArm.clone();
    rArm.position.x = 0.92;
    const lLeg = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.6, 0.36), mainMat);
    lLeg.position.set(-0.32, 0.3, 0);
    const rLeg = lLeg.clone();
    rLeg.position.x = 0.32;
    g.add(lArm, rArm, lLeg, rLeg);
  } else {
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.45, 1.1, 8), mainMat);
    body.rotation.x = Math.PI / 2;
    body.position.y = 0.72;
    body.castShadow = true;
    g.add(body);
    const head = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.65, 6), mainMat);
    head.rotation.x = Math.PI / 2;
    head.position.set(0, 0.95, 0.72);
    g.add(head);
    const wingGeo = new THREE.BoxGeometry(0.98, 0.05, 0.55);
    const lWing = new THREE.Mesh(wingGeo, mainMat);
    lWing.position.set(-0.76, 0.95, 0);
    lWing.rotation.z = 0.35;
    const rWing = new THREE.Mesh(wingGeo, mainMat);
    rWing.position.set(0.76, 0.95, 0);
    rWing.rotation.z = -0.35;
    const e1 = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 6), eyeMat);
    e1.position.set(-0.12, 1.02, 0.72);
    const e2 = e1.clone();
    e2.position.x = 0.12;
    g.add(lWing, rWing, e1, e2);
  }

  return g;
}
