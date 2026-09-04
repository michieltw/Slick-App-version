export interface Team {
  id: string;
  name: string;
  shortName: string;
  country: string;
  city: string;
  arena: string;
  established: number;
  logo: string;
}

export interface Player {
  id: string;
  name: string;
  teamId: string;
  position: string;
  number: number;
  gamesPlayed: number;
  goals: number;
  assists: number;
  points: number;
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
}

export interface Venue {
  id: string;
  name: string;
  city: string;
  country: string;
  capacity: number;
  type: string;
}

export interface Retailer {
  id: string;
  name: string;
  city?: string;
  website: string;
  description: string;
}

export interface Game {
  id: string;
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