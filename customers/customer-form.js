const customerName = document.querySelector(".name-input");
const customerContact = document.querySelector(".person-input");
const customerPhone = document.querySelector(".phone-input");
const customerLocation = document.querySelector(".location-input");
const saveBtn = document.querySelector(".save");
const cancelBtn = document.querySelector(".cancel");

const params = new URLSearchParams(window.location.search);
const customerId = params.get("id");

let customers = [];

async function loadCustomer() {
    const { data: customer, error } = await db
        .from("customers")
        .select("*")
        .eq("id", customerId)
        .single();

    if (error) {
        console.error("Error Loading Customers", error);
        return;
    }

    customerName.value = customer.name || "";
    customerContact.value = customer.contact_person || "";
    customerPhone.value = customer.phone_number || "";
    customerLocation.value = customer.location || "";

};

async function initializeForm() {

    if (customerId) {
        await loadCustomer();
    };
};

initializeForm();

saveBtn.addEventListener("click", async function () {

    const name = customerName.value.trim();
    const contact = customerContact.value.trim();
    const phone = customerPhone.value.trim();
    const location = customerLocation.value.trim();

    if (name === "") {
        alert("Please enter customer name");
        return;
    }

    const customerData = {
        name,
        contact_person: contact,
        phone_number: phone,
        location
    };

    let error;

    if (customerId) {

        const result = await db
            .from("customers")
            .update(customerData)
            .eq("id", customerId);

        error = result.error;

    } else {

        const result = await db
            .from("customers")
            .insert(customerData);

        error = result.error;
    }

    if (error) {
        console.error("Full Error:", error);
        alert("Could not save customer.");
        return;
    }

    if (customerId) {
        window.location.href =
            `../customers/customer-details.html?id=${customerId}`;
    } else {
        window.location.href = "../customers/customers.html";
    }
});

cancelBtn.addEventListener("click", function () {
    window.location.href = "../customers/customers.html";
});