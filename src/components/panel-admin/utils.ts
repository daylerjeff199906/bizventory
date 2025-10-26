export function getInitials(name: string) {
  if (!name) return ''
  const parts = name.trim().split(/\s+/)
  const initials = parts
    .map((part) => part[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()
  return initials
}
