import React, { useCallback, useEffect, useState } from 'react';
import { Activity, AlertTriangle, CheckCircle2, Loader2, RefreshCw } from 'lucide-react';
import { apiGet } from '../../lib/api';

export default function ApiHealthPanel({ token }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [auto, setAuto] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiGet('/admin/api-health', token);
      setData(res);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!auto) return undefined;
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, [auto, load]);

  const summary = data?.summary;

  return (
    <div className="space-y-5" data-testid="admin-api-health-panel">
      <div className="glass-card p-5 sm:p-6 rounded-3xl border border-slate-800 bg-[#061219]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-white font-['Space_Grotesk'] flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400" /> API Health Monitor
            </h3>
            <p className="text-xs text-slate-400 mt-1">Status realtime seluruh endpoint & koneksi database.</p>
          </div>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-[11px] font-bold text-slate-300">
              <input type="checkbox" checked={auto} onChange={(e) => setAuto(e.target.checked)} /> Auto Refresh
            </label>
            <button
              onClick={load}
              data-testid="api-health-refresh"
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 flex items-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Periksa Ulang
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/40 text-rose-300 text-xs font-bold">
            {error}
          </div>
        )}

        {summary && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
            <div className="p-4 rounded-2xl bg-[#040A10] border border-slate-800 text-center">
              <div className="text-[11px] text-slate-400">Status Keseluruhan</div>
              <div
                className={`text-lg font-extrabold ${
                  summary.overallStatus === 'NORMAL' ? 'text-emerald-400' : 'text-amber-400'
                }`}
                data-testid="api-health-overall"
              >
                {summary.overallStatus}
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-[#040A10] border border-slate-800 text-center">
              <div className="text-[11px] text-slate-400">API Normal</div>
              <div className="text-lg font-extrabold text-white font-mono">
                {summary.normal}/{summary.total}
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-[#040A10] border border-slate-800 text-center">
              <div className="text-[11px] text-slate-400">Error</div>
              <div className="text-lg font-extrabold text-rose-400 font-mono">{summary.error}</div>
            </div>
            <div className="p-4 rounded-2xl bg-[#040A10] border border-slate-800 text-center">
              <div className="text-[11px] text-slate-400">Latency Rata-rata</div>
              <div className="text-lg font-extrabold text-emerald-400 font-mono">{summary.avgLatencyMs} ms</div>
            </div>
          </div>
        )}
      </div>

      <div className="glass-card p-5 rounded-3xl border border-slate-800 bg-[#061219]">
        {loading && !data ? (
          <div className="py-10 text-center text-slate-400 text-sm flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Memeriksa status API...
          </div>
        ) : (
          <div className="space-y-2">
            {(data?.checks || []).map((c) => (
              <div
                key={c.name}
                className="flex flex-wrap items-center gap-3 p-3 rounded-2xl bg-[#040A10] border border-slate-800"
                data-testid={`api-check-${c.name.replace(/\s+/g, '-')}`}
              >
                {c.status === 'NORMAL' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                )}
                <span className="text-sm font-bold text-white flex-1 min-w-[180px]">{c.name}</span>
                <span className="text-[11px] text-slate-400 font-mono flex-1 min-w-[180px]">{c.path}</span>
                <span className="text-[11px] font-mono text-slate-300">{c.latencyMs} ms</span>
                <span
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold ${
                    c.status === 'NORMAL'
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  {c.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="glass-card p-5 rounded-3xl border border-slate-800 bg-[#061219]">
        <h4 className="text-sm font-bold text-emerald-400 uppercase tracking-wider mb-3">Registry Endpoint API</h4>
        <div className="max-h-80 overflow-y-auto rounded-2xl border border-slate-800">
          <table className="w-full text-[11px] font-mono">
            <thead className="bg-[#040A10] text-slate-400 sticky top-0">
              <tr>
                <th className="text-left p-2">Method</th>
                <th className="text-left p-2">Path</th>
                <th className="text-left p-2">Akses</th>
                <th className="text-left p-2">Deskripsi</th>
              </tr>
            </thead>
            <tbody>
              {(data?.registry || []).map((r) => (
                <tr key={`${r.method}-${r.path}`} className="border-t border-slate-800/70">
                  <td className="p-2 text-emerald-400 font-bold">{r.method}</td>
                  <td className="p-2 text-slate-200">{r.path}</td>
                  <td className="p-2 text-amber-400">{r.access}</td>
                  <td className="p-2 text-slate-400">{r.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
