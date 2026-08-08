import { CardSkeleton } from '@/components/ui/Skeleton';

/**
 * Fallback shown while a teacher route segment loads.
 *
 * See app/admin/loading.js — same rationale: these pages fetch client-side, so without a
 * boundary the content region stays blank until hydration and the first request finish.
 */
export default function TeacherLoading() {
  return (
    <div className="mx-auto w-full max-w-[1500px] animate-pulse">
      <div className="mb-6 space-y-2">
        <div className="skeleton h-8 w-56 rounded" />
        <div className="skeleton h-4 w-72 rounded" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
