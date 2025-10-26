import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, idx) => (
          <div
            key={idx}
            className="shadow-none border border-border relative group bg-white rounded-lg min-h-[200px]"
          >
            <div className="px-3 py-12 h-full">
              <div className="flex items-start gap-4">
                {/* Avatar Skeleton */}
                <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
                <div className="absolute right-4 top-4 p-1 rounded-full">
                  <Skeleton className="h-4 w-4 rounded-full" />
                </div>
                {/* Main Content Skeleton */}
                <div className="flex-1 min-w-0 space-y-2">
                  <Skeleton className="h-4 w-32 mb-2" />
                  <div className="flex gap-2 mb-3">
                    <Skeleton className="h-4 w-16 rounded-full" />
                    <Skeleton className="h-4 w-16 rounded-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-28" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
