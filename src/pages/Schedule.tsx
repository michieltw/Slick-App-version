import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import type { Game, Team } from '../types';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Schedule() {
  const [games, setGames] = useState<Game[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    async function loadData() {
      try {
        const [gamesData, teamsData] = await Promise.all([
          api.getGames(),
          api.getTeams()
        ]);
        setGames(gamesData);
        setTeams(teamsData);
      } catch (error) {
        console.error('Failed to load schedule', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const getTeam = (id: string) => teams.find(t => t.id === id);

  if (loading) return <div className="text-center py-20 text-slate-500 font-medium">Loading schedule...</div>;

  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-8 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-black italic tracking-tighter uppercase text-slate-900">League Schedule</h1>
        <p className="text-slate-500 mt-2 font-medium">Upcoming matches and recent results</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {games.map((game) => {
          const homeTeam = getTeam(game.homeTeamId);
          const awayTeam = getTeam(game.awayTeamId);
          const date = new Date(game.date);

          // Check if user is authorized to keep score for this game
          const isAuthorized = user?.role === 'admin' || (user?.role === 'manager' && (user.teamId === game.homeTeamId || user.teamId === game.awayTeamId));

          return (
            <div key={game.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:border-slate-300 transition-colors flex flex-col">

              {/* Card Header - Status & Date */}
              <div className="bg-slate-50 border-b border-slate-100 px-5 py-3 flex justify-between items-center">
                <div className="flex items-center space-x-2 text-sm font-semibold text-slate-500">
                  <CalendarIcon className="w-4 h-4" />
                  <span>{date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                  <span className="text-slate-300">|</span>
                  <Clock className="w-4 h-4" />
                  <span>{date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
                </div>

                <span className={`px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-md ${
                  game.status === 'In Progress' ? 'bg-rose-100 text-rose-700' :
                  game.status === 'Final' ? 'bg-slate-200 text-slate-700' :
                  'bg-emerald-100 text-emerald-700'
                }`}>
                  {game.status}
                </span>
              </div>

              {/* Matchup Body */}
              <div className="p-6 flex-grow flex flex-col justify-center space-y-4">

                {/* Away Team */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {awayTeam?.logo && <img src={awayTeam.logo} alt={awayTeam.name} className="w-12 h-12 object-contain" />}
                    <div>
                      <div className="font-bold text-slate-900 text-lg">{awayTeam?.name || 'Unknown'}</div>
                      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Away</div>
                    </div>
                  </div>
                  <div className={`text-3xl font-black ${game.awayScore > game.homeScore && game.status === 'Final' ? 'text-slate-900' : 'text-slate-400'}`}>
                    {game.awayScore}
                  </div>
                </div>

                <div className="relative flex items-center justify-center py-2">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
                  <span className="relative bg-white px-3 text-xs font-bold text-slate-300 uppercase">VS</span>
                </div>

                {/* Home Team */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {homeTeam?.logo && <img src={homeTeam.logo} alt={homeTeam.name} className="w-12 h-12 object-contain" />}
                    <div>
                      <div className="font-bold text-slate-900 text-lg">{homeTeam?.name || 'Unknown'}</div>
                      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Home</div>
                    </div>
                  </div>
                  <div className={`text-3xl font-black ${game.homeScore > game.awayScore && game.status === 'Final' ? 'text-slate-900' : 'text-slate-400'}`}>
                    {game.homeScore}
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              {isAuthorized && (
                <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex justify-end">
                  <Link
                    to={`/games/${game.id}/scorekeeper`}
                    className="text-sm font-bold bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
                  >
                    Launch Scorekeeper
                  </Link>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
