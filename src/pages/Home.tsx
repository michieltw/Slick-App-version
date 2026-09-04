import { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { Game, Team } from '../types';

export default function Home() {
  const [games, setGames] = useState<Game[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [recentGames, allTeams] = await Promise.all([
          api.getRecentGames(),
          api.getTeams()
        ]);
        setGames(recentGames);
        setTeams(allTeams);
      } catch (error) {
        console.error('Failed to load home data', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const getTeamName = (id: string) => {
    const team = teams.find(t => t.id === id);
    return team ? team.name : id;
  };

  const getTeamLogo = (id: string) => {
    const team = teams.find(t => t.id === id);
    return team?.logo || '';
  };

  if (loading) return <div className="text-center py-20 text-[var(--color-nhl-muted)]">Loading...</div>;

  return (
    <div className="space-y-8">
      <section className="relative h-[400px] rounded-lg overflow-hidden flex items-end">
        <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-[#111]/70 to-transparent z-10" />
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Hockey_Ice.jpg/1200px-Hockey_Ice.jpg"
          alt="Ice Hockey"
          className="absolute inset-0 w-full h-full object-cover opacity-50"
        />
        <div className="relative z-20 p-8">
          <span className="inline-block px-2 py-1 bg-[var(--color-nhl-accent)] text-white text-xs font-bold uppercase tracking-wider mb-3">
            Latest News
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 uppercase tracking-tight">
            The New Season is Here
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl">
            Follow the latest action from the Benelux ice hockey ecosystem. Get real-time updates, standings, and player statistics all in one place.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold uppercase tracking-wider mb-6 border-b border-[var(--color-nhl-border)] pb-2">
          Recent Scores
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map(game => (
            <div key={game.id} className="bg-[var(--color-nhl-panel)] border border-[var(--color-nhl-border)] rounded hover:border-[var(--color-nhl-accent)] transition-colors cursor-pointer overflow-hidden">
              <div className="bg-[#222] px-4 py-2 text-xs font-semibold text-[var(--color-nhl-muted)] uppercase tracking-wider border-b border-[var(--color-nhl-border)] flex justify-between">
                <span>{new Date(game.date).toLocaleDateString()}</span>
                <span>{game.status}</span>
              </div>

              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img src={getTeamLogo(game.awayTeamId)} alt="" className="w-8 h-8 object-contain" />
                    <span className="font-semibold">{getTeamName(game.awayTeamId)}</span>
                  </div>
                  <span className="text-xl font-bold text-[var(--color-nhl-muted)]">{game.awayScore}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img src={getTeamLogo(game.homeTeamId)} alt="" className="w-8 h-8 object-contain" />
                    <span className="font-semibold text-white">{getTeamName(game.homeTeamId)}</span>
                  </div>
                  <span className="text-xl font-bold text-white">{game.homeScore}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}