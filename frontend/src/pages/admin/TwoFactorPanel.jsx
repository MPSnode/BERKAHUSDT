import React, { useCallback, useEffect, useState } from 'react';
import { Copy, Loader2, QrCode, RefreshCw, ShieldCheck } from 'lucide-react';
import { apiGet, apiPost, apiPut } from '../../lib/api';

export default function TwoFactorPanel({ token }) {
  const [data, setData] = useState(null);
  const [creds, setCreds] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [qr, cred] = await Promise.all([apiGet('/admin/2fa/qr', token), apiGet('/admin/credentials', token)]);
      setData(qr);
      setCreds(cred);
    } catch (err) {
      setMsg({ text: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const regenerate = async () => {
    if (!window.confirm('Buat secret 2FA baru? Anda harus scan ulang QR di Google Authenticator.')) return;
    setBusy(true);
    try {
      const res = await apiPost('/admin/2fa/generate-secret', {}, token);
      setData(res);
      setMsg({ text: res.message, type: 'success' });
    } catch (err) {
      setMsg({ text: err.message, type: 'error' });
    } finally {
      setBusy(false);
    }
  };

  const toggle2fa = async (enabled) => {
    setBusy(true);
    try {
      const res = await apiPut('/admin/credentials', { google2faEnabled: enabled }, token);
      setCreds((c) => ({ ...c, google2faEnabled: enabled }));
      setMsg({
        text: `${res.message} 2FA sekarang ${enabled ? 'AKTIF' : 'NONAKTIF'}.`,
        type: 'success',
      });
    } catch (err) {
      setMsg({ text: err.message, type: 'error' });
    } finally {
      setBusy(false);
    }
  };

  const saveWhitelist = async (value) => {
    setBusy(true);
    try {
      const res = await apiPut('/admin/credentials', { ipWhitelist: value }, token);
      setMsg({ text: res.message, type: 'success' });
    } catch (err) {
      setMsg({ text: err.message, type: 'error' });
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="glass-card p-8 rounded-3xl border border-slate-800 bg-[#061219] text-slate-400 text-sm flex items-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin" /> Memuat pengaturan 2FA...
      </div>
    );
  }

  return (
    <div className="space-y-5" data-testid="admin-2fa-panel">
      <div className="glass-card p-5 sm:p-6 rounded-3xl border border-slate-800 bg-[#061219] space-y-5">
        <div>
          <h3 className="text-lg font-bold text-white font-['Space_Grotesk'] flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" /> Keamanan 2FA (Google Authenticator)
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Scan QR di aplikasi Google Authenticator / Authy, lalu aktifkan 2FA untuk login admin.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="p-4 rounded-2xl bg-white flex items-center justify-center">
            {data?.qrDataUri ? (
              <img src={data.qrDataUri} alt="QR 2FA" className="w-56 h-56" data-testid="twofa-qr-image" />
            ) : (
              <QrCode className="w-20 h-20 text-slate-400" />
            )}
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#040A10] border border-slate-800">
              <div className="text-[11px] uppercase font-bold text-slate-400">Secret Key (Base32)</div>
              <div className="flex items-center gap-2 mt-2">
                <code className="flex-1 text-xs text-emerald-400 font-mono break-all" data-testid="twofa-secret">
                  {data?.secret}
                </code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(data?.secret || '');
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1500);
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 text-[10px] font-bold text-slate-200 flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" /> {copied ? 'Disalin' : 'Salin'}
                </button>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#040A10] border border-slate-800 flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-bold text-white">Status 2FA</div>
                <div
                  className={`text-xs font-mono font-bold ${
                    creds?.google2faEnabled ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                  data-testid="twofa-status"
                >
                  {creds?.google2faEnabled ? 'AKTIF' : 'NONAKTIF'}
                </div>
              </div>
              <button
                onClick={() => toggle2fa(!creds?.google2faEnabled)}
                disabled={busy}
                data-testid="twofa-toggle"
                className={`px-4 py-2 rounded-xl text-xs font-extrabold ${
                  creds?.google2faEnabled
                    ? 'bg-rose-500/20 border border-rose-500/40 text-rose-300'
                    : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white'
                }`}
              >
                {creds?.google2faEnabled ? 'Matikan 2FA' : 'Aktifkan 2FA'}
              </button>
            </div>

            <button
              onClick={regenerate}
              disabled={busy}
              data-testid="twofa-regenerate"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 flex items-center justify-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${busy ? 'animate-spin' : ''}`} /> Buat Secret 2FA Baru
            </button>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#040A10] border border-slate-800 space-y-2">
          <div className="text-[11px] uppercase font-bold text-slate-400">IP Whitelist Admin</div>
          <p className="text-[11px] text-slate-500">
            Pisahkan dengan koma. Kosongkan untuk mengizinkan semua IP. Contoh: 103.21.10.5, 180.252.*
          </p>
          <div className="flex flex-wrap gap-2">
            <input
              defaultValue={creds?.ipWhitelist || ''}
              onBlur={(e) => setCreds((c) => ({ ...c, ipWhitelist: e.target.value }))}
              data-testid="twofa-ip-whitelist"
              className="flex-1 min-w-[240px] bg-[#061219] border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white font-mono outline-none focus:border-emerald-500"
            />
            <button
              onClick={() => saveWhitelist(creds?.ipWhitelist || '')}
              disabled={busy}
              data-testid="twofa-save-whitelist"
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-extrabold"
            >
              Simpan IP Whitelist
            </button>
          </div>
        </div>

        {msg.text && (
          <div
            className={`p-3 rounded-xl text-xs font-bold border ${
              msg.type === 'error'
                ? 'bg-rose-500/10 border-rose-500/40 text-rose-300'
                : 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
            }`}
            data-testid="twofa-message"
          >
            {msg.text}
          </div>
        )}
      </div>
    </div>
  );
}
