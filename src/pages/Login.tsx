import LoadingSpinner from "../components/LoadingSpinner";
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import type { User } from '../types';

export default function Login() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    async function loadUsers() {
      try {
        const data = await api.getUsers();
        setUsers(data);
      } catch (error) {
        console.error('Failed to load users', error);
      } finally {
        setLoading(false);
      }
    }
    loadUsers();
  }, []);

  const handleLogin = (user: User) => {
    login(user);
    navigate('/');
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-xl mx-auto px-4 py-16 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-black italic tracking-tighter uppercase text-slate-900">Sign In</h1>
        <p className="text-slate-500 mt-2 font-medium">Select a demo account to test role-based access</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="divide-y divide-slate-100">
          {users.map(user => (
            <button
              key={user.id}
              onClick={() => handleLogin(user)}
              className="w-full text-left px-6 py-4 hover:bg-slate-50 transition-colors flex items-center justify-between group"
            >
              <div>
                <div className="font-bold text-slate-900">{user.username}</div>
                <div className="text-sm font-medium text-slate-500 uppercase tracking-wider mt-0.5">
                  Role: <span className={
                    user.role === 'admin' ? 'text-rose-600' :
                    user.role === 'manager' ? 'text-emerald-600' :
                    'text-blue-600'
                  }>{user.role}</span>
                  {user.teamId && <span className="ml-2 text-slate-400">Team: {user.teamId}</span>}
                </div>
              </div>
              <div className="text-slate-400 group-hover:text-slate-900 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
