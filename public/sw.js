/**
 * MoodPal Service Worker
 * Netflix/Spotify 벤치마킹 기반 고급 캐싱 전략
 */

// 캐시 버전 관리
const CACHE_VERSION = 'v2';
const CACHE_NAMES = {
  static: `moodpal-static-${CACHE_VERSION}`,
  dynamic: `moodpal-dynamic-${CACHE_VERSION}`,
  api: `moodpal-api-${CACHE_VERSION}`,
  audio: `moodpal-audio-${CACHE_VERSION}`,
  images: `moodpal-images-${CACHE_VERSION}`,
};

const OFFLINE_URL = '/offline';

// 프리캐시 리소스
const PRECACHE_ASSETS = [
  '/',
  '/home',
  '/offline',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

// 캐시 전략 정의
const CACHE_STRATEGIES = {
  // 캐시 우선 (정적 자산)
  cacheFirst: async (request, cacheName) => {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      // 백그라운드에서 업데이트
      fetchAndCache(request, cache).catch(() => {});
      return cachedResponse;
    }

    return fetchAndCache(request, cache);
  },

  // 네트워크 우선 (동적 데이터)
  networkFirst: async (request, cacheName, timeout = 3000) => {
    const cache = await caches.open(cacheName);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(request, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    } catch (error) {
      const cachedResponse = await cache.match(request);
      if (cachedResponse) {
        return cachedResponse;
      }
      throw error;
    }
  },

  // Stale While Revalidate (혼합)
  staleWhileRevalidate: async (request, cacheName) => {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);

    const fetchPromise = fetch(request).then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    }).catch(() => cachedResponse);

    return cachedResponse || fetchPromise;
  },

  // 네트워크만
  networkOnly: async (request) => {
    return fetch(request);
  },
};

async function fetchAndCache(request, cache) {
  const response = await fetch(request);
  if (response.ok) {
    cache.put(request, response.clone());
  }
  return response;
}

// 요청 라우팅
function routeRequest(request) {
  const url = new URL(request.url);

  // API 요청
  if (url.pathname.startsWith('/api/')) {
    // 채팅, 인증, 결제는 네트워크만
    if (url.pathname.includes('/chat') ||
        url.pathname.includes('/auth') ||
        url.pathname.includes('/payment')) {
      return { strategy: 'networkOnly' };
    }
    return { strategy: 'networkFirst', cacheName: CACHE_NAMES.api };
  }

  // 오디오 파일
  if (url.pathname.includes('/audio/') ||
      request.destination === 'audio') {
    return { strategy: 'cacheFirst', cacheName: CACHE_NAMES.audio };
  }

  // 이미지
  if (url.pathname.includes('/images/') ||
      url.pathname.includes('/icons/') ||
      request.destination === 'image') {
    return { strategy: 'cacheFirst', cacheName: CACHE_NAMES.images };
  }

  // 정적 자산 (JS, CSS)
  if (url.pathname.startsWith('/_next/static/') ||
      request.destination === 'script' ||
      request.destination === 'style') {
    return { strategy: 'cacheFirst', cacheName: CACHE_NAMES.static };
  }

  // 폰트
  if (request.destination === 'font') {
    return { strategy: 'cacheFirst', cacheName: CACHE_NAMES.static };
  }

  // 페이지 네비게이션
  if (request.mode === 'navigate') {
    return { strategy: 'networkFirst', cacheName: CACHE_NAMES.dynamic };
  }

  // 기본: Stale While Revalidate
  return { strategy: 'staleWhileRevalidate', cacheName: CACHE_NAMES.dynamic };
}

// 설치 이벤트
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');

  event.waitUntil(
    caches.open(CACHE_NAMES.static)
      .then((cache) => {
        console.log('[SW] Precaching assets');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// 활성화 이벤트
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        const validNames = Object.values(CACHE_NAMES);
        return Promise.all(
          cacheNames
            .filter((name) => name.startsWith('moodpal-') && !validNames.includes(name))
            .map((name) => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch 이벤트
self.addEventListener('fetch', (event) => {
  // 크로스 오리진 요청은 무시
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  const { strategy, cacheName } = routeRequest(event.request);

  event.respondWith(
    (async () => {
      try {
        switch (strategy) {
          case 'cacheFirst':
            return await CACHE_STRATEGIES.cacheFirst(event.request, cacheName);
          case 'networkFirst':
            return await CACHE_STRATEGIES.networkFirst(event.request, cacheName);
          case 'staleWhileRevalidate':
            return await CACHE_STRATEGIES.staleWhileRevalidate(event.request, cacheName);
          case 'networkOnly':
            return await CACHE_STRATEGIES.networkOnly(event.request);
          default:
            return await fetch(event.request);
        }
      } catch (error) {
        // 오프라인 폴백
        if (event.request.mode === 'navigate') {
          const offlineResponse = await caches.match(OFFLINE_URL);
          if (offlineResponse) {
            return offlineResponse;
          }
        }

        throw error;
      }
    })()
  );
});

// 푸시 알림
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {};

  const options = {
    body: data.body || '새로운 알림이 있습니다',
    icon: '/icons/icon-192.png',
    badge: '/icons/badge-72.png',
    vibrate: [100, 50, 100],
    tag: data.tag || 'default',
    renotify: data.renotify || false,
    requireInteraction: data.requireInteraction || false,
    data: {
      url: data.url || '/',
      type: data.type || 'general',
    },
    actions: data.actions || [
      { action: 'open', title: '열기' },
      { action: 'dismiss', title: '닫기' }
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'MoodPal', options)
  );
});

// 알림 클릭
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  const url = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        // 이미 열린 창이 있으면 포커스
        for (const client of windowClients) {
          if (client.url.includes(self.registration.scope) && 'focus' in client) {
            client.navigate(url);
            return client.focus();
          }
        }
        // 없으면 새 창 열기
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});

// 백그라운드 동기화
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);

  switch (event.tag) {
    case 'sync-mood-entries':
      event.waitUntil(syncMoodEntries());
      break;
    case 'sync-journal':
      event.waitUntil(syncJournalEntries());
      break;
    case 'sync-meditation-progress':
      event.waitUntil(syncMeditationProgress());
      break;
  }
});

// 주기적 동기화 (Periodic Background Sync)
self.addEventListener('periodicsync', (event) => {
  console.log('[SW] Periodic sync:', event.tag);

  switch (event.tag) {
    case 'update-content':
      event.waitUntil(updateContent());
      break;
    case 'check-reminders':
      event.waitUntil(checkReminders());
      break;
  }
});

// 동기화 함수들
async function syncMoodEntries() {
  console.log('[SW] Syncing mood entries...');
  // IndexedDB에서 오프라인 항목 가져와서 서버에 동기화
  try {
    const db = await openDB();
    const entries = await db.getAll('pendingMoodEntries');

    for (const entry of entries) {
      try {
        await fetch('/api/mood', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entry.data),
        });
        await db.delete('pendingMoodEntries', entry.id);
      } catch (e) {
        console.error('[SW] Failed to sync entry:', e);
      }
    }
  } catch (e) {
    console.error('[SW] Sync failed:', e);
  }
}

async function syncJournalEntries() {
  console.log('[SW] Syncing journal entries...');
}

async function syncMeditationProgress() {
  console.log('[SW] Syncing meditation progress...');
}

async function updateContent() {
  console.log('[SW] Updating content...');
  // 명상 프로그램 목록 등 업데이트
}

async function checkReminders() {
  console.log('[SW] Checking reminders...');
  // 리마인더 확인 및 알림 발송
}

// IndexedDB 헬퍼
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('moodpal-offline', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      resolve({
        getAll: (store) => new Promise((res, rej) => {
          const tx = db.transaction(store, 'readonly');
          const req = tx.objectStore(store).getAll();
          req.onsuccess = () => res(req.result);
          req.onerror = () => rej(req.error);
        }),
        delete: (store, key) => new Promise((res, rej) => {
          const tx = db.transaction(store, 'readwrite');
          const req = tx.objectStore(store).delete(key);
          req.onsuccess = () => res();
          req.onerror = () => rej(req.error);
        }),
      });
    };
  });
}

// 메시지 핸들러
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);

  switch (event.data.type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
    case 'CACHE_URLS':
      event.waitUntil(
        caches.open(CACHE_NAMES.dynamic)
          .then((cache) => cache.addAll(event.data.urls))
      );
      break;
    case 'CLEAR_CACHE':
      event.waitUntil(
        caches.keys().then((names) =>
          Promise.all(names.map((name) => caches.delete(name)))
        )
      );
      break;
  }
});
