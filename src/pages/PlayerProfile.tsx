import LoadingSpinner from "../components/LoadingSpinner";
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import type { Player, Team } from '../types';
import { User, Edit2, Save, X } from 'lucide-react';

export default function PlayerProfile() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [player, setPlayer] = useState<Player | null>(null);
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);

  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Player>>({});

  // Authorization check
  const isAdmin = user?.role === 'admin';
  const isManagerForTeam = user?.role === 'manager' && user.teamId === player?.teamId;
  const canEdit = isAdmin || isManagerForTeam;

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      try {
        const playerData = await api.getPlayerById(id);
        setPlayer(playerData || null);

        if (playerData?.teamId) {
          const teamData = await api.getTeamById(playerData.teamId);
          setTeam(teamData || null);
        }
      } catch (error) {
        console.error('Failed to load player data', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  const handleSave = async () => {
    if (!player) return;
    try {
      const updated = await api.updatePlayer({ ...player, ...editForm } as Player);
      setPlayer(updated);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update player', error);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!player) return <LoadingSpinner />;

  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-8 space-y-8">
      {/* Profile Header */}
      <div className="bg-slate-900 rounded-2xl p-8 text-white relative overflow-hidden shadow-lg group">
        {/* Background Accent */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-slate-800 rounded-full opacity-50 blur-3xl"></div>

        {canEdit && !isEditing && (
          <button
            onClick={() => {
              setEditForm({ name: player.name, number: player.number, position: player.position, bio: player.bio || '' });
              setIsEditing(true);
            }}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors opacity-0 group-hover:opacity-100 z-20"
            title="Edit Player Profile"
          >
            <Edit2 className="w-5 h-5" />
          </button>
        )}

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
          {/* Avatar / Number */}
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-slate-800 border-4 border-slate-700 flex items-center justify-center flex-shrink-0">
            {player.number ? (
              <span className="text-5xl md:text-6xl font-black italic tracking-tighter text-slate-400">
                {player.number}
              </span>
            ) : (
              <User className="w-16 h-16 text-slate-500" />
            )}
          </div>

          <div className="flex-1 w-full text-center md:text-left space-y-4">
            {isEditing ? (
              <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 space-y-4 max-w-2xl text-left">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-lg">Edit Profile</h3>
                  <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase">Full Name</label>
                    <input type="text" value={editForm.name || ''} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-1 focus:ring-emerald-500 outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase">Jersey Number</label>
                    <input type="number" value={editForm.number || ''} onChange={e => setEditForm({...editForm, number: parseInt(e.target.value) || 0})} className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-1 focus:ring-emerald-500 outline-none" />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs font-bold text-slate-400 uppercase">Position</label>
                    <select value={editForm.position || ''} onChange={e => setEditForm({...editForm, position: e.target.value})} className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-1 focus:ring-emerald-500 outline-none appearance-none">
                      <option value="F">Forward</option>
                      <option value="D">Defense</option>
                      <option value="G">Goalie</option>
                    </select>
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs font-bold text-slate-400 uppercase">Bio</label>
                    <textarea value={editForm.bio || ''} onChange={e => setEditForm({...editForm, bio: e.target.value})} className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-1 focus:ring-emerald-500 outline-none h-24 resize-none" />
                  </div>
                </div>
                <div className="pt-2 flex justify-end">
                  <button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-lg font-bold flex items-center transition-colors">
                    <Save className="w-4 h-4 mr-2" /> Save Profile
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase">{player.name}</h1>
                  <div className="flex items-center justify-center md:justify-start mt-2 space-x-3 text-slate-400 font-bold uppercase tracking-wider text-sm">
                    <span className="px-3 py-1 bg-slate-800 rounded-md">POS: {player.position}</span>
                    {team && (
                      <Link to={`/teams/${team.id}`} className="px-3 py-1 bg-slate-800 rounded-md hover:bg-slate-700 hover:text-white transition-colors flex items-center">
                        {team.logo && <img src={team.logo} alt="" className="w-4 h-4 mr-2 object-contain" />}
                        {team.shortName || team.name}
                      </Link>
                    )}
                  </div>
                </div>

                {player.bio && (
                  <p className="text-slate-300 max-w-2xl text-sm leading-relaxed font-medium">
                    {player.bio}
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div>
        <h2 className="text-2xl font-black italic tracking-tighter uppercase text-slate-900 mb-6">Season Stats</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 p-6 rounded-xl flex flex-col items-center justify-center text-center shadow-sm">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Games Played</span>
            <span className="text-4xl font-black text-slate-900">{player.gamesPlayed}</span>
          </div>
          <div className="bg-white border border-slate-200 p-6 rounded-xl flex flex-col items-center justify-center text-center shadow-sm">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Goals</span>
            <span className="text-4xl font-black text-slate-900">{player.goals}</span>
          </div>
          <div className="bg-white border border-slate-200 p-6 rounded-xl flex flex-col items-center justify-center text-center shadow-sm">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Assists</span>
            <span className="text-4xl font-black text-slate-900">{player.assists}</span>
          </div>
          <div className="bg-slate-50 border border-slate-200 p-6 rounded-xl flex flex-col items-center justify-center text-center shadow-sm">
            <span className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Total Points</span>
            <span className="text-5xl font-black text-slate-900">{player.points}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
