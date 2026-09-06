import type { Database, Team, Player, Standing, Venue, Retailer, Game, User, League } from '../types';

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

    // Create mock leagues
    const mockLeagues: League[] = [
      { id: 'l1', name: 'Benelux Super League', shortName: 'BSL', region: 'Benelux', createdAt: now, updatedAt: now },
      { id: 'l2', name: 'Eredivisie', shortName: 'ERE', region: 'Netherlands', createdAt: now, updatedAt: now }
    ];

    const seedData = {
      ...data,
      users: [
        { id: 'u1', username: 'League Admin', role: 'admin', createdAt: now, updatedAt: now },
        { id: 'u2', username: 'Flyers Manager', role: 'manager', teamId: 't1', createdAt: now, updatedAt: now },
        { id: 'u3', username: 'Bulldogs Manager', role: 'manager', teamId: 't2', createdAt: now, updatedAt: now },
        { id: 'u4', username: 'Fan Account', role: 'fan', createdAt: now, updatedAt: now }
      ] as User[],
      leagues: mockLeagues,
      teams: data.teams.map((t, idx) => ({
        ...t,
        leagueId: idx % 2 === 0 ? 'l1' : 'l2', // Mock associate teams with leagues
        createdAt: now,
        updatedAt: now
      })),
      players: data.players.map(p => ({ ...p, createdAt: now, updatedAt: now })),
      venues: data.venues.map(v => ({ ...v, createdAt: now, updatedAt: now })),
      retailers: data.retailers.map(r => ({ ...r, createdAt: now, updatedAt: now })),
      games: (data as any).recentGames.map((g: any) => ({ ...g, period: 3, clock: '0:00', createdAt: now, updatedAt: now })),
      standings: data.standings.map(s => ({ ...s, updatedAt: now }))
    };

    // Remove the old property to align with new interface if it's there
    delete (seedData as any).recentGames;

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

  async getLeagues(): Promise<League[]> {
    const db = await this.getDatabase();
    return db.leagues;
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

    // Dynamically calculate standings based on games played
    const standingsMap = new Map<string, Standing>();

    // Initialize all teams
    db.teams.forEach(team => {
      standingsMap.set(team.id, {
        teamId: team.id,
        gamesPlayed: 0,
        wins: 0,
        losses: 0,
        otLosses: 0,
        points: 0,
        goalsFor: 0,
        goalsAgainst: 0
      });
    });

    // Calculate stats
    db.games.filter(g => g.status === 'Final').forEach(game => {
      const homeStanding = standingsMap.get(game.homeTeamId);
      const awayStanding = standingsMap.get(game.awayTeamId);

      if (homeStanding && awayStanding) {
        homeStanding.gamesPlayed += 1;
        awayStanding.gamesPlayed += 1;
        homeStanding.goalsFor += game.homeScore;
        homeStanding.goalsAgainst += game.awayScore;
        awayStanding.goalsFor += game.awayScore;
        awayStanding.goalsAgainst += game.homeScore;

        if (game.homeScore > game.awayScore) {
          homeStanding.wins += 1;
          homeStanding.points += 2;

          if (game.period && game.period > 3) {
             awayStanding.otLosses += 1;
             awayStanding.points += 1;
          } else {
             awayStanding.losses += 1;
          }
        } else {
          awayStanding.wins += 1;
          awayStanding.points += 2;

          if (game.period && game.period > 3) {
             homeStanding.otLosses += 1;
             homeStanding.points += 1;
          } else {
             homeStanding.losses += 1;
          }
        }
      }
    });

    // If no games played, fallback to seed data to ensure the UI looks populated initially (for demonstration)
    // In a pure production app, this would just return the calculated (but 0-filled) standing map.
    const hasCalculatedGames = db.games.some(g => g.status === 'Final');
    if (!hasCalculatedGames && db.standings.length > 0) {
        return [...db.standings].sort((a, b) => b.points - a.points);
    }

    return Array.from(standingsMap.values()).sort((a, b) => b.points - a.points);
  }

  async getVenues(): Promise<Venue[]> {
    const db = await this.getDatabase();
    return db.venues;
  }

  async getRetailers(): Promise<Retailer[]> {
    const db = await this.getDatabase();
    return db.retailers;
  }

  async getGames(): Promise<Game[]> {
    const db = await this.getDatabase();
    return db.games || [];
  }

  async getGameById(id: string): Promise<Game | undefined> {
    const db = await this.getDatabase();
    return db.games?.find(g => g.id === id);
  }

  async updateGame(game: Game): Promise<Game> {
    const db = await this.getDatabase();
    const index = db.games.findIndex(g => g.id === game.id);
    if (index === -1) throw new Error('Game not found');

    const updatedGame = { ...game, updatedAt: new Date().toISOString() };
    db.games[index] = updatedGame;
    await this.saveDatabase(db);
    return updatedGame;
  }
}

export const api = new ApiService();