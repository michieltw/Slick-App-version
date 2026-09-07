import type { Database, Team, Player, Standing, Venue, Retailer, Game, User, League, Post, Comment, GameEvent } from '../types';

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
    const defaultRules = {
      pointsForWin: 3, // Modern IIHF standard
      pointsForOTWin: 2,
      pointsForTie: 1, // Rare but supported
      pointsForOTLoss: 1,
      periodCount: 3
    };

    const mockLeagues: League[] = [
      { id: 'l1', name: 'Benelux Super League', shortName: 'BSL', region: 'Benelux', rules: { ...defaultRules }, createdAt: now, updatedAt: now },
      { id: 'l2', name: 'Eredivisie', shortName: 'ERE', region: 'Netherlands', rules: { ...defaultRules, pointsForWin: 2 }, createdAt: now, updatedAt: now }
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
      posts: [
        { id: 'post1', authorId: 'u2', authorName: 'Flyers Manager', authorRole: 'manager', authorTeamId: 't1', content: 'Great win tonight boys! The fans were amazing.', likes: 12, createdAt: now, updatedAt: now },
        { id: 'post2', authorId: 'u1', authorName: 'League Admin', authorRole: 'admin', content: 'Welcome to the new Benelux Play app. Report any bugs to support.', likes: 5, createdAt: now, updatedAt: now }
      ] as Post[],
      comments: [
        { id: 'c1', postId: 'post1', authorId: 'u4', authorName: 'Fan Account', content: 'Incredible game!!', createdAt: now, updatedAt: now }
      ] as Comment[],
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
      gameEvents: [],
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

  async updateLeague(league: League): Promise<League> {
    const db = await this.getDatabase();
    const index = db.leagues.findIndex(l => l.id === league.id);
    if (index === -1) throw new Error('League not found');

    const updatedLeague = { ...league, updatedAt: new Date().toISOString() };
    db.leagues[index] = updatedLeague;
    await this.saveDatabase(db);
    return updatedLeague;
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
    return this.calculateDynamicPlayerStats(db.players, db.games, db.gameEvents || []);
  }

  async getPlayerById(id: string): Promise<Player | undefined> {
    const db = await this.getDatabase();
    const players = this.calculateDynamicPlayerStats(db.players, db.games, db.gameEvents || []);
    return players.find(p => p.id === id);
  }

  async getPlayersByTeamId(teamId: string): Promise<Player[]> {
    const db = await this.getDatabase();
    const players = this.calculateDynamicPlayerStats(db.players.filter(p => p.teamId === teamId), db.games, db.gameEvents || []);
    return players;
  }

  private calculateDynamicPlayerStats(players: Player[], games: Game[], events: GameEvent[]): Player[] {
    const playerStats = new Map<string, { gp: number; goals: number; assists: number; points: number }>();

    // Init stats cache
    players.forEach(p => playerStats.set(p.id, { gp: 0, goals: 0, assists: 0, points: 0 }));

    // Calculate Games Played based on finalized games for their team
    const finalizedGames = games.filter(g => g.status === 'Final');
    finalizedGames.forEach(game => {
       // Ideally we'd have a 'Roster' table for who dressed each game, but here we assume
       // everyone on the current team roster played in the game
       players.forEach(p => {
          if (p.teamId === game.homeTeamId || p.teamId === game.awayTeamId) {
             const stat = playerStats.get(p.id)!;
             stat.gp += 1;
          }
       });
    });

    // Process scoring events
    events.forEach(event => {
       if (event.type === 'goal') {
          if (playerStats.has(event.playerId)) {
             const stat = playerStats.get(event.playerId)!;
             stat.goals += 1;
             stat.points += 1;
          }
          if (event.assist1Id && playerStats.has(event.assist1Id)) {
             const stat = playerStats.get(event.assist1Id)!;
             stat.assists += 1;
             stat.points += 1;
          }
          if (event.assist2Id && playerStats.has(event.assist2Id)) {
             const stat = playerStats.get(event.assist2Id)!;
             stat.assists += 1;
             stat.points += 1;
          }
       }
    });

    // Merge stats with base player data, falling back to seed data if they have 0 GP
    // (So that the UI doesn't look empty when no live games have been played yet)
    const hasLiveStats = events.length > 0 || finalizedGames.length > 0;

    return players.map(p => {
      const stats = playerStats.get(p.id)!;
      if (hasLiveStats) {
         return {
           ...p,
           gamesPlayed: stats.gp,
           goals: stats.goals,
           assists: stats.assists,
           points: stats.points
         };
      }
      return p;
    });
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

        // Get League rules for point calculation based on home team's league
        // We assume away team is in same league
        const homeTeam = db.teams.find(t => t.id === game.homeTeamId);
        const league = db.leagues.find(l => l.id === homeTeam?.leagueId);
        const rules = league?.rules || { pointsForWin: 2, pointsForOTWin: 2, pointsForOTLoss: 1, pointsForTie: 1, periodCount: 3 };

        const isOT = game.period && game.period > rules.periodCount;

        if (game.homeScore > game.awayScore) {
          homeStanding.wins += 1;
          homeStanding.points += isOT ? rules.pointsForOTWin : rules.pointsForWin;

          if (isOT) {
             awayStanding.otLosses += 1;
             awayStanding.points += rules.pointsForOTLoss;
          } else {
             awayStanding.losses += 1;
          }
        } else if (game.awayScore > game.homeScore) {
          awayStanding.wins += 1;
          awayStanding.points += isOT ? rules.pointsForOTWin : rules.pointsForWin;

          if (isOT) {
             homeStanding.otLosses += 1;
             homeStanding.points += rules.pointsForOTLoss;
          } else {
             homeStanding.losses += 1;
          }
        } else {
          // Tie
          homeStanding.points += rules.pointsForTie;
          awayStanding.points += rules.pointsForTie;
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

  async createVenue(venue: Omit<Venue, 'id' | 'createdAt' | 'updatedAt'>): Promise<Venue> {
    const db = await this.getDatabase();
    const now = new Date().toISOString();
    const newVenue: Venue = {
      ...venue,
      id: `v_${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    db.venues.push(newVenue);
    await this.saveDatabase(db);
    return newVenue;
  }

  async updateVenue(venue: Venue): Promise<Venue> {
    const db = await this.getDatabase();
    const index = db.venues.findIndex(v => v.id === venue.id);
    if (index === -1) throw new Error('Venue not found');

    const updatedVenue = { ...venue, updatedAt: new Date().toISOString() };
    db.venues[index] = updatedVenue;
    await this.saveDatabase(db);
    return updatedVenue;
  }

  async deleteVenue(id: string): Promise<void> {
    const db = await this.getDatabase();
    db.venues = db.venues.filter(v => v.id !== id);
    await this.saveDatabase(db);
  }

  async getRetailers(): Promise<Retailer[]> {
    const db = await this.getDatabase();
    return db.retailers;
  }

  async createRetailer(retailer: Omit<Retailer, 'id' | 'createdAt' | 'updatedAt'>): Promise<Retailer> {
    const db = await this.getDatabase();
    const now = new Date().toISOString();
    const newRetailer: Retailer = {
      ...retailer,
      id: `r_${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    db.retailers.push(newRetailer);
    await this.saveDatabase(db);
    return newRetailer;
  }

  async updateRetailer(retailer: Retailer): Promise<Retailer> {
    const db = await this.getDatabase();
    const index = db.retailers.findIndex(r => r.id === retailer.id);
    if (index === -1) throw new Error('Retailer not found');

    const updatedRetailer = { ...retailer, updatedAt: new Date().toISOString() };
    db.retailers[index] = updatedRetailer;
    await this.saveDatabase(db);
    return updatedRetailer;
  }

  async deleteRetailer(id: string): Promise<void> {
    const db = await this.getDatabase();
    db.retailers = db.retailers.filter(r => r.id !== id);
    await this.saveDatabase(db);
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

  async getGameEvents(gameId: string): Promise<GameEvent[]> {
    const db = await this.getDatabase();
    return (db.gameEvents || []).filter(e => e.gameId === gameId).sort((a, b) => {
      // Sort by period, then by clock
      if (a.period !== b.period) return a.period - b.period;
      // Clock is string 'MM:SS' where 20:00 counts down to 00:00, so we reverse string sort
      return b.clock.localeCompare(a.clock);
    });
  }

  async createGameEvent(event: Omit<GameEvent, 'id' | 'createdAt' | 'updatedAt'>): Promise<GameEvent> {
    const db = await this.getDatabase();
    const now = new Date().toISOString();
    const newEvent: GameEvent = {
      ...event,
      id: `evt_${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    if (!db.gameEvents) db.gameEvents = [];
    db.gameEvents.push(newEvent);
    await this.saveDatabase(db);
    return newEvent;
  }

  async deleteGameEvent(id: string): Promise<void> {
    const db = await this.getDatabase();
    if (!db.gameEvents) return;
    db.gameEvents = db.gameEvents.filter(e => e.id !== id);
    await this.saveDatabase(db);
  }

  async getPosts(): Promise<Post[]> {
    const db = await this.getDatabase();
    return [...(db.posts || [])].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }

  async getPostsByTeamId(teamId: string): Promise<Post[]> {
    const db = await this.getDatabase();
    return (db.posts || [])
      .filter(p => p.authorTeamId === teamId)
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }

  async createPost(post: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>): Promise<Post> {
    const db = await this.getDatabase();
    const now = new Date().toISOString();
    const newPost: Post = {
      ...post,
      id: `post_${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    if (!db.posts) db.posts = [];
    db.posts.push(newPost);
    await this.saveDatabase(db);
    return newPost;
  }

  async updatePost(post: Post): Promise<Post> {
    const db = await this.getDatabase();
    const index = db.posts.findIndex(p => p.id === post.id);
    if (index === -1) throw new Error('Post not found');

    const updatedPost = { ...post, updatedAt: new Date().toISOString() };
    db.posts[index] = updatedPost;
    await this.saveDatabase(db);
    return updatedPost;
  }

  async getCommentsByPostId(postId: string): Promise<Comment[]> {
    const db = await this.getDatabase();
    return (db.comments || []).filter(c => c.postId === postId);
  }

  async createComment(comment: Omit<Comment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Comment> {
    const db = await this.getDatabase();
    const now = new Date().toISOString();
    const newComment: Comment = {
      ...comment,
      id: `c_${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    if (!db.comments) db.comments = [];
    db.comments.push(newComment);
    await this.saveDatabase(db);
    return newComment;
  }
}

export const api = new ApiService();