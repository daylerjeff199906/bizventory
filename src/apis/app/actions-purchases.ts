// /**
//  * Función auxiliar para actualizar los totales de una compra
//  * @param purchaseId - UUID de la compra a actualizar
//  */
// async function updatePurchaseTotal(purchaseId: string): Promise<void> {
//   const supabase = await getSupabase()

//   // 1. Calcular nuevo subtotal sumando todos los items
//   const { data: items, error: itemsError } = await supabase
//     .from('purchase_items')
//     .select('quantity, price')
//     .eq('purchase_id', purchaseId)

//   if (itemsError) throw itemsError

//   // Calcular subtotal (suma de quantity * price)
//   const subtotal = items?.reduce((sum, item) => {
//     return sum + (item.quantity * item.price)
//   }, 0) || 0

//   // 2. Obtener los porcentajes de impuesto y descuento de la compra
//   const { data: purchase, error: purchaseError } = await supabase
//     .from('purchases')
//     .select('tax_rate, discount')
//     .eq('id', purchaseId)
//     .single()

//   if (purchaseError) throw purchaseError

//   const taxRate = purchase?.tax_rate || 0
//   const discount = purchase?.discount || 0

//   // 3. Calcular los nuevos valores
//   const taxAmount = subtotal * (taxRate / 100)
//   const totalAmount = subtotal + taxAmount - discount

//   // 4. Actualizar la compra con los nuevos valores
//   const { error: updateError } = await supabase
//     .from('purchases')
//     .update({
//       subtotal,
//       tax_amount: taxAmount,
//       total_amount: totalAmount,
//       updated_at: new Date().toISOString()
//     })
//     .eq('id', purchaseId)

//   if (updateError) throw updateError
// }