import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  size?: number;
}

export function HeySaladLogo({ className, size = 32 }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('flex-shrink-0', className)}
      aria-label="HeySalad logo"
    >
      {/* Left leaf */}
      <path
        d="M14 8 C 8 8, 4 14, 6 22 C 8 28, 14 32, 20 30 C 18 24, 16 18, 14 8 Z"
        fill="var(--coral)"
      />
      {/* Right leaf */}
      <path
        d="M26 8 C 32 8, 36 14, 34 22 C 32 28, 26 32, 20 30 C 22 24, 24 18, 26 8 Z"
        fill="var(--coral)"
        fillOpacity="0.85"
      />
      {/* Center vein */}
      <path
        d="M20 10 L20 30"
        stroke="var(--background)"
        strokeWidth="0.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
