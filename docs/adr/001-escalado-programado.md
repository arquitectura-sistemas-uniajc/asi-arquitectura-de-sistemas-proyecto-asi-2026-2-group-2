# ADR-001. Escalado programado en lugar de autoescalado reactivo

**Estado:** propuesto (confirmar con el equipo) · 24-nov-2026

## Contexto

EventoYa recibe un pico de unas 5.000 personas intentando comprar 500 boletas en 60 segundos, tres veces al año. El resto del tiempo el sistema está casi inactivo. La guía indica que arrancar una instancia puede tardar unos 90 segundos, más que el pico. El presupuesto está limitado por los créditos de la cuenta de AWS.

## Decisión

Se enciende la capacidad del pico antes de cada venta y se apaga después (escalado programado). Durante la venta, una sala de espera y la limitación de tasa protegen al sistema.

## Alternativas descartadas

- **Capacidad del pico encendida todo el año:** la estimación de la calculadora de AWS da 38,79 USD al mes para una sola máquina `t3.medium` encendida las 24 horas, y se usaría unos pocos minutos al año.
- **Autoescalado reactivo:** reacciona cuando el pico ya empezó, y la instancia nueva llega tarde.

## Criterio

RNF-07 (costo ≤ 50 USD al mes) y RNF-04 (escalabilidad 2×). *(los números de los RNF siguen por confirmar)*

## Consecuencias aceptadas

- Hay que conocer con anticipación la hora de apertura de cada venta, y alguien debe programar el encendido y el apagado.
- Si la demanda supera lo previsto, el sistema depende de la sala de espera y de la limitación de tasa.
- Fuera de las ventanas de venta, el sistema puede estar apagado o con capacidad mínima.

## Reversión

Se cambia a capacidad fija o a autoescalado si las ventas dejan de tener fecha conocida, o si en una prueba de carga el sistema no sostiene el pico con la capacidad programada.