function escapeHtml(str) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function formatInline(text) {
    let safe = escapeHtml(text);
    safe = safe.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    safe = safe.replace(/\*(.+?)\*/g, "<em>$1</em>");
    safe = safe.replace(/`(.+?)`/g, "<code>$1</code>");
    safe = safe.replace(/_(.+?)_/g, "<i>$1</i>");
    return safe;
}

function renderMarkdown(md) {
    const lines = md.replace(/\r\n/g, "\n").split("\n");
    let html = "";
    let inUl = false;
    let inOl = false;

    const closeLists = () => {
        if (inUl) {
            html += "</ul>";
            inUl = false;
        }
        if (inOl) {
            html += "</ol>";
            inOl = false;
        }
    };

    for (const rawLine of lines) {
        const line = rawLine.trim();

        if (!line) {
            closeLists();
            continue;
        }
        if (line.startsWith("### ")) {
            closeLists();
            html += `<h3>${formatInline(line.slice(4))}</h3>`;
        } else if (line.startsWith("## ")) {
            closeLists();
            html += `<h2>${formatInline(line.slice(3))}</h2>`;
        } else if (line.startsWith("# ")) {
            closeLists();
            html += `<h1>${formatInline(line.slice(2))}</h1>`;
        } else if (/^[-*]\s+/.test(line)) {
            if (inOl) {
                html += "</ol>";
                inOl = false;
            }
            if (!inUl) {
                html += "<ul>";
                inUl = true;
            }
            html += `<li>${formatInline(line.replace(/^[-*]\s+/, ""))}</li>`;
        } else if (/^\d+\.\s+/.test(line)) {
            if (inUl) {
                html += "</ul>";
                inUl = false;
            }
            if (!inOl) {
                html += "<ol>";
                inOl = true;
            }
            html += `<li>${formatInline(line.replace(/^\d+\.\s+/, ""))}</li>`;
        } else {
            closeLists();
            html += `<p>${formatInline(line)}</p>`;
        }
    }

    closeLists();
    return html || "<p>Plik przepisu jest pusty.</p>";
}

function showView(viewId) {
    document
        .querySelectorAll(".view")
        .forEach((el) => el.classList.remove("active"));
    document.getElementById(viewId).classList.add("active");

    document
        .getElementById("btn-recipes")
        .classList.toggle("active", viewId === "recipes-view");
    document
        .getElementById("btn-add")
        .classList.toggle("active", viewId === "add-recipe-view");

    if (viewId === "recipes-view") {
        loadRecipes();
    }
}

function setMessage(text, type) {
    const msg = document.getElementById("form-message");
    msg.textContent = text;
    msg.className = `message ${type}`;
}

function openRecipe(recipe) {
    document.getElementById("detail-title").textContent = recipe.Title;
    const contentEl = document.getElementById("detail-content");
    contentEl.innerHTML = "<p>Ładowanie przepisu...</p>";
    showView("recipe-detail-view");

    const cleanFile = String(recipe.FileName || "").replace(/^\/+/, "");
    fetch(`/recipes/${encodeURIComponent(cleanFile)}`)
        .then((res) => {
            if (!res.ok) throw new Error("Not found");
            return res.text();
        })
        .then((md) => {
            contentEl.innerHTML = renderMarkdown(md);
        })
        .catch(() => {
            contentEl.innerHTML = `<p>Nie znaleziono pliku przepisu (<code>${escapeHtml(cleanFile)}</code>) w katalogu <code>frontend/recipes/</code>.</p>`;
        });
}

function loadRecipes() {
    const list = document.getElementById("recipes-list");
    fetch("/api/recipes")
        .then((res) => res.json())
        .then((data) => {
            list.innerHTML = "";
            if (!Array.isArray(data) || data.length === 0) {
                list.innerHTML =
                    '<li class="recipe-item"><span class="recipe-title">Brak przepisów w bazie</span></li>';
                return;
            }
            data.forEach((recipe) => {
                const li = document.createElement("li");
                const btn = document.createElement("button");
                btn.type = "button";
                btn.className = "recipe-btn";
                btn.innerHTML = `<span>${escapeHtml(String(recipe.RecipeID))}. ${escapeHtml(recipe.Title)}</span><span class="recipe-arrow">→</span>`;
                btn.addEventListener("click", () => openRecipe(recipe));
                li.appendChild(btn);
                list.appendChild(li);
            });
        })
        .catch(() => {
            list.innerHTML =
                '<li class="recipe-item"><span class="recipe-title">Błąd pobierania przepisów</span></li>';
        });
}

document
    .getElementById("add-recipe-form")
    .addEventListener("submit", function (e) {
        e.preventDefault();
        const Title = document.getElementById("title").value.trim();
        const FileName = document.getElementById("filename").value.trim();

        fetch("/api/recipes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ Title, FileName }),
        })
            .then(async (res) => {
                const data = await res.json();
                if (!res.ok) {
                    setMessage(
                        data.error || "Błąd podczas zapisu przepisu",
                        "error",
                    );
                    return;
                }
                setMessage(data.message || "Dodano przepis", "ok");
                e.target.reset();
            })
            .catch(() => {
                setMessage("Błąd połączenia z API", "error");
            });
    });

loadRecipes();
