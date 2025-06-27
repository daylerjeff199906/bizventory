import { SkeletonTable } from '@/components/app/skeleton-table'

export default function Loading() {
  return <SkeletonTable columns={8} rows={10} />
}
