import { Bug } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">

          {/* Column 1: Logo & Info */}
          <div className="md:col-span-1">
            <Link to="/" className="inline-block mb-4">
              <span className="text-2xl font-black italic tracking-tighter text-slate-900">BNLPLAY</span>
            </Link>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">
              The ultimate hub for the Benelux Ice Hockey Ecosystem.
              Track teams, players, and standings across the Netherlands, Belgium, and Luxembourg.
            </p>
            <button className="flex items-center space-x-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-md px-4 py-2 hover:bg-slate-50 transition-colors">
              <Bug className="w-4 h-4" />
              <span>Report bugs</span>
            </button>
          </div>

          {/* Column 2: Current Season */}
          <div>
            <h3 className="text-xs font-black italic text-slate-900 tracking-wider uppercase mb-4">Current Season</h3>
            <ul className="space-y-3">
              <li><Link to="/standings" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">Standings</Link></li>
              <li><Link to="/teams" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">All Teams</Link></li>
              <li><Link to="/players" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">Player Stats</Link></li>
              <li><Link to="/venues" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">Venues & Arenas</Link></li>
            </ul>
          </div>

          {/* Column 3: Features */}
          <div>
            <h3 className="text-xs font-black italic text-slate-900 tracking-wider uppercase mb-4">Features</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">Leader Picks</a></li>
              <li><a href="#" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">Match Predictions</a></li>
              <li><a href="#" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">Live Scores</a></li>
            </ul>
          </div>

          {/* Column 4: More / Community */}
          <div>
            <h3 className="text-xs font-black italic text-slate-900 tracking-wider uppercase mb-4">More / Community</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">About Us</a></li>
              <li><a href="#" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">Contact</a></li>
              <li><a href="#" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-200">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-slate-500">
            <p>© {new Date().getFullYear()} Benelux Ice Hockey Ecosystem. All rights reserved.</p>
            <p className="mt-2 md:mt-0">
              Made for Benelux hockey fans. Not affiliated with the NHL.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
