const currentWorker = localStorage.getItem("currentWorker");

if (currentWorker) {
    const greeting = document.querySelector(".title");
    greeting.textContent = "Good Morning, " + currentWorker;
} else window.location.href = "./login/index.html";

const manageJobsWindow = document.querySelector(".module");
manageJobsWindow.addEventListener("click", function () {
    window.location.href = "../manageJobs/manageJobs.html";
});

const availableJobsWindow = document.querySelector(".module2");
availableJobsWindow.addEventListener("click", function () {
    window.location.href = "../availableJobs/availableJobs.html";
});

const customerListWindow = document.querySelector(".module3");
customerListWindow.addEventListener("click", function () {
    window.location.href = "../customers/customers.html";
});

const machinesWindow = document.querySelector(".module4");
machinesWindow.addEventListener("click", function () {
    window.location.href = "../machines/machines.html";
});

const partsListWindow = document.querySelector(".module5");
partsListWindow.addEventListener("click", function () {
    window.location.href = "../parts/parts.html";
});

const vsdWindow = document.querySelector(".module6");
vsdWindow.addEventListener("click", function () {
    window.location.href = "../vsd/vsd.html";
});