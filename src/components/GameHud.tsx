import {
  Award,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Coins,
  Crosshair,
  Crown,
  Flame,
  FlaskConical,
  Footprints,
  Home,
  Pause,
  RefreshCw,
  RotateCcw,
  RotateCw,
  Settings,
  Shield,
  ShoppingBag,
  Sparkles,
  Swords,
  Volume2,
  VolumeX,
  Wind,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { ACHIEVEMENTS, HeroDefinition, SHOP_ITEMS, ShopItemDef } from '../data/gameData';
import type { ActivePlayerCardState } from '../App';
import { CardRewardNotification, HudSnapshot, WorldHealthBar } from '../game/hudTypes';
import { HeroPortrait } from './HeroPortrait';
import { ItemIcon } from './ItemIcon';
import { Minimap } from './Minimap';
import { VirtualJoystick } from './VirtualJoystick';

interface GameHudProps {
  hero: HeroDefinition;
  hud: HudSnapshot;
  muted: boolean;
  showTouchControls: boolean;
  activePlayerCard: ActivePlayerCardState | null;
  cardReward: CardRewardNotification | null;
  purchasedItemToast: { item: ShopItemDef; key: number } | null;
  recentAchievementId: string | null;
  onJoystickMove: (x: number, y: number) => void;
  onAttackHoldChange: (held: boolean) => void;
  onSkill1: () => void;
  onSkill2: () => void;
  onUltimate: () => void;
  onDash: () => void;
  onUsePotion: () => void;
  onToggleTargetLock: () => void;
  onCycleTarget: () => void;
  onToggleAutoChase: () => void;
  onBuyRecommendedItem: (itemId: string) => void;
  onDismissRecommendedItem: (itemId: string) => void;
  onCameraZoom: (delta: number) => void;
  onCameraRotate: (delta: number) => void;
  onOpenShop: () => void;
  onOpenScoreboard: () => void;
  onOpenBook: () => void;
  onOpenAchievements: () => void;
  onOpenSettings: () => void;
  onToggleMute: () => void;
  onPause: () => void;
  onHome: () => void;
}

export function HeroRoleIcon({ roleId, className = 'w-6 h-6' }: { roleId: string; className?: string }) {
  if (roleId === 'marksman') return <Crosshair className={className} />;
  if (roleId === 'fighter') return <Swords className={className} />;
  if (roleId === 'assassin') return <Wind className={className} />;
  if (roleId === 'mage') return <Sparkles className={className} />;
  return <Shield className={className} />;
}

function formatMatchTime(sec: number): string {
  const s = Math.max(0, Math.floor(sec));
  const hrs = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const rem = s % 60;
  return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
}

function isEnemyKind(kind: WorldHealthBar['kind']): boolean {
  return (
    kind === 'enemy_hero' ||
    kind === 'minion_enemy' ||
    kind === 'turret_enemy' ||
    kind === 'base_enemy'
  );
}

function hpGradientColor(pct: number, kind: WorldHealthBar['kind']): string {
  if (isEnemyKind(kind)) {
    return pct < 25 ? '#ff1f3d' : '#ef4444';
  }
  if (kind === 'allied_lord') return '#22d3ee';
  if (kind === 'ally_hero' || kind === 'minion_ally' || kind === 'turret_ally' || kind === 'base_ally') {
    return '#38bdf8';
  }
  if (kind === 'player') return '#22c55e';
  if (kind === 'boss') return '#dc2626';
  return '#f59e0b';
}

function multiKillLabel(multiKill: number): string | null {
  if (multiKill >= 5) return 'LEGENDARY!';
  if (multiKill === 4) return 'MANIAC!';
  if (multiKill === 3) return 'TRIPLE KILL!';
  if (multiKill === 2) return 'DOUBLE KILL!';
  return null;
}

export function GameHud({
  hero,
  hud,
  muted,
  showTouchControls,
  activePlayerCard,
  cardReward,
  purchasedItemToast,
  recentAchievementId,
  onJoystickMove,
  onAttackHoldChange,
  onSkill1,
  onSkill2,
  onUltimate,
  onDash,
  onUsePotion,
  onToggleTargetLock,
  onCycleTarget,
  onToggleAutoChase,
  onBuyRecommendedItem,
  onDismissRecommendedItem,
  onCameraZoom,
  onCameraRotate,
  onOpenShop,
  onOpenScoreboard,
  onOpenBook,
  onOpenAchievements,
  onOpenSettings,
  onToggleMute,
  onPause,
  onHome,
}: GameHudProps) {
  const hpPct = Math.max(0, Math.min(100, (hud.hp / Math.max(1, hud.maxHp)) * 100));
  const manaPct = Math.max(0, Math.min(100, (hud.mana / Math.max(1, hud.maxMana)) * 100));
  const xpPct = Math.max(0, Math.min(100, (hud.xp / Math.max(1, hud.xpToNext)) * 100));
  const cardPct = (hud.collectedCardIds.length / 10) * 100;

  const recentAch = recentAchievementId
    ? ACHIEVEMENTS.find((a) => a.id === recentAchievementId)
    : null;

  const activeMultiLabel = cardReward ? multiKillLabel(cardReward.multiKill) : null;
  const playerMultiLabel = activePlayerCard ? multiKillLabel(activePlayerCard.reward.multiKill) : null;
  const recItem = hud.recommendedItem;
  const canBuyRecommended = recItem ? hud.gold >= recItem.price && hud.equippedItemIds.length < 6 : false;

  return (
    <div className="fixed inset-0 pointer-events-none z-20 flex flex-col justify-between p-2.5 sm:p-4">
      {/* WORLD-PROJECTED 3D HEALTH & SHIELD BARS OVERLAY */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {hud.worldBars.map((bar) => {
          if (bar.x < -8 || bar.x > 108 || bar.y < -8 || bar.y > 108) return null;
          const pct = Math.max(0, Math.min(100, (bar.hp / Math.max(1, bar.maxHp)) * 100));
          const isEnemy = isEnemyKind(bar.kind);
          const isLowEnemyHero = bar.kind === 'enemy_hero' && pct < 25;
          const barFill = hpGradientColor(pct, bar.kind);
          const isAlly =
            bar.kind === 'player' ||
            bar.kind === 'ally_hero' ||
            bar.kind === 'allied_lord' ||
            bar.kind === 'minion_ally' ||
            bar.kind === 'turret_ally' ||
            bar.kind === 'base_ally';
          const isMinion = bar.kind === 'minion_ally' || bar.kind === 'minion_enemy';
          const isBase = bar.kind === 'base_ally' || bar.kind === 'base_enemy';
          const isBoss = bar.kind === 'boss' || bar.kind === 'allied_lord';
          const isTurret = bar.kind === 'turret_ally' || bar.kind === 'turret_enemy';

          const turretShieldMax = bar.maxShield ?? 0;
          const turretShieldVal = bar.shield ?? 0;
          const hasTurretShield = isTurret && turretShieldMax > 0 && turretShieldVal > 0;
          const turretShieldPct = hasTurretShield
            ? Math.max(0, Math.min(100, (turretShieldVal / turretShieldMax) * 100))
            : 0;

          const heroShieldPct =
            !isTurret && bar.shield
              ? Math.max(0, Math.min(40, (bar.shield / Math.max(1, bar.maxHp)) * 100))
              : 0;

          const widthClass = isMinion
            ? 'w-11'
            : bar.kind === 'camp'
              ? 'w-16'
              : isTurret
                ? 'w-22'
                : isBase || isBoss
                  ? 'w-28'
                  : 'w-22';

          const heightClass = isMinion ? 'h-1.5' : isBase || isBoss ? 'h-2.5' : 'h-2';

          return (
            <div
              key={bar.id}
              className="absolute -translate-x-1/2 -translate-y-full flex flex-col items-center gap-0.5"
              style={{ left: `${bar.x}%`, top: `${bar.y}%` }}
            >
              {!isMinion && (bar.label || bar.level !== undefined || hasTurretShield) && (
                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#070b14]/88 border border-white/15 text-[9.5px] font-bold leading-tight whitespace-nowrap shadow">
                  {bar.level !== undefined && (
                    <span
                      className={`font-mono-num px-1 rounded text-[9px] ${
                        isAlly ? 'bg-sky-500/30 text-sky-200' : 'bg-rose-500/35 text-rose-200'
                      }`}
                    >
                      {bar.level}
                    </span>
                  )}
                  {isBoss && <Crown className="w-2.5 h-2.5 text-amber-300 shrink-0" />}
                  {hasTurretShield && (
                    <Shield
                      className={`w-2.5 h-2.5 shrink-0 ${
                        isAlly ? 'text-cyan-300' : 'text-amber-300'
                      }`}
                    />
                  )}
                  {bar.label && (
                    <span className={isAlly ? 'text-sky-100' : 'text-rose-100'}>{bar.label}</span>
                  )}
                </div>
              )}

              {/* Turret Protective Energy Shield Segmented Bar */}
              {hasTurretShield && (
                <div className={`${widthClass} h-1.5 rounded-full bg-slate-950/90 border border-cyan-300/60 overflow-hidden relative`}>
                  <div
                    className={`h-full transition-all duration-100 ${
                      isAlly
                        ? 'bg-gradient-to-r from-cyan-400 to-sky-300'
                        : 'bg-gradient-to-r from-amber-400 to-cyan-300'
                    }`}
                    style={{ width: `${turretShieldPct}%` }}
                  />
                  {/* 4 visual shield segments */}
                  <div className="pointer-events-none absolute inset-0 grid grid-cols-4">
                    <div className="border-r border-slate-950/75" />
                    <div className="border-r border-slate-950/75" />
                    <div className="border-r border-slate-950/75" />
                    <div />
                  </div>
                </div>
              )}

              {/* Primary Health Bar (All Enemies Strictly RED) */}
              <div
                className={`${widthClass} ${heightClass} rounded-full bg-slate-950/95 overflow-hidden flex ${
                  bar.isTarget
                    ? 'ring-2 ring-amber-300 border border-white shadow-[0_0_8px_rgba(251,191,36,0.85)]'
                    : isLowEnemyHero
                      ? 'border border-rose-300 shadow-[0_0_8px_rgba(255,31,61,0.85)] animate-critical-hp'
                      : isEnemy
                        ? 'border border-rose-500/80'
                        : isAlly
                          ? 'border border-sky-400/55'
                          : 'border border-amber-400/55'
                }`}
              >
                <div
                  className="h-full transition-all duration-100"
                  style={{ width: `${pct}%`, backgroundColor: barFill }}
                />
                {heroShieldPct > 0 && (
                  <div
                    className="h-full bg-slate-100/90"
                    style={{ width: `${heroShieldPct}%` }}
                  />
                )}
              </div>

              {/* Hero Mana / Energy Sub-bar */}
              {bar.mana !== undefined && bar.maxMana !== undefined && bar.maxMana > 0 && (
                <div className={`${widthClass} h-[3px] rounded-full bg-slate-950/95 overflow-hidden border border-sky-900/60`}>
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-300 transition-all duration-100"
                    style={{ width: `${Math.max(0, Math.min(100, (bar.mana / bar.maxMana) * 100))}%` }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* FLOATING DAMAGE NUMBERS */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {hud.floatingTexts.map((ft) => (
          <div
            key={ft.id}
            className="absolute font-display font-bold text-sm sm:text-base drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] -translate-x-1/2 -translate-y-1/2 transition-transform"
            style={{ left: `${ft.x}%`, top: `${ft.y}%`, color: ft.color }}
          >
            {ft.text}
          </div>
        ))}
      </div>

      {/* CENTRE-SCREEN DRAMATIC ADJECTIVE CARD ACQUISITION ANIMATION (PLAYER HERO KILLS) */}
      {activePlayerCard && (
        <div className="fixed inset-0 z-30 pointer-events-none flex items-center justify-center p-4">
          <div
            key={activePlayerCard.reward.id}
            className={`${
              activePlayerCard.exiting ? 'animate-card-acquire-out' : 'animate-card-acquire-in'
            } relative w-full max-w-md rounded-2xl border-2 bg-[#081226]/96 px-6 py-5 text-center shadow-[0_0_50px_rgba(251,191,36,0.35)]`}
            style={{ borderColor: activePlayerCard.reward.card.color }}
          >
            <div
              className="pointer-events-none absolute -inset-1 rounded-2xl opacity-30"
              style={{
                background: `radial-gradient(circle at 50% 45%, ${activePlayerCard.reward.card.color}, transparent 72%)`,
              }}
            />

            <div className="relative z-10 flex flex-col items-center">
              <div className="flex flex-wrap items-center justify-center gap-2 mb-1.5">
                {playerMultiLabel && (
                  <span className="px-2 py-0.5 rounded bg-amber-400 text-slate-950 font-display font-black text-[11px] tracking-wider shadow">
                    {playerMultiLabel}
                  </span>
                )}
                <span className="text-[11px] font-extrabold tracking-[0.22em] text-amber-300 uppercase">
                  &lt; ADJECTIVE CARD ACQUIRED &gt;
                </span>
              </div>

              <div className="font-display font-black text-3xl sm:text-4xl tracking-wide text-white drop-shadow-[0_4px_14px_rgba(0,0,0,0.9)]">
                {activePlayerCard.reward.card.word.toUpperCase()}
              </div>

              <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
                <span className="px-2.5 py-0.5 rounded-lg bg-amber-400/20 border border-amber-400/70 text-amber-200 font-mono-num font-extrabold text-xs">
                  +1 ADJECTIVE CARD
                </span>
                <span
                  className="px-2.5 py-0.5 rounded-lg bg-slate-900/90 border text-xs font-bold"
                  style={{
                    borderColor: `${activePlayerCard.reward.card.color}88`,
                    color: activePlayerCard.reward.card.color,
                  }}
                >
                  {activePlayerCard.reward.card.category}
                </span>
              </div>

              <p className="mt-2.5 text-xs sm:text-sm text-slate-100 leading-relaxed italic">
                &ldquo;{activePlayerCard.reward.card.exampleSentence}&rdquo;
              </p>

              <div className="mt-2 text-[10.5px] font-bold text-sky-300">
                Slain {activePlayerCard.reward.victimName} · Koleksi {hud.collectedCardIds.length}/10
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TOP BAR: Hero Status & Side Item Panel (Left) | 5V5 Header (Center) | Minimap & Controls (Right) */}
      <div className="flex items-start justify-between gap-2 w-full">
        {/* TOP LEFT: Hero Portrait, HP, XP, K/D/A, Buffs, Equipped Items & Side Item Panel */}
        <div className="flex flex-col gap-2 max-w-[272px] sm:max-w-[295px]">
          <div className="pointer-events-auto flex flex-col gap-1.5 bg-[#091122]/94 border border-amber-400/30 rounded-xl p-2.5 sm:p-3 shadow-xl min-w-[220px]">
            <div className="flex items-center gap-2.5">
              <HeroPortrait hero={hero} size={44} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-display font-bold text-sm sm:text-base text-white truncate">
                    {hero.name}
                  </span>
                  <span className="font-mono-num text-xs font-bold text-amber-300 shrink-0">
                    Tahap {hud.level}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 text-[10.5px] text-slate-300">
                  <span className="truncate">{hero.roleLabel}</span>
                  <span className="font-mono-num font-bold text-sky-200 shrink-0">
                    {hud.playerKda.kills}/{hud.playerKda.deaths}/{hud.playerKda.assists} · {hud.playerKda.cardsEarned} Kad
                  </span>
                </div>
              </div>
            </div>

            {/* HP Bar */}
            <div>
              <div className="flex justify-between text-[11px] font-mono-num mb-0.5">
                <span className="text-emerald-300 font-semibold">
                  HP {hud.hp}/{hud.maxHp}
                  {hud.shield > 0 ? ` (+${hud.shield})` : ''}
                </span>
                {hud.inFountain && <span className="text-emerald-400 font-semibold">Pemulihan</span>}
                {!hud.inFountain && hud.inBush && <span className="text-lime-300">Dalam Semak</span>}
              </div>
              <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden border border-white/10">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-lime-400 transition-all duration-150"
                  style={{ width: `${hpPct}%` }}
                />
              </div>
            </div>

            {/* Mana / Energy Bar & XP Strip */}
            <div className="space-y-1">
              <div>
                <div className="flex justify-between text-[10px] font-mono-num mb-0.5">
                  <span className="text-sky-300 font-semibold">
                    MANA {hud.mana}/{hud.maxMana}
                  </span>
                  <span className="text-slate-400">
                    XP {hud.xp}/{hud.xpToNext}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden border border-white/5">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-150"
                    style={{ width: `${manaPct}%` }}
                  />
                </div>
              </div>
              <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 transition-all duration-150"
                  style={{ width: `${xpPct}%` }}
                />
              </div>
            </div>

            {/* Active Jungle Buffs & Turtle Shield */}
            {(hud.redBuffTimer > 0 ||
              hud.blueBuffTimer > 0 ||
              hud.turtleBuffTimer > 0 ||
              hud.passiveStacks > 0) && (
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[10px] font-mono-num font-bold">
                {hud.redBuffTimer > 0 && (
                  <span className="flex items-center gap-0.5 text-rose-400">
                    <Flame className="w-3 h-3" /> Merah {hud.redBuffTimer}s
                  </span>
                )}
                {hud.blueBuffTimer > 0 && (
                  <span className="flex items-center gap-0.5 text-sky-400">
                    <Sparkles className="w-3 h-3" /> Biru {hud.blueBuffTimer}s
                  </span>
                )}
                {hud.turtleBuffTimer > 0 && (
                  <span className="flex items-center gap-0.5 text-emerald-400">
                    <Shield className="w-3 h-3" /> Turtle {hud.turtleBuffTimer}s
                  </span>
                )}
                {hud.passiveStacks > 0 && (
                  <span className="text-amber-300">Pasif x{hud.passiveStacks}</span>
                )}
              </div>
            )}

            {/* 6 Equipped Item Mini-Slots with Bespoke Item Icons */}
            <div className="grid grid-cols-6 gap-1 pt-0.5" title="Slot Item Wira (Buka Kedai dengan B)">
              {Array.from({ length: 6 }).map((_, idx) => {
                const itemId = hud.equippedItemIds[idx];
                const item = itemId ? SHOP_ITEMS.find((s) => s.id === itemId) : null;
                return (
                  <button
                    key={idx}
                    onClick={onOpenShop}
                    className="h-6 rounded border border-white/15 bg-slate-900/90 flex items-center justify-center cursor-pointer hover:border-amber-400/70 transition-colors"
                    style={item ? { borderColor: item.color, backgroundColor: `${item.color}22` } : undefined}
                    title={item ? `${item.name} (${item.bonusSummary})` : `Slot ${idx + 1} Kosong`}
                  >
                    {item ? (
                      <ItemIcon itemId={item.id} size={17} />
                    ) : (
                      <span className="text-[9px] text-slate-600">·</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Gold, Shards & Shop Shortcut */}
            <div className="flex items-center justify-between gap-2 pt-0.5 text-xs">
              <div className="flex items-center gap-2 font-mono-num">
                <span className="flex items-center gap-1 text-amber-300 font-bold">
                  <Coins className="w-3.5 h-3.5" />
                  {hud.gold}
                </span>
                <span className="text-slate-400">·</span>
                <span className="text-sky-300 font-semibold">Serpihan {hud.shards}</span>
              </div>
              <button
                onClick={onOpenShop}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] transition-colors cursor-pointer whitespace-nowrap"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                Kedai (B)
              </button>
            </div>
          </div>

          {/* SIDE ITEM PANEL (Icon + Name + Description/Stats + Price + One-Click BUY) */}
          {recItem && (
            <div
              className={`pointer-events-auto animate-card-pop rounded-xl p-2.5 shadow-xl border bg-[#0b1326]/95 ${
                canBuyRecommended ? 'border-amber-400/80' : 'border-slate-600/70'
              }`}
            >
              <div className="flex items-center justify-between gap-2 text-[9.5px] font-extrabold tracking-wider uppercase mb-1.5">
                <span className={canBuyRecommended ? 'text-amber-300' : 'text-slate-300'}>
                  {canBuyRecommended ? 'ITEM SEDIA DIBELI' : 'SASARAN ITEM'}
                </span>
                <span className="flex items-center gap-1 font-mono-num text-amber-200">
                  <Coins className="w-3 h-3 text-amber-400" />
                  {recItem.price} Gold
                </span>
              </div>

              <div className="flex items-start gap-2.5">
                <div
                  className="w-10 h-10 rounded-lg border flex items-center justify-center shrink-0 bg-slate-900/95"
                  style={{ borderColor: recItem.color, backgroundColor: `${recItem.color}1e` }}
                >
                  <ItemIcon itemId={recItem.id} size={28} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="font-display font-bold text-xs text-white leading-tight truncate">
                    {recItem.name}
                  </div>
                  <div className="text-[10px] text-emerald-300 font-semibold leading-snug mt-0.5">
                    {recItem.bonusSummary}
                  </div>
                  <p className="hidden sm:block text-[9.5px] text-slate-300 leading-snug mt-0.5 line-clamp-2">
                    {recItem.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 mt-2">
                <button
                  onClick={() => onBuyRecommendedItem(recItem.id)}
                  disabled={!canBuyRecommended}
                  className={`flex-1 py-1.5 px-2.5 rounded-lg font-display font-extrabold text-[11px] transition-colors ${
                    canBuyRecommended
                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer shadow'
                      : 'bg-slate-800/90 text-slate-400 border border-white/10 cursor-not-allowed'
                  }`}
                >
                  {canBuyRecommended ? `BUY · ${recItem.price}g` : `NEED ${recItem.price - hud.gold}g`}
                </button>
                <button
                  onClick={() => onDismissRecommendedItem(recItem.id)}
                  className="py-1.5 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-[10.5px] cursor-pointer transition-colors"
                >
                  LATER
                </button>
              </div>
            </div>
          )}

          {/* Smooth Purchase Confirmation Feedback */}
          {purchasedItemToast && (
            <div
              key={purchasedItemToast.key}
              className="animate-item-buy flex items-center gap-2 rounded-xl bg-emerald-950/95 border border-emerald-400/70 px-3 py-1.5 shadow-lg text-xs"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
              <ItemIcon itemId={purchasedItemToast.item.id} size={18} />
              <span className="font-bold text-emerald-100 truncate">
                Equipped: {purchasedItemToast.item.name}
              </span>
            </div>
          )}
        </div>

        {/* TOP CENTER: Clean Compact 5V5 Scoreboard, Elapsed Timer, Statistik Button & English Kill Banner */}
        <div className="hidden md:flex flex-col items-center gap-1.5 max-w-lg w-full">
          <div className="pointer-events-auto flex items-center gap-2 bg-[#091122]/94 border border-amber-400/35 rounded-xl px-3.5 py-2 shadow-xl">
            <div className="flex items-center gap-2 text-xs font-bold tabular-nums">
              <span className="text-sky-300">BIRU</span>
              <span className="px-2 py-0.5 rounded bg-sky-500/20 border border-sky-400/40 text-sky-200 font-mono-num">
                {hud.blueTeamCards} Kad
              </span>
              <span className="text-[10px] text-slate-400 font-mono-num">({hud.blueTeamKills})</span>
            </div>

            <div className="px-3 py-0.5 rounded-lg font-mono-num font-extrabold text-sm border bg-slate-900 border-amber-400/40 text-amber-300">
              {formatMatchTime(hud.gameTimeSec)}
            </div>

            <div className="flex items-center gap-2 text-xs font-bold tabular-nums">
              <span className="text-[10px] text-slate-400 font-mono-num">({hud.redTeamKills})</span>
              <span className="px-2 py-0.5 rounded bg-rose-500/20 border border-rose-400/40 text-rose-200 font-mono-num">
                {hud.redTeamCards} Kad
              </span>
              <span className="text-rose-300">MERAH</span>
            </div>

            <button
              onClick={onOpenScoreboard}
              className="ml-1 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-white/15 text-[11px] font-bold text-amber-200 cursor-pointer transition-colors"
              title="Papan Skor 5V5 (V)"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Statistik</span>
            </button>
          </div>

          {/* Non-player Kill Banner (English MOBA announcements) */}
          {cardReward && !activePlayerCard && (
            <div
              className={`animate-card-pop rounded-xl px-4 py-2 border shadow-xl text-center max-w-md ${
                cardReward.killerTeam === 'blue'
                  ? 'bg-[#081529]/95 border-sky-400/70'
                  : 'bg-[#200a14]/95 border-rose-400/70'
              }`}
            >
              <div className="flex items-center justify-center gap-2 text-[10.5px] font-extrabold tracking-wide">
                {activeMultiLabel && (
                  <span className="px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 font-black">
                    {activeMultiLabel}
                  </span>
                )}
                <span className={cardReward.killerTeam === 'blue' ? 'text-sky-300' : 'text-rose-300'}>
                  {cardReward.killerName} eliminated {cardReward.victimName}!
                </span>
                <span className="text-amber-300 font-mono-num">+1 CARD</span>
              </div>
              <div className="flex items-center justify-center gap-2 mt-0.5">
                <span className="font-display font-extrabold text-sm text-white">
                  {cardReward.card.word.toUpperCase()}
                </span>
                <span className="text-[10.5px] font-bold" style={{ color: cardReward.card.color }}>
                  · {cardReward.card.category}
                </span>
              </div>
            </div>
          )}

          {/* Compact 2-item Recent Kill Feed (English) */}
          {hud.killFeed.length > 0 && !cardReward && !activePlayerCard && (
            <div className="flex flex-col items-center gap-1">
              {hud.killFeed.slice(0, 2).map((kf) => (
                <div
                  key={kf.id}
                  className="bg-[#091122]/85 border border-white/10 rounded-lg px-2.5 py-0.5 text-[10.5px] flex items-center gap-1.5 shadow"
                >
                  <span className={kf.killerTeam === 'blue' ? 'text-sky-300 font-bold' : 'text-rose-300 font-bold'}>
                    {kf.killerName}
                  </span>
                  <span className="text-slate-400">slain</span>
                  <span className={kf.victimTeam === 'blue' ? 'text-sky-200 font-bold' : 'text-rose-200 font-bold'}>
                    {kf.victimName}
                  </span>
                  <span className="text-slate-500">·</span>
                  <span className="font-bold" style={{ color: kf.cardColor }}>
                    +1 {kf.cardWord}
                  </span>
                </div>
              ))}
            </div>
          )}

          {hud.combatAlert && !cardReward && !activePlayerCard && (
            <div className="bg-amber-500/95 text-slate-950 font-display font-extrabold text-xs px-3.5 py-1 rounded-lg shadow-lg">
              {hud.combatAlert}
            </div>
          )}
        </div>

        {/* TOP RIGHT: Adjective Counter, Minimap, Camera Controls, System Buttons */}
        <div className="pointer-events-auto flex flex-col items-end gap-2">
          <div className="flex items-center gap-1.5 bg-[#091122]/94 border border-white/15 rounded-xl p-1.5 shadow-lg">
            <button
              onClick={onOpenScoreboard}
              className="md:hidden flex items-center gap-1 px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold cursor-pointer"
              title="Statistik 5V5 (V)"
              aria-label="Statistik 5V5"
            >
              <BarChart3 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onOpenBook}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors cursor-pointer whitespace-nowrap"
              title="Buka Buku Kata Adjektif (C)"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="font-mono-num">KAD: {hud.collectedCardIds.length}/10</span>
            </button>
            <button
              onClick={onOpenAchievements}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 transition-colors cursor-pointer"
              title="Pencapaian"
              aria-label="Pencapaian"
            >
              <Award className="w-4 h-4" />
            </button>
            <button
              onClick={onToggleMute}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
              title={muted ? 'Nyahsenyap Bunyi' : 'Senyapkan Bunyi'}
              aria-label="Togol Bunyi"
            >
              {muted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
              title="Tetapan"
              aria-label="Tetapan"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={onPause}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
              title="Jeda Permainan (Esc)"
              aria-label="Jeda Permainan"
            >
              <Pause className="w-4 h-4" />
            </button>
            <button
              onClick={onHome}
              className="p-2 rounded-lg bg-slate-800 hover:bg-rose-700 text-slate-200 transition-colors cursor-pointer"
              title="Butang Home"
              aria-label="Kembali ke Menu Utama"
            >
              <Home className="w-4 h-4" />
            </button>
          </div>

          {/* Adjective Progress Strip + Jungle Objectives + Camera Controls + Minimap */}
          <div className="flex items-start gap-2">
            <div className="hidden sm:flex flex-col justify-between bg-[#091122]/94 border border-amber-400/25 rounded-xl p-2.5 w-52 shadow-lg space-y-1.5">
              <div className="text-[11px] font-bold text-amber-300">
                GLOSARI ADJEKTIF: <span className="font-mono-num">{hud.collectedCardIds.length}/10</span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 transition-all duration-300"
                  style={{ width: `${cardPct}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-300">
                <span>
                  Menara Musuh:{' '}
                  <strong className="font-mono-num text-white">
                    {hud.enemyTurretsAlive}/{hud.enemyTurretsTotal}
                  </strong>
                </span>
                <span className={hud.turtleAlive ? 'text-emerald-300 font-bold' : 'text-slate-400'}>
                  {hud.turtleAlive ? 'Turtle Sedia' : `Turtle ${hud.turtleRespawnTimer}s`}
                </span>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-300">
                <span>
                  Bunuh Anda: <strong className="font-mono-num text-sky-300">{hud.playerKda.kills}</strong>
                </span>
                <span
                  className={
                    hud.alliedLordActive
                      ? 'text-cyan-300 font-bold'
                      : hud.lordAlive
                        ? 'text-purple-300 font-bold'
                        : 'text-slate-400'
                  }
                >
                  {hud.alliedLordActive
                    ? 'Lord Sekutu Mara!'
                    : hud.lordAlive
                      ? 'Lord Sedia'
                      : `Lord ${hud.lordRespawnTimer}s`}
                </span>
              </div>

              {/* Camera Zoom & Rotate Buttons */}
              <div className="flex items-center justify-between gap-1 pt-1 border-t border-white/10">
                <span className="text-[9px] text-slate-400 font-semibold">Kamera</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onCameraRotate(-0.35)}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
                    title="Putar Kamera Kiri"
                    aria-label="Putar Kamera Kiri"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => onCameraRotate(0.35)}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
                    title="Putar Kamera Kanan"
                    aria-label="Putar Kamera Kanan"
                  >
                    <RotateCw className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => onCameraZoom(-0.1)}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
                    title="Zum Masuk Kamera"
                    aria-label="Zum Masuk Kamera"
                  >
                    <ZoomIn className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => onCameraZoom(0.1)}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
                    title="Zum Keluar Kamera"
                    aria-label="Zum Keluar Kamera"
                  >
                    <ZoomOut className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
            <Minimap units={hud.minimapUnits} playerYaw={hud.playerYaw} />
          </div>
        </div>
      </div>

      {/* MOBILE / NARROW SCREEN SCOREBOARD & ALERT */}
      <div className="md:hidden flex flex-col items-center gap-1 pointer-events-none my-1">
        <div className="pointer-events-auto flex items-center gap-2 bg-[#091122]/94 border border-white/15 rounded-lg px-3 py-1 text-[10.5px] font-bold tabular-nums">
          <span className="text-sky-300">BIRU {hud.blueTeamCards}</span>
          <span className="font-mono-num text-amber-300">{formatMatchTime(hud.gameTimeSec)}</span>
          <span className="text-rose-300">{hud.redTeamCards} MERAH</span>
          <button
            onClick={onOpenScoreboard}
            className="ml-1 px-1.5 py-0.5 rounded bg-slate-800 text-amber-200 cursor-pointer"
          >
            Skor
          </button>
        </div>
        {cardReward && !activePlayerCard && (
          <div className="bg-[#081529]/95 border border-sky-400/60 text-white font-display font-bold text-[10.5px] px-3 py-1 rounded-lg shadow-lg text-center">
            {cardReward.killerName} eliminated {cardReward.victimName} · +1 <span className="text-amber-300">{cardReward.card.word}</span>
          </div>
        )}
        {hud.combatAlert && !cardReward && !activePlayerCard && (
          <div className="bg-amber-500/95 text-slate-950 font-display font-bold text-[11px] px-3 py-1 rounded-lg shadow-lg text-center">
            {hud.combatAlert}
          </div>
        )}
      </div>

      {/* CENTER OVERLAYS: Respawn Notice, Lord Arrival, Achievement Toast */}
      <div className="flex flex-col items-center gap-2 pointer-events-none my-auto">
        {hud.hp <= 0 && (
          <div className="animate-card-pop bg-[#1e0b16]/95 border-2 border-rose-400 rounded-2xl px-6 py-3.5 text-center shadow-2xl max-w-sm">
            <div className="font-display font-extrabold text-xl text-rose-300">
              YOU HAVE BEEN SLAIN!
            </div>
            <p className="text-xs text-slate-200 mt-1">
              Sedang bangkit semula di Kubu Sekutu dengan HP penuh...
            </p>
          </div>
        )}

        {hud.lordIntroActive && (
          <div className="animate-card-pop bg-[#220710]/95 border-2 border-amber-400 rounded-2xl px-7 py-4 text-center shadow-2xl max-w-md">
            <div className="inline-flex items-center gap-2 text-xs font-extrabold tracking-widest text-amber-300">
              <Crown className="w-4 h-4" />
              SUNGAI KRISTAL BERGEGAR
            </div>
            <div className="font-display font-extrabold text-3xl text-white mt-1">
              THE LORD HAS ARRIVED!
            </div>
            <p className="text-xs text-rose-200 mt-1">
              Tewaskan The Lord di Sanctuary Barat Laut untuk menyerunya mara memusnahkan menara musuh!
            </p>
          </div>
        )}

        {recentAch && (
          <div className="animate-card-pop bg-amber-500 text-slate-950 rounded-xl px-5 py-2.5 shadow-xl flex items-center gap-3 border border-amber-200">
            <Award className="w-6 h-6 shrink-0" />
            <div className="text-left">
              <div className="text-[10px] font-extrabold tracking-wider">PENCAPAIAN DIBUKA!</div>
              <div className="font-display font-bold text-sm">{recentAch.title}</div>
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM CONTROLS: Virtual Joystick (Left) & Combat Controls (Right) */}
      <div className="flex items-end justify-between gap-3 w-full">
        {/* Lower Left: Virtual Joystick (on Touch) OR Desktop Controls Hint */}
        <div className="pointer-events-auto">
          {showTouchControls ? (
            <VirtualJoystick onMove={onJoystickMove} />
          ) : (
            <div className="hidden sm:block bg-[#091122]/88 border border-white/10 rounded-xl px-3 py-2 text-[11px] text-slate-300 leading-relaxed">
              <span className="font-bold text-amber-300">WASD</span> Gerak ·{' '}
              <span className="font-bold text-amber-300">Tahan Klik Kiri</span> Auto-Serang ·{' '}
              <span className="font-bold text-amber-300">Q / E / R</span> Kemahiran ·{' '}
              <span className="font-bold text-amber-300">V</span> Statistik ·{' '}
              <span className="font-bold text-amber-300">Space</span> Elak ·{' '}
              <span className="font-bold text-amber-300">F</span> Posyen
            </div>
          )}
        </div>

        {/* Lower Right: Targeting Toggles, Potion, Dash, Skills, Hold-to-Auto-Attack */}
        <div className="pointer-events-auto flex items-end gap-2 sm:gap-2.5 ml-auto">
          {/* Target Controls + Auto-Chase + Potion */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5">
              <button
                onClick={onToggleTargetLock}
                className={`px-2 py-1.5 rounded-lg border text-[10px] font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                  hud.targetLocked
                    ? 'bg-rose-600 border-rose-300 text-white'
                    : 'bg-[#091122]/92 border-white/20 text-slate-300 hover:text-white'
                }`}
                title="Kunci Sasaran Musuh"
              >
                <Crosshair className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{hud.targetLocked ? 'Terkunci' : 'Kunci'}</span>
              </button>

              <button
                onClick={onCycleTarget}
                className="px-2 py-1.5 rounded-lg border bg-[#091122]/92 border-white/20 text-slate-200 hover:text-white hover:border-amber-300 text-[10px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                title="Tukar Sasaran (Tab)"
              >
                <RefreshCw className="w-3.5 h-3.5 text-sky-300" />
                <span className="hidden sm:inline">Tukar</span>
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={onToggleAutoChase}
                className={`px-2 py-1.5 rounded-lg border text-[10px] font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                  hud.autoChase
                    ? 'bg-emerald-600 border-emerald-300 text-white'
                    : 'bg-[#091122]/92 border-white/20 text-slate-300 hover:text-white'
                }`}
                title="Kejar sasaran secara automatik jika di luar jarak"
              >
                <Footprints className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">
                  {hud.autoChase ? 'Kejar: ON' : 'Kejar: OFF'}
                </span>
              </button>

              <button
                onClick={onUsePotion}
                disabled={hud.potions <= 0}
                className="relative px-2.5 py-1.5 rounded-lg bg-[#091122]/92 border border-emerald-400/50 hover:bg-emerald-950 disabled:opacity-45 flex items-center gap-1 text-emerald-300 cursor-pointer transition-colors"
                title="Guna Posyen Kesihatan (F)"
              >
                <FlaskConical className="w-3.5 h-3.5" />
                <span className="text-[10px] font-mono-num font-bold">x{hud.potions}</span>
              </button>
            </div>
          </div>

          {/* Dash Button */}
          <SkillButton
            label="Elak"
            hotkey="Space"
            cooldown={hud.cooldowns.dash}
            color="#94a3b8"
            onClick={onDash}
          />

          {/* Skill 1 (Q) */}
          <SkillButton
            label={hero.skills.skill1.name}
            hotkey="Q"
            cooldown={hud.cooldowns.skill1}
            manaCost={hud.blueBuffTimer > 0 ? 15 : 28}
            lowMana={hud.mana < (hud.blueBuffTimer > 0 ? 15 : 28)}
            color={hero.skills.skill1.color}
            onClick={onSkill1}
          />

          {/* Skill 2 (E) */}
          <SkillButton
            label={hero.skills.skill2.name}
            hotkey="E"
            cooldown={hud.cooldowns.skill2}
            manaCost={hud.blueBuffTimer > 0 ? 20 : 36}
            lowMana={hud.mana < (hud.blueBuffTimer > 0 ? 20 : 36)}
            color={hero.skills.skill2.color}
            onClick={onSkill2}
          />

          {/* Ultimate (R) */}
          <SkillButton
            label={hero.skills.ultimate.name}
            hotkey="R"
            cooldown={hud.cooldowns.ultimate}
            manaCost={hud.blueBuffTimer > 0 ? 30 : 55}
            lowMana={hud.mana < (hud.blueBuffTimer > 0 ? 30 : 55)}
            color={hero.skills.ultimate.color}
            isUltimate
            onClick={onUltimate}
          />

          {/* Hold-to-Auto-Attack Button */}
          <button
            onPointerDown={(e) => {
              e.preventDefault();
              onAttackHoldChange(true);
            }}
            onPointerUp={() => onAttackHoldChange(false)}
            onPointerLeave={() => onAttackHoldChange(false)}
            onPointerCancel={() => onAttackHoldChange(false)}
            className={`w-16 h-16 sm:w-[74px] sm:h-[74px] rounded-full border-2 shadow-xl flex flex-col items-center justify-center font-display font-extrabold active:scale-95 transition-transform cursor-pointer select-none ${
              hud.autoAttackActive
                ? 'bg-gradient-to-br from-rose-500 to-amber-400 border-white text-white'
                : 'bg-gradient-to-br from-amber-400 to-orange-600 border-amber-200 text-slate-950'
            }`}
            title="Tahan untuk Auto-Serang Musuh Terdekat (atau Klik Kiri)"
          >
            <Swords className="w-6 h-6 sm:w-7 sm:h-7" />
            <span className="text-[10px] tracking-wide mt-0.5">SERANG</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function SkillButton({
  label,
  hotkey,
  cooldown,
  manaCost,
  lowMana = false,
  color,
  isUltimate = false,
  onClick,
}: {
  label: string;
  hotkey: string;
  cooldown: number;
  manaCost?: number;
  lowMana?: boolean;
  color: string;
  isUltimate?: boolean;
  onClick: () => void;
}) {
  const onCd = cooldown > 0.05;
  return (
    <button
      onClick={onClick}
      className={`relative flex flex-col items-center justify-center rounded-2xl border-2 bg-[#091122]/92 shadow-lg transition-transform active:scale-95 cursor-pointer ${
        isUltimate ? 'w-14 h-14 sm:w-16 sm:h-16' : 'w-12 h-12 sm:w-14 sm:h-14'
      } ${lowMana && !onCd ? 'opacity-65' : ''}`}
      style={{ borderColor: onCd ? '#475569' : lowMana ? '#38bdf8' : color }}
      title={`${label} (${hotkey})${manaCost ? ` · ${manaCost} Mana` : ''}`}
    >
      <span
        className="text-[10px] sm:text-[11px] font-bold text-center leading-tight px-1 line-clamp-2"
        style={{ color: onCd ? '#64748b' : '#f8fafc' }}
      >
        {label.split(' ')[0]}
      </span>
      <span className="text-[9px] font-mono-num text-slate-400 mt-0.5">
        {hotkey}
        {manaCost !== undefined && <span className="text-sky-400"> · {manaCost}</span>}
      </span>
      {onCd && (
        <div className="absolute inset-0 rounded-2xl bg-slate-950/75 flex items-center justify-center font-mono-num font-bold text-sm text-amber-300">
          {cooldown.toFixed(1)}
        </div>
      )}
    </button>
  );
}
