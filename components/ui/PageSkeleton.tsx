import { Skeleton } from "@/components/ui/skeleton";

export const PageSkeleton = () => {
  return (
    <div className="w-full min-h-screen p-6 space-y-8 animate-in fade-in duration-700">
      {/* Dynamic Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-3">
          <Skeleton className="h-10 w-72 rounded-lg" />
          <Skeleton className="h-5 w-48 rounded-md opacity-60" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-11 w-11 rounded-full" />
          <Skeleton className="h-11 w-32 rounded-lg" />
        </div>
      </div>

      {/* Featured Banner Skeleton */}
      <Skeleton className="h-64 w-full rounded-3xl" />

      {/* Stats/Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-6 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <Skeleton className="h-4 w-12" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex gap-4 p-4 rounded-xl border border-slate-50 dark:border-slate-900"
              >
                <Skeleton className="h-20 w-20 rounded-lg shrink-0" />
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <div className="flex gap-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar/Right Content */}
        <div className="space-y-6">
          <Skeleton className="h-8 w-32" />
          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/50 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-2/3 opacity-60" />
                </div>
              </div>
            ))}
            <Skeleton className="h-10 w-full rounded-xl mt-4" />
          </div>
        </div>
      </div>
    </div>
  );
};
