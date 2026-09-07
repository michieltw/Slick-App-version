import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';

import Teams from './pages/Teams';
import TeamDetail from './pages/TeamDetail';
import Standings from './pages/Standings';
import Players from './pages/Players';
import PlayerProfile from './pages/PlayerProfile';
import Venues from './pages/Venues';
import Login from './pages/Login';
import Schedule from './pages/Schedule';
import Scorekeeper from './pages/Scorekeeper';
import GameDetail from './pages/GameDetail';
import Community from './pages/Community';
import AdminDashboard from './pages/AdminDashboard';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/community" element={<Community />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/games/:id" element={<GameDetail />} />
            <Route path="/games/:id/scorekeeper" element={<Scorekeeper />} />
            <Route path="/teams" element={<Teams />} />
            <Route path="/teams/:id" element={<TeamDetail />} />
            <Route path="/standings" element={<Standings />} />
            <Route path="/players" element={<Players />} />
            <Route path="/players/:id" element={<PlayerProfile />} />
            <Route path="/venues" element={<Venues />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;