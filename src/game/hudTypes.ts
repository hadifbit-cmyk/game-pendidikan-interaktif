import { AdjectiveCard, HeroDefinition, LaneId, ShopItemDef } from '../data/gameData';

export type GamePhase =
  | 'menu'
  | 'hero_select'
  | 'loading'
  | 'how_to_play'
  | 'settings'
  | 'playing'
  | 'paused'
  | 'victory'
  | 'defeat';

export type TeamSide = 'blue' | 'red';

export type AwardMedal = 'MVP' | 'GOLD' | 'SILVER' | 'BRONZE';

export interface FloatingDamageText {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  createdAt: number;
}

export interface WorldHealthBar {
  id: string;
  kind:
    | 'player'
    | 'ally_hero'
    | 'enemy_hero'
    | 'boss'
    | 'allied_lord'
    | 'minion_ally'
    | 'minion_enemy'
    | 'turret_ally'
    | 'turret_enemy'
    | 'base_ally'
    | 'base_enemy'
    | 'camp';
  x: number; // screen % (0-100)
  y: number; // screen % (0-100)
  hp: number;
  maxHp: number;
  mana?: number;
  maxMana?: number;
  shield?: number;
  maxShield?: number;
  level?: number;
  label?: string;
  isTarget?: boolean;
  protectedShield?: boolean;
}

export interface MinimapUnit {
  id: string;
  x: number;
  z: number;
  type:
    | 'player'
    | 'ally_hero'
    | 'enemy'
    | 'boss'
    | 'allied_lord'
    | 'minion_ally'
    | 'minion_enemy'
    | 'turret_ally'
    | 'turret_enemy'
    | 'base_ally'
    | 'base_enemy'
    | 'camp'
    | 'blue_buff'
    | 'red_buff'
    | 'turtle'
    | 'fountain';
  label?: string;
}

export interface MatchHeroStats {
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
  score: number;
  award?: AwardMedal;
}

export interface KillFeedItem {
  id: number;
  killerName: string;
  killerTeam: TeamSide;
  victimName: string;
  victimTeam: TeamSide;
  cardWord: string;
  cardColor: string;
  multiKill: number;
  timestamp: number;
}

export interface CardRewardNotification {
  id: number;
  killerName: string;
  killerTeam: TeamSide;
  victimName: string;
  card: AdjectiveCard;
  multiKill: number;
  isPlayerKill: boolean;
}

export interface MatchResultSummary {
  winnerTeam: TeamSide;
  blueCards: number;
  redCards: number;
  blueKills: number;
  redKills: number;
  durationSec: number;
  winReason: string;
  standings: MatchHeroStats[];
}

export interface TeamAssignment {
  hero: HeroDefinition;
  lane: LaneId | 'roam';
  isPlayer: boolean;
}

export interface HudSnapshot {
  gameTimeSec: number;
  hp: number;
  maxHp: number;
  mana: number;
  maxMana: number;
  shield: number;
  level: number;
  xp: number;
  xpToNext: number;
  gold: number;
  totalGoldEarned: number;
  shards: number;
  potions: number;
  damage: number;
  defense: number;
  speed: number;
  attackRange: number;
  skillPowerBonus: number;
  cooldownReduce: number;
  attackSpeedBonus: number;
  critChance: number;
  lifesteal: number;
  regenPerSec: number;
  passiveStacks: number;
  redBuffTimer: number;
  blueBuffTimer: number;
  turtleBuffTimer: number;
  turtleAlive: boolean;
  turtleRespawnTimer: number;
  lordAlive: boolean;
  lordRespawnTimer: number;
  lordHp: number;
  lordMaxHp: number;
  alliedLordActive: boolean;
  inBush: boolean;
  inFountain: boolean;
  targetLocked: boolean;
  autoChase: boolean;
  autoAttackActive: boolean;
  selectedTargetName: string | null;
  selectedTargetHpPct: number | null;
  selectedTargetInRange: boolean;
  recommendedItem: ShopItemDef | null;
  lordUnlocked: boolean;
  lordIntroActive: boolean;
  cameraZoom: number;
  enemyTurretsAlive: number;
  enemyTurretsTotal: number;
  enemyBaseHp: number;
  enemyBaseMaxHp: number;
  enemyBaseVulnerable: boolean;
  alliedBaseHp: number;
  alliedBaseMaxHp: number;
  heroKills: number;
  playerKda: { kills: number; deaths: number; assists: number; cardsEarned: number };
  blueTeamCards: number;
  redTeamCards: number;
  blueTeamKills: number;
  redTeamKills: number;
  heroStats: MatchHeroStats[];
  killFeed: KillFeedItem[];
  matchResult: MatchResultSummary | null;
  enemyMaxLevel: number;
  cooldowns: {
    basic: number;
    basicMax: number;
    skill1: number;
    skill1Max: number;
    skill2: number;
    skill2Max: number;
    ultimate: number;
    ultimateMax: number;
    dash: number;
    dashMax: number;
  };
  currentEnemyIndex: number;
  defeatedEnemies: number;
  collectedCardIds: string[];
  unlockedAchievements: string[];
  equippedItemIds: string[];
  playerPos: [number, number];
  playerYaw: number;
  minimapUnits: MinimapUnit[];
  worldBars: WorldHealthBar[];
  floatingTexts: FloatingDamageText[];
  combatAlert: string | null;
}
