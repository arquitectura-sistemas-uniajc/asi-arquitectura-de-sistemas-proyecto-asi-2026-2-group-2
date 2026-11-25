# Contexto de EventoYa

## El problema

Venta de entradas donde cinco mil personas intentan comprar quinientas boletas en el mismo minuto, tres veces al año. El resto del tiempo el sistema está prácticamente inactivo.

**Actores:** comprador, organizador del evento y personal de control de acceso.
**Sistema externo:** pasarela de pagos (simulada).

---

## Pregunta 1. ¿Cómo garantizan que jamás se vendan 501 boletas?

**Dónde está el riesgo:** miles de personas piden la última boleta al mismo tiempo. Si cada petición lee "quedan boletas" y luego escribe, dos compradores pueden ver la misma boleta libre y ambos la compran (condición de carrera).

**Respuesta propuesta:**

- El control del inventario vive en **un solo lugar con operación atómica** (una transacción en PostgreSQL o un contador atómico en Redis). *(confirmar cuál)*
- La boleta se **reserva** de forma temporal con un tiempo de expiración. Si el comprador no paga a tiempo, la reserva se libera.
- Una **sala de espera** limita cuántas personas entran a comprar a la vez, para que el sistema no se sature.
- Se verifica con una **prueba de carga**: 5.000 compradores simultáneos contra 500 boletas, y se comprueba que las ventas confirmadas nunca superen 500.

> **Consecuencia para el diseño:**
> El inventario no se cachea ni se lee sin bloqueo. La reserva con expiración y la sala de espera son componentes obligatorios.

---

## Pregunta 2. ¿Cuánto cuesta estar preparado para un pico que ocurre tres veces al año?

**Dónde está el riesgo:** el pico dura unos 60 segundos y es unas mil veces la carga normal. El autoescalado no sirve si arrancar una instancia tarda 90 segundos: el pico ya terminó cuando la instancia está lista.

**Respuesta propuesta:**

- Mantener la capacidad del pico encendida todo el año es caro y desperdicia dinero, porque se usa unos pocos minutos al año.
- Alternativa: **escalado programado**. Se sabe con anticipación cuándo abre la venta, así que se enciende la capacidad antes del evento y se apaga después.
- Se compara el costo de ambos escenarios (siempre encendido contra programado) con números reales. *(pendiente: cálculo de costos)*

> **Consecuencia para el diseño:**
> Se paga alta capacidad solo en las ventanas de venta. La sala de espera y la limitación de tasa protegen al sistema mientras la capacidad sube.

---

## Pregunta 3. Si el usuario recarga la página tras pagar, ¿compra dos veces?

**Dónde está el riesgo:** el usuario recarga, pulsa dos veces el botón o reintenta por una respuesta lenta. Si cada petición se trata como una compra nueva, se cobra dos veces.

**Respuesta propuesta:**

- Cada intento de compra lleva una **clave de idempotencia** (un identificador único). Si llega la misma clave otra vez, el sistema devuelve el resultado de la primera compra sin cobrar de nuevo.
- La reserva queda asociada a una sola compra. *(confirmar el detalle)*
- La confirmación del pago es **asíncrona**: si la pasarela tarda, el comprador ve "procesando" y no puede volver a pagar la misma reserva.

> **Consecuencia para el diseño:**
> Los endpoints de compra deben ser idempotentes. Hace falta guardar las claves de idempotencia y el estado de cada reserva.