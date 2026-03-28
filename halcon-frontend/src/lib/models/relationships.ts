/**
 * Modelo lógico: relaciones entre entidades (FK en SQL + consultas anidadas en Supabase).
 *
 * - User → Role (N:1, `users.role_id`)
 * - User → Department (N:1 opcional, `users.department_id`)
 * - Order → User creador (N:1 opcional, `orders.created_by`)
 * - Evidence → Order (N:1, `evidence.order_id`)
 */

/** Select típico para listar usuarios con rol y departamento resueltos */
export const userWithRoleAndDepartmentSelect =
  'id, email, full_name, role_id, department_id, deleted_at, roles(id, name), departments(id, name)' as const

/** Select de pedido con evidencias (requiere FK order_id en evidence) */
export const orderWithEvidenceSelect =
  'id, client_number, invoice_number, status, current_process_name, process_updated_at, created_at, evidence(id, photo_url, evidence_type, created_at)' as const

export function orderEvidenceForeignKey() {
  return { parent: 'orders', child: 'evidence', column: 'order_id' } as const
}

export function userRoleForeignKey() {
  return { parent: 'roles', child: 'users', column: 'role_id' } as const
}

export function userDepartmentForeignKey() {
  return { parent: 'departments', child: 'users', column: 'department_id' } as const
}
