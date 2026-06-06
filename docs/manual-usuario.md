# Manual de usuario — Panel administrativo

Manual para quien gestiona la tienda (dueño del negocio o personal autorizado). Asume que el sitio ya está corriendo en `http://localhost:3000` (o el dominio donde se despliegue).

> **Importante:** El MVP corre en computador local. Para que la tienda esté disponible es necesario tener encendido el computador con Docker y `pnpm dev` ejecutándose. En despliegue a producción esto cambia (ver `manual-despliegue.md`).

## 1. Iniciar sesión como administrador

1. Abre `http://localhost:3000/login`.
2. Ingresa el correo y contraseña del administrador:
   - **Correo:** `admin@ferreterialaceja.com`
   - **Contraseña:** `Admin123*`
3. Click en **INICIAR SESIÓN**.
4. El sitio te lleva a `/cuenta` con un saludo personal.
5. En la barra superior verás `Hola, Administrador` y al lado `Cerrar sesión`. Click en `Administrador` para ir al panel administrativo en `/admin`.

> Si olvidas la contraseña del admin: solo puede restablecerla un desarrollador con acceso al servidor (la recuperación automática no está en el alcance del MVP).

## 2. Dashboard

`http://localhost:3000/admin`

Lo que verás:

- **4 tarjetas con KPIs:**
  - *Ventas del mes* — suma de pedidos no cancelados de este mes.
  - *Pedidos pendientes* — pedidos con estado `PENDING` esperando confirmación.
  - *Clientes nuevos* — usuarios registrados este mes.
  - *Alertas inventario* — productos con stock al nivel mínimo o por debajo.
- **Gráfico de barras de los últimos 7 días** — ventas diarias.
- **Top 5 productos** — productos más vendidos (acumulado histórico).
- **Tabla "Últimos pedidos"** — 5 más recientes. Click en cualquiera para gestionarlo.

## 3. Gestionar pedidos

`http://localhost:3000/admin/pedidos`

### 3.1 Listar y filtrar

- Filtros por estado en chips arriba: *Todos*, *Pendiente*, *Confirmado*, *En camino*, *Entregado*, *Cancelado*.
- Búsqueda por número de pedido, nombre o correo del cliente.
- Paginación cuando hay más de 20 pedidos.

### 3.2 Cambiar el estado de un pedido

1. Click en *Gestionar* en cualquier pedido para abrir su detalle.
2. A la derecha verás un panel **Gestionar pedido** con un dropdown de estados disponibles. Las transiciones permitidas son:
   - **Pendiente** → Confirmado o Cancelado.
   - **Confirmado** → En camino o Cancelado.
   - **En camino** → Entregado o Cancelado.
   - **Entregado** o **Cancelado** son terminales.
3. (Opcional) Agrega un comentario interno — útil para recordar el motivo del cambio.
4. Click en *Aplicar cambio*.

> Al cancelar un pedido, el stock de los productos se **devuelve automáticamente** al inventario.

El historial de cambios queda en *Historial / notas internas* al final de la página del pedido.

## 4. Productos

`http://localhost:3000/admin/productos`

### 4.1 Listado

Tabla con todos los productos (activos e inactivos). Búsqueda por SKU o nombre. Indicadores de estado:
- **Activo / Inactivo** — un producto inactivo no se ve en la tienda.
- **Destacado** — aparece en la home en "Productos Destacados".

### 4.2 Crear un producto

1. Click en *Nuevo producto*.
2. Llena los campos:
   - **SKU** — código único. Sugerencia: `<CAT>-<NNN>` (ej. `HMA-008`).
   - **Nombre** — visible para el cliente.
   - **Descripción** — al menos 10 caracteres.
   - **Categoría** — selecciona de las taxonomías existentes (puedes crear nuevas en `/admin/productos/categorias`).
   - **Marca** — opcional.
   - **Activo** — desmárcalo si quieres crearlo pero no mostrarlo aún.
   - **Destacado** — márcalo para que aparezca en la home.
   - **Precio (COP)** y opcional **Precio antes** para mostrar descuento.
   - **Stock** y **Stock mínimo** — el mínimo dispara alertas en el dashboard cuando se cruza.
   - **Especificaciones técnicas** — pares clave/valor. Click *Agregar* para más filas.
3. Click *Crear producto*.
4. Te redirige a la pantalla de edición donde ahora puedes subir imágenes.

### 4.3 Subir imágenes

En la pantalla de edición:

1. Click en *Subir imágenes*.
2. Selecciona uno o varios archivos (JPG, PNG o WebP, máx 5 MB cada uno, hasta 8 por producto).
3. El sistema procesa cada imagen automáticamente: la convierte a WebP, la redimensiona a máximo 1200×1200 píxeles, y la guarda.
4. Para eliminar una imagen, pasa el cursor encima y click en la X roja.

### 4.4 Editar / desactivar un producto

- Click en *Editar* en el listado.
- Modifica los campos y guarda.
- Para **desactivar** un producto (que no se borre), desmarca *Activo* y guarda. El historial de pedidos lo conserva intacto.

## 5. Categorías y marcas

- `http://localhost:3000/admin/productos/categorias`
- `http://localhost:3000/admin/productos/marcas`

A la izquierda hay un formulario para crear o editar; a la derecha la tabla con conteos de productos por categoría/marca.

**Para eliminar:**
- Solo se puede borrar una categoría o marca **si no tiene productos asociados**.
- Si tiene, primero reasigna los productos o desactívalos.

> Las categorías requieren un nombre de icono **Material Symbols Outlined** (ej. `handyman`, `electric_bolt`, `format_paint`). Lista oficial: [fonts.google.com/icons](https://fonts.google.com/icons).

## 6. Inventario

`http://localhost:3000/admin/inventario`

Tabla con todos los productos, su stock actual y mínimo. Indicadores:
- 🟢 **OK** — stock por encima del mínimo.
- 🟡 **Stock bajo** — stock ≤ stock mínimo. Aparece en alertas del dashboard.
- 🔴 **Agotado** — stock = 0.

Filtro *Solo stock bajo* para enfocarte en lo crítico.

### Ajustar stock

1. Click en *Ajustar stock* en cualquier fila.
2. Usa los botones `+` / `-` o escribe el delta directamente.
3. Selecciona el **motivo**:
   - **Entrada de mercancía** — recibiste producto del proveedor.
   - **Corrección** — había un error en el conteo.
   - **Merma** — pérdida (rotura, robo, vencimiento).
4. (Opcional) agrega una nota.
5. Click *Aplicar ajuste*.

El sistema impide stock negativo automáticamente.

## 7. Clientes

`http://localhost:3000/admin/clientes`

Listado de todos los usuarios con su rol, fecha de registro, número de pedidos y total gastado.

Click en *Ver* para abrir el detalle del cliente:
- Datos personales y total gastado.
- Lista de todos sus pedidos con acceso directo a cada uno.

### Promover a administrador

1. Abre el detalle del cliente.
2. Click en *Promover a ADMIN*.
3. Confirma la acción y escribe el correo del usuario para la segunda confirmación.
4. El usuario ahora tiene acceso completo al panel `/admin/**`.

> **Esta acción no es reversible desde el panel.** Si necesitas degradar a un admin de vuelta a CLIENT, debe hacerlo un desarrollador con acceso a la base de datos.

## 8. Tienda pública

Recuerda que como administrador también puedes navegar la tienda pública en `http://localhost:3000`. Es útil para verificar que los cambios que haces en el panel se reflejan correctamente: agregar un producto, marcar uno como destacado, ver que aparece en la home, etc.

## 9. Cerrar sesión

Click en *Cerrar sesión* en la barra superior. Te lleva a la home como invitado.

## Preguntas frecuentes

**¿Puedo crear pedidos manualmente desde el admin?**
No en este MVP. Los pedidos se crean cuando un cliente compra. La opción "Nueva Venta" del sidebar queda como trabajo futuro.

**¿Cómo veo los pedidos de un cliente específico?**
Ve a `/admin/clientes/[id]` — al fondo está la lista de pedidos del cliente.

**¿Qué pasa si pierdo la conexión a la base mientras hago un cambio?**
El sistema usa transacciones para operaciones críticas (crear pedido, descontar stock). Si la conexión falla a mitad, la operación se revierte completamente — no quedan estados a medias.

**¿Puedo dejar dos administradores activos al tiempo?**
Sí. Puedes promover cuantos clientes quieras a admin. Todos comparten el mismo nivel de permisos.

**¿El sistema procesa pagos reales?**
No. Los métodos de pago en el checkout son simulados (Tarjeta / PSE / Contraentrega). Cada pedido entra en estado *Pendiente* esperando tu confirmación manual.
