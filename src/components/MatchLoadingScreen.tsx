import React, { useEffect, useState } from 'react';
import { Home, Shield, Swords } from 'lucide-react';
import { BalancedTeamSlot } from '../data/gameData';
import { HeroPortrait } from './HeroPortrait';

interface MatchLoadingScreenProps {
  blueTeam: BalancedTeamSlot[];
  redTeam: BalancedTeamSlot[];
  onComplete: () => void;
  onHome: () => void;
}

const LANE_LABEL: Record<string, string> = {
  exp: 'LORONG EXP',
  mid: 'LORONG TENGAH',
  gold: 'LORONG EMAS',
  roam: 'ROAMER',
};

export const MatchLoadingScreen: React.FC<MatchLoadingScreenProps> = ({
  blueTeam,
  redTeam,
  onComplete,
  onHome,
}) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const start = performance.now();
    const durationMs = 2600;
    let raf = 0;
    let finished = false;

    const tick = (now: number) => {
      const pct = Math.min(100, ((now - start) / durationMs) * 100);
      setProgress(pct);
      if (pct >= 100 && !finished) {
        finished = true;
        onComplete();
        return;
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-30 flex flex-col justify-between bg-[#060c1a] text-slate-100 overflow-hidden select-none">
      {/* Dramatic Blue vs Red Diagonal Fantasy Energy Split */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(118deg, rgba(14, 165, 233, 0.16) 0%, rgba(14, 165, 233, 0.04) 44%, rgba(251, 191, 36, 0.09) 50%, rgba(239, 68, 68, 0.04) 56%, rgba(239, 68, 68, 0.18) 100%), radial-gradient(circle at 50% 48%, rgba(251, 191, 36, 0.12), transparent 52%)',
        }}
      />
      <div className="pointer-events-none absolute inset-y-0 left-1/2 w-px bg-gradient-to-b from-transparent via-amber-400/35 to-transparent" />

      {/* Top Header */}
      <div className="relative z-10 flex items-center justify-between px-4 sm:px-8 pt-4 sm:pt-6">
        <div>
          <p className="text-[11px] font-bold tracking-[0.26em] text-amber-300 uppercase">
            LEGENDA KATA ADJEKTIF · MOD 5V5
          </p>
          <h1 className="font-display text-xl sm:text-3xl font-bold text-white tracking-wide mt-0.5">
            MENYEDIAKAN MEDAN PERANG LAND OF DAWN
          </h1>
        </div>
        <button
          onClick={onHome}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#0d172e] hover:bg-[#142347] border border-slate-700/80 text-xs font-bold text-slate-200 transition cursor-pointer"
        >
          <Home className="w-4 h-4 text-amber-300" />
          <span>BUTANG HOME</span>
        </button>
      </div>

      {/* 5 Blue vs 5 Red Lineup Showcase */}
      <div className="relative z-10 flex-1 flex flex-col justify-center px-3 sm:px-8 py-3 overflow-y-auto">
        <div className="max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-4 items-center">
          {/* Blue Team */}
          <div className="rounded-xl bg-[#0a1429]/95 border border-sky-500/40 p-3 sm:p-4 shadow-2xl">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-sky-500/25">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-sky-400" />
                <span className="font-display text-sm sm:text-base font-bold text-sky-300 tracking-wider">
                  PASUKAN BIRU (SEKUTU)
                </span>
              </div>
              <span className="text-[11px] font-semibold text-sky-200/80">5 HERO</span>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {blueTeam.map((slot, idx) => (
                <div
                  key={`${slot.hero.id}-${idx}`}
                  className={`relative rounded-lg p-2 flex flex-col items-center text-center border transition ${
                    slot.isPlayer
                      ? 'bg-amber-950/40 border-amber-400 shadow-lg shadow-amber-500/15'
                      : 'bg-[#0e1b36] border-sky-500/30'
                  }`}
                >
                  {slot.isPlayer && (
                    <span className="mb-1 px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 text-[9px] font-black tracking-wider">
                      ANDA
                    </span>
                  )}
                  <HeroPortrait hero={slot.hero} size={46} />
                  <p className="mt-1.5 text-[11px] sm:text-xs font-bold text-white leading-tight line-clamp-1">
                    {slot.hero.name}
                  </p>
                  <p className="text-[9px] text-sky-300/90 font-semibold line-clamp-1">
                    {slot.hero.roleLabel}
                  </p>
                  <span className="mt-1 text-[8px] font-bold text-slate-300 bg-slate-900/90 px-1.5 py-0.5 rounded border border-slate-700/70">
                    {LANE_LABEL[slot.lane] || slot.lane.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Center VS */}
          <div className="flex flex-col items-center justify-center py-1 lg:px-2">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-amber-500/25 via-[#111c36] to-rose-500/25 border-2 border-amber-400/70 flex flex-col items-center justify-center shadow-xl">
              <Swords className="w-5 h-5 text-amber-300 mb-0.5" />
              <span className="font-display text-xl sm:text-2xl font-black text-amber-300 tracking-widest">
                VS
              </span>
            </div>
            <p className="mt-1.5 text-[10px] font-bold tracking-[0.2em] text-slate-300 uppercase">
              PERTEMPURAN 5V5
            </p>
          </div>

          {/* Red Team */}
          <div className="rounded-xl bg-[#1a0d19]/95 border border-rose-500/40 p-3 sm:p-4 shadow-2xl">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-rose-500/25">
              <div className="flex items-center gap-2">
                <Swords className="w-4 h-4 text-rose-400" />
                <span className="font-display text-sm sm:text-base font-bold text-rose-300 tracking-wider">
                  PASUKAN MERAH (MUSUH)
                </span>
              </div>
              <span className="text-[11px] font-semibold text-rose-200/80">5 HERO</span>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {redTeam.map((slot, idx) => (
                <div
                  key={`${slot.hero.id}-${idx}`}
                  className="rounded-lg p-2 flex flex-col items-center text-center bg-[#231020] border border-rose-500/30"
                >
                  <HeroPortrait hero={slot.hero} size={46} />
                  <p className="mt-1.5 text-[11px] sm:text-xs font-bold text-white leading-tight line-clamp-1">
                    {slot.hero.name}
                  </p>
                  <p className="text-[9px] text-rose-300/90 font-semibold line-clamp-1">
                    {slot.hero.roleLabel}
                  </p>
                  <span className="mt-1 text-[8px] font-bold text-slate-300 bg-slate-950/80 px-1.5 py-0.5 rounded border border-rose-900/70">
                    {LANE_LABEL[slot.lane] || slot.lane.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Loading Bar */}
      <div className="relative z-10 px-4 sm:px-8 pb-5 sm:pb-7">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-slate-300 font-medium">
              Tip: Setiap tumbangan hero memberikan <strong className="text-amber-300">+1 Kad Kata Adjektif</strong> kepada pasukan anda!
            </span>
            <span className="font-mono font-bold text-amber-300 tabular-nums">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="h-3 w-full rounded-full bg-slate-900 border border-slate-700 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-sky-400 via-amber-400 to-rose-400 transition-[width] duration-75"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
