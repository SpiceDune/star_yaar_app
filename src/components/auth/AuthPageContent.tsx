import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { supabaseBrowser } from '@/lib/supabase-browser';
import SignInForm from './SignInForm';

export default function AuthPageContent() {
  const { user, loading, hasProvider } = useAuth();
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    if (!loading && user) {
      window.location.href = '/dashboard';
      return;
    }
    if (!loading && !user) {
      if (!hasProvider) {
        supabaseBrowser?.auth.getSession().then(({ data: { session } }) => {
          setCheckingSession(false);
          if (session) window.location.href = '/dashboard';
        }).catch(() => setCheckingSession(false));
      } else {
        setCheckingSession(false);
      }
    } else {
      setCheckingSession(false);
    }
  }, [user, loading, hasProvider]);

  if (loading || checkingSession) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }
  if (user) return null;
  return <SignInForm />;
}
