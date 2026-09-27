const partName = document.querySelector(".name-input");
const partType = document.querySelector(".type-input");
const partEnviro = document.querySelector(".enviro-input");
const partShumbala = document.querySelector(".shumbala-input");
const partLocal = document.querySelector(".local-input");
const partMan = document.querySelector(".man-input");
const partFilrec = document.querySelector(".filrec-input");
const partDesc = document.querySelector(".description-input");
const partNotes = document.querySelector(".notes-input");
const saveBtn = document.querySelector(".save");
const cancelBtn = document.querySelector(".cancel");

const params = new URLSearchParams(window.location.search);
const partId = Number(params.get("id"));

async function loadPart() {
    const { data: part, error } = await db
        .from("parts")
        .select("*")
        .eq("id", partId)
        .single();

    if (error) {
        console.error("Error Loading Part", error);
        return;
    }

    partName.value = part.name || "";
    partType.value = part.category || "";
    partEnviro.value = part.enviro_code || "";
    partShumbala.value = part.shumbala_code || "";
    partLocal.value = part.local_code || "";
    partMan.value = part.manufacturer_part_number || "";
    partFilrec.value = part.filrec || "";
    partDesc.value = part.description || "";
    partNotes.value = part.notes || "";
};

async function initializeForm() {

    if (partId) {
        await loadPart();
    };
};

initializeForm();

saveBtn.addEventListener("click", async function () {

    const name = partName.value.trim();
    const type = partType.value.trim();
    const enviro = partEnviro.value.trim();
    const shumbala = partShumbala.value.trim();
    const local = partLocal.value.trim();
    const man = partMan.value.trim();
    const filrec = partFilrec.value.trim();
    const desc = partDesc.value.trim();
    const notes = partNotes.value.trim();

    if (name === "") {
        alert("Please Enter Part Name");
        return;
    }

    if (type === "") {
        alert("Please Enter Part Type");
        return;
    }

    const partData = {
        name: name,
        category: type,
        local_code: local,
        manufacturer_part_number: man,
        enviro_code: enviro,
        shumbala_code: shumbala,
        filrec: filrec,
        description: desc,
        notes: notes
    };

    let error;

    if (partId) {
        const result = await db
            .from("parts")
            .update(partData)
            .eq("id", partId);

        error = result.error;
    } else {

        const result = await db
            .from("parts")
            .insert(partData);

        error = result.error;
    }

    if (error) {
        console.error("Full Error:", error);
        alert("Could not save part.");
        return;
    }

    if (partId) {
        window.location.href =
            `../parts/parts-details.html?id=${partId}`;
    } else {
        window.location.href = "../parts/parts.html";
    }

});

cancelBtn.addEventListener("click", function () {
    window.location.href = "../parts/parts.html";
});