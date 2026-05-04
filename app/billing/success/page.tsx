'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { LauncherIcon } from '@/components/heysalad/launcher-icon';
import { useAuth } from '@/components/heysalad/auth-provider';
import { confirmCheckout, getSubscription, type Subscription } from '@/lib/heysalad-auth';
import { ArrowRight, CheckCircle2, Loader2, XCircle } from 'lucide-react';

type Status = 'idle' | 'confirming' | 'confirmed' | 'error';

export default function BillingSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id') || searchParams.get('checkout_session_id');
  const { token, refreshUser, isLoading: authLoading } = useAuth();

  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!token) {
      setStatus('error');
      setError('You need to be signed in to confirm this purchase.');
      return;
    }

    let cancelled = false;
    const run = async () => {
      setStatus('confirming');
      try {
        if (sessionId) {
          await confirmCheckout({ token, checkoutSessionId: sessionId });
        }
        const { subscription: sub } = await getSubscription(token);
        if (cancelled) return;
        setSubscription(sub);
        await refreshUser();
        setStatus('confirmed');
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to confirm purchase.');
        setStatus('error');
      }
    };

    run();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, token, sessionId]);

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl p-8 text-center">
        <div className="flex justify-center mb-6">
          <LauncherIcon size={64} />
        </div>

        {status === 'confirming' || status === 'idle' ? (
          <>
            <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-coral" />
            <h1 className="text-xl font-semibold tracking-tight text-foreground mb-2">
              Confirming your subscription
            </h1>
            <p className="text-sm text-muted-foreground">
              Hang tight — we&apos;re activating your new plan.
            </p>
          </>
        ) : status === 'confirmed' ? (
          <>
            <CheckCircle2 className="w-10 h-10 mx-auto mb-4 text-coral" />
            <h1 className="text-xl font-semibold tracking-tight text-foreground mb-2">
              You&apos;re all set
            </h1>
            <p className="text-sm text-muted-foreground mb-6">
              {subscription?.tier && subscription.tier !== 'free'
                ? `Welcome to HeySalad ${subscription.tier.toUpperCase()}. Your new tools are unlocked.`
                : 'Your plan is active. Head back to keep building.'}
            </p>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-coral hover:bg-coral/90 text-white text-sm font-medium transition-colors shadow-lg shadow-coral/20"
            >
              Back to HeySalad
              <ArrowRight className="w-4 h-4" />
            </Link>
          </>
        ) : (
          <>
            <XCircle className="w-10 h-10 mx-auto mb-4 text-destructive" />
            <h1 className="text-xl font-semibold tracking-tight text-foreground mb-2">
              Something went wrong
            </h1>
            <p className="text-sm text-muted-foreground mb-6">{error}</p>
            <Link
              href="/billing"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-secondary hover:bg-secondary/80 text-foreground text-sm font-medium transition-colors"
            >
              Try again
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
