import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LauncherIconProps {
  size?: number;
  className?: string;
}

export function LauncherIcon({ size = 32, className }: LauncherIconProps) {
  return (
    <div
      className={cn('relative overflow-hidden rounded-lg flex-shrink-0', className)}
      style={{ width: size, height: size }}
    >
      <Image
        src="/heysalad-launcher.jpg"
        alt="HeySalad"
        width={size}
        height={size}
        className="object-cover"
        priority
      />
    </div>
  );
}
