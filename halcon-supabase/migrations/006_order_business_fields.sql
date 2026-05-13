-- Campos de negocio alineados con la rúbrica (alta de pedido, unidad en ruta)
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS client_legal_name TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS fiscal_data TEXT,
  ADD COLUMN IF NOT EXISTS delivery_address TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS loading_unit VARCHAR(120);

COMMENT ON COLUMN orders.client_legal_name IS 'Nombre o razón social del cliente';
COMMENT ON COLUMN orders.fiscal_data IS 'Datos fiscales (ej. RFC, régimen); texto libre';
COMMENT ON COLUMN orders.delivery_address IS 'Dirección de entrega';
COMMENT ON COLUMN orders.notes IS 'Notas adicionales del pedido';
COMMENT ON COLUMN orders.loading_unit IS 'Identificador de unidad/vehículo al pasar a In route';

-- Warehouse no puede insertar evidencia tipo carga (solo Route/Admin)
DROP POLICY IF EXISTS "evidence_insert_warehouse" ON evidence;
CREATE POLICY "evidence_insert_warehouse" ON evidence FOR INSERT TO authenticated WITH CHECK (
    EXISTS (
        SELECT 1 FROM users u
        JOIN roles r ON u.role_id = r.id
        WHERE u.auth_id = auth.uid() AND r.name IN ('Warehouse', 'Admin')
    )
    AND evidence_type IN ('unloading', 'delivery')
);
