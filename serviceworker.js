const CACHE_NAME = "horizon-app-v0.03";

const APP_SHELL = [
    "./",
    "./manifest.json",

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
    "./login/index.html",
    "./login/login.js",
    "./login/style.css",

    // Supabase
    "./supabase.js",

    // PWA
    "./pwa.js",

    // App icons
    "./icon-192.png",
    "./icon-512.png"
];


// ================================
// INSTALL
// ================================

self.addEventListener("install", event => {

    event.waitUntil(

        caches.open(CACHE_NAME)
            .then(cache => {

                return cache.addAll(APP_SHELL);

            })

    );

    /*
        We intentionally DON'T call skipWaiting()
        here.

        This allows the current version of the
        app to keep running until the user accepts
        the update.
    */
});


// ================================
// ACTIVATE
// ================================

self.addEventListener("activate", event => {

    event.waitUntil(

        caches.keys()
            .then(cacheNames => {

                return Promise.all(

                    cacheNames
                        .filter(cacheName => {

                            return cacheName !== CACHE_NAME;

                        })
                        .map(cacheName => {

                            return caches.delete(cacheName);

                        })

                );

            })
            .then(() => {

                return self.clients.claim();

            })

    );

});


// ================================
// FETCH
// ================================

self.addEventListener("fetch", event => {

    const request = event.request;


    // Only handle GET requests
    if (request.method !== "GET") {
        return;
    }


    /*
        DON'T cache Supabase requests.

        Customer, machine, part and job data
        should come directly from Supabase.
    */

    if (request.url.includes(".supabase.co")) {
        return;
    }


    /*
        PAGE NAVIGATION

        Try the internet first.

        This is important because it allows the
        browser to discover a new version of the
        website.

        If the internet isn't available,
        use the cached version.
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

                            return cachedResponse ||
                                caches.match(
                                    "./main/main.html"
                                );

                        });

                })

        );

        return;
    }


    /*
        STATIC FILES

        Cache first.

        If the file isn't cached, download it
        and save it to the cache.
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


// ================================
// UPDATE MESSAGE
// ================================

self.addEventListener("message", event => {

    if (
        event.data &&
        event.data.type === "SKIP_WAITING"
    ) {

        self.skipWaiting();

    }

});