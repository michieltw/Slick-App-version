import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import type { Player, Team } from '../types';
import { User } from 'lucide-react';

export default function PlayerProfile() {
  const { id } = useParams<{ id: string }>();
  const [player, setPlayer] = useState<Player | null>(null);
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      try {
        const playerData = await api.getPlayerById(id);
        setPlayer(playerData || null);

        if (playerData?.teamId) {
          const teamData = await api.getTeamById(playerData.teamId);
          setTeam(teamData || null);
        }
      } catch (error) {
        console.error('Failed to load player data', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  if (loading) return <div className="text-center py-20 text-slate-500 font-medium">Loading profile...</div>;
  if (!player) return <div className="text-center py-20 text-slate-500 font-medium">Player not found</div>;

  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-8 space-y-8">
      {/* Profile Header */}
      <div className="bg-slate-900 rounded-2xl p-8 text-white relative overflow-hidden shadow-lg">
        {/* Background Accent */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-slate-800 rounded-full opacity-50 blur-3xl"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
          {/* Avatar / Number */}
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-slate-800 border-4 border-slate-700 flex items-center justify-center flex-shrink-0">
            {player.number ? (
              <span className="text-5xl md:text-6xl font-black italic tracking-tighter text-slate-400">
                {player.number}
              </span>
            ) : (
              <User className="w-16 h-16 text-slate-500" />
            )}
          </div>

          <div className="flex-1 text-center md:text-left space-y-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase">{player.name}</h1>
              <div className="flex items-center justify-center md:justify-start mt-2 space-x-3 text-slate-400 font-bold uppercase tracking-wider text-sm">
                <span className="px-3 py-1 bg-slate-800 rounded-md">POS: {player.position}</span>
                {team && (
                  <Link to={`/teams/${team.id}`} className="px-3 py-1 bg-slate-800 rounded-md hover:bg-slate-700 hover:text-white transition-colors flex items-center">
                    {team.logo && <img src={team.logo} alt="" className="w-4 h-4 mr-2 object-contain" />}
                    {team.shortName || team.name}
                  </Link>
                )}
              </div>
            </div>

            {player.bio && (
              <p className="text-slate-300 max-w-2xl text-sm leading-relaxed font-medium">
                {player.bio}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div>
        <h2 className="text-2xl font-black italic tracking-tighter uppercase text-slate-900 mb-6">Season Stats</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 p-6 rounded-xl flex flex-col items-center justify-center text-center shadow-sm">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Games Played</span>
            <span className="text-4xl font-black text-slate-900">{player.gamesPlayed}</span>
          </div>
          <div className="bg-white border border-slate-200 p-6 rounded-xl flex flex-col items-center justify-center text-center shadow-sm">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Goals</span>
            <span className="text-4xl font-black text-slate-900">{player.goals}</span>
          </div>
          <div className="bg-white border border-slate-200 p-6 rounded-xl flex flex-col items-center justify-center text-center shadow-sm">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Assists</span>
            <span className="text-4xl font-black text-slate-900">{player.assists}</span>
          </div>
          <div className="bg-slate-50 border border-slate-200 p-6 rounded-xl flex flex-col items-center justify-center text-center shadow-sm">
            <span className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Total Points</span>
            <span className="text-5xl font-black text-slate-900">{player.points}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
