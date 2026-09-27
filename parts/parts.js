let partsResults = document.querySelector(".parts-results");

let searchInput = document.querySelector(".placeholder");

let parts = [];

async function loadParts() {

    const { data, error } = await db
        .from("parts")
        .select("*")
        .order("name");

    if (error) {
        console.error("Error loading parts:", error);
        return;
    }

    parts = data.map(part => {
        return {
            id: part.id,
            name: part.name,
            category: part.category,
            localCode: part.local_code,
            manPartNumber: part.manufacturer_part_number,
            enviroCode: part.enviro_code,
            shumbalaCode: part.shumbala_code,
            filrecCode: part.filrec,
            partDescription: part.description,
            partNotes: part.notes
        };
    });

    displayParts();
}

function displayParts(partsToDisplay = parts) {

    partsResults.replaceChildren();

    if (partsToDisplay.length === 0) {
        const noResult = document.createElement("div");

        noResult.className = "no-result";

        noResult.textContent = "No Parts Found";

        partsResults.appendChild(noResult);

        return;
    }

    partsToDisplay.forEach(part => {

        const card = document.createElement("div");

        card.className = "card";

        card.dataset.partId = part.id;

        card.addEventListener("click", function () {

            const partId = Number(card.dataset.partId);

            window.location.href = `parts-details.html?id=${partId}`;

        });

        const partHeader = document.createElement("div");

        partHeader.className = "part-header";

        const partElement = document.createElement("div");

        partElement.className = "part";

        const name = document.createElement("div");

        name.className = "name";

        name.textContent = part.name;

        const category = document.createElement("div");

        category.className = "category";

        category.textContent = part.category || "";

        const enviro = document.createElement("div");

        enviro.className = "enviro";

        enviro.textContent = part.enviroCode || "";

        const shumbala = document.createElement("div");
        shumbala.className = "shumbala";
        shumbala.textContent = part.shumbalaCode;

        partHeader.appendChild(partElement);

        partElement.appendChild(name);

        partElement.appendChild(category);

        partElement.appendChild(enviro);
        partElement.appendChild(shumbala);

        card.appendChild(partHeader);

        partsResults.appendChild(card);
    });
}

loadParts();

searchInput.addEventListener("input", function () {

    const searchTerm = searchInput.value.toLowerCase().trim();

    const filteredParts = parts.filter(part => {

        return (
            (part.name || "").toLowerCase().includes(searchTerm) ||
            (part.category || "").toLowerCase().includes(searchTerm) ||
            (part.enviroCode || "").toLowerCase().includes(searchTerm) ||
            (part.shumbalaCode || "").toLowerCase().includes(searchTerm)
        );

    });

    displayParts(filteredParts);
});

let backButton = document.querySelector(".arrow-left");

backButton.addEventListener("click", function () {
    window.location.href = "../main/main.html";
});

const addPartButton = document.querySelector(".add-part");

addPartButton.addEventListener("click", function () {
    window.location.href = "part-form.html";
});
