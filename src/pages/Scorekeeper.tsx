import LoadingSpinner from "../components/LoadingSpinner";
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import type { Game, Team } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { Minus, Plus, Save, Clock, Trophy } from 'lucide-react';

export default function Scorekeeper() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [game, setGame] = useState<Game | null>(null);
  const [homeTeam, setHomeTeam] = useState<Team | null>(null);
  const [awayTeam, setAwayTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);

  // Editable state
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [period, setPeriod] = useState(1);
  const [status, setStatus] = useState('Scheduled');

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
        setStatus(gameData.status);

        const [home, away] = await Promise.all([
          api.getTeamById(gameData.homeTeamId),
          api.getTeamById(gameData.awayTeamId)
        ]);
        setHomeTeam(home || null);
        setAwayTeam(away || null);
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
        clock: status === 'Final' ? '00:00' : game.clock
      };
      await api.updateGame(updatedGame);
      setGame(updatedGame);
      navigate('/schedule');
    } catch (error) {
      console.error('Failed to save game', error);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!game || !homeTeam || !awayTeam) return <LoadingSpinner />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
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
                onClick={() => setAwayScore(Math.max(0, awayScore - 1))}
                className="flex-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 py-4 rounded-xl flex justify-center items-center transition-colors"
              ><Minus className="w-6 h-6" /></button>
              <button
                onClick={() => setAwayScore(awayScore + 1)}
                className="flex-1 bg-slate-100 hover:bg-white text-slate-900 py-4 rounded-xl flex justify-center items-center transition-colors shadow-sm"
              ><Plus className="w-8 h-8" /></button>
            </div>
          </div>

          {/* Center Info */}
          <div className="flex flex-col items-center justify-center space-y-8 py-8 md:py-0 relative">
            <div className="hidden md:block absolute top-0 bottom-0 left-1/2 -ml-px w-px bg-slate-800"></div>

            <div className="bg-slate-900 border-4 border-slate-800 rounded-full w-32 h-32 flex flex-col items-center justify-center z-10 shadow-xl">
               <Clock className="w-8 h-8 text-slate-500 mb-2" />
               <span className="text-2xl font-black text-slate-300 font-mono tracking-tighter">
                 {status === 'Final' ? '00:00' : '20:00'}
               </span>
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
                onClick={() => setHomeScore(Math.max(0, homeScore - 1))}
                className="flex-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 py-4 rounded-xl flex justify-center items-center transition-colors"
              ><Minus className="w-6 h-6" /></button>
              <button
                onClick={() => setHomeScore(homeScore + 1)}
                className="flex-1 bg-slate-100 hover:bg-white text-slate-900 py-4 rounded-xl flex justify-center items-center transition-colors shadow-sm"
              ><Plus className="w-8 h-8" /></button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
