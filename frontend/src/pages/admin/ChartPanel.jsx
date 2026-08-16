import React, { useCallback, useEffect, useState } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { LineChart as LineChartIcon, Loader2, Plus, Save, Trash2 } from 'lucide-react';
import { apiDelete, apiGet, apiPost, apiPut, formatIDR } from '../../lib/api';

export default function ChartPanel({ token }) {
  const [settings, setSettings] = useState({ chartType: 'area', showBuy: true, showSell: true, autoAppendOnRateUpdate: true, visiblePoints: 30 });
  const [points, setPoints] = useState([]);
  const [form, setForm] = useState({ label: '', buyRate: '', sellRate: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });

  const load = useCallback(async () => {
    try {
      const res = await apiGet('/admin/settings/chart', token);
      setSettings((s) => ({ ...s, ...(res.settings || {}) }));
      setPoints(res.points || []);
    } catch (err) {
      setMsg({ text: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const saveSettings = async () => {
    setSaving(true);
    try {
      const res = await apiPut('/admin/settings/chart', settings, token);
      setMsg({ text: res.message, type: 'success' });
    } catch (err) {
      setMsg({ text: err.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const addPoint = async () => {
    if (!form.buyRate || !form.sellRate) {
      setMsg({ text: 'Rate beli & jual wajib diisi.', type: 'error' });
      return;
    }
    try {
      const res = await apiPost(
        '/admin/settings/chart/points',
        { label: form.label || undefined, buyRate: Number(form.buyRate), sellRate: Number(form.sellRate) },
        token
      );
      setMsg({ text: res.message, type: 'success' });
      setForm({ label: '', buyRate: '', sellRate: '' });
      await load();
    } catch (err) {
      setMsg({ text: err.message, type: 'error' });
    }
  };

  const deletePoint = async (id) => {
    try {
      await apiDelete(`/admin/settings/chart/points/${id}`, token);
      setPoints((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      setMsg({ text: err.message, type: 'error' });
    }
  };

  const clearPoints = async () => {
    if (!window.confirm('Hapus semua titik data grafik?')) return;
    try {
      const res = await apiPost('/admin/settings/chart/points/clear', {}, token);
      setMsg({ text: res.message, type: 'success' });
      await load();
    } catch (err) {
      setMsg({ text: err.message, type: 'error' });
    }
  };

  if (loading) {
    return (
      <div className="glass-card p-8 rounded-3xl border border-slate-800 bg-[#061219] text-slate-400 text-sm flex items-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin" /> Memuat data grafik...
      </div>
    );
  }

  return (
    <div className="space-y-5" data-testid="admin-chart-panel">
      <div className="glass-card p-5 sm:p-6 rounded-3xl border border-slate-800 bg-[#061219] space-y-5">
        <div>
          <h3 className="text-lg font-bold text-white font-['Space_Grotesk'] flex items-center gap-2">
            <LineChartIcon className="w-5 h-5 text-emerald-400" /> Pengaturan Grafik Rate Halaman Utama
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Grafik naik-turun rate pada halaman utama diambil dari titik data di bawah ini.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase text-slate-300">Tipe Grafik</label>
            <select
              value={settings.chartType}
              onChange={(e) => setSettings({ ...settings, chartType: e.target.value })}
              data-testid="chart-type-select"
              className="w-full bg-[#040A10] border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white font-mono outline-none focus:border-emerald-500"
            >
              <option value="area">Area</option>
              <option value="line">Line</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase text-slate-300">Jumlah Titik Tampil</label>
            <input
              type="number"
              value={settings.visiblePoints}
              onChange={(e) => setSettings({ ...settings, visiblePoints: Number(e.target.value) })}
              className="w-full bg-[#040A10] border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white font-mono outline-none focus:border-emerald-500"
            />
          </div>
          <label className="flex items-center gap-2 text-xs text-slate-200 font-bold mt-6">
            <input
              type="checkbox"
              checked={settings.showBuy !== false}
              onChange={(e) => setSettings({ ...settings, showBuy: e.target.checked })}
            />
            Tampilkan Rate Beli
          </label>
          <label className="flex items-center gap-2 text-xs text-slate-200 font-bold mt-6">
            <input
              type="checkbox"
              checked={settings.showSell !== false}
              onChange={(e) => setSettings({ ...settings, showSell: e.target.checked })}
            />
            Tampilkan Rate Jual
          </label>
        </div>

        <label className="flex items-center gap-2 text-xs text-slate-200 font-bold">
          <input
            type="checkbox"
            checked={settings.autoAppendOnRateUpdate !== false}
            onChange={(e) => setSettings({ ...settings, autoAppendOnRateUpdate: e.target.checked })}
            data-testid="chart-auto-append"
          />
          Tambah titik data otomatis setiap rate diperbarui
        </label>

        <button
          onClick={saveSettings}
          disabled={saving}
          data-testid="chart-save-settings"
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-extrabold text-sm flex items-center gap-2"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Simpan Pengaturan Grafik
        </button>
      </div>

      <div className="glass-card p-5 rounded-3xl border border-slate-800 bg-[#061219]">
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={points.slice(-Number(settings.visiblePoints || 30))}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" />
              <XAxis dataKey="label" stroke="#64748B" fontSize={10} />
              <YAxis stroke="#64748B" fontSize={10} domain={['auto', 'auto']} tickFormatter={(v) => `${(v / 1000).toFixed(1)}k`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0B1220', border: '1px solid #1E293B', borderRadius: 12, fontSize: 12 }}
                formatter={(v, n) => [formatIDR(v), n === 'buyRate' ? 'Rate Beli' : 'Rate Jual']}
              />
              <Area type="monotone" dataKey="buyRate" stroke="#10B981" fill="#10B98133" strokeWidth={2} />
              <Area type="monotone" dataKey="sellRate" stroke="#F59E0B" fill="#F59E0B22" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass-card p-5 rounded-3xl border border-slate-800 bg-[#061219] space-y-4">
        <h4 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">Tambah Titik Data Manual</h4>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <input
            value={form.label}
            onChange={(e) => setForm({ ...form, label: e.target.value })}
            placeholder="Label (opsional, mis. 16 Agu)"
            data-testid="chart-point-label"
            className="bg-[#040A10] border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-emerald-500"
          />
          <input
            type="number"
            value={form.buyRate}
            onChange={(e) => setForm({ ...form, buyRate: e.target.value })}
            placeholder="Rate Beli"
            data-testid="chart-point-buy"
            className="bg-[#040A10] border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white font-mono outline-none focus:border-emerald-500"
          />
          <input
            type="number"
            value={form.sellRate}
            onChange={(e) => setForm({ ...form, sellRate: e.target.value })}
            placeholder="Rate Jual"
            data-testid="chart-point-sell"
            className="bg-[#040A10] border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white font-mono outline-none focus:border-emerald-500"
          />
          <button
            onClick={addPoint}
            data-testid="chart-point-add"
            className="px-4 py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 font-bold text-sm flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" /> Tambah Titik
          </button>
        </div>

        {msg.text && (
          <div
            className={`p-3 rounded-xl text-xs font-bold border ${
              msg.type === 'error'
                ? 'bg-rose-500/10 border-rose-500/40 text-rose-300'
                : 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
            }`}
            data-testid="chart-message"
          >
            {msg.text}
          </div>
        )}

        <div className="max-h-72 overflow-y-auto rounded-2xl border border-slate-800">
          <table className="w-full text-xs font-mono">
            <thead className="bg-[#040A10] text-slate-400 sticky top-0">
              <tr>
                <th className="text-left p-2">Label</th>
                <th className="text-right p-2">Rate Beli</th>
                <th className="text-right p-2">Rate Jual</th>
                <th className="text-center p-2">Sumber</th>
                <th className="p-2" />
              </tr>
            </thead>
            <tbody>
              {points
                .slice()
                .reverse()
                .map((p) => (
                  <tr key={p.id} className="border-t border-slate-800/70" data-testid={`chart-point-row-${p.id}`}>
                    <td className="p-2 text-slate-200">{p.label}</td>
                    <td className="p-2 text-right text-emerald-400">{Number(p.buyRate).toLocaleString('id-ID')}</td>
                    <td className="p-2 text-right text-amber-400">{Number(p.sellRate).toLocaleString('id-ID')}</td>
                    <td className="p-2 text-center text-slate-500">{p.source}</td>
                    <td className="p-2 text-right">
                      <button
                        onClick={() => deletePoint(p.id)}
                        className="w-7 h-7 rounded-lg bg-rose-500/20 border border-rose-500/40 inline-flex items-center justify-center"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-300" />
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <button
          onClick={clearPoints}
          data-testid="chart-clear-points"
          className="px-4 py-2 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center gap-2"
        >
          <Trash2 className="w-3.5 h-3.5" /> Hapus Semua Titik Data
        </button>
      </div>
    </div>
  );
}
