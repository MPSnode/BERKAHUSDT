import React, { useEffect, useState } from 'react';
import '@/App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { API } from '@/lib/api';
import { SiteProvider, useSite } from '@/context/SiteContext';

import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import CoinCanvas3D from '@/components/CoinCanvas3D';
import MarketTicker from '@/components/MarketTicker';
import UsdtChartSection from '@/components/UsdtChartSection';
import ExchangeCalculator from '@/components/ExchangeCalculator';
import RateChartSection from '@/components/RateChartSection';
import SocialSection from '@/components/SocialSection';
import NetworksSection from '@/components/NetworksSection';
import LiveOrderFeed from '@/components/LiveOrderFeed';
import FeaturesSection from '@/components/FeaturesSection';
import HowItWorks from '@/components/HowItWorks';
import SecurityPartners from '@/components/SecurityPartners';
import OtcSpecialists from '@/components/OtcSpecialists';
import TestimoniSection from '@/components/TestimoniSection';
import FaqSection from '@/components/FaqSection';
import Footer from '@/components/Footer';
import PromoModal from '@/components/PromoModal';
import AdminPage from '@/pages/AdminPage';

/**
 * Scene wrapper: keeps one half of the viewport free for the 3D coin
 * so the choreography (coin left / coin right) stays readable.
 */
function SceneRow({ id, align = 'right', children, testId }) {
  const contentOnLeft = align === 'left';
  return (
    <section
      id={id}
      data-testid={testId || id}
      className="scene-anchor relative py-16 sm:py-24 min-h-[80vh] flex items-center"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {contentOnLeft ? (
            <>
              <div className="order-1">{children}</div>
              <div className="order-2 hidden lg:block min-h-[420px]" aria-hidden="true" />
            </>
          ) : (
            <>
              <div className="order-2 lg:order-1 hidden lg:block min-h-[420px]" aria-hidden="true" />
              <div className="order-1 lg:order-2">{children}</div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function LandingPage() {
  const { content, rates } = useSite();
  const [liveRates, setLiveRates] = useState({ buyRate: 0, sellRate: 0 });

  useEffect(() => {
    if (rates && rates.buyRate) {
      setLiveRates({ buyRate: rates.buyRate, sellRate: rates.sellRate });
    }
  }, [rates]);

  useEffect(() => {
    fetch(`${API}/analytics/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ page: window.location.pathname }),
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const res = await fetch(`${API}/rates`);
        const data = await res.json();
        if (data && data.buyRate) setLiveRates({ buyRate: data.buyRate, sellRate: data.sellRate });
      } catch (err) {
        /* silent */
      }
    };
    fetchRates();
    const interval = setInterval(fetchRates, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (content?.brandName) {
      document.title = `${content.brandName} — Jual & Beli USDT Rate Terbaik Indonesia`;
    }
  }, [content?.brandName]);

  return (
    <div className="min-h-screen bg-[#040A10] text-slate-100 selection:bg-emerald-500/30 selection:text-emerald-400 relative overflow-x-hidden">
      <div className="fixed top-0 left-1/4 w-[700px] h-[700px] bg-emerald-500/10 rounded-full blur-[180px] pointer-events-none z-0" />
      <div className="fixed bottom-1/3 right-1/4 w-[650px] h-[650px] bg-teal-500/10 rounded-full blur-[180px] pointer-events-none z-0" />

      {/* Fullscreen scroll-driven Three.js engine */}
      <CoinCanvas3D />

      <div className="relative z-10">
        <Navbar />
        <main>
          {/* HERO — coin centered */}
          <div id="scene-hero" data-testid="scene-hero">
            <HeroSection />
          </div>

          <MarketTicker buyRate={liveRates.buyRate} sellRate={liveRates.sellRate} />

          {/* SCROLL 1 — coin LEFT (USDT face), calculator RIGHT */}
          <SceneRow id="scene-calculator" align="right" testId="scene-calculator">
            <ExchangeCalculator buyRate={liveRates.buyRate} sellRate={liveRates.sellRate} />
          </SceneRow>

          {/* SCROLL 2 — coin RIGHT (BERKAHUSDT face), rate chart LEFT */}
          <SceneRow id="scene-chart" align="left" testId="scene-chart">
            <RateChartSection />
          </SceneRow>

          {/* SCROLL 3 — coin LEFT held by hand, contact & social RIGHT */}
          <SceneRow id="scene-social" align="right" testId="scene-social">
            <SocialSection />
          </SceneRow>

          {/* SCROLL 4 — coin RIGHT, supported networks LEFT */}
          <SceneRow id="scene-networks" align="left" testId="scene-networks">
            <NetworksSection />
          </SceneRow>

          {/* Existing supporting sections (unchanged) */}
          <UsdtChartSection buyRate={liveRates.buyRate} sellRate={liveRates.sellRate} />
          <LiveOrderFeed />
          <FeaturesSection />
          <HowItWorks />
          <SecurityPartners />
          <OtcSpecialists />
          <TestimoniSection />
          <FaqSection />
        </main>

        {/* SCROLL 5 — coin bottom-center orbited by small crypto coins */}
        <div id="scene-footer" data-testid="scene-footer">
          <Footer />
        </div>
      </div>

      <PromoModal />
    </div>
  );
}

function App() {
  return (
    <div className="App">
      <SiteProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/admin/*" element={<AdminPage />} />
          </Routes>
        </BrowserRouter>
      </SiteProvider>
    </div>
  );
}

export default App;
