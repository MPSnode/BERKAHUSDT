import React from 'react';
import CoinCanvas3D from './CoinCanvas3D';
import { ArrowRight, ShieldCheck, Zap, Lock, DollarSign, CheckCircle2, TrendingUp } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative pt-28 md:pt-36 pb-16 md:pb-24 overflow-hidden bg-grid-pattern">
      {/* Ambient Background Glow Spheres */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-[350px] h-[350px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* HERO 3D SCROLL COIN FOCAL SHOWCASE */}
        <div className="pt-8 pb-4 h-[450px] sm:h-[520px] relative pointer-events-none flex items-center justify-center">
          {/* Subtle hero glow highlight */}
          <div className="absolute inset-0 bg-radial-glow pointer-events-none rounded-full blur-3xl opacity-80" />
        </div>

        {/* Key Metrics / Trust Bar */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
          <div className="glass-card glass-card-hover p-5 rounded-2xl text-center border border-slate-800">
            <div className="text-2xl sm:text-3xl font-extrabold text-gradient-emerald font-['Space_Grotesk']">
              $15.8M+
            </div>
            <div className="text-xs text-slate-400 font-medium mt-1">Total Volume OTC</div>
          </div>

          <div className="glass-card glass-card-hover p-5 rounded-2xl text-center border border-slate-800">
            <div className="text-2xl sm:text-3xl font-extrabold text-gradient-gold font-['Space_Grotesk']">
              &lt; 3 Menit
            </div>
            <div className="text-xs text-slate-400 font-medium mt-1">Kecepatan Settlement</div>
          </div>

          <div className="glass-card glass-card-hover p-5 rounded-2xl text-center border border-slate-800">
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-['Space_Grotesk']">
              100%
            </div>
            <div className="text-xs text-slate-400 font-medium mt-1">Fixed Rate Guarantee</div>
          </div>

          <div className="glass-card glass-card-hover p-5 rounded-2xl text-center border border-slate-800">
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-['Space_Grotesk']">
              24 / 7
            </div>
            <div className="text-xs text-slate-400 font-medium mt-1">Live OTC Support</div>
          </div>
        </div>

      </div>
    </section>
  );
}
