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
                li.className = "recipe-item";

                const titleSpan = document.createElement("span");
                titleSpan.className = "recipe-title";
                titleSpan.textContent = `${recipe.RecipeID}. ${recipe.Title}`;

                li.appendChild(titleSpan);
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
