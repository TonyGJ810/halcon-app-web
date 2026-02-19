# Diagrama de Casos de Uso

```mermaid
flowchart LR
    subgraph actors [Actores]
        Cliente
        Admin
        Sales
        Purchasing
        Warehouse
        Route
    end

    subgraph public [Vista Pública]
        UC1[Consulta estado pedido]
        UC2[Ver evidencia foto]
    end

    subgraph dashboard [Dashboard Interno]
        UC3[Crear usuarios]
        UC4[Asignar roles]
        UC5[Crear pedidos]
        UC6[Gestionar compras]
        UC7[Preparar pedidos]
        UC8[Subir evidencias]
        UC9[Buscar pedidos]
        UC10[Borrado lógico]
        UC11[Restaurar pedidos]
    end

    Cliente --> UC1
    Cliente --> UC2
    Admin --> UC3
    Admin --> UC4
    Admin --> UC9
    Admin --> UC10
    Admin --> UC11
    Sales --> UC5
    Sales --> UC9
    Purchasing --> UC6
    Warehouse --> UC7
    Route --> UC8
    Route --> UC9
```
