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
    res.writeHead(statusCode, {
        "Content-Type": "application/json; charset=utf-8",
    });
    res.end(JSON.stringify(data));
};

const server = http.createServer((req, res) => {
    //✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨
    if (req.url === "/health" && req.method === "GET") {
        //✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨
        pool.query("SELECT 1", (err) => {
            if (err) {
                return sendJSON(res, 503, {
                    status: "error",
                    message: "Brak połączenia z bazą",
                });
            }
            return sendJSON(res, 200, {
                status: "ok",
                message: "Backend łączy się z bazą",
            });
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

    const recipeRouteRegex = /^\/api\/recipes\/(\d+)$/;
    if (req.url === "/api/recipes" && req.method === "GET") {
        pool.query("SELECT * FROM Recipes", (err, results) => {
            if (err) return sendJSON(res, 500, { error: "Błąd bazy danych" });
            return sendJSON(res, 200, results);
        });
        return;
    }

    if (req.url.match(recipeRouteRegex) && req.method === "GET") {
        const id = req.url.match(recipeRouteRegex)[1];
        pool.query(
            "SELECT * FROM Recipes WHERE RecipeID = ?",
            [id],
            (err, results) => {
                if (err)
                    return sendJSON(res, 500, { error: "Błąd bazy danych" });

                if (results.length === 0)
                    return sendJSON(res, 404, {
                        error: "Nie znaleziono przepisu",
                    });

                return sendJSON(res, 200, results[0]);
            },
        );
        return;
    }

    if (req.url === "/api/recipes" && req.method === "POST") {
        let body = "";
        req.on("data", (chunk) => (body += chunk.toString()));
        req.on("end", () => {
            try {
                const data = JSON.parse(body);

                if (!data.Title || !data.FileName) {
                    return sendJSON(res, 400, {
                        error: "Pola 'Title; oraz 'FileName' są wymagane",
                    });
                }
                pool.query(
                    "INSERT INTO Recipes (Title, FileName) VALUES (?, ?)",
                    [data.Title, data.FileName],
                    (err, result) => {
                        if (err) {
                            return sendJSON(res, 500, {
                                error: "Błąd bazy danych",
                            });
                        }

                        return sendJSON(res, 201, {
                            message: "Utworzono przepis",
                            id: result.insertId,
                        });
                    },
                );
            } catch (e) {
                return sendJSON(res, 400, {
                    error: "Nieprawidłowy format JSON",
                });
            }
        });
        return;
    }

    if (req.url.match(recipeRouteRegex) && req.method === "DELETE") {
        const id = req.url.match(recipeRouteRegex)[1];
        pool.query(
            "DELETE FROM Recipes WHERE RecipeID = ?",
            [id],
            (err, result) => {
                if (err)
                    return sendJSON(res, 500, { error: "Błąd bazy danych" });
                if (result.affectedRows === 0) {
                    return sendJSON(res, 404, {
                        error: "Nie znaleziono przepisu do usunięcia",
                    });
                }

                return sendJSON(res, 200, {
                    message: "Przepis został usunięty",
                });
            },
        );
        return;
    }

    sendJSON(res, 404, {
        status: "error",
        message: "Nie znaleziono ścieżki",
    });
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
