/**
 * MoodPal 스트릭 시스템
 * Duolingo 벤치마킹 기반 연속 활동 추적
 */

// 스트릭 타입
export type StreakType =
  | 'mood_check'      // 기분 체크
  | 'meditation'      // 명상
  | 'journal'         // 저널
  | 'chat'            // AI 대화
  | 'exercise'        // CBT 연습
  | 'overall';        // 종합 (하나라도 활동)

// 스트릭 데이터
export interface StreakData {
  type: StreakType;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string;  // YYYY-MM-DD
  totalDays: number;
  weeklyProgress: boolean[];  // 이번 주 진행 상황 (월~일)
  monthlyCalendar: Record<string, boolean>;  // YYYY-MM-DD: completed
  streakFreezeCount: number;  // 스트릭 프리즈 보유량
  freezeUsedToday: boolean;
  streakMilestones: number[];  // 달성한 마일스톤들
}

// 스트릭 리워드
export interface StreakReward {
  days: number;
  title: string;
  description: string;
  xpBonus: number;
  badge?: string;
  special?: boolean;
}

// 스트릭 마일스톤 정의
const STREAK_MILESTONES: StreakReward[] = [
  { days: 3, title: '좋은 시작', description: '3일 연속 달성!', xpBonus: 50, badge: 'streak_3' },
  { days: 7, title: '1주일 달성', description: '일주일을 지켜냈어요', xpBonus: 100, badge: 'streak_7' },
  { days: 14, title: '2주 전사', description: '2주 연속 달성', xpBonus: 200, badge: 'streak_14' },
  { days: 30, title: '한 달의 기적', description: '30일을 함께했어요', xpBonus: 500, badge: 'streak_30', special: true },
  { days: 50, title: '반세기', description: '50일 연속 기록', xpBonus: 750, badge: 'streak_50' },
  { days: 100, title: '백일잔치', description: '100일의 여정', xpBonus: 1500, badge: 'streak_100', special: true },
  { days: 200, title: '진정한 마스터', description: '200일 연속', xpBonus: 3000, badge: 'streak_200' },
  { days: 365, title: '1년의 헌신', description: '365일 완주!', xpBonus: 10000, badge: 'streak_365', special: true },
];

// 스트릭 시스템 클래스
export class StreakSystem {
  private streaks: Map<StreakType, StreakData> = new Map();
  private userId: string;
  private onStreakUpdate?: (data: StreakData) => void;
  private onMilestoneReached?: (reward: StreakReward) => void;

  constructor(userId: string) {
    this.userId = userId;
  }

  // 초기화
  async initialize(): Promise<void> {
    const savedData = await this.loadFromStorage();
    if (savedData) {
      Object.entries(savedData).forEach(([type, data]) => {
        this.streaks.set(type as StreakType, data as StreakData);
      });
    } else {
      this.initializeDefaultStreaks();
    }

    // 자정에 스트릭 체크
    this.scheduleStreakCheck();
  }

  // 기본 스트릭 초기화
  private initializeDefaultStreaks(): void {
    const types: StreakType[] = ['mood_check', 'meditation', 'journal', 'chat', 'exercise', 'overall'];

    types.forEach((type) => {
      this.streaks.set(type, {
        type,
        currentStreak: 0,
        longestStreak: 0,
        lastActivityDate: '',
        totalDays: 0,
        weeklyProgress: [false, false, false, false, false, false, false],
        monthlyCalendar: {},
        streakFreezeCount: 0,
        freezeUsedToday: false,
        streakMilestones: [],
      });
    });
  }

  // 활동 기록
  async recordActivity(type: StreakType): Promise<{
    streakUpdated: boolean;
    newStreak: number;
    milestone?: StreakReward;
  }> {
    const today = this.getTodayString();
    const streak = this.streaks.get(type);

    if (!streak) {
      return { streakUpdated: false, newStreak: 0 };
    }

    // 이미 오늘 기록했는지 확인
    if (streak.monthlyCalendar[today]) {
      return { streakUpdated: false, newStreak: streak.currentStreak };
    }

    const yesterday = this.getYesterdayString();
    let streakUpdated = false;
    let milestone: StreakReward | undefined;

    // 연속 여부 확인
    if (streak.lastActivityDate === yesterday) {
      // 연속 유지
      streak.currentStreak++;
      streakUpdated = true;
    } else if (streak.lastActivityDate === today) {
      // 오늘 이미 기록
      return { streakUpdated: false, newStreak: streak.currentStreak };
    } else if (streak.lastActivityDate === '') {
      // 첫 기록
      streak.currentStreak = 1;
      streakUpdated = true;
    } else {
      // 스트릭 끊김 - 프리즈 확인
      if (streak.streakFreezeCount > 0 && !streak.freezeUsedToday) {
        streak.streakFreezeCount--;
        streak.freezeUsedToday = true;
        streak.currentStreak++;
        streakUpdated = true;
      } else {
        // 스트릭 리셋
        streak.currentStreak = 1;
        streakUpdated = true;
      }
    }

    // 최장 스트릭 업데이트
    if (streak.currentStreak > streak.longestStreak) {
      streak.longestStreak = streak.currentStreak;
    }

    // 기록 업데이트
    streak.lastActivityDate = today;
    streak.totalDays++;
    streak.monthlyCalendar[today] = true;

    // 주간 진행 상황 업데이트
    const dayOfWeek = new Date().getDay();
    const mondayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    streak.weeklyProgress[mondayIndex] = true;

    // 마일스톤 체크
    milestone = this.checkMilestone(streak);

    // 종합 스트릭 업데이트
    if (type !== 'overall') {
      await this.recordActivity('overall');
    }

    // 저장
    await this.saveToStorage();

    // 콜백
    this.onStreakUpdate?.(streak);
    if (milestone) {
      this.onMilestoneReached?.(milestone);
    }

    return {
      streakUpdated,
      newStreak: streak.currentStreak,
      milestone,
    };
  }

  // 마일스톤 체크
  private checkMilestone(streak: StreakData): StreakReward | undefined {
    for (const milestone of STREAK_MILESTONES) {
      if (
        streak.currentStreak === milestone.days &&
        !streak.streakMilestones.includes(milestone.days)
      ) {
        streak.streakMilestones.push(milestone.days);
        return milestone;
      }
    }
    return undefined;
  }

  // 스트릭 조회
  getStreak(type: StreakType): StreakData | undefined {
    return this.streaks.get(type);
  }

  // 모든 스트릭 조회
  getAllStreaks(): StreakData[] {
    return Array.from(this.streaks.values());
  }

  // 주간 진행률
  getWeeklyProgress(type: StreakType): number {
    const streak = this.streaks.get(type);
    if (!streak) return 0;

    const completed = streak.weeklyProgress.filter(Boolean).length;
    return Math.round((completed / 7) * 100);
  }

  // 스트릭 프리즈 추가
  addStreakFreeze(count: number = 1): void {
    for (const streak of this.streaks.values()) {
      streak.streakFreezeCount += count;
    }
    this.saveToStorage();
  }

  // 스트릭 프리즈 사용
  useStreakFreeze(type: StreakType): boolean {
    const streak = this.streaks.get(type);
    if (!streak || streak.streakFreezeCount <= 0) return false;

    streak.streakFreezeCount--;
    streak.freezeUsedToday = true;
    this.saveToStorage();
    return true;
  }

  // 스트릭 상태 확인 (오늘 활동했는지)
  hasActivityToday(type: StreakType): boolean {
    const streak = this.streaks.get(type);
    if (!streak) return false;

    return streak.monthlyCalendar[this.getTodayString()] || false;
  }

  // 스트릭 위험 여부 (오늘 활동 안 하면 끊김)
  isStreakAtRisk(type: StreakType): boolean {
    const streak = this.streaks.get(type);
    if (!streak || streak.currentStreak === 0) return false;

    return !this.hasActivityToday(type);
  }

  // 다음 마일스톤 조회
  getNextMilestone(type: StreakType): StreakReward | undefined {
    const streak = this.streaks.get(type);
    if (!streak) return undefined;

    return STREAK_MILESTONES.find((m) => m.days > streak.currentStreak);
  }

  // 마일스톤까지 남은 일수
  getDaysToNextMilestone(type: StreakType): number {
    const streak = this.streaks.get(type);
    const nextMilestone = this.getNextMilestone(type);

    if (!streak || !nextMilestone) return 0;

    return nextMilestone.days - streak.currentStreak;
  }

  // 월간 캘린더 조회
  getMonthlyCalendar(type: StreakType, year: number, month: number): Record<string, boolean> {
    const streak = this.streaks.get(type);
    if (!streak) return {};

    const prefix = `${year}-${String(month).padStart(2, '0')}`;
    const result: Record<string, boolean> = {};

    Object.entries(streak.monthlyCalendar).forEach(([date, completed]) => {
      if (date.startsWith(prefix)) {
        result[date] = completed;
      }
    });

    return result;
  }

  // 오늘 날짜 문자열
  private getTodayString(): string {
    return new Date().toISOString().split('T')[0];
  }

  // 어제 날짜 문자열
  private getYesterdayString(): string {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split('T')[0];
  }

  // 자정 스트릭 체크 스케줄
  private scheduleStreakCheck(): void {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const timeUntilMidnight = tomorrow.getTime() - now.getTime();

    setTimeout(() => {
      this.resetDailyFlags();
      this.resetWeeklyProgress();
      this.scheduleStreakCheck(); // 다음 날 다시 스케줄
    }, timeUntilMidnight);
  }

  // 일일 플래그 리셋
  private resetDailyFlags(): void {
    for (const streak of this.streaks.values()) {
      streak.freezeUsedToday = false;
    }
  }

  // 주간 진행 리셋 (월요일)
  private resetWeeklyProgress(): void {
    const today = new Date();
    if (today.getDay() === 1) {
      // 월요일
      for (const streak of this.streaks.values()) {
        streak.weeklyProgress = [false, false, false, false, false, false, false];
      }
    }
  }

  // 저장소에서 로드
  private async loadFromStorage(): Promise<Record<string, StreakData> | null> {
    try {
      const key = `moodpal_streaks_${this.userId}`;
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  // 저장소에 저장
  private async saveToStorage(): Promise<void> {
    try {
      const key = `moodpal_streaks_${this.userId}`;
      const data: Record<string, StreakData> = {};
      this.streaks.forEach((streak, type) => {
        data[type] = streak;
      });
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('[StreakSystem] Failed to save:', error);
    }
  }

  // 이벤트 핸들러 설정
  setOnStreakUpdate(handler: (data: StreakData) => void): void {
    this.onStreakUpdate = handler;
  }

  setOnMilestoneReached(handler: (reward: StreakReward) => void): void {
    this.onMilestoneReached = handler;
  }

  // 스트릭 통계
  getStats(): {
    totalActiveDays: number;
    longestStreak: number;
    currentBestStreak: number;
    milestonesReached: number;
  } {
    let totalActiveDays = 0;
    let longestStreak = 0;
    let currentBestStreak = 0;
    let milestonesReached = 0;

    for (const streak of this.streaks.values()) {
      if (streak.type === 'overall') {
        totalActiveDays = streak.totalDays;
        longestStreak = streak.longestStreak;
        currentBestStreak = streak.currentStreak;
        milestonesReached = streak.streakMilestones.length;
      }
    }

    return { totalActiveDays, longestStreak, currentBestStreak, milestonesReached };
  }
}

// 싱글톤 인스턴스
let streakSystemInstance: StreakSystem | null = null;

export function getStreakSystem(userId: string): StreakSystem {
  if (!streakSystemInstance || (streakSystemInstance as any).userId !== userId) {
    streakSystemInstance = new StreakSystem(userId);
  }
  return streakSystemInstance;
}

// 스트릭 관련 유틸
export function formatStreakDays(days: number): string {
  if (days === 0) return '시작하기';
  if (days === 1) return '1일';
  return `${days}일`;
}

export function getStreakEmoji(days: number): string {
  if (days === 0) return '⚪';
  if (days < 7) return '🔥';
  if (days < 30) return '💪';
  if (days < 100) return '⭐';
  if (days < 365) return '🏆';
  return '👑';
}
