CREATE POLICY "roles_select_all" ON roles FOR SELECT USING (true);

CREATE POLICY "users_select_authenticated" ON users FOR SELECT TO authenticated USING (deleted_at IS NULL);

CREATE POLICY "users_insert_admin" ON users FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM users u JOIN roles r ON u.role_id = r.id WHERE u.auth_id = auth.uid() AND r.name = 'Admin')
);

CREATE POLICY "users_update_admin" ON users FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM users u JOIN roles r ON u.role_id = r.id WHERE u.auth_id = auth.uid() AND r.name = 'Admin')
);

CREATE POLICY "orders_select_authenticated" ON orders FOR SELECT TO authenticated USING (deleted_at IS NULL);

CREATE POLICY "orders_insert_sales" ON orders FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM users u JOIN roles r ON u.role_id = r.id WHERE u.auth_id = auth.uid() AND r.name IN ('Sales', 'Admin'))
);

CREATE POLICY "orders_update_internal" ON orders FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM users u JOIN roles r ON u.role_id = r.id WHERE u.auth_id = auth.uid())
);

CREATE POLICY "orders_delete_admin" ON orders FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM users u JOIN roles r ON u.role_id = r.id WHERE u.auth_id = auth.uid() AND r.name = 'Admin')
);

CREATE POLICY "evidence_select_all" ON evidence FOR SELECT USING (true);

CREATE POLICY "evidence_insert_route" ON evidence FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM users u JOIN roles r ON u.role_id = r.id WHERE u.auth_id = auth.uid() AND r.name IN ('Route', 'Admin'))
);

CREATE POLICY "evidence_insert_warehouse" ON evidence FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM users u JOIN roles r ON u.role_id = r.id WHERE u.auth_id = auth.uid() AND r.name IN ('Warehouse', 'Admin'))
);
