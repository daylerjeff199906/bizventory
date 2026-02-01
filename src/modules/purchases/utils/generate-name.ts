import { CombinedResultExtended } from "@/apis/app/productc.variants.list"

export const getProductDescription = (item: any) => {
  const parts = []
  if (item?.brand?.name) parts.push(item.brand.name)
  if (item.name) parts.push(item.name)

  // Handle flattened items (e.g. from getPurchaseById)
  if (item.variant_name) {
    let attrsStr = ''
    const attrs = item.attributes || item.variant_attributes
    if (Array.isArray(attrs) && attrs.length > 0) {
      attrsStr = ' (' + attrs.map((a: any) => `${a.attribute_type || ''}: ${a.attribute_value || ''}`).filter(Boolean).join(', ') + ')'
    }
    parts.push(`${item.variant_name}${attrsStr}`)
  } else if (item.variant?.name) { // Handle nested variant object
    let attrsStr = ''
    const attrs = item.variant_attributes || item.variant.attributes
    if (Array.isArray(attrs) && attrs.length > 0) {
      attrsStr = ' (' + attrs.map((a) => `${a.attribute_type || ''}: ${a.attribute_value || ''}`).filter(Boolean).join(', ') + ')'
    }
    parts.push(`${item.variant.name}${attrsStr}`)
  }

  if (item.description && !item.variant_name && !item.variant?.name) parts.push(item.description.substring(0, 30))

  // Backward compatibility for nested variants array (not used in flattened views)
  if (item.variants && item.variants.length > 0) {
    const variantNames = item.variants
      .map((v: any) => {
        const attrs = v.attributes
        let attrsStr = ''
        if (Array.isArray(attrs) && attrs.length > 0) {
          attrsStr =
            ' (' +
            attrs
              .map((a: any) => {
                const value = a.attribute_value ?? ''
                const name = a.attribute_type ?? a.attribute_value ?? ''
                return name ? `${name}: ${value}` : `${value}`
              })
              .filter(Boolean)
              .join(', ') +
            ')'
        }
        return `${v.name ?? ''}${attrsStr}`.trim()
      })
      .filter(Boolean)
      .join('; ')
    if (variantNames) parts.push(variantNames)
  }

  return parts.join(' - ')
}
