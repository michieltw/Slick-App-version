import LoadingSpinner from "../components/LoadingSpinner";
import { useState, useMemo, useCallback } from 'react';
import { api } from '../services/api';
import type { Standing, Team, League } from '../types';
import DataTable from '../components/DataTable';
import { usePolling } from '../hooks/usePolling';

export default function Standings() {
  const [standings, setStandings] = useState<Standing[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [activeLeagueId, setActiveLeagueId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [standingsData, teamsData, leaguesData] = await Promise.all([
        api.getStandings(),
        api.getTeams(),
        api.getLeagues()
      ]);
      setStandings(standingsData);
      setTeams(teamsData);
      setLeagues(leaguesData);

      if (leaguesData.length > 0 && !activeLeagueId) {
        setActiveLeagueId(leaguesData[0].id);
      }

      setLoading(false);
    } catch (error) {
      console.error('Failed to load standings', error);
    }
  }, [activeLeagueId]);

  usePolling(loadData, 5000);

  const getTeam = (id: string) => teams.find(t => t.id === id);

  const filteredStandings = useMemo(() => {
    if (!activeLeagueId) return standings;
    const leagueTeamIds = new Set(teams.filter(t => t.leagueId === activeLeagueId).map(t => t.id));
    return standings.filter(s => leagueTeamIds.has(s.teamId)).sort((a, b) => b.points - a.points);
  }, [standings, teams, activeLeagueId]);

  if (loading) return <LoadingSpinner />;


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
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black italic tracking-tighter uppercase text-slate-900">League Standings</h1>
          <p className="text-slate-500 mt-2 font-medium">Current season points and rankings</p>
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
          data={filteredStandings}
          columns={columns}
          keyExtractor={(s) => s.teamId}
        />
      </div>
    </div>
  );
}
