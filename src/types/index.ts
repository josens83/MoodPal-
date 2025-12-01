// MoodPal 타입 정의

// ============= 감정 관련 =============

export type Emotion =
  | 'happy' | 'sad' | 'angry' | 'anxious' | 'fearful'
  | 'disgusted' | 'surprised' | 'calm' | 'confused'
  | 'hopeful' | 'lonely' | 'frustrated' | 'overwhelmed'
  | 'grateful' | 'peaceful' | 'excited' | 'bored';

export interface MoodState {
  primary: Emotion;
  secondary?: Emotion;
  intensity: number;      // 1-10
  valence: number;        // -1 to 1 (부정-긍정)
  arousal: number;        // 1-10 (각성 수준)
}

export type BodyFeeling =
  | 'tense_shoulders'   // 어깨 긴장
  | 'heavy_chest'       // 가슴 답답
  | 'headache'          // 두통
  | 'stomach_ache'      // 복통
  | 'fatigue'           // 피로
  | 'restless'          // 안절부절
  | 'light'             // 가벼움
  | 'energized';        // 활력

export interface MoodEntry {
  id: string;
  userId: string;
  createdAt: Date;
  mood: MoodState;
  activities: string[];
  location?: 'home' | 'work' | 'outside' | 'commute';
  socialContext?: 'alone' | 'with_people' | 'online';
  bodyFeelings?: BodyFeeling[];
  sleepQuality?: number;
  energyLevel?: number;
  note?: string;
  aiInsights?: MoodInsight;
}

export interface MoodInsight {
  summary: string;
  patterns: string[];
  suggestions: string[];
  affirmation: string;
}

// ============= AI 대화 =============

export type CompanionPersonality =
  | 'warm_listener'      // 따뜻한 경청자
  | 'gentle_guide'       // 부드러운 가이드
  | 'cheerful_friend'    // 밝은 친구
  | 'calm_mentor';       // 차분한 멘토

export interface MoodCompanion {
  id: string;
  name: string;
  avatar: string;
  personality: CompanionPersonality;
  voiceId: string;
  description: string;
}

export type ConversationTopic =
  | 'work_stress'        // 직장 스트레스
  | 'relationships'      // 대인관계
  | 'anxiety'            // 불안
  | 'depression'         // 우울감
  | 'self_esteem'        // 자존감
  | 'sleep'              // 수면
  | 'life_direction'     // 진로/방향
  | 'grief'              // 상실/슬픔
  | 'anger_management'   // 분노 관리
  | 'general_chat';      // 일반 대화

export interface Message {
  id: string;
  role: 'user' | 'companion';
  content: string;
  emotionAnalysis?: EmotionAnalysis;
  isCrisisMessage?: boolean;
  createdAt: Date;
}

export interface EmotionAnalysis {
  detected: Emotion[];
  sentiment: number;      // -1 to 1
  intensity: number;      // 1-10
}

export interface CompanionResponse {
  message: string;
  emotionAnalysis?: EmotionAnalysis;
  suggestedActivity?: Activity;
  isCrisis: boolean;
  crisisLevel?: 'low' | 'medium' | 'high';
  showResources?: boolean;
}

// ============= 활동 =============

export type ActivityCategory =
  | 'physical'       // 운동, 산책
  | 'social'         // 사회 활동
  | 'achievement'    // 성취감 활동
  | 'pleasure'       // 즐거움 활동
  | 'self_care'      // 자기돌봄
  | 'creative'       // 창작 활동
  | 'nature'         // 자연 활동
  | 'relaxation';    // 휴식

export interface Activity {
  id: string;
  title: string;
  category: ActivityCategory;
  description?: string;
  duration?: number;
  icon?: string;
}

// ============= CBT 도구 =============

export type CognitiveDistortion =
  | 'all_or_nothing'        // 흑백논리
  | 'overgeneralization'    // 과일반화
  | 'mental_filter'         // 부정적 필터
  | 'disqualifying_positive'// 긍정 폄하
  | 'jumping_to_conclusions'// 성급한 결론
  | 'magnification'         // 확대/축소
  | 'emotional_reasoning'   // 감정적 추론
  | 'should_statements'     // 당위적 사고
  | 'labeling'              // 낙인찍기
  | 'personalization';      // 개인화

export interface ThoughtRecord {
  id: string;
  userId: string;
  createdAt: Date;
  situation: string;
  emotions: { emotion: Emotion; intensity: number }[];
  automaticThought: string;
  thoughtBelief: number;
  cognitiveDistortions: CognitiveDistortion[];
  alternativeThought?: string;
  newBelief?: number;
  newEmotions?: { emotion: Emotion; intensity: number }[];
  aiFeedback?: string;
}

// ============= 명상/마음챙김 =============

export type MindfulnessCategory =
  | 'breathing'          // 호흡 명상
  | 'body_scan'          // 바디스캔
  | 'walking'            // 걷기 명상
  | 'sleep'              // 수면 유도
  | 'anxiety_relief'     // 불안 완화
  | 'stress_relief'      // 스트레스 해소
  | 'morning_routine'    // 아침 루틴
  | 'evening_wind_down'  // 저녁 마무리
  | 'focus'              // 집중력
  | 'self_compassion'    // 자기자비
  | 'gratitude'          // 감사
  | 'sos';               // 급할 때 (3분)

export interface MindfulnessProgram {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  category: MindfulnessCategory;
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  type: 'audio' | 'video' | 'text_guided';
  audioUrl?: string;
  instructor: string;
  targetEmotions: Emotion[];
  benefits: string[];
  accessType: 'free' | 'premium';
}

// ============= 수면 =============

export interface SleepEntry {
  id: string;
  userId: string;
  date: Date;
  bedTime: Date;
  wakeTime: Date;
  sleepDuration: number;
  sleepQuality: number;
  sleepLatency?: number;
  nightAwakenings?: number;
  caffeine: boolean;
  alcohol: boolean;
  screenTime?: number;
  exercise: boolean;
  stressLevel?: number;
  dreamRecorded: boolean;
  dreamMood?: 'positive' | 'neutral' | 'negative' | 'nightmare';
  morningMood?: number;
  morningEnergy?: number;
}

// ============= 전문가 연결 =============

export type SessionType = 'video' | 'voice' | 'chat';

export interface TherapistProfile {
  id: string;
  name: string;
  photo?: string;
  credentials: string[];
  specializations: string[];
  sessionTypes: SessionType[];
  pricing: { type: SessionType; duration: number; price: number }[];
  bio: string;
  approach: string;
  rating: number;
  reviewCount: number;
}

export interface TherapySession {
  id: string;
  userId: string;
  therapistId: string;
  scheduledAt: Date;
  duration: number;
  type: SessionType;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  price: number;
  paymentStatus: 'pending' | 'paid' | 'refunded';
}

// ============= 구독 =============

export type SubscriptionPlan = 'free' | 'premium' | 'premium_plus';

export interface Subscription {
  id: string;
  userId: string;
  plan: SubscriptionPlan;
  status: 'active' | 'cancelled' | 'expired';
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
}

// ============= 위기 대응 =============

export interface CrisisResource {
  name: string;
  number: string;
  description?: string;
}

export const CRISIS_RESOURCES: CrisisResource[] = [
  { name: '자살예방상담전화', number: '1393', description: '24시간 운영' },
  { name: '정신건강위기상담전화', number: '1577-0199', description: '24시간 운영' },
  { name: '생명의전화', number: '1588-9191', description: '24시간 운영' },
];

// ============= 주간 리포트 =============

export interface WeeklyMoodReport {
  weekOf: Date;
  avgValence: number;
  avgArousal: number;
  dominantMoods: Emotion[];
  moodVariability: number;
  bestDay?: string;
  challengingDay?: string;
  timePatterns?: {
    morning: MoodState;
    afternoon: MoodState;
    evening: MoodState;
  };
  correlations?: {
    factor: string;
    impact: number;
    description: string;
  }[];
  aiSummary?: string;
  weeklyGoal?: string;
  celebratePoints?: string[];
}
