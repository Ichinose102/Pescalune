import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import CarteAddition from './pages/CarteAddition';
import Clients from './pages/Clients';
import NouvellesNotes from './pages/NouvellesNotes';

import Settings from './pages/Settings';
import History from './pages/History';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="carte" element={<CarteAddition />} />
          <Route path="clients" element={<Clients />} />
          <Route path="notes" element={<NouvellesNotes />} />
          <Route path="settings" element={<Settings />} />
          <Route path="history" element={<History />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
