export type OrderStatus = 'Ordered' | 'In process' | 'In route' | 'Delivered'

export type EvidenceType = 'loading' | 'unloading' | 'delivery'

export interface Role {
  id: string
  name: string
  created_at: string
}

export interface User {
  id: string
  auth_id: string | null
  email: string
  full_name: string
  role_id: string
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface Order {
  id: string
  client_number: string
  invoice_number: string
  status: OrderStatus
  created_by: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface Evidence {
  id: string
  order_id: string
  photo_url: string
  evidence_type: EvidenceType
  created_by: string | null
  created_at: string
}

export interface OrderStatusResult {
  order_id: string
  status: string
  photo_url: string | null
  evidence_type: string | null
}
