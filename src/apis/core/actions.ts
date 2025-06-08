import { useRouter } from 'next/navigation'

export const handleLogout = async (router: ReturnType<typeof useRouter>) => {
  try {
    const response = await fetch('/api/logout', {
      method: 'POST'
    })

    if (response.ok) {
      router.push('/login')
      router.refresh()
    }
  } catch (error) {
    console.error('Error al cerrar sesión:', error)
  }
}

