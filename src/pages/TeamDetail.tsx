import LoadingSpinner from "../components/LoadingSpinner";
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import type { Team, Player, Post } from '../types';
import DataTable from '../components/DataTable';
import { MapPin, Calendar, Plus, Trash2, Edit2, Save, X, MessageSquare, Heart } from 'lucide-react';

export default function TeamDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [team, setTeam] = useState<Team | null>(null);
  const [roster, setRoster] = useState<Player[]>([]);
  const [news, setNews] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  // Authorization checks
  const isAdmin = user?.role === 'admin';
  const isManagerForThisTeam = user?.role === 'manager' && user.teamId === id;
  const canEditTeam = isAdmin || isManagerForThisTeam;

  // Team Editing state
  const [isEditingTeam, setIsEditingTeam] = useState(false);
  const [editTeamForm, setEditTeamForm] = useState<Partial<Team>>({});

  // Roster Builder state
  const [isEditingRoster, setIsEditingRoster] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerPos, setNewPlayerPos] = useState('F');
  const [newPlayerNum, setNewPlayerNum] = useState('');

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      try {
        const [teamData, rosterData, newsData] = await Promise.all([
          api.getTeamById(id),
          api.getPlayersByTeamId(id),
          api.getPostsByTeamId(id)
        ]);
        setTeam(teamData || null);
        setRoster(rosterData);
        setNews(newsData);
      } catch (error) {
        console.error('Failed to load team data', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  const handleAddPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !newPlayerName || !newPlayerNum) return;

    try {
      const newPlayer = await api.createPlayer({
        name: newPlayerName,
        teamId: id,
        position: newPlayerPos,
        number: parseInt(newPlayerNum, 10),
        gamesPlayed: 0,
        goals: 0,
        assists: 0,
        points: 0,
      });
      setRoster([...roster, newPlayer]);
      setNewPlayerName('');
      setNewPlayerNum('');
    } catch (error) {
      console.error('Failed to add player', error);
    }
  };

  const handleRemovePlayer = async (playerId: string) => {
    try {
      await api.removePlayer(playerId);
      setRoster(roster.filter(p => p.id !== playerId));
    } catch (error) {
      console.error('Failed to remove player', error);
    }
  };

  const handleUpdateTeam = async () => {
    if (!team) return;
    try {
      const updated = await api.updateTeam({ ...team, ...editTeamForm } as Team);
      setTeam(updated);
      setIsEditingTeam(false);
    } catch (error) {
      console.error('Failed to update team', error);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!team) return <LoadingSpinner />;

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
    { header: 'POS', accessor: 'position' as keyof Player, className: 'text-center text-slate-500 font-bold' },
    { header: 'GP', accessor: 'gamesPlayed' as keyof Player, className: 'text-center font-medium' },
    { header: 'G', accessor: 'goals' as keyof Player, className: 'text-center font-medium' },
    { header: 'A', accessor: 'assists' as keyof Player, className: 'text-center font-medium' },
    { header: 'PTS', accessor: 'points' as keyof Player, className: 'text-center font-black text-slate-900' },
    ...(isEditingRoster ? [{
      header: 'ACTION',
      accessor: (player: Player) => (
        <button
          onClick={() => handleRemovePlayer(player.id)}
          className="text-rose-500 hover:text-rose-700 transition-colors p-1 rounded-full hover:bg-rose-50"
          title="Remove Player"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      ),
      className: 'text-center w-16'
    }] : [])
  ];

  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-8 space-y-8">
      {/* Team Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm relative group">
        {canEditTeam && !isEditingTeam && (
          <button
            onClick={() => {
              setEditTeamForm({ name: team.name, shortName: team.shortName, city: team.city, country: team.country, arena: team.arena, logo: team.logo });
              setIsEditingTeam(true);
            }}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
            title="Edit Team Configuration"
          >
            <Edit2 className="w-5 h-5" />
          </button>
        )}

        {isEditingTeam ? (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h2 className="text-xl font-bold text-slate-900">Edit Team Configuration</h2>
              <button onClick={() => setIsEditingTeam(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
                <input type="text" value={editTeamForm.name || ''} onChange={e => setEditTeamForm({...editTeamForm, name: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-slate-900 outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Short Name</label>
                <input type="text" value={editTeamForm.shortName || ''} onChange={e => setEditTeamForm({...editTeamForm, shortName: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-slate-900 outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">City</label>
                <input type="text" value={editTeamForm.city || ''} onChange={e => setEditTeamForm({...editTeamForm, city: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-slate-900 outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Country</label>
                <input type="text" value={editTeamForm.country || ''} onChange={e => setEditTeamForm({...editTeamForm, country: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-slate-900 outline-none" />
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Home Arena</label>
                <input type="text" value={editTeamForm.arena || ''} onChange={e => setEditTeamForm({...editTeamForm, arena: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-slate-900 outline-none" />
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Logo URL</label>
                <input type="url" value={editTeamForm.logo || ''} onChange={e => setEditTeamForm({...editTeamForm, logo: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-slate-900 outline-none" />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button onClick={handleUpdateTeam} className="flex items-center px-6 py-2.5 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition-colors">
                <Save className="w-4 h-4 mr-2" /> Save Changes
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {team.logo && (
              <img src={team.logo} alt={team.name} className="w-32 h-32 md:w-48 md:h-48 object-contain bg-slate-50 rounded-xl p-4 border border-slate-100" />
            )}
            <div className="flex-1 text-center md:text-left space-y-4">
              <div>
                <h1 className="text-4xl font-black italic tracking-tighter uppercase text-slate-900">{team.name}</h1>
                <p className="text-xl font-bold text-slate-500 mt-1 uppercase tracking-wider">{team.shortName}</p>
              </div>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-sm font-semibold text-slate-600">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2 text-slate-400" />
                  {team.city}, {team.country}
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 mr-2 border-2 border-slate-400 rounded-sm" />
                  {team.arena}
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                  Est. {team.established}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Roster Section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <h2 className="text-2xl font-black italic tracking-tighter uppercase text-slate-900">Current Roster</h2>

          {canEditTeam && (
            <button
              onClick={() => setIsEditingRoster(!isEditingRoster)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                isEditingRoster
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {isEditingRoster ? 'Done Editing' : 'Edit Roster'}
            </button>
          )}
        </div>

        {isEditingRoster && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Add New Player</h3>
            <form onSubmit={handleAddPlayer} className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                placeholder="Player Name"
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                className="flex-1 px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                required
              />
              <select
                value={newPlayerPos}
                onChange={(e) => setNewPlayerPos(e.target.value)}
                className="w-full sm:w-24 px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
              >
                <option value="F">F</option>
                <option value="D">D</option>
                <option value="G">G</option>
              </select>
              <input
                type="number"
                placeholder="Number"
                value={newPlayerNum}
                onChange={(e) => setNewPlayerNum(e.target.value)}
                className="w-full sm:w-24 px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                required
              />
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg text-sm font-bold transition-colors flex items-center justify-center"
              >
                <Plus className="w-4 h-4 mr-1" /> Add
              </button>
            </form>
          </div>
        )}

        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          {roster.length > 0 ? (
            <DataTable
              data={roster}
              columns={columns}
              keyExtractor={(p) => p.id}
            />
          ) : (
            <div className="text-center py-12 text-slate-500 font-medium">No players on roster yet.</div>
          )}
        </div>
      </div>

      {/* Team News Section */}
      {news.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-black italic tracking-tighter uppercase text-slate-900 border-t border-slate-200 pt-8 mt-4">Team News</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {news.map(post => {
              const date = new Date(post.createdAt || 0);
              return (
                <div key={post.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
                  <div className="p-5 flex-grow">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold uppercase text-xs">
                        {post.authorName.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-sm">{post.authorName}</div>
                        <div className="text-[11px] font-semibold text-slate-400 uppercase">
                          {date.toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap line-clamp-3">
                      {post.content}
                    </p>
                  </div>
                  <div className="bg-slate-50 border-t border-slate-100 px-5 py-3 flex items-center space-x-6 mt-auto">
                    <div className="flex items-center space-x-1.5 text-slate-500 font-semibold text-sm">
                      <Heart className="w-4 h-4" />
                      <span>{post.likes}</span>
                    </div>
                    <Link to="/community" className="flex items-center space-x-1.5 text-slate-500 hover:text-slate-900 font-semibold text-sm transition-colors">
                      <MessageSquare className="w-4 h-4" />
                      <span>Join Discussion</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
