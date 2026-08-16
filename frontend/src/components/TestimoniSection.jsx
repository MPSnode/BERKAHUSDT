import { API } from '../lib/api';
import React, { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle2, Star, ExternalLink, Eye, ArrowRight, Zap, Check, Sparkles, X, Image as ImageIcon } from 'lucide-react';

export default function TestimoniSection() {
  const [row1, setRow1] = useState([]);
  const [row2, setRow2] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProof, setSelectedProof] = useState(null);

  const defaultRow1 = [
    { id: 'DEF-1', title: 'Penukaran USDT', clientName: 'Buyer OTC Jakarta', amount: '-2.500 USDT', status: 'Selesai', imageUrl: '', badge: 'VERIFIED USDT', network: 'TRC-20' },
    { id: 'DEF-2', title: 'Pembelian USDT', clientName: 'Buyer OTC Surabaya', amount: '-6.200 USDT', status: 'Selesai', imageUrl: '', badge: 'VERIFIED USDT', network: 'TRC-20' },
    { id: 'DEF-3', title: 'Transaksi OTC Instan', clientName: 'Buyer OTC Medan', amount: '-4.000 USDT', status: 'Selesai', imageUrl: '', badge: 'VERIFIED USDT', network: 'TRC-20' },
    { id: 'DEF-4', title: 'Transfer Likuiditas', clientName: 'Buyer OTC Bali', amount: '-3.248,97 USDT', status: 'Selesai', imageUrl: '', badge: 'VERIFIED USDT', network: 'TRC-20' },
    { id: 'DEF-5', title: 'Penukaran Kilat', clientName: 'Buyer OTC Bandung', amount: '-770 USDT', status: 'Selesai', imageUrl: '', badge: 'VERIFIED USDT', network: 'TRC-20' },
    { id: 'DEF-6', title: 'Beli USDT OTC', clientName: 'Buyer OTC Semarang', amount: '-1.100 USDT', status: 'Selesai', imageUrl: '', badge: 'VERIFIED USDT', network: 'TRC-20' },
    { id: 'DEF-7', title: 'OTC Volume Besar', clientName: 'Buyer VIP Trader', amount: '-15.000 USDT', status: 'Completed', imageUrl: '', badge: 'VERIFIED USDT', network: 'TRC-20' },
  ];

  const defaultRow2 = [
    { id: 'DEF-8', title: 'OTC VIP Liquidity', clientName: 'Buyer OTC Makassar', amount: '-14.700 USDT', status: 'Completed', imageUrl: '', badge: 'VERIFIED USDT', network: 'TRC-20' },
    { id: 'DEF-9', title: 'Transaksi OTC USDT', clientName: 'Buyer VIP Whales', amount: '-20.000 USDT', status: 'Completed', imageUrl: '', badge: 'VERIFIED USDT', network: 'TRC-20' },
    { id: 'DEF-10', title: 'Penarikan Dana OTC', clientName: 'Buyer OTC Eksekutif', amount: '-37.056,92 USDT', status: 'Completed', imageUrl: '', badge: 'VERIFIED USDT', network: 'TRC-20' },
    { id: 'DEF-11', title: 'Pembelian USDT', clientName: 'Buyer OTC Yogyakarta', amount: '-10.000 USDT', status: 'Completed', imageUrl: '', badge: 'VERIFIED USDT', network: 'TRC-20' },
    { id: 'DEF-12', title: 'OTC Fast Settlement', clientName: 'Buyer OTC Palembang', amount: '-8.904,72 USDT', status: 'Completed', imageUrl: '', badge: 'VERIFIED USDT', network: 'TRC-20' },
    { id: 'DEF-13', title: 'Penukaran Instan', clientName: 'Buyer OTC Batam', amount: '-14.247,78 USDT', status: 'Completed', imageUrl: '', badge: 'VERIFIED USDT', network: 'TRC-20' },
    { id: 'DEF-14', title: 'Pencairan OTC USDT', clientName: 'Buyer OTC Samarinda', amount: '-9.847,5 USDT', status: 'Completed', imageUrl: '', badge: 'VERIFIED USDT', network: 'TRC-20' },
  ];

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const res = await fetch(`${API}/testimonials`);
      const data = await res.json();
      if (data && data.success) {
        if (data.row1 && data.row1.length > 0) setRow1(data.row1);
        else setRow1(defaultRow1);

        if (data.row2 && data.row2.length > 0) setRow2(data.row2);
        else setRow2(defaultRow2);
      } else {
        setRow1(defaultRow1);
        setRow2(defaultRow2);
      }
    } catch (err) {
      setRow1(defaultRow1);
      setRow2(defaultRow2);
    } finally {
      setLoading(false);
    }
  };

  // Render Card Component
  const renderCard = (item, idx) => {
    const hasCustomImage = Boolean(item.imageUrl);

    return (
      <div
        key={`${item.id}-${idx}`}
        onClick={() => setSelectedProof(item)}
        className="group relative flex-shrink-0 cursor-pointer select-none transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]"
        style={{ width: hasCustomImage ? '240px' : '220px' }}
      >
        {hasCustomImage ? (
          // Uploaded Photo Receipt Style
          <div className="h-36 w-full rounded-2xl border border-slate-800/90 bg-[#08121A]/90 p-2.5 backdrop-blur-md transition-all group-hover:border-emerald-500/60 group-hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] flex flex-col justify-between overflow-hidden">
            <div className="relative h-20 w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
              <img
                src={item.imageUrl}
                alt={item.title || 'Bukti Transaksi'}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                onError={(e) => { e.target.src = '/logo_berkah.jpg'; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 backdrop-blur-sm">
                {item.badge || 'VERIFIED'}
              </span>
              <div className="absolute bottom-1.5 right-1.5 p-1 rounded-md bg-black/60 text-slate-300 group-hover:text-emerald-400 transition-colors">
                <Eye className="w-3 h-3" />
              </div>
            </div>

            <div className="pt-1.5 flex items-center justify-between">
              <div>
                <span className="text-white font-extrabold text-sm block font-['Space_Grotesk'] leading-tight">
                  {item.amount}
                </span>
                <span className="text-[10px] text-slate-400 block font-mono truncate max-w-[120px]">
                  {item.clientName || 'Buyer OTC'}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-2.5 h-2.5" />
                <span>{item.status || 'Selesai'}</span>
              </span>
            </div>
          </div>
        ) : (
          // Cyberpunk Verified OTC Badge Card Style (Exact match to Reference Screenshot)
          <div className="h-32 w-full rounded-2xl border border-slate-800/90 bg-[#08121A]/95 p-4 backdrop-blur-md transition-all group-hover:border-emerald-500/70 group-hover:bg-[#0A1620] group-hover:shadow-[0_0_20px_rgba(16,185,129,0.2)] flex flex-col justify-between">
            {/* Top Bar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-extrabold tracking-wider text-emerald-400 uppercase font-mono">
                  {item.badge || 'VERIFIED USDT'}
                </span>
              </div>
              <span className="text-[9px] font-extrabold tracking-widest text-slate-400 font-mono uppercase bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">
                BERKAH USDT
              </span>
            </div>

            {/* Main Center Amount */}
            <div className="text-center py-1">
              <div className="text-xl font-extrabold text-white font-['Space_Grotesk'] tracking-tight group-hover:text-emerald-300 transition-colors">
                {item.amount}
              </div>
            </div>

            {/* Bottom Status Bar */}
            <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-emerald-400 font-mono">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>{item.status || 'Selesai'}</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  const listRow1 = row1.length > 0 ? row1 : defaultRow1;
  const listRow2 = row2.length > 0 ? row2 : defaultRow2;

  // Duplicate for seamless infinite loop marquee
  const marqueeRow1 = [...listRow1, ...listRow1, ...listRow1, ...listRow1];
  const marqueeRow2 = [...listRow2, ...listRow2, ...listRow2, ...listRow2];

  return (
    <section className="relative overflow-hidden py-16 bg-[#040810] border-t border-b border-slate-800/80">
      {/* Background Watermark & Glow Accents */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.03]">
        <img src="/coin_front.png" alt="Coin Watermark" className="w-[600px] h-[600px] object-contain" />
      </div>
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[350px] bg-emerald-500/5 blur-[120px] rounded-full" />

      {/* Floating Indonesian Flag & Eagle Accents (As seen in Reference Image) */}
      <div className="pointer-events-none absolute top-8 left-12 opacity-60 animate-float hidden lg:block">
        <span className="text-2xl">🇮🇩</span>
      </div>
      <div className="pointer-events-none absolute top-8 right-16 opacity-60 animate-float hidden lg:block" style={{ animationDelay: '2s' }}>
        <span className="text-2xl">🇮🇩</span>
      </div>
      <div className="pointer-events-none absolute bottom-6 left-24 opacity-60 animate-float hidden lg:block" style={{ animationDelay: '3s' }}>
        <span className="text-2xl">🇮🇩</span>
      </div>
      <div className="pointer-events-none absolute bottom-6 right-28 opacity-60 animate-float hidden lg:block" style={{ animationDelay: '1s' }}>
        <span className="text-2xl">🇮🇩</span>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-10">
        {/* Top Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-extrabold uppercase tracking-widest font-mono mb-3">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>TESTIMONI CRYPTO</span>
        </div>

        {/* Big Glow Title */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 font-['Space_Grotesk'] tracking-tight drop-shadow-[0_0_25px_rgba(245,158,11,0.25)]">
          BUYER USDT
        </h2>

        {/* Subtitle */}
        <p className="mt-3 text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto font-mono">
          Bukti transaksi nyata & testimoni kepuasan pelanggan penukaran USDT (Crypto) BERKAH USDT
        </p>
      </div>

      {/* Marquee Tracks Container */}
      <div className="relative w-full overflow-hidden space-y-4">
        {/* Left & Right Dark Fade Gradients */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 sm:w-40 bg-gradient-to-r from-[#040810] to-transparent z-20" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 sm:w-40 bg-gradient-to-l from-[#040810] to-transparent z-20" />

        {/* Baris 1: Bergerak ke KANAN */}
        <div className="flex overflow-hidden">
          <div className="animate-marquee-right flex gap-4 py-1">
            {marqueeRow1.map((item, idx) => renderCard(item, `r1-${idx}`))}
          </div>
        </div>

        {/* Baris 2: Bergerak ke KIRI */}
        <div className="flex overflow-hidden">
          <div className="animate-marquee-left flex gap-4 py-1">
            {marqueeRow2.map((item, idx) => renderCard(item, `r2-${idx}`))}
          </div>
        </div>
      </div>

      {/* Interactive Lightbox Detail Modal */}
      {selectedProof && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-xl z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-md glass-card rounded-3xl border border-emerald-500/40 bg-[#061219] p-6 text-slate-100 shadow-2xl space-y-5 animate-in zoom-in-95">
            <button
              onClick={() => setSelectedProof(null)}
              className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-slate-900 border border-slate-700 text-slate-400 hover:text-white flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white font-['Space_Grotesk']">
                  Bukti Transaksi Terverifikasi
                </h3>
                <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Status: Selesai & Berhasil
                </span>
              </div>
            </div>

            {selectedProof.imageUrl ? (
              <div className="relative w-full max-h-72 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800">
                <img
                  src={selectedProof.imageUrl}
                  alt={selectedProof.title}
                  className="w-full h-full object-contain mx-auto"
                />
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-[#040A10] border border-slate-800 text-center space-y-2">
                <span className="text-slate-400 text-xs uppercase font-mono block">Volume Transaksi:</span>
                <div className="text-3xl font-extrabold text-white font-['Space_Grotesk'] text-emerald-400">
                  {selectedProof.amount}
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  Network: {selectedProof.network || 'TRC-20'} • Layanan OTC Instan
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 text-xs font-mono bg-[#040A10] p-3.5 rounded-2xl border border-slate-800">
              <div>
                <span className="text-slate-500 text-[10px] block">Pelanggan:</span>
                <strong className="text-slate-200">{selectedProof.clientName || 'Buyer OTC'}</strong>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">Jaringan:</span>
                <strong className="text-emerald-400">{selectedProof.network || 'TRC-20'}</strong>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2.5">
              <a
                href="https://wa.me/6281234567890?text=Halo%20Admin%20BERKAH%20USDT,%20saya%20ingin%20transaksi%20OTC"
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-extrabold text-xs shadow-lg text-center flex items-center justify-center gap-2"
              >
                <span>Mulai Transaksi OTC Sekarang</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={() => setSelectedProof(null)}
                className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
