const params = new URLSearchParams(window.location.search);
const customerId = Number(params.get("id"));

const initialsValue = document.querySelector(".initials-value");
const customerName = document.querySelector(".name");
const customerContact = document.querySelector(".contact");
const phoneNumber = document.querySelector(".phone-number");
const customerLocation = document.querySelector(".location");

async function loadCustomer() {
    const { data: customer, error } = await db
        .from("customers")
        .select("*")
        .eq("id", customerId)
        .single();

    if (error) {
        console.error("Error loading customer:", error);
        customerName.textContent = "Customer not found";
        return;
    }

    initialsValue.textContent =
        customer.contact_person
            ? customer.contact_person.charAt(0).toUpperCase()
            : "";

    customerName.textContent =
        customer.name;

    customerContact.textContent =
        customer.contact_person || "";

    phoneNumber.textContent =
        customer.phone_number || "";

    customerLocation.textContent =
        customer.location || "";
}

loadCustomer();

const backButton = document.querySelector("#backButton");

backButton.addEventListener("click", function () {
    window.location.href = "customers.html";
});

const machineResults = document.querySelector(".machine-results");

async function loadMachines() {
    const { data: customerMachines, error } = await db
        .from("machines")
        .select("*")
        .eq("customer_id", customerId)
        .order("name");

    if (error) {
        console.error("Error loading machines:", error);
        return;
    }

    customerMachines.forEach(machine => {
        const machineCard = document.createElement("div");
        machineCard.className = "machine-card";
        machineCard.dataset.machineId = machine.id;

        const machineName = document.createElement("div");
        machineName.className = "machine-name";
        machineName.textContent = machine.name;

        const serialNumber = document.createElement("div");
        serialNumber.className = "machine-serial";
        serialNumber.textContent = `Serial: ${machine.serial_number || "No serial number"}`;

        machineCard.appendChild(machineName);
        machineCard.appendChild(serialNumber);

        machineResults.appendChild(machineCard);

        machineCard.addEventListener("click", function () {
            const machineId = Number(machineCard.dataset.machineId);

            window.location.href =
                `../machines/machine-details.html?id=${machineId}`;
        });
    });
}

loadMachines();