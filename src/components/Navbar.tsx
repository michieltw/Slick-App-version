import { NavLink } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  const navLinks = [
    { name: 'Community', path: '/community' },
    { name: 'Schedule', path: '/schedule' },
    { name: 'Standings', path: '/standings' },
    { name: 'Teams', path: '/teams' },
    { name: 'Players', path: '/players' },
    { name: 'Venues', path: '/venues' },
  ];

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 hidden md:block">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <NavLink to="/" className="flex items-center">
              <span className="text-2xl font-black italic tracking-tighter text-slate-900">BNLPLAY</span>
            </NavLink>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex space-x-6">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) =>
                    `flex items-center text-[15px] font-semibold transition-colors ${
                      isActive
                        ? 'text-slate-900'
                        : 'text-slate-500 hover:text-slate-900'
                    }`
                  }
                >
                  {link.name}
                  <ChevronDown className="ml-1 w-4 h-4 opacity-50" />
                </NavLink>
              ))}
            </div>
          </div>

          {/* Desktop Right Side (Auth) */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm font-semibold text-slate-600">
                  Hi, {user.username} <span className="text-xs uppercase tracking-wider text-slate-400">({user.role})</span>
                </span>
                <button
                  onClick={logout}
                  className="px-4 py-2 text-[15px] font-semibold text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <>
                <button className="px-4 py-2 text-[15px] font-semibold text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors">
                  Sign Up Free
                </button>
                <NavLink
                  to="/login"
                  className="px-4 py-2 text-[15px] font-semibold text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors"
                >
                  Log In
                </NavLink>
              </>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}
