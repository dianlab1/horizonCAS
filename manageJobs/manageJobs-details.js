const customerInput = document.querySelector(".customer-input");
const machineInput = document.querySelector(".machine-input");
const serviceInput = document.querySelector(".service-input");
const dateInput = document.querySelector(".date-input");
const timeInput = document.querySelector(".time-input");
const notesInput = document.querySelector(".notes-input");
const jobNameInput = document.querySelector(".name-input");
const saveBtn = document.querySelector(".save");
const cancelBtn = document.querySelector(".cancel");

const params = new URLSearchParams(window.location.search);
const jobId = Number(params.get("id"));

//Back button
cancelBtn.addEventListener("click", function () {
    window.location.href = "manageJobs.html";
});

async function loadJobDetails() {

    const { data: job, error } = await db
        .from("jobs")
        .select("*, customers(name), machines(name)")
        .eq("id", jobId)
        .single();

    if (error) {
        console.error("Error loading job:", error);
        return;
    }

    // Job Name
    jobNameInput.value = job.name || "";

    // Customer
    loadCustomers(job.customer_id);

    //Machine
    loadMachines(job.customer_id, job.machine_id);

    // Service Type
    serviceInput.value = job.service_type || "";

    // Date
    dateInput.value = job.job_date || "";

    // Time
    timeInput.value = job.job_time || "";

    // Notes
    notesInput.value = job.notes || "";

    // Technicians
    const { data: technicianAssignments, error: technicianError } = await db
        .from("job_technicians")
        .select("technician_id")
        .eq("job_id", jobId);

    if (technicianError) {
        console.error("Error loading technicians:", technicianError);
        return;
    }

    const technicianInputs = document.querySelectorAll(
        '.technician-option input[type="checkbox"]'
    );

    technicianInputs.forEach(function (checkbox) {

        checkbox.checked = technicianAssignments.some(function (assignment) {
            return Number(assignment.technician_id) === Number(checkbox.value);
        });

    });
}

loadJobDetails();

async function loadCustomers(customerId) {

    const { data: customers, error } = await db
        .from("customers")
        .select("*")
        .order("name");

    if (error) {
        console.error("Error loading customers:", error);
        return;
    }

    customerInput.replaceChildren();

    customers.forEach((customer) => {
        const option = document.createElement("option");
        option.value = customer.id;
        option.textContent = customer.name;
        customerInput.appendChild(option);
    });

    customerInput.value = customerId;
}

customerInput.addEventListener("change", function () {

    const customerId = customerInput.value;

    loadMachines(customerId);
});

async function loadMachines(customerId, machineId) {

    if (!customerId) {

        machineInput.replaceChildren();

        machineInput.disabled = true;

        const option = document.createElement("option");
        option.value = "";
        option.textContent = "Select Customer First";

        machineInput.appendChild(option);

        return;
    }

    const { data: machines, error } = await db
        .from("machines")
        .select("*")
        .eq("customer_id", customerId)
        .order("name");

    if (error) {
        console.error("Error loading machines:", error);
        return;
    }

    machineInput.disabled = false;

    machineInput.replaceChildren();

    machines.forEach((machine) => {
        const option = document.createElement("option");
        option.value = machine.id;
        option.textContent = machine.name;
        machineInput.appendChild(option);
    });

    machineInput.value = machineId;
}

saveBtn.addEventListener("click", async function () {

    const updatedJob = {
        name: jobNameInput.value,
        customer_id: customerInput.value,
        machine_id: machineInput.value,
        service_type: serviceInput.value,
        job_date: dateInput.value,
        job_time: timeInput.value,
        notes: notesInput.value
    };

    const selectedTechnicians = Array.from(
        document.querySelectorAll('.technician-option input[type="checkbox"]:checked')
    ).map(function (checkbox) {
        return Number(checkbox.value);
    });

    const { error } = await db
        .from("jobs")
        .update(updatedJob)
        .eq("id", jobId);

    if (error) {
        console.error("Error updating job:", error);
        return;
    }

    const { error: deleteTechnicianError } = await db
        .from("job_technicians")
        .delete()
        .eq("job_id", jobId);

    if (deleteTechnicianError) {
        console.error("Error updating technicians:", deleteTechnicianError);
        return;
    }

    if (selectedTechnicians.length > 0) {
        const technicianRows = selectedTechnicians.map(function (technicianId) {
            return {
                job_id: jobId,
                technician_id: technicianId
            };
        });

        const { error: insertTechnicianError } = await db
            .from("job_technicians")
            .insert(technicianRows);

        if (insertTechnicianError) {
            console.error("Error saving technicians:", insertTechnicianError);
            return;
        }
    }

    window.location.href = "manageJobs.html";

});

cancelBtn.addEventListener("click", function () {
    window.location.href = "manageJobs.html";
});