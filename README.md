# Halcon - Distribuidora de Materiales de Construcción

Aplicación web para gestión de pedidos con vista pública de consulta y dashboard interno.

## Stack

- Frontend: Next.js 14, React, Tailwind CSS (despliegue en Vercel)
- Base de datos: PostgreSQL (Supabase)
- Auth y Storage: Supabase

## Estructura

```
halcon-frontend/     # App Next.js
halcon-supabase/     # Migraciones SQL y seed
docs/                # Diagramas Mermaid (ER, Casos de uso, Actividad)
```

## Configuración

1. Crear proyecto en [Supabase](https://supabase.com)
2. Copiar `halcon-frontend/.env.example` a `halcon-frontend/.env.local`
3. Rellenar variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
4. Ejecutar migraciones en Supabase (SQL Editor o CLI), **en este orden**:
   - `halcon-supabase/migrations/001_initial_schema.sql`
   - `halcon-supabase/migrations/002_rls_policies.sql`
   - `halcon-supabase/migrations/003_public_lookup.sql`
   - `halcon-supabase/migrations/004_storage.sql`
   - `halcon-supabase/migrations/005_departments_process_fields.sql`
   - `halcon-supabase/seed.sql` (roles, departamentos y pedidos de demostración; ejecutar después de la 005)
5. Crear bucket "evidence" en Storage (Dashboard) si la migración 004 falla
6. Crear el primer usuario Admin en Supabase Auth (Dashboard > Authentication > Users > Add user) y luego insertar en `public.users`:
   ```sql
   INSERT INTO users (auth_id, email, full_name, role_id, department_id)
   SELECT id, email, COALESCE(raw_user_meta_data->>'full_name', 'Admin'),
     (SELECT id FROM roles WHERE name = 'Admin' LIMIT 1),
     (SELECT id FROM departments WHERE name = 'Ventas' LIMIT 1)
   FROM auth.users WHERE email = 'admin@ejemplo.com';
   ```

## Cambios recientes (evidencia / lógica de negocio)

- **Departamentos**: tabla `departments`, usuarios con `department_id`; alta y edición desde el dashboard (Admin).
- **Usuarios**: listado con filtros todos/activos/inactivos; edición de nombre, email, rol, departamento y estado activo.
- **Consulta pública**: búsqueda principal por **número de factura** (cliente opcional si hay varias coincidencias); en **En proceso** se muestra nombre de proceso y fecha; en **Entregado** solo foto de tipo entrega (`delivery`).
- **Pedidos**: actualización de cliente/factura y nombre de proceso; evidencia solo si el estado es **En ruta** o **Entregado**; enlace **Ver** en listado para todos los roles.
- **Seed**: departamentos de ejemplo y pedidos demo (`FAC-DEMO-001` … `004`) para pruebas rápidas.
- **Modelo / relaciones**: helpers documentados en `halcon-frontend/src/lib/models/relationships.ts`.

## Desarrollo

```bash
cd halcon-frontend
npm install
npm run dev
```

## Despliegue en Vercel

1. Conectar el repo a Vercel
2. Añadir las variables de entorno
3. Deploy automático

## Roles

- **Admin**: Crear usuarios, asignar roles, borrado lógico y restauración de pedidos
- **Sales**: Crear pedidos, buscar
- **Purchasing**: Gestionar compras, cambiar estado de pedidos
- **Warehouse**: Preparar pedidos, subir evidencias, cambiar estado
- **Route**: Subir fotos de carga/descarga/entrega, cambiar estado

## Estados del pedido

Ordered → In process → In route → Delivered
