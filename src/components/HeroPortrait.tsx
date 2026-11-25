import { HeroDefinition } from '../data/gameData';

interface HeroPortraitProps {
  hero: HeroDefinition;
  size?: number;
  className?: string;
}

export function HeroPortrait({ hero, size = 56, className = '' }: HeroPortraitProps) {
  const { primaryColor, secondaryColor, accentColor, headgear } = hero.appearance;

  const skinFill = (() => {
    if (hero.id === 'balmond' || hero.id === 'dyrroth') return '#b91c1c';
    if (hero.id === 'estes' || hero.id === 'aurora') return '#e2e8f0';
    if (hero.id === 'karina' || hero.id === 'karrie') return '#cbd5e1';
    if (hero.id === 'yve') return '#818cf8';
    if (hero.id === 'cyclops') return '#c084fc';
    if (hero.id === 'helcurt') return '#475569';
    if (hero.id === 'khufra') return '#d6c198';
    if (hero.id === 'johnson' || hero.id === 'atlas') return '#64748b';
    if (hero.id === 'brody') return '#8d5524';
    return '#f1c29b';
  })();

  const skinShade = (() => {
    if (hero.id === 'balmond' || hero.id === 'dyrroth') return '#7f1d1d';
    if (hero.id === 'estes' || hero.id === 'aurora' || hero.id === 'karina' || hero.id === 'karrie') return '#94a3b8';
    if (hero.id === 'yve') return '#4f46e5';
    if (hero.id === 'cyclops') return '#7e22ce';
    if (hero.id === 'helcurt') return '#1e293b';
    if (hero.id === 'khufra') return '#92400e';
    if (hero.id === 'johnson' || hero.id === 'atlas') return '#334155';
    if (hero.id === 'brody') return '#5c3818';
    return '#d99e73';
  })();

  const isElf =
    headgear === 'tiara' ||
    headgear === 'moon_crown' ||
    headgear === 'karina_ears' ||
    headgear === 'aurora_crown';

  const isVisor =
    headgear === 'cyber_visor' ||
    headgear === 'johnson_visor' ||
    headgear === 'yve_visor' ||
    headgear === 'ixia_visor';

  const isMask = headgear === 'hayabusa_mask' || headgear === 'terizla_mask' || headgear === 'natalia_hood';

  const hasSmile =
    hero.id === 'nana' ||
    hero.id === 'layla' ||
    hero.id === 'miya' ||
    hero.id === 'angela' ||
    hero.id === 'guinevere' ||
    hero.id === 'kagura' ||
    hero.id === 'ruby' ||
    hero.id === 'change' ||
    hero.id === 'harley' ||
    hero.id === 'beatrix' ||
    hero.id === 'bruno';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      className={`rounded-xl border border-white/25 shrink-0 select-none ${className}`}
      aria-label={`Potret ${hero.name}`}
    >
      <defs>
        <linearGradient id={`bg-${hero.id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={secondaryColor} />
          <stop offset="100%" stopColor="#080d1a" />
        </linearGradient>
        <radialGradient id={`glow-${hero.id}`} cx="50%" cy="35%" r="60%">
          <stop offset="0%" stopColor={primaryColor} stopOpacity="0.52" />
          <stop offset="100%" stopColor={primaryColor} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Backdrop */}
      <rect width="80" height="80" rx="14" fill={`url(#bg-${hero.id})`} />
      <rect width="80" height="80" rx="14" fill={`url(#glow-${hero.id})`} />

      {/* Decorative Aura Arc */}
      <circle cx="40" cy="40" r="33" fill="none" stroke={accentColor} strokeOpacity="0.22" strokeWidth="1.5" />

      {/* High Vampire / Mystic Collar Back */}
      {headgear === 'cecilion_collar' && (
        <polygon points="15,62 20,24 31,42 49,42 60,24 65,62" fill="#4c1d95" stroke={accentColor} strokeWidth="1.4" />
      )}

      {/* Shoulders / Armor */}
      <path d="M12 80 C15 58, 25 54, 40 54 C55 54, 65 58, 68 80 Z" fill={primaryColor} />
      <path d="M24 80 L30 56 L40 64 L50 56 L56 80 Z" fill={secondaryColor} opacity="0.88" />
      <path d="M26 57 L40 66 L54 57" fill="none" stroke={accentColor} strokeWidth="2.2" strokeLinecap="round" />

      {/* Hair / Hood Back Silhouettes */}
      {headgear === 'tiara' && <path d="M18 42 C18 20, 62 20, 62 42 L65 62 L15 62 Z" fill="#cbd5e1" />}
      {headgear === 'twintails' && (
        <>
          <path d="M24 32 C10 38, 10 56, 17 68 C22 58, 23 48, 26 42 Z" fill="#fde047" />
          <path d="M56 32 C70 38, 70 56, 63 68 C58 58, 57 48, 54 42 Z" fill="#fde047" />
        </>
      )}
      {(headgear === 'lightning_crown' || headgear === 'aurora_crown' || headgear === 'silvanna_tiara') && (
        <path
          d="M21 36 C21 18, 59 18, 59 36 L61 58 L19 58 Z"
          fill={headgear === 'aurora_crown' ? '#bae6fd' : headgear === 'silvanna_tiara' ? '#fef08a' : '#4f46e5'}
        />
      )}
      {headgear === 'moon_crown' && <path d="M19 40 C19 18, 61 18, 61 40 L63 62 L17 62 Z" fill="#e2e8f0" />}
      {headgear === 'cat_hood' && <path d="M20 42 C20 20, 60 20, 60 42 L58 58 L22 58 Z" fill="#f472b6" />}
      {headgear === 'guinevere_ribbon' && <path d="M18 42 C18 18, 62 18, 62 42 L64 64 L16 64 Z" fill="#b45309" />}
      {headgear === 'kagura_hairpin' && <path d="M19 40 C19 18, 61 18, 61 40 L62 60 L18 60 Z" fill="#f1f5f9" />}
      {headgear === 'angela_bunny' && <path d="M20 42 C20 20, 60 20, 60 42 L59 56 L21 56 Z" fill="#fecdd3" />}
      {(headgear === 'granger_hood' || headgear === 'ruby_hood' || headgear === 'aamon_hood' || headgear === 'natalia_hood') && (
        <path
          d="M17 48 C16 14, 64 14, 63 48 L59 64 L21 64 Z"
          fill={headgear === 'ruby_hood' ? '#9f1239' : headgear === 'aamon_hood' ? '#1e293b' : headgear === 'natalia_hood' ? '#312e81' : '#1e293b'}
          stroke={accentColor}
          strokeWidth="1.4"
        />
      )}
      {headgear === 'pharsa_blindfold' && <path d="M18 42 C18 18, 62 18, 62 42 L64 62 L16 62 Z" fill="#312e81" />}
      {(headgear === 'luoyi_bun' || headgear === 'change_buns') && (
        <path d="M19 42 C19 18, 61 18, 61 42 L60 60 L20 60 Z" fill={headgear === 'luoyi_bun' ? '#1e293b' : '#f8fafc'} />
      )}
      {headgear === 'karina_ears' && <path d="M20 42 C20 18, 60 18, 60 42 L62 60 L18 60 Z" fill="#312e81" />}

      {/* Neck & Face */}
      <rect x="34" y="48" width="12" height="10" rx="4" fill={skinShade} />
      <path d="M26 32 C26 20, 54 20, 54 32 C54 46, 48 52, 40 53 C32 52, 26 46, 26 32 Z" fill={skinFill} />

      {/* Elf / Pointed Ears */}
      {isElf && (
        <>
          <polygon points="25,35 15,31 25,40" fill={skinFill} />
          <polygon points="55,35 65,31 55,40" fill={skinFill} />
        </>
      )}

      {/* Khufra Bandages across face */}
      {headgear === 'khufra_crown' && (
        <>
          <line x1="27" y1="42" x2="53" y2="45" stroke="#fef3c7" strokeWidth="2.5" />
          <line x1="28" y1="48" x2="52" y2="49" stroke="#e5e7eb" strokeWidth="2.2" />
        </>
      )}

      {/* Eyes / Visors / Cyclops / Blindfold */}
      {isVisor ? (
        <>
          <polygon points="24,33 56,33 53,41 27,41" fill="#0f172a" stroke={accentColor} strokeWidth="1.4" />
          <line x1="28" y1="37" x2="52" y2="37" stroke={accentColor} strokeWidth="2.5" strokeLinecap="round" />
        </>
      ) : headgear === 'atlas_diver' ? (
        <>
          <circle cx="40" cy="36" r="15" fill="#0f172a" stroke="#38bdf8" strokeWidth="2.2" />
          <circle cx="40" cy="36" r="9.5" fill="#0284c7" opacity="0.65" />
          <circle cx="37" cy="33" r="3" fill="#bae6fd" opacity="0.85" />
        </>
      ) : headgear === 'cyclops_hat' ? (
        <>
          <ellipse cx="40" cy="36.5" rx="5.5" ry="5.5" fill="#fef08a" stroke="#4c1d95" strokeWidth="1.5" />
          <circle cx="40" cy="36.5" r="2.3" fill="#0f172a" />
          <circle cx="41.2" cy="35.3" r="0.9" fill="#ffffff" />
        </>
      ) : headgear === 'pharsa_blindfold' ? (
        <>
          <rect x="25" y="33" width="30" height="7" rx="3" fill="#be123c" stroke="#fbbf24" strokeWidth="1.1" />
          <circle cx="40" cy="36.5" r="2" fill="#fbbf24" />
        </>
      ) : (
        <>
          <ellipse
            cx="33.5"
            cy="36.5"
            rx="2.5"
            ry="2.8"
            fill={hero.id === 'balmond' || hero.id === 'dyrroth' || hero.id === 'yuzhong' ? '#fde047' : '#0f172a'}
          />
          <ellipse
            cx="46.5"
            cy="36.5"
            rx="2.5"
            ry="2.8"
            fill={hero.id === 'balmond' || hero.id === 'dyrroth' || hero.id === 'yuzhong' ? '#fde047' : '#0f172a'}
          />
          <circle cx="34.2" cy="35.7" r="0.9" fill="#ffffff" />
          <circle cx="47.2" cy="35.7" r="0.9" fill="#ffffff" />
        </>
      )}

      {/* Lower Face: Ninja Mask or Smile */}
      {isMask ? (
        <path d="M27 40 L40 43 L53 40 L51 52 Q40 55 29 52 Z" fill={headgear === 'terizla_mask' ? '#334155' : '#1e1b4b'} stroke={accentColor} strokeWidth="1.1" />
      ) : headgear === 'atlas_diver' || isVisor ? null : hasSmile ? (
        <path d="M36 45 Q40 48 44 45" fill="none" stroke="#9f1239" strokeWidth="1.6" strokeLinecap="round" />
      ) : (
        <line x1="36" y1="45.5" x2="44" y2="45.5" stroke="#475569" strokeWidth="1.6" strokeLinecap="round" />
      )}

      {/* Iconic Headgear / Hair Front */}
      {headgear === 'tiara' && (
        <>
          <path d="M24 30 C26 19, 54 19, 56 30 Q40 25 24 30 Z" fill="#e2e8f0" />
          <polygon points="40,14 45,25 35,25" fill={accentColor} />
          <circle cx="40" cy="22" r="2.2" fill="#38bdf8" />
        </>
      )}
      {headgear === 'silvanna_tiara' && (
        <>
          <path d="M24 30 C26 18, 54 18, 56 30 Q40 24 24 30 Z" fill="#fde047" />
          <polygon points="40,12 46,24 34,24" fill="#fbbf24" />
          <circle cx="40" cy="20" r="2.3" fill="#38bdf8" />
        </>
      )}
      {headgear === 'aurora_crown' && (
        <>
          <path d="M24 30 C26 18, 54 18, 56 30 Q40 24 24 30 Z" fill="#e0f2fe" />
          <polygon points="32,24 35,14 38,24" fill="#38bdf8" />
          <polygon points="37,24 40,10 43,24" fill="#bae6fd" />
          <polygon points="42,24 45,14 48,24" fill="#38bdf8" />
        </>
      )}
      {(headgear === 'hair_spiky' || headgear === 'paquito_hair' || headgear === 'valir_flame') && (
        <path
          d="M22 33 L26 16 L33 23 L40 12 L47 22 L55 15 L58 33 Q40 24 22 33 Z"
          fill={headgear === 'valir_flame' ? '#f97316' : headgear === 'paquito_hair' ? '#1e293b' : '#fde68a'}
        />
      )}
      {headgear === 'twintails' && <path d="M25 30 C27 18, 53 18, 55 30 Q40 24 25 30 Z" fill="#fde047" />}
      {(headgear === 'helm_paladin' || headgear === 'terizla_mask') && (
        <>
          <path d="M22 36 C22 15, 58 15, 58 36 L54 31 L40 27 L26 31 Z" fill="#64748b" stroke={accentColor} strokeWidth="1.6" />
          <polygon points="40,10 44,22 36,22" fill={primaryColor} />
        </>
      )}
      {(headgear === 'lightning_crown' || headgear === 'minsitthar_crown' || headgear === 'khufra_crown') && (
        <path
          d="M24 29 Q40 22 56 29 L52 16 L44 22 L40 11 L36 22 L28 16 Z"
          fill={headgear === 'khufra_crown' ? '#f59e0b' : accentColor}
        />
      )}
      {(headgear === 'cyber_visor' || headgear === 'johnson_visor' || headgear === 'yve_visor' || headgear === 'ixia_visor') && (
        <path d="M23 28 C25 16, 55 16, 57 28 L52 24 L28 24 Z" fill="#1e293b" stroke={primaryColor} strokeWidth="1.5" />
      )}
      {headgear === 'dragon_plume' && (
        <>
          <path d="M24 31 C26 18, 54 18, 56 31 Q40 24 24 31 Z" fill="#1e293b" />
          <path d="M38 22 C36 8, 52 8, 50 18 C46 14, 42 16, 42 22 Z" fill="#ef4444" />
          <circle cx="40" cy="23" r="2.5" fill={accentColor} />
        </>
      )}
      {headgear === 'cat_hood' && (
        <>
          <path d="M23 31 C25 18, 55 18, 57 31 Q40 25 23 31 Z" fill="#f472b6" />
          <polygon points="24,25 22,11 33,21" fill="#ec4899" stroke="#fbcfe8" strokeWidth="1.2" />
          <polygon points="56,25 58,11 47,21" fill="#ec4899" stroke="#fbcfe8" strokeWidth="1.2" />
        </>
      )}
      {(headgear === 'horns' || headgear === 'hylos_antlers' || headgear === 'yuzhong_horns' || headgear === 'dyrroth_horns' || headgear === 'helcurt_crest' || headgear === 'karrie_crest') && (
        <>
          <path
            d="M25 28 C14 21, 15 10, 23 9 C22 17, 25 22, 29 24 Z"
            fill={headgear === 'yuzhong_horns' ? '#a855f7' : headgear === 'dyrroth_horns' ? '#f43f5e' : headgear === 'hylos_antlers' ? '#fbbf24' : accentColor}
          />
          <path
            d="M55 28 C66 21, 65 10, 57 9 C58 17, 55 22, 51 24 Z"
            fill={headgear === 'yuzhong_horns' ? '#a855f7' : headgear === 'dyrroth_horns' ? '#f43f5e' : headgear === 'hylos_antlers' ? '#fbbf24' : accentColor}
          />
          <path d="M26 28 Q40 22 54 28 L50 20 L30 20 Z" fill={secondaryColor} />
        </>
      )}
      {headgear === 'moon_crown' && (
        <>
          <path d="M24 30 C26 19, 54 19, 56 30 Q40 24 24 30 Z" fill="#f8fafc" />
          <path d="M33 17 A7 7 0 1 0 47 17 A5.5 5.5 0 1 1 33 17 Z" fill={accentColor} />
        </>
      )}
      {headgear === 'gusion_locks' && (
        <>
          <path d="M22 33 L25 17 L34 22 L40 13 L48 21 L56 17 L58 33 Q40 24 22 33 Z" fill="#92400e" />
          <polygon points="36,24 40,18 44,24" fill="#38bdf8" />
        </>
      )}
      {(headgear === 'fanny_goggles' || headgear === 'bruno_goggles') && (
        <>
          <path d="M24 31 C26 18, 54 18, 56 31 Q40 25 24 31 Z" fill={headgear === 'bruno_goggles' ? '#1e293b' : '#fbbf24'} />
          <rect x="24" y="21" width="32" height="7" rx="3" fill="#0f766e" />
          <circle cx="33" cy="24.5" r="3.2" fill="#38bdf8" stroke="#fde047" strokeWidth="1.2" />
          <circle cx="47" cy="24.5" r="3.2" fill="#38bdf8" stroke="#fde047" strokeWidth="1.2" />
        </>
      )}
      {headgear === 'chou_headband' && (
        <>
          <path d="M24 30 L28 16 L36 21 L40 14 L46 21 L54 17 L56 30 Q40 24 24 30 Z" fill="#1e293b" />
          <rect x="25" y="24" width="30" height="4.5" rx="2" fill="#ef4444" />
          <circle cx="40" cy="26.2" r="2" fill="#fbbf24" />
        </>
      )}
      {headgear === 'guinevere_ribbon' && (
        <>
          <path d="M24 30 C26 18, 54 18, 56 30 Q40 24 24 30 Z" fill="#b45309" />
          <polygon points="30,18 40,22 33,12" fill="#e879f9" />
          <polygon points="50,18 40,22 47,12" fill="#e879f9" />
          <circle cx="40" cy="20" r="2.6" fill="#fde047" />
        </>
      )}
      {headgear === 'kagura_hairpin' && (
        <>
          <path d="M24 30 C26 18, 54 18, 56 30 Q40 25 24 30 Z" fill="#f8fafc" />
          <circle cx="51" cy="20" r="4" fill="#f472b6" />
          <circle cx="51" cy="20" r="1.8" fill="#fde047" />
        </>
      )}
      {headgear === 'lancelot_plume' && (
        <>
          <path d="M23 31 C26 18, 54 18, 57 31 Q40 25 23 31 Z" fill="#fde047" />
          <path d="M26 20 Q40 14 54 20" stroke="#7e22ce" strokeWidth="3" fill="none" />
          <polygon points="40,12 45,19 35,19" fill="#fbbf24" />
        </>
      )}
      {headgear === 'angela_bunny' && (
        <>
          <path d="M25 30 C27 19, 53 19, 55 30 Q40 25 25 30 Z" fill="#fecdd3" />
          <ellipse cx="30" cy="14" rx="4" ry="8" fill="#ffffff" stroke="#f43f5e" strokeWidth="1.2" />
          <ellipse cx="50" cy="14" rx="4" ry="8" fill="#ffffff" stroke="#f43f5e" strokeWidth="1.2" />
          <circle cx="40" cy="23" r="2.2" fill="#67e8f9" />
        </>
      )}
      {(headgear === 'granger_hood' || headgear === 'ruby_hood' || headgear === 'aamon_hood' || headgear === 'natalia_hood') && (
        <>
          <path d="M25 31 L29 19 L40 24 L51 19 L55 31 Q40 25 25 31 Z" fill={secondaryColor} />
          <path d="M22 25 Q40 15 58 25" stroke={accentColor} strokeWidth="2.2" fill="none" />
        </>
      )}
      {headgear === 'fredrinn_pompadour' && (
        <>
          <path d="M24 30 C24 14, 54 12, 56 29 Q40 22 24 30 Z" fill="#334155" />
          <path d="M36 16 Q42 12 50 18" stroke="#94a3b8" strokeWidth="2.4" fill="none" strokeLinecap="round" />
        </>
      )}
      {headgear === 'pharsa_blindfold' && (
        <>
          <path d="M24 29 C26 18, 54 18, 56 29 Q40 24 24 29 Z" fill="#4338ca" />
          <polygon points="40,12 44,21 36,21" fill="#fbbf24" />
        </>
      )}
      {headgear === 'hayabusa_mask' && (
        <>
          <path d="M23 31 C25 17, 55 17, 57 31 Q40 24 23 31 Z" fill="#312e81" stroke="#38bdf8" strokeWidth="1.4" />
          <polygon points="40,12 45,21 35,21" fill="#ef4444" />
        </>
      )}
      {headgear === 'karina_ears' && (
        <>
          <path d="M24 30 C26 18, 54 18, 56 30 Q40 24 24 30 Z" fill="#4338ca" />
          <circle cx="40" cy="21" r="2.5" fill="#2dd4bf" />
        </>
      )}
      {headgear === 'harley_tophat' && (
        <>
          <rect x="26" y="7" width="28" height="17" rx="3" fill="#4c1d95" stroke="#fbbf24" strokeWidth="1.2" />
          <rect x="20" y="22" width="40" height="4.5" rx="2" fill="#6d28d9" />
          <rect x="26" y="19" width="28" height="3" fill="#fbbf24" />
        </>
      )}
      {headgear === 'cyclops_hat' && (
        <>
          <polygon points="40,5 56,24 24,24" fill="#5b21b6" stroke="#fde047" strokeWidth="1.2" />
          <ellipse cx="40" cy="24" rx="20" ry="4" fill="#4c1d95" />
        </>
      )}
      {headgear === 'cecilion_collar' && (
        <path d="M24 30 L28 16 L36 22 L40 13 L45 21 L54 17 L56 30 Q40 24 24 30 Z" fill="#1e1b4b" />
      )}
      {(headgear === 'luoyi_bun' || headgear === 'change_buns') && (
        <>
          <circle cx="24" cy="18" r="7" fill={headgear === 'luoyi_bun' ? '#1e293b' : '#f1f5f9'} stroke={accentColor} strokeWidth="1.3" />
          <circle cx="56" cy="18" r="7" fill={headgear === 'luoyi_bun' ? '#1e293b' : '#f1f5f9'} stroke={accentColor} strokeWidth="1.3" />
          <path d="M25 30 C27 19, 53 19, 55 30 Q40 25 25 30 Z" fill={headgear === 'luoyi_bun' ? '#1e293b' : '#f8fafc'} />
        </>
      )}
      {headgear === 'clint_hat' && (
        <>
          <path d="M25 22 C28 11, 52 11, 55 22 Z" fill="#78350f" stroke="#fbbf24" strokeWidth="1.1" />
          <ellipse cx="40" cy="23" rx="22" ry="4.5" fill="#92400e" stroke="#f59e0b" strokeWidth="1" />
        </>
      )}
      {headgear === 'brody_dreads' && (
        <>
          <path d="M22 32 C22 14, 58 14, 58 32 Q40 24 22 32 Z" fill="#1e293b" />
          <line x1="25" y1="22" x2="21" y2="38" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />
          <line x1="55" y1="22" x2="59" y2="38" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />
          <circle cx="40" cy="22" r="2.2" fill="#a855f7" />
        </>
      )}
      {headgear === 'beatrix_beret' && (
        <>
          <path d="M25 31 C27 19, 53 19, 55 31 Q40 25 25 31 Z" fill="#f97316" />
          <ellipse cx="42" cy="18" rx="16" ry="7" fill="#334155" stroke="#fbbf24" strokeWidth="1.3" />
          <circle cx="46" cy="18" r="2" fill="#fbbf24" />
        </>
      )}
    </svg>
  );
}
