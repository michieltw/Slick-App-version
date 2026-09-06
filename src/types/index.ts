export interface BaseEntity {
  id: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Team extends BaseEntity {
  name: string;
  shortName: string;
  country: string;
  city: string;
  arena: string;
  established: number;
  logo: string;
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
  status: string;
}

export interface Database {
  teams: Team[];
  players: Player[];
  standings: Standing[];
  venues: Venue[];
  retailers: Retailer[];
  recentGames: Game[];
}