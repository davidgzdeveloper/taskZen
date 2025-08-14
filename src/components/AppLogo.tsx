import { Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AppLogo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Flame className="h-6 w-6 text-primary" />
      <span className="text-xl font-bold text-primary">TaskZen</span>
    </div>
  );
}
