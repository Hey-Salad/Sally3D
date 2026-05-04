/**
 * HeySalad Auth API client.
 * Source of truth for auth + billing across HeySalad apps.
 * Base URL can be overridden via NEXT_PUBLIC_HEYSALAD_AUTH_API_URL.
 */

export const AUTH_API_BASE_URL =
  process.env.NEXT_PUBLIC_HEYSALAD_AUTH_API_URL ||
  'https://heysalad-v0-auth-api.heysalad-o.workers.dev';

export type Tier = 'free' | 'pro' | 'max';

export interface HeySaladUser {
  id: string;
  email: string;
  name?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  tier: Tier;
  role?: string;
  avatarUrl?: string | null;
}

export interface BillingTier {
  id: Tier;
  name: string;
  description?: string;
  priceMonthly?: number;
  priceYearly?: number;
  currency?: string;
  features?: string[];
  popular?: boolean;
}

export interface Subscription {
  tier: Tier;
  status?: string;
  currentPeriodEnd?: string | null;
  cancelAtPeriodEnd?: boolean;
}

class AuthApiError extends Error {
  status: number;
  body: unknown;
  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = 'AuthApiError';
    this.status = status;
    this.body = body;
  }
}

async function request<T>(
  path: string,
  options: RequestInit & { token?: string } = {}
): Promise<T> {
  const { token, headers, ...rest } = options;
  const res = await fetch(`${AUTH_API_BASE_URL}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers || {}),
    },
  });

  let body: unknown = null;
  const text = await res.text();
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }

  if (!res.ok) {
    const message =
      (body && typeof body === 'object' && 'message' in body && typeof (body as Record<string, unknown>).message === 'string'
        ? (body as { message: string }).message
        : null) ||
      (body && typeof body === 'object' && 'error' in body && typeof (body as Record<string, unknown>).error === 'string'
        ? (body as { error: string }).error
        : null) ||
      `Request failed with status ${res.status}`;
    throw new AuthApiError(message, res.status, body);
  }

  return body as T;
}

export async function sendEmailOtp(email: string): Promise<{ success: boolean; message?: string }> {
  return request('/auth/email/start', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export interface VerifyOtpInput {
  email: string;
  code: string;
  firstName?: string;
  lastName?: string;
}

export interface VerifyOtpResponse {
  success: boolean;
  token: string;
  user: HeySaladUser;
}

export async function verifyEmailOtp(input: VerifyOtpInput): Promise<VerifyOtpResponse> {
  return request<VerifyOtpResponse>('/auth/email/verify', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function getMe(token: string): Promise<{ user: HeySaladUser }> {
  return request<{ user: HeySaladUser }>('/auth/me', { token });
}

export async function validateToken(token: string): Promise<{ valid: boolean }> {
  return request<{ valid: boolean }>('/auth/token/validate', {
    method: 'POST',
    token,
  });
}

export async function getBillingTiers(): Promise<{ tiers: BillingTier[] }> {
  return request<{ tiers: BillingTier[] }>('/billing/tiers');
}

export async function getSubscription(token: string): Promise<{ subscription: Subscription }> {
  return request<{ subscription: Subscription }>('/billing/subscription', { token });
}

export interface CheckoutInput {
  token: string;
  tier: 'pro' | 'max';
  successUrl: string;
  cancelUrl: string;
}

export async function createCheckout(input: CheckoutInput): Promise<{ url: string }> {
  const { token, ...body } = input;
  return request<{ url: string }>('/billing/checkout', {
    method: 'POST',
    token,
    body: JSON.stringify(body),
  });
}

export interface ConfirmCheckoutInput {
  token: string;
  checkoutSessionId: string;
}

export async function confirmCheckout(
  input: ConfirmCheckoutInput
): Promise<{ success: boolean; subscription?: Subscription }> {
  const { token, checkoutSessionId } = input;
  return request<{ success: boolean; subscription?: Subscription }>('/billing/confirm', {
    method: 'POST',
    token,
    body: JSON.stringify({ checkoutSessionId }),
  });
}

export { AuthApiError };
