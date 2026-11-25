import { useMemo, useState } from 'react';
import { Check, Home, Search, Shield, Sparkles, Swords, X, Zap } from 'lucide-react';
import { HERO_ROLES, HeroDefinition, HeroRoleId } from '../data/gameData';
import { HeroPortrait } from './HeroPortrait';
import { HeroPreviewCanvas } from './HeroPreviewCanvas';

interface HeroSelectionScreenProps {
  selectedHero: HeroDefinition;
  onSelectHero: (hero: HeroDefinition) => void;
  onLaunchBattle: () => void;
  onHome: () => void;
}

const ROLE_FILTERS: { id: 'all' | HeroRoleId; label: string }[] = [
  { id: 'all', label: `Semua (${HERO_ROLES.length})` },
  { id: 'tank', label: 'Tank' },
  { id: 'fighter', label: 'Fighter' },
  { id: 'assassin', label: 'Assassin' },
  { id: 'mage', label: 'Mage' },
  { id: 'marksman', label: 'Marksman' },
  { id: 'support', label: 'Support' },
];

export function HeroSelectionScreen({
  selectedHero,
  onSelectHero,
  onLaunchBattle,
  onHome,
}: HeroSelectionScreenProps) {
  const [roleFilter, setRoleFilter] = useState<'all' | HeroRoleId>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredHeroes = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return HERO_ROLES.filter((h) => {
      const roleMatch =
        roleFilter === 'all' || h.roleId === roleFilter || h.secondaryRoleId === roleFilter;
      if (!roleMatch) return false;
      if (!q) return true;
      return (
        h.name.toLowerCase().includes(q) ||
        h.title.toLowerCase().includes(q) ||
        h.roleLabel.toLowerCase().includes(q)
      );
    });
  }, [roleFilter, searchQuery]);

  const roleCounts = useMemo(() => {
    const counts: Record<HeroRoleId, number> = {
      tank: 0,
      fighter: 0,
      assassin: 0,
      mage: 0,
      marksman: 0,
      support: 0,
    };
    HERO_ROLES.forEach((h) => {
      counts[h.roleId]++;
      if (h.secondaryRoleId && h.secondaryRoleId !== h.roleId) {
        counts[h.secondaryRoleId]++;
      }
    });
    return counts;
  }, []);

  const difficultyColor =
    selectedHero.difficulty === 'Mudah'
      ? '#34d399'
      : selectedHero.difficulty === 'Sederhana'
        ? '#fbbf24'
        : '#f87171';

  return (
    <div className="fixed inset-0 z-30 bg-[#070b14]/95 flex flex-col justify-between p-3 sm:p-5 overflow-y-auto custom-scroll">
      {/* Top Header */}
      <div className="max-w-7xl w-full mx-auto flex items-center justify-between gap-4">
        <div>
          <div className="text-[11px] sm:text-xs font-bold text-amber-300 tracking-wider uppercase">
            LEGENDA KATA ADJEKTIF · 50 HEROES · PERTEMPURAN 5V5
          </div>
          <h1 className="font-display font-extrabold text-xl sm:text-3xl text-white">
            BARISAN {HERO_ROLES.length} WIRA LEGENDA
          </h1>
        </div>
        <button
          onClick={onHome}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/15 text-white text-xs sm:text-sm font-bold cursor-pointer transition-colors shrink-0"
        >
          <Home className="w-4 h-4 text-amber-300" />
          BUTANG HOME
        </button>
      </div>

      {/* Main Split: Interactive 3D Preview + 50-Hero Roster & Abilities */}
      <div className="max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-4 my-2.5 items-stretch">
        {/* Left: Interactive 3D Character Preview & Hero Identity */}
        <div className="lg:col-span-5 bg-[#0c1528] border border-amber-400/35 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center gap-3 relative z-10">
            <HeroPortrait hero={selectedHero} size={62} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
                <span style={{ color: selectedHero.appearance.accentColor }}>
                  {selectedHero.roleLabel}
                </span>
                <span className="text-slate-500">·</span>
                <span style={{ color: difficultyColor }}>Tahap: {selectedHero.difficulty}</span>
                <span className="text-slate-500">·</span>
                <span className="text-sky-300 font-mono-num">
                  Mana {selectedHero.roleId === 'mage' || selectedHero.roleId === 'support' ? 440 : selectedHero.roleId === 'marksman' || selectedHero.roleId === 'assassin' ? 320 : 280}
                </span>
              </div>
              <h2 className="font-display font-extrabold text-2xl text-white truncate">
                {selectedHero.name}
              </h2>
              <div className="text-xs text-slate-300 font-medium">{selectedHero.title}</div>
            </div>
          </div>

          <div className="flex-1 min-h-[260px] sm:min-h-[310px] my-1 relative z-10">
            <HeroPreviewCanvas hero={selectedHero} />
          </div>

          <div className="bg-slate-900/90 border border-white/10 rounded-xl p-3 text-xs space-y-1.5 relative z-10">
            <p className="text-slate-200 leading-relaxed">{selectedHero.description}</p>
            <div className="text-emerald-300 font-semibold">
              Kelebihan: <span className="text-slate-200 font-normal">{selectedHero.advantage}</span>
            </div>
          </div>
        </div>

        {/* Right: Role Filter Tabs + Search + 50 Hero Grid + Stats + Passive + 4 Abilities */}
        <div className="lg:col-span-7 flex flex-col justify-between gap-2.5">
          {/* Role Filter Bar & Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex flex-wrap gap-1.5">
              {ROLE_FILTERS.map((rf) => {
                const active = roleFilter === rf.id;
                const countText =
                  rf.id === 'all' ? rf.label : `${rf.label} (${roleCounts[rf.id]})`;
                return (
                  <button
                    key={rf.id}
                    type="button"
                    onClick={() => setRoleFilter(rf.id)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      active
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-[#0c1528] border border-white/10 text-slate-300 hover:border-white/30 hover:text-white'
                    }`}
                  >
                    {countText}
                  </button>
                );
              })}
            </div>

            <div className="relative sm:w-52 shrink-0">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari wira..."
                aria-label="Cari nama wira"
                className="w-full pl-8 pr-7 py-1.5 rounded-lg bg-[#0c1528] border border-white/15 focus:border-amber-400 text-xs text-white placeholder:text-slate-400 outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                  aria-label="Kosongkan carian"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Scrollable 50-Hero Roster Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-5 gap-2 max-h-[230px] overflow-y-auto custom-scroll pr-1">
            {filteredHeroes.length === 0 ? (
              <div className="col-span-full py-8 text-center text-xs text-slate-400 bg-[#0c1528] border border-white/10 rounded-xl">
                Tiada wira sepadan dengan carian &ldquo;{searchQuery}&rdquo;.
              </div>
            ) : (
              filteredHeroes.map((hero) => {
                const active = hero.id === selectedHero.id;
                return (
                  <button
                    key={hero.id}
                    onClick={() => onSelectHero(hero)}
                    className={`p-2 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 ${
                      active
                        ? 'bg-amber-500/20 border-amber-400 shadow-lg ring-1 ring-amber-400/50'
                        : 'bg-[#0c1528] border-white/10 hover:border-white/30'
                    }`}
                  >
                    <HeroPortrait hero={hero} size={36} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-display font-bold text-xs text-white truncate">
                          {hero.name}
                        </span>
                        {active && <Check className="w-3.5 h-3.5 text-amber-300 shrink-0" />}
                      </div>
                      <div className="text-[10px] font-semibold text-slate-400 truncate">
                        {hero.roleLabel}
                      </div>
                      <div className="text-[9px] text-slate-400">{hero.difficulty}</div>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Stats, Passive & Skills Card */}
          <div className="bg-[#0c1528] border border-white/15 rounded-2xl p-3.5 space-y-2.5 flex-1">
            {/* Stat Bars */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatMeter
                label="HP"
                value={selectedHero.displayRatings.hp}
                numeric={selectedHero.baseStats.hp}
                color="#10b981"
              />
              <StatMeter
                label="Serangan"
                value={selectedHero.displayRatings.damage}
                numeric={selectedHero.baseStats.damage}
                color="#ef4444"
              />
              <StatMeter
                label="Kelajuan"
                value={selectedHero.displayRatings.speed}
                numeric={selectedHero.baseStats.speed}
                color="#38bdf8"
              />
              <StatMeter
                label="Pertahanan"
                value={selectedHero.displayRatings.defense}
                numeric={selectedHero.baseStats.defense}
                color="#f59e0b"
              />
            </div>

            {/* Passive */}
            <div className="bg-slate-900/85 border border-amber-400/25 rounded-xl px-3.5 py-2 text-xs">
              <div className="font-bold text-amber-300">
                Pasif Wira · {selectedHero.passive.name}
              </div>
              <div className="text-slate-200 mt-0.5">{selectedHero.passive.description}</div>
            </div>

            {/* 4 Hero-Specific Skills */}
            <div>
              <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wide mb-1.5">
                Set Kemahiran Khas {selectedHero.name}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <SkillCard
                  icon={<Swords className="w-3.5 h-3.5" />}
                  skill={selectedHero.skills.basic}
                />
                <SkillCard
                  icon={<Zap className="w-3.5 h-3.5" />}
                  skill={selectedHero.skills.skill1}
                />
                <SkillCard
                  icon={<Shield className="w-3.5 h-3.5" />}
                  skill={selectedHero.skills.skill2}
                />
                <SkillCard
                  icon={<Sparkles className="w-3.5 h-3.5" />}
                  skill={selectedHero.skills.ultimate}
                />
              </div>
            </div>
          </div>

          {/* Launch Battle CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-300">
              Wira dipilih mengetuai Pasukan Biru (5V5) — tumbangkan hero lawan untuk +1 Kad Kata Adjektif &amp; musnahkan Kubu Utama musuh!
            </div>
            <button
              onClick={onLaunchBattle}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-display font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 cursor-pointer shadow-xl transition-transform active:scale-95 shrink-0"
            >
              <Swords className="w-5 h-5" />
              MASUK MEDAN 5V5!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatMeter({
  label,
  value,
  numeric,
  color,
}: {
  label: string;
  value: number;
  numeric: number;
  color: string;
}) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-slate-300 font-medium">{label}</span>
        <span className="font-mono-num font-bold text-white">{numeric}</span>
      </div>
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function SkillCard({
  icon,
  skill,
}: {
  icon: React.ReactNode;
  skill: { key: string; name: string; description: string; cooldown: number; color: string };
}) {
  return (
    <div className="bg-slate-900/85 border border-white/10 rounded-xl p-2.5">
      <div className="flex items-center justify-between font-bold text-white mb-1 gap-2">
        <span className="flex items-center gap-1.5 truncate" style={{ color: skill.color }}>
          {icon}
          <span className="truncate">{skill.name}</span>
        </span>
        <span className="font-mono-num text-[10px] text-slate-400 shrink-0">
          {skill.key} · {skill.cooldown}s
        </span>
      </div>
      <p className="text-[11px] text-slate-300 leading-snug">{skill.description}</p>
    </div>
  );
}
