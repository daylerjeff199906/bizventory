import {
  ATTRIBUTE_TYPES,
  AttributeType,
  ProductVariantsData
} from '../../schemas'

interface VariantsPreviewProps {
  variants: ProductVariantsData
  productName: string
  productCode: string
}

export const VariantsPreview = ({
  variants,
  productName
}: VariantsPreviewProps) => {
  if (variants.length === 0) return null

  return (
    <div className="mt-6 p-4 bg-gray-50 rounded-lg mb-4">
      <h3 className="text-sm font-semibold mb-3">
        Previsualización de variantes
      </h3>
      <div className="space-y-3">
        {variants.map((variant, index) => (
          <div key={index} className="border rounded p-3 bg-white">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium text-sm">
                  {productName} {variant.name || `Variante ${index + 1}`}
                </p>
                <p className="text-xs text-gray-600">{variant.code}</p>
              </div>
              <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                #{index + 1}
              </span>
            </div>

            {variant.attributes.length > 0 && (
              <div className="mt-2">
                <p className="text-xs font-medium mb-1">Atributos:</p>
                <div className="grid grid-cols-2 gap-1">
                  {variant.attributes.map((attr, attrIndex) => (
                    <div key={attrIndex} className="text-xs">
                      <span className="font-medium">
                        {ATTRIBUTE_TYPES[
                          attr.attribute_type as AttributeType
                        ] || attr.attribute_type}
                        :
                      </span>{' '}
                      <span>{attr.attribute_value || '-'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
