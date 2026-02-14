import { Suspense } from 'react'
import { ForgotPassword } from '@/components/app/auth/forgot-password'
import { SearchParams } from '@/types'

interface PageProps {
    searchParams?: SearchParams
}

export default async function Page(props: PageProps) {
    const searchParams = await props.searchParams

    const token = searchParams?.code?.toString()
    const error = searchParams?.error?.toString()
    const type = searchParams?.type?.toString() as
        | 'with-otp'
        | 'recovery'
        | undefined

    return (
        <>
            <Suspense
                fallback={
                    <div className="flex items-center justify-center py-12">
                        <div className="flex items-center space-x-3">
                            <svg
                                className="w-6 h-6 text-gray-600 animate-spin"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                />
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                />
                            </svg>
                            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                                Loading…
                            </p>
                        </div>
                    </div>
                }
            >
                <ForgotPassword error={error} token={token} type={type} />
            </Suspense>
        </>
    )
}
