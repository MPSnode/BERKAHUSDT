import { API } from '../lib/api';
import React from 'react';
import { TrendingUp, ArrowUpRight, ShieldCheck, Activity } from 'lucide-react';

export default function MarketTicker({ buyRate: propBuy, sellRate: propSell }) {
  const [liveBuy, setLiveBuy] = React.useState(propBuy || 16150);
  const [liveSell, setLiveSell] = React.useState(propSell || 16080);

  React.useEffect(() => {
    if (propBuy) setLiveBuy(propBuy);
    if (propSell) setLiveSell(propSell);
  }, [propBuy, propSell]);

  React.useEffect(() => {
    const fetchRates = async () => {
      try {
        const res = await fetch(`${API}/rates`);
        const data = await res.json();
        if (data && data.buyRate) {
          setLiveBuy(data.buyRate);
          setLiveSell(data.sellRate);
        }
      } catch (err) {}
    };

    fetchRates();
    const interval = setInterval(fetchRates, 2500);
    return () => clearInterval(interval);
  }, []);

  const tickerItems = [
    { symbol: 'USDT/IDR (Beli)', price: `Rp ${Number(liveBuy).toLocaleString()}`, change: '+0.15%', isUp: true, badge: 'BELI RATE' },
    { symbol: 'USDT/IDR (Jual)', price: `Rp ${Number(liveSell).toLocaleString()}`, change: '-0.10%', isUp: false, badge: 'JUAL RATE' },
    { symbol: 'BTC/USDT', price: '$67,450.00', change: '+2.85%', isUp: true },
    { symbol: 'ETH/USDT', price: '$3,520.40', change: '+1.94%', isUp: true },
    { symbol: 'SOL/USDT', price: '$158.20', change: '+5.12%', isUp: true },
    { symbol: 'BNB/USDT', price: '$588.60', change: '+0.88%', isUp: true },
    { symbol: 'USDC/USDT', price: '$1.0001', change: '+0.01%', isUp: true },
  ];

  return (
    <div id="rates" className="relative py-4 bg-transparent backdrop-blur-md bg-slate-950/20 border-y border-slate-800/40 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 mb-2 flex items-center justify-between text-xs text-slate-400 font-mono">
        <div className="flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span className="text-slate-300 font-semibold uppercase tracking-wider">Passar & Rates Moneychanger Live</span>
        </div>
        <div className="hidden sm:block text-[11px] text-slate-500">
          *Update Otomatis Mengikuti Fluktuasi Market Real-Time
        </div>
      </div>

      <div className="relative flex overflow-x-hidden">
        {/* Left/Right Faded Gradients for smooth marquee */}
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#070C1A] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#070C1A] to-transparent z-10 pointer-events-none" />

        <div className="animate-ticker flex items-center gap-6 py-1 font-mono">
          {/* Double array for seamless loop */}
          {[...tickerItems, ...tickerItems, ...tickerItems].map((item, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 px-4 py-2 rounded-xl glass-card border border-slate-800 text-xs shrink-0 hover:border-emerald-500/40 transition-colors"
            >
              <span className="font-bold text-slate-200">{item.symbol}</span>
              <span className="font-semibold text-emerald-400">{item.price}</span>
              <span className={`flex items-center text-[11px] font-medium ${item.isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                {item.change}
                <ArrowUpRight className={`w-3 h-3 ${item.isUp ? '' : 'rotate-90'}`} />
              </span>
              {item.badge && (
                <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  {item.badge}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
