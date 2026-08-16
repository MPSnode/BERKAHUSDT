import React, { useEffect, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Activity, ArrowDownRight, ArrowUpRight, LineChart as LineChartIcon } from 'lucide-react';
import { API, formatIDR } from '../lib/api';
import { useSite } from '../context/SiteContext';

export default function RateChartSection() {
  const { content, rates } = useSite();
  const [points, setPoints] = useState([]);
  const [settings, setSettings] = useState({ chartType: 'area', showBuy: true, showSell: true, visiblePoints: 30 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await fetch(`${API}/chart/rates?limit=120`);
        const data = await res.json();
        if (mounted && data && data.success) {
          setSettings({ ...settings, ...(data.settings || {}) });
          setPoints(data.points || []);
        }
      } catch (err) {
        /* keep empty state */
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    const interval = setInterval(load, 20000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const visible = Number(settings.visiblePoints) > 0 ? points.slice(-Number(settings.visiblePoints)) : points;
  const first = visible[0] || {};
  const last = visible[visible.length - 1] || {};
  const change = (Number(last.buyRate) || 0) - (Number(first.buyRate) || 0);
  const changePercent = first.buyRate ? (change / Number(first.buyRate)) * 100 : 0;
  const isUp = change >= 0;
  // eslint-disable-next-line react/no-unstable-nested-components
  const ChartComponent = settings.chartType === 'line' ? LineChart : AreaChart;

  return (
    <div className="glass-card rounded-3xl border border-slate-800 p-5 sm:p-7" data-testid="rate-chart-section">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-[11px] text-emerald-400 font-bold uppercase tracking-wider mb-3">
            <LineChartIcon className="w-3.5 h-3.5" />
            Grafik Rate Harga
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight font-['Space_Grotesk']">
            {content?.chartTitle || 'Grafik Pergerakan Rate USDT'}
          </h2>
          <p className="text-slate-400 text-sm mt-2 max-w-lg">
            {content?.chartSubtitle || 'Pantau naik-turun rate harga USDT/IDR yang kami perbarui setiap hari.'}
          </p>
        </div>

        <div className="text-right">
          <div className="text-xs text-slate-400 font-medium">Rate Beli Terkini</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono" data-testid="chart-current-buy">
            {formatIDR(rates?.buyRate || last.buyRate || 0)}
          </div>
          <div
            className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-lg text-xs font-bold font-mono ${
              isUp ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'
            }`}
          >
            {isUp ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
            {isUp ? '+' : ''}
            {change.toLocaleString('id-ID', { maximumFractionDigits: 0 })} ({changePercent.toFixed(2)}%)
          </div>
        </div>
      </div>

      <div className="h-[280px] sm:h-[340px] w-full">
        {loading ? (
          <div className="h-full flex items-center justify-center text-slate-500 text-sm gap-2">
            <Activity className="w-4 h-4 animate-pulse" /> Memuat data grafik...
          </div>
        ) : visible.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-500 text-sm text-center px-6">
            Belum ada data grafik. Tambahkan titik data dari Admin Panel &gt; GRAFIK.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ChartComponent data={visible} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="buyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.55} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="sellGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" />
              <XAxis dataKey="label" stroke="#64748B" fontSize={11} tickMargin={8} />
              <YAxis
                stroke="#64748B"
                fontSize={11}
                domain={['auto', 'auto']}
                tickFormatter={(v) => `${(v / 1000).toFixed(1)}k`}
                width={48}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0B1220',
                  border: '1px solid #1E293B',
                  borderRadius: 12,
                  color: '#F1F5F9',
                  fontSize: 12,
                }}
                formatter={(value, name) => [formatIDR(value), name === 'buyRate' ? 'Rate Beli' : 'Rate Jual']}
              />
              <Legend
                formatter={(value) => (
                  <span className="text-xs text-slate-300">{value === 'buyRate' ? 'Rate Beli' : 'Rate Jual'}</span>
                )}
              />
              {settings.showBuy !== false &&
                (settings.chartType === 'line' ? (
                  <Line type="monotone" dataKey="buyRate" stroke="#10B981" strokeWidth={2.5} dot={false} />
                ) : (
                  <Area type="monotone" dataKey="buyRate" stroke="#10B981" strokeWidth={2.5} fill="url(#buyGradient)" />
                ))}
              {settings.showSell !== false &&
                (settings.chartType === 'line' ? (
                  <Line type="monotone" dataKey="sellRate" stroke="#F59E0B" strokeWidth={2.5} dot={false} />
                ) : (
                  <Area type="monotone" dataKey="sellRate" stroke="#F59E0B" strokeWidth={2.5} fill="url(#sellGradient)" />
                ))}
            </ChartComponent>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3 mt-5">
        <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-3 text-center">
          <div className="text-[11px] text-slate-400">Titik Data</div>
          <div className="font-bold text-white font-mono">{visible.length}</div>
        </div>
        <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-3 text-center">
          <div className="text-[11px] text-slate-400">Tertinggi</div>
          <div className="font-bold text-emerald-400 font-mono text-sm">
            {formatIDR(Math.max(...visible.map((p) => Number(p.buyRate) || 0), 0))}
          </div>
        </div>
        <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-3 text-center">
          <div className="text-[11px] text-slate-400">Terendah</div>
          <div className="font-bold text-amber-400 font-mono text-sm">
            {formatIDR(Math.min(...visible.map((p) => Number(p.buyRate) || Infinity), Infinity) || 0)}
          </div>
        </div>
      </div>
    </div>
  );
}
