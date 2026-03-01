import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { supabaseBrowser } from '../../lib/supabase-browser';

export default function AuthCallbackHandler() {
  const [status, setStatus] = useState<'loading' | 'done' | 'error'>('loading');

  useEffect(() => {
    const supabase = supabaseBrowser;
    if (!supabase) {
      setStatus('error');
      return;
    }

    const run = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        const next = params.get('next') ?? '/dashboard';

        if (code) {
          await supabase.auth.exchangeCodeForSession(code);
        } else {
          await supabase.auth.getSession();
        }
        window.location.replace(next);
      } catch {
        setStatus('error');
      }
    };

    run();
  }, []);

  if (status === 'error') {
    return (
      <div className="text-center py-12">
        <p className="text-destructive font-medium">Sign-in could not be completed.</p>
        <a href="/auth" className="text-primary underline mt-2 inline-block">Back to sign in</a>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
}
