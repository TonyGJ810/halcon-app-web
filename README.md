# Halcon — Sistema de Distribución de Materiales

Plataforma web para **Halcon**, distribuidora de materiales de construcción. Permite que los **clientes consulten el estado de sus pedidos sin registrarse** (solo número de factura y, si hace falta, número de cliente) y que el **equipo interno** gestione pedidos, evidencias fotográficas y usuarios según rol.

---

## Problema que resuelve

- Los clientes necesitan saber en qué etapa está su pedido y ver **evidencia fotográfica** cuando la entrega está completada.
- Las áreas internas (ventas, almacén, ruta, compras) deben colaborar en un **flujo ordenado de estados** sin eliminar registros de forma física.
- Se requiere **administración centralizada de usuarios** (altas, roles y departamentos) y mensajes claros ante éxito o error en cada acción.

---

## Tecnologías

| Área | Stack |
|------|--------|
| Frontend | **Next.js 14** (App Router), **React 18**, **TypeScript** |
| Estilos | **Tailwind CSS** |
| Backend / datos | **Supabase** (PostgreSQL, Row Level Security, Auth, Storage) |
| Notificaciones UI | **Sonner** (toasts de éxito y error en formularios y acciones) |
| Despliegue típico | Frontend en **Vercel**, Supabase como proyecto gestionado |

---

## Alertas y notificaciones (Sonner)

La aplicación usa **[Sonner](https://github.com/emilkowalski/sonner)** para **alertas no intrusivas** (toasts):

- Consulta pública de pedidos: errores de validación, RPC o “no encontrado”, y confirmación cuando la consulta es correcta.
- Dashboard: creación y edición de pedidos, subida de evidencias, usuarios, cambios de estado, borrado lógico y restauración desde la papelera.

El componente `<Toaster />` está montado en el layout raíz (`halcon-frontend/src/app/layout.tsx`).

---

## Borrado lógico (Soft Delete)

Los pedidos **no se borran físicamente** de la base de datos. Se marca `deleted_at` con fecha y hora:

- La **lista principal** de pedidos solo muestra registros activos (`deleted_at IS NULL`).
- Los pedidos eliminados aparecen en **Restaurar / papelera**; el administrador puede **restaurarlos** o **editarlos** desde la ruta dedicada (`/dashboard/orders/trash/[id]`).

---

## Ciclo de vida del pedido

Estados permitidos (en inglés en sistema y BD):

1. **Ordered** — Pedido registrado (alta típicamente desde Ventas).
2. **In process** — En preparación en almacén; puede documentarse nombre del proceso y fecha.
3. **In route** — En camino; puede registrarse **unidad / vehículo** (`loading_unit`).
4. **Delivered** — Entregado; la vista pública puede mostrar foto de evidencia de entrega cuando corresponde.

Flujo esperado en negocio:

```text
Ordered → In process → In route → Delivered
```

Las transiciones las realizan usuarios autorizados desde el dashboard (según rol); las políticas RLS en Supabase refuerzan parte del modelo de datos.

---

## Flujos por rol / departamento

Los roles en aplicación son: **Admin**, **Sales**, **Purchasing**, **Warehouse**, **Route**. Los usuarios también pueden tener un **departamento** asociado (datos organizativos).

| Rol | Responsabilidades principales |
|-----|-------------------------------|
| **Admin** | Crear y gestionar usuarios (rol y departamento). Borrado lógico de pedidos. Restauración y edición de pedidos en papelera. Acceso amplio a operaciones críticas. |
| **Sales (Ventas)** | Crear pedidos con datos completos (cliente, factura, razón social, fiscales, dirección de entrega, notas). Editar datos del pedido donde la app lo permita. |
| **Purchasing (Compras)** | Participar en el seguimiento operativo; actualizar proceso en **In process** y colaborar en transiciones según permisos de la UI/API. |
| **Warehouse (Almacén)** | Avanzar estados hacia preparación y ruta; **no** sube evidencia tipo **carga** (reservada a Ruta y Admin por reglas de negocio/API/RLS). Puede registrar otros tipos de evidencia permitidos. |
| **Route (Ruta)** | Evidencia fotográfica de **carga** (unidad cargada) y de entrega/descarga según flujo; cambio de estado acorde al proceso. |

> **Nota:** La evidencia de tipo **carga** (`loading`) está restringida a **Route** y **Admin** en la API y en la interfaz de subida.

---

## Estructura del repositorio

```text
halcon-frontend/     # App Next.js
halcon-supabase/     # Migraciones SQL y seed
docs/                # Diagramas u otra documentación (si aplica)
```

---

## Configuración

1. Crear un proyecto en [Supabase](https://supabase.com).
2. En `halcon-frontend`, definir variables de entorno (por ejemplo en `.env.local`):

   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (solo servidor; necesaria para rutas API del dashboard con cliente admin)

3. Ejecutar las migraciones SQL **en orden** (SQL Editor o Supabase CLI):

   - `halcon-supabase/migrations/001_initial_schema.sql`
   - `halcon-supabase/migrations/002_rls_policies.sql`
   - `halcon-supabase/migrations/003_public_lookup.sql`
   - `halcon-supabase/migrations/004_storage.sql`
   - `halcon-supabase/migrations/005_departments_process_fields.sql`
   - `halcon-supabase/migrations/006_order_business_fields.sql`

4. Ejecutar **`halcon-supabase/seed.sql`** después de las migraciones (roles, departamentos, pedidos de demostración).

5. Si el bucket de Storage no se creó con la migración 004, crear manualmente el bucket `evidence` en el panel de Supabase.

6. **Primer usuario administrador:** crear el usuario en Supabase Auth y enlazarlo en `public.users`, por ejemplo:

   ```sql
   INSERT INTO users (auth_id, email, full_name, role_id, department_id)
   SELECT id, email, COALESCE(raw_user_meta_data->>'full_name', 'Admin'),
     (SELECT id FROM roles WHERE name = 'Admin' LIMIT 1),
     (SELECT id FROM departments WHERE name = 'Ventas' LIMIT 1)
   FROM auth.users WHERE email = 'admin@ejemplo.com';
   ```

---

## Desarrollo local

```bash
cd halcon-frontend
npm install
npm run dev
```

La app quedará disponible en `http://localhost:3000` (puerto por defecto de Next.js).

---

## Despliegue (referencia)

1. Conectar el repositorio a **Vercel** (u otro hosting compatible con Next.js).
2. Configurar las mismas variables de entorno que en local.
3. Desplegar; las migraciones siguen aplicándose contra el proyecto Supabase remoto.

---

## Dependencias destacadas del frontend

Entre otras: `@supabase/supabase-js`, `@supabase/ssr`, **`sonner`** (notificaciones toast).

Para instalar Sonner en un clon nuevo del frontend:

```bash
cd halcon-frontend
npm install sonner
```
