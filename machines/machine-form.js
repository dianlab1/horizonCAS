const customerInput = document.querySelector(".customer-input");
const makeInput = document.querySelector(".make-input");
const modelInput = document.querySelector(".model-input");
const serialInput = document.querySelector(".serial-input");
const oilInput = document.querySelector(".oil-input");
const notesInput = document.querySelector(".notes-input");
const machineNameInput = document.querySelector(".machine-input");
const saveBtn = document.querySelector(".save");
const cancelBtn = document.querySelector(".cancel");

const params = new URLSearchParams(window.location.search);
const machineId = params.get("id");

let customers = [];


async function loadCustomers() {
    const { data, error } = await db
        .from("customers")
        .select("*")
        .order("name");

    if (error) {
        console.error("Error loading customers:", error);
        return;
    }

    customers = data.map(customer => {
        return {
            id: customer.id,
            name: customer.name
        };
    });

    const optionDefault = document.createElement("option");
    optionDefault.value = "";
    optionDefault.textContent = "Select a Customer";
    optionDefault.disabled = true;
    optionDefault.selected = true;
    customerInput.appendChild(optionDefault);

    customers.forEach(customer => {

        const option = document.createElement("option");
        option.value = customer.id;
        option.textContent = customer.name;

        customerInput.appendChild(option);
    });

};

async function loadMachine() {

    const { data: machine, error } = await db
        .from("machines")
        .select("*")
        .eq("id", machineId)
        .single();

    if (error) {
        console.error("Error loading machine:", error);
        return;
    }

    machineNameInput.value = machine.name;
    customerInput.value = machine.customer_id;
    makeInput.value = machine.make || "";
    modelInput.value = machine.model || "";
    serialInput.value = machine.serial_number || "";
    oilInput.value = machine.oil_amount || "";
    notesInput.value = machine.notes || "";
}

async function initializeForm() {

    await loadCustomers();

    if (machineId) {
        await loadMachine();
    }
}

initializeForm();

saveBtn.addEventListener("click", async function () {

    const customer_id = customerInput.value;
    const name = machineNameInput.value.trim();
    const make = makeInput.value.trim();
    const model = modelInput.value.trim();
    const serial_number = serialInput.value.trim();
    const oil_amount = oilInput.value.trim();
    const notes = notesInput.value.trim();

    if (name === "") {
        alert("Please enter a machine name.");
        return;
    }

    if (customer_id === "") {
        alert("Please select a customer.");
        return;
    }

    const machineData = {
        name,
        customer_id,
        make,
        model,
        serial_number,
        oil_amount,
        notes
    };

    let error;

    if (machineId) {

        const result = await db
            .from("machines")
            .update(machineData)
            .eq("id", machineId);

        error = result.error;

    } else {

        const result = await db
            .from("machines")
            .insert(machineData);

        error = result.error;
    }

    if (error) {
        console.error("Full Error:", error);
        alert("Could not save machine.");
        return;
    }

    if (machineId) {
        window.location.href =
            `../machines/machine-details.html?id=${machineId}`;
    } else {
        window.location.href = "../machines/machines.html";
    }
});

cancelBtn.addEventListener("click", function () {
    window.location.href = "../machines/machines.html";
});

