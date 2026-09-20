let refreshing = false;

if ("serviceWorker" in navigator) {

    window.addEventListener("load", async () => {

        try {

            const scriptUrl =
                document.currentScript?.src;

            const serviceWorkerUrl = scriptUrl
                ? new URL(
                    "serviceworker.js",
                    scriptUrl
                ).href
                : new URL(
                    "/serviceworker.js",
                    window.location.origin
                ).href;


            const registration =
                await navigator.serviceWorker.register(
                    serviceWorkerUrl,
                    {
                        scope: "/"
                    }
                );


            console.log(
                "Horizon service worker registered."
            );


            // Check for updates immediately
            registration.update();


            // Check every 15 minutes
            setInterval(() => {

                registration.update();

            }, 15 * 60 * 1000);


            function promptForUpdate(worker) {

                if (
                    !worker ||
                    window.__horizonUpdatePromptShown
                ) {
                    return;
                }


                window.__horizonUpdatePromptShown = true;


                const updateNow = window.confirm(

                    "A new version of the Horizon app " +
                    "is available.\n\n" +
                    "Update now?"

                );


                if (updateNow) {

                    worker.postMessage({

                        type: "SKIP_WAITING"

                    });

                } else {

                    window.__horizonUpdatePromptShown =
                        false;

                }

            }


            // A new version may already be waiting
            if (registration.waiting) {

                promptForUpdate(
                    registration.waiting
                );

            }


            // Detect a newly installing service worker
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
                                newWorker.state ===
                                "installed" &&
                                navigator.serviceWorker
                                    .controller
                            ) {

                                promptForUpdate(
                                    newWorker
                                );

                            }

                        }
                    );

                }
            );


            /*
                Once the new service worker becomes
                active, reload the page automatically.
            */

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