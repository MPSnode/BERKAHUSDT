import React, { useCallback, useEffect, useState } from 'react';
import { Database, Download, Loader2, RefreshCw, Save, Trash2, Upload } from 'lucide-react';
import { apiGet, apiPost, apiPut } from '../../lib/api';

export default function DbManagerPanel({ token }) {
  const [info, setInfo] = useState(null);
  const [collection, setCollection] = useState('');
  const [docs, setDocs] = useState([]);
  const [editing, setEditing] = useState(null);
  const [editText, setEditText] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });

  const loadCollections = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiGet('/admin/db/collections', token);
      setInfo(res);
      if (!collection && res.collections?.length) setCollection(res.collections[0].name);
    } catch (err) {
      setMsg({ text: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const loadDocs = useCallback(async () => {
    if (!collection) return;
    try {
      const res = await apiGet(`/admin/db/documents?collection=${collection}&limit=50`, token);
      setDocs(res.documents || []);
    } catch (err) {
      setMsg({ text: err.message, type: 'error' });
    }
  }, [collection, token]);

  useEffect(() => {
    loadCollections();
  }, [loadCollections]);

  useEffect(() => {
    loadDocs();
  }, [loadDocs]);

  const backup = async () => {
    setBusy(true);
    try {
      const res = await apiPost('/admin/db/backup', {}, token);
      const blob = new Blob([JSON.stringify(res.backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup_${res.databaseName}_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setMsg({ text: `${res.message} File backup terunduh.`, type: 'success' });
    } catch (err) {
      setMsg({ text: err.message, type: 'error' });
    } finally {
      setBusy(false);
    }
  };

  const restore = async (file) => {
    if (!file) return;
    if (!window.confirm('Pulihkan data dari file backup ini? Data akan digabungkan ke database.')) return;
    setBusy(true);
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const res = await apiPost('/admin/db/restore', { backup: parsed, mode: 'merge' }, token);
      setMsg({ text: res.message, type: 'success' });
      await loadCollections();
      await loadDocs();
    } catch (err) {
      setMsg({ text: err.message, type: 'error' });
    } finally {
      setBusy(false);
    }
  };

  const clearCollection = async () => {
    if (!window.confirm(`Kosongkan koleksi "${collection}"? Tindakan ini tidak dapat dibatalkan.`)) return;
    setBusy(true);
    try {
      const res = await apiPost('/admin/db/clear-collection', { collection, confirm: true }, token);
      setMsg({ text: res.message, type: 'success' });
      await loadCollections();
      await loadDocs();
    } catch (err) {
      setMsg({ text: err.message, type: 'error' });
    } finally {
      setBusy(false);
    }
  };

  const deleteDoc = async (doc) => {
    if (!window.confirm('Hapus dokumen ini?')) return;
    try {
      const res = await apiPost('/admin/db/document/delete', { collection, docId: doc.id || doc._id }, token);
      setMsg({ text: res.message, type: 'success' });
      await loadDocs();
    } catch (err) {
      setMsg({ text: err.message, type: 'error' });
    }
  };

  const startEdit = (doc) => {
    setEditing(doc);
    const clone = { ...doc };
    delete clone._id;
    setEditText(JSON.stringify(clone, null, 2));
  };

  const saveEdit = async () => {
    try {
      const updates = JSON.parse(editText);
      const res = await apiPut(
        '/admin/db/document',
        { collection, docId: editing.id || editing._id, updates },
        token
      );
      setMsg({ text: res.message, type: 'success' });
      setEditing(null);
      await loadDocs();
    } catch (err) {
      setMsg({ text: err.message || 'JSON tidak valid', type: 'error' });
    }
  };

  return (
    <div className="space-y-5" data-testid="admin-db-manager-panel">
      <div className="glass-card p-5 sm:p-6 rounded-3xl border border-slate-800 bg-[#061219]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-white font-['Space_Grotesk'] flex items-center gap-2">
              <Database className="w-5 h-5 text-emerald-400" /> Database Manager (MongoDB)
            </h3>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              DB: {info?.databaseName || '-'} &middot;{' '}
              <span className={info?.connected ? 'text-emerald-400' : 'text-rose-400'}>
                {info?.connected ? 'CONNECTED' : 'DISCONNECTED'}
              </span>{' '}
              &middot; ping {info?.pingMs ?? '-'} ms
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={loadCollections}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 flex items-center gap-2"
              data-testid="db-refresh"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </button>
            <button
              onClick={backup}
              disabled={busy}
              data-testid="db-backup-button"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-extrabold flex items-center gap-2 disabled:opacity-60"
            >
              <Download className="w-3.5 h-3.5" /> Backup Database
            </button>
            <label className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 flex items-center gap-2 cursor-pointer">
              <Upload className="w-3.5 h-3.5" /> Restore
              <input
                type="file"
                accept="application/json"
                className="hidden"
                data-testid="db-restore-input"
                onChange={(e) => restore(e.target.files?.[0])}
              />
            </label>
          </div>
        </div>

        {msg.text && (
          <div
            className={`mt-4 p-3 rounded-xl text-xs font-bold border ${
              msg.type === 'error'
                ? 'bg-rose-500/10 border-rose-500/40 text-rose-300'
                : 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
            }`}
            data-testid="db-message"
          >
            {msg.text}
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 mt-5">
          {(info?.collections || []).map((c) => (
            <button
              key={c.name}
              onClick={() => setCollection(c.name)}
              data-testid={`db-collection-${c.name}`}
              className={`p-3 rounded-2xl border text-left transition-colors ${
                collection === c.name
                  ? 'bg-emerald-500/15 border-emerald-500'
                  : 'bg-[#040A10] border-slate-800 hover:border-slate-600'
              }`}
            >
              <div className="text-[11px] font-bold text-white truncate">{c.name}</div>
              <div className="text-[10px] text-slate-400 font-mono">
                {c.count} docs &middot; {c.sizeKb} KB
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="glass-card p-5 rounded-3xl border border-slate-800 bg-[#061219] space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h4 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">
            Isi Koleksi: {collection || '-'} ({docs.length} ditampilkan)
          </h4>
          <button
            onClick={clearCollection}
            disabled={!collection || busy}
            data-testid="db-clear-collection"
            className="px-4 py-2 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center gap-2 disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" /> Bersihkan Koleksi Ini
          </button>
        </div>

        <div className="space-y-2 max-h-[520px] overflow-y-auto">
          {docs.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-sm">Koleksi kosong.</div>
          ) : (
            docs.map((doc, i) => (
              <div
                key={doc._id || doc.id || i}
                className="p-3 rounded-2xl bg-[#040A10] border border-slate-800"
                data-testid={`db-doc-${i}`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] font-mono text-emerald-400 truncate">
                    {doc.id || doc.key || doc._id}
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => startEdit(doc)}
                      data-testid={`db-edit-${i}`}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteDoc(doc)}
                      data-testid={`db-delete-${i}`}
                      className="px-2.5 py-1 rounded-lg bg-rose-500/20 border border-rose-500/40 text-[10px] font-bold text-rose-300"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
                <pre className="text-[10px] text-slate-400 font-mono overflow-x-auto whitespace-pre-wrap max-h-32">
                  {JSON.stringify(doc, null, 1)}
                </pre>
              </div>
            ))
          )}
        </div>
      </div>

      {editing && (
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4" data-testid="db-edit-modal">
          <div className="w-full max-w-2xl rounded-3xl bg-[#061219] border border-slate-700 p-5 space-y-4">
            <h4 className="text-sm font-bold text-white">Edit Dokumen — {collection}</h4>
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              rows={16}
              data-testid="db-edit-textarea"
              className="w-full bg-[#040A10] border border-slate-800 rounded-xl p-3 text-[11px] text-emerald-200 font-mono outline-none focus:border-emerald-500"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditing(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-bold"
              >
                Batal
              </button>
              <button
                onClick={saveEdit}
                data-testid="db-edit-save"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-extrabold flex items-center gap-2"
              >
                {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
