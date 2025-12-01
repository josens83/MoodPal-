/**
 * MoodPal 알림 관리 시스템
 * Discord/Slack 벤치마킹 기반 실시간 알림
 */

// 알림 타입
export type NotificationType =
  | 'reminder'        // 체크인 리마인더
  | 'streak'          // 스트릭 알림
  | 'achievement'     // 업적 달성
  | 'insight'         // 인사이트
  | 'meditation'      // 명상 리마인더
  | 'mood_alert'      // 기분 알림
  | 'social'          // 소셜 알림
  | 'system';         // 시스템 알림

// 알림 우선순위
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

// 알림 상태
export type NotificationStatus = 'pending' | 'sent' | 'read' | 'dismissed';

// 알림 인터페이스
export interface Notification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  status: NotificationStatus;
  title: string;
  body: string;
  icon?: string;
  image?: string;
  data?: Record<string, any>;
  actions?: NotificationAction[];
  scheduledAt?: Date;
  sentAt?: Date;
  readAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
}

// 알림 액션
export interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
  url?: string;
}

// 알림 설정
export interface NotificationPreferences {
  enabled: boolean;
  sound: boolean;
  vibration: boolean;
  showPreview: boolean;

  // 시간대 설정
  quietHoursEnabled: boolean;
  quietHoursStart: string; // "22:00"
  quietHoursEnd: string;   // "08:00"

  // 타입별 설정
  typeSettings: Record<NotificationType, {
    enabled: boolean;
    sound: boolean;
  }>;

  // 빈도 설정
  dailyCheckInReminder: boolean;
  reminderTime: string;
  weeklyInsight: boolean;
  streakAlerts: boolean;
}

// 알림 템플릿
const NOTIFICATION_TEMPLATES: Record<string, (data: any) => Omit<Notification, 'id' | 'createdAt' | 'status'>> = {
  // 체크인 리마인더
  daily_checkin: (data) => ({
    type: 'reminder',
    priority: 'normal',
    title: '오늘의 기분은 어떠세요?',
    body: '잠시 멈추고 오늘의 감정을 기록해보세요.',
    icon: '/icons/mood-check.png',
    actions: [
      { action: 'checkin', title: '기분 체크하기', url: '/mood' },
      { action: 'later', title: '나중에' },
    ],
    data,
  }),

  // 스트릭 유지
  streak_reminder: (data) => ({
    type: 'streak',
    priority: 'high',
    title: `${data.streakDays}일 스트릭을 유지하세요!`,
    body: '오늘 기분을 기록하고 연속 기록을 이어가세요.',
    icon: '/icons/streak.png',
    actions: [
      { action: 'checkin', title: '기분 체크하기', url: '/mood' },
    ],
    data,
  }),

  // 스트릭 달성
  streak_milestone: (data) => ({
    type: 'streak',
    priority: 'normal',
    title: `축하해요! ${data.days}일 연속 달성!`,
    body: '꾸준한 노력이 정말 대단해요.',
    icon: '/icons/celebration.png',
    data,
  }),

  // 업적 달성
  achievement_unlocked: (data) => ({
    type: 'achievement',
    priority: 'normal',
    title: '새로운 업적을 달성했어요!',
    body: `"${data.achievementName}" 업적을 획득했습니다.`,
    icon: '/icons/achievement.png',
    actions: [
      { action: 'view', title: '확인하기', url: '/profile/achievements' },
    ],
    data,
  }),

  // 주간 인사이트
  weekly_insight: (data) => ({
    type: 'insight',
    priority: 'low',
    title: '이번 주 인사이트가 도착했어요',
    body: data.summary || '이번 주 감정 패턴을 확인해보세요.',
    icon: '/icons/insight.png',
    actions: [
      { action: 'view', title: '확인하기', url: '/insights/weekly' },
    ],
    data,
  }),

  // 명상 리마인더
  meditation_reminder: (data) => ({
    type: 'meditation',
    priority: 'low',
    title: '마음을 정리할 시간이에요',
    body: data.recommendedSession || '짧은 명상으로 하루를 마무리해보세요.',
    icon: '/icons/meditation.png',
    actions: [
      { action: 'start', title: '명상 시작', url: '/meditation' },
      { action: 'later', title: '나중에' },
    ],
    data,
  }),

  // 기분 저하 알림
  mood_low_alert: (data) => ({
    type: 'mood_alert',
    priority: 'high',
    title: '괜찮으세요?',
    body: '최근 기분이 좋지 않은 것 같아 걱정돼요. 이야기 나눠볼까요?',
    icon: '/icons/care.png',
    actions: [
      { action: 'chat', title: '대화하기', url: '/chat' },
      { action: 'later', title: '괜찮아요' },
    ],
    data,
  }),

  // 기분 개선 알림
  mood_improved: (data) => ({
    type: 'mood_alert',
    priority: 'low',
    title: '기분이 좋아지고 있어요!',
    body: `${data.improvement || '긍정적인 변화'}가 보여요. 계속 잘하고 있어요!`,
    icon: '/icons/happy.png',
    data,
  }),

  // 시스템 알림
  system_update: (data) => ({
    type: 'system',
    priority: 'low',
    title: data.title || 'MoodPal 업데이트',
    body: data.body || '새로운 기능이 추가되었어요!',
    icon: '/icons/update.png',
    data,
  }),
};

// 알림 관리자 클래스
export class NotificationManager {
  private preferences: NotificationPreferences;
  private notifications: Notification[] = [];
  private scheduledNotifications: Map<string, NodeJS.Timeout> = new Map();
  private swRegistration: ServiceWorkerRegistration | null = null;

  constructor(preferences?: Partial<NotificationPreferences>) {
    this.preferences = {
      enabled: true,
      sound: true,
      vibration: true,
      showPreview: true,
      quietHoursEnabled: true,
      quietHoursStart: '22:00',
      quietHoursEnd: '08:00',
      typeSettings: {
        reminder: { enabled: true, sound: true },
        streak: { enabled: true, sound: true },
        achievement: { enabled: true, sound: true },
        insight: { enabled: true, sound: false },
        meditation: { enabled: true, sound: false },
        mood_alert: { enabled: true, sound: true },
        social: { enabled: true, sound: true },
        system: { enabled: true, sound: false },
      },
      dailyCheckInReminder: true,
      reminderTime: '20:00',
      weeklyInsight: true,
      streakAlerts: true,
      ...preferences,
    };
  }

  // 서비스 워커 등록
  async registerServiceWorker(): Promise<void> {
    if (!('serviceWorker' in navigator)) {
      console.warn('[NotificationManager] Service workers not supported');
      return;
    }

    try {
      this.swRegistration = await navigator.serviceWorker.ready;
      console.log('[NotificationManager] Service worker ready');
    } catch (error) {
      console.error('[NotificationManager] Service worker registration failed:', error);
    }
  }

  // 알림 권한 요청
  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('[NotificationManager] Notifications not supported');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }

  // 알림 전송
  async send(
    templateName: string,
    data: Record<string, any> = {}
  ): Promise<Notification | null> {
    const template = NOTIFICATION_TEMPLATES[templateName];
    if (!template) {
      console.error(`[NotificationManager] Template not found: ${templateName}`);
      return null;
    }

    const notificationData = template(data);

    // 설정 확인
    if (!this.shouldSend(notificationData)) {
      return null;
    }

    const notification: Notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...notificationData,
      status: 'pending',
      createdAt: new Date(),
    };

    // 저장
    this.notifications.push(notification);

    // 전송
    await this.deliver(notification);

    return notification;
  }

  // 커스텀 알림 전송
  async sendCustom(
    options: Omit<Notification, 'id' | 'createdAt' | 'status'>
  ): Promise<Notification | null> {
    if (!this.shouldSend(options)) {
      return null;
    }

    const notification: Notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...options,
      status: 'pending',
      createdAt: new Date(),
    };

    this.notifications.push(notification);
    await this.deliver(notification);

    return notification;
  }

  // 알림 전송 가능 여부 확인
  private shouldSend(notification: Pick<Notification, 'type' | 'priority'>): boolean {
    // 전체 비활성화 확인
    if (!this.preferences.enabled) {
      return false;
    }

    // 타입별 설정 확인
    const typeSettings = this.preferences.typeSettings[notification.type];
    if (!typeSettings?.enabled) {
      return false;
    }

    // 긴급 알림은 항상 전송
    if (notification.priority === 'urgent') {
      return true;
    }

    // 조용한 시간 확인
    if (this.preferences.quietHoursEnabled && this.isQuietHours()) {
      return notification.priority === 'high';
    }

    return true;
  }

  // 조용한 시간인지 확인
  private isQuietHours(): boolean {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const start = this.preferences.quietHoursStart;
    const end = this.preferences.quietHoursEnd;

    // 자정을 넘기는 경우 처리
    if (start > end) {
      return currentTime >= start || currentTime < end;
    }

    return currentTime >= start && currentTime < end;
  }

  // 알림 전달
  private async deliver(notification: Notification): Promise<void> {
    try {
      // 브라우저 알림 API 사용
      if (Notification.permission === 'granted') {
        // 사운드 설정
        const silent = !(this.preferences.sound && this.preferences.typeSettings[notification.type]?.sound);

        // 진동 설정
        const vibrate = this.preferences.vibration ? [100, 50, 100] : undefined;

        const options = {
          body: notification.body,
          icon: notification.icon || '/icons/icon-192.png',
          badge: '/icons/badge-72.png',
          tag: notification.id,
          renotify: notification.priority === 'high' || notification.priority === 'urgent',
          requireInteraction: notification.priority === 'urgent',
          data: notification.data,
          silent,
          vibrate,
        };

        // 서비스 워커를 통한 알림
        if (this.swRegistration) {
          await this.swRegistration.showNotification(notification.title, options);
        } else {
          // 일반 알림
          new Notification(notification.title, options);
        }

        notification.status = 'sent';
        notification.sentAt = new Date();
      }
    } catch (error) {
      console.error('[NotificationManager] Failed to deliver notification:', error);
    }
  }

  // 알림 스케줄링
  schedule(
    templateName: string,
    data: Record<string, any>,
    scheduledAt: Date
  ): string {
    const id = `scheduled_${Date.now()}`;
    const delay = scheduledAt.getTime() - Date.now();

    if (delay <= 0) {
      // 이미 지난 시간이면 즉시 전송
      this.send(templateName, data);
      return id;
    }

    const timeout = setTimeout(() => {
      this.send(templateName, data);
      this.scheduledNotifications.delete(id);
    }, delay);

    this.scheduledNotifications.set(id, timeout);

    return id;
  }

  // 스케줄 취소
  cancelScheduled(id: string): boolean {
    const timeout = this.scheduledNotifications.get(id);
    if (timeout) {
      clearTimeout(timeout);
      this.scheduledNotifications.delete(id);
      return true;
    }
    return false;
  }

  // 일일 리마인더 설정
  setupDailyReminder(): void {
    if (!this.preferences.dailyCheckInReminder) return;

    const [hours, minutes] = this.preferences.reminderTime.split(':').map(Number);
    const now = new Date();
    const scheduledTime = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      hours,
      minutes
    );

    // 이미 지났으면 다음 날로
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    this.schedule('daily_checkin', {}, scheduledTime);

    // 24시간 후 다시 스케줄
    setTimeout(() => this.setupDailyReminder(), 24 * 60 * 60 * 1000);
  }

  // 알림 읽음 처리
  markAsRead(id: string): void {
    const notification = this.notifications.find((n) => n.id === id);
    if (notification) {
      notification.status = 'read';
      notification.readAt = new Date();
    }
  }

  // 알림 해제
  dismiss(id: string): void {
    const notification = this.notifications.find((n) => n.id === id);
    if (notification) {
      notification.status = 'dismissed';
    }
  }

  // 읽지 않은 알림 조회
  getUnread(): Notification[] {
    return this.notifications.filter(
      (n) => n.status === 'sent' || n.status === 'pending'
    );
  }

  // 알림 개수
  getUnreadCount(): number {
    return this.getUnread().length;
  }

  // 전체 알림 조회
  getAll(): Notification[] {
    return [...this.notifications].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  // 설정 업데이트
  updatePreferences(updates: Partial<NotificationPreferences>): void {
    this.preferences = { ...this.preferences, ...updates };
  }

  // 설정 조회
  getPreferences(): NotificationPreferences {
    return { ...this.preferences };
  }

  // 모든 알림 지우기
  clearAll(): void {
    this.notifications = [];
  }

  // 만료된 알림 정리
  cleanup(): void {
    const now = new Date();
    this.notifications = this.notifications.filter(
      (n) => !n.expiresAt || n.expiresAt > now
    );
  }
}

// 싱글톤 인스턴스
let notificationManagerInstance: NotificationManager | null = null;

export function getNotificationManager(): NotificationManager {
  if (!notificationManagerInstance) {
    notificationManagerInstance = new NotificationManager();
  }
  return notificationManagerInstance;
}

// 푸시 알림 구독
export async function subscribeToPush(): Promise<PushSubscription | null> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('[Push] Push notifications not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;

    // 기존 구독 확인
    const existingSubscription = await registration.pushManager.getSubscription();
    if (existingSubscription) {
      return existingSubscription;
    }

    // 새 구독 생성
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    });

    // 서버에 구독 정보 전송
    await fetch('/api/notifications/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subscription),
    });

    return subscription;
  } catch (error) {
    console.error('[Push] Subscription failed:', error);
    return null;
  }
}

// 푸시 알림 구독 취소
export async function unsubscribeFromPush(): Promise<boolean> {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      await subscription.unsubscribe();

      // 서버에서 구독 정보 삭제
      await fetch('/api/notifications/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: subscription.endpoint }),
      });

      return true;
    }

    return false;
  } catch (error) {
    console.error('[Push] Unsubscribe failed:', error);
    return false;
  }
}
