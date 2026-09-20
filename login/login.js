console.log("login js loaded");

const employeeCards = document.querySelectorAll(".employee2");

employeeCards.forEach(employee => {

    employee.addEventListener("click", () => {

        const nameElement = employee.querySelector(".name2");

        if (!nameElement) {
            return;
        }

        const employeeName = nameElement.textContent.trim();

        localStorage.setItem("currentWorker", employeeName);

        window.location.href = "../main/main.html";

    });

});