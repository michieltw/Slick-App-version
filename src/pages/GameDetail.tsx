import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import type { Game, Team, Player, GameEvent } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import { Calendar, Clock, MapPin, Activity, Trophy } from 'lucide-react';

export default function GameDetail() {
  const { id } = useParams<{ id: string }>();
  const [game, setGame] = useState<Game | null>(null);
  const [homeTeam, setHomeTeam] = useState<Team | null>(null);
  const [awayTeam, setAwayTeam] = useState<Team | null>(null);
  const [rosters, setRosters] = useState<Player[]>([]);
  const [events, setEvents] = useState<GameEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      try {
        const gameData = await api.getGameById(id);
        if (!gameData) throw new Error('Game not found');
        setGame(gameData);

        const [home, away, hRoster, aRoster, gameEvents] = await Promise.all([
          api.getTeamById(gameData.homeTeamId),
          api.getTeamById(gameData.awayTeamId),
          api.getPlayersByTeamId(gameData.homeTeamId),
          api.getPlayersByTeamId(gameData.awayTeamId),
          api.getGameEvents(id)
        ]);

        setHomeTeam(home || null);
        setAwayTeam(away || null);
        setRosters([...hRoster, ...aRoster]);
        setEvents(gameEvents);
      } catch (error) {
        console.error('Failed to load game details', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (!game || !homeTeam || !awayTeam) return <div className="text-center py-20 text-slate-500 font-medium">Game not found.</div>;

  const date = new Date(game.date);

  const getPlayerName = (pId: string) => {
    const p = rosters.find(player => player.id === pId);
    return p ? `#${p.number} ${p.name}` : 'Unknown';
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-8 space-y-8">
      {/* Game Header */}
      <div className="bg-slate-900 rounded-3xl p-8 shadow-xl text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-slate-800 rounded-full opacity-50 blur-3xl"></div>

        <div className="relative z-10">
          <div className="flex justify-between items-center border-b border-slate-700 pb-6 mb-8">
            <div className="flex items-center space-x-6 text-slate-300 font-medium text-sm">
              <div className="flex items-center"><Calendar className="w-4 h-4 mr-2" /> {date.toLocaleDateString()}</div>
              <div className="flex items-center"><Clock className="w-4 h-4 mr-2" /> {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
              {homeTeam.arena && <div className="flex items-center hidden sm:flex"><MapPin className="w-4 h-4 mr-2" /> {homeTeam.arena}</div>}
            </div>
            <span className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md ${
              game.status === 'In Progress' ? 'bg-rose-500 text-white animate-pulse' :
              game.status === 'Final' ? 'bg-slate-700 text-white' :
              'bg-emerald-500 text-white'
            }`}>
              {game.status}
            </span>
          </div>

          <div className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-16">
            {/* Away Team */}
            <Link to={`/teams/${awayTeam.id}`} className="flex flex-col items-center group hover:scale-105 transition-transform">
              <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-2xl p-4 shadow-lg flex items-center justify-center mb-4">
                {awayTeam.logo ? <img src={awayTeam.logo} alt={awayTeam.name} className="max-w-full max-h-full object-contain" /> : <div className="text-slate-900 font-black text-2xl">{awayTeam.shortName}</div>}
              </div>
              <h2 className="text-2xl md:text-3xl font-black italic tracking-tighter uppercase group-hover:text-emerald-400 transition-colors">{awayTeam.name}</h2>
              <span className="text-slate-400 font-bold uppercase tracking-wider text-sm mt-1">Away</span>
            </Link>

            {/* Score */}
            <div className="flex items-center space-x-6">
              <div className="text-6xl md:text-8xl font-black tabular-nums">{game.awayScore}</div>
              <div className="text-3xl text-slate-600 font-black">-</div>
              <div className="text-6xl md:text-8xl font-black tabular-nums">{game.homeScore}</div>
            </div>

            {/* Home Team */}
            <Link to={`/teams/${homeTeam.id}`} className="flex flex-col items-center group hover:scale-105 transition-transform">
              <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-2xl p-4 shadow-lg flex items-center justify-center mb-4">
                {homeTeam.logo ? <img src={homeTeam.logo} alt={homeTeam.name} className="max-w-full max-h-full object-contain" /> : <div className="text-slate-900 font-black text-2xl">{homeTeam.shortName}</div>}
              </div>
              <h2 className="text-2xl md:text-3xl font-black italic tracking-tighter uppercase group-hover:text-emerald-400 transition-colors">{homeTeam.name}</h2>
              <span className="text-slate-400 font-bold uppercase tracking-wider text-sm mt-1">Home</span>
            </Link>
          </div>

          <div className="text-center mt-8">
            <span className="text-slate-400 font-bold uppercase tracking-widest text-sm">
              {game.status === 'Final' ? 'Final Score' : `Period ${game.period} • ${game.clock}`}
            </span>
          </div>
        </div>
      </div>

      {/* Game Log */}
      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
        <div className="flex items-center space-x-3 mb-6 border-b border-slate-100 pb-4">
          <Activity className="w-6 h-6 text-slate-900" />
          <h2 className="text-xl font-black italic tracking-tighter uppercase text-slate-900">Game Log</h2>
        </div>

        <div className="space-y-4">
          {events.length === 0 ? (
            <div className="text-center py-12 text-slate-500 font-medium">No events recorded yet.</div>
          ) : (
            events.map(event => {
              const isHomeEvent = event.teamId === homeTeam.id;

              return (
                <div key={event.id} className={`flex items-center bg-slate-50 border border-slate-100 p-4 rounded-xl ${isHomeEvent ? 'flex-row-reverse border-l-4 border-l-emerald-500' : 'border-l-4 border-l-rose-500'}`}>

                  {/* Time Info */}
                  <div className={`text-center w-20 flex-shrink-0 ${isHomeEvent ? 'ml-6' : 'mr-6'}`}>
                    <div className="text-xs font-bold text-slate-400 uppercase">P{event.period}</div>
                    <div className="text-lg font-black font-mono text-slate-900">{event.clock}</div>
                  </div>

                  {/* Divider */}
                  <div className="w-px h-12 bg-slate-200 mx-4 hidden sm:block"></div>

                  {/* Event Details */}
                  <div className={`flex items-center space-x-4 flex-grow ${isHomeEvent ? 'justify-end text-right' : 'justify-start text-left'}`}>
                    {isHomeEvent && (
                      <div className="hidden sm:block">
                        <div className="font-bold text-slate-900">{getPlayerName(event.playerId)}</div>
                        {event.type === 'goal' && (event.assist1Id || event.assist2Id) && (
                          <div className="text-xs font-semibold text-slate-500 mt-0.5">
                            Assists: {[event.assist1Id, event.assist2Id].filter(Boolean).map(id => getPlayerName(id!)).join(', ')}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex flex-col items-center">
                      {event.type === 'goal' ? (
                        <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center">
                           <Trophy className="w-5 h-5" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-black italic">
                           PEN
                        </div>
                      )}
                      <span className="text-[10px] font-bold uppercase tracking-wider mt-1 text-slate-500 hidden sm:block">{isHomeEvent ? homeTeam.shortName : awayTeam.shortName}</span>
                    </div>

                    {!isHomeEvent && (
                      <div className="hidden sm:block">
                        <div className="font-bold text-slate-900">{getPlayerName(event.playerId)}</div>
                        {event.type === 'goal' && (event.assist1Id || event.assist2Id) && (
                          <div className="text-xs font-semibold text-slate-500 mt-0.5">
                            Assists: {[event.assist1Id, event.assist2Id].filter(Boolean).map(id => getPlayerName(id!)).join(', ')}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Mobile fallback layout */}
                    <div className="sm:hidden flex-grow">
                        <div className="font-bold text-slate-900 text-sm">{getPlayerName(event.playerId)}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">
                           {isHomeEvent ? homeTeam.shortName : awayTeam.shortName} • {event.type}
                        </div>
                    </div>

                  </div>

                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
