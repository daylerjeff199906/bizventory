# Contexto de Base de Datos - Bizventory

Este documento describe la estructura de la base de datos del proyecto Bizventory, inferida a partir de las definiciones de tipos TypeScript y el uso de Supabase en el código.

## Tecnologías
- **Base de Datos:** PostgreSQL (vía Supabase)
- **ORM/Query Builder:** Supabase Client (`@supabase/ssr`)
- **Gestión de Tipos:** TypeScript manual (inferido)

## Esquema de Tablas (Inferred)

### `products`
Almacena la información principal de los productos.
- `id` (uuid): Identificador único.
- `name` (text): Nombre del producto.
- `description` (text, nullable): Descripción detallada.
- `code` (text): Código interno del producto (SKU).
- `category_id` (numeric, nullable): ID de la categoría (referencia externa o enum).
- `unit` (text): Unidad de medida.
- `brand_id` (uuid, nullable): Referencia a la tabla `brands`.
- `supplier_code` (text, nullable): Código del proveedor.
- `location` (text, nullable): Ubicación en almacén.
- `created_at` (timestamp): Fecha de creación.
- `updated_at` (timestamp, nullable): Fecha de actualización.
- `is_active` (boolean): Estado del producto.
- `has_variants` (boolean): Indica si tiene variantes.
- `tags` (text[] | jsonb, nullable): Etiquetas.

### `product_images` (Inferred via `ProductImage`)
Imágenes asociadas a los productos.
- `uuid` (uuid): Identificador único.
- `product_uuid` (uuid): Referencia a `products.id`.
- `url` (text): URL de la imagen.
- `is_banner` (boolean): Si es imagen principal/banner.
- `created_at` (timestamp)
- `updated_at` (timestamp)

### `brands`
Marcas de productos.
- `id` (uuid): ID único.
- `name` (text): Nombre de la marca.
- `business_id` (uuid): Referencia al negocio.
- `logo_url` (text, nullable): URL del logo.
- `status` (text): Estado (activo/inactivo).
- `created_at` (timestamp)
- `updated_at` (timestamp)

### `product_variants`
Variantes de un producto (talla, color, etc.).
- `id` (uuid): ID único.
- `product_id` (uuid): Referencia a `products.id`.
- `name` (text): Nombre de la variante.
- `description` (text, nullable): Descripción.
- `code` (text): Código/SKU de la variante.
- `created_at` (timestamp)
- `updated_at` (timestamp, nullable)

### `product_variant_attributes`
Atributos específicos de las variantes.
- `id` (uuid): ID único.
- `variant_id` (uuid): Referencia a `product_variants.id`.
- `attribute_type` (text): Tipo de atributo (ej. "Color").
- `attribute_value` (text): Valor (ej. "Rojo").
- `created_at` (timestamp)
- `updated_at` (timestamp, nullable)

### `sales`
Registro de ventas.
- `id` (uuid): ID único.
- `date` (timestamp/date): Fecha de venta.
- `total_amount` (numeric): Monto total.
- `customer_id` (uuid, nullable): Referencia a `customers.id`.
- `status` (text): Estado (ej. 'pending', 'completed').
- `payment_method` (text, nullable): Método de pago.
- `shipping_address` (text, nullable): Dirección de envío.
- `tax_amount` (numeric): Impuestos.
- `discount_amount` (numeric): Descuento total.
- `total_items` (numeric): Cantidad de items.
- `reference_number` (text): Número de referencia/factura.
- `salesperson_id` (uuid, nullable): Vendedor.
- `business_id` (uuid): Referencia al negocio.
- `created_at` (timestamp)
- `updated_at` (timestamp)

### `sale_items`
Detalle de items en una venta.
- `id` (uuid): ID único.
- `sale_id` (uuid): Referencia a `sales.id`.
- `product_id` (uuid, nullable): Referencia a `products.id`.
- `product_variant_id` (uuid, nullable): Referencia a `product_variants.id`.
- `quantity` (numeric): Cantidad vendida.
- `unit_price` (numeric): Precio unitario.
- `discount_amount` (numeric): Descuento por item.
- `total_price` (numeric): Precio total de la línea.
- `created_at` (timestamp)
- `updated_at` (timestamp)

### `purchases`
Registro de compras a proveedores.
- `id` (uuid): ID único.
- `business_id` (uuid, nullable): Referencia al negocio.
- `supplier_id` (uuid): Referencia a `suppliers.id`.
- `date` (timestamp, nullable): Fecha de compra.
- `total_amount` (numeric): Monto total.
- `code` (text, nullable): Código interno.
- `guide_number` (text, nullable): Número de guía.
- `subtotal` (numeric): Subtotal.
- `discount` (numeric, nullable): Descuento.
- `tax_rate` (numeric, nullable): Tasa impositiva.
- `tax_amount` (numeric, nullable): Monto de impuestos.
- `status` (enum/text, nullable): 'pending', 'completed', 'cancelled'.
- `payment_status` (enum/text, nullable): 'pending', 'paid', 'partially_paid', 'cancelled'.
- `reference_number` (text, nullable): Referencia externa.
- `notes` (text, nullable): Notas.
- `created_at` (timestamp)
- `updated_at` (timestamp)

### `purchase_items` (Inferred via `PurchaseItem`)
Detalle de items en una compra.
- `id` (uuid): ID único.
- `purchase_id` (uuid, nullable): Referencia a `purchases.id`.
- `product_id` (uuid, nullable): Referencia a `products.id`.
- `quantity` (numeric): Cantidad.
- `price` (numeric): Precio de compra.
- `code` (text, nullable): Código.
- `bar_code` (text, nullable): Código de barras.
- `discount` (numeric, nullable): Descuento.

### `suppliers`
Proveedores.
- `id` (uuid): ID único.
- `name` (text): Nombre.
- `company_type` (text): Tipo de compañía.
- `contact` (text): Contacto principal.
- `email` (text): Email.
- `phone` (text): Teléfono.
- `address` (text): Dirección.
- `currency` (text): Moneda preferida.
- `status` (text): Estado.
- `document_type` (text): Tipo de documento.
- `document_number` (text): Número de documento.
- `notes` (text): Notas.
- `created_at` (timestamp)
- `updated_at` (timestamp)

### `customers`
Clientes (entidad que agrupa personas u organizaciones).
- `id` (uuid): ID único.
- `person_id` (uuid): Referencia a `people.id`.
- `created_at` (timestamp)
- `updated_at` (timestamp)

### `people` (Inferred via `Person` type, linked to customers)
Información personal de clientes.
- `id` (uuid): ID único.
- `name` (text): Nombre completo.
- `whatsapp` (text): WhatsApp.
- `secondary_phone` (text): Teléfono secundario.
- `email` (text): Email.
- `address` (text): Dirección.
- `country` (text): País.
- `created_at` (timestamp)
- `updated_at` (timestamp)

### `users` (or `profiles`)
Usuarios del sistema.
- `id` (uuid): ID (probablemente ligado a `auth.users`).
- `first_name` (text)
- `last_name` (text)
- `username` (text, nullable)
- `email` (text, nullable)
- `profile_image` (text, nullable)
- `country` (text, nullable)
- `birth_date` (date, nullable)
- `phone` (text, nullable)
- `gender` (text, nullable)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### `user_roles`
Roles y permisos de usuarios.
- `id` (uuid): ID único.
- `user_id` (uuid): Referencia a `users.id`.
- `role` (text): Nombre del rol.
- `institution_id` (uuid, nullable): Referencia a instituciones (si aplica).
- `access_enabled` (boolean, nullable): Acceso habilitado.
- `role_action` (text[]?, nullable): Permisos específicos.
- `created_at` (timestamp)
- `updated_at` (timestamp)

## Funciones RPC Conocidas

### `update_product_stock_after_sale`
Actualiza el stock de productos tras completar una venta.
- **Parámetros:**
  - `p_sale_id` (uuid): ID de la venta completada.
- **Lógica:** Probablemente itera sobre los items de la venta y resta el stock disponible de los productos/variantes correspondientes.

### `update_product_stock_after_purchase` (Esperada/En desarrollo)
Actualiza el stock tras completar una compra.
- **Parámetros:**
  - `p_purchase_id` (uuid)

## Relaciones Clave

- **Ventas -> Items -> Productos/Variantes:** Relación jerárquica para calcular totales y detallar facturas.
- **Productos -> Marcas:** Clasificación de productos.
- **Productos -> Variantes:** Relación 1:N para manejo de SKU múltiples por producto base.
- **Clientes -> Personas:** Separación de la entidad "Cliente" de los datos personales.
- **Usuarios -> Roles:** Control de acceso (RBAC).

## Notas Importantes
- Los tipos UUID son strings en TypeScript.
- Los tipos numéricos (`numeric`, `decimal`) son `number` en TypeScript.
- Las fechas (`timestamp`) suelen manejarse como strings ISO en el frontend y Date objects en transformaciones.
