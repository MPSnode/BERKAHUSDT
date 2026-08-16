import React, { useCallback, useEffect, useState } from 'react';
import { Loader2, Palette, RotateCcw, Save, Type, Upload } from 'lucide-react';
import { apiGet, apiPost, apiPut, assetUrl } from '../../lib/api';

const TEXT_GROUPS = [
  {
    title: 'Identitas & Tema',
    fields: [
      { key: 'brandName', label: 'Nama Brand' },
      { key: 'logoLink', label: 'Link Klik Logo' },
    ],
  },
  {
    title: 'Hero Section',
    fields: [
      { key: 'heroBadge', label: 'Badge Hero' },
      { key: 'heroTitle', label: 'Judul Hero' },
      { key: 'heroTitleAccent', label: 'Judul Hero (Aksen)' },
      { key: 'heroSubtitle', label: 'Sub Judul Hero', textarea: true },
      { key: 'heroCtaText', label: 'Teks Tombol CTA Hero' },
    ],
  },
  {
    title: 'Kalkulator',
    fields: [
      { key: 'calculatorTitle', label: 'Judul Kalkulator' },
      { key: 'calculatorSubtitle', label: 'Sub Judul Kalkulator', textarea: true },
    ],
  },
  {
    title: 'Grafik Rate',
    fields: [
      { key: 'chartTitle', label: 'Judul Grafik' },
      { key: 'chartSubtitle', label: 'Sub Judul Grafik', textarea: true },
    ],
  },
  {
    title: 'Media Sosial & Jaringan',
    fields: [
      { key: 'socialTitle', label: 'Judul Seksi Sosial' },
      { key: 'socialSubtitle', label: 'Sub Judul Seksi Sosial', textarea: true },
      { key: 'networkTitle', label: 'Judul Seksi Jaringan' },
      { key: 'networkSubtitle', label: 'Sub Judul Seksi Jaringan', textarea: true },
    ],
  },
  {
    title: 'Footer',
    fields: [
      { key: 'footerTagline', label: 'Tagline Footer', textarea: true },
      { key: 'footerCopyright', label: 'Teks Copyright' },
    ],
  },
];

const IMAGE_FIELDS = [
  { key: 'logoUrl', label: 'Logo Brand (Navbar / Footer)' },
  { key: 'coinFrontUrl', label: 'Logo Koin 3D Depan (BERKAHUSDT)' },
  { key: 'coinBackUrl', label: 'Logo Koin 3D Belakang (USDT)' },
];

export default function ContentPanel({ token, onSaved }) {
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingKey, setUploadingKey] = useState('');
  const [msg, setMsg] = useState({ text: '', type: '' });

  const load = useCallback(async () => {
    try {
      const data = await apiGet('/admin/settings/content', token);
      setForm(data.content || {});
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
      const res = await apiPut('/admin/settings/content', form, token);
      setForm(res.content || form);
      setMsg({ text: res.message, type: 'success' });
      if (onSaved) onSaved();
    } catch (err) {
      setMsg({ text: err.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const reset = async () => {
    if (!window.confirm('Kembalikan seluruh konten ke pengaturan awal?')) return;
    try {
      const res = await apiPost('/admin/settings/content/reset', {}, token);
      setForm(res.content || {});
      setMsg({ text: res.message, type: 'success' });
      if (onSaved) onSaved();
    } catch (err) {
      setMsg({ text: err.message, type: 'error' });
    }
  };

  const uploadImage = async (key, file) => {
    if (!file) return;
    setUploadingKey(key);
    try {
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const res = await apiPost('/admin/upload-image', { imageBase64: base64, originalName: file.name, category: 'CMS' }, token);
      setForm((prev) => ({ ...prev, [key]: res.imageUrl }));
      setMsg({ text: `Gambar untuk ${key} berhasil diunggah. Klik Simpan untuk menerapkan.`, type: 'success' });
    } catch (err) {
      setMsg({ text: err.message, type: 'error' });
    } finally {
      setUploadingKey('');
    }
  };

  if (loading) {
    return (
      <div className="glass-card p-8 rounded-3xl border border-slate-800 bg-[#061219] text-slate-400 text-sm flex items-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin" /> Memuat konten halaman utama...
      </div>
    );
  }

  return (
    <div className="space-y-5" data-testid="admin-content-panel">
      <div className="glass-card p-5 sm:p-6 rounded-3xl border border-slate-800 bg-[#061219]">
        <h3 className="text-lg font-bold text-white font-['Space_Grotesk'] flex items-center gap-2">
          <Type className="w-5 h-5 text-emerald-400" /> Tampilan Utama (CMS Dinamis)
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Ubah seluruh teks, warna tema, dan logo halaman utama. Perubahan langsung tampil di landing page.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-emerald-400" /> Warna Tema Utama
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={form.themeColor || '#10B981'}
                onChange={(e) => setForm({ ...form, themeColor: e.target.value })}
                data-testid="content-theme-color"
                className="w-14 h-11 rounded-xl bg-transparent border border-slate-800 cursor-pointer"
              />
              <input
                type="text"
                value={form.themeColor || ''}
                onChange={(e) => setForm({ ...form, themeColor: e.target.value })}
                className="flex-1 bg-[#040A10] border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white font-mono outline-none focus:border-emerald-500"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-emerald-400" /> Warna Tema Gelap (Aksen)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={form.themeColorDark || '#059669'}
                onChange={(e) => setForm({ ...form, themeColorDark: e.target.value })}
                className="w-14 h-11 rounded-xl bg-transparent border border-slate-800 cursor-pointer"
              />
              <input
                type="text"
                value={form.themeColorDark || ''}
                onChange={(e) => setForm({ ...form, themeColorDark: e.target.value })}
                className="flex-1 bg-[#040A10] border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white font-mono outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
          {IMAGE_FIELDS.map(({ key, label }) => (
            <div key={key} className="space-y-2 p-3 rounded-2xl bg-[#040A10] border border-slate-800">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-300">{label}</div>
              <div className="h-24 rounded-xl bg-slate-900 flex items-center justify-center overflow-hidden">
                {form[key] ? (
                  <img src={assetUrl(form[key])} alt={label} className="h-full object-contain" />
                ) : (
                  <span className="text-[11px] text-slate-500">Belum ada gambar</span>
                )}
              </div>
              <input
                type="text"
                value={form[key] || ''}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="w-full bg-[#061219] border border-slate-800 rounded-lg px-2 py-1.5 text-[11px] text-white font-mono outline-none"
              />
              <label className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-bold text-slate-200 flex items-center justify-center gap-1.5 cursor-pointer">
                <Upload className="w-3 h-3" />
                {uploadingKey === key ? 'Mengunggah...' : 'Upload dari Komputer'}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  data-testid={`content-upload-${key}`}
                  onChange={(e) => uploadImage(key, e.target.files?.[0])}
                />
              </label>
            </div>
          ))}
        </div>
      </div>

      {TEXT_GROUPS.map((group) => (
        <div key={group.title} className="glass-card p-5 rounded-3xl border border-slate-800 bg-[#061219]">
          <h4 className="text-sm font-bold text-emerald-400 uppercase tracking-wider mb-4">{group.title}</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {group.fields.map(({ key, label, textarea }) => (
              <div key={key} className={`space-y-1.5 ${textarea ? 'md:col-span-2' : ''}`}>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300">{label}</label>
                {textarea ? (
                  <textarea
                    rows={3}
                    value={form[key] || ''}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    data-testid={`content-input-${key}`}
                    className="w-full bg-[#040A10] border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2.5 text-sm text-white outline-none"
                  />
                ) : (
                  <input
                    type="text"
                    value={form[key] || ''}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    data-testid={`content-input-${key}`}
                    className="w-full bg-[#040A10] border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2.5 text-sm text-white outline-none"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {msg.text && (
        <div
          className={`p-3 rounded-xl text-xs font-bold border ${
            msg.type === 'error'
              ? 'bg-rose-500/10 border-rose-500/40 text-rose-300'
              : 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
          }`}
          data-testid="content-message"
        >
          {msg.text}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          onClick={save}
          disabled={saving}
          data-testid="content-save-button"
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 disabled:opacity-60 text-white font-extrabold text-sm flex items-center gap-2"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Menyimpan...' : 'Simpan Konten Halaman Utama'}
        </button>
        <button
          onClick={reset}
          className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm flex items-center gap-2"
          data-testid="content-reset-button"
        >
          <RotateCcw className="w-4 h-4" /> Reset ke Default
        </button>
      </div>
    </div>
  );
}
