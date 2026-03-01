import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { supabaseBrowser } from '@/lib/supabase-browser';
import { Loader2, Plus, Calendar, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChartRow {
  id: string;
  name: string;
  dob: string;
  city: string | null;
  created_at: string;
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-foreground">My Charts</h1>
        <Button asChild>
          <a href="/kundli" className="inline-flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Generate New Kundli
          </a>
        </Button>
      </div>

      {error && (
        <p className="text-sm text-destructive font-medium">{error}</p>
      )}

      {!error && charts.length === 0 && (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <p className="text-muted-foreground mb-4">You haven’t saved any charts yet.</p>
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
          {charts.map((c) => (
            <li key={c.id}>
              <a
                href={`/kundli/${c.id}`}
                className="block rounded-xl border border-border bg-card p-4 hover:bg-accent/50 transition-colors"
              >
                <p className="font-semibold text-foreground">{c.name}</p>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(c.dob)}
                  </span>
                  {c.city && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {c.city}
                    </span>
                  )}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  View chart →
                </p>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
