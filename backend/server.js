const http = require("http");
const mysql = require("mysql2");

const PORT = process.env.PORT || 3000;

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

const sendJSON = (res, statusCode, data) => {
    res.writeHead(statusCode, {"Content-Type": "application/json; charset=utf-8"});
    res.end(JSON.stringify(data));
}

const server = http.createServer((req, res) => {
    
    #✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨
    if (req.url === "/health" && req.method === "GET") {
    #✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨
        pool.query("SELECT 1", (err) => {
            if (err) {
                return sendJSON(res, 503, {status: "error", message: "Brak połączenia z bazą"});
            }
            return sendJSON(res, 200, {status: "ok", message: "Backend łączy się z bazą"});
        });
        return;
    }
    if (req.url === "/" || req.url === "/api" || req.url === "/api/") {
        return sendJSON(res, 200, {
            status: "success",
            message: "Backend działa poprawnie!",
            timestamp: new Date().toISOString(),
        });
    }

    sendJSON(res, 404, {
        status: "error",
        message: "Nie znaleziono ścieżki",
    });
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
