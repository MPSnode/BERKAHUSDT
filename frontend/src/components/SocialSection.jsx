import React from 'react';
import {
  Clock,
  Facebook,
  Instagram,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
  Twitter,
  Youtube,
  Music2,
  Headphones,
} from 'lucide-react';
import { useSite } from '../context/SiteContext';

const CHANNELS = [
  { key: 'whatsapp', label: 'WhatsApp Official', icon: MessageCircle, color: 'text-emerald-400', ring: 'border-emerald-500/40 hover:shadow-emerald-500/20' },
  { key: 'telegramChannel', label: 'Telegram Channel', icon: Send, color: 'text-sky-400', ring: 'border-sky-500/40 hover:shadow-sky-500/20' },
  { key: 'telegramAdmin1', label: 'Telegram Admin 1', icon: Send, color: 'text-cyan-400', ring: 'border-cyan-500/40 hover:shadow-cyan-500/20' },
  { key: 'telegramAdmin2', label: 'Telegram Admin 2', icon: Send, color: 'text-teal-400', ring: 'border-teal-500/40 hover:shadow-teal-500/20' },
  { key: 'instagram', label: 'Instagram', icon: Instagram, color: 'text-pink-400', ring: 'border-pink-500/40 hover:shadow-pink-500/20' },
  { key: 'facebook', label: 'Facebook', icon: Facebook, color: 'text-blue-400', ring: 'border-blue-500/40 hover:shadow-blue-500/20' },
  { key: 'twitter', label: 'Twitter / X', icon: Twitter, color: 'text-slate-200', ring: 'border-slate-500/40 hover:shadow-slate-500/20' },
  { key: 'youtube', label: 'YouTube', icon: Youtube, color: 'text-red-400', ring: 'border-red-500/40 hover:shadow-red-500/20' },
  { key: 'tiktok', label: 'TikTok', icon: Music2, color: 'text-fuchsia-400', ring: 'border-fuchsia-500/40 hover:shadow-fuchsia-500/20' },
];

export default function SocialSection() {
  const { content, social } = useSite();

  const activeChannels = CHANNELS.filter((c) => social && social[c.key]);
  const contactRows = [
    { key: 'phone', label: 'Telepon / WA', value: social?.phone, icon: Phone },
    { key: 'email', label: 'Email Support', value: social?.email, icon: Mail },
    { key: 'address', label: 'Lokasi', value: social?.address, icon: MapPin },
    { key: 'operationalHours', label: 'Jam Operasional', value: social?.operationalHours, icon: Clock },
  ].filter((row) => row.value);

  return (
    <div className="glass-card rounded-3xl border border-slate-800 p-5 sm:p-7" data-testid="social-section">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-[11px] text-emerald-400 font-bold uppercase tracking-wider mb-3">
        <Headphones className="w-3.5 h-3.5" />
        Kontak &amp; Media Sosial
      </div>
      <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight font-['Space_Grotesk']">
        {content?.socialTitle || 'Hubungi Kami'}
      </h2>
      <p className="text-slate-400 text-sm mt-2">
        {content?.socialSubtitle || 'Tim OTC kami siap melayani transaksi Anda melalui kanal resmi berikut.'}
      </p>

      {activeChannels.length === 0 ? (
        <div className="mt-6 p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-sm text-slate-400">
          Tautan media sosial belum diisi. Atur di Admin Panel &gt; SOSIAL MEDIA.
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {activeChannels.map(({ key, label, icon: Icon, color, ring }) => (
            <a
              key={key}
              href={social[key]}
              target="_blank"
              rel="noopener noreferrer"
              data-testid={`social-link-${key}`}
              className={`group flex items-center gap-3 p-3.5 rounded-2xl bg-slate-900/70 border ${ring} transition-all hover:-translate-y-0.5 hover:shadow-lg`}
            >
              <span className="w-10 h-10 rounded-xl bg-slate-800/80 flex items-center justify-center shrink-0">
                <Icon className={`w-5 h-5 ${color}`} />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-bold text-white">
                  {key === 'telegramAdmin1' && social.telegramAdmin1Label ? social.telegramAdmin1Label : null}
                  {key === 'telegramAdmin2' && social.telegramAdmin2Label ? social.telegramAdmin2Label : null}
                  {!(key === 'telegramAdmin1' && social.telegramAdmin1Label) &&
                  !(key === 'telegramAdmin2' && social.telegramAdmin2Label)
                    ? label
                    : null}
                </span>
                <span className="block text-[11px] text-slate-400 font-mono truncate">{social[key]}</span>
              </span>
            </a>
          ))}
        </div>
      )}

      {contactRows.length > 0 && (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {contactRows.map(({ key, label, value, icon: Icon }) => (
            <div key={key} className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#070C1A] border border-slate-800">
              <Icon className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
              <div className="min-w-0">
                <div className="text-[11px] uppercase tracking-wide text-slate-500 font-bold">{label}</div>
                <div className="text-sm text-slate-200 font-medium break-words">{value}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
