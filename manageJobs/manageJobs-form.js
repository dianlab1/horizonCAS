const customerInput = document.querySelector(".customer-input");
const machineInput = document.querySelector(".machine-input");
const serviceInput = document.querySelector(".service-input");
const dateInput = document.querySelector(".date-input");
const timeInput = document.querySelector(".time-input");
const notesInput = document.querySelector(".notes-input");
const jobNameInput = document.querySelector(".name-input");
const saveBtn = document.querySelector(".save");
const cancelBtn = document.querySelector(".cancel");


async function loadCustomers() {

    const { data: customers, error } = await db
        .from("customers")
        .select("*")
        .order("name");

    if (error) {
        console.error("Error loading customers:", error);
        return;
    }

    customerInput.replaceChildren();

    const defaultOption = document.createElement("option");

    defaultOption.value = "";
    defaultOption.textContent = "Select Customer";

    customerInput.appendChild(defaultOption);

    customers.forEach(function (customer) {

        const option = document.createElement("option");

        option.value = customer.id;
        option.textContent = customer.name;

        customerInput.appendChild(option);
    });
}

loadCustomers();

customerInput.addEventListener("change", function () {

    const customerId = customerInput.value;

    loadMachines(customerId);
});

async function loadMachines(customerId) {

    machineInput.replaceChildren();

    if (!customerId) {
        machineInput.disabled = true;

        const option = document.createElement("option");
        option.value = "";
        option.textContent = "Select Customer First";

        machineInput.appendChild(option);

        return;
    }

    const { data: machines, error } = await db
        .from("machines")
        .select("id, name, make, model, serial_number")
        .eq("customer_id", customerId)
        .order("name");

    if (error) {
        console.error("Error loading machines:", error);
        return;
    }

    machineInput.disabled = false;

    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Select Machine";

    machineInput.appendChild(defaultOption);

    machines.forEach(function (machine) {

        const option = document.createElement("option");

        option.value = machine.id;
        option.textContent = machine.name;

        machineInput.appendChild(option);
    });
};

saveBtn.addEventListener("click", async function () {
    const jobName = jobNameInput.value;
    const customerId = customerInput.value;
    const machineId = machineInput.value;
    const serviceValue = serviceInput.value;
    const dateValue = dateInput.value;
    const timeValue = timeInput.value;
    const notesValue = notesInput.value;

    const job = {
        name: jobName,
        customer_id: customerId,
        machine_id: machineId,
        service_type: serviceValue,
        job_date: dateValue,
        job_time: timeValue,
        notes: notesValue
    };

    const { data, error } = await db
        .from("jobs")
        .insert(job)
        .select()
        .single();

    if (error) {
        console.error("Error inserting job:", error);
        return;
    };

    const technicianInputs =
        document.querySelectorAll('input[type="checkbox"]');

    const selectedTechnicians = [];

    technicianInputs.forEach(function (technician) {

        if (technician.checked) {
            selectedTechnicians.push(technician.value);
        };

    });

    if (selectedTechnicians.length > 0) {
        const technicianRows = selectedTechnicians.map(function (technicianId) {
            return {
                job_id: data.id,
                technician_id: Number(technicianId)
            };
        });

        console.log("Technician rows:", technicianRows);

        const { error } = await db
            .from("job_technicians")
            .insert(technicianRows);

        if (error) {
            console.error("Error assigning technicians:", error);
            return;
        }
    }

    window.location.href = "manageJobs.html";
});

cancelBtn.addEventListener("click", function () {
    window.location.href = "manageJobs.html";
});