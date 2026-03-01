import { useEffect, useState, useCallback } from 'react';
import { supabaseBrowser } from '@/lib/supabase-browser';
import {
  Loader2, Plus, Star, ChevronDown, Calendar, Orbit, Clock, Sun, Moon,
  Bell, BellOff, Minus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';

const DEFAULT_CHART_KEY = 'staryaar_default_chart';
const NOTIF_KEY = 'staryaar_notif_enabled';
const NOTIF_LAST_KEY = 'staryaar_notif_last';

async function registerSW() {
  if (!('serviceWorker' in navigator)) return null;
  try {
    return await navigator.serviceWorker.register('/sw.js');
  } catch { return null; }
}

function buildTransitNotifBody(transits: TransitPlanet[], rashi: Record<string, string>) {
  const good = transits.filter(t => t.quality === 'good').length;
  const challenging = transits.filter(t => t.quality === 'challenging').length;
  const moon = transits.find(t => t.graha === 'Moon');
  let body = `${good} favorable, ${challenging} challenging transits today.`;
  if (moon) body += ` Moon in ${rashi[moon.transitRashi] ?? moon.transitRashi}.`;
  return body;
}

interface ChartBasic { id: string; name: string; city: string | null }

interface TransitPlanet {
  graha: string; transitRashi: string; transitDegree: number;
  retrograde: boolean; natalHouse: number;
  quality: 'good' | 'neutral' | 'challenging'; brief: string;
}

interface CurrentDasha {
  maha: string; antar: string; pratyantar: string;
  mahStart: string; mahEnd: string;
  antStart: string; antEnd: string;
  praStart: string; praEnd: string;
  flow: string;
}

interface PanchangData {
  tithi: string; nakshatra: string; yoga: string;
  karana: string; vara: string; varaEnglish?: string;
}

interface SummaryData {
  chart: { id: string; name: string; dob: string; city: string | null; lagna: string | null };
  transits: TransitPlanet[];
  transitDate: string | null;
  currentDasha: CurrentDasha | null;
  panchang: PanchangData | null;
}

const RASHI_ENGLISH: Record<string, string> = {
  Mesha: 'Aries', Vrishabha: 'Taurus', Mithuna: 'Gemini', Karka: 'Cancer',
  Simha: 'Leo', Kanya: 'Virgo', Tula: 'Libra', Vrishchika: 'Scorpio',
  Dhanu: 'Sagittarius', Makara: 'Capricorn', Kumbha: 'Aquarius', Meena: 'Pisces',
};

function qualityDot(q: string) {
  if (q === 'good') return 'bg-teal-400';
  if (q === 'challenging') return 'bg-amber-400';
  return 'bg-zinc-300 dark:bg-zinc-600';
}

function qualityBg(q: string) {
  if (q === 'good') return 'bg-teal-500/[0.06] border-teal-500/15';
  if (q === 'challenging') return 'bg-amber-500/[0.06] border-amber-500/15';
  return 'bg-muted/40 border-border';
}

function qualityText(q: string) {
  if (q === 'good') return 'text-teal-600 dark:text-teal-400';
  if (q === 'challenging') return 'text-amber-600 dark:text-amber-400';
  return 'text-muted-foreground';
}

function daysUntil(dateStr: string): string {
  const diff = new Date(dateStr).getTime() - Date.now();
  const days = Math.ceil(diff / 86400000);
  if (days < 0) return 'ended';
  if (days === 0) return 'today';
  if (days === 1) return '1 day';
  if (days < 30) return `${days} days`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo`;
  return `${(days / 365).toFixed(1)}yr`;
}

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function DashboardHome() {
  const [charts, setCharts] = useState<ChartBasic[]>([]);
  const [defaultId, setDefaultId] = useState<string | null>(null);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [todayPanchang, setTodayPanchang] = useState<PanchangData | null>(null);
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [notifEnabled, setNotifEnabled] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(NOTIF_KEY) === '1';
  });
  const [notifSupported] = useState(() =>
    typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator
  );

  const getToken = useCallback(async () => {
    const sb = supabaseBrowser;
    if (!sb) return null;
    const { data: { session } } = await sb.auth.getSession();
    return session?.access_token ?? null;
  }, []);

  useEffect(() => {
    (async () => {
      const token = await getToken();
      if (!token) { window.location.href = '/auth'; return; }
      try {
        const res = await fetch('/api/my-charts', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.status === 401) { window.location.href = '/auth'; return; }
        const data = await res.json();
        const list: ChartBasic[] = data.charts ?? [];
        setCharts(list);
        if (list.length > 0) {
          const stored = localStorage.getItem(DEFAULT_CHART_KEY);
          const valid = list.find(c => c.id === stored);
          const chosen = valid?.id ?? list[0].id;
          setDefaultId(chosen);
          localStorage.setItem(DEFAULT_CHART_KEY, chosen);
        }
      } catch { setError('Failed to load charts'); }
      finally { setLoading(false); }
    })();
  }, [getToken]);

  useEffect(() => {
    fetch(`/api/panchang/${todayISO()}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setTodayPanchang(d); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!defaultId) return;
    let cancelled = false;
    (async () => {
      setSummaryLoading(true);
      const token = await getToken();
      if (!token) return;
      try {
        const res = await fetch(`/api/chart-summary?id=${defaultId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok && !cancelled) setSummary(await res.json());
      } catch { /* ignore */ }
      if (!cancelled) setSummaryLoading(false);
    })();
    return () => { cancelled = true; };
  }, [defaultId, getToken]);

  const handleSetDefault = useCallback((id: string) => {
    setDefaultId(id);
    localStorage.setItem(DEFAULT_CHART_KEY, id);
    setSelectorOpen(false);
  }, []);

  const handleToggleNotif = useCallback(async () => {
    if (notifEnabled) {
      localStorage.removeItem(NOTIF_KEY);
      setNotifEnabled(false);
      return;
    }
    const perm = await Notification.requestPermission();
    if (perm === 'granted') {
      await registerSW();
      localStorage.setItem(NOTIF_KEY, '1');
      setNotifEnabled(true);
    }
  }, [notifEnabled]);

  useEffect(() => {
    if (!notifEnabled || !summary || summary.transits.length === 0) return;
    const today = todayISO();
    if (localStorage.getItem(NOTIF_LAST_KEY) === today) return;
    localStorage.setItem(NOTIF_LAST_KEY, today);

    registerSW().then(reg => {
      if (!reg) return;
      reg.showNotification('StarYaar – Today\'s Transits', {
        body: buildTransitNotifBody(summary.transits, RASHI_ENGLISH),
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-192.png',
        tag: 'staryaar-transit',
        renotify: true,
        data: { url: '/dashboard' },
      });
    });
  }, [notifEnabled, summary]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (charts.length === 0) {
    return (
      <div className="max-w-lg mx-auto py-16">
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Star className="w-6 h-6 text-primary" />
          </div>
          <p className="text-foreground font-semibold mb-1">Welcome to StarYaar</p>
          <p className="text-muted-foreground text-sm mb-5">
            Generate your first birth chart to see personalized transits, dasha periods, and more.
          </p>
          <Button asChild>
            <a href="/kundli" className="inline-flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Generate Your First Chart
            </a>
          </Button>
        </div>
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-destructive font-medium py-8">{error}</p>;
  }

  const defaultChart = charts.find(c => c.id === defaultId);
  const moonTransit = summary?.transits.find(t => t.graha === 'Moon');
  const sunTransit = summary?.transits.find(t => t.graha === 'Sun');
  const retrogrades = summary?.transits.filter(t => t.retrograde) ?? [];
  const keyGood = summary?.transits.filter(t => t.quality === 'good').slice(0, 2) ?? [];
  const keyChallenging = summary?.transits.filter(t => t.quality === 'challenging').slice(0, 2) ?? [];
  const good = summary?.transits.filter(t => t.quality === 'good').length ?? 0;
  const challenging = summary?.transits.filter(t => t.quality === 'challenging').length ?? 0;
  const neutral = summary?.transits.filter(t => t.quality === 'neutral').length ?? 0;

  return (
    <div className="max-w-4xl space-y-6">
      {/* Chart selector */}
      <div className="flex items-center justify-between">
        <div className="relative">
          <button
            type="button"
            onClick={() => setSelectorOpen(o => !o)}
            className="flex items-center gap-2 text-left"
          >
            <h1 className="text-2xl font-bold text-foreground">
              {defaultChart?.name ?? 'Dashboard'}
            </h1>
            {charts.length > 1 && (
              <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${selectorOpen ? 'rotate-180' : ''}`} />
            )}
          </button>
          {selectorOpen && charts.length > 1 && (
            <div className="absolute left-0 top-full mt-1 z-50 w-60 rounded-xl border border-border bg-card shadow-lg py-1">
              {charts.map(c => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleSetDefault(c.id)}
                  className={`flex w-full items-center gap-2.5 px-3 py-2.5 text-sm transition-colors ${
                    c.id === defaultId ? 'bg-primary/10 text-primary font-medium' : 'text-foreground hover:bg-accent'
                  }`}
                >
                  {c.name}
                  {c.id === defaultId && <span className="ml-auto text-xs text-primary font-semibold">DEFAULT</span>}
                </button>
              ))}
            </div>
          )}
        </div>
        <a
          href={`/dashboard/charts/${defaultId}`}
          className="text-sm text-muted-foreground hover:text-foreground font-medium transition-colors"
        >
          View Full Chart &rarr;
        </a>
      </div>

      {summaryLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      )}

      {!summaryLoading && summary && (
        <div className="space-y-5">
          {/* Top row: Today snapshot + Dasha */}
          <div className="grid gap-5 sm:grid-cols-2">
            {/* Today's Snapshot */}
            <div className="rounded-xl border border-border bg-muted/30 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Sun className="w-5 h-5 text-primary" />
                <h2 className="text-base font-semibold text-foreground">Today&apos;s Transit</h2>
                <span className="ml-auto flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{summary.transitDate}</span>
                  {notifSupported && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            onClick={handleToggleNotif}
                            className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                              notifEnabled
                                ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20'
                                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                            }`}
                            aria-label={notifEnabled ? 'Disable notifications' : 'Enable notifications'}
                          >
                            {notifEnabled ? <Bell className="w-3.5 h-3.5" /> : <BellOff className="w-3.5 h-3.5" />}
                            <span className="hidden sm:inline">{notifEnabled ? 'On' : 'Daily alert'}</span>
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" sideOffset={6}>
                          {notifEnabled
                            ? 'You\u2019ll get a daily transit notification. Click to turn off.'
                            : 'Get notified every day with your personalized transit update.'}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </span>
              </div>

              {/* Sun & Moon */}
              <div className="grid grid-cols-2 gap-2.5 mb-4">
                {sunTransit && (
                  <div className="flex items-center gap-2.5 rounded-lg bg-muted/40 p-2.5">
                    <Sun className="w-4 h-4 text-amber-500 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {RASHI_ENGLISH[sunTransit.transitRashi] ?? sunTransit.transitRashi}
                      </p>
                      <p className="text-xs text-muted-foreground">H{sunTransit.natalHouse}</p>
                    </div>
                  </div>
                )}
                {moonTransit && (
                  <div className="flex items-center gap-2.5 rounded-lg bg-muted/40 p-2.5">
                    <Moon className="w-4 h-4 text-muted-foreground shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {RASHI_ENGLISH[moonTransit.transitRashi] ?? moonTransit.transitRashi}
                      </p>
                      <p className="text-xs text-muted-foreground">H{moonTransit.natalHouse}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Outlook bar */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Outlook</span>
                  <span className="font-medium text-foreground">{good}/{summary.transits.length} favorable</span>
                </div>
                <div className="flex h-2.5 rounded-full overflow-hidden bg-muted/60">
                  {good > 0 && <div className="bg-teal-400" style={{ width: `${(good / summary.transits.length) * 100}%` }} />}
                  {neutral > 0 && <div className="bg-zinc-300 dark:bg-zinc-600" style={{ width: `${(neutral / summary.transits.length) * 100}%` }} />}
                  {challenging > 0 && <div className="bg-amber-400" style={{ width: `${(challenging / summary.transits.length) * 100}%` }} />}
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-teal-400 inline-block" />{good}</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-zinc-300 dark:bg-zinc-600 inline-block" />{neutral}</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />{challenging}</span>
                </div>
              </div>

              {/* Key highlights */}
              {(keyGood.length > 0 || keyChallenging.length > 0) && (
                <div className="space-y-2 border-t border-border pt-3">
                  {keyGood.map(t => (
                    <div key={t.graha} className="flex items-center gap-2 text-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0" />
                      <span className="text-foreground font-medium">{t.graha}</span>
                      <span className="text-muted-foreground">–</span>
                      <span className="text-teal-600 dark:text-teal-400 truncate">{t.brief}</span>
                    </div>
                  ))}
                  {keyChallenging.map(t => (
                    <div key={t.graha} className="flex items-center gap-2 text-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                      <span className="text-foreground font-medium">{t.graha}</span>
                      <span className="text-muted-foreground">–</span>
                      <span className="text-amber-600 dark:text-amber-400 truncate">{t.brief}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Retrogrades */}
              {retrogrades.length > 0 && (
                <div className="border-t border-border pt-3 mt-3">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5">Retrograde</p>
                  <div className="flex flex-wrap gap-1.5">
                    {retrogrades.map(t => (
                      <span key={t.graha} className="text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-500/[0.08] px-2 py-1 rounded-md">
                        {t.graha} ℞
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Current Dasha */}
            {summary.currentDasha && (
              <div className="rounded-xl border border-border bg-muted/30 p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-primary" />
                  <h2 className="text-base font-semibold text-foreground">Current Dasha</h2>
                </div>
                {summary.currentDasha.flow && (
                  <p className="text-sm text-muted-foreground mb-3 font-medium">{summary.currentDasha.flow}</p>
                )}
                <div className="space-y-0">
                  {([
                    ['Maha', summary.currentDasha.maha, summary.currentDasha.mahStart, summary.currentDasha.mahEnd],
                    ['Antar', summary.currentDasha.antar, summary.currentDasha.antStart, summary.currentDasha.antEnd],
                    ['Pratyantar', summary.currentDasha.pratyantar, summary.currentDasha.praStart, summary.currentDasha.praEnd],
                  ] as [string, string, string, string][])
                    .filter(([, planet]) => planet)
                    .map(([tier, planet, start, end], i) => {
                      const elapsed = start && end
                        ? Math.max(0, Math.min(1, (Date.now() - new Date(start).getTime()) / (new Date(end).getTime() - new Date(start).getTime())))
                        : 0;
                      const fmtDate = (d: string) => {
                        if (!d) return '';
                        const dt = new Date(d);
                        return dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
                      };
                      return (
                        <div key={tier} className={`py-3 ${i > 0 ? 'border-t border-border' : ''}`}>
                          <div className="flex items-center justify-between mb-1">
                            <div>
                              <span className="text-xs text-muted-foreground uppercase tracking-wider block">{tier}</span>
                              <span className="text-base font-bold text-foreground">{planet}</span>
                            </div>
                            <span className="text-xs text-muted-foreground font-medium bg-muted px-2.5 py-1 rounded">
                              {daysUntil(end)} left
                            </span>
                          </div>
                          {start && end && (
                            <p className="text-xs text-muted-foreground mb-2">{fmtDate(start)} – {fmtDate(end)}</p>
                          )}
                          <div className="h-1.5 rounded-full overflow-hidden bg-muted/60">
                            <div
                              className="h-full bg-primary/50 rounded-full transition-all"
                              style={{ width: `${elapsed * 100}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </div>

          {/* Today's Panchang */}
          {todayPanchang && (
            <div className="rounded-xl border border-border bg-muted/30 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-primary" />
                <h2 className="text-base font-semibold text-foreground">Today&apos;s Panchang</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {([
                  ['Tithi', todayPanchang.tithi],
                  ['Nakshatra', todayPanchang.nakshatra],
                  ['Yoga', todayPanchang.yoga],
                  ['Karana', todayPanchang.karana],
                  ['Vara', todayPanchang.varaEnglish || todayPanchang.vara],
                ] as [string, string][]).map(([label, value]) => (
                  <div key={label} className="rounded-lg bg-muted/40 px-3 py-3">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
                    <p className="text-[15px] font-semibold text-foreground mt-1 truncate">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Transits grid */}
          {summary.transits.length > 0 && (
            <div className="rounded-xl border border-border bg-muted/30 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Orbit className="w-5 h-5 text-primary" />
                <h2 className="text-base font-semibold text-foreground">Planetary Transits</h2>
              </div>
              <div className="grid gap-2.5 sm:grid-cols-3">
                {summary.transits.map(t => (
                  <div
                    key={t.graha}
                    className={`rounded-lg border p-3.5 ${qualityBg(t.quality)}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${qualityDot(t.quality)}`} />
                      <span className="text-[15px] font-semibold text-foreground">{t.graha}</span>
                      {t.retrograde && <span className="text-xs font-bold text-amber-500">R</span>}
                      <span className="ml-auto text-xs text-muted-foreground font-medium">H{t.natalHouse}</span>
                    </div>
                    <p className="text-sm text-muted-foreground pl-5">
                      {RASHI_ENGLISH[t.transitRashi] ?? t.transitRashi} {t.transitDegree}&deg;
                    </p>
                    <p className={`text-sm font-medium pl-5 mt-0.5 ${qualityText(t.quality)}`}>{t.brief}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Birth Panchang */}
          {summary.panchang && (
            <div className="rounded-xl border border-border bg-muted/30 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-5 h-5 text-primary" />
                <h2 className="text-base font-semibold text-foreground">Birth Details</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {([
                  ['Tithi', summary.panchang.tithi],
                  ['Nakshatra', summary.panchang.nakshatra],
                  ['Yoga', summary.panchang.yoga],
                  ['Karana', summary.panchang.karana],
                  ['Vara', summary.panchang.vara],
                  ['Lagna', summary.chart.lagna ? (RASHI_ENGLISH[summary.chart.lagna] ?? summary.chart.lagna) : null],
                ] as [string, string | null][]).filter(([, v]) => v).map(([label, value]) => (
                  <div key={label} className="flex justify-between items-baseline text-[15px]">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium text-foreground">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
