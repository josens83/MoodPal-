/**
 * MoodPal 개인화 엔진
 * Spotify/Netflix 벤치마킹 기반 개인화 추천 시스템
 */

// 사용자 프로필 인터페이스
export interface UserProfile {
  id: string;

  // 기본 정보
  preferences: UserPreferences;

  // 행동 데이터
  behaviorData: BehaviorData;

  // 감정 패턴
  emotionalPatterns: EmotionalPatterns;

  // 사용 패턴
  usagePatterns: UsagePatterns;

  // 콘텐츠 선호도
  contentPreferences: ContentPreferences;

  // 학습된 파라미터
  learnedParams: LearnedParameters;

  // 마지막 업데이트
  lastUpdated: Date;
}

export interface UserPreferences {
  // 대화 스타일
  conversationStyle: 'supportive' | 'solution_focused' | 'balanced';

  // 메시지 길이 선호
  messageLength: 'short' | 'medium' | 'detailed';

  // 이모지 사용
  useEmoji: boolean;

  // 호칭
  preferredName?: string;

  // 언어 수준
  languageFormality: 'casual' | 'polite' | 'formal';

  // 알림 설정
  notificationPreferences: {
    checkInReminders: boolean;
    meditationReminders: boolean;
    insightAlerts: boolean;
    preferredTimes: string[];
  };
}

export interface BehaviorData {
  // 세션 데이터
  totalSessions: number;
  avgSessionDuration: number; // 분
  lastSessionDate: Date;

  // 기능 사용
  featureUsage: {
    chat: number;
    moodTracking: number;
    meditation: number;
    journal: number;
    cbtExercises: number;
    breathing: number;
  };

  // 완료율
  completionRates: {
    moodCheck: number;
    meditation: number;
    cbtSession: number;
    weeklyGoal: number;
  };

  // 이탈 포인트
  dropoffPoints: string[];
}

export interface EmotionalPatterns {
  // 주요 감정 빈도
  emotionFrequency: Record<string, number>;

  // 평균 감정 강도
  avgIntensity: number;

  // 시간대별 감정 패턴
  timeOfDayPatterns: {
    morning: { avgMood: number; commonEmotions: string[] };
    afternoon: { avgMood: number; commonEmotions: string[] };
    evening: { avgMood: number; commonEmotions: string[] };
    night: { avgMood: number; commonEmotions: string[] };
  };

  // 요일별 패턴
  dayOfWeekPatterns: Record<string, { avgMood: number }>;

  // 트리거 패턴
  identifiedTriggers: Array<{
    trigger: string;
    emotion: string;
    frequency: number;
  }>;

  // 효과적인 대처 전략
  effectiveCopingStrategies: Array<{
    strategy: string;
    successRate: number;
    usageCount: number;
  }>;
}

export interface UsagePatterns {
  // 선호 사용 시간
  preferredTimes: string[];

  // 요일별 활성도
  weekdayActivity: Record<string, number>;

  // 연속 사용 (스트릭)
  currentStreak: number;
  longestStreak: number;

  // 세션 패턴
  avgSessionsPerWeek: number;
  peakUsageHour: number;
}

export interface ContentPreferences {
  // 명상 선호
  meditationPreferences: {
    preferredDuration: number; // 분
    preferredTypes: string[];
    favoriteInstructors: string[];
    completedPrograms: string[];
  };

  // CBT 선호
  cbtPreferences: {
    preferredExercises: string[];
    completedModules: string[];
    difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
  };

  // 콘텐츠 상호작용
  contentInteractions: Array<{
    contentId: string;
    type: string;
    rating?: number;
    completed: boolean;
    engagementScore: number;
  }>;
}

export interface LearnedParameters {
  // 응답 효과성
  effectiveResponseTypes: Array<{
    type: string;
    engagementRate: number;
    helpfulnessRating: number;
  }>;

  // 최적 메시지 타이밍
  optimalMessageTiming: {
    responseDelay: number; // ms
    followUpDelay: number; // 시간
  };

  // 개입 효과
  interventionEffectiveness: Record<string, number>;

  // 맞춤 파라미터
  customParams: Record<string, any>;
}

// 개인화 엔진 클래스
export class PersonalizationEngine {
  private profile: UserProfile;

  constructor(userId: string, existingProfile?: Partial<UserProfile>) {
    this.profile = this.initializeProfile(userId, existingProfile);
  }

  // 프로필 초기화
  private initializeProfile(
    userId: string,
    existing?: Partial<UserProfile>
  ): UserProfile {
    const defaultProfile: UserProfile = {
      id: userId,
      preferences: {
        conversationStyle: 'balanced',
        messageLength: 'medium',
        useEmoji: true,
        languageFormality: 'polite',
        notificationPreferences: {
          checkInReminders: true,
          meditationReminders: true,
          insightAlerts: true,
          preferredTimes: ['09:00', '21:00'],
        },
      },
      behaviorData: {
        totalSessions: 0,
        avgSessionDuration: 0,
        lastSessionDate: new Date(),
        featureUsage: {
          chat: 0,
          moodTracking: 0,
          meditation: 0,
          journal: 0,
          cbtExercises: 0,
          breathing: 0,
        },
        completionRates: {
          moodCheck: 0,
          meditation: 0,
          cbtSession: 0,
          weeklyGoal: 0,
        },
        dropoffPoints: [],
      },
      emotionalPatterns: {
        emotionFrequency: {},
        avgIntensity: 5,
        timeOfDayPatterns: {
          morning: { avgMood: 5, commonEmotions: [] },
          afternoon: { avgMood: 5, commonEmotions: [] },
          evening: { avgMood: 5, commonEmotions: [] },
          night: { avgMood: 5, commonEmotions: [] },
        },
        dayOfWeekPatterns: {},
        identifiedTriggers: [],
        effectiveCopingStrategies: [],
      },
      usagePatterns: {
        preferredTimes: [],
        weekdayActivity: {},
        currentStreak: 0,
        longestStreak: 0,
        avgSessionsPerWeek: 0,
        peakUsageHour: 20,
      },
      contentPreferences: {
        meditationPreferences: {
          preferredDuration: 10,
          preferredTypes: [],
          favoriteInstructors: [],
          completedPrograms: [],
        },
        cbtPreferences: {
          preferredExercises: [],
          completedModules: [],
          difficultyLevel: 'beginner',
        },
        contentInteractions: [],
      },
      learnedParams: {
        effectiveResponseTypes: [],
        optimalMessageTiming: {
          responseDelay: 1000,
          followUpDelay: 24,
        },
        interventionEffectiveness: {},
        customParams: {},
      },
      lastUpdated: new Date(),
    };

    return { ...defaultProfile, ...existing } as UserProfile;
  }

  // 이벤트 추적
  trackEvent(event: PersonalizationEvent): void {
    switch (event.type) {
      case 'session_start':
        this.profile.behaviorData.totalSessions++;
        this.profile.behaviorData.lastSessionDate = new Date();
        break;

      case 'feature_use':
        if (event.feature && event.feature in this.profile.behaviorData.featureUsage) {
          this.profile.behaviorData.featureUsage[
            event.feature as keyof typeof this.profile.behaviorData.featureUsage
          ]++;
        }
        break;

      case 'mood_entry':
        this.updateEmotionalPatterns(event.data);
        break;

      case 'content_interaction':
        this.updateContentPreferences(event.data);
        break;

      case 'coping_used':
        this.updateCopingEffectiveness(event.data);
        break;

      case 'response_rating':
        this.updateResponseEffectiveness(event.data);
        break;
    }

    this.profile.lastUpdated = new Date();
  }

  // 감정 패턴 업데이트
  private updateEmotionalPatterns(data: {
    emotion: string;
    intensity: number;
    mood: number;
    timestamp: Date;
  }): void {
    const { emotion, intensity, mood, timestamp } = data;
    const patterns = this.profile.emotionalPatterns;

    // 감정 빈도 업데이트
    patterns.emotionFrequency[emotion] =
      (patterns.emotionFrequency[emotion] || 0) + 1;

    // 평균 강도 업데이트 (이동 평균)
    const alpha = 0.2;
    patterns.avgIntensity = alpha * intensity + (1 - alpha) * patterns.avgIntensity;

    // 시간대별 패턴
    const hour = timestamp.getHours();
    const timeOfDay = this.getTimeOfDay(hour);
    const todPattern = patterns.timeOfDayPatterns[timeOfDay];

    // 이동 평균으로 기분 업데이트
    todPattern.avgMood = alpha * mood + (1 - alpha) * todPattern.avgMood;

    // 일반적인 감정 업데이트
    if (!todPattern.commonEmotions.includes(emotion)) {
      todPattern.commonEmotions.push(emotion);
      if (todPattern.commonEmotions.length > 5) {
        todPattern.commonEmotions.shift();
      }
    }

    // 요일별 패턴
    const dayOfWeek = timestamp.toLocaleDateString('ko-KR', { weekday: 'long' });
    if (!patterns.dayOfWeekPatterns[dayOfWeek]) {
      patterns.dayOfWeekPatterns[dayOfWeek] = { avgMood: mood };
    } else {
      patterns.dayOfWeekPatterns[dayOfWeek].avgMood =
        alpha * mood + (1 - alpha) * patterns.dayOfWeekPatterns[dayOfWeek].avgMood;
    }
  }

  // 콘텐츠 선호도 업데이트
  private updateContentPreferences(data: {
    contentId: string;
    type: string;
    action: 'view' | 'complete' | 'rate' | 'skip';
    rating?: number;
    duration?: number;
  }): void {
    const { contentId, type, action, rating } = data;
    const prefs = this.profile.contentPreferences;

    // 기존 상호작용 찾기
    let interaction = prefs.contentInteractions.find(
      (i) => i.contentId === contentId
    );

    if (!interaction) {
      interaction = {
        contentId,
        type,
        completed: false,
        engagementScore: 0,
      };
      prefs.contentInteractions.push(interaction);
    }

    // 액션에 따른 업데이트
    switch (action) {
      case 'complete':
        interaction.completed = true;
        interaction.engagementScore += 10;
        break;
      case 'rate':
        interaction.rating = rating;
        interaction.engagementScore += rating ? rating * 2 : 0;
        break;
      case 'skip':
        interaction.engagementScore -= 5;
        break;
      case 'view':
        interaction.engagementScore += 1;
        break;
    }

    // 상위 상호작용만 유지
    if (prefs.contentInteractions.length > 100) {
      prefs.contentInteractions.sort(
        (a, b) => b.engagementScore - a.engagementScore
      );
      prefs.contentInteractions = prefs.contentInteractions.slice(0, 50);
    }
  }

  // 대처 전략 효과성 업데이트
  private updateCopingEffectiveness(data: {
    strategy: string;
    moodBefore: number;
    moodAfter: number;
  }): void {
    const { strategy, moodBefore, moodAfter } = data;
    const patterns = this.profile.emotionalPatterns;

    const existing = patterns.effectiveCopingStrategies.find(
      (s) => s.strategy === strategy
    );

    const improvement = moodAfter - moodBefore;
    const success = improvement > 0;

    if (existing) {
      existing.usageCount++;
      existing.successRate =
        (existing.successRate * (existing.usageCount - 1) + (success ? 1 : 0)) /
        existing.usageCount;
    } else {
      patterns.effectiveCopingStrategies.push({
        strategy,
        successRate: success ? 1 : 0,
        usageCount: 1,
      });
    }

    // 성공률로 정렬
    patterns.effectiveCopingStrategies.sort(
      (a, b) => b.successRate - a.successRate
    );
  }

  // 응답 효과성 업데이트
  private updateResponseEffectiveness(data: {
    responseType: string;
    helpful: boolean;
    engagement: number;
  }): void {
    const { responseType, helpful, engagement } = data;
    const params = this.profile.learnedParams;

    const existing = params.effectiveResponseTypes.find(
      (r) => r.type === responseType
    );

    if (existing) {
      const count =
        Math.round(existing.engagementRate * 10) + Math.round(existing.helpfulnessRating * 10);
      existing.engagementRate =
        (existing.engagementRate * count + engagement) / (count + 1);
      existing.helpfulnessRating =
        (existing.helpfulnessRating * count + (helpful ? 1 : 0)) / (count + 1);
    } else {
      params.effectiveResponseTypes.push({
        type: responseType,
        engagementRate: engagement,
        helpfulnessRating: helpful ? 1 : 0,
      });
    }
  }

  // 시간대 결정
  private getTimeOfDay(hour: number): 'morning' | 'afternoon' | 'evening' | 'night' {
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
  }

  // 개인화된 추천 생성
  getRecommendations(): PersonalizedRecommendations {
    const hour = new Date().getHours();
    const timeOfDay = this.getTimeOfDay(hour);
    const patterns = this.profile.emotionalPatterns;
    const contentPrefs = this.profile.contentPreferences;

    // 현재 시간대 기반 예상 감정
    const expectedMood = patterns.timeOfDayPatterns[timeOfDay].avgMood;
    const commonEmotions = patterns.timeOfDayPatterns[timeOfDay].commonEmotions;

    // 추천 콘텐츠 생성
    const recommendations: PersonalizedRecommendations = {
      greeting: this.generatePersonalizedGreeting(timeOfDay, expectedMood),
      suggestedActivities: this.getSuggestedActivities(expectedMood),
      meditationRecommendations: this.getMeditationRecommendations(
        contentPrefs.meditationPreferences
      ),
      copingStrategies: this.getTopCopingStrategies(),
      checkInPrompt: this.getPersonalizedCheckInPrompt(timeOfDay),
      insightOfTheDay: this.generateInsight(),
    };

    return recommendations;
  }

  // 개인화된 인사말
  private generatePersonalizedGreeting(
    timeOfDay: string,
    expectedMood: number
  ): string {
    const name = this.profile.preferences.preferredName || '';
    const namePrefix = name ? `${name}님, ` : '';

    const greetings: Record<string, string[]> = {
      morning: [
        `${namePrefix}좋은 아침이에요! ☀️`,
        `${namePrefix}새로운 하루가 시작됐어요.`,
        `${namePrefix}오늘 하루도 함께해요.`,
      ],
      afternoon: [
        `${namePrefix}오후도 힘내세요!`,
        `${namePrefix}점심 식사는 하셨나요?`,
        `${namePrefix}오늘 오후는 어떠세요?`,
      ],
      evening: [
        `${namePrefix}하루 마무리 잘 하고 계신가요?`,
        `${namePrefix}오늘 하루 수고했어요.`,
        `${namePrefix}저녁 시간이네요, 휴식은 취하셨나요?`,
      ],
      night: [
        `${namePrefix}늦은 밤인데 괜찮으세요?`,
        `${namePrefix}오늘 하루 정말 수고했어요.`,
        `${namePrefix}편안한 밤 되세요.`,
      ],
    };

    const options = greetings[timeOfDay] || greetings.afternoon;

    // 예상 기분이 낮으면 더 따뜻한 인사
    if (expectedMood < 4) {
      return `${namePrefix}오늘 좀 힘드셨을 수도 있겠네요. 괜찮아요, 제가 여기 있을게요.`;
    }

    return options[Math.floor(Math.random() * options.length)];
  }

  // 활동 추천
  private getSuggestedActivities(expectedMood: number): SuggestedActivity[] {
    const activities: SuggestedActivity[] = [];
    const behavior = this.profile.behaviorData;

    // 기분에 따른 활동 추천
    if (expectedMood < 4) {
      activities.push({
        type: 'breathing',
        title: '호흡 운동',
        description: '잠시 멈추고 깊게 호흡해보세요',
        duration: 5,
        priority: 'high',
      });

      if (behavior.featureUsage.meditation > 0) {
        activities.push({
          type: 'meditation',
          title: '마음 챙김 명상',
          description: '잠시 마음을 가라앉혀보세요',
          duration: 10,
          priority: 'medium',
        });
      }
    }

    // 기분 기록 권장 (오늘 안 했으면)
    activities.push({
      type: 'mood_check',
      title: '오늘의 기분 체크',
      description: '지금 이 순간 어떤 감정인지 기록해보세요',
      duration: 2,
      priority: expectedMood < 4 ? 'high' : 'medium',
    });

    // CBT 연습 (사용 이력이 있으면)
    if (behavior.featureUsage.cbtExercises > 0) {
      activities.push({
        type: 'cbt',
        title: 'CBT 연습',
        description: '생각 패턴을 점검해보세요',
        duration: 15,
        priority: 'low',
      });
    }

    return activities.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  // 명상 추천
  private getMeditationRecommendations(
    prefs: ContentPreferences['meditationPreferences']
  ): MeditationRecommendation[] {
    const recommendations: MeditationRecommendation[] = [];

    // 선호 유형 기반
    if (prefs.preferredTypes.length > 0) {
      recommendations.push({
        type: prefs.preferredTypes[0],
        title: `${prefs.preferredTypes[0]} 명상`,
        duration: prefs.preferredDuration,
        reason: '가장 많이 사용하신 유형이에요',
      });
    }

    // 기본 추천
    recommendations.push({
      type: 'sleep',
      title: '수면 명상',
      duration: 15,
      reason: '편안한 밤을 위한 추천',
    });

    recommendations.push({
      type: 'anxiety',
      title: '불안 완화 명상',
      duration: 10,
      reason: '마음을 진정시키는 명상',
    });

    return recommendations.slice(0, 3);
  }

  // 효과적인 대처 전략 추천
  private getTopCopingStrategies(): string[] {
    const strategies = this.profile.emotionalPatterns.effectiveCopingStrategies;

    if (strategies.length === 0) {
      return [
        '심호흡하기',
        '산책하기',
        '따뜻한 차 마시기',
        '좋아하는 음악 듣기',
      ];
    }

    return strategies
      .filter((s) => s.successRate > 0.5)
      .slice(0, 4)
      .map((s) => s.strategy);
  }

  // 개인화된 체크인 프롬프트
  private getPersonalizedCheckInPrompt(timeOfDay: string): string {
    const prompts: Record<string, string[]> = {
      morning: [
        '오늘은 어떤 마음으로 시작하셨나요?',
        '밤새 잘 주무셨나요?',
        '오늘 하루 어떤 것이 기대되시나요?',
      ],
      afternoon: [
        '오전은 어떻게 보내셨나요?',
        '지금 이 순간 어떤 생각이 드세요?',
        '오늘 가장 좋았던 순간은 언제였나요?',
      ],
      evening: [
        '오늘 하루 어떠셨어요?',
        '오늘 가장 감사한 것은 무엇인가요?',
        '내일은 어떤 하루가 되면 좋겠어요?',
      ],
      night: [
        '오늘 하루를 돌아보면 어땠나요?',
        '지금 마음은 어떠세요?',
        '편안하게 잠들 준비가 되셨나요?',
      ],
    };

    const options = prompts[timeOfDay] || prompts.afternoon;
    return options[Math.floor(Math.random() * options.length)];
  }

  // 인사이트 생성
  private generateInsight(): string {
    const patterns = this.profile.emotionalPatterns;
    const usage = this.profile.usagePatterns;

    // 스트릭 관련
    if (usage.currentStreak >= 7) {
      return `벌써 ${usage.currentStreak}일 연속으로 함께하고 있어요! 꾸준함이 변화를 만들어요.`;
    }

    // 감정 패턴 관련
    const topEmotion = Object.entries(patterns.emotionFrequency).sort(
      (a, b) => b[1] - a[1]
    )[0];

    if (topEmotion) {
      return `최근 '${topEmotion[0]}'이라는 감정을 자주 느끼셨네요. 이 감정에 대해 더 탐색해볼까요?`;
    }

    // 기본 인사이트
    return '자신의 감정을 알아차리는 것, 그 자체가 변화의 시작이에요.';
  }

  // 프로필 조회
  getProfile(): UserProfile {
    return this.profile;
  }

  // 프로필 저장 (직렬화)
  exportProfile(): string {
    return JSON.stringify(this.profile);
  }

  // 프로필 로드 (역직렬화)
  static importProfile(data: string): PersonalizationEngine {
    const profile = JSON.parse(data) as UserProfile;
    return new PersonalizationEngine(profile.id, profile);
  }
}

// 이벤트 타입
export interface PersonalizationEvent {
  type:
    | 'session_start'
    | 'feature_use'
    | 'mood_entry'
    | 'content_interaction'
    | 'coping_used'
    | 'response_rating';
  feature?: string;
  data?: any;
  timestamp?: Date;
}

// 추천 결과
export interface PersonalizedRecommendations {
  greeting: string;
  suggestedActivities: SuggestedActivity[];
  meditationRecommendations: MeditationRecommendation[];
  copingStrategies: string[];
  checkInPrompt: string;
  insightOfTheDay: string;
}

export interface SuggestedActivity {
  type: 'breathing' | 'meditation' | 'mood_check' | 'cbt' | 'journal' | 'exercise';
  title: string;
  description: string;
  duration: number;
  priority: 'high' | 'medium' | 'low';
}

export interface MeditationRecommendation {
  type: string;
  title: string;
  duration: number;
  reason: string;
}

// 유틸리티 함수
export function createPersonalizationEngine(
  userId: string,
  savedProfile?: string
): PersonalizationEngine {
  if (savedProfile) {
    try {
      return PersonalizationEngine.importProfile(savedProfile);
    } catch {
      return new PersonalizationEngine(userId);
    }
  }
  return new PersonalizationEngine(userId);
}
