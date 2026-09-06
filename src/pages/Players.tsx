import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import type { Player, Team } from '../types';
import DataTable from '../components/DataTable';

export default function Players() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [playersData, teamsData] = await Promise.all([
          api.getPlayers(),
          api.getTeams()
        ]);
        // Sort players by points descending
        setPlayers([...playersData].sort((a, b) => b.points - a.points));
        setTeams(teamsData);
      } catch (error) {
        console.error('Failed to load players', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) return <div className="text-center py-20 text-slate-500 font-medium">Loading players...</div>;

  const getTeam = (id: string) => teams.find(t => t.id === id);

  const columns = [
    {
      header: 'PLAYER',
      accessor: (player: Player) => (
        <div className="flex items-center space-x-3 py-1">
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs border border-slate-200">
            #{player.number}
          </div>
          <Link to={`/players/${player.id}`} className="font-bold text-slate-900 hover:text-blue-600 transition-colors">
            {player.name}
          </Link>
        </div>
      ),
      className: 'w-1/3'
    },
    {
      header: 'TEAM',
      accessor: (player: Player) => {
        const team = getTeam(player.teamId);
        return (
          <Link to={`/teams/${player.teamId}`} className="flex items-center space-x-2 hover:bg-slate-50 p-1 -ml-1 rounded transition-colors">
            {team?.logo && <img src={team.logo} alt="" className="w-6 h-6 object-contain" />}
            <span className="text-slate-600 font-semibold uppercase text-xs tracking-wider hover:text-blue-600 transition-colors">{team?.shortName || player.teamId}</span>
          </Link>
        );
      },
    },
    { header: 'POS', accessor: 'position' as keyof Player, className: 'text-center text-slate-500 font-bold' },
    { header: 'GP', accessor: 'gamesPlayed' as keyof Player, className: 'text-center font-medium' },
    { header: 'G', accessor: 'goals' as keyof Player, className: 'text-center font-medium' },
    { header: 'A', accessor: 'assists' as keyof Player, className: 'text-center font-medium' },
    { header: 'PTS', accessor: 'points' as keyof Player, className: 'text-center font-black text-slate-900' }
  ];

  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-8 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-black italic tracking-tighter uppercase text-slate-900">Player Statistics</h1>
        <p className="text-slate-500 mt-2 font-medium">League leaders in points, goals, and assists</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <DataTable
          data={players}
          columns={columns}
          keyExtractor={(p) => p.id}
        />
      </div>
    </div>
  );
}
