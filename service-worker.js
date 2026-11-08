const CACHE="kanifnath-ksk-v1";
const ASSETS=["./","./index.html","./styles.css","./app.js","./manifest.webmanifest","./assets/logo.png"];
self.addEventListener("install",e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS))));
self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))));
self.addEventListener("fetch",e=>{
  const url=new URL(e.request.url);
  if(url.hostname==="docs.google.com")return; // Always fetch the latest sheet data online.
  e.respondWith(caches.match(e.request).then(cached=>cached||fetch(e.request)));
});
