import React, { useState, useEffect } from 'react';
import { X, Sparkles, ExternalLink, CheckCircle2, Megaphone, Clock } from 'lucide-react';

export default function PromoModal() {
  const [activePopup, setActivePopup] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [countdown, setCountdown] = useState(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/popups')
      .then(res => res.json())
      .then(data => {
        if (data && data.success && data.popups && data.popups.length > 0) {
          // Find first active popup that has not been dismissed in this session
          const validPopup = data.popups.find(p => {
            if (!p.isActive) return false;
            const isDismissed = localStorage.getItem(`berkah_popup_dismissed_${p.id}`);
            return !isDismissed;
          });

          if (validPopup) {
            // Small delay for smooth entrance after page load
            const timer = setTimeout(() => {
              setActivePopup(validPopup);
              setIsOpen(true);

              // Track view event
              fetch(`http://localhost:5000/api/popups/${validPopup.id}/view`, { method: 'POST' }).catch(() => {});

              // Handle auto close timer if configured
              if (validPopup.autoCloseSeconds > 0) {
                setCountdown(validPopup.autoCloseSeconds);
              }
            }, 1200);

            return () => clearTimeout(timer);
          }
        }
      })
      .catch(() => {});
  }, []);

  // Countdown timer effect
  useEffect(() => {
    if (countdown === null || countdown <= 0 || !isOpen) return;
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          handleClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [countdown, isOpen]);

  const handleClose = () => {
    if (dontShowAgain && activePopup) {
      localStorage.setItem(`berkah_popup_dismissed_${activePopup.id}`, 'true');
    }
    setIsOpen(false);
  };

  const handleCtaClick = () => {
    if (activePopup) {
      fetch(`http://localhost:5000/api/popups/${activePopup.id}/click`, { method: 'POST' }).catch(() => {});
    }
    if (dontShowAgain && activePopup) {
      localStorage.setItem(`berkah_popup_dismissed_${activePopup.id}`, 'true');
    }
  };

  if (!isOpen || !activePopup) return null;

  // Width container sizing
  const widthClasses = {
    compact: 'max-w-md',
    medium: 'max-w-lg',
    wide: 'max-w-2xl',
    full: 'max-w-3xl'
  }[activePopup.imageWidth || 'medium'] || 'max-w-lg';

  // Aspect ratio styling
  const aspectClasses = {
    '16/9': 'aspect-video',
    '4/3': 'aspect-[4/3]',
    '1/1': 'aspect-square',
    'none': 'hidden'
  }[activePopup.imageAspectRatio || '16/9'];

  // Theme accent colors
  const theme = {
    emerald: {
      border: 'border-emerald-500/40 shadow-emerald-500/10',
      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      glow: 'from-emerald-500/20',
      btn: 'from-emerald-500 to-teal-600 hover:shadow-emerald-500/25',
      ring: 'focus:ring-emerald-500'
    },
    cyan: {
      border: 'border-cyan-500/40 shadow-cyan-500/10',
      badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      glow: 'from-cyan-500/20',
      btn: 'from-cyan-500 to-blue-600 hover:shadow-cyan-500/25',
      ring: 'focus:ring-cyan-500'
    },
    amber: {
      border: 'border-amber-500/40 shadow-amber-500/10',
      badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      glow: 'from-amber-500/20',
      btn: 'from-amber-500 to-orange-600 hover:shadow-amber-500/25',
      ring: 'focus:ring-amber-500'
    },
    purple: {
      border: 'border-purple-500/40 shadow-purple-500/10',
      badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      glow: 'from-purple-500/20',
      btn: 'from-purple-500 to-indigo-600 hover:shadow-purple-500/25',
      ring: 'focus:ring-purple-500'
    }
  }[activePopup.accentColor || 'emerald'] || theme?.emerald;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
      
      {/* Click outside backdrop to close */}
      <div className="absolute inset-0" onClick={handleClose} />

      {/* Main Glassmorphism Modal Card */}
      <div 
        className={`relative w-full ${widthClasses} glass-card rounded-3xl border ${theme.border} bg-[#061219]/95 text-slate-100 shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-300`}
      >
        {/* Top Glow Ambient Flare */}
        <div className={`absolute top-0 inset-x-0 h-32 bg-gradient-to-b ${theme.glow} to-transparent pointer-events-none`} />

        {/* Close Button Top Right */}
        <button
          onClick={handleClose}
          aria-label="Tutup Pengumuman"
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-slate-900/80 border border-slate-700/80 text-slate-400 hover:text-white hover:bg-slate-800 hover:border-slate-500 flex items-center justify-center transition-all backdrop-blur-md"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Banner Image Container */}
        {activePopup.imageAspectRatio !== 'none' && activePopup.imageUrl && (
          <div className={`relative w-full ${aspectClasses} overflow-hidden bg-slate-950/60 border-b border-slate-800/80`}>
            <img
              src={activePopup.imageUrl}
              alt={activePopup.title}
              className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700"
              onError={(e) => {
                // Fallback to brand logo if custom link fails
                e.target.src = '/logo_berkah.jpg';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#061219] via-transparent to-transparent opacity-80" />
            
            {/* Live Badge in Image Corner */}
            <div className="absolute bottom-3 left-4">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider border shadow-md backdrop-blur-md ${theme.badge}`}>
                <span className="w-2 h-2 rounded-full bg-current animate-ping" />
                {activePopup.badgeText || 'PENGUMUMAN'}
              </span>
            </div>
          </div>
        )}

        {/* Modal Body Content */}
        <div className="p-6 sm:p-8 space-y-4">
          
          {/* Badge if no image */}
          {activePopup.imageAspectRatio === 'none' && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider border shadow-md ${theme.badge}">
              <Megaphone className="w-3.5 h-3.5" />
              {activePopup.badgeText || 'PENGUMUMAN RESMI'}
            </div>
          )}

          {/* Title & Subtitle */}
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white font-['Space_Grotesk'] tracking-tight leading-snug">
              {activePopup.title}
            </h2>
            {activePopup.subtitle && (
              <p className="text-sm font-semibold text-emerald-400 mt-1 font-mono">
                {activePopup.subtitle}
              </p>
            )}
          </div>

          {/* Description Paragraph */}
          <div className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans bg-[#040A10]/60 p-4 rounded-2xl border border-slate-800/80 whitespace-pre-line">
            {activePopup.description}
          </div>

          {/* Action CTA Button */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <a
              href={activePopup.buttonUrl || 'https://wa.me/6281234567890'}
              target={activePopup.buttonTarget || '_blank'}
              rel="noopener noreferrer"
              onClick={handleCtaClick}
              className={`w-full sm:flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r ${theme.btn} text-white font-extrabold text-sm shadow-lg flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all`}
            >
              <span>{activePopup.buttonText || 'Buka Link Promosi'}</span>
              <ExternalLink className="w-4 h-4" />
            </a>

            <button
              onClick={handleClose}
              className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-bold transition-all"
            >
              Tutup
            </button>
          </div>

          {/* Bottom Footer: "Don't show again" checkbox & Auto-close timer */}
          <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400 font-mono">
            <label className="flex items-center gap-2 cursor-pointer select-none hover:text-slate-300">
              <input
                type="checkbox"
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
                className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-900"
              />
              <span className="text-[11px]">Jangan tampilkan lagi hari ini</span>
            </label>

            {countdown !== null && countdown > 0 && (
              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Tutup otomatis: {countdown}s
              </span>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
