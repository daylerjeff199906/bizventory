export interface Business {
    id: string
    created_at: string
    business_name: string | null
    business_type: string | null
    description: string | null
    business_email: string | null
    document_number: string | null
    brand: string | null
    acronym: string | null
    cover_image_url: string | null
    map_iframe_url: string | null
    contact_phone: string | null
    address: string | null
    documents: any | null
    validation_status: string | null
    updated_at: string | null
    status: string | null
    deleted_at: string | null
}
