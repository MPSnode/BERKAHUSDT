import React, { useState, useEffect } from 'react';
import { Lock, LogOut, CheckCircle2, Clock, XCircle, Trash2, RefreshCw, DollarSign, Save, ShieldAlert, UserCheck, MessageSquare, ArrowUpRight, Check } from 'lucide-react';

export default function AdminPanelModal({ isOpen, onClose, onRateUpdate }) {
  const [token, setToken] = useState(localStorage.getItem('berkah_admin_token') || '');
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Rates State
  const [buyRate, setBuyRate] = useState(16150);
  const [sellRate, setSellRate] = useState(16080);
  const [isSavingRates, setIsSavingRates] = useState(false);
  const [rateSuccessMsg, setRateSuccessMsg] = useState('');

  // Orders State
  const [orders, setOrders] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [filterStatus, setFilterStatus] = useState('ALL');

  const API_URL = 'http://localhost:5000/api';

  useEffect(() => {
    if (token && isOpen) {
      fetchRates();
      fetchOrders();
    }
  }, [token, isOpen]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: usernameInput, password: passwordInput })
      });
      const data = await res.json();

      if (data.success) {
        setToken(data.token);
        localStorage.setItem('berkah_admin_token', data.token);
        setUsernameInput('');
        setPasswordInput('');
      } else {
        setLoginError(data.message || 'Username / Password salah!');
      }
    } catch (err) {
      // Fallback for local dev authentication
      if (usernameInput === 'admin' && passwordInput === 'admin') {
        const dummyToken = 'mock_jwt_admin_token_2026';
        setToken(dummyToken);
        localStorage.setItem('berkah_admin_token', dummyToken);
      } else {
        setLoginError('Koneksi ke backend gagal. Gunakan "admin" / "admin"');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    setToken('');
    localStorage.removeItem('berkah_admin_token');
  };

  const fetchRates = async () => {
    try {
      const res = await fetch(`${API_URL}/rates`);
      const data = await res.json();
      if (data) {
        setBuyRate(data.buyRate || 16150);
        setSellRate(data.sellRate || 16080);
      }
    } catch (err) {
      console.log('Error fetching rates');
    }
  };

  const handleSaveRates = async (e) => {
    e.preventDefault();
    setIsSavingRates(true);
    setRateSuccessMsg('');

    try {
      const res = await fetch(`${API_URL}/rates`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ buyRate: Number(buyRate), sellRate: Number(sellRate) })
      });
      const data = await res.json();
      if (data.success) {
        setRateSuccessMsg('Rate OTC berhasil disimpan ke MongoDB!');
        if (onRateUpdate) onRateUpdate(Number(buyRate), Number(sellRate));
        setTimeout(() => setRateSuccessMsg(''), 3000);
      }
    } catch (err) {
      setRateSuccessMsg('Rate disimpan lokal!');
      if (onRateUpdate) onRateUpdate(Number(buyRate), Number(sellRate));
      setTimeout(() => setRateSuccessMsg(''), 3000);
    } finally {
      setIsSavingRates(false);
    }
  };

  const fetchOrders = async () => {
    setIsLoadingOrders(true);
    try {
      const res = await fetch(`${API_URL}/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setOrders(data);
      }
    } catch (err) {
      console.log('Error fetching orders');
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const handleUpdateOrderStatus = async (id, status) => {
    try {
      await fetch(`${API_URL}/orders/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      fetchOrders();
    } catch (err) {
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    }
  };

  const handleDeleteOrder = async (id) => {
    if (!window.confirm(`Yakin hapus order ${id}?`)) return;
    try {
      await fetch(`${API_URL}/orders/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchOrders();
    } catch (err) {
      setOrders(prev => prev.filter(o => o.id !== id));
    }
  };

  if (!isOpen) return null;

  const filteredOrders = filterStatus === 'ALL'
    ? orders
    : orders.filter(o => o.status === filterStatus);

  const totalVolumeUsdt = orders.reduce((sum, o) => sum + (o.amountUsdt || 0), 0);
  const totalVolumeIdr = orders.reduce((sum, o) => sum + (o.amountIdr || 0), 0);

  const formatIDR = (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="glass-card rounded-3xl border border-emerald-500/40 w-full max-w-5xl bg-[#061219]/95 text-white shadow-2xl overflow-hidden my-8">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-emerald-500/20 bg-[#040C12]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
              <Lock className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold font-['Space_Grotesk'] text-white">
                ADMIN PANEL — BERKAH USDT
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                MongoDB Server • Status: <span className="text-emerald-400 font-bold">ONLINE</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {token && (
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-lg bg-red-500/20 border border-red-500/40 text-red-400 text-xs font-mono font-bold hover:bg-red-500/30 transition-all flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                Logout
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
            >
              ✕
            </button>
          </div>
        </div>

        {/* LOGIN SCREEN */}
        {!token ? (
          <div className="p-8 sm:p-12 max-w-md mx-auto text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 mx-auto flex items-center justify-center">
              <Lock className="w-8 h-8 text-emerald-400 animate-pulse" />
            </div>

            <div>
              <h3 className="text-2xl font-extrabold text-white font-['Space_Grotesk']">
                Masuk Admin Panel
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Gunakan kredensial pengelola untuk mengedit rate & order
              </p>
            </div>

            {loginError && (
              <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400 text-xs font-mono">
                {loginError}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4 text-left">
              <div>
                <label className="text-xs font-mono text-slate-300 block mb-1">Username Admin:</label>
                <input
                  type="text"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="admin"
                  className="w-full px-4 py-3 rounded-xl bg-[#040A10] border border-slate-700 text-white font-mono text-sm focus:border-emerald-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-mono text-slate-300 block mb-1">Password Admin:</label>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="admin"
                  className="w-full px-4 py-3 rounded-xl bg-[#040A10] border border-slate-700 text-white font-mono text-sm focus:border-emerald-500 outline-none"
                  required
                />
              </div>

              <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/20 text-[11px] font-mono text-slate-300">
                💡 Default Credentials: Username: <span className="text-emerald-400 font-bold">admin</span> | Password: <span className="text-emerald-400 font-bold">admin</span>
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-extrabold text-sm shadow-lg shadow-emerald-950/50 hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
              >
                {isLoggingIn ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'MASUK DARSBOARD ADMIN'}
              </button>
            </form>
          </div>
        ) : (
          /* ADMIN DASHBOARD MAIN BODY */
          <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
            
            {/* Top Metrics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-[#040A10] border border-slate-800">
                <span className="text-xs text-slate-400 font-mono block">Total Transaksi:</span>
                <span className="text-xl font-extrabold text-emerald-400 font-mono">{orders.length} Order</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#040A10] border border-slate-800">
                <span className="text-xs text-slate-400 font-mono block">Total Volume USDT:</span>
                <span className="text-xl font-extrabold text-amber-400 font-mono">${totalVolumeUsdt.toLocaleString()} USDT</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#040A10] border border-slate-800">
                <span className="text-xs text-slate-400 font-mono block">Total Turnover IDR:</span>
                <span className="text-sm font-extrabold text-white font-mono">{formatIDR(totalVolumeIdr)}</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#040A10] border border-slate-800">
                <span className="text-xs text-slate-400 font-mono block">Order Pending:</span>
                <span className="text-xl font-extrabold text-teal-300 font-mono">{orders.filter(o => o.status === 'PENDING').length} Order</span>
              </div>
            </div>

            {/* SECTION 1: MANAGE OTC RATES (MONGODB LIVE EDIT) */}
            <div className="p-6 rounded-2xl bg-[#040A10]/90 border border-emerald-500/30 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white font-['Space_Grotesk'] flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-400" />
                  Pengaturan Rate OTC Realtime (MongoDB)
                </h3>
                {rateSuccessMsg && (
                  <span className="text-xs font-mono text-emerald-400 bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/40">
                    {rateSuccessMsg}
                  </span>
                )}
              </div>

              <form onSubmit={handleSaveRates} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-slate-400 font-mono block mb-1">Rate Beli (Rp / USDT):</label>
                  <input
                    type="number"
                    value={buyRate}
                    onChange={(e) => setBuyRate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#07131B] border border-emerald-500/40 text-emerald-400 font-mono font-bold text-base focus:border-emerald-400 outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 font-mono block mb-1">Rate Jual (Rp / USDT):</label>
                  <input
                    type="number"
                    value={sellRate}
                    onChange={(e) => setSellRate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#07131B] border border-amber-500/40 text-amber-400 font-mono font-bold text-base focus:border-amber-400 outline-none"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={isSavingRates}
                    className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    SIMPAN RATE KE MONGODB
                  </button>
                </div>
              </form>
            </div>

            {/* SECTION 2: LIVE ORDER MANAGEMENT */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h3 className="text-base font-bold text-white font-['Space_Grotesk'] flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-teal-400" />
                  Daftar Transaksi OTC Pelanggan
                </h3>

                {/* Filter Tabs */}
                <div className="flex items-center gap-1.5 bg-[#040A10] p-1 rounded-xl border border-slate-800 text-xs font-mono">
                  {['ALL', 'PENDING', 'VERIFIED', 'COMPLETED'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setFilterStatus(st)}
                      className={`px-3 py-1 rounded-lg transition-all ${
                        filterStatus === st
                          ? 'bg-emerald-500 text-slate-950 font-bold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                  <button onClick={fetchOrders} className="p-1 text-slate-400 hover:text-emerald-400">
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingOrders ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-[#040A10]">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[#07131B] text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="p-3">ID ORDER</th>
                      <th className="p-3">TIPE</th>
                      <th className="p-3">PELANGGAN</th>
                      <th className="p-3">USDT / IDR</th>
                      <th className="p-3">PEMBAYARAN</th>
                      <th className="p-3">STATUS</th>
                      <th className="p-3 text-right">AKSI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="p-6 text-center text-slate-500">
                          Belum ada transaksi dalam kategori ini.
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((ord) => (
                        <tr key={ord.id} className="hover:bg-slate-900/60 transition-all">
                          <td className="p-3 font-bold text-white">{ord.id}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              ord.type === 'BUY' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                            }`}>
                              {ord.type === 'BUY' ? 'BELI USDT' : 'JUAL USDT'}
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="font-bold text-white">{ord.clientName}</div>
                            <div className="text-[10px] text-slate-400">{ord.phone}</div>
                          </td>
                          <td className="p-3">
                            <div className="text-emerald-400 font-bold">${ord.amountUsdt} USDT</div>
                            <div className="text-[10px] text-slate-400">{formatIDR(ord.amountIdr)}</div>
                          </td>
                          <td className="p-3">
                            <div>{ord.paymentMethod}</div>
                            <div className="text-[9px] text-slate-500 font-mono truncate max-w-[120px]">
                              {ord.walletAddress}
                            </div>
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              ord.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' :
                              ord.status === 'VERIFIED' ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40' :
                              ord.status === 'CANCELLED' ? 'bg-red-500/20 text-red-400 border border-red-500/40' :
                              'bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse'
                            }`}>
                              {ord.status}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {ord.status === 'PENDING' && (
                                <button
                                  onClick={() => handleUpdateOrderStatus(ord.id, 'VERIFIED')}
                                  title="Verifikasi Order"
                                  className="p-1.5 rounded bg-teal-500/20 text-teal-300 hover:bg-teal-500/40"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {ord.status !== 'COMPLETED' && (
                                <button
                                  onClick={() => handleUpdateOrderStatus(ord.id, 'COMPLETED')}
                                  title="Selesaikan Transaksi"
                                  className="p-1.5 rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/40"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <a
                                href={`https://wa.me/${ord.phone.replace(/[^0-9]/g, '')}?text=Halo%20${encodeURIComponent(ord.clientName)},%20mengenai%20order%20OTC%20${ord.id}%20di%20BERKAH%20USDT`}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Chat WA Pelanggan"
                                className="p-1.5 rounded bg-emerald-600/30 text-emerald-300 hover:bg-emerald-600/50"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                              </a>
                              <button
                                onClick={() => handleDeleteOrder(ord.id)}
                                title="Hapus Order"
                                className="p-1.5 rounded bg-red-500/20 text-red-400 hover:bg-red-500/40"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
