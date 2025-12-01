# MoodPal 엔터프라이즈급 고도화 로드맵

## 벤치마킹 기반 종합 개선 계획

---

## Phase 1: 성능 최적화 (Netflix/Spotify 벤치마킹)

### 1.1 로딩 성능 최적화

**벤치마킹 대상**: Netflix, Spotify의 초기 로드 전략

| 지표 | 현재 추정 | 목표 | 참조 |
|------|----------|------|------|
| FCP | ~2.5s | <1.2s | Netflix: 1.1s |
| LCP | ~3.5s | <2.0s | Spotify: 1.8s |
| TTI | ~4.0s | <2.5s | Calm: 2.3s |

**구현 사항**:

```typescript
// 1. Route-based Code Splitting
// app/(main)/layout.tsx
const ChatPage = dynamic(() => import('./chat/page'), {
  loading: () => <ChatSkeleton />,
  ssr: false
});

// 2. 이미지 최적화 - Spotify 패턴
const optimizedImageConfig = {
  formats: ['avif', 'webp', 'jpeg'],
  sizes: [320, 640, 1024, 1920],
  placeholder: 'blur',
  priority: true // Above-the-fold 이미지
};

// 3. 폰트 최적화 - Netflix 패턴
const fontOptimization = {
  preload: true,
  display: 'swap',
  subsets: ['korean', 'latin'],
  variable: true
};
```

**파일 구조 변경**:
```
src/
├── components/
│   ├── skeletons/           # 스켈레톤 UI 컴포넌트
│   │   ├── ChatSkeleton.tsx
│   │   ├── MoodCardSkeleton.tsx
│   │   └── MeditationSkeleton.tsx
│   └── lazy/                # 동적 임포트 래퍼
│       └── LazyImage.tsx
```

### 1.2 번들 최적화

**벤치마킹 대상**: Spotify의 번들 분할 전략

```javascript
// next.config.ts 개선
const nextConfig = {
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'framer-motion',
      '@radix-ui/react-*'
    ],
  },
  webpack: (config) => {
    config.optimization.splitChunks = {
      chunks: 'all',
      cacheGroups: {
        // 공통 UI 라이브러리
        ui: {
          test: /[\\/]node_modules[\\/](@radix-ui|lucide-react)[\\/]/,
          name: 'ui-vendor',
          priority: 10,
        },
        // AI/채팅 관련
        ai: {
          test: /[\\/]node_modules[\\/](@anthropic|openai)[\\/]/,
          name: 'ai-vendor',
          priority: 10,
        },
        // 명상/오디오 관련
        media: {
          test: /[\\/]node_modules[\\/](howler|tone)[\\/]/,
          name: 'media-vendor',
          priority: 10,
        },
      },
    };
    return config;
  },
};
```

### 1.3 캐싱 전략 (Netflix CDN 패턴)

```typescript
// src/lib/cache.ts
export const cacheStrategies = {
  // 정적 콘텐츠 - 명상 오디오, 이미지
  static: {
    maxAge: 31536000, // 1년
    staleWhileRevalidate: 86400,
  },

  // 동적 콘텐츠 - 사용자 데이터
  dynamic: {
    maxAge: 0,
    staleWhileRevalidate: 60,
    private: true,
  },

  // API 응답
  api: {
    maxAge: 60,
    staleWhileRevalidate: 300,
  },
};

// Service Worker 캐싱 전략 개선
const swCacheStrategy = {
  '/api/mood': 'NetworkFirst',      // 실시간 데이터
  '/api/chat': 'NetworkOnly',       // AI 대화
  '/audio/*': 'CacheFirst',         // 명상 오디오
  '/images/*': 'StaleWhileRevalidate', // 이미지
};
```

---

## Phase 2: AI 대화 고도화 (Woebot/Wysa 벤치마킹)

### 2.1 대화 패턴 개선

**벤치마킹 대상**: Woebot의 CBT 기반 대화 흐름

```typescript
// src/lib/ai/conversation-patterns.ts
export const conversationPatterns = {
  // Woebot 스타일: 구조화된 CBT 세션
  cbtSession: {
    steps: [
      'situationIdentification',  // 상황 파악
      'thoughtRecording',         // 생각 기록
      'emotionLabeling',          // 감정 명명
      'cognitiveDistortion',      // 인지 왜곡 식별
      'reframing',                // 재구성
      'actionPlan'                // 행동 계획
    ],
    transitions: {
      'situationIdentification': {
        prompts: [
          "어떤 상황에서 이런 기분이 들었나요?",
          "최근 며칠 동안 가장 마음이 힘들었던 순간은 언제였나요?"
        ],
        nextCondition: (response) => response.length > 20
      }
    }
  },

  // Wysa 스타일: 감정 중심 대화
  emotionFocused: {
    emotionMap: {
      anxious: ['불안해요', '걱정돼요', '초조해요'],
      sad: ['슬퍼요', '우울해요', '허무해요'],
      angry: ['화나요', '짜증나요', '답답해요'],
    },
    responses: {
      validation: "그런 감정을 느끼는 건 자연스러운 거예요.",
      exploration: "조금 더 이야기해 주실 수 있을까요?",
      coping: "이런 때 도움이 될 수 있는 방법이 있어요."
    }
  }
};
```

### 2.2 위기 감지 시스템 강화

**벤치마킹 대상**: Woebot의 다층적 위기 감지

```typescript
// src/lib/ai/crisis-detection.ts
export const crisisDetectionSystem = {
  // 레벨 1: 키워드 기반 (즉시 감지)
  immediateKeywords: [
    '자살', '죽고 싶', '끝내고 싶', '사라지고 싶',
    '삶이 의미없', '모든게 끝났', '더 이상 못하겠'
  ],

  // 레벨 2: 패턴 기반 (대화 문맥)
  conversationPatterns: {
    hopelessness: {
      indicators: ['희망이 없', '미래가 없', '변하지 않'],
      threshold: 2, // 2개 이상 등장 시
      weight: 0.8
    },
    isolation: {
      indicators: ['혼자', '외로', '아무도 없', '이해 못해'],
      threshold: 3,
      weight: 0.6
    },
    burdensome: {
      indicators: ['짐이 되', '없으면 나을', '미안해', '폐'],
      threshold: 2,
      weight: 0.9
    }
  },

  // 레벨 3: 행동 기반 (장기 추적)
  behavioralIndicators: {
    moodDecline: {
      period: 14, // 14일
      threshold: -2, // 평균 점수 하락
    },
    engagementDrop: {
      period: 7,
      threshold: 0.5, // 50% 감소
    },
    sleepDisruption: {
      period: 7,
      threshold: 3, // 3일 이상 수면 문제
    }
  },

  // 대응 프로토콜
  responseProtocol: {
    level1: {
      action: 'immediate',
      response: 'crisisResourcesKorea',
      notify: true,
      blockNormalChat: true
    },
    level2: {
      action: 'gentle_check',
      response: 'safetyAssessment',
      suggestProfessional: true
    },
    level3: {
      action: 'monitor',
      response: 'copingResources',
      scheduleCheckIn: true
    }
  }
};

// 한국 위기 자원
export const crisisResourcesKorea = {
  hotlines: [
    { name: '자살예방상담전화', number: '1393', available: '24시간' },
    { name: '정신건강위기상담전화', number: '1577-0199', available: '24시간' },
    { name: '생명의전화', number: '1588-9191', available: '24시간' },
  ],
  apps: ['마음이음', '마인드카페'],
  websites: ['정신건강복지센터']
};
```

### 2.3 개인화 AI 모델

**벤치마킹 대상**: Spotify의 개인화 추천 시스템

```typescript
// src/lib/ai/personalization.ts
export const personalizationEngine = {
  // 사용자 프로파일 빌드
  userProfile: {
    // 감정 패턴
    emotionHistory: {
      dominant: 'anxious',
      triggers: ['work', 'relationships'],
      peakTimes: ['morning', 'night'],
      improvementFactors: ['meditation', 'journaling']
    },

    // 선호도
    preferences: {
      communicationStyle: 'supportive', // supportive | direct | analytical
      sessionLength: 'medium',          // short | medium | long
      toolPreference: ['breathing', 'journaling'],
      contentType: ['audio', 'text']
    },

    // 진행 상황
    progress: {
      cbtSkillLevel: 2,
      meditationMinutes: 450,
      consecutiveDays: 12,
      completedPrograms: ['anxiety-basics', 'sleep-improvement']
    }
  },

  // 맞춤형 추천 알고리즘
  recommendationAlgorithm: {
    weights: {
      emotionMatch: 0.3,
      timeOfDay: 0.2,
      historicalSuccess: 0.25,
      progressLevel: 0.15,
      variety: 0.1
    },

    generateRecommendations: (profile, context) => {
      // 시간대별 추천
      // 감정 상태별 추천
      // 진행 상황별 추천
    }
  }
};
```

---

## Phase 3: 오프라인/실시간 동기화 (Notion/Discord 벤치마킹)

### 3.1 오프라인 우선 아키텍처

**벤치마킹 대상**: Notion의 오프라인 동기화

```typescript
// src/lib/offline/sync-engine.ts
import { openDB, IDBPDatabase } from 'idb';

export class OfflineSyncEngine {
  private db: IDBPDatabase;
  private syncQueue: SyncOperation[] = [];

  // IndexedDB 스키마
  async initDB() {
    this.db = await openDB('moodpal-offline', 1, {
      upgrade(db) {
        // 기분 기록
        db.createObjectStore('moodEntries', { keyPath: 'id' });
        // 저널
        db.createObjectStore('journals', { keyPath: 'id' });
        // 명상 진행 상황
        db.createObjectStore('meditationProgress', { keyPath: 'id' });
        // 동기화 큐
        db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
        // 다운로드된 오디오
        db.createObjectStore('audioCache', { keyPath: 'id' });
      }
    });
  }

  // 오프라인 저장
  async saveOffline(store: string, data: any) {
    const tx = this.db.transaction(store, 'readwrite');
    await tx.objectStore(store).put({
      ...data,
      _offline: true,
      _lastModified: Date.now(),
      _syncStatus: 'pending'
    });

    // 동기화 큐에 추가
    await this.addToSyncQueue({
      operation: 'upsert',
      store,
      data,
      timestamp: Date.now()
    });
  }

  // 온라인 복귀 시 동기화
  async syncWhenOnline() {
    if (!navigator.onLine) return;

    const queue = await this.getSyncQueue();

    for (const operation of queue) {
      try {
        await this.executeSync(operation);
        await this.removeFomSyncQueue(operation.id);
      } catch (error) {
        // 충돌 해결
        await this.handleConflict(operation, error);
      }
    }
  }

  // 충돌 해결 전략 (Notion 스타일)
  async handleConflict(operation: SyncOperation, error: any) {
    const serverData = await this.fetchServerData(operation);
    const localData = operation.data;

    // Last-Write-Wins with merge
    if (serverData._lastModified > localData._lastModified) {
      // 서버 데이터 우선, 로컬 변경사항 병합 시도
      const merged = this.mergeData(serverData, localData);
      await this.saveAndSync(operation.store, merged);
    } else {
      // 로컬 데이터 우선
      await this.forceSync(operation);
    }
  }
}
```

### 3.2 실시간 알림 시스템

**벤치마킹 대상**: Discord의 실시간 통신

```typescript
// src/lib/realtime/notification-system.ts
export class RealtimeNotificationSystem {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  // WebSocket 연결 (Discord 패턴)
  connect() {
    this.ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL!);

    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
      this.authenticate();
      this.subscribeToChannels();
    };

    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      this.handleMessage(message);
    };

    this.ws.onclose = () => {
      this.handleDisconnect();
    };
  }

  // 채널 구독
  subscribeToChannels() {
    const channels = [
      `user:${userId}:mood_reminder`,
      `user:${userId}:check_in`,
      `user:${userId}:achievement`,
      `user:${userId}:crisis_alert`,
    ];

    this.send({
      op: 'subscribe',
      channels
    });
  }

  // 메시지 처리
  handleMessage(message: any) {
    switch (message.type) {
      case 'MOOD_REMINDER':
        this.showMoodReminder(message.data);
        break;
      case 'CHECK_IN_PROMPT':
        this.showCheckInPrompt(message.data);
        break;
      case 'ACHIEVEMENT_UNLOCKED':
        this.showAchievement(message.data);
        break;
      case 'THERAPIST_MESSAGE':
        this.showTherapistMessage(message.data);
        break;
    }
  }

  // 푸시 알림 통합
  async requestPushPermission() {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const subscription = await this.subscribeToPush();
      await this.registerSubscription(subscription);
    }
  }
}
```

### 3.3 명상 오디오 오프라인 다운로드

**벤치마킹 대상**: Spotify의 오프라인 다운로드

```typescript
// src/lib/offline/audio-download-manager.ts
export class AudioDownloadManager {
  private downloads: Map<string, DownloadProgress> = new Map();

  // 다운로드 큐 관리
  async downloadMeditation(meditationId: string) {
    const meditation = await this.fetchMeditationMeta(meditationId);

    // 청크 단위 다운로드 (Spotify 패턴)
    const chunks = this.calculateChunks(meditation.audioUrl, meditation.size);

    for (let i = 0; i < chunks.length; i++) {
      const chunk = await this.downloadChunk(meditation.audioUrl, chunks[i]);
      await this.saveChunk(meditationId, i, chunk);
      this.updateProgress(meditationId, (i + 1) / chunks.length);
    }

    // 메타데이터 저장
    await this.saveMeditationMeta(meditationId, {
      ...meditation,
      downloadedAt: Date.now(),
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000 // 30일
    });
  }

  // 스토리지 관리
  async manageStorage() {
    const usage = await navigator.storage.estimate();
    const available = usage.quota! - usage.usage!;

    if (available < 100 * 1024 * 1024) { // 100MB 미만
      // 오래된 다운로드 정리
      await this.cleanupOldDownloads();
    }
  }

  // 오프라인 재생
  async playOffline(meditationId: string) {
    const chunks = await this.getChunks(meditationId);
    const blob = new Blob(chunks, { type: 'audio/mpeg' });
    const url = URL.createObjectURL(blob);
    return url;
  }
}
```

---

## Phase 4: 게이미피케이션 (Duolingo 벤치마킹)

### 4.1 스트릭 시스템

**벤치마킹 대상**: Duolingo의 스트릭 메커니즘

```typescript
// src/lib/gamification/streak-system.ts
export const streakSystem = {
  // 스트릭 조건
  dailyGoals: {
    moodCheckIn: { required: true, points: 10 },
    meditation: { required: false, minMinutes: 5, points: 20 },
    journaling: { required: false, minWords: 50, points: 15 },
    breathing: { required: false, sessions: 1, points: 5 },
  },

  // 스트릭 보호 (Duolingo Freeze)
  streakProtection: {
    freeFreezesPerMonth: 2,
    premiumFreezesPerMonth: 5,
    freezeCost: 50, // 포인트
  },

  // 스트릭 복구
  streakRepair: {
    windowHours: 24,
    cost: (missedDays: number) => missedDays * 100,
    maxRepairDays: 3,
  },

  // 스트릭 보상
  streakRewards: {
    7: { badge: 'weekly_warrior', points: 100 },
    30: { badge: 'monthly_master', points: 500, unlocks: ['premium_meditation'] },
    100: { badge: 'century_champion', points: 2000, unlocks: ['exclusive_theme'] },
    365: { badge: 'yearly_legend', points: 10000, unlocks: ['lifetime_discount'] },
  },

  // 알림 전략
  notifications: {
    reminderBefore: '저녁 8시에 오늘의 체크인을 놓치지 마세요!',
    atRisk: '스트릭이 위험해요! 지금 1분만 투자해주세요.',
    lost: '스트릭이 끊겼어요 😢 하지만 괜찮아요, 다시 시작하면 돼요!',
    milestone: '🎉 7일 연속 달성! 대단해요!',
  }
};
```

### 4.2 업적 시스템

```typescript
// src/lib/gamification/achievement-system.ts
export const achievementSystem = {
  categories: {
    consistency: [
      {
        id: 'first_week',
        name: '첫 번째 주',
        description: '7일 연속 체크인',
        icon: '🌱',
        xp: 100,
        condition: (stats) => stats.streak >= 7
      },
      {
        id: 'habit_builder',
        name: '습관 형성자',
        description: '21일 연속 체크인',
        icon: '🌿',
        xp: 500,
        condition: (stats) => stats.streak >= 21
      },
    ],

    meditation: [
      {
        id: 'first_calm',
        name: '첫 고요함',
        description: '첫 번째 명상 완료',
        icon: '🧘',
        xp: 50
      },
      {
        id: 'zen_master',
        name: '젠 마스터',
        description: '누적 1000분 명상',
        icon: '🏔️',
        xp: 1000,
        condition: (stats) => stats.totalMeditationMinutes >= 1000
      },
    ],

    emotional_growth: [
      {
        id: 'emotion_explorer',
        name: '감정 탐험가',
        description: '10가지 다른 감정 기록',
        icon: '🎨',
        xp: 200
      },
      {
        id: 'self_awareness',
        name: '자기 인식',
        description: '인지 왜곡 50개 식별',
        icon: '💡',
        xp: 500
      },
    ],

    hidden: [
      {
        id: 'night_owl',
        name: '밤의 사색가',
        description: '자정 이후 명상 완료',
        icon: '🦉',
        xp: 50,
        secret: true
      },
      {
        id: 'comeback_kid',
        name: '다시 일어서다',
        description: '30일 이상 휴식 후 복귀',
        icon: '🔥',
        xp: 200,
        secret: true
      },
    ]
  },

  // 레벨 시스템
  levels: [
    { level: 1, xpRequired: 0, title: '새싹' },
    { level: 2, xpRequired: 100, title: '풀잎' },
    { level: 3, xpRequired: 300, title: '나무' },
    { level: 4, xpRequired: 600, title: '숲' },
    { level: 5, xpRequired: 1000, title: '산' },
    { level: 10, xpRequired: 5000, title: '현자' },
    { level: 20, xpRequired: 20000, title: '마스터' },
  ]
};
```

### 4.3 소셜 기능

**벤치마킹 대상**: Duolingo의 리그 시스템

```typescript
// src/lib/gamification/social-features.ts
export const socialFeatures = {
  // 주간 리그 (익명화된 경쟁)
  weeklyLeague: {
    tiers: ['브론즈', '실버', '골드', '다이아몬드'],
    participantsPerLeague: 30,
    promotionTop: 10,
    relegationBottom: 5,

    // 익명화 (멘탈헬스 앱 특성)
    privacy: {
      useNickname: true,
      hideStreak: false,
      hideDetails: true, // 구체적인 감정 내용은 숨김
    },

    leaderboardMetrics: [
      'checkInStreak',
      'meditationMinutes',
      'achievementsEarned',
      // 감정 내용은 포함하지 않음
    ]
  },

  // 친구 기능 (선택적)
  friends: {
    features: [
      '서로 응원 보내기',
      '익명 고민 공유',
      '함께 명상하기',
    ],
    privacy: {
      requireMutualFollow: true,
      shareOnlyPositive: true, // 긍정적 진전만 공유
    }
  },

  // 커뮤니티 챌린지
  challenges: {
    types: [
      {
        id: 'weekly_meditation',
        name: '함께 명상 100시간',
        description: '이번 주 전체 사용자 명상 시간 합산',
        reward: 'exclusive_sound_pack'
      },
      {
        id: 'gratitude_wave',
        name: '감사의 물결',
        description: '1000개의 감사 일기 작성',
        reward: 'community_badge'
      }
    ]
  }
};
```

---

## Phase 5: 데이터 분석/인사이트 (Spotify Wrapped 벤치마킹)

### 5.1 개인 인사이트 대시보드

**벤치마킹 대상**: Spotify Wrapped, Apple Health

```typescript
// src/lib/analytics/insight-engine.ts
export const insightEngine = {
  // 일간 인사이트
  daily: {
    moodTrend: (entries) => analyzeMoodTrend(entries, 1),
    topEmotion: (entries) => findDominantEmotion(entries),
    sleepCorrelation: (entries, sleep) => correlateMoodSleep(entries, sleep),
    suggestion: (profile) => generateDailySuggestion(profile),
  },

  // 주간 리포트
  weekly: {
    moodCalendar: (entries) => generateMoodCalendar(entries, 7),
    patternDetection: (entries) => detectWeeklyPatterns(entries),
    triggerAnalysis: (entries, journals) => analyzeTriggers(entries, journals),
    progressMetrics: (profile) => calculateWeeklyProgress(profile),
    comparison: (current, previous) => compareWeeks(current, previous),
  },

  // 월간 분석
  monthly: {
    emotionDistribution: (entries) => calculateEmotionDistribution(entries),
    timePatterns: (entries) => analyzeTimePatterns(entries),
    growthIndicators: (profile) => measureGrowth(profile),
    recommendations: (profile, history) => generateMonthlyPlan(profile, history),
  },

  // 연간 회고 (Spotify Wrapped 스타일)
  yearInReview: {
    topEmotions: '올해 가장 많이 느낀 감정 Top 5',
    totalMinutes: '명상한 총 시간',
    biggestStreak: '최장 연속 기록',
    emotionalJourney: '감정 변화 타임라인',
    growthStory: '성장 스토리',
    favoriteContent: '가장 많이 들은 명상',
    milestones: '달성한 주요 이정표',
    wordCloud: '자주 사용한 감정 표현',
    shareableCard: '공유 가능한 요약 카드',
  }
};

// 인사이트 시각화 컴포넌트
export const insightVisualization = {
  moodHeatmap: 'CalendarHeatmap',      // 감정 캘린더
  emotionRadar: 'RadarChart',           // 감정 분포
  trendLine: 'AnimatedLineChart',       // 추이 그래프
  wordCloud: 'EmotionWordCloud',        // 감정 워드클라우드
  progressRing: 'AnimatedProgressRing', // 진행 상황
  streakFlame: 'AnimatedStreakFlame',   // 스트릭 시각화
};
```

### 5.2 예측 분석

```typescript
// src/lib/analytics/predictive-analytics.ts
export const predictiveAnalytics = {
  // 감정 예측
  moodPrediction: {
    model: 'time-series-forecast',
    features: [
      'historicalMood',
      'sleepQuality',
      'dayOfWeek',
      'weather', // 외부 API
      'recentTriggers',
    ],
    output: {
      predictedMood: 'number', // 1-5
      confidence: 'number',
      suggestedInterventions: 'string[]'
    }
  },

  // 위험 예측
  riskPrediction: {
    earlyWarningIndicators: [
      'moodDeclineRate',
      'engagementDrop',
      'sleepDisturbance',
      'socialWithdrawal',
      'negativeLanguageIncrease'
    ],
    alertThreshold: 0.7,
    action: 'gentle_check_in'
  },

  // 개인화된 추천
  personalizedRecommendations: {
    basedOn: ['timeOfDay', 'currentMood', 'history', 'preferences'],
    types: [
      'meditation_suggestion',
      'breathing_exercise',
      'journal_prompt',
      'cbt_tool',
      'professional_referral'
    ]
  }
};
```

---

## 📅 구현 타임라인

### Phase 1: 성능 최적화 (2주)
- Week 1: 번들 최적화, 코드 스플리팅
- Week 2: 캐싱 전략, 이미지 최적화

### Phase 2: AI 대화 고도화 (3주)
- Week 1: 대화 패턴 개선
- Week 2: 위기 감지 시스템 강화
- Week 3: 개인화 엔진

### Phase 3: 오프라인/실시간 (3주)
- Week 1: IndexedDB 설정, 오프라인 저장
- Week 2: 동기화 엔진, 충돌 해결
- Week 3: 실시간 알림, 오디오 다운로드

### Phase 4: 게이미피케이션 (2주)
- Week 1: 스트릭, 업적 시스템
- Week 2: 레벨, 소셜 기능

### Phase 5: 데이터 분석 (2주)
- Week 1: 인사이트 대시보드
- Week 2: 연간 회고, 예측 분석

---

## 🎯 성공 지표 (KPIs)

| 지표 | 현재 | 목표 | 벤치마크 |
|------|------|------|----------|
| 일일 활성 사용자 (DAU) | - | 10,000+ | Calm: 4M+ |
| 7일 리텐션 | - | 40%+ | Headspace: 35% |
| 평균 세션 시간 | - | 8분+ | Calm: 10분 |
| 스트릭 7일+ 비율 | - | 25%+ | Duolingo: 30% |
| NPS | - | 50+ | Headspace: 60 |
| 앱스토어 평점 | - | 4.5+ | Calm: 4.8 |

---

## 🔒 보안 및 프라이버시 고려사항

```typescript
const securityConsiderations = {
  // 데이터 암호화
  encryption: {
    atRest: 'AES-256',
    inTransit: 'TLS 1.3',
    endToEnd: '일기 콘텐츠 (선택적)'
  },

  // 데이터 최소화
  dataMinimization: {
    retentionPeriod: '사용자 설정 가능',
    anonymization: '분석 데이터 익명화',
    rightToDelete: 'GDPR/개인정보보호법 준수'
  },

  // 접근 제어
  accessControl: {
    authentication: 'NextAuth + MFA 옵션',
    authorization: 'RBAC',
    auditLogging: '민감 데이터 접근 로깅'
  }
};
```

---

이 로드맵은 세계 최고 수준의 앱들로부터 학습한 패턴을 MoodPal에 적용하기 위한 청사진입니다.
각 Phase는 독립적으로 구현 가능하며, 우선순위에 따라 조정할 수 있습니다.
