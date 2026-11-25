import { useCallback, useEffect, useRef, useState } from 'react';
import {
  BookOpen,
  Home,
  Play,
  Settings,
  Sparkles,
  Swords,
  Users,
  Volume2,
  VolumeX,
} from 'lucide-react';
import {
  BalancedTeamSlot,
  compose5v5Teams,
  HERO_ROLES,
  HeroDefinition,
  SHOP_ITEMS,
  ShopItemDef,
} from './data/gameData';
import { GameEngine } from './game/GameEngine';
import { CardRewardNotification, GamePhase, HudSnapshot } from './game/hudTypes';
import { soundEngine, SoundSettings } from './game/soundEngine';
import { GameHud } from './components/GameHud';
import { HeroSelectionScreen } from './components/HeroSelectionScreen';
import { MatchLoadingScreen } from './components/MatchLoadingScreen';
import { ScoreboardModal } from './components/ScoreboardModal';
import {
  AchievementsModal,
  AdjectiveBookModal,
  HowToPlayModal,
  MatchResultsModal,
  PauseModal,
  SettingsModal,
  ShopModal,
} from './components/GameModals';

export interface ActivePlayerCardState {
  reward: CardRewardNotification;
  exiting: boolean;
}

export default function App() {
  const canvasMountRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  const [phase, setPhase] = useState<GamePhase>('menu');
  const [selectedHero, setSelectedHero] = useState<HeroDefinition>(HERO_ROLES[0]); // Default Miya
  const [hasCustomizedHero, setHasCustomizedHero] = useState(false);
  const [pendingTeams, setPendingTeams] = useState<{
    hero: HeroDefinition;
    blue: BalancedTeamSlot[];
    red: BalancedTeamSlot[];
  } | null>(null);

  const [hud, setHud] = useState<HudSnapshot | null>(null);
  const [activeOverlay, setActiveOverlay] = useState<
    null | 'shop' | 'scoreboard' | 'book' | 'achievements' | 'settings' | 'how_to_play'
  >(null);

  const [activePlayerCard, setActivePlayerCard] = useState<ActivePlayerCardState | null>(null);
  const [cardReward, setCardReward] = useState<CardRewardNotification | null>(null);
  const [purchasedItemToast, setPurchasedItemToast] = useState<{ item: ShopItemDef; key: number } | null>(null);
  const [recentAchievementId, setRecentAchievementId] = useState<string | null>(null);
  const [soundSettings, setSoundSettings] = useState<SoundSettings>(() => soundEngine.getSettings());
  const [showTouchControls, setShowTouchControls] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth < 820;
  });

  const playerCardQueueRef = useRef<CardRewardNotification[]>([]);
  const playerCardActiveRef = useRef(false);
  const playerCardShowTimerRef = useRef<number | null>(null);
  const playerCardExitTimerRef = useRef<number | null>(null);
  const rewardTimerRef = useRef<number | null>(null);
  const purchaseTimerRef = useRef<number | null>(null);
  const achTimerRef = useRef<number | null>(null);

  const clearCardQueueTimers = useCallback(() => {
    if (playerCardShowTimerRef.current) {
      window.clearTimeout(playerCardShowTimerRef.current);
      playerCardShowTimerRef.current = null;
    }
    if (playerCardExitTimerRef.current) {
      window.clearTimeout(playerCardExitTimerRef.current);
      playerCardExitTimerRef.current = null;
    }
    playerCardQueueRef.current = [];
    playerCardActiveRef.current = false;
    setActivePlayerCard(null);
  }, []);

  const pumpPlayerCardQueue = useCallback(() => {
    if (playerCardActiveRef.current) return;
    const next = playerCardQueueRef.current.shift();
    if (!next) {
      setActivePlayerCard(null);
      return;
    }

    playerCardActiveRef.current = true;
    setActivePlayerCard({ reward: next, exiting: false });

    playerCardShowTimerRef.current = window.setTimeout(() => {
      setActivePlayerCard((prev) => (prev ? { ...prev, exiting: true } : null));
      playerCardExitTimerRef.current = window.setTimeout(() => {
        playerCardActiveRef.current = false;
        pumpPlayerCardQueue();
      }, 340);
    }, 2400);
  }, []);

  useEffect(() => {
    const container = canvasMountRef.current;
    if (!container) return;

    const engine = new GameEngine(container, {
      onHudUpdate: (snapshot) => {
        setHud(snapshot);
      },
      onCardCollected: () => {},
      onCardReward: (reward) => {
        if (reward.isPlayerKill) {
          playerCardQueueRef.current.push(reward);
          pumpPlayerCardQueue();
        } else {
          setCardReward(reward);
          if (rewardTimerRef.current) window.clearTimeout(rewardTimerRef.current);
          rewardTimerRef.current = window.setTimeout(() => setCardReward(null), 2800);
        }
      },
      onAchievementUnlocked: (achId) => {
        setRecentAchievementId(achId);
        if (achTimerRef.current) window.clearTimeout(achTimerRef.current);
        achTimerRef.current = window.setTimeout(() => setRecentAchievementId(null), 3800);
      },
      onEnemyDefeated: () => {},
      onVictory: () => {
        setActiveOverlay(null);
        setPhase('victory');
      },
      onDefeat: () => {
        setActiveOverlay(null);
        setPhase('defeat');
      },
    });
    engineRef.current = engine;

    return () => {
      clearCardQueueTimers();
      if (rewardTimerRef.current) window.clearTimeout(rewardTimerRef.current);
      if (purchaseTimerRef.current) window.clearTimeout(purchaseTimerRef.current);
      if (achTimerRef.current) window.clearTimeout(achTimerRef.current);
      engine.dispose();
      engineRef.current = null;
    };
  }, [clearCardQueueTimers, pumpPlayerCardQueue]);

  // Unlock Web Audio on first user interaction & sync non-battle music modes
  useEffect(() => {
    const syncPreMatchMusic = () => {
      if (phase === 'menu') soundEngine.setMusicMode('menu');
      else if (phase === 'hero_select') soundEngine.setMusicMode('hero_select');
      else if (phase === 'loading') soundEngine.setMusicMode('loading');
    };
    const unlock = () => {
      soundEngine.unlock();
      syncPreMatchMusic();
    };
    syncPreMatchMusic();
    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, [phase]);

  const handleGoHome = useCallback(() => {
    soundEngine.playUiClick();
    setActiveOverlay(null);
    setPendingTeams(null);
    clearCardQueueTimers();
    setCardReward(null);
    setPurchasedItemToast(null);
    setRecentAchievementId(null);
    setPhase('menu');
    engineRef.current?.setMode('menu');
    soundEngine.setMusicMode('menu');
  }, [clearCardQueueTimers]);

  const handleStartBattle = useCallback(
    (heroToUse = selectedHero) => {
      soundEngine.unlock();
      soundEngine.playHeroSelect();
      setActiveOverlay(null);
      clearCardQueueTimers();
      setCardReward(null);
      setPurchasedItemToast(null);
      setRecentAchievementId(null);
      const { blueTeam, redTeam } = compose5v5Teams(heroToUse);
      setPendingTeams({ hero: heroToUse, blue: blueTeam, red: redTeam });
      engineRef.current?.setMode('menu');
      soundEngine.setMusicMode('loading');
      setPhase('loading');
    },
    [selectedHero, clearCardQueueTimers]
  );

  const handleLoadingComplete = useCallback(() => {
    if (!pendingTeams) return;
    const { hero, blue, red } = pendingTeams;
    setPhase('playing');
    engineRef.current?.startNewGame(hero, blue, red);
    soundEngine.setMusicMode('explore');
  }, [pendingTeams]);

  const handlePause = useCallback(() => {
    if (phase !== 'playing') return;
    soundEngine.playUiClick();
    setActiveOverlay(null);
    setPhase('paused');
    engineRef.current?.setMode('paused');
  }, [phase]);

  const handleResume = useCallback(() => {
    if (phase !== 'paused') return;
    soundEngine.playUiClick();
    setActiveOverlay(null);
    setPhase('playing');
    engineRef.current?.setMode('playing');
  }, [phase]);

  const handleBuyItem = useCallback((itemId: string) => {
    const ok = engineRef.current?.buyItem(itemId);
    if (ok) {
      const item = SHOP_ITEMS.find((s) => s.id === itemId);
      if (item) {
        setPurchasedItemToast({ item, key: Date.now() });
        if (purchaseTimerRef.current) window.clearTimeout(purchaseTimerRef.current);
        purchaseTimerRef.current = window.setTimeout(() => setPurchasedItemToast(null), 2200);
      }
    }
  }, []);

  // Global keyboard shortcuts (Escape, B, C, V)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        if (activeOverlay) {
          setActiveOverlay(null);
        } else if (phase === 'playing') {
          handlePause();
        } else if (phase === 'paused') {
          handleResume();
        }
      } else if (phase === 'playing') {
        if (e.code === 'KeyB') {
          soundEngine.playUiClick();
          setActiveOverlay((prev) => (prev === 'shop' ? null : 'shop'));
        } else if (e.code === 'KeyC') {
          soundEngine.playUiClick();
          setActiveOverlay((prev) => (prev === 'book' ? null : 'book'));
        } else if (e.code === 'KeyV') {
          soundEngine.playUiClick();
          setActiveOverlay((prev) => (prev === 'scoreboard' ? null : 'scoreboard'));
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [phase, activeOverlay, handlePause, handleResume]);

  const handleUpdateSound = (partial: Partial<SoundSettings>) => {
    soundEngine.unlock();
    soundEngine.updateSettings(partial);
    setSoundSettings(soundEngine.getSettings());
  };

  const handleSelectHero = (hero: HeroDefinition) => {
    soundEngine.unlock();
    soundEngine.playHeroSelect();
    setSelectedHero(hero);
    setHasCustomizedHero(true);
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#070b14]">
      {/* Isolated 3D WebGL Viewport */}
      <div ref={canvasMountRef} className="fixed inset-0 w-full h-full" />

      {/* MAIN MENU OVERLAY */}
      {phase === 'menu' && (
        <div className="fixed inset-0 z-20 flex flex-col justify-between p-4 sm:p-8 bg-gradient-to-t from-[#070b14]/90 via-[#070b14]/35 to-[#070b14]/75 pointer-events-auto">
          {/* Atmospheric Radial Spotlight */}
          <div
            className="pointer-events-none fixed inset-0"
            style={{
              background:
                'radial-gradient(ellipse at 50% 44%, rgba(251, 191, 36, 0.16), transparent 58%)',
            }}
          />

          {/* Top Bar */}
          <div className="relative z-10 flex items-center justify-between gap-4 max-w-6xl w-full mx-auto">
            <div className="text-xs sm:text-sm font-bold text-amber-200 tracking-wide">
              BAHASA MELAYU — KATA ADJEKTIF · TAHUN 3
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleUpdateSound({ muted: !soundSettings.muted })}
                className="p-2.5 rounded-xl bg-[#091122]/90 border border-white/15 hover:border-amber-400/50 text-white cursor-pointer transition-colors"
                aria-label="Togol Bunyi"
                title={soundSettings.muted ? 'Aktifkan Bunyi' : 'Senyapkan Bunyi'}
              >
                {soundSettings.muted ? (
                  <VolumeX className="w-4 h-4 text-rose-400" />
                ) : (
                  <Volume2 className="w-4 h-4 text-amber-300" />
                )}
              </button>
              <button
                onClick={handleGoHome}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#091122]/90 border border-white/15 hover:border-amber-400/50 text-xs font-bold text-white cursor-pointer transition-colors"
              >
                <Home className="w-4 h-4 text-amber-300" />
                BUTANG HOME
              </button>
            </div>
          </div>

          {/* Center Heroic Title & Functional Menu Buttons */}
          <div className="relative z-10 max-w-4xl w-full mx-auto text-center my-auto py-4">
            <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold tracking-[0.22em] text-amber-300 mb-3 uppercase">
              <Sparkles className="w-4 h-4" />
              PERTEMPURAN MOBA 5V5 · LAND OF DAWN
            </div>

            <h1 className="font-display font-extrabold text-4xl sm:text-6xl lg:text-7xl tracking-tight bg-gradient-to-b from-white via-amber-200 to-amber-500 bg-clip-text text-transparent drop-shadow-[0_10px_32px_rgba(245,158,11,0.42)] leading-tight">
              LEGENDA KATA ADJEKTIF
            </h1>
            <p className="font-display font-bold text-lg sm:text-2xl text-sky-200 tracking-wide mt-2 drop-shadow">
              {HERO_ROLES.length} HEROES · 5V5 BATTLE ARENA
            </p>

            <p className="text-xs sm:text-base text-slate-200 max-w-2xl mx-auto mt-3.5 leading-relaxed">
              Pilih daripada {HERO_ROLES.length} wira legenda untuk mengetuai pasukan 5V5 anda! Tumbangkan hero lawan untuk mengumpul kad{' '}
              <strong className="text-amber-300">Kata Adjektif Jarak, Perasaan &amp; Pancaindera</strong> dan musnahkan Kubu Utama musuh!
            </p>

            {/* Primary & Secondary Menu Actions */}
            <div className="mt-7 flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => {
                  soundEngine.unlock();
                  soundEngine.playUiClick();
                  if (!hasCustomizedHero) {
                    setPhase('hero_select');
                  } else {
                    handleStartBattle();
                  }
                }}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-display font-extrabold text-base flex items-center justify-center gap-2.5 shadow-2xl cursor-pointer transition-transform active:scale-95"
              >
                <Play className="w-5 h-5 fill-current" />
                MULA PERMAINAN
              </button>

              <button
                onClick={() => {
                  soundEngine.unlock();
                  soundEngine.playUiClick();
                  setPhase('hero_select');
                }}
                className="w-full sm:w-auto px-6 py-4 rounded-xl bg-[#0b1326]/95 hover:bg-slate-800 border border-amber-400/50 text-white font-display font-bold text-sm sm:text-base flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Users className="w-5 h-5 text-sky-300" />
                PILIH HERO
              </button>

              <button
                onClick={() => {
                  soundEngine.unlock();
                  soundEngine.playUiClick();
                  setActiveOverlay('how_to_play');
                }}
                className="w-full sm:w-auto px-6 py-4 rounded-xl bg-[#0b1326]/95 hover:bg-slate-800 border border-white/20 text-white font-display font-bold text-sm sm:text-base flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <BookOpen className="w-5 h-5 text-emerald-300" />
                CARA BERMAIN
              </button>

              <button
                onClick={() => {
                  soundEngine.unlock();
                  soundEngine.playUiClick();
                  setActiveOverlay('settings');
                }}
                className="w-full sm:w-auto px-6 py-4 rounded-xl bg-[#0b1326]/95 hover:bg-slate-800 border border-white/20 text-white font-display font-bold text-sm sm:text-base flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Settings className="w-5 h-5 text-amber-300" />
                TETAPAN
              </button>
            </div>

            {hasCustomizedHero && (
              <div className="mt-4 inline-flex items-center gap-2 text-xs text-emerald-300 bg-[#091122]/90 border border-emerald-400/30 rounded-xl px-4 py-2">
                <Swords className="w-4 h-4" />
                <span>
                  Wira Sedia: <strong>{selectedHero.name}</strong> ({selectedHero.roleLabel})
                </span>
              </div>
            )}
          </div>

          {/* Bottom Summary Strip */}
          <div className="relative z-10 max-w-4xl w-full mx-auto flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-xs text-slate-300">
            <span>Pertempuran 5V5 (10 Hero)</span>
            <span aria-hidden="true">·</span>
            <span>Medan 3-Lorong &amp; 12 Menara Berperisai</span>
            <span aria-hidden="true">·</span>
            <span>+1 Kad Adjektif Setiap Tumbangan</span>
            <span aria-hidden="true">·</span>
            <span>Musnahkan Kubu Utama Lawan</span>
          </div>
        </div>
      )}

      {/* HERO SELECTION SCREEN */}
      {phase === 'hero_select' && (
        <HeroSelectionScreen
          selectedHero={selectedHero}
          onSelectHero={handleSelectHero}
          onLaunchBattle={() => handleStartBattle(selectedHero)}
          onHome={handleGoHome}
        />
      )}

      {/* 5V5 HERO LOADING SCREEN */}
      {phase === 'loading' && pendingTeams && (
        <MatchLoadingScreen
          blueTeam={pendingTeams.blue}
          redTeam={pendingTeams.red}
          onComplete={handleLoadingComplete}
          onHome={handleGoHome}
        />
      )}

      {/* IN-GAME HUD */}
      {(phase === 'playing' || phase === 'paused') && hud && (
        <GameHud
          hero={selectedHero}
          hud={hud}
          muted={soundSettings.muted}
          showTouchControls={showTouchControls}
          activePlayerCard={activePlayerCard}
          cardReward={cardReward}
          purchasedItemToast={purchasedItemToast}
          recentAchievementId={recentAchievementId}
          onJoystickMove={(x, y) => engineRef.current?.setJoystickVector(x, y)}
          onAttackHoldChange={(held) => engineRef.current?.setAutoAttackHeld(held)}
          onSkill1={() => engineRef.current?.triggerSkill1()}
          onSkill2={() => engineRef.current?.triggerSkill2()}
          onUltimate={() => engineRef.current?.triggerUltimate()}
          onDash={() => engineRef.current?.triggerDash()}
          onUsePotion={() => engineRef.current?.usePotion()}
          onToggleTargetLock={() => engineRef.current?.toggleTargetLock()}
          onCycleTarget={() => engineRef.current?.cycleTarget()}
          onToggleAutoChase={() => engineRef.current?.toggleAutoChase()}
          onBuyRecommendedItem={handleBuyItem}
          onDismissRecommendedItem={(itemId) => engineRef.current?.dismissRecommendedItem(itemId)}
          onCameraZoom={(delta) => engineRef.current?.adjustCameraZoom(delta)}
          onCameraRotate={(delta) => engineRef.current?.adjustCameraYaw(delta)}
          onOpenShop={() => {
            soundEngine.playUiClick();
            setActiveOverlay('shop');
          }}
          onOpenScoreboard={() => {
            soundEngine.playUiClick();
            setActiveOverlay('scoreboard');
          }}
          onOpenBook={() => {
            soundEngine.playUiClick();
            setActiveOverlay('book');
          }}
          onOpenAchievements={() => {
            soundEngine.playUiClick();
            setActiveOverlay('achievements');
          }}
          onOpenSettings={() => {
            soundEngine.playUiClick();
            setActiveOverlay('settings');
          }}
          onToggleMute={() => handleUpdateSound({ muted: !soundSettings.muted })}
          onPause={handlePause}
          onHome={handleGoHome}
        />
      )}

      {/* PAUSE MENU */}
      {phase === 'paused' && !activeOverlay && (
        <PauseModal
          onResume={handleResume}
          onSettings={() => {
            soundEngine.playUiClick();
            setActiveOverlay('settings');
          }}
          onRestart={() => handleStartBattle()}
          onHome={handleGoHome}
        />
      )}

      {/* POST-MATCH RESULTS SCREEN (VICTORY OR DEFEAT) */}
      {(phase === 'victory' || phase === 'defeat') && (
        <MatchResultsModal
          hero={selectedHero}
          hud={hud}
          onPlayAgain={() => handleStartBattle()}
          onHome={handleGoHome}
        />
      )}

      {/* INTERACTIVE MODALS */}
      {activeOverlay === 'scoreboard' && hud && (
        <ScoreboardModal hud={hud} onClose={() => setActiveOverlay(null)} />
      )}

      {activeOverlay === 'shop' && hud && (
        <ShopModal
          hud={hud}
          onBuyItem={handleBuyItem}
          onSellItem={(slotIndex) => engineRef.current?.sellItem(slotIndex)}
          onClose={() => setActiveOverlay(null)}
        />
      )}

      {activeOverlay === 'book' && hud && (
        <AdjectiveBookModal
          collectedIds={hud.collectedCardIds}
          onClose={() => setActiveOverlay(null)}
        />
      )}

      {activeOverlay === 'achievements' && hud && (
        <AchievementsModal
          unlockedIds={hud.unlockedAchievements}
          onClose={() => setActiveOverlay(null)}
        />
      )}

      {activeOverlay === 'settings' && (
        <SettingsModal
          soundSettings={soundSettings}
          showTouchControls={showTouchControls}
          onUpdateSound={handleUpdateSound}
          onToggleTouchControls={() => setShowTouchControls((v) => !v)}
          onHome={handleGoHome}
          onClose={() => setActiveOverlay(null)}
        />
      )}

      {activeOverlay === 'how_to_play' && (
        <HowToPlayModal
          onHome={handleGoHome}
          onClose={() => setActiveOverlay(null)}
        />
      )}
    </div>
  );
}
