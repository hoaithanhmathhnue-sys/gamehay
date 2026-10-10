export type GameMode = 'fun' | 'photo' | 'quiz';

export interface Student {
  id: string;
  name: string;
  number?: number;
  avatarUrl?: string; // base64 data URL or preset svg
  color: string;
}

export interface Classroom {
  id: string;
  name: string;
  students: Student[];
}

export interface Marble {
  id: string;
  studentId: string;
  name: string;
  number: number;
  avatarUrl?: string;
  color: string;
  
  // Physics properties
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  mass: number;
  angle: number; // for rotating photo avatar
  angularVelocity: number;
  
  // Status
  finished: boolean;
  finishTime?: number;
  rank?: number;
  trail: { x: number; y: number; alpha: number }[];
  boostCooldown?: number;
  score: number;
}

export type ObstacleType = 
  | 'peg'          // round pin (Plinko)
  | 'ramp'         // inclined bar
  | 'spinner'      // rotating blades
  | 'bouncer'      // spring pad that launches bi
  | 'booster'      // speed acceleration zone
  | 'funnel'       // narrowing throat
  | 'portal'       // warp gate
  | 'finish-line'; // target goal

export interface Obstacle {
  id: string;
  type: ObstacleType;
  x: number;
  y: number;
  // Dimensions & specific params
  radius?: number; // for pegs / bouncers
  width?: number;  // for ramps / portals / finish line
  height?: number;
  angle?: number;  // radians
  rotationSpeed?: number; // radians per frame for spinners
  currentAngle?: number;
  restitution?: number; // bounciness factor
  color?: string;
}

export interface TrackConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
  width: number;
  height: number;
  gravity: number;
  restitution: number;
  friction: number;
  obstacles: Obstacle[];
  spawnArea: { x: number; y: number; width: number; height: number };
  finishY: number;
}

export interface RaceState {
  status: 'ready' | 'countdown' | 'racing' | 'paused' | 'finished';
  countdown: number;
  elapsedTime: number;
  rankedWinners: Marble[];
  targetRankCount: number; // Top 1, Top 3, Top 5
}
