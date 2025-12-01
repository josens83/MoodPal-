/**
 * MoodPal 게이미피케이션 시스템
 */

// 스트릭 시스템
export {
  StreakSystem,
  getStreakSystem,
  formatStreakDays,
  getStreakEmoji,
  type StreakType,
  type StreakData,
  type StreakReward,
} from './streak-system';

// 업적 시스템
export {
  AchievementSystem,
  getAchievementSystem,
  formatAchievementProgress,
  type Achievement,
  type AchievementCategory,
  type AchievementRarity,
  type AchievementCriteria,
  type AchievementProgress,
} from './achievement-system';

// 레벨 시스템
export {
  LevelSystem,
  LeaderboardSystem,
  getLevelSystem,
  getLeaderboardSystem,
  formatXP,
  getRankColor,
  XP_REWARDS,
  type LevelData,
  type XPEvent,
  type LeaderboardEntry,
  type LeaderboardType,
} from './level-system';
