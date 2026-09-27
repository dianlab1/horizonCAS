const params = new URLSearchParams(window.location.search);
const partId = Number(params.get("id"));
const machineId = params.get("machineId");

let partResults = document.querySelector(".part-results");

let parts = [];

async function loadPart() {

    const { data: part, error } = await db
        .from("parts")
        .select("*")
        .eq("id", partId)
        .single();

    if (error) {
        console.error("Error loading part:", error);
        return;
    }

    displayPart(part);
}

loadPart();

function createDetail(label, value) {

    const detail = document.createElement("div");
    detail.className = "detail";

    const labelElement = document.createElement("div");
    labelElement.className = "detail-label";
    labelElement.textContent = label;

    const valueElement = document.createElement("div");
    valueElement.className = "detail-value";
    valueElement.textContent = value || "Not provided";

    detail.appendChild(labelElement);
    detail.appendChild(valueElement);

    return detail;
}

function displayPart(part) {

    partResults.replaceChildren();

    if (!part) {

        const noResult = document.createElement("div");

        noResult.className = "no-result";

        noResult.textContent = "Part Not Found";

        partResults.appendChild(noResult);

        return;
    }

    const card = document.createElement("div");

    card.className = "card";

    const partHeader = document.createElement("div");

    partHeader.className = "part-header";

    const partElement = document.createElement("div");

    partElement.className = "part";


    partElement.appendChild(
        createDetail("Name", part.name)
    );

    partElement.appendChild(
        createDetail("Type", part.category)
    );

    partElement.appendChild(
        createDetail("Enviro", part.enviro_code)
    );

    partElement.appendChild(
        createDetail("Shumbala", part.shumbala_code)
    );

    partElement.appendChild(
        createDetail("Local Code", part.local_code)
    );

    partElement.appendChild(
        createDetail("Manufacturer Part Number", part.manufacturer_part_number)
    );

    partElement.appendChild(
        createDetail("Filrec", part.filrec)
    );

    partElement.appendChild(
        createDetail("Description", part.description)
    );

    partElement.appendChild(
        createDetail("Notes", part.notes)
    );

    partHeader.appendChild(partElement);

    card.appendChild(partHeader);

    partResults.appendChild(card);
}

backButton.addEventListener("click", function () {

    if (machineId) {

        window.location.href =
            `../machines/machine-details.html?id=${machineId}`;

    } else {

        window.location.href =
            "../parts/parts.html";

    }

});

const editButton = document.querySelector("#editButton");

editButton.addEventListener("click", function () {
    window.location.href = `part-form.html?id=${partId}`;
});

const deleteBtn = document.querySelector("#deleteButton");

deleteBtn.addEventListener("click", async function () {
    const confirmed = confirm(
        "Are you sure you want to delete this customer ?"
    );

    if (!confirmed) {
        return;
    }

    const { error } = await db
        .from("parts")
        .delete()
        .eq("id", partId);

    if (error) {
        console.error("Error deleting part:", error);
        alert("Could not delete part.");
        return;
    }

    window.location.href = "../parts/parts.html";
});