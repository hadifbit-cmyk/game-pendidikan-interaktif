import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  ADJECTIVE_CARDS,
  AdjectiveCard,
  ALLIED_BASE_POS,
  BalancedTeamSlot,
  BASE_MAX_HP,
  compose5v5Teams,
  ENEMY_BASE_POS,
  EnemyDefinition,
  HEALING_FOUNTAINS,
  HeroDefinition,
  JUNGLE_CAMPS,
  JungleCampDef,
  LANE_WAYPOINTS,
  LaneId,
  LORD_PIT_POS,
  pickRandomAdjectiveCard,
  PLAYER_SPAWN,
  SHOP_ITEMS,
  ShopItemDef,
  THE_LORD_BOSS,
  TURRET_DEFS,
  TurretDef,
  TURTLE_PIT_POS,
  WORLD_RADIUS,
} from '../data/gameData';
import {
  AnimatedRig,
  buildBaseNexusMesh,
  buildCharacterRig,
  buildJungleMonsterMesh,
  buildLordBossRig,
  buildMinionMesh,
  buildTurretMesh,
  disposeObject3D,
} from './characterModels';
import {
  AwardMedal,
  CardRewardNotification,
  FloatingDamageText,
  HudSnapshot,
  KillFeedItem,
  MatchHeroStats,
  MatchResultSummary,
  MinimapUnit,
  TeamSide,
  WorldHealthBar,
} from './hudTypes';
import { soundEngine } from './soundEngine';
import { createContactShadowTexture } from './textures';
import { BuiltWorld, buildDawnRealmWorld, groundHeightAt } from './worldBuilder';

const _vec3A = new THREE.Vector3();
const _vec3B = new THREE.Vector3();
const _vec3C = new THREE.Vector3();
const _projVec = new THREE.Vector3();

function detectSoftwareGl(): boolean {
  try {
    const gl = document.createElement('canvas').getContext('webgl2');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param));
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

interface Projectile {
  mesh: THREE.Mesh;
  x: number;
  y: number;
  z: number;
  vx: number;
  vz: number;
  speed: number;
  radius: number;
  damage: number;
  sourceTeam: TeamSide;
  attackerHeroId?: string;
  fromPlayer: boolean;
  life: number;
  aoeRadius?: number;
  pierce?: boolean;
  slow?: boolean;
  trueDmg?: boolean;
  hitIds?: Set<string>;
  color: string;
}

interface ShockwaveVfx {
  mesh: THREE.Mesh;
  age: number;
  duration: number;
  startScale: number;
  endScale: number;
}

interface ParticleBurst {
  points: THREE.Points;
  velocities: Float32Array;
  age: number;
  duration: number;
}

interface TelegraphZone {
  mesh: THREE.Mesh;
  innerMesh: THREE.Mesh;
  x: number;
  z: number;
  radius: number;
  age: number;
  duration: number;
  damage: number;
  sourceTeam: TeamSide | 'neutral';
  attackerHeroId?: string;
}

interface AiHeroState {
  id: string;
  team: TeamSide;
  slotIndex: number;
  assignedLane: LaneId | 'roam';
  lane: LaneId;
  waypointIdx: number;
  heroDef: HeroDefinition;
  rig: AnimatedRig;
  shadow: THREE.Mesh;
  x: number;
  z: number;
  yaw: number;
  hp: number;
  maxHp: number;
  mana: number;
  maxMana: number;
  shield: number;
  shieldTimer: number;
  level: number;
  xp: number;
  xpToNext: number;
  gold: number;
  items: string[];
  damage: number;
  defense: number;
  speed: number;
  attackRange: number;
  attackInterval: number;
  abilityCooldown: number;
  attackTimer: number;
  abilityTimer: number;
  skill2Timer: number;
  attackAnimTimer: number;
  slowTimer: number;
  buffTimer: number;
  retreating: boolean;
  alive: boolean;
  respawnTimer: number;
  inCombat: boolean;
}

interface HeroMatchRecord {
  id: string;
  heroDef: HeroDefinition;
  team: TeamSide;
  isPlayer: boolean;
  lane: LaneId | 'roam';
  level: number;
  kills: number;
  deaths: number;
  assists: number;
  cardsEarned: number;
  gold: number;
  items: string[];
  damageDealt: number;
  objectiveDamage: number;
  healingDone: number;
  killStreak: number;
  lastKillTime: number;
  multiKillCount: number;
  recentDamagers: Map<string, number>;
  recentSupportBy: Map<string, number>;
}

interface MinionEntity {
  id: string;
  team: 'ally' | 'enemy';
  type: 'melee' | 'ranged' | 'siege';
  lane: LaneId;
  waypointIdx: number;
  mesh: THREE.Group;
  x: number;
  z: number;
  yaw: number;
  hp: number;
  maxHp: number;
  damage: number;
  range: number;
  speed: number;
  attackTimer: number;
  alive: boolean;
}

interface TurretState {
  def: TurretDef;
  group: THREE.Group;
  crystal: THREE.Mesh;
  rangeRing: THREE.Mesh;
  shieldDome: THREE.Mesh;
  shieldRing: THREE.Mesh;
  hp: number;
  maxHp: number;
  shield: number;
  maxShield: number;
  shieldFlashTimer: number;
  crystalRecoil: number;
  alive: boolean;
  attackTimer: number;
}

interface BaseState {
  team: 'ally' | 'enemy';
  x: number;
  z: number;
  hp: number;
  maxHp: number;
  group: THREE.Group;
  coreCrystal: THREE.Mesh;
  shieldDome?: THREE.Mesh;
  vulnerable: boolean;
  attackTimer: number;
}

interface LordPitState {
  rig: AnimatedRig | null;
  shadow: THREE.Mesh | null;
  x: number;
  z: number;
  yaw: number;
  hp: number;
  maxHp: number;
  alive: boolean;
  respawnTimer: number;
  attackTimer: number;
  abilityTimer: number;
  attackAnimTimer: number;
  slowTimer: number;
  inCombat: boolean;
}

interface AlliedLordState {
  rig: AnimatedRig;
  shadow: THREE.Mesh;
  lane: LaneId;
  waypointIdx: number;
  x: number;
  z: number;
  yaw: number;
  hp: number;
  maxHp: number;
  damage: number;
  attackTimer: number;
  attackAnimTimer: number;
  alive: boolean;
}

interface JungleCampState {
  def: JungleCampDef;
  mesh: THREE.Group;
  x: number;
  z: number;
  hp: number;
  maxHp: number;
  alive: boolean;
  respawnTimer: number;
  attackTimer: number;
  aggro: boolean;
}

interface PickupOrb {
  mesh: THREE.Mesh;
  x: number;
  z: number;
  type: 'heal' | 'buff';
  age: number;
}

interface TargetCandidate {
  id: string;
  kind: 'enemy_hero' | 'lord' | 'turret' | 'base' | 'minion' | 'camp';
  name: string;
  x: number;
  z: number;
  hp: number;
  maxHp: number;
  dist: number;
  extraRadius: number;
}

export interface EngineCallbacks {
  onHudUpdate: (snapshot: HudSnapshot) => void;
  onCardCollected: (card: AdjectiveCard) => void;
  onCardReward?: (reward: CardRewardNotification) => void;
  onAchievementUnlocked: (achievementId: string) => void;
  onEnemyDefeated: (enemyDef: EnemyDefinition) => void;
  onVictory: () => void;
  onDefeat: () => void;
}

export class GameEngine {
  private container: HTMLElement;
  private callbacks: EngineCallbacks;
  private isSoftwareGl: boolean;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private world: BuiltWorld;
  private shadowTex: THREE.CanvasTexture;

  private frameId = 0;
  private disposed = false;
  private clock = new THREE.Clock();

  private mode: 'menu' | 'playing' | 'paused' | 'victory' | 'defeat' = 'menu';
  private heroDef: HeroDefinition | null = null;
  private gameTimeSec = 0;

  // Player State
  private playerRig: AnimatedRig | null = null;
  private playerShadow: THREE.Mesh | null = null;
  private targetReticle: THREE.Mesh;
  private rangeRing: THREE.Mesh;

  private playerX = PLAYER_SPAWN[0];
  private playerZ = PLAYER_SPAWN[1];
  private playerYaw = Math.PI * 0.25;
  private playerHp = 500;
  private playerMaxHp = 500;
  private playerMana = 320;
  private playerMaxMana = 320;
  private manaRegenPerSec = 18;
  private playerShield = 0;
  private playerShieldTimer = 0;
  private playerRespawnTimer = 0;
  private playerLevel = 1;
  private playerXp = 0;
  private playerXpToNext = 100;
  private playerGold = 140;
  private totalGoldEarned = 140;
  private playerShards = 0;
  private playerPotions = 3;
  private equippedItemIds: string[] = [];
  private dismissedItemIds: Set<string> = new Set();

  private baseDamage = 45;
  private baseDefense = 12;
  private baseSpeed = 10;
  private attackRange = 6;
  private baseAttackCooldown = 0.48;
  private skillPowerBonus = 0;
  private cooldownReduce = 0;
  private attackSpeedBonus = 0;
  private critChance = 0;
  private lifesteal = 0;
  private regenPerSec = 0;
  private goldBonus = 0;
  private armorPen = 0;

  // Hero Passives & Buffs
  private passiveStacks = 0;
  private passiveTimer = 0;
  private skillComboCounter = 0;
  private hitCounter = 0;
  private emergencySaveCd = 0;
  private cecilionBonus = 0;
  private buffTimer = 0;
  private redBuffTimer = 0;
  private blueBuffTimer = 0;
  private turtleBuffTimer = 0;
  private invulnTimer = 0;
  private dashTimer = 0;
  private dashSpeed = 26;
  private dashDirX = 0;
  private dashDirZ = 0;
  private attackAnimTimer = 0;

  private cdBasic = 0;
  private cdSkill1 = 0;
  private cdSkill2 = 0;
  private cdUltimate = 0;
  private cdDash = 0;

  // Targeting & Chase
  private targetLocked = false;
  private lockedTargetId: string | null = null;
  private autoChase = false;
  private autoAttackHeld = false;
  private chaseGoalActive = false;

  // Camera
  private cameraZoom = 1.0;
  private cameraYawOffset = 0;
  private rightDragging = false;
  private rightDragLastX = 0;

  private inBush = false;
  private inFountain = false;
  private combatAlert: string | null = null;
  private combatAlertTimer = 0;
  private lordIntroTimer = 0;
  private lordFootstepAccum = 0;
  private baseAttackAlertCooldown = 0;

  // 5V5 Team & Match Stats State
  private alliedHeroes: AiHeroState[] = [];
  private enemyHeroes: AiHeroState[] = [];
  private heroRecords: Map<string, HeroMatchRecord> = new Map();
  private heroOrderIds: string[] = [];
  private blueTeamCards = 0;
  private redTeamCards = 0;
  private blueTeamKills = 0;
  private redTeamKills = 0;
  private firstKillTriggered = false;
  private killFeed: KillFeedItem[] = [];
  private nextKillFeedId = 1;
  private nextCardRewardId = 1;
  private matchResult: MatchResultSummary | null = null;
  private defeatedEnemiesCount = 0;
  private enemyMaxLevel = 1;

  // Lanes: Minions, Turrets, Bases, Lord & Allied Lord
  private minions: MinionEntity[] = [];
  private minionWaveTimer = 2.0;
  private waveCounter = 0;
  private nextMinionId = 1;
  private turrets: TurretState[] = [];
  private alliedBase: BaseState | null = null;
  private enemyBase: BaseState | null = null;
  private lordPit: LordPitState = {
    rig: null,
    shadow: null,
    x: LORD_PIT_POS[0],
    z: LORD_PIT_POS[1],
    yaw: 0,
    hp: THE_LORD_BOSS.maxHp,
    maxHp: THE_LORD_BOSS.maxHp,
    alive: false,
    respawnTimer: 22,
    attackTimer: 1.0,
    abilityTimer: 3.8,
    attackAnimTimer: 0,
    slowTimer: 0,
    inCombat: false,
  };
  private alliedLord: AlliedLordState | null = null;

  private jungleCamps: JungleCampState[] = [];
  private collectedCardIds: Set<string> = new Set();
  private unlockedAchievements: Set<string> = new Set();
  private pickupOrbs: PickupOrb[] = [];

  private projectiles: Projectile[] = [];
  private shockwaves: ShockwaveVfx[] = [];
  private bursts: ParticleBurst[] = [];
  private telegraphs: TelegraphZone[] = [];
  private steelCables: { line: THREE.Line; age: number; duration: number }[] = [];
  private floatingTexts: FloatingDamageText[] = [];
  private nextFloatId = 1;

  // Inputs
  private keys: Record<string, boolean> = {};
  private joystickVec = { x: 0, y: 0 };
  private mouseNdc = new THREE.Vector2(0, 0);
  private raycaster = new THREE.Raycaster();
  private groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  private aimWorldPoint = new THREE.Vector3(0, 0, 0);
  private hasMouseMoved = false;

  private hudSyncAccum = 0;
  private fireworkAccum = 0;
  private menuOrbitAngle = 0.4;

  private unitSphereGeo = new THREE.SphereGeometry(0.24, 10, 8);
  private ringGeo = new THREE.RingGeometry(0.8, 1.0, 28);
  private fillCircleGeo = new THREE.CircleGeometry(1.0, 28);

  constructor(container: HTMLElement, callbacks: EngineCallbacks) {
    this.container = container;
    this.callbacks = callbacks;
    this.isSoftwareGl = detectSoftwareGl();

    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(container.clientWidth || window.innerWidth, container.clientHeight || window.innerHeight);
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#0a1529');
    this.scene.fog = new THREE.FogExp2('#0a1529', 0.0062);

    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    const w = container.clientWidth || window.innerWidth;
    const h = container.clientHeight || window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(48, w / h, 0.2, 320);
    this.camera.position.set(-28, 32, 46);
    this.camera.lookAt(0, 0, 0);

    const hemi = new THREE.HemisphereLight('#93c5fd', '#1e3a2f', 0.98);
    this.scene.add(hemi);

    const sun = new THREE.DirectionalLight('#fffbeb', 1.72);
    sun.position.set(54, 78, 44);
    if (!this.isSoftwareGl) {
      sun.castShadow = true;
      sun.shadow.mapSize.set(2048, 2048);
      const d = 95;
      sun.shadow.camera.left = -d;
      sun.shadow.camera.right = d;
      sun.shadow.camera.top = d;
      sun.shadow.camera.bottom = -d;
      sun.shadow.camera.near = 5;
      sun.shadow.camera.far = 210;
      sun.shadow.bias = -0.0005;
      sun.shadow.normalBias = 0.02;
    }
    this.scene.add(sun);

    const rim = new THREE.DirectionalLight('#38bdf8', 0.72);
    rim.position.set(-60, 30, -60);
    this.scene.add(rim);

    if (!this.isSoftwareGl) {
      const blueBaseLight = new THREE.PointLight('#38bdf8', 2.4, 52, 1.5);
      blueBaseLight.position.set(ALLIED_BASE_POS[0], 10, ALLIED_BASE_POS[1]);
      const redBaseLight = new THREE.PointLight('#fb7185', 2.4, 52, 1.5);
      redBaseLight.position.set(ENEMY_BASE_POS[0], 10, ENEMY_BASE_POS[1]);
      const lordLight = new THREE.PointLight('#f43f5e', 1.9, 36, 1.6);
      lordLight.position.set(LORD_PIT_POS[0], 9, LORD_PIT_POS[1]);
      this.scene.add(blueBaseLight, redBaseLight, lordLight);
    }

    this.targetReticle = new THREE.Mesh(
      new THREE.RingGeometry(1.15, 1.48, 24),
      new THREE.MeshBasicMaterial({
        color: '#ef4444',
        transparent: true,
        opacity: 0.9,
        side: THREE.DoubleSide,
        depthWrite: false,
      })
    );
    this.targetReticle.rotation.x = -Math.PI / 2;
    this.targetReticle.visible = false;
    this.scene.add(this.targetReticle);

    this.rangeRing = new THREE.Mesh(
      new THREE.RingGeometry(0.98, 1.0, 48),
      new THREE.MeshBasicMaterial({
        color: '#38bdf8',
        transparent: true,
        opacity: 0.16,
        side: THREE.DoubleSide,
        depthWrite: false,
      })
    );
    this.rangeRing.rotation.x = -Math.PI / 2;
    this.rangeRing.visible = false;
    this.scene.add(this.rangeRing);

    this.shadowTex = createContactShadowTexture();
    this.world = buildDawnRealmWorld(this.scene, this.renderer, this.isSoftwareGl);

    if (!this.isSoftwareGl) {
      this.renderer.compile(this.scene, this.camera);
    }

    this.bindEvents();
    this.startLoop();
  }

  private onWebglContextLost = (e: Event) => {
    e.preventDefault();
  };

  private bindEvents() {
    window.addEventListener('resize', this.onResize);
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    this.renderer.domElement.addEventListener('pointermove', this.onPointerMove);
    this.renderer.domElement.addEventListener('pointerdown', this.onPointerDown);
    this.renderer.domElement.addEventListener('wheel', this.onWheel, { passive: false });
    this.renderer.domElement.addEventListener('contextmenu', this.onContextMenu);
    this.renderer.domElement.addEventListener('webglcontextlost', this.onWebglContextLost);
    window.addEventListener('pointerup', this.onPointerUp);
  }

  private onContextMenu = (e: MouseEvent) => {
    if (this.mode === 'playing') e.preventDefault();
  };

  private onWheel = (e: WheelEvent) => {
    if (this.mode !== 'playing') return;
    e.preventDefault();
    this.adjustCameraZoom(e.deltaY > 0 ? 0.08 : -0.08);
  };

  public adjustCameraZoom(delta: number) {
    this.cameraZoom = THREE.MathUtils.clamp(this.cameraZoom + delta, 0.72, 1.52);
    this.pushHudSnapshot();
  }

  public adjustCameraYaw(delta: number) {
    this.cameraYawOffset += delta;
  }

  private onResize = () => {
    if (!this.container || this.disposed) return;
    const w = this.container.clientWidth || window.innerWidth;
    const h = this.container.clientHeight || window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  };

  private onKeyDown = (e: KeyboardEvent) => {
    this.keys[e.code] = true;
    if (this.mode !== 'playing') return;
    if (e.code === 'KeyQ') this.triggerSkill1();
    else if (e.code === 'KeyE') this.triggerSkill2();
    else if (e.code === 'KeyR') this.triggerUltimate();
    else if (e.code === 'Space') {
      e.preventDefault();
      this.triggerDash();
    } else if (e.code === 'KeyF') this.usePotion();
    else if (e.code === 'Tab') {
      e.preventDefault();
      this.cycleTarget();
    }
  };

  private onKeyUp = (e: KeyboardEvent) => {
    this.keys[e.code] = false;
  };

  private onPointerMove = (e: PointerEvent) => {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouseNdc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouseNdc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    this.hasMouseMoved = true;

    if (this.rightDragging && this.mode === 'playing') {
      const dx = e.clientX - this.rightDragLastX;
      this.rightDragLastX = e.clientX;
      this.cameraYawOffset -= dx * 0.008;
    }
  };

  private onPointerDown = (e: PointerEvent) => {
    if (this.mode !== 'playing') return;
    if (e.button === 2) {
      this.rightDragging = true;
      this.rightDragLastX = e.clientX;
      return;
    }
    if (e.button !== 0) return;
    this.onPointerMove(e);
    this.updateAimFromMouse();
    this.autoAttackHeld = true;
    this.triggerBasicAttack();
  };

  private onPointerUp = (e: PointerEvent) => {
    if (e.button === 2) {
      this.rightDragging = false;
      return;
    }
    this.autoAttackHeld = false;
  };

  public setAutoAttackHeld(held: boolean) {
    this.autoAttackHeld = held;
    if (held && this.mode === 'playing') {
      this.triggerBasicAttack();
    }
  }

  private updateAimFromMouse() {
    if (!this.hasMouseMoved) return;
    this.raycaster.setFromCamera(this.mouseNdc, this.camera);
    this.raycaster.ray.intersectPlane(this.groundPlane, this.aimWorldPoint);
  }

  public setJoystickVector(x: number, y: number) {
    this.joystickVec.x = x;
    this.joystickVec.y = y;
    if (Math.hypot(x, y) > 0.1) {
      this.chaseGoalActive = false;
    }
  }

  public toggleTargetLock(): boolean {
    this.targetLocked = !this.targetLocked;
    soundEngine.playTargetLock();
    if (this.targetLocked) {
      this.cycleTarget();
    } else {
      this.lockedTargetId = null;
    }
    this.pushHudSnapshot();
    return this.targetLocked;
  }

  public cycleTarget() {
    const candidates = this.getAllTargetCandidates(42);
    if (candidates.length === 0) {
      this.lockedTargetId = null;
      this.targetLocked = false;
      return;
    }
    soundEngine.playTargetLock();
    this.targetLocked = true;
    const idx = candidates.findIndex((c) => c.id === this.lockedTargetId);
    const next = candidates[(idx + 1) % candidates.length];
    this.lockedTargetId = next.id;
    this.showCombatAlert(`Sasaran Dikunci: ${next.name}`, 2.0);
    this.pushHudSnapshot();
  }

  public toggleAutoChase(): boolean {
    this.autoChase = !this.autoChase;
    if (!this.autoChase) this.chaseGoalActive = false;
    soundEngine.playUiClick();
    this.pushHudSnapshot();
    return this.autoChase;
  }

  public setMode(mode: 'menu' | 'playing' | 'paused' | 'victory' | 'defeat') {
    this.mode = mode;
    this.autoAttackHeld = false;
    if (mode === 'menu') {
      this.clearBattlefieldEntities();
    }
  }

  public startNewGame(
    hero: HeroDefinition,
    blueTeamSlots?: BalancedTeamSlot[],
    redTeamSlots?: BalancedTeamSlot[]
  ) {
    this.clearBattlefieldEntities();
    this.heroDef = hero;
    this.gameTimeSec = 0;

    this.playerX = PLAYER_SPAWN[0];
    this.playerZ = PLAYER_SPAWN[1];
    this.playerYaw = Math.PI * 0.25;
    this.playerRespawnTimer = 0;

    this.playerLevel = 1;
    this.playerXp = 0;
    this.playerXpToNext = 100;
    this.playerGold = 180;
    this.totalGoldEarned = 180;
    this.playerShards = 0;
    this.playerPotions = 3;
    this.equippedItemIds = [];
    this.dismissedItemIds.clear();

    this.passiveStacks = 0;
    this.passiveTimer = 0;
    this.skillComboCounter = 0;
    this.hitCounter = 0;
    this.emergencySaveCd = 0;
    this.cecilionBonus = 0;
    this.buffTimer = 0;
    this.redBuffTimer = 0;
    this.blueBuffTimer = 0;
    this.turtleBuffTimer = 0;
    this.playerShield = 0;
    this.playerShieldTimer = 0;
    this.invulnTimer = 0;
    this.dashTimer = 0;
    this.dashSpeed = 26;
    this.cdBasic = 0;
    this.cdSkill1 = 0;
    this.cdSkill2 = 0;
    this.cdUltimate = 0;
    this.cdDash = 0;
    this.autoAttackHeld = false;
    this.chaseGoalActive = false;
    this.lockedTargetId = null;
    this.targetLocked = false;
    this.cameraZoom = 1.05;
    this.cameraYawOffset = 0;
    this.lordIntroTimer = 0;
    this.lordFootstepAccum = 0;
    this.baseAttackAlertCooldown = 0;

    this.recomputeStats(true);

    this.defeatedEnemiesCount = 0;
    this.enemyMaxLevel = 1;
    this.blueTeamCards = 0;
    this.redTeamCards = 0;
    this.blueTeamKills = 0;
    this.redTeamKills = 0;
    this.firstKillTriggered = false;
    this.killFeed = [];
    this.nextKillFeedId = 1;
    this.nextCardRewardId = 1;
    this.matchResult = null;
    this.collectedCardIds.clear();
    this.unlockedAchievements.clear();
    this.combatAlert = null;
    this.floatingTexts = [];

    this.playerRig = buildCharacterRig({
      role: hero.roleId,
      primaryColor: hero.appearance.primaryColor,
      secondaryColor: hero.appearance.secondaryColor,
      accentColor: hero.appearance.accentColor,
      weaponStyle: hero.appearance.weaponStyle,
      headgear: hero.appearance.headgear,
      bodyVariant: hero.appearance.bodyVariant,
      scale: 1.1,
    });
    this.playerRig.root.position.set(this.playerX, groundHeightAt(this.playerX, this.playerZ), this.playerZ);
    this.playerRig.root.rotation.y = this.playerYaw;
    this.scene.add(this.playerRig.root);

    this.playerShadow = new THREE.Mesh(
      new THREE.PlaneGeometry(2.2, 2.2),
      new THREE.MeshBasicMaterial({ map: this.shadowTex, transparent: true, opacity: 0.55, depthWrite: false })
    );
    this.playerShadow.rotation.x = -Math.PI / 2;
    this.scene.add(this.playerShadow);

    this.rangeRing.visible = true;
    this.rangeRing.scale.setScalar(this.attackRange);

    // Build MOBA structures: Bases, 12 Turrets, Jungle Camps, and exact 5v5 Hero Teams
    this.spawnBasesAndTurrets();
    this.spawnJungleCamps();

    const composed =
      blueTeamSlots && redTeamSlots
        ? { blueTeam: blueTeamSlots, redTeam: redTeamSlots }
        : compose5v5Teams(hero);
    this.init5v5Teams(composed.blueTeam, composed.redTeam);

    this.minionWaveTimer = 1.2;
    this.waveCounter = 0;

    // Reset Lord Sanctuary Pit (first spawn at 30s)
    this.lordPit = {
      rig: null,
      shadow: null,
      x: LORD_PIT_POS[0],
      z: LORD_PIT_POS[1],
      yaw: 0,
      hp: THE_LORD_BOSS.maxHp,
      maxHp: THE_LORD_BOSS.maxHp,
      alive: false,
      respawnTimer: 30,
      attackTimer: 1.0,
      abilityTimer: 3.8,
      attackAnimTimer: 0,
      slowTimer: 0,
      inCombat: false,
    };

    this.camera.position.set(this.playerX - 8, 24, this.playerZ + 22);
    this.camera.lookAt(this.playerX, 1, this.playerZ);

    this.mode = 'playing';
    soundEngine.playAnnouncer('welcome');
    this.showCombatAlert('PERTEMPURAN 5V5 BERMULA! TEWASKAN HERO MUSUH UNTUK KAD KATA ADJEKTIF!', 4.2);
    this.pushHudSnapshot();
  }

  private recomputeStats(healToFull = false) {
    if (!this.heroDef) return;
    const h = this.heroDef.baseStats;
    const lvlBonus = this.playerLevel - 1;

    let itemDmg = 0;
    let itemHp = 0;
    let itemDef = 0;
    let itemSpd = 0;
    let itemAtkSpd = 0;
    let itemCrit = 0;
    let itemLifesteal = 0;
    let itemSkill = 0;
    let itemCd = 0;
    let itemRegen = 0;
    let itemGoldBonus = 0;
    let itemArmorPen = 0;

    for (const id of this.equippedItemIds) {
      const it = SHOP_ITEMS.find((s) => s.id === id);
      if (!it) continue;
      itemDmg += it.stats.damage || 0;
      itemHp += it.stats.hp || 0;
      itemDef += it.stats.defense || 0;
      itemSpd += it.stats.speed || 0;
      itemAtkSpd += it.stats.attackSpeed || 0;
      itemCrit += it.stats.critChance || 0;
      itemLifesteal += it.stats.lifesteal || 0;
      itemSkill += it.stats.skillPower || 0;
      itemCd += it.stats.cooldownReduce || 0;
      itemRegen += it.stats.regenPerSec || 0;
      itemGoldBonus += it.stats.goldBonus || 0;
      itemArmorPen += it.stats.armorPen || 0;
    }

    const hid = this.heroDef.id;
    const heroSkillPassive =
      ['eudora', 'pharsa', 'kagura', 'valir', 'aurora', 'yve', 'luoyi'].includes(hid) ? 0.18 : 0;
    const heroAtkSpdPassive = ['zilong', 'fanny', 'karrie', 'ixia', 'helcurt'].includes(hid) ? 0.12 : 0;
    const heroCritPassive = ['saber', 'granger', 'lancelot', 'bruno', 'clint', 'natalia'].includes(hid) ? 0.14 : 0;
    const heroLifestealPassive =
      hid === 'alucard' || hid === 'ruby' ? 0.18 : ['guinevere', 'yuzhong', 'dyrroth', 'ixia'].includes(hid) ? 0.1 : 0;
    const heroRegenPassive =
      hid === 'estes' || hid === 'hylos' ? 6 : ['angela', 'fredrinn', 'khufra'].includes(hid) ? 4 : 0;
    const laylaRangeBonus = hid === 'layla' ? lvlBonus * 1.1 : 0;
    const armorPenPassive = ['saber', 'gusion', 'dyrroth', 'karrie'].includes(hid) ? 0.16 : 0;

    const prevMax = this.playerMaxHp;
    this.playerMaxHp = Math.round(h.hp + lvlBonus * 58 + itemHp);
    if (healToFull) {
      this.playerHp = this.playerMaxHp;
    } else if (this.playerMaxHp > prevMax) {
      this.playerHp = Math.min(this.playerMaxHp, this.playerHp + (this.playerMaxHp - prevMax));
    }

    const baseRoleMana =
      this.heroDef.roleId === 'mage' || this.heroDef.roleId === 'support'
        ? 440
        : this.heroDef.roleId === 'marksman' || this.heroDef.roleId === 'assassin'
          ? 320
          : 280;
    const prevMaxMana = this.playerMaxMana;
    this.playerMaxMana = Math.round(baseRoleMana + lvlBonus * 26 + itemSkill * 240);
    if (healToFull) {
      this.playerMana = this.playerMaxMana;
    } else if (this.playerMaxMana > prevMaxMana) {
      this.playerMana = Math.min(this.playerMaxMana, this.playerMana + (this.playerMaxMana - prevMaxMana));
    }
    this.manaRegenPerSec = 16 + lvlBonus * 1.1 + (this.blueBuffTimer > 0 ? 18 : 0);

    this.baseDamage = Math.round(h.damage + lvlBonus * 6.0 + itemDmg + this.cecilionBonus);
    this.baseDefense = Math.round(h.defense + lvlBonus * 2.4 + itemDef);
    this.baseSpeed = h.speed + itemSpd;
    this.attackRange = h.attackRange + laylaRangeBonus;
    this.baseAttackCooldown = h.attackCooldown;
    this.skillPowerBonus = itemSkill + heroSkillPassive;
    this.cooldownReduce = Math.min(0.5, itemCd + (this.blueBuffTimer > 0 ? 0.15 : 0));
    this.attackSpeedBonus = itemAtkSpd + heroAtkSpdPassive;
    this.critChance = Math.min(0.8, itemCrit + heroCritPassive);
    this.lifesteal = Math.min(0.55, itemLifesteal + heroLifestealPassive);
    this.regenPerSec = itemRegen + heroRegenPassive + (this.blueBuffTimer > 0 ? 5 : 0);
    this.goldBonus = itemGoldBonus;
    this.armorPen = Math.min(0.35, itemArmorPen + armorPenPassive);

    this.rangeRing.scale.setScalar(this.attackRange);
  }

  public dismissRecommendedItem(itemId: string) {
    this.dismissedItemIds.add(itemId);
    soundEngine.playUiClick();
    this.pushHudSnapshot();
  }

  private getRecommendedItem(): ShopItemDef | null {
    if (!this.heroDef || this.equippedItemIds.length >= 6) return null;
    const rolePool = SHOP_ITEMS.filter(
      (item) =>
        !item.consumable &&
        item.recommendedRoles.includes(this.heroDef!.roleId) &&
        !this.equippedItemIds.includes(item.id) &&
        !this.dismissedItemIds.has(item.id)
    );
    const pool =
      rolePool.length > 0
        ? rolePool
        : SHOP_ITEMS.filter(
            (item) =>
              !item.consumable &&
              !this.equippedItemIds.includes(item.id) &&
              !this.dismissedItemIds.has(item.id)
          );
    if (pool.length === 0) return null;

    const affordable = pool.filter((item) => this.playerGold >= item.price);
    if (affordable.length > 0) {
      affordable.sort((a, b) => b.price - a.price);
      return affordable[0];
    }

    // Show the cheapest upcoming build item so player can see price & stat benefits in the side panel
    const upcoming = [...pool].sort((a, b) => a.price - b.price);
    return upcoming[0];
  }

  public buyItem(itemId: string): boolean {
    const item = SHOP_ITEMS.find((s) => s.id === itemId);
    if (!item || this.playerGold < item.price) return false;

    if (item.consumable) {
      if (this.playerPotions >= 6) return false;
      this.playerGold -= item.price;
      this.playerPotions += 1;
      soundEngine.playItemBuy();
      this.spawnFloatingText(this.playerX, 2.5, this.playerZ, '+1 Posyen!', '#34d399');
      this.pushHudSnapshot();
      return true;
    }

    if (this.equippedItemIds.length >= 6) return false;
    this.playerGold -= item.price;
    this.equippedItemIds.push(item.id);
    this.recomputeStats(false);
    if (item.stats.hp) {
      this.playerHp = Math.min(this.playerMaxHp, this.playerHp + item.stats.hp);
    }
    soundEngine.playItemBuy();
    this.spawnBurst(this.playerX, 1.4, this.playerZ, item.color, 16);
    this.spawnFloatingText(this.playerX, 2.7, this.playerZ, `${item.name}!`, '#fbbf24');
    this.pushHudSnapshot();
    return true;
  }

  public sellItem(slotIndex: number): boolean {
    if (slotIndex < 0 || slotIndex >= this.equippedItemIds.length) return false;
    const id = this.equippedItemIds[slotIndex];
    const item = SHOP_ITEMS.find((s) => s.id === id);
    if (!item) return false;
    this.equippedItemIds.splice(slotIndex, 1);
    const refund = Math.round(item.price * 0.6);
    this.playerGold += refund;
    this.recomputeStats(false);
    this.playerHp = Math.min(this.playerHp, this.playerMaxHp);
    soundEngine.playGold();
    this.pushHudSnapshot();
    return true;
  }

  public usePotion() {
    if (this.mode !== 'playing' || this.playerPotions <= 0 || this.playerHp >= this.playerMaxHp || this.playerRespawnTimer > 0) return;
    this.playerPotions -= 1;
    const heal = Math.round(this.playerMaxHp * 0.45);
    this.playerHp = Math.min(this.playerMaxHp, this.playerHp + heal);
    soundEngine.playHeal();
    this.spawnBurst(this.playerX, 1.2, this.playerZ, '#34d399', 18);
    this.spawnFloatingText(this.playerX, 2.2, this.playerZ, `+${heal} HP`, '#34d399');
    this.pushHudSnapshot();
  }

  private clearBattlefieldEntities() {
    if (this.playerRig) {
      this.scene.remove(this.playerRig.root);
      disposeObject3D(this.playerRig.root);
      this.playerRig = null;
    }
    if (this.playerShadow) {
      this.scene.remove(this.playerShadow);
      disposeObject3D(this.playerShadow);
      this.playerShadow = null;
    }
    this.targetReticle.visible = false;
    this.rangeRing.visible = false;

    this.alliedHeroes.forEach((ah) => {
      this.scene.remove(ah.rig.root, ah.shadow);
      disposeObject3D(ah.rig.root);
      disposeObject3D(ah.shadow);
    });
    this.alliedHeroes = [];

    this.enemyHeroes.forEach((eh) => {
      this.scene.remove(eh.rig.root, eh.shadow);
      disposeObject3D(eh.rig.root);
      disposeObject3D(eh.shadow);
    });
    this.enemyHeroes = [];
    this.heroRecords.clear();
    this.heroOrderIds = [];

    this.minions.forEach((m) => {
      this.scene.remove(m.mesh);
      disposeObject3D(m.mesh);
    });
    this.minions = [];

    this.turrets.forEach((t) => {
      this.scene.remove(t.group);
      disposeObject3D(t.group);
    });
    this.turrets = [];

    if (this.alliedBase) {
      this.scene.remove(this.alliedBase.group);
      disposeObject3D(this.alliedBase.group);
      this.alliedBase = null;
    }
    if (this.enemyBase) {
      this.scene.remove(this.enemyBase.group);
      disposeObject3D(this.enemyBase.group);
      this.enemyBase = null;
    }

    if (this.lordPit.rig) {
      this.scene.remove(this.lordPit.rig.root);
      disposeObject3D(this.lordPit.rig.root);
      this.lordPit.rig = null;
    }
    if (this.lordPit.shadow) {
      this.scene.remove(this.lordPit.shadow);
      disposeObject3D(this.lordPit.shadow);
      this.lordPit.shadow = null;
    }
    if (this.alliedLord) {
      this.scene.remove(this.alliedLord.rig.root, this.alliedLord.shadow);
      disposeObject3D(this.alliedLord.rig.root);
      disposeObject3D(this.alliedLord.shadow);
      this.alliedLord = null;
    }

    this.jungleCamps.forEach((c) => {
      this.scene.remove(c.mesh);
      disposeObject3D(c.mesh);
    });
    this.jungleCamps = [];

    this.pickupOrbs.forEach((o) => {
      this.scene.remove(o.mesh);
      disposeObject3D(o.mesh);
    });
    this.pickupOrbs = [];

    this.projectiles.forEach((p) => {
      this.scene.remove(p.mesh);
      (p.mesh.material as THREE.Material).dispose();
    });
    this.projectiles = [];

    this.shockwaves.forEach((s) => {
      this.scene.remove(s.mesh);
      (s.mesh.material as THREE.Material).dispose();
    });
    this.shockwaves = [];

    this.bursts.forEach((b) => {
      this.scene.remove(b.points);
      b.points.geometry.dispose();
      (b.points.material as THREE.Material).dispose();
    });
    this.bursts = [];

    this.telegraphs.forEach((t) => {
      this.scene.remove(t.mesh, t.innerMesh);
      (t.mesh.material as THREE.Material).dispose();
      (t.innerMesh.material as THREE.Material).dispose();
    });
    this.telegraphs = [];

    this.steelCables.forEach((sc) => {
      this.scene.remove(sc.line);
      sc.line.geometry.dispose();
      (sc.line.material as THREE.Material).dispose();
    });
    this.steelCables = [];
  }

  private spawnBasesAndTurrets() {
    const allyMesh = buildBaseNexusMesh('ally');
    allyMesh.group.position.set(ALLIED_BASE_POS[0], groundHeightAt(ALLIED_BASE_POS[0], ALLIED_BASE_POS[1]), ALLIED_BASE_POS[1]);
    this.scene.add(allyMesh.group);
    this.alliedBase = {
      team: 'ally',
      x: ALLIED_BASE_POS[0],
      z: ALLIED_BASE_POS[1],
      hp: BASE_MAX_HP,
      maxHp: BASE_MAX_HP,
      group: allyMesh.group,
      coreCrystal: allyMesh.coreCrystal,
      vulnerable: true,
      attackTimer: 0,
    };

    const enemyMesh = buildBaseNexusMesh('enemy');
    enemyMesh.group.position.set(ENEMY_BASE_POS[0], groundHeightAt(ENEMY_BASE_POS[0], ENEMY_BASE_POS[1]), ENEMY_BASE_POS[1]);
    this.scene.add(enemyMesh.group);
    this.enemyBase = {
      team: 'enemy',
      x: ENEMY_BASE_POS[0],
      z: ENEMY_BASE_POS[1],
      hp: BASE_MAX_HP,
      maxHp: BASE_MAX_HP,
      group: enemyMesh.group,
      coreCrystal: enemyMesh.coreCrystal,
      shieldDome: enemyMesh.shieldDome,
      vulnerable: false,
      attackTimer: 0,
    };

    TURRET_DEFS.forEach((def) => {
      const built = buildTurretMesh(def.team);
      const gy = groundHeightAt(def.pos[0], def.pos[1]);
      built.group.position.set(def.pos[0], gy, def.pos[1]);
      this.scene.add(built.group);
      this.turrets.push({
        def,
        group: built.group,
        crystal: built.crystal,
        rangeRing: built.rangeRing,
        shieldDome: built.shieldDome,
        shieldRing: built.shieldRing,
        hp: def.maxHp,
        maxHp: def.maxHp,
        shield: def.maxShield,
        maxShield: def.maxShield,
        shieldFlashTimer: 0,
        crystalRecoil: 0,
        alive: true,
        attackTimer: 0.8,
      });
    });
  }

  private spawnJungleCamps() {
    JUNGLE_CAMPS.forEach((def) => {
      const mesh = buildJungleMonsterMesh(def.type, def.color, def.scale);
      const gy = groundHeightAt(def.pos[0], def.pos[1]);
      mesh.position.set(def.pos[0], gy, def.pos[1]);
      this.scene.add(mesh);

      this.jungleCamps.push({
        def,
        mesh,
        x: def.pos[0],
        z: def.pos[1],
        hp: def.maxHp,
        maxHp: def.maxHp,
        alive: true,
        respawnTimer: 0,
        attackTimer: 1.0,
        aggro: false,
      });
    });
  }

  private createMatchRecord(
    id: string,
    heroDef: HeroDefinition,
    team: TeamSide,
    isPlayer: boolean,
    lane: LaneId | 'roam'
  ): HeroMatchRecord {
    return {
      id,
      heroDef,
      team,
      isPlayer,
      lane,
      level: 1,
      kills: 0,
      deaths: 0,
      assists: 0,
      cardsEarned: 0,
      gold: 180,
      items: [],
      damageDealt: 0,
      objectiveDamage: 0,
      healingDone: 0,
      killStreak: 0,
      lastKillTime: -99,
      multiKillCount: 0,
      recentDamagers: new Map(),
      recentSupportBy: new Map(),
    };
  }

  private getAiSpawnPos(team: TeamSide, assignedLane: LaneId | 'roam', slotIndex: number): [number, number] {
    const base = team === 'blue' ? ALLIED_BASE_POS : ENEMY_BASE_POS;
    const dir = team === 'blue' ? 1 : -1;
    const laneOffset: Record<LaneId | 'roam', [number, number]> = {
      exp: [dir * 10, dir * -22],
      mid: [dir * 15, dir * -15],
      gold: [dir * 22, dir * -10],
      roam: [dir * 11, dir * -12],
    };
    const off = laneOffset[assignedLane];
    return [base[0] + off[0] + (slotIndex % 2) * 2.5, base[1] + off[1] - (slotIndex % 2) * 2.5];
  }

  private init5v5Teams(blueTeamSlots: BalancedTeamSlot[], redTeamSlots: BalancedTeamSlot[]) {
    if (!this.heroDef) return;

    this.heroOrderIds = ['player'];
    this.heroRecords.set('player', this.createMatchRecord('player', this.heroDef, 'blue', true, 'mid'));

    // 4 Allied AI Heroes (Blue Team)
    blueTeamSlots
      .filter((s) => !s.isPlayer)
      .forEach((slot, idx) => {
        const id = `blue_ai_${idx}`;
        const ai = this.createAiHeroState(id, 'blue', idx, slot.lane, slot.hero);
        this.alliedHeroes.push(ai);
        this.heroOrderIds.push(id);
        this.heroRecords.set(id, this.createMatchRecord(id, slot.hero, 'blue', false, slot.lane));
      });

    // 5 Enemy AI Heroes (Red Team)
    redTeamSlots.forEach((slot, idx) => {
      const id = `red_ai_${idx}`;
      const ai = this.createAiHeroState(id, 'red', idx, slot.lane, slot.hero);
      this.enemyHeroes.push(ai);
      this.heroOrderIds.push(id);
      this.heroRecords.set(id, this.createMatchRecord(id, slot.hero, 'red', false, slot.lane));
    });
  }

  private createAiHeroState(
    id: string,
    team: TeamSide,
    slotIndex: number,
    assignedLane: LaneId | 'roam',
    heroDef: HeroDefinition
  ): AiHeroState {
    const lane: LaneId = assignedLane === 'roam' ? 'mid' : assignedLane;
    const spawnPos = this.getAiSpawnPos(team, assignedLane, slotIndex);
    const wps = LANE_WAYPOINTS[lane];
    const waypointIdx = team === 'blue' ? 1 : Math.max(0, wps.length - 2);
    const rig = buildCharacterRig({
      role: heroDef.roleId,
      primaryColor: heroDef.appearance.primaryColor,
      secondaryColor: heroDef.appearance.secondaryColor,
      accentColor: heroDef.appearance.accentColor,
      weaponStyle: heroDef.appearance.weaponStyle,
      headgear: heroDef.appearance.headgear,
      bodyVariant: heroDef.appearance.bodyVariant,
      scale: 1.05,
      isEnemy: team === 'red',
    });
    const shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(2.1, 2.1),
      new THREE.MeshBasicMaterial({ map: this.shadowTex, transparent: true, opacity: 0.52, depthWrite: false })
    );
    shadow.rotation.x = -Math.PI / 2;
    rig.root.position.set(spawnPos[0], groundHeightAt(spawnPos[0], spawnPos[1]), spawnPos[1]);
    this.scene.add(rig.root, shadow);

    const state: AiHeroState = {
      id,
      team,
      slotIndex,
      assignedLane,
      lane,
      waypointIdx,
      heroDef,
      rig,
      shadow,
      x: spawnPos[0],
      z: spawnPos[1],
      yaw: team === 'blue' ? Math.PI * 0.25 : -Math.PI * 0.75,
      hp: heroDef.baseStats.hp,
      maxHp: heroDef.baseStats.hp,
      mana: 300,
      maxMana: 300,
      shield: 0,
      shieldTimer: 0,
      level: 1,
      xp: 0,
      xpToNext: 100,
      gold: 180,
      items: [],
      damage: heroDef.baseStats.damage,
      defense: heroDef.baseStats.defense,
      speed: heroDef.baseStats.speed * 0.9,
      attackRange: heroDef.baseStats.attackRange,
      attackInterval: Math.max(0.55, heroDef.baseStats.attackCooldown * 1.35),
      abilityCooldown: Math.max(5.5, heroDef.skills.skill1.cooldown * 1.15),
      attackTimer: 0.8 + slotIndex * 0.15,
      abilityTimer: 3.5 + slotIndex * 0.6,
      skill2Timer: 6.0 + slotIndex * 0.7,
      attackAnimTimer: 0,
      slowTimer: 0,
      buffTimer: 0,
      retreating: false,
      alive: true,
      respawnTimer: 0,
      inCombat: false,
    };
    this.recomputeAiStats(state, true);
    return state;
  }

  private recomputeAiStats(ai: AiHeroState, healToFull = false) {
    const h = ai.heroDef.baseStats;
    const lvl = ai.level - 1;
    let itemDmg = 0;
    let itemHp = 0;
    let itemDef = 0;
    let itemSpd = 0;
    let itemAtkSpd = 0;

    for (const itemId of ai.items) {
      const it = SHOP_ITEMS.find((s) => s.id === itemId);
      if (!it) continue;
      itemDmg += it.stats.damage || 0;
      itemHp += it.stats.hp || 0;
      itemDef += it.stats.defense || 0;
      itemSpd += it.stats.speed || 0;
      itemAtkSpd += it.stats.attackSpeed || 0;
    }

    const prevMax = ai.maxHp;
    ai.maxHp = Math.round(h.hp * 0.92 + lvl * 54 + itemHp);
    if (healToFull) {
      ai.hp = ai.maxHp;
    } else if (ai.maxHp > prevMax) {
      ai.hp = Math.min(ai.maxHp, ai.hp + (ai.maxHp - prevMax));
    }

    const aiBaseMana =
      ai.heroDef.roleId === 'mage' || ai.heroDef.roleId === 'support' ? 420 : 300;
    ai.maxMana = Math.round(aiBaseMana + lvl * 22);
    if (healToFull) ai.mana = ai.maxMana;

    ai.damage = Math.round(h.damage * 0.84 + lvl * 5.2 + itemDmg);
    ai.defense = Math.round(h.defense + lvl * 2.2 + itemDef);
    ai.speed = Math.min(12.2, h.speed * 0.88 + itemSpd * 0.85);
    ai.attackRange = h.attackRange;
    ai.attackInterval = Math.max(0.45, (h.attackCooldown * 1.38) / (1 + itemAtkSpd));
  }

  private tryAiBuyItem(ai: AiHeroState) {
    if (ai.items.length >= 6) return;
    const candidates = SHOP_ITEMS.filter(
      (it) =>
        !it.consumable &&
        it.recommendedRoles.includes(ai.heroDef.roleId) &&
        !ai.items.includes(it.id) &&
        ai.gold >= it.price
    );
    if (candidates.length === 0) return;
    candidates.sort((a, b) => b.price - a.price);
    const chosen = candidates[0];
    ai.gold -= chosen.price;
    ai.items.push(chosen.id);
    this.recomputeAiStats(ai, false);
    const rec = this.heroRecords.get(ai.id);
    if (rec) {
      rec.items = [...ai.items];
      rec.gold = Math.floor(ai.gold);
    }
  }

  private awardAiXpAndGold(ai: AiHeroState, xp: number, gold: number) {
    ai.xp += xp;
    ai.gold += gold;
    while (ai.xp >= ai.xpToNext) {
      ai.xp -= ai.xpToNext;
      ai.level = Math.min(15, ai.level + 1);
      ai.xpToNext = Math.round(ai.xpToNext * 1.28);
      this.recomputeAiStats(ai, false);
      ai.hp = Math.min(ai.maxHp, ai.hp + Math.round(ai.maxHp * 0.3));
    }
    this.tryAiBuyItem(ai);
    const rec = this.heroRecords.get(ai.id);
    if (rec) {
      rec.level = ai.level;
      rec.gold = Math.floor(ai.gold);
      rec.items = [...ai.items];
    }
  }

  private respawnAiHero(ai: AiHeroState) {
    const spawnPos = this.getAiSpawnPos(ai.team, ai.assignedLane, ai.slotIndex);
    const wps = LANE_WAYPOINTS[ai.lane];
    ai.x = spawnPos[0];
    ai.z = spawnPos[1];
    ai.waypointIdx = ai.team === 'blue' ? 1 : Math.max(0, wps.length - 2);
    ai.hp = ai.maxHp;
    ai.mana = ai.maxMana;
    ai.shield = 0;
    ai.retreating = false;
    ai.alive = true;
    ai.inCombat = false;
    ai.attackTimer = 0.8;
    ai.abilityTimer = 2.5;
    ai.rig.root.position.set(ai.x, groundHeightAt(ai.x, ai.z), ai.z);
    ai.rig.root.visible = true;
    ai.shadow.visible = true;
    this.spawnBurst(ai.x, 1.4, ai.z, ai.team === 'blue' ? '#38bdf8' : '#ef4444', 18);
  }

  private recordHeroDamage(attackerHeroId: string | undefined, victimHeroId: string, dealt: number) {
    if (!attackerHeroId || attackerHeroId === victimHeroId) return;
    const attRec = this.heroRecords.get(attackerHeroId);
    const vicRec = this.heroRecords.get(victimHeroId);
    if (!attRec || !vicRec || attRec.team === vicRec.team) return;
    attRec.damageDealt += dealt;
    vicRec.recentDamagers.set(attackerHeroId, this.gameTimeSec);
  }

  private recordHeroSupport(supporterId: string, allyHeroId: string, healAmt: number) {
    if (supporterId === allyHeroId) return;
    const supRec = this.heroRecords.get(supporterId);
    const allyRec = this.heroRecords.get(allyHeroId);
    if (!supRec || !allyRec || supRec.team !== allyRec.team) return;
    supRec.healingDone += healAmt;
    allyRec.recentSupportBy.set(supporterId, this.gameTimeSec);
  }

  private handleHeroKill(killerHeroId: string | undefined, victimHeroId: string, kx: number, kz: number) {
    const vicRec = this.heroRecords.get(victimHeroId);
    if (!vicRec) return;

    vicRec.deaths += 1;
    vicRec.killStreak = 0;
    vicRec.multiKillCount = 0;

    let resolvedKillerId = killerHeroId;
    if (!resolvedKillerId) {
      let bestTime = -1;
      vicRec.recentDamagers.forEach((t, damagerId) => {
        if (this.gameTimeSec - t <= 10 && t > bestTime) {
          bestTime = t;
          resolvedKillerId = damagerId;
        }
      });
    }

    const killerRec = resolvedKillerId ? this.heroRecords.get(resolvedKillerId) : undefined;
    const assistIds: string[] = [];

    if (killerRec) {
      killerRec.kills += 1;
      killerRec.killStreak += 1;
      if (this.gameTimeSec - killerRec.lastKillTime <= 10) {
        killerRec.multiKillCount += 1;
      } else {
        killerRec.multiKillCount = 1;
      }
      killerRec.lastKillTime = this.gameTimeSec;

      // Every hero kill grants +1 random Kata Adjektif card to killer + team score!
      const awardedCard = pickRandomAdjectiveCard();
      killerRec.cardsEarned += 1;
      if (killerRec.team === 'blue') {
        this.blueTeamCards += 1;
        this.blueTeamKills += 1;
      } else {
        this.redTeamCards += 1;
        this.redTeamKills += 1;
      }

      if (killerRec.isPlayer) {
        this.defeatedEnemiesCount += 1;
        this.collectedCardIds.add(awardedCard.id);
        soundEngine.playCardCollect();
        this.callbacks.onCardCollected(awardedCard);
        if (this.collectedCardIds.size >= 5) this.unlockAchievement('collector_five');
        if (this.collectedCardIds.size >= 10) this.unlockAchievement('language_expert');
        this.unlockAchievement('first_blood');
        this.awardXpAndGold(125 + vicRec.level * 22, 165 + vicRec.level * 15, 2);
        this.callbacks.onEnemyDefeated({
          id: vicRec.id,
          name: vicRec.heroDef.name,
          title: vicRec.heroDef.roleLabel,
          archetype: vicRec.heroDef.roleId,
          level: vicRec.level,
          maxHp: 500,
          damage: 45,
          defense: 12,
          speed: 8,
          attackRange: 5,
          attackInterval: 1.2,
          abilityName: vicRec.heroDef.skills.ultimate.name,
          abilityCooldown: 8,
          xpReward: 125,
          goldReward: 165,
          spawnPos: [kx, kz],
          zoneName: vicRec.lane,
          cardId: awardedCard.id,
          primaryColor: vicRec.heroDef.appearance.primaryColor,
          secondaryColor: vicRec.heroDef.appearance.secondaryColor,
          accentColor: vicRec.heroDef.appearance.accentColor,
          weaponStyle: vicRec.heroDef.appearance.weaponStyle,
          headgear: vicRec.heroDef.appearance.headgear,
          bodyVariant: vicRec.heroDef.appearance.bodyVariant,
          scale: 1.05,
        });
      } else {
        const killerAi = [...this.alliedHeroes, ...this.enemyHeroes].find((h) => h.id === killerRec.id);
        if (killerAi) this.awardAiXpAndGold(killerAi, 115 + vicRec.level * 18, 150);
      }

      // Assists: recent enemy damagers + recent healers/supporters of killer
      vicRec.recentDamagers.forEach((t, damagerId) => {
        if (damagerId !== killerRec.id && this.gameTimeSec - t <= 10) {
          const aRec = this.heroRecords.get(damagerId);
          if (aRec && aRec.team === killerRec.team && !assistIds.includes(damagerId)) {
            assistIds.push(damagerId);
          }
        }
      });
      killerRec.recentSupportBy.forEach((t, supId) => {
        if (supId !== killerRec.id && this.gameTimeSec - t <= 8 && !assistIds.includes(supId)) {
          assistIds.push(supId);
        }
      });

      assistIds.forEach((aId) => {
        const aRec = this.heroRecords.get(aId);
        if (!aRec) return;
        aRec.assists += 1;
        if (aRec.isPlayer) {
          this.awardXpAndGold(55, 65, 1, true);
        } else {
          const aAi = [...this.alliedHeroes, ...this.enemyHeroes].find((h) => h.id === aId);
          if (aAi) this.awardAiXpAndGold(aAi, 50, 60);
        }
      });

      const feedEntry: KillFeedItem = {
        id: this.nextKillFeedId++,
        killerName: killerRec.heroDef.name,
        killerTeam: killerRec.team,
        victimName: vicRec.heroDef.name,
        victimTeam: vicRec.team,
        cardWord: awardedCard.word,
        cardColor: awardedCard.color,
        multiKill: killerRec.multiKillCount,
        timestamp: this.gameTimeSec,
      };
      this.killFeed.unshift(feedEntry);
      if (this.killFeed.length > 5) this.killFeed.pop();

      this.callbacks.onCardReward?.({
        id: this.nextCardRewardId++,
        killerName: killerRec.heroDef.name,
        killerTeam: killerRec.team,
        victimName: vicRec.heroDef.name,
        card: awardedCard,
        multiKill: killerRec.multiKillCount,
        isPlayerKill: killerRec.isPlayer,
      });

      // Announcer calls (English MOBA Voice + First Blood)
      const isFirstBlood = !this.firstKillTriggered;
      this.firstKillTriggered = true;

      if (killerRec.isPlayer) {
        soundEngine.playEnemyDefeat();
        this.playerMana = Math.min(this.playerMaxMana, this.playerMana + this.playerMaxMana * 0.3);
        if (isFirstBlood) soundEngine.playAnnouncer('first_blood');
        else if (killerRec.killStreak >= 5) soundEngine.playAnnouncer('legendary');
        else if (killerRec.multiKillCount >= 4) soundEngine.playAnnouncer('maniac');
        else if (killerRec.multiKillCount === 3) soundEngine.playAnnouncer('triple_kill');
        else if (killerRec.multiKillCount === 2) soundEngine.playAnnouncer('double_kill');
        else soundEngine.playAnnouncer('enemy_defeated');
      } else if (vicRec.isPlayer) {
        soundEngine.playAnnouncer(isFirstBlood ? 'first_blood' : 'player_killed');
      } else if (isFirstBlood) {
        soundEngine.playAnnouncer('first_blood');
      } else if (killerRec.team === 'blue') {
        soundEngine.playAnnouncer('ally_killed_enemy');
      } else if (killerRec.killStreak >= 3) {
        soundEngine.playAnnouncer('enemy_dominating');
      } else {
        soundEngine.playAnnouncer('ally_defeated');
      }

      if (this.blueTeamCards >= this.redTeamCards + 3 && killerRec.team === 'blue') {
        soundEngine.playAnnouncer('blue_leading');
      } else if (this.redTeamCards >= this.blueTeamCards + 3 && killerRec.team === 'red') {
        soundEngine.playAnnouncer('red_leading');
      }

      const alertLabel = isFirstBlood
        ? `FIRST BLOOD! ${killerRec.heroDef.name.toUpperCase()} SLAIN ${vicRec.heroDef.name.toUpperCase()}!`
        : killerRec.isPlayer
          ? killerRec.killStreak >= 5
            ? 'LEGENDARY! YOU HAVE SLAIN AN ENEMY!'
            : killerRec.multiKillCount >= 4
              ? 'MANIAC! YOU HAVE SLAIN AN ENEMY!'
              : killerRec.multiKillCount === 3
                ? 'TRIPLE KILL! YOU HAVE SLAIN AN ENEMY!'
                : killerRec.multiKillCount === 2
                  ? 'DOUBLE KILL! YOU HAVE SLAIN AN ENEMY!'
                  : 'YOU HAVE SLAIN AN ENEMY!'
          : vicRec.isPlayer
            ? 'YOU HAVE BEEN SLAIN!'
            : killerRec.team === 'blue'
              ? 'AN ENEMY HAS BEEN SLAIN!'
              : 'AN ALLY HAS BEEN SLAIN!';

      this.showCombatAlert(alertLabel, 2.7);
    } else {
      // Executed / turret / minion kill without hero credit still increments enemy team score cleanly
      if (vicRec.team === 'red') this.blueTeamKills += 1;
      else this.redTeamKills += 1;
    }

    vicRec.recentDamagers.clear();
    vicRec.recentSupportBy.clear();
  }

  private showCombatAlert(msg: string, duration = 3.2) {
    this.combatAlert = msg;
    this.combatAlertTimer = duration;
  }

  // --- AUTOMATIC TARGETING (Enemy Heroes > Turrets > Enemy Base > Lord > Minions > Camps) ---
  private getAllTargetCandidates(maxRadius: number): TargetCandidate[] {
    const list: TargetCandidate[] = [];

    for (const eh of this.enemyHeroes) {
      if (!eh.alive) continue;
      const dist = Math.hypot(eh.x - this.playerX, eh.z - this.playerZ);
      if (dist <= maxRadius) {
        list.push({
          id: eh.id,
          kind: 'enemy_hero',
          name: `${eh.heroDef.name} (Thp ${eh.level})`,
          x: eh.x,
          z: eh.z,
          hp: eh.hp,
          maxHp: eh.maxHp,
          dist,
          extraRadius: 0.95,
        });
      }
    }

    if (this.lordPit.alive) {
      const dist = Math.hypot(this.lordPit.x - this.playerX, this.lordPit.z - this.playerZ);
      if (dist <= maxRadius) {
        list.push({
          id: THE_LORD_BOSS.id,
          kind: 'lord',
          name: 'The Lord',
          x: this.lordPit.x,
          z: this.lordPit.z,
          hp: this.lordPit.hp,
          maxHp: this.lordPit.maxHp,
          dist,
          extraRadius: 1.9,
        });
      }
    }

    for (const t of this.turrets) {
      if (!t.alive || t.def.team !== 'enemy') continue;
      const dist = Math.hypot(t.def.pos[0] - this.playerX, t.def.pos[1] - this.playerZ);
      if (dist <= maxRadius) {
        list.push({
          id: t.def.id,
          kind: 'turret',
          name: t.def.name,
          x: t.def.pos[0],
          z: t.def.pos[1],
          hp: t.hp,
          maxHp: t.maxHp,
          dist,
          extraRadius: 2.1,
        });
      }
    }

    if (this.enemyBase && this.enemyBase.hp > 0) {
      const dist = Math.hypot(this.enemyBase.x - this.playerX, this.enemyBase.z - this.playerZ);
      if (dist <= maxRadius + 3.5) {
        list.push({
          id: 'enemy_base',
          kind: 'base',
          name: this.enemyBase.vulnerable ? 'Kubu Utama Musuh' : 'Kubu Utama Musuh (Berperisai)',
          x: this.enemyBase.x,
          z: this.enemyBase.z,
          hp: this.enemyBase.hp,
          maxHp: this.enemyBase.maxHp,
          dist,
          extraRadius: 4.8,
        });
      }
    }

    for (const m of this.minions) {
      if (!m.alive || m.team !== 'enemy') continue;
      const dist = Math.hypot(m.x - this.playerX, m.z - this.playerZ);
      if (dist <= maxRadius) {
        list.push({
          id: m.id,
          kind: 'minion',
          name: m.type === 'siege' ? 'Kereta Kepung Musuh' : 'Minion Musuh',
          x: m.x,
          z: m.z,
          hp: m.hp,
          maxHp: m.maxHp,
          dist,
          extraRadius: 0.7,
        });
      }
    }

    for (const c of this.jungleCamps) {
      if (!c.alive) continue;
      const dist = Math.hypot(c.x - this.playerX, c.z - this.playerZ);
      if (dist <= maxRadius) {
        list.push({
          id: c.def.id,
          kind: 'camp',
          name: c.def.name,
          x: c.x,
          z: c.z,
          hp: c.hp,
          maxHp: c.maxHp,
          dist,
          extraRadius: 1.0,
        });
      }
    }

    const rank: Record<TargetCandidate['kind'], number> = {
      enemy_hero: 0,
      base: 1,
      turret: 2,
      lord: 3,
      minion: 4,
      camp: 5,
    };
    list.sort((a, b) => {
      if (a.kind !== b.kind) return rank[a.kind] - rank[b.kind];
      return a.dist - b.dist;
    });
    return list;
  }

  private getPreferredTarget(maxRadius: number): TargetCandidate | null {
    const all = this.getAllTargetCandidates(maxRadius);
    if (all.length === 0) return null;
    if (this.targetLocked && this.lockedTargetId) {
      const locked = all.find((t) => t.id === this.lockedTargetId);
      if (locked) return locked;
    }
    return all[0];
  }

  private getEffectiveDamage(mult = 1, forceCrit = false): { dmg: number; isCrit: boolean } {
    const buffMult =
      (this.buffTimer > 0 ? 1.25 : 1.0) *
      (this.redBuffTimer > 0 ? 1.2 : 1.0) *
      (this.turtleBuffTimer > 0 ? 1.15 : 1.0);
    const changeStack = this.heroDef?.id === 'change' ? 1 + Math.min(0.3, this.passiveStacks * 0.03) : 1.0;
    const isCrit = forceCrit || Math.random() < this.critChance;
    const critMult = isCrit ? 1.85 : 1.0;
    return {
      dmg: Math.round(this.baseDamage * mult * buffMult * changeStack * critMult),
      isCrit,
    };
  }

  private getEffectiveSkillDamage(mult: number): number {
    const buffMult =
      (this.buffTimer > 0 ? 1.25 : 1.0) *
      (this.redBuffTimer > 0 ? 1.2 : 1.0) *
      (this.turtleBuffTimer > 0 ? 1.15 : 1.0);
    const lancelotBonus = this.heroDef?.id === 'lancelot' ? 1 + this.passiveStacks * 0.15 : 1.0;
    const paquitoBoost = this.heroDef?.id === 'paquito' && this.skillComboCounter === 2 ? 1.35 : 1.0;
    return Math.round(this.baseDamage * mult * (1 + this.skillPowerBonus) * buffMult * lancelotBonus * paquitoBoost);
  }

  // --- AUTOMATIC BASIC ATTACK ---
  public triggerBasicAttack() {
    if (this.mode !== 'playing' || !this.heroDef || this.playerRespawnTimer > 0) return;

    const targetInRange = this.getPreferredTarget(this.attackRange + 2.5);
    if (!targetInRange) {
      if (this.autoChase) {
        const chaseTarget = this.getPreferredTarget(55);
        if (chaseTarget) {
          this.chaseGoalActive = true;
          this.playerYaw = Math.atan2(chaseTarget.x - this.playerX, chaseTarget.z - this.playerZ);
          return;
        }
      }
      this.showCombatAlert('TIADA MUSUH DALAM JARAK SERANGAN', 1.5);
      return;
    }

    if (this.cdBasic > 0) return;

    const hid = this.heroDef.id;
    this.hitCounter += 1;

    if (hid === 'miya' || hid === 'change') {
      this.passiveStacks = Math.min(6, this.passiveStacks + 1);
      this.passiveTimer = 3.5;
    }

    let guaranteedCrit = false;
    if (hid === 'granger') {
      const count = this.hitCounter % 6;
      this.passiveStacks = count === 0 ? 6 : count;
      this.passiveTimer = 5.0;
      guaranteedCrit = count === 0;
    } else if (hid === 'natalia' && this.inBush) {
      guaranteedCrit = true;
    }

    const miyaBoost = hid === 'miya' ? Math.min(4, this.passiveStacks) * 0.1 : 0;
    const speedFactor = 1 + this.attackSpeedBonus + miyaBoost + (this.buffTimer > 0 ? 0.25 : 0);
    this.cdBasic = this.baseAttackCooldown / speedFactor;
    this.attackAnimTimer = 0.24;

    const aimYaw = Math.atan2(targetInRange.x - this.playerX, targetInRange.z - this.playerZ);
    this.playerYaw = aimYaw;

    soundEngine.playHeroAttack(hid);
    let dmgMult = 1.0;
    if (hid === 'fanny' && (this.dashTimer > 0 || this.buffTimer > 0)) dmgMult = 1.25;
    if (hid === 'chou' && this.buffTimer > 0) dmgMult = 1.5;
    if (hid === 'fredrinn' && this.passiveStacks > 0) {
      dmgMult += this.passiveStacks * 0.08;
      this.passiveStacks = 0;
    }
    if (hid === 'karrie' && this.hitCounter % 4 === 0) dmgMult = 1.45;
    if (hid === 'karina' && this.hitCounter % 3 === 0) dmgMult = 1.4;
    if (hid === 'ixia' && this.hitCounter % 3 === 0) {
      const heal = Math.round(this.playerMaxHp * 0.06);
      this.playerHp = Math.min(this.playerMaxHp, this.playerHp + heal);
    }

    const { dmg, isCrit } = this.getEffectiveDamage(dmgMult, guaranteedCrit);

    const isRanged =
      this.heroDef.roleId === 'marksman' ||
      this.heroDef.roleId === 'mage' ||
      this.heroDef.roleId === 'support' ||
      hid === 'gusion' ||
      hid === 'aamon';

    if (isRanged) {
      this.spawnProjectile({
        x: this.playerX + Math.sin(aimYaw) * 0.9,
        z: this.playerZ + Math.cos(aimYaw) * 0.9,
        yaw: aimYaw,
        speed: ['layla', 'granger', 'beatrix', 'clint'].includes(hid) ? 36 : 31,
        damage: dmg,
        sourceTeam: 'blue',
        attackerHeroId: 'player',
        fromPlayer: true,
        color: isCrit ? '#fde047' : this.heroDef.skills.basic.color,
        radius: isCrit ? 0.58 : 0.44,
        life: 0.95,
        trueDmg: hid === 'karrie' && this.hitCounter % 4 === 0,
      });
    } else {
      this.spawnShockwave(
        this.playerX + Math.sin(aimYaw) * 1.6,
        this.playerZ + Math.cos(aimYaw) * 1.6,
        isCrit ? '#fde047' : this.heroDef.skills.basic.color,
        0.5,
        3.5,
        0.22
      );
      this.hitTargetCandidate(targetInRange, dmg, isCrit, false);
    }
  }

  private hitTargetCandidate(target: TargetCandidate, dmg: number, isCrit: boolean, slow: boolean) {
    if (target.kind === 'enemy_hero') {
      const eh = this.enemyHeroes.find((e) => e.id === target.id && e.alive);
      if (eh) this.damageAiHero(eh, dmg, 'player', slow, isCrit);
    } else if (target.kind === 'lord') {
      this.damageLordPit(dmg, slow, isCrit, 'player');
    } else if (target.kind === 'turret') {
      const t = this.turrets.find((tr) => tr.def.id === target.id && tr.alive);
      if (t) this.damageTurret(t, dmg, isCrit, 'player');
    } else if (target.kind === 'base') {
      this.damageEnemyBase(dmg, isCrit, 'player');
    } else if (target.kind === 'minion') {
      const m = this.minions.find((mn) => mn.id === target.id && mn.alive);
      if (m) this.damageMinion(m, dmg, true, isCrit);
    } else if (target.kind === 'camp') {
      const c = this.jungleCamps.find((jc) => jc.def.id === target.id && jc.alive);
      if (c) this.damageCamp(c, dmg, isCrit, 'player');
    }
  }

  private resolveSkillYaw(): number {
    const target = this.getPreferredTarget(this.attackRange + 8);
    if (target) {
      return Math.atan2(target.x - this.playerX, target.z - this.playerZ);
    }
    if (this.hasMouseMoved) {
      this.updateAimFromMouse();
      const dx = this.aimWorldPoint.x - this.playerX;
      const dz = this.aimWorldPoint.z - this.playerZ;
      if (dx * dx + dz * dz > 0.25) return Math.atan2(dx, dz);
    }
    return this.playerYaw;
  }

  private applySkillPassiveEffects() {
    if (!this.heroDef) return;
    const hid = this.heroDef.id;
    this.skillComboCounter = (this.skillComboCounter + 1) % 3;

    if (hid === 'gusion' && this.skillComboCounter === 0) {
      const heal = Math.round(this.playerMaxHp * 0.08);
      this.playerHp = Math.min(this.playerMaxHp, this.playerHp + heal);
      this.spawnFloatingText(this.playerX, 2.6, this.playerZ, `+${heal} HP`, '#38bdf8');
    } else if (hid === 'ruby') {
      const heal = Math.round(this.playerMaxHp * 0.09);
      this.playerHp = Math.min(this.playerMaxHp, this.playerHp + heal);
      this.dashDirX = Math.sin(this.playerYaw);
      this.dashDirZ = Math.cos(this.playerYaw);
      this.dashSpeed = 16;
      this.dashTimer = 0.14;
    } else if (hid === 'angela') {
      this.buffTimer = Math.max(this.buffTimer, 2.5);
    } else if (hid === 'kagura' || hid === 'luoyi') {
      this.playerShield = Math.max(this.playerShield, 95);
      this.playerShieldTimer = Math.max(this.playerShieldTimer, 3.0);
    } else if (hid === 'cyclops') {
      this.cdSkill1 = Math.max(0, this.cdSkill1 - 0.7);
      this.cdSkill2 = Math.max(0, this.cdSkill2 - 0.7);
      this.cdUltimate = Math.max(0, this.cdUltimate - 0.7);
    } else if (hid === 'cecilion') {
      this.cecilionBonus = Math.min(45, this.cecilionBonus + 2);
      this.recomputeStats(false);
    } else if (hid === 'bruno') {
      this.critChance = Math.min(0.8, this.critChance + 0.04);
    }
  }

  private spendPlayerMana(baseCost: number): boolean {
    const effCost = this.blueBuffTimer > 0 ? Math.round(baseCost * 0.55) : baseCost;
    if (this.playerMana < effCost) {
      soundEngine.playUiClick();
      this.spawnFloatingText(this.playerX, 2.6, this.playerZ, 'Mana Tidak Cukup!', '#60a5fa');
      return false;
    }
    this.playerMana -= effCost;
    return true;
  }

  public triggerSkill1() {
    if (this.mode !== 'playing' || !this.heroDef || this.cdSkill1 > 0 || this.playerRespawnTimer > 0) return;
    if (!this.spendPlayerMana(28)) return;
    const id = this.heroDef.id;
    this.cdSkill1 = this.heroDef.skills.skill1.cooldown * (1 - this.cooldownReduce);
    this.attackAnimTimer = 0.35;
    const yaw = this.resolveSkillYaw();
    this.playerYaw = yaw;
    soundEngine.playHeroSkill(id, 1);
    this.applySkillPassiveEffects();

    const color = this.heroDef.skills.skill1.color;
    const isRanged =
      this.heroDef.roleId === 'marksman' ||
      this.heroDef.roleId === 'mage' ||
      this.heroDef.roleId === 'support';

    if (['miya', 'clint', 'harley', 'change', 'ixia'].includes(id)) {
      const fan = id === 'ixia' ? [-0.14, 0.14] : [-0.28, -0.14, 0, 0.14, 0.28];
      for (const offset of fan) {
        this.spawnProjectile({
          x: this.playerX,
          z: this.playerZ,
          yaw: yaw + offset,
          speed: 32,
          damage: this.getEffectiveSkillDamage(id === 'ixia' ? 1.15 : 0.72),
          sourceTeam: 'blue',
          attackerHeroId: 'player',
          fromPlayer: true,
          color,
          radius: 0.46,
          life: 0.9,
          slow: true,
        });
      }
    } else if (['alucard', 'balmond', 'gusion', 'silvanna', 'paquito', 'hayabusa', 'natalia', 'helcurt'].includes(id)) {
      this.dashDirX = Math.sin(yaw);
      this.dashDirZ = Math.cos(yaw);
      this.dashSpeed = 27;
      this.dashTimer = 0.18;
      const tx = this.playerX + this.dashDirX * 4.5;
      const tz = this.playerZ + this.dashDirZ * 4.5;
      this.spawnShockwave(tx, tz, color, 0.9, 5.4, 0.34);
      this.applyAreaDamage(tx, tz, 5.4, this.getEffectiveSkillDamage(1.68), 'blue', 'player', true);
    } else if (id === 'estes' || id === 'angela') {
      const heal = Math.round(this.playerMaxHp * (id === 'estes' ? 0.22 : 0.14));
      this.playerHp = Math.min(this.playerMaxHp, this.playerHp + heal);
      this.healNearbyAlliedHeroes(this.playerX, this.playerZ, 8.5, Math.round(heal * 0.75), 'player');
      this.spawnShockwave(this.playerX, this.playerZ, color, 0.8, 5.8, 0.38);
      this.spawnFloatingText(this.playerX, 2.4, this.playerZ, `+${heal} HP`, '#34d399');
      this.applyAreaDamage(this.playerX, this.playerZ, 5.8, this.getEffectiveSkillDamage(1.35), 'blue', 'player', true);
    } else if (isRanged) {
      if (id === 'layla' || id === 'beatrix' || id === 'cyclops') {
        this.buffTimer = Math.max(this.buffTimer, 2.4);
      }
      this.spawnProjectile({
        x: this.playerX,
        z: this.playerZ,
        yaw,
        speed: 34,
        damage: this.getEffectiveSkillDamage(1.78),
        sourceTeam: 'blue',
        attackerHeroId: 'player',
        fromPlayer: true,
        color,
        radius: 0.72,
        aoeRadius: ['valir', 'aurora', 'cecilion', 'pharsa', 'yve'].includes(id) ? 4.4 : undefined,
        pierce: !['valir', 'aurora', 'cecilion'].includes(id),
        slow: true,
        life: 1.0,
      });
    } else {
      const tx = this.playerX + Math.sin(yaw) * 3.8;
      const tz = this.playerZ + Math.cos(yaw) * 3.8;
      this.spawnShockwave(tx, tz, color, 0.9, 6.0, 0.36);
      this.spawnBurst(tx, 1.4, tz, color, 20);
      this.applyAreaDamage(tx, tz, 6.0, this.getEffectiveSkillDamage(1.65), 'blue', 'player', true);
    }
  }

  public triggerSkill2() {
    if (this.mode !== 'playing' || !this.heroDef || this.cdSkill2 > 0 || this.playerRespawnTimer > 0) return;
    if (!this.spendPlayerMana(36)) return;
    const id = this.heroDef.id;
    this.cdSkill2 = this.heroDef.skills.skill2.cooldown * (1 - this.cooldownReduce);
    this.attackAnimTimer = 0.35;
    const yaw = this.resolveSkillYaw();
    this.playerYaw = yaw;
    soundEngine.playHeroSkill(id, 2);
    this.applySkillPassiveEffects();

    const color = this.heroDef.skills.skill2.color;

    if (id === 'fanny' || id === 'lancelot' || id === 'hayabusa' || id === 'harley' || id === 'granger' || id === 'bruno' || id === 'karrie' || id === 'beatrix' || id === 'clint' || id === 'brody') {
      const reverse = id === 'clint' ? -1 : 1;
      this.dashDirX = Math.sin(yaw) * reverse;
      this.dashDirZ = Math.cos(yaw) * reverse;
      this.dashSpeed = id === 'fanny' ? 38 : 30;
      this.dashTimer = 0.22;
      if (id === 'fanny') {
        this.spawnSteelCable(this.playerX, this.playerZ, this.playerX + this.dashDirX * 12, this.playerZ + this.dashDirZ * 12);
      }
      this.passiveStacks = Math.min(3, this.passiveStacks + 1);
      this.passiveTimer = 4.0;
      this.spawnShockwave(this.playerX, this.playerZ, color, 0.7, 5.2, 0.34);
      this.applyAreaDamage(this.playerX, this.playerZ, 5.4, this.getEffectiveSkillDamage(1.7), 'blue', 'player', true);
    } else if (['tigreal', 'fredrinn', 'hylos', 'johnson', 'atlas', 'khufra', 'minisitthar', 'minsitthar', 'chou', 'nana', 'angela', 'estes', 'kagura', 'change', 'natalia', 'karina'].includes(id)) {
      this.playerShield = Math.max(this.playerShield, Math.round(this.playerMaxHp * 0.24));
      this.playerShieldTimer = 4.2;
      this.buffTimer = Math.max(this.buffTimer, 3.2);
      if (['angela', 'estes'].includes(id)) {
        this.healNearbyAlliedHeroes(this.playerX, this.playerZ, 8.5, Math.round(this.playerMaxHp * 0.14), 'player');
      }
      if (['tigreal', 'fredrinn', 'atlas', 'khufra', 'chou'].includes(id)) {
        this.dashDirX = Math.sin(yaw);
        this.dashDirZ = Math.cos(yaw);
        this.dashSpeed = 27;
        this.dashTimer = 0.2;
      }
      this.spawnShockwave(this.playerX, this.playerZ, color, 0.9, 6.2, 0.4);
      this.spawnBurst(this.playerX, 1.4, this.playerZ, color, 22);
      this.applyAreaDamage(this.playerX, this.playerZ, 6.2, this.getEffectiveSkillDamage(1.6), 'blue', 'player', true);
    } else if (id === 'miya' || id === 'pharsa' || id === 'aamon') {
      this.invulnTimer = Math.max(this.invulnTimer, 0.8);
      this.buffTimer = Math.max(this.buffTimer, 3.8);
      this.playerShield = Math.max(this.playerShield, Math.round(this.playerMaxHp * 0.18));
      this.playerShieldTimer = 4.0;
      this.spawnBurst(this.playerX, 1.4, this.playerZ, color, 24);
      this.spawnFloatingText(this.playerX, 2.7, this.playerZ, 'Halimunan & Laju!', color);
    } else if (this.heroDef.roleId === 'mage' || this.heroDef.roleId === 'support' || id === 'gusion') {
      const tx = this.playerX + Math.sin(yaw) * 6.5;
      const tz = this.playerZ + Math.cos(yaw) * 6.5;
      this.spawnShockwave(tx, tz, color, 1.0, 6.8, 0.42);
      this.spawnBurst(tx, 1.5, tz, color, 26);
      this.applyAreaDamage(tx, tz, 6.8, this.getEffectiveSkillDamage(1.85), 'blue', 'player', true);
    } else {
      if (['alucard', 'ruby', 'balmond'].includes(id)) {
        const heal = Math.round(this.playerMaxHp * 0.12);
        this.playerHp = Math.min(this.playerMaxHp, this.playerHp + heal);
        this.spawnFloatingText(this.playerX, 2.5, this.playerZ, `+${heal} HP`, '#34d399');
      }
      this.spawnShockwave(this.playerX, this.playerZ, color, 0.9, 6.2, 0.36);
      this.applyAreaDamage(this.playerX, this.playerZ, 6.2, this.getEffectiveSkillDamage(1.75), 'blue', 'player', true);
    }
  }

  public triggerUltimate() {
    if (this.mode !== 'playing' || !this.heroDef || this.cdUltimate > 0 || this.playerRespawnTimer > 0) return;
    if (!this.spendPlayerMana(55)) return;
    const id = this.heroDef.id;
    this.cdUltimate = this.heroDef.skills.ultimate.cooldown * (1 - this.cooldownReduce);
    this.attackAnimTimer = 0.52;
    const yaw = this.resolveSkillYaw();
    this.playerYaw = yaw;
    soundEngine.playHeroSkill(id, 3);
    this.applySkillPassiveEffects();

    const color = this.heroDef.skills.ultimate.color;
    const target = this.getPreferredTarget(this.attackRange + 9);
    const tx = target ? target.x : this.playerX + Math.sin(yaw) * 7.5;
    const tz = target ? target.z : this.playerZ + Math.cos(yaw) * 7.5;

    if (id === 'estes' || id === 'angela' || id === 'hylos') {
      const heal = Math.round(this.playerMaxHp * 0.38);
      this.playerHp = Math.min(this.playerMaxHp, this.playerHp + heal);
      this.playerShield = Math.round(this.playerMaxHp * 0.38);
      this.playerShieldTimer = 5.5;
      this.buffTimer = 5.5;
      this.healNearbyAlliedHeroes(this.playerX, this.playerZ, 12.0, heal, 'player');
      this.spawnShockwave(this.playerX, this.playerZ, '#fde047', 1.3, 9.6, 0.55);
      this.spawnBurst(this.playerX, 1.7, this.playerZ, color, 36);
      this.applyAreaDamage(this.playerX, this.playerZ, 9.6, this.getEffectiveSkillDamage(2.5), 'blue', 'player', true);
      this.spawnFloatingText(this.playerX, 2.8, this.playerZ, `+${heal} HP & Perisai!`, '#34d399');
    } else if (id === 'johnson' || id === 'zilong' || id === 'helcurt' || id === 'karrie' || id === 'yuzhong') {
      this.buffTimer = 6.5;
      this.playerShield = Math.max(this.playerShield, Math.round(this.playerMaxHp * 0.3));
      this.playerShieldTimer = 5.0;
      if (id === 'johnson') {
        this.dashDirX = Math.sin(yaw);
        this.dashDirZ = Math.cos(yaw);
        this.dashSpeed = 34;
        this.dashTimer = 0.35;
      }
      this.spawnShockwave(this.playerX, this.playerZ, color, 1.3, 9.0, 0.5);
      this.spawnBurst(this.playerX, 1.8, this.playerZ, '#fde047', 38);
      this.applyAreaDamage(this.playerX, this.playerZ, 9.0, this.getEffectiveSkillDamage(2.75), 'blue', 'player', true);
      this.spawnFloatingText(this.playerX, 3.0, this.playerZ, `${this.heroDef.skills.ultimate.name}!`, color);
    } else if (['layla', 'granger', 'clint', 'beatrix', 'bruno', 'ixia'].includes(id)) {
      const spreads = id === 'granger' || id === 'ixia' ? [-0.16, 0, 0.16] : [0];
      for (const off of spreads) {
        this.spawnProjectile({
          x: this.playerX,
          z: this.playerZ,
          yaw: yaw + off,
          speed: 38,
          damage: this.getEffectiveSkillDamage(spreads.length > 1 ? 1.55 : 3.15),
          sourceTeam: 'blue',
          attackerHeroId: 'player',
          fromPlayer: true,
          color,
          radius: 1.15,
          pierce: spreads.length === 1,
          aoeRadius: 5.8,
          life: 1.1,
        });
      }
      this.spawnBurst(this.playerX, 1.4, this.playerZ, color, 28);
    } else if (['fanny', 'lancelot', 'saber', 'hayabusa', 'karina', 'natalia', 'gusion'].includes(id)) {
      this.invulnTimer = 0.9;
      this.dashDirX = Math.sin(yaw);
      this.dashDirZ = Math.cos(yaw);
      this.dashSpeed = 35;
      this.dashTimer = 0.2;
      if (id === 'fanny') this.spawnSteelCable(this.playerX, this.playerZ, tx, tz);
      this.spawnShockwave(tx, tz, color, 1.3, 8.8, 0.5);
      this.spawnBurst(tx, 1.8, tz, '#fde047', 40);
      this.applyAreaDamage(tx, tz, 8.8, this.getEffectiveSkillDamage(3.2), 'blue', 'player', true);
    } else if (this.heroDef.roleId === 'tank') {
      this.invulnTimer = 1.6;
      this.playerShield = Math.max(this.playerShield, Math.round(this.playerMaxHp * 0.42));
      this.playerShieldTimer = 5.5;
      this.spawnShockwave(this.playerX, this.playerZ, color, 1.3, 9.5, 0.55);
      this.spawnBurst(this.playerX, 1.6, this.playerZ, '#fde047', 38);
      this.applyAreaDamage(this.playerX, this.playerZ, 9.5, this.getEffectiveSkillDamage(2.75), 'blue', 'player', true);
    } else {
      for (let k = 0; k < 3; k++) {
        const ox = tx + (k === 0 ? 0 : (Math.random() - 0.5) * 4.5);
        const oz = tz + (k === 0 ? 0 : (Math.random() - 0.5) * 4.5);
        this.spawnShockwave(ox, oz, color, 1.1, 6.8, 0.48);
        this.spawnBurst(ox, 2.4, oz, '#fde047', 16);
      }
      this.applyAreaDamage(tx, tz, 9.6, this.getEffectiveSkillDamage(3.15), 'blue', 'player', true);
    }
  }

  private spawnSteelCable(x1: number, z1: number, x2: number, z2: number) {
    const pts = [
      new THREE.Vector3(x1, groundHeightAt(x1, z1) + 1.2, z1),
      new THREE.Vector3(x2, groundHeightAt(x2, z2) + 2.5, z2),
    ];
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    const mat = new THREE.LineBasicMaterial({ color: '#7dd3fc', transparent: true, opacity: 0.95 });
    const line = new THREE.Line(geo, mat);
    this.scene.add(line);
    this.steelCables.push({ line, age: 0, duration: 0.38 });
  }

  public triggerDash() {
    if (this.mode !== 'playing' || this.cdDash > 0 || this.playerRespawnTimer > 0) return;
    this.cdDash = 2.5 * (1 - this.cooldownReduce);
    const { mx, mz } = this.getMoveInputVector();
    if (mx !== 0 || mz !== 0) {
      this.dashDirX = mx;
      this.dashDirZ = mz;
      this.playerYaw = Math.atan2(mx, mz);
    } else {
      this.dashDirX = Math.sin(this.playerYaw);
      this.dashDirZ = Math.cos(this.playerYaw);
    }
    this.dashSpeed = 26;
    this.dashTimer = 0.2;
    this.invulnTimer = Math.max(this.invulnTimer, 0.3);
    soundEngine.playDash();
    this.spawnBurst(this.playerX, 0.9, this.playerZ, '#e2e8f0', 12);
  }

  private spawnProjectile(opts: {
    x: number;
    z: number;
    yaw: number;
    speed: number;
    damage: number;
    sourceTeam: TeamSide;
    attackerHeroId?: string;
    fromPlayer: boolean;
    color: string;
    radius: number;
    life: number;
    aoeRadius?: number;
    pierce?: boolean;
    slow?: boolean;
    trueDmg?: boolean;
  }) {
    const mat = new THREE.MeshBasicMaterial({ color: opts.color });
    const mesh = new THREE.Mesh(this.unitSphereGeo, mat);
    mesh.scale.setScalar(opts.radius * 2.2);
    const y = groundHeightAt(opts.x, opts.z) + 1.35;
    mesh.position.set(opts.x, y, opts.z);
    this.scene.add(mesh);

    this.projectiles.push({
      mesh,
      x: opts.x,
      y,
      z: opts.z,
      vx: Math.sin(opts.yaw) * opts.speed,
      vz: Math.cos(opts.yaw) * opts.speed,
      speed: opts.speed,
      radius: opts.radius,
      damage: opts.damage,
      sourceTeam: opts.sourceTeam,
      attackerHeroId: opts.attackerHeroId,
      fromPlayer: opts.fromPlayer,
      life: opts.life,
      aoeRadius: opts.aoeRadius,
      pierce: opts.pierce,
      slow: opts.slow,
      trueDmg: opts.trueDmg,
      hitIds: opts.pierce ? new Set() : undefined,
      color: opts.color,
    });
  }

  private spawnShockwave(x: number, z: number, color: string, startScale: number, endScale: number, duration: number) {
    const mat = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(this.ringGeo, mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(x, groundHeightAt(x, z) + 0.16, z);
    mesh.scale.setScalar(startScale);
    this.scene.add(mesh);
    this.shockwaves.push({ mesh, age: 0, duration, startScale, endScale });
  }

  private spawnBurst(x: number, y: number, z: number, color: string, count: number) {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    const gy = groundHeightAt(x, z);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = x;
      pos[i * 3 + 1] = gy + y;
      pos[i * 3 + 2] = z;
      const ang = Math.random() * Math.PI * 2;
      const spd = 2.5 + Math.random() * 5.5;
      vel[i * 3] = Math.cos(ang) * spd;
      vel[i * 3 + 1] = 2.5 + Math.random() * 5.0;
      vel[i * 3 + 2] = Math.sin(ang) * spd;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({ color, size: 0.4, transparent: true, opacity: 1 });
    const points = new THREE.Points(geo, mat);
    this.scene.add(points);
    this.bursts.push({ points, velocities: vel, age: 0, duration: 0.65 });
  }

  private spawnTelegraph(
    x: number,
    z: number,
    radius: number,
    duration: number,
    damage: number,
    sourceTeam: TeamSide | 'neutral' = 'neutral',
    attackerHeroId?: string
  ) {
    const gy = groundHeightAt(x, z) + 0.12;
    const ringColor = sourceTeam === 'blue' ? '#38bdf8' : '#ef4444';
    const fillColor = sourceTeam === 'blue' ? '#0284c7' : '#dc2626';
    const outer = new THREE.Mesh(
      this.ringGeo,
      new THREE.MeshBasicMaterial({ color: ringColor, transparent: true, opacity: 0.85, side: THREE.DoubleSide, depthWrite: false })
    );
    outer.rotation.x = -Math.PI / 2;
    outer.position.set(x, gy, z);
    outer.scale.setScalar(radius);

    const inner = new THREE.Mesh(
      this.fillCircleGeo,
      new THREE.MeshBasicMaterial({ color: fillColor, transparent: true, opacity: 0.28, side: THREE.DoubleSide, depthWrite: false })
    );
    inner.rotation.x = -Math.PI / 2;
    inner.position.set(x, gy + 0.01, z);
    inner.scale.setScalar(0.1);

    this.scene.add(outer, inner);
    this.telegraphs.push({ mesh: outer, innerMesh: inner, x, z, radius, age: 0, duration, damage, sourceTeam, attackerHeroId });
  }

  private healNearbyAlliedHeroes(cx: number, cz: number, radius: number, amount: number, healerHeroId: string) {
    for (const ah of this.alliedHeroes) {
      if (!ah.alive || Math.hypot(ah.x - cx, ah.z - cz) > radius) continue;
      ah.hp = Math.min(ah.maxHp, ah.hp + amount);
      this.recordHeroSupport(healerHeroId, ah.id, amount);
      this.spawnFloatingText(ah.x, 2.3, ah.z, `+${amount} HP`, '#34d399');
    }
  }

  private applyAreaDamage(
    cx: number,
    cz: number,
    radius: number,
    damage: number,
    attackerTeam: TeamSide,
    attackerHeroId?: string,
    slow = false
  ) {
    const fromPlayer = attackerHeroId === 'player';

    if (attackerTeam === 'blue') {
      for (const eh of this.enemyHeroes) {
        if (eh.alive && Math.hypot(eh.x - cx, eh.z - cz) <= radius + 1.0) {
          this.damageAiHero(eh, damage, attackerHeroId, slow, false);
        }
      }
      if (this.lordPit.alive && Math.hypot(this.lordPit.x - cx, this.lordPit.z - cz) <= radius + 2.0) {
        this.damageLordPit(damage, slow, false, attackerHeroId);
      }
      for (const t of this.turrets) {
        if (t.alive && t.def.team === 'enemy' && Math.hypot(t.def.pos[0] - cx, t.def.pos[1] - cz) <= radius + 2.2) {
          this.damageTurret(t, damage, false, attackerHeroId);
        }
      }
      if (this.enemyBase && this.enemyBase.hp > 0 && Math.hypot(this.enemyBase.x - cx, this.enemyBase.z - cz) <= radius + 4.8) {
        this.damageEnemyBase(damage, false, attackerHeroId);
      }
      for (const m of this.minions) {
        if (m.alive && m.team === 'enemy' && Math.hypot(m.x - cx, m.z - cz) <= radius + 0.9) {
          this.damageMinion(m, damage, fromPlayer, false, attackerHeroId);
        }
      }
      if (fromPlayer) {
        for (const c of this.jungleCamps) {
          if (c.alive && Math.hypot(c.x - cx, c.z - cz) <= radius + 1.1) {
            this.damageCamp(c, damage, false, attackerHeroId);
          }
        }
      }
    } else {
      if (this.playerRespawnTimer <= 0 && Math.hypot(this.playerX - cx, this.playerZ - cz) <= radius + 1.0) {
        this.damagePlayer(damage, attackerHeroId);
      }
      for (const ah of this.alliedHeroes) {
        if (ah.alive && Math.hypot(ah.x - cx, ah.z - cz) <= radius + 1.0) {
          this.damageAiHero(ah, damage, attackerHeroId, slow, false);
        }
      }
      for (const t of this.turrets) {
        if (t.alive && t.def.team === 'ally' && Math.hypot(t.def.pos[0] - cx, t.def.pos[1] - cz) <= radius + 2.2) {
          this.damageTurret(t, damage, false, attackerHeroId);
        }
      }
      if (this.alliedBase && this.alliedBase.hp > 0 && Math.hypot(this.alliedBase.x - cx, this.alliedBase.z - cz) <= radius + 4.8) {
        this.damageAlliedBase(damage, attackerHeroId);
      }
      for (const m of this.minions) {
        if (m.alive && m.team === 'ally' && Math.hypot(m.x - cx, m.z - cz) <= radius + 0.9) {
          this.damageMinion(m, damage, false, false, attackerHeroId);
        }
      }
    }
  }

  private applyLifesteal(dealtDamage: number) {
    if (this.lifesteal <= 0) return;
    const heal = Math.max(1, Math.round(dealtDamage * this.lifesteal));
    this.playerHp = Math.min(this.playerMaxHp, this.playerHp + heal);
  }

  private damageAiHero(
    ai: AiHeroState,
    rawDamage: number,
    attackerHeroId?: string,
    slow = false,
    isCrit = false
  ) {
    if (!ai.alive) return;
    const fromPlayer = attackerHeroId === 'player';
    const armorIgnore = Math.max(0.1, 0.35 - (fromPlayer ? this.armorPen : 0));
    let finalDmg = Math.max(5, Math.round(rawDamage - ai.defense * armorIgnore));
    if (ai.shield > 0) {
      const absorbed = Math.min(ai.shield, finalDmg);
      ai.shield -= absorbed;
      finalDmg -= absorbed;
    }
    ai.hp = Math.max(0, ai.hp - finalDmg);
    ai.inCombat = true;
    if (slow) ai.slowTimer = 2.2;

    this.recordHeroDamage(attackerHeroId, ai.id, finalDmg);

    if (fromPlayer) {
      this.applyLifesteal(finalDmg);
      soundEngine.playHit(finalDmg > 70 || isCrit);
      this.spawnBurst(ai.x, 1.3, ai.z, isCrit ? '#fbbf24' : '#fde047', 10);
      this.spawnFloatingText(
        ai.x,
        2.6,
        ai.z,
        isCrit ? `-${finalDmg} KRIT!` : `-${finalDmg}`,
        isCrit ? '#fb923c' : '#fde047'
      );
    }

    if (ai.hp <= 0) {
      ai.alive = false;
      ai.respawnTimer = 6.5;
      ai.rig.root.visible = false;
      ai.shadow.visible = false;

      if (fromPlayer && this.heroDef?.id === 'balmond') {
        const heal = Math.round(this.playerMaxHp * 0.12);
        this.playerHp = Math.min(this.playerMaxHp, this.playerHp + heal);
      }

      this.spawnBurst(ai.x, 1.5, ai.z, ai.heroDef.appearance.accentColor, 32);
      this.spawnShockwave(ai.x, ai.z, ai.team === 'red' ? '#fbbf24' : '#ef4444', 0.8, 5.5, 0.45);
      if (Math.random() < 0.6) this.spawnOrb(ai.x + 1.2, ai.z, 'heal');

      this.handleHeroKill(attackerHeroId, ai.id, ai.x, ai.z);
    }
  }

  private damageLordPit(rawDamage: number, slow = false, isCrit = false, attackerHeroId?: string) {
    if (!this.lordPit.alive) return;
    const fromPlayer = attackerHeroId === 'player';
    const armorIgnore = Math.max(0.1, 0.3 - (fromPlayer ? this.armorPen : 0));
    const finalDmg = Math.max(8, Math.round(rawDamage - THE_LORD_BOSS.defense * armorIgnore));
    this.lordPit.hp = Math.max(0, this.lordPit.hp - finalDmg);
    this.lordPit.inCombat = true;
    if (slow) this.lordPit.slowTimer = 1.6;

    if (attackerHeroId) {
      const rec = this.heroRecords.get(attackerHeroId);
      if (rec) rec.objectiveDamage += finalDmg;
    }

    if (fromPlayer) {
      this.applyLifesteal(finalDmg);
      soundEngine.playHit(finalDmg > 85 || isCrit);
      this.spawnBurst(this.lordPit.x, 1.8, this.lordPit.z, '#fbbf24', 12);
      this.spawnFloatingText(this.lordPit.x, 3.8, this.lordPit.z, isCrit ? `-${finalDmg}!` : `-${finalDmg}`, '#fde047');
    }

    if (this.lordPit.hp <= 0) {
      this.lordPit.alive = false;
      this.lordPit.respawnTimer = 65;
      if (this.lordPit.rig) {
        this.scene.remove(this.lordPit.rig.root);
        disposeObject3D(this.lordPit.rig.root);
        this.lordPit.rig = null;
      }
      if (this.lordPit.shadow) {
        this.scene.remove(this.lordPit.shadow);
        disposeObject3D(this.lordPit.shadow);
        this.lordPit.shadow = null;
      }

      soundEngine.playEnemyDefeat();
      soundEngine.playAnnouncer('allied_lord_march');
      this.spawnShockwave(this.lordPit.x, this.lordPit.z, '#38bdf8', 1.2, 12, 0.6);
      this.awardXpAndGold(THE_LORD_BOSS.xpReward, THE_LORD_BOSS.goldReward, 5);
      for (const ah of this.alliedHeroes) {
        if (ah.alive) this.awardAiXpAndGold(ah, 140, 140);
      }
      this.unlockAchievement('boss_slayer');

      this.spawnAlliedLord();
    }
  }

  private spawnAlliedLord() {
    if (this.alliedLord) {
      this.scene.remove(this.alliedLord.rig.root, this.alliedLord.shadow);
      disposeObject3D(this.alliedLord.rig.root);
      disposeObject3D(this.alliedLord.shadow);
    }

    const lanes: LaneId[] = ['mid', 'exp', 'gold'];
    let bestLane: LaneId = 'mid';
    let minEnemyTurrets = 99;
    for (const lane of lanes) {
      const aliveCount = this.turrets.filter((t) => t.alive && t.def.team === 'enemy' && t.def.lane === lane).length;
      if (aliveCount < minEnemyTurrets) {
        minEnemyTurrets = aliveCount;
        bestLane = lane;
      }
    }

    const rig = buildLordBossRig(2.15, true);
    const startPos = LANE_WAYPOINTS[bestLane][2] || [0, 0];
    const shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(4.4, 4.4),
      new THREE.MeshBasicMaterial({ map: this.shadowTex, transparent: true, opacity: 0.55, depthWrite: false })
    );
    shadow.rotation.x = -Math.PI / 2;
    rig.root.position.set(startPos[0], groundHeightAt(startPos[0], startPos[1]), startPos[1]);
    this.scene.add(rig.root, shadow);

    this.alliedLord = {
      rig,
      shadow,
      lane: bestLane,
      waypointIdx: 2,
      x: startPos[0],
      z: startPos[1],
      yaw: 0,
      hp: 2600,
      maxHp: 2600,
      damage: 115,
      attackTimer: 1.0,
      attackAnimTimer: 0,
      alive: true,
    };

    this.showCombatAlert(`LORD HAS BEEN DEFEATED! ALLIED LORD MARCHES ${bestLane.toUpperCase()}!`, 4.0);
  }

  private damageTurret(t: TurretState, rawDamage: number, isCrit = false, attackerHeroId?: string) {
    if (!t.alive) return;
    const fromPlayer = attackerHeroId === 'player';
    let dmg = Math.max(8, Math.round(rawDamage * 0.9));

    if (t.def.tier === 'inner') {
      const outerAlive = this.turrets.some(
        (ot) => ot.alive && ot.def.team === t.def.team && ot.def.lane === t.def.lane && ot.def.tier === 'outer'
      );
      if (outerAlive) dmg = Math.max(4, Math.round(dmg * 0.42));
    }

    const oppMinionTeam = t.def.team === 'enemy' ? 'ally' : 'enemy';
    const hasMinionSupport =
      this.minions.some(
        (m) => m.alive && m.team === oppMinionTeam && Math.hypot(m.x - t.def.pos[0], m.z - t.def.pos[1]) <= 13.5
      ) ||
      (t.def.team === 'enemy' &&
        Boolean(
          this.alliedLord &&
            this.alliedLord.alive &&
            Math.hypot(this.alliedLord.x - t.def.pos[0], this.alliedLord.z - t.def.pos[1]) <= 15
        ));

    let hpDmg = dmg;
    if (t.shield > 0) {
      t.shieldFlashTimer = 0.25;
      if (hasMinionSupport) {
        // Allied minions weaken and break turret shield rapidly while letting partial damage pierce
        const shieldDmg = Math.round(dmg * 1.55);
        t.shield = Math.max(0, t.shield - shieldDmg);
        hpDmg = Math.max(5, Math.round(dmg * 0.42));
      } else {
        // Without minion wave, turret energy shield blocks 65% of hero burst
        const reduced = Math.max(4, Math.round(dmg * 0.35));
        t.shield = Math.max(0, t.shield - reduced);
        hpDmg = t.shield > 0 ? Math.max(2, Math.round(reduced * 0.25)) : Math.round(reduced * 0.7);
      }

      if (t.shield <= 0) {
        t.shieldDome.visible = false;
        t.shieldRing.visible = false;
        soundEngine.playShieldBreak();
        this.spawnShockwave(t.def.pos[0], t.def.pos[1], '#38bdf8', 1.4, 7.5, 0.45);
        this.spawnBurst(t.def.pos[0], 3.2, t.def.pos[1], '#7dd3fc', 24);
        if (fromPlayer || Math.hypot(this.playerX - t.def.pos[0], this.playerZ - t.def.pos[1]) < 32) {
          this.spawnFloatingText(t.def.pos[0], 6.4, t.def.pos[1], 'SHIELD BROKEN!', '#38bdf8');
        }
      }
    }

    t.hp = Math.max(0, t.hp - hpDmg);
    const recordedDmg = hpDmg + (t.shield > 0 ? Math.round(dmg * 0.3) : 0);
    if (attackerHeroId) {
      const rec = this.heroRecords.get(attackerHeroId);
      if (rec) rec.objectiveDamage += recordedDmg;
    }

    if (fromPlayer) {
      soundEngine.playHit(isCrit);
      this.spawnBurst(
        t.def.pos[0],
        2.6,
        t.def.pos[1],
        t.shield > 0 ? '#7dd3fc' : '#fbbf24',
        8
      );
      this.spawnFloatingText(
        t.def.pos[0],
        5.5,
        t.def.pos[1],
        t.shield > 0 ? `-${hpDmg} (SHIELD)` : `-${hpDmg}`,
        t.shield > 0 ? '#7dd3fc' : '#fde047'
      );
    }

    if (t.hp <= 0) {
      t.alive = false;
      t.group.visible = false;
      soundEngine.playTurretDestroy();
      this.spawnShockwave(t.def.pos[0], t.def.pos[1], '#fbbf24', 1.2, 10.5, 0.62);
      this.spawnShockwave(t.def.pos[0], t.def.pos[1], '#ef4444', 0.8, 7.5, 0.45);
      this.spawnBurst(t.def.pos[0], 3.2, t.def.pos[1], '#ef4444', 40);

      if (t.def.team === 'enemy') {
        soundEngine.playAnnouncer('turret_destroyed');
        this.awardXpAndGold(210, 220, 2);
        this.alliedHeroes.forEach((ah) => this.awardAiXpAndGold(ah, 120, 140));
        this.unlockAchievement('turret_breaker');
        this.refreshEnemyBaseVulnerability();
        this.showCombatAlert('TURRET DESTROYED!', 3.2);
      } else {
        this.enemyHeroes.forEach((eh) => this.awardAiXpAndGold(eh, 120, 140));
        this.showCombatAlert(`ALLY TURRET DESTROYED (${t.def.name})!`, 3.2);
      }
    }
  }

  private refreshEnemyBaseVulnerability() {
    if (!this.enemyBase) return;
    const lanes: LaneId[] = ['exp', 'mid', 'gold'];
    const anyLaneCleared = lanes.some((lane) => {
      const enemyLaneTurrets = this.turrets.filter((t) => t.def.team === 'enemy' && t.def.lane === lane);
      return enemyLaneTurrets.every((t) => !t.alive);
    });
    if (anyLaneCleared && !this.enemyBase.vulnerable) {
      this.enemyBase.vulnerable = true;
      if (this.enemyBase.shieldDome) this.enemyBase.shieldDome.visible = false;
      soundEngine.playAnnouncer('base_shield_broken');
      this.showCombatAlert('ENEMY BASE SHIELD IS DOWN! DESTROY THE NEXUS TO WIN!', 4.2);
    }
  }

  private damageEnemyBase(rawDamage: number, isCrit = false, attackerHeroId?: string) {
    if (!this.enemyBase || this.enemyBase.hp <= 0 || this.mode !== 'playing') return;
    const fromPlayer = attackerHeroId === 'player';
    if (!this.enemyBase.vulnerable) {
      if (fromPlayer) {
        this.spawnFloatingText(this.enemyBase.x, 6.2, this.enemyBase.z, 'PROTECTED BY TURRETS!', '#94a3b8');
      }
      return;
    }

    const dmg = Math.max(10, Math.round(rawDamage));
    this.enemyBase.hp = Math.max(0, this.enemyBase.hp - dmg);
    if (attackerHeroId) {
      const rec = this.heroRecords.get(attackerHeroId);
      if (rec) rec.objectiveDamage += dmg;
    }

    if (fromPlayer) {
      soundEngine.playHit(isCrit);
      this.spawnBurst(this.enemyBase.x, 3.2, this.enemyBase.z, '#fb7185', 10);
      this.spawnFloatingText(this.enemyBase.x, 6.5, this.enemyBase.z, `-${dmg}`, '#fde047');
    }

    if (this.enemyBase.hp <= 0) {
      soundEngine.playBaseDestroy();
      this.spawnShockwave(ENEMY_BASE_POS[0], ENEMY_BASE_POS[1], '#fde047', 2, 22, 0.9);
      this.spawnBurst(ENEMY_BASE_POS[0], 4.2, ENEMY_BASE_POS[1], '#fbbf24', 52);
      this.finishMatch(
        'blue',
        `Kubu Utama Musuh dimusnahkan! Pasukan Biru menang (${this.blueTeamCards} Kad vs ${this.redTeamCards} Kad).`
      );
    }
  }

  private damageAlliedBase(rawDamage: number, attackerHeroId?: string) {
    if (!this.alliedBase || this.alliedBase.hp <= 0 || this.mode !== 'playing') return;
    const dmg = Math.round(rawDamage);
    this.alliedBase.hp = Math.max(0, this.alliedBase.hp - dmg);
    if (attackerHeroId) {
      const rec = this.heroRecords.get(attackerHeroId);
      if (rec) rec.objectiveDamage += dmg;
    }
    if (this.baseAttackAlertCooldown <= 0) {
      this.baseAttackAlertCooldown = 9.0;
      soundEngine.playAnnouncer('base_under_attack');
      this.showCombatAlert('YOUR BASE IS UNDER ATTACK!', 3.2);
    }
    if (this.alliedBase.hp <= 0) {
      soundEngine.playBaseDestroy();
      this.spawnShockwave(ALLIED_BASE_POS[0], ALLIED_BASE_POS[1], '#ef4444', 2, 20, 0.85);
      this.spawnBurst(ALLIED_BASE_POS[0], 4.2, ALLIED_BASE_POS[1], '#ef4444', 48);
      this.finishMatch(
        'red',
        `Kubu Sekutu telah dimusnahkan oleh Pasukan Merah (${this.blueTeamCards} Kad vs ${this.redTeamCards} Kad).`
      );
    }
  }

  private syncAllHeroRecords() {
    const pRec = this.heroRecords.get('player');
    if (pRec) {
      pRec.level = this.playerLevel;
      pRec.gold = Math.floor(this.playerGold);
      pRec.items = [...this.equippedItemIds];
    }
    for (const ai of [...this.alliedHeroes, ...this.enemyHeroes]) {
      const rec = this.heroRecords.get(ai.id);
      if (rec) {
        rec.level = ai.level;
        rec.gold = Math.floor(ai.gold);
        rec.items = [...ai.items];
      }
    }
  }

  private buildHeroStatsList(includeAwards: boolean, winnerTeam?: TeamSide): MatchHeroStats[] {
    this.syncAllHeroRecords();
    const list: MatchHeroStats[] = this.heroOrderIds
      .map((id) => this.heroRecords.get(id))
      .filter((r): r is HeroMatchRecord => Boolean(r))
      .map((r) => {
        const score = Math.round(
          r.kills * 120 +
            r.assists * 65 +
            r.cardsEarned * 90 -
            r.deaths * 45 +
            r.damageDealt * 0.06 +
            r.objectiveDamage * 0.04 +
            r.healingDone * 0.05
        );
        return {
          id: r.id,
          heroDef: r.heroDef,
          team: r.team,
          isPlayer: r.isPlayer,
          lane: r.lane,
          level: r.level,
          kills: r.kills,
          deaths: r.deaths,
          assists: r.assists,
          cardsEarned: r.cardsEarned,
          gold: r.gold,
          items: [...r.items],
          damageDealt: Math.round(r.damageDealt),
          score: Math.max(0, score),
        };
      });

    if (includeAwards && list.length > 0) {
      const sorted = [...list].sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        if (b.kills !== a.kills) return b.kills - a.kills;
        return a.deaths - b.deaths;
      });
      // MVP goes to top performer on winning team (or top overall if tied/fallback)
      const winnerTop = winnerTeam ? sorted.find((s) => s.team === winnerTeam) : undefined;
      const mvpHero = winnerTop || sorted[0];
      mvpHero.award = 'MVP';

      const remaining = sorted.filter((s) => s.id !== mvpHero.id);
      remaining.forEach((entry, idx) => {
        if (idx < 3) entry.award = 'GOLD';
        else if (idx < 6) entry.award = 'SILVER';
        else entry.award = 'BRONZE';
      });
    }

    return list;
  }

  private finishMatch(winnerTeam: TeamSide, winReason: string) {
    if (this.mode !== 'playing') return;
    this.syncAllHeroRecords();

    const standings = this.buildHeroStatsList(true, winnerTeam);
    this.matchResult = {
      winnerTeam,
      blueCards: this.blueTeamCards,
      redCards: this.redTeamCards,
      blueKills: this.blueTeamKills,
      redKills: this.redTeamKills,
      durationSec: Math.round(this.gameTimeSec),
      winReason,
      standings,
    };

    this.autoAttackHeld = false;
    if (winnerTeam === 'blue') {
      this.unlockAchievement('master_adjektif');
      this.mode = 'victory';
      soundEngine.playAnnouncer('victory');
      soundEngine.setMusicMode('victory');
      soundEngine.playVictoryCelebration();
      this.pushHudSnapshot();
      this.callbacks.onVictory();
    } else {
      this.mode = 'defeat';
      soundEngine.playDefeat();
      soundEngine.playAnnouncer('defeat');
      soundEngine.setMusicMode('defeat');
      this.pushHudSnapshot();
      this.callbacks.onDefeat();
    }
  }

  private damageMinion(
    m: MinionEntity,
    rawDamage: number,
    fromPlayer = false,
    isCrit = false,
    attackerHeroId?: string
  ) {
    if (!m.alive) return;
    m.hp = Math.max(0, m.hp - Math.round(rawDamage));
    if (fromPlayer) {
      this.applyLifesteal(rawDamage);
      this.spawnFloatingText(m.x, 1.9, m.z, isCrit ? `-${rawDamage}!` : `-${rawDamage}`, '#e2e8f0');
    }
    if (m.hp <= 0) {
      m.alive = false;
      this.scene.remove(m.mesh);
      disposeObject3D(m.mesh);
      const xp = m.type === 'siege' ? 58 : 34;
      const gold = m.type === 'siege' ? 55 : 28;
      if (m.team === 'enemy' && (fromPlayer || Math.hypot(m.x - this.playerX, m.z - this.playerZ) <= 26)) {
        this.awardXpAndGold(xp, gold, 0, true);
      }
      if (attackerHeroId && attackerHeroId !== 'player') {
        const ai = [...this.alliedHeroes, ...this.enemyHeroes].find((h) => h.id === attackerHeroId);
        if (ai) this.awardAiXpAndGold(ai, xp, gold);
      }
    }
  }

  private damageCamp(camp: JungleCampState, rawDamage: number, isCrit = false, attackerHeroId = 'player') {
    if (!camp.alive) return;
    camp.hp = Math.max(0, camp.hp - rawDamage);
    camp.aggro = true;
    const fromPlayer = attackerHeroId === 'player';
    if (fromPlayer) {
      this.applyLifesteal(rawDamage);
      soundEngine.playHit(isCrit);
      this.spawnBurst(camp.x, 1.0, camp.z, '#fb923c', 8);
      this.spawnFloatingText(camp.x, 2.1, camp.z, isCrit ? `-${rawDamage}!` : `-${rawDamage}`, '#ffffff');
    }

    if (camp.hp <= 0) {
      camp.alive = false;
      camp.respawnTimer = camp.def.respawnTime;
      camp.mesh.visible = false;

      if (fromPlayer && this.heroDef?.id === 'balmond') {
        const heal = Math.round(this.playerMaxHp * 0.12);
        this.playerHp = Math.min(this.playerMaxHp, this.playerHp + heal);
      }

      if (camp.def.buffType === 'red') {
        this.redBuffTimer = 28;
        soundEngine.playBuffGain('red');
        this.showCombatAlert('BUFF MERAH AKTIF: +20% SERANGAN (28s)!');
      } else if (camp.def.buffType === 'blue') {
        this.blueBuffTimer = 28;
        this.recomputeStats(false);
        soundEngine.playBuffGain('blue');
        this.showCombatAlert('BUFF BIRU AKTIF: -15% MASA MENUNGGU & PENJANAAN HP!');
      } else if (camp.def.buffType === 'turtle') {
        this.turtleBuffTimer = 35;
        this.playerShield = Math.max(this.playerShield, Math.round(this.playerMaxHp * 0.28));
        this.playerShieldTimer = 18;
        soundEngine.playBuffGain('turtle');
        soundEngine.playAnnouncer('turtle_defeated');
        this.unlockAchievement('turtle_slayer');
        this.showCombatAlert('TURTLE DITEWASKAN! PERISAI & KUASA PENYU PURBA AKTIF (35s)!', 3.4);
      }

      this.spawnBurst(camp.x, 1.0, camp.z, camp.def.color, 24);
      this.awardXpAndGold(camp.def.xpReward, camp.def.goldReward, camp.def.shardReward);
      if (Math.random() < 0.65) {
        this.spawnOrb(camp.x, camp.z, Math.random() < 0.7 ? 'heal' : 'buff');
      }
    }
  }

  private spawnOrb(x: number, z: number, type: 'heal' | 'buff') {
    const color = type === 'heal' ? '#34d399' : '#fbbf24';
    const mesh = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.45, 0),
      new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.9, roughness: 0.15 })
    );
    mesh.position.set(x, groundHeightAt(x, z) + 0.95, z);
    this.scene.add(mesh);
    this.pickupOrbs.push({ mesh, x, z, type, age: 0 });
  }

  private awardXpAndGold(xp: number, gold: number, shards: number, quiet = false) {
    const finalGold = Math.round(gold * (1 + this.goldBonus));
    this.playerXp += xp;
    this.playerGold += finalGold;
    this.totalGoldEarned += finalGold;
    this.playerShards += shards;
    if (!quiet) {
      soundEngine.playGold();
      this.spawnFloatingText(this.playerX, 2.7, this.playerZ, `+${xp} XP · +${finalGold} Emas`, '#38bdf8');
    }

    while (this.playerXp >= this.playerXpToNext) {
      this.playerXp -= this.playerXpToNext;
      this.playerLevel += 1;
      this.playerXpToNext = Math.round(this.playerXpToNext * 1.28);
      this.recomputeStats(false);
      this.playerHp = Math.min(this.playerMaxHp, this.playerHp + Math.round(this.playerMaxHp * 0.35));
      soundEngine.playLevelUp();
      this.spawnShockwave(this.playerX, this.playerZ, '#fbbf24', 0.8, 5.5, 0.45);
      this.spawnFloatingText(this.playerX, 3.3, this.playerZ, `NAIK TAHAP ${this.playerLevel}!`, '#fbbf24');
    }
  }

  private damagePlayer(rawDamage: number, attackerHeroId?: string) {
    if (this.mode !== 'playing' || this.invulnTimer > 0 || this.playerRespawnTimer > 0) return;
    let dmg = Math.max(3, Math.round(rawDamage - this.baseDefense * 0.45));
    if (this.playerShield > 0) {
      const absorbed = Math.min(this.playerShield, dmg);
      this.playerShield -= absorbed;
      dmg -= absorbed;
    }
    if (dmg > 0) {
      this.playerHp = Math.max(0, this.playerHp - dmg);
      this.recordHeroDamage(attackerHeroId, 'player', dmg);
      if (this.heroDef?.id === 'fredrinn') {
        this.passiveStacks = Math.min(5, this.passiveStacks + 1);
        this.passiveTimer = 5.0;
      }
      soundEngine.playPlayerHurt();
      this.spawnFloatingText(this.playerX, 2.3, this.playerZ, `-${dmg}`, '#f87171');

      if (
        this.playerHp > 0 &&
        this.playerHp < this.playerMaxHp * 0.28 &&
        this.emergencySaveCd <= 0 &&
        this.heroDef &&
        ['nana', 'aurora', 'johnson'].includes(this.heroDef.id)
      ) {
        this.emergencySaveCd = 24;
        this.invulnTimer = 1.6;
        this.playerShield = Math.round(this.playerMaxHp * 0.32);
        this.playerShieldTimer = 4.0;
        this.showCombatAlert(`${this.heroDef.passive.name.toUpperCase()}: PERISAI KECEMASAN AKTIF!`);
        this.spawnBurst(this.playerX, 1.3, this.playerZ, this.heroDef.appearance.accentColor, 24);
      }

      if (this.playerHp <= 0) {
        this.playerRespawnTimer = 4.5;
        this.autoAttackHeld = false;
        if (this.playerRig) this.playerRig.root.visible = false;
        this.handleHeroKill(attackerHeroId, 'player', this.playerX, this.playerZ);
      }
    }
  }

  private unlockAchievement(id: string) {
    if (this.unlockedAchievements.has(id)) return;
    this.unlockedAchievements.add(id);
    soundEngine.playAchievement();
    this.callbacks.onAchievementUnlocked(id);
  }

  private spawnFloatingText(wx: number, wyOffset: number, wz: number, text: string, color: string) {
    _vec3A.set(wx, groundHeightAt(wx, wz) + wyOffset, wz);
    _vec3A.project(this.camera);
    if (_vec3A.z > 1) return;
    const sx = ((_vec3A.x + 1) / 2) * 100;
    const sy = (-(_vec3A.y - 1) / 2) * 100;
    this.floatingTexts.push({
      id: this.nextFloatId++,
      x: THREE.MathUtils.clamp(sx, 8, 92),
      y: THREE.MathUtils.clamp(sy, 10, 88),
      text,
      color,
      createdAt: performance.now(),
    });
    if (this.floatingTexts.length > 14) this.floatingTexts.shift();
  }

  private getMoveInputVector(): { mx: number; mz: number } {
    let rawX = this.joystickVec.x;
    let rawZ = this.joystickVec.y;
    if (this.keys['KeyW'] || this.keys['ArrowUp']) rawZ -= 1;
    if (this.keys['KeyS'] || this.keys['ArrowDown']) rawZ += 1;
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) rawX -= 1;
    if (this.keys['KeyD'] || this.keys['ArrowRight']) rawX += 1;
    const len = Math.hypot(rawX, rawZ);
    if (len > 1) {
      rawX /= len;
      rawZ /= len;
    }
    if (this.cameraYawOffset === 0 || (rawX === 0 && rawZ === 0)) {
      return { mx: rawX, mz: rawZ };
    }
    const cos = Math.cos(this.cameraYawOffset);
    const sin = Math.sin(this.cameraYawOffset);
    return {
      mx: rawX * cos + rawZ * sin,
      mz: -rawX * sin + rawZ * cos,
    };
  }

  private resolveObstacles(x: number, z: number, entityRadius = 0.78): [number, number] {
    let rx = x;
    let rz = z;
    const dist = Math.hypot(rx, rz);
    const maxR = WORLD_RADIUS - 2;
    if (dist > maxR) {
      rx = (rx / dist) * maxR;
      rz = (rz / dist) * maxR;
    }
    for (const obs of this.world.obstacles) {
      const dx = rx - obs.x;
      const dz = rz - obs.z;
      const minDist = obs.radius + entityRadius;
      const d2 = dx * dx + dz * dz;
      if (d2 < minDist * minDist && d2 > 0.0001) {
        const d = Math.sqrt(d2);
        const push = minDist - d;
        rx += (dx / d) * push;
        rz += (dz / d) * push;
      }
    }
    return [rx, rz];
  }

  private startLoop() {
    const afterDraw = (cb: () => void) => {
      const gl = this.renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (this.disposed) return;
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          this.frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          this.frameId = window.setTimeout(cb, 80);
        }
      };
      this.frameId = window.setTimeout(poll, 5);
    };

    const tick = () => {
      if (this.disposed) return;
      const dt = Math.min(this.clock.getDelta(), 0.05);
      const elapsed = this.clock.getElapsedTime();

      this.updateEnvironment(dt, elapsed);

      if (this.mode === 'menu') {
        this.menuOrbitAngle += dt * 0.13;
        const camR = 70;
        this.camera.position.set(
          Math.cos(this.menuOrbitAngle) * camR,
          30 + Math.sin(elapsed * 0.4) * 3,
          Math.sin(this.menuOrbitAngle) * camR
        );
        this.camera.lookAt(0, 2, 0);
      } else if (this.mode === 'playing') {
        this.updateGameplay(dt, elapsed);
      } else if (this.mode === 'victory') {
        this.updateVictoryCelebration(dt, elapsed);
      }

      this.renderer.render(this.scene, this.camera);
      if (this.isSoftwareGl) afterDraw(tick);
      else this.frameId = requestAnimationFrame(tick);
    };
    tick();
  }

  private updateEnvironment(dt: number, elapsed: number) {
    this.world.waterTexture.offset.y -= dt * 0.38;

    this.world.crystalsGroup.children.forEach((c) => {
      const phase = c.userData.phase || 0;
      c.rotation.y += dt * 0.75;
      c.position.y += Math.sin(elapsed * 2 + phase) * 0.0025;
    });

    this.world.fountainRings.forEach((r, idx) => {
      const s = 0.96 + Math.sin(elapsed * 2.4 + idx) * 0.04;
      r.scale.setScalar(s);
    });

    this.world.cloudsGroup.children.forEach((cg, idx) => {
      cg.position.x += dt * (0.65 + (idx % 3) * 0.25);
      if (cg.position.x > 160) cg.position.x = -160;
    });

    this.world.ambientParticles.rotation.y += dt * 0.025;
    this.world.grassTuftsMesh.rotation.z = Math.sin(elapsed * 1.6) * 0.006;

    // Spin Base & Turret Crystals & Animate Protective Energy Shields
    if (this.alliedBase) this.alliedBase.coreCrystal.rotation.y += dt * 1.2;
    if (this.enemyBase) this.enemyBase.coreCrystal.rotation.y -= dt * 1.2;
    for (const t of this.turrets) {
      if (!t.alive) continue;
      t.crystal.rotation.y += dt * 1.45;
      t.crystalRecoil = Math.max(0, t.crystalRecoil - dt * 2.5);
      const pulse = 1 + t.crystalRecoil * 0.25;
      t.crystal.scale.set(0.88 * pulse, 1.65 * pulse, 0.88 * pulse);
      if (t.shield > 0) {
        t.shieldFlashTimer = Math.max(0, t.shieldFlashTimer - dt);
        const shieldMat = t.shieldDome.material as THREE.MeshPhysicalMaterial;
        const ringMat = t.shieldRing.material as THREE.MeshBasicMaterial;
        const flashBoost = t.shieldFlashTimer > 0 ? 0.36 : 0;
        shieldMat.opacity = 0.24 + Math.sin(elapsed * 2.6) * 0.05 + flashBoost;
        shieldMat.emissiveIntensity = 0.42 + flashBoost * 2.2;
        if (shieldMat.map) {
          shieldMat.map.offset.x += dt * 0.14;
          shieldMat.map.offset.y += dt * 0.08;
        }
        ringMat.opacity = 0.5 + Math.sin(elapsed * 3.1) * 0.12 + flashBoost;
        const sPulse = 1 + (t.shieldFlashTimer > 0 ? 0.06 : Math.sin(elapsed * 2.2) * 0.015);
        t.shieldDome.scale.setScalar(sPulse);
        t.shieldRing.rotation.z += dt * 0.45;
      }
    }
    if (this.enemyBase?.shieldDome && !this.enemyBase.vulnerable) {
      const bMat = this.enemyBase.shieldDome.material as THREE.MeshBasicMaterial;
      if (bMat.map) {
        bMat.map.offset.x -= dt * 0.1;
        bMat.map.offset.y += dt * 0.06;
      }
    }
  }

  private updateGameplay(dt: number, elapsed: number) {
    this.gameTimeSec += dt;

    this.cdBasic = Math.max(0, this.cdBasic - dt);
    this.cdSkill1 = Math.max(0, this.cdSkill1 - dt);
    this.cdSkill2 = Math.max(0, this.cdSkill2 - dt);
    this.cdUltimate = Math.max(0, this.cdUltimate - dt);
    this.cdDash = Math.max(0, this.cdDash - dt);
    this.buffTimer = Math.max(0, this.buffTimer - dt);
    this.redBuffTimer = Math.max(0, this.redBuffTimer - dt);
    this.turtleBuffTimer = Math.max(0, this.turtleBuffTimer - dt);
    this.lordIntroTimer = Math.max(0, this.lordIntroTimer - dt);
    this.emergencySaveCd = Math.max(0, this.emergencySaveCd - dt);
    this.invulnTimer = Math.max(0, this.invulnTimer - dt);
    this.attackAnimTimer = Math.max(0, this.attackAnimTimer - dt);
    this.baseAttackAlertCooldown = Math.max(0, this.baseAttackAlertCooldown - dt);

    if (this.blueBuffTimer > 0) {
      this.blueBuffTimer = Math.max(0, this.blueBuffTimer - dt);
      if (this.blueBuffTimer === 0) this.recomputeStats(false);
    }

    if (this.passiveTimer > 0) {
      this.passiveTimer -= dt;
      if (this.passiveTimer <= 0) this.passiveStacks = 0;
    }

    if (this.playerShieldTimer > 0) {
      this.playerShieldTimer -= dt;
      if (this.playerShieldTimer <= 0) this.playerShield = 0;
    }
    if (this.combatAlertTimer > 0) {
      this.combatAlertTimer -= dt;
      if (this.combatAlertTimer <= 0) this.combatAlert = null;
    }

    // Handle Player Respawn if fallen
    if (this.playerRespawnTimer > 0) {
      this.playerRespawnTimer = Math.max(0, this.playerRespawnTimer - dt);
      if (this.playerRespawnTimer === 0) {
        this.playerX = ALLIED_BASE_POS[0] + 4;
        this.playerZ = ALLIED_BASE_POS[1] - 4;
        this.playerHp = this.playerMaxHp;
        this.playerMana = this.playerMaxMana;
        this.invulnTimer = 2.0;
        if (this.playerRig) this.playerRig.root.visible = true;
        this.spawnBurst(this.playerX, 1.5, this.playerZ, '#38bdf8', 24);
        this.showCombatAlert('WIRA BANGKIT SEMULA DI KUBU SEKUTU!', 2.5);
      }
    }

    if (this.playerRespawnTimer <= 0) {
      if (this.regenPerSec > 0 && this.playerHp < this.playerMaxHp) {
        this.playerHp = Math.min(this.playerMaxHp, this.playerHp + this.regenPerSec * dt);
      }
      if (this.playerMana < this.playerMaxMana) {
        this.playerMana = Math.min(this.playerMaxMana, this.playerMana + this.manaRegenPerSec * dt);
      }
    }
    this.playerGold += dt * 1.8;
    this.totalGoldEarned += dt * 1.8;

    // Continuous Auto-Attack
    if (this.playerRespawnTimer <= 0 && this.autoAttackHeld && this.cdBasic <= 0) {
      const inRange = this.getPreferredTarget(this.attackRange + 2.5);
      if (inRange) {
        this.triggerBasicAttack();
      } else if (this.autoChase) {
        this.chaseGoalActive = true;
      }
    }

    // Player Movement
    let moving = false;
    const manualInput = this.getMoveInputVector();
    const hasManualInput = manualInput.mx !== 0 || manualInput.mz !== 0;
    if (hasManualInput) this.chaseGoalActive = false;

    if (this.playerRespawnTimer <= 0) {
      const turtleSpdBonus = this.turtleBuffTimer > 0 ? 1.2 : 0;
      const bushSpd = this.heroDef?.id === 'natalia' && this.inBush ? 1.25 : 1.0;

      if (this.dashTimer > 0) {
        this.dashTimer -= dt;
        const nx = this.playerX + this.dashDirX * this.dashSpeed * dt;
        const nz = this.playerZ + this.dashDirZ * this.dashSpeed * dt;
        [this.playerX, this.playerZ] = this.resolveObstacles(nx, nz);
        moving = true;
      } else if (hasManualInput) {
        moving = true;
        const speedMult = (this.buffTimer > 0 ? 1.28 : 1.0) * bushSpd;
        const effSpeed = (this.baseSpeed + turtleSpdBonus) * speedMult;
        const nx = this.playerX + manualInput.mx * effSpeed * dt;
        const nz = this.playerZ + manualInput.mz * effSpeed * dt;
        [this.playerX, this.playerZ] = this.resolveObstacles(nx, nz);
        const targetYaw = Math.atan2(manualInput.mx, manualInput.mz);
        let diff = targetYaw - this.playerYaw;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        this.playerYaw += diff * Math.min(1, dt * 14);
      } else if (this.autoChase && (this.chaseGoalActive || this.autoAttackHeld)) {
        const target = this.getPreferredTarget(55);
        if (target) {
          if (target.dist > this.attackRange * 0.88) {
            moving = true;
            const speedMult = this.buffTimer > 0 ? 1.25 : 1.0;
            const effSpeed = (this.baseSpeed + turtleSpdBonus) * speedMult;
            const dx = target.x - this.playerX;
            const dz = target.z - this.playerZ;
            const nx = this.playerX + (dx / target.dist) * effSpeed * dt;
            const nz = this.playerZ + (dz / target.dist) * effSpeed * dt;
            [this.playerX, this.playerZ] = this.resolveObstacles(nx, nz);
            this.playerYaw = Math.atan2(dx, dz);
          } else {
            this.chaseGoalActive = false;
            if (this.cdBasic <= 0) this.triggerBasicAttack();
          }
        } else {
          this.chaseGoalActive = false;
        }
      }
    }

    // Target Reticle
    const visibleTarget = this.getPreferredTarget(this.attackRange + 15);
    if (visibleTarget && this.playerRespawnTimer <= 0) {
      this.targetReticle.visible = true;
      const ty = groundHeightAt(visibleTarget.x, visibleTarget.z) + 0.14;
      this.targetReticle.position.set(visibleTarget.x, ty, visibleTarget.z);
      this.targetReticle.rotation.z = elapsed * 2.2;
      const inAtkRange = visibleTarget.dist <= this.attackRange + 2.5;
      (this.targetReticle.material as THREE.MeshBasicMaterial).color.set(inAtkRange ? '#ef4444' : '#fbbf24');
    } else {
      this.targetReticle.visible = false;
    }

    this.inBush = this.world.bushes.some((b) => Math.hypot(this.playerX - b.x, this.playerZ - b.z) <= b.radius);
    this.inFountain = HEALING_FOUNTAINS.some((f) => Math.hypot(this.playerX - f.pos[0], this.playerZ - f.pos[1]) <= f.radius);
    if (this.inFountain && this.playerRespawnTimer <= 0) {
      if (this.playerHp < this.playerMaxHp) {
        this.playerHp = Math.min(this.playerMaxHp, this.playerHp + this.playerMaxHp * 0.18 * dt);
      }
      if (this.playerMana < this.playerMaxMana) {
        this.playerMana = Math.min(this.playerMaxMana, this.playerMana + this.playerMaxMana * 0.28 * dt);
      }
    }

    const py = groundHeightAt(this.playerX, this.playerZ);
    this.rangeRing.position.set(this.playerX, py + 0.08, this.playerZ);

    if (this.playerRig) {
      this.playerRig.root.position.set(this.playerX, py, this.playerZ);
      this.playerRig.root.rotation.y = this.playerYaw;
      this.animateRig(this.playerRig, moving, this.attackAnimTimer > 0, elapsed, dt);
      if (this.playerRig.backOrbit) this.playerRig.backOrbit.rotation.z += dt * 3.0;
      if (this.playerRig.auraRing) {
        (this.playerRig.auraRing.material as THREE.MeshBasicMaterial).color.set(
          this.turtleBuffTimer > 0
            ? '#10b981'
            : this.playerShield > 0
            ? '#38bdf8'
            : this.redBuffTimer > 0
            ? '#ef4444'
            : this.buffTimer > 0
            ? '#34d399'
            : this.heroDef?.appearance.accentColor || '#fbbf24'
        );
      }
    }
    if (this.playerShadow) {
      this.playerShadow.visible = this.playerRespawnTimer <= 0;
      this.playerShadow.position.set(this.playerX, py + 0.03, this.playerZ);
    }

    // Elevated MOBA Third-Person Chase Camera
    const distZ = 18.0 * this.cameraZoom;
    const heightY = 20.5 * this.cameraZoom;
    _vec3B.set(
      this.playerX + Math.sin(this.cameraYawOffset) * distZ,
      py + heightY,
      this.playerZ + Math.cos(this.cameraYawOffset) * distZ
    );
    this.camera.position.x = THREE.MathUtils.damp(this.camera.position.x, _vec3B.x, 7.8, dt);
    this.camera.position.y = THREE.MathUtils.damp(this.camera.position.y, _vec3B.y, 7.8, dt);
    this.camera.position.z = THREE.MathUtils.damp(this.camera.position.z, _vec3B.z, 7.8, dt);
    this.camera.lookAt(this.playerX, py + 1.0, this.playerZ);

    // Update 5V5 Battlefield Systems
    this.updateAiHeroes(dt, elapsed);
    this.updateMinionsAndWaves(dt);
    this.updateTurretsAndBases(dt);
    this.updateLordPitAndAlliedLord(dt, elapsed);
    this.updateJungleCamps(dt, elapsed);
    this.updateProjectiles(dt);
    this.updateVfx(dt);
    this.updatePickupOrbs(dt, elapsed);

    const anyHeroInCombat =
      this.alliedHeroes.some((h) => h.alive && h.inCombat) || this.enemyHeroes.some((h) => h.alive && h.inCombat);
    if (this.lordPit.alive && this.lordPit.inCombat) {
      soundEngine.setMusicMode('boss');
    } else if (anyHeroInCombat) {
      soundEngine.setMusicMode('combat');
    } else {
      soundEngine.setMusicMode('explore');
    }

    this.hudSyncAccum += dt;
    if (this.hudSyncAccum >= 0.065) {
      this.hudSyncAccum = 0;
      this.pushHudSnapshot();
    }
  }

  private animateRig(rig: AnimatedRig, moving: boolean, attacking: boolean, t: number, dt = 0.016) {
    const swing = moving ? Math.sin(t * 13) * 0.68 : 0;
    const targetLeftLeg = moving ? swing : 0;
    const targetRightLeg = moving ? -swing : 0;
    const targetLeftArm = moving ? -swing * 0.72 : Math.sin(t * 2.2) * 0.04;
    const targetBodyY = moving ? Math.abs(Math.sin(t * 13)) * 0.075 : Math.sin(t * 2.5) * 0.032;
    const targetLeanX = moving ? 0.09 : attacking ? 0.06 : 0;
    const targetRightArm = attacking
      ? -1.35 + Math.sin(t * 26) * 0.58
      : moving
        ? swing * 0.56
        : -0.18 + Math.sin(t * 2.2) * 0.04;

    rig.leftLeg.rotation.x = THREE.MathUtils.damp(rig.leftLeg.rotation.x, targetLeftLeg, 14, dt);
    rig.rightLeg.rotation.x = THREE.MathUtils.damp(rig.rightLeg.rotation.x, targetRightLeg, 14, dt);
    rig.leftArm.rotation.x = THREE.MathUtils.damp(rig.leftArm.rotation.x, targetLeftArm, 14, dt);
    rig.rightArm.rotation.x = THREE.MathUtils.damp(rig.rightArm.rotation.x, targetRightArm, 18, dt);
    rig.bodyGroup.position.y = THREE.MathUtils.damp(rig.bodyGroup.position.y, targetBodyY, 14, dt);
    rig.bodyGroup.rotation.x = THREE.MathUtils.damp(rig.bodyGroup.rotation.x, targetLeanX, 12, dt);
    if (rig.cape) {
      const targetCapeX = moving ? 0.36 + Math.sin(t * 11) * 0.08 : 0.16 + Math.sin(t * 2.6) * 0.04;
      rig.cape.rotation.x = THREE.MathUtils.damp(rig.cape.rotation.x, targetCapeX, 10, dt);
    }
  }

  private updateAiHeroes(dt: number, elapsed: number) {
    const allAi = [...this.alliedHeroes, ...this.enemyHeroes];

    for (const ai of allAi) {
      if (!ai.alive) {
        ai.respawnTimer -= dt;
        if (ai.respawnTimer <= 0) {
          this.respawnAiHero(ai);
        }
        continue;
      }

      // Passive AI gold trickle, mana regen & shield decay
      ai.gold += dt * 1.9;
      ai.mana = Math.min(ai.maxMana, ai.mana + 15 * dt);
      ai.attackTimer = Math.max(0, ai.attackTimer - dt);
      ai.abilityTimer = Math.max(0, ai.abilityTimer - dt);
      ai.skill2Timer = Math.max(0, ai.skill2Timer - dt);
      ai.attackAnimTimer = Math.max(0, ai.attackAnimTimer - dt);
      ai.slowTimer = Math.max(0, ai.slowTimer - dt);
      ai.buffTimer = Math.max(0, ai.buffTimer - dt);
      if (ai.shieldTimer > 0) {
        ai.shieldTimer -= dt;
        if (ai.shieldTimer <= 0) ai.shield = 0;
      }

      // Support/Tank AI passive healing for nearby teammates
      if (ai.heroDef.roleId === 'support' && ai.skill2Timer <= 0) {
        ai.skill2Timer = 7.5;
        const healAmt = Math.round(ai.maxHp * 0.14);
        if (ai.team === 'blue') {
          if (this.playerRespawnTimer <= 0 && Math.hypot(this.playerX - ai.x, this.playerZ - ai.z) <= 12) {
            this.playerHp = Math.min(this.playerMaxHp, this.playerHp + healAmt);
            this.recordHeroSupport(ai.id, 'player', healAmt);
            this.spawnFloatingText(this.playerX, 2.3, this.playerZ, `+${healAmt} HP`, '#34d399');
          }
          for (const ally of this.alliedHeroes) {
            if (ally.alive && ally.id !== ai.id && Math.hypot(ally.x - ai.x, ally.z - ai.z) <= 12) {
              ally.hp = Math.min(ally.maxHp, ally.hp + healAmt);
              this.recordHeroSupport(ai.id, ally.id, healAmt);
            }
          }
        } else {
          for (const ally of this.enemyHeroes) {
            if (ally.alive && ally.id !== ai.id && Math.hypot(ally.x - ai.x, ally.z - ai.z) <= 12) {
              ally.hp = Math.min(ally.maxHp, ally.hp + healAmt);
              this.recordHeroSupport(ai.id, ally.id, healAmt);
            }
          }
        }
      }

      if (ai.hp < ai.maxHp * 0.22) ai.retreating = true;
      else if (ai.hp > ai.maxHp * 0.68) ai.retreating = false;

      let moving = false;
      const spd = ai.speed * (ai.slowTimer > 0 ? 0.55 : 1.0) * (ai.buffTimer > 0 ? 1.18 : 1.0);
      const homeBase = ai.team === 'blue' ? ALLIED_BASE_POS : ENEMY_BASE_POS;
      const oppStructureTeam = ai.team === 'blue' ? 'enemy' : 'ally';

      if (ai.retreating) {
        const dx = homeBase[0] - ai.x;
        const dz = homeBase[1] - ai.z;
        const dist = Math.hypot(dx, dz);
        if (dist > 6.5) {
          [ai.x, ai.z] = this.resolveObstacles(ai.x + (dx / dist) * spd * dt, ai.z + (dz / dist) * spd * dt, 0.8);
          ai.yaw = Math.atan2(dx, dz);
          moving = true;
        } else {
          ai.hp = Math.min(ai.maxHp, ai.hp + ai.maxHp * 0.26 * dt);
        }
        ai.inCombat = false;
      } else {
        // Target acquisition: Opposing Heroes (23m) > Opposing Minions (17m) > Opposing Turrets (16m) > Opposing Base (17m)
        let targetX = 0;
        let targetZ = 0;
        let targetKind: 'player' | 'ai_hero' | 'minion' | 'turret' | 'base' | 'none' = 'none';
        let targetAi: AiHeroState | null = null;
        let targetMinion: MinionEntity | null = null;
        let targetTurret: TurretState | null = null;
        let bestDist = 23;

        if (ai.team === 'red') {
          if (this.playerRespawnTimer <= 0) {
            const dp = Math.hypot(this.playerX - ai.x, this.playerZ - ai.z);
            const visionRange = this.inBush ? 10 : 21;
            if (dp <= visionRange && dp < bestDist) {
              bestDist = dp;
              targetX = this.playerX;
              targetZ = this.playerZ;
              targetKind = 'player';
            }
          }
          for (const ah of this.alliedHeroes) {
            if (!ah.alive) continue;
            const d = Math.hypot(ah.x - ai.x, ah.z - ai.z);
            if (d < bestDist) {
              bestDist = d;
              targetX = ah.x;
              targetZ = ah.z;
              targetKind = 'ai_hero';
              targetAi = ah;
            }
          }
        } else {
          for (const eh of this.enemyHeroes) {
            if (!eh.alive) continue;
            const d = Math.hypot(eh.x - ai.x, eh.z - ai.z);
            if (d < bestDist) {
              bestDist = d;
              targetX = eh.x;
              targetZ = eh.z;
              targetKind = 'ai_hero';
              targetAi = eh;
            }
          }
        }

        ai.inCombat = targetKind === 'player' || targetKind === 'ai_hero';

        if (targetKind === 'none') {
          bestDist = 17.5;
          for (const m of this.minions) {
            if (!m.alive || m.team !== oppStructureTeam) continue;
            const d = Math.hypot(m.x - ai.x, m.z - ai.z);
            if (d < bestDist) {
              bestDist = d;
              targetX = m.x;
              targetZ = m.z;
              targetKind = 'minion';
              targetMinion = m;
            }
          }
        }

        if (targetKind === 'none') {
          for (const t of this.turrets) {
            if (!t.alive || t.def.team !== oppStructureTeam) continue;
            const d = Math.hypot(t.def.pos[0] - ai.x, t.def.pos[1] - ai.z);
            if (d < 16.5) {
              bestDist = d;
              targetX = t.def.pos[0];
              targetZ = t.def.pos[1];
              targetKind = 'turret';
              targetTurret = t;
            }
          }
        }

        if (targetKind === 'none') {
          const oppBase = ai.team === 'blue' ? this.enemyBase : this.alliedBase;
          if (oppBase && oppBase.hp > 0) {
            const dBase = Math.hypot(oppBase.x - ai.x, oppBase.z - ai.z);
            if (dBase < 16.5) {
              bestDist = dBase;
              targetX = oppBase.x;
              targetZ = oppBase.z;
              targetKind = 'base';
            }
          }
        }

        if (targetKind !== 'none') {
          const dx = targetX - ai.x;
          const dz = targetZ - ai.z;
          const targetYaw = Math.atan2(dx, dz);
          ai.yaw = targetYaw;
          const stopRange = ai.attackRange * 0.85;

          if (bestDist > stopRange) {
            [ai.x, ai.z] = this.resolveObstacles(
              ai.x + (dx / bestDist) * spd * dt,
              ai.z + (dz / bestDist) * spd * dt,
              0.8
            );
            moving = true;
          }

          if (bestDist <= ai.attackRange + 1.3 && ai.attackTimer <= 0) {
            ai.attackTimer = ai.attackInterval;
            ai.attackAnimTimer = 0.28;
            const isRanged =
              ai.heroDef.roleId === 'marksman' ||
              ai.heroDef.roleId === 'mage' ||
              ai.heroDef.roleId === 'support';
            if (isRanged) {
              this.spawnProjectile({
                x: ai.x,
                z: ai.z,
                yaw: targetYaw,
                speed: 24,
                damage: ai.damage,
                sourceTeam: ai.team,
                attackerHeroId: ai.id,
                fromPlayer: false,
                color: ai.team === 'blue' ? '#38bdf8' : '#ef4444',
                radius: 0.44,
                life: 1.0,
              });
            } else {
              this.spawnShockwave(ai.x, ai.z, ai.team === 'blue' ? '#38bdf8' : '#ef4444', 0.6, 3.0, 0.2);
              if (targetKind === 'player') this.damagePlayer(ai.damage, ai.id);
              else if (targetKind === 'ai_hero' && targetAi) this.damageAiHero(targetAi, ai.damage, ai.id);
              else if (targetKind === 'minion' && targetMinion) this.damageMinion(targetMinion, ai.damage, false, false, ai.id);
              else if (targetKind === 'turret' && targetTurret) this.damageTurret(targetTurret, ai.damage, false, ai.id);
              else if (targetKind === 'base') {
                if (ai.team === 'blue') this.damageEnemyBase(ai.damage, false, ai.id);
                else this.damageAlliedBase(ai.damage, ai.id);
              }
            }
          }

          if ((targetKind === 'player' || targetKind === 'ai_hero') && ai.abilityTimer <= 0 && bestDist <= 14) {
            ai.abilityTimer = ai.abilityCooldown;
            if (targetKind === 'player') soundEngine.playEnemyWarning();
            this.spawnTelegraph(targetX, targetZ, 3.3, 0.9, ai.damage * 1.45, ai.team, ai.id);
          }
        } else {
          // March along assigned lane toward opposing side
          const wps = LANE_WAYPOINTS[ai.lane];
          const wp = wps[THREE.MathUtils.clamp(ai.waypointIdx, 0, wps.length - 1)];
          const dx = wp[0] - ai.x;
          const dz = wp[1] - ai.z;
          const d = Math.hypot(dx, dz);
          if (d < 4.5) {
            if (ai.team === 'blue' && ai.waypointIdx < wps.length - 1) ai.waypointIdx += 1;
            else if (ai.team === 'red' && ai.waypointIdx > 0) ai.waypointIdx -= 1;
          } else if (d > 0.5) {
            [ai.x, ai.z] = this.resolveObstacles(
              ai.x + (dx / d) * spd * 0.8 * dt,
              ai.z + (dz / d) * spd * 0.8 * dt,
              0.8
            );
            ai.yaw = Math.atan2(dx, dz);
            moving = true;
          }
        }
      }

      // Soft separation between AI heroes so they don't stack on identical coordinates
      for (const other of allAi) {
        if (other.id === ai.id || !other.alive) continue;
        const sx = ai.x - other.x;
        const sz = ai.z - other.z;
        const sd = Math.hypot(sx, sz);
        if (sd > 0.01 && sd < 2.1) {
          ai.x += (sx / sd) * (2.1 - sd) * 2.5 * dt;
          ai.z += (sz / sd) * (2.1 - sd) * 2.5 * dt;
        }
      }

      if (ai.rig.backOrbit) ai.rig.backOrbit.rotation.z += dt * 1.8;
      const ay = groundHeightAt(ai.x, ai.z);
      ai.rig.root.position.set(ai.x, ay, ai.z);
      ai.rig.root.rotation.y = ai.yaw;
      this.animateRig(ai.rig, moving, ai.attackAnimTimer > 0, elapsed, dt);
      ai.shadow.position.set(ai.x, ay + 0.03, ai.z);
    }
  }

  private updateMinionsAndWaves(dt: number) {
    this.minionWaveTimer -= dt;
    if (this.minionWaveTimer <= 0) {
      this.minionWaveTimer = 15.0;
      this.waveCounter += 1;
      if (this.minions.length < 28) {
        const lanes: LaneId[] = ['exp', 'mid', 'gold'];
        const hasSiege = this.waveCounter % 3 === 0;
        lanes.forEach((lane) => {
          const wps = LANE_WAYPOINTS[lane];
          this.spawnSingleMinion('ally', 'melee', lane, 0, wps[0][0] + 2, wps[0][1] - 2);
          this.spawnSingleMinion('ally', hasSiege ? 'siege' : 'ranged', lane, 0, wps[0][0] - 2, wps[0][1] + 2);
          const lastIdx = wps.length - 1;
          this.spawnSingleMinion('enemy', 'melee', lane, lastIdx, wps[lastIdx][0] - 2, wps[lastIdx][1] + 2);
          this.spawnSingleMinion('enemy', hasSiege ? 'siege' : 'ranged', lane, lastIdx, wps[lastIdx][0] + 2, wps[lastIdx][1] - 2);
        });
      }
    }

    for (let i = this.minions.length - 1; i >= 0; i--) {
      const m = this.minions[i];
      if (!m.alive) {
        this.minions.splice(i, 1);
        continue;
      }

      m.attackTimer = Math.max(0, m.attackTimer - dt);
      const oppTeam = m.team === 'ally' ? 'enemy' : 'ally';

      let tx = 0;
      let tz = 0;
      let bestDist = 13.5;
      let targetKind: 'minion' | 'hero' | 'player' | 'turret' | 'base' | 'none' = 'none';
      let targetMinion: MinionEntity | null = null;
      let targetHero: AiHeroState | null = null;
      let targetTurret: TurretState | null = null;

      for (const om of this.minions) {
        if (!om.alive || om.team !== oppTeam) continue;
        const d = Math.hypot(om.x - m.x, om.z - m.z);
        if (d < bestDist) {
          bestDist = d;
          tx = om.x;
          tz = om.z;
          targetKind = 'minion';
          targetMinion = om;
        }
      }

      if (targetKind === 'none') {
        for (const t of this.turrets) {
          if (!t.alive || t.def.team !== oppTeam) continue;
          const d = Math.hypot(t.def.pos[0] - m.x, t.def.pos[1] - m.z);
          if (d < 13.5) {
            bestDist = d;
            tx = t.def.pos[0];
            tz = t.def.pos[1];
            targetKind = 'turret';
            targetTurret = t;
          }
        }
      }

      if (targetKind === 'none') {
        if (m.team === 'ally') {
          for (const eh of this.enemyHeroes) {
            if (!eh.alive) continue;
            const d = Math.hypot(eh.x - m.x, eh.z - m.z);
            if (d < 12) {
              bestDist = d;
              tx = eh.x;
              tz = eh.z;
              targetKind = 'hero';
              targetHero = eh;
            }
          }
          if (targetKind === 'none' && this.enemyBase && this.enemyBase.hp > 0) {
            const d = Math.hypot(this.enemyBase.x - m.x, this.enemyBase.z - m.z);
            if (d < 14) {
              bestDist = d;
              tx = this.enemyBase.x;
              tz = this.enemyBase.z;
              targetKind = 'base';
            }
          }
        } else {
          if (this.playerRespawnTimer <= 0) {
            const d = Math.hypot(this.playerX - m.x, this.playerZ - m.z);
            if (d < 11) {
              bestDist = d;
              tx = this.playerX;
              tz = this.playerZ;
              targetKind = 'player';
            }
          }
          if (targetKind === 'none') {
            for (const ah of this.alliedHeroes) {
              if (!ah.alive) continue;
              const d = Math.hypot(ah.x - m.x, ah.z - m.z);
              if (d < 11.5) {
                bestDist = d;
                tx = ah.x;
                tz = ah.z;
                targetKind = 'hero';
                targetHero = ah;
              }
            }
          }
          if (targetKind === 'none' && this.alliedBase && this.alliedBase.hp > 0) {
            const d = Math.hypot(this.alliedBase.x - m.x, this.alliedBase.z - m.z);
            if (d < 14) {
              bestDist = d;
              tx = this.alliedBase.x;
              tz = this.alliedBase.z;
              targetKind = 'base';
            }
          }
        }
      }

      if (targetKind !== 'none') {
        const dx = tx - m.x;
        const dz = tz - m.z;
        m.yaw = Math.atan2(dx, dz);
        if (bestDist > m.range) {
          m.x += (dx / bestDist) * m.speed * dt;
          m.z += (dz / bestDist) * m.speed * dt;
        } else if (m.attackTimer <= 0) {
          m.attackTimer = m.type === 'siege' ? 1.4 : 1.15;
          if (m.type === 'ranged' || m.type === 'siege') {
            this.spawnProjectile({
              x: m.x,
              z: m.z,
              yaw: m.yaw,
              speed: 19,
              damage: m.damage,
              sourceTeam: m.team === 'ally' ? 'blue' : 'red',
              fromPlayer: false,
              color: m.team === 'ally' ? '#38bdf8' : '#ef4444',
              radius: m.type === 'siege' ? 0.42 : 0.3,
              life: 0.9,
            });
          } else {
            if (targetKind === 'minion' && targetMinion) this.damageMinion(targetMinion, m.damage);
            else if (targetKind === 'hero' && targetHero) this.damageAiHero(targetHero, m.damage);
            else if (targetKind === 'player') this.damagePlayer(m.damage);
            else if (targetKind === 'turret' && targetTurret) this.damageTurret(targetTurret, m.damage, false);
            else if (targetKind === 'base') {
              if (m.team === 'ally') this.damageEnemyBase(m.damage, false);
              else this.damageAlliedBase(m.damage);
            }
          }
        }
      } else {
        const wps = LANE_WAYPOINTS[m.lane];
        const wp = wps[m.waypointIdx];
        const dx = wp[0] - m.x;
        const dz = wp[1] - m.z;
        const d = Math.hypot(dx, dz);
        if (d < 3.5) {
          if (m.team === 'ally' && m.waypointIdx < wps.length - 1) m.waypointIdx += 1;
          else if (m.team === 'enemy' && m.waypointIdx > 0) m.waypointIdx -= 1;
        } else {
          m.x += (dx / d) * m.speed * dt;
          m.z += (dz / d) * m.speed * dt;
          m.yaw = Math.atan2(dx, dz);
        }
      }

      m.mesh.position.set(m.x, groundHeightAt(m.x, m.z), m.z);
      m.mesh.rotation.y = m.yaw;
    }
  }

  private spawnSingleMinion(
    team: 'ally' | 'enemy',
    type: 'melee' | 'ranged' | 'siege',
    lane: LaneId,
    waypointIdx: number,
    x: number,
    z: number
  ) {
    const mesh = buildMinionMesh(team, type);
    mesh.position.set(x, groundHeightAt(x, z), z);
    this.scene.add(mesh);
    this.minions.push({
      id: `m_${this.nextMinionId++}`,
      team,
      type,
      lane,
      waypointIdx,
      mesh,
      x,
      z,
      yaw: 0,
      hp: type === 'siege' ? 320 : type === 'melee' ? 175 : 130,
      maxHp: type === 'siege' ? 320 : type === 'melee' ? 175 : 130,
      damage: type === 'siege' ? 28 : type === 'ranged' ? 16 : 13,
      range: type === 'siege' ? 10.5 : type === 'ranged' ? 9.5 : 3.2,
      speed: 5.8,
      attackTimer: 0.6,
      alive: true,
    });
  }

  private updateTurretsAndBases(dt: number) {
    for (const t of this.turrets) {
      if (!t.alive) continue;
      t.attackTimer = Math.max(0, t.attackTimer - dt);
      if (t.attackTimer > 0) continue;

      const oppTeam = t.def.team === 'ally' ? 'enemy' : 'ally';
      let targetX = 0;
      let targetZ = 0;
      let found = false;

      if (t.def.team === 'enemy' && this.alliedLord && this.alliedLord.alive) {
        const d = Math.hypot(this.alliedLord.x - t.def.pos[0], this.alliedLord.z - t.def.pos[1]);
        if (d <= t.def.range) {
          targetX = this.alliedLord.x;
          targetZ = this.alliedLord.z;
          found = true;
        }
      }
      if (!found) {
        let minD = t.def.range;
        for (const m of this.minions) {
          if (!m.alive || m.team !== oppTeam) continue;
          const d = Math.hypot(m.x - t.def.pos[0], m.z - t.def.pos[1]);
          if (d <= minD) {
            minD = d;
            targetX = m.x;
            targetZ = m.z;
            found = true;
          }
        }
      }
      if (!found) {
        if (t.def.team === 'enemy') {
          if (this.playerRespawnTimer <= 0) {
            const d = Math.hypot(this.playerX - t.def.pos[0], this.playerZ - t.def.pos[1]);
            if (d <= t.def.range) {
              targetX = this.playerX;
              targetZ = this.playerZ;
              found = true;
            }
          }
          if (!found) {
            for (const ah of this.alliedHeroes) {
              if (!ah.alive) continue;
              const d = Math.hypot(ah.x - t.def.pos[0], ah.z - t.def.pos[1]);
              if (d <= t.def.range) {
                targetX = ah.x;
                targetZ = ah.z;
                found = true;
                break;
              }
            }
          }
        } else {
          for (const eh of this.enemyHeroes) {
            if (!eh.alive) continue;
            const d = Math.hypot(eh.x - t.def.pos[0], eh.z - t.def.pos[1]);
            if (d <= t.def.range) {
              targetX = eh.x;
              targetZ = eh.z;
              found = true;
              break;
            }
          }
        }
      }

      if (found) {
        t.attackTimer = 1.15;
        t.crystalRecoil = 1.0;
        const yaw = Math.atan2(targetX - t.def.pos[0], targetZ - t.def.pos[1]);
        if (Math.hypot(this.playerX - t.def.pos[0], this.playerZ - t.def.pos[1]) < 32) {
          soundEngine.playTurretShot();
        }
        this.spawnProjectile({
          x: t.def.pos[0],
          z: t.def.pos[1],
          yaw,
          speed: 34,
          damage: t.def.damage,
          sourceTeam: t.def.team === 'ally' ? 'blue' : 'red',
          fromPlayer: false,
          color: t.def.team === 'ally' ? '#38bdf8' : '#ef4444',
          radius: 0.65,
          life: 0.78,
        });
      }
    }

    for (const base of [this.alliedBase, this.enemyBase]) {
      if (!base || base.hp <= 0) continue;
      base.attackTimer = Math.max(0, base.attackTimer - dt);
      if (base.attackTimer > 0) continue;
      const oppTeam = base.team === 'ally' ? 'enemy' : 'ally';
      let targetX = 0;
      let targetZ = 0;
      let found = false;
      for (const m of this.minions) {
        if (m.alive && m.team === oppTeam && Math.hypot(m.x - base.x, m.z - base.z) <= 20) {
          targetX = m.x;
          targetZ = m.z;
          found = true;
          break;
        }
      }
      if (!found && base.team === 'enemy') {
        if (this.playerRespawnTimer <= 0 && Math.hypot(this.playerX - base.x, this.playerZ - base.z) <= 20) {
          targetX = this.playerX;
          targetZ = this.playerZ;
          found = true;
        } else {
          for (const ah of this.alliedHeroes) {
            if (ah.alive && Math.hypot(ah.x - base.x, ah.z - base.z) <= 20) {
              targetX = ah.x;
              targetZ = ah.z;
              found = true;
              break;
            }
          }
        }
      } else if (!found && base.team === 'ally') {
        for (const eh of this.enemyHeroes) {
          if (eh.alive && Math.hypot(eh.x - base.x, eh.z - base.z) <= 20) {
            targetX = eh.x;
            targetZ = eh.z;
            found = true;
            break;
          }
        }
      }
      if (found) {
        base.attackTimer = 1.0;
        this.spawnProjectile({
          x: base.x,
          z: base.z,
          yaw: Math.atan2(targetX - base.x, targetZ - base.z),
          speed: 34,
          damage: 62,
          sourceTeam: base.team === 'ally' ? 'blue' : 'red',
          fromPlayer: false,
          color: base.team === 'ally' ? '#38bdf8' : '#fb7185',
          radius: 0.65,
          life: 0.85,
        });
      }
    }
  }

  private updateLordPitAndAlliedLord(dt: number, elapsed: number) {
    if (!this.lordPit.alive) {
      if (!this.alliedLord || !this.alliedLord.alive) {
        this.lordPit.respawnTimer -= dt;
        if (this.lordPit.respawnTimer <= 0) {
          this.lordPit.alive = true;
          this.lordPit.hp = THE_LORD_BOSS.maxHp;
          this.lordPit.maxHp = THE_LORD_BOSS.maxHp;
          this.lordPit.x = LORD_PIT_POS[0];
          this.lordPit.z = LORD_PIT_POS[1];
          this.lordPit.inCombat = false;
          this.lordPit.rig = buildLordBossRig(THE_LORD_BOSS.scale, false);
          this.lordPit.shadow = new THREE.Mesh(
            new THREE.PlaneGeometry(4.6, 4.6),
            new THREE.MeshBasicMaterial({ map: this.shadowTex, transparent: true, opacity: 0.55, depthWrite: false })
          );
          this.lordPit.shadow.rotation.x = -Math.PI / 2;
          this.lordPit.rig.root.position.set(this.lordPit.x, groundHeightAt(this.lordPit.x, this.lordPit.z), this.lordPit.z);
          this.scene.add(this.lordPit.rig.root, this.lordPit.shadow);

          this.lordIntroTimer = 3.0;
          soundEngine.playLordEntrance();
          soundEngine.playAnnouncer('lord_arrived');
          this.spawnShockwave(this.lordPit.x, this.lordPit.z, '#ef4444', 1.5, 14, 0.8);
          this.showCombatAlert('THE LORD TELAH MUNCUL DI SUNGAI KRISTAL!', 3.6);
        }
      }
    } else if (this.lordPit.rig) {
      this.lordPit.attackTimer = Math.max(0, this.lordPit.attackTimer - dt);
      this.lordPit.abilityTimer = Math.max(0, this.lordPit.abilityTimer - dt);
      this.lordPit.attackAnimTimer = Math.max(0, this.lordPit.attackAnimTimer - dt);
      this.lordPit.slowTimer = Math.max(0, this.lordPit.slowTimer - dt);

      const dx = this.playerX - this.lordPit.x;
      const dz = this.playerZ - this.lordPit.z;
      const dist = this.playerRespawnTimer <= 0 ? Math.hypot(dx, dz) : 999;

      if (dist < 18) this.lordPit.inCombat = true;
      else if (dist > 25) this.lordPit.inCombat = false;

      let moving = false;
      if (this.lordPit.inCombat) {
        this.lordPit.yaw = Math.atan2(dx, dz);
        const spd = THE_LORD_BOSS.speed * (this.lordPit.slowTimer > 0 ? 0.55 : 1.0);
        if (dist > 6.5) {
          this.lordPit.x += (dx / dist) * spd * dt;
          this.lordPit.z += (dz / dist) * spd * dt;
          moving = true;
        }
        if (dist <= THE_LORD_BOSS.attackRange + 1.0 && this.lordPit.attackTimer <= 0) {
          this.lordPit.attackTimer = THE_LORD_BOSS.attackInterval;
          this.lordPit.attackAnimTimer = 0.35;
          this.spawnShockwave(this.lordPit.x, this.lordPit.z, '#ef4444', 0.8, 4.8, 0.25);
          this.damagePlayer(THE_LORD_BOSS.damage);
        }
        if (this.lordPit.abilityTimer <= 0) {
          this.lordPit.abilityTimer = THE_LORD_BOSS.abilityCooldown;
          soundEngine.playEnemyWarning();
          this.spawnTelegraph(this.playerX, this.playerZ, 4.6, 1.15, THE_LORD_BOSS.damage * 1.6, 'neutral');
          this.spawnTelegraph(this.lordPit.x, this.lordPit.z, 6.8, 1.1, THE_LORD_BOSS.damage * 1.6, 'neutral');
        }
      } else {
        const sdx = LORD_PIT_POS[0] - this.lordPit.x;
        const sdz = LORD_PIT_POS[1] - this.lordPit.z;
        const sd = Math.hypot(sdx, sdz);
        if (sd > 1.5) {
          this.lordPit.x += (sdx / sd) * 5.0 * dt;
          this.lordPit.z += (sdz / sd) * 5.0 * dt;
          this.lordPit.yaw = Math.atan2(sdx, sdz);
          moving = true;
        }
      }

      if (moving) {
        this.lordFootstepAccum -= dt;
        if (this.lordFootstepAccum <= 0) {
          this.lordFootstepAccum = 0.52;
          if (Math.hypot(this.playerX - this.lordPit.x, this.playerZ - this.lordPit.z) < 35) {
            soundEngine.playLordFootstep();
          }
        }
      }
      if (this.lordPit.rig.backOrbit) this.lordPit.rig.backOrbit.rotation.z += dt * 1.8;
      const ly = groundHeightAt(this.lordPit.x, this.lordPit.z);
      this.lordPit.rig.root.position.set(this.lordPit.x, ly, this.lordPit.z);
      this.lordPit.rig.root.rotation.y = this.lordPit.yaw;
      this.animateRig(this.lordPit.rig, moving, this.lordPit.attackAnimTimer > 0, elapsed, dt);
      if (this.lordPit.shadow) this.lordPit.shadow.position.set(this.lordPit.x, ly + 0.03, this.lordPit.z);
    }

    if (this.alliedLord && this.alliedLord.alive) {
      const al = this.alliedLord;
      al.attackTimer = Math.max(0, al.attackTimer - dt);
      al.attackAnimTimer = Math.max(0, al.attackAnimTimer - dt);

      let tx = 0;
      let tz = 0;
      let bestDist = 14;
      let targetKind: 'minion' | 'hero' | 'turret' | 'base' | 'none' = 'none';
      let tMinion: MinionEntity | null = null;
      let tHero: AiHeroState | null = null;
      let tTurret: TurretState | null = null;

      for (const t of this.turrets) {
        if (t.alive && t.def.team === 'enemy' && Math.hypot(t.def.pos[0] - al.x, t.def.pos[1] - al.z) < 14) {
          bestDist = Math.hypot(t.def.pos[0] - al.x, t.def.pos[1] - al.z);
          tx = t.def.pos[0];
          tz = t.def.pos[1];
          targetKind = 'turret';
          tTurret = t;
          break;
        }
      }
      if (targetKind === 'none' && this.enemyBase && this.enemyBase.hp > 0) {
        const db = Math.hypot(this.enemyBase.x - al.x, this.enemyBase.z - al.z);
        if (db < 15) {
          bestDist = db;
          tx = this.enemyBase.x;
          tz = this.enemyBase.z;
          targetKind = 'base';
        }
      }
      if (targetKind === 'none') {
        for (const m of this.minions) {
          if (m.alive && m.team === 'enemy' && Math.hypot(m.x - al.x, m.z - al.z) < bestDist) {
            bestDist = Math.hypot(m.x - al.x, m.z - al.z);
            tx = m.x;
            tz = m.z;
            targetKind = 'minion';
            tMinion = m;
          }
        }
      }
      if (targetKind === 'none') {
        for (const eh of this.enemyHeroes) {
          if (eh.alive && Math.hypot(eh.x - al.x, eh.z - al.z) < 12) {
            bestDist = Math.hypot(eh.x - al.x, eh.z - al.z);
            tx = eh.x;
            tz = eh.z;
            targetKind = 'hero';
            tHero = eh;
            break;
          }
        }
      }

      let moving = false;
      if (targetKind !== 'none') {
        al.yaw = Math.atan2(tx - al.x, tz - al.z);
        if (bestDist > 6.2) {
          al.x += ((tx - al.x) / bestDist) * 7.2 * dt;
          al.z += ((tz - al.z) / bestDist) * 7.2 * dt;
          moving = true;
        } else if (al.attackTimer <= 0) {
          al.attackTimer = 1.15;
          al.attackAnimTimer = 0.35;
          this.spawnShockwave(tx, tz, '#38bdf8', 0.8, 5.5, 0.3);
          if (targetKind === 'turret' && tTurret) this.damageTurret(tTurret, al.damage * 1.4, false);
          else if (targetKind === 'base') this.damageEnemyBase(al.damage * 1.4, false);
          else if (targetKind === 'minion' && tMinion) this.damageMinion(tMinion, al.damage * 1.8);
          else if (targetKind === 'hero' && tHero) this.damageAiHero(tHero, al.damage);
        }
      } else {
        const wps = LANE_WAYPOINTS[al.lane];
        const wp = wps[al.waypointIdx];
        const dx = wp[0] - al.x;
        const dz = wp[1] - al.z;
        const d = Math.hypot(dx, dz);
        if (d < 4.5 && al.waypointIdx < wps.length - 1) {
          al.waypointIdx += 1;
        } else if (d > 0.5) {
          al.x += (dx / d) * 7.4 * dt;
          al.z += (dz / d) * 7.4 * dt;
          al.yaw = Math.atan2(dx, dz);
          moving = true;
        }
      }

      if (al.rig.backOrbit) al.rig.backOrbit.rotation.z += dt * 1.8;
      const ay = groundHeightAt(al.x, al.z);
      al.rig.root.position.set(al.x, ay, al.z);
      al.rig.root.rotation.y = al.yaw;
      this.animateRig(al.rig, moving, al.attackAnimTimer > 0, elapsed, dt);
      al.shadow.position.set(al.x, ay + 0.03, al.z);
    }
  }

  private updateJungleCamps(dt: number, elapsed: number) {
    for (const c of this.jungleCamps) {
      if (!c.alive) {
        c.respawnTimer -= dt;
        if (c.respawnTimer <= 0) {
          c.alive = true;
          c.hp = c.maxHp;
          c.aggro = false;
          c.x = c.def.pos[0];
          c.z = c.def.pos[1];
          c.mesh.visible = true;
        }
        continue;
      }

      const gy = groundHeightAt(c.x, c.z);
      if (c.def.type === 'slime') {
        c.mesh.position.set(c.x, gy + Math.abs(Math.sin(elapsed * 3.5)) * 0.25, c.z);
      } else {
        c.mesh.position.set(c.x, gy, c.z);
      }

      if (c.aggro && !c.def.passive && this.playerRespawnTimer <= 0) {
        const dx = this.playerX - c.x;
        const dz = this.playerZ - c.z;
        const dist = Math.hypot(dx, dz);
        if (dist > 16) {
          c.aggro = false;
          c.x = c.def.pos[0];
          c.z = c.def.pos[1];
        } else if (dist > 2.8) {
          c.x += (dx / dist) * 4.6 * dt;
          c.z += (dz / dist) * 4.6 * dt;
          c.mesh.rotation.y = Math.atan2(dx, dz);
        } else {
          c.attackTimer -= dt;
          if (c.attackTimer <= 0) {
            c.attackTimer = 1.4;
            this.damagePlayer(c.def.damage);
          }
        }
      }
    }
  }

  private updateProjectiles(dt: number) {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.life -= dt;
      p.x += p.vx * dt;
      p.z += p.vz * dt;
      p.mesh.position.set(p.x, groundHeightAt(p.x, p.z) + 1.25, p.z);

      let remove = p.life <= 0;

      if (p.sourceTeam === 'blue') {
        for (const eh of this.enemyHeroes) {
          if (!eh.alive) continue;
          if (Math.hypot(p.x - eh.x, p.z - eh.z) <= p.radius + 1.05 && (!p.hitIds || !p.hitIds.has(eh.id))) {
            p.hitIds?.add(eh.id);
            if (p.aoeRadius) {
              this.spawnShockwave(p.x, p.z, p.color, 0.8, p.aoeRadius, 0.35);
              this.applyAreaDamage(p.x, p.z, p.aoeRadius, p.damage, 'blue', p.attackerHeroId, p.slow);
            } else {
              this.damageAiHero(eh, p.damage, p.attackerHeroId, p.slow, false);
            }
            if (!p.pierce) {
              remove = true;
              break;
            }
          }
        }

        if (!remove && this.lordPit.alive && Math.hypot(p.x - this.lordPit.x, p.z - this.lordPit.z) <= p.radius + 2.0) {
          if (!p.hitIds || !p.hitIds.has('the_lord')) {
            p.hitIds?.add('the_lord');
            this.damageLordPit(p.damage, p.slow, false, p.attackerHeroId);
            if (!p.pierce) remove = true;
          }
        }

        if (!remove) {
          for (const t of this.turrets) {
            if (!t.alive || t.def.team !== 'enemy') continue;
            if (Math.hypot(p.x - t.def.pos[0], p.z - t.def.pos[1]) <= p.radius + 2.1 && (!p.hitIds || !p.hitIds.has(t.def.id))) {
              p.hitIds?.add(t.def.id);
              this.damageTurret(t, p.damage, false, p.attackerHeroId);
              if (!p.pierce) {
                remove = true;
                break;
              }
            }
          }
        }

        if (!remove && this.enemyBase && this.enemyBase.hp > 0 && Math.hypot(p.x - this.enemyBase.x, p.z - this.enemyBase.z) <= p.radius + 4.8) {
          if (!p.hitIds || !p.hitIds.has('enemy_base')) {
            p.hitIds?.add('enemy_base');
            this.damageEnemyBase(p.damage, false, p.attackerHeroId);
            if (!p.pierce) remove = true;
          }
        }

        if (!remove) {
          for (const m of this.minions) {
            if (!m.alive || m.team !== 'enemy') continue;
            if (Math.hypot(p.x - m.x, p.z - m.z) <= p.radius + 0.8 && (!p.hitIds || !p.hitIds.has(m.id))) {
              p.hitIds?.add(m.id);
              this.damageMinion(m, p.damage, p.fromPlayer, false, p.attackerHeroId);
              if (!p.pierce) {
                remove = true;
                break;
              }
            }
          }
        }

        if (!remove && p.fromPlayer) {
          for (const c of this.jungleCamps) {
            if (!c.alive) continue;
            if (Math.hypot(p.x - c.x, p.z - c.z) <= p.radius + 1.1 && (!p.hitIds || !p.hitIds.has(c.def.id))) {
              p.hitIds?.add(c.def.id);
              if (p.aoeRadius) {
                this.spawnShockwave(p.x, p.z, p.color, 0.8, p.aoeRadius, 0.35);
                this.applyAreaDamage(p.x, p.z, p.aoeRadius, p.damage, 'blue', p.attackerHeroId, p.slow);
              } else {
                this.damageCamp(c, p.damage, false, p.attackerHeroId || 'player');
              }
              if (!p.pierce) {
                remove = true;
                break;
              }
            }
          }
        }
      } else {
        // Red team projectile hits player, allied AI heroes, allied Lord, allied turrets, allied base, or allied minions
        if (this.playerRespawnTimer <= 0 && Math.hypot(p.x - this.playerX, p.z - this.playerZ) <= p.radius + 0.9) {
          this.damagePlayer(p.damage, p.attackerHeroId);
          remove = true;
        }
        if (!remove) {
          for (const ah of this.alliedHeroes) {
            if (!ah.alive) continue;
            if (Math.hypot(p.x - ah.x, p.z - ah.z) <= p.radius + 1.0) {
              this.damageAiHero(ah, p.damage, p.attackerHeroId, p.slow, false);
              remove = true;
              break;
            }
          }
        }
        if (!remove && this.alliedLord && this.alliedLord.alive && Math.hypot(p.x - this.alliedLord.x, p.z - this.alliedLord.z) <= p.radius + 1.8) {
          this.alliedLord.hp = Math.max(0, this.alliedLord.hp - p.damage);
          if (this.alliedLord.hp <= 0) {
            this.alliedLord.alive = false;
            this.scene.remove(this.alliedLord.rig.root, this.alliedLord.shadow);
          }
          remove = true;
        }
        if (!remove) {
          for (const t of this.turrets) {
            if (t.alive && t.def.team === 'ally' && Math.hypot(p.x - t.def.pos[0], p.z - t.def.pos[1]) <= p.radius + 2.1) {
              this.damageTurret(t, p.damage, false, p.attackerHeroId);
              remove = true;
              break;
            }
          }
        }
        if (!remove && this.alliedBase && this.alliedBase.hp > 0 && Math.hypot(p.x - this.alliedBase.x, p.z - this.alliedBase.z) <= p.radius + 4.8) {
          this.damageAlliedBase(p.damage, p.attackerHeroId);
          remove = true;
        }
        if (!remove) {
          for (const m of this.minions) {
            if (m.alive && m.team === 'ally' && Math.hypot(p.x - m.x, p.z - m.z) <= p.radius + 0.8) {
              this.damageMinion(m, p.damage, false, false, p.attackerHeroId);
              remove = true;
              break;
            }
          }
        }
      }

      if (remove) {
        this.scene.remove(p.mesh);
        (p.mesh.material as THREE.Material).dispose();
        this.projectiles.splice(i, 1);
      }
    }
  }

  private updateVfx(dt: number) {
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const s = this.shockwaves[i];
      s.age += dt;
      const t = Math.min(1, s.age / s.duration);
      const scale = THREE.MathUtils.lerp(s.startScale, s.endScale, t);
      s.mesh.scale.setScalar(scale);
      (s.mesh.material as THREE.MeshBasicMaterial).opacity = (1 - t) * 0.85;
      if (t >= 1) {
        this.scene.remove(s.mesh);
        (s.mesh.material as THREE.Material).dispose();
        this.shockwaves.splice(i, 1);
      }
    }

    for (let i = this.bursts.length - 1; i >= 0; i--) {
      const b = this.bursts[i];
      b.age += dt;
      const t = Math.min(1, b.age / b.duration);
      const posAttr = b.points.geometry.attributes.position as THREE.BufferAttribute;
      for (let k = 0; k < posAttr.count; k++) {
        posAttr.setXYZ(
          k,
          posAttr.getX(k) + b.velocities[k * 3] * dt,
          posAttr.getY(k) + b.velocities[k * 3 + 1] * dt,
          posAttr.getZ(k) + b.velocities[k * 3 + 2] * dt
        );
        b.velocities[k * 3 + 1] -= 11 * dt;
      }
      posAttr.needsUpdate = true;
      (b.points.material as THREE.PointsMaterial).opacity = 1 - t;
      if (t >= 1) {
        this.scene.remove(b.points);
        b.points.geometry.dispose();
        (b.points.material as THREE.Material).dispose();
        this.bursts.splice(i, 1);
      }
    }

    for (let i = this.telegraphs.length - 1; i >= 0; i--) {
      const tg = this.telegraphs[i];
      tg.age += dt;
      const t = Math.min(1, tg.age / tg.duration);
      tg.innerMesh.scale.setScalar(Math.max(0.1, tg.radius * t));
      if (t >= 1) {
        const ringColor = tg.sourceTeam === 'blue' ? '#38bdf8' : '#ef4444';
        this.spawnShockwave(tg.x, tg.z, ringColor, 0.5, tg.radius, 0.35);
        this.spawnBurst(tg.x, 1.0, tg.z, tg.sourceTeam === 'blue' ? '#38bdf8' : '#f97316', 20);
        if (tg.sourceTeam === 'blue') {
          this.applyAreaDamage(tg.x, tg.z, tg.radius, tg.damage, 'blue', tg.attackerHeroId, false);
        } else if (tg.sourceTeam === 'red') {
          this.applyAreaDamage(tg.x, tg.z, tg.radius, tg.damage, 'red', tg.attackerHeroId, false);
        } else if (this.playerRespawnTimer <= 0 && Math.hypot(this.playerX - tg.x, this.playerZ - tg.z) <= tg.radius) {
          this.damagePlayer(tg.damage);
        }
        this.scene.remove(tg.mesh, tg.innerMesh);
        (tg.mesh.material as THREE.Material).dispose();
        (tg.innerMesh.material as THREE.Material).dispose();
        this.telegraphs.splice(i, 1);
      }
    }

    for (let i = this.steelCables.length - 1; i >= 0; i--) {
      const sc = this.steelCables[i];
      sc.age += dt;
      (sc.line.material as THREE.LineBasicMaterial).opacity = Math.max(0, 1 - sc.age / sc.duration);
      if (sc.age >= sc.duration) {
        this.scene.remove(sc.line);
        sc.line.geometry.dispose();
        (sc.line.material as THREE.Material).dispose();
        this.steelCables.splice(i, 1);
      }
    }

    const now = performance.now();
    this.floatingTexts = this.floatingTexts.filter((f) => now - f.createdAt < 1100);
  }

  private updatePickupOrbs(dt: number, elapsed: number) {
    for (let i = this.pickupOrbs.length - 1; i >= 0; i--) {
      const o = this.pickupOrbs[i];
      o.age += dt;
      o.mesh.rotation.y = elapsed * 3;
      o.mesh.position.y = groundHeightAt(o.x, o.z) + 0.95 + Math.sin(elapsed * 4) * 0.2;
      if (this.playerRespawnTimer <= 0 && Math.hypot(this.playerX - o.x, this.playerZ - o.z) <= 2.6) {
        if (o.type === 'heal') {
          const heal = Math.round(this.playerMaxHp * 0.25);
          this.playerHp = Math.min(this.playerMaxHp, this.playerHp + heal);
          soundEngine.playHeal();
          this.spawnFloatingText(this.playerX, 2.2, this.playerZ, `+${heal} HP`, '#34d399');
        } else {
          this.buffTimer = 6.5;
          soundEngine.playXp();
          this.spawnFloatingText(this.playerX, 2.2, this.playerZ, 'Kuasa +25%!', '#fbbf24');
        }
        this.scene.remove(o.mesh);
        disposeObject3D(o.mesh);
        this.pickupOrbs.splice(i, 1);
      } else if (o.age > 35) {
        this.scene.remove(o.mesh);
        disposeObject3D(o.mesh);
        this.pickupOrbs.splice(i, 1);
      }
    }
  }

  private updateVictoryCelebration(dt: number, elapsed: number) {
    if (this.playerRig) {
      this.playerRig.root.visible = true;
      const py = groundHeightAt(this.playerX, this.playerZ);
      this.playerRig.root.position.set(this.playerX, py + Math.abs(Math.sin(elapsed * 5.2)) * 0.85, this.playerZ);
      this.playerRig.root.rotation.y += dt * 1.4;
      this.playerRig.rightArm.rotation.x = -2.4 + Math.sin(elapsed * 8) * 0.3;
      this.playerRig.leftArm.rotation.x = -2.4 - Math.sin(elapsed * 8) * 0.3;

      _vec3C.set(this.playerX + Math.cos(elapsed * 0.5) * 9, py + 5.0, this.playerZ + Math.sin(elapsed * 0.5) * 9);
      this.camera.position.lerp(_vec3C, dt * 3);
      this.camera.lookAt(this.playerX, py + 1.6, this.playerZ);
    }

    this.fireworkAccum += dt;
    if (this.fireworkAccum >= 0.45) {
      this.fireworkAccum = 0;
      const colors = ['#fbbf24', '#38bdf8', '#f472b6', '#34d399', '#a78bfa'];
      const c = colors[Math.floor(Math.random() * colors.length)];
      this.spawnBurst(
        this.playerX + (Math.random() - 0.5) * 14,
        4.5 + Math.random() * 4,
        this.playerZ + (Math.random() - 0.5) * 14,
        c,
        28
      );
    }
    this.updateVfx(dt);
  }

  private projectToBar(
    id: string,
    kind: WorldHealthBar['kind'],
    wx: number,
    heightOffset: number,
    wz: number,
    hp: number,
    maxHp: number,
    extra?: Partial<WorldHealthBar>
  ): WorldHealthBar | null {
    _projVec.set(wx, groundHeightAt(wx, wz) + heightOffset, wz);
    _projVec.project(this.camera);
    if (_projVec.z > 1 || _projVec.z < -1) return null;
    const x = ((_projVec.x + 1) / 2) * 100;
    const y = (-(_projVec.y - 1) / 2) * 100;
    if (x < -5 || x > 105 || y < -5 || y > 105) return null;
    return {
      id,
      kind,
      x,
      y,
      hp: Math.round(hp),
      maxHp: Math.round(maxHp),
      ...extra,
    };
  }

  public pushHudSnapshot() {
    if (!this.heroDef) return;
    const minimapUnits: MinimapUnit[] = [{ id: 'player', x: this.playerX, z: this.playerZ, type: 'player' }];

    // Bases on minimap
    if (this.alliedBase) {
      minimapUnits.push({ id: 'base_ally', x: this.alliedBase.x, z: this.alliedBase.z, type: 'base_ally' });
    }
    if (this.enemyBase) {
      minimapUnits.push({ id: 'base_enemy', x: this.enemyBase.x, z: this.enemyBase.z, type: 'base_enemy' });
    }

    // Turrets on minimap
    let enemyTurretsAlive = 0;
    const enemyTurretsTotal = this.turrets.filter((t) => t.def.team === 'enemy').length;
    this.turrets.forEach((t) => {
      if (!t.alive) return;
      if (t.def.team === 'enemy') enemyTurretsAlive += 1;
      minimapUnits.push({
        id: t.def.id,
        x: t.def.pos[0],
        z: t.def.pos[1],
        type: t.def.team === 'ally' ? 'turret_ally' : 'turret_enemy',
      });
    });

    // 4 Allied AI Heroes on minimap
    this.alliedHeroes.forEach((ah) => {
      if (!ah.alive) return;
      minimapUnits.push({
        id: ah.id,
        x: ah.x,
        z: ah.z,
        type: 'ally_hero',
        label: ah.heroDef.name,
      });
    });

    // 5 Enemy AI Heroes on minimap
    this.enemyHeroes.forEach((eh) => {
      if (!eh.alive) return;
      minimapUnits.push({
        id: eh.id,
        x: eh.x,
        z: eh.z,
        type: 'enemy',
        label: eh.heroDef.name,
      });
    });

    // Neutral Lord & Allied Lord
    if (this.lordPit.alive) {
      minimapUnits.push({ id: 'lord_pit', x: this.lordPit.x, z: this.lordPit.z, type: 'boss', label: 'Lord' });
    }
    if (this.alliedLord && this.alliedLord.alive) {
      minimapUnits.push({ id: 'allied_lord', x: this.alliedLord.x, z: this.alliedLord.z, type: 'allied_lord', label: 'Lord Sekutu' });
    }

    // Minions on minimap
    this.minions.forEach((m) => {
      if (!m.alive) return;
      minimapUnits.push({
        id: m.id,
        x: m.x,
        z: m.z,
        type: m.team === 'ally' ? 'minion_ally' : 'minion_enemy',
      });
    });

    let turtleAlive = false;
    let turtleRespawnTimer = 0;
    this.jungleCamps.forEach((c) => {
      if (c.def.buffType === 'turtle') {
        turtleAlive = c.alive;
        turtleRespawnTimer = Math.ceil(c.respawnTimer);
      }
      if (c.alive) {
        const unitType: MinimapUnit['type'] =
          c.def.buffType === 'blue'
            ? 'blue_buff'
            : c.def.buffType === 'red'
              ? 'red_buff'
              : c.def.buffType === 'turtle'
                ? 'turtle'
                : 'camp';
        minimapUnits.push({ id: c.def.id, x: c.x, z: c.z, type: unitType });
      }
    });

    HEALING_FOUNTAINS.forEach((f) => {
      minimapUnits.push({ id: f.id, x: f.pos[0], z: f.pos[1], type: 'fountain' });
    });

    // World-Projected Health Bars
    const preferred = this.getPreferredTarget(this.attackRange + 15);
    const worldBars: WorldHealthBar[] = [];

    if (this.playerRespawnTimer <= 0) {
      const pb = this.projectToBar('player', 'player', this.playerX, 3.05, this.playerZ, this.playerHp, this.playerMaxHp, {
        mana: Math.round(this.playerMana),
        maxMana: Math.round(this.playerMaxMana),
        shield: Math.round(this.playerShield),
        level: this.playerLevel,
        label: this.heroDef.name,
      });
      if (pb) worldBars.push(pb);
    }

    for (const ah of this.alliedHeroes) {
      if (!ah.alive) continue;
      if (Math.hypot(ah.x - this.playerX, ah.z - this.playerZ) > 75) continue;
      const ab = this.projectToBar(ah.id, 'ally_hero', ah.x, 3.1, ah.z, ah.hp, ah.maxHp, {
        mana: Math.round(ah.mana),
        maxMana: Math.round(ah.maxMana),
        shield: Math.round(ah.shield),
        level: ah.level,
        label: ah.heroDef.name,
      });
      if (ab) worldBars.push(ab);
    }

    for (const eh of this.enemyHeroes) {
      if (!eh.alive) continue;
      if (Math.hypot(eh.x - this.playerX, eh.z - this.playerZ) > 75) continue;
      const eb = this.projectToBar(eh.id, 'enemy_hero', eh.x, 3.1, eh.z, eh.hp, eh.maxHp, {
        mana: Math.round(eh.mana),
        maxMana: Math.round(eh.maxMana),
        shield: Math.round(eh.shield),
        level: eh.level,
        label: eh.heroDef.name,
        isTarget: preferred?.id === eh.id,
      });
      if (eb) worldBars.push(eb);
    }

    if (this.lordPit.alive && Math.hypot(this.lordPit.x - this.playerX, this.lordPit.z - this.playerZ) <= 60) {
      const lb = this.projectToBar('lord_pit', 'boss', this.lordPit.x, 5.7, this.lordPit.z, this.lordPit.hp, this.lordPit.maxHp, {
        label: 'THE LORD',
        isTarget: preferred?.id === THE_LORD_BOSS.id,
      });
      if (lb) worldBars.push(lb);
    }

    if (this.alliedLord && this.alliedLord.alive && Math.hypot(this.alliedLord.x - this.playerX, this.alliedLord.z - this.playerZ) <= 65) {
      const alb = this.projectToBar('allied_lord', 'allied_lord', this.alliedLord.x, 5.6, this.alliedLord.z, this.alliedLord.hp, this.alliedLord.maxHp, {
        label: 'LORD SEKUTU',
      });
      if (alb) worldBars.push(alb);
    }

    for (const t of this.turrets) {
      if (!t.alive) continue;
      if (Math.hypot(t.def.pos[0] - this.playerX, t.def.pos[1] - this.playerZ) > 68) continue;
      const tb = this.projectToBar(
        t.def.id,
        t.def.team === 'ally' ? 'turret_ally' : 'turret_enemy',
        t.def.pos[0],
        8.6,
        t.def.pos[1],
        t.hp,
        t.maxHp,
        {
          label: t.def.name,
          shield: Math.round(t.shield),
          maxShield: t.maxShield,
          protectedShield: t.shield > 0,
          isTarget: preferred?.id === t.def.id,
        }
      );
      if (tb) worldBars.push(tb);
    }

    if (this.enemyBase && Math.hypot(this.enemyBase.x - this.playerX, this.enemyBase.z - this.playerZ) <= 75) {
      const bb = this.projectToBar('enemy_base', 'base_enemy', this.enemyBase.x, 9.0, this.enemyBase.z, this.enemyBase.hp, this.enemyBase.maxHp, {
        label: this.enemyBase.vulnerable ? 'KUBU MUSUH' : 'KUBU MUSUH (PERISAI)',
        protectedShield: !this.enemyBase.vulnerable,
        isTarget: preferred?.id === 'enemy_base',
      });
      if (bb) worldBars.push(bb);
    }

    if (this.alliedBase && Math.hypot(this.alliedBase.x - this.playerX, this.alliedBase.z - this.playerZ) <= 75) {
      const ab = this.projectToBar('allied_base', 'base_ally', this.alliedBase.x, 9.0, this.alliedBase.z, this.alliedBase.hp, this.alliedBase.maxHp, {
        label: 'KUBU SEKUTU',
      });
      if (ab) worldBars.push(ab);
    }

    for (const c of this.jungleCamps) {
      if (!c.alive) continue;
      if (Math.hypot(c.x - this.playerX, c.z - this.playerZ) > 42) continue;
      const cb = this.projectToBar(c.def.id, 'camp', c.x, 2.5 * c.def.scale, c.z, c.hp, c.maxHp, {
        label: c.def.buffType ? c.def.name : undefined,
        isTarget: preferred?.id === c.def.id,
      });
      if (cb) worldBars.push(cb);
    }

    for (const m of this.minions) {
      if (!m.alive) continue;
      if (Math.hypot(m.x - this.playerX, m.z - this.playerZ) > 32) continue;
      const mb = this.projectToBar(
        m.id,
        m.team === 'ally' ? 'minion_ally' : 'minion_enemy',
        m.x,
        1.95,
        m.z,
        m.hp,
        m.maxHp,
        { isTarget: preferred?.id === m.id }
      );
      if (mb) worldBars.push(mb);
    }

    // Prevent projected hero/structure health bars from overlapping closely
    for (let i = 0; i < worldBars.length; i++) {
      const a = worldBars[i];
      if (a.kind === 'minion_ally' || a.kind === 'minion_enemy') continue;
      for (let j = 0; j < i; j++) {
        const b = worldBars[j];
        if (b.kind === 'minion_ally' || b.kind === 'minion_enemy') continue;
        if (Math.abs(a.x - b.x) < 7.5 && Math.abs(a.y - b.y) < 4.8) {
          a.y = Math.max(4, b.y - 5.0);
        }
      }
    }

    const pRec = this.heroRecords.get('player');
    const heroStats = this.matchResult ? this.matchResult.standings : this.buildHeroStatsList(false);

    const cdFactor = 1 - this.cooldownReduce;
    const snapshot: HudSnapshot = {
      gameTimeSec: Math.floor(this.gameTimeSec),
      hp: Math.round(this.playerHp),
      maxHp: Math.round(this.playerMaxHp),
      mana: Math.round(this.playerMana),
      maxMana: Math.round(this.playerMaxMana),
      shield: Math.round(this.playerShield),
      level: this.playerLevel,
      xp: this.playerXp,
      xpToNext: this.playerXpToNext,
      gold: Math.floor(this.playerGold),
      totalGoldEarned: Math.floor(this.totalGoldEarned),
      shards: this.playerShards,
      potions: this.playerPotions,
      damage: this.baseDamage,
      defense: this.baseDefense,
      speed: Number(this.baseSpeed.toFixed(1)),
      attackRange: Number(this.attackRange.toFixed(1)),
      skillPowerBonus: Math.round(this.skillPowerBonus * 100),
      cooldownReduce: Math.round(this.cooldownReduce * 100),
      attackSpeedBonus: Math.round(this.attackSpeedBonus * 100),
      critChance: Math.round(this.critChance * 100),
      lifesteal: Math.round(this.lifesteal * 100),
      regenPerSec: Math.round(this.regenPerSec),
      passiveStacks: this.passiveStacks,
      redBuffTimer: Math.ceil(this.redBuffTimer),
      blueBuffTimer: Math.ceil(this.blueBuffTimer),
      turtleBuffTimer: Math.ceil(this.turtleBuffTimer),
      turtleAlive,
      turtleRespawnTimer,
      lordAlive: this.lordPit.alive,
      lordRespawnTimer: Math.ceil(this.lordPit.respawnTimer),
      lordHp: Math.round(this.lordPit.hp),
      lordMaxHp: this.lordPit.maxHp,
      alliedLordActive: Boolean(this.alliedLord && this.alliedLord.alive),
      inBush: this.inBush,
      inFountain: this.inFountain,
      targetLocked: this.targetLocked,
      autoChase: this.autoChase,
      autoAttackActive: this.autoAttackHeld,
      selectedTargetName: preferred ? preferred.name : null,
      selectedTargetHpPct: preferred ? Math.round((preferred.hp / preferred.maxHp) * 100) : null,
      selectedTargetInRange: preferred ? preferred.dist <= this.attackRange + 2.5 : false,
      recommendedItem: this.getRecommendedItem(),
      lordUnlocked: this.lordPit.alive,
      lordIntroActive: this.lordIntroTimer > 0,
      cameraZoom: Number(this.cameraZoom.toFixed(2)),
      enemyTurretsAlive,
      enemyTurretsTotal,
      enemyBaseHp: this.enemyBase ? Math.round(this.enemyBase.hp) : 0,
      enemyBaseMaxHp: BASE_MAX_HP,
      enemyBaseVulnerable: Boolean(this.enemyBase?.vulnerable),
      alliedBaseHp: this.alliedBase ? Math.round(this.alliedBase.hp) : 0,
      alliedBaseMaxHp: BASE_MAX_HP,
      heroKills: this.defeatedEnemiesCount,
      playerKda: {
        kills: pRec?.kills ?? 0,
        deaths: pRec?.deaths ?? 0,
        assists: pRec?.assists ?? 0,
        cardsEarned: pRec?.cardsEarned ?? 0,
      },
      blueTeamCards: this.blueTeamCards,
      redTeamCards: this.redTeamCards,
      blueTeamKills: this.blueTeamKills,
      redTeamKills: this.redTeamKills,
      heroStats,
      killFeed: [...this.killFeed],
      matchResult: this.matchResult,
      enemyMaxLevel: this.enemyMaxLevel,
      cooldowns: {
        basic: this.cdBasic,
        basicMax: this.baseAttackCooldown,
        skill1: this.cdSkill1,
        skill1Max: this.heroDef.skills.skill1.cooldown * cdFactor,
        skill2: this.cdSkill2,
        skill2Max: this.heroDef.skills.skill2.cooldown * cdFactor,
        ultimate: this.cdUltimate,
        ultimateMax: this.heroDef.skills.ultimate.cooldown * cdFactor,
        dash: this.cdDash,
        dashMax: 2.5 * cdFactor,
      },
      currentEnemyIndex: Math.min(9, this.defeatedEnemiesCount),
      defeatedEnemies: this.defeatedEnemiesCount,
      collectedCardIds: Array.from(this.collectedCardIds),
      unlockedAchievements: Array.from(this.unlockedAchievements),
      equippedItemIds: [...this.equippedItemIds],
      playerPos: [this.playerX, this.playerZ],
      playerYaw: this.playerYaw,
      minimapUnits,
      worldBars,
      floatingTexts: [...this.floatingTexts],
      combatAlert: this.combatAlert,
    };

    this.callbacks.onHudUpdate(snapshot);
  }

  public dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.frameId);
    clearTimeout(this.frameId);
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    this.renderer.domElement.removeEventListener('pointermove', this.onPointerMove);
    this.renderer.domElement.removeEventListener('pointerdown', this.onPointerDown);
    this.renderer.domElement.removeEventListener('wheel', this.onWheel);
    this.renderer.domElement.removeEventListener('contextmenu', this.onContextMenu);
    this.renderer.domElement.removeEventListener('webglcontextlost', this.onWebglContextLost);
    window.removeEventListener('pointerup', this.onPointerUp);

    this.clearBattlefieldEntities();
    this.world.dispose();
    this.shadowTex.dispose();
    this.unitSphereGeo.dispose();
    this.ringGeo.dispose();
    this.fillCircleGeo.dispose();
    this.targetReticle.geometry.dispose();
    (this.targetReticle.material as THREE.Material).dispose();
    this.rangeRing.geometry.dispose();
    (this.rangeRing.material as THREE.Material).dispose();
    this.renderer.dispose();
    if (this.renderer.domElement.parentNode === this.container) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
