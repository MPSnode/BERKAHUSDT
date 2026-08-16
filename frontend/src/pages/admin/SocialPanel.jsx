import React, { useCallback, useEffect, useState } from 'react';
import { Facebook, Instagram, Loader2, MessageCircle, Save, Send, Share2, Twitter, Youtube } from 'lucide-react';
import { apiGet, apiPut } from '../../lib/api';

const FIELDS = [
  { key: 'whatsapp', label: 'WhatsApp (link wa.me)', placeholder: 'https://wa.me/62812xxxx', icon: MessageCircle },
  { key: 'telegramChannel', label: 'Telegram Channel', placeholder: 'https://t.me/channel', icon: Send },
  { key: 'telegramAdmin1', label: 'Telegram Admin 1', placeholder: 'https://t.me/admin1', icon: Send },
  { key: 'telegramAdmin1Label', label: 'Label Tombol Admin 1', placeholder: 'Admin 1 (Fast Response)', icon: Send },
  { key: 'telegramAdmin2', label: 'Telegram Admin 2', placeholder: 'https://t.me/admin2', icon: Send },
  { key: 'telegramAdmin2Label', label: 'Label Tombol Admin 2', placeholder: 'Admin 2 (Backup Desk)', icon: Send },
  { key: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/...', icon: Facebook },
  { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/...', icon: Instagram },
  { key: 'twitter', label: 'Twitter / X', placeholder: 'https://x.com/...', icon: Twitter },
  { key: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/@...', icon: Youtube },
  { key: 'tiktok', label: 'TikTok', placeholder: 'https://tiktok.com/@...', icon: Share2 },
  { key: 'email', label: 'Email Support', placeholder: 'support@domain.com', icon: Share2 },
  { key: 'phone', label: 'Nomor Telepon / WA', placeholder: '+62 812-3456-7890', icon: Share2 },
  { key: 'address', label: 'Alamat / Lokasi', placeholder: 'Jakarta, Indonesia', icon: Share2 },
  { key: 'operationalHours', label: 'Jam Operasional', placeholder: 'Setiap hari 08.00 - 23.00 WIB', icon: Share2 },
];

export default function SocialPanel({ token, onSaved }) {
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });

  const load = useCallback(async () => {
    try {
      const data = await apiGet('/admin/settings/social', token);
      setForm(data.social || {});
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
    setMsg({ text: '', type: '' });
    try {
      const res = await apiPut('/admin/settings/social', form, token);
      setMsg({ text: res.message, type: 'success' });
      if (onSaved) onSaved();
    } catch (err) {
      setMsg({ text: err.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="glass-card p-8 rounded-3xl border border-slate-800 bg-[#061219] text-slate-400 text-sm flex items-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin" /> Memuat pengaturan media sosial...
      </div>
    );
  }

  return (
    <div className="glass-card p-5 sm:p-6 rounded-3xl border border-slate-800 bg-[#061219] space-y-5" data-testid="admin-social-panel">
      <div>
        <h3 className="text-lg font-bold text-white font-['Space_Grotesk'] flex items-center gap-2">
          <Share2 className="w-5 h-5 text-emerald-400" /> Pengaturan Media Sosial &amp; Kontak
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Hanya kolom yang diisi akan ditampilkan di halaman utama. Kosongkan untuk menyembunyikan.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {FIELDS.map(({ key, label, placeholder, icon: Icon }) => (
          <div key={key} className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Icon className="w-3.5 h-3.5 text-emerald-400" /> {label}
            </label>
            <input
              type="text"
              value={form[key] || ''}
              placeholder={placeholder}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              data-testid={`social-input-${key}`}
              className="w-full bg-[#040A10] border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2.5 text-sm text-white font-mono outline-none"
            />
          </div>
        ))}
      </div>

      {msg.text && (
        <div
          className={`p-3 rounded-xl text-xs font-bold border ${
            msg.type === 'error'
              ? 'bg-rose-500/10 border-rose-500/40 text-rose-300'
              : 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
          }`}
          data-testid="social-message"
        >
          {msg.text}
        </div>
      )}

      <button
        onClick={save}
        disabled={saving}
        data-testid="social-save-button"
        className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 disabled:opacity-60 text-white font-extrabold text-sm flex items-center gap-2"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        {saving ? 'Menyimpan...' : 'Simpan Pengaturan Sosial Media'}
      </button>
    </div>
  );
}
