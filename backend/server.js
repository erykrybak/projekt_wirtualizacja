const http = require('http');

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
    if (req.url === '/' || req.url === '/api' || req.url === '/api/') {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({
            status: "success",
            message: "Backend działa poprawnie!",
            timestamp: new Date().toISOString()
        }));
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({
            status: "error",
            message: "Nie znaleziono ścieżki"
        }));
    }
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
