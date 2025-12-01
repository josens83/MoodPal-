/**
 * MoodPal 오프라인 동기화 엔진
 * Notion/Discord 벤치마킹 기반 IndexedDB + Background Sync
 */

// IndexedDB 스토어 이름
export const STORES = {
  MOOD_ENTRIES: 'moodEntries',
  JOURNAL_ENTRIES: 'journalEntries',
  CHAT_MESSAGES: 'chatMessages',
  MEDITATION_PROGRESS: 'meditationProgress',
  USER_PROFILE: 'userProfile',
  PENDING_SYNC: 'pendingSync',
  CACHED_CONTENT: 'cachedContent',
} as const;

export type StoreName = (typeof STORES)[keyof typeof STORES];

// 동기화 상태
export type SyncStatus = 'pending' | 'syncing' | 'synced' | 'error' | 'conflict';

// 동기화 항목 인터페이스
export interface SyncableItem {
  id: string;
  localId: string;
  serverId?: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  syncStatus: SyncStatus;
  lastSyncAttempt?: Date;
  syncError?: string;
  data: Record<string, any>;
}

// 동기화 작업
export interface SyncOperation {
  id: string;
  store: StoreName;
  operation: 'create' | 'update' | 'delete';
  localId: string;
  data?: any;
  timestamp: Date;
  retryCount: number;
  maxRetries: number;
}

// 오프라인 스토리지 클래스
export class OfflineStorage {
  private db: IDBDatabase | null = null;
  private readonly dbName = 'moodpal-offline-db';
  private readonly dbVersion = 1;

  // 데이터베이스 열기
  async open(): Promise<IDBDatabase> {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        this.createStores(db);
      };
    });
  }

  // 스토어 생성
  private createStores(db: IDBDatabase): void {
    // 기분 기록
    if (!db.objectStoreNames.contains(STORES.MOOD_ENTRIES)) {
      const store = db.createObjectStore(STORES.MOOD_ENTRIES, {
        keyPath: 'localId',
      });
      store.createIndex('syncStatus', 'syncStatus', { unique: false });
      store.createIndex('createdAt', 'createdAt', { unique: false });
      store.createIndex('serverId', 'serverId', { unique: false });
    }

    // 저널 항목
    if (!db.objectStoreNames.contains(STORES.JOURNAL_ENTRIES)) {
      const store = db.createObjectStore(STORES.JOURNAL_ENTRIES, {
        keyPath: 'localId',
      });
      store.createIndex('syncStatus', 'syncStatus', { unique: false });
      store.createIndex('createdAt', 'createdAt', { unique: false });
    }

    // 채팅 메시지
    if (!db.objectStoreNames.contains(STORES.CHAT_MESSAGES)) {
      const store = db.createObjectStore(STORES.CHAT_MESSAGES, {
        keyPath: 'localId',
      });
      store.createIndex('syncStatus', 'syncStatus', { unique: false });
      store.createIndex('timestamp', 'data.timestamp', { unique: false });
    }

    // 명상 진행
    if (!db.objectStoreNames.contains(STORES.MEDITATION_PROGRESS)) {
      const store = db.createObjectStore(STORES.MEDITATION_PROGRESS, {
        keyPath: 'localId',
      });
      store.createIndex('syncStatus', 'syncStatus', { unique: false });
    }

    // 사용자 프로필
    if (!db.objectStoreNames.contains(STORES.USER_PROFILE)) {
      db.createObjectStore(STORES.USER_PROFILE, { keyPath: 'id' });
    }

    // 대기 중인 동기화 작업
    if (!db.objectStoreNames.contains(STORES.PENDING_SYNC)) {
      const store = db.createObjectStore(STORES.PENDING_SYNC, {
        keyPath: 'id',
      });
      store.createIndex('timestamp', 'timestamp', { unique: false });
      store.createIndex('store', 'store', { unique: false });
    }

    // 캐시된 콘텐츠
    if (!db.objectStoreNames.contains(STORES.CACHED_CONTENT)) {
      const store = db.createObjectStore(STORES.CACHED_CONTENT, {
        keyPath: 'id',
      });
      store.createIndex('type', 'type', { unique: false });
      store.createIndex('expiresAt', 'expiresAt', { unique: false });
    }
  }

  // 아이템 저장
  async put<T extends SyncableItem>(
    store: StoreName,
    item: T
  ): Promise<T> {
    const db = await this.open();

    return new Promise((resolve, reject) => {
      const tx = db.transaction(store, 'readwrite');
      const objStore = tx.objectStore(store);

      item.updatedAt = new Date();
      if (!item.localId) {
        item.localId = this.generateLocalId();
      }

      const request = objStore.put(item);
      request.onsuccess = () => resolve(item);
      request.onerror = () => reject(request.error);
    });
  }

  // 아이템 가져오기
  async get<T>(store: StoreName, localId: string): Promise<T | undefined> {
    const db = await this.open();

    return new Promise((resolve, reject) => {
      const tx = db.transaction(store, 'readonly');
      const objStore = tx.objectStore(store);
      const request = objStore.get(localId);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // 모든 아이템 가져오기
  async getAll<T>(store: StoreName): Promise<T[]> {
    const db = await this.open();

    return new Promise((resolve, reject) => {
      const tx = db.transaction(store, 'readonly');
      const objStore = tx.objectStore(store);
      const request = objStore.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // 인덱스로 아이템 조회
  async getByIndex<T>(
    store: StoreName,
    indexName: string,
    value: IDBValidKey
  ): Promise<T[]> {
    const db = await this.open();

    return new Promise((resolve, reject) => {
      const tx = db.transaction(store, 'readonly');
      const objStore = tx.objectStore(store);
      const index = objStore.index(indexName);
      const request = index.getAll(value);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // 아이템 삭제
  async delete(store: StoreName, localId: string): Promise<void> {
    const db = await this.open();

    return new Promise((resolve, reject) => {
      const tx = db.transaction(store, 'readwrite');
      const objStore = tx.objectStore(store);
      const request = objStore.delete(localId);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // 스토어 비우기
  async clear(store: StoreName): Promise<void> {
    const db = await this.open();

    return new Promise((resolve, reject) => {
      const tx = db.transaction(store, 'readwrite');
      const objStore = tx.objectStore(store);
      const request = objStore.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // 로컬 ID 생성
  private generateLocalId(): string {
    return `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // 데이터베이스 닫기
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

// 동기화 엔진 클래스
export class SyncEngine {
  private storage: OfflineStorage;
  private syncInProgress = false;
  private syncQueue: SyncOperation[] = [];
  private onlineStatus = true;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();

  constructor() {
    this.storage = new OfflineStorage();
    this.setupEventListeners();
  }

  // 이벤트 리스너 설정
  private setupEventListeners(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleOnline());
      window.addEventListener('offline', () => this.handleOffline());
      this.onlineStatus = navigator.onLine;
    }
  }

  // 온라인 전환 처리
  private async handleOnline(): Promise<void> {
    console.log('[SyncEngine] Online - starting sync');
    this.onlineStatus = true;
    this.emit('connectionChange', { online: true });
    await this.syncAll();
  }

  // 오프라인 전환 처리
  private handleOffline(): void {
    console.log('[SyncEngine] Offline');
    this.onlineStatus = false;
    this.emit('connectionChange', { online: false });
  }

  // 데이터 저장 (오프라인 우선)
  async save<T extends SyncableItem>(
    store: StoreName,
    data: Omit<T, 'localId' | 'version' | 'syncStatus' | 'createdAt' | 'updatedAt'>
  ): Promise<T> {
    const item: SyncableItem = {
      ...data,
      localId: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      id: '',
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      syncStatus: 'pending',
      data: data as Record<string, any>,
    };

    // 로컬에 먼저 저장
    const saved = await this.storage.put(store, item as T);

    // 동기화 큐에 추가
    await this.queueSync({
      id: `sync_${Date.now()}`,
      store,
      operation: 'create',
      localId: saved.localId,
      data: saved.data,
      timestamp: new Date(),
      retryCount: 0,
      maxRetries: 3,
    });

    // 온라인이면 즉시 동기화 시도
    if (this.onlineStatus) {
      this.scheduleSync();
    }

    return saved;
  }

  // 데이터 업데이트
  async update<T extends SyncableItem>(
    store: StoreName,
    localId: string,
    updates: Partial<T>
  ): Promise<T> {
    const existing = await this.storage.get<T>(store, localId);

    if (!existing) {
      throw new Error(`Item not found: ${localId}`);
    }

    const updated: SyncableItem = {
      ...existing,
      ...updates,
      version: existing.version + 1,
      updatedAt: new Date(),
      syncStatus: 'pending',
    };

    const saved = await this.storage.put(store, updated as T);

    await this.queueSync({
      id: `sync_${Date.now()}`,
      store,
      operation: 'update',
      localId: saved.localId,
      data: saved.data,
      timestamp: new Date(),
      retryCount: 0,
      maxRetries: 3,
    });

    if (this.onlineStatus) {
      this.scheduleSync();
    }

    return saved;
  }

  // 데이터 삭제
  async remove(store: StoreName, localId: string): Promise<void> {
    const existing = await this.storage.get<SyncableItem>(store, localId);

    if (existing?.serverId) {
      // 서버에도 있으면 삭제 동기화 큐에 추가
      await this.queueSync({
        id: `sync_${Date.now()}`,
        store,
        operation: 'delete',
        localId,
        timestamp: new Date(),
        retryCount: 0,
        maxRetries: 3,
      });
    }

    await this.storage.delete(store, localId);

    if (this.onlineStatus) {
      this.scheduleSync();
    }
  }

  // 동기화 큐에 추가
  private async queueSync(operation: SyncOperation): Promise<void> {
    await this.storage.put(STORES.PENDING_SYNC, operation as any);
    this.syncQueue.push(operation);
    this.emit('queueUpdate', { queueLength: this.syncQueue.length });
  }

  // 동기화 스케줄링
  private scheduleSync(): void {
    if (this.syncInProgress) return;

    setTimeout(() => this.syncAll(), 100);
  }

  // 전체 동기화
  async syncAll(): Promise<void> {
    if (this.syncInProgress || !this.onlineStatus) return;

    this.syncInProgress = true;
    this.emit('syncStart', {});

    try {
      // 대기 중인 동기화 작업 로드
      const pendingOps = await this.storage.getAll<SyncOperation>(
        STORES.PENDING_SYNC
      );

      for (const op of pendingOps) {
        try {
          await this.executeSync(op);
          await this.storage.delete(STORES.PENDING_SYNC, op.id);
        } catch (error) {
          console.error('[SyncEngine] Sync failed:', error);

          // 재시도 카운트 증가
          if (op.retryCount < op.maxRetries) {
            op.retryCount++;
            await this.storage.put(STORES.PENDING_SYNC, op as any);
          } else {
            // 최대 재시도 초과
            await this.markSyncError(op.store, op.localId, String(error));
          }
        }
      }

      this.emit('syncComplete', { success: true });
    } catch (error) {
      console.error('[SyncEngine] Sync all failed:', error);
      this.emit('syncComplete', { success: false, error });
    } finally {
      this.syncInProgress = false;
    }
  }

  // 동기화 실행
  private async executeSync(op: SyncOperation): Promise<void> {
    const endpoint = this.getEndpoint(op.store);

    switch (op.operation) {
      case 'create': {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(op.data),
        });

        if (!response.ok) throw new Error(`Create failed: ${response.status}`);

        const serverData = await response.json();

        // 서버 ID로 로컬 항목 업데이트
        const item = await this.storage.get<SyncableItem>(op.store, op.localId);
        if (item) {
          item.serverId = serverData.id;
          item.syncStatus = 'synced';
          item.lastSyncAttempt = new Date();
          await this.storage.put(op.store, item);
        }
        break;
      }

      case 'update': {
        const item = await this.storage.get<SyncableItem>(op.store, op.localId);
        if (!item?.serverId) throw new Error('No server ID for update');

        const response = await fetch(`${endpoint}/${item.serverId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(op.data),
        });

        if (!response.ok) throw new Error(`Update failed: ${response.status}`);

        item.syncStatus = 'synced';
        item.lastSyncAttempt = new Date();
        await this.storage.put(op.store, item);
        break;
      }

      case 'delete': {
        const item = await this.storage.get<SyncableItem>(op.store, op.localId);
        if (item?.serverId) {
          const response = await fetch(`${endpoint}/${item.serverId}`, {
            method: 'DELETE',
          });

          if (!response.ok && response.status !== 404) {
            throw new Error(`Delete failed: ${response.status}`);
          }
        }
        break;
      }
    }
  }

  // 엔드포인트 매핑
  private getEndpoint(store: StoreName): string {
    const endpoints: Record<StoreName, string> = {
      [STORES.MOOD_ENTRIES]: '/api/mood',
      [STORES.JOURNAL_ENTRIES]: '/api/journal',
      [STORES.CHAT_MESSAGES]: '/api/chat',
      [STORES.MEDITATION_PROGRESS]: '/api/meditation/progress',
      [STORES.USER_PROFILE]: '/api/user/profile',
      [STORES.PENDING_SYNC]: '/api/sync',
      [STORES.CACHED_CONTENT]: '/api/content',
    };

    return endpoints[store];
  }

  // 동기화 에러 표시
  private async markSyncError(
    store: StoreName,
    localId: string,
    error: string
  ): Promise<void> {
    const item = await this.storage.get<SyncableItem>(store, localId);
    if (item) {
      item.syncStatus = 'error';
      item.syncError = error;
      await this.storage.put(store, item);
    }
  }

  // 이벤트 구독
  on(event: string, callback: (data: any) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  // 이벤트 발생
  private emit(event: string, data: any): void {
    this.listeners.get(event)?.forEach((callback) => callback(data));
  }

  // 로컬 데이터 조회
  async getLocal<T>(store: StoreName, localId: string): Promise<T | undefined> {
    return this.storage.get<T>(store, localId);
  }

  // 모든 로컬 데이터 조회
  async getAllLocal<T>(store: StoreName): Promise<T[]> {
    return this.storage.getAll<T>(store);
  }

  // 동기화 상태별 조회
  async getByStatus<T>(store: StoreName, status: SyncStatus): Promise<T[]> {
    return this.storage.getByIndex<T>(store, 'syncStatus', status);
  }

  // 온라인 상태 확인
  isOnline(): boolean {
    return this.onlineStatus;
  }

  // 동기화 대기 항목 수
  async getPendingCount(): Promise<number> {
    const pending = await this.storage.getAll(STORES.PENDING_SYNC);
    return pending.length;
  }

  // 스토리지 정리 (만료된 캐시 등)
  async cleanup(): Promise<void> {
    const now = new Date();
    const cached = await this.storage.getAll<any>(STORES.CACHED_CONTENT);

    for (const item of cached) {
      if (item.expiresAt && new Date(item.expiresAt) < now) {
        await this.storage.delete(STORES.CACHED_CONTENT, item.id);
      }
    }
  }
}

// 싱글톤 인스턴스
let syncEngineInstance: SyncEngine | null = null;

export function getSyncEngine(): SyncEngine {
  if (!syncEngineInstance) {
    syncEngineInstance = new SyncEngine();
  }
  return syncEngineInstance;
}

// React Hook
export function useSyncEngine() {
  return getSyncEngine();
}
