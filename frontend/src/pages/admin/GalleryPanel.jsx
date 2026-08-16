import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Check, Copy, Image as ImageIcon, RefreshCw, Trash2, Upload, X } from 'lucide-react';
import { apiDelete, apiGet, apiPost, assetUrl } from '../../lib/api';

const CATEGORIES = ['ALL', 'GALERI', 'POPUP', 'TESTIMONI', 'LOGO', 'CMS', 'UMUM'];

export default function GalleryPanel({ token }) {
  const [assets, setAssets] = useState([]);
  const [stats, setStats] = useState({ total: 0, totalSizeMb: 0 });
  const [category, setCategory] = useState('ALL');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });
  const [selected, setSelected] = useState([]);
  const [copiedUrl, setCopiedUrl] = useState('');
  const fileRef = useRef(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiGet(`/admin/gallery?category=${category}`, token);
      setAssets(data.assets || []);
      setStats(data.stats || {});
    } catch (err) {
      setMsg({ text: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [category, token]);

  useEffect(() => {
    load();
  }, [load]);

  const handleFiles = async (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;
    setUploading(true);
    setMsg({ text: `Mengunggah ${files.length} gambar...`, type: 'info' });
    try {
      const items = await Promise.all(
        files.map(
          (file) =>
            new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () =>
                resolve({ imageBase64: reader.result, filename: file.name, category: category === 'ALL' ? 'GALERI' : category });
              reader.onerror = reject;
              reader.readAsDataURL(file);
            })
        )
      );
      const res = await apiPost('/admin/gallery', { items }, token);
      setMsg({ text: res.message, type: 'success' });
      await load();
    } catch (err) {
      setMsg({ text: err.message, type: 'error' });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const removeAsset = async (id) => {
    if (!window.confirm('Hapus aset gambar ini dari database?')) return;
    try {
      const res = await apiDelete(`/admin/gallery/${id}`, token);
      setMsg({ text: res.message, type: 'success' });
      setAssets((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      setMsg({ text: err.message, type: 'error' });
    }
  };

  const removeSelected = async () => {
    if (selected.length === 0) return;
    if (!window.confirm(`Hapus ${selected.length} aset terpilih?`)) return;
    try {
      const res = await apiPost('/admin/gallery/batch-delete', { ids: selected }, token);
      setMsg({ text: res.message, type: 'success' });
      setSelected([]);
      await load();
    } catch (err) {
      setMsg({ text: err.message, type: 'error' });
    }
  };

  const copyUrl = (url) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(''), 1500);
  };

  const toggle = (id) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));

  const totalSize = useMemo(() => stats.totalSizeMb || 0, [stats]);

  return (
    <div className="space-y-5" data-testid="admin-gallery-panel">
      <div className="glass-card p-5 sm:p-6 rounded-3xl border border-slate-800 bg-[#061219]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-white font-['Space_Grotesk'] flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-emerald-400" /> Galeri Aset Gambar (MongoDB)
            </h3>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              {stats.total || 0} file tersimpan &middot; {totalSize} MB &middot; PNG, JPG, JPEG, GIF, WEBP
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={load}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 flex items-center gap-2"
              data-testid="gallery-refresh"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </button>
            <label
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 text-white text-xs font-extrabold flex items-center gap-2 cursor-pointer"
              data-testid="gallery-upload-label"
            >
              <Upload className="w-3.5 h-3.5" />
              {uploading ? 'Mengunggah...' : 'Upload Gambar'}
              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                multiple
                className="hidden"
                onChange={handleFiles}
                data-testid="gallery-upload-input"
              />
            </label>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold font-mono border transition-colors ${
                category === c
                  ? 'bg-emerald-500/20 border-emerald-500 text-white'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {c}
            </button>
          ))}
          {selected.length > 0 && (
            <button
              onClick={removeSelected}
              className="ml-auto px-3 py-1.5 rounded-xl text-[11px] font-bold bg-rose-500/20 border border-rose-500/50 text-rose-300 flex items-center gap-1.5"
              data-testid="gallery-delete-selected"
            >
              <Trash2 className="w-3.5 h-3.5" /> Hapus {selected.length} Terpilih
            </button>
          )}
        </div>

        {msg.text && (
          <div
            className={`mt-4 p-3 rounded-xl text-xs font-bold border ${
              msg.type === 'error'
                ? 'bg-rose-500/10 border-rose-500/40 text-rose-300'
                : msg.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                  : 'bg-slate-800/60 border-slate-700 text-slate-300'
            }`}
            data-testid="gallery-message"
          >
            {msg.text}
          </div>
        )}
      </div>

      <div className="glass-card p-5 rounded-3xl border border-slate-800 bg-[#061219]">
        {assets.length === 0 ? (
          <div className="py-14 text-center text-slate-500 text-sm">
            Belum ada aset gambar. Klik &ldquo;Upload Gambar&rdquo; untuk menyimpan file dari komputer ke database.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {assets.map((asset) => (
              <div
                key={asset.id}
                className={`group relative rounded-2xl overflow-hidden border bg-[#040A10] ${
                  selected.includes(asset.id) ? 'border-emerald-500' : 'border-slate-800'
                }`}
                data-testid={`gallery-asset-${asset.id}`}
              >
                <button
                  onClick={() => toggle(asset.id)}
                  className="absolute top-2 left-2 z-10 w-6 h-6 rounded-lg bg-black/70 border border-slate-600 flex items-center justify-center"
                  title="Pilih"
                >
                  {selected.includes(asset.id) ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : null}
                </button>
                <button
                  onClick={() => removeAsset(asset.id)}
                  className="absolute top-2 right-2 z-10 w-6 h-6 rounded-lg bg-rose-600/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Hapus"
                  data-testid={`gallery-delete-${asset.id}`}
                >
                  <X className="w-3.5 h-3.5 text-white" />
                </button>
                <div className="aspect-square bg-slate-900">
                  <img
                    src={assetUrl(asset.url)}
                    alt={asset.originalName}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="p-2 space-y-1">
                  <div className="text-[10px] text-slate-300 font-mono truncate" title={asset.originalName}>
                    {asset.originalName}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-emerald-400 font-bold">{asset.category}</span>
                    <span className="text-[9px] text-slate-500 font-mono">{Math.round((asset.size || 0) / 1024)} KB</span>
                  </div>
                  <button
                    onClick={() => copyUrl(asset.url)}
                    className="w-full mt-1 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-200 flex items-center justify-center gap-1"
                  >
                    {copiedUrl === asset.url ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {copiedUrl === asset.url ? 'URL Disalin' : 'Salin URL'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
