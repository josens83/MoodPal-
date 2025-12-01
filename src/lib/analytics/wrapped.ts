/**
 * MoodPal Wrapped (연간 회고)
 * Spotify Wrapped 벤치마킹 기반 연간 감정 여정 시각화
 */

import { MoodEntry } from './insight-engine';

// Wrapped 슬라이드 타입
export type WrappedSlideType =
  | 'intro'             // 시작 인트로
  | 'total_days'        // 총 기록 일수
  | 'total_entries'     // 총 기록 수
  | 'streak_best'       // 최고 스트릭
  | 'emotion_top'       // 가장 많이 느낀 감정
  | 'emotion_journey'   // 감정 여정
  | 'best_month'        // 가장 좋았던 달
  | 'growth_moment'     // 성장의 순간
  | 'meditation_stats'  // 명상 통계
  | 'cbt_stats'         // CBT 통계
  | 'insight_key'       // 핵심 인사이트
  | 'personality'       // 마음 챙김 성격
  | 'highlight'         // 하이라이트
  | 'achievement'       // 업적 요약
  | 'message'           // 따뜻한 메시지
  | 'share';            // 공유하기

// Wrapped 슬라이드
export interface WrappedSlide {
  type: WrappedSlideType;
  title: string;
  subtitle?: string;
  mainContent: string | number;
  description: string;
  visualData?: Record<string, any>;
  animation?: string;
  backgroundColor?: string;
  accentColor?: string;
}

// Wrapped 데이터
export interface WrappedData {
  year: number;
  slides: WrappedSlide[];
  summary: WrappedSummary;
  shareableCards: ShareableCard[];
  createdAt: Date;
}

// Wrapped 요약
export interface WrappedSummary {
  // 기본 통계
  totalDays: number;
  totalEntries: number;
  longestStreak: number;
  avgMood: number;
  moodVariance: number;

  // 감정 분석
  topEmotions: Array<{ emotion: string; count: number; percentage: number }>;
  emotionJourney: Array<{ month: number; avgMood: number; topEmotion: string }>;
  emotionVariety: number;

  // 시간 패턴
  mostActiveMonth: { month: number; entries: number };
  bestMonth: { month: number; avgMood: number };
  worstMonth: { month: number; avgMood: number };
  mostActiveDay: string;
  mostActiveTime: string;

  // 활동
  totalMeditationMinutes: number;
  totalMeditationSessions: number;
  totalJournalEntries: number;
  totalCBTSessions: number;

  // 성장
  biggestImprovement: { from: number; to: number; month: number };
  achievementCount: number;
  xpEarned: number;
  levelReached: number;

  // 인사이트
  significantPatterns: string[];
  topCopingStrategies: string[];
  personalityType: string;
  growthAreas: string[];
}

// 공유 가능한 카드
export interface ShareableCard {
  id: string;
  type: string;
  imageUrl?: string;
  title: string;
  content: string;
  theme: 'light' | 'dark' | 'gradient';
}

// Wrapped 생성기 클래스
export class WrappedGenerator {
  private entries: MoodEntry[] = [];
  private year: number;
  private additionalData: {
    meditationMinutes?: number;
    meditationSessions?: number;
    journalEntries?: number;
    cbtSessions?: number;
    achievements?: number;
    xp?: number;
    level?: number;
  } = {};

  constructor(year: number) {
    this.year = year;
  }

  // 데이터 설정
  setEntries(entries: MoodEntry[]): void {
    this.entries = entries.filter((e) => {
      const entryYear = new Date(e.timestamp).getFullYear();
      return entryYear === this.year;
    });
  }

  setAdditionalData(data: typeof this.additionalData): void {
    this.additionalData = data;
  }

  // Wrapped 생성
  generate(): WrappedData {
    const summary = this.generateSummary();
    const slides = this.generateSlides(summary);
    const shareableCards = this.generateShareableCards(summary);

    return {
      year: this.year,
      slides,
      summary,
      shareableCards,
      createdAt: new Date(),
    };
  }

  // 요약 생성
  private generateSummary(): WrappedSummary {
    // 기본 통계
    const totalEntries = this.entries.length;
    const uniqueDays = new Set(
      this.entries.map((e) => new Date(e.timestamp).toISOString().split('T')[0])
    ).size;

    const moods = this.entries.map((e) => e.mood);
    const avgMood = moods.length > 0 ? moods.reduce((a, b) => a + b, 0) / moods.length : 0;
    const moodVariance = this.calculateVariance(moods);

    // 감정 분석
    const emotionCounts: Record<string, number> = {};
    this.entries.forEach((e) => {
      e.emotions.forEach((emotion) => {
        emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
      });
    });

    const totalEmotions = Object.values(emotionCounts).reduce((a, b) => a + b, 0);
    const topEmotions = Object.entries(emotionCounts)
      .map(([emotion, count]) => ({
        emotion,
        count,
        percentage: Math.round((count / totalEmotions) * 100),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // 월별 분석
    const monthlyData = this.getMonthlyData();
    const emotionJourney = monthlyData.map((m) => ({
      month: m.month,
      avgMood: m.avgMood,
      topEmotion: m.topEmotion,
    }));

    const mostActiveMonth = monthlyData.reduce(
      (max, m) => (m.entries > max.entries ? m : max),
      { month: 1, entries: 0, avgMood: 0, topEmotion: '' }
    );

    const bestMonth = monthlyData.reduce(
      (max, m) => (m.avgMood > max.avgMood ? m : max),
      { month: 1, entries: 0, avgMood: 0, topEmotion: '' }
    );

    const worstMonth = monthlyData.reduce(
      (min, m) => (m.avgMood < min.avgMood && m.entries > 0 ? m : min),
      { month: 1, entries: 0, avgMood: 5, topEmotion: '' }
    );

    // 최대 성장
    let biggestImprovement = { from: 0, to: 0, month: 0 };
    for (let i = 1; i < monthlyData.length; i++) {
      const improvement = monthlyData[i].avgMood - monthlyData[i - 1].avgMood;
      if (improvement > biggestImprovement.to - biggestImprovement.from) {
        biggestImprovement = {
          from: monthlyData[i - 1].avgMood,
          to: monthlyData[i].avgMood,
          month: monthlyData[i].month,
        };
      }
    }

    // 요일/시간 패턴
    const dayPattern = this.getDayPattern();
    const timePattern = this.getTimePattern();

    const mostActiveDay = Object.entries(dayPattern).reduce(
      (max, [day, count]) => (count > max[1] ? [day, count] : max),
      ['', 0]
    )[0];

    const mostActiveTime = Object.entries(timePattern).reduce(
      (max, [time, count]) => (count > max[1] ? [time, count] : max),
      ['', 0]
    )[0];

    // 스트릭
    const longestStreak = this.calculateLongestStreak();

    // 성격 유형
    const personalityType = this.determinePersonalityType(avgMood, topEmotions, uniqueDays);

    return {
      totalDays: uniqueDays,
      totalEntries,
      longestStreak,
      avgMood,
      moodVariance,
      topEmotions,
      emotionJourney,
      emotionVariety: Object.keys(emotionCounts).length,
      mostActiveMonth: { month: mostActiveMonth.month, entries: mostActiveMonth.entries },
      bestMonth: { month: bestMonth.month, avgMood: bestMonth.avgMood },
      worstMonth: { month: worstMonth.month, avgMood: worstMonth.avgMood },
      mostActiveDay,
      mostActiveTime,
      totalMeditationMinutes: this.additionalData.meditationMinutes || 0,
      totalMeditationSessions: this.additionalData.meditationSessions || 0,
      totalJournalEntries: this.additionalData.journalEntries || 0,
      totalCBTSessions: this.additionalData.cbtSessions || 0,
      biggestImprovement,
      achievementCount: this.additionalData.achievements || 0,
      xpEarned: this.additionalData.xp || 0,
      levelReached: this.additionalData.level || 1,
      significantPatterns: this.findSignificantPatterns(),
      topCopingStrategies: this.findTopCopingStrategies(),
      personalityType,
      growthAreas: this.identifyGrowthAreas(avgMood, topEmotions),
    };
  }

  // 슬라이드 생성
  private generateSlides(summary: WrappedSummary): WrappedSlide[] {
    const slides: WrappedSlide[] = [];

    // 1. 인트로
    slides.push({
      type: 'intro',
      title: `${this.year}년`,
      subtitle: '당신의 마음 여정',
      mainContent: '함께한 한 해',
      description: '올해 당신의 감정 여정을 돌아봐요.',
      backgroundColor: '#1a1a2e',
      accentColor: '#eab308',
      animation: 'fadeIn',
    });

    // 2. 총 기록 일수
    slides.push({
      type: 'total_days',
      title: '함께한 날들',
      mainContent: summary.totalDays,
      description: `${this.year}년에 ${summary.totalDays}일 동안 마음을 돌봤어요.`,
      visualData: { type: 'counter' },
      backgroundColor: '#16213e',
      accentColor: '#e94560',
      animation: 'countUp',
    });

    // 3. 총 기록 수
    slides.push({
      type: 'total_entries',
      title: '기분 기록',
      mainContent: summary.totalEntries,
      description: `총 ${summary.totalEntries}번의 감정을 기록했어요.`,
      visualData: { entries: summary.totalEntries },
      backgroundColor: '#0f3460',
      accentColor: '#00fff5',
      animation: 'popIn',
    });

    // 4. 최고 스트릭
    if (summary.longestStreak > 0) {
      slides.push({
        type: 'streak_best',
        title: '최고 기록',
        mainContent: `${summary.longestStreak}일`,
        description: '연속으로 기분을 기록한 최고 기록이에요!',
        visualData: { streak: summary.longestStreak },
        backgroundColor: '#ff6b35',
        accentColor: '#f7c59f',
        animation: 'fireEffect',
      });
    }

    // 5. 가장 많이 느낀 감정
    if (summary.topEmotions.length > 0) {
      slides.push({
        type: 'emotion_top',
        title: '나의 감정 TOP 5',
        mainContent: summary.topEmotions[0].emotion,
        description: `'${summary.topEmotions[0].emotion}'을(를) 가장 많이 느꼈어요.`,
        visualData: { emotions: summary.topEmotions },
        backgroundColor: '#5c4d7d',
        accentColor: '#c2b0c9',
        animation: 'slideUp',
      });
    }

    // 6. 감정 여정
    slides.push({
      type: 'emotion_journey',
      title: '감정의 흐름',
      mainContent: '1년간의 여정',
      description: '월별로 당신의 감정이 어떻게 변했는지 봐요.',
      visualData: { journey: summary.emotionJourney },
      backgroundColor: '#2d4059',
      accentColor: '#ea5455',
      animation: 'waveEffect',
    });

    // 7. 가장 좋았던 달
    const monthNames = ['', '1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
    slides.push({
      type: 'best_month',
      title: '가장 빛나던 시기',
      mainContent: monthNames[summary.bestMonth.month],
      description: `${monthNames[summary.bestMonth.month]}이 가장 기분 좋은 달이었어요.`,
      visualData: { month: summary.bestMonth },
      backgroundColor: '#40514e',
      accentColor: '#11d3bc',
      animation: 'sparkle',
    });

    // 8. 성장의 순간
    if (summary.biggestImprovement.to - summary.biggestImprovement.from > 0.3) {
      slides.push({
        type: 'growth_moment',
        title: '성장의 순간',
        mainContent: `+${Math.round((summary.biggestImprovement.to - summary.biggestImprovement.from) * 20)}%`,
        description: `${monthNames[summary.biggestImprovement.month]}에 기분이 크게 좋아졌어요!`,
        visualData: { improvement: summary.biggestImprovement },
        backgroundColor: '#2e7d32',
        accentColor: '#c8e6c9',
        animation: 'growUp',
      });
    }

    // 9. 명상 통계
    if (summary.totalMeditationMinutes > 0) {
      slides.push({
        type: 'meditation_stats',
        title: '마음의 고요',
        mainContent: `${summary.totalMeditationMinutes}분`,
        description: `${summary.totalMeditationSessions}번의 명상으로 마음을 다스렸어요.`,
        visualData: {
          minutes: summary.totalMeditationMinutes,
          sessions: summary.totalMeditationSessions,
        },
        backgroundColor: '#1a237e',
        accentColor: '#7986cb',
        animation: 'breathe',
      });
    }

    // 10. 마음 챙김 성격
    slides.push({
      type: 'personality',
      title: '당신의 마음 챙김 스타일',
      mainContent: summary.personalityType,
      description: this.getPersonalityDescription(summary.personalityType),
      visualData: { type: summary.personalityType },
      backgroundColor: '#4a148c',
      accentColor: '#ce93d8',
      animation: 'reveal',
    });

    // 11. 업적
    if (summary.achievementCount > 0) {
      slides.push({
        type: 'achievement',
        title: '올해의 성취',
        mainContent: `${summary.achievementCount}개`,
        description: `${summary.xpEarned.toLocaleString()} XP를 획득하고 레벨 ${summary.levelReached}에 도달했어요!`,
        visualData: {
          achievements: summary.achievementCount,
          xp: summary.xpEarned,
          level: summary.levelReached,
        },
        backgroundColor: '#ff8f00',
        accentColor: '#ffe082',
        animation: 'trophy',
      });
    }

    // 12. 메시지
    slides.push({
      type: 'message',
      title: '수고했어요',
      mainContent: '💙',
      description: this.generatePersonalMessage(summary),
      backgroundColor: '#1a1a2e',
      accentColor: '#eab308',
      animation: 'heartbeat',
    });

    // 13. 공유
    slides.push({
      type: 'share',
      title: '나의 Wrapped 공유하기',
      mainContent: `#MoodPal${this.year}`,
      description: '친구들과 함께 나누어보세요!',
      visualData: { year: this.year },
      backgroundColor: '#0d0d0d',
      accentColor: '#ffffff',
      animation: 'fadeIn',
    });

    return slides;
  }

  // 공유 카드 생성
  private generateShareableCards(summary: WrappedSummary): ShareableCard[] {
    return [
      {
        id: 'card_total',
        type: 'total',
        title: `${this.year}년 MoodPal`,
        content: `${summary.totalDays}일 동안 ${summary.totalEntries}번 기분을 기록했어요.`,
        theme: 'gradient',
      },
      {
        id: 'card_emotion',
        type: 'emotion',
        title: '올해 나의 감정',
        content: summary.topEmotions.map((e) => e.emotion).join(', '),
        theme: 'dark',
      },
      {
        id: 'card_streak',
        type: 'streak',
        title: '최고 스트릭',
        content: `${summary.longestStreak}일 연속 기록!`,
        theme: 'light',
      },
      {
        id: 'card_personality',
        type: 'personality',
        title: '마음 챙김 성격',
        content: summary.personalityType,
        theme: 'gradient',
      },
    ];
  }

  // 월별 데이터
  private getMonthlyData(): Array<{
    month: number;
    entries: number;
    avgMood: number;
    topEmotion: string;
  }> {
    const monthly: Record<number, { moods: number[]; emotions: Record<string, number> }> = {};

    for (let i = 1; i <= 12; i++) {
      monthly[i] = { moods: [], emotions: {} };
    }

    this.entries.forEach((e) => {
      const month = new Date(e.timestamp).getMonth() + 1;
      monthly[month].moods.push(e.mood);
      e.emotions.forEach((emotion) => {
        monthly[month].emotions[emotion] = (monthly[month].emotions[emotion] || 0) + 1;
      });
    });

    return Object.entries(monthly).map(([month, data]) => {
      const topEmotion = Object.entries(data.emotions).sort((a, b) => b[1] - a[1])[0]?.[0] || '';
      return {
        month: parseInt(month),
        entries: data.moods.length,
        avgMood: data.moods.length > 0 ? data.moods.reduce((a, b) => a + b, 0) / data.moods.length : 0,
        topEmotion,
      };
    });
  }

  // 요일 패턴
  private getDayPattern(): Record<string, number> {
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const pattern: Record<string, number> = {};
    days.forEach((d) => (pattern[d] = 0));

    this.entries.forEach((e) => {
      const day = days[new Date(e.timestamp).getDay()];
      pattern[day]++;
    });

    return pattern;
  }

  // 시간 패턴
  private getTimePattern(): Record<string, number> {
    const pattern: Record<string, number> = {
      '아침 (5-12시)': 0,
      '오후 (12-17시)': 0,
      '저녁 (17-21시)': 0,
      '밤 (21-5시)': 0,
    };

    this.entries.forEach((e) => {
      const hour = new Date(e.timestamp).getHours();
      if (hour >= 5 && hour < 12) pattern['아침 (5-12시)']++;
      else if (hour >= 12 && hour < 17) pattern['오후 (12-17시)']++;
      else if (hour >= 17 && hour < 21) pattern['저녁 (17-21시)']++;
      else pattern['밤 (21-5시)']++;
    });

    return pattern;
  }

  // 최장 스트릭 계산
  private calculateLongestStreak(): number {
    const dates = [...new Set(
      this.entries.map((e) => new Date(e.timestamp).toISOString().split('T')[0])
    )].sort();

    let maxStreak = 0;
    let currentStreak = 0;

    for (let i = 0; i < dates.length; i++) {
      if (i === 0) {
        currentStreak = 1;
      } else {
        const prev = new Date(dates[i - 1]);
        const curr = new Date(dates[i]);
        const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);

        if (diff === 1) {
          currentStreak++;
        } else {
          maxStreak = Math.max(maxStreak, currentStreak);
          currentStreak = 1;
        }
      }
      maxStreak = Math.max(maxStreak, currentStreak);
    }

    return maxStreak;
  }

  // 분산 계산
  private calculateVariance(values: number[]): number {
    if (values.length === 0) return 0;
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    return values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  }

  // 성격 유형 결정
  private determinePersonalityType(
    avgMood: number,
    topEmotions: Array<{ emotion: string }>,
    activeDays: number
  ): string {
    const topEmotion = topEmotions[0]?.emotion || '';

    if (activeDays > 200) {
      return '꾸준한 관찰자';
    }

    if (avgMood > 4) {
      return '긍정의 탐험가';
    }

    if (topEmotion === '감사' || topEmotion === '평온') {
      return '마음의 명상가';
    }

    if (topEmotion === '불안' || topEmotion === '걱정') {
      return '성장하는 전사';
    }

    if (avgMood > 3) {
      return '균형의 수호자';
    }

    return '내면의 탐험가';
  }

  // 성격 설명
  private getPersonalityDescription(type: string): string {
    const descriptions: Record<string, string> = {
      '꾸준한 관찰자': '매일 자신을 돌보는 놀라운 꾸준함을 가졌어요.',
      '긍정의 탐험가': '삶에서 밝은 면을 찾아내는 능력이 있어요.',
      '마음의 명상가': '내면의 평화를 추구하는 차분한 영혼이에요.',
      '성장하는 전사': '어려움 속에서도 성장하려는 용기가 있어요.',
      '균형의 수호자': '감정의 균형을 찾아가는 지혜가 있어요.',
      '내면의 탐험가': '자신을 깊이 이해하려는 여정을 걷고 있어요.',
    };
    return descriptions[type] || '자신만의 방식으로 마음을 챙기고 있어요.';
  }

  // 패턴 발견
  private findSignificantPatterns(): string[] {
    const patterns: string[] = [];

    const dayPattern = this.getDayPattern();
    const maxDay = Object.entries(dayPattern).reduce((a, b) => (b[1] > a[1] ? b : a));
    patterns.push(`${maxDay[0]}요일에 가장 자주 기록`);

    const timePattern = this.getTimePattern();
    const maxTime = Object.entries(timePattern).reduce((a, b) => (b[1] > a[1] ? b : a));
    patterns.push(`${maxTime[0]}에 주로 기록`);

    return patterns;
  }

  // 대처 전략 찾기
  private findTopCopingStrategies(): string[] {
    // 실제로는 데이터에서 추출
    return ['호흡 운동', '산책', '명상'];
  }

  // 성장 영역 식별
  private identifyGrowthAreas(avgMood: number, topEmotions: Array<{ emotion: string }>): string[] {
    const areas: string[] = [];

    if (avgMood < 3.5) {
      areas.push('긍정적 감정 강화');
    }

    const negativeEmotions = ['불안', '우울', '화남', '외로움'];
    topEmotions.forEach((e) => {
      if (negativeEmotions.includes(e.emotion)) {
        areas.push(`${e.emotion} 관리`);
      }
    });

    if (areas.length === 0) {
      areas.push('현재 상태 유지');
    }

    return areas.slice(0, 3);
  }

  // 개인 메시지 생성
  private generatePersonalMessage(summary: WrappedSummary): string {
    if (summary.totalDays > 200) {
      return '놀라운 한 해였어요! 매일 자신을 돌보는 당신이 정말 대단해요. 내년에도 함께해요.';
    }

    if (summary.avgMood > 4) {
      return '밝은 에너지로 한 해를 보냈네요! 그 긍정의 힘을 내년에도 이어가길 바라요.';
    }

    if (summary.longestStreak > 30) {
      return '꾸준함의 힘을 보여줬어요. 그 습관이 당신을 더 강하게 만들었어요.';
    }

    return '감정의 여정을 함께해서 좋았어요. 내년에는 더 밝은 날들이 기다리고 있을 거예요.';
  }
}

// 유틸리티 함수
export function createWrapped(year: number, entries: MoodEntry[]): WrappedData {
  const generator = new WrappedGenerator(year);
  generator.setEntries(entries);
  return generator.generate();
}
