import { useEffect, useState } from 'react';
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

  if (loading) return <div className="text-center py-20 text-[var(--color-nhl-muted)]">Loading players...</div>;

  const getTeam = (id: string) => teams.find(t => t.id === id);

  const columns = [
    {
      header: 'Player',
      accessor: (player: Player) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-[var(--color-nhl-panel-hover)] flex items-center justify-center text-[var(--color-nhl-muted)] font-bold text-xs border border-[var(--color-nhl-border)]">
            #{player.number}
          </div>
          <span className="font-bold text-white uppercase">{player.name}</span>
        </div>
      ),
      className: 'w-1/3'
    },
    {
      header: 'Team',
      accessor: (player: Player) => {
        const team = getTeam(player.teamId);
        return (
          <div className="flex items-center space-x-2">
            {team?.logo && <img src={team.logo} alt="" className="w-5 h-5 object-contain bg-white rounded-full p-0.5" />}
            <span className="text-[var(--color-nhl-muted)] uppercase text-xs">{team?.shortName || player.teamId}</span>
          </div>
        );
      },
    },
    { header: 'POS', accessor: 'position' as keyof Player, className: 'text-center text-[var(--color-nhl-muted)] font-bold' },
    { header: 'GP', accessor: 'gamesPlayed' as keyof Player, className: 'text-center' },
    { header: 'G', accessor: 'goals' as keyof Player, className: 'text-center' },
    { header: 'A', accessor: 'assists' as keyof Player, className: 'text-center' },
    { header: 'PTS', accessor: 'points' as keyof Player, className: 'text-center font-bold text-white' }
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-[var(--color-nhl-border)] pb-4">
        <h1 className="text-3xl font-bold uppercase tracking-wider text-white">Player Statistics</h1>
        <p className="text-[var(--color-nhl-muted)] mt-1">League leaders in points, goals, and assists</p>
      </div>

      <DataTable
        data={players}
        columns={columns}
        keyExtractor={(p) => p.id}
      />
    </div>
  );
}