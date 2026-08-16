import React, { useState, useEffect } from 'react';
import { MessageSquare, ShieldCheck, ArrowRight, Menu, X, TrendingUp } from 'lucide-react';

export default function Navbar({ onOpenAdmin }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [liveBuyRate, setLiveBuyRate] = useState(16150);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/rates');
        const data = await res.json();
        if (data && data.buyRate) setLiveBuyRate(data.buyRate);
      } catch (err) {}
    };

    fetchRates();
    const interval = setInterval(fetchRates, 2500);
    return () => clearInterval(interval);
  }, []);

  const waUrl = "https://wa.me/6281234567890?text=Halo%20Admin%20Berkah%20USDT,%20saya%20ingin%20tukar%20USDT";

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-[#040711]/90 backdrop-blur-xl border-b border-slate-800/80 py-3 shadow-2xl shadow-emerald-950/20' 
        : 'bg-transparent py-5'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Brand Logo & OTC Status */}
          <a href="#" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 rounded-full p-0.5 bg-gradient-to-tr from-amber-400 via-emerald-400 to-amber-500 shadow-lg group-hover:scale-105 transition-transform duration-300">
              <img 
                src="/coin_front.png" 
                alt="Berkah USDT Logo" 
                className="w-full h-full object-cover rounded-full bg-[#040711]" 
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-tight text-white font-['Space_Grotesk']">
                  BERKAH<span className="text-emerald-400">USDT</span>
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hidden sm:inline-block">
                  Moneychanger
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="font-mono text-emerald-400">OTC Desk Online</span>
                <span className="text-slate-600">•</span>
                <span className="text-slate-400">24/7 Ready</span>
              </div>
            </div>
          </a>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#calculator" className="hover:text-emerald-400 transition-colors flex items-center gap-1">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Kalkulator OTC
            </a>
            <a href="#features" className="hover:text-emerald-400 transition-colors">
              Keunggulan
            </a>
            <a href="#howitworks" className="hover:text-emerald-400 transition-colors">
              Cara Kerja
            </a>
            <a href="#security" className="hover:text-emerald-400 transition-colors">
              Keamanan & Bank
            </a>
            <a href="#faq" className="hover:text-emerald-400 transition-colors">
              FAQ
            </a>
          </nav>

          {/* Right Action CTA */}
          <div className="hidden sm:flex items-center gap-4">
            <div className="text-right hidden xl:block">
              <div className="text-[11px] text-slate-400 font-mono">Rate Real-Time:</div>
              <div className="text-xs font-semibold text-emerald-400 font-mono">1 USDT = Rp {Number(liveBuyRate).toLocaleString()}</div>
            </div>
            
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="relative group overflow-hidden rounded-xl p-[1px] focus:outline-none"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 rounded-xl group-hover:opacity-100 transition-opacity opacity-80 animate-pulse-glow" />
              <div className="relative px-4 py-2.5 rounded-[11px] bg-[#0A0F1D] group-hover:bg-[#0E162B] transition-colors flex items-center gap-2 text-xs font-bold text-white tracking-wide">
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span>HUBUNGI OTC DESK</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </div>
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg bg-slate-800/60 text-slate-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0A0F1D]/95 backdrop-blur-2xl border-b border-slate-800 px-4 pt-4 pb-6 space-y-4 shadow-2xl">
          <a 
            href="#calculator" 
            onClick={() => setMobileMenuOpen(false)}
            className="block text-slate-200 hover:text-emerald-400 font-medium py-2"
          >
            Kalkulator OTC (Jual/Beli)
          </a>
          <a 
            href="#features" 
            onClick={() => setMobileMenuOpen(false)}
            className="block text-slate-200 hover:text-emerald-400 font-medium py-2"
          >
            Keunggulan Service
          </a>
          <a 
            href="#howitworks" 
            onClick={() => setMobileMenuOpen(false)}
            className="block text-slate-200 hover:text-emerald-400 font-medium py-2"
          >
            Cara Transaksi
          </a>
          <a 
            href="#faq" 
            onClick={() => setMobileMenuOpen(false)}
            className="block text-slate-200 hover:text-emerald-400 font-medium py-2"
          >
            Tanya Jawab (FAQ)
          </a>

          <div className="pt-2 border-t border-slate-800">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-sm shadow-lg shadow-emerald-900/30"
            >
              <MessageSquare className="w-4 h-4" />
              Chat WhatsApp Admin OTC
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
