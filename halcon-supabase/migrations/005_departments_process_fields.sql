CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE users ADD COLUMN department_id UUID REFERENCES departments(id);

ALTER TABLE orders ADD COLUMN current_process_name VARCHAR(255);
ALTER TABLE orders ADD COLUMN process_updated_at TIMESTAMPTZ;

CREATE INDEX idx_users_department ON users(department_id);

ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "departments_select_authenticated" ON departments FOR SELECT TO authenticated USING (true);

DROP FUNCTION IF EXISTS get_order_status(VARCHAR, VARCHAR);

CREATE OR REPLACE FUNCTION get_order_status(
    p_invoice_number VARCHAR(100),
    p_client_number VARCHAR(50) DEFAULT NULL
)
RETURNS TABLE (
    order_id UUID,
    status VARCHAR(20),
    photo_url TEXT,
    evidence_type VARCHAR(20),
    current_process_name VARCHAR(255),
    process_updated_at TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT
        o.id AS order_id,
        o.status,
        CASE
            WHEN o.status = 'Delivered' THEN (
                SELECT e.photo_url
                FROM evidence e
                WHERE e.order_id = o.id AND e.evidence_type = 'delivery'
                ORDER BY e.created_at DESC
                LIMIT 1
            )
            ELSE NULL
        END AS photo_url,
        CASE
            WHEN o.status = 'Delivered' THEN 'delivery'::VARCHAR(20)
            ELSE NULL
        END AS evidence_type,
        o.current_process_name,
        o.process_updated_at
    FROM orders o
    WHERE o.invoice_number = p_invoice_number
      AND o.deleted_at IS NULL
      AND (p_client_number IS NULL OR TRIM(p_client_number) = '' OR o.client_number = p_client_number);
$$;

GRANT EXECUTE ON FUNCTION get_order_status(VARCHAR, VARCHAR) TO anon;
