let refreshing = false;

if ("serviceWorker" in navigator) {

    window.addEventListener("load", async () => {

        try {

            const basePath =
                window.location.pathname.split("/").filter(Boolean)[0];

            const serviceWorkerPath =
                basePath
                    ? `/${basePath}/serviceworker.js`
                    : "/serviceworker.js";

            const scope =
                basePath
                    ? `/${basePath}/`
                    : "/";


            const registration =
                await navigator.serviceWorker.register(
                    serviceWorkerPath,
                    {
                        scope: scope
                    }
                );


            console.log("Horizon service worker registered.");


            // Check for a new version immediately
            registration.update();


            // Check for updates every 15 minutes
            setInterval(() => {
                registration.update();
            }, 15 * 60 * 1000);


            function promptForUpdate(worker) {

                if (!worker) {
                    return;
                }

                const updateNow = window.confirm(
                    "A new version of the Horizon app is available.\n\n" +
                    "Update now?"
                );

                if (updateNow) {

                    worker.postMessage({
                        type: "SKIP_WAITING"
                    });

                }

            }


            // A new version is already waiting
            if (registration.waiting) {

                promptForUpdate(
                    registration.waiting
                );

            }


            // Detect new service worker
            registration.addEventListener(
                "updatefound",
                () => {

                    const newWorker =
                        registration.installing;

                    if (!newWorker) {
                        return;
                    }


                    newWorker.addEventListener(
                        "statechange",
                        () => {

                            if (
                                newWorker.state === "installed" &&
                                navigator.serviceWorker.controller
                            ) {

                                promptForUpdate(
                                    newWorker
                                );

                            }

                        }
                    );

                }
            );


            // Reload after update
            navigator.serviceWorker.addEventListener(
                "controllerchange",
                () => {

                    if (refreshing) {
                        return;
                    }

                    refreshing = true;

                    window.location.reload();

                }
            );


        } catch (error) {

            console.error(
                "Horizon service worker registration failed:",
                error
            );

        }

    });

}