import { SkeletonTable } from '@/components/app/skeleton-table'

export default function Loading() {
  return <SkeletonTable columns={6} rows={6} />
}
