# Flujos principales de EventoYa

Cuatro flujos que cubren el pico (5.000 personas, 500 boletas, 60 segundos). Los endpoints marcados "propuesto" aun no existen en `src/index.js` (confirmar con Victor).

| # | Flujo | Endpoint | Estado | Cache | Donde se resuelve |
|---|-------|----------|--------|-------|-------------------|
| 1 | Lectura frecuente | `GET /eventos` | existe | Si, en Redis con TTL corto (confirmar valor) | Redis; PostgreSQL si falla la cache |
| 2 | Lectura que no se cachea | `GET /eventos/:id/disponibilidad` | existe | No, nunca | PostgreSQL |
| 3 | Escritura critica | `POST /eventos/:id/reservas` y `POST /reservas/:id/compra` | propuesto | No | PostgreSQL (operacion atomica) |
| 4 | Asincrono | `GET /compras/:id` (consulta) y trabajador en cola | propuesto | No | Cola en Redis + trabajador |

## 1. Lectura frecuente: listar eventos

- Es la pagina que todos abren y refrescan. El dato cambia poco, por eso se sirve desde cache.
- Un dato levemente desactualizado aqui no causa dano: no decide ninguna venta.

## 2. Lectura que no se cachea: disponibilidad

- Se lee siempre desde PostgreSQL, sin cache, porque un valor viejo haria creer que hay boletas cuando ya no.
- Es informativa: la garantia real la da la reserva (flujo 3), no esta lectura.

## 3. Escritura critica: reservar y comprar

1. `POST /eventos/:id/reservas`: una sola sentencia atomica en PostgreSQL descuenta una boleta solo si quedan disponibles. Crea una reserva temporal con expiracion y responde `reserva_id` y `expira_en`. Si no hay boletas, responde 409.
2. `POST /reservas/:id/compra`: exige el encabezado `Idempotency-Key`. Registra la compra como `procesando`, la encola y responde 202. Repetir la misma clave devuelve la misma compra, sin cobrar dos veces.
3. Si la reserva expira sin compra, la boleta vuelve al inventario.
4. La sala de espera y la limitacion de tasa controlan cuantas personas llegan a este flujo a la vez.

## 4. Flujo asincrono: confirmar pago y generar codigo

1. Un trabajador toma la compra de la cola y llama a la pasarela de pago.
2. Si el pago se aprueba: estado `confirmada` y se genera el codigo de la boleta. Si falla: estado `fallida` y se libera la boleta.
3. El comprador consulta `GET /compras/:id` y ve `procesando`, `confirmada` (con su codigo) o `fallida`.
4. Los reintentos del trabajador usan la misma clave de idempotencia.

## Pendientes

- Confirmar nombres de rutas con Victor.
- Umbral de espera aceptable en `procesando` (pendiente tambien en tensiones.md).
- Endpoint de la sala de espera (no definido aun).