import React from 'react';

interface ItemIconProps {
  itemId: string;
  size?: number;
  className?: string;
}

export const ItemIcon: React.FC<ItemIconProps> = ({ itemId, size = 24, className = '' }) => {
  const uid = itemId.replace(/[^a-z0-9]/gi, '');

  switch (itemId) {
    case 'atk_hunter':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
          <defs>
            <linearGradient id={`g-${uid}`} x1="6" y1="26" x2="27" y2="5" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#991b1b" />
              <stop offset="55%" stopColor="#f87171" />
              <stop offset="100%" stopColor="#fef2f2" />
            </linearGradient>
          </defs>
          <path d="M26.5 4.5C22 5 16.5 8.5 11.5 15.5L15.5 19.5C22 14.5 25.8 9.2 26.5 4.5Z" fill={`url(#g-${uid})`} stroke="#fecaca" strokeWidth="1.2" />
          <path d="M9.5 13.5L18.5 22.5" stroke="#fbbf24" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M12.5 18.5L6.5 24.5" stroke="#78350f" strokeWidth="3" strokeLinecap="round" />
          <circle cx="5.8" cy="25.2" r="2" fill="#fbbf24" />
        </svg>
      );

    case 'atk_scarlet':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
          <defs>
            <linearGradient id={`g-${uid}`} x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#fed7aa" />
              <stop offset="50%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#9a3412" />
            </linearGradient>
          </defs>
          <path d="M7 23C8 15 13 8 24 5C19 10 15 16 14 23Z" fill={`url(#g-${uid})`} stroke="#ffedd5" strokeWidth="1.1" />
          <path d="M13 25C15 17 20 11 28 9C23 14 20 19 19 25Z" fill={`url(#g-${uid})`} stroke="#ffedd5" strokeWidth="1.1" />
          <path d="M4 19C5 13 9 8 17 5C13 9 10 14 9 20Z" fill="#ea580c" stroke="#fed7aa" strokeWidth="1" />
          <rect x="6" y="22" width="15" height="5" rx="2.2" fill="#431407" stroke="#fb923c" strokeWidth="1.2" />
        </svg>
      );

    case 'atk_heptaseas':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
          <defs>
            <linearGradient id={`g-${uid}`} x1="5" y1="27" x2="27" y2="5" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#4c0519" />
              <stop offset="60%" stopColor="#e11d48" />
              <stop offset="100%" stopColor="#fda4af" />
            </linearGradient>
          </defs>
          <path d="M27 4L14 13L11 19L19 18L27 4Z" fill={`url(#g-${uid})`} stroke="#fecdd3" strokeWidth="1.2" />
          <path d="M18 11L15 16" stroke="#fff1f2" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M9 15L17 23" stroke="#94a3b8" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M12 20L6 26" stroke="#1e293b" strokeWidth="2.8" strokeLinecap="round" />
          <circle cx="13" cy="19" r="1.6" fill="#fb7185" />
        </svg>
      );

    case 'atk_haas':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
          <defs>
            <linearGradient id={`g-${uid}`} x1="4" y1="6" x2="28" y2="20" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#fca5a5" />
              <stop offset="50%" stopColor="#dc2626" />
              <stop offset="100%" stopColor="#7f1d1d" />
            </linearGradient>
          </defs>
          <path d="M16 4V28" stroke="#78350f" strokeWidth="3" strokeLinecap="round" />
          <path d="M15 7C9 5 5 8 5 13C5 18 9 20 15 17Z" fill={`url(#g-${uid})`} stroke="#fecaca" strokeWidth="1.2" />
          <path d="M17 7C23 5 27 8 27 13C27 18 23 20 17 17Z" fill={`url(#g-${uid})`} stroke="#fecaca" strokeWidth="1.2" />
          <circle cx="16" cy="12" r="2.2" fill="#fbbf24" />
        </svg>
      );

    case 'atk_despair':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
          <defs>
            <linearGradient id={`g-${uid}`} x1="16" y1="2" x2="16" y2="26" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#fef9c3" />
              <stop offset="50%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>
          </defs>
          <path d="M16 2.5L20 10L18.5 21H13.5L12 10L16 2.5Z" fill={`url(#g-${uid})`} stroke="#fef08a" strokeWidth="1.2" />
          <path d="M6 19C9 17 12 18 16 21C20 18 23 17 26 19L22 23H10L6 19Z" fill="#f59e0b" stroke="#fde68a" strokeWidth="1" />
          <path d="M16 22V28" stroke="#92400e" strokeWidth="3" strokeLinecap="round" />
          <circle cx="16" cy="28.5" r="2" fill="#ef4444" stroke="#fde047" strokeWidth="1" />
        </svg>
      );

    case 'def_iron':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
          <defs>
            <linearGradient id={`g-${uid}`} x1="6" y1="4" x2="26" y2="28" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#e2e8f0" />
              <stop offset="50%" stopColor="#64748b" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>
          </defs>
          <path d="M16 3.5L26 7V15.5C26 22 21.5 26.8 16 29C10.5 26.8 6 22 6 15.5V7L16 3.5Z" fill={`url(#g-${uid})`} stroke="#cbd5e1" strokeWidth="1.5" />
          <path d="M16 7V25M9 14H23" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="16" cy="14" r="2.5" fill="#fbbf24" stroke="#fef3c7" strokeWidth="1" />
        </svg>
      );

    case 'def_antique':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
          <defs>
            <linearGradient id={`g-${uid}`} x1="5" y1="5" x2="27" y2="28" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#854d0e" />
            </linearGradient>
          </defs>
          <path d="M9 5L13 8H19L23 5L27 10L24 15V26L16 28.5L8 26V15L5 10L9 5Z" fill={`url(#g-${uid})`} stroke="#fef9c3" strokeWidth="1.3" />
          <path d="M12 12L16 15L20 12" stroke="#713f12" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M16 15V24" stroke="#fef08a" strokeWidth="1.5" />
          <circle cx="16" cy="18.5" r="2" fill="#38bdf8" />
        </svg>
      );

    case 'def_wings':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
          <defs>
            <linearGradient id={`g-${uid}`} x1="4" y1="6" x2="28" y2="26" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#a7f3d0" />
              <stop offset="55%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#065f46" />
            </linearGradient>
          </defs>
          <path d="M15 14C12 8 6 6 3 8C4 12 6 15 9 17C6 18 5 20 6 22C10 22 13 20 15 18Z" fill={`url(#g-${uid})`} stroke="#d1fae5" strokeWidth="1" />
          <path d="M17 14C20 8 26 6 29 8C28 12 26 15 23 17C26 18 27 20 26 22C22 22 19 20 17 18Z" fill={`url(#g-${uid})`} stroke="#d1fae5" strokeWidth="1" />
          <path d="M16 8L20 14L16 25L12 14L16 8Z" fill="#fbbf24" stroke="#fef3c7" strokeWidth="1.2" />
        </svg>
      );

    case 'mag_wand':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
          <defs>
            <linearGradient id={`g-${uid}`} x1="16" y1="3" x2="28" y2="15" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#e0e7ff" />
              <stop offset="50%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#3730a3" />
            </linearGradient>
          </defs>
          <path d="M6 26L18.5 13.5" stroke="#a5b4fc" strokeWidth="2.8" strokeLinecap="round" />
          <path d="M22 4L17 11H21L18 17L26 9H22L25 4H22Z" fill={`url(#g-${uid})`} stroke="#eef2ff" strokeWidth="1.1" />
          <circle cx="14" cy="18" r="1.5" fill="#fbbf24" />
        </svg>
      );

    case 'mag_tome':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
          <defs>
            <linearGradient id={`g-${uid}`} x1="4" y1="6" x2="28" y2="26" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#c7d2fe" />
              <stop offset="55%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#312e81" />
            </linearGradient>
          </defs>
          <path d="M4 8C8 6.5 13 7 16 9.5C19 7 24 6.5 28 8V24C24 22.5 19 23 16 25.5C13 23 8 22.5 4 24V8Z" fill={`url(#g-${uid})`} stroke="#e0e7ff" strokeWidth="1.3" />
          <path d="M16 9.5V25.5" stroke="#fbbf24" strokeWidth="1.6" />
          <path d="M8 13H13M8 17H12M19 13H24M20 17H24" stroke="#e0e7ff" strokeWidth="1.4" strokeLinecap="round" />
          <circle cx="16" cy="5.5" r="2" fill="#fbbf24" />
        </svg>
      );

    case 'mag_glaive':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
          <defs>
            <linearGradient id={`g-${uid}`} x1="8" y1="4" x2="26" y2="22" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#f3e8ff" />
              <stop offset="55%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#581c87" />
            </linearGradient>
          </defs>
          <path d="M6 27L21 12" stroke="#c084fc" strokeWidth="2.6" strokeLinecap="round" />
          <path d="M26 4C20 4 15 8 15 14L20 13C21 16 24 18 27 16C25 13 25 9 26 4Z" fill={`url(#g-${uid})`} stroke="#f3e8ff" strokeWidth="1.2" />
          <circle cx="20" cy="11" r="2" fill="#38bdf8" />
        </svg>
      );

    case 'mov_boots':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
          <defs>
            <linearGradient id={`g-${uid}`} x1="7" y1="6" x2="25" y2="27" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#bae6fd" />
              <stop offset="55%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0369a1" />
            </linearGradient>
          </defs>
          <path d="M10 7H17V18L26 21V26H8V18L10 7Z" fill={`url(#g-${uid})`} stroke="#e0f2fe" strokeWidth="1.3" strokeLinejoin="round" />
          <path d="M9 12L4 9M9 15L5 14" stroke="#fef08a" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );

    case 'mov_warrior':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
          <defs>
            <linearGradient id={`g-${uid}`} x1="8" y1="6" x2="25" y2="27" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#93c5fd" />
              <stop offset="55%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
          </defs>
          <path d="M9 6H18L19 18L26 21V26H7V18L9 6Z" fill={`url(#g-${uid})`} stroke="#cbd5e1" strokeWidth="1.4" strokeLinejoin="round" />
          <path d="M9 11H18M9 15H18" stroke="#fbbf24" strokeWidth="1.6" />
          <rect x="7" y="23.5" width="19" height="2.5" rx="1" fill="#475569" />
        </svg>
      );

    case 'mov_magic':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
          <defs>
            <linearGradient id={`g-${uid}`} x1="8" y1="6" x2="26" y2="27" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#99f6e4" />
              <stop offset="55%" stopColor="#14b8a6" />
              <stop offset="100%" stopColor="#115e59" />
            </linearGradient>
          </defs>
          <path d="M10 7H17V18L26 21V26H8V18L10 7Z" fill={`url(#g-${uid})`} stroke="#ccfbf1" strokeWidth="1.3" strokeLinejoin="round" />
          <path d="M14 10L11.5 14H14.5L12.5 18" stroke="#fef08a" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );

    case 'rec_potion':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
          <defs>
            <linearGradient id={`g-${uid}`} x1="9" y1="12" x2="23" y2="28" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#6ee7b7" />
              <stop offset="55%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#064e3b" />
            </linearGradient>
          </defs>
          <rect x="13" y="4" width="6" height="4" rx="1" fill="#d97706" />
          <path d="M13 8H19V11L24 17.5C25.5 21.5 23 27 16 27C9 27 6.5 21.5 8 17.5L13 11V8Z" fill={`url(#g-${uid})`} stroke="#a7f3d0" strokeWidth="1.4" />
          <path d="M16 16V22M13 19H19" stroke="#ecfdf5" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case 'rec_oracle':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
          <defs>
            <linearGradient id={`g-${uid}`} x1="6" y1="4" x2="26" y2="28" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#a7f3d0" />
              <stop offset="55%" stopColor="#059669" />
              <stop offset="100%" stopColor="#064e3b" />
            </linearGradient>
          </defs>
          <path d="M16 4C11.5 4 9 8 10 13L5 25L12 27L16 22L20 27L27 25L22 13C23 8 20.5 4 16 4Z" fill={`url(#g-${uid})`} stroke="#d1fae5" strokeWidth="1.3" />
          <circle cx="16" cy="11" r="3" fill="#0f172a" stroke="#fbbf24" strokeWidth="1.4" />
        </svg>
      );

    case 'spc_wisdom':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
          <defs>
            <linearGradient id={`g-${uid}`} x1="6" y1="4" x2="26" y2="28" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#fef9c3" />
              <stop offset="50%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>
          </defs>
          <path d="M16 4L26 12L16 28L6 12L16 4Z" fill={`url(#g-${uid})`} stroke="#fef08a" strokeWidth="1.4" />
          <path d="M6 12H26M16 4L12 12L16 28L20 12L16 4Z" stroke="#fffbeb" strokeWidth="1" opacity="0.85" />
        </svg>
      );

    case 'spc_dawn':
    default:
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
          <defs>
            <radialGradient id={`g-${uid}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fef9c3" />
              <stop offset="55%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#92400e" />
            </radialGradient>
          </defs>
          <path d="M16 2L19 9L26 6L23 13L30 16L23 19L26 26L19 23L16 30L13 23L6 26L9 19L2 16L9 13L6 6L13 9L16 2Z" fill={`url(#g-${uid})`} stroke="#fef08a" strokeWidth="1.1" />
          <circle cx="16" cy="16" r="5" fill="#0f172a" stroke="#fde047" strokeWidth="1.5" />
          <circle cx="16" cy="16" r="2.2" fill="#38bdf8" />
        </svg>
      );
  }
};
