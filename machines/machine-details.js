const params = new URLSearchParams(window.location.search);
const machineId = Number(params.get("id"));

const machineName = document.querySelector(".machine-name");
const machineSerial = document.querySelector(".machine-serial");
const machineCustomer = document.querySelector(".machine-customer");
const partResults = document.querySelector(".part-results");

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
    });
}

loadMachine();

const backButton = document.querySelector("#backButton");

backButton.addEventListener("click", function () {

    if (selectedMachine && selectedMachine.customer_id) {
        window.location.href =
            "../main/main.html";
    } else {
        window.location.href = "../customers/customers.html";
    }
});