'use client';

import { useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { LauncherIcon } from './launcher-icon';
import { useAuth } from './auth-provider';
import { ArrowLeft, ArrowRight, Loader2, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = 'email' | 'code';

export function AuthDialog({ open, onOpenChange }: AuthDialogProps) {
  const { signInWithEmailOtp, verifyEmailOtp } = useAuth();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const codeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) {
      // Reset state when dialog closes
      setStep('email');
      setCode('');
      setFirstName('');
      setLastName('');
      setError(null);
      setIsSending(false);
      setIsVerifying(false);
    }
  }, [open]);

  useEffect(() => {
    if (step === 'code' && codeRef.current) {
      codeRef.current.focus();
    }
  }, [step]);

  const handleSendOtp = async () => {
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    setError(null);
    setIsSending(true);
    try {
      await signInWithEmailOtp(trimmed);
      setStep('code');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send code. Try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleVerify = async () => {
    if (code.length !== 6) {
      setError('Enter the 6-digit code from your email.');
      return;
    }
    setError(null);
    setIsVerifying(true);
    try {
      await verifyEmailOtp({
        email: email.trim(),
        code,
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
      });
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid code. Try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCodeChange = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 6);
    setCode(digits);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] bg-card border-border p-0 gap-0 overflow-hidden">
        <div className="flex flex-col items-center px-6 pt-8 pb-2">
          <LauncherIcon size={56} className="mb-4" />
          <DialogHeader className="text-center sm:text-center w-full">
            <DialogTitle className="text-xl font-semibold tracking-tight text-foreground">
              {step === 'email' ? 'Sign in to HeySalad' : 'Check your email'}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mt-1.5">
              {step === 'email'
                ? 'Enter your email and we\'ll send you a 6-digit code.'
                : `We sent a code to ${email}. Enter it below.`}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-6 pb-6 pt-4 space-y-4">
          {step === 'email' ? (
            <>
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
                    placeholder="you@heysalad.com"
                    disabled={isSending}
                    className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-coral/50 transition-colors text-sm"
                  />
                </div>
              </div>

              {error && (
                <p className="text-xs text-destructive">{error}</p>
              )}

              <button
                type="button"
                onClick={handleSendOtp}
                disabled={isSending || !email.trim()}
                className={cn(
                  'w-full flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-medium transition-all',
                  email.trim() && !isSending
                    ? 'bg-coral hover:bg-coral/90 text-white shadow-lg shadow-coral/20'
                    : 'bg-secondary text-muted-foreground cursor-not-allowed'
                )}
              >
                {isSending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending code...
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              <div className="space-y-1.5">
                <label htmlFor="code" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Verification code
                </label>
                <input
                  id="code"
                  ref={codeRef}
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={code}
                  onChange={(e) => handleCodeChange(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && code.length === 6 && handleVerify()}
                  placeholder="000000"
                  disabled={isVerifying}
                  className="w-full px-3 py-3 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-coral/50 transition-colors text-center text-2xl font-mono tracking-[0.5em]"
                  maxLength={6}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label htmlFor="firstName" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    First name
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Optional"
                    disabled={isVerifying}
                    className="w-full px-3 py-2 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-coral/50 transition-colors text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="lastName" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Last name
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Optional"
                    disabled={isVerifying}
                    className="w-full px-3 py-2 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-coral/50 transition-colors text-sm"
                  />
                </div>
              </div>

              {error && (
                <p className="text-xs text-destructive">{error}</p>
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setStep('email')}
                  disabled={isVerifying}
                  className="flex items-center gap-1.5 px-3 py-2.5 rounded-full text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors disabled:opacity-50"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleVerify}
                  disabled={isVerifying || code.length !== 6}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-medium transition-all',
                    code.length === 6 && !isVerifying
                      ? 'bg-coral hover:bg-coral/90 text-white shadow-lg shadow-coral/20'
                      : 'bg-secondary text-muted-foreground cursor-not-allowed'
                  )}
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      Verify and continue
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              <button
                type="button"
                onClick={handleSendOtp}
                disabled={isSending}
                className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {isSending ? 'Resending...' : 'Didn\'t get it? Resend code'}
              </button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
