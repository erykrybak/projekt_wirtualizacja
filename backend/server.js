const http = require("http");
const mysql = require("mysql2");

const fs = require("fs");
const path = require("path");
const md = require("markdown-it")();

const RECIPES_DIR = path.join(__dirname, "recipes");

const isNonEmptyString = (value) =>
    typeof value === "string" &&
    value.trim().length > 0 &&
    value.trim().length <= 255;

const isValidRecipe = (data) =>
    data !== null &&
    typeof data === "object" &&
    isNonEmptyString(data.Title) &&
    isNonEmptyString(data.FileName);

const isValidRecipeFileName = (fileName) => {
    if (typeof fileName !== "string") return false;
    const trimmed = fileName.trim();
    if (!trimmed || trimmed.length > 255) return false;
    if (trimmed.includes("/") || trimmed.includes("\\")) return false;
    const base = path.basename(trimmed);
    return base === trimmed && base.endsWith(".md") && base.length > 3;
};

const isValidRecipePayload = (data) =>
    data != null &&
    typeof data === "object" &&
    isNonEmptyString(data.Title) &&
    isValidRecipeFileName(data.fileName) &&
    typeof data.Content === "string" &&
    data.Content.trim().length > 0;

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
    if (req.url === "/health" && req.method === "GET") {
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
        pool.query("SELECT RecipeID, Title FROM Recipes", (err, results) => {
            if (err) return sendJSON(res, 500, { error: "Błąd bazy danych" });
            return sendJSON(res, 200, results);
        });
        return;
    }

    if (req.url.match(recipeRouteRegex) && req.method === "GET") {
        const id = req.url.match(recipeRouteRegex)[1];
        pool.query(
            "SELECT RecipeID, Title, FileName FROM Recipes WHERE RecipeID = ?",
            [id],
            (err, results) => {
                if (err)
                    return sendJSON(res, 500, { error: "Błąd bazy danych" });

                if (results.length === 0) {
                    return sendJSON(res, 404, {
                        error: "Nie znaleziono przepisu",
                    });
                }

                const recipe = results[0];
                const safeFileName = path.basename(recipe.FileName);
                const filePath = path.join(RECIPES_DIR, safeFileName);

                fs.readFile(filePath, "utf8", (fileErr, content) => {
                    if (fileErr) {
                        return sendJSON(res, 404, {
                            error: "Nie znaleziono pliku przepisu",
                        });
                    }

                    return sendJSON(res, 200, {
                        RecipeID: recipe.RecipeID,
                        Title: recipe.Title,
                        html: md.render(content),
                    });
                });
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

                if (!isValidRecipe(data)) {
                    return sendJSON(res, 400, {
                        error: "Pola 'Title' i 'FileName' muszą być niepustymi tekstami (max 255 znaków)",
                    });
                }

                const title = data.Title.trim();
                const safeFileName = path.basename(data.FileName.trim());
                const filePath = path.join(RECIPES_DIR, safeFileName);

                fs.writeFile(filePath, data.Content, "utf8", (writeErr) => {
                    if (writeErr) {
                        return sendJSON(res, 500, {
                            error: "Nie udało się zapisać pliku przepisu",
                        });
                    }

                    pool.query(
                        "INSERT INTO Recipes (Title, FileName) VALUES (?, ?)",
                        [title, safeFileName],
                        (err, result) => {
                            if (err) {
                                fs.unlink(filePath, () => {});
                                return sendJSON(res, 500, {
                                    error: "Błąd bazy danych",
                                });
                            }

                            return sendJSON(res, 201, {
                                message: "Utworzono przepis i plik Markdown",
                                id: result.insertId,
                            });
                        },
                    );
                });
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
            "SELECT FileName FROM Recipes WHERE RecipeID = ?",
            [id],
            (selectErr, rows) => {
                if (selectErr) {
                    return sendJSON(res, 500, { error: "Błąd bazy danych" });
                }
                if (rows.length === 0) {
                    return sendJSON(res, 404, {
                        error: "Nie znaleziono przepisu do usunięcia",
                    });
                }

                const safeFileName = path.basename(rows[0].FileName || "");
                const filePath = path.join(RECIPES_DIR, safeFileName);

                pool.query(
                    "DELETE FROM Recipes WHERE RecipeID = ?",
                    [id],
                    (delErr, result) => {
                        if (delErr) {
                            return sendJSON(res, 500, {
                                error: "Błąd bazy danych",
                            });
                        }
                        if (result.affectedRows === 0) {
                            return sendJSON(res, 404, {
                                error: "Nie znaleziono przepisu do usunięcia",
                            });
                        }

                        if (safeFileName.endsWith(".md")) {
                            fs.unlink(filePath, () => {});
                        }

                        return sendJSON(res, 200, {
                            message: "Przepis został usunięty",
                        });
                    },
                );
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
