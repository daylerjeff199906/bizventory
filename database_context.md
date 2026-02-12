# Database Schema Context

## Tables

### public.brands
- id: uuid (PK)
- created_at: timestamp with time zone
- name: text
- updated_at: timestamp with time zone
- logo_url: text
- status: USER-DEFINED ("ACTIVO")
- business_id: uuid (FK -> public.business.id)

### public.business
- id: uuid (PK)
- created_at: timestamp with time zone
- business_name: text
- business_type: text
- description: text
- business_email: text
- document_number: text
- brand: text
- acronym: text
- cover_image_url: text
- map_iframe_url: text
- contact_phone: text
- address: text
- documents: jsonb
- validation_status: text
- updated_at: timestamp with time zone
- status: text

### public.business_members
- id: uuid (PK)
- business_id: uuid (FK -> public.business.id)
- user_id: uuid (FK -> public.profiles.id)
- role: text (NOT NULL, CHECK IN 'owner', 'admin', 'editor', 'viewer')
- is_active: boolean
- created_at: timestamp with time zone
- updated_at: timestamp with time zone
- roles: ARRAY (text[])

### public.categories
- id: bigint (PK)
- name: text
- uuid: uuid

### public.customers
- id: uuid (PK)
- created_at: timestamp with time zone
- person_id: uuid (FK -> public.persons.id)
- updated_at: timestamp with time zone
- business_id: uuid (FK -> public.business.id)

### public.inventory_movements
- id: uuid (PK)
- product_id: uuid (FK -> public.products.id)
- product_variant_id: uuid (FK -> public.product_variants.id)
- quantity: integer
- movement_date: timestamp with time zone
- reference_id: uuid
- reference_type: varchar
- movement_status: varchar
- notes: text
- created_at: timestamp with time zone
- movement_type: text
- date: timestamp with time zone
- business_id: uuid (FK -> public.business.id)

### public.persons
- name: text
- whatsapp: text
- secondary_phone: text
- email: text
- address: text
- country: text
- created_at: timestamp with time zone
- id: uuid (PK)
- document_number: text
- updated_at: timestamp without time zone
- document_type: text

### public.product_details
- id: bigint (PK)
- product_id: uuid (FK -> public.products.id)
- additional_description: text
- created_at: timestamp with time zone

### public.product_variant_attributes
- id: uuid (PK)
- variant_id: uuid (FK -> public.product_variants.id)
- attribute_type: text
- attribute_value: text
- created_at: timestamp with time zone
- updated_at: timestamp with time zone

### public.product_variants
- id: uuid (PK)
- product_id: uuid (FK -> public.products.id)
- name: text
- description: text
- code: text
- created_at: timestamp with time zone
- updated_at: timestamp with time zone
- is_active: boolean
- price: numeric

### public.products
- id: uuid (PK)
- name: text
- description: text
- category_id: bigint (FK -> public.categories.id)
- unit: text
- location: text
- created_at: timestamp with time zone
- is_active: boolean
- has_variants: boolean
- tags: ARRAY
- updated_at: timestamp with time zone
- brand_id: uuid (FK -> public.brands.id)
- code: text
- price: numeric
- discount_active: boolean
- discount_value: numeric

### public.profiles
- id: uuid (PK, FK -> auth.users.id)
- email: text
- first_name: text
- last_name: text
- avatar_url: text
- is_active: boolean
- created_at: timestamp with time zone
- updated_at: timestamp with time zone
- is_super_admin: boolean

### public.purchase_items
- id: uuid (PK)
- purchase_id: uuid (FK -> public.purchases.id)
- product_id: uuid (FK -> public.products.id)
- quantity: integer
- price: numeric
- code: text
- bar_code: text
- discount: real
- product_variant_id: uuid (FK -> public.product_variants.id)
- variant_attributes: jsonb
- original_variant_name: text
- original_product_name: text

### public.purchases
- id: uuid (PK)
- date: timestamp with time zone
- supplier_id: uuid (FK -> public.suppliers.id)
- total_amount: numeric
- code: varchar
- guide_number: varchar
- subtotal: numeric
- discount: numeric
- tax_rate: numeric
- tax_amount: numeric
- created_at: timestamp with time zone
- updated_at: timestamp with time zone
- inventory_updated: boolean
- status: varchar
- reference_number: varchar
- notes: text
- payment_status: varchar
- business_id: uuid (FK -> public.business.id)

### public.roles
- id: bigint (PK)
- name: text
- uuid: uuid
- description: text

### public.sale_items
- id: uuid (PK)
- sale_id: uuid (FK -> public.sales.id)
- product_id: uuid (FK -> public.products.id)
- product_variant_id: uuid (FK -> public.product_variants.id)
- quantity: integer
- unit_price: numeric
- discount_amount: numeric
- total_price: numeric
- created_at: timestamp with time zone
- updated_at: timestamp with time zone

### public.sales
- id: uuid (PK)
- date: timestamp with time zone
- total_amount: numeric
- customer_id: uuid (FK -> public.customers.id)
- status: varchar
- payment_method: varchar
- shipping_address: text
- tax_amount: numeric
- discount_amount: numeric
- total_items: integer
- reference_number: varchar
- salesperson_id: uuid
- created_at: timestamp with time zone
- updated_at: timestamp with time zone
- business_id: uuid (FK -> public.business.id)

### public.suppliers
- id: uuid (PK)
- name: text
- contact: text
- email: text
- phone: text
- address: text
- currency: text
- status: text
- notes: text
- created_at: timestamp with time zone
- updated_at: timestamp with time zone
- company_type: text
- document_type: text
- document_number: text
- business_id: uuid (FK -> public.business.id)

### public.users
- id: uuid (PK, FK -> auth.users.id)
- name: text
- email: text
- created_at: timestamp with time zone
- role: ARRAY

