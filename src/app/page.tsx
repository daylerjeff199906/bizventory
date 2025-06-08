import { APP_URLS } from '@/config/app-urls'
import { redirect } from 'next/navigation'

export default function Home() {
  redirect(APP_URLS.BASE)
}
