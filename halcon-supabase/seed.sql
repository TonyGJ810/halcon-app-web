INSERT INTO roles (id, name) VALUES
    ('a0000000-0000-0000-0000-000000000001', 'Admin'),
    ('a0000000-0000-0000-0000-000000000002', 'Sales'),
    ('a0000000-0000-0000-0000-000000000003', 'Purchasing'),
    ('a0000000-0000-0000-0000-000000000004', 'Warehouse'),
    ('a0000000-0000-0000-0000-000000000005', 'Route')
ON CONFLICT (name) DO NOTHING;

INSERT INTO departments (id, name) VALUES
    ('b0000000-0000-0000-0000-000000000001', 'Ventas'),
    ('b0000000-0000-0000-0000-000000000002', 'Almacén'),
    ('b0000000-0000-0000-0000-000000000003', 'Rutas'),
    ('b0000000-0000-0000-0000-000000000004', 'Compras')
ON CONFLICT (name) DO NOTHING;

INSERT INTO orders (
    id,
    client_number,
    invoice_number,
    status,
    current_process_name,
    process_updated_at,
    client_legal_name,
    delivery_address
) VALUES
    ('c0000000-0000-0000-0000-000000000001', '10001', 'FAC-DEMO-001', 'Ordered', NULL, NULL, 'Cliente demo 001', 'Av. Reforma 123, CDMX'),
    ('c0000000-0000-0000-0000-000000000002', '10002', 'FAC-DEMO-002', 'In process', 'Empaque y surtido', NOW() - INTERVAL '2 days', 'Cliente demo 002', 'Insurgentes Sur 456, CDMX'),
    ('c0000000-0000-0000-0000-000000000003', '10003', 'FAC-DEMO-003', 'In route', NULL, NULL, 'Cliente demo 003', 'Eje Central 789, CDMX'),
    ('c0000000-0000-0000-0000-000000000004', '10004', 'FAC-DEMO-004', 'Delivered', NULL, NULL, 'Cliente demo 004', 'Periférico 321, CDMX')
ON CONFLICT (id) DO NOTHING;
