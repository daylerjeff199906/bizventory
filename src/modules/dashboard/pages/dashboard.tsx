'use client'
import {
  Package,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  FileText,
  Eye
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import Link from 'next/link'
import { APP_URLS } from '@/config/app-urls'
import { InventoryMovementWithProduct } from '@/types'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

// Datos de ejemplo
const inventoryStats = {
  totalProducts: 1247,
  totalValue: 89750,
  lowStock: 23,
  outOfStock: 5
}

const lowStockProducts = [
  {
    id: 1,
    name: 'Cables USB-C',
    current: 5,
    minimum: 20,
    category: 'Accesorios'
  },
  {
    id: 2,
    name: 'Baterías AA',
    current: 12,
    minimum: 50,
    category: 'Consumibles'
  },
  { id: 3, name: 'Papel A4', current: 8, minimum: 25, category: 'Oficina' },
  {
    id: 4,
    name: 'Tinta Impresora',
    current: 3,
    minimum: 15,
    category: 'Consumibles'
  }
]

interface InventoryDashboardProps {
  movements?: InventoryMovementWithProduct[]
}

export default function InventoryDashboard({
  movements
}: InventoryDashboardProps) {
  return (
    <main className="flex-1 space-y-6 p-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Productos
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {inventoryStats.totalProducts.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              +12% desde el mes pasado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${inventoryStats.totalValue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              +8% desde el mes pasado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Bajo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {inventoryStats.lowStock}
            </div>
            <p className="text-xs text-muted-foreground">Requieren atención</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sin Stock</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {inventoryStats.outOfStock}
            </div>
            <p className="text-xs text-muted-foreground">
              Necesitan reposición
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Movements */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Movimientos Recientes</CardTitle>
                <CardDescription>
                  Últimas entradas y salidas de inventario
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Cantidad</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movements &&
                  movements.length > 0 &&
                  movements?.map((movement) => (
                    <TableRow key={movement.id}>
                      <TableCell className="font-medium text-sm">
                        {movement.product?.brand?.name}{' '}
                        {movement.product?.description}{' '}
                        {movement?.variant?.name || ' '}{' '}
                        {movement?.variant?.attributes &&
                          movement?.variant?.attributes
                            ?.map((attr) => `${attr.attribute_value}`)
                            .join(', ')}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            movement.movement_type === 'entry'
                              ? 'default'
                              : 'secondary'
                          }
                          className={cn(
                            'rounded-full',
                            movement.movement_type === 'entry'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          )}
                        >
                          {movement.movement_type === 'entry' ? (
                            <TrendingUp className="mr-1 h-3 w-3" />
                          ) : (
                            <TrendingDown className="mr-1 h-3 w-3" />
                          )}
                          {movement.movement_type === 'entry'
                            ? 'Entrada'
                            : 'Salida'}
                        </Badge>
                      </TableCell>
                      <TableCell>{movement.quantity}</TableCell>
                      <TableCell>
                        {movement.date &&
                          format(new Date(movement.date), 'dd/MM/yyyy HH:mm')}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}

                {(!movements || movements.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      No hay movimientos recientes
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Low Stock Alert */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Alertas de Stock
            </CardTitle>
            <CardDescription>Productos con stock bajo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {lowStockProducts.map((product) => (
              <div key={product.id} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{product.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {product.category}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    Stock: {product.current}/{product.minimum}
                  </span>
                  <span>
                    {Math.round((product.current / product.minimum) * 100)}%
                  </span>
                </div>
                {/* <Progress
                  value={(product.current / product.minimum) * 100}
                  className="h-2"
                /> */}
              </div>
            ))}
            <Button className="w-full" size="sm">
              Ver Todas las Alertas
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
          <CardDescription>Operaciones frecuentes del sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button className="h-20 flex-col gap-2" variant="outline" asChild>
              <Link href={APP_URLS.PURCHASES.CREATE}>
                <TrendingUp className="h-6 w-6" />
                <span>Registrar Entrada</span>
              </Link>
            </Button>
            <Button className="h-20 flex-col gap-2" variant="outline" asChild>
              <Link href={APP_URLS.SALES.CREATE}>
                <TrendingDown className="h-6 w-6" />
                <span>Registrar Salida</span>
              </Link>
            </Button>
            <Button className="h-20 flex-col gap-2" variant="outline" asChild>
              <Link href={APP_URLS.PRODUCTS.CREATE}>
                <Package className="h-6 w-6" />
                <span>Nuevo Producto</span>
              </Link>
            </Button>
            <Button className="h-20 flex-col gap-2" variant="outline">
              <FileText className="h-6 w-6" />
              <span>Generar Reporte</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
