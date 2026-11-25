# Requerimientos no funcionales

Pico real de EventoYa: 5.000 personas intentan comprar 500 boletas en 60 segundos, 3 veces al ano. Reemplaza la version anterior (200 usuarios, "reservar un evento").

## Bases de calculo (confirmar con el grupo)

- 5.000 personas, 500 boletas, ventana de 60 s.
- Cada persona hace 1 intento de reserva y refresca 12 veces por minuto (una cada 5 s). Cada refresco lee la lista de eventos y la disponibilidad.
- Latencia objetivo de escritura: 0,4 s. Latencia supuesta de la pasarela de pago: 2 s.

## Seis estimaciones de carga

| # | Estimacion | Calculo | Resultado |
|---|------------|---------|-----------|
| 1 | Intentos de reserva | 5.000 / 60 s | 83 por segundo (promedio; el arranque de la venta sera mas brusco) |
| 2 | Lecturas | 5.000 x 12 / 60 s = 1.000 refrescos/s, y cada uno hace 2 lecturas | 2.000 por segundo: 1.000 a Redis (lista) y 1.000 a PostgreSQL (disponibilidad) |
| 3 | Resultado de las reservas | 500 boletas frente a 5.000 intentos | 500 exitosas y 4.500 rechazadas con 409 (90 %) |
| 4 | Compras a procesar | Una por boleta, mas reintentos | Maximo 500 (8,3 por segundo si todas caen en 60 s) |
| 5 | Solicitudes simultaneas de escritura (Ley de Little) | 83 por segundo x 0,4 s | Unas 33 en vuelo a la vez |
| 6 | Trabajadores de pago | 8,3 compras/s x 2 s de pasarela | 17 trabajadores concurrentes |

## Ocho requerimientos no funcionales

| # | Atributo | Metrica | Umbral | Condicion de carga | Verificacion | Consecuencia si no se cumple |
|---|----------|---------|--------|--------------------|--------------|------------------------------|
| 1 | Consistencia | Boletas vendidas por encima de la capacidad | 0 (jamas mas de 500) | 5.000 compradores simultaneos contra 500 boletas | Prueba de carga y consulta de conteo en PostgreSQL | Sobreventa y reclamos |
| 2 | Idempotencia | Cobros por compra reintentada | Exactamente 1 | Misma Idempotency-Key repetida varias veces | Prueba de reintentos | Doble cobro |
| 3 | Rendimiento de lectura | p95 de GET /eventos | < 200 ms (confirmar) | 1.000 lecturas por segundo desde cache | Prueba de carga | Pagina lenta y abandono |
| 4 | Rendimiento de reserva | p95 de POST /eventos/:id/reservas | < 400 ms | 83 intentos por segundo | Prueba de carga | El comprador abandona la reserva |
| 5 | Confirmacion asincrona | Tiempo hasta ver boleta confirmada tras pagar | 95 % en <= 10 s | 500 compras en 60 s, 17 trabajadores | Prueba de carga y consulta GET /compras/:id | Comprador sin certeza de su compra |
| 6 | Disponibilidad en la venta | Disponibilidad durante la ventana de venta | >= 99,9 % (confirmar) | Ventana de 60 s con capacidad ya encendida | Monitoreo durante la venta | Venta fallida y perdida de confianza |
| 7 | Seguridad | Base de datos y Redis alcanzables desde fuera; intentos fallidos de login | 0 puertos publicados; <= 5 intentos por usuario | Siempre | Test-NetConnection y auditoria | Fuga de datos y bloqueo de cuentas |
| 8 | Capacidad programada | Capacidad del pico encendida antes de la apertura | Al menos 15 min antes (confirmar) | Cada una de las 3 ventas anuales | Lista de verificacion previa a la venta (ADR 001) | La instancia llega tarde y el pico ya termino |

## Escenario completo: sobreventa

- **Fuente:** 5.000 compradores desde navegadores distintos
- **Estimulo:** Intentan reservar la misma boleta a la vez
- **Artefacto:** Reserva atomica en PostgreSQL
- **Entorno:** Pico de 60 s con 500 boletas y capacidad ya encendida
- **Respuesta:** Se aceptan como maximo 500 reservas; el resto recibe 409
- **Medida:** Ventas confirmadas <= 500 en todas las pruebas

## Pendientes

- La disponibilidad (1.000 lecturas por segundo) compite con las reservas en PostgreSQL; evaluar una replica de lectura (confirmar).
- Duracion de la reserva temporal: propongo 5 min (confirmar).
- Latencia real de la pasarela de pago (se supuso 2 s).