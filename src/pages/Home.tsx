import { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { Game, Team } from '../types';
import { Info, ChevronDown } from 'lucide-react';

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

  const getTeamLogo = (id: string) => {
    const team = teams.find(t => t.id === id);
    return team?.logo || '';
  };

  const getTeamShortName = (id: string) => {
    const team = teams.find(t => t.id === id);
    if (!team) return id;
    // Extract a 3-letter abbreviation from the team name for the cards (e.g. "Flyers" -> "FLY")
    return team.name.substring(0, 3).toUpperCase();
  };

  if (loading) return <div className="text-center py-20 text-slate-500 font-medium">Loading...</div>;

  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-8 space-y-12">

      {/* Alert Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 flex items-center space-x-3 text-slate-700">
        <Info className="w-5 h-5 text-slate-400" />
        <span className="text-sm font-medium">
          The season is currently on break. Check out the latest stats, historical picks, and get ready for the new matches!
        </span>
      </div>

      {/* Leader Picks Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black italic text-slate-900 tracking-tighter uppercase">
            2023-24 LEADER PICKS
          </h2>
        </div>

        {/* We use grid to emulate the "Leader Picks" cards from nhlplay.online */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {games.slice(0, 4).map((game, i) => (
            <div key={game.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col hover:border-slate-300 transition-colors">
              {/* Card Header */}
              <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-200/50 px-2 py-0.5 rounded-sm">
                  OPEN
                </span>
                <span className="text-[12px] font-semibold text-slate-500">
                  {new Date(game.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
              </div>

              {/* Card Body - Teams */}
              <div className="p-5 flex-grow flex justify-between items-center">
                <div className="flex flex-col items-center">
                  <img src={getTeamLogo(game.awayTeamId)} alt="" className="w-12 h-12 object-contain mb-2" />
                  <span className="text-lg font-black text-slate-900">{getTeamShortName(game.awayTeamId)}</span>
                </div>

                <span className="text-sm font-bold text-slate-400">@</span>

                <div className="flex flex-col items-center">
                  <img src={getTeamLogo(game.homeTeamId)} alt="" className="w-12 h-12 object-contain mb-2" />
                  <span className="text-lg font-black text-slate-900">{getTeamShortName(game.homeTeamId)}</span>
                </div>
              </div>

              {/* Action Button */}
              <div className="px-5 pb-5">
                <button className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-lg transition-colors">
                  Sign In to Pick
                </button>
              </div>

              {/* Footer numbers */}
              <div className="bg-slate-50 px-5 py-3 border-t border-slate-100">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-slate-500">Match #{i + 1}</span>
                  <span className="text-xs font-bold text-slate-900">100 pts</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Divider with Button */}
        <div className="relative mt-12 mb-16 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <button className="relative bg-white border border-slate-200 px-6 py-2 rounded-full text-sm font-bold text-slate-700 flex items-center hover:bg-slate-50 transition-colors">
            View Leaders
            <ChevronDown className="w-4 h-4 ml-1" />
          </button>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl p-8 md:p-12 text-center text-white shadow-lg">
        <h2 className="text-3xl md:text-4xl font-black italic tracking-tighter uppercase mb-4">
          ENJOYING BNLPLAY?
        </h2>
        <p className="text-blue-50 text-lg md:text-xl font-medium max-w-2xl mx-auto mb-8">
          Join thousands of fans making picks, predicting matches, and climbing the leaderboards in the Benelux Ice Hockey ecosystem.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <button className="w-full sm:w-auto px-8 py-3 bg-white text-slate-900 text-[15px] font-bold rounded-lg hover:bg-slate-50 transition-colors">
            Sign Up Free
          </button>
          <button className="w-full sm:w-auto px-8 py-3 bg-slate-900 text-white text-[15px] font-bold rounded-lg hover:bg-slate-800 transition-colors">
            Log In
          </button>
        </div>
      </section>

    </div>
  );
}
