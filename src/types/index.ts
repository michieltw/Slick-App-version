export interface BaseEntity {
  id: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LeagueRules {
  pointsForWin: number;
  pointsForOTWin: number;
  pointsForTie: number;
  pointsForOTLoss: number;
  periodCount: number;
}

export interface League extends BaseEntity {
  name: string;
  shortName: string;
  region: string;
  rules: LeagueRules;
}

export interface Team extends BaseEntity {
  name: string;
  shortName: string;
  country: string;
  city: string;
  arena: string;
  established: number;
  logo: string;
  leagueId: string;
}

export interface Player extends BaseEntity {
  name: string;
  teamId: string;
  position: string;
  number: number;
  gamesPlayed: number;
  goals: number;
  assists: number;
  points: number;
  bio?: string;
}

export interface Standing {
  teamId: string;
  gamesPlayed: number;
  wins: number;
  losses: number;
  otLosses: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  updatedAt?: string;
}

export interface Venue extends BaseEntity {
  name: string;
  city: string;
  country: string;
  capacity: number;
  type: string;
}

export interface Retailer extends BaseEntity {
  name: string;
  city?: string;
  website: string;
  description: string;
}

export interface Game extends BaseEntity {
  date: string;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number;
  awayScore: number;
  status: string; // e.g. 'Scheduled', 'In Progress', 'Final'
  period?: number; // Current period
  clock?: string; // e.g. '20:00'
}

export type Role = 'admin' | 'manager' | 'player' | 'fan';

export interface User extends BaseEntity {
  username: string;
  role: Role;
  teamId?: string; // If role is manager or player, what team are they assigned to
}

export interface Comment extends BaseEntity {
  postId: string;
  authorId: string;
  authorName: string;
  content: string;
}

export interface Post extends BaseEntity {
  authorId: string;
  authorName: string;
  authorRole: Role;
  authorTeamId?: string;
  content: string;
  likes: number;
}

export interface GameEvent extends BaseEntity {
  gameId: string;
  teamId: string;
  type: 'goal' | 'penalty';
  playerId: string;
  assist1Id?: string;
  assist2Id?: string;
  period: number;
  clock: string;
}

export interface Database {
  users: User[];
  leagues: League[];
  posts: Post[];
  comments: Comment[];
  teams: Team[];
  players: Player[];
  standings: Standing[];
  venues: Venue[];
  retailers: Retailer[];
  games: Game[];
  gameEvents: GameEvent[];
}