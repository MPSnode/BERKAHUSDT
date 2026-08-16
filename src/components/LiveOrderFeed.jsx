import React, { useState, useEffect } from 'react';
import { ShieldCheck, ArrowRightLeft, Clock, CheckCircle2 } from 'lucide-react';

export default function LiveOrderFeed() {
  const initialOrders = [
    { id: 1, user: '0x8f...4a12', action: 'BELI', amount: '2,500 USDT', value: 'Rp 40.375.000', bank: 'BCA', time: '12 detik lalu' },
    { id: 2, user: '0x3b...99c4', action: 'JUAL', amount: '800 USDT', value: 'Rp 12.864.000', bank: 'Mandiri', time: '45 detik lalu' },
    { id: 3, user: '0x7c...11e8', action: 'BELI', amount: '5,000 USDT', value: 'Rp 80.750.000', bank: 'BNI', time: '1 menit lalu' },
    { id: 4, user: '0x1d...66fa', action: 'BELI', amount: '10,000 USDT', value: 'Rp 161.500.000', bank: 'QRIS', time: '2 menit lalu' },
    { id: 5, user: '0x5e...33b0', action: 'JUAL', amount: '1,200 USDT', value: 'Rp 19.296.000', bank: 'BRI', time: '3 menit lalu' },
  ];

  const [orders, setOrders] = useState(initialOrders);

  // Periodically add new simulated live transaction to keep page feeling dynamic & alive
  useEffect(() => {
    const interval = setInterval(() => {
      const randomUser = `0x${Math.floor(Math.random()*16777215).toString(16).slice(0,2)}...${Math.floor(Math.random()*16777215).toString(16).slice(0,4)}`;
      const isBuy = Math.random() > 0.4;
      const amount = Math.floor(Math.random() * 45 + 5) * 100; // 500 - 5000 USDT
      const rate = isBuy ? 16150 : 16080;
      const total = amount * rate;
      const banks = ['BCA', 'Mandiri', 'BNI', 'BRI', 'QRIS'];
      const bank = banks[Math.floor(Math.random() * banks.length)];

      const newOrder = {
        id: Date.now(),
        user: randomUser,
        action: isBuy ? 'BELI' : 'JUAL',
        amount: `${amount.toLocaleString()} USDT`,
        value: new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(total),
        bank: bank,
        time: 'Baru saja'
      };

      setOrders((prev) => [newOrder, ...prev.slice(0, 4)]);
    }, 9000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-12 bg-transparent border-t border-slate-800/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Stream Transaksi Real-Time</span>
            </div>
            <h3 className="text-2xl font-bold text-white font-['Space_Grotesk']">
              Transaksi Terverifikasi Sukses
            </h3>
          </div>

          <div className="flex items-center gap-2 text-slate-400 text-xs font-mono">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span>Live Node Verification Active</span>
          </div>
        </div>

        {/* Live Order List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.slice(0, 6).map((order) => (
            <div
              key={order.id}
              className="glass-card glass-card-hover p-4 rounded-2xl border border-slate-800 flex items-center justify-between text-xs transition-all duration-500 animate-fadeIn"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                    order.action === 'BELI' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}>
                    {order.action}
                  </span>
                  <span className="font-mono text-slate-300 font-semibold">{order.user}</span>
                </div>
                <div className="text-slate-400">
                  <span className="font-bold text-white font-mono">{order.amount}</span> → {order.value}
                </div>
              </div>

              <div className="text-right space-y-1">
                <div className="px-2 py-1 rounded bg-slate-800 text-slate-300 font-mono text-[11px] font-semibold inline-block">
                  {order.bank}
                </div>
                <div className="flex items-center justify-end gap-1 text-[10px] text-slate-400 font-mono">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>{order.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
