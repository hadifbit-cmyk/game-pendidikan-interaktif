import React from 'react';
import { Award, Coins, Shield, Swords, X } from 'lucide-react';
import { SHOP_ITEMS } from '../data/gameData';
import { HudSnapshot, MatchHeroStats } from '../game/hudTypes';
import { HeroPortrait } from './HeroPortrait';
import { ItemIcon } from './ItemIcon';

interface ScoreboardModalProps {
  hud: HudSnapshot;
  onClose: () => void;
}

function formatTime(sec: number): string {
  const s = Math.max(0, Math.floor(sec));
  const hrs = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const rem = s % 60;
  return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
}

const TeamTable: React.FC<{
  title: string;
  team: 'blue' | 'red';
  heroes: MatchHeroStats[];
  totalCards: number;
  totalKills: number;
}> = ({ title, team, heroes, totalCards, totalKills }) => {
  const isBlue = team === 'blue';
  return (
    <div
      className={`rounded-xl border overflow-hidden ${
        isBlue ? 'bg-[#091429] border-sky-500/40' : 'bg-[#1b0d17] border-rose-500/40'
      }`}
    >
      <div
        className={`flex items-center justify-between px-4 py-2.5 border-b ${
          isBlue ? 'bg-sky-950/60 border-sky-500/30' : 'bg-rose-950/60 border-rose-500/30'
        }`}
      >
        <div className="flex items-center gap-2">
          {isBlue ? <Shield className="w-4 h-4 text-sky-400" /> : <Swords className="w-4 h-4 text-rose-400" />}
          <span className={`font-display text-sm font-bold tracking-wide ${isBlue ? 'text-sky-300' : 'text-rose-300'}`}>
            {title}
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs font-bold tabular-nums">
          <span className="text-amber-300">{totalCards} Kad Adjektif</span>
          <span className="text-slate-300">{totalKills} Bunuh</span>
        </div>
      </div>

      <div className="divide-y divide-slate-800/80">
        {heroes.map((h) => (
          <div
            key={h.id}
            className={`grid grid-cols-[minmax(0,1.9fr)_54px_82px_68px_68px_minmax(0,1.2fr)] items-center gap-2 px-3 py-2 text-xs ${
              h.isPlayer ? 'bg-amber-950/35' : ''
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <HeroPortrait hero={h.heroDef} size={34} />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-white truncate">{h.heroDef.name}</span>
                  {h.isPlayer && (
                    <span className="px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 text-[9px] font-black">
                      ANDA
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-slate-400 truncate">
                  {h.heroDef.roleLabel} · {h.lane.toUpperCase()}
                </p>
              </div>
            </div>

            <div className="text-center font-bold text-sky-200 tabular-nums">Thp {h.level}</div>

            <div className="text-center font-mono font-bold text-white tabular-nums">
              {h.kills} / {h.deaths} / {h.assists}
            </div>

            <div className="flex items-center justify-center gap-1 font-bold text-amber-300 tabular-nums">
              <Award className="w-3.5 h-3.5 shrink-0" />
              <span>{h.cardsEarned}</span>
            </div>

            <div className="flex items-center justify-center gap-1 font-semibold text-yellow-200 tabular-nums">
              <Coins className="w-3 h-3 text-amber-400 shrink-0" />
              <span>{h.gold}</span>
            </div>

            <div className="flex items-center gap-1 justify-end flex-wrap">
              {Array.from({ length: 6 }).map((_, idx) => {
                const itemId = h.items[idx];
                const item = itemId ? SHOP_ITEMS.find((s) => s.id === itemId) : null;
                return (
                  <div
                    key={idx}
                    title={item ? `${item.name} (${item.bonusSummary})` : 'Slot Kosong'}
                    className="w-6 h-6 rounded border border-slate-700/90 flex items-center justify-center"
                    style={{
                      backgroundColor: item ? `${item.color}24` : 'rgba(15, 23, 42, 0.75)',
                      borderColor: item ? item.color : undefined,
                    }}
                  >
                    {item ? <ItemIcon itemId={item.id} size={16} /> : <span className="text-[9px] text-slate-600">·</span>}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const ScoreboardModal: React.FC<ScoreboardModalProps> = ({ hud, onClose }) => {
  const blueHeroes = hud.heroStats.filter((h) => h.team === 'blue');
  const redHeroes = hud.heroStats.filter((h) => h.team === 'red');

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/82 p-3 sm:p-5">
      <div className="w-full max-w-5xl rounded-2xl bg-[#070e1e] border border-amber-500/40 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#0b152c] border-b border-slate-700/80">
          <div>
            <p className="text-[10px] font-bold tracking-[0.22em] text-amber-300 uppercase">
              STATISTIK PERLAWANAN 5V5
            </p>
            <h2 className="font-display text-lg sm:text-xl font-bold text-white">
              PAPAN SKOR K/D/A &amp; KAD KATA ADJEKTIF
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-3 px-3.5 py-1.5 rounded-lg bg-[#070e1e] border border-slate-700 text-xs font-bold tabular-nums">
              <span className="text-sky-300">BIRU {hud.blueTeamCards}</span>
              <span className="text-slate-400">|</span>
              <span className="font-mono text-amber-300">{formatTime(hud.gameTimeSec)}</span>
              <span className="text-slate-400">|</span>
              <span className="text-rose-300">{hud.redTeamCards} MERAH</span>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer"
              aria-label="Tutup Statistik"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Column Legend */}
        <div className="hidden sm:grid grid-cols-[minmax(0,1.9fr)_54px_82px_68px_68px_minmax(0,1.2fr)] gap-2 px-7 pt-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          <span>Hero</span>
          <span className="text-center">Tahap</span>
          <span className="text-center">K / D / A</span>
          <span className="text-center">Kad</span>
          <span className="text-center">Emas</span>
          <span className="text-right">Item Dibeli</span>
        </div>

        <div className="p-4 overflow-y-auto space-y-4">
          <TeamTable
            title="PASUKAN BIRU (SEKUTU)"
            team="blue"
            heroes={blueHeroes}
            totalCards={hud.blueTeamCards}
            totalKills={hud.blueTeamKills}
          />
          <TeamTable
            title="PASUKAN MERAH (MUSUH)"
            team="red"
            heroes={redHeroes}
            totalCards={hud.redTeamCards}
            totalKills={hud.redTeamKills}
          />
        </div>
      </div>
    </div>
  );
};
