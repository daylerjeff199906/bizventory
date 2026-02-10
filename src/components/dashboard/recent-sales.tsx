
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SaleList } from "@/apis/app/sales"

interface RecentSalesProps {
    sales: SaleList[]
}

export function RecentSales({ sales }: RecentSalesProps) {
    if (!sales?.length) {
        return <div className="text-sm text-muted-foreground">No hay ventas recientes.</div>
    }

    return (
        <div className="space-y-8">
            {sales.map((sale) => (
                <div key={sale.id} className="flex items-center">
                    <Avatar className="h-9 w-9">
                        <AvatarImage src="/avatars/01.png" alt="Avatar" />
                        <AvatarFallback>{sale.customer?.person?.name?.slice(0, 2).toUpperCase() || 'NA'}</AvatarFallback>
                    </Avatar>
                    <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">{sale.customer?.person?.name || 'Cliente Varios'}</p>
                        <p className="text-xs text-muted-foreground">{sale.customer?.person?.email || 'Sin email'}</p>
                    </div>
                    <div className="ml-auto font-medium">+S/.{Number(sale.total_amount).toFixed(2)}</div>
                </div>
            ))}
        </div>
    )
}
