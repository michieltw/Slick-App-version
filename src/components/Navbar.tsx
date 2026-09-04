import { NavLink } from 'react-router-dom';
import { Menu, X, Trophy } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Standings', path: '/standings' },
    { name: 'Teams', path: '/teams' },
    { name: 'Players', path: '/players' },
    { name: 'Venues', path: '/venues' },
  ];

  return (
    <nav className="bg-[var(--color-nhl-panel)] border-b border-[var(--color-nhl-border)] sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <Trophy className="h-8 w-8 text-[var(--color-nhl-accent)]" />
            <span className="text-xl font-bold uppercase tracking-wider">Benelux Ice Hockey</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex space-x-8">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `text-sm font-medium uppercase tracking-wide transition-colors ${
                    isActive
                      ? 'text-white border-b-2 border-[var(--color-nhl-accent)] py-5'
                      : 'text-[var(--color-nhl-muted)] hover:text-white py-5'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-[var(--color-nhl-muted)] hover:text-white p-2"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden bg-[var(--color-nhl-panel)] border-b border-[var(--color-nhl-border)]">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-md text-base font-medium uppercase tracking-wide ${
                    isActive
                      ? 'bg-[var(--color-nhl-accent)] text-white'
                      : 'text-[var(--color-nhl-muted)] hover:bg-[var(--color-nhl-panel-hover)] hover:text-white'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}