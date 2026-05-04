'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useAuth } from './auth-provider';
import {
  createCheckout,
  getBillingTiers,
  getSubscription,
  type BillingTier,
  type Subscription,
  type Tier,
} from '@/lib/heysalad-auth';
import { Check, Loader2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BillingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const FALLBACK_TIERS: BillingTier[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Try HeySalad with the basics.',
    priceMonthly: 0,
    currency: 'USD',
    features: ['Conversational design chat', '3D parametric preview', 'Standard templates'],
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'For serious makers and tinkerers.',
    priceMonthly: 19,
    currency: 'USD',
    popular: true,
    features: ['Everything in Free', 'Unlimited STL downloads', 'Higher CAD generation limits', 'Priority queue'],
  },
  {
    id: 'max',
    name: 'MAX',
    description: 'For pros and small teams.',
    priceMonthly: 49,
    currency: 'USD',
    features: ['Everything in Pro', '3D printer control & monitoring', 'Deep research mode', 'API access'],
  },
];

export function BillingDialog({ open, onOpenChange }: BillingDialogProps) {
  const { user, token, tier: currentTier } = useAuth();
  const [tiers, setTiers] = useState<BillingTier[]>(FALLBACK_TIERS);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState<Tier | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.allSettled([
      getBillingTiers(),
      token ? getSubscription(token) : Promise.resolve({ subscription: null }),
    ])
      .then(([tiersRes, subRes]) => {
        if (cancelled) return;
        if (tiersRes.status === 'fulfilled' && tiersRes.value.tiers?.length) {
          setTiers(tiersRes.value.tiers);
        }
        if (subRes.status === 'fulfilled' && 'subscription' in subRes.value && subRes.value.subscription) {
          setSubscription(subRes.value.subscription as Subscription);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, token]);

  const handleUpgrade = async (tier: Tier) => {
    if (!token || tier === 'free') return;
    setCheckoutLoading(tier);
    setError(null);
    try {
      const origin = window.location.origin;
      const { url } = await createCheckout({
        token,
        tier: tier as 'pro' | 'max',
        successUrl: `${origin}/billing/success`,
        cancelUrl: `${origin}/billing`,
      });
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('No checkout URL returned.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start checkout.');
      setCheckoutLoading(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[720px] bg-card border-border p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-xl font-semibold tracking-tight text-foreground">
            Manage your plan
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {subscription?.tier && subscription.tier !== 'free'
              ? `You\'re on the ${subscription.tier.toUpperCase()} plan.`
              : 'Upgrade to unlock STL downloads, printer control, and deep research.'}
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-6 pt-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {tiers.map((tier) => {
                const isCurrent = currentTier === tier.id;
                const isUpgrading = checkoutLoading === tier.id;
                const ctaDisabled = isCurrent || tier.id === 'free' || !user;

                return (
                  <div
                    key={tier.id}
                    className={cn(
                      'relative flex flex-col rounded-2xl border p-5 transition-colors',
                      tier.popular
                        ? 'border-coral/40 bg-coral-glow'
                        : 'border-border bg-secondary/40'
                    )}
                  >
                    {tier.popular && (
                      <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-coral text-white text-[10px] font-semibold tracking-wider uppercase">
                        Popular
                      </div>
                    )}

                    <div className="flex items-baseline justify-between mb-1">
                      <h3 className="text-base font-semibold text-foreground">{tier.name}</h3>
                      {isCurrent && (
                        <span className="text-[10px] font-semibold tracking-wider uppercase text-coral">
                          Current
                        </span>
                      )}
                    </div>

                    <div className="flex items-baseline gap-1 mb-3">
                      <span className="text-2xl font-bold text-foreground">
                        {typeof tier.priceMonthly === 'number'
                          ? tier.priceMonthly === 0
                            ? 'Free'
                            : `$${tier.priceMonthly}`
                          : '—'}
                      </span>
                      {typeof tier.priceMonthly === 'number' && tier.priceMonthly > 0 && (
                        <span className="text-xs text-muted-foreground">/month</span>
                      )}
                    </div>

                    {tier.description && (
                      <p className="text-xs text-muted-foreground mb-4 min-h-[32px]">
                        {tier.description}
                      </p>
                    )}

                    <ul className="space-y-1.5 mb-5 flex-1">
                      {(tier.features ?? []).map((feature) => (
                        <li key={feature} className="flex items-start gap-2 text-xs text-foreground/80">
                          <Check className="w-3.5 h-3.5 text-coral mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      type="button"
                      onClick={() => handleUpgrade(tier.id)}
                      disabled={ctaDisabled || isUpgrading}
                      className={cn(
                        'w-full flex items-center justify-center gap-2 py-2 rounded-full text-sm font-medium transition-all',
                        ctaDisabled
                          ? 'bg-secondary text-muted-foreground cursor-not-allowed'
                          : tier.popular
                          ? 'bg-coral hover:bg-coral/90 text-white shadow-lg shadow-coral/20'
                          : 'bg-foreground text-background hover:bg-foreground/90'
                      )}
                    >
                      {isUpgrading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Redirecting...
                        </>
                      ) : isCurrent ? (
                        'Current plan'
                      ) : tier.id === 'free' ? (
                        'Included'
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          Upgrade to {tier.name}
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {error && (
            <p className="text-xs text-destructive mt-4 text-center">{error}</p>
          )}

          {!user && (
            <p className="text-xs text-muted-foreground mt-4 text-center">
              Sign in to upgrade your plan.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
