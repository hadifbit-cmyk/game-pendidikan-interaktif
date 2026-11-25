import { useState } from 'react';
import {
  Award,
  BookOpen,
  CheckCircle2,
  Coins,
  Crown,
  Home,
  Lock,
  Mic,
  Play,
  RotateCcw,
  Settings,
  Shield,
  ShoppingBag,
  Sparkles,
  Swords,
  Trash2,
  Volume2,
  X,
} from 'lucide-react';
import {
  ACHIEVEMENTS,
  ADJECTIVE_CARDS,
  AdjectiveCategory,
  HeroDefinition,
  ItemCategory,
  SHOP_ITEMS,
} from '../data/gameData';
import { AwardMedal, HudSnapshot, MatchHeroStats } from '../game/hudTypes';
import { SoundSettings } from '../game/soundEngine';
import { HeroPortrait } from './HeroPortrait';
import { ItemIcon } from './ItemIcon';

const CATEGORIES: AdjectiveCategory[] = [
  'Kata Adjektif Jarak',
  'Kata Adjektif Perasaan',
  'Kata Adjektif Pancaindera',
];

const SHOP_CATEGORIES: ('Semua' | ItemCategory)[] = [
  'Semua',
  'Serangan',
  'Pertahanan',
  'Sihir',
  'Pergerakan',
  'Pemulihan',
  'Khas',
];

function formatDuration(sec: number): string {
  const s = Math.max(0, Math.floor(sec));
  const hrs = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const rem = s % 60;
  return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
}

export function ShopModal({
  hud,
  onBuyItem,
  onSellItem,
  onClose,
}: {
  hud: HudSnapshot;
  onBuyItem: (itemId: string) => void;
  onSellItem: (slotIndex: number) => void;
  onClose: () => void;
}) {
  const [selectedCategory, setSelectedCategory] = useState<'Semua' | ItemCategory>('Semua');

  const filteredItems =
    selectedCategory === 'Semua'
      ? SHOP_ITEMS
      : SHOP_ITEMS.filter((item) => item.category === selectedCategory);

  const slotsFull = hud.equippedItemIds.length >= 6;

  return (
    <ModalShell
      title="Kedai Item Land of Dawn"
      icon={<ShoppingBag className="w-5 h-5 text-amber-400" />}
      onClose={onClose}
      wide
    >
      {/* Gold & Live Hero Stats */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900/90 border border-amber-400/25 rounded-xl p-3 mb-3 text-xs">
        <div className="flex items-center gap-3 font-mono-num">
          <span className="flex items-center gap-1.5 text-amber-300 font-bold text-sm">
            <Coins className="w-4 h-4" /> Emas: {hud.gold}
          </span>
          <span className="text-slate-400">·</span>
          <span className="text-emerald-300 font-semibold">Posyen: {hud.potions}/6</span>
        </div>
        <div className="text-[11px] text-slate-200 font-mono-num flex flex-wrap gap-x-3 gap-y-1">
          <span>Serangan {hud.damage}</span>
          <span>HP {hud.maxHp}</span>
          <span>Pertahanan {hud.defense}</span>
          <span>Laju {hud.speed}</span>
          <span>Krit {hud.critChance}%</span>
          <span>Lifesteal {hud.lifesteal}%</span>
        </div>
      </div>

      {/* 6 Equipped Item Slots */}
      <div className="mb-3">
        <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wide mb-1.5">
          Item Dipasang ({hud.equippedItemIds.length}/6 Slot) — Klik ikon tong sampah untuk jual (60% emas)
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
          {Array.from({ length: 6 }).map((_, idx) => {
            const id = hud.equippedItemIds[idx];
            const item = id ? SHOP_ITEMS.find((s) => s.id === id) : null;
            return (
              <div
                key={idx}
                className={`rounded-xl border p-2 min-h-[54px] flex items-center justify-between gap-1 ${
                  item ? 'bg-slate-900 border-white/20' : 'bg-slate-950/60 border-white/10'
                }`}
                style={item ? { borderColor: item.color } : undefined}
              >
                {item ? (
                  <>
                    <div
                      className="w-7 h-7 rounded-lg border flex items-center justify-center shrink-0"
                      style={{ borderColor: item.color, backgroundColor: `${item.color}22` }}
                    >
                      <ItemIcon itemId={item.id} size={20} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] font-bold text-white truncate">{item.name}</div>
                      <div className="text-[9px] text-emerald-300 truncate">{item.bonusSummary}</div>
                    </div>
                    <button
                      onClick={() => onSellItem(idx)}
                      className="p-1 rounded bg-rose-950/80 hover:bg-rose-800 text-rose-300 cursor-pointer shrink-0"
                      title={`Jual (+${Math.round(item.price * 0.6)} Emas)`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                ) : (
                  <span className="text-[10px] text-slate-500 mx-auto">Slot {idx + 1}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {SHOP_CATEGORIES.map((cat) => {
          const active = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                active
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[42vh] overflow-y-auto custom-scroll pr-1">
        {filteredItems.map((item) => {
          const isPotionFull = Boolean(item.consumable && hud.potions >= 6);
          const isSlotsBlocked = !item.consumable && slotsFull;
          const canAfford = hud.gold >= item.price && !isPotionFull && !isSlotsBlocked;

          return (
            <div
              key={item.id}
              className="flex flex-col justify-between bg-slate-900/85 border border-white/10 rounded-xl p-3"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-8 h-8 rounded-lg border flex items-center justify-center shrink-0"
                      style={{ borderColor: item.color, backgroundColor: `${item.color}20` }}
                    >
                      <ItemIcon itemId={item.id} size={22} />
                    </div>
                    <h4 className="font-display font-bold text-white text-sm truncate">
                      {item.name}
                    </h4>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400 shrink-0">
                    {item.category}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1">{item.description}</p>
                <div className="text-[11px] font-semibold text-emerald-300 mt-1">
                  {item.bonusSummary}
                </div>
              </div>

              <button
                onClick={() => onBuyItem(item.id)}
                disabled={!canAfford}
                className="mt-2.5 w-full py-2 px-3 rounded-lg font-bold text-xs transition-colors cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed bg-amber-500 hover:bg-amber-400 text-slate-950"
              >
                {isPotionFull
                  ? 'STOK POSYEN PENUH'
                  : isSlotsBlocked
                    ? '6/6 SLOT PENUH'
                    : `Beli (${item.price} Emas)`}
              </button>
            </div>
          );
        })}
      </div>
    </ModalShell>
  );
}

export function AdjectiveBookModal({
  collectedIds,
  onClose,
}: {
  collectedIds: string[];
  onClose: () => void;
}) {
  const count = collectedIds.length;
  return (
    <ModalShell
      title={`Koleksi Kad Kata Adjektif (${count}/10)`}
      icon={<BookOpen className="w-5 h-5 text-indigo-400" />}
      onClose={onClose}
    >
      <div className="mb-4">
        <div className="flex justify-between text-xs font-bold text-amber-300 mb-1.5">
          <span>ADJEKTIF DIKUMPUL: {count}/10</span>
          <span className="font-mono-num">{Math.round((count / 10) * 100)}%</span>
        </div>
        <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden border border-white/10">
          <div
            className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 transition-all duration-300"
            style={{ width: `${(count / 10) * 100}%` }}
          />
        </div>
      </div>

      <div className="space-y-4 max-h-[55vh] overflow-y-auto custom-scroll pr-1">
        {CATEGORIES.map((cat) => {
          const cards = ADJECTIVE_CARDS.filter((c) => c.category === cat);
          return (
            <div key={cat} className="bg-slate-900/75 border border-white/10 rounded-xl p-3.5">
              <h4 className="font-display font-bold text-sm text-amber-300 mb-2.5 uppercase tracking-wide">
                {cat}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {cards.map((card) => {
                  const unlocked = collectedIds.includes(card.id);
                  return (
                    <div
                      key={card.id}
                      className={`rounded-xl p-3 border ${
                        unlocked
                          ? 'bg-slate-800/90 border-amber-400/40'
                          : 'bg-slate-950/60 border-white/5 opacity-65'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-display font-bold text-base text-white">
                          {unlocked ? card.word : '??? (Belum Dikutip)'}
                        </span>
                        {unlocked ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <Lock className="w-4 h-4 text-slate-500 shrink-0" />
                        )}
                      </div>
                      {unlocked ? (
                        <>
                          <p className="text-xs text-slate-300 mt-1">{card.meaning}</p>
                          <p className="text-[11px] text-amber-200/90 mt-1.5 italic">
                            &ldquo;{card.exampleSentence}&rdquo;
                          </p>
                        </>
                      ) : (
                        <p className="text-xs text-slate-400 mt-1">
                          Tumbangkan hero musuh dalam pertempuran 5V5 untuk memenangi kad kata adjektif ini secara rawak!
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </ModalShell>
  );
}

export function AchievementsModal({
  unlockedIds,
  onClose,
}: {
  unlockedIds: string[];
  onClose: () => void;
}) {
  return (
    <ModalShell
      title={`Pencapaian Wira (${unlockedIds.length}/${ACHIEVEMENTS.length})`}
      icon={<Award className="w-5 h-5 text-amber-400" />}
      onClose={onClose}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[58vh] overflow-y-auto custom-scroll pr-1">
        {ACHIEVEMENTS.map((ach) => {
          const unlocked = unlockedIds.includes(ach.id);
          return (
            <div
              key={ach.id}
              className={`rounded-xl p-3.5 border flex items-start gap-3 ${
                unlocked
                  ? 'bg-amber-500/15 border-amber-400/60'
                  : 'bg-slate-900/70 border-white/10 opacity-65'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                  unlocked ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-500'
                }`}
              >
                {ach.iconName === 'crown' ? (
                  <Crown className="w-5 h-5" />
                ) : ach.iconName === 'book' ? (
                  <BookOpen className="w-5 h-5" />
                ) : ach.iconName === 'shield' ? (
                  <Shield className="w-5 h-5" />
                ) : ach.iconName === 'sparkles' ? (
                  <Sparkles className="w-5 h-5" />
                ) : (
                  <Swords className="w-5 h-5" />
                )}
              </div>
              <div>
                <div className="font-display font-bold text-sm text-white">{ach.title}</div>
                <p className="text-xs text-slate-300 mt-0.5">{ach.description}</p>
                <div className="text-[11px] font-bold mt-1.5 text-amber-300">
                  {unlocked ? 'Telah Dicapai' : 'Belum Dibuka'}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </ModalShell>
  );
}

export function SettingsModal({
  soundSettings,
  showTouchControls,
  onUpdateSound,
  onToggleTouchControls,
  onHome,
  onClose,
}: {
  soundSettings: SoundSettings;
  showTouchControls: boolean;
  onUpdateSound: (partial: Partial<SoundSettings>) => void;
  onToggleTouchControls: () => void;
  onHome: () => void;
  onClose: () => void;
}) {
  return (
    <ModalShell
      title="Tetapan Permainan"
      icon={<Settings className="w-5 h-5 text-sky-400" />}
      onClose={onClose}
    >
      <div className="space-y-4">
        <div className="bg-slate-900/80 border border-white/10 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-sm text-white flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-amber-300" />
              Bunyi Permainan
            </span>
            <button
              onClick={() => onUpdateSound({ muted: !soundSettings.muted })}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                soundSettings.muted
                  ? 'bg-rose-600 text-white'
                  : 'bg-emerald-500 text-slate-950'
              }`}
            >
              {soundSettings.muted ? 'DISENYAPKAN' : 'AKTIF'}
            </button>
          </div>

          <VolumeSlider
            label="Kelantangan Utama"
            value={soundSettings.masterVolume}
            onChange={(v) => onUpdateSound({ masterVolume: v })}
          />
          <VolumeSlider
            label="Muzik Latar & Suasana"
            value={soundSettings.musicVolume}
            onChange={(v) => onUpdateSound({ musicVolume: v })}
          />
          <VolumeSlider
            label="Kesan Bunyi Pertempuran"
            value={soundSettings.sfxVolume}
            onChange={(v) => onUpdateSound({ sfxVolume: v })}
          />
        </div>

        {/* Announcer Voice Settings */}
        <div className="bg-slate-900/80 border border-white/10 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <span className="font-semibold text-sm text-white flex items-center gap-2">
                <Mic className="w-4 h-4 text-sky-300" />
                Suara Pengulas Medan (Announcer)
              </span>
              <p className="text-xs text-slate-400 mt-0.5">
                Pengumuman suara Bahasa Inggeris untuk kill streak, menara roboh, The Lord tiba &amp; kemenangan.
              </p>
            </div>
            <button
              onClick={() => onUpdateSound({ announcerEnabled: !soundSettings.announcerEnabled })}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer shrink-0 transition-colors ${
                soundSettings.announcerEnabled
                  ? 'bg-sky-500 text-slate-950'
                  : 'bg-slate-800 text-slate-300'
              }`}
            >
              {soundSettings.announcerEnabled ? 'AKTIF' : 'DIMATIKAN'}
            </button>
          </div>

          <VolumeSlider
            label="Kelantangan Pengulas"
            value={soundSettings.announcerVolume}
            onChange={(v) => onUpdateSound({ announcerVolume: v })}
          />
        </div>

        <div className="bg-slate-900/80 border border-white/10 rounded-xl p-4 flex items-center justify-between gap-3">
          <div>
            <div className="font-semibold text-sm text-white">Kawalan Kayu Riadah Sentuh</div>
            <div className="text-xs text-slate-400">
              Paparkan kayu riadah maya di skrin untuk telefon pintar atau tablet.
            </div>
          </div>
          <button
            onClick={onToggleTouchControls}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold cursor-pointer shrink-0 transition-colors ${
              showTouchControls ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-200'
            }`}
          >
            {showTouchControls ? 'DIPAPARKAN' : 'DISEMBUNYIKAN'}
          </button>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onHome}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold cursor-pointer transition-colors"
          >
            <Home className="w-4 h-4" />
            BUTANG HOME
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold cursor-pointer transition-colors"
          >
            Simpan &amp; Tutup
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

function VolumeSlider({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex justify-between text-xs text-slate-300 mb-1">
        <span>{label}</span>
        <span className="font-mono-num">{Math.round(value * 100)}%</span>
      </div>
      <input
        type="range"
        min={0}
        max={1}
        step={0.05}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-amber-400 cursor-pointer"
      />
    </div>
  );
}

export function HowToPlayModal({ onHome, onClose }: { onHome: () => void; onClose: () => void }) {
  return (
    <ModalShell
      title="Cara Bermain Legenda Kata Adjektif"
      icon={<BookOpen className="w-5 h-5 text-emerald-400" />}
      onClose={onClose}
    >
      <div className="space-y-3 text-xs sm:text-sm text-slate-200 max-h-[60vh] overflow-y-auto custom-scroll pr-1">
        <div className="bg-slate-900/80 border border-white/10 rounded-xl p-3.5">
          <h4 className="font-display font-bold text-amber-300 mb-1">1. Pertempuran MOBA 5V5 Penuh</h4>
          <p>
            Pilih seorang wira daripada <strong className="text-white">50 hero legenda</strong> untuk menyertai{' '}
            <strong className="text-sky-300">Pasukan Biru (Anda + 4 Sekutu AI)</strong> menentang{' '}
            <strong className="text-rose-300">Pasukan Merah (5 Hero Musuh AI)</strong>! Bertempur secara strategik, beli item, robohkan menara berperisai dan musnahkan <strong className="text-amber-300">Kubu Utama (Nexus)</strong> lawan untuk menang!
          </p>
        </div>
        <div className="bg-slate-900/80 border border-amber-400/35 rounded-xl p-3.5">
          <h4 className="font-display font-bold text-amber-300 mb-1">2. Tumbangan Hero Memberi Kad Kata Adjektif</h4>
          <p>
            Setiap kali anda menumbangkan hero lawan, anda memperoleh{' '}
            <strong className="text-amber-300">+1 Kad Kata Adjektif Tahun 3</strong> (Kategori{' '}
            <strong>Jarak, Perasaan &amp; Pancaindera</strong>) yang dipaparkan di tengah skrin! Kumpul kesemua 10 kata adjektif sambil memimpin pasukan menuju kemenangan.
          </p>
        </div>
        <div className="bg-slate-900/80 border border-white/10 rounded-xl p-3.5">
          <h4 className="font-display font-bold text-sky-300 mb-1">3. Lorong, Menara, Sungai Kristal &amp; Statistik</h4>
          <p>
            Bertempur di <strong className="text-white">Lorong EXP, Tengah &amp; Emas</strong>, rebut{' '}
            <strong className="text-rose-300">Red Buff</strong>, <strong className="text-sky-300">Blue Buff</strong>,{' '}
            <strong className="text-emerald-300">Turtle</strong> dan <strong className="text-purple-300">The Lord</strong> untuk kelebihan tempur &amp; emas item. Tekan <strong className="text-white">V</strong> atau butang <strong className="text-amber-300">Statistik</strong> untuk memantau papan skor K/D/A.
          </p>
          <p className="mt-1.5">
            <strong>Kawalan:</strong> <strong className="text-white">WASD</strong> gerak ·{' '}
            <strong className="text-white">Klik Kiri / SERANG</strong> auto-serang ·{' '}
            <strong className="text-white">Q, E, R</strong> kemahiran khas ·{' '}
            <strong className="text-white">Space</strong> elak ·{' '}
            <strong className="text-white">F</strong> posyen ·{' '}
            <strong className="text-white">B</strong> kedai ·{' '}
            <strong className="text-white">V</strong> statistik.
          </p>
        </div>
        <div className="bg-slate-900/80 border border-emerald-400/30 rounded-xl p-3.5">
          <h4 className="font-display font-bold text-emerald-300 mb-1">4. Anugerah MVP, GOLD, SILVER &amp; BRONZE</h4>
          <p>
            Di penghujung perlawanan, semua 10 hero dinilai berdasarkan Bunuh, Bantuan (Assist), Kad Kata Adjektif, Kerosakan &amp; Ketahanan untuk memenangi pingat <strong className="text-amber-300">MVP</strong>, <strong className="text-yellow-300">GOLD</strong>, <strong className="text-slate-200">SILVER</strong> atau <strong className="text-orange-300">BRONZE</strong>!
          </p>
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <button
          onClick={onHome}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold cursor-pointer"
        >
          <Home className="w-4 h-4" />
          BUTANG HOME
        </button>
        <button
          onClick={onClose}
          className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold cursor-pointer"
        >
          Faham!
        </button>
      </div>
    </ModalShell>
  );
}

export function PauseModal({
  onResume,
  onSettings,
  onRestart,
  onHome,
}: {
  onResume: () => void;
  onSettings: () => void;
  onRestart: () => void;
  onHome: () => void;
}) {
  return (
    <div className="fixed inset-0 z-40 bg-slate-950/80 flex items-center justify-center p-4">
      <div className="bg-[#0b1326] border border-amber-400/40 rounded-2xl p-6 w-full max-w-sm shadow-2xl text-center">
        <h2 className="font-display font-extrabold text-2xl text-white mb-1">PERMAINAN DIJEDA</h2>
        <p className="text-xs text-slate-300 mb-5">Pengembaraan Land of Dawn dihentikan sementara.</p>

        <div className="flex flex-col gap-2.5">
          <button
            onClick={onResume}
            className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-display font-bold text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <Play className="w-4 h-4" />
            TERUSKAN PERMAINAN
          </button>
          <button
            onClick={onSettings}
            className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-display font-bold text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <Settings className="w-4 h-4" />
            TETAPAN
          </button>
          <button
            onClick={onRestart}
            className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-display font-bold text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            ULANG PERMAINAN
          </button>
          <button
            onClick={onHome}
            className="w-full py-3 rounded-xl bg-rose-950/70 hover:bg-rose-900 border border-rose-500/40 text-rose-100 font-display font-bold text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <Home className="w-4 h-4" />
            KEMBALI KE MENU UTAMA
          </button>
        </div>
      </div>
    </div>
  );
}

function AwardBadge({ award }: { award?: AwardMedal }) {
  if (!award) return null;
  if (award === 'MVP') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 font-black text-[10px] tracking-wider shadow">
        <Crown className="w-3 h-3" />
        MVP
      </span>
    );
  }
  if (award === 'GOLD') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded bg-yellow-400/25 border border-yellow-300/70 text-yellow-200 font-extrabold text-[10px] tracking-wider">
        GOLD
      </span>
    );
  }
  if (award === 'SILVER') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-300/20 border border-slate-300/60 text-slate-200 font-extrabold text-[10px] tracking-wider">
        SILVER
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded bg-orange-500/20 border border-orange-400/60 text-orange-300 font-extrabold text-[10px] tracking-wider">
      BRONZE
    </span>
  );
}

function ResultsTeamTable({
  title,
  team,
  heroes,
}: {
  title: string;
  team: 'blue' | 'red';
  heroes: MatchHeroStats[];
}) {
  const isBlue = team === 'blue';
  return (
    <div
      className={`rounded-xl border overflow-hidden ${
        isBlue ? 'bg-[#091429] border-sky-500/40' : 'bg-[#1b0d17] border-rose-500/40'
      }`}
    >
      <div
        className={`flex items-center justify-between px-3.5 py-2 border-b text-xs font-bold ${
          isBlue
            ? 'bg-sky-950/60 border-sky-500/30 text-sky-300'
            : 'bg-rose-950/60 border-rose-500/30 text-rose-300'
        }`}
      >
        <span>{title}</span>
        <span className="text-[10px] text-slate-300 uppercase tracking-wider">K/D/A · Kad · Pingat</span>
      </div>
      <div className="divide-y divide-slate-800/80">
        {heroes.map((h) => (
          <div
            key={h.id}
            className={`flex items-center justify-between gap-2 px-3 py-2 text-xs ${
              h.isPlayer ? 'bg-amber-950/40' : ''
            }`}
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <HeroPortrait hero={h.heroDef} size={32} />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-white truncate">{h.heroDef.name}</span>
                  {h.isPlayer && (
                    <span className="px-1 py-0.5 rounded bg-amber-400 text-slate-950 text-[8.5px] font-black shrink-0">
                      ANDA
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  {h.heroDef.roleLabel} · {h.lane.toUpperCase()} · Thp {h.level}
                </div>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-0.5 shrink-0">
              {h.items.slice(0, 6).map((itemId, idx) => {
                const it = SHOP_ITEMS.find((s) => s.id === itemId);
                if (!it) return null;
                return (
                  <div
                    key={`${itemId}-${idx}`}
                    title={it.name}
                    className="w-5 h-5 rounded border flex items-center justify-center bg-slate-950/85"
                    style={{ borderColor: it.color }}
                  >
                    <ItemIcon itemId={it.id} size={13} />
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-2.5 shrink-0 font-mono-num">
              <span className="text-white font-bold">
                {h.kills}/{h.deaths}/{h.assists}
              </span>
              <span className="text-amber-300 font-bold w-10 text-right">{h.cardsEarned} Kad</span>
              <div className="w-16 flex justify-end">
                <AwardBadge award={h.award} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MatchResultsModal({
  hero,
  hud,
  onPlayAgain,
  onHome,
}: {
  hero: HeroDefinition;
  hud: HudSnapshot | null;
  onPlayAgain: () => void;
  onHome: () => void;
}) {
  const result = hud?.matchResult;
  const isVictory = result ? result.winnerTeam === 'blue' : true;
  const confettiColors = ['#fbbf24', '#38bdf8', '#f472b6', '#34d399', '#a78bfa', '#f97316'];

  const standings = result?.standings ?? hud?.heroStats ?? [];
  const blueHeroes = standings.filter((h) => h.team === 'blue');
  const redHeroes = standings.filter((h) => h.team === 'red');
  const playerRow = standings.find((h) => h.isPlayer);
  const collectedIds = hud?.collectedCardIds ?? [];

  return (
    <div className="fixed inset-0 z-40 pointer-events-auto flex items-center justify-center p-3 sm:p-5 overflow-y-auto bg-gradient-to-b from-slate-950/60 via-slate-950/85 to-slate-950/95">
      {isVictory && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 26 }).map((_, idx) => (
            <div
              key={idx}
              className="absolute w-2.5 h-4 rounded-sm"
              style={{
                left: `${(idx * 3.8) % 100}%`,
                top: '-5%',
                backgroundColor: confettiColors[idx % confettiColors.length],
                animation: `confettiFall ${2.6 + (idx % 5) * 0.45}s linear ${(idx % 7) * 0.25}s infinite`,
              }}
            />
          ))}
        </div>
      )}

      <div
        className={`animate-card-pop relative bg-[#091122]/98 border-2 rounded-2xl p-4 sm:p-6 w-full max-w-5xl shadow-2xl my-auto ${
          isVictory ? 'border-amber-400' : 'border-rose-500/80'
        }`}
      >
        {/* Top Outcome Header */}
        <div className="text-center mb-4">
          <div className="text-[11px] font-bold tracking-[0.22em] text-amber-300 uppercase mb-1.5">
            LEGENDA KATA ADJEKTIF · 5V5 BATTLE ARENA
          </div>
          <div
            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-lg font-display font-extrabold text-xs tracking-wider mb-2 ${
              isVictory ? 'bg-amber-400 text-slate-950' : 'bg-rose-600 text-white'
            }`}
          >
            <Crown className="w-4 h-4" />
            {isVictory ? 'VICTORY — KEMENANGAN PASUKAN BIRU!' : 'DEFEAT — KUBU SEKUTU MUSNAH'}
          </div>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white">
            KEPUTUSAN PERTEMPURAN 5V5
          </h2>
          {result && <p className="text-xs sm:text-sm text-slate-300 mt-1">{result.winReason}</p>}
        </div>

        {/* Team Score Banner + Player Highlight */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 mb-4">
          <div className="lg:col-span-5 flex items-center justify-between gap-3 bg-slate-900/90 border border-white/10 rounded-xl p-3.5">
            <div className="text-center flex-1">
              <div className="text-[10px] font-bold text-sky-300 uppercase">Pasukan Biru</div>
              <div className="font-mono-num font-extrabold text-3xl text-sky-300">
                {result?.blueCards ?? hud?.blueTeamCards ?? 0}
              </div>
              <div className="text-[11px] text-slate-300">
                Kad · {result?.blueKills ?? hud?.blueTeamKills ?? 0} Bunuh
              </div>
            </div>

            <div className="text-center px-2">
              <div className="text-[10px] font-bold text-amber-300 uppercase">Tempoh</div>
              <div className="font-mono-num font-bold text-sm text-white">
                {formatDuration(result?.durationSec ?? hud?.gameTimeSec ?? 0)}
              </div>
            </div>

            <div className="text-center flex-1">
              <div className="text-[10px] font-bold text-rose-300 uppercase">Pasukan Merah</div>
              <div className="font-mono-num font-extrabold text-3xl text-rose-300">
                {result?.redCards ?? hud?.redTeamCards ?? 0}
              </div>
              <div className="text-[11px] text-slate-300">
                Kad · {result?.redKills ?? hud?.redTeamKills ?? 0} Bunuh
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 flex flex-col justify-between gap-2.5 bg-slate-900/90 border border-amber-400/35 rounded-xl p-3.5">
            <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <HeroPortrait hero={hero} size={52} />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-display font-extrabold text-lg text-white truncate">
                      {hero.name}
                    </span>
                    <AwardBadge award={playerRow?.award} />
                  </div>
                  <div className="text-xs text-slate-300 truncate">
                    {hero.roleLabel} · Tahap {playerRow?.level ?? hud?.level ?? 1}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3 text-center text-xs font-mono-num shrink-0">
                <div>
                  <div className="text-[10px] text-slate-400">K / D / A</div>
                  <div className="font-extrabold text-white">
                    {playerRow?.kills ?? 0}/{playerRow?.deaths ?? 0}/{playerRow?.assists ?? 0}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Kad Anda</div>
                  <div className="font-extrabold text-amber-300">{playerRow?.cardsEarned ?? 0}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Emas</div>
                  <div className="font-extrabold text-yellow-300">
                    {hud?.totalGoldEarned ?? playerRow?.gold ?? hud?.gold ?? 0}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Kerosakan</div>
                  <div className="font-extrabold text-sky-300">{playerRow?.damageDealt ?? 0}</div>
                </div>
              </div>
            </div>

            {/* Player Purchased Items Row */}
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/10">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Item Dibeli Anda
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {Array.from({ length: 6 }).map((_, idx) => {
                  const itemId = (playerRow?.items ?? hud?.equippedItemIds ?? [])[idx];
                  const item = itemId ? SHOP_ITEMS.find((s) => s.id === itemId) : null;
                  return (
                    <div
                      key={idx}
                      title={item ? `${item.name} (${item.bonusSummary})` : 'Slot Kosong'}
                      className="w-7 h-7 rounded-lg border border-slate-700/90 flex items-center justify-center bg-slate-950/80"
                      style={item ? { borderColor: item.color, backgroundColor: `${item.color}22` } : undefined}
                    >
                      {item ? <ItemIcon itemId={item.id} size={18} /> : <span className="text-[9px] text-slate-600">·</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Full 10-Hero 5V5 Standings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-4 max-h-[38vh] overflow-y-auto custom-scroll pr-1">
          <ResultsTeamTable title="PASUKAN BIRU (SEKUTU)" team="blue" heroes={blueHeroes} />
          <ResultsTeamTable title="PASUKAN MERAH (MUSUH)" team="red" heroes={redHeroes} />
        </div>

        {/* Collected Unique Kata Adjektif Review */}
        <div className="bg-slate-900/80 border border-white/10 rounded-xl p-3 mb-4">
          <div className="flex items-center justify-between text-xs font-bold text-amber-300 mb-2">
            <span>KATA ADJEKTIF DIPEROLEH ANDA ({collectedIds.length}/10 Jenis Unik)</span>
            <span className="text-[11px] text-slate-300">
              Pencapaian: {hud?.unlockedAchievements.length ?? 0}/{ACHIEVEMENTS.length}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-left">
            {CATEGORIES.map((cat) => {
              const words = ADJECTIVE_CARDS.filter((c) => c.category === cat);
              return (
                <div key={cat} className="bg-slate-950/60 border border-white/10 rounded-lg p-2">
                  <div className="text-[10px] font-bold text-slate-300 uppercase mb-1">{cat}</div>
                  <div className="flex flex-wrap gap-1.5">
                    {words.map((w) => {
                      const got = collectedIds.includes(w.id);
                      return (
                        <span
                          key={w.id}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold ${
                            got
                              ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/40'
                              : 'bg-slate-800/70 text-slate-400'
                          }`}
                        >
                          {got && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                          {w.word}
                        </span>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onPlayAgain}
            className="flex-1 py-3 px-5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-display font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            MAIN SEMULA
          </button>
          <button
            onClick={onHome}
            className="flex-1 py-3 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-display font-bold text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <Home className="w-4 h-4" />
            KEMBALI KE MENU UTAMA
          </button>
        </div>
      </div>
    </div>
  );
}

function ModalShell({
  title,
  icon,
  onClose,
  children,
  wide = false,
}: {
  title: string;
  icon: React.ReactNode;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-40 bg-slate-950/75 flex items-center justify-center p-3 sm:p-4">
      <div
        className={`animate-card-pop bg-[#0b1326] border border-amber-400/35 rounded-2xl p-4 sm:p-6 w-full ${
          wide ? 'max-w-3xl' : 'max-w-2xl'
        } shadow-2xl`}
      >
        <div className="flex items-center justify-between gap-3 pb-3 mb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            {icon}
            <h3 className="font-display font-bold text-lg sm:text-xl text-white">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer transition-colors"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
