const http = require('http');

const PORT = process.env.PORT || 3000;

// Datos temporales en memoria (luego pasan a PostgreSQL)
const eventos = [
  { id: 1, nombre: 'Concierto demo', capacidad: 500, vendidas: 0 }
];

function responder(res, codigo, cuerpo) {
  res.writeHead(codigo, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(cuerpo));
}

const server = http.createServer((req, res) => {
  const ruta = new URL(req.url, 'http://localhost').pathname;

  if (req.method === 'GET' && ruta === '/health') {
    return responder(res, 200, { status: 'ok' });
  }

  if (req.method === 'GET' && ruta === '/eventos') {
    return responder(res, 200, eventos);
  }

  const m = ruta.match(/^\/eventos\/(\d+)\/disponibilidad$/);
  if (req.method === 'GET' && m) {
    const evento = eventos.find(e => e.id === Number(m[1]));
    if (!evento) return responder(res, 404, { error: 'evento no existe' });
    return responder(res, 200, {
      id: evento.id,
      disponibles: evento.capacidad - evento.vendidas
    });
  }

  responder(res, 404, { error: 'not found' });
});

server.listen(PORT, () => {
  console.log('API escuchando en el puerto ' + PORT);
});