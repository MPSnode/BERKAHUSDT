import React from 'react';
import { CheckCircle2, Layers, Timer, Wallet } from 'lucide-react';
import { useSite } from '../context/SiteContext';
import { assetUrl } from '../lib/api';

export default function NetworksSection() {
  const { content, networks, paymentMethods, freeFeeThresholdUsdt } = useSite();

  return (
    <div className="glass-card rounded-3xl border border-slate-800 p-5 sm:p-7" data-testid="networks-section">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-[11px] text-emerald-400 font-bold uppercase tracking-wider mb-3">
        <Layers className="w-3.5 h-3.5" />
        Jaringan Transfer &amp; Terima
      </div>
      <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight font-['Space_Grotesk']">
        {content?.networkTitle || 'Jaringan yang Didukung'}
      </h2>
      <p className="text-slate-400 text-sm mt-2">
        {content?.networkSubtitle ||
          'Kami mendukung transfer & penerimaan USDT di berbagai jaringan blockchain populer.'}
      </p>

      {(!networks || networks.length === 0) && (
        <div className="mt-6 p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-sm text-slate-400">
          Daftar jaringan belum diatur. Atur di Admin Panel &gt; JARINGAN &amp; BIAYA.
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {(networks || []).map((net) => (
          <div
            key={net.code}
            data-testid={`network-item-${net.code}`}
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-emerald-500/40 transition-colors"
          >
            <img
              src={assetUrl(net.icon) || '/coin_back.png'}
              alt={net.code}
              className="w-9 h-9 rounded-full object-cover bg-slate-800"
              onError={(e) => {
                e.currentTarget.src = '/coin_back.png';
              }}
            />
            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold text-white truncate">{net.name || net.code}</div>
              <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2">
                <span className="text-emerald-400 font-bold">{net.code}</span>
                <span className="flex items-center gap-1">
                  <Timer className="w-3 h-3" /> {net.estimate || '1-3 menit'}
                </span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-[10px] text-slate-500 uppercase font-bold">Gas Fee</div>
              <div className="text-xs font-mono font-bold text-amber-400">{Number(net.feeUsdt || 0)} USDT</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/25 flex items-start gap-3">
        <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
        <div className="text-sm text-slate-200">
          <span className="font-bold text-emerald-400">Gratis biaya gas/fee</span> untuk pembelian mulai{' '}
          <span className="font-mono font-bold">
            {Number(freeFeeThresholdUsdt || 2000).toLocaleString('id-ID')} USDT
          </span>
          . Di bawah nominal tersebut dikenakan fee normal sesuai jaringan.
        </div>
      </div>

      {paymentMethods && paymentMethods.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            <Wallet className="w-4 h-4 text-emerald-400" /> Metode Pembayaran Didukung
          </div>
          <div className="flex flex-wrap gap-2">
            {paymentMethods.map((m) => (
              <span
                key={m.code}
                data-testid={`payment-method-${m.code}`}
                className="px-3 py-1.5 rounded-xl bg-slate-900/70 border border-slate-800 text-xs font-bold text-slate-200 font-mono"
              >
                {m.name || m.code}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
