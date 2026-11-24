# ASI-2026-Repo
victor manuel izquierdo
Proyecto eventoYa - Grupo 2

## Arquitectura desplegada (Frontend + Nginx + API replicada)

- **Nginx (eventoya-nginx):** Sirve el frontend estÃ¡tico en el puerto 8080 y actÃºa como balanceador de carga (Round-Robin) hacia las rÃ©plicas de la API bajo /api/.
- **API Node.js (eventoya-api-1, eventoya-api-2):** Dos instancias idÃ©nticas del servicio backend exponiendo GET /health.
- **DocumentaciÃ³n C4:** Ver diagrama de contexto (Nivel 1) en docs/arquitectura/contexto.md.

## EjecuciÃ³n con Docker Compose

```bash
docker compose up -d --build
```



- **Frontend:** http://localhost:8080
- **Healthcheck balanceado:** http://localhost:8080/api/health
- Diagrama de Contenedores (Nivel 2): docs/arquitectura/contenedores.md
