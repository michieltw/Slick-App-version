import { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { Team } from '../types';
import DataTable from '../components/DataTable';

export default function Teams() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await api.getTeams();
        setTeams(data);
      } catch (error) {
        console.error('Failed to load teams', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) return <div className="text-center py-20 text-slate-500 font-medium">Loading teams...</div>;

  const columns = [
    {
      header: 'TEAM',
      accessor: (team: Team) => (
        <div className="flex items-center space-x-4 py-1">
          <img src={team.logo} alt={team.name} className="w-10 h-10 object-contain" />
          <div>
            <div className="font-bold text-slate-900">{team.name}</div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">{team.city}, {team.country}</div>
          </div>
        </div>
      ),
      className: 'w-1/2'
    },
    {
      header: 'ARENA',
      accessor: 'arena' as keyof Team,
      className: 'font-medium'
    },
    {
      header: 'EST.',
      accessor: 'established' as keyof Team,
      className: 'font-medium'
    }
  ];

  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-8 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-black italic tracking-tighter uppercase text-slate-900">Teams</h1>
        <p className="text-slate-500 mt-2 font-medium">Benelux Ice Hockey Ecosystem</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <DataTable
          data={teams}
          columns={columns}
          keyExtractor={(team) => team.id}
        />
      </div>
    </div>
  );
}
