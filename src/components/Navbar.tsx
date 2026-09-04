import { NavLink } from 'react-router-dom';
import { Menu, X, ChevronDown } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: 'Standings', path: '/standings' },
    { name: 'Teams', path: '/teams' },
    { name: 'Players', path: '/players' },
    { name: 'Venues', path: '/venues' },
  ];

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
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
            <button className="px-4 py-2 text-[15px] font-semibold text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors">
              Sign Up Free
            </button>
            <button className="px-4 py-2 text-[15px] font-semibold text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors">
              Log In
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-600 hover:text-slate-900 p-2"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-slate-200">
          <div className="px-4 pt-2 pb-4 space-y-2">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-md text-base font-semibold ${
                    isActive
                      ? 'bg-slate-100 text-slate-900'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
            <div className="pt-4 mt-2 border-t border-slate-100 space-y-2">
              <button className="w-full text-center px-4 py-2 text-[15px] font-semibold text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50">
                Sign Up Free
              </button>
              <button className="w-full text-center px-4 py-2 text-[15px] font-semibold text-white bg-slate-900 rounded-md hover:bg-slate-800">
                Log In
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
