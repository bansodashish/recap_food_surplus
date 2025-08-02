import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { BrowsePage } from './pages/BrowsePage';
import { RequestPage } from './pages/RequestPage';
import { DonatePage } from './pages/DonatePage';
import { SellPage } from './pages/SellPage';
import { AboutPage } from './pages/AboutPage';
import { SustainabilityPage } from './pages/SustainabilityPage';
import { LoginPage } from './pages/LoginPage';
import { ProfilePage } from './pages/ProfilePage';
import { Footer } from './components/Footer';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/browse" element={<BrowsePage />} />
            <Route path="/request" element={<RequestPage />} />
            <Route path="/donate" element={<DonatePage />} />
            <Route path="/sell" element={<SellPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/sustainability" element={<SustainabilityPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
