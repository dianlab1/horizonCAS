const CACHE_NAME = "horizon-app-v0.05";

const APP_SHELL = [
    "./",
    "./index.html",
    "./manifest.json",
    "./pwa.js",
    "./supabase.js",

    // Main
    "./main/main.html",
    "./main/main.css",

    // Customers
    "./customers/customers.html",
    "./customers/customers.css",
    "./customers/customers.js",
    "./customers/customer-details.html",
    "./customers/customer-details.css",
    "./customers/customer-details.js",

    // Machines
    "./machines/machines.html",
    "./machines/machines.css",
    "./machines/machines.js",
    "./machines/machine-details.html",
    "./machines/machine-details.css",
    "./machines/machine-details.js",

    // Parts
    "./parts/parts.html",
    "./parts/parts.css",

    // Other pages
    "./availableJobs.html",
    "./availableJobs.css",
    "./manageJobs.html",
    "./manageJobs.css",
    "./style.css",
    "./main.css",
    "./vsd.html",
    "./vsd.css",

    // Login
    "./login/login.js",
    "./login/style.css",

    // App icons
    "./icon-192.png",
    "./icon-512.png"
];


// ==========================================
// INSTALL
// ==========================================

self.addEventListener("install", event => {

    console.log("Horizon service worker installing:", CACHE_NAME);

    event.waitUntil(

        caches.open(CACHE_NAME)
            .then(cache => {

                return cache.addAll(APP_SHELL);

            })

    );

    /*
        IMPORTANT:

        We do NOT call skipWaiting() here.

        The new service worker will stay in the
        "waiting" state until pwa.js asks it to
        activate.

        This allows us to ask the user:

        "A new version is available. Update now?"
    */
});


// ==========================================
// ACTIVATE
// ==========================================

self.addEventListener("activate", event => {

    console.log("Horizon service worker activated:", CACHE_NAME);

    event.waitUntil(

        caches.keys()
            .then(cacheNames => {

                return Promise.all(

                    cacheNames
                        .filter(cacheName => {

                            return (
                                cacheName !== CACHE_NAME &&
                                cacheName.startsWith("horizon-app-")
                            );

                        })
                        .map(cacheName => {

                            console.log(
                                "Deleting old cache:",
                                cacheName
                            );

                            return caches.delete(cacheName);

                        })

                );

            })
            .then(() => {

                return self.clients.claim();

            })

    );

});


// ==========================================
// FETCH
// ==========================================

self.addEventListener("fetch", event => {

    const request = event.request;

    // Only handle GET requests
    if (request.method !== "GET") {
        return;
    }


    /*
        NEVER CACHE SUPABASE

        Customer, machine, part and job data
        should come from Supabase.
    */

    if (
        request.url.includes(".supabase.co") ||
        request.url.includes("supabase.co")
    ) {

        return;

    }


    /*
        NAVIGATION REQUESTS

        Network first.

        This is important because it allows the
        installed PWA to receive new HTML when
        online.

        If the network isn't available, use the
        cached version.
    */

    if (request.mode === "navigate") {

        event.respondWith(

            fetch(request)

                .then(response => {

                    if (response.ok) {

                        const responseClone =
                            response.clone();

                        caches.open(CACHE_NAME)
                            .then(cache => {

                                cache.put(
                                    request,
                                    responseClone
                                );

                            });

                    }

                    return response;

                })

                .catch(() => {

                    return caches.match(request)
                        .then(cachedResponse => {

                            if (cachedResponse) {
                                return cachedResponse;
                            }

                            return caches.match(
                                "./index.html"
                            );

                        });

                })

        );

        return;
    }


    /*
        STATIC FILES

        Cache first.

        If the file isn't cached, fetch it
        from the network and save it.
    */

    event.respondWith(

        caches.match(request)

            .then(cachedResponse => {

                if (cachedResponse) {

                    return cachedResponse;

                }


                return fetch(request)

                    .then(response => {

                        if (response.ok) {

                            const responseClone =
                                response.clone();

                            caches.open(CACHE_NAME)
                                .then(cache => {

                                    cache.put(
                                        request,
                                        responseClone
                                    );

                                });

                        }

                        return response;

                    });

            })

    );

});


// ==========================================
// MESSAGE FROM THE APP
// ==========================================

self.addEventListener("message", event => {

    if (!event.data) {
        return;
    }


    /*
        pwa.js sends this when the user presses
        "Update now".
    */

    if (
        event.data.type === "SKIP_WAITING"
    ) {

        console.log(
            "Activating new Horizon service worker..."
        );

        self.skipWaiting();

    }

});