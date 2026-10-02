const addJobBtn = document.querySelector(".addJobBtn");
const jobResults = document.querySelector(".job-results");
const searchInput = document.querySelector(".search");


// Create Job button
addJobBtn.addEventListener("click", function () {
    window.location.href = "manageJobs-form.html";
});


// Load jobs from Supabase
async function loadJobs() {

    const { data: jobs, error } = await db
        .from("jobs")
        .select(`
            *,
            customers(name),
            machines(name)
        `)
        .order("job_date")
        .order("job_time");

    if (error) {
        console.error("Error loading jobs:", error);
        return;
    }

    displayJobs(jobs);
}


// Display jobs on the page
function displayJobs(jobsToDisplay) {

    jobResults.replaceChildren();

    // No jobs
    if (jobsToDisplay.length === 0) {

        const noJobsMessage = document.createElement("div");

        noJobsMessage.className = "no-jobs-message";

        noJobsMessage.textContent = "No jobs found.";

        jobResults.appendChild(noJobsMessage);

        return;
    }


    // Create a card for each job
    jobsToDisplay.forEach(function (job) {

        const jobCard = document.createElement("div");

        jobCard.className = "card";


        // Job Name
        const jobName = document.createElement("div");

        jobName.className = "job-title";

        jobName.textContent = job.name;


        // Customer
        const jobCustomer = document.createElement("div");

        jobCustomer.className = "detail";

        jobCustomer.textContent =
            `Customer: ${job.customers?.name || "Not assigned"}`;


        // Machine
        const jobMachine = document.createElement("div");

        jobMachine.className = "detail";

        jobMachine.textContent =
            `Machine: ${job.machines?.name || "Not assigned"}`;


        // Service
        const jobService = document.createElement("div");

        jobService.className = "detail";

        jobService.textContent =
            `Service: ${job.service_type || "Not specified"}`;


        // Date & Time
        const jobDateTime = document.createElement("div");

        jobDateTime.className = "detail";

        let formattedDate = "Date not set";
        let formattedTime = "Time not set";


        // Format date
        if (job.job_date) {

            const date = new Date(job.job_date + "T00:00:00");

            formattedDate = date.toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric"
            });
        }


        // Format time
        if (job.job_time) {

            formattedTime = job.job_time.substring(0, 5);
        }


        jobDateTime.textContent =
            `Date & Time: ${formattedDate} · ${formattedTime}`;


        // Add everything to the card
        jobCard.appendChild(jobName);
        jobCard.appendChild(jobCustomer);
        jobCard.appendChild(jobMachine);
        jobCard.appendChild(jobService);
        jobCard.appendChild(jobDateTime);


        // Add card to page
        jobResults.appendChild(jobCard);
    });
}


// Load jobs when page opens
loadJobs();