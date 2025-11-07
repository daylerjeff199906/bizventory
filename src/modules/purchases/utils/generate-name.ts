import { CombinedResultExtended } from "@/apis/app/productc.variants.list"

  export const getProductDescription = (item: CombinedResultExtended) => {
    const parts = []
    if (item?.brand?.name) parts.push(item.brand.name)
    if (item.description) parts.push(item.description)
    if (item.variants && item.variants.length > 0) {
      const variantNames = item.variants
        .map((v) => {
          const attrs = v.attributes
          let attrsStr = ''
          if (Array.isArray(attrs) && attrs.length > 0) {
            attrsStr =
              ' (' +
              attrs
                .map((a) => {
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

      return parts.join(' - ')
    } else {
      return parts.join(' - ')
    }
  }
