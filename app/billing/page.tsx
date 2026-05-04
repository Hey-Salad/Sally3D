'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { LauncherIcon } from '@/components/heysalad/launcher-icon';
import { BillingDialog } from '@/components/heysalad/billing-dialog';
import { useAuth } from '@/components/heysalad/auth-provider';
import { ArrowLeft } from 'lucide-react';

export default function BillingLandingPage() {
  const { isLoading } = useAuth();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!isLoading) setOpen(true);
  }, [isLoading]);

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl p-8 text-center">
        <div className="flex justify-center mb-6">
          <LauncherIcon size={64} />
        </div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground mb-2">
          Manage your HeySalad plan
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          Pick the tier that matches how you build hardware.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-secondary hover:bg-secondary/80 text-foreground text-sm font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="px-5 py-2 rounded-full bg-coral hover:bg-coral/90 text-white text-sm font-medium transition-colors shadow-lg shadow-coral/20"
          >
            View plans
          </button>
        </div>
      </div>
      <BillingDialog open={open} onOpenChange={setOpen} />
    </main>
  );
}
