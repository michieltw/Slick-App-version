import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';

import Teams from './pages/Teams';
import Standings from './pages/Standings';
import Players from './pages/Players';
import Venues from './pages/Venues';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/teams" element={<Teams />} />
          <Route path="/standings" element={<Standings />} />
          <Route path="/players" element={<Players />} />
          <Route path="/venues" element={<Venues />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;