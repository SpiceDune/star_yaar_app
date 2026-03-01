import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabaseBrowser } from '@/lib/supabase-browser';
import { Button } from '@/components/ui/button';
import { Loader2, Bookmark } from 'lucide-react';

interface SaveChartBannerProps {
  chartId: string;
  isAnonymousChart: boolean;
}

export default function SaveChartBanner({ chartId, isAnonymousChart }: SaveChartBannerProps) {
  const auth = useAuth();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [hasSession, setHasSession] = useState<boolean | null>(null);

  useEffect(() => {
    if (!auth.hasProvider) {
      supabaseBrowser?.auth.getSession().then(({ data: { session } }) => {
        setHasSession(!!session);
      }).catch(() => setHasSession(false));
    } else {
      setHasSession(!!auth.user);
    }
  }, [auth.hasProvider, auth.user]);

  const getToken = async (): Promise<string | null> => {
    if (auth.hasProvider) return auth.getAccessToken();
    const { data: { session } } = await (supabaseBrowser?.auth.getSession() ?? Promise.resolve({ data: { session: null } }));
    return session?.access_token ?? null;
  };

  const handleSave = async () => {
    setError('');
    setSaving(true);
    try {
      const token = await getToken();
      if (!token) {
        window.location.href = `/auth?next=${encodeURIComponent(`/kundli/${chartId}`)}`;
        return;
      }
      const res = await fetch(`/api/kundli/${chartId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ claim: true }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setSaved(true);
      } else {
        setError(data?.error ?? 'Could not save chart');
      }
    } catch {
      setError('Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  if (hasSession === null) return null;

  const isGuest = hasSession === false || (auth.hasProvider && !auth.user);
  const isLoggedIn = !isGuest;

  // Logged-in user viewing a chart that already has an owner — nothing to show
  if (!isAnonymousChart && isLoggedIn) return null;

  if (saved) {
    return (
      <div className="rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3">
        <span className="text-primary text-sm font-medium">Saved to My Charts</span>
        <a href="/dashboard" className="text-sm font-semibold text-primary hover:underline">
          View in Dashboard →
        </a>
      </div>
    );
  }

  // Guest viewing any chart — prompt to sign in
  if (isGuest) {
    return (
      <div className="rounded-xl border border-border bg-card px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Sign in to save this chart to your account and access it anytime.
        </p>
        <a href={`/auth?next=${encodeURIComponent(`/kundli/${chartId}`)}`}>
          <Button className="shrink-0" size="sm">
            Sign in to save
          </Button>
        </a>
      </div>
    );
  }

  // Logged-in user viewing an anonymous chart — offer to claim it
  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <p className="text-sm text-muted-foreground">
        This chart isn't saved to your account. Save it to find it in My Charts.
      </p>
      <div className="flex flex-col gap-1">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="shrink-0"
          size="sm"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Bookmark className="w-4 h-4 mr-1" />
              Save to My Charts
            </>
          )}
        </Button>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    </div>
  );
}
