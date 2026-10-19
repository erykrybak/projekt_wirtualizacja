const http = require('http');
const mysql = require('mysql2');

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

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

connection.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL Database!');
  connection.end();
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
