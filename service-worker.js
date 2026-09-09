const CACHE="myusrah-v6";
const ASSETS=["./","index.html","dashboard.html","addproduct.html","sellproduct.html","removeproduct.html","history.html","analytics.html","analytics-history.html","style.css","app.js","manifest.json","icon-192.png","icon-512.png"];
self.addEventListener("install",e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS))));
self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).catch(()=>caches.match("index.html")))));

self.addEventListener("notificationclick",e=>{e.notification.close();e.waitUntil(clients.matchAll({type:"window",includeUncontrolled:true}).then(list=>{for(const c of list){if("focus" in c)return c.focus()}return clients.openWindow("dashboard.html")}))});
