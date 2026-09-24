customerInput = document.querySelector(".customer-input");
makeInput = document.querySelector(".make-input");
modelInput = document.querySelector(".model-input");
serialInput = document.querySelector(".serial-input");
oilInput = document.querySelector(".oil-input");
notesInput = document.querySelector(".notes-input");
machineNameInput = document.querySelector(".machine-input");
saveBtn = document.querySelector(".save");
cancelBtn = document.querySelector(".cancel");

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

}

loadCustomers();

saveBtn.addEventListener("click", async function () {
    const name = machineNameInput.value;
    const customer_id = customerInput.value;
    const make = makeInput.value;
    const model = modelInput.value;
    const serial_number = serialInput.value;
    const oil_amount = oilInput.value;
    const notes = notesInput.value;

    const machineData = {
        name,
        customer_id,
        make,
        model,
        serial_number,
        oil_amount,
        notes
    };

    const { data, error } = await db
        .from("machines")
        .insert(machineData)
        .select()
        .single();

    if (error) {
        console.error("Full Error:", error);
        return;
    }

    console.log("Machine created:", data);
})

