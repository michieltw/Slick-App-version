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

  if (loading) return <div className="text-center py-20 text-slate-500 font-medium">Loading standings...</div>;

  const getTeam = (id: string) => teams.find(t => t.id === id);

  const columns = [
    {
      header: 'RANK',
      accessor: (_: Standing) => (
        <span className="font-bold text-slate-400">
           {standings.indexOf(_) + 1}
        </span>
      ),
      className: 'w-12 text-center'
    },
    {
      header: 'TEAM',
      accessor: (standing: Standing) => {
        const team = getTeam(standing.teamId);
        return (
          <div className="flex items-center space-x-3 py-1">
            {team?.logo && (
              <img src={team.logo} alt="" className="w-8 h-8 object-contain" />
            )}
            <span className="font-bold text-slate-900">{team?.name || standing.teamId}</span>
          </div>
        );
      },
    },
    { header: 'GP', accessor: 'gamesPlayed' as keyof Standing, className: 'text-center font-medium' },
    { header: 'W', accessor: 'wins' as keyof Standing, className: 'text-center font-medium' },
    { header: 'L', accessor: 'losses' as keyof Standing, className: 'text-center font-medium' },
    { header: 'OTL', accessor: 'otLosses' as keyof Standing, className: 'text-center text-slate-400 font-medium' },
    { header: 'PTS', accessor: 'points' as keyof Standing, className: 'text-center font-black text-slate-900 text-lg' },
    { header: 'GF', accessor: 'goalsFor' as keyof Standing, className: 'text-center hidden md:table-cell font-medium' },
    { header: 'GA', accessor: 'goalsAgainst' as keyof Standing, className: 'text-center hidden md:table-cell font-medium' },
    {
      header: 'DIFF',
      accessor: (s: Standing) => {
        const diff = s.goalsFor - s.goalsAgainst;
        return <span className={`font-semibold ${diff > 0 ? 'text-emerald-600' : diff < 0 ? 'text-rose-600' : 'text-slate-600'}`}>{diff > 0 ? `+${diff}` : diff}</span>;
      },
      className: 'text-center'
    }
  ];

  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-8 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-black italic tracking-tighter uppercase text-slate-900">League Standings</h1>
        <p className="text-slate-500 mt-2 font-medium">Current season points and rankings</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <DataTable
          data={standings}
          columns={columns}
          keyExtractor={(s) => s.teamId}
        />
      </div>
    </div>
  );
}
