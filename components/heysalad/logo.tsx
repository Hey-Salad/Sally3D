import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  size?: number;
}

export function HeySaladLogo({ className, size = 32 }: LogoProps) {
  return (
    <div
      className={cn('flex-shrink-0 relative', className)}
      style={{ width: size, height: size }}
      aria-label="HeySalad logo"
    >
      <Image
        src="/heysalad-logo.png"
        alt="HeySalad"
        width={size}
        height={size}
        className="object-contain"
        priority
      />
    </div>
  );
}
