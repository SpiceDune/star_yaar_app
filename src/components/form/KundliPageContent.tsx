import { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import { supabaseBrowser } from '@/lib/supabase-browser';
import KundliForm from './KundliForm';

export default function KundliPageContent() {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const sb = supabaseBrowser;
    if (!sb) { setLoggedIn(false); return; }
    sb.auth.getSession().then(({ data: { session } }) => {
      setLoggedIn(!!session?.user);
    });
    const { data: { subscription } } = sb.auth.onAuthStateChange((_event, session) => {
      setLoggedIn(!!session?.user);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (loggedIn === null) return null;

  if (loggedIn) {
    return (
      <div className="py-4 md:py-8">
        <nav className="flex items-center gap-1.5 text-sm mb-4" aria-label="Breadcrumb">
          <a href="/dashboard" className="text-muted-foreground hover:text-foreground font-medium transition-colors">
            Home
          </a>
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" />
          <span className="text-foreground font-medium">New Chart</span>
        </nav>
        <KundliForm minimal />
      </div>
    );
  }

  return (
    <div className="py-6 md:py-12">
      <div className="text-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
          Generate Your Kundli
        </h1>
        <p className="text-sm md:text-base text-muted-foreground mt-2 max-w-lg mx-auto">
          Enter your birth details to generate a detailed Vedic birth chart with
          Dasha timeline, Yogas, Transits and Divisional charts
        </p>
      </div>
      <KundliForm />
    </div>
  );
}
