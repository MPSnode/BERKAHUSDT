import React from 'react';
import { MessageSquare, ShieldCheck, CheckCircle2, UserCheck, PhoneCall, Zap } from 'lucide-react';

export default function OtcSpecialists() {
  const specialists = [
    {
      name: "Bagas - OTC Specialist 1",
      role: "Senior OTC Dealer & Bank Settlement",
      status: "ONLINE 24/7",
      responseTime: "< 1 Menit",
      waText: "Halo%20Bagas,%20saya%20ingin%20tukar%20USDT",
      badge: "VIP DEALER"
    },
    {
      name: "Siska - OTC Specialist 2",
      role: "Crypto Moneychanger Desk & QRIS",
      status: "ONLINE 24/7",
      responseTime: "< 2 Menit",
      waText: "Halo%20Siska,%20saya%20ingin%20tukar%20USDT",
      badge: "INSTANT DESK"
    }
  ];

  return (
    <div className="py-10 bg-transparent border-t border-emerald-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-card border border-emerald-500/30 text-xs text-emerald-400 font-semibold uppercase tracking-wider">
            <UserCheck className="w-3.5 h-3.5" />
            Tim Admin Operator Siap Melayani
          </div>
          <h3 className="text-2xl font-bold text-white font-['Space_Grotesk'] mt-2">
            Hubungi Operator OTC Specialist BERKAH USDT
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {specialists.map((spec, idx) => (
            <div
              key={idx}
              className="glass-card glass-card-hover p-6 rounded-3xl border border-emerald-500/30 bg-[#07131B]/80 backdrop-blur-xl flex items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-400">{spec.status}</span>
                  <span className="px-2 py-0.5 text-[9px] font-bold rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">
                    {spec.badge}
                  </span>
                </div>

                <h4 className="text-lg font-bold text-white font-['Space_Grotesk'] pt-1">
                  {spec.name}
                </h4>
                <p className="text-xs text-slate-400">
                  {spec.role} • <span className="text-slate-300 font-mono">Respon: {spec.responseTime}</span>
                </p>
              </div>

              <a
                href={`https://wa.me/6281234567890?text=${spec.waText}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-extrabold text-xs shadow-lg shadow-emerald-950/50 hover:scale-105 transition-all flex items-center gap-2 shrink-0"
              >
                <MessageSquare className="w-4 h-4 fill-white text-emerald-600" />
                <span>CHAT WA</span>
              </a>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
