import { TableSkeleton } from '@/components/ui/Skeleton';

/**
 * Fallback shown while an admin route segment loads.
 *
 * Every admin page is a client component that fetches in `useEffect`, so navigation
 * previously showed an empty region for the whole JS-download → hydrate → fetch chain.
 * This renders immediately from the shared layout instead.
 */
export default function AdminLoading() {
  return (
    <div className="mx-auto w-full max-w-[1500px] animate-pulse">
      <div className="mb-6 space-y-2">
        <div className="skeleton h-3 w-28 rounded" />
        <div className="skeleton h-8 w-56 rounded" />
        <div className="skeleton h-4 w-80 rounded" />
      </div>
      <div className="rounded-xl border border-neutral-200 bg-white p-4">
        <TableSkeleton rows={8} cols={5} />
      </div>
    </div>
  );
}
