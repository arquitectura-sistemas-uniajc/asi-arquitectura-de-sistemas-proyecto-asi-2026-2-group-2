# Requerimientos no funcionales

| # | Atributo     | Métrica             | Umbral          | Condición de carga       | Verificación       | Consecuencia si no se cumple |
|---|--------------|---------------------|-----------------|--------------------------|--------------------|-------------------------------|
| 1 | Rendimiento  | p95 de latencia     | < 400 ms        | 200 usuarios concurrentes | Prueba de carga    | El usuario abandona la reserva |
| 2 | Disponibilidad | Uptime mensual    | ≥ 99.5 %        | Servicio en producción    | Monitoreo          | Pérdida de confianza           |
| 3 | Seguridad    | Intentos fallidos de login | ≤ 5 por usuario | Sesión de autenticación | Auditoría          | Bloqueo de cuentas             |

## Escenarios completos

### Escenario 1
- **Fuente:** Usuario accede a la plataforma  
- **Estímulo:** Intenta reservar un evento  
- **Artefacto:** Módulo de reservas  
- **Entorno:** 200 usuarios concurrentes  
- **Respuesta:** El sistema procesa la reserva en menos de 400 ms  
- **Medida:** Prueba de carga con simulación de concurrencia
