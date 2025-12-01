/**
 * MoodPal 인사이트 엔진
 * Spotify Wrapped 벤치마킹 기반 감정 분석 및 인사이트
 */

// 기분 데이터
export interface MoodEntry {
  id: string;
  mood: number;          // 1-5
  emotions: string[];
  intensity: number;     // 1-10
  note?: string;
  activities?: string[];
  triggers?: string[];
  timestamp: Date;
  weather?: string;
  sleepQuality?: number;
  energyLevel?: number;
}

// 인사이트 타입
export type InsightType =
  | 'pattern'        // 패턴 발견
  | 'trend'          // 추세 분석
  | 'correlation'    // 상관관계
  | 'achievement'    // 성취
  | 'suggestion'     // 제안
  | 'milestone';     // 마일스톤

// 인사이트
export interface Insight {
  id: string;
  type: InsightType;
  title: string;
  description: string;
  data?: Record<string, any>;
  priority: 'low' | 'medium' | 'high';
  category: string;
  createdAt: Date;
  expiresAt?: Date;
  actionable?: boolean;
  action?: {
    label: string;
    url: string;
  };
}

// 주간 리포트
export interface WeeklyReport {
  weekStart: Date;
  weekEnd: Date;
  summary: {
    avgMood: number;
    moodChange: number;     // 전주 대비 변화
    totalEntries: number;
    streakDays: number;
    dominantEmotion: string;
    bestDay: { day: string; mood: number };
    worstDay: { day: string; mood: number };
  };
  emotionBreakdown: Record<string, number>;
  dayOfWeekPattern: Record<string, number>;
  timeOfDayPattern: Record<string, number>;
  insights: Insight[];
  recommendations: string[];
}

// 월간 리포트
export interface MonthlyReport {
  month: number;
  year: number;
  summary: {
    avgMood: number;
    moodChange: number;
    totalEntries: number;
    longestStreak: number;
    totalMeditationMinutes: number;
    totalJournalEntries: number;
    emotionVariety: number;
  };
  weeklyTrend: Array<{ week: number; avgMood: number }>;
  topEmotions: Array<{ emotion: string; count: number; percentage: number }>;
  topTriggers: Array<{ trigger: string; count: number; impact: 'positive' | 'negative' }>;
  topCopingStrategies: Array<{ strategy: string; successRate: number }>;
  insights: Insight[];
  goals: Array<{ description: string; achieved: boolean }>;
}

// 인사이트 엔진 클래스
export class InsightEngine {
  private entries: MoodEntry[] = [];
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  // 데이터 로드
  setEntries(entries: MoodEntry[]): void {
    this.entries = entries.sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }

  // 인사이트 생성
  generateInsights(): Insight[] {
    const insights: Insight[] = [];

    // 패턴 인사이트
    insights.push(...this.findPatterns());

    // 추세 인사이트
    insights.push(...this.analyzeTrends());

    // 상관관계 인사이트
    insights.push(...this.findCorrelations());

    // 성취 인사이트
    insights.push(...this.checkAchievements());

    // 제안 인사이트
    insights.push(...this.generateSuggestions());

    return insights.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  // 패턴 발견
  private findPatterns(): Insight[] {
    const insights: Insight[] = [];

    // 요일별 패턴
    const dayPattern = this.getDayOfWeekPattern();
    const bestDay = Object.entries(dayPattern).reduce((a, b) =>
      dayPattern[a[0]] > dayPattern[b[0]] ? a : b
    );
    const worstDay = Object.entries(dayPattern).reduce((a, b) =>
      dayPattern[a[0]] < dayPattern[b[0]] ? a : b
    );

    if (dayPattern[bestDay[0]] - dayPattern[worstDay[0]] > 1) {
      insights.push({
        id: `pattern_day_${Date.now()}`,
        type: 'pattern',
        title: '요일별 기분 패턴 발견',
        description: `${bestDay[0]}이 가장 기분 좋은 날이고, ${worstDay[0]}이 가장 힘든 날이에요.`,
        data: { bestDay: bestDay[0], worstDay: worstDay[0], pattern: dayPattern },
        priority: 'medium',
        category: 'weekly_pattern',
        createdAt: new Date(),
      });
    }

    // 시간대별 패턴
    const timePattern = this.getTimeOfDayPattern();
    const bestTime = Object.entries(timePattern).reduce((a, b) =>
      timePattern[a[0]] > timePattern[b[0]] ? a : b
    );

    if (this.entries.length >= 14) {
      insights.push({
        id: `pattern_time_${Date.now()}`,
        type: 'pattern',
        title: '최적의 시간대',
        description: `당신의 기분은 ${bestTime[0]}에 가장 좋은 편이에요.`,
        data: { bestTime: bestTime[0], pattern: timePattern },
        priority: 'low',
        category: 'time_pattern',
        createdAt: new Date(),
      });
    }

    // 감정 반복 패턴
    const emotionPattern = this.getEmotionFrequency();
    const topEmotion = Object.entries(emotionPattern).sort((a, b) => b[1] - a[1])[0];

    if (topEmotion && emotionPattern[topEmotion[0]] > 5) {
      insights.push({
        id: `pattern_emotion_${Date.now()}`,
        type: 'pattern',
        title: '주요 감정 패턴',
        description: `최근 '${topEmotion[0]}' 감정을 자주 느끼고 계세요.`,
        data: { emotion: topEmotion[0], count: topEmotion[1] },
        priority: 'medium',
        category: 'emotion_pattern',
        createdAt: new Date(),
      });
    }

    return insights;
  }

  // 추세 분석
  private analyzeTrends(): Insight[] {
    const insights: Insight[] = [];

    if (this.entries.length < 7) return insights;

    // 최근 7일 vs 이전 7일 비교
    const recent = this.entries.slice(-7);
    const previous = this.entries.slice(-14, -7);

    if (previous.length < 7) return insights;

    const recentAvg = recent.reduce((sum, e) => sum + e.mood, 0) / recent.length;
    const previousAvg = previous.reduce((sum, e) => sum + e.mood, 0) / previous.length;
    const change = recentAvg - previousAvg;

    if (change > 0.5) {
      insights.push({
        id: `trend_improve_${Date.now()}`,
        type: 'trend',
        title: '기분이 좋아지고 있어요!',
        description: `지난주보다 평균 기분이 ${(change * 20).toFixed(0)}% 좋아졌어요.`,
        data: { change, recentAvg, previousAvg },
        priority: 'high',
        category: 'mood_trend',
        createdAt: new Date(),
      });
    } else if (change < -0.5) {
      insights.push({
        id: `trend_decline_${Date.now()}`,
        type: 'trend',
        title: '최근 기분이 조금 힘드시네요',
        description: `지난주보다 기분이 조금 낮아졌어요. 스스로를 돌보는 시간을 가져보세요.`,
        data: { change, recentAvg, previousAvg },
        priority: 'high',
        category: 'mood_trend',
        createdAt: new Date(),
        actionable: true,
        action: { label: '자기 돌봄 활동 보기', url: '/self-care' },
      });
    }

    return insights;
  }

  // 상관관계 발견
  private findCorrelations(): Insight[] {
    const insights: Insight[] = [];

    // 수면과 기분 상관관계
    const entriesWithSleep = this.entries.filter((e) => e.sleepQuality !== undefined);
    if (entriesWithSleep.length >= 7) {
      const correlation = this.calculateCorrelation(
        entriesWithSleep.map((e) => e.sleepQuality!),
        entriesWithSleep.map((e) => e.mood)
      );

      if (Math.abs(correlation) > 0.5) {
        insights.push({
          id: `corr_sleep_${Date.now()}`,
          type: 'correlation',
          title: '수면과 기분의 연결',
          description:
            correlation > 0
              ? '잠을 잘 잘수록 기분이 좋아지는 경향이 있어요.'
              : '수면 패턴이 기분에 영향을 주고 있어요.',
          data: { correlation, type: 'sleep_mood' },
          priority: 'medium',
          category: 'correlation',
          createdAt: new Date(),
        });
      }
    }

    // 활동과 기분 상관관계
    const activityMoodMap: Record<string, { sum: number; count: number }> = {};
    this.entries.forEach((e) => {
      e.activities?.forEach((activity) => {
        if (!activityMoodMap[activity]) {
          activityMoodMap[activity] = { sum: 0, count: 0 };
        }
        activityMoodMap[activity].sum += e.mood;
        activityMoodMap[activity].count++;
      });
    });

    const positiveActivities = Object.entries(activityMoodMap)
      .filter(([_, data]) => data.count >= 3 && data.sum / data.count > 3.5)
      .map(([activity, data]) => ({
        activity,
        avgMood: data.sum / data.count,
      }))
      .sort((a, b) => b.avgMood - a.avgMood);

    if (positiveActivities.length > 0) {
      insights.push({
        id: `corr_activity_${Date.now()}`,
        type: 'correlation',
        title: '기분을 좋게 하는 활동',
        description: `'${positiveActivities[0].activity}'을(를) 할 때 기분이 가장 좋아요.`,
        data: { activities: positiveActivities.slice(0, 3) },
        priority: 'medium',
        category: 'correlation',
        createdAt: new Date(),
      });
    }

    return insights;
  }

  // 성취 확인
  private checkAchievements(): Insight[] {
    const insights: Insight[] = [];

    // 연속 기록 체크
    const streakDays = this.calculateCurrentStreak();
    if (streakDays >= 7 && streakDays % 7 === 0) {
      insights.push({
        id: `achieve_streak_${Date.now()}`,
        type: 'achievement',
        title: `${streakDays}일 연속 기록!`,
        description: '꾸준함이 변화를 만들어요. 정말 대단해요!',
        data: { streakDays },
        priority: 'high',
        category: 'milestone',
        createdAt: new Date(),
      });
    }

    // 총 기록 수 체크
    const totalEntries = this.entries.length;
    const milestones = [10, 25, 50, 100, 250, 500, 1000];
    for (const milestone of milestones) {
      if (totalEntries >= milestone && totalEntries < milestone + 5) {
        insights.push({
          id: `achieve_entries_${Date.now()}`,
          type: 'milestone',
          title: `${milestone}번째 기록 달성!`,
          description: '자신의 감정을 꾸준히 돌보고 계시네요.',
          data: { totalEntries, milestone },
          priority: 'medium',
          category: 'milestone',
          createdAt: new Date(),
        });
        break;
      }
    }

    return insights;
  }

  // 제안 생성
  private generateSuggestions(): Insight[] {
    const insights: Insight[] = [];

    // 기분이 낮을 때 제안
    const recentMoods = this.entries.slice(-3).map((e) => e.mood);
    const avgRecentMood = recentMoods.reduce((a, b) => a + b, 0) / recentMoods.length;

    if (avgRecentMood < 3 && recentMoods.length >= 3) {
      insights.push({
        id: `suggest_care_${Date.now()}`,
        type: 'suggestion',
        title: '자기 돌봄 시간이 필요해요',
        description: '최근 기분이 힘드셨네요. 짧은 명상이나 호흡 운동이 도움될 수 있어요.',
        priority: 'high',
        category: 'wellbeing',
        createdAt: new Date(),
        actionable: true,
        action: { label: '명상 시작하기', url: '/meditation' },
      });
    }

    // 불규칙한 기록 패턴
    if (this.entries.length < 5 && this.entries.length > 0) {
      insights.push({
        id: `suggest_routine_${Date.now()}`,
        type: 'suggestion',
        title: '루틴을 만들어보세요',
        description: '매일 같은 시간에 기분을 기록하면 더 좋은 인사이트를 얻을 수 있어요.',
        priority: 'low',
        category: 'habit',
        createdAt: new Date(),
      });
    }

    return insights;
  }

  // 주간 리포트 생성
  generateWeeklyReport(weekStart: Date): WeeklyReport {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const weekEntries = this.entries.filter((e) => {
      const date = new Date(e.timestamp);
      return date >= weekStart && date < weekEnd;
    });

    const previousWeekStart = new Date(weekStart);
    previousWeekStart.setDate(previousWeekStart.getDate() - 7);
    const previousWeekEntries = this.entries.filter((e) => {
      const date = new Date(e.timestamp);
      return date >= previousWeekStart && date < weekStart;
    });

    const avgMood =
      weekEntries.length > 0
        ? weekEntries.reduce((sum, e) => sum + e.mood, 0) / weekEntries.length
        : 0;

    const prevAvgMood =
      previousWeekEntries.length > 0
        ? previousWeekEntries.reduce((sum, e) => sum + e.mood, 0) / previousWeekEntries.length
        : avgMood;

    // 감정 분포
    const emotionBreakdown: Record<string, number> = {};
    weekEntries.forEach((e) => {
      e.emotions.forEach((emotion) => {
        emotionBreakdown[emotion] = (emotionBreakdown[emotion] || 0) + 1;
      });
    });

    // 요일별 패턴
    const dayOfWeekPattern: Record<string, number> = {};
    const dayOfWeekCounts: Record<string, number> = {};
    const days = ['일', '월', '화', '수', '목', '금', '토'];

    weekEntries.forEach((e) => {
      const day = days[new Date(e.timestamp).getDay()];
      dayOfWeekPattern[day] = (dayOfWeekPattern[day] || 0) + e.mood;
      dayOfWeekCounts[day] = (dayOfWeekCounts[day] || 0) + 1;
    });

    Object.keys(dayOfWeekPattern).forEach((day) => {
      dayOfWeekPattern[day] = dayOfWeekPattern[day] / dayOfWeekCounts[day];
    });

    // 시간대별 패턴
    const timeOfDayPattern: Record<string, number> = {};
    const timeOfDayCounts: Record<string, number> = {};

    weekEntries.forEach((e) => {
      const hour = new Date(e.timestamp).getHours();
      let period: string;
      if (hour >= 5 && hour < 12) period = '아침';
      else if (hour >= 12 && hour < 17) period = '오후';
      else if (hour >= 17 && hour < 21) period = '저녁';
      else period = '밤';

      timeOfDayPattern[period] = (timeOfDayPattern[period] || 0) + e.mood;
      timeOfDayCounts[period] = (timeOfDayCounts[period] || 0) + 1;
    });

    Object.keys(timeOfDayPattern).forEach((period) => {
      timeOfDayPattern[period] = timeOfDayPattern[period] / timeOfDayCounts[period];
    });

    // 가장 좋은/나쁜 날
    const dailyMoods: Record<string, { sum: number; count: number }> = {};
    weekEntries.forEach((e) => {
      const day = new Date(e.timestamp).toISOString().split('T')[0];
      if (!dailyMoods[day]) dailyMoods[day] = { sum: 0, count: 0 };
      dailyMoods[day].sum += e.mood;
      dailyMoods[day].count++;
    });

    const dailyAvgs = Object.entries(dailyMoods).map(([day, data]) => ({
      day,
      mood: data.sum / data.count,
    }));

    const bestDay = dailyAvgs.reduce((a, b) => (a.mood > b.mood ? a : b), { day: '', mood: 0 });
    const worstDay = dailyAvgs.reduce(
      (a, b) => (a.mood < b.mood ? a : b),
      { day: '', mood: 5 }
    );

    // 주요 감정
    const dominantEmotion =
      Object.entries(emotionBreakdown).sort((a, b) => b[1] - a[1])[0]?.[0] || '';

    return {
      weekStart,
      weekEnd,
      summary: {
        avgMood,
        moodChange: avgMood - prevAvgMood,
        totalEntries: weekEntries.length,
        streakDays: this.calculateCurrentStreak(),
        dominantEmotion,
        bestDay: { day: bestDay.day, mood: bestDay.mood },
        worstDay: { day: worstDay.day, mood: worstDay.mood },
      },
      emotionBreakdown,
      dayOfWeekPattern,
      timeOfDayPattern,
      insights: this.generateInsights().slice(0, 5),
      recommendations: this.generateRecommendations(avgMood, emotionBreakdown),
    };
  }

  // 추천 생성
  private generateRecommendations(avgMood: number, emotions: Record<string, number>): string[] {
    const recommendations: string[] = [];

    if (avgMood < 3) {
      recommendations.push('짧은 호흡 운동이나 명상으로 마음을 가라앉혀보세요.');
      recommendations.push('가까운 사람에게 연락해서 이야기를 나눠보세요.');
    } else if (avgMood < 4) {
      recommendations.push('규칙적인 수면과 운동이 기분 개선에 도움이 돼요.');
      recommendations.push('감사 일기를 작성해보세요.');
    } else {
      recommendations.push('좋은 기분을 유지하는 활동들을 계속해보세요.');
      recommendations.push('이 시기를 기억하는 저널을 작성해보세요.');
    }

    if (emotions['불안'] > 3) {
      recommendations.push('불안을 다루는 CBT 연습을 해보세요.');
    }

    return recommendations.slice(0, 3);
  }

  // 상관계수 계산
  private calculateCorrelation(x: number[], y: number[]): number {
    const n = x.length;
    if (n !== y.length || n === 0) return 0;

    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    return denominator === 0 ? 0 : numerator / denominator;
  }

  // 요일별 패턴
  private getDayOfWeekPattern(): Record<string, number> {
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const pattern: Record<string, { sum: number; count: number }> = {};

    this.entries.forEach((e) => {
      const day = days[new Date(e.timestamp).getDay()];
      if (!pattern[day]) pattern[day] = { sum: 0, count: 0 };
      pattern[day].sum += e.mood;
      pattern[day].count++;
    });

    const result: Record<string, number> = {};
    Object.entries(pattern).forEach(([day, data]) => {
      result[day] = data.sum / data.count;
    });

    return result;
  }

  // 시간대별 패턴
  private getTimeOfDayPattern(): Record<string, number> {
    const pattern: Record<string, { sum: number; count: number }> = {};

    this.entries.forEach((e) => {
      const hour = new Date(e.timestamp).getHours();
      let period: string;
      if (hour >= 5 && hour < 12) period = '아침';
      else if (hour >= 12 && hour < 17) period = '오후';
      else if (hour >= 17 && hour < 21) period = '저녁';
      else period = '밤';

      if (!pattern[period]) pattern[period] = { sum: 0, count: 0 };
      pattern[period].sum += e.mood;
      pattern[period].count++;
    });

    const result: Record<string, number> = {};
    Object.entries(pattern).forEach(([period, data]) => {
      result[period] = data.sum / data.count;
    });

    return result;
  }

  // 감정 빈도
  private getEmotionFrequency(): Record<string, number> {
    const frequency: Record<string, number> = {};

    this.entries.forEach((e) => {
      e.emotions.forEach((emotion) => {
        frequency[emotion] = (frequency[emotion] || 0) + 1;
      });
    });

    return frequency;
  }

  // 현재 스트릭 계산
  private calculateCurrentStreak(): number {
    if (this.entries.length === 0) return 0;

    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    const sortedEntries = [...this.entries].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // 오늘 기록이 있는지 확인
    const latestDate = new Date(sortedEntries[0].timestamp).toISOString().split('T')[0];
    if (latestDate !== today) {
      // 어제까지만 스트릭 계산
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      if (latestDate !== yesterday.toISOString().split('T')[0]) {
        return 0;
      }
    }

    const uniqueDates = new Set<string>();
    sortedEntries.forEach((e) => {
      uniqueDates.add(new Date(e.timestamp).toISOString().split('T')[0]);
    });

    const sortedDates = Array.from(uniqueDates).sort().reverse();

    for (let i = 0; i < sortedDates.length; i++) {
      if (i === 0) {
        streak = 1;
      } else {
        const current = new Date(sortedDates[i]);
        const previous = new Date(sortedDates[i - 1]);
        const diff = (previous.getTime() - current.getTime()) / (1000 * 60 * 60 * 24);

        if (diff === 1) {
          streak++;
        } else {
          break;
        }
      }
    }

    return streak;
  }
}

// 싱글톤 인스턴스
let insightEngineInstance: InsightEngine | null = null;

export function getInsightEngine(userId: string): InsightEngine {
  if (!insightEngineInstance) {
    insightEngineInstance = new InsightEngine(userId);
  }
  return insightEngineInstance;
}
