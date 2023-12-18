const staticCacheName = "static-cache-v1";
const dynamicCacheName = "dynamic-cache-v1";
const filesToCache = [
	"/",
	"/index.html",
	"/offline.html",
	"/404.html",
	"manifest.json",
	"js/app.js",
	"css/styles.css",
	"img/songnotes_cover_default.png",
	"img/songnotes_cropped.png",
	"img/screenshots/Screenshot-mobile-770x1304.png",
	"img/screenshots/Screenshot-desktop-2830x1376.png",
	"img/icons/songnotes-icon-512x512.png",
	"img/icons/songnotes-icon-384x384.png",
	"img/icons/songnotes-icon-192x192.png",
	"img/icons/songnotes-icon-152x152.png",
	"img/icons/songnotes-icon-144x144.png",
	"img/icons/songnotes-icon-128x128.png",
	"img/icons/songnotes-icon-96x96.png",
	"img/icons/songnotes-icon-72x72.png",
	"img/icons/maskable_icon_x192.png",
	"https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css",
	"https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.2/font/bootstrap-icons.min.css",
	"https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js",
];

// cache size limit
const limitCacheSize = (name, size) => {
	caches.open(name).then((cache) => {
		cache.keys().then((keys) => {
			if (keys.length > size) {
				cache.delete(keys[0]).then(limitCacheSize(name, size));
			}
		});
	});
};

// install service worker
self.addEventListener("install", (event) => {
	console.log("Attempting to install service worker and cache static assets");
	event.waitUntil(
		caches.open(staticCacheName).then((cache) => {
			console.log("Caching shell assets");
			return cache.addAll(filesToCache);
		})
	);
});

// activate event
self.addEventListener("activate", (event) => {
	console.log("Service worker has been activated");
	event.waitUntil(
		caches.keys().then((keys) => {
			return Promise.all(
				keys
					.filter(
						(key) =>
							key !== staticCacheName && key !== dynamicCacheName
					)
					.map((key) => caches.delete(key))
			);
		})
	);
});

// fetch event
self.addEventListener("fetch", (event) => {
	// skip WAVE requests

	if (!event.request.url.startsWith("http")) return;

	event.respondWith(
		caches
			.match(event.request)
			.then((response) => {
				return (
					response ||
					fetch(event.request).then((fetchRes) => {
						return caches.open(dynamicCacheName).then((cache) => {
							cache.put(event.request.url, fetchRes.clone());
							limitCacheSize(dynamicCacheName, 10);
							return fetchRes;
						});
					})
				);
			})
			.catch(() => caches.match("offline.html"))
	);
});
