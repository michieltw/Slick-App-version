import LoadingSpinner from "../components/LoadingSpinner";
import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import type { Player, Team, League } from '../types';
import DataTable from '../components/DataTable';
import { Filter } from 'lucide-react';

export default function Players() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterLeague, setFilterLeague] = useState<string>('');
  const [filterTeam, setFilterTeam] = useState<string>('');
  const [filterPos, setFilterPos] = useState<string>('');

  useEffect(() => {
    async function loadData() {
      try {
        const [playersData, teamsData, leaguesData] = await Promise.all([
          api.getPlayers(),
          api.getTeams(),
          api.getLeagues()
        ]);
        // Sort players by points descending
        setPlayers([...playersData].sort((a, b) => b.points - a.points));
        setTeams(teamsData);
        setLeagues(leaguesData);
      } catch (error) {
        console.error('Failed to load players', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredPlayers = useMemo(() => {
    return players.filter(player => {
      const team = teams.find(t => t.id === player.teamId);

      // Filter by League
      if (filterLeague && team?.leagueId !== filterLeague) return false;
      // Filter by Team
      if (filterTeam && player.teamId !== filterTeam) return false;
      // Filter by Position
      if (filterPos && player.position !== filterPos) return false;

      return true;
    });
  }, [players, teams, filterLeague, filterTeam, filterPos]);

  const getTeam = (id: string) => teams.find(t => t.id === id);

  if (loading) return <LoadingSpinner />;

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
      <div className="mb-8 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black italic tracking-tighter uppercase text-slate-900">Player Statistics</h1>
          <p className="text-slate-500 mt-2 font-medium">League leaders in points, goals, and assists</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 bg-white border border-slate-200 p-3 rounded-xl shadow-sm">
          <div className="flex items-center text-slate-400 pl-2">
            <Filter className="w-4 h-4 mr-2" />
            <span className="text-xs font-bold uppercase tracking-wider mr-2">Filter</span>
          </div>
          <select
            value={filterLeague}
            onChange={(e) => {
              setFilterLeague(e.target.value);
              setFilterTeam(''); // Reset team filter when league changes
            }}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-sm font-semibold rounded-lg px-3 py-2 focus:outline-none focus:border-slate-400"
          >
            <option value="">All Leagues</option>
            {leagues.map(l => <option key={l.id} value={l.id}>{l.shortName}</option>)}
          </select>

          <select
            value={filterTeam}
            onChange={(e) => setFilterTeam(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-sm font-semibold rounded-lg px-3 py-2 focus:outline-none focus:border-slate-400"
          >
            <option value="">All Teams</option>
            {teams
              .filter(t => !filterLeague || t.leagueId === filterLeague)
              .map(t => <option key={t.id} value={t.id}>{t.shortName}</option>)
            }
          </select>

          <select
            value={filterPos}
            onChange={(e) => setFilterPos(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-sm font-semibold rounded-lg px-3 py-2 focus:outline-none focus:border-slate-400"
          >
            <option value="">All POS</option>
            <option value="F">Forwards (F)</option>
            <option value="D">Defense (D)</option>
            <option value="G">Goalies (G)</option>
          </select>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        {filteredPlayers.length > 0 ? (
          <DataTable
            data={filteredPlayers}
            columns={columns}
            keyExtractor={(p) => p.id}
          />
        ) : (
          <div className="py-20 text-center text-slate-500 font-medium">
            No players match the selected filters.
          </div>
        )}
      </div>
    </div>
  );
}
