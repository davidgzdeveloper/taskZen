import { cn } from '@/lib/utils';

/** Wordmark: three focus pips, the last one in progress. */
export function AppLogo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <span aria-hidden className="flex items-center gap-[3px]">
        <span className="h-2.5 w-2.5 rounded-full bg-focus" />
        <span className="h-2.5 w-2.5 rounded-full bg-focus" />
        <span className="h-2.5 w-2.5 rounded-full border-[1.5px] border-focus" />
      </span>
      <span className="font-headline text-xl font-bold tracking-tight text-foreground">TaskZen</span>
    </div>
  );
}
