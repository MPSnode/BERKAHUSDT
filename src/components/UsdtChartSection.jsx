import React, { useState } from 'react';
import { TrendingUp, Activity, ArrowUpRight, ShieldCheck, Clock, RefreshCw } from 'lucide-react';

export default function UsdtChartSection() {
  const [timeframe, setTimeframe] = useState('24H');
  const [hoverData, setHoverData] = useState(null);

  // Timeframe price points (USDT / IDR)
  const chartDataSets = {
    '24H': [
      { time: '00:00', price: 16090 },
      { time: '03:00', price: 16100 },
      { time: '06:00', price: 16080 },
      { time: '09:00', price: 16120 },
      { time: '12:00', price: 16140 },
      { time: '15:00', price: 16135 },
      { time: '18:00', price: 16150 },
      { time: '21:00', price: 16145 },
      { time: '24:00', price: 16150 },
    ],
    '7D': [
      { time: 'Senin', price: 16020 },
      { time: 'Selasa', price: 16050 },
      { time: 'Rabu', price: 16080 },
      { time: 'Kamis', price: 16110 },
      { time: 'Jumat', price: 16130 },
      { time: 'Sabtu', price: 16145 },
      { time: 'Minggu', price: 16150 },
    ],
    '30D': [
      { time: 'Minggu 1', price: 15950 },
      { time: 'Minggu 2', price: 16010 },
      { time: 'Minggu 3', price: 16090 },
      { time: 'Minggu 4', price: 16150 },
    ]
  };

  const currentPoints = chartDataSets[timeframe] || chartDataSets['24H'];
  const minPrice = Math.min(...currentPoints.map(p => p.price)) - 20;
  const maxPrice = Math.max(...currentPoints.map(p => p.price)) + 20;

  // Generate SVG path coordinates
  const svgWidth = 800;
  const svgHeight = 220;

  const pointsString = currentPoints.map((pt, idx) => {
    const x = (idx / (currentPoints.length - 1)) * svgWidth;
    const y = svgHeight - ((pt.price - minPrice) / (maxPrice - minPrice)) * (svgHeight - 40) - 20;
    return `${x},${y}`;
  }).join(' ');

  const areaString = `0,${svgHeight} ${pointsString} ${svgWidth},${svgHeight}`;

  const formatIDR = (val) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <section className="py-16 bg-transparent relative border-t border-emerald-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Chart Glass Card */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-emerald-500/30 shadow-2xl relative overflow-hidden bg-[#07131B]/70 backdrop-blur-xl">
          
          {/* Top Bar: Title & Timeframe Selector */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                  <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-white font-['Space_Grotesk'] flex items-center gap-2">
                    Grafik Pergerakan Kurs USDT/IDR
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                      LIVE OTC RATE
                    </span>
                  </h3>
                </div>
              </div>
            </div>

            {/* Timeframe Chips */}
            <div className="flex items-center gap-2 bg-[#040A10] p-1.5 rounded-xl border border-slate-800 shrink-0">
              {['24H', '7D', '30D'].map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                    timeframe === tf
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          {/* Key Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 p-4 rounded-2xl bg-[#040A10]/90 border border-slate-800/80 font-mono text-xs">
            <div>
              <span className="text-slate-400 text-[11px] block">Rate Beli Hari Ini:</span>
              <span className="text-emerald-400 font-extrabold text-sm sm:text-base">Rp 16.150</span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block">Rate Jual Hari Ini:</span>
              <span className="text-amber-400 font-extrabold text-sm sm:text-base">Rp 16.080</span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block">24h Tertinggi:</span>
              <span className="text-white font-bold text-xs sm:text-sm">Rp 16.185</span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block">24h Volume OTC:</span>
              <span className="text-emerald-300 font-bold text-xs sm:text-sm">$2,450,000 USDT</span>
            </div>
          </div>

          {/* Interactive SVG Line Chart */}
          <div className="relative w-full h-[220px] select-none">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-full overflow-visible"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00E676" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#00E676" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Area Fill Under Curve */}
              <polygon points={areaString} fill="url(#emeraldGradient)" />

              {/* Glowing Green Trend Line */}
              <polyline
                fill="none"
                stroke="#00E676"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={pointsString}
                className="drop-shadow-[0_0_12px_rgba(0,230,118,0.8)]"
              />

              {/* Data Points Dot Indicators */}
              {currentPoints.map((pt, idx) => {
                const x = (idx / (currentPoints.length - 1)) * svgWidth;
                const y = svgHeight - ((pt.price - minPrice) / (maxPrice - minPrice)) * (svgHeight - 40) - 20;
                return (
                  <circle
                    key={idx}
                    cx={x}
                    cy={y}
                    r="5"
                    className="fill-emerald-400 stroke-[#07131B] stroke-[2px] cursor-pointer hover:r-7 transition-all"
                    onMouseEnter={() => setHoverData(pt)}
                    onMouseLeave={() => setHoverData(null)}
                  />
                );
              })}
            </svg>

            {/* Hover Tooltip */}
            {hoverData && (
              <div className="absolute top-2 right-4 px-3 py-1.5 rounded-lg bg-emerald-950/90 border border-emerald-500/50 text-xs font-mono text-white shadow-xl">
                <span className="text-slate-400">{hoverData.time}:</span> <span className="font-bold text-emerald-400">{formatIDR(hoverData.price)}</span>
              </div>
            )}
          </div>

          {/* Time Labels Bar */}
          <div className="flex justify-between pt-2 border-t border-slate-800 text-[11px] font-mono text-slate-400">
            {currentPoints.map((pt, idx) => (
              <span key={idx}>{pt.time}</span>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}
