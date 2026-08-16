import React from 'react';
import { ShieldCheck, Lock, CheckCircle2, Server, Landmark, QrCode } from 'lucide-react';

export default function SecurityPartners() {
  const banks = [
    { name: 'Bank BCA', desc: 'Transfer Real-Time / Bi-Fast', code: 'BCA' },
    { name: 'Bank Mandiri', desc: 'Livin Mandiri Instant', code: 'MANDIRI' },
    { name: 'Bank BNI', desc: 'BNI Mobile Banking', code: 'BNI' },
    { name: 'Bank BRI', desc: 'BRIMO Direct Instant', code: 'BRI' },
    { name: 'QRIS National', desc: 'BCA, GoPay, OVO, DANA, ShopeePay', code: 'QRIS' },
  ];

  const networks = [
    { name: 'Tron Network', tag: 'TRC20', desc: 'Super Cepat & Low Gas Fee' },
    { name: 'Binance Smart Chain', tag: 'BEP20', desc: 'Eksosistem Binance Compatible' },
    { name: 'Ethereum Mainnet', tag: 'ERC20', desc: 'Keamanan Standar Institusi' },
    { name: 'Polygon Chain', tag: 'POLYGON', desc: 'Biaya Transaksi Sangat Hemat' },
    { name: 'Solana Network', tag: 'SOL', desc: 'Kecepatan Settlement Sub-Detik' },
  ];

  return (
    <section id="security" className="py-24 bg-transparent relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-card border border-emerald-500/30 text-xs text-emerald-400 font-semibold uppercase tracking-wider">
            <Lock className="w-3.5 h-3.5" />
            Integrasi Bank & Blockchain
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-['Space_Grotesk']">
            Dukungan <span className="text-gradient-emerald">Bank Terkemuka</span> & <span className="text-gradient-gold">Jaringan Multi-Chain</span>
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Kami mendukung seluruh kanal pembayaran perbankan Indonesia dan jaringan utama Tether USDT global.
          </p>
        </div>

        {/* Bank & Payment Cards */}
        <div className="mb-12">
          <h3 className="text-sm font-extrabold text-slate-300 font-mono uppercase tracking-wider mb-6 flex items-center gap-2">
            <Landmark className="w-4 h-4 text-emerald-400" />
            <span>Kanal Pembayaran Bank & E-Wallet:</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {banks.map((b, idx) => (
              <div
                key={idx}
                className="glass-card glass-card-hover p-5 rounded-2xl border border-slate-800 text-center space-y-2"
              >
                <div className="inline-block px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono font-extrabold text-amber-400">
                  {b.code}
                </div>
                <div className="font-bold text-white text-sm font-['Space_Grotesk']">
                  {b.name}
                </div>
                <div className="text-[11px] text-slate-400">
                  {b.desc}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Network Badges */}
        <div>
          <h3 className="text-sm font-extrabold text-slate-300 font-mono uppercase tracking-wider mb-6 flex items-center gap-2">
            <Server className="w-4 h-4 text-amber-400" />
            <span>Jaringan Tether USDT Didukung:</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {networks.map((net, idx) => (
              <div
                key={idx}
                className="glass-card glass-card-hover p-5 rounded-2xl border border-slate-800 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {net.tag}
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="font-bold text-white text-sm font-['Space_Grotesk'] pt-1">
                  {net.name}
                </div>
                <div className="text-[11px] text-slate-400">
                  {net.desc}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
