# Contexto de EventoYa

## El problema

Venta de entradas donde cinco mil personas intentan comprar quinientas boletas en el mismo minuto, tres veces al aÃ±o. El resto del tiempo el sistema estÃ¡ prÃ¡cticamente inactivo.

**Actores:** comprador, organizador del evento y personal de control de acceso.
**Sistema externo:** pasarela de pagos (simulada).

---

## Pregunta 1. Â¿CÃ³mo garantizan que jamÃ¡s se vendan 501 boletas?

**DÃ³nde estÃ¡ el riesgo:** miles de personas piden la Ãºltima boleta al mismo tiempo. Si cada peticiÃ³n lee "quedan boletas" y luego escribe, dos compradores pueden ver la misma boleta libre y ambos la compran (condiciÃ³n de carrera).

**Respuesta propuesta:**

- El control del inventario vive en **un solo lugar con operaciÃ³n atÃ³mica** (una transacciÃ³n en PostgreSQL o un contador atÃ³mico en Redis). *(confirmar cuÃ¡l)*
- La boleta se **reserva** de forma temporal con un tiempo de expiraciÃ³n. Si el comprador no paga a tiempo, la reserva se libera.
- Una **sala de espera** limita cuÃ¡ntas personas entran a comprar a la vez, para que el sistema no se sature.
- Se verifica con una **prueba de carga**: 5.000 compradores simultÃ¡neos contra 500 boletas, y se comprueba que las ventas confirmadas nunca superen 500.

> **Consecuencia para el diseÃ±o:**
> El inventario no se cachea ni se lee sin bloqueo. La reserva con expiraciÃ³n y la sala de espera son componentes obligatorios.

---

## Pregunta 2. Â¿CuÃ¡nto cuesta estar preparado para un pico que ocurre tres veces al aÃ±o?

**DÃ³nde estÃ¡ el riesgo:** el pico dura unos 60 segundos y es unas mil veces la carga normal. El autoescalado no sirve si arrancar una instancia tarda 90 segundos: el pico ya terminÃ³ cuando la instancia estÃ¡ lista.

**Respuesta propuesta:**

- Mantener la capacidad del pico encendida todo el aÃ±o es caro y desperdicia dinero, porque se usa unos pocos minutos al aÃ±o.
- Alternativa: **escalado programado**. Se sabe con anticipaciÃ³n cuÃ¡ndo abre la venta, asÃ­ que se enciende la capacidad antes del evento y se apaga despuÃ©s.
- Se compara el costo de ambos escenarios (siempre encendido contra programado) con nÃºmeros reales. *(pendiente: cÃ¡lculo de costos)*

> **Consecuencia para el diseÃ±o:**
> Se paga alta capacidad solo en las ventanas de venta. La sala de espera y la limitaciÃ³n de tasa protegen al sistema mientras la capacidad sube.

---

## Pregunta 3. Si el usuario recarga la pÃ¡gina tras pagar, Â¿compra dos veces?

**DÃ³nde estÃ¡ el riesgo:** el usuario recarga, pulsa dos veces el botÃ³n o reintenta por una respuesta lenta. Si cada peticiÃ³n se trata como una compra nueva, se cobra dos veces.

**Respuesta propuesta:**

- Cada intento de compra lleva una **clave de idempotencia** (un identificador Ãºnico). Si llega la misma clave otra vez, el sistema devuelve el resultado de la primera compra sin cobrar de nuevo.
- La reserva queda asociada a una sola compra. *(confirmar el detalle)*
- La confirmaciÃ³n del pago es **asÃ­ncrona**: si la pasarela tarda, el comprador ve "procesando" y no puede volver a pagar la misma reserva.

> **Consecuencia para el diseÃ±o:**
> Los endpoints de compra deben ser idempotentes. Hace falta guardar las claves de idempotencia y el estado de cada reserva.
---

## Diagrama de Contexto (C4 - Nivel 1)

```mermaid
C4Context
  title Diagrama de Contexto - Sistema EventoYa

  Person(comprador, "Comprador", "Entra a sala de espera, reserva boletas temporalmente (sin asientos) y paga.")
  Person(organizador, "Organizador", "Crea eventos, define aforos y ventanas de venta.")
  Person(acceso, "Personal de Control de Acceso", "Escanea y valida las boletas en la entrada del evento.")

  System(eventoya, "EventoYa", "Plataforma web para venta de boletas con reserva temporal, sala de espera y control de acceso.")

  System_Ext(pasarela, "Pasarela de Pagos (Simulada)", "Unico sistema externo. Procesa cobros y envia confirmacion asincrona.")

  Rel(comprador, eventoya, "Consulta eventos, espera turno y compra boletas", "HTTPS")
  Rel(organizador, eventoya, "Configura eventos y cupos", "HTTPS")
  Rel(acceso, eventoya, "Valida entradas en puerta", "HTTPS")
  Rel(eventoya, pasarela, "Solicita cobro y recibe webhook de confirmacion", "HTTPS / JSON")

```

### Alcance y actores del contexto

- **Boletas sin asientos (reserva temporal):** Los compradores adquieren cupos/boletas con expiracion de tiempo mientras completan el pago; no hay mapa ni seleccion de sillas.
- **Sala de espera:** Filtra el trafico en picos de venta para que no entren todos al tiempo a descontar inventario.
- **Personal de control de acceso:** Actor operativo que consulta el sistema en puerta para verificar que la boleta sea valida y no se haya usado antes.
- **Unico sistema externo:** Solo interactua con la **pasarela de pagos simulada**.

### ¿Que pasa si la pasarela de pagos tarda 30 segundos?

1. **No se bloquea la conexion ni se cae el sistema:** El backend no deja al usuario esperando 30 segundos con la peticion abierta; registra la reserva en estado `PENDIENTE_PAGO` y responde de inmediato que el pago esta en proceso.
2. **La reserva temporal sigue protegida:** Mientras la pasarela responde (dentro de la ventana de expiracion de la reserva, por ejemplo 5 a 10 minutos), esas boletas siguen apartadas para ese comprador y nadie mas las puede tomar.
3. **Confirmacion asincrona (Webhook) + Idempotencia:** Cuando la pasarela termina a los 30 segundos, envia la notificacion al webhook de EventoYa para pasar la boleta a `PAGADA` (o liberarla si fue rechazada). Si el usuario recarga o reintenta durante esos 30 segundos, la clave de idempotencia evita que se le cobre dos veces.