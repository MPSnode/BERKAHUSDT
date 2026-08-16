import React from 'react';
import { Calculator, MessageSquare, Send, CheckCircle2, ArrowRight } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      step: '01',
      icon: <Calculator className="w-6 h-6 text-emerald-400" />,
      title: 'Hitung di Kalkulator',
      description: 'Masukkan jumlah USDT yang ingin dibeli atau dijual. Pilih metode bank/QRIS dan jaringan USDT pilihan Anda.'
    },
    {
      step: '02',
      icon: <MessageSquare className="w-6 h-6 text-amber-400" />,
      title: 'Konfirmasi via WhatsApp',
      description: 'Klik tombol WhatsApp untuk terhubung langsung dengan Admin OTC. Rincian pesanan akan terisi secara otomatis.'
    },
    {
      step: '03',
      icon: <Send className="w-6 h-6 text-emerald-400" />,
      title: 'Transfer & Verifikasi',
      description: 'Transfer dana Rupiah ke Rekening Resmi OTC (atau kirim USDT ke Wallet Resmi BERKAH USDT).'
    },
    {
      step: '04',
      icon: <CheckCircle2 className="w-6 h-6 text-amber-400" />,
      title: 'Pencairan Instan < 3 Menit',
      description: 'Tim kami memverifikasi transaksi dan mengirimkan USDT / IDR ke dompet atau rekening Anda secara kilat.'
    },
  ];

  return (
    <section id="howitworks" className="py-24 bg-transparent relative border-t border-slate-800/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-card border border-amber-500/30 text-xs text-amber-400 font-semibold uppercase tracking-wider">
            Alur Transaksi Mudah
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-['Space_Grotesk']">
            Cara Mudah <span className="text-gradient-gold">Tukar USDT</span> Dalam 4 Langkah
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Tanpa perlu KYC berbelit-belit, transaksi selesai hanya dalam hitungan menit.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {steps.map((item, idx) => (
            <div
              key={idx}
              className="glass-card glass-card-hover p-8 rounded-3xl border border-slate-800 relative flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center">
                    {item.icon}
                  </div>
                  <span className="text-3xl font-extrabold font-mono text-slate-700">
                    {item.step}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white mb-3 font-['Space_Grotesk']">
                  {item.title}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>

              {idx < steps.length - 1 && (
                <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                  <ArrowRight className="w-6 h-6 text-slate-700" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom Callout Banner */}
        <div className="mt-12 p-6 rounded-3xl glass-card border border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 via-[#0A0F1D] to-amber-950/30 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-lg font-bold text-white font-['Space_Grotesk']">
              Siap untuk melakukan transaksi pertama Anda?
            </h4>
            <p className="text-xs sm:text-sm text-slate-300">
              Tim OTC Specialist kami bertugas 24 jam nonstop untuk membantu semua kebutuhan penukaran Anda.
            </p>
          </div>
          <a
            href="https://wa.me/6281234567890?text=Halo%20Admin%20Berkah%20USDT,%20saya%20ingin%20tukar%20USDT"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-extrabold text-xs sm:text-sm shrink-0 shadow-lg shadow-emerald-950/60 hover:scale-105 transition-all"
          >
            HUBUNGI SPECIALIST OTC NOW
          </a>
        </div>

      </div>
    </section>
  );
}
