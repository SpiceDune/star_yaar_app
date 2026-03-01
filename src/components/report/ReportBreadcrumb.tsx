import { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import { supabaseBrowser } from '@/lib/supabase-browser';

interface Props {
  chartName: string;
}

export default function ReportBreadcrumb({ chartName }: Props) {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const sb = supabaseBrowser;
    if (!sb) return;
    sb.auth.getSession().then(({ data: { session } }) => {
      setLoggedIn(!!session?.user);
    });
    const { data: { subscription } } = sb.auth.onAuthStateChange((_event, session) => {
      setLoggedIn(!!session?.user);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (!loggedIn) return null;

  return (
    <nav className="flex items-center gap-1.5 text-sm mb-5" aria-label="Breadcrumb">
      <a
        href="/dashboard/charts"
        className="text-muted-foreground hover:text-foreground font-medium transition-colors"
      >
        My Charts
      </a>
      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" />
      <span className="text-foreground font-medium truncate max-w-[200px] sm:max-w-none">{chartName}</span>
    </nav>
  );
}
