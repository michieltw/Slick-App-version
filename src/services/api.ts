import type { Database, Team, Player, Standing, Venue, Retailer, Game, User } from '../types';

const DB_KEY = 'bnlplay_db';

class ApiService {
  private async getDatabase(): Promise<Database> {
    const stored = localStorage.getItem(DB_KEY);
    if (stored) {
      return JSON.parse(stored);
    }

    // Seed database if empty
    const res = await fetch('/data/db.json');
    if (!res.ok) throw new Error('Failed to fetch initial database');
    const data: Database = await res.json();

    // Add timestamps to seeded data
    const now = new Date().toISOString();
    const seedData = {
      ...data,
      users: [
        { id: 'u1', username: 'League Admin', role: 'admin', createdAt: now, updatedAt: now },
        { id: 'u2', username: 'Flyers Manager', role: 'manager', teamId: 't1', createdAt: now, updatedAt: now },
        { id: 'u3', username: 'Bulldogs Manager', role: 'manager', teamId: 't2', createdAt: now, updatedAt: now },
        { id: 'u4', username: 'Fan Account', role: 'fan', createdAt: now, updatedAt: now }
      ] as User[],
      teams: data.teams.map(t => ({ ...t, createdAt: now, updatedAt: now })),
      players: data.players.map(p => ({ ...p, createdAt: now, updatedAt: now })),
      venues: data.venues.map(v => ({ ...v, createdAt: now, updatedAt: now })),
      retailers: data.retailers.map(r => ({ ...r, createdAt: now, updatedAt: now })),
      recentGames: data.recentGames.map(g => ({ ...g, createdAt: now, updatedAt: now })),
      standings: data.standings.map(s => ({ ...s, updatedAt: now }))
    };

    localStorage.setItem(DB_KEY, JSON.stringify(seedData));
    return seedData;
  }

  private async saveDatabase(data: Database): Promise<void> {
    localStorage.setItem(DB_KEY, JSON.stringify(data));
  }

  async getUsers(): Promise<User[]> {
    const db = await this.getDatabase();
    return db.users;
  }

  async getTeams(): Promise<Team[]> {
    const db = await this.getDatabase();
    return db.teams;
  }

  async getTeamById(id: string): Promise<Team | undefined> {
    const db = await this.getDatabase();
    return db.teams.find(t => t.id === id);
  }

  async updateTeam(team: Team): Promise<Team> {
    const db = await this.getDatabase();
    const index = db.teams.findIndex(t => t.id === team.id);
    if (index === -1) throw new Error('Team not found');

    const updatedTeam = { ...team, updatedAt: new Date().toISOString() };
    db.teams[index] = updatedTeam;
    await this.saveDatabase(db);
    return updatedTeam;
  }

  async getPlayers(): Promise<Player[]> {
    const db = await this.getDatabase();
    return db.players;
  }

  async getPlayerById(id: string): Promise<Player | undefined> {
    const db = await this.getDatabase();
    return db.players.find(p => p.id === id);
  }

  async getPlayersByTeamId(teamId: string): Promise<Player[]> {
    const db = await this.getDatabase();
    return db.players.filter(p => p.teamId === teamId);
  }

  async updatePlayer(player: Player): Promise<Player> {
    const db = await this.getDatabase();
    const index = db.players.findIndex(p => p.id === player.id);
    if (index === -1) throw new Error('Player not found');

    const updatedPlayer = { ...player, updatedAt: new Date().toISOString() };
    db.players[index] = updatedPlayer;
    await this.saveDatabase(db);
    return updatedPlayer;
  }

  async createPlayer(player: Omit<Player, 'id' | 'createdAt' | 'updatedAt'>): Promise<Player> {
    const db = await this.getDatabase();
    const now = new Date().toISOString();
    const newPlayer: Player = {
      ...player,
      id: `p_${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    db.players.push(newPlayer);
    await this.saveDatabase(db);
    return newPlayer;
  }

  async removePlayer(id: string): Promise<void> {
    const db = await this.getDatabase();
    db.players = db.players.filter(p => p.id !== id);
    await this.saveDatabase(db);
  }

  async getStandings(): Promise<Standing[]> {
    const db = await this.getDatabase();
    // Sort by points descending
    return [...db.standings].sort((a, b) => b.points - a.points);
  }

  async getVenues(): Promise<Venue[]> {
    const db = await this.getDatabase();
    return db.venues;
  }

  async getRetailers(): Promise<Retailer[]> {
    const db = await this.getDatabase();
    return db.retailers;
  }

  async getRecentGames(): Promise<Game[]> {
    const db = await this.getDatabase();
    return db.recentGames;
  }
}

export const api = new ApiService();