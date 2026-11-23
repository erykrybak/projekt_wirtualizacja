let currentRecipeId = null;

function escapeHtml(str) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
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

function deleteCurrentRecipe() {
    if (!currentRecipeId) return;

    const title =
        document.getElementById("detail-title").textContent || "ten przepis";
    if (!confirm(`Czy na pewno chcesz usunąć przepis „${title}"?`)) {
        return;
    }

    fetch(`/api/recipes/${encodeURIComponent(currentRecipeId)}`, {
        method: "DELETE",
    })
        .then(async (res) => {
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                throw new Error(data.error || "Nie udało się usunąć przepisu");
            }
            currentRecipeId = null;
            showView("recipes-view");
        })
        .catch((err) => {
            alert(err.message);
        });
}

function openRecipe(recipe) {
    currentRecipeId = recipe.RecipeID;
    document.getElementById("detail-title").textContent = recipe.Title;
    const contentEl = document.getElementById("detail-content");
    contentEl.innerHTML = "<p>Ładowanie przepisu...</p>";
    showView("recipe-detail-view");

    fetch(`/api/recipes/${encodeURIComponent(recipe.RecipeID)}`)
        .then(async (res) => {
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                throw new Error(data.error || "Nie udało się pobrać przepisu");
            }
            return data;
        })
        .then((data) => {
            if (data.Title) {
                document.getElementById("detail-title").textContent =
                    data.Title;
            }
            contentEl.innerHTML = data.html || "<p>Przepis nie ma treści.</p>";
        })
        .catch((err) => {
            contentEl.innerHTML = `<p>${escapeHtml(err.message)}</p>`;
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
    .getElementById("btn-delete-recipe")
    .addEventListener("click", deleteCurrentRecipe);

document
    .getElementById("add-recipe-form")
    .addEventListener("submit", function (e) {
        e.preventDefault();
        const Title = document.getElementById("title").value.trim();
        const FileName = document.getElementById("filename").value.trim();
        const Content = document.getElementById("content").value;

        fetch("/api/recipes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ Title, FileName, Content }),
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
