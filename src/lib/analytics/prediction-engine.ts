/**
 * MoodPal 예측 분석 시스템
 * 기분 예측 및 선제적 개입 알고리즘
 */

import { MoodEntry } from './insight-engine';

// 예측 결과
export interface MoodPrediction {
  date: Date;
  predictedMood: number;      // 1-5
  confidence: number;         // 0-1
  predictedEmotions: string[];
  riskLevel: 'low' | 'moderate' | 'high';
  factors: PredictionFactor[];
  recommendations: string[];
}

// 예측 요인
export interface PredictionFactor {
  name: string;
  impact: number;        // -1 ~ 1
  type: 'positive' | 'negative' | 'neutral';
  description: string;
}

// 트렌드 분석
export interface TrendAnalysis {
  shortTerm: {           // 7일
    direction: 'improving' | 'declining' | 'stable';
    change: number;
    confidence: number;
  };
  mediumTerm: {          // 30일
    direction: 'improving' | 'declining' | 'stable';
    change: number;
    confidence: number;
  };
  seasonalPattern?: {
    bestMonth: number;
    worstMonth: number;
    currentSeason: 'peak' | 'low' | 'normal';
  };
}

// 위험 예측
export interface RiskPrediction {
  overallRisk: 'low' | 'moderate' | 'high' | 'critical';
  riskScore: number;     // 0-100
  riskFactors: Array<{
    factor: string;
    severity: number;
    trend: 'increasing' | 'stable' | 'decreasing';
  }>;
  protectiveFactors: string[];
  interventionSuggested: boolean;
  suggestedInterventions: string[];
}

// 예측 엔진 클래스
export class PredictionEngine {
  private entries: MoodEntry[] = [];
  private dayOfWeekWeights: Record<string, number> = {};
  private timeOfDayWeights: Record<string, number> = {};
  private emotionPatterns: Record<string, number[]> = {};

  // 데이터 설정
  setEntries(entries: MoodEntry[]): void {
    this.entries = entries.sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    this.calculateWeights();
  }

  // 가중치 계산
  private calculateWeights(): void {
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const dayMoods: Record<string, number[]> = {};
    const timeMoods: Record<string, number[]> = {};

    this.entries.forEach((e) => {
      const date = new Date(e.timestamp);
      const day = days[date.getDay()];
      const hour = date.getHours();
      let time: string;

      if (hour >= 5 && hour < 12) time = 'morning';
      else if (hour >= 12 && hour < 17) time = 'afternoon';
      else if (hour >= 17 && hour < 21) time = 'evening';
      else time = 'night';

      if (!dayMoods[day]) dayMoods[day] = [];
      dayMoods[day].push(e.mood);

      if (!timeMoods[time]) timeMoods[time] = [];
      timeMoods[time].push(e.mood);

      // 감정 패턴
      e.emotions.forEach((emotion) => {
        if (!this.emotionPatterns[emotion]) this.emotionPatterns[emotion] = [];
        this.emotionPatterns[emotion].push(e.mood);
      });
    });

    // 요일별 평균
    Object.entries(dayMoods).forEach(([day, moods]) => {
      this.dayOfWeekWeights[day] = moods.reduce((a, b) => a + b, 0) / moods.length;
    });

    // 시간대별 평균
    Object.entries(timeMoods).forEach(([time, moods]) => {
      this.timeOfDayWeights[time] = moods.reduce((a, b) => a + b, 0) / moods.length;
    });
  }

  // 기분 예측
  predictMood(targetDate: Date): MoodPrediction {
    const factors: PredictionFactor[] = [];
    let baselineMood = this.calculateBaseline();

    // 요일 영향
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const dayOfWeek = days[targetDate.getDay()];
    const dayWeight = this.dayOfWeekWeights[dayOfWeek] || 3;
    const dayImpact = (dayWeight - 3) / 2;

    factors.push({
      name: '요일 패턴',
      impact: dayImpact,
      type: dayImpact > 0 ? 'positive' : dayImpact < 0 ? 'negative' : 'neutral',
      description: `${dayOfWeek}요일은 평소 기분이 ${dayImpact > 0 ? '좋은' : '힘든'} 편이에요.`,
    });

    // 시간대 영향
    const hour = targetDate.getHours();
    let timeOfDay: string;
    if (hour >= 5 && hour < 12) timeOfDay = 'morning';
    else if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
    else if (hour >= 17 && hour < 21) timeOfDay = 'evening';
    else timeOfDay = 'night';

    const timeWeight = this.timeOfDayWeights[timeOfDay] || 3;
    const timeImpact = (timeWeight - 3) / 2;

    factors.push({
      name: '시간대 패턴',
      impact: timeImpact,
      type: timeImpact > 0 ? 'positive' : timeImpact < 0 ? 'negative' : 'neutral',
      description: `이 시간대는 보통 기분이 ${timeImpact > 0 ? '좋아요' : '좀 힘들어요'}.`,
    });

    // 최근 추세 영향
    const trendAnalysis = this.analyzeTrend();
    const trendImpact = trendAnalysis.shortTerm.change / 2;

    factors.push({
      name: '최근 추세',
      impact: trendImpact,
      type: trendImpact > 0 ? 'positive' : trendImpact < 0 ? 'negative' : 'neutral',
      description: trendAnalysis.shortTerm.direction === 'improving'
        ? '최근 기분이 좋아지는 추세예요.'
        : trendAnalysis.shortTerm.direction === 'declining'
        ? '최근 기분이 조금 힘든 추세예요.'
        : '최근 기분이 안정적이에요.',
    });

    // 최근 감정 상태 영향
    const recentEmotions = this.getRecentDominantEmotions();
    if (recentEmotions.length > 0) {
      const emotionImpact = this.calculateEmotionImpact(recentEmotions);
      factors.push({
        name: '감정 상태',
        impact: emotionImpact,
        type: emotionImpact > 0 ? 'positive' : emotionImpact < 0 ? 'negative' : 'neutral',
        description: `최근 '${recentEmotions[0]}' 감정이 많았어요.`,
      });
    }

    // 총 영향 계산
    const totalImpact = factors.reduce((sum, f) => sum + f.impact, 0);
    let predictedMood = baselineMood + totalImpact;
    predictedMood = Math.max(1, Math.min(5, predictedMood));

    // 신뢰도 계산
    const confidence = this.calculateConfidence();

    // 위험 수준 결정
    const riskLevel = this.determineRiskLevel(predictedMood, factors);

    // 예상 감정
    const predictedEmotions = this.predictEmotions(predictedMood);

    // 추천 생성
    const recommendations = this.generateRecommendations(predictedMood, factors, riskLevel);

    return {
      date: targetDate,
      predictedMood: Math.round(predictedMood * 10) / 10,
      confidence,
      predictedEmotions,
      riskLevel,
      factors,
      recommendations,
    };
  }

  // 기준선 계산
  private calculateBaseline(): number {
    if (this.entries.length === 0) return 3;

    const recentEntries = this.entries.slice(-30);
    return recentEntries.reduce((sum, e) => sum + e.mood, 0) / recentEntries.length;
  }

  // 추세 분석
  analyzeTrend(): TrendAnalysis {
    const shortTermEntries = this.entries.slice(-7);
    const mediumTermEntries = this.entries.slice(-30);
    const previousShortTerm = this.entries.slice(-14, -7);
    const previousMediumTerm = this.entries.slice(-60, -30);

    // 단기 추세
    const shortTermAvg = shortTermEntries.length > 0
      ? shortTermEntries.reduce((sum, e) => sum + e.mood, 0) / shortTermEntries.length
      : 3;
    const prevShortTermAvg = previousShortTerm.length > 0
      ? previousShortTerm.reduce((sum, e) => sum + e.mood, 0) / previousShortTerm.length
      : shortTermAvg;
    const shortTermChange = shortTermAvg - prevShortTermAvg;

    // 중기 추세
    const mediumTermAvg = mediumTermEntries.length > 0
      ? mediumTermEntries.reduce((sum, e) => sum + e.mood, 0) / mediumTermEntries.length
      : 3;
    const prevMediumTermAvg = previousMediumTerm.length > 0
      ? previousMediumTerm.reduce((sum, e) => sum + e.mood, 0) / previousMediumTerm.length
      : mediumTermAvg;
    const mediumTermChange = mediumTermAvg - prevMediumTermAvg;

    // 계절 패턴
    const seasonalPattern = this.analyzeSeasonalPattern();

    return {
      shortTerm: {
        direction: shortTermChange > 0.2 ? 'improving' : shortTermChange < -0.2 ? 'declining' : 'stable',
        change: shortTermChange,
        confidence: Math.min(shortTermEntries.length / 7, 1),
      },
      mediumTerm: {
        direction: mediumTermChange > 0.2 ? 'improving' : mediumTermChange < -0.2 ? 'declining' : 'stable',
        change: mediumTermChange,
        confidence: Math.min(mediumTermEntries.length / 30, 1),
      },
      seasonalPattern,
    };
  }

  // 계절 패턴 분석
  private analyzeSeasonalPattern(): TrendAnalysis['seasonalPattern'] | undefined {
    if (this.entries.length < 90) return undefined;

    const monthlyMoods: Record<number, number[]> = {};
    this.entries.forEach((e) => {
      const month = new Date(e.timestamp).getMonth() + 1;
      if (!monthlyMoods[month]) monthlyMoods[month] = [];
      monthlyMoods[month].push(e.mood);
    });

    const monthlyAvg: Record<number, number> = {};
    Object.entries(monthlyMoods).forEach(([month, moods]) => {
      monthlyAvg[Number(month)] = moods.reduce((a, b) => a + b, 0) / moods.length;
    });

    const months = Object.keys(monthlyAvg).map(Number);
    if (months.length < 3) return undefined;

    const bestMonth = months.reduce((a, b) => monthlyAvg[a] > monthlyAvg[b] ? a : b);
    const worstMonth = months.reduce((a, b) => monthlyAvg[a] < monthlyAvg[b] ? a : b);
    const currentMonth = new Date().getMonth() + 1;
    const avgAll = Object.values(monthlyAvg).reduce((a, b) => a + b, 0) / Object.values(monthlyAvg).length;
    const currentAvg = monthlyAvg[currentMonth] || avgAll;

    let currentSeason: 'peak' | 'low' | 'normal' = 'normal';
    if (currentAvg > avgAll + 0.3) currentSeason = 'peak';
    else if (currentAvg < avgAll - 0.3) currentSeason = 'low';

    return { bestMonth, worstMonth, currentSeason };
  }

  // 위험 예측
  predictRisk(): RiskPrediction {
    const riskFactors: RiskPrediction['riskFactors'] = [];
    const protectiveFactors: string[] = [];
    let riskScore = 0;

    // 최근 기분 상태
    const recentMoods = this.entries.slice(-7).map((e) => e.mood);
    const avgRecentMood = recentMoods.length > 0
      ? recentMoods.reduce((a, b) => a + b, 0) / recentMoods.length
      : 3;

    if (avgRecentMood < 2.5) {
      riskScore += 30;
      riskFactors.push({
        factor: '낮은 기분 수준',
        severity: 3,
        trend: this.getMoodTrend(),
      });
    } else if (avgRecentMood > 3.5) {
      protectiveFactors.push('최근 기분이 좋은 편');
    }

    // 기분 변동성
    const moodVariance = this.calculateVariance(recentMoods);
    if (moodVariance > 1.5) {
      riskScore += 15;
      riskFactors.push({
        factor: '높은 기분 변동성',
        severity: 2,
        trend: 'stable',
      });
    }

    // 부정적 감정 빈도
    const negativeEmotions = ['불안', '우울', '화남', '외로움', '절망'];
    const recentNegative = this.entries.slice(-14).filter((e) =>
      e.emotions.some((em) => negativeEmotions.includes(em))
    );

    if (recentNegative.length > 7) {
      riskScore += 25;
      riskFactors.push({
        factor: '빈번한 부정적 감정',
        severity: 3,
        trend: this.getEmotionTrend(negativeEmotions),
      });
    }

    // 활동 감소
    const recentActivity = this.entries.slice(-7).length;
    const previousActivity = this.entries.slice(-14, -7).length;

    if (recentActivity < previousActivity * 0.5 && previousActivity > 3) {
      riskScore += 20;
      riskFactors.push({
        factor: '활동 감소',
        severity: 2,
        trend: 'increasing',
      });
    }

    // 스트릭 유지
    const streak = this.calculateCurrentStreak();
    if (streak >= 7) {
      protectiveFactors.push(`${streak}일 연속 기록 유지`);
      riskScore -= 10;
    }

    // 긍정적 대처 전략 사용
    const positiveActivities = ['운동', '명상', '산책', '친구만남'];
    const recentPositive = this.entries.slice(-14).filter((e) =>
      e.activities?.some((a) => positiveActivities.includes(a))
    );

    if (recentPositive.length >= 3) {
      protectiveFactors.push('긍정적 대처 전략 활용');
      riskScore -= 10;
    }

    // 점수 정규화
    riskScore = Math.max(0, Math.min(100, riskScore));

    // 위험 수준 결정
    let overallRisk: RiskPrediction['overallRisk'];
    if (riskScore >= 70) overallRisk = 'critical';
    else if (riskScore >= 50) overallRisk = 'high';
    else if (riskScore >= 30) overallRisk = 'moderate';
    else overallRisk = 'low';

    // 개입 제안
    const interventionSuggested = overallRisk === 'high' || overallRisk === 'critical';
    const suggestedInterventions = this.getSuggestedInterventions(overallRisk, riskFactors);

    return {
      overallRisk,
      riskScore,
      riskFactors,
      protectiveFactors,
      interventionSuggested,
      suggestedInterventions,
    };
  }

  // 주간 예측
  predictWeek(): MoodPrediction[] {
    const predictions: MoodPrediction[] = [];
    const today = new Date();

    for (let i = 1; i <= 7; i++) {
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + i);
      predictions.push(this.predictMood(targetDate));
    }

    return predictions;
  }

  // 최적 활동 시간 추천
  recommendOptimalTimes(): Array<{
    activity: string;
    bestTime: string;
    bestDay: string;
    reason: string;
  }> {
    const recommendations = [];

    // 기분 체크 최적 시간
    const timePattern = this.timeOfDayWeights;
    const bestTime = Object.entries(timePattern).reduce(
      (a, b) => (b[1] > a[1] ? b : a),
      ['morning', 0]
    );

    const timeLabels: Record<string, string> = {
      morning: '아침 (5-12시)',
      afternoon: '오후 (12-17시)',
      evening: '저녁 (17-21시)',
      night: '밤 (21시 이후)',
    };

    recommendations.push({
      activity: '기분 체크',
      bestTime: timeLabels[bestTime[0]],
      bestDay: '매일',
      reason: '이 시간에 가장 안정적인 기분 상태를 보여요.',
    });

    // 명상 추천 시간
    const calmestTime = Object.entries(timePattern).reduce(
      (a, b) => (Math.abs(b[1] - 3) < Math.abs(a[1] - 3) ? b : a),
      ['evening', 0]
    );

    recommendations.push({
      activity: '명상',
      bestTime: timeLabels[calmestTime[0]],
      bestDay: '매일',
      reason: '이 시간에 마음이 가장 안정되어 있어요.',
    });

    // CBT 연습 추천
    const dayPattern = this.dayOfWeekWeights;
    const challengingDay = Object.entries(dayPattern).reduce(
      (a, b) => (b[1] < a[1] ? b : a),
      ['월', 5]
    );

    recommendations.push({
      activity: 'CBT 연습',
      bestTime: '아침',
      bestDay: challengingDay[0],
      reason: `${challengingDay[0]}요일이 조금 힘든 편이라 미리 준비하면 좋아요.`,
    });

    return recommendations;
  }

  // 헬퍼 메서드들
  private calculateConfidence(): number {
    const dataPoints = this.entries.length;
    if (dataPoints < 7) return 0.3;
    if (dataPoints < 14) return 0.5;
    if (dataPoints < 30) return 0.7;
    if (dataPoints < 90) return 0.85;
    return 0.95;
  }

  private determineRiskLevel(
    mood: number,
    factors: PredictionFactor[]
  ): 'low' | 'moderate' | 'high' {
    const negativeImpact = factors
      .filter((f) => f.type === 'negative')
      .reduce((sum, f) => sum + Math.abs(f.impact), 0);

    if (mood < 2.5 || negativeImpact > 1) return 'high';
    if (mood < 3 || negativeImpact > 0.5) return 'moderate';
    return 'low';
  }

  private predictEmotions(predictedMood: number): string[] {
    const positiveEmotions = ['평온', '감사', '기쁨', '희망'];
    const neutralEmotions = ['평범', '무난'];
    const negativeEmotions = ['불안', '우울', '스트레스'];

    if (predictedMood >= 4) return positiveEmotions.slice(0, 2);
    if (predictedMood >= 3) return neutralEmotions;
    return negativeEmotions.slice(0, 2);
  }

  private generateRecommendations(
    mood: number,
    factors: PredictionFactor[],
    risk: string
  ): string[] {
    const recommendations: string[] = [];

    if (risk === 'high') {
      recommendations.push('오늘은 자기 돌봄 시간을 꼭 가져보세요.');
      recommendations.push('짧은 호흡 운동이나 명상을 시도해보세요.');
    }

    if (mood < 3) {
      recommendations.push('좋아하는 활동을 미리 계획해두세요.');
      recommendations.push('가까운 사람에게 연락해보는 것도 좋아요.');
    }

    const negativeFactors = factors.filter((f) => f.type === 'negative');
    if (negativeFactors.length > 0) {
      recommendations.push('예상되는 어려움에 대비해 미리 준비해보세요.');
    }

    if (recommendations.length === 0) {
      recommendations.push('오늘도 좋은 하루가 될 것 같아요!');
    }

    return recommendations;
  }

  private getRecentDominantEmotions(): string[] {
    const recent = this.entries.slice(-7);
    const emotionCounts: Record<string, number> = {};

    recent.forEach((e) => {
      e.emotions.forEach((emotion) => {
        emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
      });
    });

    return Object.entries(emotionCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([emotion]) => emotion);
  }

  private calculateEmotionImpact(emotions: string[]): number {
    const positiveEmotions = ['감사', '기쁨', '평온', '희망', '사랑'];
    const negativeEmotions = ['불안', '우울', '화남', '외로움', '스트레스'];

    let impact = 0;
    emotions.forEach((emotion) => {
      if (positiveEmotions.includes(emotion)) impact += 0.2;
      if (negativeEmotions.includes(emotion)) impact -= 0.2;
    });

    return impact;
  }

  private calculateVariance(values: number[]): number {
    if (values.length === 0) return 0;
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    return values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  }

  private getMoodTrend(): 'increasing' | 'stable' | 'decreasing' {
    const recent = this.entries.slice(-7).map((e) => e.mood);
    const previous = this.entries.slice(-14, -7).map((e) => e.mood);

    if (recent.length === 0 || previous.length === 0) return 'stable';

    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const prevAvg = previous.reduce((a, b) => a + b, 0) / previous.length;

    if (recentAvg > prevAvg + 0.3) return 'increasing';
    if (recentAvg < prevAvg - 0.3) return 'decreasing';
    return 'stable';
  }

  private getEmotionTrend(emotions: string[]): 'increasing' | 'stable' | 'decreasing' {
    const recent = this.entries.slice(-7).filter((e) =>
      e.emotions.some((em) => emotions.includes(em))
    ).length;

    const previous = this.entries.slice(-14, -7).filter((e) =>
      e.emotions.some((em) => emotions.includes(em))
    ).length;

    if (recent > previous + 2) return 'increasing';
    if (recent < previous - 2) return 'decreasing';
    return 'stable';
  }

  private calculateCurrentStreak(): number {
    const dates = [...new Set(
      this.entries.map((e) => new Date(e.timestamp).toISOString().split('T')[0])
    )].sort().reverse();

    let streak = 0;
    const today = new Date().toISOString().split('T')[0];

    for (let i = 0; i < dates.length; i++) {
      if (i === 0 && dates[i] !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        if (dates[i] !== yesterday.toISOString().split('T')[0]) break;
      }

      if (i > 0) {
        const current = new Date(dates[i]);
        const prev = new Date(dates[i - 1]);
        const diff = (prev.getTime() - current.getTime()) / (1000 * 60 * 60 * 24);
        if (diff !== 1) break;
      }

      streak++;
    }

    return streak;
  }

  private getSuggestedInterventions(
    risk: RiskPrediction['overallRisk'],
    factors: RiskPrediction['riskFactors']
  ): string[] {
    const interventions: string[] = [];

    if (risk === 'critical') {
      interventions.push('전문 상담사와 상담을 고려해보세요');
      interventions.push('신뢰할 수 있는 사람에게 현재 상태를 공유하세요');
    }

    if (risk === 'high' || risk === 'critical') {
      interventions.push('매일 5분 호흡 운동을 해보세요');
      interventions.push('규칙적인 수면 습관을 유지하세요');
    }

    factors.forEach((f) => {
      if (f.factor === '낮은 기분 수준') {
        interventions.push('즐거웠던 활동을 다시 시작해보세요');
      }
      if (f.factor === '높은 기분 변동성') {
        interventions.push('하루 루틴을 일정하게 유지해보세요');
      }
      if (f.factor === '활동 감소') {
        interventions.push('작은 활동부터 시작해보세요');
      }
    });

    return [...new Set(interventions)].slice(0, 5);
  }
}

// 싱글톤 인스턴스
let predictionEngineInstance: PredictionEngine | null = null;

export function getPredictionEngine(): PredictionEngine {
  if (!predictionEngineInstance) {
    predictionEngineInstance = new PredictionEngine();
  }
  return predictionEngineInstance;
}
