import React, { useCallback, useEffect, useState } from 'react';
import { Loader2, Plus, Save, Trash2, Wallet, Zap } from 'lucide-react';
import { apiGet, apiPut } from '../../lib/api';

export default function NetworkFeePanel({ token, onSaved, mode = 'NETWORK' }) {
  const [data, setData] = useState({ networks: [], paymentMethods: [], freeFeeThresholdUsdt: 2000, defaultNetwork: 'TRC-20' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });

  const load = useCallback(async () => {
    try {
      const res = await apiGet('/admin/settings/networks', token);
      setData({ networks: [], paymentMethods: [], ...(res.networks || {}) });
    } catch (err) {
      setMsg({ text: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const save = async () => {
    setSaving(true);
    try {
      const res = await apiPut('/admin/settings/networks', data, token);
      setMsg({ text: res.message, type: 'success' });
      if (onSaved) onSaved();
    } catch (err) {
      setMsg({ text: err.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const updateItem = (listKey, index, patch) => {
    setData((prev) => {
      const list = [...(prev[listKey] || [])];
      list[index] = { ...list[index], ...patch };
      return { ...prev, [listKey]: list };
    });
  };

  const removeItem = (listKey, index) =>
    setData((prev) => ({ ...prev, [listKey]: (prev[listKey] || []).filter((_, i) => i !== index) }));

  const addNetwork = () =>
    setData((prev) => ({
      ...prev,
      networks: [
        ...(prev.networks || []),
        { code: 'NEW-NET', name: 'Jaringan Baru', feeUsdt: 1, estimate: '1-3 menit', isActive: true, icon: '/coin_back.png' },
      ],
    }));

  const addPayment = () =>
    setData((prev) => ({
      ...prev,
      paymentMethods: [
        ...(prev.paymentMethods || []),
        { code: 'NEW', name: 'Metode Baru', type: 'BANK', account: '', holder: '', isActive: true },
      ],
    }));

  if (loading) {
    return (
      <div className="glass-card p-8 rounded-3xl border border-slate-800 bg-[#061219] text-slate-400 text-sm flex items-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin" /> Memuat pengaturan jaringan &amp; biaya...
      </div>
    );
  }

  const showNetworks = mode === 'NETWORK';
  const showPayments = mode === 'BANK' || mode === 'NETWORK';

  return (
    <div className="space-y-5" data-testid="admin-network-panel">
      {showNetworks && (
        <div className="glass-card p-5 sm:p-6 rounded-3xl border border-slate-800 bg-[#061219] space-y-5">
          <div>
            <h3 className="text-lg font-bold text-white font-['Space_Grotesk'] flex items-center gap-2">
              <Zap className="w-5 h-5 text-emerald-400" /> Pengaturan Jaringan &amp; Biaya Gas
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Atur jaringan yang didukung, biaya gas per jaringan, dan ambang batas gratis biaya.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                Gratis Biaya Gas Mulai (USDT)
              </label>
              <input
                type="number"
                value={data.freeFeeThresholdUsdt ?? 2000}
                onChange={(e) => setData({ ...data, freeFeeThresholdUsdt: Number(e.target.value) })}
                data-testid="network-free-threshold"
                className="w-full bg-[#040A10] border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2.5 text-sm text-white font-mono outline-none"
              />
              <p className="text-[10px] text-emerald-400 font-mono">
                Pembelian &ge; {Number(data.freeFeeThresholdUsdt || 0).toLocaleString('id-ID')} USDT = GRATIS fee
              </p>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300">Jaringan Default</label>
              <select
                value={data.defaultNetwork || ''}
                onChange={(e) => setData({ ...data, defaultNetwork: e.target.value })}
                className="w-full bg-[#040A10] border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2.5 text-sm text-white font-mono outline-none"
              >
                {(data.networks || []).map((n) => (
                  <option key={n.code} value={n.code}>
                    {n.code}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-3">
            {(data.networks || []).map((net, index) => (
              <div
                key={`${net.code}-${index}`}
                className="grid grid-cols-2 lg:grid-cols-6 gap-2 p-3 rounded-2xl bg-[#040A10] border border-slate-800"
                data-testid={`network-row-${index}`}
              >
                <input
                  value={net.code || ''}
                  onChange={(e) => updateItem('networks', index, { code: e.target.value })}
                  placeholder="KODE"
                  className="bg-[#061219] border border-slate-800 rounded-lg px-2 py-2 text-xs text-white font-mono outline-none focus:border-emerald-500"
                />
                <input
                  value={net.name || ''}
                  onChange={(e) => updateItem('networks', index, { name: e.target.value })}
                  placeholder="Nama Jaringan"
                  className="lg:col-span-2 bg-[#061219] border border-slate-800 rounded-lg px-2 py-2 text-xs text-white outline-none focus:border-emerald-500"
                />
                <input
                  type="number"
                  step="0.01"
                  value={net.feeUsdt ?? 0}
                  onChange={(e) => updateItem('networks', index, { feeUsdt: Number(e.target.value) })}
                  placeholder="Fee USDT"
                  className="bg-[#061219] border border-slate-800 rounded-lg px-2 py-2 text-xs text-amber-400 font-mono outline-none focus:border-emerald-500"
                />
                <input
                  value={net.estimate || ''}
                  onChange={(e) => updateItem('networks', index, { estimate: e.target.value })}
                  placeholder="Estimasi"
                  className="bg-[#061219] border border-slate-800 rounded-lg px-2 py-2 text-xs text-slate-300 font-mono outline-none focus:border-emerald-500"
                />
                <div className="flex items-center gap-2 justify-end">
                  <label className="flex items-center gap-1 text-[10px] text-slate-300 font-bold">
                    <input
                      type="checkbox"
                      checked={net.isActive !== false}
                      onChange={(e) => updateItem('networks', index, { isActive: e.target.checked })}
                    />
                    Aktif
                  </label>
                  <button
                    onClick={() => removeItem('networks', index)}
                    className="w-7 h-7 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center"
                    data-testid={`network-delete-${index}`}
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-300" />
                  </button>
                </div>
              </div>
            ))}
            <button
              onClick={addNetwork}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 flex items-center gap-2"
              data-testid="network-add"
            >
              <Plus className="w-3.5 h-3.5" /> Tambah Jaringan
            </button>
          </div>
        </div>
      )}

      {showPayments && (
        <div className="glass-card p-5 sm:p-6 rounded-3xl border border-slate-800 bg-[#061219] space-y-4">
          <h3 className="text-lg font-bold text-white font-['Space_Grotesk'] flex items-center gap-2">
            <Wallet className="w-5 h-5 text-emerald-400" /> Metode Pembayaran (Bank &amp; E-Wallet)
          </h3>
          <div className="space-y-3">
            {(data.paymentMethods || []).map((m, index) => (
              <div
                key={`${m.code}-${index}`}
                className="grid grid-cols-2 lg:grid-cols-6 gap-2 p-3 rounded-2xl bg-[#040A10] border border-slate-800"
                data-testid={`payment-row-${index}`}
              >
                <input
                  value={m.code || ''}
                  onChange={(e) => updateItem('paymentMethods', index, { code: e.target.value })}
                  placeholder="KODE"
                  className="bg-[#061219] border border-slate-800 rounded-lg px-2 py-2 text-xs text-white font-mono outline-none focus:border-emerald-500"
                />
                <input
                  value={m.name || ''}
                  onChange={(e) => updateItem('paymentMethods', index, { name: e.target.value })}
                  placeholder="Nama"
                  className="bg-[#061219] border border-slate-800 rounded-lg px-2 py-2 text-xs text-white outline-none focus:border-emerald-500"
                />
                <select
                  value={m.type || 'BANK'}
                  onChange={(e) => updateItem('paymentMethods', index, { type: e.target.value })}
                  className="bg-[#061219] border border-slate-800 rounded-lg px-2 py-2 text-xs text-slate-200 font-mono outline-none"
                >
                  <option value="BANK">BANK</option>
                  <option value="EWALLET">EWALLET</option>
                  <option value="QRIS">QRIS</option>
                </select>
                <input
                  value={m.account || ''}
                  onChange={(e) => updateItem('paymentMethods', index, { account: e.target.value })}
                  placeholder="No. Rekening"
                  className="bg-[#061219] border border-slate-800 rounded-lg px-2 py-2 text-xs text-emerald-400 font-mono outline-none focus:border-emerald-500"
                />
                <input
                  value={m.holder || ''}
                  onChange={(e) => updateItem('paymentMethods', index, { holder: e.target.value })}
                  placeholder="Nama Pemilik"
                  className="bg-[#061219] border border-slate-800 rounded-lg px-2 py-2 text-xs text-slate-300 outline-none focus:border-emerald-500"
                />
                <div className="flex items-center gap-2 justify-end">
                  <label className="flex items-center gap-1 text-[10px] text-slate-300 font-bold">
                    <input
                      type="checkbox"
                      checked={m.isActive !== false}
                      onChange={(e) => updateItem('paymentMethods', index, { isActive: e.target.checked })}
                    />
                    Aktif
                  </label>
                  <button
                    onClick={() => removeItem('paymentMethods', index)}
                    className="w-7 h-7 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-300" />
                  </button>
                </div>
              </div>
            ))}
            <button
              onClick={addPayment}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 flex items-center gap-2"
              data-testid="payment-add"
            >
              <Plus className="w-3.5 h-3.5" /> Tambah Metode Pembayaran
            </button>
          </div>
        </div>
      )}

      {msg.text && (
        <div
          className={`p-3 rounded-xl text-xs font-bold border ${
            msg.type === 'error'
              ? 'bg-rose-500/10 border-rose-500/40 text-rose-300'
              : 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
          }`}
          data-testid="network-message"
        >
          {msg.text}
        </div>
      )}

      <button
        onClick={save}
        disabled={saving}
        data-testid="network-save-button"
        className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 disabled:opacity-60 text-white font-extrabold text-sm flex items-center gap-2"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
      </button>
    </div>
  );
}
