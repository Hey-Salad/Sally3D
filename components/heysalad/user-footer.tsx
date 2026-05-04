'use client';

import { useState } from 'react';
import { useAuth } from './auth-provider';
import { AuthDialog } from './auth-dialog';
import { BillingDialog } from './billing-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CreditCard, LogIn, LogOut, Sparkles, User as UserIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

function getInitials(user: { name?: string | null; firstName?: string | null; lastName?: string | null; email: string }) {
  const fullName = user.name || [user.firstName, user.lastName].filter(Boolean).join(' ');
  if (fullName) {
    return fullName
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('');
  }
  return user.email.charAt(0).toUpperCase();
}

function getDisplayName(user: { name?: string | null; firstName?: string | null; lastName?: string | null; email: string }) {
  return user.name || [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email.split('@')[0];
}

interface UserFooterProps {
  collapsed?: boolean;
}

export function UserFooter({ collapsed = false }: UserFooterProps) {
  const { user, isAuthenticated, isLoading, signOut } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [billingOpen, setBillingOpen] = useState(false);

  if (isLoading) {
    return (
      <div className={cn('p-3', collapsed ? 'flex justify-center' : '')}>
        <div className={cn('rounded-full bg-secondary/60 animate-pulse', collapsed ? 'w-9 h-9' : 'w-full h-12')} />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    if (collapsed) {
      return (
        <>
          <button
            type="button"
            onClick={() => setAuthOpen(true)}
            className="m-2 p-2 rounded-lg hover:bg-sidebar-accent transition-colors text-sidebar-foreground/80 hover:text-sidebar-foreground"
            aria-label="Sign in"
            title="Sign in"
          >
            <LogIn className="w-5 h-5" />
          </button>
          <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
        </>
      );
    }

    return (
      <>
        <div className="p-3 border-t border-sidebar-border">
          <button
            type="button"
            onClick={() => setAuthOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full bg-coral hover:bg-coral/90 text-white text-sm font-medium transition-colors shadow-lg shadow-coral/20"
          >
            <LogIn className="w-4 h-4" />
            Sign in
          </button>
          <p className="text-[11px] text-sidebar-foreground/40 text-center mt-2">
            Save your designs across devices.
          </p>
        </div>
        <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
      </>
    );
  }

  const initials = getInitials(user);
  const displayName = getDisplayName(user);
  const tierLabel = user.tier.toUpperCase();

  if (collapsed) {
    return (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="m-2 w-9 h-9 rounded-full bg-coral text-white text-xs font-semibold flex items-center justify-center hover:opacity-90 transition-opacity"
              aria-label="Account menu"
            >
              {initials}
            </button>
          </DropdownMenuTrigger>
          <UserMenuContent
            user={user}
            displayName={displayName}
            tierLabel={tierLabel}
            onUpgrade={() => setBillingOpen(true)}
            onSignOut={signOut}
          />
        </DropdownMenu>
        <BillingDialog open={billingOpen} onOpenChange={setBillingOpen} />
      </>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="w-full flex items-center gap-3 p-3 hover:bg-sidebar-accent transition-colors text-left border-t border-sidebar-border"
          >
            <div className="w-9 h-9 rounded-full bg-coral text-white text-xs font-semibold flex items-center justify-center flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">{displayName}</p>
              <div className="flex items-center gap-1.5">
                <span
                  className={cn(
                    'text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded',
                    user.tier === 'free'
                      ? 'bg-secondary text-muted-foreground'
                      : 'bg-coral-glow text-coral border border-coral/30'
                  )}
                >
                  {tierLabel}
                </span>
                <span className="text-[10px] text-sidebar-foreground/50 truncate">
                  {user.tier === 'free' ? 'Personal Plan' : 'Premium'}
                </span>
              </div>
            </div>
          </button>
        </DropdownMenuTrigger>
        <UserMenuContent
          user={user}
          displayName={displayName}
          tierLabel={tierLabel}
          onUpgrade={() => setBillingOpen(true)}
          onSignOut={signOut}
        />
      </DropdownMenu>
      <BillingDialog open={billingOpen} onOpenChange={setBillingOpen} />
    </>
  );
}

interface UserMenuContentProps {
  user: { email: string; tier: string };
  displayName: string;
  tierLabel: string;
  onUpgrade: () => void;
  onSignOut: () => void;
}

function UserMenuContent({ user, displayName, tierLabel, onUpgrade, onSignOut }: UserMenuContentProps) {
  return (
    <DropdownMenuContent align="end" side="top" className="w-56 bg-popover border-border">
      <DropdownMenuLabel className="flex flex-col gap-0.5">
        <span className="text-sm font-medium text-foreground truncate">{displayName}</span>
        <span className="text-xs text-muted-foreground truncate font-normal">{user.email}</span>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem onSelect={onUpgrade} className="cursor-pointer">
        {user.tier === 'free' ? (
          <>
            <Sparkles className="w-4 h-4 mr-2 text-coral" />
            <span>Upgrade plan</span>
          </>
        ) : (
          <>
            <CreditCard className="w-4 h-4 mr-2" />
            <span>Manage plan</span>
            <span className="ml-auto text-[10px] font-semibold text-coral">{tierLabel}</span>
          </>
        )}
      </DropdownMenuItem>
      <DropdownMenuItem className="cursor-pointer">
        <UserIcon className="w-4 h-4 mr-2" />
        <span>Account</span>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem onSelect={onSignOut} className="cursor-pointer">
        <LogOut className="w-4 h-4 mr-2" />
        <span>Sign out</span>
      </DropdownMenuItem>
    </DropdownMenuContent>
  );
}
