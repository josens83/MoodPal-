/**
 * MoodPal 오디오 다운로드 매니저
 * Spotify 벤치마킹 기반 오프라인 오디오 지원
 */

// 다운로드 상태
export type DownloadStatus =
  | 'idle'
  | 'queued'
  | 'downloading'
  | 'paused'
  | 'completed'
  | 'failed'
  | 'cancelled';

// 오디오 품질
export type AudioQuality = 'low' | 'normal' | 'high';

// 다운로드 항목
export interface DownloadItem {
  id: string;
  contentId: string;
  title: string;
  artist?: string;
  type: 'meditation' | 'music' | 'sound' | 'story';
  duration: number; // 초
  size: number; // 바이트
  quality: AudioQuality;
  url: string;
  status: DownloadStatus;
  progress: number; // 0-100
  downloadedBytes: number;
  createdAt: Date;
  completedAt?: Date;
  expiresAt?: Date;
  error?: string;
  thumbnailUrl?: string;
}

// 다운로드 설정
export interface DownloadSettings {
  maxConcurrent: number;
  defaultQuality: AudioQuality;
  wifiOnly: boolean;
  autoDownload: boolean;
  storageLimit: number; // 바이트
  retainDays: number;
}

// 다운로드 진행 콜백
export type ProgressCallback = (
  item: DownloadItem,
  progress: number,
  speed: number
) => void;

// 다운로드 완료 콜백
export type CompleteCallback = (item: DownloadItem) => void;

// 오디오 다운로드 매니저 클래스
export class AudioDownloadManager {
  private downloads: Map<string, DownloadItem> = new Map();
  private activeDownloads: Map<string, AbortController> = new Map();
  private downloadQueue: string[] = [];
  private settings: DownloadSettings;
  private progressCallbacks: Set<ProgressCallback> = new Set();
  private completeCallbacks: Set<CompleteCallback> = new Set();
  private db: IDBDatabase | null = null;

  constructor(settings?: Partial<DownloadSettings>) {
    this.settings = {
      maxConcurrent: 2,
      defaultQuality: 'normal',
      wifiOnly: false,
      autoDownload: false,
      storageLimit: 500 * 1024 * 1024, // 500MB
      retainDays: 30,
      ...settings,
    };
  }

  // 초기화
  async initialize(): Promise<void> {
    await this.openDatabase();
    await this.loadDownloads();
    this.setupNetworkListener();
  }

  // IndexedDB 열기
  private async openDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('moodpal-audio-db', 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // 다운로드 메타데이터 스토어
        if (!db.objectStoreNames.contains('downloads')) {
          const store = db.createObjectStore('downloads', { keyPath: 'id' });
          store.createIndex('status', 'status', { unique: false });
          store.createIndex('contentId', 'contentId', { unique: false });
          store.createIndex('type', 'type', { unique: false });
        }

        // 오디오 데이터 스토어 (Blob)
        if (!db.objectStoreNames.contains('audioData')) {
          db.createObjectStore('audioData', { keyPath: 'id' });
        }
      };
    });
  }

  // 저장된 다운로드 로드
  private async loadDownloads(): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction('downloads', 'readonly');
      const store = tx.objectStore('downloads');
      const request = store.getAll();

      request.onsuccess = () => {
        const items = request.result as DownloadItem[];
        items.forEach((item) => {
          this.downloads.set(item.id, item);

          // 진행 중이던 다운로드는 대기열에 추가
          if (item.status === 'downloading' || item.status === 'queued') {
            item.status = 'queued';
            this.downloadQueue.push(item.id);
          }
        });
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  // 네트워크 리스너 설정
  private setupNetworkListener(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('online', () => {
      if (!this.settings.wifiOnly || this.isWifi()) {
        this.processQueue();
      }
    });

    window.addEventListener('offline', () => {
      this.pauseAll();
    });
  }

  // WiFi 연결 확인
  private isWifi(): boolean {
    const connection = (navigator as any).connection;
    if (!connection) return true; // 알 수 없으면 허용
    return connection.type === 'wifi' || connection.effectiveType === '4g';
  }

  // 다운로드 추가
  async add(options: {
    contentId: string;
    title: string;
    artist?: string;
    type: DownloadItem['type'];
    duration: number;
    url: string;
    thumbnailUrl?: string;
    quality?: AudioQuality;
  }): Promise<DownloadItem> {
    // 이미 다운로드된 항목 확인
    const existing = Array.from(this.downloads.values()).find(
      (d) => d.contentId === options.contentId && d.status === 'completed'
    );
    if (existing) return existing;

    // 저장 공간 확인
    const currentUsage = await this.getStorageUsage();
    if (currentUsage > this.settings.storageLimit * 0.9) {
      await this.cleanupOldDownloads();
    }

    const item: DownloadItem = {
      id: `download_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      contentId: options.contentId,
      title: options.title,
      artist: options.artist,
      type: options.type,
      duration: options.duration,
      size: 0,
      quality: options.quality || this.settings.defaultQuality,
      url: options.url,
      status: 'queued',
      progress: 0,
      downloadedBytes: 0,
      createdAt: new Date(),
      thumbnailUrl: options.thumbnailUrl,
    };

    this.downloads.set(item.id, item);
    this.downloadQueue.push(item.id);

    await this.saveDownload(item);
    this.processQueue();

    return item;
  }

  // 다운로드 큐 처리
  private async processQueue(): Promise<void> {
    if (this.settings.wifiOnly && !this.isWifi()) return;
    if (!navigator.onLine) return;

    while (
      this.downloadQueue.length > 0 &&
      this.activeDownloads.size < this.settings.maxConcurrent
    ) {
      const id = this.downloadQueue.shift();
      if (id) {
        await this.startDownload(id);
      }
    }
  }

  // 다운로드 시작
  private async startDownload(id: string): Promise<void> {
    const item = this.downloads.get(id);
    if (!item) return;

    const controller = new AbortController();
    this.activeDownloads.set(id, controller);

    item.status = 'downloading';
    await this.saveDownload(item);

    try {
      const response = await fetch(item.url, { signal: controller.signal });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const contentLength = response.headers.get('content-length');
      item.size = contentLength ? parseInt(contentLength, 10) : 0;

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const chunks: Uint8Array[] = [];
      let receivedBytes = 0;
      const startTime = Date.now();

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        chunks.push(value);
        receivedBytes += value.length;
        item.downloadedBytes = receivedBytes;

        // 진행률 계산
        if (item.size > 0) {
          item.progress = Math.round((receivedBytes / item.size) * 100);
        }

        // 다운로드 속도 계산
        const elapsedSeconds = (Date.now() - startTime) / 1000;
        const speed = receivedBytes / elapsedSeconds;

        // 콜백 호출
        this.progressCallbacks.forEach((cb) => cb(item, item.progress, speed));
      }

      // Blob 생성 및 저장
      const blob = new Blob(chunks as BlobPart[], { type: 'audio/mpeg' });
      await this.saveAudioData(id, blob);

      item.status = 'completed';
      item.progress = 100;
      item.completedAt = new Date();
      item.expiresAt = new Date(Date.now() + this.settings.retainDays * 24 * 60 * 60 * 1000);

      await this.saveDownload(item);

      // 완료 콜백
      this.completeCallbacks.forEach((cb) => cb(item));
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        item.status = 'cancelled';
      } else {
        item.status = 'failed';
        item.error = (error as Error).message;
      }
      await this.saveDownload(item);
    } finally {
      this.activeDownloads.delete(id);
      this.processQueue();
    }
  }

  // 다운로드 메타데이터 저장
  private async saveDownload(item: DownloadItem): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction('downloads', 'readwrite');
      const store = tx.objectStore('downloads');
      const request = store.put(item);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // 오디오 데이터 저장
  private async saveAudioData(id: string, blob: Blob): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction('audioData', 'readwrite');
      const store = tx.objectStore('audioData');
      const request = store.put({ id, data: blob });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // 오디오 데이터 가져오기
  async getAudioData(id: string): Promise<Blob | null> {
    if (!this.db) return null;

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction('audioData', 'readonly');
      const store = tx.objectStore('audioData');
      const request = store.get(id);

      request.onsuccess = () => {
        resolve(request.result?.data || null);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // 오디오 URL 가져오기 (오프라인 재생용)
  async getPlayableUrl(id: string): Promise<string | null> {
    const blob = await this.getAudioData(id);
    if (!blob) return null;

    return URL.createObjectURL(blob);
  }

  // 다운로드 일시정지
  pause(id: string): void {
    const controller = this.activeDownloads.get(id);
    if (controller) {
      controller.abort();
      const item = this.downloads.get(id);
      if (item) {
        item.status = 'paused';
        this.saveDownload(item);
      }
    }
  }

  // 다운로드 재개
  async resume(id: string): Promise<void> {
    const item = this.downloads.get(id);
    if (item && item.status === 'paused') {
      item.status = 'queued';
      this.downloadQueue.push(id);
      await this.saveDownload(item);
      this.processQueue();
    }
  }

  // 다운로드 취소
  async cancel(id: string): Promise<void> {
    this.pause(id);

    const item = this.downloads.get(id);
    if (item) {
      item.status = 'cancelled';
      await this.saveDownload(item);
    }

    // 큐에서 제거
    const queueIndex = this.downloadQueue.indexOf(id);
    if (queueIndex > -1) {
      this.downloadQueue.splice(queueIndex, 1);
    }
  }

  // 다운로드 삭제
  async delete(id: string): Promise<void> {
    await this.cancel(id);

    if (this.db) {
      // 메타데이터 삭제
      const tx1 = this.db.transaction('downloads', 'readwrite');
      tx1.objectStore('downloads').delete(id);

      // 오디오 데이터 삭제
      const tx2 = this.db.transaction('audioData', 'readwrite');
      tx2.objectStore('audioData').delete(id);
    }

    this.downloads.delete(id);
  }

  // 모든 다운로드 일시정지
  pauseAll(): void {
    this.activeDownloads.forEach((_, id) => this.pause(id));
  }

  // 모든 다운로드 재개
  async resumeAll(): Promise<void> {
    for (const item of this.downloads.values()) {
      if (item.status === 'paused') {
        await this.resume(item.id);
      }
    }
  }

  // 다운로드 항목 조회
  getDownload(id: string): DownloadItem | undefined {
    return this.downloads.get(id);
  }

  // 콘텐츠 ID로 다운로드 조회
  getByContentId(contentId: string): DownloadItem | undefined {
    return Array.from(this.downloads.values()).find(
      (d) => d.contentId === contentId
    );
  }

  // 모든 다운로드 조회
  getAll(): DownloadItem[] {
    return Array.from(this.downloads.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  // 완료된 다운로드만 조회
  getCompleted(): DownloadItem[] {
    return this.getAll().filter((d) => d.status === 'completed');
  }

  // 타입별 다운로드 조회
  getByType(type: DownloadItem['type']): DownloadItem[] {
    return this.getAll().filter((d) => d.type === type && d.status === 'completed');
  }

  // 저장 공간 사용량
  async getStorageUsage(): Promise<number> {
    const completed = this.getCompleted();
    return completed.reduce((total, item) => total + item.size, 0);
  }

  // 오래된 다운로드 정리
  async cleanupOldDownloads(): Promise<number> {
    const now = new Date();
    let cleaned = 0;

    for (const item of this.downloads.values()) {
      if (item.expiresAt && item.expiresAt < now) {
        await this.delete(item.id);
        cleaned++;
      }
    }

    return cleaned;
  }

  // 모든 다운로드 삭제
  async clearAll(): Promise<void> {
    const ids = Array.from(this.downloads.keys());
    for (const id of ids) {
      await this.delete(id);
    }
  }

  // 진행 콜백 등록
  onProgress(callback: ProgressCallback): () => void {
    this.progressCallbacks.add(callback);
    return () => this.progressCallbacks.delete(callback);
  }

  // 완료 콜백 등록
  onComplete(callback: CompleteCallback): () => void {
    this.completeCallbacks.add(callback);
    return () => this.completeCallbacks.delete(callback);
  }

  // 설정 업데이트
  updateSettings(updates: Partial<DownloadSettings>): void {
    this.settings = { ...this.settings, ...updates };
  }

  // 설정 조회
  getSettings(): DownloadSettings {
    return { ...this.settings };
  }

  // 오프라인 재생 가능 여부
  async isAvailableOffline(contentId: string): Promise<boolean> {
    const item = this.getByContentId(contentId);
    return item?.status === 'completed' || false;
  }
}

// 싱글톤 인스턴스
let audioDownloadManagerInstance: AudioDownloadManager | null = null;

export async function getAudioDownloadManager(): Promise<AudioDownloadManager> {
  if (!audioDownloadManagerInstance) {
    audioDownloadManagerInstance = new AudioDownloadManager();
    await audioDownloadManagerInstance.initialize();
  }
  return audioDownloadManagerInstance;
}

// React Hook
export function useAudioDownload() {
  return getAudioDownloadManager();
}
