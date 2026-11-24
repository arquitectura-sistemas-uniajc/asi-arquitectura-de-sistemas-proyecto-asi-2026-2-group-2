# Evidencias: docker-compose con PostgreSQL y Redis (Yerik Zambrano)

Rama: `yerik/docker-compose`. Fecha: 2026-11-23.

## 1. Servicios sanos y sin puertos publicados

Comando: `docker compose ps`

~~~
NAME                        IMAGE                STATUS                    PORTS
eventoya-grupo-postgres-1   postgres:17-alpine   Up 46 seconds (healthy)   5432/tcp
eventoya-grupo-redis-1      redis:7-alpine       Up 47 seconds (healthy)   6379/tcp
~~~

En `PORTS` no aparece `->`: los puertos no estan publicados al host.

## 2. La base de datos y Redis no son alcanzables desde fuera

Comandos: `Test-NetConnection localhost -Port 5432` y `-Port 6379`

~~~
5432 -> TcpTestSucceeded : False (::1 y 127.0.0.1)
6379 -> TcpTestSucceeded : False (::1 y 127.0.0.1)
~~~

La red `backend` esta definida con `internal: true` y ningun servicio tiene `ports:`.

## 3. Persistencia del volumen `postgres_data`

1. Se creo la tabla `prueba` y se inserto una fila (`CREATE TABLE`, `INSERT 0 1`).
2. `docker compose down` elimino contenedores y red (sin `-v`, el volumen se conserva).
3. `docker compose up -d` recreo los contenedores.
4. `SELECT * FROM prueba;` devolvio la fila:

~~~
 id |   nota
----+-----------
  1 | sigo aqui
(1 row)
~~~

Despues se elimino la tabla de prueba (`DROP TABLE`).

## 4. Manejo de secretos

- Las contraseñas estan en `.env`, ignorado por Git (`.gitignore`).
- `.env.example` solo trae valores de ejemplo, sin secretos.
- Postgres y Redis usan contraseñas distintas, generadas al azar.
