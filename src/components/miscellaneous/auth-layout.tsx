import { cn } from '@/lib/utils'

interface AuthLayoutProps {
    children: React.ReactNode
    title: string
    subTitle?: string
    hiddenName?: boolean
    logoSize?: number
    className?: string
}

export function AuthLayout({
    children,
    title,
    subTitle,
    className
}: AuthLayoutProps) {
    return (
        <div className={cn('flex min-h-screen flex-col items-center justify-center p-4', className)}>
            <div className="w-full max-w-sm space-y-6">
                <div className="space-y-2 text-center">
                    <h1 className="text-2xl font-bold">{title}</h1>
                    {subTitle && <p className="text-muted-foreground text-sm">{subTitle}</p>}
                </div>
                {children}
            </div>
        </div>
    )
}
