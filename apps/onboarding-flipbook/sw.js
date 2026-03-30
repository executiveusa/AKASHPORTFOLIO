/**
 * Kupuri Onboarding Service Worker v1
 *
 * Strategy:
 *   - Cache-first for index.html (flipbook works fully OFFLINE)
 *   - Pass-through for API calls (never cache analytics)
 *   - Queues beacon events in IndexedDB when offline; flushes on reconnect
 *
 * This means: if 10,000 people hit the flipbook simultaneously and some
 * have flaky 4G, they still get a perfect experience. Events are never lost.
 */

const CACHE_NAME   = 'kupuri-flipbook-v1';
const CACHE_ASSETS = ['/'];          // Relative to SW scope (index.html)
const BEACON_URL   = '/api/onboarding/event';
const EVENT_STORE  = 'pending_events';
const DB_NAME      = 'kupuri_sw_db';
const DB_VERSION   = 1;

// ── IndexedDB helpers ──────────────────────────────────────────────────────

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(EVENT_STORE)) {
        db.createObjectStore(EVENT_STORE, { autoIncrement: true });
      }
    };
    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror   = (e) => reject(e.target.error);
  });
}

async function storeEvent(payload) {
  const db    = await openDb();
  const tx    = db.transaction(EVENT_STORE, 'readwrite');
  tx.objectStore(EVENT_STORE).add(payload);
  return new Promise((res, rej) => {
    tx.oncomplete = res;
    tx.onerror    = rej;
  });
}

async function flushEvents() {
  const db   = await openDb();
  const tx   = db.transaction(EVENT_STORE, 'readwrite');
  const store = tx.objectStore(EVENT_STORE);
  const all  = await new Promise((res) => {
    const req = store.getAll();
    req.onsuccess = () => res(req.result);
    req.onerror   = () => res([]);
  });

  if (!all.length) return;

  for (const payload of all) {
    try {
      await fetch(BEACON_URL, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });
    } catch {
      return; // Still offline — abort flush, keep events in DB
    }
  }

  // Clear only after all succeeded
  const tx2 = db.transaction(EVENT_STORE, 'readwrite');
  tx2.objectStore(EVENT_STORE).clear();
}

// ── Lifecycle ─────────────────────────────────────────────────────────────

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CACHE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ── Fetch strategy ─────────────────────────────────────────────────────────

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // API calls: always network, no cache
  if (url.pathname.startsWith('/api/')) return;

  // sw.js itself: always network (never cache — ensures updates land)
  if (url.pathname === '/sw.js') return;

  // HTML: cache-first with network fallback (offline resilience)
  if (e.request.mode === 'navigate' || e.request.headers.get('accept')?.includes('text/html')) {
    e.respondWith(
      caches.match(e.request).then(cached => {
        const networkFetch = fetch(e.request).then(res => {
          if (res.ok) {
            caches.open(CACHE_NAME).then(c => c.put(e.request, res.clone()));
          }
          return res;
        });
        return cached || networkFetch;
      })
    );
  }
});

// ── Message: queue a beacon event ─────────────────────────────────────────

self.addEventListener('message', (e) => {
  if (e.data?.type === 'QUEUE_EVENT') {
    storeEvent(e.data.payload).catch(() => {});
  }
  if (e.data?.type === 'FLUSH_EVENTS') {
    flushEvents().catch(() => {});
  }
});

// ── Online: flush queued events ───────────────────────────────────────────

self.addEventListener('online', () => flushEvents().catch(() => {}));
