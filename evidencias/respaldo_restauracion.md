# Evidencias: respaldo y restauracion de PostgreSQL (Yerik Zambrano)

Rama: `yerik/respaldo-bd`. Fecha: 2026-11-24.

## 1. Datos de prueba

Tabla `eventos` con 3 filas (Concierto A, Concierto B, Festival C).

## 2. Respaldo (pg_dump en formato .sql plano)

Comandos:

~~~
docker compose exec -T postgres sh -c 'pg_dump -U $POSTGRES_USER -d $POSTGRES_DB -f /tmp/respaldo.sql'
docker compose cp postgres:/tmp/respaldo.sql respaldos\eventoya_respaldo.sql
~~~

Resultado: archivo de 2127 bytes con `CREATE TABLE public.eventos` y los datos.
El respaldo se genera dentro del contenedor y se copia tal cual, para evitar que PowerShell 5.1 altere la codificacion.

## 3. Restauracion en una base nueva

Comandos:

~~~
docker compose exec -T postgres sh -c 'createdb -U $POSTGRES_USER eventoya_restaurada'
docker compose exec -T postgres sh -c 'psql -U $POSTGRES_USER -d eventoya_restaurada -f /tmp/respaldo.sql'
~~~

La restauracion termino sin errores.

## 4. Verificacion

`SELECT * FROM eventos ORDER BY id;` en la base original y en `eventoya_restaurada` devolvio lo mismo:

~~~
 id |   nombre    | boletas
----+-------------+---------
  1 | Concierto A |     500
  2 | Concierto B |     300
  3 | Festival C  |    1000
(3 rows)
~~~

## 5. Manejo del archivo

El `.sql` no se sube al repositorio: `respaldos/` esta en `.gitignore`, porque un respaldo real contiene datos de clientes.
