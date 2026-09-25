let machinesResults = document.querySelector(".machines-results");
let searchInput = document.querySelector(".placeholder");

let machines = [];

async function loadMachines() {
    const { data, error } = await db
        .from("machines")
        .select("*")
        .order("name");

    if (error) {
        console.error("Error loading machines:", error);
        return;
    }

    machines = data.map(machine => {
        return {
            id: machine.id,
            name: machine.name,
            make: machine.make || "",
            model: machine.model || "",
            serialNumber: machine.serial_number || "",
            oilAmount: machine.oil_amount || ""
        };
    });

    displayMachines(machines);
}

function displayMachines(machinesList) {

    machinesList.forEach(machine => {
        const card = document.createElement("div");
        card.className = "card";
        card.dataset.machineId = machine.id;

        card.addEventListener("click", function () {
            const machineId = Number(card.dataset.machineId);

            const selectedMachine = machines.find(machine => {
                return machine.id === machineId;
            });

            window.location.href = `machine-details.html?id=${machineId}`;
        });

        const machineHeader = document.createElement("div");
        machineHeader.className = "machine-header";

        const machineIcon = document.createElement("img");
        machineIcon.className = "icon2";
        machineIcon.src = "../icons/anvil.png";

        const machineName = document.createElement("div");
        machineName.className = "name";
        machineName.textContent = machine.name;

        const machineDetails = document.createElement("div");
        machineDetails.className = "detail";

        const machineSerial = document.createElement("div");
        machineSerial.className = "machine-serial";
        machineSerial.textContent = machine.serial_number;

        // Get customer to display here
        // const machineBuilding = document.createElement("div");
        // machineBuilding.className = "value";
        // machineBuilding.textContent =

        // get machine service to display here
        // const machineServiceContext = document.createElement("div");
        // machineService.className = "service-context";
        // const machineLastService = document.createElement("div");
        //machineLastService.className = "service";
        //machineLastService.textContent =


        machineHeader.appendChild(machineIcon);
        machineHeader.appendChild(machineName);

        machineDetails.appendChild(machineSerial);

        card.appendChild(machineHeader);
        card.appendChild(machineDetails);

        machinesResults.appendChild(card);
    });
};

loadMachines();

searchInput.addEventListener("input", function () {
    const searchTerm = searchInput.value.toLowerCase();

    const filteredMachines = machines.filter(machine => {
        return (
            machine.name.toLowerCase().includes(searchTerm) ||
            machine.make.toLowerCase().includes(searchTerm)
        );
    });

    machinesResults.innerHTML = "";
    if (filteredMachines.length === 0) {
        const noResult = document.createElement("div");

        noResult.className = "no-result";
        noResult.textContent = "No Machines Found";

        customerResults.appendChild(noResult);
    } else {
        displayMachines(filteredMachines);
    }
});

let backButton = document.querySelector(".arrow-left");

backButton.addEventListener("click", function () {
    window.location.href = "../main/main.html";
});

const addMachineButton = document.querySelector(".add-machine");

addMachineButton.addEventListener("click", function () {
    window.location.href = "machine-form.html";
});