import React from 'react';
import { 
  Zap, 
  ShieldCheck, 
  Coins, 
  Percent, 
  Layers, 
  Headphones, 
  Lock, 
  TrendingUp,
  CheckCircle2
} from 'lucide-react';

export default function FeaturesSection() {
  const features = [
    {
      icon: <Zap className="w-6 h-6 text-emerald-400" />,
      title: "Settlement Kilat < 3 Menit",
      description: "Transfer USDT atau Rupiah diproses instan dengan integrasi sistem perbankan otomatis & QRIS real-time.",
      badge: "ULTRA FAST",
      color: "emerald"
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-amber-400" />,
      title: "Garansi Rate Tetap (Zero Slippage)",
      description: "Rate yang Anda sepakati saat pesanan dibuat terkunci 100%. Bebas dari resiko perubahan harga mendadak.",
      badge: "FIXED RATE",
      color: "gold"
    },
    {
      icon: <Coins className="w-6 h-6 text-emerald-400" />,
      title: "Likuiditas OTC Skala Besar",
      description: "Melayani penukaran eceran dari $50 USDT hingga transaksi paus (Whale) senilai ratusan ribu USDT per hari.",
      badge: "DEEP LIQUIDITY",
      color: "emerald"
    },
    {
      icon: <Percent className="w-6 h-6 text-amber-400" />,
      title: "Bebas Biaya Admin (0% Fee)",
      description: "Tidak ada potongan terselubung. Jumlah yang tertera di kalkulator adalah jumlah bersih yang Anda terima.",
      badge: "TRANSPARENT",
      color: "gold"
    },
    {
      icon: <Layers className="w-6 h-6 text-emerald-400" />,
      title: "Dukungan Multi Blockchain",
      description: "Mendukung pengiriman & penerimaan USDT via TRC20 (Tron), BEP20 (BSC), ERC20, Polygon, dan Solana.",
      badge: "MULTI-CHAIN",
      color: "emerald"
    },
    {
      icon: <Headphones className="w-6 h-6 text-amber-400" />,
      title: "OTC Specialist Direct 24/7",
      description: "Tim admin manusia profesional siap melayani pertanyaan dan transaksi Anda 24 jam nonstop via WhatsApp.",
      badge: "HUMAN SUPPORT",
      color: "gold"
    },
  ];

  return (
    <section id="features" className="py-24 bg-transparent relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-card border border-emerald-500/30 text-xs text-emerald-400 font-semibold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            Mengapa Memilih Berkah USDT
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-['Space_Grotesk']">
            Standar Baru <span className="text-gradient-emerald">Moneychanger USDT</span> di Indonesia
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Dirancang khusus untuk memenuhi kebutuhan trader, investor crypto, perusahaan OTC, dan ekosistem Web3 di Indonesia.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((item, idx) => (
            <div
              key={idx}
              className="glass-card glass-card-hover p-8 rounded-3xl border border-slate-800 relative group overflow-hidden"
            >
              {/* Top Card Badge */}
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold font-mono tracking-wider ${
                  item.color === 'emerald'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                }`}>
                  {item.badge}
                </span>
              </div>

              <h3 className="text-xl font-bold text-white mb-2 font-['Space_Grotesk'] group-hover:text-emerald-400 transition-colors">
                {item.title}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                {item.description}
              </p>

              {/* Bottom Subtle Indicator */}
              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center gap-1.5 text-xs font-mono text-slate-400 group-hover:text-emerald-400 transition-colors">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Teruji & Terverifikasi</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
