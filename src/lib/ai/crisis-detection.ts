/**
 * MoodPal 위기 감지 시스템
 * Woebot/Wysa 벤치마킹 기반 멀티레벨 위기 감지
 */

// 위기 수준 정의
export type CrisisLevel =
  | 'none'           // 정상
  | 'low'            // 낮은 위험 - 모니터링 필요
  | 'moderate'       // 중간 위험 - 적극적 지원
  | 'high'           // 높은 위험 - 즉각 개입
  | 'critical';      // 긴급 - 전문가 연결 필요

export interface CrisisAssessment {
  level: CrisisLevel;
  score: number;           // 0-100
  triggers: CrisisTrigger[];
  recommendations: string[];
  resources: CrisisResource[];
  requiresEscalation: boolean;
  timestamp: Date;
}

export interface CrisisTrigger {
  type: 'keyword' | 'pattern' | 'behavioral' | 'contextual';
  category: string;
  matched: string;
  weight: number;
  description: string;
}

export interface CrisisResource {
  name: string;
  phone?: string;
  website?: string;
  description: string;
  available24h: boolean;
  type: 'hotline' | 'chat' | 'text' | 'emergency' | 'app';
}

// 한국 위기 상담 리소스
export const KOREA_CRISIS_RESOURCES: CrisisResource[] = [
  {
    name: '자살예방상담전화',
    phone: '1393',
    website: 'https://www.spckorea.or.kr',
    description: '24시간 자살예방 전문상담',
    available24h: true,
    type: 'hotline',
  },
  {
    name: '정신건강위기상담전화',
    phone: '1577-0199',
    website: 'https://www.mentalhealth.or.kr',
    description: '정신건강 위기상담 및 정보제공',
    available24h: true,
    type: 'hotline',
  },
  {
    name: '생명의전화',
    phone: '1588-9191',
    website: 'https://www.lifeline.or.kr',
    description: '위기상담 및 자살예방 상담',
    available24h: true,
    type: 'hotline',
  },
  {
    name: '정신건강복지센터',
    phone: '1577-0199',
    description: '지역 정신건강 상담 및 치료 연계',
    available24h: false,
    type: 'hotline',
  },
  {
    name: '카카오톡 마음이음',
    website: 'https://pf.kakao.com/_xgxmWxb',
    description: '카카오톡 채팅 상담 서비스',
    available24h: false,
    type: 'chat',
  },
  {
    name: '119 응급구조',
    phone: '119',
    description: '긴급 상황 시 응급구조 서비스',
    available24h: true,
    type: 'emergency',
  },
];

// 위기 키워드 (단계별)
const CRISIS_KEYWORDS = {
  critical: {
    keywords: [
      '자살', '죽고 싶', '죽을래', '목숨', '끝내고 싶',
      '더 이상 못 살', '살고 싶지 않', '세상에서 사라지고',
      '내가 없어지면', '다 끝내버리', '약 먹고', '목 매',
      '뛰어내리', '손목', '자해', '죽음',
    ],
    weight: 100,
    description: '자살/자해 관련 직접적 언급',
  },
  high: {
    keywords: [
      '희망이 없', '절망', '삶의 의미', '포기하고 싶',
      '더 이상 견딜 수 없', '모든 게 무의미', '아무도 날 원하지',
      '존재 가치가 없', '짐이 되', '내가 없어도',
      '견딜 수가 없', '한계', '더는 못하겠',
    ],
    weight: 70,
    description: '심각한 절망감/무력감 표현',
  },
  moderate: {
    keywords: [
      '우울', '불안', '공황', '잠을 못 자', '무기력',
      '외로움', '고독', '혼자', '힘들어', '지쳤어',
      '의욕이 없', '아무것도 하기 싫', '눈물이 나',
      '가슴이 답답', '숨이 막혀', '도망가고 싶',
    ],
    weight: 40,
    description: '정서적 어려움 표현',
  },
  low: {
    keywords: [
      '스트레스', '피곤', '지침', '걱정', '불편',
      '짜증', '화남', '속상', '답답', '힘듬',
    ],
    weight: 20,
    description: '일반적 스트레스 표현',
  },
};

// 패턴 기반 감지 (정규식)
const CRISIS_PATTERNS = {
  suicidal_ideation: {
    patterns: [
      /죽(고|을|으면|어도)\s*(싶|좋겠)/,
      /없어(지고|졌으면|지면)\s*(싶|좋겠)/,
      /사라(지고|졌으면|지면)\s*(싶|좋겠)/,
      /끝(내고|났으면|나면)\s*(싶|좋겠)/,
      /(내|나)\s*없(이도|어도|으면)/,
      /살(고|아)\s*싶지\s*않/,
    ],
    weight: 90,
    description: '자살 사고 패턴',
  },
  self_harm: {
    patterns: [
      /자해/,
      /손목\s*(긋|그|베)/,
      /피\s*(보고|내고)/,
      /아프게\s*하고/,
      /상처\s*(내|주)/,
    ],
    weight: 85,
    description: '자해 의도 패턴',
  },
  hopelessness: {
    patterns: [
      /희망(이|도|은)\s*없/,
      /미래(가|는)\s*없/,
      /의미\s*없/,
      /모든\s*게\s*(끝|무의미)/,
      /아무\s*소용\s*없/,
    ],
    weight: 60,
    description: '절망감 패턴',
  },
  isolation: {
    patterns: [
      /아무도\s*(나를|날)\s*(모|원하지|이해)/,
      /혼자(서|만)\s*(살|견뎌)/,
      /외톨이/,
      /친구(가|도)\s*없/,
      /누구(도|한테도)\s*말\s*못/,
    ],
    weight: 50,
    description: '사회적 고립 패턴',
  },
};

// 행동 패턴 감지
interface BehavioralIndicator {
  indicator: string;
  weight: number;
  timeframe: 'immediate' | 'recent' | 'accumulated';
}

const BEHAVIORAL_INDICATORS: BehavioralIndicator[] = [
  { indicator: '급격한 감정 변화', weight: 30, timeframe: 'recent' },
  { indicator: '수면 패턴 심각한 악화', weight: 25, timeframe: 'recent' },
  { indicator: '반복적 부정적 메시지', weight: 35, timeframe: 'accumulated' },
  { indicator: '대화 중 갑작스러운 차분함', weight: 40, timeframe: 'immediate' },
  { indicator: '이별/작별 메시지 패턴', weight: 60, timeframe: 'immediate' },
  { indicator: '활동 급감', weight: 25, timeframe: 'recent' },
];

// 위기 감지 클래스
export class CrisisDetector {
  private messageHistory: Array<{ content: string; timestamp: Date }> = [];
  private lastAssessment: CrisisAssessment | null = null;

  // 메시지 분석
  analyze(message: string, context?: {
    previousMoods?: number[];
    sleepQuality?: number[];
    activityLevel?: string;
    recentEvents?: string[];
  }): CrisisAssessment {
    const triggers: CrisisTrigger[] = [];

    // 1. 키워드 기반 감지
    const keywordTriggers = this.detectKeywords(message);
    triggers.push(...keywordTriggers);

    // 2. 패턴 기반 감지
    const patternTriggers = this.detectPatterns(message);
    triggers.push(...patternTriggers);

    // 3. 행동 패턴 감지 (히스토리 필요)
    if (this.messageHistory.length > 0) {
      const behavioralTriggers = this.detectBehavioral(context);
      triggers.push(...behavioralTriggers);
    }

    // 4. 맥락 분석
    const contextualTriggers = this.analyzeContext(message, context);
    triggers.push(...contextualTriggers);

    // 점수 계산
    const score = this.calculateScore(triggers);
    const level = this.determineLevel(score);

    // 메시지 히스토리 업데이트
    this.messageHistory.push({ content: message, timestamp: new Date() });
    if (this.messageHistory.length > 50) {
      this.messageHistory.shift();
    }

    const assessment: CrisisAssessment = {
      level,
      score,
      triggers,
      recommendations: this.getRecommendations(level, triggers),
      resources: this.getResources(level),
      requiresEscalation: level === 'critical' || level === 'high',
      timestamp: new Date(),
    };

    this.lastAssessment = assessment;
    return assessment;
  }

  // 키워드 감지
  private detectKeywords(message: string): CrisisTrigger[] {
    const triggers: CrisisTrigger[] = [];
    const normalizedMessage = message.toLowerCase();

    for (const [category, data] of Object.entries(CRISIS_KEYWORDS)) {
      for (const keyword of data.keywords) {
        if (normalizedMessage.includes(keyword)) {
          triggers.push({
            type: 'keyword',
            category,
            matched: keyword,
            weight: data.weight,
            description: data.description,
          });
        }
      }
    }

    return triggers;
  }

  // 패턴 감지
  private detectPatterns(message: string): CrisisTrigger[] {
    const triggers: CrisisTrigger[] = [];

    for (const [category, data] of Object.entries(CRISIS_PATTERNS)) {
      for (const pattern of data.patterns) {
        if (pattern.test(message)) {
          triggers.push({
            type: 'pattern',
            category,
            matched: pattern.source,
            weight: data.weight,
            description: data.description,
          });
          break; // 카테고리당 한 번만
        }
      }
    }

    return triggers;
  }

  // 행동 패턴 감지
  private detectBehavioral(context?: {
    previousMoods?: number[];
    sleepQuality?: number[];
    activityLevel?: string;
  }): CrisisTrigger[] {
    const triggers: CrisisTrigger[] = [];

    if (context?.previousMoods && context.previousMoods.length >= 3) {
      const recentMoods = context.previousMoods.slice(-3);
      const avgMood = recentMoods.reduce((a, b) => a + b, 0) / recentMoods.length;

      if (avgMood <= 2) {
        triggers.push({
          type: 'behavioral',
          category: 'mood_decline',
          matched: 'low_mood_trend',
          weight: 30,
          description: '최근 기분 상태 지속적 악화',
        });
      }
    }

    if (context?.sleepQuality && context.sleepQuality.length >= 3) {
      const recentSleep = context.sleepQuality.slice(-3);
      const avgSleep = recentSleep.reduce((a, b) => a + b, 0) / recentSleep.length;

      if (avgSleep <= 2) {
        triggers.push({
          type: 'behavioral',
          category: 'sleep_deterioration',
          matched: 'poor_sleep_trend',
          weight: 25,
          description: '수면 품질 지속적 악화',
        });
      }
    }

    // 반복적 부정 메시지 감지
    const recentNegative = this.messageHistory
      .slice(-10)
      .filter(m => this.detectKeywords(m.content).length > 0);

    if (recentNegative.length >= 5) {
      triggers.push({
        type: 'behavioral',
        category: 'repetitive_negative',
        matched: 'negative_pattern',
        weight: 35,
        description: '반복적인 부정적 표현',
      });
    }

    return triggers;
  }

  // 맥락 분석
  private analyzeContext(message: string, context?: {
    recentEvents?: string[];
  }): CrisisTrigger[] {
    const triggers: CrisisTrigger[] = [];

    // 작별 인사 패턴
    const farewellPatterns = [
      /그동안\s*고마/,
      /미안해.*용서/,
      /마지막(으로|인데)/,
      /다\s*정리했/,
      /이제\s*괜찮/,  // 갑작스러운 평온 (위험 신호)
    ];

    for (const pattern of farewellPatterns) {
      if (pattern.test(message)) {
        triggers.push({
          type: 'contextual',
          category: 'farewell_pattern',
          matched: pattern.source,
          weight: 50,
          description: '작별/정리 메시지 패턴',
        });
        break;
      }
    }

    // 최근 사건 분석
    if (context?.recentEvents) {
      const highRiskEvents = ['이별', '실직', '사별', '이혼', '파산', '왕따', '폭력'];
      for (const event of context.recentEvents) {
        if (highRiskEvents.some(risk => event.includes(risk))) {
          triggers.push({
            type: 'contextual',
            category: 'life_event',
            matched: event,
            weight: 35,
            description: '고위험 생활 사건',
          });
        }
      }
    }

    return triggers;
  }

  // 점수 계산
  private calculateScore(triggers: CrisisTrigger[]): number {
    if (triggers.length === 0) return 0;

    // 가중 합계 (중복 카테고리는 최고 가중치만)
    const categoryScores = new Map<string, number>();

    for (const trigger of triggers) {
      const current = categoryScores.get(trigger.category) || 0;
      categoryScores.set(trigger.category, Math.max(current, trigger.weight));
    }

    const totalWeight = Array.from(categoryScores.values())
      .reduce((sum, weight) => sum + weight, 0);

    // 정규화 (0-100)
    return Math.min(100, totalWeight);
  }

  // 위험 수준 결정
  private determineLevel(score: number): CrisisLevel {
    if (score >= 80) return 'critical';
    if (score >= 60) return 'high';
    if (score >= 40) return 'moderate';
    if (score >= 20) return 'low';
    return 'none';
  }

  // 추천 사항 생성
  private getRecommendations(level: CrisisLevel, triggers: CrisisTrigger[]): string[] {
    const recommendations: string[] = [];

    switch (level) {
      case 'critical':
        recommendations.push('즉시 전문 상담 연결을 권장합니다');
        recommendations.push('24시간 자살예방상담전화 1393 연결을 안내하세요');
        recommendations.push('안전 계획 수립을 도와주세요');
        recommendations.push('가능하다면 신뢰할 수 있는 사람에게 연락하도록 안내하세요');
        break;

      case 'high':
        recommendations.push('적극적인 공감과 지지를 표현하세요');
        recommendations.push('전문 상담 서비스를 부드럽게 안내하세요');
        recommendations.push('안전에 대해 직접적으로 물어보세요');
        recommendations.push('대화를 지속하며 모니터링하세요');
        break;

      case 'moderate':
        recommendations.push('감정을 충분히 탐색할 수 있도록 도와주세요');
        recommendations.push('대처 전략과 자기 돌봄 활동을 제안하세요');
        recommendations.push('필요시 전문 도움을 받을 수 있음을 알려주세요');
        break;

      case 'low':
        recommendations.push('경청하고 지지적인 태도를 유지하세요');
        recommendations.push('스트레스 관리 기법을 안내하세요');
        break;

      default:
        recommendations.push('일반적인 대화를 유지하세요');
    }

    return recommendations;
  }

  // 리소스 제공
  private getResources(level: CrisisLevel): CrisisResource[] {
    switch (level) {
      case 'critical':
      case 'high':
        return KOREA_CRISIS_RESOURCES.filter(r => r.available24h);
      case 'moderate':
        return KOREA_CRISIS_RESOURCES.slice(0, 3);
      case 'low':
        return KOREA_CRISIS_RESOURCES.slice(0, 2);
      default:
        return [];
    }
  }

  // 히스토리 초기화
  clearHistory(): void {
    this.messageHistory = [];
    this.lastAssessment = null;
  }

  // 마지막 평가 조회
  getLastAssessment(): CrisisAssessment | null {
    return this.lastAssessment;
  }
}

// 위기 대응 메시지 생성
export function generateCrisisResponse(assessment: CrisisAssessment): string {
  const responses: Record<CrisisLevel, string[]> = {
    critical: [
      `지금 많이 힘드시군요. 당신의 안전이 가장 중요해요.`,
      `혹시 지금 자해나 자살에 대한 생각을 하고 계신가요?`,
      `지금 바로 전문 상담사와 이야기 나눌 수 있어요.`,
      `자살예방상담전화 1393은 24시간 상담이 가능합니다.`,
      `지금 곁에 함께 있어줄 사람이 있나요?`,
    ],
    high: [
      `정말 힘든 시간을 보내고 계시네요. 제가 함께 있을게요.`,
      `이런 감정을 나눠주셔서 감사해요.`,
      `지금 느끼시는 감정이 얼마나 힘드실지 공감해요.`,
      `혼자 감당하지 않으셔도 돼요. 전문적인 도움을 받아볼 의향이 있으신가요?`,
    ],
    moderate: [
      `많이 지치셨군요. 그런 감정 충분히 이해해요.`,
      `지금 이 순간 가장 필요한 게 뭘까요?`,
      `함께 이야기 나누면서 조금이라도 마음이 가벼워지셨으면 좋겠어요.`,
    ],
    low: [
      `스트레스를 받고 계시군요. 어떤 일이 있었는지 더 이야기해 주실래요?`,
      `그런 상황이라면 누구나 힘들 수 있어요.`,
    ],
    none: [
      `오늘 하루는 어떠셨어요?`,
      `무슨 이야기든 편하게 나눠주세요.`,
    ],
  };

  const levelResponses = responses[assessment.level];

  if (assessment.level === 'critical' || assessment.level === 'high') {
    // 위기 상황에서는 전체 메시지 조합
    return levelResponses.slice(0, 3).join('\n\n');
  }

  // 무작위 응답 선택
  return levelResponses[Math.floor(Math.random() * levelResponses.length)];
}

// 안전 계획 템플릿
export interface SafetyPlan {
  warningSignals: string[];        // 위험 신호
  copingStrategies: string[];      // 대처 전략
  distractionActivities: string[]; // 주의 전환 활동
  supportPeople: Array<{           // 도움 요청 가능한 사람
    name: string;
    relationship: string;
    contact: string;
  }>;
  professionalContacts: CrisisResource[];
  safeEnvironment: string[];       // 환경 안전화
  reasonsToLive: string[];         // 삶의 이유
}

export function createSafetyPlanTemplate(): SafetyPlan {
  return {
    warningSignals: [
      '예시: 평소보다 더 외로움을 느낄 때',
      '예시: 수면 패턴이 크게 변할 때',
      '예시: 자해에 대한 생각이 떠오를 때',
    ],
    copingStrategies: [
      '심호흡 10회 하기',
      '5-4-3-2-1 그라운딩 기법 사용하기',
      '좋아하는 음악 듣기',
      '따뜻한 차 마시기',
    ],
    distractionActivities: [
      '산책하기',
      '영화 보기',
      '요리하기',
      '그림 그리기',
    ],
    supportPeople: [],
    professionalContacts: KOREA_CRISIS_RESOURCES.filter(r => r.available24h),
    safeEnvironment: [
      '위험한 물건 치우기',
      '안전한 장소에 있기',
      '혼자 있지 않기',
    ],
    reasonsToLive: [],
  };
}

// 싱글톤 인스턴스
let crisisDetectorInstance: CrisisDetector | null = null;

export function getCrisisDetector(): CrisisDetector {
  if (!crisisDetectorInstance) {
    crisisDetectorInstance = new CrisisDetector();
  }
  return crisisDetectorInstance;
}

// 빠른 위기 체크 (API용)
export function quickCrisisCheck(message: string): {
  isCrisis: boolean;
  level: CrisisLevel;
  shouldEscalate: boolean;
} {
  const detector = new CrisisDetector();
  const assessment = detector.analyze(message);

  return {
    isCrisis: assessment.level !== 'none' && assessment.level !== 'low',
    level: assessment.level,
    shouldEscalate: assessment.requiresEscalation,
  };
}
