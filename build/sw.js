const CACHE_VERSION = 1;

let CURRENT_CACHES = {
  offline: 'ruvek-offline-cache' + CACHE_VERSION
};

const OFFLINE_URL = 'offline.html';

const cacheUrls = [
    "/" + OFFLINE_URL,
    "/styles/main.min.css",
    "/images/sprite.symbol.svg",
    "/scripts/main.min.js"
];

// период обновления кэша - одни сутки
const MAX_AGE = 86400000;


self.addEventListener("install", function(event) {
    // задержим обработку события
    // если произойдёт ошибка, serviceWorker не установится
    event.waitUntil(
        // находим в глобальном хранилище Cache-объект с нашим именем
        // если такого не существует, то он будет создан
        caches.open(CURRENT_CACHES.offline).then(function(cache) {
            // загружаем в наш cache необходимые файлы
            return cache.addAll(cacheUrls);
        })
    );
});


self.addEventListener('fetch', function(event) {

    // version with cache age check

    // event.respondWith(
    //     // ищем запрошенный ресурс среди закэшированных
    //     caches.match(event.request).then(function(cachedResponse) {
    //         var lastModified, fetchRequest;

    //         // если ресурс есть в кэше
    //         if (cachedResponse) {
    //             // получаем дату последнего обновления
    //             lastModified = new Date(cachedResponse.headers.get('last-modified'));
    //             // и если мы считаем ресурс устаревшим
    //             if (lastModified && (Date.now() - lastModified.getTime()) > MAX_AGE) {

    //                 fetchRequest = event.request.clone();
    //                 // создаём новый запрос
    //                 return fetch(fetchRequest).then(function(response) {
    //                     // при неудаче всегда можно выдать ресурс из кэша
    //                     if (!response || response.status !== 200) {
    //                         return cachedResponse;
    //                     }
    //                     // обновляем кэш
    //                     caches.open(CURRENT_CACHES.offline).then(function(cache) {
    //                         cache.put(event.request, response.clone());
    //                     });
    //                     // возвращаем свежий ресурс
    //                     return response;
    //                 }).catch(function() {
    //                     return cachedResponse;
    //                 });
    //             }
    //             return cachedResponse;
    //         }

    //         // запрашиваем из сети как обычно
    //         return fetch(event.request);
    //     })
    // );


    if ( event.request.mode === 'navigate' || (event.request.method === 'GET' && event.request.headers.get('accept').includes('text/html')) ) {
            event.respondWith(
              fetch(event.request.url).catch(error => {
                  // Return the offline page
                  return caches.match(OFFLINE_URL);
              })
        );
    } else {
        // Respond with everything else if we can
        event.respondWith(caches.match(event.request)
            .then(function (response) {
                return response || fetch(event.request);
            })
        );
    }
});