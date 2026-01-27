import { Skeleton } from '@/components/ui/skeleton'

interface SkeletonTableProps {
  columns?: number
  rows?: number
}

export const SkeletonTable = ({
  columns = 6,
  rows = 8
}: SkeletonTableProps) => {
  return (
    <div className="overflow-x-auto w-full">
      <table className="min-w-full table-auto border border-gray-200 rounded-md">
        <thead>
          <tr className="bg-muted">
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} className="p-3">
                <Skeleton className="h-4 w-24" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, rowIdx) => (
            <tr
              key={rowIdx}
              className={rowIdx % 2 === 0 ? '' : ''}
            >
              {Array.from({ length: columns }).map((_, colIdx) => (
                <td key={colIdx} className="p-3">
                  <Skeleton className="h-4 w-full max-w-[150px]" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
