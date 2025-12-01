/**
 * MoodPal 레벨 시스템
 * Duolingo 벤치마킹 기반 경험치 및 레벨
 */

// 레벨 데이터
export interface LevelData {
  level: number;
  currentXP: number;
  totalXP: number;
  xpToNextLevel: number;
  progressPercent: number;
  title: string;
  rank: string;
}

// XP 이벤트
export interface XPEvent {
  type: string;
  amount: number;
  timestamp: Date;
  description: string;
  bonus?: number;
}

// XP 보상 정의
export const XP_REWARDS: Record<string, { base: number; description: string }> = {
  // 기분 체크
  mood_check: { base: 10, description: '기분 체크' },
  mood_check_detailed: { base: 15, description: '상세 기분 기록' },
  mood_check_streak_bonus: { base: 5, description: '스트릭 보너스' },

  // 명상
  meditation_short: { base: 15, description: '짧은 명상 (5분)' },
  meditation_medium: { base: 25, description: '중간 명상 (10분)' },
  meditation_long: { base: 40, description: '긴 명상 (20분+)' },
  meditation_complete: { base: 10, description: '명상 완료' },

  // 저널
  journal_entry: { base: 20, description: '저널 작성' },
  journal_long: { base: 10, description: '긴 글 보너스' },
  gratitude_entry: { base: 15, description: '감사 일기' },

  // CBT
  cbt_exercise: { base: 25, description: 'CBT 연습' },
  cbt_complete: { base: 15, description: 'CBT 세션 완료' },
  thought_reframe: { base: 20, description: '생각 재구성' },

  // AI 대화
  chat_session: { base: 10, description: 'AI 대화' },
  chat_insight: { base: 15, description: '인사이트 발견' },

  // 일일/주간
  daily_goal: { base: 50, description: '일일 목표 달성' },
  weekly_goal: { base: 150, description: '주간 목표 달성' },
  perfect_week: { base: 200, description: '완벽한 한 주' },

  // 업적
  achievement_common: { base: 50, description: '일반 업적' },
  achievement_uncommon: { base: 100, description: '고급 업적' },
  achievement_rare: { base: 200, description: '희귀 업적' },
  achievement_epic: { base: 500, description: '영웅 업적' },
  achievement_legendary: { base: 1000, description: '전설 업적' },

  // 기타
  first_action: { base: 50, description: '첫 활동 보너스' },
  comeback: { base: 30, description: '복귀 보너스' },
  referral: { base: 100, description: '친구 초대' },
};

// 레벨별 필요 XP (점진적 증가)
function getXPForLevel(level: number): number {
  if (level <= 0) return 0;
  // 레벨 1~5: 100XP씩
  if (level <= 5) return level * 100;
  // 레벨 6~10: 150XP씩
  if (level <= 10) return 500 + (level - 5) * 150;
  // 레벨 11~20: 200XP씩
  if (level <= 20) return 1250 + (level - 10) * 200;
  // 레벨 21~50: 300XP씩
  if (level <= 50) return 3250 + (level - 20) * 300;
  // 레벨 51+: 500XP씩
  return 12250 + (level - 50) * 500;
}

// 레벨 타이틀
function getLevelTitle(level: number): string {
  if (level < 5) return '마음 챙김 입문자';
  if (level < 10) return '마음 챙김 수련생';
  if (level < 20) return '마음 챙김 탐험가';
  if (level < 30) return '마음 챙김 전문가';
  if (level < 40) return '마음 챙김 마스터';
  if (level < 50) return '마음 챙김 현자';
  return '마음 챙김 대가';
}

// 랭크
function getLevelRank(level: number): string {
  if (level < 5) return 'Bronze';
  if (level < 10) return 'Silver';
  if (level < 20) return 'Gold';
  if (level < 30) return 'Platinum';
  if (level < 40) return 'Diamond';
  if (level < 50) return 'Master';
  return 'Grandmaster';
}

// 레벨 시스템 클래스
export class LevelSystem {
  private userId: string;
  private totalXP: number = 0;
  private xpHistory: XPEvent[] = [];
  private dailyXP: number = 0;
  private lastDailyReset: string = '';
  private streakMultiplier: number = 1;
  private onLevelUp?: (newLevel: number, oldLevel: number) => void;
  private onXPGain?: (event: XPEvent) => void;

  constructor(userId: string) {
    this.userId = userId;
  }

  // 초기화
  async initialize(): Promise<void> {
    await this.loadFromStorage();
    this.checkDailyReset();
  }

  // XP 획득
  async gainXP(
    type: string,
    customAmount?: number,
    customDescription?: string
  ): Promise<XPEvent> {
    const reward = XP_REWARDS[type];
    let amount = customAmount ?? reward?.base ?? 0;
    const description = customDescription ?? reward?.description ?? type;

    // 스트릭 보너스 적용
    const bonus = Math.round(amount * (this.streakMultiplier - 1));
    amount += bonus;

    const event: XPEvent = {
      type,
      amount,
      timestamp: new Date(),
      description,
      bonus: bonus > 0 ? bonus : undefined,
    };

    const oldLevel = this.getCurrentLevel();
    this.totalXP += amount;
    this.dailyXP += amount;
    this.xpHistory.push(event);

    // 히스토리 제한 (최근 100개)
    if (this.xpHistory.length > 100) {
      this.xpHistory = this.xpHistory.slice(-100);
    }

    const newLevel = this.getCurrentLevel();

    // 레벨업 확인
    if (newLevel > oldLevel) {
      this.onLevelUp?.(newLevel, oldLevel);
    }

    // XP 획득 콜백
    this.onXPGain?.(event);

    // 저장
    await this.saveToStorage();

    return event;
  }

  // 현재 레벨 계산
  getCurrentLevel(): number {
    let level = 1;
    let xpRequired = getXPForLevel(level);

    while (this.totalXP >= xpRequired) {
      level++;
      xpRequired = getXPForLevel(level);
    }

    return level - 1 || 1;
  }

  // 레벨 데이터 조회
  getLevelData(): LevelData {
    const level = this.getCurrentLevel();
    const currentLevelXP = getXPForLevel(level);
    const nextLevelXP = getXPForLevel(level + 1);
    const xpInCurrentLevel = this.totalXP - currentLevelXP;
    const xpNeeded = nextLevelXP - currentLevelXP;

    return {
      level,
      currentXP: xpInCurrentLevel,
      totalXP: this.totalXP,
      xpToNextLevel: xpNeeded - xpInCurrentLevel,
      progressPercent: Math.round((xpInCurrentLevel / xpNeeded) * 100),
      title: getLevelTitle(level),
      rank: getLevelRank(level),
    };
  }

  // 일일 XP 조회
  getDailyXP(): number {
    this.checkDailyReset();
    return this.dailyXP;
  }

  // 일일 목표 진행률
  getDailyProgress(dailyGoal: number = 100): number {
    return Math.min(100, Math.round((this.getDailyXP() / dailyGoal) * 100));
  }

  // 스트릭 배율 설정
  setStreakMultiplier(streakDays: number): void {
    // 스트릭에 따른 보너스 (최대 50% 보너스)
    if (streakDays >= 30) {
      this.streakMultiplier = 1.5;
    } else if (streakDays >= 14) {
      this.streakMultiplier = 1.3;
    } else if (streakDays >= 7) {
      this.streakMultiplier = 1.2;
    } else if (streakDays >= 3) {
      this.streakMultiplier = 1.1;
    } else {
      this.streakMultiplier = 1;
    }
  }

  // XP 히스토리 조회
  getXPHistory(limit: number = 20): XPEvent[] {
    return this.xpHistory.slice(-limit).reverse();
  }

  // 오늘 획득 XP 조회
  getTodayXP(): XPEvent[] {
    const today = new Date().toISOString().split('T')[0];
    return this.xpHistory.filter(
      (e) => e.timestamp.toISOString().split('T')[0] === today
    );
  }

  // 일일 리셋 확인
  private checkDailyReset(): void {
    const today = new Date().toISOString().split('T')[0];
    if (this.lastDailyReset !== today) {
      this.dailyXP = 0;
      this.lastDailyReset = today;
    }
  }

  // 저장
  private async saveToStorage(): Promise<void> {
    try {
      const key = `moodpal_level_${this.userId}`;
      const data = {
        totalXP: this.totalXP,
        xpHistory: this.xpHistory.slice(-50).map((e) => ({
          ...e,
          timestamp: e.timestamp.toISOString(),
        })),
        dailyXP: this.dailyXP,
        lastDailyReset: this.lastDailyReset,
      };
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('[LevelSystem] Failed to save:', error);
    }
  }

  // 로드
  private async loadFromStorage(): Promise<void> {
    try {
      const key = `moodpal_level_${this.userId}`;
      const saved = localStorage.getItem(key);

      if (saved) {
        const data = JSON.parse(saved);
        this.totalXP = data.totalXP || 0;
        this.dailyXP = data.dailyXP || 0;
        this.lastDailyReset = data.lastDailyReset || '';
        this.xpHistory = (data.xpHistory || []).map((e: any) => ({
          ...e,
          timestamp: new Date(e.timestamp),
        }));
      }
    } catch (error) {
      console.error('[LevelSystem] Failed to load:', error);
    }
  }

  // 이벤트 핸들러 설정
  setOnLevelUp(handler: (newLevel: number, oldLevel: number) => void): void {
    this.onLevelUp = handler;
  }

  setOnXPGain(handler: (event: XPEvent) => void): void {
    this.onXPGain = handler;
  }

  // 통계
  getStats(): {
    totalXP: number;
    level: number;
    totalActions: number;
    avgDailyXP: number;
    topActions: Array<{ type: string; count: number; totalXP: number }>;
  } {
    const actionCounts: Record<string, { count: number; totalXP: number }> = {};

    this.xpHistory.forEach((e) => {
      if (!actionCounts[e.type]) {
        actionCounts[e.type] = { count: 0, totalXP: 0 };
      }
      actionCounts[e.type].count++;
      actionCounts[e.type].totalXP += e.amount;
    });

    const topActions = Object.entries(actionCounts)
      .map(([type, data]) => ({ type, ...data }))
      .sort((a, b) => b.totalXP - a.totalXP)
      .slice(0, 5);

    // 평균 일일 XP 계산
    const days = new Set(
      this.xpHistory.map((e) => e.timestamp.toISOString().split('T')[0])
    ).size;

    return {
      totalXP: this.totalXP,
      level: this.getCurrentLevel(),
      totalActions: this.xpHistory.length,
      avgDailyXP: days > 0 ? Math.round(this.totalXP / days) : 0,
      topActions,
    };
  }
}

// 리더보드 항목
export interface LeaderboardEntry {
  userId: string;
  username: string;
  avatar?: string;
  level: number;
  xp: number;
  rank: number;
  streak: number;
}

// 리더보드 타입
export type LeaderboardType = 'weekly' | 'monthly' | 'allTime';

// 리더보드 시스템 (클라이언트 측 - 실제로는 서버에서 처리)
export class LeaderboardSystem {
  private entries: Map<LeaderboardType, LeaderboardEntry[]> = new Map();

  constructor() {
    this.entries.set('weekly', []);
    this.entries.set('monthly', []);
    this.entries.set('allTime', []);
  }

  // 리더보드 가져오기 (API 호출)
  async fetchLeaderboard(type: LeaderboardType): Promise<LeaderboardEntry[]> {
    try {
      const response = await fetch(`/api/leaderboard?type=${type}`);
      if (response.ok) {
        const data = await response.json();
        this.entries.set(type, data.entries);
        return data.entries;
      }
    } catch (error) {
      console.error('[LeaderboardSystem] Fetch failed:', error);
    }
    return this.entries.get(type) || [];
  }

  // 캐시된 리더보드
  getCached(type: LeaderboardType): LeaderboardEntry[] {
    return this.entries.get(type) || [];
  }

  // 내 순위 조회
  async getMyRank(
    type: LeaderboardType,
    userId: string
  ): Promise<LeaderboardEntry | null> {
    const entries = await this.fetchLeaderboard(type);
    return entries.find((e) => e.userId === userId) || null;
  }
}

// 싱글톤 인스턴스
let levelSystemInstance: LevelSystem | null = null;
let leaderboardSystemInstance: LeaderboardSystem | null = null;

export function getLevelSystem(userId: string): LevelSystem {
  if (!levelSystemInstance || (levelSystemInstance as any).userId !== userId) {
    levelSystemInstance = new LevelSystem(userId);
  }
  return levelSystemInstance;
}

export function getLeaderboardSystem(): LeaderboardSystem {
  if (!leaderboardSystemInstance) {
    leaderboardSystemInstance = new LeaderboardSystem();
  }
  return leaderboardSystemInstance;
}

// 헬퍼 함수
export function formatXP(xp: number): string {
  if (xp >= 1000000) return `${(xp / 1000000).toFixed(1)}M`;
  if (xp >= 1000) return `${(xp / 1000).toFixed(1)}K`;
  return String(xp);
}

export function getRankColor(rank: string): string {
  const colors: Record<string, string> = {
    Bronze: '#cd7f32',
    Silver: '#c0c0c0',
    Gold: '#ffd700',
    Platinum: '#e5e4e2',
    Diamond: '#b9f2ff',
    Master: '#ff6b6b',
    Grandmaster: '#9b59b6',
  };
  return colors[rank] || '#9ca3af';
}
