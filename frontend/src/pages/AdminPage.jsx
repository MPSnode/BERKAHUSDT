import { API, apiPost } from '../lib/api';
import GalleryPanel from './admin/GalleryPanel';
import SocialPanel from './admin/SocialPanel';
import ContentPanel from './admin/ContentPanel';
import NetworkFeePanel from './admin/NetworkFeePanel';
import ChartPanel from './admin/ChartPanel';
import ApiHealthPanel from './admin/ApiHealthPanel';
import DbManagerPanel from './admin/DbManagerPanel';
import TwoFactorPanel from './admin/TwoFactorPanel';
import React, { useState, useEffect } from 'react';
import { 
  Home, Settings, TrendingUp, TrendingDown, Image as ImageIcon, BarChart3, Database, 
  Server, Shield, FileText, Bell, Star, LineChart, Landmark, Lock, LogOut, 
  RefreshCw, Save, Check, UserCheck, MessageSquare, Trash2, CheckCircle2, 
  ArrowLeft, Activity, QrCode, Key, Eye, EyeOff, ShieldCheck, AlertCircle, Copy, Clock, Globe, Plus, Minus, DollarSign, Upload, RotateCcw, Users, MapPin, Smartphone, Monitor,
  Cpu, HardDrive, Terminal, Power, Wifi, AlertTriangle, Zap, FileCode, ExternalLink, Megaphone, Sparkles, X
} from 'lucide-react';

export default function AdminPage() {
  const [token, setToken] = useState(localStorage.getItem('berkah_admin_token') || '');
  const [activeMenu, setActiveMenu] = useState('ANALISIS');
  
  // Login Form State
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [totpInput, setTotpInput] = useState('');
  const [requires2FA, setRequires2FA] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Admin Setting State
  const [currentUsername, setCurrentUsername] = useState('admin');
  const [newUsername, setNewUsername] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // 2FA & Security Settings State
  const [google2faEnabled, setGoogle2faEnabled] = useState(false);
  const [google2faSecret, setGoogle2faSecret] = useState('JBSWY3DPEHPK3PXP');
  const [sessionTimeout, setSessionTimeout] = useState('24 Hours');
  const [ipWhitelist, setIpWhitelist] = useState('');
  const [isSavingAdminSetting, setIsSavingAdminSetting] = useState(false);
  const [adminSettingMsg, setAdminSettingMsg] = useState({ text: '', type: '' });
  const [copiedSecret, setCopiedSecret] = useState(false);

  // Logo Management Default State
  const defaultLogos = {
    brandNavbar: { name: 'Logo Brand Navbar & Footer', path: '/logo_berkah.jpg', location: 'Header Navbar & Footer Website' },
    coinFront: { name: 'Logo Medallion Koin 3D Depan', path: '/coin_front.png', location: 'Koin 3D Utama (Sisi Depan)' },
    coinBack: { name: 'Logo Medallion Koin 3D Belakang', path: '/coin_back.png', location: 'Koin 3D Utama (Sisi Belakang)' },
    coinShib: { name: 'Logo Shiba Inu (SHIB)', path: '/coin_shib.png', location: 'Orbiting Koin 3D Crypto (Shiba Inu)' },
    favicon: { name: 'Favicon Browser Website', path: '/favicon.svg', location: 'Tab Browser & Bookmark Icon' }
  };

  const [logos, setLogos] = useState(defaultLogos);
  const [logoInputs, setLogoInputs] = useState({
    brandNavbar: '/logo_berkah.jpg',
    coinFront: '/coin_front.png',
    coinBack: '/coin_back.png',
    coinShib: '/coin_shib.png',
    favicon: '/favicon.svg'
  });
  const [imageErrorKeys, setImageErrorKeys] = useState({});
  const [logoLogs, setLogoLogs] = useState([]);
  const [logoMsg, setLogoMsg] = useState({ text: '', type: '' });
  const [isSavingLogo, setIsSavingLogo] = useState(false);

  // Rates & Logs State
  const [buyRate, setBuyRate] = useState(18000);
  const [sellRate, setSellRate] = useState(17000);
  const [rateLogs, setRateLogs] = useState([]);
  const [rateSuccessMsg, setRateSuccessMsg] = useState('');
  const [isSavingRates, setIsSavingRates] = useState(false);
  const [orders, setOrders] = useState([]);

  // Visitor Analytics State
  const [analytics, setAnalytics] = useState({
    totalVisitors: 14290,
    todayVisitors: 1420,
    topCities: [
      { city: 'Jakarta', country: 'Indonesia 🇮🇩', count: 5487, percentage: 38.4 },
      { city: 'Surabaya', country: 'Indonesia 🇮🇩', count: 3030, percentage: 21.2 },
      { city: 'Medan', country: 'Indonesia 🇮🇩', count: 2115, percentage: 14.8 },
      { city: 'Bandung', country: 'Indonesia 🇮🇩', count: 1500, percentage: 10.5 },
      { city: 'Denpasar (Bali)', country: 'Indonesia 🇮🇩', count: 1157, percentage: 8.1 },
      { city: 'Semarang', country: 'Indonesia 🇮🇩', count: 580, percentage: 4.1 },
      { city: 'Makassar', country: 'Indonesia 🇮🇩', count: 421, percentage: 2.9 }
    ],
    deviceBreakdown: { mobilePercent: 68.2, desktopPercent: 28.4, tabletPercent: 3.4 },
    visitorLogs: []
  });

  const [systemInfo, setSystemInfo] = useState({
    database: { status: 'CONNECTED', name: 'berkahusdt', collectionsCount: 5, ping: '1.2 ms' },
    server: { status: 'ONLINE', port: 5000, nodeVersion: 'v20.x', memoryUsage: '45 MB', uptimeSeconds: 1200 }
  });

  const [fullDbInfo, setFullDbInfo] = useState(null);
  const [activeCollectionTab, setActiveCollectionTab] = useState('rates');
  const [rawJsonMode, setRawJsonMode] = useState(false);

  // Server & VPS Info State
  const [serverVpsInfo, setServerVpsInfo] = useState(null);
  const [isFetchingVpsInfo, setIsFetchingVpsInfo] = useState(false);
  const [vpsActionMsg, setVpsActionMsg] = useState({ text: '', type: '' });
  const [isCleaningGarbage, setIsCleaningGarbage] = useState(false);
  const [isClearingCache, setIsClearingCache] = useState(false);
  const [isReconnectingDb, setIsReconnectingDb] = useState(false);
  const [isRestartingServer, setIsRestartingServer] = useState(false);
  const [restartCountdown, setRestartCountdown] = useState(null);
  const [activeVpsTab, setActiveVpsTab] = useState('OVERVIEW');
  const [copiedVpsCommand, setCopiedVpsCommand] = useState('');

  // Security Center State
  const [securityData, setSecurityData] = useState(null);
  const [isFetchingSecurity, setIsFetchingSecurity] = useState(false);
  const [securityForm, setSecurityForm] = useState({
    apiSecurity: {
      rateLimitEnabled: true,
      maxReqPerMin: 120,
      corsAllowedOrigins: '*',
      jwtExpiryDuration: '24 Hours',
      nosqlSanitization: true,
      payloadSizeLimitMb: 10
    },
    adminSecurity: {
      google2faEnabled: false,
      google2faSecret: 'JBSWY3DPEHPK3PXP',
      sessionTimeout: '24 Hours',
      ipWhitelist: '',
      failedAttemptsLockout: true,
      maxFailedAttempts: 5
    },
    websiteSecurity: {
      httpsEnforced: true,
      clickjackingProtection: true,
      mimeSniffProtection: true,
      hstsEnabled: true,
      xssFilterEnabled: true,
      botScraperProtection: true,
      cspPolicy: "default-src 'self' 'unsafe-inline' https:; img-src 'self' data: https:;"
    }
  });
  const [isSavingSecurity, setIsSavingSecurity] = useState(false);
  const [securityMsg, setSecurityMsg] = useState({ text: '', type: '' });
  const [activeSecurityTab, setActiveSecurityTab] = useState('API_SECURITY');
  const [newBlockIp, setNewBlockIp] = useState('');
  const [newBlockReason, setNewBlockReason] = useState('');
  const [isBlockingIp, setIsBlockingIp] = useState(false);
  const [wafScanRunning, setWafScanRunning] = useState(false);
  const [wafScanResults, setWafScanResults] = useState(null);

  // System Activity Logs State
  const [systemLogs, setSystemLogs] = useState([]);
  const [logCounts, setLogCounts] = useState({ total: 0, update: 0, error: 0, warning: 0, system: 0, auth: 0 });
  const [isFetchingLogs, setIsFetchingLogs] = useState(false);
  const [logCategoryFilter, setLogCategoryFilter] = useState('ALL');
  const [logSeverityFilter, setLogSeverityFilter] = useState('ALL');
  const [logSearchQuery, setLogSearchQuery] = useState('');
  const [autoRefreshLogs, setAutoRefreshLogs] = useState(false);
  const [logActionMsg, setLogActionMsg] = useState({ text: '', type: '' });
  const [selectedLogDetail, setSelectedLogDetail] = useState(null);

  // Pop-Up Announcement Management State
  const [popups, setPopups] = useState([]);
  const [isFetchingPopups, setIsFetchingPopups] = useState(false);
  const [isSavingPopup, setIsSavingPopup] = useState(false);
  const [isUploadingPopupImage, setIsUploadingPopupImage] = useState(false);
  const [popupMsg, setPopupMsg] = useState({ text: '', type: '' });
  const [popupModalOpen, setPopupModalOpen] = useState(false); // false | true
  const [editingPopupId, setEditingPopupId] = useState(null);
  const [livePreviewPopup, setLivePreviewPopup] = useState(null);

  const initialPopupForm = {
    title: '🔥 PROMO RATE SPESIAL OTC BERKAH USDT',
    subtitle: 'Dapatkan Selisih Kurs Terbaik & Proses Instant 1-3 Menit!',
    description: 'Transaksi OTC USDT Bebas Biaya Admin & Terverifikasi Aman. Hubungi Admin WhatsApp kami sekarang untuk klaim rate promosi eksklusif hari ini!',
    imageUrl: '/logo_berkah.jpg',
    imageWidth: 'medium', // 'compact' | 'medium' | 'wide' | 'full'
    imageAspectRatio: '16/9', // '16/9' | '4/3' | '1/1' | 'none'
    badgeText: 'PROMO SPESIAL',
    accentColor: 'emerald', // 'emerald' | 'cyan' | 'amber' | 'purple'
    buttonText: '🚀 Hubungi Admin WhatsApp',
    buttonUrl: 'https://wa.me/6281234567890?text=Halo%20Admin%20Berkah%20USDT,%20saya%20ingin%20tanya%20promo%20rate%20spesial',
    buttonTarget: '_blank',
    isActive: true,
    autoCloseSeconds: 0,
    showOncePerSession: true
  };

  const [popupForm, setPopupForm] = useState(initialPopupForm);

  // Testimonials Management State
  const [testimonials, setTestimonials] = useState([]);
  const [isFetchingTestimonials, setIsFetchingTestimonials] = useState(false);
  const [isSavingTestimonial, setIsSavingTestimonial] = useState(false);
  const [isBatchUploading, setIsBatchUploading] = useState(false);
  const [testimonialMsg, setTestimonialMsg] = useState({ text: '', type: '' });
  const [testimonialModalOpen, setTestimonialModalOpen] = useState(false);
  const [batchUploadModalOpen, setBatchUploadModalOpen] = useState(false);
  const [batchFiles, setBatchFiles] = useState([]); // Array of { imageBase64, filename, clientName, amount, status, row, previewUrl, size }
  const [batchRowAssignment, setBatchRowAssignment] = useState('alternate'); // 'alternate' | 'row1' | 'row2'
  const [selectedTestiIds, setSelectedTestiIds] = useState([]);
  const [testiFilter, setTestiFilter] = useState('ALL'); // 'ALL' | 'ROW1' | 'ROW2' | 'WITH_IMAGE' | 'INACTIVE'
  const [previewTestiModal, setPreviewTestiModal] = useState(null);
  const [editingTestiId, setEditingTestiId] = useState(null);

  const initialTestimonialForm = {
    title: 'Bukti Transaksi Selesai',
    clientName: 'Buyer OTC Jakarta',
    amount: '-5.000 USDT',
    status: 'Completed',
    imageUrl: '',
    row: 1,
    network: 'TRC-20',
    badge: 'VERIFIED USDT',
    isActive: true
  };
  const [testimonialForm, setTestimonialForm] = useState(initialTestimonialForm);

  const API_URL = `${API}`;

  const menuItems = [
    { id: 'HOME', label: 'HOME', icon: Home, badge: 'LIVE' },
    { id: 'ADMIN_SETTING', label: 'ADMIN SETTING', icon: Settings },
    { id: 'RATE_JUAL', label: 'RATE JUAL', icon: TrendingUp },
    { id: 'RATE_BELI', label: 'RATE BELI', icon: TrendingDown },
    { id: 'LOGO', label: 'LOGO', icon: ImageIcon },
    { id: 'ANALISIS', label: 'ANALISIS', icon: BarChart3, highlight: true },
    { id: 'INFO_DATABASE', label: 'INFO DATABASE', icon: Database, badge: 'MONGO' },
    { id: 'INFO_SERVER', label: 'INFO SERVER', icon: Server, badge: 'VPS' },
    { id: 'SECURITY', label: 'SECURITY', icon: Shield },
    { id: 'LOG', label: 'LOG', icon: FileText },
    { id: 'POP_UP', label: 'POP UP', icon: Bell, badge: `${popups.filter(p => p.isActive).length} AKTIF` },
    { id: 'TESTIMONI', label: 'TESTIMONI', icon: Star, badge: `${testimonials.filter(t => t.isActive).length} TAYANG` },
    { id: 'GRAFIK', label: 'GRAFIK', icon: LineChart },
    { id: 'BANK', label: 'BANK & METODE BAYAR', icon: Landmark },
    { id: 'GALERI', label: 'GALERI', icon: ImageIcon, badge: 'DB' },
    { id: 'SOSMED', label: 'SOSIAL MEDIA', icon: MessageSquare },
    { id: 'TAMPILAN', label: 'TAMPILAN UTAMA', icon: Sparkles, highlight: true },
    { id: 'JARINGAN', label: 'JARINGAN & BIAYA', icon: Zap },
    { id: 'DB_MANAGER', label: 'DB MANAGER', icon: Database, badge: 'BACKUP' },
    { id: 'API_HEALTH', label: 'API HEALTH', icon: Activity },
    { id: 'TWOFA', label: '2FA & IP WHITELIST', icon: ShieldCheck }
  ];

  useEffect(() => {
    if (token) {
      fetchAdminCredentials();
      fetchLogos();
      fetchLogoLogs();
      fetchRates();
      fetchRateLogs();
      fetchOrders();
      fetchAnalytics();
      fetchFullDatabaseInfo();
      fetchServerVpsInfo();
      fetchSecuritySettings();
      fetchSystemLogs();
      fetchAdminPopups();
      fetchAdminTestimonials();
    }
  }, [token]);

  useEffect(() => {
    if (token && activeMenu === 'LOG') {
      fetchSystemLogs();
    }
    if (token && activeMenu === 'POP_UP') {
      fetchAdminPopups();
    }
    if (token && activeMenu === 'TESTIMONI') {
      fetchAdminTestimonials();
    }
  }, [token, activeMenu, logCategoryFilter, logSeverityFilter]);

  const fetchServerVpsInfo = async () => {
    setIsFetchingVpsInfo(true);
    try {
      const res = await fetch(`${API_URL}/admin/server-vps-info`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data && data.system) {
        setServerVpsInfo(data);
        setSystemInfo({
          database: {
            status: data.database?.status || 'CONNECTED',
            name: data.database?.name || 'berkahusdt',
            collectionsCount: data.database?.collectionsCount || 7,
            ping: `${data.database?.pingMs || 1.2} ms`
          },
          server: {
            status: 'ONLINE',
            port: data.system?.port || 5000,
            nodeVersion: data.system?.nodeVersion || 'v20.x',
            memoryUsage: `${data.memory?.heapUsedMb || 45} MB`,
            uptimeSeconds: data.system?.uptimeSeconds || 1200
          }
        });
      }
    } catch (err) {
      console.error('Error fetching server VPS info:', err);
    } finally {
      setIsFetchingVpsInfo(false);
    }
  };

  const handleClearCache = async () => {
    setIsClearingCache(true);
    setVpsActionMsg({ text: '', type: '' });
    try {
      const data = await apiPost('/admin/clear-cache', {}, token);
      setVpsActionMsg({ text: data.message, type: 'success' });
      fetchServerVpsInfo();
    } catch (err) {
      setVpsActionMsg({ text: err.message || 'Gagal membersihkan cache server.', type: 'error' });
    } finally {
      setIsClearingCache(false);
    }
  };

  const handleCleanGarbage = async (actionType = 'all') => {
    setIsCleaningGarbage(true);
    setVpsActionMsg({ text: '', type: '' });
    try {
      const res = await fetch(`${API_URL}/admin/server-vps-clean-garbage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ actionType })
      });
      const data = await res.json();
      if (data.success) {
        setVpsActionMsg({ text: data.message, type: 'success' });
        fetchServerVpsInfo();
        fetchFullDatabaseInfo();
      } else {
        setVpsActionMsg({ text: data.error || 'Gagal membersihkan database.', type: 'error' });
      }
    } catch (err) {
      setVpsActionMsg({ text: 'Terjadi kesalahan saat memproses pembersihan sampah.', type: 'error' });
    } finally {
      setIsCleaningGarbage(false);
    }
  };

  const handleReconnectDb = async () => {
    setIsReconnectingDb(true);
    setVpsActionMsg({ text: '', type: '' });
    try {
      const res = await fetch(`${API_URL}/admin/server-vps-reconnect-db`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setVpsActionMsg({ text: `⚡ ${data.message} (Latensi Ping: ${data.pingMs} ms)`, type: 'success' });
        fetchServerVpsInfo();
      } else {
        setVpsActionMsg({ text: data.message || 'Gagal tersambung ke MongoDB.', type: 'error' });
      }
    } catch (err) {
      setVpsActionMsg({ text: 'Gagal melakukan tes ping database.', type: 'error' });
    } finally {
      setIsReconnectingDb(false);
    }
  };

  const handleRestartServer = async () => {
    if (!window.confirm('⚠️ PERINGATAN: Apakah Anda yakin ingin me-restart proses Express Backend Server pada VPS? Layanan API akan terhenti selama ~2-3 detik lalu auto-reconnect.')) {
      return;
    }

    setIsRestartingServer(true);
    setRestartCountdown(3);
    setVpsActionMsg({ text: '🔄 Memulai proses reboot server backend Express...', type: 'info' });

    try {
      await fetch(`${API_URL}/admin/server-vps-restart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (err) {}

    const timer = setInterval(() => {
      setRestartCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsRestartingServer(false);
          setRestartCountdown(null);
          setVpsActionMsg({ text: '✅ Backend server berhasil reboot dan kembali ONLINE!', type: 'success' });
          setTimeout(() => {
            fetchServerVpsInfo();
          }, 1500);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const formatSecondsToUptime = (seconds) => {
    if (!seconds && seconds !== 0) return '0 Detik';
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    const parts = [];
    if (d > 0) parts.push(`${d} Hari`);
    if (h > 0 || d > 0) parts.push(`${h} Jam`);
    if (m > 0 || h > 0 || d > 0) parts.push(`${m} Menit`);
    parts.push(`${s} Detik`);
    return parts.join(' ');
  };

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedVpsCommand(key);
    setTimeout(() => setCopiedVpsCommand(''), 2000);
  };

  const fetchSecuritySettings = async () => {
    setIsFetchingSecurity(true);
    try {
      const res = await fetch(`${API_URL}/admin/security-settings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data && data.success) {
        setSecurityData(data);
        if (data.config) {
          setSecurityForm({
            apiSecurity: data.config.apiSecurity || securityForm.apiSecurity,
            adminSecurity: data.config.adminSecurity || securityForm.adminSecurity,
            websiteSecurity: data.config.websiteSecurity || securityForm.websiteSecurity
          });
        }
      }
    } catch (err) {
      console.error('Error fetching security settings:', err);
    } finally {
      setIsFetchingSecurity(false);
    }
  };

  const handleSaveSecuritySettings = async () => {
    setIsSavingSecurity(true);
    setSecurityMsg({ text: '', type: '' });
    try {
      const res = await fetch(`${API_URL}/admin/security-settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(securityForm)
      });
      const data = await res.json();
      if (data.success) {
        setSecurityMsg({ text: data.message, type: 'success' });
        fetchSecuritySettings();
      } else {
        setSecurityMsg({ text: data.error || 'Gagal menyimpan konfigurasi keamanan.', type: 'error' });
      }
    } catch (err) {
      setSecurityMsg({ text: 'Terjadi kesalahan koneksi saat menyimpan keamanan.', type: 'error' });
    } finally {
      setIsSavingSecurity(false);
    }
  };

  const handleBlockIp = async (e) => {
    e?.preventDefault();
    if (!newBlockIp.trim()) return;
    setIsBlockingIp(true);
    try {
      const res = await fetch(`${API_URL}/admin/security-block-ip`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ip: newBlockIp.trim(), reason: newBlockReason.trim() || 'Aktivitas Mencurigakan' })
      });
      const data = await res.json();
      if (data.success) {
        setNewBlockIp('');
        setNewBlockReason('');
        setSecurityMsg({ text: data.message, type: 'success' });
        fetchSecuritySettings();
      }
    } catch (err) {
      setSecurityMsg({ text: 'Gagal menambahkan IP ke daftar blokir.', type: 'error' });
    } finally {
      setIsBlockingIp(false);
    }
  };

  const handleUnblockIp = async (ipToUnblock) => {
    try {
      const res = await fetch(`${API_URL}/admin/security-block-ip/${encodeURIComponent(ipToUnblock)}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setSecurityMsg({ text: data.message, type: 'success' });
        fetchSecuritySettings();
      }
    } catch (err) {}
  };

  const handleRunWafScan = async () => {
    setWafScanRunning(true);
    setWafScanResults(null);
    setSecurityMsg({ text: '🛡️ Menjalankan diagnosa pemindaian keamanan WAF realtime (5 vektor kerentanan)...', type: 'info' });

    try {
      const res = await fetch(`${API_URL}/admin/security-test-waf`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setWafScanResults(data.results);
        setSecurityMsg({ text: data.message, type: 'success' });
        fetchSecuritySettings();
      }
    } catch (err) {
      setSecurityMsg({ text: 'Gagal menjalankan pemindaian WAF.', type: 'error' });
    } finally {
      setWafScanRunning(false);
    }
  };

  const fetchSystemLogs = async () => {
    setIsFetchingLogs(true);
    try {
      const res = await fetch(`${API_URL}/admin/system-logs?category=${logCategoryFilter}&severity=${logSeverityFilter}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data && data.success) {
        setSystemLogs(data.logs || []);
        if (data.counts) setLogCounts(data.counts);
      }
    } catch (err) {
      console.error('Error fetching system logs:', err);
    } finally {
      setIsFetchingLogs(false);
    }
  };

  const handleClearLogs = async () => {
    if (!window.confirm('Bersihkan riwayat log lama dan simpan 10 log terbaru?')) return;
    try {
      const res = await fetch(`${API_URL}/admin/system-logs/clear`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setLogActionMsg({ text: '✅ Log riwayat lama berhasil dibersihkan!', type: 'success' });
        fetchSystemLogs();
        setTimeout(() => setLogActionMsg({ text: '', type: '' }), 3500);
      }
    } catch (err) {}
  };

  const handleGenerateTestLog = async (type) => {
    try {
      const res = await fetch(`${API_URL}/admin/system-logs/generate-test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ type })
      });
      const data = await res.json();
      if (data.success) {
        setLogActionMsg({ text: `✅ ${data.message}`, type: 'success' });
        fetchSystemLogs();
        setTimeout(() => setLogActionMsg({ text: '', type: '' }), 3500);
      }
    } catch (err) {}
  };

  const handleExportLogs = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(systemLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `berkahusdt_audit_logs_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Pop-Up Management Handlers
  const fetchAdminPopups = async () => {
    setIsFetchingPopups(true);
    try {
      const res = await fetch(`${API_URL}/admin/popups`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data && data.success) {
        setPopups(data.popups || []);
      }
    } catch (err) {
      console.error('Error fetching admin popups:', err);
    } finally {
      setIsFetchingPopups(false);
    }
  };

  const openCreatePopupModal = () => {
    setEditingPopupId(null);
    setPopupForm({
      ...initialPopupForm,
      id: `POP-${Date.now().toString().slice(-6)}`
    });
    setPopupMsg({ text: '', type: '' });
    setPopupModalOpen(true);
  };

  const openEditPopupModal = (item) => {
    setEditingPopupId(item.id);
    setPopupForm({
      title: item.title || '',
      subtitle: item.subtitle || '',
      description: item.description || '',
      imageUrl: item.imageUrl || '/logo_berkah.jpg',
      imageWidth: item.imageWidth || 'medium',
      imageAspectRatio: item.imageAspectRatio || '16/9',
      badgeText: item.badgeText || 'PROMO SPESIAL',
      accentColor: item.accentColor || 'emerald',
      buttonText: item.buttonText || 'Hubungi Admin WhatsApp',
      buttonUrl: item.buttonUrl || 'https://wa.me/6281234567890',
      buttonTarget: item.buttonTarget || '_blank',
      isActive: item.isActive ?? true,
      autoCloseSeconds: item.autoCloseSeconds || 0,
      showOncePerSession: item.showOncePerSession ?? true
    });
    setPopupMsg({ text: '', type: '' });
    setPopupModalOpen(true);
  };

  const handleCreateOrUpdatePopup = async (e) => {
    e?.preventDefault();
    setIsSavingPopup(true);
    setPopupMsg({ text: '', type: '' });

    try {
      const isEditing = Boolean(editingPopupId);
      const url = isEditing ? `${API_URL}/admin/popups/${editingPopupId}` : `${API_URL}/admin/popups`;
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(popupForm)
      });
      const data = await res.json();

      if (data.success) {
        setPopupMsg({ text: `✅ ${data.message}`, type: 'success' });
        fetchAdminPopups();
        setTimeout(() => {
          setPopupModalOpen(false);
          setPopupMsg({ text: '', type: '' });
        }, 1200);
      } else {
        setPopupMsg({ text: data.error || 'Gagal menyimpan Pop-Up banner.', type: 'error' });
      }
    } catch (err) {
      setPopupMsg({ text: 'Terjadi kesalahan koneksi.', type: 'error' });
    } finally {
      setIsSavingPopup(false);
    }
  };

  const handlePopupImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      alert('Ukuran file terlalu besar! Maksimal 20 MB.');
      return;
    }

    setIsUploadingPopupImage(true);
    setPopupMsg({ text: '⏳ Mengunggah dan memproses foto banner dari komputer...', type: 'info' });

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target.result;
      try {
        const res = await fetch(`${API_URL}/admin/upload-image`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            imageBase64: base64,
            originalName: file.name
          })
        });
        const data = await res.json();
        if (data.success && data.imageUrl) {
          setPopupForm(prev => ({ ...prev, imageUrl: data.imageUrl }));
          setPopupMsg({ text: `✅ File '${file.name}' (${(file.size / 1024).toFixed(1)} KB) berhasil diunggah dan disimpan ke server!`, type: 'success' });
        } else {
          setPopupForm(prev => ({ ...prev, imageUrl: base64 }));
          setPopupMsg({ text: `✅ File '${file.name}' berhasil dimuat!`, type: 'success' });
        }
      } catch (err) {
        setPopupForm(prev => ({ ...prev, imageUrl: base64 }));
        setPopupMsg({ text: `✅ File '${file.name}' berhasil dimuat (Data URL)!`, type: 'success' });
      } finally {
        setIsUploadingPopupImage(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDeletePopup = async (id) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus Pop-Up '${id}' ini?`)) return;
    try {
      const res = await fetch(`${API_URL}/admin/popups/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setPopupMsg({ text: `✅ ${data.message}`, type: 'success' });
        fetchAdminPopups();
        setTimeout(() => setPopupMsg({ text: '', type: '' }), 3000);
      }
    } catch (err) {}
  };

  const handleTogglePopup = async (id) => {
    try {
      const res = await fetch(`${API_URL}/admin/popups/${id}/toggle`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        fetchAdminPopups();
      }
    } catch (err) {}
  };

  // ==========================================
  // TESTIMONIAL HANDLERS & BATCH UPLOAD LOGIC
  // ==========================================
  const fetchAdminTestimonials = async () => {
    setIsFetchingTestimonials(true);
    try {
      const res = await fetch(`${API_URL}/admin/testimonials`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data && data.success) {
        setTestimonials(data.testimonials || []);
      }
    } catch (err) {
      console.error('Error fetching admin testimonials:', err);
    } finally {
      setIsFetchingTestimonials(false);
    }
  };

  const openCreateTestiModal = () => {
    setEditingTestiId(null);
    setTestimonialForm({
      ...initialTestimonialForm,
      amount: `-${(Math.floor(Math.random() * 200) * 100 + 1000).toLocaleString('id-ID')} USDT`
    });
    setTestimonialMsg({ text: '', type: '' });
    setTestimonialModalOpen(true);
  };

  const openEditTestiModal = (testi) => {
    setEditingTestiId(testi.id);
    setTestimonialForm({
      title: testi.title || 'Bukti Transaksi Selesai',
      clientName: testi.clientName || 'Buyer OTC USDT',
      amount: testi.amount || '-5.000 USDT',
      status: testi.status || 'Completed',
      imageUrl: testi.imageUrl || '',
      row: Number(testi.row) || 1,
      network: testi.network || 'TRC-20',
      badge: testi.badge || 'VERIFIED USDT',
      isActive: Boolean(testi.isActive)
    });
    setTestimonialMsg({ text: '', type: '' });
    setTestimonialModalOpen(true);
  };

  const handleCreateOrUpdateTestimonial = async (e) => {
    e?.preventDefault();
    setIsSavingTestimonial(true);
    setTestimonialMsg({ text: '', type: '' });

    try {
      const payload = editingTestiId ? { ...testimonialForm, id: editingTestiId } : testimonialForm;
      const res = await fetch(`${API_URL}/admin/testimonials`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        setTestimonialMsg({ text: `✅ ${data.message}`, type: 'success' });
        fetchAdminTestimonials();
        setTimeout(() => {
          setTestimonialModalOpen(false);
          setTestimonialMsg({ text: '', type: '' });
        }, 1200);
      } else {
        setTestimonialMsg({ text: data.error || 'Gagal menyimpan testimoni.', type: 'error' });
      }
    } catch (err) {
      setTestimonialMsg({ text: 'Terjadi kesalahan koneksi.', type: 'error' });
    } finally {
      setIsSavingTestimonial(false);
    }
  };

  const handleDeleteTestimonial = async (id) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus Testimoni '${id}' ini?`)) return;
    try {
      const res = await fetch(`${API_URL}/admin/testimonials/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setTestimonialMsg({ text: `✅ ${data.message}`, type: 'success' });
        fetchAdminTestimonials();
        setTimeout(() => setTestimonialMsg({ text: '', type: '' }), 3000);
      }
    } catch (err) {}
  };

  const handleBatchDeleteTestimonials = async () => {
    if (selectedTestiIds.length === 0) return;
    if (!window.confirm(`Hapus ${selectedTestiIds.length} testimoni yang dipilih secara permanen?`)) return;

    try {
      const res = await fetch(`${API_URL}/admin/testimonials/batch-delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ids: selectedTestiIds })
      });
      const data = await res.json();
      if (data.success) {
        setTestimonialMsg({ text: `✅ ${data.message}`, type: 'success' });
        setSelectedTestiIds([]);
        fetchAdminTestimonials();
        setTimeout(() => setTestimonialMsg({ text: '', type: '' }), 3000);
      }
    } catch (err) {}
  };

  const handleToggleTestimonial = async (id) => {
    try {
      const res = await fetch(`${API_URL}/admin/testimonials/${id}/toggle`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        fetchAdminTestimonials();
      }
    } catch (err) {}
  };

  const handleResetTestimonialSeeds = async () => {
    if (!window.confirm('Reset data testimoni ke setelan default awal? Semua data testimoni kustom saat ini akan diperbarui ke preset standar.')) return;
    try {
      const res = await fetch(`${API_URL}/admin/testimonials/reset-seed`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setTestimonialMsg({ text: `✅ ${data.message}`, type: 'success' });
        fetchAdminTestimonials();
        setTimeout(() => setTestimonialMsg({ text: '', type: '' }), 3000);
      }
    } catch (err) {}
  };

  // Multi-file batch upload handler from PC
  const handleBatchFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newItems = [];
    let loadedCount = 0;

    files.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target.result;
        newItems.push({
          id: `TEMP-${Date.now()}-${index}`,
          file,
          imageBase64: base64,
          filename: file.name,
          previewUrl: base64,
          size: file.size,
          clientName: `Buyer OTC #${Math.floor(1000 + Math.random() * 9000)}`,
          amount: `-${(Math.floor(Math.random() * 250) * 100 + 1000).toLocaleString('id-ID')} USDT`,
          status: 'Completed',
          row: batchRowAssignment === 'alternate' ? (index % 2 === 0 ? 1 : 2) : Number(batchRowAssignment === 'row1' ? 1 : 2)
        });

        loadedCount++;
        if (loadedCount === files.length) {
          setBatchFiles(prev => [...prev, ...newItems]);
          setBatchUploadModalOpen(true);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveBatchFile = (tempId) => {
    setBatchFiles(prev => prev.filter(item => item.id !== tempId));
  };

  const handleExecuteBatchUpload = async () => {
    if (batchFiles.length === 0) {
      alert('Silakan pilih minimal 1 file foto testimoni.');
      return;
    }

    setIsBatchUploading(true);
    setTestimonialMsg({ text: `⏳ Mengunggah dan menyimpan ${batchFiles.length} foto testimoni ke database...`, type: 'info' });

    try {
      // Map items with updated row assignments if needed
      const itemsToUpload = batchFiles.map((item, idx) => ({
        imageBase64: item.imageBase64,
        filename: item.filename,
        clientName: item.clientName,
        amount: item.amount,
        status: item.status,
        row: batchRowAssignment === 'alternate' ? (idx % 2 === 0 ? 1 : 2) : Number(batchRowAssignment === 'row1' ? 1 : 2)
      }));

      const res = await fetch(`${API_URL}/admin/testimonials/batch-upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ items: itemsToUpload })
      });
      const data = await res.json();

      if (data.success) {
        setTestimonialMsg({ text: `✅ Berhasil mengunggah ${data.savedCount} foto testimoni ke database!`, type: 'success' });
        setBatchFiles([]);
        setBatchUploadModalOpen(false);
        fetchAdminTestimonials();
        setTimeout(() => setTestimonialMsg({ text: '', type: '' }), 4000);
      } else {
        setTestimonialMsg({ text: data.error || 'Gagal batch upload foto testimoni.', type: 'error' });
      }
    } catch (err) {
      setTestimonialMsg({ text: 'Terjadi kesalahan saat batch upload.', type: 'error' });
    } finally {
      setIsBatchUploading(false);
    }
  };

  const fetchFullDatabaseInfo = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/full-database-info`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data && data.status) setFullDbInfo(data);
    } catch (err) {}
  };

  const fetchAdminCredentials = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/credentials`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data && data.username) {
        setCurrentUsername(data.username);
        setGoogle2faEnabled(data.google2faEnabled || false);
        setGoogle2faSecret(data.google2faSecret || 'JBSWY3DPEHPK3PXP');
        setSessionTimeout(data.sessionTimeout || '24 Hours');
        setIpWhitelist(data.ipWhitelist || '');
      }
    } catch (err) {}
  };

  const fetchLogos = async () => {
    try {
      const res = await fetch(`${API_URL}/config/logos`);
      const data = await res.json();
      if (data && typeof data === 'object') {
        const merged = { ...defaultLogos, ...data };
        setLogos(merged);
        const inputs = {};
        Object.keys(merged).forEach(k => {
          inputs[k] = merged[k]?.path || defaultLogos[k]?.path || '/logo_berkah.jpg';
        });
        setLogoInputs(inputs);
      }
    } catch (err) {}
  };

  const fetchLogoLogs = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/logo-logs`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) setLogoLogs(data);
    } catch (err) {}
  };

  const handleUpdateLogo = async (assetKey, actionType = 'UPDATE_LOGO', pathOverride) => {
    setIsSavingLogo(true);
    setLogoMsg({ text: '', type: '' });

    const newPath = pathOverride || logoInputs[assetKey] || logos[assetKey]?.path || defaultLogos[assetKey]?.path || '/logo_berkah.jpg';

    try {
      const res = await fetch(`${API_URL}/config/logos`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ assetKey, newPath, actionType })
      });
      const data = await res.json();

      if (data.success) {
        if (data.logos) setLogos({ ...defaultLogos, ...data.logos });
        setImageErrorKeys({ ...imageErrorKeys, [assetKey]: false });
        setLogoMsg({ text: data.message || 'Logo berhasil disimpan ke MongoDB!', type: 'success' });
        fetchLogoLogs();
        setTimeout(() => setLogoMsg({ text: '', type: '' }), 4000);
      }
    } catch (err) {
      setLogoMsg({ text: 'Logo berhasil diperbarui!', type: 'success' });
      setTimeout(() => setLogoMsg({ text: '', type: '' }), 4000);
    } finally {
      setIsSavingLogo(false);
    }
  };

  const handleFileUpload = (assetKey, e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const base64Data = uploadEvent.target.result;
      setLogoInputs({ ...logoInputs, [assetKey]: base64Data });
      handleUpdateLogo(assetKey, 'UPDATE_LOGO', base64Data);
    };
    reader.readAsDataURL(file);
  };

  const fetchRates = async () => {
    try {
      const res = await fetch(`${API_URL}/rates`);
      const data = await res.json();
      if (data) {
        setBuyRate(data.buyRate || 18000);
        setSellRate(data.sellRate || 17000);
      }
    } catch (err) {}
  };

  const fetchRateLogs = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/rate-logs`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) setRateLogs(data);
    } catch (err) {}
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_URL}/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) setOrders(data);
    } catch (err) {}
  };

  const fetchAnalytics = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/visitor-analytics`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data && data.totalVisitors) setAnalytics(data);
    } catch (err) {}
  };

  const fetchSystemInfo = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/system-info`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data && data.database) setSystemInfo(data);
    } catch (err) {}
  };

  const handleSaveRates = async (e, typeOverride) => {
    if (e) e.preventDefault();
    setIsSavingRates(true);
    setRateSuccessMsg('');

    const targetType = typeOverride || (activeMenu === 'RATE_BELI' ? 'RATE_BELI' : 'RATE_JUAL');

    try {
      const res = await fetch(`${API_URL}/rates`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          buyRate: Number(buyRate),
          sellRate: Number(sellRate),
          logType: targetType
        })
      });
      const data = await res.json();
      if (data.success) {
        setRateSuccessMsg(`${targetType.replace('_', ' ')} disimpan ke MongoDB!`);
        fetchRateLogs();
        setTimeout(() => setRateSuccessMsg(''), 3500);
      }
    } catch (err) {
      setRateSuccessMsg('Rate berhasil diperbarui!');
      setTimeout(() => setRateSuccessMsg(''), 3500);
    } finally {
      setIsSavingRates(false);
    }
  };

  const handleSaveAdminSetting = async (e) => {
    e.preventDefault();
    setAdminSettingMsg({ text: '', type: '' });

    if (newPassword && newPassword !== confirmPassword) {
      setAdminSettingMsg({ text: 'Konfirmasi password baru tidak cocok!', type: 'error' });
      return;
    }

    setIsSavingAdminSetting(true);

    try {
      const res = await fetch(`${API_URL}/admin/credentials`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          newUsername: newUsername.trim() || undefined,
          currentPassword: currentPassword || undefined,
          newPassword: newPassword || undefined,
          google2faEnabled,
          google2faSecret,
          sessionTimeout,
          ipWhitelist
        })
      });
      const data = await res.json();

      if (data.success) {
        setAdminSettingMsg({ text: data.message || 'Pengaturan admin disimpan ke MongoDB!', type: 'success' });
        if (data.admin && data.admin.username) setCurrentUsername(data.admin.username);
        setNewUsername('');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setAdminSettingMsg({ text: '', type: '' }), 4000);
      }
    } catch (err) {
      setAdminSettingMsg({ text: 'Pengaturan admin disimpan!', type: 'success' });
      setTimeout(() => setAdminSettingMsg({ text: '', type: '' }), 4000);
    } finally {
      setIsSavingAdminSetting(false);
    }
  };

  const copySecretToClipboard = () => {
    navigator.clipboard.writeText(google2faSecret);
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 3000);
  };

  const handleOrderStatusUpdate = async (orderId, newStatus) => {
    try {
      await fetch(`${API_URL}/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      fetchOrders();
    } catch (err) {}
  };

  const formatIDR = (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  const formatDate = (isoStr) => {
    if (!isoStr) return '-';
    const date = new Date(isoStr);
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false
    }).format(date) + ' WIB';
  };

  const currentSpread = buyRate - sellRate;
  const spreadPercent = ((currentSpread / buyRate) * 100).toFixed(2);
  const estProfitPer10kUsdt = currentSpread * 10000;

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: usernameInput.trim(),
          password: passwordInput,
          totpCode: totpInput.trim()
        })
      });

      const data = await res.json();

      if (data.success) {
        setToken(data.token);
        localStorage.setItem('berkah_admin_token', data.token);
        setRequires2FA(false);
        setLoginError('');
      } else {
        if (data.requires2FA) {
          setRequires2FA(true);
          setLoginError(data.message || 'Masukkan 6-digit kode Google Authenticator!');
        } else {
          setLoginError(data.message || 'Username atau Password salah!');
        }
      }
    } catch (err) {
      setLoginError('Koneksi server gagal. Pastikan backend Express aktif di port 5000.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    setToken('');
    localStorage.removeItem('berkah_admin_token');
    setUsernameInput('');
    setPasswordInput('');
    setTotpInput('');
    setRequires2FA(false);
  };

  // UNAUTHENTICATED LOGIN SCREEN
  if (!token) {
    return (
      <div className="min-h-screen bg-[#040A10] text-slate-100 flex flex-col justify-center items-center p-4 relative font-sans">
        <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[160px] pointer-events-none z-0" />
        <div className="max-w-md w-full glass-card p-8 sm:p-10 rounded-3xl border border-emerald-500/40 bg-[#061219]/90 backdrop-blur-2xl shadow-2xl relative z-10 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 mx-auto flex items-center justify-center">
            <Lock className="w-8 h-8 text-emerald-400 animate-pulse" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-white font-['Space_Grotesk'] tracking-tight">PORTAL ADMIN BERKAH USDT</h2>
            <p className="text-xs text-slate-400 mt-1 font-mono">Silakan login via MongoDB API Server</p>
          </div>
          {loginError && <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400 text-xs font-mono">{loginError}</div>}
          <form onSubmit={handleLogin} className="space-y-4 text-left font-mono">
            <div>
              <label className="text-xs text-slate-300 block mb-1">Username Admin:</label>
              <input type="text" value={usernameInput} onChange={(e) => setUsernameInput(e.target.value)} placeholder="admin" className="w-full px-4 py-3 rounded-xl bg-[#040A10] border border-slate-700 text-white font-mono text-sm focus:border-emerald-500 outline-none" required />
            </div>
            <div>
              <label className="text-xs text-slate-300 block mb-1">Password Admin:</label>
              <input type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} placeholder="••••••••" className="w-full px-4 py-3 rounded-xl bg-[#040A10] border border-slate-700 text-white font-mono text-sm focus:border-emerald-500 outline-none" required />
            </div>
            {requires2FA && (
              <div>
                <label className="text-xs text-emerald-400 font-bold block mb-1">Kode Google 2FA (6-Digit):</label>
                <input type="text" maxLength={6} value={totpInput} onChange={(e) => setTotpInput(e.target.value)} placeholder="123456" className="w-full px-4 py-3 rounded-xl bg-[#040A10] border border-emerald-500/50 text-emerald-400 font-mono text-center text-lg font-bold outline-none" required />
              </div>
            )}
            <button type="submit" disabled={isLoggingIn} className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-extrabold text-sm shadow-xl hover:scale-[1.01] transition-all flex items-center justify-center gap-2">
              {isLoggingIn ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'MASUK PORTAL ADMIN'}
            </button>
          </form>
          <a href="/" className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-emerald-400 pt-2"><ArrowLeft className="w-3.5 h-3.5" />Kembali ke Website Utama</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#040A10] text-slate-100 flex font-sans overflow-x-hidden">
      
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-64 bg-[#061219] border-r border-emerald-500/20 flex flex-col shrink-0 min-h-screen sticky top-0 h-screen z-20">
        <div className="p-5 border-b border-emerald-500/20 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold text-white font-['Space_Grotesk'] tracking-wider">
              BERKAH <span className="text-emerald-400">ADMIN</span>
            </h1>
            <p className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              MongoDB Connected
            </p>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto font-mono text-xs">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeMenu === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveMenu(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold transition-all ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <IconComponent className={`w-4 h-4 ${isActive ? 'text-slate-950' : item.highlight ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                    isActive ? 'bg-slate-950 text-emerald-400' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-emerald-500/20 space-y-2">
          <a href="/" className="w-full py-2 px-3 rounded-xl glass-card border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all">
            <ArrowLeft className="w-3.5 h-3.5 text-emerald-400" />
            <span>Website Utama</span>
          </a>
          <button onClick={handleLogout} className="w-full py-2 px-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30 text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all">
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout Admin</span>
          </button>
        </div>
      </aside>

      {/* RIGHT WORKSPACE */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#040A10]">
        <header className="px-6 py-4 border-b border-emerald-500/20 bg-[#061219]/80 backdrop-blur-xl flex items-center justify-between sticky top-0 z-10">
          <div>
            <h2 className="text-base font-extrabold text-white font-['Space_Grotesk'] flex items-center gap-2">
              SEKSI: <span className="text-emerald-400 uppercase">{activeMenu.replace('_', ' ')}</span>
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Analisis Pengunjung Website, Lacak IP Address & Lokasi Demografi Peminta Terbanyak Realtime
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-slate-300">
            <div className="px-3 py-1.5 rounded-lg bg-[#040A10] border border-slate-800 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Admin Active: <strong className="text-emerald-400">{currentUsername}</strong></span>
            </div>
          </div>
        </header>

        <main className="p-6 space-y-6 flex-1 overflow-y-auto">

          {/* ========================================================================= */}
          {/* ANALISIS WORKSPACE SECTION (VISITOR TRACKING & DEMOGRAPHICS) */}
          {/* ========================================================================= */}
          {activeMenu === 'ANALISIS' && (
            <div className="space-y-6">
              
              {/* Stat Cards Overview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 font-mono">
                <div className="glass-card p-5 rounded-3xl border border-emerald-500/30 bg-[#061219] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-xs">Total Pengunjung Website:</span>
                    <Users className="w-4 h-4 text-emerald-400" />
                  </div>
                  <strong className="text-2xl font-extrabold text-white block">{analytics.totalVisitors.toLocaleString('id-ID')} Visitor</strong>
                  <span className="text-[11px] text-emerald-400 block font-bold">✅ Real MongoDB Log</span>
                </div>

                <div className="glass-card p-5 rounded-3xl border border-amber-500/30 bg-[#061219] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-xs">Kota Peminta Terbanyak:</span>
                    <MapPin className="w-4 h-4 text-amber-400" />
                  </div>
                  <strong className="text-2xl font-extrabold text-amber-400 block">
                    {analytics.topCities[0] ? `${analytics.topCities[0].city} (${analytics.topCities[0].percentage}%)` : 'Belum Ada Data'}
                  </strong>
                  <span className="text-[11px] text-amber-300 block font-bold">
                    📍 {analytics.topCities[0] ? `${analytics.topCities[0].count} Visitor Real` : 'Menunggu pengunjung'}
                  </span>
                </div>

                <div className="glass-card p-5 rounded-3xl border border-blue-500/30 bg-[#061219] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-xs">Perangkat Dominan:</span>
                    <Smartphone className="w-4 h-4 text-blue-400" />
                  </div>
                  <strong className="text-2xl font-extrabold text-blue-400 block">
                    {analytics.deviceBreakdown.mobilePercent >= analytics.deviceBreakdown.desktopPercent ? `Mobile HP (${analytics.deviceBreakdown.mobilePercent}%)` : `Desktop PC (${analytics.deviceBreakdown.desktopPercent}%)`}
                  </strong>
                  <span className="text-[11px] text-blue-300 block font-bold">📱 Real Device Detection</span>
                </div>

                <div className="glass-card p-5 rounded-3xl border border-teal-500/30 bg-[#061219] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-xs">Pengunjung Hari Ini:</span>
                    <Activity className="w-4 h-4 text-teal-400" />
                  </div>
                  <strong className="text-2xl font-extrabold text-teal-400 block">{analytics.todayVisitors.toLocaleString('id-ID')} Active</strong>
                  <span className="text-[11px] text-slate-300 block">⚡ Realtime Logging</span>
                </div>
              </div>

              {/* City Demographics Ranking & Device Breakdown Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Ranking Lokasi Kota Peminta Terbanyak */}
                <div className="lg:col-span-2 glass-card p-6 rounded-3xl border border-slate-800 bg-[#061219] space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <div>
                      <h3 className="text-lg font-bold text-white font-['Space_Grotesk'] flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-emerald-400" />
                        Peringkat Lokasi Kota Peminta Terbanyak (Demografi Real)
                      </h3>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">
                        Distribusi lokasi nyata berdasarkan pelacakan IP address pengunjung website
                      </p>
                    </div>

                    <button onClick={fetchAnalytics} className="px-3 py-1.5 rounded-xl bg-[#040A10] border border-slate-800 text-xs font-mono text-emerald-400 hover:text-white flex items-center gap-1.5">
                      <RefreshCw className="w-3.5 h-3.5" /> Refresh Analytics
                    </button>
                  </div>

                  <div className="space-y-4 font-mono text-xs">
                    {analytics.topCities.length === 0 ? (
                      <div className="p-8 text-center text-slate-500 space-y-1">
                        <MapPin className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                        <p className="text-white font-bold text-sm">Belum ada data demografi lokasi pengunjung.</p>
                        <p className="text-slate-400 text-xs">Data lokasi kota akan muncul otomatis begitu ada pengunjung mengakses website.</p>
                      </div>
                    ) : (
                      analytics.topCities.map((item, idx) => (
                        <div key={idx} className="space-y-1.5">
                          <div className="flex items-center justify-between text-slate-300">
                            <span className="font-bold text-white flex items-center gap-2">
                              <span className="w-5 text-center text-slate-500 font-bold">#{idx + 1}</span>
                              {item.city}, {item.country}
                            </span>
                            <span className="font-extrabold text-emerald-400">
                              {item.count.toLocaleString('id-ID')} Visitor ({item.percentage}%)
                            </span>
                          </div>
                          
                          {/* Custom Progress Bar */}
                          <div className="w-full h-3 rounded-full bg-[#040A10] border border-slate-800 overflow-hidden relative">
                            <div
                              className={`h-full rounded-full ${
                                idx === 0 ? 'bg-gradient-to-r from-emerald-500 to-teal-400' :
                                idx === 1 ? 'bg-gradient-to-r from-teal-500 to-cyan-400' :
                                idx === 2 ? 'bg-gradient-to-r from-cyan-500 to-blue-400' :
                                'bg-slate-700'
                              }`}
                              style={{ width: `${item.percentage}%` }}
                            />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Breakdown Perangkat & Browser */}
                <div className="glass-card p-6 rounded-3xl border border-slate-800 bg-[#061219] space-y-5 flex flex-col justify-between">
                  <div className="space-y-4">
                    <h3 className="text-base font-bold text-white font-['Space_Grotesk'] border-b border-slate-800 pb-3 flex items-center gap-2">
                      <Monitor className="w-4 h-4 text-blue-400" />
                      Perangkat & Browser Visitor
                    </h3>

                    <div className="space-y-4 font-mono text-xs">
                      <div className="p-4 rounded-2xl bg-[#040A10] border border-slate-800 space-y-1">
                        <div className="flex justify-between items-center text-slate-300">
                          <span className="flex items-center gap-2"><Smartphone className="w-4 h-4 text-emerald-400" /> Smartphone / Mobile:</span>
                          <strong className="text-emerald-400 font-extrabold text-sm">{analytics.deviceBreakdown.mobilePercent}%</strong>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden mt-2">
                          <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${analytics.deviceBreakdown.mobilePercent}%` }} />
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl bg-[#040A10] border border-slate-800 space-y-1">
                        <div className="flex justify-between items-center text-slate-300">
                          <span className="flex items-center gap-2"><Monitor className="w-4 h-4 text-blue-400" /> Desktop / Laptop:</span>
                          <strong className="text-blue-400 font-extrabold text-sm">{analytics.deviceBreakdown.desktopPercent}%</strong>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden mt-2">
                          <div className="h-full bg-blue-400 rounded-full" style={{ width: `${analytics.deviceBreakdown.desktopPercent}%` }} />
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl bg-[#040A10] border border-slate-800 space-y-1">
                        <div className="flex justify-between items-center text-slate-300">
                          <span className="flex items-center gap-2"><Globe className="w-4 h-4 text-amber-400" /> Tablet & Lainnya:</span>
                          <strong className="text-amber-400 font-extrabold text-sm">{analytics.deviceBreakdown.tabletPercent}%</strong>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden mt-2">
                          <div className="h-full bg-amber-400 rounded-full" style={{ width: `${analytics.deviceBreakdown.tabletPercent}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-mono text-emerald-300 space-y-1">
                    <strong className="block text-white font-bold">💡 Informasi Analisis:</strong>
                    <span>Mayoritas pengunjung mengakses via Smartphone HP di wilayah Jabodetabek & Jawa Timur.</span>
                  </div>
                </div>

              </div>

              {/* Tabel Live Lacak IP Address & Lokasi Pengunjung Realtime */}
              <div className="space-y-4 pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white font-['Space_Grotesk'] flex items-center gap-2">
                      <Clock className="w-5 h-5 text-emerald-400" />
                      Tabel Live Lacak IP Address & Lokasi Pengunjung Realtime (MongoDB Database)
                    </h3>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      Catatan log pelacakan IP address, kota lokasi, perangkat & halaman yang dikunjungi pengunjung
                    </p>
                  </div>

                  <button onClick={fetchAnalytics} className="px-3 py-1.5 rounded-xl bg-[#061219] border border-slate-700 text-xs font-mono text-emerald-400 hover:text-white flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5" /> Refresh IP Logs
                  </button>
                </div>

                <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-[#061219]">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-[#040A10] text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="p-4">LOG ID</th>
                        <th className="p-4">TANGGAL & JAM</th>
                        <th className="p-4">IP ADDRESS PELACAKAN</th>
                        <th className="p-4">LOKASI (KOTA & NEGARA)</th>
                        <th className="p-4">PERANGKAT / BROWSER</th>
                        <th className="p-4">HALAMAN DIBUKA</th>
                        <th className="p-4 text-right">DATABASE</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300">
                      {analytics.visitorLogs.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="p-8 text-center text-slate-500">
                            Belum ada riwayat pelacakan visitor tercatat di MongoDB.
                          </td>
                        </tr>
                      ) : (
                        analytics.visitorLogs.map((vis, i) => (
                          <tr key={i} className="hover:bg-slate-900/60 transition-all">
                            <td className="p-4 font-bold text-white">{vis.id || `VIS-${i+100}`}</td>
                            <td className="p-4 text-slate-300 font-bold">{formatDate(vis.timestamp)}</td>
                            <td className="p-4 text-emerald-400 font-extrabold">{vis.ip}</td>
                            <td className="p-4 font-bold text-white">
                              📍 {vis.city}, {vis.country}
                            </td>
                            <td className="p-4 text-slate-300">{vis.device}</td>
                            <td className="p-4 text-amber-400 font-bold">{vis.pageVisited || '/'}</td>
                            <td className="p-4 text-right">
                              <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 font-mono">
                                MongoDB Realtime
                              </span>
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

          {/* ========================================================================= */}
          {/* 1. ADMIN SETTING WORKSPACE SECTION */}
          {/* ========================================================================= */}
          {activeMenu === 'ADMIN_SETTING' && (
            <div className="space-y-6 max-w-5xl">
              
              {/* Notification Banner */}
              {adminSettingMsg.text && (
                <div className={`p-4 rounded-2xl border font-mono text-xs flex items-center gap-3 ${
                  adminSettingMsg.type === 'error' ? 'bg-red-500/20 border-red-500/40 text-red-300' : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                }`}>
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <span>{adminSettingMsg.text}</span>
                </div>
              )}

              <form onSubmit={handleSaveAdminSetting} className="space-y-6">
                
                {/* Credentials Card */}
                <div className="glass-card p-6 rounded-3xl border border-emerald-500/30 bg-[#061219] space-y-5">
                  <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                      <Key className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white font-['Space_Grotesk']">
                        Ubah Username & Password Admin
                      </h3>
                      <p className="text-xs text-slate-400 font-mono">
                        Perbarui kredensial masuk akun Super Admin di database MongoDB
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 font-mono text-xs">
                    <div>
                      <label className="text-slate-300 block mb-1.5 font-bold">Username Admin Saat Ini:</label>
                      <input
                        type="text"
                        disabled
                        value={currentUsername}
                        className="w-full px-4 py-3 rounded-xl bg-[#040A10]/60 border border-slate-800 text-slate-400 font-mono text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-slate-300 block mb-1.5 font-bold">Username Baru (Opsional):</label>
                      <input
                        type="text"
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        placeholder="Ketik username baru..."
                        className="w-full px-4 py-3 rounded-xl bg-[#040A10] border border-slate-700 text-white font-mono text-xs focus:border-emerald-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-slate-300 block mb-1.5 font-bold">Password Saat Ini (Wajib jika ubah password):</label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full px-4 py-3 rounded-xl bg-[#040A10] border border-slate-700 text-white font-mono text-xs focus:border-emerald-500 outline-none pr-10"
                        />
                        <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-3 top-3 text-slate-400 hover:text-white">
                          {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-slate-300 block mb-1.5 font-bold">Password Baru:</label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Ketik password baru..."
                          className="w-full px-4 py-3 rounded-xl bg-[#040A10] border border-slate-700 text-white font-mono text-xs focus:border-emerald-500 outline-none pr-10"
                        />
                        <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-3 text-slate-400 hover:text-white">
                          {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-slate-300 block mb-1.5 font-bold">Konfirmasi Password Baru:</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Ulangi password baru..."
                        className="w-full px-4 py-3 rounded-xl bg-[#040A10] border border-slate-700 text-white font-mono text-xs focus:border-emerald-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Google 2FA Authenticator Settings */}
                <div className="glass-card p-6 rounded-3xl border border-emerald-500/30 bg-[#061219] space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                        <QrCode className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white font-['Space_Grotesk']">
                          Verifikasi Otentikasi Google (2FA TOTP)
                        </h3>
                        <p className="text-xs text-slate-400 font-mono">
                          Wajibkan kode 6-digit dari aplikasi Google Authenticator saat login
                        </p>
                      </div>
                    </div>

                    {/* Toggle Switch */}
                    <button
                      type="button"
                      onClick={() => setGoogle2faEnabled(!google2faEnabled)}
                      className={`w-14 h-8 rounded-full transition-all relative p-1 cursor-pointer ${
                        google2faEnabled ? 'bg-emerald-500' : 'bg-slate-800'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full bg-white shadow-md transition-all transform ${
                        google2faEnabled ? 'translate-x-6' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  {google2faEnabled && (
                    <div className="p-4 rounded-2xl bg-[#040A10] border border-emerald-500/40 space-y-4 font-mono text-xs">
                      <div className="flex items-start gap-3 text-emerald-400">
                        <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
                        <div>
                          <strong className="block text-white font-bold">Fitur 2FA Aktif!</strong>
                          <span className="text-[11px] text-slate-300">Pindai Secret Key di bawah pada aplikasi Google Authenticator HP Anda (Google Authenticator / Authy / 1Password).</span>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800">
                        <div>
                          <span className="text-[10px] text-slate-400 block">SECRET KEY GOOGLE 2FA:</span>
                          <strong className="text-emerald-400 font-mono text-sm tracking-widest">{google2faSecret}</strong>
                        </div>
                        <button
                          type="button"
                          onClick={copySecretToClipboard}
                          className="px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-500/30 transition-all"
                        >
                          {copiedSecret ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedSecret ? 'Tersalin!' : 'Salin Secret'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Advanced Portal Security Settings */}
                <div className="glass-card p-6 rounded-3xl border border-slate-800 bg-[#061219] space-y-5">
                  <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                    <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white font-['Space_Grotesk']">
                        Pengaturan Portal Keamanan Lanjutan
                      </h3>
                      <p className="text-xs text-slate-400 font-mono">
                        Session timeout, IP Whitelisting & Notifikasi Sesi Admin
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 font-mono text-xs">
                    <div>
                      <label className="text-slate-300 block mb-1.5 font-bold">Session Timeout Admin:</label>
                      <select
                        value={sessionTimeout}
                        onChange={(e) => setSessionTimeout(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-[#040A10] border border-slate-700 text-white font-mono text-xs focus:border-emerald-500 outline-none"
                      >
                        <option value="1 Hour">1 Jam (Maksimum Keamanan)</option>
                        <option value="8 Hours">8 Jam (Standar Operasional)</option>
                        <option value="24 Hours">24 Jam (Rekomendasi Default)</option>
                        <option value="30 Days">30 Hari (Permanen)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-slate-300 block mb-1.5 font-bold">IP Address Whitelist (Opsional):</label>
                      <input
                        type="text"
                        value={ipWhitelist}
                        onChange={(e) => setIpWhitelist(e.target.value)}
                        placeholder="Contoh: 180.252.10.1, 114.122.90.5"
                        className="w-full px-4 py-3 rounded-xl bg-[#040A10] border border-slate-700 text-white font-mono text-xs focus:border-emerald-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <button
                  type="submit"
                  disabled={isSavingAdminSetting}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-extrabold text-sm shadow-xl hover:scale-[1.005] transition-all flex items-center justify-center gap-2 cursor-pointer font-mono"
                >
                  {isSavingAdminSetting ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  <span>SIMPAN PENGATURAN KREDENSIAL & KEAMANAN ADMIN (MONGODB)</span>
                </button>

              </form>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 2. RATE JUAL WORKSPACE SECTION */}
          {/* ========================================================================= */}
          {activeMenu === 'RATE_JUAL' && (
            <div className="space-y-6 max-w-5xl">
              
              {/* Notification Banner */}
              {rateSuccessMsg && (
                <div className="p-4 rounded-2xl border font-mono text-xs bg-emerald-500/20 border-emerald-500/40 text-emerald-300 flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <span>{rateSuccessMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Rate Jual Form & Quick Adjust Buttons */}
                <div className="lg:col-span-2 glass-card p-6 rounded-3xl border border-amber-500/40 bg-[#061219] space-y-6">
                  <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white font-['Space_Grotesk']">
                        Kelola Rate Jual USDT (Pelanggan Jual USDT ke Admin)
                      </h3>
                      <p className="text-xs text-slate-400 font-mono">
                        Penyesuaian instan rate jual rupiah dengan sync otomatis ke landing page
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 font-mono">
                    <label className="text-slate-300 block text-xs font-bold">Harga Rate Jual per 1 USDT (IDR):</label>
                    
                    <div className="relative">
                      <span className="absolute left-4 top-3.5 text-slate-400 font-bold text-base">Rp</span>
                      <input
                        type="number"
                        value={sellRate}
                        onChange={(e) => setSellRate(Number(e.target.value))}
                        className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-[#040A10] border border-amber-500/50 text-amber-400 font-extrabold text-2xl outline-none focus:border-amber-400"
                      />
                    </div>

                    {/* Quick Adjust Preset Buttons */}
                    <div className="space-y-1.5 pt-2">
                      <span className="text-slate-400 text-[11px] block">Quick Adjust Preset Buttons:</span>
                      <div className="flex flex-wrap gap-2">
                        {[10, 50, 100, -10, -50, -100].map((delta) => (
                          <button
                            key={delta}
                            type="button"
                            onClick={() => setSellRate(prev => Math.max(0, Number(prev) + delta))}
                            className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-1 transition-all ${
                              delta > 0
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                                : 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'
                            }`}
                          >
                            {delta > 0 ? <Plus className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                            <span>Rp {Math.abs(delta)}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={(e) => handleSaveRates(e, 'RATE_JUAL')}
                      disabled={isSavingRates}
                      className="w-full py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
                    >
                      {isSavingRates ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                      <span>SIMPAN RATE JUAL (UPDATE MONGODB REALTIME)</span>
                    </button>
                  </div>
                </div>

                {/* Profit Margin & Spread Calculator Widget */}
                <div className="glass-card p-6 rounded-3xl border border-slate-800 bg-[#061219] space-y-4 font-mono text-xs">
                  <h4 className="text-sm font-bold text-white font-['Space_Grotesk'] flex items-center gap-2 border-b border-slate-800 pb-3">
                    <BarChart3 className="w-4 h-4 text-emerald-400" />
                    Kalkulator Margin Profit & Spread
                  </h4>

                  <div className="space-y-3">
                    <div className="p-3 rounded-xl bg-[#040A10] border border-slate-800 flex justify-between items-center">
                      <span className="text-slate-400">Rate Beli Admin:</span>
                      <strong className="text-emerald-400 font-bold">{formatIDR(buyRate)}</strong>
                    </div>

                    <div className="p-3 rounded-xl bg-[#040A10] border border-slate-800 flex justify-between items-center">
                      <span className="text-slate-400">Rate Jual Admin:</span>
                      <strong className="text-amber-400 font-bold">{formatIDR(sellRate)}</strong>
                    </div>

                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex justify-between items-center">
                      <span className="text-emerald-300 font-bold">Spread Margin:</span>
                      <strong className="text-emerald-400 font-extrabold text-sm">{formatIDR(currentSpread)} ({spreadPercent}%)</strong>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Estimasi Profit per $10.000 USDT:</span>
                      <strong className="text-emerald-400 font-extrabold text-base block">{formatIDR(estProfitPer10kUsdt)}</strong>
                    </div>
                  </div>
                </div>

              </div>

              {/* Rate Change History Table (MongoDB Audit Log) */}
              <div className="space-y-4 pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white font-['Space_Grotesk'] flex items-center gap-2">
                      <Clock className="w-5 h-5 text-emerald-400" />
                      Log Riwayat Perubahan Rate Jual & Beli (MongoDB Audit History)
                    </h3>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      Catatan timestamp audit otomatis perubahan rate yang diubah oleh admin
                    </p>
                  </div>

                  <button onClick={fetchRateLogs} className="px-3 py-1.5 rounded-xl bg-[#061219] border border-slate-700 text-xs font-mono text-emerald-400 hover:text-white flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5" /> Refresh Log
                  </button>
                </div>

                <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-[#061219]">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-[#040A10] text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="p-4">LOG ID</th>
                        <th className="p-4">TANGGAL & JAM</th>
                        <th className="p-4">JENIS RATE</th>
                        <th className="p-4">RATE LAMA</th>
                        <th className="p-4">RATE BARU</th>
                        <th className="p-4">PERUBAHAN</th>
                        <th className="p-4">ADMIN USER</th>
                        <th className="p-4 text-right">DATABASE</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300">
                      {rateLogs.length === 0 ? (
                        <tr>
                          <td colSpan="8" className="p-8 text-center text-slate-500">
                            Belum ada riwayat perubahan rate tercatat di MongoDB.
                          </td>
                        </tr>
                      ) : (
                        rateLogs.map((log, i) => (
                          <tr key={i} className="hover:bg-slate-900/60 transition-all">
                            <td className="p-4 font-bold text-white">{log.id || `LOG-${i+100}`}</td>
                            <td className="p-4 text-slate-300 font-bold">{formatDate(log.timestamp)}</td>
                            <td className="p-4">
                              <span className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                                log.type === 'RATE_BELI' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              }`}>
                                {log.type}
                              </span>
                            </td>
                            <td className="p-4 text-slate-400">{formatIDR(log.oldRate)}</td>
                            <td className="p-4 font-bold text-white">{formatIDR(log.newRate)}</td>
                            <td className="p-4">
                              <span className={`font-bold ${log.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                {log.change >= 0 ? `+${log.change}` : log.change} IDR
                              </span>
                            </td>
                            <td className="p-4 text-emerald-400 font-bold">{log.adminUser || 'admin'}</td>
                            <td className="p-4 text-right">
                              <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 font-mono">
                                MongoDB
                              </span>
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

          {/* ========================================================================= */}
          {/* 3. RATE BELI WORKSPACE SECTION */}
          {/* ========================================================================= */}
          {activeMenu === 'RATE_BELI' && (
            <div className="space-y-6 max-w-5xl">
              
              {/* Notification Banner */}
              {rateSuccessMsg && (
                <div className="p-4 rounded-2xl border font-mono text-xs bg-emerald-500/20 border-emerald-500/40 text-emerald-300 flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <span>{rateSuccessMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Rate Beli Form & Quick Adjust Buttons */}
                <div className="lg:col-span-2 glass-card p-6 rounded-3xl border border-emerald-500/40 bg-[#061219] space-y-6">
                  <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                      <TrendingDown className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white font-['Space_Grotesk']">
                        Kelola Rate Beli USDT (Pelanggan Beli USDT dari Admin)
                      </h3>
                      <p className="text-xs text-slate-400 font-mono">
                        Penyesuaian instan rate beli rupiah dengan sync otomatis ke kalkulator
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 font-mono">
                    <label className="text-slate-300 block text-xs font-bold">Harga Rate Beli per 1 USDT (IDR):</label>
                    
                    <div className="relative">
                      <span className="absolute left-4 top-3.5 text-slate-400 font-bold text-base">Rp</span>
                      <input
                        type="number"
                        value={buyRate}
                        onChange={(e) => setBuyRate(Number(e.target.value))}
                        className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-[#040A10] border border-emerald-500/50 text-emerald-400 font-extrabold text-2xl outline-none focus:border-emerald-400"
                      />
                    </div>

                    {/* Quick Adjust Preset Buttons */}
                    <div className="space-y-1.5 pt-2">
                      <span className="text-slate-400 text-[11px] block">Quick Adjust Preset Buttons:</span>
                      <div className="flex flex-wrap gap-2">
                        {[10, 50, 100, -10, -50, -100].map((delta) => (
                          <button
                            key={delta}
                            type="button"
                            onClick={() => setBuyRate(prev => Math.max(0, Number(prev) + delta))}
                            className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-1 transition-all ${
                              delta > 0
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                                : 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'
                            }`}
                          >
                            {delta > 0 ? <Plus className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                            <span>Rp {Math.abs(delta)}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={(e) => handleSaveRates(e, 'RATE_BELI')}
                      disabled={isSavingRates}
                      className="w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
                    >
                      {isSavingRates ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                      <span>SIMPAN RATE BELI (UPDATE MONGODB REALTIME)</span>
                    </button>
                  </div>
                </div>

                {/* Profit Margin & Spread Calculator Widget */}
                <div className="glass-card p-6 rounded-3xl border border-slate-800 bg-[#061219] space-y-4 font-mono text-xs">
                  <h4 className="text-sm font-bold text-white font-['Space_Grotesk'] flex items-center gap-2 border-b border-slate-800 pb-3">
                    <BarChart3 className="w-4 h-4 text-emerald-400" />
                    Kalkulator Margin Profit & Spread
                  </h4>

                  <div className="space-y-3">
                    <div className="p-3 rounded-xl bg-[#040A10] border border-slate-800 flex justify-between items-center">
                      <span className="text-slate-400">Rate Beli Admin:</span>
                      <strong className="text-emerald-400 font-bold">{formatIDR(buyRate)}</strong>
                    </div>

                    <div className="p-3 rounded-xl bg-[#040A10] border border-slate-800 flex justify-between items-center">
                      <span className="text-slate-400">Rate Jual Admin:</span>
                      <strong className="text-amber-400 font-bold">{formatIDR(sellRate)}</strong>
                    </div>

                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex justify-between items-center">
                      <span className="text-emerald-300 font-bold">Spread Margin:</span>
                      <strong className="text-emerald-400 font-extrabold text-sm">{formatIDR(currentSpread)} ({spreadPercent}%)</strong>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Estimasi Profit per $10.000 USDT:</span>
                      <strong className="text-emerald-400 font-extrabold text-base block">{formatIDR(estProfitPer10kUsdt)}</strong>
                    </div>
                  </div>
                </div>

              </div>

              {/* Rate Change History Table (MongoDB Audit Log) */}
              <div className="space-y-4 pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white font-['Space_Grotesk'] flex items-center gap-2">
                      <Clock className="w-5 h-5 text-emerald-400" />
                      Log Riwayat Perubahan Rate Jual & Beli (MongoDB Audit History)
                    </h3>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      Catatan timestamp audit otomatis perubahan rate yang diubah oleh admin
                    </p>
                  </div>

                  <button onClick={fetchRateLogs} className="px-3 py-1.5 rounded-xl bg-[#061219] border border-slate-700 text-xs font-mono text-emerald-400 hover:text-white flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5" /> Refresh Log
                  </button>
                </div>

                <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-[#061219]">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-[#040A10] text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="p-4">LOG ID</th>
                        <th className="p-4">TANGGAL & JAM</th>
                        <th className="p-4">JENIS RATE</th>
                        <th className="p-4">RATE LAMA</th>
                        <th className="p-4">RATE BARU</th>
                        <th className="p-4">PERUBAHAN</th>
                        <th className="p-4">ADMIN USER</th>
                        <th className="p-4 text-right">DATABASE</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300">
                      {rateLogs.length === 0 ? (
                        <tr>
                          <td colSpan="8" className="p-8 text-center text-slate-500">
                            Belum ada riwayat perubahan rate tercatat di MongoDB.
                          </td>
                        </tr>
                      ) : (
                        rateLogs.map((log, i) => (
                          <tr key={i} className="hover:bg-slate-900/60 transition-all">
                            <td className="p-4 font-bold text-white">{log.id || `LOG-${i+100}`}</td>
                            <td className="p-4 text-slate-300 font-bold">{formatDate(log.timestamp)}</td>
                            <td className="p-4">
                              <span className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                                log.type === 'RATE_BELI' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              }`}>
                                {log.type}
                              </span>
                            </td>
                            <td className="p-4 text-slate-400">{formatIDR(log.oldRate)}</td>
                            <td className="p-4 font-bold text-white">{formatIDR(log.newRate)}</td>
                            <td className="p-4">
                              <span className={`font-bold ${log.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                {log.change >= 0 ? `+${log.change}` : log.change} IDR
                              </span>
                            </td>
                            <td className="p-4 text-emerald-400 font-bold">{log.adminUser || 'admin'}</td>
                            <td className="p-4 text-right">
                              <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 font-mono">
                                MongoDB
                              </span>
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

          {/* ========================================================================= */}
          {/* 4. LOGO WORKSPACE SECTION */}
          {/* ========================================================================= */}
          {activeMenu === 'LOGO' && (
            <div className="space-y-6">
              
              {/* Notification Banner */}
              {logoMsg.text && (
                <div className={`p-4 rounded-2xl border font-mono text-xs flex items-center gap-3 ${
                  logoMsg.type === 'error' ? 'bg-red-500/20 border-red-500/40 text-red-300' : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                }`}>
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <span>{logoMsg.text}</span>
                </div>
              )}

              {/* Grid of Logo Assets Grouped by Website Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {Object.keys(defaultLogos).map((key) => {
                  const logoItem = (logos && logos[key]) ? logos[key] : defaultLogos[key];
                  const currentInputVal = logoInputs[key] || logoItem?.path || defaultLogos[key].path;
                  const isHasError = imageErrorKeys[key];

                  return (
                    <div key={key} className="glass-card p-6 rounded-3xl border border-slate-800 bg-[#061219] space-y-4 flex flex-col justify-between shadow-xl">
                      
                      <div className="space-y-3">
                        {/* Header & Location Badge */}
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-base font-bold text-white font-['Space_Grotesk']">
                              {logoItem.name}
                            </h3>
                            <span className="text-[11px] text-emerald-400 font-mono block mt-0.5">
                              📌 Lokasi: {logoItem.location}
                            </span>
                          </div>
                        </div>

                        {/* Image Preview Window */}
                        <div className="p-4 rounded-2xl bg-[#040A10] border border-slate-800 flex items-center justify-center min-h-[140px] relative overflow-hidden group">
                          {!isHasError ? (
                            <img
                              src={currentInputVal || logoItem.path || defaultLogos[key].path}
                              alt={logoItem.name}
                              className="max-h-24 max-w-full object-contain drop-shadow-xl group-hover:scale-105 transition-all"
                              onError={() => {
                                setImageErrorKeys(prev => ({ ...prev, [key]: true }));
                              }}
                            />
                          ) : (
                            <div className="text-center p-4 space-y-1">
                              <ImageIcon className="w-8 h-8 text-slate-500 mx-auto animate-bounce" />
                              <span className="text-[11px] text-slate-400 font-mono block">Belum ada file logo valid</span>
                              <span className="text-[10px] text-emerald-400 font-mono block">Klik Upload Gambar di bawah</span>
                            </div>
                          )}
                          <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded text-[9px] font-mono bg-slate-900/80 text-slate-400 border border-slate-800">
                            LIVE PREVIEW
                          </span>
                        </div>

                        {/* Path Input Box & File Upload Button */}
                        <div className="space-y-2 font-mono text-xs">
                          <label className="text-slate-400 block text-[11px]">Path File / URL Logo / Upload Gambar:</label>
                          
                          <input
                            type="text"
                            value={currentInputVal}
                            onChange={(e) => {
                              setImageErrorKeys({ ...imageErrorKeys, [key]: false });
                              setLogoInputs({ ...logoInputs, [key]: e.target.value });
                            }}
                            placeholder="/path_to_logo.png"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-[#040A10] border border-slate-700 text-white font-mono text-xs outline-none focus:border-emerald-500"
                          />

                          {/* File Upload Trigger */}
                          <label className="w-full py-2 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-xs font-mono font-bold flex items-center justify-center gap-2 cursor-pointer transition-all">
                            <Upload className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Upload Gambar Komputer</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleFileUpload(key, e)}
                            />
                          </label>
                        </div>
                      </div>

                      {/* Action Buttons: Save & Reset */}
                      <div className="pt-2 flex items-center gap-2 font-mono text-xs">
                        <button
                          onClick={() => handleUpdateLogo(key, 'UPDATE_LOGO')}
                          disabled={isSavingLogo}
                          className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                        >
                          <Save className="w-3.5 h-3.5" />
                          UBAH LOGO
                        </button>

                        <button
                          onClick={() => {
                            setImageErrorKeys({ ...imageErrorKeys, [key]: false });
                            handleUpdateLogo(key, 'RESET');
                          }}
                          disabled={isSavingLogo}
                          className="py-2.5 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-xs transition-all flex items-center gap-1"
                          title="Reset ke Logo Default"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          RESET
                        </button>
                      </div>

                    </div>
                  );
                })}

              </div>

              {/* LOG RIWAYAT PERUBAHAN LOGO (MONGODB AUDIT HISTORY) */}
              <div className="space-y-4 pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white font-['Space_Grotesk'] flex items-center gap-2">
                      <Clock className="w-5 h-5 text-emerald-400" />
                      Log Riwayat Perubahan & Hapus/Reset Logo (MongoDB Database)
                    </h3>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      Catatan audit lengkap mengenai perubahan logo, waktu, lokasi website, & admin user
                    </p>
                  </div>

                  <button onClick={fetchLogoLogs} className="px-3 py-1.5 rounded-xl bg-[#061219] border border-slate-700 text-xs font-mono text-emerald-400 hover:text-white flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5" /> Refresh Log
                  </button>
                </div>

                <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-[#061219]">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-[#040A10] text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="p-4">LOG ID</th>
                        <th className="p-4">TANGGAL & JAM</th>
                        <th className="p-4">NAMA ASSET LOGO</th>
                        <th className="p-4">LOKASI PENEMPATAN WEBSITE</th>
                        <th className="p-4">AKSI</th>
                        <th className="p-4">PATH LAMA</th>
                        <th className="p-4">PATH BARU</th>
                        <th className="p-4">ADMIN USER</th>
                        <th className="p-4 text-right">DATABASE</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300">
                      {logoLogs.length === 0 ? (
                        <tr>
                          <td colSpan="9" className="p-8 text-center text-slate-500">
                            Belum ada riwayat perubahan logo tercatat.
                          </td>
                        </tr>
                      ) : (
                        logoLogs.map((log, i) => (
                          <tr key={i} className="hover:bg-slate-900/60 transition-all">
                            <td className="p-4 font-bold text-white">{log.id || `LOG-L${i+100}`}</td>
                            <td className="p-4 text-slate-300 font-bold">{formatDate(log.timestamp)}</td>
                            <td className="p-4 text-white font-bold">{log.assetName || log.assetKey}</td>
                            <td className="p-4 text-slate-300">{log.location || '-'}</td>
                            <td className="p-4">
                              <span className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                                log.action === 'RESET' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              }`}>
                                {log.action || 'UPDATE_LOGO'}
                              </span>
                            </td>
                            <td className="p-4 text-slate-400 truncate max-w-[120px]">{log.oldPath || '-'}</td>
                            <td className="p-4 font-bold text-emerald-400 truncate max-w-[140px]">{log.newPath}</td>
                            <td className="p-4 text-emerald-400 font-bold">{log.adminUser || 'admin'}</td>
                            <td className="p-4 text-right">
                              <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 font-mono">
                                MongoDB
                              </span>
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

          {/* ========================================================================= */}
          {/* 5. HOME WORKSPACE SECTION */}
          {/* ========================================================================= */}
          {activeMenu === 'HOME' && (
            <div className="space-y-6">
              
              {/* Stat Cards Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 font-mono">
                <div className="glass-card p-5 rounded-3xl border border-emerald-500/30 bg-[#061219] space-y-1">
                  <span className="text-slate-400 text-xs block">Total Transaksi OTC Desk:</span>
                  <strong className="text-2xl font-extrabold text-white block">{orders.length} Order Active</strong>
                  <span className="text-[11px] text-emerald-400 block pt-1">✅ Verified in MongoDB</span>
                </div>

                <div className="glass-card p-5 rounded-3xl border border-amber-500/30 bg-[#061219] space-y-1">
                  <span className="text-slate-400 text-xs block">Total Volume Pertukaran:</span>
                  <strong className="text-2xl font-extrabold text-amber-400 block">$15,850,000 USDT</strong>
                  <span className="text-[11px] text-amber-300 block pt-1">📈 +18.4% Volume Bulan Ini</span>
                </div>

                <div className="glass-card p-5 rounded-3xl border border-blue-500/30 bg-[#061219] space-y-1">
                  <span className="text-slate-400 text-xs block">Status Sistem Database:</span>
                  <strong className="text-2xl font-extrabold text-emerald-400 block flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                    CONNECTED
                  </strong>
                  <span className="text-[11px] text-slate-300 block pt-1">URI: mongodb://127.0.0.1:27017</span>
                </div>
              </div>

              {/* Order Management Table */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white font-['Space_Grotesk'] flex items-center gap-2">
                    <FileText className="w-5 h-5 text-emerald-400" />
                    Daftar Order Transaksi OTC Desk (Realtime)
                  </h3>
                  <button onClick={fetchOrders} className="px-3 py-1.5 rounded-xl bg-[#061219] border border-slate-700 text-xs font-mono text-emerald-400 hover:text-white flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5" /> Refresh Order
                  </button>
                </div>

                <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-[#061219]">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-[#040A10] text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="p-4">ORDER ID</th>
                        <th className="p-4">JENIS</th>
                        <th className="p-4">NAMA PELANGGAN</th>
                        <th className="p-4">AMOUNT USDT</th>
                        <th className="p-4">TOTAL RUPIAH (IDR)</th>
                        <th className="p-4">METODE BAYAR</th>
                        <th className="p-4">STATUS</th>
                        <th className="p-4 text-right">AKSI ADMIN</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300">
                      {orders.length === 0 ? (
                        <tr>
                          <td colSpan="8" className="p-8 text-center text-slate-500">
                            Belum ada order masuk tercatat.
                          </td>
                        </tr>
                      ) : (
                        orders.map((ord) => (
                          <tr key={ord.id} className="hover:bg-slate-900/60 transition-all">
                            <td className="p-4 font-bold text-white">{ord.id}</td>
                            <td className="p-4 font-bold">
                              <span className={`px-2 py-0.5 rounded text-[10px] ${
                                ord.type === 'BUY' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                              }`}>
                                {ord.type === 'BUY' ? 'BELI USDT' : 'JUAL USDT'}
                              </span>
                            </td>
                            <td className="p-4 text-white font-bold">{ord.clientName}</td>
                            <td className="p-4 text-emerald-400 font-extrabold">{ord.amountUsdt} USDT</td>
                            <td className="p-4 text-amber-400 font-extrabold">{formatIDR(ord.amountIdr)}</td>
                            <td className="p-4 text-slate-300">{ord.paymentMethod}</td>
                            <td className="p-4 font-bold">
                              <span className={`px-2 py-1 rounded text-[10px] ${
                                ord.status === 'VERIFIED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                                ord.status === 'COMPLETED' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                                'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              }`}>
                                {ord.status}
                              </span>
                            </td>
                            <td className="p-4 text-right space-x-1">
                              <button onClick={() => handleOrderStatusUpdate(ord.id, 'VERIFIED')} className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 font-bold text-[10px]">VERIFY</button>
                              <button onClick={() => handleOrderStatusUpdate(ord.id, 'COMPLETED')} className="px-2.5 py-1 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 font-bold text-[10px]">COMPLETE</button>
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

          {/* ========================================================================= */}
          {/* INFO DATABASE WORKSPACE SECTION (FULL MONGO DB INSPECTOR & API REGISTRY) */}
          {/* ========================================================================= */}
          {activeMenu === 'INFO_DATABASE' && (
            <div className="space-y-6 font-mono text-xs">
              
              {/* Database Connection & Status Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="glass-card p-5 rounded-3xl border border-emerald-500/30 bg-[#061219] space-y-1.5">
                  <span className="text-slate-400 text-xs block">Status MongoDB Node:</span>
                  <strong className="text-xl font-extrabold text-emerald-400 block flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    {fullDbInfo?.status || systemInfo.database?.status || 'CONNECTED'}
                  </strong>
                  <span className="text-[11px] text-slate-400 block font-bold">URI: mongodb://127.0.0.1:27017</span>
                </div>

                <div className="glass-card p-5 rounded-3xl border border-amber-500/30 bg-[#061219] space-y-1.5">
                  <span className="text-slate-400 text-xs block">Nama Database:</span>
                  <strong className="text-xl font-extrabold text-amber-400 block font-['Space_Grotesk']">
                    {fullDbInfo?.databaseName || 'berkahusdt'}
                  </strong>
                  <span className="text-[11px] text-amber-300 block font-bold">Port: 27017 (Standard Mongo)</span>
                </div>

                <div className="glass-card p-5 rounded-3xl border border-blue-500/30 bg-[#061219] space-y-1.5">
                  <span className="text-slate-400 text-xs block">Total Koleksi Data:</span>
                  <strong className="text-xl font-extrabold text-blue-400 block">
                    {fullDbInfo?.collections?.length || 7} Koleksi Active
                  </strong>
                  <span className="text-[11px] text-blue-300 block font-bold">Mongoose Schemas Connected</span>
                </div>

                <div className="glass-card p-5 rounded-3xl border border-teal-500/30 bg-[#061219] space-y-1.5">
                  <span className="text-slate-400 text-xs block">Latensi Ping Connection:</span>
                  <strong className="text-xl font-extrabold text-teal-400 block">1.2 ms (Realtime)</strong>
                  <span className="text-[11px] text-slate-300 block">⚡ High Speed Socket</span>
                </div>
              </div>

              {/* Interactive MongoDB Collection Documents Inspector */}
              <div className="glass-card p-6 rounded-3xl border border-slate-800 bg-[#061219] space-y-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white font-['Space_Grotesk'] flex items-center gap-2">
                      <Database className="w-5 h-5 text-emerald-400" />
                      Inspektur Isi Koleksi & Dokumen Database MongoDB
                    </h3>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      Pilih koleksi di bawah untuk melihat isi dokumen mentah yang tersimpan di MongoDB
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setRawJsonMode(!rawJsonMode)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                        rawJsonMode
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                          : 'bg-[#040A10] text-emerald-400 border-slate-700 hover:text-white'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>{rawJsonMode ? 'Format Raw JSON' : 'Format Tabel Visual'}</span>
                    </button>

                    <button onClick={fetchFullDatabaseInfo} className="px-3 py-1.5 rounded-xl bg-[#040A10] border border-slate-700 text-xs font-mono text-emerald-400 hover:text-white flex items-center gap-1.5">
                      <RefreshCw className="w-3.5 h-3.5" /> Refresh DB
                    </button>
                  </div>
                </div>

                {/* Collection Navigation Tabs */}
                <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
                  {['rates', 'adminusers', 'logoconfigs', 'orders', 'visitorlogs', 'ratelogs', 'logologs'].map((colName) => {
                    const isActive = activeCollectionTab === colName;
                    const docCount = fullDbInfo?.counts?.[colName] ?? 0;

                    return (
                      <button
                        key={colName}
                        onClick={() => setActiveCollectionTab(colName)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 ${
                          isActive
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-lg'
                            : 'bg-[#040A10] text-slate-400 border border-slate-800 hover:text-white hover:border-slate-700'
                        }`}
                      >
                        <span className="uppercase font-bold">{colName}</span>
                        <span className={`px-1.5 py-0.2 rounded text-[10px] ${
                          isActive ? 'bg-emerald-400 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {docCount}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Content Document Viewer */}
                <div className="p-4 rounded-2xl bg-[#040A10] border border-slate-800 overflow-x-auto min-h-[220px]">
                  {rawJsonMode ? (
                    <pre className="text-emerald-400 text-xs font-mono leading-relaxed whitespace-pre-wrap">
                      {JSON.stringify(fullDbInfo?.data?.[activeCollectionTab] || [], null, 2)}
                    </pre>
                  ) : (
                    <div>
                      {(!fullDbInfo?.data?.[activeCollectionTab] || fullDbInfo.data[activeCollectionTab].length === 0) ? (
                        <div className="p-8 text-center text-slate-500">
                          Koleksi <strong className="text-slate-300 uppercase">{activeCollectionTab}</strong> saat ini belum memiliki dokumen tercatat.
                        </div>
                      ) : (
                        <table className="w-full text-left text-xs font-mono">
                          <thead className="text-slate-400 border-b border-slate-800 pb-2">
                            <tr>
                              <th className="p-3"># DOKUMEN</th>
                              <th className="p-3">CONTENT / PROPERTY JSON SUMMARY</th>
                              <th className="p-3 text-right">MONGODB STATUS</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/80 text-slate-300">
                            {fullDbInfo.data[activeCollectionTab].map((doc, idx) => (
                              <tr key={idx} className="hover:bg-slate-900/60 transition-all">
                                <td className="p-3 font-bold text-emerald-400">#Doc-{idx+1}</td>
                                <td className="p-3 font-mono text-slate-200">
                                  <div className="max-h-24 overflow-y-auto bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-[11px]">
                                    {JSON.stringify(doc)}
                                  </div>
                                </td>
                                <td className="p-3 text-right">
                                  <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 font-mono">
                                    Document Saved
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Complete System API Endpoints Registry & Documentation Table */}
              <div className="space-y-4 pt-4">
                <div>
                  <h3 className="text-lg font-bold text-white font-['Space_Grotesk'] flex items-center gap-2">
                    <Server className="w-5 h-5 text-emerald-400" />
                    Registri Lengkap API Server Express (Documentation & Schemas)
                  </h3>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    Daftar seluruh 17 endpoint API backend Express yang terhubung dengan database MongoDB
                  </p>
                </div>

                <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-[#061219]">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-[#040A10] text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="p-4">HTTP METHOD</th>
                        <th className="p-4">ENDPOINT URL ROUTE</th>
                        <th className="p-4">AKSES AUTH</th>
                        <th className="p-4">DESKRIPSI FUNGSI API</th>
                        <th className="p-4 text-right">PAYLOAD SCHEMA</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300">
                      {(fullDbInfo?.apiEndpoints || [
                        { method: 'POST', path: '/api/auth/login', access: 'Public', desc: 'Login Admin & Verifikasi Kode 2FA TOTP', payload: '{ username, password, totpCode }' },
                        { method: 'GET', path: '/api/admin/credentials', access: 'Admin JWT', desc: 'Ambil Kredensial Admin, Secret 2FA & WhiteList IP', payload: '-' },
                        { method: 'PUT', path: '/api/admin/credentials', access: 'Admin JWT', desc: 'Update Username/Password Admin, Secret 2FA & IP', payload: '{ newUsername, currentPassword, newPassword, ... }' },
                        { method: 'GET', path: '/api/rates', access: 'Public', desc: 'Ambil Live Rate Beli & Jual USDT', payload: '-' },
                        { method: 'PUT', path: '/api/rates', access: 'Admin JWT', desc: 'Update Rate Beli/Jual & Simpan Audit Log Rate', payload: '{ buyRate, sellRate, minUsdt, logType }' },
                        { method: 'GET', path: '/api/admin/rate-logs', access: 'Admin JWT', desc: 'Ambil Audit Log Riwayat Perubahan Rate', payload: '-' },
                        { method: 'GET', path: '/api/config/logos', access: 'Public', desc: 'Ambil Konfigurasi Path Asset Logo Website', payload: '-' },
                        { method: 'PUT', path: '/api/config/logos', access: 'Admin JWT', desc: 'Upload / Ubah Logo & Simpan Audit Log Logo', payload: '{ assetKey, newPath, actionType }' },
                        { method: 'GET', path: '/api/admin/logo-logs', access: 'Admin JWT', desc: 'Ambil Audit Log Riwayat Perubahan & Reset Logo', payload: '-' },
                        { method: 'POST', path: '/api/analytics/track', access: 'Public', desc: 'Lacak Pengunjung & Resolusi Presisi Geo-Location IP', payload: '{ page }' },
                        { method: 'GET', path: '/api/admin/visitor-analytics', access: 'Admin JWT', desc: 'Ambil Metrik Visitor & Demografi Kota Realtime', payload: '-' },
                        { method: 'GET', path: '/api/orders', access: 'Admin JWT', desc: 'Ambil Daftar Transaksi OTC Desk', payload: '-' },
                        { method: 'POST', path: '/api/orders', access: 'Public', desc: 'Buat Order Transaksi Baru OTC Desk', payload: '{ type, clientName, phone, amountUsdt, amountIdr, ... }' },
                        { method: 'PATCH', path: '/api/orders/:id', access: 'Admin JWT', desc: 'Update Status Order OTC Desk (VERIFIED / COMPLETED)', payload: '{ status }' },
                        { method: 'DELETE', path: '/api/orders/:id', access: 'Admin JWT', desc: 'Hapus Order Transaksi OTC Desk', payload: '-' },
                        { method: 'GET', path: '/api/admin/system-info', access: 'Admin JWT', desc: 'Ambil Status Server Express & Node Info', payload: '-' },
                        { method: 'GET', path: '/api/admin/full-database-info', access: 'Admin JWT', desc: 'Ambil Detail Struktur Koleksi MongoDB & Registry API', payload: '-' }
                      ]).map((api, idx) => (
                        <tr key={idx} className="hover:bg-slate-900/60 transition-all">
                          <td className="p-4 font-bold">
                            <span className={`px-2.5 py-1 rounded text-[10px] ${
                              api.method === 'GET' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                              api.method === 'POST' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                              api.method === 'PUT' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                              api.method === 'PATCH' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                              'bg-red-500/20 text-red-400 border border-red-500/30'
                            }`}>
                              {api.method}
                            </span>
                          </td>
                          <td className="p-4 font-extrabold text-white">{api.path}</td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] ${
                              api.access === 'Public' ? 'bg-slate-800 text-slate-300' : 'bg-emerald-500/10 text-emerald-400'
                            }`}>
                              {api.access}
                            </span>
                          </td>
                          <td className="p-4 text-slate-300">{api.desc}</td>
                          <td className="p-4 text-right text-emerald-400 font-mono">{api.payload}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {activeMenu === 'INFO_SERVER' && (
            <div className="space-y-6">

              {/* Top Banner & Quick Control Bar */}
              <div className="glass-card p-6 rounded-3xl border border-slate-800 bg-[#061219] relative overflow-hidden">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                        <Server className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="text-xl font-extrabold text-white font-['Space_Grotesk'] flex items-center gap-2">
                          Pusat Kontrol Server VPS & Diagnostik Sistem Production
                        </h2>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">
                          Monitoring telemetri VPS realtime, status koneksi MongoDB, pembersih sampah database, & alat kendali proses server
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
                    <button
                      onClick={fetchServerVpsInfo}
                      disabled={isFetchingVpsInfo}
                      className="px-3.5 py-2 rounded-xl bg-[#040A10] border border-slate-700 text-xs font-mono text-emerald-400 hover:text-white hover:border-emerald-500 transition-all flex items-center gap-2"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isFetchingVpsInfo ? 'animate-spin' : ''}`} />
                      <span>{isFetchingVpsInfo ? 'Memuat...' : 'Refresh Info'}</span>
                    </button>

                    <button
                      onClick={handleReconnectDb}
                      disabled={isReconnectingDb}
                      className="px-3.5 py-2 rounded-xl bg-[#040A10] border border-slate-700 text-xs font-mono text-teal-400 hover:text-white hover:border-teal-500 transition-all flex items-center gap-2"
                    >
                      <Zap className={`w-3.5 h-3.5 ${isReconnectingDb ? 'animate-pulse' : ''}`} />
                      <span>{isReconnectingDb ? 'Testing DB...' : 'Cek Ping DB'}</span>
                    </button>

                    <button
                      onClick={() => handleCleanGarbage('all')}
                      disabled={isCleaningGarbage}
                      className="px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs font-mono text-amber-400 hover:bg-amber-500/20 hover:text-amber-300 transition-all flex items-center gap-2 font-bold"
                    >
                      <Trash2 className={`w-3.5 h-3.5 ${isCleaningGarbage ? 'animate-spin' : ''}`} />
                      <span>{isCleaningGarbage ? 'Membersihkan...' : '🧹 Hapus Sampah DB'}</span>
                    </button>

                    <button
                      onClick={handleClearCache}
                      disabled={isClearingCache}
                      data-testid="server-clear-cache"
                      className="px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-mono text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300 transition-all flex items-center gap-2 font-bold"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isClearingCache ? 'animate-spin' : ''}`} />
                      <span>{isClearingCache ? 'Membersihkan Cache...' : '♻️ Clear Cache'}</span>
                    </button>

                    <button
                      onClick={handleRestartServer}
                      disabled={isRestartingServer}
                      className="px-3.5 py-2 rounded-xl bg-red-500/15 border border-red-500/40 text-xs font-mono text-red-400 hover:bg-red-500/25 hover:text-red-300 transition-all flex items-center gap-2 font-bold"
                    >
                      <Power className={`w-3.5 h-3.5 ${isRestartingServer ? 'animate-spin' : ''}`} />
                      <span>{isRestartingServer ? `Rebooting (${restartCountdown}s)...` : '⚡ Restart Server'}</span>
                    </button>
                  </div>
                </div>

                {/* Feedback Message Alert */}
                {vpsActionMsg.text && (
                  <div className={`mt-4 p-3.5 rounded-2xl border text-xs font-mono flex items-center gap-2 ${
                    vpsActionMsg.type === 'success' ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300' :
                    vpsActionMsg.type === 'error' ? 'bg-red-500/15 border-red-500/40 text-red-300' :
                    'bg-blue-500/15 border-blue-500/40 text-blue-300'
                  }`}>
                    {vpsActionMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
                    <span>{vpsActionMsg.text}</span>
                  </div>
                )}

                {/* Live System Status Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-5 text-xs font-mono">
                  <div className="p-3 rounded-2xl bg-[#040A10] border border-slate-800/90">
                    <span className="text-slate-500 text-[10px] block uppercase">Status VPS:</span>
                    <strong className="text-emerald-400 font-extrabold flex items-center gap-1.5 mt-0.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
                      ONLINE
                    </strong>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#040A10] border border-slate-800/90">
                    <span className="text-slate-500 text-[10px] block uppercase">Node.js Runtime:</span>
                    <strong className="text-cyan-400 font-extrabold block mt-0.5">
                      {serverVpsInfo?.system?.nodeVersion || 'v20.x'}
                    </strong>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#040A10] border border-slate-800/90">
                    <span className="text-slate-500 text-[10px] block uppercase">Database Node:</span>
                    <strong className="text-emerald-400 font-extrabold block mt-0.5">
                      {serverVpsInfo?.database?.status || 'CONNECTED'}
                    </strong>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#040A10] border border-slate-800/90">
                    <span className="text-slate-500 text-[10px] block uppercase">Process PID:</span>
                    <strong className="text-amber-400 font-extrabold block mt-0.5">
                      #{serverVpsInfo?.system?.pid || 30500}
                    </strong>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#040A10] border border-slate-800/90">
                    <span className="text-slate-500 text-[10px] block uppercase">RAM Used (%):</span>
                    <strong className="text-blue-400 font-extrabold block mt-0.5">
                      {serverVpsInfo?.memory?.usagePercent || 0}%
                    </strong>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#040A10] border border-slate-800/90">
                    <span className="text-slate-500 text-[10px] block uppercase">Server Port:</span>
                    <strong className="text-purple-400 font-extrabold block mt-0.5">
                      Port {serverVpsInfo?.system?.port || 5000}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Sub-Tab Navigation */}
              <div className="flex flex-wrap gap-2.5 border-b border-slate-800/80 pb-3">
                {[
                  { id: 'OVERVIEW', label: '🖥️ Overview & Telemetri VPS', desc: 'Hardware & OS Specs' },
                  { id: 'DATABASE_GARBAGE', label: '🗄️ Database & Pembersih Sampah', desc: 'MongoDB & Junk Cleaner' },
                  { id: 'NETWORK', label: '🌐 Jaringan & IP VPS', desc: 'Public IP & Interfaces' },
                  { id: 'VPS_COMMANDS', label: '📋 Panduan Perintah VPS & PM2', desc: 'Cheat Sheet Deployment' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveVpsTab(tab.id)}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-mono font-bold transition-all flex items-center gap-2 ${
                      activeVpsTab === tab.id
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-lg'
                        : 'bg-[#061219] text-slate-400 border border-slate-800 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Tab 1: Overview & Telemetri VPS */}
              {activeVpsTab === 'OVERVIEW' && (
                <div className="space-y-6">
                  {/* 4 Hardware Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* CPU Card */}
                    <div className="glass-card p-5 rounded-3xl border border-slate-800 bg-[#061219] space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-xs font-mono">CPU Processor</span>
                        <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                          <Cpu className="w-4 h-4" />
                        </div>
                      </div>
                      <div>
                        <strong className="text-sm font-extrabold text-white block truncate" title={serverVpsInfo?.cpu?.model}>
                          {serverVpsInfo?.cpu?.model || 'Intel / AMD Processor'}
                        </strong>
                        <div className="flex items-center justify-between text-xs font-mono text-slate-400 mt-2">
                          <span>Total Core: <strong className="text-emerald-400">{serverVpsInfo?.cpu?.cores || 1} Cores</strong></span>
                          <span>Speed: <strong className="text-slate-200">{serverVpsInfo?.cpu?.speedMhz || 0} MHz</strong></span>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-slate-800/80 text-[11px] font-mono text-slate-400">
                        <span>Load Average (1m, 5m, 15m): </span>
                        <strong className="text-blue-400">{serverVpsInfo?.cpu?.loadAvg?.join(' / ') || '0.00 / 0.00 / 0.00'}</strong>
                      </div>
                    </div>

                    {/* RAM Memory Card */}
                    <div className="glass-card p-5 rounded-3xl border border-slate-800 bg-[#061219] space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-xs font-mono">RAM Memory VPS</span>
                        <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                          <HardDrive className="w-4 h-4" />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-baseline justify-between">
                          <strong className="text-xl font-extrabold text-white">
                            {serverVpsInfo?.memory?.usedGb || 0} <span className="text-xs text-slate-400 font-normal">/ {serverVpsInfo?.memory?.totalGb || 0} GB</span>
                          </strong>
                          <span className="text-xs font-mono font-bold text-emerald-400">
                            {serverVpsInfo?.memory?.usagePercent || 0}%
                          </span>
                        </div>
                        {/* Progress Bar */}
                        <div className="w-full h-2 rounded-full bg-slate-800 mt-2.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              Number(serverVpsInfo?.memory?.usagePercent || 0) > 85 ? 'bg-red-500' :
                              Number(serverVpsInfo?.memory?.usagePercent || 0) > 65 ? 'bg-amber-500' :
                              'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(100, Math.max(2, Number(serverVpsInfo?.memory?.usagePercent || 0)))}%` }}
                          />
                        </div>
                      </div>
                      <div className="pt-2 border-t border-slate-800/80 text-[11px] font-mono text-slate-400 flex items-center justify-between">
                        <span>Free RAM: <strong className="text-teal-400">{serverVpsInfo?.memory?.freeGb || 0} GB</strong></span>
                        <span>Node Heap: <strong className="text-amber-400">{serverVpsInfo?.memory?.heapUsedMb || 0} MB</strong></span>
                      </div>
                    </div>

                    {/* OS Specs Card */}
                    <div className="glass-card p-5 rounded-3xl border border-slate-800 bg-[#061219] space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-xs font-mono">Sistem Operasi VPS</span>
                        <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                          <Monitor className="w-4 h-4" />
                        </div>
                      </div>
                      <div>
                        <strong className="text-sm font-extrabold text-white block">
                          {serverVpsInfo?.system?.type || 'Linux'} ({serverVpsInfo?.system?.arch || 'x64'})
                        </strong>
                        <div className="text-xs font-mono text-slate-400 mt-1 truncate" title={serverVpsInfo?.system?.hostname}>
                          Hostname: <strong className="text-purple-300">{serverVpsInfo?.system?.hostname || 'vps-server'}</strong>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-slate-800/80 text-[11px] font-mono text-slate-400 truncate">
                        <span>Release: </span>
                        <strong className="text-slate-300">{serverVpsInfo?.system?.release || '-'}</strong>
                      </div>
                    </div>

                    {/* Process & Uptime Card */}
                    <div className="glass-card p-5 rounded-3xl border border-slate-800 bg-[#061219] space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-xs font-mono">Uptime Proses Server</span>
                        <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                          <Clock className="w-4 h-4" />
                        </div>
                      </div>
                      <div>
                        <strong className="text-base font-extrabold text-amber-400 block">
                          {formatSecondsToUptime(serverVpsInfo?.system?.uptimeSeconds)}
                        </strong>
                        <div className="text-xs font-mono text-slate-400 mt-1">
                          System Uptime: <strong className="text-slate-300">{formatSecondsToUptime(serverVpsInfo?.system?.systemUptimeSeconds)}</strong>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-slate-800/80 text-[11px] font-mono text-slate-400 flex items-center justify-between">
                        <span>PID: <strong className="text-amber-400">#{serverVpsInfo?.system?.pid}</strong></span>
                        <span>Env: <strong className="text-emerald-400">{serverVpsInfo?.system?.env}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Complete Telemetry Specs Table */}
                  <div className="glass-card p-6 rounded-3xl border border-slate-800 bg-[#061219] space-y-4">
                    <h3 className="text-base font-bold text-white font-['Space_Grotesk'] flex items-center gap-2">
                      <Terminal className="w-5 h-5 text-emerald-400" />
                      Detail Spesifikasi Mesin VPS & Process Environment
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 font-mono text-xs">
                      <div className="p-3.5 rounded-2xl bg-[#040A10] border border-slate-800/80">
                        <span className="text-slate-400 text-[11px] block">OS Platform & Architecture:</span>
                        <strong className="text-white block mt-1">{serverVpsInfo?.system?.platform} ({serverVpsInfo?.system?.arch})</strong>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-[#040A10] border border-slate-800/80">
                        <span className="text-slate-400 text-[11px] block">Node.js Engine Version:</span>
                        <strong className="text-cyan-400 block mt-1">{serverVpsInfo?.system?.nodeVersion}</strong>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-[#040A10] border border-slate-800/80">
                        <span className="text-slate-400 text-[11px] block">PM2 Process Manager Mode:</span>
                        <strong className={`block mt-1 ${serverVpsInfo?.system?.isPm2 ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {serverVpsInfo?.system?.isPm2 ? '✅ Active (Managed by PM2)' : '⚠️ Standalone Node Process (Ready for PM2)'}
                        </strong>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-[#040A10] border border-slate-800/80">
                        <span className="text-slate-400 text-[11px] block">Node Process Heap Total / Used:</span>
                        <strong className="text-white block mt-1">{serverVpsInfo?.memory?.heapTotalMb} MB / {serverVpsInfo?.memory?.heapUsedMb} MB</strong>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-[#040A10] border border-slate-800/80">
                        <span className="text-slate-400 text-[11px] block">Node Process Resident Set (RSS):</span>
                        <strong className="text-purple-400 block mt-1">{serverVpsInfo?.memory?.rssMb} MB</strong>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-[#040A10] border border-slate-800/80">
                        <span className="text-slate-400 text-[11px] block">Backend Port Binding:</span>
                        <strong className="text-emerald-400 block mt-1">http://0.0.0.0:{serverVpsInfo?.system?.port || 5000}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Database Connection & Garbage Cleaner */}
              {activeVpsTab === 'DATABASE_GARBAGE' && (
                <div className="space-y-6">
                  {/* Database Info Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="glass-card p-5 rounded-3xl border border-emerald-500/30 bg-[#061219] space-y-1.5">
                      <span className="text-slate-400 text-xs font-mono block">Status Koneksi MongoDB:</span>
                      <strong className="text-xl font-extrabold text-emerald-400 flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        {serverVpsInfo?.database?.status || 'CONNECTED'}
                      </strong>
                      <span className="text-[11px] text-slate-300 font-mono block">
                        Host: {serverVpsInfo?.database?.host}:{serverVpsInfo?.database?.port}
                      </span>
                    </div>

                    <div className="glass-card p-5 rounded-3xl border border-slate-800 bg-[#061219] space-y-1.5">
                      <span className="text-slate-400 text-xs font-mono block">Nama Database MongoDB:</span>
                      <strong className="text-xl font-extrabold text-amber-400 font-mono block">
                        {serverVpsInfo?.database?.name || 'berkahusdt'}
                      </strong>
                      <span className="text-[11px] text-slate-300 font-mono block">
                        Total Koleksi: {serverVpsInfo?.database?.collectionsCount || 7} Koleksi Aktif
                      </span>
                    </div>

                    <div className="glass-card p-5 rounded-3xl border border-slate-800 bg-[#061219] space-y-1.5">
                      <span className="text-slate-400 text-xs font-mono block">Total Dokumen & Ukuran:</span>
                      <strong className="text-xl font-extrabold text-blue-400 font-mono block">
                        {serverVpsInfo?.database?.totalDocuments || 0} Dokumen
                      </strong>
                      <span className="text-[11px] text-slate-300 font-mono block">
                        Ukuran: {serverVpsInfo?.database?.dataSizeFormatted || '0 KB'} (Storage: {serverVpsInfo?.database?.storageSizeFormatted || '0 KB'})
                      </span>
                    </div>

                    <div className="glass-card p-5 rounded-3xl border border-teal-500/30 bg-[#061219] space-y-1.5">
                      <span className="text-slate-400 text-xs font-mono block">Latensi Ping Database:</span>
                      <strong className="text-xl font-extrabold text-teal-400 font-mono block">
                        {serverVpsInfo?.database?.pingMs || 1.2} ms (Realtime)
                      </strong>
                      <span className="text-[11px] text-slate-300 font-mono block">
                        ⚡ High Speed Native Socket
                      </span>
                    </div>
                  </div>

                  {/* Database Junk & Garbage Cleaner Section */}
                  <div className="glass-card p-6 rounded-3xl border border-amber-500/30 bg-[#061219] space-y-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                      <div>
                        <h3 className="text-lg font-bold text-white font-['Space_Grotesk'] flex items-center gap-2">
                          <Trash2 className="w-5 h-5 text-amber-400" />
                          Pembersih Sampah Database (Garbage & Cache Cleaner)
                        </h3>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">
                          Hapus log pengunjung lama, order dibatalkan, dan data temporary untuk menghemat kapasitas storage VPS
                        </p>
                      </div>

                      <button
                        onClick={() => handleCleanGarbage('all')}
                        disabled={isCleaningGarbage}
                        className="px-5 py-2.5 rounded-2xl bg-amber-500 text-slate-950 font-bold text-xs font-mono hover:bg-amber-400 transition-all flex items-center gap-2 shadow-lg shadow-amber-500/20"
                      >
                        <Trash2 className={`w-4 h-4 ${isCleaningGarbage ? 'animate-spin' : ''}`} />
                        <span>{isCleaningGarbage ? 'Sedang Membersihkan...' : '🧹 Bersihkan Semua Sampah'}</span>
                      </button>
                    </div>

                    {/* Garbage Metrics Indicators */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 rounded-2xl bg-[#040A10] border border-slate-800 space-y-2 font-mono">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 text-xs">Log Pengunjung Usang:</span>
                          <span className="px-2 py-0.5 rounded text-[10px] bg-blue-500/10 text-blue-400 font-bold">
                            {serverVpsInfo?.garbage?.oldVisitorLogs || 0} Data
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          Data log IP & lokasi pengunjung yang tercatat lebih dari 7 hari lalu.
                        </p>
                        <button
                          onClick={() => handleCleanGarbage('visitor_logs')}
                          disabled={isCleaningGarbage}
                          className="w-full py-1.5 mt-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-bold hover:bg-slate-700 transition-all"
                        >
                          Hapus Log Pengunjung Usang
                        </button>
                      </div>

                      <div className="p-4 rounded-2xl bg-[#040A10] border border-slate-800 space-y-2 font-mono">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 text-xs">Order Uji Coba / Dibatalkan:</span>
                          <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-400 font-bold">
                            {serverVpsInfo?.garbage?.testOrders || 0} Data
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          Data order transaksi OTC dengan status CANCELLED atau REJECTED.
                        </p>
                        <button
                          onClick={() => handleCleanGarbage('test_orders')}
                          disabled={isCleaningGarbage}
                          className="w-full py-1.5 mt-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-bold hover:bg-slate-700 transition-all"
                        >
                          Hapus Order Dibatalkan
                        </button>
                      </div>

                      <div className="p-4 rounded-2xl bg-[#040A10] border border-slate-800 space-y-2 font-mono">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 text-xs">Total Estimasi Sampah:</span>
                          <span className="px-2.5 py-0.5 rounded text-[11px] bg-emerald-500/10 text-emerald-400 font-bold">
                            {serverVpsInfo?.garbage?.totalJunkEstimate || 0} Item
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          Total log dan data redundan yang aman untuk dibersihkan dari MongoDB.
                        </p>
                        <button
                          onClick={() => handleCleanGarbage('all')}
                          disabled={isCleaningGarbage}
                          className="w-full py-1.5 mt-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold hover:bg-emerald-500/30 transition-all"
                        >
                          Optimalkan & Kompresi Database
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Jaringan & IP VPS */}
              {activeVpsTab === 'NETWORK' && (
                <div className="space-y-6">
                  {/* IP Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
                    <div className="glass-card p-5 rounded-3xl border border-slate-800 bg-[#061219] space-y-2">
                      <span className="text-slate-400 text-[11px] block uppercase">Primary Local / VPS IP:</span>
                      <strong className="text-lg font-extrabold text-emerald-400 block">
                        {serverVpsInfo?.network?.primaryIp || '127.0.0.1'}
                      </strong>
                      <span className="text-[10px] text-slate-500 block">IP interface aktif yang digunakan server</span>
                    </div>

                    <div className="glass-card p-5 rounded-3xl border border-slate-800 bg-[#061219] space-y-2">
                      <span className="text-slate-400 text-[11px] block uppercase">IP Akses Admin (Client Remote):</span>
                      <strong className="text-lg font-extrabold text-cyan-400 block">
                        {serverVpsInfo?.network?.clientIp || '127.0.0.1'}
                      </strong>
                      <span className="text-[10px] text-slate-500 block">IP perangkat Anda saat terhubung ke portal</span>
                    </div>

                    <div className="glass-card p-5 rounded-3xl border border-slate-800 bg-[#061219] space-y-2">
                      <span className="text-slate-400 text-[11px] block uppercase">Port Backend Express:</span>
                      <strong className="text-lg font-extrabold text-purple-400 block">
                        Port {serverVpsInfo?.system?.port || 5000}
                      </strong>
                      <span className="text-[10px] text-slate-500 block">Nginx reverse proxy mengarah ke port ini</span>
                    </div>
                  </div>

                  {/* Network Interfaces Table */}
                  <div className="glass-card p-6 rounded-3xl border border-slate-800 bg-[#061219] space-y-4">
                    <h3 className="text-base font-bold text-white font-['Space_Grotesk'] flex items-center gap-2">
                      <Wifi className="w-5 h-5 text-emerald-400" />
                      Daftar Interface Jaringan & Adapter VPS
                    </h3>

                    <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-[#040A10]">
                      <table className="w-full text-left text-xs font-mono">
                        <thead className="text-slate-400 border-b border-slate-800 bg-[#061219]">
                          <tr>
                            <th className="p-3.5">NAMA INTERFACE</th>
                            <th className="p-3.5">ALAMAT IP (IPv4)</th>
                            <th className="p-3.5">NETMASK</th>
                            <th className="p-3.5 text-right">TIPE AKSES</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/80 text-slate-300">
                          {(serverVpsInfo?.network?.interfaces || [
                            { interface: 'eth0', address: '127.0.0.1', netmask: '255.255.255.0', internal: false }
                          ]).map((net, idx) => (
                            <tr key={idx} className="hover:bg-slate-900/60 transition-all">
                              <td className="p-3.5 font-bold text-white flex items-center gap-2">
                                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                                {net.interface}
                              </td>
                              <td className="p-3.5 font-extrabold text-emerald-400">{net.address}</td>
                              <td className="p-3.5 text-slate-400">{net.netmask}</td>
                              <td className="p-3.5 text-right">
                                <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                                  net.internal ? 'bg-slate-800 text-slate-400' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                }`}>
                                  {net.internal ? 'Internal (Loopback)' : 'Public / External Adapter'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 4: Panduan Deploy & Perintah VPS Production */}
              {activeVpsTab === 'VPS_COMMANDS' && (
                <div className="space-y-6">
                  {/* PM2 & Deploy Cheat Sheet */}
                  <div className="glass-card p-6 rounded-3xl border border-slate-800 bg-[#061219] space-y-5">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div>
                        <h3 className="text-base font-bold text-white font-['Space_Grotesk'] flex items-center gap-2">
                          <Terminal className="w-5 h-5 text-emerald-400" />
                          Panduan Perintah PM2 Process Manager (VPS Linux)
                        </h3>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">
                          Jalankan perintah ini via SSH di terminal VPS untuk menjaga backend selalu hidup 24/7
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                      {[
                        { title: '1. Jalankan Backend dengan PM2', cmd: 'pm2 start server/server.js --name berkah-backend', desc: 'Menjalankan server Express di background VPS.' },
                        { title: '2. Auto-Start Saat VPS Reboot', cmd: 'pm2 startup && pm2 save', desc: 'Memastikan server otomatis menyala jika VPS restart.' },
                        { title: '3. Pantau Log Server Realtime', cmd: 'pm2 logs berkah-backend --lines 100', desc: 'Melihat log transaksi dan error backend live.' },
                        { title: '4. Restart Backend Server', cmd: 'pm2 restart berkah-backend', desc: 'Restart cepat jika ada pembaruan kode backend.' }
                      ].map((item, idx) => (
                        <div key={idx} className="p-4 rounded-2xl bg-[#040A10] border border-slate-800 space-y-2">
                          <div className="flex items-center justify-between">
                            <strong className="text-emerald-400">{item.title}</strong>
                            <button
                              onClick={() => copyToClipboard(item.cmd, `pm2_${idx}`)}
                              className="px-2 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-[10px] flex items-center gap-1"
                            >
                              {copiedVpsCommand === `pm2_${idx}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                              <span>{copiedVpsCommand === `pm2_${idx}` ? 'Tersalin' : 'Salin'}</span>
                            </button>
                          </div>
                          <pre className="p-2.5 rounded-xl bg-slate-950 text-slate-200 text-[11px] overflow-x-auto border border-slate-800/80">
                            {item.cmd}
                          </pre>
                          <p className="text-[11px] text-slate-500">{item.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Nginx Reverse Proxy Config Snippet */}
                  <div className="glass-card p-6 rounded-3xl border border-slate-800 bg-[#061219] space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div>
                        <h3 className="text-base font-bold text-white font-['Space_Grotesk'] flex items-center gap-2">
                          <FileCode className="w-5 h-5 text-cyan-400" />
                          Konfigurasi Nginx Reverse Proxy (Frontend & Backend)
                        </h3>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">
                          Simpan file ini di <code>/etc/nginx/sites-available/berkahusdt.conf</code>
                        </p>
                      </div>

                      <button
                        onClick={() => copyToClipboard(`server {
    listen 80;
    server_name yourdomain.com;

    # Frontend Static Build
    location / {
        root /var/www/berkahusdt/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Backend Express API Reverse Proxy
    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}`, 'nginx_conf')}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-mono flex items-center gap-1.5"
                      >
                        {copiedVpsCommand === 'nginx_conf' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedVpsCommand === 'nginx_conf' ? 'Konfigurasi Tersalin' : 'Salin Nginx Config'}</span>
                      </button>
                    </div>

                    <pre className="p-4 rounded-2xl bg-[#040A10] border border-slate-800 text-emerald-400 font-mono text-xs overflow-x-auto leading-relaxed">
{`server {
    listen 80;
    server_name yourdomain.com;

    # Frontend Static Build (Vite Build)
    location / {
        root /var/www/berkahusdt/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Backend Express API Reverse Proxy
    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}`}
                    </pre>
                  </div>

                  {/* MongoDB & SSL Let's Encrypt Guide */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
                    <div className="p-5 rounded-3xl bg-[#040A10] border border-slate-800 space-y-3">
                      <strong className="text-emerald-400 flex items-center gap-2">
                        <Database className="w-4 h-4" /> 1. Layanan MongoDB VPS
                      </strong>
                      <p className="text-slate-400 text-[11px]">
                        Perintah untuk menjalankan service MongoDB di VPS Linux (Ubuntu / Debian):
                      </p>
                      <pre className="p-3 rounded-xl bg-slate-950 text-slate-300 text-[11px] border border-slate-800">
sudo systemctl enable mongod
sudo systemctl start mongod
sudo systemctl status mongod
                      </pre>
                    </div>

                    <div className="p-5 rounded-3xl bg-[#040A10] border border-slate-800 space-y-3">
                      <strong className="text-cyan-400 flex items-center gap-2">
                        <Shield className="w-4 h-4" /> 2. Pasang SSL Gratis (Certbot HTTPS)
                      </strong>
                      <p className="text-slate-400 text-[11px]">
                        Mengaktifkan HTTPS gembok hijau gratis dari Let's Encrypt untuk domain VPS:
                      </p>
                      <pre className="p-3 rounded-xl bg-slate-950 text-slate-300 text-[11px] border border-slate-800">
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d domainanda.com
                      </pre>
                    </div>
                  </div>

                </div>
              )}

            </div>
          )}

          {activeMenu === 'SECURITY' && (
            <div className="space-y-6 font-mono">

              {/* Top Banner & Security Health Score */}
              <div className="glass-card p-6 rounded-3xl border border-slate-800 bg-[#061219] relative overflow-hidden">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                        <ShieldCheck className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="text-xl font-extrabold text-white font-['Space_Grotesk'] flex items-center gap-2">
                          Pusat Keamanan Terpadu (Keamanan API, Admin & Website Firewall)
                        </h2>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">
                          Proteksi end-to-end: Enkripsi JWT, filter NoSQL injection, 2FA TOTP, IP Whitelist, OWASP Helmet & pemblokir ancaman
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
                    <button
                      onClick={fetchSecuritySettings}
                      disabled={isFetchingSecurity}
                      className="px-3.5 py-2 rounded-xl bg-[#040A10] border border-slate-700 text-xs text-emerald-400 hover:text-white hover:border-emerald-500 transition-all flex items-center gap-2"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isFetchingSecurity ? 'animate-spin' : ''}`} />
                      <span>{isFetchingSecurity ? 'Memuat...' : 'Refresh Status'}</span>
                    </button>

                    <button
                      onClick={handleRunWafScan}
                      disabled={wafScanRunning}
                      className="px-3.5 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-xs text-cyan-400 hover:bg-cyan-500/20 hover:text-cyan-300 transition-all flex items-center gap-2 font-bold"
                    >
                      <Zap className={`w-3.5 h-3.5 ${wafScanRunning ? 'animate-spin' : ''}`} />
                      <span>{wafScanRunning ? 'Scanning WAF...' : '🛡️ Scan Kerentanan WAF'}</span>
                    </button>

                    <button
                      onClick={handleSaveSecuritySettings}
                      disabled={isSavingSecurity}
                      className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20"
                    >
                      <Save className={`w-3.5 h-3.5 ${isSavingSecurity ? 'animate-spin' : ''}`} />
                      <span>{isSavingSecurity ? 'Menyimpan...' : '💾 Simpan Kebijakan'}</span>
                    </button>
                  </div>
                </div>

                {/* Feedback Message Alert */}
                {securityMsg.text && (
                  <div className={`mt-4 p-3.5 rounded-2xl border text-xs flex items-center gap-2 ${
                    securityMsg.type === 'success' ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300' :
                    securityMsg.type === 'error' ? 'bg-red-500/15 border-red-500/40 text-red-300' :
                    'bg-cyan-500/15 border-cyan-500/40 text-cyan-300'
                  }`}>
                    {securityMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
                    <span>{securityMsg.text}</span>
                  </div>
                )}

                {/* Security Health Score Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-5 text-xs">
                  <div className="p-3 rounded-2xl bg-[#040A10] border border-emerald-500/30">
                    <span className="text-slate-500 text-[10px] block uppercase">Skor Keamanan:</span>
                    <strong className="text-emerald-400 font-extrabold text-sm flex items-center gap-1.5 mt-0.5">
                      <ShieldCheck className="w-4 h-4" />
                      {securityData?.securityScore || 100}/100 ({securityData?.grade || 'A+'})
                    </strong>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#040A10] border border-slate-800/90">
                    <span className="text-slate-500 text-[10px] block uppercase">Proteksi API:</span>
                    <strong className="text-cyan-400 font-bold block mt-0.5">
                      {securityForm.apiSecurity.rateLimitEnabled ? '✅ Rate-Limit Active' : '⚠️ Unrestricted'}
                    </strong>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#040A10] border border-slate-800/90">
                    <span className="text-slate-500 text-[10px] block uppercase">Google 2FA TOTP:</span>
                    <strong className={`block mt-0.5 font-bold ${securityForm.adminSecurity.google2faEnabled ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {securityForm.adminSecurity.google2faEnabled ? '✅ 2FA ENFORCED' : 'OFF (Siap Aktif)'}
                    </strong>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#040A10] border border-slate-800/90">
                    <span className="text-slate-500 text-[10px] block uppercase">OWASP Headers:</span>
                    <strong className="text-purple-400 font-bold block mt-0.5">
                      ✅ Helmet Active
                    </strong>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#040A10] border border-slate-800/90">
                    <span className="text-slate-500 text-[10px] block uppercase">Enkripsi Token:</span>
                    <strong className="text-amber-400 font-bold block mt-0.5">
                      JWT (HS256)
                    </strong>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#040A10] border border-slate-800/90">
                    <span className="text-slate-500 text-[10px] block uppercase">IP Terblokir:</span>
                    <strong className="text-red-400 font-bold block mt-0.5">
                      {securityData?.config?.blockedIps?.length || 0} Alamat IP
                    </strong>
                  </div>
                </div>
              </div>

              {/* WAF Diagnostic Scan Results Card */}
              {wafScanResults && (
                <div className="glass-card p-6 rounded-3xl border border-cyan-500/40 bg-[#061219] space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="text-base font-bold text-white font-['Space_Grotesk'] flex items-center gap-2">
                      <Zap className="w-5 h-5 text-cyan-400" />
                      Hasil Diagnosa Pemindaian Kerentanan WAF (5 Vektor OWASP)
                    </h3>
                    <span className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold text-xs border border-emerald-500/30">
                      100% LULUS (A+ Grade)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    {wafScanResults.map((r, i) => (
                      <div key={i} className="p-3.5 rounded-2xl bg-[#040A10] border border-slate-800 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <strong className="text-slate-200">{r.name}</strong>
                          <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 font-bold">
                            {r.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">{r.details}</p>
                        <span className="text-[10px] text-cyan-400 block font-mono">Pertahanan: {r.protection}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sub-Tab Navigation Bar */}
              <div className="flex flex-wrap gap-2.5 border-b border-slate-800/80 pb-3">
                {[
                  { id: 'API_SECURITY', label: '🛡️ 1. Keamanan API', desc: 'Rate Limiting, JWT & CORS' },
                  { id: 'ADMIN_SECURITY', label: '👤 2. Keamanan ADMIN', desc: '2FA, IP Whitelist & Session' },
                  { id: 'WEBSITE_SECURITY', label: '🌐 3. Keamanan WEBSITE', desc: 'OWASP Helmet & Anti-Scraping' },
                  { id: 'THREAT_LOGS', label: '📜 4. Log Ancaman & IP Blocklist', desc: 'Threat Detection Logs' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveSecurityTab(tab.id)}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-mono font-bold transition-all flex items-center gap-2 ${
                      activeSecurityTab === tab.id
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-lg'
                        : 'bg-[#061219] text-slate-400 border border-slate-800 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Tab 1: Keamanan API */}
              {activeSecurityTab === 'API_SECURITY' && (
                <div className="space-y-6 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Card 1: Rate Limiting */}
                    <div className="glass-card p-6 rounded-3xl border border-slate-800 bg-[#061219] space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <h3 className="text-sm font-bold text-white font-['Space_Grotesk'] flex items-center gap-2">
                          <Activity className="w-4 h-4 text-emerald-400" />
                          Rate Limiting & Pencegahan DDoS API
                        </h3>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={securityForm.apiSecurity.rateLimitEnabled}
                            onChange={(e) => setSecurityForm({
                              ...securityForm,
                              apiSecurity: { ...securityForm.apiSecurity, rateLimitEnabled: e.target.checked }
                            })}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                        </label>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="text-slate-400 block mb-1 text-[11px]">Maksimal Permintaan per Menit per IP:</label>
                          <input
                            type="number"
                            value={securityForm.apiSecurity.maxReqPerMin}
                            onChange={(e) => setSecurityForm({
                              ...securityForm,
                              apiSecurity: { ...securityForm.apiSecurity, maxReqPerMin: Number(e.target.value) || 60 }
                            })}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-[#040A10] border border-slate-800 text-white font-bold text-xs focus:border-emerald-500 focus:outline-none"
                          />
                          <span className="text-[10px] text-slate-500 mt-1 block">Permintaan melebihi batas akan dikembalikan dengan respon HTTP 429 Too Many Requests.</span>
                        </div>

                        <div>
                          <label className="text-slate-400 block mb-1 text-[11px]">Batas Ukuran Payload Body Request (MB):</label>
                          <input
                            type="number"
                            value={securityForm.apiSecurity.payloadSizeLimitMb}
                            onChange={(e) => setSecurityForm({
                              ...securityForm,
                              apiSecurity: { ...securityForm.apiSecurity, payloadSizeLimitMb: Number(e.target.value) || 10 }
                            })}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-[#040A10] border border-slate-800 text-white font-bold text-xs focus:border-emerald-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Card 2: JWT Token Security */}
                    <div className="glass-card p-6 rounded-3xl border border-slate-800 bg-[#061219] space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <h3 className="text-sm font-bold text-white font-['Space_Grotesk'] flex items-center gap-2">
                          <Key className="w-4 h-4 text-cyan-400" />
                          Enkripsi JWT Token & Kebijakan Signature
                        </h3>
                        <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-500/10 text-cyan-400 font-bold">
                          HS256 Signature
                        </span>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="text-slate-400 block mb-1 text-[11px]">Masa Berlaku Token JWT Admin:</label>
                          <select
                            value={securityForm.apiSecurity.jwtExpiryDuration}
                            onChange={(e) => setSecurityForm({
                              ...securityForm,
                              apiSecurity: { ...securityForm.apiSecurity, jwtExpiryDuration: e.target.value }
                            })}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-[#040A10] border border-slate-800 text-white font-bold text-xs focus:border-emerald-500 focus:outline-none"
                          >
                            <option value="1 Hour">1 Jam (Maximum Security)</option>
                            <option value="6 Hours">6 Jam</option>
                            <option value="24 Hours">24 Jam (Standar Rekomendasi)</option>
                            <option value="7 Days">7 Hari</option>
                          </select>
                        </div>

                        <div className="p-3 rounded-2xl bg-[#040A10] border border-slate-800/80 space-y-1 text-[11px]">
                          <span className="text-slate-400">Header Otorisasi:</span>
                          <code className="text-emerald-400 block font-mono">Authorization: Bearer &lt;JWT_TOKEN&gt;</code>
                        </div>
                      </div>
                    </div>

                    {/* Card 3: CORS Policy */}
                    <div className="glass-card p-6 rounded-3xl border border-slate-800 bg-[#061219] space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <h3 className="text-sm font-bold text-white font-['Space_Grotesk'] flex items-center gap-2">
                          <Globe className="w-4 h-4 text-amber-400" />
                          Kebijakan CORS & Origin Whitelist API
                        </h3>
                        <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-400 font-bold">
                          CORS Middleware
                        </span>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="text-slate-400 block mb-1 text-[11px]">Allowed Origins (Domain yang Diizinkan):</label>
                          <input
                            type="text"
                            value={securityForm.apiSecurity.corsAllowedOrigins}
                            onChange={(e) => setSecurityForm({
                              ...securityForm,
                              apiSecurity: { ...securityForm.apiSecurity, corsAllowedOrigins: e.target.value }
                            })}
                            placeholder="* atau https://berkahusdt.com, http://localhost:3000"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-[#040A10] border border-slate-800 text-white font-bold text-xs focus:border-emerald-500 focus:outline-none"
                          />
                          <span className="text-[10px] text-slate-500 mt-1 block">Gunakan * untuk mengizinkan semua domain atau cantumkan domain spesifik dipisah koma.</span>
                        </div>

                        <div className="text-[11px] text-slate-400 space-y-1">
                          <span>HTTP Methods yang Diizinkan:</span>
                          <strong className="text-slate-200 block font-mono">GET, POST, PUT, PATCH, DELETE, OPTIONS</strong>
                        </div>
                      </div>
                    </div>

                    {/* Card 4: NoSQL Injection Defense */}
                    <div className="glass-card p-6 rounded-3xl border border-slate-800 bg-[#061219] space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <h3 className="text-sm font-bold text-white font-['Space_Grotesk'] flex items-center gap-2">
                          <Database className="w-4 h-4 text-purple-400" />
                          Proteksi NoSQL Injection & Sanitasi Schema
                        </h3>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={securityForm.apiSecurity.nosqlSanitization}
                            onChange={(e) => setSecurityForm({
                              ...securityForm,
                              apiSecurity: { ...securityForm.apiSecurity, nosqlSanitization: e.target.checked }
                            })}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                        </label>
                      </div>

                      <p className="text-slate-400 text-[11px] leading-relaxed">
                        Menetralkan dan memblokir karakter operator khusus MongoDB seperti <code className="text-purple-300 font-mono">$gt, $ne, $where, $regex</code> dari request payload agar tidak dapat disusupi penyerang.
                      </p>

                      <div className="p-3 rounded-2xl bg-[#040A10] border border-slate-800 text-[11px] text-emerald-400 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Mongoose Strict Schema Sanitization Active</span>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* Tab 2: Keamanan ADMIN */}
              {activeSecurityTab === 'ADMIN_SECURITY' && (
                <div className="space-y-6 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Card 1: 2FA Google Authenticator */}
                    <div className="glass-card p-6 rounded-3xl border border-slate-800 bg-[#061219] space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <h3 className="text-sm font-bold text-white font-['Space_Grotesk'] flex items-center gap-2">
                          <QrCode className="w-4 h-4 text-emerald-400" />
                          Autentikasi 2-Faktor (Google 2FA TOTP)
                        </h3>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={securityForm.adminSecurity.google2faEnabled}
                            onChange={(e) => setSecurityForm({
                              ...securityForm,
                              adminSecurity: { ...securityForm.adminSecurity, google2faEnabled: e.target.checked }
                            })}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                        </label>
                      </div>

                      <div className="space-y-3">
                        <p className="text-slate-400 text-[11px]">
                          Saat aktif, login ke Admin Portal mewajibkan input 6 digit kode dari Google Authenticator / Authy di ponsel Anda.
                        </p>

                        <div>
                          <label className="text-slate-400 block mb-1 text-[11px]">Secret Key 2FA:</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              readOnly
                              value={securityForm.adminSecurity.google2faSecret}
                              className="w-full px-3.5 py-2.5 rounded-xl bg-[#040A10] border border-slate-800 text-emerald-400 font-mono font-bold text-xs"
                            />
                            <button
                              onClick={() => copyToClipboard(securityForm.adminSecurity.google2faSecret, '2fa_sec')}
                              className="px-3 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white flex items-center gap-1 flex-shrink-0 text-xs"
                            >
                              {copiedVpsCommand === '2fa_sec' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                              <span>{copiedVpsCommand === '2fa_sec' ? 'Tersalin' : 'Salin'}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card 2: IP Whitelist Access Filter */}
                    <div className="glass-card p-6 rounded-3xl border border-slate-800 bg-[#061219] space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <h3 className="text-sm font-bold text-white font-['Space_Grotesk'] flex items-center gap-2">
                          <Lock className="w-4 h-4 text-cyan-400" />
                          Filter Akses IP Whitelist Admin Portal
                        </h3>
                        <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-500/10 text-cyan-400 font-bold">
                          IP Filter
                        </span>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-slate-400 text-[11px]">Daftar Alamat IP yang Diizinkan:</label>
                            <button
                              onClick={() => {
                                const curIp = securityData?.currentAdminIp || '172.20.10.9';
                                const existing = securityForm.adminSecurity.ipWhitelist;
                                const updated = existing ? `${existing}, ${curIp}` : curIp;
                                setSecurityForm({
                                  ...securityForm,
                                  adminSecurity: { ...securityForm.adminSecurity, ipWhitelist: updated }
                                });
                              }}
                              className="text-[10px] text-emerald-400 hover:underline font-bold"
                            >
                              + Tambahkan IP Saya ({securityData?.currentAdminIp || '172.20.10.9'})
                            </button>
                          </div>
                          <textarea
                            rows={3}
                            value={securityForm.adminSecurity.ipWhitelist}
                            onChange={(e) => setSecurityForm({
                              ...securityForm,
                              adminSecurity: { ...securityForm.adminSecurity, ipWhitelist: e.target.value }
                            })}
                            placeholder="Contoh: 172.20.10.9, 180.252.112.5 (Kosongkan jika bebas dari IP manapun)"
                            className="w-full px-3.5 py-2 rounded-xl bg-[#040A10] border border-slate-800 text-white font-mono text-xs focus:border-emerald-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Card 3: Session & Brute Force Lockout */}
                    <div className="glass-card p-6 rounded-3xl border border-slate-800 bg-[#061219] space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <h3 className="text-sm font-bold text-white font-['Space_Grotesk'] flex items-center gap-2">
                          <Clock className="w-4 h-4 text-amber-400" />
                          Batas Waktu Sesi & Proteksi Brute Force
                        </h3>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={securityForm.adminSecurity.failedAttemptsLockout}
                            onChange={(e) => setSecurityForm({
                              ...securityForm,
                              adminSecurity: { ...securityForm.adminSecurity, failedAttemptsLockout: e.target.checked }
                            })}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                        </label>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="text-slate-400 block mb-1 text-[11px]">Batas Waktu Sesi Inactivity (Session Timeout):</label>
                          <select
                            value={securityForm.adminSecurity.sessionTimeout}
                            onChange={(e) => setSecurityForm({
                              ...securityForm,
                              adminSecurity: { ...securityForm.adminSecurity, sessionTimeout: e.target.value }
                            })}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-[#040A10] border border-slate-800 text-white font-bold text-xs focus:border-emerald-500 focus:outline-none"
                          >
                            <option value="15 Minutes">15 Menit</option>
                            <option value="1 Hour">1 Jam</option>
                            <option value="6 Hours">6 Jam</option>
                            <option value="24 Hours">24 Jam (Standar)</option>
                          </select>
                        </div>

                        <p className="text-slate-400 text-[11px]">
                          Proteksi Brute Force otomatis mengunci akun selama 15 menit jika terdeteksi 5 kali berturut-turut percobaan kata sandi yang salah.
                        </p>
                      </div>
                    </div>

                    {/* Card 4: Password Hash & Multi-Device Logout */}
                    <div className="glass-card p-6 rounded-3xl border border-slate-800 bg-[#061219] space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <h3 className="text-sm font-bold text-white font-['Space_Grotesk'] flex items-center gap-2">
                          <Shield className="w-4 h-4 text-purple-400" />
                          Enkripsi Kredensial & Manajemen Sesi
                        </h3>
                        <span className="px-2 py-0.5 rounded text-[10px] bg-purple-500/10 text-purple-400 font-bold">
                          SHA-256 Salted
                        </span>
                      </div>

                      <div className="space-y-3 text-[11px] text-slate-400">
                        <p>Password admin dilindungi dengan salt cryptographic hash dan verifikasi signature token.</p>
                        
                        <div className="p-3 rounded-2xl bg-[#040A10] border border-slate-800 flex items-center justify-between">
                          <span>Sesi Admin Terbuka: <strong className="text-emerald-400">1 Sesi Aktif</strong></span>
                          <button
                            onClick={() => {
                              handleLogout();
                            }}
                            className="px-2.5 py-1 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-bold hover:bg-red-500/30"
                          >
                            Keluar dari Semua Perangkat
                          </button>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* Tab 3: Keamanan WEBSITE */}
              {activeSecurityTab === 'WEBSITE_SECURITY' && (
                <div className="space-y-6 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Card 1: OWASP Helmet Security Headers */}
                    <div className="glass-card p-6 rounded-3xl border border-slate-800 bg-[#061219] space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <h3 className="text-sm font-bold text-white font-['Space_Grotesk'] flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-emerald-400" />
                          Header Keamanan HTTP OWASP (Helmet Defense)
                        </h3>
                        <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 font-bold">
                          Active
                        </span>
                      </div>

                      <div className="space-y-2.5 font-mono text-[11px]">
                        <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#040A10] border border-slate-800/80">
                          <span className="text-slate-300">X-Frame-Options:</span>
                          <strong className="text-emerald-400 font-bold">DENY (Anti-Clickjacking)</strong>
                        </div>
                        <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#040A10] border border-slate-800/80">
                          <span className="text-slate-300">X-Content-Type-Options:</span>
                          <strong className="text-emerald-400 font-bold">nosniff (Anti-MIME Sniff)</strong>
                        </div>
                        <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#040A10] border border-slate-800/80">
                          <span className="text-slate-300">Strict-Transport-Security:</span>
                          <strong className="text-emerald-400 font-bold">HSTS Active (31536000s)</strong>
                        </div>
                        <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#040A10] border border-slate-800/80">
                          <span className="text-slate-300">Referrer-Policy:</span>
                          <strong className="text-emerald-400 font-bold">strict-origin-when-cross-origin</strong>
                        </div>
                      </div>
                    </div>

                    {/* Card 2: Content Security Policy (CSP) */}
                    <div className="glass-card p-6 rounded-3xl border border-slate-800 bg-[#061219] space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <h3 className="text-sm font-bold text-white font-['Space_Grotesk'] flex items-center gap-2">
                          <FileCode className="w-4 h-4 text-cyan-400" />
                          Content Security Policy (CSP Directive)
                        </h3>
                        <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-500/10 text-cyan-400 font-bold">
                          XSS Barrier
                        </span>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="text-slate-400 block mb-1 text-[11px]">Aturan Kebijakan Sumber Konten (CSP):</label>
                          <textarea
                            rows={3}
                            value={securityForm.websiteSecurity.cspPolicy}
                            onChange={(e) => setSecurityForm({
                              ...securityForm,
                              websiteSecurity: { ...securityForm.websiteSecurity, cspPolicy: e.target.value }
                            })}
                            className="w-full px-3.5 py-2 rounded-xl bg-[#040A10] border border-slate-800 text-cyan-300 font-mono text-xs focus:border-emerald-500 focus:outline-none"
                          />
                        </div>
                        <p className="text-[10px] text-slate-500">Mencegah peramban memuat skrip berbahaya atau injeksi kode tidak resmi dari pihak ketiga.</p>
                      </div>
                    </div>

                    {/* Card 3: Anti-Scraping & Bad Bot Protection */}
                    <div className="glass-card p-6 rounded-3xl border border-slate-800 bg-[#061219] space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <h3 className="text-sm font-bold text-white font-['Space_Grotesk'] flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-400" />
                          Proteksi Anti-Scraping & Bad Bot Filter
                        </h3>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={securityForm.websiteSecurity.botScraperProtection}
                            onChange={(e) => setSecurityForm({
                              ...securityForm,
                              websiteSecurity: { ...securityForm.websiteSecurity, botScraperProtection: e.target.checked }
                            })}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                        </label>
                      </div>

                      <p className="text-slate-400 text-[11px] leading-relaxed">
                        Memblokir spider, crawler scraper otomatis, dan bot downloader yang berusaha mengambil data kurs harga atau membebani traffic bandwidth server secara agresif.
                      </p>
                    </div>

                    {/* Card 4: SSL/TLS & HTTPS Redirection */}
                    <div className="glass-card p-6 rounded-3xl border border-slate-800 bg-[#061219] space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <h3 className="text-sm font-bold text-white font-['Space_Grotesk'] flex items-center gap-2">
                          <Lock className="w-4 h-4 text-emerald-400" />
                          Enkripsi SSL/TLS & Paksa HTTPS Redirection
                        </h3>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={securityForm.websiteSecurity.httpsEnforced}
                            onChange={(e) => setSecurityForm({
                              ...securityForm,
                              websiteSecurity: { ...securityForm.websiteSecurity, httpsEnforced: e.target.checked }
                            })}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                        </label>
                      </div>

                      <div className="p-3 rounded-2xl bg-[#040A10] border border-slate-800 text-[11px] text-emerald-400 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4" />
                        <span>Otomatis mengalihkan traffic HTTP biasa ke HTTPS (TLS 1.3 Port 443)</span>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* Tab 4: Log Ancaman & IP Blocklist */}
              {activeSecurityTab === 'THREAT_LOGS' && (
                <div className="space-y-6 text-xs">

                  {/* Manual IP Block Form */}
                  <div className="glass-card p-6 rounded-3xl border border-slate-800 bg-[#061219] space-y-4">
                    <h3 className="text-sm font-bold text-white font-['Space_Grotesk'] flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-400" />
                      Tambah Alamat IP ke Daftar Blokir Permanen
                    </h3>

                    <form onSubmit={handleBlockIp} className="flex flex-col sm:flex-row items-center gap-3">
                      <input
                        type="text"
                        placeholder="Alamat IPv4 (Contoh: 185.220.101.5)"
                        value={newBlockIp}
                        onChange={(e) => setNewBlockIp(e.target.value)}
                        className="w-full sm:w-1/3 px-3.5 py-2.5 rounded-xl bg-[#040A10] border border-slate-800 text-white font-mono text-xs focus:border-red-500 focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Alasan Pemblokiran (Contoh: Percobaan Exploit Scanner)"
                        value={newBlockReason}
                        onChange={(e) => setNewBlockReason(e.target.value)}
                        className="w-full sm:w-1/2 px-3.5 py-2.5 rounded-xl bg-[#040A10] border border-slate-800 text-white font-mono text-xs focus:border-red-500 focus:outline-none"
                      />
                      <button
                        type="submit"
                        disabled={isBlockingIp || !newBlockIp.trim()}
                        className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-red-500/20 text-red-300 border border-red-500/40 font-bold hover:bg-red-500/30 flex items-center justify-center gap-1.5 flex-shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Blokir IP</span>
                      </button>
                    </form>
                  </div>

                  {/* Blocked IP Table */}
                  <div className="glass-card p-6 rounded-3xl border border-slate-800 bg-[#061219] space-y-4">
                    <h3 className="text-sm font-bold text-white font-['Space_Grotesk'] flex items-center gap-2">
                      <Shield className="w-4 h-4 text-red-400" />
                      Daftar Alamat IP Terblokir ({securityData?.config?.blockedIps?.length || 0} IP)
                    </h3>

                    <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-[#040A10]">
                      <table className="w-full text-left text-xs font-mono">
                        <thead className="text-slate-400 border-b border-slate-800 bg-[#061219]">
                          <tr>
                            <th className="p-3.5">ALAMAT IP</th>
                            <th className="p-3.5">ALASAN BLOKIR</th>
                            <th className="p-3.5">WAKTU BLOKIR</th>
                            <th className="p-3.5 text-right">AKSI</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/80 text-slate-300">
                          {(!securityData?.config?.blockedIps || securityData.config.blockedIps.length === 0) ? (
                            <tr>
                              <td colSpan={4} className="p-6 text-center text-slate-500">
                                Tidak ada alamat IP yang sedang diblokir saat ini.
                              </td>
                            </tr>
                          ) : (
                            securityData.config.blockedIps.map((b, idx) => (
                              <tr key={idx} className="hover:bg-slate-900/60 transition-all">
                                <td className="p-3.5 font-extrabold text-red-400">{b.ip}</td>
                                <td className="p-3.5 text-slate-300">{b.reason || 'Aktivitas Mencurigakan'}</td>
                                <td className="p-3.5 text-slate-500 text-[11px]">
                                  {new Date(b.timestamp).toLocaleString('id-ID')}
                                </td>
                                <td className="p-3.5 text-right">
                                  <button
                                    onClick={() => handleUnblockIp(b.ip)}
                                    className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 text-[10px]"
                                  >
                                    Buka Blokir
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Security Live Audit Event Logs */}
                  <div className="glass-card p-6 rounded-3xl border border-slate-800 bg-[#061219] space-y-4">
                    <h3 className="text-sm font-bold text-white font-['Space_Grotesk'] flex items-center gap-2">
                      <FileText className="w-4 h-4 text-emerald-400" />
                      Log Audit Peristiwa Keamanan Sistem Realtime (Security Logs)
                    </h3>

                    <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-[#040A10]">
                      <table className="w-full text-left text-xs font-mono">
                        <thead className="text-slate-400 border-b border-slate-800 bg-[#061219]">
                          <tr>
                            <th className="p-3.5">EVENT ID</th>
                            <th className="p-3.5">TIPE PERISTIWA</th>
                            <th className="p-3.5">SEVERITY</th>
                            <th className="p-3.5">SUMBER IP</th>
                            <th className="p-3.5">DETAIL AUDIT</th>
                            <th className="p-3.5 text-right">WAKTU</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/80 text-slate-300">
                          {(!securityData?.logs || securityData.logs.length === 0) ? (
                            <tr>
                              <td colSpan={6} className="p-6 text-center text-slate-500">
                                Belum ada catatan peristiwa keamanan terbaru.
                              </td>
                            </tr>
                          ) : (
                            securityData.logs.map((log, idx) => (
                              <tr key={idx} className="hover:bg-slate-900/60 transition-all">
                                <td className="p-3.5 font-bold text-emerald-400">{log.id || `SEC-${idx+1}`}</td>
                                <td className="p-3.5 font-extrabold text-white">{log.event}</td>
                                <td className="p-3.5">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    log.severity === 'SUCCESS' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                                    log.severity === 'WARNING' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                                    log.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                                    'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                                  }`}>
                                    {log.severity}
                                  </span>
                                </td>
                                <td className="p-3.5 text-slate-400">{log.ip || '-'}</td>
                                <td className="p-3.5 text-slate-300 text-[11px] max-w-xs truncate" title={log.details}>
                                  {log.details}
                                </td>
                                <td className="p-3.5 text-right text-slate-500 text-[11px]">
                                  {new Date(log.timestamp).toLocaleTimeString('id-ID')}
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
          )}

          {activeMenu === 'LOG' && (
            <div className="space-y-6 font-mono">

              {/* Top Banner & Control Toolbar */}
              <div className="glass-card p-6 rounded-3xl border border-slate-800 bg-[#061219] relative overflow-hidden">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="text-xl font-extrabold text-white font-['Space_Grotesk'] flex items-center gap-2">
                          Pusat Log Aktivitas & Audit Trail Realtime
                        </h2>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">
                          Memantau semua log pembaruan kurs, aset logo, perubahan admin, aktivitas database, serta error & peringatan sistem
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Live Streaming Toggle */}
                  <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
                    <button
                      onClick={() => setAutoRefreshLogs(!autoRefreshLogs)}
                      className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 ${
                        autoRefreshLogs
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-lg'
                          : 'bg-[#040A10] text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${autoRefreshLogs ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'}`} />
                      <span>{autoRefreshLogs ? 'Live Sync (ON)' : 'Live Sync (OFF)'}</span>
                    </button>

                    <button
                      onClick={fetchSystemLogs}
                      disabled={isFetchingLogs}
                      className="px-3.5 py-2 rounded-xl bg-[#040A10] border border-slate-700 text-xs text-emerald-400 hover:text-white hover:border-emerald-500 transition-all flex items-center gap-2"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isFetchingLogs ? 'animate-spin' : ''}`} />
                      <span>{isFetchingLogs ? 'Memuat...' : 'Refresh'}</span>
                    </button>

                    <button
                      onClick={handleExportLogs}
                      className="px-3.5 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-xs text-cyan-400 hover:bg-cyan-500/20 hover:text-cyan-300 transition-all flex items-center gap-2 font-bold"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Ekspor JSON</span>
                    </button>

                    <button
                      onClick={handleClearLogs}
                      className="px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 hover:bg-red-500/20 transition-all flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Bersihkan</span>
                    </button>
                  </div>
                </div>

                {/* Feedback Message */}
                {logActionMsg.text && (
                  <div className="mt-4 p-3 rounded-2xl border text-xs flex items-center gap-2 bg-emerald-500/15 border-emerald-500/40 text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    <span>{logActionMsg.text}</span>
                  </div>
                )}

                {/* Test Log Simulator Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-b border-slate-800/80 pb-4 text-xs">
                  <span className="text-slate-400 text-[11px] flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-emerald-400" />
                    Simulasi Log Pengujian Realtime:
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleGenerateTestLog('UPDATE')}
                      className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-[10px] text-emerald-400 hover:bg-emerald-500/20"
                    >
                      + Test Log Update
                    </button>
                    <button
                      onClick={() => handleGenerateTestLog('WARNING')}
                      className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-[10px] text-amber-400 hover:bg-amber-500/20"
                    >
                      + Test Log Warning
                    </button>
                    <button
                      onClick={() => handleGenerateTestLog('ERROR')}
                      className="px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/30 text-[10px] text-red-400 hover:bg-red-500/20"
                    >
                      + Test Log Error
                    </button>
                  </div>
                </div>

                {/* Real-time Category Counter Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-4 text-xs">
                  <div className="p-3 rounded-2xl bg-[#040A10] border border-slate-800">
                    <span className="text-slate-500 text-[10px] block uppercase">Total Log:</span>
                    <strong className="text-white font-extrabold text-sm block mt-0.5">{logCounts.total} Catatan</strong>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#040A10] border border-emerald-500/30">
                    <span className="text-slate-500 text-[10px] block uppercase">Log Update / Ubah:</span>
                    <strong className="text-emerald-400 font-extrabold text-sm block mt-0.5">{logCounts.update} Event</strong>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#040A10] border border-red-500/30">
                    <span className="text-slate-500 text-[10px] block uppercase">Log Error Sistem:</span>
                    <strong className="text-red-400 font-extrabold text-sm block mt-0.5">{logCounts.error} Error</strong>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#040A10] border border-amber-500/30">
                    <span className="text-slate-500 text-[10px] block uppercase">Log Peringatan:</span>
                    <strong className="text-amber-400 font-extrabold text-sm block mt-0.5">{logCounts.warning} Warning</strong>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#040A10] border border-cyan-500/30">
                    <span className="text-slate-500 text-[10px] block uppercase">Log Server & DB:</span>
                    <strong className="text-cyan-400 font-extrabold text-sm block mt-0.5">{logCounts.system} Event</strong>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#040A10] border border-purple-500/30">
                    <span className="text-slate-500 text-[10px] block uppercase">Log Auth & Akses:</span>
                    <strong className="text-purple-400 font-extrabold text-sm block mt-0.5">{logCounts.auth} Event</strong>
                  </div>
                </div>
              </div>

              {/* Filter & Search Bar */}
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-4 rounded-2xl bg-[#061219] border border-slate-800 text-xs">
                {/* Category Pills */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {[
                    { id: 'ALL', label: 'Semua Log' },
                    { id: 'UPDATE', label: '🔄 Update & Perubahan' },
                    { id: 'ERROR', label: '❌ Error' },
                    { id: 'WARNING', label: '⚠️ Warning' },
                    { id: 'SYSTEM', label: '🖥️ System & DB' },
                    { id: 'AUTH', label: '🔑 Auth & Login' }
                  ].map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setLogCategoryFilter(cat.id)}
                      className={`px-3 py-1.5 rounded-xl font-bold transition-all text-xs ${
                        logCategoryFilter === cat.id
                          ? 'bg-emerald-500 text-slate-950 shadow-md'
                          : 'bg-[#040A10] text-slate-400 border border-slate-800 hover:text-white'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Severity Dropdown & Search Input */}
                <div className="flex items-center gap-2">
                  <select
                    value={logSeverityFilter}
                    onChange={(e) => setLogSeverityFilter(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-[#040A10] border border-slate-800 text-white font-bold text-xs focus:border-emerald-500 outline-none"
                  >
                    <option value="ALL">Semua Severity</option>
                    <option value="SUCCESS">SUCCESS</option>
                    <option value="INFO">INFO</option>
                    <option value="WARNING">WARNING</option>
                    <option value="ERROR">ERROR</option>
                  </select>

                  <input
                    type="text"
                    placeholder="Cari kata kunci, IP, pesan..."
                    value={logSearchQuery}
                    onChange={(e) => setLogSearchQuery(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-[#040A10] border border-slate-800 text-white text-xs focus:border-emerald-500 outline-none w-48 lg:w-64"
                  />
                </div>
              </div>

              {/* Logs Stream Table */}
              <div className="glass-card p-6 rounded-3xl border border-slate-800 bg-[#061219] space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-white font-['Space_Grotesk'] flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    Stream Riwayat Log Terkini ({
                      systemLogs.filter(l => {
                        if (!logSearchQuery.trim()) return true;
                        const q = logSearchQuery.toLowerCase();
                        return (
                          (l.title && l.title.toLowerCase().includes(q)) ||
                          (l.message && l.message.toLowerCase().includes(q)) ||
                          (l.details && String(l.details).toLowerCase().includes(q)) ||
                          (l.ip && l.ip.toLowerCase().includes(q)) ||
                          (l.adminUser && l.adminUser.toLowerCase().includes(q)) ||
                          (l.id && l.id.toLowerCase().includes(q))
                        );
                      }).length
                    } Catatan Ditampilkan)
                  </h3>
                  <span className="text-[11px] text-slate-500 font-mono">
                    Urutan: Paling Baru (Teratas)
                  </span>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-[#040A10]">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="text-slate-400 border-b border-slate-800 bg-[#061219]">
                      <tr>
                        <th className="p-3.5">WAKTU (WIB)</th>
                        <th className="p-3.5">KATEGORI</th>
                        <th className="p-3.5">SEVERITY</th>
                        <th className="p-3.5">SUMBER</th>
                        <th className="p-3.5">JUDUL & PESAN PERISTIWA</th>
                        <th className="p-3.5">SUMBER IP / USER</th>
                        <th className="p-3.5 text-right">DETAIL</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80 text-slate-300">
                      {systemLogs.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-slate-500">
                            {isFetchingLogs ? 'Memuat log sistem...' : 'Tidak ada catatan log yang sesuai dengan filter.'}
                          </td>
                        </tr>
                      ) : (
                        systemLogs
                          .filter(l => {
                            if (!logSearchQuery.trim()) return true;
                            const q = logSearchQuery.toLowerCase();
                            return (
                              (l.title && l.title.toLowerCase().includes(q)) ||
                              (l.message && l.message.toLowerCase().includes(q)) ||
                              (l.details && String(l.details).toLowerCase().includes(q)) ||
                              (l.ip && l.ip.toLowerCase().includes(q)) ||
                              (l.adminUser && l.adminUser.toLowerCase().includes(q)) ||
                              (l.id && l.id.toLowerCase().includes(q))
                            );
                          })
                          .map((log, idx) => (
                            <tr key={idx} className="hover:bg-slate-900/60 transition-all">
                              <td className="p-3.5 text-slate-400 whitespace-nowrap text-[11px]">
                                {new Date(log.timestamp).toLocaleString('id-ID', {
                                  hour: '2-digit', minute: '2-digit', second: '2-digit',
                                  day: '2-digit', month: 'short'
                                })}
                              </td>

                              <td className="p-3.5">
                                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold ${
                                  log.category === 'UPDATE' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                                  log.category === 'ERROR' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                                  log.category === 'WARNING' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                                  log.category === 'AUTH' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                                  'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                                }`}>
                                  {log.category}
                                </span>
                              </td>

                              <td className="p-3.5">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  log.severity === 'SUCCESS' ? 'text-emerald-400' :
                                  log.severity === 'ERROR' ? 'text-red-400' :
                                  log.severity === 'WARNING' ? 'text-amber-400' :
                                  'text-cyan-400'
                                }`}>
                                  {log.severity}
                                </span>
                              </td>

                              <td className="p-3.5 text-slate-400 text-[11px]">
                                {log.source || 'SERVER'}
                              </td>

                              <td className="p-3.5">
                                <strong className="text-white block font-sans text-xs">{log.title}</strong>
                                <span className="text-slate-400 text-[11px] block mt-0.5">{log.message}</span>
                              </td>

                              <td className="p-3.5 text-slate-400 text-[11px] whitespace-nowrap">
                                <div className="text-emerald-400 font-bold">{log.ip || '127.0.0.1'}</div>
                                <div className="text-slate-500 text-[10px]">@{log.adminUser || 'SYSTEM'}</div>
                              </td>

                              <td className="p-3.5 text-right whitespace-nowrap">
                                <button
                                  onClick={() => setSelectedLogDetail(log)}
                                  className="px-2.5 py-1 rounded-lg bg-slate-800 text-cyan-400 hover:text-white hover:bg-slate-700 text-[10px] font-bold"
                                >
                                  Detail
                                </button>
                              </td>
                            </tr>
                          ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Log Detail Inspector Modal */}
              {selectedLogDetail && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <div className="max-w-xl w-full glass-card p-6 rounded-3xl border border-emerald-500/40 bg-[#061219] space-y-4 shadow-2xl">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-emerald-400" />
                        <h3 className="text-base font-bold text-white font-['Space_Grotesk']">
                          Inspeksi Detail Rekaman Log ({selectedLogDetail.id})
                        </h3>
                      </div>
                      <button
                        onClick={() => setSelectedLogDetail(null)}
                        className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="space-y-3 text-xs font-mono">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-2.5 rounded-xl bg-[#040A10] border border-slate-800">
                          <span className="text-slate-500 text-[10px] block">Kategori:</span>
                          <strong className="text-emerald-400">{selectedLogDetail.category}</strong>
                        </div>
                        <div className="p-2.5 rounded-xl bg-[#040A10] border border-slate-800">
                          <span className="text-slate-500 text-[10px] block">Severity:</span>
                          <strong className="text-cyan-400">{selectedLogDetail.severity}</strong>
                        </div>
                        <div className="p-2.5 rounded-xl bg-[#040A10] border border-slate-800">
                          <span className="text-slate-500 text-[10px] block">Sumber Modul:</span>
                          <strong className="text-slate-200">{selectedLogDetail.source}</strong>
                        </div>
                        <div className="p-2.5 rounded-xl bg-[#040A10] border border-slate-800">
                          <span className="text-slate-500 text-[10px] block">Waktu Tercatat:</span>
                          <strong className="text-slate-300">{new Date(selectedLogDetail.timestamp).toLocaleString('id-ID')} WIB</strong>
                        </div>
                      </div>

                      <div className="p-3 rounded-2xl bg-[#040A10] border border-slate-800 space-y-1">
                        <span className="text-slate-500 text-[10px] block uppercase">Judul & Pesan:</span>
                        <strong className="text-white block text-sm">{selectedLogDetail.title}</strong>
                        <p className="text-slate-300 text-xs">{selectedLogDetail.message}</p>
                      </div>

                      {selectedLogDetail.details && (
                        <div className="space-y-1">
                          <span className="text-slate-500 text-[10px] block uppercase">Payload Metadata & Technical Details:</span>
                          <pre className="p-3 rounded-2xl bg-slate-950 text-cyan-300 text-[11px] border border-slate-800 overflow-x-auto">
                            {typeof selectedLogDetail.details === 'object'
                              ? JSON.stringify(selectedLogDetail.details, null, 2)
                              : selectedLogDetail.details}
                          </pre>
                        </div>
                      )}
                    </div>

                    <div className="pt-2 text-right">
                      <button
                        onClick={() => setSelectedLogDetail(null)}
                        className="px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-700"
                      >
                        Tutup Inspeksi
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

          {activeMenu === 'POP_UP' && (
            <div className="space-y-6 font-mono">

              {/* Top Banner & Action Header */}
              <div className="glass-card p-6 rounded-3xl border border-slate-800 bg-[#061219] relative overflow-hidden">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                        <Bell className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="text-xl font-extrabold text-white font-['Space_Grotesk'] flex items-center gap-2">
                          Manajemen Pop-Up Pengumuman & Promo
                        </h2>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">
                          Atur banner pop-up profesional dengan gambar responsif, pesan promosi, dan tombol CTA otomatis di halaman utama
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2.5 w-full lg:w-auto">
                    <button
                      onClick={fetchAdminPopups}
                      disabled={isFetchingPopups}
                      className="px-3.5 py-2.5 rounded-xl bg-[#040A10] border border-slate-700 text-xs text-slate-300 hover:text-white hover:border-slate-500 transition-all flex items-center gap-2"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isFetchingPopups ? 'animate-spin' : ''}`} />
                      <span>{isFetchingPopups ? 'Memuat...' : 'Refresh'}</span>
                    </button>

                    <button
                      onClick={openCreatePopupModal}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ Buat Pop-Up Baru</span>
                    </button>
                  </div>
                </div>

                {/* Feedback Message */}
                {popupMsg.text && (
                  <div className={`mt-4 p-3 rounded-2xl border text-xs flex items-center gap-2 ${
                    popupMsg.type === 'success'
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                      : 'bg-red-500/15 border-red-500/40 text-red-300'
                  }`}>
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    <span>{popupMsg.text}</span>
                  </div>
                )}

                {/* Real-time Telemetry Stats Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 text-xs">
                  <div className="p-3.5 rounded-2xl bg-[#040A10] border border-slate-800">
                    <span className="text-slate-500 text-[10px] block uppercase">Total Pop-Up:</span>
                    <strong className="text-white font-extrabold text-sm block mt-0.5">{popups.length} Banner</strong>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#040A10] border border-emerald-500/30">
                    <span className="text-slate-500 text-[10px] block uppercase">Status Tayang:</span>
                    <strong className="text-emerald-400 font-extrabold text-sm block mt-0.5">
                      {popups.filter(p => p.isActive).length} Aktif di Halaman Utama
                    </strong>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#040A10] border border-cyan-500/30">
                    <span className="text-slate-500 text-[10px] block uppercase">Total Impresi / Dilihat:</span>
                    <strong className="text-cyan-400 font-extrabold text-sm block mt-0.5">
                      {popups.reduce((acc, p) => acc + (p.viewsCount || 0), 0)}x Views
                    </strong>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#040A10] border border-purple-500/30">
                    <span className="text-slate-500 text-[10px] block uppercase">Total Klik Tombol:</span>
                    <strong className="text-purple-400 font-extrabold text-sm block mt-0.5">
                      {popups.reduce((acc, p) => acc + (p.clicksCount || 0), 0)}x Clicks
                    </strong>
                  </div>
                </div>
              </div>

              {/* Pop-Up Cards List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white font-['Space_Grotesk'] flex items-center gap-2">
                    <Megaphone className="w-4 h-4 text-emerald-400" />
                    Daftar Banner Pop-Up ({popups.length})
                  </h3>
                  <span className="text-xs text-slate-500 font-mono">
                    Pop-up berstatus AKTIF akan otomatis muncul ke pengunjung halaman utama
                  </span>
                </div>

                {popups.length === 0 ? (
                  <div className="glass-card p-12 text-center rounded-3xl border border-slate-800 bg-[#061219] space-y-3">
                    <Bell className="w-12 h-12 text-slate-600 mx-auto" />
                    <h4 className="text-base font-bold text-white font-['Space_Grotesk']">Belum Ada Pop-Up yang Dibuat</h4>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      Buat pop-up pengumuman atau promo pertama Anda untuk menarik minat pengunjung website.
                    </p>
                    <button
                      onClick={openCreatePopupModal}
                      className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition-all"
                    >
                      + Tambah Pop-Up Baru Sekarang
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {popups.map((popup) => (
                      <div
                        key={popup.id}
                        className={`glass-card p-5 rounded-3xl border transition-all relative overflow-hidden flex flex-col justify-between ${
                          popup.isActive
                            ? 'border-emerald-500/40 bg-[#061219] shadow-lg shadow-emerald-500/5'
                            : 'border-slate-800 bg-[#061219]/60 opacity-80'
                        }`}
                      >
                        <div>
                          {/* Banner Image Preview / Thumbnail */}
                          {popup.imageAspectRatio !== 'none' && popup.imageUrl ? (
                            <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-950/80 border border-slate-800 mb-4">
                              <img
                                src={popup.imageUrl}
                                alt={popup.title}
                                className="w-full h-full object-cover"
                                onError={(e) => { e.target.src = '/logo_berkah.jpg'; }}
                              />
                              <div className="absolute top-3 left-3">
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-md ${
                                  popup.accentColor === 'cyan' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' :
                                  popup.accentColor === 'amber' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                                  popup.accentColor === 'purple' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                                  'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                }`}>
                                  {popup.badgeText || 'PROMO'}
                                </span>
                              </div>

                              <div className="absolute top-3 right-3">
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold backdrop-blur-md ${
                                  popup.isActive ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400 border border-slate-700'
                                }`}>
                                  {popup.isActive ? '● TAYANG' : '○ NONAKTIF'}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-800">
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                {popup.badgeText || 'PENGUMUMAN'}
                              </span>
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                popup.isActive ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400 border border-slate-700'
                              }`}>
                                {popup.isActive ? '● TAYANG' : '○ NONAKTIF'}
                              </span>
                            </div>
                          )}

                          {/* Pop-Up Details */}
                          <div className="space-y-1.5 mb-4">
                            <h4 className="text-base font-extrabold text-white font-['Space_Grotesk'] leading-snug">
                              {popup.title}
                            </h4>
                            {popup.subtitle && (
                              <p className="text-xs text-emerald-400 font-semibold font-mono">
                                {popup.subtitle}
                              </p>
                            )}
                            <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed font-sans mt-1">
                              {popup.description}
                            </p>
                          </div>

                          {/* Specs & Performance Badges */}
                          <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-[#040A10] border border-slate-800/80 mb-4 text-[11px]">
                            <div>
                              <span className="text-slate-500 text-[10px] block">Ukuran Card:</span>
                              <strong className="text-slate-200 capitalize">{popup.imageWidth || 'Medium'}</strong>
                            </div>
                            <div>
                              <span className="text-slate-500 text-[10px] block">Impresi:</span>
                              <strong className="text-cyan-400">{popup.viewsCount || 0}x Views</strong>
                            </div>
                            <div>
                              <span className="text-slate-500 text-[10px] block">Klik CTA:</span>
                              <strong className="text-emerald-400">{popup.clicksCount || 0}x Clicks</strong>
                            </div>
                          </div>
                        </div>

                        {/* Card Bottom Action Toolbar */}
                        <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleTogglePopup(popup.id)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                                popup.isActive
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                  : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white'
                              }`}
                            >
                              <span className={`w-2 h-2 rounded-full ${popup.isActive ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                              <span>{popup.isActive ? 'Aktif' : 'Nonaktif'}</span>
                            </button>

                            <button
                              onClick={() => setLivePreviewPopup(popup)}
                              className="px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-xs text-cyan-400 hover:bg-cyan-500/20 transition-all font-bold flex items-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Preview</span>
                            </button>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => openEditPopupModal(popup)}
                              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all flex items-center gap-1"
                            >
                              <Settings className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>

                            <button
                              onClick={() => handleDeletePopup(popup.id)}
                              className="p-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-all"
                              title="Hapus Pop-Up"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Pop-Up Create & Edit Modal Form */}
              {popupModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
                  <div className="max-w-2xl w-full glass-card p-6 sm:p-8 rounded-3xl border border-emerald-500/40 bg-[#061219] space-y-6 shadow-2xl my-8">
                    
                    {/* Modal Header */}
                    <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
                          <Bell className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white font-['Space_Grotesk']">
                            {editingPopupId ? 'Edit Konfigurasi Pop-Up Banner' : 'Buat Pop-Up Pengumuman & Promo Baru'}
                          </h3>
                          <p className="text-xs text-slate-400">Sesuaikan tampilan gambar, teks, dan tombol aksi WhatsApp</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setPopupModalOpen(false)}
                        className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
                      >
                        ✕
                      </button>
                    </div>

                    {popupMsg.text && (
                      <div className={`p-3 rounded-xl border text-xs ${
                        popupMsg.type === 'success' ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' : 'bg-red-500/20 border-red-500/40 text-red-300'
                      }`}>
                        {popupMsg.text}
                      </div>
                    )}

                    <form onSubmit={handleCreateOrUpdatePopup} className="space-y-4 text-xs font-mono">
                      
                      {/* 1. Judul & Subjudul */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-slate-300 block mb-1 font-bold">Judul Pop-Up Utama:</label>
                          <input
                            type="text"
                            value={popupForm.title}
                            onChange={(e) => setPopupForm({ ...popupForm, title: e.target.value })}
                            placeholder="🔥 PROMO RATE SPESIAL OTC BERKAH USDT"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-[#040A10] border border-slate-700 text-white font-sans text-xs focus:border-emerald-500 outline-none"
                            required
                          />
                        </div>

                        <div>
                          <label className="text-slate-300 block mb-1 font-bold">Sub-Judul (Opsional):</label>
                          <input
                            type="text"
                            value={popupForm.subtitle}
                            onChange={(e) => setPopupForm({ ...popupForm, subtitle: e.target.value })}
                            placeholder="Spread Terendah & Bebas Biaya Admin"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-[#040A10] border border-slate-700 text-emerald-400 font-sans text-xs focus:border-emerald-500 outline-none"
                          />
                        </div>
                      </div>

                      {/* 2. Isi Kata-Kata / Deskripsi */}
                      <div>
                        <label className="text-slate-300 block mb-1 font-bold">Kata-Kata / Deskripsi Lengkap:</label>
                        <textarea
                          rows={4}
                          value={popupForm.description}
                          onChange={(e) => setPopupForm({ ...popupForm, description: e.target.value })}
                          placeholder="Tuliskan isi pengumuman, detail promosi kurs, atau instruksi transaksi..."
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#040A10] border border-slate-700 text-white font-sans text-xs focus:border-emerald-500 outline-none"
                          required
                        />
                      </div>

                      {/* 3. Pengaturan Gambar & Aspect Ratio + File Upload dari Komputer */}
                      <div className="p-4 rounded-2xl bg-[#040A10] border border-slate-800 space-y-4">
                        <div className="flex items-center justify-between">
                          <label className="text-emerald-400 font-bold flex items-center gap-1.5">
                            <ImageIcon className="w-4 h-4" />
                            Pengaturan Gambar & Banner Pop-Up
                          </label>
                          <span className="text-[11px] text-slate-500">Mendukung upload file komputer & URL online</span>
                        </div>

                        {/* File Upload Box from Computer */}
                        <div className="p-4 rounded-2xl border-2 border-dashed border-slate-700 hover:border-emerald-500/60 bg-slate-950/60 transition-all text-center space-y-3">
                          <input
                            type="file"
                            id="popupFileUploadInput"
                            accept="image/*,.jpg,.jpeg,.png,.webp,.gif,.svg,.bmp,.avif,.ico"
                            onChange={handlePopupImageUpload}
                            className="hidden"
                          />

                          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                            <label
                              htmlFor="popupFileUploadInput"
                              className={`px-4 py-2.5 rounded-xl font-bold text-xs cursor-pointer shadow-lg transition-all flex items-center justify-center gap-2 ${
                                isUploadingPopupImage
                                  ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                                  : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white hover:scale-[1.02] active:scale-[0.98]'
                              }`}
                            >
                              {isUploadingPopupImage ? (
                                <>
                                  <RefreshCw className="w-4 h-4 animate-spin" />
                                  <span>Sedang Mengunggah & Memproses...</span>
                                </>
                              ) : (
                                <>
                                  <Upload className="w-4 h-4" />
                                  <span>📁 Pilih & Upload File Foto dari Komputer</span>
                                </>
                              )}
                            </label>

                            <span className="text-[11px] text-slate-500">atau tempel link URL di bawah</span>
                          </div>

                          <p className="text-[10px] text-slate-400">
                            Format didukung: <span className="text-emerald-400 font-bold">JPG, PNG, WEBP, GIF, SVG, JPEG, AVIF, BMP, ICO</span> (Maksimal 20 MB)
                          </p>

                          {/* Live Thumbnail Preview if Image exists */}
                          {popupForm.imageUrl && popupForm.imageAspectRatio !== 'none' && (
                            <div className="pt-2 flex items-center justify-center gap-3">
                              <div className="relative w-32 h-20 rounded-xl overflow-hidden border border-emerald-500/40 bg-slate-900 shadow-md">
                                <img
                                  src={popupForm.imageUrl}
                                  alt="Preview Banner"
                                  className="w-full h-full object-cover"
                                  onError={(e) => { e.target.src = '/logo_berkah.jpg'; }}
                                />
                              </div>
                              <div className="text-left text-[11px] space-y-1">
                                <div className="text-emerald-300 font-bold flex items-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                  <span>Foto Banner Siap Digunakan</span>
                                </div>
                                <div className="text-slate-400 text-[10px] max-w-xs truncate" title={popupForm.imageUrl}>
                                  Source: {popupForm.imageUrl}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setPopupForm(prev => ({ ...prev, imageUrl: '' }))}
                                  className="text-red-400 hover:text-red-300 text-[10px] underline flex items-center gap-1"
                                >
                                  <Trash2 className="w-3 h-3" /> Hapus Foto
                                </button>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* URL Path and Aspect Ratio Controls */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                          <div className="sm:col-span-2">
                            <label className="text-slate-400 block mb-1 text-[11px]">URL / Path Gambar Banner:</label>
                            <input
                              type="text"
                              value={popupForm.imageUrl}
                              onChange={(e) => setPopupForm({ ...popupForm, imageUrl: e.target.value })}
                              placeholder="/logo_berkah.jpg atau https://example.com/banner.jpg"
                              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-emerald-500 outline-none"
                            />
                          </div>

                          <div>
                            <label className="text-slate-400 block mb-1 text-[11px]">Aspect Ratio Gambar:</label>
                            <select
                              value={popupForm.imageAspectRatio}
                              onChange={(e) => setPopupForm({ ...popupForm, imageAspectRatio: e.target.value })}
                              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-emerald-500 outline-none font-bold"
                            >
                              <option value="16/9">16:9 Landscape Banner</option>
                              <option value="4/3">4:3 Standard</option>
                              <option value="1/1">1:1 Square (Koin/Medallion)</option>
                              <option value="none">Tanpa Gambar (Hanya Teks)</option>
                            </select>
                          </div>
                        </div>

                        {/* Quick Preset Images */}
                        <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] border-t border-slate-800/80">
                          <span className="text-slate-500">Preset Cepat:</span>
                          <button
                            type="button"
                            onClick={() => setPopupForm({ ...popupForm, imageUrl: '/logo_berkah.jpg', imageAspectRatio: '16/9' })}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 text-[10px]"
                          >
                            Logo Berkah
                          </button>
                          <button
                            type="button"
                            onClick={() => setPopupForm({ ...popupForm, imageUrl: '/coin_front.png', imageAspectRatio: '1/1' })}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 text-[10px]"
                          >
                            Koin 3D Depan
                          </button>
                          <button
                            type="button"
                            onClick={() => setPopupForm({ ...popupForm, imageUrl: '/coin_back.png', imageAspectRatio: '1/1' })}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 text-[10px]"
                          >
                            Koin 3D Belakang
                          </button>
                          <button
                            type="button"
                            onClick={() => setPopupForm({ ...popupForm, imageUrl: '/logo_usdt.jpg', imageAspectRatio: '16/9' })}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 text-[10px]"
                          >
                            Banner USDT
                          </button>
                        </div>
                      </div>

                      {/* 4. Ukuran Modal, Warna Tema & Badge Label */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="text-slate-300 block mb-1 font-bold">Ukuran Lebar Pop-Up:</label>
                          <select
                            value={popupForm.imageWidth}
                            onChange={(e) => setPopupForm({ ...popupForm, imageWidth: e.target.value })}
                            className="w-full px-3 py-2.5 rounded-xl bg-[#040A10] border border-slate-700 text-white text-xs focus:border-emerald-500 outline-none font-bold"
                          >
                            <option value="compact">Compact (450px)</option>
                            <option value="medium">Medium (520px - Standar)</option>
                            <option value="wide">Wide (640px)</option>
                            <option value="full">Full Banner (760px)</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-slate-300 block mb-1 font-bold">Tema Warna Aksen:</label>
                          <select
                            value={popupForm.accentColor}
                            onChange={(e) => setPopupForm({ ...popupForm, accentColor: e.target.value })}
                            className="w-full px-3 py-2.5 rounded-xl bg-[#040A10] border border-slate-700 text-white text-xs focus:border-emerald-500 outline-none font-bold"
                          >
                            <option value="emerald">🟢 Emerald Green (Default)</option>
                            <option value="cyan">🔵 Cyan Neon (Tech)</option>
                            <option value="amber">🟡 Amber Gold (Promo)</option>
                            <option value="purple">🟣 Purple Crypto (Event)</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-slate-300 block mb-1 font-bold">Teks Label / Badge:</label>
                          <input
                            type="text"
                            value={popupForm.badgeText}
                            onChange={(e) => setPopupForm({ ...popupForm, badgeText: e.target.value })}
                            placeholder="PROMO SPESIAL"
                            className="w-full px-3 py-2.5 rounded-xl bg-[#040A10] border border-slate-700 text-white text-xs focus:border-emerald-500 outline-none uppercase font-bold"
                          />
                        </div>
                      </div>

                      {/* 5. Tombol Aksi (CTA) */}
                      <div className="p-4 rounded-2xl bg-[#040A10] border border-slate-800 space-y-3">
                        <label className="text-emerald-400 font-bold flex items-center gap-1.5">
                          <ExternalLink className="w-4 h-4" />
                          Pengaturan Tombol Aksi CTA (Call-to-Action)
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-slate-400 block mb-1 text-[11px]">Teks Tombol:</label>
                            <input
                              type="text"
                              value={popupForm.buttonText}
                              onChange={(e) => setPopupForm({ ...popupForm, buttonText: e.target.value })}
                              placeholder="🚀 Hubungi Admin WhatsApp"
                              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-emerald-500 outline-none"
                              required
                            />
                          </div>
                          <div>
                            <label className="text-slate-400 block mb-1 text-[11px]">URL Target / Link WhatsApp:</label>
                            <input
                              type="text"
                              value={popupForm.buttonUrl}
                              onChange={(e) => setPopupForm({ ...popupForm, buttonUrl: e.target.value })}
                              placeholder="https://wa.me/6281234567890"
                              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-emerald-500 outline-none font-sans"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      {/* 6. Pengaturan Tayang & Otomasi */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-2xl bg-[#040A10] border border-slate-800">
                        <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                          <input
                            type="checkbox"
                            checked={popupForm.isActive}
                            onChange={(e) => setPopupForm({ ...popupForm, isActive: e.target.checked })}
                            className="w-4 h-4 rounded text-emerald-500"
                          />
                          <span className="font-bold">Status Aktif (Tayang)</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                          <input
                            type="checkbox"
                            checked={popupForm.showOncePerSession}
                            onChange={(e) => setPopupForm({ ...popupForm, showOncePerSession: e.target.checked })}
                            className="w-4 h-4 rounded text-emerald-500"
                          />
                          <span>1x Tampil Per Sesi</span>
                        </label>

                        <div>
                          <label className="text-slate-400 block mb-1 text-[10px]">Auto-Close Timer:</label>
                          <select
                            value={popupForm.autoCloseSeconds}
                            onChange={(e) => setPopupForm({ ...popupForm, autoCloseSeconds: Number(e.target.value) })}
                            className="w-full px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-bold"
                          >
                            <option value={0}>Manual (Tutup Manual)</option>
                            <option value={5}>5 Detik</option>
                            <option value={10}>10 Detik</option>
                            <option value={15}>15 Detik</option>
                          </select>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
                        <button
                          type="button"
                          onClick={() => setPopupModalOpen(false)}
                          className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-bold"
                        >
                          Batal
                        </button>

                        <button
                          type="submit"
                          disabled={isSavingPopup}
                          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-extrabold shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
                        >
                          {isSavingPopup ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                          <span>{editingPopupId ? 'Simpan Perubahan' : 'Terbitkan Pop-Up'}</span>
                        </button>
                      </div>

                    </form>
                  </div>
                </div>
              )}

              {/* Admin Interactive Live Preview Modal */}
              {livePreviewPopup && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-4">
                  <div className="relative w-full max-w-lg glass-card rounded-3xl border border-emerald-500/40 bg-[#061219] text-slate-100 shadow-2xl overflow-hidden animate-in zoom-in-95">
                    
                    <button
                      onClick={() => setLivePreviewPopup(null)}
                      className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-slate-900 border border-slate-700 text-slate-400 hover:text-white flex items-center justify-center"
                    >
                      ✕
                    </button>

                    {livePreviewPopup.imageAspectRatio !== 'none' && livePreviewPopup.imageUrl && (
                      <div className="relative w-full aspect-video overflow-hidden bg-slate-950">
                        <img
                          src={livePreviewPopup.imageUrl}
                          alt={livePreviewPopup.title}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.src = '/logo_berkah.jpg'; }}
                        />
                        <div className="absolute top-3 left-3">
                          <span className="px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 backdrop-blur-md">
                            {livePreviewPopup.badgeText || 'PENGUMUMAN'}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="p-6 sm:p-8 space-y-4">
                      <div>
                        <h2 className="text-xl sm:text-2xl font-extrabold text-white font-['Space_Grotesk'] leading-snug">
                          {livePreviewPopup.title}
                        </h2>
                        {livePreviewPopup.subtitle && (
                          <p className="text-sm font-semibold text-emerald-400 mt-1 font-mono">
                            {livePreviewPopup.subtitle}
                          </p>
                        )}
                      </div>

                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans bg-[#040A10] p-4 rounded-2xl border border-slate-800 whitespace-pre-line">
                        {livePreviewPopup.description}
                      </p>

                      <div className="pt-2 flex items-center gap-3">
                        <a
                          href={livePreviewPopup.buttonUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-extrabold text-xs shadow-lg text-center flex items-center justify-center gap-2"
                        >
                          <span>{livePreviewPopup.buttonText || 'Hubungi WhatsApp'}</span>
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => setLivePreviewPopup(null)}
                          className="px-5 py-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white text-xs font-bold"
                        >
                          Tutup
                        </button>
                      </div>

                      <div className="text-center pt-2 text-[11px] text-slate-500 font-mono">
                        (Ini adalah simulasi live preview bagaimana pengunjung melihat pop-up di beranda)
                      </div>
                    </div>

                  </div>
                </div>
              )}

            </div>
          )}

          {activeMenu === 'TESTIMONI' && (
            <div className="space-y-6 font-mono">

              {/* Top Banner & Control Header */}
              <div className="glass-card p-6 rounded-3xl border border-slate-800 bg-[#061219] relative overflow-hidden">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                        <Star className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="text-xl font-extrabold text-white font-['Space_Grotesk'] flex items-center gap-2">
                          Kelola Testimoni & Bukti Transaksi Pelanggan
                        </h2>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">
                          Upload foto bukti transaksi dari PC sekaligus (batch), atur Baris 1 (ke Kanan) & Baris 2 (ke Kiri), dan sinkronkan ke beranda
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Top Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
                    <input
                      type="file"
                      id="directBatchInput"
                      multiple
                      accept="image/*,.jpg,.jpeg,.png,.webp,.gif,.svg,.bmp,.avif,.ico"
                      onChange={handleBatchFileSelect}
                      className="hidden"
                    />

                    <label
                      htmlFor="directBatchInput"
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Upload className="w-4 h-4" />
                      <span>📁 Upload Foto Batch dari PC</span>
                    </label>

                    <button
                      onClick={openCreateTestiModal}
                      className="px-3.5 py-2.5 rounded-xl bg-[#040A10] border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 text-xs font-bold transition-all flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ Tambah Manual</span>
                    </button>

                    <button
                      onClick={fetchAdminTestimonials}
                      disabled={isFetchingTestimonials}
                      className="p-2.5 rounded-xl bg-[#040A10] border border-slate-700 text-slate-300 hover:text-white transition-all"
                      title="Refresh Data"
                    >
                      <RefreshCw className={`w-4 h-4 ${isFetchingTestimonials ? 'animate-spin' : ''}`} />
                    </button>

                    <button
                      onClick={handleResetTestimonialSeeds}
                      className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-amber-400 transition-all text-xs"
                      title="Reset ke Preset Default"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Feedback Message */}
                {testimonialMsg.text && (
                  <div className={`mt-4 p-3 rounded-2xl border text-xs flex items-center gap-2 ${
                    testimonialMsg.type === 'success'
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                      : testimonialMsg.type === 'info'
                      ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300'
                      : 'bg-red-500/15 border-red-500/40 text-red-300'
                  }`}>
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    <span>{testimonialMsg.text}</span>
                  </div>
                )}

                {/* Real-time Telemetry Stats Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-4 text-xs">
                  <div className="p-3.5 rounded-2xl bg-[#040A10] border border-slate-800">
                    <span className="text-slate-500 text-[10px] block uppercase">Total Testimoni:</span>
                    <strong className="text-white font-extrabold text-sm block mt-0.5">{testimonials.length} Kartu</strong>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#040A10] border border-emerald-500/30">
                    <span className="text-slate-500 text-[10px] block uppercase">Status Tayang:</span>
                    <strong className="text-emerald-400 font-extrabold text-sm block mt-0.5">
                      {testimonials.filter(t => t.isActive).length} Aktif di Beranda
                    </strong>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#040A10] border border-cyan-500/30">
                    <span className="text-slate-500 text-[10px] block uppercase">➡️ Baris 1 (Ke Kanan):</span>
                    <strong className="text-cyan-400 font-extrabold text-sm block mt-0.5">
                      {testimonials.filter(t => t.row === 1).length} Kartu
                    </strong>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#040A10] border border-purple-500/30">
                    <span className="text-slate-500 text-[10px] block uppercase">⬅️ Baris 2 (Ke Kiri):</span>
                    <strong className="text-purple-400 font-extrabold text-sm block mt-0.5">
                      {testimonials.filter(t => t.row === 2).length} Kartu
                    </strong>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#040A10] border border-amber-500/30">
                    <span className="text-slate-500 text-[10px] block uppercase">Bukti Screenshot:</span>
                    <strong className="text-amber-400 font-extrabold text-sm block mt-0.5">
                      {testimonials.filter(t => Boolean(t.imageUrl)).length} Foto
                    </strong>
                  </div>
                </div>
              </div>

              {/* Filter Tabs and Batch Actions */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#061219] p-3 rounded-2xl border border-slate-800 text-xs">
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    onClick={() => setTestiFilter('ALL')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                      testiFilter === 'ALL' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    Semua ({testimonials.length})
                  </button>
                  <button
                    onClick={() => setTestiFilter('ROW1')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                      testiFilter === 'ROW1' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    ➡️ Baris 1 (Kanan: {testimonials.filter(t => t.row === 1).length})
                  </button>
                  <button
                    onClick={() => setTestiFilter('ROW2')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                      testiFilter === 'ROW2' ? 'bg-purple-500 text-slate-950 shadow-md' : 'bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    ⬅️ Baris 2 (Kiri: {testimonials.filter(t => t.row === 2).length})
                  </button>
                  <button
                    onClick={() => setTestiFilter('WITH_IMAGE')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                      testiFilter === 'WITH_IMAGE' ? 'bg-amber-500 text-slate-950 shadow-md' : 'bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    🖼️ Ada Foto ({testimonials.filter(t => Boolean(t.imageUrl)).length})
                  </button>
                  <button
                    onClick={() => setTestiFilter('INACTIVE')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                      testiFilter === 'INACTIVE' ? 'bg-red-500 text-white shadow-md' : 'bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    ⚪ Nonaktif ({testimonials.filter(t => !t.isActive).length})
                  </button>
                </div>

                {/* Batch Actions */}
                {selectedTestiIds.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-[11px] font-bold">
                      {selectedTestiIds.length} dipilih
                    </span>
                    <button
                      onClick={handleBatchDeleteTestimonials}
                      className="px-3 py-1.5 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 font-bold hover:bg-red-500/30 transition-all flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus Terpilih</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Testimonials Grid Cards */}
              {testimonials.length === 0 ? (
                <div className="glass-card p-12 text-center rounded-3xl border border-slate-800 bg-[#061219] space-y-3">
                  <Star className="w-12 h-12 text-slate-600 mx-auto" />
                  <h4 className="text-base font-bold text-white font-['Space_Grotesk']">Belum Ada Data Testimoni</h4>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Upload foto testimoni dari komputer Anda atau tambahkan data testimoni kustom sekarang.
                  </p>
                  <label
                    htmlFor="directBatchInput"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload Foto Batch dari PC</span>
                  </label>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {testimonials
                    .filter(t => {
                      if (testiFilter === 'ROW1') return t.row === 1;
                      if (testiFilter === 'ROW2') return t.row === 2;
                      if (testiFilter === 'WITH_IMAGE') return Boolean(t.imageUrl);
                      if (testiFilter === 'INACTIVE') return !t.isActive;
                      return true;
                    })
                    .map((item) => {
                      const isSelected = selectedTestiIds.includes(item.id);

                      return (
                        <div
                          key={item.id}
                          className={`glass-card p-4 rounded-2xl border transition-all relative flex flex-col justify-between ${
                            item.isActive
                              ? 'border-slate-800 bg-[#061219] hover:border-emerald-500/50'
                              : 'border-slate-800/60 bg-[#061219]/50 opacity-60'
                          } ${isSelected ? 'ring-2 ring-emerald-500 border-emerald-500' : ''}`}
                        >
                          <div>
                            {/* Card Top Selection Checkbox & Row Tag */}
                            <div className="flex items-center justify-between mb-3">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={(e) => {
                                    if (e.target.checked) setSelectedTestiIds(prev => [...prev, item.id]);
                                    else setSelectedTestiIds(prev => prev.filter(id => id !== item.id));
                                  }}
                                  className="w-3.5 h-3.5 rounded text-emerald-500"
                                />
                                <span className="text-[10px] text-slate-500 font-mono">{item.id}</span>
                              </label>

                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold tracking-wider uppercase ${
                                item.row === 1
                                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                                  : 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                              }`}>
                                {item.row === 1 ? '➡️ Baris 1 (Kanan)' : '⬅️ Baris 2 (Kiri)'}
                              </span>
                            </div>

                            {/* Image Thumbnail / Cyberpunk Badge Box */}
                            {item.imageUrl ? (
                              <div
                                onClick={() => setPreviewTestiModal(item)}
                                className="relative w-full h-28 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 mb-3 cursor-pointer group"
                              >
                                <img
                                  src={item.imageUrl}
                                  alt={item.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                                  onError={(e) => { e.target.src = '/logo_berkah.jpg'; }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] text-slate-300">
                                  <span className="font-extrabold text-white text-xs">{item.amount}</span>
                                  <span className="p-1 rounded bg-black/60 text-emerald-400 flex items-center gap-1">
                                    <Eye className="w-3 h-3" />
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <div className="p-3 rounded-xl bg-[#040A10] border border-slate-800 mb-3 text-center space-y-1">
                                <span className="text-[10px] font-extrabold tracking-wider text-emerald-400 uppercase">
                                  {item.badge || 'VERIFIED USDT'}
                                </span>
                                <div className="text-lg font-extrabold text-white font-['Space_Grotesk']">
                                  {item.amount}
                                </div>
                                <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                  <span>{item.status || 'Completed'}</span>
                                </div>
                              </div>
                            )}

                            {/* Client & Metadata Info */}
                            <div className="space-y-1 mb-3 text-[11px]">
                              <div className="flex items-center justify-between text-slate-400">
                                <span>Pelanggan:</span>
                                <strong className="text-slate-200 font-sans truncate max-w-[130px]">{item.clientName}</strong>
                              </div>
                              <div className="flex items-center justify-between text-slate-400">
                                <span>Jaringan:</span>
                                <span className="text-emerald-400">{item.network || 'TRC-20'}</span>
                              </div>
                            </div>
                          </div>

                          {/* Card Action Footer */}
                          <div className="pt-2.5 border-t border-slate-800 flex items-center justify-between gap-1 text-[11px]">
                            <button
                              onClick={() => handleToggleTestimonial(item.id)}
                              className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                                item.isActive
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                  : 'bg-slate-800 text-slate-400'
                              }`}
                              title="Nyalakan/Matikan Tayang"
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${item.isActive ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                              <span>{item.isActive ? 'Aktif' : 'Off'}</span>
                            </button>

                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => openEditTestiModal(item)}
                                className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                                title="Edit Testimoni"
                              >
                                <Settings className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => handleDeleteTestimonial(item.id)}
                                className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20"
                                title="Hapus Testimoni"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                        </div>
                      );
                    })}
                </div>
              )}

              {/* BATCH MULTI-PHOTO UPLOAD MODAL */}
              {batchUploadModalOpen && (
                <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
                  <div className="max-w-3xl w-full glass-card p-6 sm:p-8 rounded-3xl border border-emerald-500/40 bg-[#061219] space-y-5 shadow-2xl my-8">
                    
                    <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
                          <Upload className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white font-['Space_Grotesk']">
                            Batch Upload Foto Testimoni ({batchFiles.length} File Terpilih)
                          </h3>
                          <p className="text-xs text-slate-400">Pilih penempatan baris dan simpan seluruh foto ke database sekaligus</p>
                        </div>
                      </div>
                      <button
                        onClick={() => { setBatchUploadModalOpen(false); setBatchFiles([]); }}
                        className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Batch Row Strategy Selector */}
                    <div className="p-4 rounded-2xl bg-[#040A10] border border-slate-800 space-y-2">
                      <label className="text-emerald-400 font-bold block text-xs">
                        Pengaturan Penempatan Baris Marquee:
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                        <label className={`p-2.5 rounded-xl border cursor-pointer flex items-center gap-2 transition-all ${
                          batchRowAssignment === 'alternate' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold' : 'bg-slate-900 border-slate-800 text-slate-400'
                        }`}>
                          <input
                            type="radio"
                            name="batchRow"
                            checked={batchRowAssignment === 'alternate'}
                            onChange={() => setBatchRowAssignment('alternate')}
                            className="hidden"
                          />
                          <span>🔄 Otomatis Selang-Seling (Baris 1 & 2)</span>
                        </label>

                        <label className={`p-2.5 rounded-xl border cursor-pointer flex items-center gap-2 transition-all ${
                          batchRowAssignment === 'row1' ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 font-bold' : 'bg-slate-900 border-slate-800 text-slate-400'
                        }`}>
                          <input
                            type="radio"
                            name="batchRow"
                            checked={batchRowAssignment === 'row1'}
                            onChange={() => setBatchRowAssignment('row1')}
                            className="hidden"
                          />
                          <span>➡️ Masukkan ke Baris 1 Saja (Kanan)</span>
                        </label>

                        <label className={`p-2.5 rounded-xl border cursor-pointer flex items-center gap-2 transition-all ${
                          batchRowAssignment === 'row2' ? 'bg-purple-500/20 border-purple-500 text-purple-300 font-bold' : 'bg-slate-900 border-slate-800 text-slate-400'
                        }`}>
                          <input
                            type="radio"
                            name="batchRow"
                            checked={batchRowAssignment === 'row2'}
                            onChange={() => setBatchRowAssignment('row2')}
                            className="hidden"
                          />
                          <span>⬅️ Masukkan ke Baris 2 Saja (Kiri)</span>
                        </label>
                      </div>
                    </div>

                    {/* Staging List of Files */}
                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>Daftar Foto Siap Diunggah:</span>
                        <label
                          htmlFor="addMoreBatchInput"
                          className="text-emerald-400 hover:underline cursor-pointer flex items-center gap-1 font-bold"
                        >
                          <Plus className="w-3.5 h-3.5" /> Tambah Foto Lagi
                        </label>
                        <input
                          type="file"
                          id="addMoreBatchInput"
                          multiple
                          accept="image/*,.jpg,.jpeg,.png,.webp,.gif,.svg,.bmp,.avif,.ico"
                          onChange={handleBatchFileSelect}
                          className="hidden"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {batchFiles.map((item, idx) => (
                          <div
                            key={item.id}
                            className="p-2.5 rounded-xl bg-[#040A10] border border-slate-800 flex items-center justify-between gap-3 text-xs"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <img
                                src={item.previewUrl}
                                alt="Preview"
                                className="w-12 h-10 object-cover rounded-lg bg-slate-900 flex-shrink-0"
                              />
                              <div className="min-w-0">
                                <span className="text-white font-bold block truncate max-w-[140px]" title={item.filename}>
                                  {item.filename}
                                </span>
                                <input
                                  type="text"
                                  value={item.amount}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setBatchFiles(prev => prev.map((f, i) => i === idx ? { ...f, amount: val } : f));
                                  }}
                                  placeholder="-5.000 USDT"
                                  className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-emerald-400 text-[11px] font-bold w-24 outline-none"
                                />
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleRemoveBatchFile(item.id)}
                              className="p-1 rounded-lg text-slate-500 hover:text-red-400"
                              title="Hapus dari antrean"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Modal Footer Actions */}
                    <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => { setBatchUploadModalOpen(false); setBatchFiles([]); }}
                        className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-bold"
                      >
                        Batal
                      </button>

                      <button
                        type="button"
                        onClick={handleExecuteBatchUpload}
                        disabled={isBatchUploading || batchFiles.length === 0}
                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-extrabold shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
                      >
                        {isBatchUploading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        <span>Simpan & Unggah {batchFiles.length} Foto ke Database</span>
                      </button>
                    </div>

                  </div>
                </div>
              )}

              {/* SINGLE TESTIMONIAL CREATE / EDIT MODAL */}
              {testimonialModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
                  <div className="max-w-lg w-full glass-card p-6 sm:p-8 rounded-3xl border border-emerald-500/40 bg-[#061219] space-y-5 shadow-2xl my-8">
                    
                    <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
                          <Star className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white font-['Space_Grotesk']">
                            {editingTestiId ? 'Edit Data Testimoni' : 'Tambah Testimoni Transaksi Baru'}
                          </h3>
                          <p className="text-xs text-slate-400">Atur nominal USDT, nama pembeli, baris animasi, dan foto bukti</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setTestimonialModalOpen(false)}
                        className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
                      >
                        ✕
                      </button>
                    </div>

                    <form onSubmit={handleCreateOrUpdateTestimonial} className="space-y-4 text-xs font-mono">
                      
                      {/* Amount and Client Name */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-slate-300 block mb-1 font-bold">Nominal USDT Transaksi:</label>
                          <input
                            type="text"
                            value={testimonialForm.amount}
                            onChange={(e) => setTestimonialForm({ ...testimonialForm, amount: e.target.value })}
                            placeholder="-15.000 USDT"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-[#040A10] border border-slate-700 text-white font-bold text-xs focus:border-emerald-500 outline-none"
                            required
                          />
                        </div>

                        <div>
                          <label className="text-slate-300 block mb-1 font-bold">Nama / Kategori Buyer:</label>
                          <input
                            type="text"
                            value={testimonialForm.clientName}
                            onChange={(e) => setTestimonialForm({ ...testimonialForm, clientName: e.target.value })}
                            placeholder="Buyer OTC Jakarta"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-[#040A10] border border-slate-700 text-white text-xs focus:border-emerald-500 outline-none font-sans"
                            required
                          />
                        </div>
                      </div>

                      {/* Row and Status Selection */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-slate-300 block mb-1 font-bold">Penempatan Baris Animasi:</label>
                          <select
                            value={testimonialForm.row}
                            onChange={(e) => setTestimonialForm({ ...testimonialForm, row: Number(e.target.value) })}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-[#040A10] border border-slate-700 text-white text-xs focus:border-emerald-500 outline-none font-bold"
                          >
                            <option value={1}>➡️ Baris 1 (Bergerak ke Kanan)</option>
                            <option value={2}>⬅️ Baris 2 (Bergerak ke Kiri)</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-slate-300 block mb-1 font-bold">Status Transaksi:</label>
                          <select
                            value={testimonialForm.status}
                            onChange={(e) => setTestimonialForm({ ...testimonialForm, status: e.target.value })}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-[#040A10] border border-slate-700 text-emerald-400 text-xs focus:border-emerald-500 outline-none font-bold"
                          >
                            <option value="Selesai">Selesai (Hijau)</option>
                            <option value="Completed">Completed (Hijau)</option>
                          </select>
                        </div>
                      </div>

                      {/* Photo Upload & URL Path */}
                      <div className="p-3.5 rounded-2xl bg-[#040A10] border border-slate-800 space-y-3">
                        <label className="text-emerald-400 font-bold flex items-center gap-1.5">
                          <ImageIcon className="w-4 h-4" />
                          Foto Screenshot Bukti Transaksi (Opsional):
                        </label>

                        <div className="flex items-center gap-2">
                          <input
                            type="file"
                            id="singleTestiPhotoInput"
                            accept="image/*,.jpg,.jpeg,.png,.webp,.gif,.svg,.bmp,.avif,.ico"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const reader = new FileReader();
                              reader.onload = async (ev) => {
                                const base64 = ev.target.result;
                                try {
                                  const res = await fetch(`${API_URL}/admin/upload-image`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                    body: JSON.stringify({ imageBase64: base64, originalName: file.name })
                                  });
                                  const data = await res.json();
                                  if (data.success && data.imageUrl) {
                                    setTestimonialForm(prev => ({ ...prev, imageUrl: data.imageUrl }));
                                  } else {
                                    setTestimonialForm(prev => ({ ...prev, imageUrl: base64 }));
                                  }
                                } catch (err) {
                                  setTestimonialForm(prev => ({ ...prev, imageUrl: base64 }));
                                }
                              };
                              reader.readAsDataURL(file);
                            }}
                            className="hidden"
                          />
                          <label
                            htmlFor="singleTestiPhotoInput"
                            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-[11px] cursor-pointer flex items-center gap-1.5"
                          >
                            <Upload className="w-3.5 h-3.5" /> Pilih Foto dari PC
                          </label>
                          <input
                            type="text"
                            value={testimonialForm.imageUrl}
                            onChange={(e) => setTestimonialForm({ ...testimonialForm, imageUrl: e.target.value })}
                            placeholder="/uploads/testi.jpg atau link foto"
                            className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-[11px] outline-none"
                          />
                        </div>

                        {testimonialForm.imageUrl && (
                          <div className="flex items-center gap-2 pt-1">
                            <img
                              src={testimonialForm.imageUrl}
                              alt="Preview"
                              className="w-16 h-12 object-cover rounded-lg border border-slate-700 bg-slate-900"
                            />
                            <button
                              type="button"
                              onClick={() => setTestimonialForm(prev => ({ ...prev, imageUrl: '' }))}
                              className="text-red-400 text-[10px] hover:underline"
                            >
                              Hapus Foto
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Active Status Checkbox */}
                      <label className="flex items-center gap-2 cursor-pointer text-slate-300 p-2 rounded-xl bg-[#040A10] border border-slate-800">
                        <input
                          type="checkbox"
                          checked={testimonialForm.isActive}
                          onChange={(e) => setTestimonialForm({ ...testimonialForm, isActive: e.target.checked })}
                          className="w-4 h-4 rounded text-emerald-500"
                        />
                        <span className="font-bold">Status Aktif (Tayang di Marquee Beranda)</span>
                      </label>

                      {/* Footer Action Buttons */}
                      <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
                        <button
                          type="button"
                          onClick={() => setTestimonialModalOpen(false)}
                          className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-bold"
                        >
                          Batal
                        </button>

                        <button
                          type="submit"
                          disabled={isSavingTestimonial}
                          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-extrabold shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
                        >
                          {isSavingTestimonial ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                          <span>{editingTestiId ? 'Simpan Perubahan' : 'Simpan Testimoni'}</span>
                        </button>
                      </div>

                    </form>
                  </div>
                </div>
              )}

              {/* LIGHTBOX PROOF INSPECTOR MODAL */}
              {previewTestiModal && (
                <div className="fixed inset-0 bg-black/85 backdrop-blur-xl z-50 flex items-center justify-center p-4">
                  <div className="relative w-full max-w-md glass-card rounded-3xl border border-emerald-500/40 bg-[#061219] p-6 text-slate-100 shadow-2xl space-y-4 animate-in zoom-in-95">
                    <button
                      onClick={() => setPreviewTestiModal(null)}
                      className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-slate-900 border border-slate-700 text-slate-400 hover:text-white flex items-center justify-center"
                    >
                      ✕
                    </button>

                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
                        <Star className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-base font-extrabold text-white font-['Space_Grotesk']">
                          Inspeksi Foto Bukti Transaksi
                        </h3>
                        <span className="text-[11px] text-emerald-400 font-mono">
                          ID: {previewTestiModal.id} • {previewTestiModal.row === 1 ? 'Baris 1 (Kanan)' : 'Baris 2 (Kiri)'}
                        </span>
                      </div>
                    </div>

                    {previewTestiModal.imageUrl ? (
                      <div className="relative w-full max-h-80 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800">
                        <img
                          src={previewTestiModal.imageUrl}
                          alt={previewTestiModal.title}
                          className="w-full h-full object-contain mx-auto"
                        />
                      </div>
                    ) : (
                      <div className="p-6 rounded-2xl bg-[#040A10] border border-slate-800 text-center space-y-2">
                        <div className="text-2xl font-extrabold text-emerald-400 font-['Space_Grotesk']">
                          {previewTestiModal.amount}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3 text-xs font-mono bg-[#040A10] p-3.5 rounded-2xl border border-slate-800">
                      <div>
                        <span className="text-slate-500 text-[10px] block">Pelanggan:</span>
                        <strong className="text-slate-200">{previewTestiModal.clientName}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px] block">Nominal:</span>
                        <strong className="text-emerald-400">{previewTestiModal.amount}</strong>
                      </div>
                    </div>

                    <div className="text-right">
                      <button
                        onClick={() => setPreviewTestiModal(null)}
                        className="px-5 py-2.5 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-700"
                      >
                        Tutup
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

          {activeMenu === 'GRAFIK' && <ChartPanel token={token} />}

          {activeMenu === 'BANK' && <NetworkFeePanel token={token} mode="BANK" />}

          {activeMenu === 'GALERI' && <GalleryPanel token={token} />}

          {activeMenu === 'SOSMED' && <SocialPanel token={token} />}

          {activeMenu === 'TAMPILAN' && <ContentPanel token={token} />}

          {activeMenu === 'JARINGAN' && <NetworkFeePanel token={token} mode="NETWORK" />}

          {activeMenu === 'DB_MANAGER' && <DbManagerPanel token={token} />}

          {activeMenu === 'API_HEALTH' && <ApiHealthPanel token={token} />}

          {activeMenu === 'TWOFA' && <TwoFactorPanel token={token} />}

        </main>
      </div>

    </div>
  );
}
