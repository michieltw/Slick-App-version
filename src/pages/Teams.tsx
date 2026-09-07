import LoadingSpinner from "../components/LoadingSpinner";
import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import type { Team, League } from '../types';
import DataTable from '../components/DataTable';

export default function Teams() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [activeLeagueId, setActiveLeagueId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [teamsData, leaguesData] = await Promise.all([
          api.getTeams(),
          api.getLeagues()
        ]);
        setTeams(teamsData);
        setLeagues(leaguesData);

        if (leaguesData.length > 0) {
          setActiveLeagueId(leaguesData[0].id);
        }
      } catch (error) {
        console.error('Failed to load teams', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredTeams = useMemo(() => {
    if (!activeLeagueId) return teams;
    return teams.filter(t => t.leagueId === activeLeagueId);
  }, [teams, activeLeagueId]);

  if (loading) return <LoadingSpinner />;

  const columns = [
    {
      header: 'TEAM',
      accessor: (team: Team) => (
        <Link to={`/teams/${team.id}`} className="flex items-center space-x-4 py-2 hover:bg-slate-50 transition-colors rounded-lg -ml-2 p-2">
          <img src={team.logo} alt={team.name} className="w-10 h-10 object-contain" />
          <div>
            <div className="font-bold text-slate-900 hover:text-blue-600 transition-colors">{team.name}</div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">{team.city}, {team.country}</div>
          </div>
        </Link>
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
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black italic tracking-tighter uppercase text-slate-900">Teams</h1>
          <p className="text-slate-500 mt-2 font-medium">Benelux Ice Hockey Ecosystem</p>
        </div>

        {/* League Selector */}
        {leagues.length > 0 && (
          <div className="flex space-x-2 bg-slate-100 p-1 rounded-lg self-start">
            {leagues.map(league => (
              <button
                key={league.id}
                onClick={() => setActiveLeagueId(league.id)}
                className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${
                  activeLeagueId === league.id
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {league.shortName}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <DataTable
          data={filteredTeams}
          columns={columns}
          keyExtractor={(team) => team.id}
        />
      </div>
    </div>
  );
}
