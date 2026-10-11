const searchInput = document.querySelector('.search');
const jobResults = document.querySelector('.job-results');
const backBtn = document.querySelector(".arrow-left");
const closeBtn = document.getElementById('closeModalBtn');
const detailsInModal = document.querySelector(".job-details");
const jobModal = document.getElementById("details-modal");
let selectedJobId = null;
const jobTimer = document.getElementById("job-timer");
let timerInterval = null;
let selectedJobStartTime = null;
const stopJobBtn = document.querySelector(".stopJobBtn");

function setStopJobRunning(isRunning) {
    stopJobBtn.classList.toggle("is-running", isRunning);
}

//Back button
backBtn.addEventListener("click", function () {
    window.location.href = "../main/main.html";
});

// Close the job details modal
closeBtn.addEventListener("click", function () {
    jobModal.close();
});


//Assign Technicians to numbers
const technicians = {
    1: "Andre",
    2: "Callie",
    3: "Dian",
    4: "Jaco",
    5: "Wiseman"
};

//Load jobs from Supabase
async function loadAvailableJobs() {
    const { data: jobs, error } = await db
        .from("jobs")
        .select(`*, customers(name), machines(name)`)
        .in("status", ["AVAILABLE", "IN_PROGRESS"])
        .order("job_date")
        .order("job_time");

    if (error) {
        console.error("Error loading jobs:", error);
        return;
    }

    const { data: assignments, error: technicianError } = await db
        .from("job_technicians")
        .select("job_id, technician_id");

    if (technicianError) {
        console.error("Error loading technicians:", technicianError);
        return;
    }

    jobs.forEach(function (job) {

        const jobAssignments = assignments.filter(function (assignment) {
            return assignment.job_id === job.id;
        });

        job.technicians = jobAssignments.map(function (assignment) {
            return technicians[assignment.technician_id];
        });

    });


    displayJobs(jobs);

}

//Display jobs in the job-results div
function displayJobs(jobsToDisplay) {

    jobResults.replaceChildren();

    //If No Jobs to display
    if (jobsToDisplay.length === 0) {
        const noJobsMessage = document.createElement("div");
        noJobsMessage.className = "no-jobs-message";
        noJobsMessage.textContent = "No Available Jobs";
        jobResults.appendChild(noJobsMessage);
        return;
    }

    //Create card for each job
    jobsToDisplay.forEach(function (job) {

        //Create Job Cards
        const jobCard = document.createElement("div");
        jobCard.className = "card";

        // Job Details Modal
        jobCard.addEventListener("click", function () {

            detailsInModal.replaceChildren();

            selectedJobId = job.id;
            setStopJobRunning(false);

            loadJobTimer(job.id);

            const modalDetails = document.createElement("div");
            modalDetails.className = "modal-details";

            // Job Name
            const jobName = document.createElement("div");
            jobName.className = "job-title";
            jobName.textContent = job.technicians.length > 0
                ? job.technicians.join(", ")
                : "Unassigned";

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

            const jobNotes = document.createElement("div");
            jobNotes.className = "job-notes"
            jobNotes.textContent = "Current Notes : " + job.notes;

            modalDetails.appendChild(jobName);
            modalDetails.appendChild(jobCustomer);
            modalDetails.appendChild(jobMachine);
            modalDetails.appendChild(jobService);
            modalDetails.appendChild(jobDateTime);
            modalDetails.appendChild(jobNotes);

            detailsInModal.appendChild(modalDetails);

            jobModal.showModal();
        });

        // Job Name
        const jobName = document.createElement("div");

        jobName.className = "job-title";

        jobName.textContent = job.technicians.length > 0
            ? job.technicians.join(", ")
            : "Unassigned";


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

//Load jobs when page opens
loadAvailableJobs();

const startJobBtn = document.querySelector(".startJobBtn");

startJobBtn.addEventListener("click", async function () {
    if (!selectedJobId) {
        alert("Please select a job first.");
        return;
    }

    const { data, error } = await db
        .from("jobs")
        .update({
            status: "IN_PROGRESS",
            started_at: new Date().toISOString()
        })
        .eq("id", selectedJobId)
        .eq("status", "AVAILABLE")
        .select();

    if (error) {
        console.error("Error starting job:", error);
        alert("Could not start the job. Please try again.");
        return;
    }

    if (!data || data.length === 0) {
        alert("This job has already been started or is no longer available.");
        return;
    }

    setStopJobRunning(true);
    startJobTimer(data[0].started_at);

    console.log("Job started:", data[0]);
});

// Format elapsed seconds as HH:MM:SS
function formatDuration(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);

    const minutes = Math.floor((totalSeconds % 3600) / 60);

    const seconds = totalSeconds % 60;

    return [
        String(hours).padStart(2, "0"),
        String(minutes).padStart(2, "0"),
        String(seconds).padStart(2, "0")
    ].join(":");
}

function updateJobTimer() {
    if (!selectedJobStartTime) {
        jobTimer.textContent = "00:00:00";
        return;
    }

    const startTime = new Date(selectedJobStartTime).getTime();
    const currentTime = Date.now();

    const elapsedSeconds = Math.floor(
        (currentTime - startTime) / 1000
    );

    jobTimer.textContent = formatDuration(elapsedSeconds);
}

function startJobTimer(startTime) {
    selectedJobStartTime = startTime;

    // Prevent multiple timers from running simultaneously
    if (timerInterval !== null) {
        clearInterval(timerInterval);
    }

    // Update immediately
    updateJobTimer();

    // Refresh the display every second
    timerInterval = setInterval(updateJobTimer, 1000);
}

async function loadJobTimer(jobId) {
    const { data: job, error } = await db
        .from("jobs")
        .select("status, started_at, finished_at")
        .eq("id", jobId)
        .single();

    if (error) {
        console.error("Error loading job timer:", error);
        return;
    }

    if (selectedJobId !== jobId) {
        return;
    }

    // Stop any timer that was displaying another job
    if (timerInterval !== null) {
        clearInterval(timerInterval);
        timerInterval = null;
    }

    const isRunning = job.status === "IN_PROGRESS" && Boolean(job.started_at);
    setStopJobRunning(isRunning);

    if (isRunning) {
        startJobTimer(job.started_at);
    } else {
        selectedJobStartTime = null;
        jobTimer.textContent = "00:00:00";
    }
}

stopJobBtn.addEventListener("click", async function () {
    if (!selectedJobId) {
        alert("Please select a job first.");
        return;
    }

    stopJobBtn.disabled = true;

    try {
        // 1. Retrieve the current job
        const { data: job, error: fetchError } = await db
            .from("jobs")
            .select("*")
            .eq("id", selectedJobId)
            .single();

        if (fetchError) {
            throw fetchError;
        }

        if (job.status !== "IN_PROGRESS" || !job.started_at) {
            alert("This job has not been started.");
            return;
        }

        // 2. Record the finish time
        const finishedAt = new Date().toISOString();

        // 3. Update the job in Supabase
        const { data: updatedJob, error: updateError } = await db
            .from("jobs")
            .update({
                status: "COMPLETED",
                finished_at: finishedAt
            })
            .eq("id", selectedJobId)
            .eq("status", "IN_PROGRESS")
            .select()
            .maybeSingle();

        if (updateError) {
            throw updateError;
        }

        if (!updatedJob) {
            alert("This job may already have been stopped. Please refresh and try again.");
            return;
        }

        // 4. Stop the timer
        if (timerInterval !== null) {
            clearInterval(timerInterval);
            timerInterval = null;
        }

        // 5. Calculate the elapsed time
        const durationSeconds = Math.max(
            0,
            Math.floor(
                (
                    new Date(finishedAt).getTime() -
                    new Date(job.started_at).getTime()
                ) / 1000
            )
        );

        console.log(
            "Job completed. Duration:",
            formatDuration(durationSeconds)
        );

        // 6. Save the completed job to history
        const { error: historyError } = await db
            .from("job_history")
            .insert({
                job_id: job.id,
                customer_id: job.customer_id,
                machine_id: job.machine_id,
                service_type: job.service_type,
                started_at: job.started_at,
                finished_at: finishedAt,
                started_by: job.started_by,
                machine_notes: null,
                customer_notes: null
            });

        if (historyError) {
            console.error("Error saving job history:", historyError);

            alert(
                "The job was completed, but its history record could not be saved. Please check the console."
            );

            return;
        }

        // 7. Close the modal
        jobModal.close();

        // 8. Refresh the available jobs
        await loadAvailableJobs();

    } catch (error) {
        console.error("Error stopping job:", error);
        alert("Could not complete the job. Please try again.");
    } finally {
        stopJobBtn.disabled = false;
    }
});