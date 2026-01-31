# Plan de Implementación: Eliminar Compra con Reversión de Stock

Este plan describe los pasos para permitir la eliminación de compras desde el listado, asegurando que el stock se revierta correctamente.

> [!NOTE]
> El sistema calcula el stock dinámicamente sumando los registros de la tabla `inventory_movements`. Por lo tanto, para "revertir" el stock al eliminar una compra, debemos **eliminar los movimientos de inventario** generados por esa compra.

## Cambios Propuestos

### Base de Datos (SQL)
Se requiere una función RPC para limpiar los movimientos de inventario asociados.

#### [NEW] Función RPC `delete_purchase_inventory_movements`

```sql
create or replace function delete_purchase_inventory_movements(p_purchase_id uuid)
returns void
language plpgsql
as $$
begin
  -- Eliminar movimientos de inventario asociados a esta compra
  delete from inventory_movements 
  where reference_id = p_purchase_id 
  and reference_type = 'purchase'; -- Asumiendo 'purchase' como el tipo de referencia usado
end;
$$;
```

### Backend (`src/apis/app/purchases.ts`)
Modificar la función `deletePurchase`:

#### [MODIFY] `src/apis/app/purchases.ts`
- **Lógica:**
    1. Obtener la compra para verificar su estado.
    2. Si `status === 'completed'`, llamar a `delete_purchase_inventory_movements`.
    3. Eliminar `purchase_items` (comportamiento actual).
    4. Eliminar `purchases` (comportamiento actual).

### Frontend (`src/modules/purchases/page/purchases-page-list.tsx`)
Agregar la funcionalidad en la UI.

#### [MODIFY] `src/modules/purchases/page/purchases-page-list.tsx`
- Agregar dialogo de confirmación con alerta: "Esto eliminará permanentemente la compra. Si la compra estaba completada, el stock se descontará automáticamente."
- Llamar a `deletePurchase`.

## Pasos para el Usuario

1. **Ejecutar SQL:** Correr el script para eliminar movimientos.
2. **Modificar Código:** Aplicar los cambios en Backend y Frontend.
