export type OrderStatus = 'Ordered' | 'In process' | 'In route' | 'Delivered'

export type EvidenceType = 'loading' | 'unloading' | 'delivery'

export interface Role {
  id: string
  name: string
  created_at: string
}

export interface Department {
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
  department_id: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface Order {
  id: string
  client_number: string
  invoice_number: string
  client_legal_name: string
  fiscal_data: string | null
  delivery_address: string
  notes: string | null
  loading_unit: string | null
  status: OrderStatus
  current_process_name: string | null
  process_updated_at: string | null
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
  current_process_name: string | null
  process_updated_at: string | null
}
