import LoadingSpinner from "../components/LoadingSpinner";
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import type { Game, Team, Player, GameEvent } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { Minus, Plus, Save, Clock, Trophy, X, Activity } from 'lucide-react';

export default function Scorekeeper() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [game, setGame] = useState<Game | null>(null);
  const [homeTeam, setHomeTeam] = useState<Team | null>(null);
  const [awayTeam, setAwayTeam] = useState<Team | null>(null);
  const [homeRoster, setHomeRoster] = useState<Player[]>([]);
  const [awayRoster, setAwayRoster] = useState<Player[]>([]);
  const [events, setEvents] = useState<GameEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Editable state
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [period, setPeriod] = useState(1);
  const [clock, setClock] = useState('20:00');
  const [status, setStatus] = useState('Scheduled');

  // Add Event Modal state
  const [showEventModal, setShowEventModal] = useState(false);
  const [eventTeamId, setEventTeamId] = useState<string>('');
  const [eventType, setEventType] = useState<'goal' | 'penalty'>('goal');
  const [eventPlayerId, setEventPlayerId] = useState<string>('');
  const [eventAssist1Id, setEventAssist1Id] = useState<string>('');
  const [eventAssist2Id, setEventAssist2Id] = useState<string>('');

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      try {
        const gameData = await api.getGameById(id);
        if (!gameData) throw new Error('Game not found');

        // Authorization Check
        const isAuthorized = user?.role === 'admin' || (user?.role === 'manager' && (user.teamId === gameData.homeTeamId || user.teamId === gameData.awayTeamId));
        if (!isAuthorized) {
          navigate('/schedule');
          return;
        }

        setGame(gameData);
        setHomeScore(gameData.homeScore);
        setAwayScore(gameData.awayScore);
        setPeriod(gameData.period || 1);
        setClock(gameData.clock || '20:00');
        setStatus(gameData.status);

        const [home, away, hRoster, aRoster, gameEvents] = await Promise.all([
          api.getTeamById(gameData.homeTeamId),
          api.getTeamById(gameData.awayTeamId),
          api.getPlayersByTeamId(gameData.homeTeamId),
          api.getPlayersByTeamId(gameData.awayTeamId),
          api.getGameEvents(id)
        ]);
        setHomeTeam(home || null);
        setAwayTeam(away || null);
        setHomeRoster(hRoster);
        setAwayRoster(aRoster);
        setEvents(gameEvents);
      } catch (error) {
        console.error('Failed to load scorekeeper data', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id, user, navigate]);

  const handleSave = async () => {
    if (!game) return;
    try {
      const updatedGame: Game = {
        ...game,
        homeScore,
        awayScore,
        period,
        status,
        clock: status === 'Final' ? '00:00' : clock
      };
      await api.updateGame(updatedGame);
      setGame(updatedGame);
      navigate('/schedule');
    } catch (error) {
      console.error('Failed to save game', error);
    }
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !eventTeamId || !eventPlayerId) return;

    try {
      const newEvent = await api.createGameEvent({
        gameId: id,
        teamId: eventTeamId,
        type: eventType,
        playerId: eventPlayerId,
        assist1Id: eventAssist1Id || undefined,
        assist2Id: eventAssist2Id || undefined,
        period,
        clock
      });

      setEvents([newEvent, ...events]);

      // Automatically increment score if it's a goal
      if (eventType === 'goal') {
        if (eventTeamId === homeTeam?.id) {
          setHomeScore(s => s + 1);
        } else {
          setAwayScore(s => s + 1);
        }
      }

      setShowEventModal(false);
      setEventPlayerId('');
      setEventAssist1Id('');
      setEventAssist2Id('');
    } catch (error) {
      console.error('Failed to add event', error);
    }
  };

  const handleDeleteEvent = async (eventId: string, eType: string, eTeamId: string) => {
    try {
      await api.deleteGameEvent(eventId);
      setEvents(events.filter(e => e.id !== eventId));

      if (eType === 'goal') {
        if (eTeamId === homeTeam?.id) setHomeScore(s => Math.max(0, s - 1));
        else setAwayScore(s => Math.max(0, s - 1));
      }
    } catch (error) {
      console.error('Failed to delete event', error);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!game || !homeTeam || !awayTeam) return <LoadingSpinner />;

  const getPlayerName = (pId: string) => {
    const p = [...homeRoster, ...awayRoster].find(player => player.id === pId);
    return p ? `#${p.number} ${p.name}` : 'Unknown';
  };

  const activeRoster = eventTeamId === homeTeam.id ? homeRoster : awayRoster;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 relative">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black italic tracking-tighter uppercase text-slate-900">Live Scorekeeper</h1>
          <p className="text-slate-500 mt-2 font-medium">Authorized Match Officials Only</p>
        </div>
        <button
          onClick={handleSave}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-bold transition-colors flex items-center shadow-sm"
        >
          <Save className="w-5 h-5 mr-2" /> Save & Exit
        </button>
      </div>

      <div className="bg-slate-900 rounded-3xl p-8 shadow-xl text-white">

        {/* Top bar: Period and Status */}
        <div className="flex justify-between items-center border-b border-slate-700 pb-6 mb-8">
          <div className="flex items-center space-x-6">
            <div className="flex flex-col">
              <label className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Period</label>
              <div className="flex items-center space-x-4 bg-slate-800 rounded-lg p-1">
                <button
                  onClick={() => setPeriod(Math.max(1, period - 1))}
                  className="w-10 h-10 flex items-center justify-center rounded-md hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                ><Minus className="w-4 h-4" /></button>
                <span className="text-xl font-black">{period > 3 ? 'OT' : period}</span>
                <button
                  onClick={() => setPeriod(period + 1)}
                  className="w-10 h-10 flex items-center justify-center rounded-md hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                ><Plus className="w-4 h-4" /></button>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end">
            <label className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white font-bold px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer appearance-none"
            >
              <option value="Scheduled">Scheduled</option>
              <option value="In Progress">In Progress</option>
              <option value="Final">Final</option>
            </select>
          </div>
        </div>

        {/* Score Board */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">

          {/* Away Team */}
          <div className="flex flex-col items-center space-y-6">
            <div className="text-center">
              <span className="text-slate-400 text-sm font-bold uppercase tracking-wider">Away</span>
              <h2 className="text-2xl font-black italic uppercase mt-1">{awayTeam.shortName}</h2>
            </div>

            <div className="text-8xl md:text-9xl font-black font-mono tracking-tighter tabular-nums bg-slate-800 rounded-2xl w-full text-center py-4 border border-slate-700 shadow-inner">
              {awayScore}
            </div>

            <div className="flex space-x-4 w-full">
              <button
                onClick={() => {
                  setEventTeamId(awayTeam.id);
                  setEventType('goal');
                  setShowEventModal(true);
                }}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl flex justify-center items-center transition-colors shadow-sm uppercase tracking-wider text-sm"
              ><Plus className="w-5 h-5 mr-1" /> Goal</button>
            </div>
          </div>

          {/* Center Info */}
          <div className="flex flex-col items-center justify-center space-y-8 py-8 md:py-0 relative">
            <div className="hidden md:block absolute top-0 bottom-0 left-1/2 -ml-px w-px bg-slate-800"></div>

            <div className="bg-slate-900 border-4 border-slate-800 rounded-full w-32 h-32 flex flex-col items-center justify-center z-10 shadow-xl relative group">
               <Clock className="w-8 h-8 text-slate-500 mb-1" />
               <input
                 type="text"
                 value={status === 'Final' ? '00:00' : clock}
                 onChange={e => setClock(e.target.value)}
                 className="text-2xl font-black text-slate-300 font-mono tracking-tighter bg-transparent w-20 text-center focus:outline-none focus:text-white"
                 maxLength={5}
                 disabled={status === 'Final'}
               />
               <span className="text-[10px] text-slate-500 font-bold uppercase absolute bottom-4 opacity-0 group-hover:opacity-100 transition-opacity">Edit Clock</span>
            </div>

            {status === 'Final' && (
              <div className="flex items-center space-x-2 text-emerald-400 bg-slate-800 px-4 py-2 rounded-full z-10 font-bold uppercase tracking-wider text-sm">
                <Trophy className="w-4 h-4" />
                <span>Final Score</span>
              </div>
            )}
          </div>

          {/* Home Team */}
          <div className="flex flex-col items-center space-y-6">
            <div className="text-center">
              <span className="text-slate-400 text-sm font-bold uppercase tracking-wider">Home</span>
              <h2 className="text-2xl font-black italic uppercase mt-1">{homeTeam.shortName}</h2>
            </div>

            <div className="text-8xl md:text-9xl font-black font-mono tracking-tighter tabular-nums bg-slate-800 rounded-2xl w-full text-center py-4 border border-slate-700 shadow-inner">
              {homeScore}
            </div>

            <div className="flex space-x-4 w-full">
              <button
                onClick={() => {
                  setEventTeamId(homeTeam.id);
                  setEventType('goal');
                  setShowEventModal(true);
                }}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl flex justify-center items-center transition-colors shadow-sm uppercase tracking-wider text-sm"
              ><Plus className="w-5 h-5 mr-1" /> Goal</button>
            </div>
          </div>

        </div>

        <div className="mt-8 flex justify-center">
           <button
             onClick={() => {
               setEventTeamId(homeTeam.id); // default
               setEventType('penalty');
               setShowEventModal(true);
             }}
             className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold uppercase tracking-wider text-sm rounded-lg transition-colors border border-slate-700"
           >
             Add Penalty
           </button>
        </div>

      </div>

      {/* Game Log */}
      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
        <div className="flex items-center space-x-3 mb-6 border-b border-slate-100 pb-4">
          <Activity className="w-6 h-6 text-slate-900" />
          <h2 className="text-xl font-black italic tracking-tighter uppercase text-slate-900">Live Game Log</h2>
        </div>

        <div className="space-y-4">
          {events.length === 0 ? (
            <div className="text-center py-8 text-slate-500 font-medium">No events recorded yet.</div>
          ) : (
            events.map(event => (
              <div key={event.id} className="flex items-center justify-between bg-slate-50 border border-slate-100 p-4 rounded-xl">
                <div className="flex items-center space-x-6">
                  <div className="text-center w-16">
                    <div className="text-xs font-bold text-slate-400 uppercase">P{event.period}</div>
                    <div className="text-lg font-black font-mono text-slate-900">{event.clock}</div>
                  </div>

                  <div className="flex items-center space-x-4 border-l border-slate-200 pl-6">
                    <span className={`px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-md ${
                      event.type === 'goal' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {event.type}
                    </span>
                    <div>
                      <div className="font-bold text-slate-900">{getPlayerName(event.playerId)}</div>
                      {event.type === 'goal' && (event.assist1Id || event.assist2Id) && (
                        <div className="text-xs font-semibold text-slate-500">
                          Assists: {[event.assist1Id, event.assist2Id].filter(Boolean).map(id => getPlayerName(id!)).join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteEvent(event.id, event.type, event.teamId)}
                  className="text-slate-400 hover:text-rose-600 transition-colors p-2 rounded-full hover:bg-rose-50"
                  title="Remove Event"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="bg-slate-900 px-6 py-4 flex justify-between items-center">
              <h3 className="text-white font-black italic tracking-tighter uppercase text-xl">Record {eventType}</h3>
              <button onClick={() => setShowEventModal(false)} className="text-slate-400 hover:text-white"><X className="w-6 h-6" /></button>
            </div>

            <form onSubmit={handleAddEvent} className="p-6 space-y-6">

              {/* Event Metadata (Clock & Team) */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Team</label>
                  <select
                    value={eventTeamId}
                    onChange={(e) => {
                      setEventTeamId(e.target.value);
                      setEventPlayerId('');
                      setEventAssist1Id('');
                      setEventAssist2Id('');
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 font-bold focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                    required
                  >
                    <option value="" disabled>Select Team...</option>
                    <option value={awayTeam.id}>{awayTeam.name}</option>
                    <option value={homeTeam.id}>{homeTeam.name}</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Clock Time</label>
                  <input
                    type="text"
                    value={clock}
                    disabled // derived from current scoreboard clock for now
                    className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2.5 font-mono font-bold text-slate-500"
                  />
                </div>
              </div>

              {/* Player Selection */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">{eventType === 'goal' ? 'Goal Scorer' : 'Player'}</label>
                  <select
                    value={eventPlayerId}
                    onChange={(e) => setEventPlayerId(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2.5 font-bold focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                    required
                  >
                    <option value="" disabled>Select Player...</option>
                    {activeRoster.map(p => (
                      <option key={p.id} value={p.id}>#{p.number} {p.name}</option>
                    ))}
                  </select>
                </div>

                {eventType === 'goal' && (
                  <>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase">Primary Assist</label>
                      <select
                        value={eventAssist1Id}
                        onChange={(e) => setEventAssist1Id(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2.5 font-bold focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                      >
                        <option value="">None</option>
                        {activeRoster.filter(p => p.id !== eventPlayerId).map(p => (
                          <option key={p.id} value={p.id}>#{p.number} {p.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase">Secondary Assist</label>
                      <select
                        value={eventAssist2Id}
                        onChange={(e) => setEventAssist2Id(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2.5 font-bold focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                        disabled={!eventAssist1Id}
                      >
                        <option value="">None</option>
                        {activeRoster.filter(p => p.id !== eventPlayerId && p.id !== eventAssist1Id).map(p => (
                          <option key={p.id} value={p.id}>#{p.number} {p.name}</option>
                        ))}
                      </select>
                    </div>
                  </>
                )}
              </div>

              <div className="pt-6 flex justify-end space-x-3">
                <button type="button" onClick={() => setShowEventModal(false)} className="px-6 py-2.5 font-bold text-slate-500 hover:bg-slate-50 rounded-lg transition-colors">Cancel</button>
                <button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-2.5 font-bold rounded-lg transition-colors shadow-sm">Save Event</button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
