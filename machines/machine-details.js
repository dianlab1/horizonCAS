const params = new URLSearchParams(window.location.search);
const machineId = Number(params.get("id"));

const machineName = document.querySelector(".machine-name");
const machineSerial = document.querySelector(".machine-serial");
const machineCustomer = document.querySelector(".machine-customer");
const partResults = document.querySelector(".part-results");

const addPartButton = document.querySelector("#addPartButton");
const removePartButton = document.querySelector("#removePartButton");
const addPartModal = document.querySelector("#addPartModal");
const closePartModal = document.querySelector("#closePartModal");
const cancelPartModal = document.querySelector("#cancelPartModal");
const partSearch = document.querySelector("#partSearch");
const availableParts = document.querySelector("#availableParts");

const removePartModal = document.querySelector("#removePartModal");
const closeRemovePartModal = document.querySelector("#closeRemovePartModal");
const cancelRemovePartModal = document.querySelector("#cancelRemovePartModal");
const assignedParts = document.querySelector("#assignedParts");

let availablePartList = [];

let selectedMachine;

async function loadMachine() {

    // Get the machine
    const { data: machine, error: machineError } = await db
        .from("machines")
        .select("*")
        .eq("id", machineId)
        .single();

    if (machineError) {
        console.error("Error loading machine:", machineError);
        machineName.textContent = "Machine not found";
        return;
    }

    selectedMachine = machine;
    partResults.replaceChildren();

    // Display machine information
    machineName.textContent = machine.name;

    machineSerial.textContent =
        `Serial: ${machine.serial_number || "No serial number"}`;

    // Get the customer
    if (machine.customer_id) {

        const { data: customer, error: customerError } = await db
            .from("customers")
            .select("name")
            .eq("id", machine.customer_id)
            .single();

        if (customerError) {
            console.error("Error loading customer:", customerError);
        } else {
            machineCustomer.textContent =
                `Customer: ${customer.name}`;
        }
    }

    // Get the parts used by this machine
    const { data: machineParts, error: machinePartsError } = await db
        .from("machine_parts")
        .select("part_id")
        .eq("machine_id", machineId);

    if (machinePartsError) {
        console.error("Error loading machine parts:", machinePartsError);
        return;
    }

    // If this machine has no parts
    if (machineParts.length === 0) {
        const noParts = document.createElement("div");
        noParts.className = "no-result";
        noParts.textContent = "No parts assigned";
        partResults.appendChild(noParts);
        return;
    }

    // Get the actual part IDs
    const partIds = machineParts.map(machinePart => {
        return machinePart.part_id;
    });

    // Get the actual parts
    const { data: parts, error: partsError } = await db
        .from("parts")
        .select("*")
        .in("id", partIds);

    if (partsError) {
        console.error("Error loading parts:", partsError);
        return;
    }

    // Create part cards
    parts.forEach(part => {

        const partCard = document.createElement("div");
        partCard.className = "part-card";

        const partName = document.createElement("div");
        partName.className = "part-name";
        partName.textContent = part.name;

        const partType = document.createElement("div");
        partType.className = "part-type";
        partType.textContent = part.category || "";

        partCard.appendChild(partName);
        partCard.appendChild(partType);

        partResults.appendChild(partCard);

        partCard.addEventListener("click", function () {

            window.location.href =
                `../parts/parts-details.html?id=${part.id}&machineId=${machineId}`;

        });
    });
}

loadMachine();

const backButton = document.querySelector("#backButton");

backButton.addEventListener("click", function () {

    if (selectedMachine && selectedMachine.customer_id) {
        window.location.href =
            "../machines/machines.html";
    } else {
        window.location.href = "../customers/customers.html";
    }
});

const editButton = document.querySelector("#editButton");

editButton.addEventListener("click", function () {
    window.location.href = `machine-form.html?id=${machineId}`;
});

const deleteBtn = document.querySelector("#deleteButton");

deleteBtn.addEventListener("click", async function () {
    const confirmed = confirm(
        "Are you sure you want to delete this machine ?"
    );

    if (!confirmed) {
        return;
    }

    const { error } = await db
        .from("machines")
        .delete()
        .eq("id", machineId);

    if (error) {
        console.error("Error deleting machine:", error);
        alert("Could not delete machine.");
        return;
    }

    window.location.href = "../machines/machines.html";
});

addPartButton.addEventListener("click", async function () {
    addPartModal.classList.add("active");

    await loadAvailableParts();
});

closePartModal.addEventListener("click", function () {
    addPartModal.classList.remove("active");
});

cancelPartModal.addEventListener("click", function () {
    addPartModal.classList.remove("active");
});

addPartModal.addEventListener("click", function (event) {
    if (event.target === addPartModal) {
        addPartModal.classList.remove("active");
    }
});

async function loadAvailableParts() {

    const { data: assignedParts, error: assignedError } = await db
        .from("machine_parts")
        .select("part_id")
        .eq("machine_id", machineId);

    if (assignedError) {
        console.error("Error loading assigned parts:", assignedError);
        return;
    }

    const assignedPartIds = assignedParts.map(function (item) {
        return item.part_id;
    });

    const { data: allParts, error: partsError } = await db
        .from("parts")
        .select("*")
        .order("name");

    if (partsError) {
        console.error("Error loading parts:", partsError);
        return;
    }

    availablePartList = allParts.filter(function (part) {
        return !assignedPartIds.includes(part.id);
    });

    displayAvailableParts(availablePartList);
}

function displayAvailableParts(partsToDisplay) {

    availableParts.replaceChildren();

    if (partsToDisplay.length === 0) {
        const noParts = document.createElement("div");

        noParts.className = "no-available-parts";

        noParts.textContent = "No available parts found.";

        availableParts.appendChild(noParts);

        return;
    };

    partsToDisplay.forEach(function (part) {
        const partElement = document.createElement("div");
        partElement.className = "available-part";

        const name = document.createElement("div");
        name.className = "available-part-name";
        name.textContent = part.name;

        const info = document.createElement("div");
        info.className = "available-part-info";
        info.textContent = part.category || "No type";

        const code = document.createElement("div");
        code.className = "available-part-code";
        code.textContent =
            part.enviro_code ||
            part.shumbala_code ||
            part.manufacturer_part_number ||
            "No part code";

        partElement.appendChild(name);
        partElement.appendChild(info);
        partElement.appendChild(code);

        availableParts.appendChild(partElement);

        partElement.addEventListener("click", function () {
            assignPart(part.id);
        });
    });
};

partSearch.addEventListener("input", function () {

    const searchTerm = partSearch.value.toLowerCase().trim();

    const filteredParts = availablePartList.filter(function (part) {

        return (part.name || "")
            .toLowerCase()
            .includes(searchTerm);

    });
    displayAvailableParts(filteredParts);
});

async function assignPart(partId) {

    const { error } = await db
        .from("machine_parts")
        .insert({
            machine_id: machineId,
            part_id: partId
        });

    if (error) {
        console.error("Error assigning part:", error);
        alert("Could not assign part.");
        return;
    }

    addPartModal.classList.remove("active");
    await loadMachine();

}

removePartButton.addEventListener("click", async function () {
    removePartModal.classList.add("active");

    await loadAssignedParts();
});

async function loadAssignedParts() {

    const { data: machineParts, error } = await db
        .from("machine_parts")
        .select("part_id")
        .eq("machine_id", machineId);

    if (error) {
        console.error("Error loading assigned parts:", error);
        return;
    }

    const partIds = machineParts.map(function (machinePart) {
        return machinePart.part_id;
    });

    if (partIds.length === 0) {
        assignedParts.replaceChildren();

        const noParts = document.createElement("div");
        noParts.className = "no-available-parts";
        noParts.textContent = "No parts assigned to this machine.";

        assignedParts.appendChild(noParts);

        return;
    }

    const { data: parts, error: partsError } = await db
        .from("parts")
        .select("*")
        .in("id", partIds);

    if (partsError) {
        console.error("Error loading parts:", partsError);
        return;
    }

    displayAssignedParts(parts);
}

function displayAssignedParts(partsToDisplay) {

    assignedParts.replaceChildren();

    if (partsToDisplay.length === 0) {
        const noParts = document.createElement("div");

        noParts.className = "no-available-parts";

        noParts.textContent = "No parts assigned to this machine.";

        assignedParts.appendChild(noParts);

        return;
    }

    partsToDisplay.forEach(function (part) {

        const partElement = document.createElement("div");
        partElement.className = "available-part";

        const name = document.createElement("div");
        name.className = "available-part-name";
        name.textContent = part.name;

        const info = document.createElement("div");
        info.className = "available-part-info";
        info.textContent = part.category || "No type";

        const code = document.createElement("div");
        code.className = "available-part-code";

        code.textContent =
            part.enviro_code ||
            part.shumbala_code ||
            part.manufacturer_part_number ||
            "No part code";

        partElement.appendChild(name);
        partElement.appendChild(info);
        partElement.appendChild(code);

        partElement.addEventListener("click", function () {
            removePart(part.id);
        });

        assignedParts.appendChild(partElement);
    });
}

async function removePart(partId) {

    const confirmed = confirm(
        "Are you sure you want to remove this part from the machine?"
    );

    if (!confirmed) {
        return;
    }

    const { error } = await db
        .from("machine_parts")
        .delete()
        .eq("machine_id", machineId)
        .eq("part_id", partId);

    if (error) {
        console.error("Error removing part:", error);
        alert("Could not remove part.");
        return;
    }

    removePartModal.classList.remove("active");

    await loadMachine();
}

closeRemovePartModal.addEventListener("click", function () {
    removePartModal.classList.remove("active");
});

cancelRemovePartModal.addEventListener("click", function () {
    removePartModal.classList.remove("active");
});

removePartModal.addEventListener("click", function (event) {
    if (event.target === removePartModal) {
        removePartModal.classList.remove("active");
    }
});