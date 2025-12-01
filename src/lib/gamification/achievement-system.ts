/**
 * MoodPal 업적 시스템
 * Duolingo 벤치마킹 기반 업적 및 뱃지 시스템
 */

// 업적 카테고리
export type AchievementCategory =
  | 'streak'          // 스트릭 관련
  | 'mood'            // 기분 기록
  | 'meditation'      // 명상
  | 'journal'         // 저널
  | 'cbt'             // CBT 연습
  | 'social'          // 소셜
  | 'milestone'       // 마일스톤
  | 'special';        // 특별 이벤트

// 업적 희귀도
export type AchievementRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

// 업적 정의
export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  icon: string;
  xpReward: number;
  criteria: AchievementCriteria;
  hidden?: boolean;  // 숨겨진 업적
  progress?: number; // 진행률 (0-100)
  unlockedAt?: Date;
  tier?: number;     // 단계형 업적
  maxTier?: number;
}

// 업적 조건
export interface AchievementCriteria {
  type: string;
  target: number;
  current?: number;
}

// 업적 진행 상황
export interface AchievementProgress {
  achievementId: string;
  currentValue: number;
  targetValue: number;
  completed: boolean;
  completedAt?: Date;
  tier?: number;
}

// 업적 정의 목록
const ACHIEVEMENTS: Achievement[] = [
  // ====== 스트릭 관련 ======
  {
    id: 'streak_starter',
    name: '시작이 반이다',
    description: '첫 번째 기분 체크를 완료하세요',
    category: 'streak',
    rarity: 'common',
    icon: '🌱',
    xpReward: 10,
    criteria: { type: 'mood_entries', target: 1 },
  },
  {
    id: 'streak_3',
    name: '3일의 약속',
    description: '3일 연속으로 기분을 기록하세요',
    category: 'streak',
    rarity: 'common',
    icon: '🔥',
    xpReward: 50,
    criteria: { type: 'streak_days', target: 3 },
  },
  {
    id: 'streak_7',
    name: '일주일 챌린지',
    description: '7일 연속으로 기분을 기록하세요',
    category: 'streak',
    rarity: 'uncommon',
    icon: '💪',
    xpReward: 100,
    criteria: { type: 'streak_days', target: 7 },
  },
  {
    id: 'streak_30',
    name: '한 달의 기적',
    description: '30일 연속으로 기분을 기록하세요',
    category: 'streak',
    rarity: 'rare',
    icon: '⭐',
    xpReward: 500,
    criteria: { type: 'streak_days', target: 30 },
  },
  {
    id: 'streak_100',
    name: '백일의 여정',
    description: '100일 연속으로 기분을 기록하세요',
    category: 'streak',
    rarity: 'epic',
    icon: '🏆',
    xpReward: 1500,
    criteria: { type: 'streak_days', target: 100 },
  },
  {
    id: 'streak_365',
    name: '1년의 헌신',
    description: '365일 연속으로 기분을 기록하세요',
    category: 'streak',
    rarity: 'legendary',
    icon: '👑',
    xpReward: 10000,
    criteria: { type: 'streak_days', target: 365 },
  },

  // ====== 기분 기록 ======
  {
    id: 'mood_10',
    name: '감정 탐험가',
    description: '기분을 10번 기록하세요',
    category: 'mood',
    rarity: 'common',
    icon: '😊',
    xpReward: 30,
    criteria: { type: 'mood_entries', target: 10 },
  },
  {
    id: 'mood_50',
    name: '감정 일기장',
    description: '기분을 50번 기록하세요',
    category: 'mood',
    rarity: 'uncommon',
    icon: '📔',
    xpReward: 100,
    criteria: { type: 'mood_entries', target: 50 },
  },
  {
    id: 'mood_100',
    name: '감정 전문가',
    description: '기분을 100번 기록하세요',
    category: 'mood',
    rarity: 'rare',
    icon: '🎓',
    xpReward: 300,
    criteria: { type: 'mood_entries', target: 100 },
  },
  {
    id: 'mood_rainbow',
    name: '감정의 무지개',
    description: '7가지 다른 감정을 모두 기록하세요',
    category: 'mood',
    rarity: 'uncommon',
    icon: '🌈',
    xpReward: 150,
    criteria: { type: 'unique_emotions', target: 7 },
  },
  {
    id: 'mood_morning',
    name: '아침형 인간',
    description: '오전 8시 이전에 기분을 10번 기록하세요',
    category: 'mood',
    rarity: 'uncommon',
    icon: '🌅',
    xpReward: 100,
    criteria: { type: 'morning_entries', target: 10 },
  },

  // ====== 명상 ======
  {
    id: 'meditation_first',
    name: '첫 명상',
    description: '첫 번째 명상을 완료하세요',
    category: 'meditation',
    rarity: 'common',
    icon: '🧘',
    xpReward: 20,
    criteria: { type: 'meditations', target: 1 },
  },
  {
    id: 'meditation_10',
    name: '명상 수련생',
    description: '명상을 10회 완료하세요',
    category: 'meditation',
    rarity: 'uncommon',
    icon: '🕯️',
    xpReward: 100,
    criteria: { type: 'meditations', target: 10 },
  },
  {
    id: 'meditation_50',
    name: '명상 마스터',
    description: '명상을 50회 완료하세요',
    category: 'meditation',
    rarity: 'rare',
    icon: '🪷',
    xpReward: 400,
    criteria: { type: 'meditations', target: 50 },
  },
  {
    id: 'meditation_1hour',
    name: '1시간 명상',
    description: '총 1시간 명상을 완료하세요',
    category: 'meditation',
    rarity: 'uncommon',
    icon: '⏰',
    xpReward: 150,
    criteria: { type: 'meditation_minutes', target: 60 },
  },
  {
    id: 'meditation_10hours',
    name: '10시간 명상',
    description: '총 10시간 명상을 완료하세요',
    category: 'meditation',
    rarity: 'rare',
    icon: '🌙',
    xpReward: 500,
    criteria: { type: 'meditation_minutes', target: 600 },
  },

  // ====== 저널 ======
  {
    id: 'journal_first',
    name: '첫 저널',
    description: '첫 번째 저널을 작성하세요',
    category: 'journal',
    rarity: 'common',
    icon: '✍️',
    xpReward: 20,
    criteria: { type: 'journals', target: 1 },
  },
  {
    id: 'journal_10',
    name: '꾸준한 기록자',
    description: '저널을 10개 작성하세요',
    category: 'journal',
    rarity: 'uncommon',
    icon: '📝',
    xpReward: 100,
    criteria: { type: 'journals', target: 10 },
  },
  {
    id: 'journal_long',
    name: '깊은 성찰',
    description: '500자 이상의 저널을 작성하세요',
    category: 'journal',
    rarity: 'uncommon',
    icon: '📖',
    xpReward: 80,
    criteria: { type: 'journal_long', target: 1 },
  },

  // ====== CBT ======
  {
    id: 'cbt_first',
    name: '생각 바꾸기',
    description: '첫 번째 CBT 연습을 완료하세요',
    category: 'cbt',
    rarity: 'common',
    icon: '💡',
    xpReward: 30,
    criteria: { type: 'cbt_exercises', target: 1 },
  },
  {
    id: 'cbt_10',
    name: '인지 탐험가',
    description: 'CBT 연습을 10회 완료하세요',
    category: 'cbt',
    rarity: 'uncommon',
    icon: '🧠',
    xpReward: 150,
    criteria: { type: 'cbt_exercises', target: 10 },
  },
  {
    id: 'cbt_reframe',
    name: '리프레이밍 마스터',
    description: '생각 재구성을 5회 완료하세요',
    category: 'cbt',
    rarity: 'rare',
    icon: '🔄',
    xpReward: 200,
    criteria: { type: 'cbt_reframes', target: 5 },
  },

  // ====== 마일스톤 ======
  {
    id: 'level_5',
    name: '성장하는 중',
    description: '레벨 5에 도달하세요',
    category: 'milestone',
    rarity: 'common',
    icon: '📈',
    xpReward: 100,
    criteria: { type: 'level', target: 5 },
  },
  {
    id: 'level_10',
    name: '꾸준한 성장',
    description: '레벨 10에 도달하세요',
    category: 'milestone',
    rarity: 'uncommon',
    icon: '🚀',
    xpReward: 250,
    criteria: { type: 'level', target: 10 },
  },
  {
    id: 'level_25',
    name: '마음 챙김 전문가',
    description: '레벨 25에 도달하세요',
    category: 'milestone',
    rarity: 'rare',
    icon: '💫',
    xpReward: 500,
    criteria: { type: 'level', target: 25 },
  },

  // ====== 특별 ======
  {
    id: 'night_owl',
    name: '밤의 성찰',
    description: '자정 이후에 기분을 기록하세요',
    category: 'special',
    rarity: 'common',
    icon: '🦉',
    xpReward: 30,
    criteria: { type: 'night_entry', target: 1 },
    hidden: true,
  },
  {
    id: 'weekend_warrior',
    name: '주말 전사',
    description: '4주 연속 주말에 활동하세요',
    category: 'special',
    rarity: 'uncommon',
    icon: '🎉',
    xpReward: 150,
    criteria: { type: 'weekend_weeks', target: 4 },
  },
  {
    id: 'gratitude_guru',
    name: '감사 구루',
    description: '감사 일기를 20개 작성하세요',
    category: 'special',
    rarity: 'rare',
    icon: '🙏',
    xpReward: 300,
    criteria: { type: 'gratitude_entries', target: 20 },
  },
];

// 업적 시스템 클래스
export class AchievementSystem {
  private userId: string;
  private achievements: Map<string, Achievement> = new Map();
  private progress: Map<string, AchievementProgress> = new Map();
  private onAchievementUnlocked?: (achievement: Achievement) => void;

  constructor(userId: string) {
    this.userId = userId;
    this.initializeAchievements();
  }

  // 업적 초기화
  private initializeAchievements(): void {
    ACHIEVEMENTS.forEach((achievement) => {
      this.achievements.set(achievement.id, { ...achievement });
    });
  }

  // 초기화 (저장된 데이터 로드)
  async initialize(): Promise<void> {
    await this.loadProgress();
  }

  // 진행 상황 업데이트
  async updateProgress(
    criteriaType: string,
    value: number,
    increment: boolean = true
  ): Promise<Achievement[]> {
    const unlockedAchievements: Achievement[] = [];

    for (const achievement of this.achievements.values()) {
      if (achievement.criteria.type !== criteriaType) continue;
      if (achievement.unlockedAt) continue; // 이미 획득

      let progressEntry = this.progress.get(achievement.id);

      if (!progressEntry) {
        progressEntry = {
          achievementId: achievement.id,
          currentValue: 0,
          targetValue: achievement.criteria.target,
          completed: false,
        };
        this.progress.set(achievement.id, progressEntry);
      }

      // 값 업데이트
      if (increment) {
        progressEntry.currentValue += value;
      } else {
        progressEntry.currentValue = value;
      }

      // 달성 확인
      if (progressEntry.currentValue >= progressEntry.targetValue && !progressEntry.completed) {
        progressEntry.completed = true;
        progressEntry.completedAt = new Date();

        achievement.unlockedAt = new Date();
        achievement.progress = 100;

        unlockedAchievements.push(achievement);

        // 콜백
        this.onAchievementUnlocked?.(achievement);
      } else {
        // 진행률 업데이트
        achievement.progress = Math.min(
          100,
          Math.round((progressEntry.currentValue / progressEntry.targetValue) * 100)
        );
      }
    }

    // 저장
    await this.saveProgress();

    return unlockedAchievements;
  }

  // 업적 조회
  getAchievement(id: string): Achievement | undefined {
    return this.achievements.get(id);
  }

  // 전체 업적 조회
  getAllAchievements(includeHidden: boolean = false): Achievement[] {
    return Array.from(this.achievements.values())
      .filter((a) => includeHidden || !a.hidden || a.unlockedAt)
      .sort((a, b) => {
        // 완료된 것 먼저, 그 다음 진행률, 희귀도 순
        if (a.unlockedAt && !b.unlockedAt) return -1;
        if (!a.unlockedAt && b.unlockedAt) return 1;
        if ((a.progress || 0) !== (b.progress || 0)) {
          return (b.progress || 0) - (a.progress || 0);
        }
        return this.getRarityOrder(a.rarity) - this.getRarityOrder(b.rarity);
      });
  }

  // 카테고리별 업적 조회
  getByCategory(category: AchievementCategory): Achievement[] {
    return this.getAllAchievements().filter((a) => a.category === category);
  }

  // 획득한 업적 조회
  getUnlocked(): Achievement[] {
    return Array.from(this.achievements.values())
      .filter((a) => a.unlockedAt)
      .sort((a, b) => {
        return (b.unlockedAt?.getTime() || 0) - (a.unlockedAt?.getTime() || 0);
      });
  }

  // 미획득 업적 조회
  getLocked(): Achievement[] {
    return Array.from(this.achievements.values())
      .filter((a) => !a.unlockedAt && !a.hidden)
      .sort((a, b) => (b.progress || 0) - (a.progress || 0));
  }

  // 가장 가까운 업적 (거의 달성한)
  getAlmostUnlocked(limit: number = 3): Achievement[] {
    return this.getLocked()
      .filter((a) => (a.progress || 0) > 50)
      .slice(0, limit);
  }

  // 진행 상황 조회
  getProgress(achievementId: string): AchievementProgress | undefined {
    return this.progress.get(achievementId);
  }

  // 총 XP 계산
  getTotalXP(): number {
    return this.getUnlocked().reduce((total, a) => total + a.xpReward, 0);
  }

  // 통계
  getStats(): {
    total: number;
    unlocked: number;
    locked: number;
    percentage: number;
    byRarity: Record<AchievementRarity, { total: number; unlocked: number }>;
    totalXP: number;
  } {
    const all = this.getAllAchievements(true);
    const unlocked = this.getUnlocked();

    const byRarity: Record<AchievementRarity, { total: number; unlocked: number }> = {
      common: { total: 0, unlocked: 0 },
      uncommon: { total: 0, unlocked: 0 },
      rare: { total: 0, unlocked: 0 },
      epic: { total: 0, unlocked: 0 },
      legendary: { total: 0, unlocked: 0 },
    };

    all.forEach((a) => {
      byRarity[a.rarity].total++;
      if (a.unlockedAt) {
        byRarity[a.rarity].unlocked++;
      }
    });

    return {
      total: all.length,
      unlocked: unlocked.length,
      locked: all.length - unlocked.length,
      percentage: Math.round((unlocked.length / all.length) * 100),
      byRarity,
      totalXP: this.getTotalXP(),
    };
  }

  // 희귀도 순서
  private getRarityOrder(rarity: AchievementRarity): number {
    const order = { common: 0, uncommon: 1, rare: 2, epic: 3, legendary: 4 };
    return order[rarity];
  }

  // 희귀도 색상
  static getRarityColor(rarity: AchievementRarity): string {
    const colors = {
      common: '#9ca3af',    // gray
      uncommon: '#22c55e',  // green
      rare: '#3b82f6',      // blue
      epic: '#a855f7',      // purple
      legendary: '#f59e0b', // gold
    };
    return colors[rarity];
  }

  // 희귀도 이름
  static getRarityName(rarity: AchievementRarity): string {
    const names = {
      common: '일반',
      uncommon: '고급',
      rare: '희귀',
      epic: '영웅',
      legendary: '전설',
    };
    return names[rarity];
  }

  // 진행 상황 저장
  private async saveProgress(): Promise<void> {
    try {
      const key = `moodpal_achievements_${this.userId}`;
      const data: Record<string, any> = {
        progress: Object.fromEntries(this.progress),
        achievements: Array.from(this.achievements.entries()).map(([id, a]) => ({
          id,
          unlockedAt: a.unlockedAt?.toISOString(),
          progress: a.progress,
        })),
      };
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('[AchievementSystem] Failed to save:', error);
    }
  }

  // 진행 상황 로드
  private async loadProgress(): Promise<void> {
    try {
      const key = `moodpal_achievements_${this.userId}`;
      const saved = localStorage.getItem(key);

      if (saved) {
        const data = JSON.parse(saved);

        // 진행 상황 복원
        if (data.progress) {
          Object.entries(data.progress).forEach(([id, progress]) => {
            this.progress.set(id, progress as AchievementProgress);
          });
        }

        // 업적 상태 복원
        if (data.achievements) {
          data.achievements.forEach((saved: any) => {
            const achievement = this.achievements.get(saved.id);
            if (achievement) {
              if (saved.unlockedAt) {
                achievement.unlockedAt = new Date(saved.unlockedAt);
              }
              if (saved.progress) {
                achievement.progress = saved.progress;
              }
            }
          });
        }
      }
    } catch (error) {
      console.error('[AchievementSystem] Failed to load:', error);
    }
  }

  // 이벤트 핸들러
  setOnAchievementUnlocked(handler: (achievement: Achievement) => void): void {
    this.onAchievementUnlocked = handler;
  }
}

// 싱글톤 인스턴스
let achievementSystemInstance: AchievementSystem | null = null;

export function getAchievementSystem(userId: string): AchievementSystem {
  if (!achievementSystemInstance || (achievementSystemInstance as any).userId !== userId) {
    achievementSystemInstance = new AchievementSystem(userId);
  }
  return achievementSystemInstance;
}

// 헬퍼 함수
export function formatAchievementProgress(achievement: Achievement): string {
  if (achievement.unlockedAt) {
    return '달성 완료!';
  }
  return `${achievement.progress || 0}%`;
}
