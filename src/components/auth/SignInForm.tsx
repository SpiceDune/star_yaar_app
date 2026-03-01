import { useState } from 'react';
import { useAuth } from './AuthProvider';
import { supabaseBrowser } from '@/lib/supabase-browser';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

const redirectUrl = typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : '';

export default function SignInForm() {
  const auth = useAuth();
  const { loading } = auth;
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogle = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      if (auth.hasProvider) {
        await auth.signInWithGoogle();
      } else {
        const supabase = supabaseBrowser;
        if (!supabase) {
          setError('Sign-in is not configured');
          return;
        }
        const { error: err } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: { redirectTo: redirectUrl },
        });
        if (err) throw err;
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Google sign-in failed');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;
    setError('');
    setEmailLoading(true);
    try {
      if (auth.hasProvider) {
        const { error: err } = await auth.signInWithOtp(trimmed);
        if (err) setError(err.message);
        else setEmailSent(true);
      } else {
        const supabase = supabaseBrowser;
        if (!supabase) {
          setError('Sign-in is not configured');
          return;
        }
        const { error: err } = await supabase.auth.signInWithOtp({
          email: trimmed,
          options: { emailRedirectTo: redirectUrl },
        });
        if (err) setError(err.message);
        else setEmailSent(true);
      }
    } finally {
      setEmailLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm mx-auto space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold text-foreground">Sign in</h1>
        <p className="text-sm text-muted-foreground">
          Sign in to save and manage your birth charts
        </p>
      </div>

      {error && (
        <p className="text-sm text-destructive font-medium text-center">{error}</p>
      )}

      {emailSent ? (
        <div className="rounded-lg border border-border bg-card p-4 text-center text-sm text-muted-foreground">
          Check your email for the sign-in link. Click it to open your dashboard.
        </div>
      ) : (
        <>
          <Button
            type="button"
            variant="outline"
            className="w-full h-11 text-base"
            onClick={handleGoogle}
            disabled={googleLoading}
          >
            {googleLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" aria-hidden>
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </>
            )}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          <form onSubmit={handleEmail} className="space-y-3">
            <Label htmlFor="auth-email" className="text-foreground">
              Email
            </Label>
            <Input
              id="auth-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11"
              autoComplete="email"
              disabled={emailLoading}
            />
            <Button
              type="submit"
              className="w-full h-11"
              disabled={!email.trim() || emailLoading}
            >
              {emailLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Send magic link'
              )}
            </Button>
          </form>
        </>
      )}
    </div>
  );
}
