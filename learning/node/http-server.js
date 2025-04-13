const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello from a plain Node http server\n');
});

server.listen(4000, () => {
  console.log('Listening on http://localhost:4000');
});
