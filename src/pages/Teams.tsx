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

  if (loading) return <div className="text-center py-20 text-[var(--color-nhl-muted)]">Loading teams...</div>;

  const columns = [
    {
      header: 'Team',
      accessor: (team: Team) => (
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 flex items-center justify-center bg-white rounded-full p-1">
             <img src={team.logo} alt={team.name} className="max-w-full max-h-full object-contain" />
          </div>
          <div>
            <div className="font-bold text-white uppercase">{team.name}</div>
            <div className="text-xs text-[var(--color-nhl-muted)] uppercase">{team.city}, {team.country}</div>
          </div>
        </div>
      ),
      className: 'w-1/2'
    },
    {
      header: 'Arena',
      accessor: 'arena' as keyof Team,
    },
    {
      header: 'Est.',
      accessor: 'established' as keyof Team,
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end border-b border-[var(--color-nhl-border)] pb-4">
        <div>
          <h1 className="text-3xl font-bold uppercase tracking-wider text-white">Teams</h1>
          <p className="text-[var(--color-nhl-muted)] mt-1">Benelux Ice Hockey Ecosystem</p>
        </div>
      </div>

      <DataTable
        data={teams}
        columns={columns}
        keyExtractor={(team) => team.id}
      />
    </div>
  );
}