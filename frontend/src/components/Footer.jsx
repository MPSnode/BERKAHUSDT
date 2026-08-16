import React from 'react';
import { MessageSquare, ShieldCheck, ArrowUp, Send, Landmark } from 'lucide-react';

export default function Footer({ onOpenAdmin }) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-transparent text-slate-400 border-t border-slate-800/40 pt-16 pb-12 relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-emerald-500/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800/80">
          
          {/* Col 1 & 2: Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <img src="/coin_front.png" alt="BERKAH USDT" className="w-9 h-9 rounded-full" />
              <span className="text-2xl font-extrabold text-white font-['Space_Grotesk']">
                BERKAH<span className="text-emerald-400">USDT</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-md">
              Platform Moneychanger & OTC Desk USDT terdepan di Indonesia. Menyediakan penukaran Rupiah (IDR) & Tether (USDT) instant, rate paling kompetitif, tanpa biaya tersembunyi dengan jaminan keamanan transaksi 100%.
            </p>
            <div className="flex items-center gap-3 pt-2 text-xs font-mono text-emerald-400">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Layanan Moneychanger Online 24/7 Hari</span>
            </div>
          </div>

          {/* Col 3: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
              Navigasi Cepat
            </h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#calculator" className="hover:text-emerald-400 transition-colors">Kalkulator OTC</a></li>
              <li><a href="#rates" className="hover:text-emerald-400 transition-colors">Rate Real-Time</a></li>
              <li><a href="#features" className="hover:text-emerald-400 transition-colors">Keunggulan Service</a></li>
              <li><a href="#howitworks" className="hover:text-emerald-400 transition-colors">Langkah Transaksi</a></li>
              <li><a href="#faq" className="hover:text-emerald-400 transition-colors">Pusat Bantuan FAQ</a></li>
            </ul>
          </div>

          {/* Col 4: Bank Support */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
              Metode Pembayaran
            </h4>
            <ul className="space-y-2 text-xs font-mono text-slate-300">
              <li>• Bank BCA (Transfer / Bi-Fast)</li>
              <li>• Bank Mandiri (Livin Instant)</li>
              <li>• Bank BNI & Bank BRI</li>
              <li>• QRIS Instant All Payment</li>
              <li>• DANA, GoPay, OVO, ShopeePay</li>
            </ul>
          </div>

          {/* Col 5: Security Note */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
              Jaringan USDT
            </h4>
            <div className="flex flex-wrap gap-1.5 pt-1 font-mono text-[10px]">
              <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-emerald-400">TRC20</span>
              <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-amber-400">BEP20</span>
              <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-blue-400">ERC20</span>
              <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-purple-400">POLYGON</span>
              <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-teal-400">SOLANA</span>
            </div>
            <p className="text-[11px] text-slate-500 pt-2">
              Semua dompet resmi dikonfirmasi langsung melalui kontak resmi WhatsApp Admin BERKAH USDT.
            </p>
          </div>

        </div>

        {/* Bottom Legal & Scroll Top */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} BERKAH USDT Moneychanger. All Rights Reserved.
          </div>
          <div className="flex items-center gap-6">
            <span>Moneychanger & OTC Tether Indonesia</span>
            <button
              onClick={scrollToTop}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-emerald-400 hover:border-emerald-500/40 transition-all flex items-center gap-1.5"
            >
              <ArrowUp className="w-4 h-4" />
              <span className="text-[11px] font-mono">Ke Atas</span>
            </button>
          </div>
        </div>

      </div>

      {/* Floating Sticky WhatsApp Button */}
      <a
        href="https://wa.me/6281234567890?text=Halo%20Admin%20Berkah%20USDT,%20saya%20ingin%20tukar%20USDT"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-2xl shadow-emerald-500/40 hover:scale-110 active:scale-95 transition-all flex items-center gap-3 group"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
        </span>
        <MessageSquare className="w-6 h-6 fill-white text-emerald-600" />
        <span className="hidden group-hover:inline-block font-extrabold text-xs pr-1 tracking-wide">
          CHAT ADMIN OTC (24/7)
        </span>
      </a>
    </footer>
  );
}
