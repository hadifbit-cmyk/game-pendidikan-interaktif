export type HeroRoleId = 'marksman' | 'fighter' | 'assassin' | 'mage' | 'tank' | 'support';

export type LaneId = 'exp' | 'mid' | 'gold';

export type WeaponStyle =
  | 'bow'
  | 'cannon'
  | 'greatsword'
  | 'cyberblades'
  | 'spear'
  | 'axe'
  | 'lightningstaff'
  | 'wand'
  | 'codexstaff'
  | 'hammer_shield'
  | 'dualblades'
  | 'daggers'
  | 'scythe'
  | 'orb'
  | 'staff'
  | 'magicdaggers'
  | 'dualcables'
  | 'gauntlets'
  | 'magicorb'
  | 'umbrella'
  | 'rapier'
  | 'heartdoll'
  | 'violinrifle'
  | 'greathammer'
  | 'birdstaff'
  // 30-Hero Expansion Weapon Styles
  | 'halberd_shield'
  | 'wrench_shield'
  | 'anchor_chains'
  | 'bandage_claws'
  | 'golden_spear_shield'
  | 'knight_lance'
  | 'boxing_gloves'
  | 'dragon_claws'
  | 'execution_hammer'
  | 'abyss_blades'
  | 'shard_blades'
  | 'katana_shuriken'
  | 'moon_twinblades'
  | 'shadow_stingers'
  | 'assassin_claws'
  | 'magic_cards'
  | 'planet_orbs'
  | 'fire_gauntlets'
  | 'frost_scepter'
  | 'blood_scepter'
  | 'yinyang_fan'
  | 'star_board'
  | 'crescent_orb'
  | 'arc_rifles'
  | 'mecha_ball'
  | 'cowboy_pistols'
  | 'abyss_gauntlet'
  | 'lightwheels'
  | 'quad_guns';

export type HeadgearStyle =
  | 'tiara'
  | 'twintails'
  | 'hair_spiky'
  | 'helm_paladin'
  | 'lightning_crown'
  | 'cyber_visor'
  | 'dragon_plume'
  | 'cat_hood'
  | 'horns'
  | 'moon_crown'
  | 'gusion_locks'
  | 'fanny_goggles'
  | 'chou_headband'
  | 'guinevere_ribbon'
  | 'kagura_hairpin'
  | 'lancelot_plume'
  | 'angela_bunny'
  | 'granger_hood'
  | 'fredrinn_pompadour'
  | 'pharsa_blindfold'
  // 30-Hero Expansion Headgears
  | 'ruby_hood'
  | 'hylos_antlers'
  | 'johnson_visor'
  | 'atlas_diver'
  | 'khufra_crown'
  | 'minsitthar_crown'
  | 'silvanna_tiara'
  | 'paquito_hair'
  | 'yuzhong_horns'
  | 'terizla_mask'
  | 'dyrroth_horns'
  | 'aamon_hood'
  | 'hayabusa_mask'
  | 'karina_ears'
  | 'helcurt_crest'
  | 'natalia_hood'
  | 'harley_tophat'
  | 'cyclops_hat'
  | 'valir_flame'
  | 'aurora_crown'
  | 'cecilion_collar'
  | 'luoyi_bun'
  | 'yve_visor'
  | 'change_buns'
  | 'ixia_visor'
  | 'bruno_goggles'
  | 'clint_hat'
  | 'brody_dreads'
  | 'karrie_crest'
  | 'beatrix_beret';

export interface SkillInfo {
  key: string;
  name: string;
  description: string;
  cooldown: number;
  color: string;
}

export interface HeroAppearance {
  headgear: HeadgearStyle;
  weaponStyle: WeaponStyle;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  bodyVariant?: 'standard' | 'centaur' | 'mech' | 'diver' | 'dragon' | 'moonhalo';
}

export interface HeroDefinition {
  id: string;
  name: string;
  roleLabel: string;
  roleId: HeroRoleId;
  secondaryRoleId?: HeroRoleId;
  difficulty: 'Mudah' | 'Sederhana' | 'Tinggi';
  title: string;
  description: string;
  advantage: string;
  appearance: HeroAppearance;
  baseStats: {
    hp: number;
    damage: number;
    speed: number;
    defense: number;
    attackRange: number;
    attackCooldown: number;
  };
  displayRatings: {
    hp: number;
    damage: number;
    speed: number;
    defense: number;
  };
  passive: {
    name: string;
    description: string;
  };
  skills: {
    basic: SkillInfo;
    skill1: SkillInfo;
    skill2: SkillInfo;
    ultimate: SkillInfo;
  };
}

export type ItemCategory = 'Serangan' | 'Pertahanan' | 'Sihir' | 'Pergerakan' | 'Pemulihan' | 'Khas';

export interface ShopItemDef {
  id: string;
  name: string;
  category: ItemCategory;
  price: number;
  description: string;
  bonusSummary: string;
  color: string;
  consumable?: boolean;
  recommendedRoles: HeroRoleId[];
  stats: {
    damage?: number;
    hp?: number;
    defense?: number;
    speed?: number;
    attackSpeed?: number;
    critChance?: number;
    lifesteal?: number;
    skillPower?: number;
    cooldownReduce?: number;
    regenPerSec?: number;
    goldBonus?: number;
    armorPen?: number;
  };
}

export type AdjectiveCategory =
  | 'Kata Adjektif Jarak'
  | 'Kata Adjektif Perasaan'
  | 'Kata Adjektif Pancaindera';

export interface AdjectiveCard {
  id: string;
  word: string;
  category: AdjectiveCategory;
  meaning: string;
  exampleSentence: string;
  color: string;
}

export interface EnemyDefinition {
  level: number;
  id: string;
  heroId?: string;
  name: string;
  title: string;
  archetype: HeroRoleId;
  weaponStyle: WeaponStyle;
  headgear?: HeadgearStyle;
  zoneName: string;
  spawnPos: [number, number];
  maxHp: number;
  damage: number;
  defense: number;
  speed: number;
  attackRange: number;
  attackInterval: number;
  abilityCooldown: number;
  abilityName: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  bodyVariant?: HeroAppearance['bodyVariant'];
  scale: number;
  isBoss?: boolean;
  xpReward: number;
  goldReward: number;
  cardId: string;
}

export interface JungleCampDef {
  id: string;
  name: string;
  type: 'slime' | 'wolf' | 'golem' | 'drake' | 'dummy' | 'blue_buff' | 'red_buff' | 'turtle';
  zone: string;
  pos: [number, number];
  maxHp: number;
  damage: number;
  xpReward: number;
  goldReward: number;
  shardReward: number;
  color: string;
  scale: number;
  respawnTime: number;
  passive?: boolean;
  buffType?: 'red' | 'blue' | 'turtle';
}

export interface TurretDef {
  id: string;
  team: 'ally' | 'enemy';
  lane: LaneId;
  tier: 'outer' | 'inner';
  name: string;
  pos: [number, number];
  maxHp: number;
  maxShield: number;
  damage: number;
  range: number;
}

export interface AchievementDef {
  id: string;
  title: string;
  description: string;
  iconName: 'sword' | 'book' | 'award' | 'crown' | 'shield' | 'sparkles';
}

// EXACT 10 BAHASA MELAYU YEAR 3 ADJECTIVE CARDS (PRESERVED)
export const ADJECTIVE_CARDS: AdjectiveCard[] = [
  // Kata Adjektif Jarak
  {
    id: 'dekat',
    word: 'Dekat',
    category: 'Kata Adjektif Jarak',
    meaning: 'Tidak jauh atau berhampiran antara satu sama lain.',
    exampleSentence: 'Kubu Fajar terletak dekat dengan Sungai Kristal.',
    color: '#38bdf8',
  },
  {
    id: 'jauh',
    word: 'Jauh',
    category: 'Kata Adjektif Jarak',
    meaning: 'Mempunyai jarak yang panjang atau tidak dekat.',
    exampleSentence: 'Pemanah itu mampu menyerang musuh dari jarak yang jauh.',
    color: '#0284c7',
  },
  {
    id: 'hampir',
    word: 'Hampir',
    category: 'Kata Adjektif Jarak',
    meaning: 'Nyaris atau berada sangat dekat dengan sesuatu tempat atau masa.',
    exampleSentence: 'Wira itu sudah hampir tiba di Arena The Lord.',
    color: '#0ea5e9',
  },
  // Kata Adjektif Perasaan
  {
    id: 'gembira',
    word: 'Gembira',
    category: 'Kata Adjektif Perasaan',
    meaning: 'Berasa sangat suka hati, riang dan ceria.',
    exampleSentence: 'Murid-murid berasa gembira apabila berjaya mengumpul kad ajaib.',
    color: '#fbbf24',
  },
  {
    id: 'sedih',
    word: 'Sedih',
    category: 'Kata Adjektif Perasaan',
    meaning: 'Berasa duka, pilu atau tidak gembira.',
    exampleSentence: 'Pasukan musuh berasa sedih apabila benteng mereka ditembusi.',
    color: '#f59e0b',
  },
  {
    id: 'takut',
    word: 'Takut',
    category: 'Kata Adjektif Perasaan',
    meaning: 'Berasa gentar, bimbang atau gerun menghadapi bahaya.',
    exampleSentence: 'Wira yang berani tidak pernah takut menentang The Lord.',
    color: '#d97706',
  },
  // Kata Adjektif Pancaindera
  {
    id: 'harum',
    word: 'Harum',
    category: 'Kata Adjektif Pancaindera',
    meaning: 'Berbau sangat wangi dan menyenangkan (deria bau).',
    exampleSentence: 'Bunga teratai di taman purba itu berbau sangat harum.',
    color: '#34d399',
  },
  {
    id: 'masam',
    word: 'Masam',
    category: 'Kata Adjektif Pancaindera',
    meaning: 'Rasa seperti buah limau atau cuka (deria rasa).',
    exampleSentence: 'Buah limau hutan di rimba fajar rasanya agak masam.',
    color: '#10b981',
  },
  {
    id: 'nyaring',
    word: 'Nyaring',
    category: 'Kata Adjektif Pancaindera',
    meaning: 'Bunyi yang kuat, lantang dan jelas kedengaran (deria dengar).',
    exampleSentence: 'Teriakan semboyan perang kedengaran sangat nyaring di lembah.',
    color: '#a78bfa',
  },
  {
    id: 'licin',
    word: 'Licin',
    category: 'Kata Adjektif Pancaindera',
    meaning: 'Permukaan yang halus dan tidak kesat apabila disentuh (deria sentuh).',
    exampleSentence: 'Batu di tepi sungai kristal itu sangat licin selepas hujan.',
    color: '#2dd4bf',
  },
];

// ============================================================
// EXACTLY 50 PLAYABLE HEROES (20 Existing + 30 New Expansion)
// ============================================================
export const HERO_ROLES: HeroDefinition[] = [
  // 1-10 ORIGINAL HEROES
  {
    id: 'miya',
    name: 'Miya',
    roleLabel: 'Marksman',
    roleId: 'marksman',
    difficulty: 'Mudah',
    title: 'Pemanah Bulan',
    description: 'Pemanah Elf Bulan yang pantas dengan busur bercahaya. Semakin kerap memanah, semakin laju serangannya.',
    advantage: 'Kelajuan serangan amat pantas & boleh menyelinap dengan bayang bulan.',
    appearance: {
      headgear: 'tiara',
      weaponStyle: 'bow',
      primaryColor: '#38bdf8',
      secondaryColor: '#1e3a8a',
      accentColor: '#bae6fd',
    },
    baseStats: { hp: 500, damage: 46, speed: 10.9, defense: 11, attackRange: 17.5, attackCooldown: 0.42 },
    displayRatings: { hp: 56, damage: 90, speed: 84, defense: 45 },
    passive: { name: 'Moon Blessing', description: 'Setiap serangan asas menambah kelajuan serangan sehingga +40%.' },
    skills: {
      basic: { key: 'ATK', name: 'Moon Arrow', description: 'Menembak anak panah cahaya bulan secara automatik.', cooldown: 0.42, color: '#38bdf8' },
      skill1: { key: 'Q', name: 'Arrow of Eclipse', description: 'Melepaskan 5 anak panah kipas yang memperlahankan musuh.', cooldown: 4.5, color: '#0ea5e9' },
      skill2: { key: 'E', name: 'Moonlight Shadow', description: 'Halimunan seketika, meningkatkan kelajuan larian & perisai.', cooldown: 7.0, color: '#34d399' },
      ultimate: { key: 'R', name: 'Rain of Arrows', description: 'Hujan anak panah bintang emas ke kawasan luas.', cooldown: 11.5, color: '#fbbf24' },
    },
  },
  {
    id: 'alucard',
    name: 'Alucard',
    roleLabel: 'Fighter / Assassin',
    roleId: 'fighter',
    secondaryRoleId: 'assassin',
    difficulty: 'Sederhana',
    title: 'Pemburu Kegelapan',
    description: 'Pendekar pedang besar yang tangkas melompat ke arah musuh dan memulihkan nyawa setiap libasan.',
    advantage: 'Serapan nyawa (Lifesteal) +18% dalam pertarungan jarak dekat.',
    appearance: {
      headgear: 'hair_spiky',
      weaponStyle: 'greatsword',
      primaryColor: '#dc2626',
      secondaryColor: '#1e293b',
      accentColor: '#fbbf24',
    },
    baseStats: { hp: 660, damage: 53, speed: 10.7, defense: 19, attackRange: 6.3, attackCooldown: 0.46 },
    displayRatings: { hp: 78, damage: 88, speed: 80, defense: 72 },
    passive: { name: 'Pursuit', description: 'Mendapat +18% Lifesteal (pulih HP setiap serangan).' },
    skills: {
      basic: { key: 'ATK', name: 'Demon Cleave', description: 'Menghayun pedang besar dengan gelombang tenaga merah.', cooldown: 0.46, color: '#ef4444' },
      skill1: { key: 'Q', name: 'Groundsplitter', description: 'Melompat ke hadapan dan menghentam tanah mengenakan kerosakan kawasan.', cooldown: 4.8, color: '#f97316' },
      skill2: { key: 'E', name: 'Whirling Smash', description: 'Libasan berputar 360° & memulihkan HP.', cooldown: 5.8, color: '#f43f5e' },
      ultimate: { key: 'R', name: 'Fission Wave', description: 'Gelombang tenaga merah raksasa & kuasa serangan meningkat.', cooldown: 11.5, color: '#fbbf24' },
    },
  },
  {
    id: 'layla',
    name: 'Layla',
    roleLabel: 'Marksman',
    roleId: 'marksman',
    difficulty: 'Mudah',
    title: 'Penembak Meriam Tenaga',
    description: 'Membawa Meriam Malefic berkuasa tinggi. Jarak tembakan Layla bertambah jauh apabila tahap meningkat!',
    advantage: 'Jarak serangan paling jauh di Land of Dawn dan laser mega.',
    appearance: {
      headgear: 'twintails',
      weaponStyle: 'cannon',
      primaryColor: '#0284c7',
      secondaryColor: '#312e81',
      accentColor: '#fde047',
    },
    baseStats: { hp: 485, damage: 49, speed: 10.3, defense: 10, attackRange: 18.8, attackCooldown: 0.48 },
    displayRatings: { hp: 52, damage: 96, speed: 74, defense: 42 },
    passive: { name: 'Malefic Gun', description: 'Jarak serangan bertambah +1.1m setiap naik tahap.' },
    skills: {
      basic: { key: 'ATK', name: 'Malefic Shot', description: 'Menembak peluru meriam tenaga tepat dari jarak jauh.', cooldown: 0.48, color: '#38bdf8' },
      skill1: { key: 'Q', name: 'Malefic Bomb', description: 'Peluru tenaga laju yang menembusi sasaran & laju gerak.', cooldown: 4.2, color: '#06b6d4' },
      skill2: { key: 'E', name: 'Void Projectile', description: 'Bebola tenaga meletup yang memperlahankan musuh.', cooldown: 6.5, color: '#818cf8' },
      ultimate: { key: 'R', name: 'Destruction Rush', description: 'Tembakan pancaran laser gergasi jarak jauh.', cooldown: 11.5, color: '#fde047' },
    },
  },
  {
    id: 'tigreal',
    name: 'Tigreal',
    roleLabel: 'Tank',
    roleId: 'tank',
    difficulty: 'Mudah',
    title: 'Kesatria Perisai Empayar',
    description: 'Pelindung barisan hadapan berperisai tebal dengan ketahanan luar biasa dan hentakan tukul.',
    advantage: 'Nyawa & pertahanan tertinggi serta perisai kebal.',
    appearance: {
      headgear: 'helm_paladin',
      weaponStyle: 'hammer_shield',
      primaryColor: '#eab308',
      secondaryColor: '#1e3a8a',
      accentColor: '#fef08a',
    },
    baseStats: { hp: 920, damage: 43, speed: 9.7, defense: 35, attackRange: 6.1, attackCooldown: 0.54 },
    displayRatings: { hp: 99, damage: 66, speed: 65, defense: 98 },
    passive: { name: 'Fearless', description: 'Mengurangkan kerosakan serangan musuh dan membina perisai.' },
    skills: {
      basic: { key: 'ATK', name: 'Paladin Bash', description: 'Hentaman tukul dan perisai diraja.', cooldown: 0.54, color: '#fbbf24' },
      skill1: { key: 'Q', name: 'Attack Wave', description: 'Gelombang emas yang memperlahankan musuh.', cooldown: 4.8, color: '#f59e0b' },
      skill2: { key: 'E', name: 'Sacred Hammer', description: 'Meluru ke hadapan & memberi perisai tambahan.', cooldown: 6.8, color: '#38bdf8' },
      ultimate: { key: 'R', name: 'Implosion', description: 'Letupan graviti besar sekeliling & kebal 2s.', cooldown: 12.5, color: '#fde047' },
    },
  },
  {
    id: 'eudora',
    name: 'Eudora',
    roleLabel: 'Mage',
    roleId: 'mage',
    difficulty: 'Mudah',
    title: 'Penyihir Halilintar',
    description: 'Ahli sihir kilat yang mengenakan letupan kerosakan sihir berganda dalam sekelip mata.',
    advantage: 'Letupan petir +20% kuasa kemahiran menumbangkan musuh dengan cepat.',
    appearance: {
      headgear: 'lightning_crown',
      weaponStyle: 'lightningstaff',
      primaryColor: '#6366f1',
      secondaryColor: '#1e1b4b',
      accentColor: '#38bdf8',
    },
    baseStats: { hp: 490, damage: 49, speed: 10.2, defense: 12, attackRange: 16.6, attackCooldown: 0.48 },
    displayRatings: { hp: 54, damage: 97, speed: 74, defense: 48 },
    passive: { name: 'Superconductor', description: 'Semua kemahiran sihir Eudora menerima +20% kuasa tambahan.' },
    skills: {
      basic: { key: 'ATK', name: 'Electric Spark', description: 'Melancarkan percikan bola kilat biru.', cooldown: 0.48, color: '#38bdf8' },
      skill1: { key: 'Q', name: 'Forked Lightning', description: 'Pancaran kilat bercabang menyambar kawasan hadapan.', cooldown: 4.2, color: '#60a5fa' },
      skill2: { key: 'E', name: 'Ball Lightning', description: 'Bebola kilat meletup, memperlahankan musuh & perisai.', cooldown: 6.5, color: '#818cf8' },
      ultimate: { key: 'R', name: "Thunder's Wrath", description: 'Memanggil petir raksasa dari langit!', cooldown: 11.5, color: '#c084fc' },
    },
  },
  {
    id: 'saber',
    name: 'Saber',
    roleLabel: 'Assassin',
    roleId: 'assassin',
    difficulty: 'Sederhana',
    title: 'Pedang Kilat Sibernetik',
    description: 'Pembunuh pantas dengan 4 bilah tenaga berputar yang memotong perisai musuh.',
    advantage: 'Menembusi perisai musuh & peluang Kritikal +15%.',
    appearance: {
      headgear: 'cyber_visor',
      weaponStyle: 'cyberblades',
      primaryColor: '#0ea5e9',
      secondaryColor: '#0f172a',
      accentColor: '#2dd4bf',
    },
    baseStats: { hp: 530, damage: 54, speed: 12.2, defense: 14, attackRange: 6.1, attackCooldown: 0.36 },
    displayRatings: { hp: 60, damage: 95, speed: 98, defense: 52 },
    passive: { name: "Enemy's Bane", description: 'Menembusi pertahanan musuh & peluang Kritikal +15%.' },
    skills: {
      basic: { key: 'ATK', name: 'Cyber Slash', description: 'Tetakan bilah tenaga ultra pantas.', cooldown: 0.36, color: '#2dd4bf' },
      skill1: { key: 'Q', name: 'Orbiting Swords', description: '4 bilah tenaga berpusar menyerang musuh sekeliling.', cooldown: 4.4, color: '#38bdf8' },
      skill2: { key: 'E', name: 'Charge', description: 'Meluru kilat ke hadapan & kelajuan bonus.', cooldown: 5.5, color: '#22d3ee' },
      ultimate: { key: 'R', name: 'Triple Sweep', description: 'Serangan penamat bertubi-tubi meletup pada sasaran.', cooldown: 11.0, color: '#a78bfa' },
    },
  },
  {
    id: 'zilong',
    name: 'Zilong',
    roleLabel: 'Fighter',
    roleId: 'fighter',
    difficulty: 'Mudah',
    title: 'Pahlawan Tombak Naga',
    description: 'Pahlawan tombak lincah yang menyerang pantas dan memecut laju merentas medan perang.',
    advantage: 'Serangan tombak +12% laju & pecutan Supreme Warrior.',
    appearance: {
      headgear: 'dragon_plume',
      weaponStyle: 'spear',
      primaryColor: '#f59e0b',
      secondaryColor: '#7f1d1d',
      accentColor: '#fde047',
    },
    baseStats: { hp: 640, damage: 50, speed: 11.4, defense: 20, attackRange: 6.8, attackCooldown: 0.42 },
    displayRatings: { hp: 76, damage: 86, speed: 90, defense: 70 },
    passive: { name: 'Dragon Flurry', description: 'Kelajuan serangan asas +12%.' },
    skills: {
      basic: { key: 'ATK', name: 'Dragon Spear', description: 'Tikaman tombak naga dengan gelombang emas.', cooldown: 0.42, color: '#fbbf24' },
      skill1: { key: 'Q', name: 'Spear Flip', description: 'Hayunan tombak memperlahankan & menggegarkan musuh.', cooldown: 4.5, color: '#f97316' },
      skill2: { key: 'E', name: 'Spear Strike', description: 'Menyerbu pantas menembusi sasaran.', cooldown: 5.5, color: '#ef4444' },
      ultimate: { key: 'R', name: 'Supreme Warrior', description: '+35% Kelajuan, +25% Serangan & gelombang emas!', cooldown: 11.5, color: '#fde047' },
    },
  },
  {
    id: 'nana',
    name: 'Nana',
    roleLabel: 'Mage / Support',
    roleId: 'support',
    secondaryRoleId: 'mage',
    difficulty: 'Mudah',
    title: 'Penyihir Kucing Ceria',
    description: 'Penyihir bertopi kucing dengan bumerang ajaib dan roh Molina yang menyelamatkan nyawanya.',
    advantage: 'Selamat untuk pemula! Molina melindungi Nana apabila HP kritikal.',
    appearance: {
      headgear: 'cat_hood',
      weaponStyle: 'wand',
      primaryColor: '#ec4899',
      secondaryColor: '#831843',
      accentColor: '#fbcfe8',
    },
    baseStats: { hp: 530, damage: 45, speed: 10.6, defense: 15, attackRange: 16.0, attackCooldown: 0.46 },
    displayRatings: { hp: 62, damage: 82, speed: 80, defense: 58 },
    passive: { name: "Molina's Gift", description: 'Menyelamatkan Nana dengan kebal & perisai apabila HP < 25%.' },
    skills: {
      basic: { key: 'ATK', name: 'Magic Star', description: 'Melontar bintang sihir merah jambu.', cooldown: 0.46, color: '#f472b6' },
      skill1: { key: 'Q', name: 'Magic Boomerang', description: 'Bumerang ajaib menembusi musuh di laluannya.', cooldown: 4.0, color: '#ec4899' },
      skill2: { key: 'E', name: 'Molina Smooch', description: 'Roh Molina memperlahankan musuh & memberi perisai.', cooldown: 6.5, color: '#a855f7' },
      ultimate: { key: 'R', name: 'Molina Blitz', description: 'Tiga letupan cakar ajaib besar di kawasan sasaran!', cooldown: 11.5, color: '#f43f5e' },
    },
  },
  {
    id: 'balmond',
    name: 'Balmond',
    roleLabel: 'Fighter',
    roleId: 'fighter',
    difficulty: 'Mudah',
    title: 'Pahlawan Kapak Gergasi',
    description: 'Pahlawan perkasa berkapak gergasi yang memulihkan HP setiap kali menumpaskan musuh.',
    advantage: 'Pulih +12% HP setiap kali menewaskan raksasa atau musuh.',
    appearance: {
      headgear: 'horns',
      weaponStyle: 'axe',
      primaryColor: '#b91c1c',
      secondaryColor: '#450a0a',
      accentColor: '#fb923c',
    },
    baseStats: { hp: 785, damage: 48, speed: 10.1, defense: 25, attackRange: 6.1, attackCooldown: 0.5 },
    displayRatings: { hp: 90, damage: 82, speed: 70, defense: 86 },
    passive: { name: 'Bloodthirst', description: 'Pulih +12% HP Maksimum apabila menumpaskan musuh.' },
    skills: {
      basic: { key: 'ATK', name: 'Heavy Axe', description: 'Libasan kapak perang berat.', cooldown: 0.5, color: '#f97316' },
      skill1: { key: 'Q', name: 'Soul Lock', description: 'Meluru pantas merempuh & melambatkan musuh.', cooldown: 5.0, color: '#ef4444' },
      skill2: { key: 'E', name: 'Cyclone Sweep', description: 'Putaran kapak taufan 360° mencederakan sekeliling.', cooldown: 5.2, color: '#fb923c' },
      ultimate: { key: 'R', name: 'Lethal Counter', description: 'Hentaman kapak pemusnah dengan kerosakan tambahan!', cooldown: 11.5, color: '#fde047' },
    },
  },
  {
    id: 'estes',
    name: 'Estes',
    roleLabel: 'Support',
    roleId: 'support',
    difficulty: 'Sederhana',
    title: 'Raja Elf Pemulih',
    description: 'Penjaga suci Elf Bulan dengan kuasa pemulihan berterusan serta sihir cahaya.',
    advantage: 'Penjanaan +6 HP/s semula jadi & sihir penyembuhan agung.',
    appearance: {
      headgear: 'moon_crown',
      weaponStyle: 'codexstaff',
      primaryColor: '#10b981',
      secondaryColor: '#ecfdf5',
      accentColor: '#fde047',
    },
    baseStats: { hp: 630, damage: 42, speed: 10.2, defense: 20, attackRange: 15.6, attackCooldown: 0.5 },
    displayRatings: { hp: 78, damage: 68, speed: 75, defense: 74 },
    passive: { name: 'Scripture of Moon Elf', description: 'Menjana +6 HP setiap saat secara semula jadi.' },
    skills: {
      basic: { key: 'ATK', name: 'Moonbeam', description: 'Memancarkan sinar bulan zamrud.', cooldown: 0.5, color: '#34d399' },
      skill1: { key: 'Q', name: 'Moonlight Immersion', description: 'Pulih +22% HP segera & gelombang cahaya suci.', cooldown: 5.5, color: '#10b981' },
      skill2: { key: 'E', name: 'Domain of Moon', description: 'Bulatan cahaya memperlahankan musuh & memulih HP.', cooldown: 6.5, color: '#2dd4bf' },
      ultimate: { key: 'R', name: 'Blessing of Moon', description: 'Pemulihan Agung (+38% HP), perisai & letupan emas!', cooldown: 12.0, color: '#fde047' },
    },
  },

  // 11-20 MEGA UPGRADE HEROES
  {
    id: 'gusion',
    name: 'Gusion',
    roleLabel: 'Assassin',
    roleId: 'assassin',
    difficulty: 'Tinggi',
    title: 'Bilah Pedang Suci',
    description: 'Pembunuh sihir pantas yang melontar belati bercahaya dan memanggilnya kembali dalam kombo letupan.',
    advantage: 'Kombo belati magis berganda & pergerakan kilat menewaskan musuh sekelip mata.',
    appearance: {
      headgear: 'gusion_locks',
      weaponStyle: 'magicdaggers',
      primaryColor: '#4f46e5',
      secondaryColor: '#1e1b4b',
      accentColor: '#38bdf8',
    },
    baseStats: { hp: 525, damage: 55, speed: 12.1, defense: 13, attackRange: 8.6, attackCooldown: 0.36 },
    displayRatings: { hp: 58, damage: 98, speed: 96, defense: 48 },
    passive: { name: 'Dagger Specialist', description: 'Setiap 3 kemahiran memperkasakan serangan seterusnya & memulih 6% HP.' },
    skills: {
      basic: { key: 'ATK', name: 'Twin Magic Daggers', description: 'Melontar belati sihir pantas ke arah musuh.', cooldown: 0.36, color: '#38bdf8' },
      skill1: { key: 'Q', name: 'Sword Spike', description: 'Melempar belati penanda & meluru menembusi musuh!', cooldown: 4.5, color: '#60a5fa' },
      skill2: { key: 'E', name: 'Shadowblade Slaughter', description: 'Melepaskan 5 belati magis kipas yang meletup.', cooldown: 5.2, color: '#818cf8' },
      ultimate: { key: 'R', name: 'Incandescence', description: 'Menyerbu pantas, memanggil semula semua belati & letupan sihir!', cooldown: 10.5, color: '#c084fc' },
    },
  },
  {
    id: 'fanny',
    name: 'Fanny',
    roleLabel: 'Assassin',
    roleId: 'assassin',
    difficulty: 'Tinggi',
    title: 'Penari Kabel Udara',
    description: 'Pahlawan paling tangkas yang melancarkan kabel keluli untuk terbang meluncur dan menetak musuh dari udara.',
    advantage: 'Mobiliti kabel keluli terpantas di seluruh peta Land of Dawn!',
    appearance: {
      headgear: 'fanny_goggles',
      weaponStyle: 'dualcables',
      primaryColor: '#0f766e',
      secondaryColor: '#042f2e',
      accentColor: '#fde047',
    },
    baseStats: { hp: 515, damage: 54, speed: 12.8, defense: 14, attackRange: 6.3, attackCooldown: 0.35 },
    displayRatings: { hp: 56, damage: 94, speed: 100, defense: 50 },
    passive: { name: 'Air Superiority', description: 'Serangan semasa meluncur kabel mengenakan +25% kerosakan bonus!' },
    skills: {
      basic: { key: 'ATK', name: 'Twin Blade Slash', description: 'Libasan dwi-bilah pantas dengan momentum udara.', cooldown: 0.35, color: '#2dd4bf' },
      skill1: { key: 'Q', name: 'Tornado Strike', description: 'Putaran bilah taufan 360° mencederakan semua musuh dekat.', cooldown: 3.4, color: '#fde047' },
      skill2: { key: 'E', name: 'Steel Cable', description: 'Melancarkan kabel keluli & terbang pantas ke hadapan menetak musuh!', cooldown: 2.8, color: '#38bdf8' },
      ultimate: { key: 'R', name: 'Cut Throat', description: 'Terjun udara berkuasa tinggi menamatkan musuh dengan kilauan emas!', cooldown: 10.5, color: '#f97316' },
    },
  },
  {
    id: 'chou',
    name: 'Chou',
    roleLabel: 'Fighter',
    roleId: 'fighter',
    difficulty: 'Sederhana',
    title: 'Jaguh Kung Fu',
    description: 'Pakar seni bela diri tangkas dengan kombo tumbukan bertalu-talu, elakan kebal dan tendangan naga.',
    advantage: 'Kombo kawalan musuh yang kuat & tendangan jarak jauh.',
    appearance: {
      headgear: 'chou_headband',
      weaponStyle: 'gauntlets',
      primaryColor: '#b45309',
      secondaryColor: '#1e293b',
      accentColor: '#fbbf24',
    },
    baseStats: { hp: 680, damage: 51, speed: 11.5, defense: 22, attackRange: 5.9, attackCooldown: 0.41 },
    displayRatings: { hp: 80, damage: 88, speed: 92, defense: 76 },
    passive: { name: 'Only Fast', description: 'Selepas bergerak jauh, tumbukan asas seterusnya mengenakan 160% kerosakan.' },
    skills: {
      basic: { key: 'ATK', name: 'Martial Strike', description: 'Tumbukan kung fu berapi pantas.', cooldown: 0.41, color: '#fb923c' },
      skill1: { key: 'Q', name: 'Jeet Kune Do', description: 'Kombo tumbukan meluru 3 hentakan yang menggegarkan musuh!', cooldown: 4.2, color: '#f59e0b' },
      skill2: { key: 'E', name: 'Shunpo', description: 'Luncur elak kebal seketika + perisai bela diri.', cooldown: 5.2, color: '#38bdf8' },
      ultimate: { key: 'R', name: 'The Way of Dragon', description: 'Tendangan terbang bertalu-talu yang menolak & menghentam musuh!', cooldown: 11.0, color: '#ef4444' },
    },
  },
  {
    id: 'guinevere',
    name: 'Guinevere',
    roleLabel: 'Fighter / Mage',
    roleId: 'fighter',
    secondaryRoleId: 'mage',
    difficulty: 'Sederhana',
    title: 'Bangsawan Sihir Violet',
    description: 'Pahlawan bangsawan yang menggabungkan seni bela diri dengan kuasa sihir ungu dan lompatan udara.',
    advantage: 'Lompatan serangan kawasan + kombo udara Violet Requiem!',
    appearance: {
      headgear: 'guinevere_ribbon',
      weaponStyle: 'magicorb',
      primaryColor: '#9333ea',
      secondaryColor: '#3b0764',
      accentColor: '#f0abfc',
    },
    baseStats: { hp: 635, damage: 50, speed: 11.0, defense: 18, attackRange: 6.6, attackCooldown: 0.44 },
    displayRatings: { hp: 74, damage: 89, speed: 84, defense: 68 },
    passive: { name: 'Super Magic', description: 'Serangan sihir Guinevere memulihkan +8% HP apabila mengenai musuh.' },
    skills: {
      basic: { key: 'ATK', name: 'Violet Palm', description: 'Serangan tenaga kristal ungu jarak dekat-sederhana.', cooldown: 0.44, color: '#c084fc' },
      skill1: { key: 'Q', name: 'Energy Wave', description: 'Gelombang bebola sihir jarak jauh yang memperlahankan musuh.', cooldown: 4.0, color: '#a855f7' },
      skill2: { key: 'E', name: 'Spatial Migration', description: 'Melompat ke hadapan dengan letupan sihir kawasan yang menggoncang musuh!', cooldown: 5.8, color: '#e879f9' },
      ultimate: { key: 'R', name: 'Violet Requiem', description: 'Putaran sihir violet udara yang meletupkan kawasan sekeliling!', cooldown: 11.5, color: '#f472b6' },
    },
  },
  {
    id: 'kagura',
    name: 'Kagura',
    roleLabel: 'Mage',
    roleId: 'mage',
    difficulty: 'Tinggi',
    title: 'Master Payung Seimei',
    description: 'Ahli sihir elegan yang melancarkan Payung Seimei ke mana-mana lokasi untuk mengawal dan meletupkan musuh.',
    advantage: 'Kawalan kawasan sihir jarak jauh & pelepasan diri pantas.',
    appearance: {
      headgear: 'kagura_hairpin',
      weaponStyle: 'umbrella',
      primaryColor: '#0284c7',
      secondaryColor: '#e0f2fe',
      accentColor: '#f472b6',
    },
    baseStats: { hp: 510, damage: 49, speed: 10.7, defense: 13, attackRange: 16.8, attackCooldown: 0.46 },
    displayRatings: { hp: 58, damage: 95, speed: 82, defense: 50 },
    passive: { name: 'Yin Yang Gathering', description: 'Setiap kemahiran memberi perisai angin & memperlahankan musuh dekat.' },
    skills: {
      basic: { key: 'ATK', name: 'Seimei Bolt', description: 'Memancarkan bintang roh Yin-Yang biru dari payung.', cooldown: 0.46, color: '#38bdf8' },
      skill1: { key: 'Q', name: 'Seimei Umbrella Open', description: 'Melancarkan Payung Seimei berputar ke hadapan mengenakan kerosakan kawasan!', cooldown: 3.8, color: '#60a5fa' },
      skill2: { key: 'E', name: 'Rasho Umbrella Flee', description: 'Meluncur keluar dari bahaya sambil meninggalkan perisai bunga!', cooldown: 5.5, color: '#f472b6' },
      ultimate: { key: 'R', name: 'Yin Yang Overturn', description: 'Pusaran letupan Yin-Yang gergasi menarik & memusnahkan musuh!', cooldown: 11.0, color: '#818cf8' },
    },
  },
  {
    id: 'lancelot',
    name: 'Lancelot',
    roleLabel: 'Assassin',
    roleId: 'assassin',
    difficulty: 'Sederhana',
    title: 'Kesatria Pedang Mawar',
    description: 'Pendekar rapiers anggun yang meluncur tanpa henti dengan gaya pedang mawar emas dan serangan kebal.',
    advantage: 'Dash pantas tanpa henti & kebal seketika semasa Thorned Rose.',
    appearance: {
      headgear: 'lancelot_plume',
      weaponStyle: 'rapier',
      primaryColor: '#7e22ce',
      secondaryColor: '#1e1b4b',
      accentColor: '#fde047',
    },
    baseStats: { hp: 535, damage: 53, speed: 12.2, defense: 14, attackRange: 6.4, attackCooldown: 0.37 },
    displayRatings: { hp: 60, damage: 96, speed: 95, defense: 52 },
    passive: { name: 'Soul Cutter', description: 'Setiap serangan dash menambah +15% kuasa serangan sehingga 45%!' },
    skills: {
      basic: { key: 'ATK', name: 'Rose Thrust', description: 'Tikaman pedang mawar pantas ke sasaran.', cooldown: 0.37, color: '#fbbf24' },
      skill1: { key: 'Q', name: 'Puncture', description: 'Meluncur menembusi barisan musuh dengan jejak kilat emas!', cooldown: 3.6, color: '#f59e0b' },
      skill2: { key: 'E', name: 'Thorned Rose', description: 'Kebal seketika sambil menetak dalam formasi tiga bilah segitiga!', cooldown: 5.4, color: '#f472b6' },
      ultimate: { key: 'R', name: 'Phantom Execution', description: 'Serangan bayangan hadapan berkuasa tinggi yang menembusi musuh!', cooldown: 10.8, color: '#fde047' },
    },
  },
  {
    id: 'angela',
    name: 'Angela',
    roleLabel: 'Support',
    roleId: 'support',
    difficulty: 'Mudah',
    title: 'Boneka Hati Pelindung',
    description: 'Wira sokongan ceria dengan kuasa penyembuhan hati, pancaran perlambatan dan perisai kasih sayang.',
    advantage: 'Pemulihan kerap + perisai tebal + mudah menewaskan bos dengan selamat.',
    appearance: {
      headgear: 'angela_bunny',
      weaponStyle: 'heartdoll',
      primaryColor: '#f43f5e',
      secondaryColor: '#fff1f2',
      accentColor: '#67e8f9',
    },
    baseStats: { hp: 585, damage: 43, speed: 10.7, defense: 17, attackRange: 15.8, attackCooldown: 0.47 },
    displayRatings: { hp: 72, damage: 72, speed: 82, defense: 66 },
    passive: { name: 'Smart Heart', description: 'Setiap kemahiran menambah kelajuan larian +20% seketika.' },
    skills: {
      basic: { key: 'ATK', name: 'Heart Spark', description: 'Menembak tenaga hati merah jambu ke sasaran.', cooldown: 0.47, color: '#fb7185' },
      skill1: { key: 'Q', name: 'Love Waves', description: 'Gelombang hati yang mencederakan musuh & memulih +14% HP!', cooldown: 4.0, color: '#f43f5e' },
      skill2: { key: 'E', name: 'Puppet-on-a-String', description: 'Mengikat musuh dengan tenaga sihir, memperlahankan & menghentam mereka!', cooldown: 6.0, color: '#67e8f9' },
      ultimate: { key: 'R', name: 'Heartguard', description: 'Perisai Hati raksasa (+45% HP), +35% laju & gelombang penyembuhan!', cooldown: 11.5, color: '#fde047' },
    },
  },
  {
    id: 'granger',
    name: 'Granger',
    roleLabel: 'Marksman',
    roleId: 'marksman',
    difficulty: 'Sederhana',
    title: 'Pemuzik Peluru Maut',
    description: 'Penembak tepat bergaya muzik gothic dengan senapang biola dan meriam sonata pemusnah.',
    advantage: 'Peluru ke-6 sentiasa KRITIKAL & tembakan bertubi-tubi jarak jauh!',
    appearance: {
      headgear: 'granger_hood',
      weaponStyle: 'violinrifle',
      primaryColor: '#be123c',
      secondaryColor: '#0f172a',
      accentColor: '#fbbf24',
    },
    baseStats: { hp: 510, damage: 51, speed: 10.7, defense: 12, attackRange: 18.0, attackCooldown: 0.46 },
    displayRatings: { hp: 58, damage: 97, speed: 80, defense: 48 },
    passive: { name: 'Capriccio', description: 'Setiap tembakan ke-6 menghasilkan Tembakan Kritikal 2.0x!' },
    skills: {
      basic: { key: 'ATK', name: 'Sonata Shot', description: 'Tembakan senapang berkuasa dengan peluru kritikal setiap 6 das.', cooldown: 0.46, color: '#f43f5e' },
      skill1: { key: 'Q', name: 'Rhapsody', description: 'Melepaskan 5 das peluru bertubi-tubi ke arah sasaran!', cooldown: 4.5, color: '#ef4444' },
      skill2: { key: 'E', name: 'Rondo', description: 'Meluncur sisi dengan pantas & menguatkan serangan seterusnya!', cooldown: 5.0, color: '#fbbf24' },
      ultimate: { key: 'R', name: 'Death Sonata', description: 'Menembak 3 meriam sonata letupan besar yang menggegarkan musuh!', cooldown: 11.5, color: '#fde047' },
    },
  },
  {
    id: 'fredrinn',
    name: 'Fredrinn',
    roleLabel: 'Fighter / Tank',
    roleId: 'tank',
    secondaryRoleId: 'fighter',
    difficulty: 'Sederhana',
    title: 'Kesatria Kristal Perkasa',
    description: 'Pejuang berperisai berat dengan pedang kristal gergasi yang mengumpul tenaga serangan untuk hentakan muktamad.',
    advantage: 'Tahan lasak + memprovokasi musuh + Ultimate semakin kuat apabila HP rendah!',
    appearance: {
      headgear: 'fredrinn_pompadour',
      weaponStyle: 'greathammer',
      primaryColor: '#0f766e',
      secondaryColor: '#1e293b',
      accentColor: '#5eead4',
    },
    baseStats: { hp: 875, damage: 47, speed: 10.0, defense: 31, attackRange: 6.4, attackCooldown: 0.5 },
    displayRatings: { hp: 96, damage: 82, speed: 70, defense: 92 },
    passive: { name: 'Crystalline Armor', description: 'Membina tenaga kristal apabila diserang untuk menguatkan serangan balas.' },
    skills: {
      basic: { key: 'ATK', name: 'Piercing Edge', description: 'Hayunan pedang kristal besar dengan jarak hadapan jauh.', cooldown: 0.5, color: '#2dd4bf' },
      skill1: { key: 'Q', name: 'Piercing Strike', description: 'Menikam tanah melancarkan garis kristal tajam ke hadapan.', cooldown: 4.4, color: '#14b8a6' },
      skill2: { key: 'E', name: 'Brave Assault', description: 'Meluru menghentam & memprovokasi musuh + perisai tebal!', cooldown: 5.8, color: '#5eead4' },
      ultimate: { key: 'R', name: "Appraiser's Wrath", description: 'Hentakan tenaga kristal mega dengan gelombang kejutan zamrud!', cooldown: 11.8, color: '#fde047' },
    },
  },
  {
    id: 'pharsa',
    name: 'Pharsa',
    roleLabel: 'Mage',
    roleId: 'mage',
    difficulty: 'Sederhana',
    title: 'Penyihir Sayap Gagak',
    description: 'Ahli sihir terbang dengan burung gagak setia Verri, mampu melancarkan hujan bom sihir dari langit.',
    advantage: 'Serangan kawasan jarak paling luas & boleh bertukar menjadi burung gagak!',
    appearance: {
      headgear: 'pharsa_blindfold',
      weaponStyle: 'birdstaff',
      primaryColor: '#6d28d9',
      secondaryColor: '#1e1b4b',
      accentColor: '#f43f5e',
    },
    baseStats: { hp: 495, damage: 49, speed: 10.7, defense: 12, attackRange: 17.2, attackCooldown: 0.47 },
    displayRatings: { hp: 55, damage: 98, speed: 84, defense: 48 },
    passive: { name: 'Spiritual Unity', description: 'Burung gagak Verri membantu mengenakan kerosakan sihir tambahan.' },
    skills: {
      basic: { key: 'ATK', name: 'Crow Bolt', description: 'Melancarkan panahan sihir bayangan ungu.', cooldown: 0.47, color: '#a855f7' },
      skill1: { key: 'Q', name: 'Curse of Crow', description: 'Letupan sumpahan ungu menandakan & memperlahankan musuh!', cooldown: 4.5, color: '#9333ea' },
      skill2: { key: 'E', name: 'Wings by Wings', description: 'Berubah menjadi gagak terbang dengan +45% kelajuan & pancaran sihir!', cooldown: 6.2, color: '#f43f5e' },
      ultimate: { key: 'R', name: 'Feathered Air Strike', description: '4 siri pengeboman meteor sihir dari langit ke kawasan luas!', cooldown: 11.5, color: '#fbbf24' },
    },
  },

  // ============================================================
  // 21-50 ULTRA MEGA EXPANSION: 30 ADDITIONAL MLBB-INSPIRED HEROES
  // ============================================================
  {
    id: 'ruby',
    name: 'Ruby',
    roleLabel: 'Fighter / Tank',
    roleId: 'fighter',
    secondaryRoleId: 'tank',
    difficulty: 'Mudah',
    title: 'Gadis Sabit Bertudung Merah',
    description: 'Pejuang comel bersabit gergasi yang menarik semua musuh dan memulihkan nyawa secara besar-besaran.',
    advantage: 'Lifesteal kemahiran luar biasa & boleh melompat selepas setiap skill!',
    appearance: { headgear: 'ruby_hood', weaponStyle: 'scythe', primaryColor: '#e11d48', secondaryColor: '#1e293b', accentColor: '#fecdd3' },
    baseStats: { hp: 740, damage: 46, speed: 10.4, defense: 26, attackRange: 6.4, attackCooldown: 0.47 },
    displayRatings: { hp: 88, damage: 79, speed: 78, defense: 84 },
    passive: { name: "Let's Dance!", description: 'Setiap kemahiran memulih HP +12% dan meluncur sedikit ke hadapan.' },
    skills: {
      basic: { key: 'ATK', name: 'Crimson Scythe', description: 'Hayunan sabit besar menetak musuh hadapan.', cooldown: 0.47, color: '#f43f5e' },
      skill1: { key: 'Q', name: 'Be Good!', description: 'Menghayun sabit melancarkan gelombang kejut memperlahankan musuh.', cooldown: 4.0, color: '#fb7185' },
      skill2: { key: 'E', name: "Don't Run, Wolf King!", description: 'Putaran sabit 360° menarik musuh dekat & memulihkan HP!', cooldown: 5.5, color: '#e11d48' },
      ultimate: { key: 'R', name: "I'm Offended!", description: 'Libasan sabit gergasi menarik & menggoncang barisan musuh!', cooldown: 11.2, color: '#fde047' },
    },
  },
  {
    id: 'hylos',
    name: 'Hylos',
    roleLabel: 'Tank',
    roleId: 'tank',
    difficulty: 'Mudah',
    title: 'Penjaga Centaur Purba',
    description: 'Penjaga sentora gagah berkaki empat dengan aura lingkaran azab yang membakar musuh sekeliling.',
    advantage: 'HP tertinggi di antara semua wira + aura kawasan Ring of Punishment!',
    appearance: { headgear: 'hylos_antlers', weaponStyle: 'halberd_shield', primaryColor: '#1d4ed8', secondaryColor: '#0f172a', accentColor: '#67e8f9', bodyVariant: 'centaur' },
    baseStats: { hp: 990, damage: 41, speed: 10.2, defense: 36, attackRange: 6.2, attackCooldown: 0.55 },
    displayRatings: { hp: 100, damage: 64, speed: 72, defense: 97 },
    passive: { name: 'Thickened Blood', description: 'Nyawa maksimum luar biasa tinggi + penjanaan berterusan.' },
    skills: {
      basic: { key: 'ATK', name: 'Centaur Lance', description: 'Hentakan tombak penjaga alam.', cooldown: 0.55, color: '#38bdf8' },
      skill1: { key: 'Q', name: 'Law and Order', description: 'Memancarkan tenaga menghentikan & menggegarkan sasaran.', cooldown: 5.0, color: '#60a5fa' },
      skill2: { key: 'E', name: 'Ring of Punishment', description: 'Gelombang cincin tenaga biru mengelilingi Hylos membakar musuh!', cooldown: 5.6, color: '#22d3ee' },
      ultimate: { key: 'R', name: 'Glorious Pathway', description: 'Membuka laluan bercahaya yang memulih HP & melajukan larian!', cooldown: 12.0, color: '#fde047' },
    },
  },
  {
    id: 'johnson',
    name: 'Johnson',
    roleLabel: 'Tank',
    roleId: 'tank',
    difficulty: 'Sederhana',
    title: 'Kesatria Kereta Perisai',
    description: 'Robot perisai mekanikal yang boleh berubah menjadi kereta turbo untuk merempuh musuh di lorong!',
    advantage: 'Perisai kecemasan automatik & pecutan turbo Rapid Touchdown!',
    appearance: { headgear: 'johnson_visor', weaponStyle: 'wrench_shield', primaryColor: '#2563eb', secondaryColor: '#334155', accentColor: '#facc15', bodyVariant: 'mech' },
    baseStats: { hp: 910, damage: 43, speed: 9.8, defense: 36, attackRange: 6.0, attackCooldown: 0.54 },
    displayRatings: { hp: 97, damage: 68, speed: 82, defense: 99 },
    passive: { name: 'Electro Airbag', description: 'Apabila HP bawah 30%, perisai elektrik tebal aktif secara automatik.' },
    skills: {
      basic: { key: 'ATK', name: 'Mecha Wrench', description: 'Pukulan spanar keluli berat.', cooldown: 0.54, color: '#60a5fa' },
      skill1: { key: 'Q', name: 'Deadly Pincers', description: 'Melempar sepana elektrik yang meletup & menggoncang musuh.', cooldown: 4.8, color: '#38bdf8' },
      skill2: { key: 'E', name: 'Electromagnetic Rays', description: 'Pancaran kon elektrik berterusan di hadapan perisai.', cooldown: 5.8, color: '#facc15' },
      ultimate: { key: 'R', name: 'Rapid Touchdown', description: 'Pecutan turbo kereta kebal merempuh musuh dengan letupan elektrik!', cooldown: 12.2, color: '#fbbf24' },
    },
  },
  {
    id: 'atlas',
    name: 'Atlas',
    roleLabel: 'Tank',
    roleId: 'tank',
    difficulty: 'Sederhana',
    title: 'Penjaga Lautan Dalam',
    description: 'Gergasi penyelam mekanikal lautan yang membekukan musuh dan menghempas mereka dengan rantai sauh.',
    advantage: 'Kawalan sejuk beku & Ultimate Fatal Links yang menghumban semua musuh!',
    appearance: { headgear: 'atlas_diver', weaponStyle: 'anchor_chains', primaryColor: '#0284c7', secondaryColor: '#172554', accentColor: '#2dd4bf', bodyVariant: 'diver' },
    baseStats: { hp: 895, damage: 42, speed: 9.7, defense: 34, attackRange: 6.1, attackCooldown: 0.53 },
    displayRatings: { hp: 96, damage: 66, speed: 70, defense: 96 },
    passive: { name: 'Frigid Breath', description: 'Setiap kemahiran mencipta salji dingin yang memperlahankan musuh.' },
    skills: {
      basic: { key: 'ATK', name: 'Abyssal Fist', description: 'Tumbukan lengan besi lautan.', cooldown: 0.53, color: '#22d3ee' },
      skill1: { key: 'Q', name: 'Annihilate', description: 'Menghentam lantai dengan 3 letupan air beku sekeliling.', cooldown: 4.5, color: '#38bdf8' },
      skill2: { key: 'E', name: 'Perfect Match', description: 'Roh keluar meluncur laju & meletup beku apabila bergabung semula!', cooldown: 6.4, color: '#2dd4bf' },
      ultimate: { key: 'R', name: 'Fatal Links', description: 'Rantai gergasi menyambar semua musuh berdekatan & menghempas ke tanah!', cooldown: 12.5, color: '#fde047' },
    },
  },
  {
    id: 'khufra',
    name: 'Khufra',
    roleLabel: 'Tank',
    roleId: 'tank',
    difficulty: 'Sederhana',
    title: 'Pemerintah Gurun Abadi',
    description: 'Raja mumia padang pasir yang melantun seperti bola pembalut gergasi untuk mengekang pergerakan lawan.',
    advantage: 'Lompatan jarak jauh Tyrant Revenge & bola pembalut kebal.',
    appearance: { headgear: 'khufra_crown', weaponStyle: 'bandage_claws', primaryColor: '#92400e', secondaryColor: '#292524', accentColor: '#a855f7' },
    baseStats: { hp: 890, damage: 44, speed: 9.8, defense: 34, attackRange: 6.3, attackCooldown: 0.52 },
    displayRatings: { hp: 95, damage: 70, speed: 76, defense: 95 },
    passive: { name: 'Spell Curse', description: 'Serangan jarak sederhana memulihkan +8% HP secara berkala.' },
    skills: {
      basic: { key: 'ATK', name: 'Bandage Lash', description: 'Libasan pembalut gurun purba.', cooldown: 0.52, color: '#f59e0b' },
      skill1: { key: 'Q', name: "Tyrant's Revenge", description: 'Meluncur jauh menembusi barisan musuh dengan hentakan padu!', cooldown: 5.5, color: '#fbbf24' },
      skill2: { key: 'E', name: 'Bouncing Ball', description: 'Melantun seperti bola pembalut sambil menambah pertahanan & perisai!', cooldown: 6.2, color: '#a855f7' },
      ultimate: { key: 'R', name: "Tyrant's Rage", description: 'Menghayun semua musuh berhampiran dengan gelombang padang pasir!', cooldown: 12.0, color: '#ef4444' },
    },
  },
  {
    id: 'minsitthar',
    name: 'Minsitthar',
    roleLabel: 'Fighter',
    roleId: 'fighter',
    difficulty: 'Mudah',
    title: 'Pahlawan Tombak Diraja',
    description: 'Raja pahlawan dengan tombak emas dan perisai diraja yang memanggil pengawal hantu.',
    advantage: 'Tarikan tombak tepat & gelanggang pengawal diraja!',
    appearance: { headgear: 'minsitthar_crown', weaponStyle: 'golden_spear_shield', primaryColor: '#d97706', secondaryColor: '#451a03', accentColor: '#fef08a' },
    baseStats: { hp: 730, damage: 49, speed: 10.5, defense: 26, attackRange: 6.6, attackCooldown: 0.45 },
    displayRatings: { hp: 85, damage: 82, speed: 78, defense: 82 },
    passive: { name: 'Mark of the King', description: 'Setiap 4 hentakan mengenakan letupan emas tambahan!' },
    skills: {
      basic: { key: 'ATK', name: 'Royal Spear', description: 'Tikaman tombak diraja pantas.', cooldown: 0.45, color: '#fbbf24' },
      skill1: { key: 'Q', name: 'Spear of Glory', description: 'Menikam tombak jauh ke hadapan & menarik musuh!', cooldown: 4.8, color: '#f59e0b' },
      skill2: { key: 'E', name: 'Shield Assault', description: 'Melindungi hadapan dengan perisai sambil menusuk bertubi-tubi!', cooldown: 5.6, color: '#fde047' },
      ultimate: { key: 'R', name: "King's Calling", description: 'Menyeru 4 pengawal emas menyerang musuh di sekeliling gelanggang!', cooldown: 11.8, color: '#fb923c' },
    },
  },
  {
    id: 'silvanna',
    name: 'Silvanna',
    roleLabel: 'Fighter',
    roleId: 'fighter',
    difficulty: 'Mudah',
    title: 'Puteri Tombak Cahaya',
    description: 'Puteri kesatria Empayar Moniyan yang menusuk tombak cahaya berputar dan mengunci musuh dalam bulatan keadilan.',
    advantage: 'Tusukan Spiral Strangling berkuasa sihir & gelanggang pengunci!',
    appearance: { headgear: 'silvanna_tiara', weaponStyle: 'knight_lance', primaryColor: '#eab308', secondaryColor: '#1e3a8a', accentColor: '#93c5fd' },
    baseStats: { hp: 690, damage: 49, speed: 10.8, defense: 22, attackRange: 6.7, attackCooldown: 0.44 },
    displayRatings: { hp: 82, damage: 85, speed: 82, defense: 76 },
    passive: { name: 'Knightess Resolve', description: 'Mengurangkan pertahanan musuh dan meningkatkan kuasa sihir.' },
    skills: {
      basic: { key: 'ATK', name: 'Imperial Lance', description: 'Tusukan lembing diraja bercahaya biru emas.', cooldown: 0.44, color: '#60a5fa' },
      skill1: { key: 'Q', name: 'Cometic Lance', description: 'Menikam lembing bercahaya lalu meluncur pantas menetak musuh!', cooldown: 4.4, color: '#fbbf24' },
      skill2: { key: 'E', name: 'Spiral Strangling', description: 'Putaran tombak pantas 6 tusukan + perisai cahaya!', cooldown: 5.4, color: '#38bdf8' },
      ultimate: { key: 'R', name: 'Imperial Justice', description: 'Melompat & mencipta bulatan keadilan dengan +60% kelajuan serangan!', cooldown: 11.4, color: '#fde047' },
    },
  },
  {
    id: 'paquito',
    name: 'Paquito',
    roleLabel: 'Fighter',
    roleId: 'fighter',
    difficulty: 'Sederhana',
    title: 'Peninju Tangan Guruh',
    description: 'Peninju legenda yang menggabungkan tumbukan jab kilat, uppercut pemusnah dan kombo Champ Stance tanpa henti!',
    advantage: 'Kombo tinju terpantas & perisai automatik setiap tumbukan.',
    appearance: { headgear: 'paquito_hair', weaponStyle: 'boxing_gloves', primaryColor: '#dc2626', secondaryColor: '#18181b', accentColor: '#fbbf24' },
    baseStats: { hp: 675, damage: 53, speed: 11.3, defense: 21, attackRange: 5.9, attackCooldown: 0.4 },
    displayRatings: { hp: 80, damage: 92, speed: 88, defense: 74 },
    passive: { name: 'Champ Stance', description: 'Setiap 3 kemahiran menguatkan kemahiran seterusnya +35% kerosakan.' },
    skills: {
      basic: { key: 'ATK', name: 'Heavy Hook', description: 'Tumbukan tinju berat bertubi-tubi.', cooldown: 0.4, color: '#ef4444' },
      skill1: { key: 'Q', name: 'Heavy Left Punch', description: 'Tumbukan padu mengenakan kerosakan & memberi perisai tebal!', cooldown: 4.0, color: '#fb923c' },
      skill2: { key: 'E', name: 'Jab', description: 'Meluru pantas menumbuk menembusi sasaran!', cooldown: 4.4, color: '#f59e0b' },
      ultimate: { key: 'R', name: 'Knockout Strike', description: 'Uppercut berganda dengan letupan gelombang kejut merah!', cooldown: 10.5, color: '#fde047' },
    },
  },
  {
    id: 'yuzhong',
    name: 'Yu Zhong',
    roleLabel: 'Fighter',
    roleId: 'fighter',
    difficulty: 'Sederhana',
    title: 'Naga Hitam Perkasa',
    description: 'Penjelmaan Naga Hitam yang menyerap tenaga Sha daripada musuh dan bertukar menjadi naga terbang gergasi!',
    advantage: 'Pemulihan nyawa luar biasa dalam pertarungan berbilang musuh.',
    appearance: { headgear: 'yuzhong_horns', weaponStyle: 'dragon_claws', primaryColor: '#6d28d9', secondaryColor: '#0f172a', accentColor: '#fbbf24', bodyVariant: 'dragon' },
    baseStats: { hp: 735, damage: 51, speed: 10.6, defense: 24, attackRange: 6.5, attackCooldown: 0.45 },
    displayRatings: { hp: 88, damage: 88, speed: 80, defense: 80 },
    passive: { name: 'Cursing Touch', description: 'Serangan meninggalkan tanda Naga Hitam yang meletup & memulih HP.' },
    skills: {
      basic: { key: 'ATK', name: 'Dragon Claw', description: 'Cakaran tenaga Naga Hitam ungu emas.', cooldown: 0.45, color: '#a855f7' },
      skill1: { key: 'Q', name: 'Dragon Tail', description: 'Jubah kuasa Naga berputar luas menetak semua musuh!', cooldown: 4.5, color: '#9333ea' },
      skill2: { key: 'E', name: 'Furious Dive', description: 'Melompat & menghentam kawasan hadapan menggoncang musuh!', cooldown: 5.8, color: '#f59e0b' },
      ultimate: { key: 'R', name: 'Black Dragon Form', description: 'Bertukar menjadi Naga Hitam dengan +45% HP & gelombang ungu!', cooldown: 12.2, color: '#fbbf24' },
    },
  },
  {
    id: 'terizla',
    name: 'Terizla',
    roleLabel: 'Fighter',
    roleId: 'fighter',
    difficulty: 'Mudah',
    title: 'Tukang Besi Tukul Maut',
    description: 'Pahlawan kuat membawa tukul raksasa rantai yang menghancurkan perisai musuh dalam 3 hentakan padu.',
    advantage: 'Kerosakan setiap hentakan paling tinggi & semakin kebal apabila HP rendah!',
    appearance: { headgear: 'terizla_mask', weaponStyle: 'execution_hammer', primaryColor: '#3f3f46', secondaryColor: '#18181b', accentColor: '#4ade80' },
    baseStats: { hp: 800, damage: 55, speed: 9.6, defense: 27, attackRange: 6.4, attackCooldown: 0.54 },
    displayRatings: { hp: 92, damage: 93, speed: 66, defense: 86 },
    passive: { name: 'Body of Smith', description: 'Mengurangkan kerosakan sehingga +25% apabila HP semakin berkurang.' },
    skills: {
      basic: { key: 'ATK', name: 'Anvil Crush', description: 'Hentakan tukul gergasi berkuasa tinggi.', cooldown: 0.54, color: '#4ade80' },
      skill1: { key: 'Q', name: 'Revenge Strike', description: 'Membelah tanah dengan garis tenaga hijau yang meletup!', cooldown: 4.6, color: '#22c55e' },
      skill2: { key: 'E', name: 'Execution Strike', description: '3 ayunan tukul berturut-turut dengan hentakan akhir raksasa!', cooldown: 5.4, color: '#86efac' },
      ultimate: { key: 'R', name: 'Penalty Zone', description: 'Melompat & menghempas tukul menawan musuh dengan rantai besi!', cooldown: 11.8, color: '#fbbf24' },
    },
  },
  {
    id: 'dyrroth',
    name: 'Dyrroth',
    roleLabel: 'Fighter',
    roleId: 'fighter',
    difficulty: 'Mudah',
    title: 'Putera Jurang Gelap',
    description: 'Pahlawan pantas dengan cakaran Jurang Gelap yang merobek pertahanan musuh dengan satu letupan maut.',
    advantage: 'Menghancurkan pertahanan Tank/Bos & serangan akhir Abysm Strike!',
    appearance: { headgear: 'dyrroth_horns', weaponStyle: 'abyss_blades', primaryColor: '#991b1b', secondaryColor: '#1e1b4b', accentColor: '#c084fc' },
    baseStats: { hp: 665, damage: 53, speed: 11.0, defense: 20, attackRange: 6.2, attackCooldown: 0.42 },
    displayRatings: { hp: 78, damage: 93, speed: 84, defense: 72 },
    passive: { name: 'Wrath of the Abyss', description: 'Setiap 3 serangan mencetuskan putaran bilah merah + pulih HP.' },
    skills: {
      basic: { key: 'ATK', name: 'Abyss Slash', description: 'Tetakan bilah jurang ungu merah pantas.', cooldown: 0.42, color: '#c084fc' },
      skill1: { key: 'Q', name: 'Burst Strike', description: 'Gelombang letupan tenaga jurang jarak jauh memperlahankan musuh.', cooldown: 4.2, color: '#a855f7' },
      skill2: { key: 'E', name: 'Spectre Step', description: 'Meluru menghentam & merobek 50% pertahanan musuh!', cooldown: 5.2, color: '#ef4444' },
      ultimate: { key: 'R', name: 'Abysm Strike', description: 'Tembakan letupan maut merah ungu yang menggegarkan medan perang!', cooldown: 11.0, color: '#fbbf24' },
    },
  },
  {
    id: 'aamon',
    name: 'Aamon',
    roleLabel: 'Assassin',
    roleId: 'assassin',
    difficulty: 'Sederhana',
    title: 'Duke Serpihan Halimunan',
    description: 'Bangsawan pembunuh yang boleh menghilang selepas menyerang dan menghujani musuh dengan puluhan serpihan cahaya.',
    advantage: 'Halimunan semula jadi + penyembuhan semasa menyelinap & Ultimate letupan serpihan!',
    appearance: { headgear: 'aamon_hood', weaponStyle: 'shard_blades', primaryColor: '#0369a1', secondaryColor: '#0f172a', accentColor: '#5eead4' },
    baseStats: { hp: 525, damage: 54, speed: 12.1, defense: 14, attackRange: 7.4, attackCooldown: 0.37 },
    displayRatings: { hp: 60, damage: 96, speed: 95, defense: 50 },
    passive: { name: 'Invisible Armor', description: 'Menjadi separa halimunan seketika selepas kemahiran & memulih HP.' },
    skills: {
      basic: { key: 'ATK', name: 'Shard Thrust', description: 'Menusuk dengan bilah serpihan kristal berkilau.', cooldown: 0.37, color: '#5eead4' },
      skill1: { key: 'Q', name: 'Soul Shards', description: 'Melancarkan 4 serpihan kristal menuju sasaran secara automatik!', cooldown: 4.2, color: '#38bdf8' },
      skill2: { key: 'E', name: 'Slayer Shards', description: 'Melontar serpihan penanda & memecut pantas dengan +40% kelajuan!', cooldown: 5.2, color: '#2dd4bf' },
      ultimate: { key: 'R', name: 'Endless Shards', description: 'Menghujani sasaran dengan 8 serpihan kristal meletup serentak!', cooldown: 10.8, color: '#fde047' },
    },
  },
  {
    id: 'hayabusa',
    name: 'Hayabusa',
    roleLabel: 'Assassin',
    roleId: 'assassin',
    difficulty: 'Tinggi',
    title: 'Ninja Bayangan Merah',
    description: 'Ninja legenda dengan shuriken kipas, bayangan berpindah tempat dan tebasan bayang pantas Shadow Kill!',
    advantage: 'Elakan bayangan tangkas & kebal ketika melancarkan Shadow Kill.',
    appearance: { headgear: 'hayabusa_mask', weaponStyle: 'katana_shuriken', primaryColor: '#7c3aed', secondaryColor: '#09090b', accentColor: '#f43f5e' },
    baseStats: { hp: 520, damage: 55, speed: 12.3, defense: 14, attackRange: 6.4, attackCooldown: 0.36 },
    displayRatings: { hp: 58, damage: 97, speed: 97, defense: 50 },
    passive: { name: 'Ninjutsu: Trace of Shadow', description: 'Setiap hentakan menambah +5% kerosakan bayangan sehingga 4 lapisan.' },
    skills: {
      basic: { key: 'ATK', name: 'Shadow Katana', description: 'Tebasan katana ninja ultra pantas.', cooldown: 0.36, color: '#f43f5e' },
      skill1: { key: 'Q', name: 'Phantom Shuriken', description: 'Melempar 3 shuriken kipas yang kembali ke arah Hayabusa!', cooldown: 3.8, color: '#a855f7' },
      skill2: { key: 'E', name: 'Quad Shadow', description: 'Meluncur kilat bersama 4 bayangan ninja ke hadapan!', cooldown: 5.4, color: '#818cf8' },
      ultimate: { key: 'R', name: 'Ougi: Shadow Kill', description: 'Menjadi bayangan kebal yang menetak musuh berulang kali!', cooldown: 10.8, color: '#fde047' },
    },
  },
  {
    id: 'karina',
    name: 'Karina',
    roleLabel: 'Assassin',
    roleId: 'assassin',
    difficulty: 'Mudah',
    title: 'Pendekar Bulan Gelap',
    description: 'Pembunuh Elf Gelap bersenjatakan dua bilah bulan yang boleh menangkis serangan jarak jauh dan menamatkan musuh lemah.',
    advantage: 'Tarian bilah menangkis peluru & kerosakan kritikal terhadap HP rendah!',
    appearance: { headgear: 'karina_ears', weaponStyle: 'moon_twinblades', primaryColor: '#6b21a8', secondaryColor: '#0f172a', accentColor: '#22d3ee' },
    baseStats: { hp: 540, damage: 54, speed: 12.2, defense: 15, attackRange: 6.2, attackCooldown: 0.37 },
    displayRatings: { hp: 62, damage: 95, speed: 96, defense: 54 },
    passive: { name: 'Shadow Combo', description: 'Serangan ke-3 mengenakan kerosakan True Damage tambahan!' },
    skills: {
      basic: { key: 'ATK', name: 'Dual Moon Slash', description: 'Tebasan kembar biru ungu yang pantas.', cooldown: 0.37, color: '#22d3ee' },
      skill1: { key: 'Q', name: 'Dance of Blades', description: 'Memusingkan bilah menangkis serangan +40% kelajuan gerak!', cooldown: 4.5, color: '#38bdf8' },
      skill2: { key: 'E', name: 'Dance of Death', description: 'Libasan berpusing 360° mencederakan semua musuh sekeliling.', cooldown: 4.8, color: '#a855f7' },
      ultimate: { key: 'R', name: 'Shadow Assault', description: 'Menyerbu kilat menembusi sasaran dengan letupan bayangan maut!', cooldown: 10.2, color: '#f43f5e' },
    },
  },
  {
    id: 'helcurt',
    name: 'Helcurt',
    roleLabel: 'Assassin',
    roleId: 'assassin',
    difficulty: 'Sederhana',
    title: 'Pemburu Kegelapan Malam',
    description: 'Makhluk bayangan pantas yang melepaskan tusukan jarum beracun dan menyerbu dalam kegelapan malam!',
    advantage: 'Kelajuan larian amat pantas & ledakan 5 jarum maut Deadly Stinger!',
    appearance: { headgear: 'helcurt_crest', weaponStyle: 'shadow_stingers', primaryColor: '#312e81', secondaryColor: '#09090b', accentColor: '#c084fc' },
    baseStats: { hp: 515, damage: 55, speed: 12.5, defense: 13, attackRange: 6.1, attackCooldown: 0.35 },
    displayRatings: { hp: 57, damage: 97, speed: 99, defense: 48 },
    passive: { name: 'Prowler', description: 'Kelajuan serangan & larian bertambah apabila mengejar sasaran.' },
    skills: {
      basic: { key: 'ATK', name: 'Night Claw', description: 'Cakaran sengat malam sepantas kilat.', cooldown: 0.35, color: '#a855f7' },
      skill1: { key: 'Q', name: 'Hidden Terror', description: 'Menyerbu bayangan ke hadapan & memperlahankan musuh.', cooldown: 5.0, color: '#818cf8' },
      skill2: { key: 'E', name: 'Deadly Stinger', description: 'Menembak 5 bilah sengat ungu tajam ke arah sasaran!', cooldown: 4.0, color: '#c084fc' },
      ultimate: { key: 'R', name: 'Dark Night Falls', description: 'Memecut +55% laju & +35% kelajuan serangan dalam ribut bayangan!', cooldown: 11.0, color: '#fde047' },
    },
  },
  {
    id: 'natalia',
    name: 'Natalia',
    roleLabel: 'Assassin',
    roleId: 'assassin',
    difficulty: 'Tinggi',
    title: 'Cakar Halimunan Gereja',
    description: 'Pembunuh senyap yang menyelinap di dalam semak belukar dan melakukan serangan hendap dari belakang!',
    advantage: 'Serangan hendap dari semak mengenakan +30% kerosakan Kritikal!',
    appearance: { headgear: 'natalia_hood', weaponStyle: 'assassin_claws', primaryColor: '#4338ca', secondaryColor: '#1e293b', accentColor: '#fde047' },
    baseStats: { hp: 510, damage: 54, speed: 12.4, defense: 13, attackRange: 6.0, attackCooldown: 0.36 },
    displayRatings: { hp: 56, damage: 95, speed: 98, defense: 48 },
    passive: { name: 'Assassin Instinct', description: 'Berada dalam semak memberi +25% larian & serangan hendap Kritikal!' },
    skills: {
      basic: { key: 'ATK', name: 'Claw Ambush', description: 'Cakaran kuku keluli tajam pantas.', cooldown: 0.36, color: '#818cf8' },
      skill1: { key: 'Q', name: 'Claw Dash', description: 'Meluncur dua kali menetak musuh di laluan.', cooldown: 4.4, color: '#6366f1' },
      skill2: { key: 'E', name: 'Smoke Bomb', description: 'Bom asap kebal yang melambatkan musuh & +30% kelajuan serang!', cooldown: 6.0, color: '#94a3b8' },
      ultimate: { key: 'R', name: 'The Hunt', description: 'Menyelinap halimunan serta-merta & mencakar kritikal berganda!', cooldown: 10.5, color: '#fbbf24' },
    },
  },
  {
    id: 'harley',
    name: 'Harley',
    roleLabel: 'Mage / Assassin',
    roleId: 'mage',
    secondaryRoleId: 'assassin',
    difficulty: 'Sederhana',
    title: 'Ahli Silap Mata Ajaib',
    description: 'Ahli silap mata cilik bertopi besar yang menembak kad berapi, melompat dengan topi magik dan meletupkan cincin api!',
    advantage: 'Pergerakan Space Escape lincah & letupan Deadly Magic yang besar!',
    appearance: { headgear: 'harley_tophat', weaponStyle: 'magic_cards', primaryColor: '#7e22ce', secondaryColor: '#1e1b4b', accentColor: '#fbbf24' },
    baseStats: { hp: 505, damage: 49, speed: 11.2, defense: 13, attackRange: 15.8, attackCooldown: 0.45 },
    displayRatings: { hp: 58, damage: 93, speed: 88, defense: 50 },
    passive: { name: 'Magic Master', description: 'Serangan asas berunsur sihir mengurangkan rintangan sihir musuh.' },
    skills: {
      basic: { key: 'ATK', name: 'Trick Card', description: 'Melontar kad ajaib berkilau dari jarak jauh.', cooldown: 0.45, color: '#f472b6' },
      skill1: { key: 'Q', name: 'Poker Trick', description: 'Melempar rentetan 6 kad ajaib ke arah musuh dengan pantas!', cooldown: 4.0, color: '#c084fc' },
      skill2: { key: 'E', name: 'Space Escape', description: 'Teleportasi pantas ke hadapan meninggalkan topi ajaib & +30% laju!', cooldown: 5.5, color: '#38bdf8' },
      ultimate: { key: 'R', name: 'Deadly Magic', description: 'Cincin api berputar membesar lalu meletup mengenakan kerosakan mega!', cooldown: 11.0, color: '#f97316' },
    },
  },
  {
    id: 'cyclops',
    name: 'Cyclops',
    roleLabel: 'Mage',
    roleId: 'mage',
    difficulty: 'Mudah',
    title: 'Penyihir Bintang Galaksi',
    description: 'Ahli sihir galaksi kecil bermata satu dengan 5 planet bercahaya yang mengejar musuh tanpa henti!',
    advantage: 'Setiap skill mengurangkan cooldown & bebola planet mengejar sendiri!',
    appearance: { headgear: 'cyclops_hat', weaponStyle: 'planet_orbs', primaryColor: '#4f46e5', secondaryColor: '#1e1b4b', accentColor: '#38bdf8' },
    baseStats: { hp: 515, damage: 48, speed: 10.6, defense: 14, attackRange: 16.0, attackCooldown: 0.46 },
    displayRatings: { hp: 60, damage: 91, speed: 80, defense: 54 },
    passive: { name: 'Starlit Hourglass', description: 'Setiap kemahiran mengurangkan masa menunggu semua skill sebanyak 0.8s.' },
    skills: {
      basic: { key: 'ATK', name: 'Star Bolt', description: 'Tembakan bintang biru galaksi.', cooldown: 0.46, color: '#60a5fa' },
      skill1: { key: 'Q', name: 'Stardust Shock', description: 'Gelombang kembar debu bintang jarak jauh!', cooldown: 4.0, color: '#38bdf8' },
      skill2: { key: 'E', name: 'Planets Attack', description: '5 planet cahaya mengorbit Cyclops lalu menembak musuh & +30% laju!', cooldown: 5.2, color: '#a78bfa' },
      ultimate: { key: 'R', name: 'Star Power Lockdown', description: 'Planet gergasi mengejar, mengunci & meletupkan musuh!', cooldown: 11.2, color: '#fde047' },
    },
  },
  {
    id: 'valir',
    name: 'Valir',
    roleLabel: 'Mage',
    roleId: 'mage',
    difficulty: 'Mudah',
    title: 'Putera Api Marak',
    description: 'Penyihir api perkasa yang melancarkan bola api letupan dan tembok api yang menolak semua musuh ke belakang!',
    advantage: 'Menolak musuh mendekat & letupan Ablaze berterusan!',
    appearance: { headgear: 'valir_flame', weaponStyle: 'fire_gauntlets', primaryColor: '#ea580c', secondaryColor: '#431407', accentColor: '#fde047' },
    baseStats: { hp: 520, damage: 49, speed: 10.5, defense: 14, attackRange: 16.5, attackCooldown: 0.46 },
    displayRatings: { hp: 60, damage: 94, speed: 78, defense: 54 },
    passive: { name: 'Ashing', description: 'Bakar musuh dengan letupan api tambahan selepas 3 hentakan!' },
    skills: {
      basic: { key: 'ATK', name: 'Flame Bolt', description: 'Melancarkan bebola api merah menyala.', cooldown: 0.46, color: '#fb923c' },
      skill1: { key: 'Q', name: 'Burst Fireball', description: 'Bola api besar meletup dua kali & membakar kawasan sasaran!', cooldown: 3.8, color: '#f97316' },
      skill2: { key: 'E', name: 'Searing Torrent', description: 'Tembok api marak menolak & mencederakan semua musuh di hadapan!', cooldown: 5.8, color: '#ef4444' },
      ultimate: { key: 'R', name: 'Vengeance Flame', description: 'Menyalakan api suci: +35% kuasa sihir, +25% laju & gelombang api!', cooldown: 11.2, color: '#fde047' },
    },
  },
  {
    id: 'aurora',
    name: 'Aurora',
    roleLabel: 'Mage',
    roleId: 'mage',
    difficulty: 'Mudah',
    title: 'Ratu Ais Utara',
    description: 'Permaisuri sihir salji yang membekukan musuh dengan ribut ais biru dan menjatuhkan meteor ais gergasi!',
    advantage: 'Membekukan & memperlahankan semua musuh + kebal ais kecemasan!',
    appearance: { headgear: 'aurora_crown', weaponStyle: 'frost_scepter', primaryColor: '#0284c7', secondaryColor: '#082f49', accentColor: '#bae6fd' },
    baseStats: { hp: 515, damage: 49, speed: 10.2, defense: 14, attackRange: 16.6, attackCooldown: 0.47 },
    displayRatings: { hp: 60, damage: 94, speed: 74, defense: 54 },
    passive: { name: 'Pride of Ice', description: 'Membeku kebal & memulihkan HP jika menerima bahaya kritikal.' },
    skills: {
      basic: { key: 'ATK', name: 'Frost Shard', description: 'Memancarkan bilah kristal ais sejuk.', cooldown: 0.47, color: '#7dd3fc' },
      skill1: { key: 'Q', name: 'Hailstone Blast', description: 'Hujan ketulan ais jatuh meletup & memperlahankan musuh!', cooldown: 4.0, color: '#38bdf8' },
      skill2: { key: 'E', name: 'Frosty Breeze', description: 'Ribut salji kon hadapan membekukan musuh & memberi perisai ais!', cooldown: 5.8, color: '#bae6fd' },
      ultimate: { key: 'R', name: 'Frigid Glacier', description: 'Memanggil glasier ais raksasa dari langit membekukan kawasan luas!', cooldown: 11.5, color: '#e0f2fe' },
    },
  },
  {
    id: 'cecilion',
    name: 'Cecilion',
    roleLabel: 'Mage',
    roleId: 'mage',
    difficulty: 'Mudah',
    title: 'Penguasa Kelawar Malam',
    description: 'Penyihir bangsawan malam dengan impak kelawar merah jarak amat jauh dan jamuan kuasa tanpa had.',
    advantage: 'Semakin lama pertempuran, semakin kuat letupan Bat Impact!',
    appearance: { headgear: 'cecilion_collar', weaponStyle: 'blood_scepter', primaryColor: '#881337', secondaryColor: '#18181b', accentColor: '#f43f5e' },
    baseStats: { hp: 505, damage: 50, speed: 10.4, defense: 12, attackRange: 17.6, attackCooldown: 0.48 },
    displayRatings: { hp: 58, damage: 98, speed: 76, defense: 48 },
    passive: { name: 'Overflowing', description: 'Setiap kemahiran menambah kuasa sihir kekal sedikit demi sedikit!' },
    skills: {
      basic: { key: 'ATK', name: 'Crimson Bolt', description: 'Tembakan tenaga kelawar merah jarak jauh.', cooldown: 0.48, color: '#f43f5e' },
      skill1: { key: 'Q', name: 'Bat Impact', description: 'Kelawar raksasa menyambar titik sasaran & meletup besar!', cooldown: 3.8, color: '#e11d48' },
      skill2: { key: 'E', name: 'Sanguine Claws', description: 'Cakaran darah menarik & memperlahankan musuh di tengah!', cooldown: 6.0, color: '#be123c' },
      ultimate: { key: 'R', name: 'Bats Feast', description: 'Menyeru kawanan kelawar menyerang musuh sekeliling sambil memulih HP!', cooldown: 11.5, color: '#fb7185' },
    },
  },
  {
    id: 'luoyi',
    name: 'Luo Yi',
    roleLabel: 'Mage',
    roleId: 'mage',
    difficulty: 'Sederhana',
    title: 'Penyihir Harmoni Yin-Yang',
    description: 'Ahli sihir bijaksana yang menggabungkan tenaga cahaya Emas dan bayangan Ungu untuk mencipta letupan Yin-Yang!',
    advantage: 'Tindak balas Yin-Yang memberi perisai & letupan berganda!',
    appearance: { headgear: 'luoyi_bun', weaponStyle: 'yinyang_fan', primaryColor: '#7e22ce', secondaryColor: '#1e1b4b', accentColor: '#fde047' },
    baseStats: { hp: 510, damage: 49, speed: 10.5, defense: 13, attackRange: 16.5, attackCooldown: 0.47 },
    displayRatings: { hp: 59, damage: 95, speed: 78, defense: 52 },
    passive: { name: 'Duality', description: 'Setiap hentakan kemahiran memberi perisai & letupan Yin-Yang!' },
    skills: {
      basic: { key: 'ATK', name: 'Duality Bolt', description: 'Menembak sinar emas dan ungu berselang-seli.', cooldown: 0.47, color: '#c084fc' },
      skill1: { key: 'Q', name: 'Dispersion', description: 'Menembak gelombang tenaga berkembar dalam kipas luas!', cooldown: 3.6, color: '#fde047' },
      skill2: { key: 'E', name: 'Rotation', description: 'Bulatan Yin-Yang berputar mencederakan & menarik musuh ke tengah!', cooldown: 5.8, color: '#a855f7' },
      ultimate: { key: 'R', name: 'Diversion', description: 'Teleportasi jarak dekat berserta perisai besar & ledakan Yin-Yang!', cooldown: 11.0, color: '#38bdf8' },
    },
  },
  {
    id: 'yve',
    name: 'Yve',
    roleLabel: 'Mage',
    roleId: 'mage',
    difficulty: 'Sederhana',
    title: 'Penjaga Kosmik Bintang',
    description: 'Makhluk kosmik dari alam galaksi yang melancarkan letupan nebula dan papan bintang gergasi Real World Manipulation!',
    advantage: 'Kawasan serangan bintang kosmik yang sangat luas & perlambatan kuat!',
    appearance: { headgear: 'yve_visor', weaponStyle: 'star_board', primaryColor: '#6d28d9', secondaryColor: '#0f172a', accentColor: '#e879f9' },
    baseStats: { hp: 515, damage: 49, speed: 10.5, defense: 14, attackRange: 17.0, attackCooldown: 0.47 },
    displayRatings: { hp: 60, damage: 95, speed: 78, defense: 52 },
    passive: { name: 'Galactic Power', description: 'Mengumpul tenaga galaksi untuk meningkatkan letupan bintang.' },
    skills: {
      basic: { key: 'ATK', name: 'Cosmic Pulse', description: 'Pancaran nadi kosmik ungu berkilauan.', cooldown: 0.47, color: '#e879f9' },
      skill1: { key: 'Q', name: 'Void Blast', description: 'Letupan nebula kosmik pantas di hadapan!', cooldown: 3.6, color: '#c084fc' },
      skill2: { key: 'E', name: 'Void Crystal', description: 'Menjatuhkan kristal kosmik memancarkan garis cahaya lambat!', cooldown: 5.8, color: '#818cf8' },
      ultimate: { key: 'R', name: 'Real World Manipulation', description: 'Membuka medan bintang raksasa dengan 4 hujan letupan kosmik & perisai!', cooldown: 11.8, color: '#fde047' },
    },
  },
  {
    id: 'change',
    name: "Chang'e",
    roleLabel: 'Mage',
    roleId: 'mage',
    difficulty: 'Mudah',
    title: 'Puteri Sabit Bulan',
    description: 'Puteri kecil ceria di atas bulan sabit yang memancarkan puluhan hujan meteor bintang bertalu-talu!',
    advantage: 'Tembakan berterusan Meteor Shower memusnahkan gelombang minion & The Lord!',
    appearance: { headgear: 'change_buns', weaponStyle: 'crescent_orb', primaryColor: '#f59e0b', secondaryColor: '#312e81', accentColor: '#fef08a', bodyVariant: 'moonhalo' },
    baseStats: { hp: 505, damage: 47, speed: 11.1, defense: 13, attackRange: 16.5, attackCooldown: 0.44 },
    displayRatings: { hp: 58, damage: 93, speed: 88, defense: 50 },
    passive: { name: 'Trouble Maker', description: 'Setiap tembakan menambah +2% kerosakan bertindih sehingga +30%.' },
    skills: {
      basic: { key: 'ATK', name: 'Moonlight Spark', description: 'Menembak percikan bulan keemasan.', cooldown: 0.44, color: '#fef08a' },
      skill1: { key: 'Q', name: 'Starmoon Shockwave', description: 'Menghantar 5 bebola bulan sabit yang memperlahankan musuh!', cooldown: 4.0, color: '#fbbf24' },
      skill2: { key: 'E', name: 'Crescent Moon', description: 'Perisai Bulan Sabit +35% kelajuan larian & tembakan berkembar!', cooldown: 5.5, color: '#fde047' },
      ultimate: { key: 'R', name: 'Meteor Shower', description: 'Menghujani barisan hadapan dengan rentetan 12 meteor bulan berapi!', cooldown: 11.0, color: '#f97316' },
    },
  },
  {
    id: 'ixia',
    name: 'Ixia',
    roleLabel: 'Marksman',
    roleId: 'marksman',
    difficulty: 'Sederhana',
    title: 'Penembak Gelombang Ark',
    description: 'Pencipta senjata tenaga ark berkembar yang memancarkan tembakan kipas gergasi dan memulih nyawa setiap hentakan ke-3.',
    advantage: 'Tembakan kipas luas Full Barrage mengenai semua musuh di hadapan!',
    appearance: { headgear: 'ixia_visor', weaponStyle: 'arc_rifles', primaryColor: '#06b6d4', secondaryColor: '#0f172a', accentColor: '#f472b6' },
    baseStats: { hp: 505, damage: 49, speed: 10.6, defense: 12, attackRange: 17.8, attackCooldown: 0.43 },
    displayRatings: { hp: 57, damage: 94, speed: 80, defense: 47 },
    passive: { name: 'Siphon Starlium', description: 'Serangan ke-3 mencetuskan tembakan ark Siphon yang memulihkan HP!' },
    skills: {
      basic: { key: 'ATK', name: 'Arc Shot', description: 'Tembakan senapang ark siber pantas.', cooldown: 0.43, color: '#22d3ee' },
      skill1: { key: 'Q', name: 'Dual Arc', description: 'Dua pancaran tenaga ark serentak +25% kelajuan larian!', cooldown: 4.2, color: '#38bdf8' },
      skill2: { key: 'E', name: 'Star Helix', description: 'Letupan pusaran cahaya yang menarik musuh ke tengah!', cooldown: 6.0, color: '#f472b6' },
      ultimate: { key: 'R', name: 'Full Barrage', description: 'Membuka meriam ark kipas gergasi dengan +40% jarak & kerosakan!', cooldown: 11.5, color: '#fde047' },
    },
  },
  {
    id: 'bruno',
    name: 'Bruno',
    roleLabel: 'Marksman',
    roleId: 'marksman',
    difficulty: 'Mudah',
    title: 'Penyerang Bola Mekanikal',
    description: 'Atlet sibernetik dengan kaki mekanikal berkuasa tinggi yang menendang bola tenaga Kritikal ke arah lawan!',
    advantage: 'Peluang Kritikal meningkat sehingga +30% + tendangan melantun!',
    appearance: { headgear: 'bruno_goggles', weaponStyle: 'mecha_ball', primaryColor: '#0284c7', secondaryColor: '#1e293b', accentColor: '#facc15' },
    baseStats: { hp: 510, damage: 50, speed: 10.9, defense: 13, attackRange: 16.8, attackCooldown: 0.43 },
    displayRatings: { hp: 58, damage: 95, speed: 85, defense: 48 },
    passive: { name: 'Mecha Legs', description: 'Setiap kemahiran menambah +8% peluang Kritikal sehingga +32%.' },
    skills: {
      basic: { key: 'ATK', name: 'Mecha Kick', description: 'Menendang bola tenaga berkuasa ke sasaran.', cooldown: 0.43, color: '#38bdf8' },
      skill1: { key: 'Q', name: 'Volley Shot', description: 'Bola tenaga super memperlahankan musuh & mengenakan kritikal tinggi!', cooldown: 3.8, color: '#facc15' },
      skill2: { key: 'E', name: 'Flying Tackle', description: 'Meluncur tangkas ke hadapan merempuh halangan!', cooldown: 5.0, color: '#0ea5e9' },
      ultimate: { key: 'R', name: 'Wave of the World', description: 'Tendangan bola tenaga emas gergasi yang meletup berkali-kali!', cooldown: 11.0, color: '#fbbf24' },
    },
  },
  {
    id: 'clint',
    name: 'Clint',
    roleLabel: 'Marksman',
    roleId: 'marksman',
    difficulty: 'Mudah',
    title: 'Koboi Penembak Keadilan',
    description: 'Koboi Barat bertopi lebar yang melepaskan 5 das revolver pantas dan tembakan penembus jarak amat jauh!',
    advantage: 'Setiap skill menukar serangan seterusnya menjadi tembakan garis panjang!',
    appearance: { headgear: 'clint_hat', weaponStyle: 'cowboy_pistols', primaryColor: '#b45309', secondaryColor: '#292524', accentColor: '#fbbf24' },
    baseStats: { hp: 510, damage: 51, speed: 10.6, defense: 13, attackRange: 17.5, attackCooldown: 0.45 },
    displayRatings: { hp: 58, damage: 96, speed: 78, defense: 49 },
    passive: { name: 'Double Shot', description: 'Selepas setiap skill, tembakan seterusnya menembus semua musuh!' },
    skills: {
      basic: { key: 'ATK', name: 'Justice Revolver', description: 'Tembakan pistol revolver tepat.', cooldown: 0.45, color: '#fbbf24' },
      skill1: { key: 'Q', name: 'Quick Draw', description: 'Melepaskan 5 das peluru kipas dalam sekelip mata!', cooldown: 4.0, color: '#f59e0b' },
      skill2: { key: 'E', name: 'Trapping Recoil', description: 'Melompat ke belakang & melempar jaring perangkap perlambat!', cooldown: 5.4, color: '#ef4444' },
      ultimate: { key: 'R', name: 'Grenade Bombardment', description: 'Menembak meriam bom tangan berkuasa tinggi yang meletup luas!', cooldown: 10.2, color: '#fde047' },
    },
  },
  {
    id: 'brody',
    name: 'Brody',
    roleLabel: 'Marksman',
    roleId: 'marksman',
    difficulty: 'Sederhana',
    title: 'Penembak Bintang Tunggal',
    description: 'Penembak bertenaga jurang yang boleh menembak sambil bergerak dan meletupkan semua musuh dengan Torn-Apart Memory!',
    advantage: 'Serangan paling padu setiap tembakan & Ultimate penamat jarak luas!',
    appearance: { headgear: 'brody_dreads', weaponStyle: 'abyss_gauntlet', primaryColor: '#4338ca', secondaryColor: '#09090b', accentColor: '#fbbf24' },
    baseStats: { hp: 530, damage: 56, speed: 10.7, defense: 14, attackRange: 17.2, attackCooldown: 0.52 },
    displayRatings: { hp: 62, damage: 99, speed: 80, defense: 52 },
    passive: { name: 'Abyss Corrosion', description: 'Setiap hentakan meningkatkan kerosakan +10% ke atas sasaran yang sama.' },
    skills: {
      basic: { key: 'ATK', name: 'Abyss Bolt', description: 'Tembakan tenaga jurang berimpak amat tinggi.', cooldown: 0.52, color: '#818cf8' },
      skill1: { key: 'Q', name: 'Abyss Impact', description: 'Gelombang tenaga menembusi semua musuh di barisan hadapan!', cooldown: 4.4, color: '#6366f1' },
      skill2: { key: 'E', name: 'Corrosive Strike', description: 'Meluru pantas, menggoncang musuh & melompat berundur!', cooldown: 5.8, color: '#fbbf24' },
      ultimate: { key: 'R', name: 'Torn-Apart Memory', description: 'Meletupkan semua sasaran di sekeliling mengikut baki HP mereka!', cooldown: 11.5, color: '#fde047' },
    },
  },
  {
    id: 'karrie',
    name: 'Karrie',
    roleLabel: 'Marksman',
    roleId: 'marksman',
    difficulty: 'Mudah',
    title: 'Bintang Roda Cahaya',
    description: 'Penembak pantas bersenjatakan roda cahaya berputar yang menghancurkan Tank berperisai tebal dan The Lord dengan mudah!',
    advantage: 'Roda cahaya menembusi perisai keras & pecutan tembakan berkembar!',
    appearance: { headgear: 'karrie_crest', weaponStyle: 'lightwheels', primaryColor: '#0891b2', secondaryColor: '#164e63', accentColor: '#fef08a' },
    baseStats: { hp: 515, damage: 47, speed: 10.9, defense: 13, attackRange: 16.5, attackCooldown: 0.39 },
    displayRatings: { hp: 59, damage: 94, speed: 86, defense: 49 },
    passive: { name: 'Lightwheel Mark', description: 'Setiap serangan ke-4 mengenakan True Damage bonus menembusi perisai!' },
    skills: {
      basic: { key: 'ATK', name: 'Lightwheel', description: 'Melontar roda cahaya pantas yang menembusi perisai.', cooldown: 0.39, color: '#22d3ee' },
      skill1: { key: 'Q', name: 'Spinning Lightwheel', description: 'Roda tenaga berputar di kawasan hadapan memperlahankan musuh!', cooldown: 4.2, color: '#38bdf8' },
      skill2: { key: 'E', name: 'Phantom Step', description: 'Meluncur pantas sambil melontar roda cahaya ekstra!', cooldown: 4.0, color: '#67e8f9' },
      ultimate: { key: 'R', name: 'Speedy Lightwheel', description: 'Mod Dual Wield: menggandakan kelajuan serangan & +25% kelajuan gerak!', cooldown: 11.0, color: '#fde047' },
    },
  },
  {
    id: 'beatrix',
    name: 'Beatrix',
    roleLabel: 'Marksman',
    roleId: 'marksman',
    difficulty: 'Sederhana',
    title: 'Inovator Empat Senjata',
    description: 'Penembak pintar dari Sekolah Cendekiawan yang membawa gabungan senapang mesin, shotgun dan pelancar roket!',
    advantage: 'Serangan roket letupan kawasan + peluru mesingan bertalu-talu!',
    appearance: { headgear: 'beatrix_beret', weaponStyle: 'quad_guns', primaryColor: '#e11d48', secondaryColor: '#1e293b', accentColor: '#fde047' },
    baseStats: { hp: 510, damage: 51, speed: 10.7, defense: 12, attackRange: 17.8, attackCooldown: 0.43 },
    displayRatings: { hp: 58, damage: 97, speed: 82, defense: 48 },
    passive: { name: 'Mechanical Genius', description: 'Setiap tembakan bertukar variasi peluru dengan kritikal & percikan!' },
    skills: {
      basic: { key: 'ATK', name: 'Nibiru / Renner', description: 'Tembakan senapang tepat & bertenaga.', cooldown: 0.43, color: '#fb7185' },
      skill1: { key: 'Q', name: "Bennett's Rage", description: 'Menembak rentetan peluru mesingan Nibiru ke kawasan hadapan!', cooldown: 4.2, color: '#f43f5e' },
      skill2: { key: 'E', name: 'Tactical Reposition', description: 'Berguling taktikal pantas & memuatkan peluru berkuasa tinggi!', cooldown: 4.8, color: '#38bdf8' },
      ultimate: { key: 'R', name: 'Wesker / Bennett Bombard', description: 'Melancarkan roket letupan gergasi mengebom kawasan luas!', cooldown: 11.2, color: '#fde047' },
    },
  },
];

// 6-CATEGORY MOBA ITEM SHOP WITH ROLE RECOMMENDATIONS
export const SHOP_ITEMS: ShopItemDef[] = [
  // 1. SERANGAN (ATTACK)
  {
    id: 'atk_hunter',
    name: 'Pedang Pemburu',
    category: 'Serangan',
    price: 95,
    description: 'Bilah pantas yang meningkatkan serangan asas serta kelajuan menetak.',
    bonusSummary: '+16 Serangan · +10% Laju Serang',
    color: '#ef4444',
    recommendedRoles: ['marksman', 'fighter', 'assassin'],
    stats: { damage: 16, attackSpeed: 0.1 },
  },
  {
    id: 'atk_scarlet',
    name: 'Cakar Pemusnah',
    category: 'Serangan',
    price: 165,
    description: 'Meningkatkan kelajuan serangan dan peluang pukulan Kritikal 1.8x.',
    bonusSummary: '+20 Serangan · +22% Laju Serang · +16% Kritikal',
    color: '#f97316',
    recommendedRoles: ['marksman'],
    stats: { damage: 20, attackSpeed: 0.22, critChance: 0.16 },
  },
  {
    id: 'atk_heptaseas',
    name: 'Bilah Bayangan',
    category: 'Serangan',
    price: 185,
    description: 'Senjata pembunuh yang menembusi perisai fizikal musuh dengan laju.',
    bonusSummary: '+28 Serangan · +18% Penembusan Perisai · +100 HP',
    color: '#e11d48',
    recommendedRoles: ['assassin', 'fighter'],
    stats: { damage: 28, armorPen: 0.18, hp: 100 },
  },
  {
    id: 'atk_haas',
    name: 'Kapak Serapan Nyawa',
    category: 'Serangan',
    price: 195,
    description: 'Setiap serangan memulihkan sebahagian HP daripada kerosakan.',
    bonusSummary: '+25 Serangan · +16% Lifesteal',
    color: '#dc2626',
    recommendedRoles: ['fighter', 'marksman'],
    stats: { damage: 25, lifesteal: 0.16 },
  },
  {
    id: 'atk_despair',
    name: 'Pedang Naga Emas',
    category: 'Serangan',
    price: 290,
    description: 'Senjata legenda yang menggandakan kekuatan serangan wira.',
    bonusSummary: '+45 Serangan · +12% Kritikal',
    color: '#fbbf24',
    recommendedRoles: ['marksman', 'assassin', 'fighter'],
    stats: { damage: 45, critChance: 0.12 },
  },

  // 2. PERTAHANAN (DEFENCE)
  {
    id: 'def_iron',
    name: 'Perisai Besi Fajar',
    category: 'Pertahanan',
    price: 90,
    description: 'Menambah nyawa maksimum dan ketahanan asas menentang musuh.',
    bonusSummary: '+140 HP · +10 Pertahanan',
    color: '#64748b',
    recommendedRoles: ['tank', 'fighter', 'support'],
    stats: { hp: 140, defense: 10 },
  },
  {
    id: 'def_antique',
    name: 'Baju Zirah Purba',
    category: 'Pertahanan',
    price: 190,
    description: 'Perisai diraja untuk bertahan menentang The Lord & hero elit.',
    bonusSummary: '+260 HP · +20 Pertahanan',
    color: '#eab308',
    recommendedRoles: ['tank', 'fighter'],
    stats: { hp: 260, defense: 20 },
  },
  {
    id: 'def_wings',
    name: 'Sayap Pelindung',
    category: 'Pertahanan',
    price: 245,
    description: 'Memberi nyawa tinggi berserta pemulihan berterusan setiap saat.',
    bonusSummary: '+320 HP · +15 Pertahanan · +7 HP/s',
    color: '#34d399',
    recommendedRoles: ['tank', 'support', 'fighter'],
    stats: { hp: 320, defense: 15, regenPerSec: 7 },
  },

  // 3. SIHIR (MAGIC)
  {
    id: 'mag_wand',
    name: 'Tongkat Kilat',
    category: 'Sihir',
    price: 115,
    description: 'Menguatkan semua kemahiran Q, E dan Ultimate dengan kuasa sihir.',
    bonusSummary: '+22% Kuasa Sihir · +12 Serangan',
    color: '#818cf8',
    recommendedRoles: ['mage', 'support'],
    stats: { skillPower: 0.22, damage: 12 },
  },
  {
    id: 'mag_tome',
    name: 'Buku Sihir Fajar',
    category: 'Sihir',
    price: 175,
    description: 'Mengurangkan masa menunggu kemahiran agar skill boleh digunakan lebih kerap.',
    bonusSummary: '-18% Masa Menunggu · +20% Kuasa Sihir',
    color: '#6366f1',
    recommendedRoles: ['mage', 'support', 'assassin'],
    stats: { cooldownReduce: 0.18, skillPower: 0.2 },
  },
  {
    id: 'mag_glaive',
    name: 'Glaive Penembus Sihir',
    category: 'Sihir',
    price: 230,
    description: 'Menembusi pertahanan sihir musuh dan meningkatkan letupan Ultimate.',
    bonusSummary: '+28% Kuasa Sihir · +20% Penembusan · +16 Serangan',
    color: '#a855f7',
    recommendedRoles: ['mage'],
    stats: { skillPower: 0.28, armorPen: 0.2, damage: 16 },
  },

  // 4. PERGERAKAN (MOVEMENT)
  {
    id: 'mov_boots',
    name: 'Kasut Angin',
    category: 'Pergerakan',
    price: 75,
    description: 'Menambah kelajuan larian untuk mengelak serangan The Lord.',
    bonusSummary: '+1.6 Kelajuan Gerak',
    color: '#38bdf8',
    recommendedRoles: ['marksman', 'mage', 'assassin', 'fighter', 'tank', 'support'],
    stats: { speed: 1.6 },
  },
  {
    id: 'mov_warrior',
    name: 'Sepatu Pahlawan',
    category: 'Pergerakan',
    price: 135,
    description: 'Gabungan kelajuan larian dan ketahanan badan di medan perang.',
    bonusSummary: '+1.5 Kelajuan · +12 Pertahanan · +100 HP',
    color: '#0ea5e9',
    recommendedRoles: ['tank', 'fighter'],
    stats: { speed: 1.5, defense: 12, hp: 100 },
  },
  {
    id: 'mov_magic',
    name: 'But Kilat Sihir',
    category: 'Pergerakan',
    price: 140,
    description: 'Pergerakan pantas berserta pengurangan masa menunggu kemahiran.',
    bonusSummary: '+1.6 Kelajuan · -12% Masa Menunggu',
    color: '#2dd4bf',
    recommendedRoles: ['mage', 'support', 'assassin'],
    stats: { speed: 1.6, cooldownReduce: 0.12 },
  },

  // 5. PEMULIHAN (RECOVERY)
  {
    id: 'rec_potion',
    name: 'Posyen Kesihatan',
    category: 'Pemulihan',
    price: 35,
    description: 'Diminum segera (F) untuk memulihkan 45% HP semasa bertarung.',
    bonusSummary: '+1 Stok Posyen Kesihatan',
    color: '#10b981',
    consumable: true,
    recommendedRoles: [],
    stats: {},
  },
  {
    id: 'rec_oracle',
    name: 'Jubah Pemulihan Suci',
    category: 'Pemulihan',
    price: 165,
    description: 'Memulihkan nyawa wira setiap saat berserta pertahanan tambahan.',
    bonusSummary: '+13 HP/saat · +180 HP Maks · +8 Pertahanan',
    color: '#34d399',
    recommendedRoles: ['support', 'tank', 'fighter'],
    stats: { regenPerSec: 13, hp: 180, defense: 8 },
  },

  // 6. KHAS (SPECIAL)
  {
    id: 'spc_wisdom',
    name: 'Permata Kebijaksanaan',
    category: 'Khas',
    price: 120,
    description: 'Menambah ganjaran Emas +25% setiap kali mengalahkan musuh.',
    bonusSummary: '+25% Ganjaran Emas · +14% Kuasa Kemahiran',
    color: '#fbbf24',
    recommendedRoles: ['support', 'mage'],
    stats: { goldBonus: 0.25, skillPower: 0.14 },
  },
  {
    id: 'spc_dawn',
    name: 'Azimat Land of Dawn',
    category: 'Khas',
    price: 285,
    description: 'Azimat keramat yang meningkatkan semua keupayaan wira ke tahap muktamad.',
    bonusSummary: '+24 Serangan · +220 HP · +14 Pertahanan · +1.1 Laju',
    color: '#f59e0b',
    recommendedRoles: ['marksman', 'fighter', 'assassin', 'mage', 'tank', 'support'],
    stats: { damage: 24, hp: 220, defense: 14, speed: 1.1, cooldownReduce: 0.08 },
  },
];

// ============================================================
// LAND OF DAWN 3-LANE MAP GEOMETRY (WORLD_RADIUS = 155)
// ============================================================
export const WORLD_RADIUS = 155;
export const ALLIED_BASE_POS: [number, number] = [-108, 108];
export const ENEMY_BASE_POS: [number, number] = [108, -108];
export const PLAYER_SPAWN: [number, number] = [-108, 108];

export const LORD_PIT_POS: [number, number] = [-42, -42];
export const TURTLE_PIT_POS: [number, number] = [42, 42];
export const BOSS_ARENA_CENTER: [number, number] = LORD_PIT_POS;
export const BOSS_ARENA_RADIUS = 20;

export const BASE_MAX_HP = 5200;

// 3 MOBA Lanes: EXP (Top-Left), MID (Center Diagonal), GOLD (Bottom-Right)
export const LANE_WAYPOINTS: Record<LaneId, [number, number][]> = {
  exp: [
    [-108, 108],
    [-114, 52],
    [-114, -28],
    [-114, -92],
    [-92, -114],
    [-28, -114],
    [52, -114],
    [108, -108],
  ],
  mid: [
    [-108, 108],
    [-72, 72],
    [-34, 34],
    [0, 0],
    [34, -34],
    [72, -72],
    [108, -108],
  ],
  gold: [
    [-108, 108],
    [-52, 114],
    [28, 114],
    [92, 114],
    [114, 92],
    [114, 28],
    [114, -52],
    [108, -108],
  ],
};

// 12 Defensive Turrets (6 Allied + 6 Enemy: Outer & Inner on EXP, MID, GOLD) with Protective Energy Shields
export const TURRET_DEFS: TurretDef[] = [
  // ALLIED TURRETS
  { id: 'ally_exp_inner', team: 'ally', lane: 'exp', tier: 'inner', name: 'Menara Dalam EXP', pos: [-114, 46], maxHp: 2800, maxShield: 1150, damage: 68, range: 18.5 },
  { id: 'ally_exp_outer', team: 'ally', lane: 'exp', tier: 'outer', name: 'Menara Luar EXP', pos: [-114, -34], maxHp: 2300, maxShield: 950, damage: 58, range: 18.5 },
  { id: 'ally_mid_inner', team: 'ally', lane: 'mid', tier: 'inner', name: 'Menara Dalam Tengah', pos: [-68, 68], maxHp: 2800, maxShield: 1150, damage: 68, range: 18.5 },
  { id: 'ally_mid_outer', team: 'ally', lane: 'mid', tier: 'outer', name: 'Menara Luar Tengah', pos: [-30, 30], maxHp: 2300, maxShield: 950, damage: 58, range: 18.5 },
  { id: 'ally_gold_inner', team: 'ally', lane: 'gold', tier: 'inner', name: 'Menara Dalam Gold', pos: [-46, 114], maxHp: 2800, maxShield: 1150, damage: 68, range: 18.5 },
  { id: 'ally_gold_outer', team: 'ally', lane: 'gold', tier: 'outer', name: 'Menara Luar Gold', pos: [34, 114], maxHp: 2300, maxShield: 950, damage: 58, range: 18.5 },

  // ENEMY TURRETS
  { id: 'enemy_exp_outer', team: 'enemy', lane: 'exp', tier: 'outer', name: 'Menara Musuh Luar EXP', pos: [-34, -114], maxHp: 2250, maxShield: 900, damage: 54, range: 18.5 },
  { id: 'enemy_exp_inner', team: 'enemy', lane: 'exp', tier: 'inner', name: 'Menara Musuh Dalam EXP', pos: [46, -114], maxHp: 2750, maxShield: 1100, damage: 64, range: 18.5 },
  { id: 'enemy_mid_outer', team: 'enemy', lane: 'mid', tier: 'outer', name: 'Menara Musuh Luar Tengah', pos: [30, -30], maxHp: 2250, maxShield: 900, damage: 54, range: 18.5 },
  { id: 'enemy_mid_inner', team: 'enemy', lane: 'mid', tier: 'inner', name: 'Menara Musuh Dalam Tengah', pos: [68, -68], maxHp: 2750, maxShield: 1100, damage: 64, range: 18.5 },
  { id: 'enemy_gold_outer', team: 'enemy', lane: 'gold', tier: 'outer', name: 'Menara Musuh Luar Gold', pos: [114, 34], maxHp: 2250, maxShield: 900, damage: 54, range: 18.5 },
  { id: 'enemy_gold_inner', team: 'enemy', lane: 'gold', tier: 'inner', name: 'Menara Musuh Dalam Gold', pos: [114, -46], maxHp: 2750, maxShield: 1100, damage: 64, range: 18.5 },
];

export const THE_LORD_BOSS: EnemyDefinition = {
  level: 10,
  id: 'the_lord',
  name: 'The Lord',
  title: 'PENJAGA AGUNG SUNGAI KRISTAL',
  archetype: 'tank',
  weaponStyle: 'greatsword',
  zoneName: 'Sanctuary The Lord (Sungai Barat Laut)',
  spawnPos: LORD_PIT_POS,
  maxHp: 2200,
  damage: 56,
  defense: 28,
  speed: 6.5,
  attackRange: 8.2,
  attackInterval: 1.2,
  abilityCooldown: 3.8,
  abilityName: 'Hentakan Guruh & Ribut Cahaya',
  primaryColor: '#dc2626',
  secondaryColor: '#0f172a',
  accentColor: '#fbbf24',
  scale: 2.2,
  isBoss: true,
  xpReward: 900,
  goldReward: 650,
  cardId: 'takut',
};

// Dynamic pool of enemy heroes drawn from the 49 non-player heroes
export function buildEnemyHeroCandidate(
  hero: HeroDefinition,
  tier: number,
  spawnPos: [number, number],
  zoneName: string,
  cardId: string
): EnemyDefinition {
  const isRanged = hero.roleId === 'marksman' || hero.roleId === 'mage' || hero.roleId === 'support';
  const hpScale = 260 + tier * 95;
  const dmgScale = 16 + tier * 4.5;
  const defScale = 5 + tier * 2.1;

  return {
    level: Math.min(15, tier),
    id: `enemy_hero_${hero.id}_t${tier}`,
    heroId: hero.id,
    name: hero.name,
    title: hero.title,
    archetype: hero.roleId,
    weaponStyle: hero.appearance.weaponStyle,
    headgear: hero.appearance.headgear,
    bodyVariant: hero.appearance.bodyVariant,
    zoneName,
    spawnPos,
    maxHp: Math.round(hpScale * (hero.roleId === 'tank' ? 1.28 : hero.roleId === 'fighter' ? 1.12 : 0.96)),
    damage: Math.round(dmgScale * (hero.roleId === 'assassin' || hero.roleId === 'marksman' ? 1.08 : 0.96)),
    defense: Math.round(defScale * (hero.roleId === 'tank' ? 1.25 : 1.0)),
    speed: hero.roleId === 'assassin' ? 8.8 : hero.roleId === 'tank' ? 7.2 : 7.9,
    attackRange: isRanged ? 14.5 : 5.6,
    attackInterval: isRanged ? 1.15 : 1.05,
    abilityCooldown: 5.2,
    abilityName: hero.skills.ultimate.name,
    primaryColor: hero.appearance.primaryColor,
    secondaryColor: hero.appearance.secondaryColor,
    accentColor: hero.appearance.accentColor,
    scale: 1.08 + Math.min(tier, 10) * 0.025,
    xpReward: 120 + tier * 35,
    goldReward: 110 + tier * 28,
    cardId,
  };
}

export function buildEnemyPool(playerHeroId: string): HeroDefinition[] {
  const others = HERO_ROLES.filter((h) => h.id !== playerHeroId);
  // Deterministic well-balanced mix across roles
  const order: HeroRoleId[] = ['marksman', 'fighter', 'mage', 'tank', 'assassin', 'support'];
  const buckets = new Map<HeroRoleId, HeroDefinition[]>();
  order.forEach((r) => buckets.set(r, []));
  others.forEach((h) => {
    const b = buckets.get(h.roleId);
    if (b) b.push(h);
  });
  const result: HeroDefinition[] = [];
  let added = true;
  while (added) {
    added = false;
    for (const r of order) {
      const next = buckets.get(r)?.shift();
      if (next) {
        result.push(next);
        added = true;
      }
    }
  }
  return result;
}

// Keep backward-compatible export for any caller referencing buildEnemyProgression
export function buildEnemyProgression(playerHeroId: string): EnemyDefinition[] {
  const pool = buildEnemyPool(playerHeroId);
  const spawns: [number, number][] = [
    [-64, 64],
    [-34, -82],
    [72, 72],
    [10, -20],
    [54, -54],
    [90, 20],
    [-18, -94],
    [82, -82],
    [98, -74],
  ];
  const cardOrder = ADJECTIVE_CARDS.map((c) => c.id);
  const list = pool.slice(0, 9).map((h, idx) =>
    buildEnemyHeroCandidate(h, idx + 1, spawns[idx], `Zon Medan ${idx + 1}`, cardOrder[idx % cardOrder.length])
  );
  list.push(THE_LORD_BOSS);
  return list;
}

export const ENEMIES: EnemyDefinition[] = buildEnemyProgression('miya');

export const JUNGLE_CAMPS: JungleCampDef[] = [
  {
    id: 'blue_buff_ally',
    name: 'Penjaga Serpihan Biru (Blue Buff)',
    type: 'blue_buff',
    zone: 'Rimba Biru Sekutu',
    pos: [-74, 24],
    maxHp: 370,
    damage: 19,
    xpReward: 155,
    goldReward: 145,
    shardReward: 2,
    color: '#38bdf8',
    scale: 1.32,
    respawnTime: 26,
    buffType: 'blue',
  },
  {
    id: 'red_buff_ally',
    name: 'Raksasa Bara Api (Red Buff)',
    type: 'red_buff',
    zone: 'Rimba Merah Sekutu',
    pos: [-24, 74],
    maxHp: 370,
    damage: 19,
    xpReward: 155,
    goldReward: 145,
    shardReward: 2,
    color: '#ef4444',
    scale: 1.32,
    respawnTime: 26,
    buffType: 'red',
  },
  {
    id: 'turtle_camp',
    name: 'Penyu Purba (Turtle)',
    type: 'turtle',
    zone: 'Sanctuary Turtle (Sungai Tenggara)',
    pos: TURTLE_PIT_POS,
    maxHp: 640,
    damage: 24,
    xpReward: 290,
    goldReward: 260,
    shardReward: 3,
    color: '#10b981',
    scale: 1.55,
    respawnTime: 32,
    buffType: 'turtle',
  },
  {
    id: 'slime_west',
    name: 'Slime Kristal Barat',
    type: 'slime',
    zone: 'Rimba Barat',
    pos: [-94, 4],
    maxHp: 165,
    damage: 10,
    xpReward: 75,
    goldReward: 65,
    shardReward: 1,
    color: '#22d3ee',
    scale: 1.05,
    respawnTime: 16,
  },
  {
    id: 'wolf_south',
    name: 'Serigala Rimba Selatan',
    type: 'wolf',
    zone: 'Belukar Selatan',
    pos: [-4, 94],
    maxHp: 215,
    damage: 13,
    xpReward: 95,
    goldReward: 85,
    shardReward: 1,
    color: '#94a3b8',
    scale: 1.12,
    respawnTime: 16,
  },
  {
    id: 'drake_east',
    name: 'Naga Kecil Zamrud',
    type: 'drake',
    zone: 'Kuil Purba Timur',
    pos: [86, 12],
    maxHp: 280,
    damage: 17,
    xpReward: 130,
    goldReward: 115,
    shardReward: 2,
    color: '#10b981',
    scale: 1.2,
    respawnTime: 19,
  },
  {
    id: 'blue_buff_enemy',
    name: 'Serpihan Biru Musuh (Blue Buff)',
    type: 'blue_buff',
    zone: 'Rimba Biru Musuh',
    pos: [74, -24],
    maxHp: 420,
    damage: 22,
    xpReward: 175,
    goldReward: 160,
    shardReward: 2,
    color: '#38bdf8',
    scale: 1.35,
    respawnTime: 28,
    buffType: 'blue',
  },
  {
    id: 'red_buff_enemy',
    name: 'Bara Api Musuh (Red Buff)',
    type: 'red_buff',
    zone: 'Rimba Merah Musuh',
    pos: [24, -74],
    maxHp: 420,
    damage: 22,
    xpReward: 175,
    goldReward: 160,
    shardReward: 2,
    color: '#ef4444',
    scale: 1.35,
    respawnTime: 28,
    buffType: 'red',
  },
  {
    id: 'golem_north',
    name: 'Golem Batu Purba',
    type: 'golem',
    zone: 'Runtuhan Utara',
    pos: [-12, -88],
    maxHp: 310,
    damage: 18,
    xpReward: 140,
    goldReward: 120,
    shardReward: 2,
    color: '#a855f7',
    scale: 1.24,
    respawnTime: 20,
  },
];

export const HEALING_FOUNTAINS: { id: string; name: string; pos: [number, number]; radius: number }[] = [
  { id: 'fountain_base', name: 'Mata Air Kubu Sekutu', pos: ALLIED_BASE_POS, radius: 10.5 },
  { id: 'fountain_river_nw', name: 'Mata Air Sungai Utara', pos: [-62, -62], radius: 5.5 },
  { id: 'fountain_river_se', name: 'Mata Air Sungai Tenggara', pos: [62, 62], radius: 5.5 },
];

export function pickRandomAdjectiveCard(): AdjectiveCard {
  return ADJECTIVE_CARDS[Math.floor(Math.random() * ADJECTIVE_CARDS.length)];
}

export interface BalancedTeamSlot {
  hero: HeroDefinition;
  lane: LaneId | 'roam';
  isPlayer: boolean;
}

function defaultLaneForRole(roleId: HeroRoleId): LaneId | 'roam' {
  if (roleId === 'fighter') return 'exp';
  if (roleId === 'mage') return 'mid';
  if (roleId === 'marksman') return 'gold';
  if (roleId === 'assassin') return 'mid';
  return 'roam'; // tank / support
}

function pickHeroByRoles(
  available: HeroDefinition[],
  preferredRoles: HeroRoleId[],
  usedIds: Set<string>
): HeroDefinition {
  const candidates = available.filter(
    (h) => !usedIds.has(h.id) && (preferredRoles.includes(h.roleId) || (h.secondaryRoleId && preferredRoles.includes(h.secondaryRoleId)))
  );
  const pool = candidates.length > 0 ? candidates : available.filter((h) => !usedIds.has(h.id));
  const chosen = pool[Math.floor(Math.random() * pool.length)] || available[0];
  usedIds.add(chosen.id);
  return chosen;
}

export function compose5v5Teams(playerHero: HeroDefinition): {
  blueTeam: BalancedTeamSlot[];
  redTeam: BalancedTeamSlot[];
} {
  const usedIds = new Set<string>([playerHero.id]);
  const playerLane = defaultLaneForRole(playerHero.roleId);

  const blueTeam: BalancedTeamSlot[] = [
    { hero: playerHero, lane: playerLane, isPlayer: true },
  ];

  // Fill remaining 4 Blue Team slots ensuring a balanced 5-hero comp across Tank/Support, Fighter, Assassin, Mage, Marksman
  const blueSlotsNeeded: { roles: HeroRoleId[]; lane: LaneId | 'roam' }[] = [];
  const rolePlan: { roles: HeroRoleId[]; lane: LaneId | 'roam' }[] = [
    { roles: ['tank'], lane: 'roam' },
    { roles: ['fighter'], lane: 'exp' },
    { roles: ['mage'], lane: 'mid' },
    { roles: ['marksman'], lane: 'gold' },
    { roles: ['assassin', 'support'], lane: 'roam' },
  ];

  let skippedPlayerMatch = false;
  for (const slot of rolePlan) {
    if (!skippedPlayerMatch && slot.roles.includes(playerHero.roleId)) {
      skippedPlayerMatch = true;
      continue;
    }
    if (blueSlotsNeeded.length < 4) {
      blueSlotsNeeded.push(slot);
    }
  }
  while (blueSlotsNeeded.length < 4) {
    blueSlotsNeeded.push({ roles: ['fighter', 'assassin', 'support'], lane: 'mid' });
  }

  for (const need of blueSlotsNeeded) {
    const hero = pickHeroByRoles(HERO_ROLES, need.roles, usedIds);
    blueTeam.push({ hero, lane: need.lane, isPlayer: false });
  }

  // Compose 5 balanced Red Team enemy heroes covering all core MOBA roles
  const redPlan: { roles: HeroRoleId[]; lane: LaneId | 'roam' }[] = [
    { roles: ['tank'], lane: 'roam' },
    { roles: ['fighter'], lane: 'exp' },
    { roles: ['mage'], lane: 'mid' },
    { roles: ['marksman'], lane: 'gold' },
    { roles: ['assassin', 'support'], lane: 'mid' },
  ];

  const redTeam: BalancedTeamSlot[] = redPlan.map((slot) => ({
    hero: pickHeroByRoles(HERO_ROLES, slot.roles, usedIds),
    lane: slot.lane,
    isPlayer: false,
  }));

  return { blueTeam, redTeam };
}

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'first_blood',
    title: 'DARAH PERTAMA',
    description: 'Berjaya menumbangkan hero musuh pertama dalam pertempuran 5V5.',
    iconName: 'sword',
  },
  {
    id: 'turret_breaker',
    title: 'PEMUSNAH MENARA',
    description: 'Berjaya merobohkan menara pertahanan musuh di salah satu lorong.',
    iconName: 'shield',
  },
  {
    id: 'turtle_slayer',
    title: 'PENAWAN TURTLE',
    description: 'Berjaya menewaskan Penyu Purba (Turtle) di Sungai Kristal.',
    iconName: 'shield',
  },
  {
    id: 'boss_slayer',
    title: 'PENYERU THE LORD',
    description: 'Berjaya menewaskan The Lord & menyerunya membantu serangan lorong!',
    iconName: 'crown',
  },
  {
    id: 'collector_five',
    title: 'PENGUMPUL KATA',
    description: 'Berjaya memperoleh 5 kad Kata Adjektif daripada penyingkiran musuh.',
    iconName: 'book',
  },
  {
    id: 'language_expert',
    title: 'PAKAR BAHASA',
    description: 'Pasukan anda berjaya mengumpulkan 10 kad Kata Adjektif dalam satu perlawanan!',
    iconName: 'award',
  },
  {
    id: 'master_adjektif',
    title: 'JUARA 5V5 LAND OF DAWN',
    description: 'Memenangi perlawanan 5V5 Legenda Kata Adjektif dengan memusnahkan Kubu Utama musuh!',
    iconName: 'sparkles',
  },
];
