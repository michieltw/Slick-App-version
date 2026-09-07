import LoadingSpinner from "../components/LoadingSpinner";
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import type { League, LeagueRules } from '../types';
import { Save, ShieldAlert } from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);

  // Authorization: Strict Admin Only
  useEffect(() => {
    if (user === null) return; // Wait for auth
    if (user.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    async function loadData() {
      try {
        const leaguesData = await api.getLeagues();
        setLeagues(leaguesData);
      } catch (error) {
        console.error('Failed to load admin data', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleRuleChange = (leagueId: string, ruleKey: keyof LeagueRules, value: number) => {
    setLeagues(prevLeagues => prevLeagues.map(l => {
      if (l.id === leagueId) {
        return {
          ...l,
          rules: {
            ...l.rules,
            [ruleKey]: value
          }
        };
      }
      return l;
    }));
  };

  const handleSaveLeague = async (league: League) => {
    try {
      await api.updateLeague(league);
      alert(`Saved rules for ${league.name}`);
    } catch (error) {
      console.error('Failed to update league rules', error);
      alert('Failed to save rules.');
    }
  };

  if (loading || !user || user.role !== 'admin') return <LoadingSpinner />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div className="mb-8 flex items-center space-x-3">
        <ShieldAlert className="w-8 h-8 text-rose-600" />
        <div>
          <h1 className="text-3xl font-black italic tracking-tighter uppercase text-slate-900">Admin Dashboard</h1>
          <p className="text-slate-500 font-medium">System Configuration & League Rules</p>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-bold text-slate-900 border-b border-slate-200 pb-2">League Rule Configurations</h2>

        {leagues.map(league => (
          <div key={league.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex justify-between items-center">
              <div>
                <h3 className="font-black italic uppercase text-lg text-slate-900">{league.name}</h3>
                <span className="text-xs font-bold text-slate-500 tracking-wider uppercase">{league.region}</span>
              </div>
              <button
                onClick={() => handleSaveLeague(league)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 px-6 rounded-lg transition-colors flex items-center shadow-sm text-sm"
              >
                <Save className="w-4 h-4 mr-2" /> Save Rules
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase flex flex-col">
                    Points for Win
                    <span className="text-slate-400 font-medium normal-case">Standard regulation win</span>
                  </label>
                  <input
                    type="number"
                    value={league.rules.pointsForWin}
                    onChange={(e) => handleRuleChange(league.id, 'pointsForWin', parseInt(e.target.value) || 0)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 font-bold text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase flex flex-col">
                    Points for OT Win
                    <span className="text-slate-400 font-medium normal-case">Overtime/Shootout win</span>
                  </label>
                  <input
                    type="number"
                    value={league.rules.pointsForOTWin}
                    onChange={(e) => handleRuleChange(league.id, 'pointsForOTWin', parseInt(e.target.value) || 0)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 font-bold text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase flex flex-col">
                    Points for OT Loss
                    <span className="text-slate-400 font-medium normal-case">Overtime/Shootout loss</span>
                  </label>
                  <input
                    type="number"
                    value={league.rules.pointsForOTLoss}
                    onChange={(e) => handleRuleChange(league.id, 'pointsForOTLoss', parseInt(e.target.value) || 0)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 font-bold text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase flex flex-col">
                    Points for Tie
                    <span className="text-slate-400 font-medium normal-case">If league allows ties</span>
                  </label>
                  <input
                    type="number"
                    value={league.rules.pointsForTie}
                    onChange={(e) => handleRuleChange(league.id, 'pointsForTie', parseInt(e.target.value) || 0)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 font-bold text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase flex flex-col">
                    Regulation Periods
                    <span className="text-slate-400 font-medium normal-case">Before OT logic starts</span>
                  </label>
                  <input
                    type="number"
                    value={league.rules.periodCount}
                    onChange={(e) => handleRuleChange(league.id, 'periodCount', parseInt(e.target.value) || 0)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 font-bold text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                  />
                </div>

              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
