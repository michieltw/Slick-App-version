import type { Database, Team, Player, Standing, Venue, Retailer, Game } from '../types';

class ApiService {
  private data: Database | null = null;
  private fetchPromise: Promise<Database> | null = null;

  private async getDatabase(): Promise<Database> {
    if (this.data) return this.data;

    if (!this.fetchPromise) {
      this.fetchPromise = fetch('/data/db.json')
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch database');
          return res.json();
        })
        .then(data => {
          this.data = data;
          return data;
        });
    }

    return this.fetchPromise;
  }

  async getTeams(): Promise<Team[]> {
    const db = await this.getDatabase();
    return db.teams;
  }

  async getTeamById(id: string): Promise<Team | undefined> {
    const db = await this.getDatabase();
    return db.teams.find(t => t.id === id);
  }

  async getPlayers(): Promise<Player[]> {
    const db = await this.getDatabase();
    return db.players;
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