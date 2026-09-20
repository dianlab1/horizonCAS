let customerResults = document.querySelector(".customer-results");
let searchInput = document.querySelector(".placeholder");

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
            name: customer.name,
            contactPerson: customer.contact_person || "",
            contactNumber: customer.phone_number || "",
            location: customer.location || ""
        };
    });

    displayCustomers(customers);
}

function displayCustomers(customerList) {

    customerList.forEach(customer => {
        const card = document.createElement("div");
        card.className = "card";
        card.dataset.customerId = customer.id;

        card.addEventListener("click", function () {
            const customerId = Number(card.dataset.customerId);

            const selectedCustomer = customers.find(customer => {
                return customer.id === customerId;
            });

            window.location.href = `customer-details.html?id=${customerId}`;
        });

        const customerHeader = document.createElement("div");
        customerHeader.className = "customer-header";

        const customerElement = document.createElement("div");
        customerElement.className = "customer";

        const name = document.createElement("div");
        name.className = "name";
        name.textContent = customer.name;

        const initials = document.createElement("div");
        initials.className = "initials";
        const initialsValue = document.createElement("div");
        initialsValue.className = "value";
        initialsValue.textContent = customer.contactPerson.charAt(0).toUpperCase();

        const contact = document.createElement("div");
        contact.className = "contact";
        contact.textContent = customer.contactPerson;

        const phoneDetail = document.createElement("div");
        phoneDetail.className = "detail";
        const phoneIcon = document.createElement("img");
        phoneIcon.className = "phone";
        phoneIcon.src = "../icons/phone_icon.png";
        const phone = document.createElement("div");
        phone.className = "value2";
        phone.textContent = customer.contactNumber;
        phoneDetail.appendChild(phoneIcon);
        phoneDetail.appendChild(phone);

        const locationDetail = document.createElement("div");
        locationDetail.className = "detail";
        const locationIcon = document.createElement("img");
        locationIcon.className = "phone";
        locationIcon.src = "../icons/location_icon.png";
        const location = document.createElement("div");
        location.className = "value2";
        location.textContent = customer.location;
        locationDetail.appendChild(locationIcon);
        locationDetail.appendChild(location);

        initials.appendChild(initialsValue);

        customerElement.appendChild(name);
        customerElement.appendChild(contact);
        customerHeader.appendChild(initials);
        customerHeader.appendChild(customerElement);

        card.appendChild(customerHeader);
        card.appendChild(phoneDetail);
        card.appendChild(locationDetail);

        customerResults.appendChild(card);


    });
}

loadCustomers();

searchInput.addEventListener("input", function () {
    const searchTerm = searchInput.value.toLowerCase();

    const filteredCustomers = customers.filter(customer => {
        return (
            customer.name.toLowerCase().includes(searchTerm) ||
            customer.contactPerson.toLowerCase().includes(searchTerm) ||
            customer.location.toLowerCase().includes(searchTerm)
        );
    });

    customerResults.innerHTML = "";
    if (filteredCustomers.length === 0) {
        const noResult = document.createElement("div");

        noResult.className = "no-result";
        noResult.textContent = "No Customers Found";

        customerResults.appendChild(noResult);
    } else {
        displayCustomers(filteredCustomers);
    }

});
