const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });

  if (req.url === '/api/hello') {
    res.end(JSON.stringify({ message: 'Hello from JSON' }));
    return;
  }

  const url = new URL(req.url, 'http://localhost:4000');
  res.end(JSON.stringify({ path: url.pathname, query: Object.fromEntries(url.searchParams) }));
});

server.listen(4000, () => {
  console.log('JSON api running on http://localhost:4000');
});
