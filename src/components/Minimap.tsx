import {
  ALLIED_BASE_POS,
  BOSS_ARENA_RADIUS,
  ENEMY_BASE_POS,
  LANE_WAYPOINTS,
  LORD_PIT_POS,
  TURTLE_PIT_POS,
  WORLD_RADIUS,
} from '../data/gameData';
import { MinimapUnit } from '../game/hudTypes';

interface MinimapProps {
  units: MinimapUnit[];
  playerYaw: number;
}

export function Minimap({ units, playerYaw }: MinimapProps) {
  const size = 160;
  const toMapCoord = (val: number) => ((val + WORLD_RADIUS) / (WORLD_RADIUS * 2)) * size;
  const scaleRadius = (r: number) => (r / (WORLD_RADIUS * 2)) * size;

  const lanePolyline = (pts: [number, number][]) =>
    pts.map(([x, z]) => `${toMapCoord(x).toFixed(1)},${toMapCoord(z).toFixed(1)}`).join(' ');

  return (
    <div
      className="relative rounded-xl border border-amber-400/35 bg-[#091122]/92 overflow-hidden shadow-lg shrink-0"
      style={{ width: size, height: size }}
      aria-label="Peta Mini 3-Lorong Land of Dawn"
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Outer jungle terrain */}
        <rect width={size} height={size} fill="#0c2017" />

        {/* 3 MOBA Stone Lanes: EXP, MID, GOLD */}
        <polyline
          points={lanePolyline(LANE_WAYPOINTS.exp)}
          fill="none"
          stroke="#475569"
          strokeWidth={5.2}
          strokeLinejoin="round"
          strokeLinecap="round"
          strokeOpacity={0.62}
        />
        <polyline
          points={lanePolyline(LANE_WAYPOINTS.mid)}
          fill="none"
          stroke="#475569"
          strokeWidth={5.2}
          strokeLinejoin="round"
          strokeLinecap="round"
          strokeOpacity={0.62}
        />
        <polyline
          points={lanePolyline(LANE_WAYPOINTS.gold)}
          fill="none"
          stroke="#475569"
          strokeWidth={5.2}
          strokeLinejoin="round"
          strokeLinecap="round"
          strokeOpacity={0.62}
        />

        {/* Symmetrical Crystal River along x - z = 0 */}
        <line
          x1={toMapCoord(-132)}
          y1={toMapCoord(-132)}
          x2={toMapCoord(132)}
          y2={toMapCoord(132)}
          stroke="#0284c7"
          strokeWidth={6.5}
          strokeOpacity={0.78}
        />

        {/* Lord Pit (NW River) */}
        <circle
          cx={toMapCoord(LORD_PIT_POS[0])}
          cy={toMapCoord(LORD_PIT_POS[1])}
          r={scaleRadius(BOSS_ARENA_RADIUS)}
          fill="#1e1b4b"
          stroke="#a855f7"
          strokeWidth={1.1}
          strokeOpacity={0.85}
        />

        {/* Turtle Pit (SE River) */}
        <circle
          cx={toMapCoord(TURTLE_PIT_POS[0])}
          cy={toMapCoord(TURTLE_PIT_POS[1])}
          r={scaleRadius(15)}
          fill="#064e3b"
          stroke="#10b981"
          strokeWidth={1}
          strokeOpacity={0.85}
        />

        {/* Allied Base Zone (Bottom-Left) */}
        <circle
          cx={toMapCoord(ALLIED_BASE_POS[0])}
          cy={toMapCoord(ALLIED_BASE_POS[1])}
          r={8}
          fill="#0c4a6e"
          opacity={0.85}
        />

        {/* Enemy Base Zone (Top-Right) */}
        <circle
          cx={toMapCoord(ENEMY_BASE_POS[0])}
          cy={toMapCoord(ENEMY_BASE_POS[1])}
          r={8}
          fill="#7f1d1d"
          opacity={0.85}
        />

        {/* Units */}
        {units.map((u) => {
          const cx = toMapCoord(u.x);
          const cy = toMapCoord(u.z);

          if (u.type === 'fountain') {
            return <circle key={u.id} cx={cx} cy={cy} r={2.4} fill="#34d399" opacity={0.85} />;
          }
          if (u.type === 'camp') {
            return <circle key={u.id} cx={cx} cy={cy} r={2} fill="#f59e0b" opacity={0.85} />;
          }
          if (u.type === 'blue_buff') {
            return (
              <polygon
                key={u.id}
                points={`${cx},${cy - 3.3} ${cx + 3},${cy} ${cx},${cy + 3.3} ${cx - 3},${cy}`}
                fill="#38bdf8"
                stroke="#e0f2fe"
                strokeWidth={0.7}
              />
            );
          }
          if (u.type === 'red_buff') {
            return (
              <polygon
                key={u.id}
                points={`${cx},${cy - 3.3} ${cx + 3},${cy} ${cx},${cy + 3.3} ${cx - 3},${cy}`}
                fill="#ef4444"
                stroke="#fecaca"
                strokeWidth={0.7}
              />
            );
          }
          if (u.type === 'turtle') {
            return (
              <g key={u.id} transform={`translate(${cx}, ${cy})`}>
                <circle r={4} fill="#10b981" stroke="#fde047" strokeWidth={1} />
                <circle r={1.4} fill="#fef08a" />
              </g>
            );
          }
          if (u.type === 'minion_ally') {
            return <circle key={u.id} cx={cx} cy={cy} r={1.55} fill="#60a5fa" opacity={0.9} />;
          }
          if (u.type === 'minion_enemy') {
            return <circle key={u.id} cx={cx} cy={cy} r={1.55} fill="#fb7185" opacity={0.9} />;
          }
          if (u.type === 'turret_ally') {
            return (
              <rect
                key={u.id}
                x={cx - 2.6}
                y={cy - 2.6}
                width={5.2}
                height={5.2}
                rx={1}
                fill="#0284c7"
                stroke="#bae6fd"
                strokeWidth={0.9}
              />
            );
          }
          if (u.type === 'turret_enemy') {
            return (
              <rect
                key={u.id}
                x={cx - 2.6}
                y={cy - 2.6}
                width={5.2}
                height={5.2}
                rx={1}
                fill="#dc2626"
                stroke="#fecaca"
                strokeWidth={0.9}
              />
            );
          }
          if (u.type === 'base_ally') {
            return (
              <polygon
                key={u.id}
                points={`${cx},${cy - 5.2} ${cx + 5},${cy} ${cx},${cy + 5.2} ${cx - 5},${cy}`}
                fill="#38bdf8"
                stroke="#ffffff"
                strokeWidth={1.1}
              />
            );
          }
          if (u.type === 'base_enemy') {
            return (
              <polygon
                key={u.id}
                points={`${cx},${cy - 5.2} ${cx + 5},${cy} ${cx},${cy + 5.2} ${cx - 5},${cy}`}
                fill="#ef4444"
                stroke="#fde047"
                strokeWidth={1.1}
              />
            );
          }
          if (u.type === 'allied_lord') {
            return (
              <g key={u.id} transform={`translate(${cx}, ${cy})`}>
                <circle r={5.4} fill="#06b6d4" stroke="#fde047" strokeWidth={1.4} />
              </g>
            );
          }
          if (u.type === 'boss') {
            return (
              <g key={u.id} transform={`translate(${cx}, ${cy})`}>
                <circle r={5.6} fill="#9333ea" stroke="#fde047" strokeWidth={1.4} />
              </g>
            );
          }
          if (u.type === 'ally_hero') {
            return (
              <circle
                key={u.id}
                cx={cx}
                cy={cy}
                r={3.4}
                fill="#38bdf8"
                stroke="#ffffff"
                strokeWidth={1}
              />
            );
          }
          if (u.type === 'enemy') {
            return (
              <circle
                key={u.id}
                cx={cx}
                cy={cy}
                r={3.5}
                fill="#ef4444"
                stroke="#fecaca"
                strokeWidth={1}
              />
            );
          }
          if (u.type === 'player') {
            const deg = (-playerYaw * 180) / Math.PI + 180;
            return (
              <g key={u.id} transform={`translate(${cx}, ${cy}) rotate(${deg})`}>
                <polygon
                  points="0,-5.4 3.8,4.2 0,2.3 -3.8,4.2"
                  fill="#38bdf8"
                  stroke="#ffffff"
                  strokeWidth={1}
                />
              </g>
            );
          }
          return null;
        })}
      </svg>
      <div className="absolute bottom-1 left-1.5 text-[8.5px] font-bold tracking-wide text-slate-200/90 pointer-events-none">
        LAND OF DAWN · 3 LORONG
      </div>
    </div>
  );
}
