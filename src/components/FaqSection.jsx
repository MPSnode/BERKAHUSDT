import React, { useState } from 'react';
import { HelpCircle, ChevronDown, MessageSquare } from 'lucide-react';

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      q: "Berapa lama proses penukaran USDT ke IDR (atau sebaliknya)?",
      a: "Rata-rata proses transaksi selesai dalam waktu 1 hingga 3 menit setelah pembayaran atau transfer USDT berhasil diverifikasi oleh sistem kami."
    },
    {
      q: "Apakah ada minimum atau maksimum limit transaksi?",
      a: "Minimum transaksi adalah $20 USDT (atau setara Rp 300.000). Untuk transaksi OTC skala besar (Whale Desk) di atas $50,000 USDT, kami menyediakan perlakuan khusus rate premium dan jalur VIP direct settlement."
    },
    {
      q: "Apakah rate di Berkah USDT mengikat (Fixed Rate)?",
      a: "Ya! Rate yang disepakati ketika Anda mengonfirmasi rincian order via Admin WhatsApp adalah FIXED RATE. Anda terbebas dari resiko slippage jika terjadi lonjakan harga saat proses transfer berlangsung."
    },
    {
      q: "Bagaimana jika saya baru dalam dunia crypto/USDT?",
      a: "Tim OTC Specialist kami bertugas 24/7 untuk membimbing Anda langkah demi langkah dari awal pembuatan wallet, pemilihan jaringan (TRC20/BEP20), hingga dana sukses cair."
    },
    {
      q: "Jaringan USDT mana yang paling direkomendasikan?",
      a: "Kami sangat merekomendasikan jaringan TRC20 (Tron) atau BEP20 (BNB Smart Chain) karena biaya transfer (gas fee) yang sangat murah dan kecepatan konfirmasi jaringan yang instan."
    },
    {
      q: "Apakah Berkah USDT beroperasi setiap hari?",
      a: "Ya, layanan OTC Moneychanger kami beroperasi 24 Jam Nonstop setiap hari (termasuk hari libur nasional dan akhir pekan)."
    }
  ];

  return (
    <section id="faq" className="py-24 bg-transparent relative border-t border-slate-800/40">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-card border border-amber-500/30 text-xs text-amber-400 font-semibold uppercase tracking-wider">
            <HelpCircle className="w-3.5 h-3.5" />
            Tanya Jawab Populer
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-['Space_Grotesk']">
            Pertanyaan Sering Diajukan <span className="text-gradient-gold">(FAQ)</span>
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Segala hal yang perlu Anda ketahui mengenai keamanan dan alur transaksi moneychanger BERKAH USDT.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="glass-card rounded-2xl border border-slate-800 overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 font-bold text-white hover:text-emerald-400 transition-colors"
                >
                  <span className="text-base sm:text-lg font-['Space_Grotesk']">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-300 ${
                    isOpen ? 'rotate-180 text-emerald-400' : ''
                  }`} />
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 pt-0 text-slate-300 text-sm leading-relaxed border-t border-slate-800/50">
                    <p className="pt-4">{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Contact Pill */}
        <div className="mt-12 text-center">
          <p className="text-slate-400 text-xs sm:text-sm mb-3">
            Punya pertanyaan spesifik yang belum terjawab?
          </p>
          <a
            href="https://wa.me/6281234567890?text=Halo%20Admin%20Berkah%20USDT,%20saya%20ingin%20tanya%20mengenai%20moneychanger"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-emerald-400 border border-slate-700 text-xs font-bold transition-all"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Tanya Langsung via WhatsApp Admin</span>
          </a>
        </div>

      </div>
    </section>
  );
}
