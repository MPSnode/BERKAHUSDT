import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { API } from '../lib/api';

const FALLBACK = {
  content: {},
  social: {},
  networks: [],
  paymentMethods: [],
  freeFeeThresholdUsdt: 2000,
  chartSettings: {},
  rates: { buyRate: 0, sellRate: 0, minUsdt: 10 },
  logos: {},
};

const SiteContext = createContext({ ...FALLBACK, loading: true, refresh: () => {} });

export const useSite = () => useContext(SiteContext);

export function SiteProvider({ children }) {
  const [state, setState] = useState({ ...FALLBACK, loading: true });

  const load = useCallback(async () => {
    try {
      const res = await fetch(`${API}/settings/all`);
      const data = await res.json();
      if (data && data.success) {
        setState({
          content: data.content || {},
          social: data.social || {},
          networks: data.networks || [],
          paymentMethods: data.paymentMethods || [],
          freeFeeThresholdUsdt: data.freeFeeThresholdUsdt || 2000,
          chartSettings: data.chartSettings || {},
          rates: data.rates || FALLBACK.rates,
          logos: data.logos || {},
          loading: false,
        });
        return;
      }
      setState((s) => ({ ...s, loading: false }));
    } catch (err) {
      setState((s) => ({ ...s, loading: false }));
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [load]);

  // Apply the admin-selected theme colour as CSS variables
  useEffect(() => {
    const primary = state.content?.themeColor;
    const dark = state.content?.themeColorDark;
    if (primary) document.documentElement.style.setProperty('--berkah-primary', primary);
    if (dark) document.documentElement.style.setProperty('--berkah-primary-dark', dark);
  }, [state.content?.themeColor, state.content?.themeColorDark]);

  const value = useMemo(() => ({ ...state, refresh: load }), [state, load]);
  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}

export default SiteContext;
