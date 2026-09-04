import { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { Standing, Team } from '../types';
import DataTable from '../components/DataTable';

export default function Standings() {
  const [standings, setStandings] = useState<Standing[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [standingsData, teamsData] = await Promise.all([
          api.getStandings(),
          api.getTeams()
        ]);
        setStandings(standingsData);
        setTeams(teamsData);
      } catch (error) {
        console.error('Failed to load standings', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) return <div className="text-center py-20 text-[var(--color-nhl-muted)]">Loading standings...</div>;

  const getTeam = (id: string) => teams.find(t => t.id === id);

  const columns = [
    {
      header: 'Rank',
      accessor: (_: Standing) => (
        <span className="font-bold text-[var(--color-nhl-muted)]">
           {/* Simple index calculation for rank, assuming data is already sorted by points */}
           {standings.indexOf(_) + 1}
        </span>
      ),
      className: 'w-12 text-center'
    },
    {
      header: 'Team',
      accessor: (standing: Standing) => {
        const team = getTeam(standing.teamId);
        return (
          <div className="flex items-center space-x-3">
            {team?.logo && (
              <div className="w-6 h-6 flex items-center justify-center bg-white rounded-full p-0.5">
                <img src={team.logo} alt="" className="max-w-full max-h-full object-contain" />
              </div>
            )}
            <span className="font-bold text-white uppercase">{team?.name || standing.teamId}</span>
          </div>
        );
      },
    },
    { header: 'GP', accessor: 'gamesPlayed' as keyof Standing, className: 'text-center' },
    { header: 'W', accessor: 'wins' as keyof Standing, className: 'text-center' },
    { header: 'L', accessor: 'losses' as keyof Standing, className: 'text-center' },
    { header: 'OTL', accessor: 'otLosses' as keyof Standing, className: 'text-center text-[var(--color-nhl-muted)]' },
    { header: 'PTS', accessor: 'points' as keyof Standing, className: 'text-center font-bold text-[var(--color-nhl-accent)] text-lg' },
    { header: 'GF', accessor: 'goalsFor' as keyof Standing, className: 'text-center hidden md:table-cell' },
    { header: 'GA', accessor: 'goalsAgainst' as keyof Standing, className: 'text-center hidden md:table-cell' },
    {
      header: 'DIFF',
      accessor: (s: Standing) => {
        const diff = s.goalsFor - s.goalsAgainst;
        return <span className={diff > 0 ? 'text-green-500' : diff < 0 ? 'text-red-500' : ''}>{diff > 0 ? `+${diff}` : diff}</span>;
      },
      className: 'text-center'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-[var(--color-nhl-border)] pb-4">
        <h1 className="text-3xl font-bold uppercase tracking-wider text-white">League Standings</h1>
        <p className="text-[var(--color-nhl-muted)] mt-1">Current season points and rankings</p>
      </div>

      <DataTable
        data={standings}
        columns={columns}
        keyExtractor={(s) => s.teamId}
      />
    </div>
  );
}