import { NavLink } from 'react-router-dom';
import { Home, Calendar, Trophy, Users, MapPin } from 'lucide-react';
import { useState } from 'react';

export default function MobileTabBar() {
  const [showMore, setShowMore] = useState(false);

  const primaryLinks = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Schedule', path: '/schedule', icon: Calendar },
    { name: 'Standings', path: '/standings', icon: Trophy },
  ];

  const secondaryLinks = [
    { name: 'Teams', path: '/teams', icon: Users },
    { name: 'Players', path: '/players', icon: Users },
    { name: 'Venues', path: '/venues', icon: MapPin },
  ];

  return (
    <>
      {/* Overlay for More Menu */}
      {showMore && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden"
          onClick={() => setShowMore(false)}
        />
      )}

      {/* More Menu Dropup */}
      <div className={`fixed bottom-16 left-0 right-0 bg-white border-t border-slate-200 rounded-t-2xl z-40 transform transition-transform duration-200 md:hidden shadow-lg ${showMore ? 'translate-y-0' : 'translate-y-[150%]'}`}>
        <div className="p-4 space-y-2">
          {secondaryLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => setShowMore(false)}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-xl font-bold transition-colors ${
                    isActive
                      ? 'bg-slate-100 text-slate-900'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                <span>{link.name}</span>
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 md:hidden pb-safe">
        <div className="flex justify-around items-center h-16">
          {primaryLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => setShowMore(false)}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                    isActive ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'
                  }`
                }
              >
                <Icon className="w-6 h-6" />
                <span className="text-[10px] font-bold uppercase tracking-wider">{link.name}</span>
              </NavLink>
            );
          })}

          <button
            onClick={() => setShowMore(!showMore)}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
              showMore ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <div className="flex space-x-1 items-center justify-center w-6 h-6">
              <div className="w-1.5 h-1.5 rounded-full bg-current" />
              <div className="w-1.5 h-1.5 rounded-full bg-current" />
              <div className="w-1.5 h-1.5 rounded-full bg-current" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider">More</span>
          </button>
        </div>
      </nav>
    </>
  );
}
