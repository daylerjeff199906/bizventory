'use client'
import {
  Package,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  FileText,
  Eye,
  Edit,
  Trash2
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import Link from 'next/link'
import { APP_URLS } from '@/config/app-urls'

// Datos de ejemplo
const inventoryStats = {
  totalProducts: 1247,
  totalValue: 89750,
  lowStock: 23,
  outOfStock: 5
}

const recentMovements = [
  {
    id: 1,
    product: 'Laptop Dell XPS 13',
    type: 'entrada',
    quantity: 15,
    date: '2024-01-15',
    user: 'Ana García'
  },
  {
    id: 2,
    product: 'Mouse Logitech MX',
    type: 'salida',
    quantity: 8,
    date: '2024-01-15',
    user: 'Carlos López'
  },
  {
    id: 3,
    product: 'Teclado Mecánico',
    type: 'entrada',
    quantity: 25,
    date: '2024-01-14',
    user: 'María Rodríguez'
  },
  {
    id: 4,
    product: 'Monitor Samsung 24"',
    type: 'salida',
    quantity: 3,
    date: '2024-01-14',
    user: 'Juan Pérez'
  },
  {
    id: 5,
    product: 'Auriculares Sony',
    type: 'entrada',
    quantity: 30,
    date: '2024-01-13',
    user: 'Ana García'
  }
]

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

export default function InventoryDashboard() {
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
                  <TableHead>Usuario</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentMovements.map((movement) => (
                  <TableRow key={movement.id}>
                    <TableCell className="font-medium">
                      {movement.product}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          movement.type === 'entrada' ? 'default' : 'secondary'
                        }
                        className={
                          movement.type === 'entrada'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }
                      >
                        {movement.type === 'entrada' ? (
                          <TrendingUp className="mr-1 h-3 w-3" />
                        ) : (
                          <TrendingDown className="mr-1 h-3 w-3" />
                        )}
                        {movement.type}
                      </Badge>
                    </TableCell>
                    <TableCell>{movement.quantity}</TableCell>
                    <TableCell>{movement.date}</TableCell>
                    <TableCell>{movement.user}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            Ver Detalles
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
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
