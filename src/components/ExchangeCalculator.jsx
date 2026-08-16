import React, { useState } from 'react';
import { 
  ArrowLeftRight, 
  CheckCircle2, 
  MessageSquare, 
  ShieldCheck, 
  Zap, 
  Copy, 
  Check, 
  Banknote,
  CreditCard,
  QrCode,
  Info
} from 'lucide-react';

export default function ExchangeCalculator({ buyRate: propBuy, sellRate: propSell }) {
  const [mode, setMode] = useState('buy'); // 'buy' = Beli USDT, 'sell' = Jual USDT
  const [usdtAmount, setUsdtAmount] = useState(500);
  const [copied, setCopied] = useState(false);

  // Live MongoDB Rates State with 3-second auto-polling sync
  const [liveBuyRate, setLiveBuyRate] = useState(propBuy || 16150);
  const [liveSellRate, setLiveSellRate] = useState(propSell || 16080);

  React.useEffect(() => {
    if (propBuy) setLiveBuyRate(propBuy);
    if (propSell) setLiveSellRate(propSell);
  }, [propBuy, propSell]);

  React.useEffect(() => {
    const fetchLiveRates = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/rates');
        const data = await res.json();
        if (data && data.buyRate) {
          setLiveBuyRate(data.buyRate);
          setLiveSellRate(data.sellRate);
        }
      } catch (err) {}
    };

    fetchLiveRates();
    const interval = setInterval(fetchLiveRates, 2500);
    return () => clearInterval(interval);
  }, []);

  const buyRate = liveBuyRate;
  const sellRate = liveSellRate;

  const currentRate = mode === 'buy' ? buyRate : sellRate;

  // Selected Bank & Network
  const [selectedBank, setSelectedBank] = useState('BCA');
  const [selectedNetwork, setSelectedNetwork] = useState('TRC20');

  const banks = [
    { id: 'BCA', name: 'Bank BCA', color: 'text-blue-400' },
    { id: 'Mandiri', name: 'Bank Mandiri', color: 'text-amber-400' },
    { id: 'BNI', name: 'Bank BNI', color: 'text-orange-400' },
    { id: 'BRI', name: 'Bank BRI', color: 'text-blue-500' },
    { id: 'QRIS', name: 'QRIS Instant', color: 'text-emerald-400' },
  ];

  const networks = [
    { id: 'TRC20', name: 'TRX — Tron (TRC20)', feeUsdt: 1.50, fee: '1.50 USDT', minUsdt: 5, time: '< 1 Menit Instan' },
    { id: 'BEP20', name: 'BSC — BNB Smart Chain (BEP20)', feeUsdt: 0.01, fee: '0.01 USDT', minUsdt: 5, time: '< 1 Menit Instan' },
    { id: 'ERC20', name: 'ETH — Ethereum (ERC20)', feeUsdt: 0.40, fee: '0.40 USDT', minUsdt: 3, time: '< 2 Menit' },
    { id: 'SOL', name: 'SOL — Solana', feeUsdt: 0.30, fee: '0.30 USDT', minUsdt: 3, time: '< 1 Menit Instan' },
    { id: 'POL', name: 'POL — Polygon POS', feeUsdt: 0.07, fee: '0.07 USDT', minUsdt: 5, time: '< 2 Menit' },
    { id: 'ARBITRUM', name: 'ARBITRUM — Arbitrum One', feeUsdt: 0.10, fee: '0.10 USDT', minUsdt: 3, time: '< 1 Menit Instan' },
    { id: 'TON', name: 'TON — The Open Network (TON)', feeUsdt: 0.30, fee: '0.30 USDT', minUsdt: 5, time: '< 1 Menit Instan' },
    { id: 'OPBNB', name: 'OPBNB — opBNB', feeUsdt: 0.015, fee: '0.015 USDT', minUsdt: 5, time: '< 1 Menit Instan' },
    { id: 'OPTIMISM', name: 'OPTIMISM — Optimism', feeUsdt: 0.04, fee: '0.04 USDT', minUsdt: 3, time: '< 1 Menit Instan' },
    { id: 'AVAXC', name: 'AVAXC — AVAX C-Chain', feeUsdt: 0.04, fee: '0.04 USDT', minUsdt: 5, time: '< 1 Menit Instan' },
    { id: 'APT', name: 'APT — Aptos', feeUsdt: 0.10, fee: '0.10 USDT', minUsdt: 5, time: '< 1 Menit Instan' },
    { id: 'CELO', name: 'CELO — Celo', feeUsdt: 0.05, fee: '0.05 USDT', minUsdt: 5, time: '< 5 Menit' },
    { id: 'KAIA', name: 'KAIA — Kaia', feeUsdt: 0.02, fee: '0.02 USDT', minUsdt: 5, time: '< 1 Menit Instan' },
    { id: 'NEAR', name: 'NEAR — NEAR Protocol', feeUsdt: 0.20, fee: '0.20 USDT', minUsdt: 5, time: '< 1 Menit Instan' },
    { id: 'SCROLL', name: 'SCROLL — Scroll', feeUsdt: 0.10, fee: '0.10 USDT', minUsdt: 5, time: '< 1 Menit Instan' },
    { id: 'DOT', name: 'DOT — Asset Hub Polkadot', feeUsdt: 0.10, fee: '0.10 USDT', minUsdt: 5, time: '< 1 Menit Instan' },
    { id: 'KAVAEVM', name: 'KAVAEVM — KavaEVM', feeUsdt: 0.20, fee: '0.20 USDT', minUsdt: 5, time: '< 1 Menit Instan' },
    { id: 'XTZ', name: 'XTZ — Tezos', feeUsdt: 0.10, fee: '0.10 USDT', minUsdt: 5, time: '< 1 Menit Instan' },
    { id: 'PLASMA', name: 'PLASMA — Plasma', feeUsdt: 0.012, fee: '0.012 USDT', minUsdt: 5, time: '< 1 Menit Instan' },
  ];

  const currentNetworkObj = networks.find(n => n.id === selectedNetwork) || networks[0];
  const isFreeFee = usdtAmount >= 1000;
  const networkFeeUsdt = isFreeFee ? 0 : currentNetworkObj.feeUsdt;
  const networkFeeIdr = networkFeeUsdt * currentRate;

  const baseIdr = usdtAmount * currentRate;
  const totalIdr = mode === 'buy' ? baseIdr + networkFeeIdr : Math.max(0, baseIdr - networkFeeIdr);

  const quickAmounts = [100, 250, 500, 1000, 2500, 5000];

  const formatIDR = (val) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const handleUsdtChange = (e) => {
    const val = parseFloat(e.target.value) || 0;
    setUsdtAmount(val);
  };

  const handleIdrChange = (e) => {
    const val = parseFloat(e.target.value) || 0;
    const targetBase = mode === 'buy' ? Math.max(0, val - networkFeeIdr) : val + networkFeeIdr;
    setUsdtAmount(Math.round(targetBase / currentRate));
  };

  const getWaMessage = () => {
    const actionText = mode === 'buy' ? 'BELI USDT' : 'JUAL USDT';
    const text = `Halo Admin Berkah USDT, saya ingin melakukan transaksi *${actionText}*:\n\n` +
      `• Jumlah USDT: *${usdtAmount.toLocaleString()} USDT*\n` +
      `• Total Rupiah: *${formatIDR(totalIdr)}*\n` +
      `• Rate OTC: *1 USDT = ${formatIDR(currentRate)}*\n` +
      `• Metode Pembayaran: *${selectedBank}*\n` +
      `• Jaringan USDT: *${selectedNetwork}*\n\n` +
      `Mohon kirimkan instruksi pembayaran & rekening OTC. Terima kasih!`;
    return encodeURIComponent(text);
  };

  const waLink = `https://wa.me/6281234567890?text=${getWaMessage()}`;

  const copyOrderSummary = () => {
    const actionText = mode === 'buy' ? 'BELI USDT' : 'JUAL USDT';
    const text = `ORDER BERKAH USDT\nMode: ${actionText}\nJumlah: ${usdtAmount} USDT\nTotal IDR: ${formatIDR(totalIdr)}\nRate: 1 USDT = ${formatIDR(currentRate)}\nMetode: ${selectedBank}\nNetwork: ${selectedNetwork}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="calculator" className="py-20 bg-transparent relative">
      {/* Background Decor */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-card border border-emerald-500/30 text-xs text-emerald-400 font-semibold uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5" />
            Kalkulator Instan Moneychanger
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-['Space_Grotesk']">
            Hitung Penukaran <span className="text-gradient-emerald">USDT Real-Time</span>
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Dapatkan estimasi pembayaran transparan tanpa biaya tersembunyi. Langsung hubungi OTC Specialist kami untuk eksekusi instan.
          </p>
        </div>

        {/* Main Calculator Card */}
        <div className="max-w-4xl mx-auto glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl relative overflow-hidden">
          
          {/* Top Mode Selector Tabs */}
          <div className="grid grid-cols-2 gap-3 p-1.5 rounded-2xl bg-[#070C1A] border border-slate-800 mb-8">
            <button
              onClick={() => setMode('buy')}
              className={`py-3.5 px-4 rounded-xl text-sm sm:text-base font-extrabold transition-all duration-300 flex items-center justify-center gap-2 ${
                mode === 'buy'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-950/50'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <Banknote className="w-5 h-5" />
              <span>SAYA MAU BELI USDT</span>
            </button>

            <button
              onClick={() => setMode('sell')}
              className={`py-3.5 px-4 rounded-xl text-sm sm:text-base font-extrabold transition-all duration-300 flex items-center justify-center gap-2 ${
                mode === 'sell'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-950/50'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <CreditCard className="w-5 h-5" />
              <span>SAYA MAU JUAL USDT</span>
            </button>
          </div>

          {/* Current Rate Banner */}
          <div className="flex items-center justify-between px-5 py-3 rounded-xl bg-slate-900/80 border border-slate-800 mb-6 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium">Rate Fix Saat Ini:</span>
              <span className="font-bold text-white font-mono">1 USDT = {formatIDR(currentRate)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Live Update</span>
            </div>
          </div>

          {/* Inputs Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
            
            {/* Input 1: USDT Amount */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                {mode === 'buy' ? 'Jumlah USDT Diterima:' : 'Jumlah USDT Dikirim:'}
              </label>
              <div className="relative rounded-2xl bg-[#080D1C] border border-slate-800 focus-within:border-emerald-500 transition-colors p-4">
                <div className="flex items-center justify-between">
                  <input
                    type="number"
                    min="10"
                    max="100000"
                    value={usdtAmount || ''}
                    onChange={handleUsdtChange}
                    className="w-full bg-transparent text-2xl sm:text-3xl font-extrabold text-white focus:outline-none font-mono"
                    placeholder="0"
                  />
                  <div className="flex items-center gap-2 pl-3 border-l border-slate-800 shrink-0">
                    <img src="/coin_back.png" alt="USDT" className="w-7 h-7 rounded-full" />
                    <span className="font-extrabold text-white font-mono text-sm">USDT</span>
                  </div>
                </div>
              </div>

              {/* Quick Amounts */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {quickAmounts.map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setUsdtAmount(amt)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors ${
                      usdtAmount === amt
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold'
                        : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    ${amt}
                  </button>
                ))}
              </div>
            </div>

            {/* Input 2: IDR Amount */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                {mode === 'buy' ? 'Total Rupiah Dibayarkan:' : 'Total Rupiah Diterima:'}
              </label>
              <div className="relative rounded-2xl bg-[#080D1C] border border-slate-800 focus-within:border-emerald-500 transition-colors p-4">
                <div className="flex items-center justify-between">
                  <input
                    type="number"
                    value={totalIdr || ''}
                    onChange={handleIdrChange}
                    className="w-full bg-transparent text-2xl sm:text-3xl font-extrabold text-emerald-400 focus:outline-none font-mono"
                    placeholder="0"
                  />
                  <div className="flex items-center gap-2 pl-3 border-l border-slate-800 shrink-0">
                    <span className="font-extrabold text-amber-400 font-mono text-sm">IDR (Rp)</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1">
                <span>
                  {isFreeFee ? (
                    <span className="text-emerald-400 font-bold">*Bebas Biaya Gas (Nominal ≥ $1,000 USDT)</span>
                  ) : (
                    <span>
                      *Rate ({formatIDR(baseIdr)}) + Gas Fee {selectedNetwork} ({formatIDR(networkFeeIdr)})
                    </span>
                  )}
                </span>
                <span className="font-bold text-slate-200">{formatIDR(totalIdr)}</span>
              </div>
            </div>

          </div>

          {/* Bank & Network Selection */}
          <div className="mt-8 pt-6 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Bank Method */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Pilih Bank Transfer / Payment:
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {banks.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => setSelectedBank(b.id)}
                    className={`py-2 px-2 rounded-xl text-xs font-bold font-mono text-center border transition-all ${
                      selectedBank === b.id
                        ? 'bg-emerald-500/20 border-emerald-500 text-white shadow-md'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {b.id}
                  </button>
                ))}
              </div>
            </div>

            {/* Network Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Pilih Jaringan USDT (Network):
              </label>
              <select
                value={selectedNetwork}
                onChange={(e) => setSelectedNetwork(e.target.value)}
                className="w-full bg-[#080D1C] border border-slate-800 rounded-xl p-3 text-xs sm:text-sm font-mono text-white focus:outline-none focus:border-emerald-500"
              >
                {networks.map((net) => (
                  <option key={net.id} value={net.id}>
                    {net.name} — Fee Binance: {isFreeFee ? 'FREE (Promo >= $1,000)' : net.fee}
                  </option>
                ))}
              </select>
            </div>

          </div>

          {/* Transaction Summary Box */}
          <div className="mt-6 p-4.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 space-y-2.5 text-xs sm:text-sm">
            <div className="flex justify-between items-center text-slate-300">
              <span className="font-medium">Biaya Penanganan (Network Gas Fee):</span>
              {isFreeFee ? (
                <span className="font-extrabold text-emerald-400 font-mono flex items-center gap-1.5 bg-emerald-500/20 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Rp 0 (PROMO FREE FEE &gt;= $1,000 USDT)
                </span>
              ) : (
                <span className="font-extrabold text-amber-400 font-mono">
                  {formatIDR(networkFeeIdr)} (~${currentNetworkObj.feeUsdt} USDT {selectedNetwork})
                </span>
              )}
            </div>

            <div className="flex justify-between text-slate-300">
              <span>Estimasi Waktu Kirim:</span>
              <span className="font-bold text-amber-400 font-mono">{currentNetworkObj.time}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Status Slippage:</span>
              <span className="font-bold text-white font-mono">Fixed Rate Guaranteed</span>
            </div>
          </div>

          {/* Submit CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold text-base shadow-xl shadow-emerald-950/60 hover:scale-[1.01] transition-all flex items-center justify-center gap-3"
            >
              <MessageSquare className="w-5 h-5 fill-white text-emerald-600" />
              <span>PROSES PESANAN VIA WHATSAPP</span>
            </a>

            <button
              onClick={copyOrderSummary}
              className="px-6 py-4 rounded-2xl glass-card border border-slate-700 hover:border-slate-500 text-slate-300 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Tersimpan!' : 'Salin Rincian'}</span>
            </button>
          </div>

        </div>
      </div>
    </section>
  );
}
