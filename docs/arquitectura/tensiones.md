# Tensiones de diseño de EventoYa

Qué estamos dispuestos a perder para ganar lo que más importa: no vender 501 boletas y no cobrar dos veces.

---

## Tensión 1. Costo frente a capacidad del pico

- **Ganamos:** no pagar durante todo el año por una capacidad que se usa unos 60 segundos, tres veces al año.
- **Estamos dispuestos a perder:** disponibilidad alta fuera de las ventanas de venta, y la capacidad de atender a todos los compradores durante el pico.
- **Cómo lo manejamos:** escalado programado antes de cada venta, y sala de espera y limitación de tasa mientras sube la capacidad. Autoescalado reactivo descartado: arrancar una instancia puede tardar 90 segundos y el pico ya terminó.
- **Cómo lo medimos:** costo mensual en dos escenarios (siempre encendido contra programado). *(pendiente: cálculo en la calculadora de AWS)*

---

## Tensión 2. Consistencia del inventario frente a velocidad

- **Ganamos:** la garantía de que jamás se venden más de 500 boletas.
- **Estamos dispuestos a perder:** velocidad y caché en el inventario. La disponibilidad no se cachea y cada reserva pasa por una operación atómica en un solo lugar, que puede ser un cuello de botella.
- **Cómo lo manejamos:** reserva temporal con expiración, y la sala de espera controla cuántos llegan a esa operación a la vez. *(confirmar si es PostgreSQL o Redis)*
- **Cómo lo medimos:** prueba de carga con 5.000 compradores simultáneos contra 500 boletas; las ventas confirmadas nunca superan 500.

---

## Tensión 3. Respuesta inmediata frente a certeza del pago

- **Ganamos:** que el comprador no quede bloqueado si la pasarela tarda y que una recarga no cobre dos veces.
- **Estamos dispuestos a perder:** la confirmación instantánea. El comprador ve "procesando" mientras el pago se confirma de forma asíncrona.
- **Cómo lo manejamos:** clave de idempotencia en cada compra, y una cola con un proceso trabajador para confirmar el pago y generar el código de la boleta.
- **Cómo lo medimos:** reintentar la misma compra varias veces y comprobar que se cobra una sola vez. *(confirmar umbral de espera aceptable)*