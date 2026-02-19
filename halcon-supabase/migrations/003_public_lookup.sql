CREATE OR REPLACE FUNCTION get_order_status(p_client_number VARCHAR(50), p_invoice_number VARCHAR(100))
RETURNS TABLE (
    order_id UUID,
    status VARCHAR(20),
    photo_url TEXT,
    evidence_type VARCHAR(20)
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT o.id AS order_id, o.status, e.photo_url, e.evidence_type
    FROM orders o
    LEFT JOIN evidence e ON e.order_id = o.id
    WHERE o.client_number = p_client_number
      AND o.invoice_number = p_invoice_number
      AND o.deleted_at IS NULL
    ORDER BY e.created_at DESC;
$$;

GRANT EXECUTE ON FUNCTION get_order_status(VARCHAR, VARCHAR) TO anon;
