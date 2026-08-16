import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import CoinCanvas3D from './components/CoinCanvas3D';
import MarketTicker from './components/MarketTicker';
import UsdtChartSection from './components/UsdtChartSection';
import ExchangeCalculator from './components/ExchangeCalculator';
import LiveOrderFeed from './components/LiveOrderFeed';
import FeaturesSection from './components/FeaturesSection';
import HowItWorks from './components/HowItWorks';
import SecurityPartners from './components/SecurityPartners';
import OtcSpecialists from './components/OtcSpecialists';
import TestimoniSection from './components/TestimoniSection';
import FaqSection from './components/FaqSection';
import Footer from './components/Footer';
import PromoModal from './components/PromoModal';
import AdminPage from './pages/AdminPage';

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [liveRates, setLiveRates] = useState({ buyRate: 16150, sellRate: 16080 });

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handleLocationChange);

    // Track visitor analytics in background
    fetch('http://localhost:5000/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ page: window.location.pathname })
    }).catch(() => {});

    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  // Fetch initial rates from MongoDB server
  useEffect(() => {
    fetch('http://localhost:5000/api/rates')
      .then(res => res.json())
      .then(data => {
        if (data && data.buyRate) {
          setLiveRates({ buyRate: data.buyRate, sellRate: data.sellRate });
        }
      })
      .catch(() => {});
  }, []);

  // Dedicated Route: /admin or /admin/login -> Renders Admin Portal
  if (currentPath.startsWith('/admin')) {
    return <AdminPage />;
  }

  // Default Route: / -> Renders Public Customer 3D Landing Page
  return (
    <div className="min-h-screen bg-[#040A10] text-slate-100 selection:bg-emerald-500/30 selection:text-emerald-400 relative overflow-x-hidden">
      
      {/* Tether Green Ambient Lighting */}
      <div className="fixed top-0 left-1/4 w-[700px] h-[700px] bg-emerald-500/10 rounded-full blur-[180px] pointer-events-none z-0" />
      <div className="fixed bottom-1/3 right-1/4 w-[650px] h-[650px] bg-teal-500/10 rounded-full blur-[180px] pointer-events-none z-0" />

      {/* FULLSCREEN THREE.JS 3D ANIMATION ENGINE */}
      <CoinCanvas3D />

      {/* Main Content Layer */}
      <div className="relative z-10">
        <Navbar />
        <main>
          <HeroSection />
          <MarketTicker buyRate={liveRates.buyRate} sellRate={liveRates.sellRate} />
          <ExchangeCalculator buyRate={liveRates.buyRate} sellRate={liveRates.sellRate} />
          <UsdtChartSection buyRate={liveRates.buyRate} sellRate={liveRates.sellRate} />
          <LiveOrderFeed />
          <FeaturesSection />
          <HowItWorks />
          <SecurityPartners />
          <OtcSpecialists />
          <TestimoniSection />
          <FaqSection />
        </main>
        <Footer />
      </div>

      {/* Dynamic Pop-Up Announcement Modal */}
      <PromoModal />
    </div>
  );
}
