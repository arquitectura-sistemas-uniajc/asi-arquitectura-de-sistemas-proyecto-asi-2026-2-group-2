# ADR 001. Escalado programado en lugar de autoescalado reactivo

**Estado:** propuesto *(confirmar con el equipo)*

## Contexto

EventoYa recibe un pico de unas cinco mil personas intentando comprar quinientas boletas en un minuto, tres veces al año. El resto del tiempo el sistema está casi inactivo. La guía indica que arrancar una instancia puede tardar unos 90 segundos, más que el propio pico.

## Decisión

Se enciende la capacidad del pico antes de cada venta y se apaga después (escalado programado). Mientras la venta está abierta, una sala de espera y la limitación de tasa protegen al sistema.

## Alternativas descartadas

- **Capacidad del pico encendida todo el año:** caro, porque se usa unos pocos minutos al año.
- **Autoescalado reactivo:** reacciona cuando el pico ya empezó, y la instancia nueva llega tarde.

## Consecuencias

- Se paga alta capacidad solo en las ventanas de venta.
- Hay que conocer con anticipación la hora de apertura de cada venta, y alguien debe programar el encendido.
- Si la venta se adelanta o la demanda supera lo previsto, el sistema depende de la sala de espera y de la limitación de tasa.
- *(pendiente: comparar el costo mensual de ambos escenarios con la calculadora de AWS)*