import { useEffect, useState, useRef, useCallback } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { supabaseBrowser } from '@/lib/supabase-browser';
import { Loader2, Plus, MapPin, Star, MoreVertical, Share2, Trash2, ExternalLink, ChevronRight, Pin } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DEFAULT_CHART_KEY = 'staryaar_default_chart';

interface ChartRow {
  id: string;
  name: string;
  dob: string;
  city: string | null;
  created_at: string;
}

function getInitials(name: string): string {
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

function ChartCardMenu({ chart, onDelete, isDefault, onMakeDefault }: {
  chart: ChartRow; onDelete: (id: string) => void; isDefault: boolean; onMakeDefault: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { getAccessToken } = useAuth();

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
        setConfirmDelete(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setOpen(false); setConfirmDelete(false); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  const handleShare = useCallback(async () => {
    const url = `${window.location.origin}/kundli/${chart.id}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: `${chart.name}'s Birth Chart`, url });
      } catch { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
    setOpen(false);
  }, [chart]);

  const handleDelete = useCallback(async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setDeleting(true);
    try {
      let token = getAccessToken();
      if (!token) {
        const { supabaseBrowser: sb } = await import('@/lib/supabase-browser');
        if (sb) {
          const { data: { session } } = await sb.auth.getSession();
          token = session?.access_token ?? null;
        }
      }
      const res = await fetch(`/api/kundli/${chart.id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        onDelete(chart.id);
      }
    } catch { /* ignore */ }
    setDeleting(false);
    setOpen(false);
    setConfirmDelete(false);
  }, [chart.id, confirmDelete, getAccessToken, onDelete]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(o => !o); setConfirmDelete(false); }}
        className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground/50 hover:text-muted-foreground transition-colors"
        aria-label="Chart options"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 w-44 rounded-xl border border-border bg-card shadow-lg py-1 animate-in fade-in-0 zoom-in-95 duration-100">
          <a
            href={`/dashboard/charts/${chart.id}`}
            className="flex items-center gap-2.5 px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
            View Chart
          </a>
          {!isDefault && (
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onMakeDefault(chart.id); setOpen(false); }}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors"
            >
              <Pin className="w-3.5 h-3.5 text-muted-foreground" />
              Make Default
            </button>
          )}
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleShare(); }}
            className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors"
          >
            <Share2 className="w-3.5 h-3.5 text-muted-foreground" />
            {copied ? 'Link Copied!' : 'Share'}
          </button>
          <div className="border-t border-border my-1" />
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(); }}
            disabled={deleting}
            className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            {deleting ? 'Deleting...' : confirmDelete ? 'Confirm Delete' : 'Delete'}
          </button>
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const { user, loading: authLoading, getAccessToken, hasProvider } = useAuth();
  const [charts, setCharts] = useState<ChartRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sessionChecked, setSessionChecked] = useState(false);
  const [needsRedirectToAuth, setNeedsRedirectToAuth] = useState(false);

  useEffect(() => {
    const token = hasProvider ? getAccessToken() : null;
    if (token) {
      fetch('/api/my-charts', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (res.status === 401) {
            window.location.href = '/auth';
            return null;
          }
          return res.json();
        })
        .then((data) => {
          if (data?.charts) setCharts(data.charts);
          if (data?.error) setError(data.error);
        })
        .catch(() => setError('Failed to load charts'))
        .finally(() => setLoading(false));
      return;
    }
    if (hasProvider && !user && !authLoading) {
      window.location.href = '/auth';
      return;
    }
    if (!hasProvider) {
      supabaseBrowser?.auth.getSession().then(({ data: { session } }) => {
        setSessionChecked(true);
        if (!session) {
          setNeedsRedirectToAuth(true);
          window.location.href = '/auth';
          return;
        }
        const accessToken = session.access_token;
        fetch('/api/my-charts', {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
          .then((res) => {
            if (res.status === 401) {
              window.location.href = '/auth';
              return null;
            }
            return res.json();
          })
          .then((data) => {
            if (data?.charts) setCharts(data.charts);
            if (data?.error) setError(data.error);
          })
          .catch(() => setError('Failed to load charts'))
          .finally(() => setLoading(false));
      }).catch(() => {
        setSessionChecked(true);
        setNeedsRedirectToAuth(true);
        window.location.href = '/auth';
      });
    } else {
      setSessionChecked(true);
    }
  }, [user, authLoading, hasProvider, getAccessToken]);

  const [defaultChartId, setDefaultChartId] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(DEFAULT_CHART_KEY);
  });

  const handleDeleteChart = useCallback((id: string) => {
    setCharts(prev => prev.filter(c => c.id !== id));
    if (id === defaultChartId) {
      localStorage.removeItem(DEFAULT_CHART_KEY);
      setDefaultChartId(null);
    }
  }, [defaultChartId]);

  const handleMakeDefault = useCallback((id: string) => {
    localStorage.setItem(DEFAULT_CHART_KEY, id);
    setDefaultChartId(id);
  }, []);

  const showSpinner = authLoading || (hasProvider && !user) || (!hasProvider && !sessionChecked) || loading;
  if (needsRedirectToAuth) return null;
  if (showSpinner) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (hasProvider && !user) return null;
  if (!hasProvider && !sessionChecked) return null;

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-baseline justify-between">
        <h1 className="text-2xl font-bold text-foreground">My Charts</h1>
        {charts.length > 0 && (
          <span className="text-sm text-muted-foreground">{charts.length} {charts.length === 1 ? 'chart' : 'charts'}</span>
        )}
      </div>

      {error && (
        <p className="text-sm text-destructive font-medium">{error}</p>
      )}

      {!error && charts.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Star className="w-6 h-6 text-primary" />
          </div>
          <p className="text-foreground font-semibold mb-1">No charts yet</p>
          <p className="text-muted-foreground text-sm mb-5">Generate your first Vedic birth chart to get started.</p>
          <Button asChild>
            <a href="/kundli" className="inline-flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Generate your first Kundli
            </a>
          </Button>
        </div>
      )}

      {!error && charts.length > 0 && (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {charts.map((c) => {
            const initials = getInitials(c.name);
            const isDefault = c.id === (defaultChartId ?? charts[0]?.id);
            return (
              <li key={c.id}>
                <div className={`group rounded-xl border bg-card hover:shadow-sm transition-all duration-150 ${
                  isDefault ? 'border-primary/40' : 'border-border hover:border-primary/30'
                }`}>
                  <a href={`/dashboard/charts/${c.id}`} className="block p-4 no-underline">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0 font-semibold text-sm text-muted-foreground">
                        {initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-foreground text-[15px] group-hover:text-primary transition-colors truncate">
                            {c.name}
                          </p>
                          {isDefault && (
                            <span className="shrink-0 text-[10px] font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                              DEFAULT
                            </span>
                          )}
                        </div>
                        {c.city && (
                          <p className="flex items-center gap-1 text-xs text-muted-foreground mt-1 truncate">
                            <MapPin className="w-3 h-3 shrink-0" />
                            {c.city}
                          </p>
                        )}
                      </div>
                    </div>
                  </a>
                  <div className="flex items-center justify-between border-t border-border px-4 py-2">
                    <span className="text-[11px] text-muted-foreground/60">{timeAgo(c.created_at)}</span>
                    <ChartCardMenu
                      chart={c}
                      onDelete={handleDeleteChart}
                      isDefault={isDefault}
                      onMakeDefault={handleMakeDefault}
                    />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
