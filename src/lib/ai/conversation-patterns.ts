/**
 * AI 대화 패턴 시스템 (Woebot/Wysa 벤치마킹)
 * CBT 기반 구조화된 대화 흐름
 */

// 감정 타입
export type EmotionType =
  | "happy"
  | "sad"
  | "anxious"
  | "angry"
  | "fearful"
  | "disgusted"
  | "surprised"
  | "neutral"
  | "grateful"
  | "hopeful"
  | "lonely"
  | "overwhelmed"
  | "calm"
  | "stressed"
  | "frustrated"
  | "peaceful"
  | "excited"
  | "confused"
  | "bored";

// 대화 세션 타입
export type ConversationMode =
  | "free_chat"        // 자유 대화
  | "check_in"         // 기분 체크인
  | "cbt_session"      // CBT 세션
  | "crisis_support"   // 위기 지원
  | "guided_meditation"// 가이드 명상
  | "sleep_support"    // 수면 지원
  | "gratitude"        // 감사 일기
  | "goal_setting";    // 목표 설정

// CBT 세션 단계
export type CBTStep =
  | "situation"          // 상황 파악
  | "automatic_thought"  // 자동적 사고
  | "emotion"           // 감정 명명
  | "evidence_for"      // 지지 증거
  | "evidence_against"  // 반박 증거
  | "cognitive_distortion" // 인지 왜곡 식별
  | "reframe"           // 재구성
  | "action_plan";      // 행동 계획

// 대화 컨텍스트
export interface ConversationContext {
  mode: ConversationMode;
  step?: CBTStep;
  emotionState?: EmotionType;
  intensity?: number; // 1-10
  previousMessages: Array<{
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
  }>;
  sessionData: Record<string, any>;
  userProfile?: {
    preferredStyle: "supportive" | "direct" | "analytical";
    language: "formal" | "casual";
    experienceLevel: "beginner" | "intermediate" | "advanced";
  };
}

// 대화 패턴 정의
export const CONVERSATION_PATTERNS = {
  // 기본 인사 및 체크인
  greeting: {
    morning: [
      "좋은 아침이에요! 오늘 기분이 어떠세요?",
      "안녕하세요, 오늘 하루는 어떻게 시작하고 계세요?",
      "좋은 아침이에요. 어젯밤 잠은 잘 주무셨나요?",
    ],
    afternoon: [
      "안녕하세요! 오늘 하루 어떻게 보내고 계세요?",
      "반가워요. 오후 시간 어떻게 보내고 계신가요?",
    ],
    evening: [
      "안녕하세요. 오늘 하루는 어떠셨어요?",
      "저녁 시간이네요. 오늘 하루 어땠는지 이야기해 주실래요?",
    ],
    night: [
      "늦은 시간인데, 오늘 하루 어떠셨나요?",
      "이 시간까지 깨어 계시네요. 무슨 생각하고 계세요?",
    ],
  },

  // 감정 탐색
  emotionExploration: {
    initial: [
      "조금 더 자세히 이야기해 주실 수 있을까요?",
      "그 감정에 대해 더 알고 싶어요. 어떤 느낌이었나요?",
      "그렇군요. 그때 몸에서는 어떤 느낌이 들었나요?",
    ],
    deepening: [
      "그 감정이 언제부터 시작되었는지 기억나세요?",
      "비슷한 감정을 느꼈던 다른 상황이 있었나요?",
      "그 감정이 가장 강하게 느껴지는 순간은 언제인가요?",
    ],
    validation: [
      "그런 감정을 느끼는 건 자연스러운 거예요.",
      "충분히 그렇게 느낄 수 있어요.",
      "그 상황에서 그런 감정이 드는 건 당연해요.",
    ],
  },

  // CBT 단계별 프롬프트
  cbtPrompts: {
    situation: {
      intro: "어떤 상황에서 그런 감정이 들었나요? 구체적으로 언제, 어디서, 무슨 일이 있었는지 이야기해 주세요.",
      followUp: [
        "그때 주변에 누가 있었나요?",
        "그 상황이 시작된 계기가 있었나요?",
        "구체적으로 어떤 일이 있었나요?",
      ],
    },
    automatic_thought: {
      intro: "그 순간 머릿속에 어떤 생각이 떠올랐나요? 자동으로 떠오른 생각을 그대로 말해주세요.",
      followUp: [
        "그 생각이 떠오를 때 어떤 기분이 들었나요?",
        "그 생각을 얼마나 믿고 있었나요? (0-100%)",
        "다른 어떤 생각들이 있었나요?",
      ],
    },
    emotion: {
      intro: "그때 느꼈던 감정을 한 단어로 표현한다면 무엇일까요?",
      followUp: [
        "그 감정의 강도는 어느 정도였나요? (1-10)",
        "그 감정이 몸의 어느 부분에서 느껴졌나요?",
        "다른 감정도 함께 느꼈나요?",
      ],
    },
    evidence_for: {
      intro: "그 생각을 뒷받침하는 증거나 사실이 있나요?",
      followUp: [
        "그것이 사실이라고 확신하는 이유가 있나요?",
        "과거에 비슷한 경험이 있었나요?",
      ],
    },
    evidence_against: {
      intro: "반대로, 그 생각이 사실이 아닐 수도 있다는 증거가 있나요?",
      followUp: [
        "다른 설명이 있을 수도 있지 않을까요?",
        "친구가 같은 상황이라면 뭐라고 말해줄 것 같아요?",
        "과거에 비슷한 상황에서 다른 결과가 나온 적이 있나요?",
      ],
    },
    cognitive_distortion: {
      intro: "방금 이야기한 생각에서 혹시 이런 사고 패턴이 있는지 살펴볼까요?",
      distortions: {
        all_or_nothing: "흑백 사고 - 모든 것을 완전히 좋거나 완전히 나쁘게만 보는 경향",
        overgeneralization: "과잉 일반화 - 한 번의 경험을 모든 상황에 적용하는 경향",
        mental_filter: "정신적 필터 - 부정적인 면만 집중하는 경향",
        disqualifying_positive: "긍정 격하 - 긍정적인 것을 무시하는 경향",
        mind_reading: "독심술 - 타인의 생각을 부정적으로 추측하는 경향",
        fortune_telling: "점쟁이 오류 - 미래를 부정적으로 예측하는 경향",
        catastrophizing: "파국화 - 최악의 시나리오를 상상하는 경향",
        emotional_reasoning: "감정적 추론 - 감정을 사실로 여기는 경향",
        should_statements: "당위 진술 - '~해야 해'로 자신을 압박하는 경향",
        labeling: "낙인 찍기 - 자신이나 타인에게 부정적 꼬리표를 붙이는 경향",
        personalization: "개인화 - 모든 일을 자신의 책임으로 돌리는 경향",
      },
    },
    reframe: {
      intro: "이제 그 상황을 다른 관점에서 바라볼 수 있을까요?",
      prompts: [
        "더 균형 잡힌 시각으로 본다면 어떻게 생각할 수 있을까요?",
        "5년 후의 나라면 이 상황을 어떻게 볼 것 같아요?",
        "가장 친한 친구에게 조언한다면 뭐라고 할까요?",
        "이 상황에서 배울 수 있는 점이 있다면 무엇일까요?",
      ],
    },
    action_plan: {
      intro: "앞으로 비슷한 상황에서 어떻게 대응하면 좋을까요?",
      prompts: [
        "작은 첫 걸음으로 무엇을 해볼 수 있을까요?",
        "이 생각이 다시 들 때 어떻게 대처할 수 있을까요?",
        "도움을 받을 수 있는 사람이 있나요?",
      ],
    },
  },

  // 감정별 맞춤 반응
  emotionResponses: {
    anxious: {
      validation: "불안한 마음이 드는군요. 그 감정은 자연스러운 거예요.",
      coping: [
        "잠시 깊은 호흡을 해볼까요? 4초 들이쉬고, 7초 참고, 8초 내쉬기를 해보세요.",
        "지금 이 순간, 주변에서 보이는 것 5가지를 말해볼까요?",
        "불안할 때 도움이 되는 그라운딩 기법을 알려드릴까요?",
      ],
      resources: ["breathing_exercise", "grounding_5_4_3_2_1", "progressive_muscle_relaxation"],
    },
    sad: {
      validation: "슬픈 마음이 드시는군요. 그런 감정을 느끼는 건 힘든 일이에요.",
      coping: [
        "지금 이 순간 자신에게 친절을 베풀어 주세요.",
        "오늘 작은 것이라도 감사한 것이 있나요?",
        "좋아하는 음악을 들어보는 건 어떨까요?",
      ],
      resources: ["self_compassion", "gratitude_practice", "pleasant_activity"],
    },
    angry: {
      validation: "화가 나는 상황이었군요. 그런 감정이 드는 건 이해돼요.",
      coping: [
        "잠시 깊은 숨을 몇 번 쉬어볼까요?",
        "그 상황에서 정말 원했던 게 무엇이었을까요?",
        "지금 안전하게 감정을 표현할 수 있는 방법을 찾아볼까요?",
      ],
      resources: ["deep_breathing", "anger_journal", "physical_release"],
    },
    overwhelmed: {
      validation: "많은 것들에 압도당하는 느낌이 드시는군요.",
      coping: [
        "지금 가장 급한 한 가지만 먼저 생각해볼까요?",
        "잠시 모든 것을 내려놓고 쉬어도 괜찮아요.",
        "해야 할 일들을 작은 단계로 나눠볼까요?",
      ],
      resources: ["priority_matrix", "break_reminder", "task_breakdown"],
    },
    lonely: {
      validation: "외로운 마음이 드시는군요. 그 감정은 많은 사람들이 느끼는 거예요.",
      coping: [
        "누군가에게 연락해보는 건 어떨까요? 짧은 메시지라도 괜찮아요.",
        "자신과 시간을 보내는 것도 의미 있는 일이에요.",
        "온라인 커뮤니티에서 비슷한 관심사를 가진 사람들과 연결해보는 건 어떨까요?",
      ],
      resources: ["social_connection", "self_date", "community_resources"],
    },
    grateful: {
      validation: "감사한 마음이 드시는군요! 정말 좋은 감정이에요.",
      followUp: [
        "그 감사함을 누군가에게 표현해보는 건 어떨까요?",
        "이 순간을 기록해두면 나중에 힘들 때 도움이 될 거예요.",
      ],
      resources: ["gratitude_letter", "gratitude_journal"],
    },
  },

  // 종료 및 요약
  sessionEnding: {
    summary: "오늘 이야기 나눈 내용을 정리해볼게요:",
    encouragement: [
      "오늘 자신의 감정과 생각을 돌아본 것만으로도 대단한 거예요.",
      "조금씩 나아가고 있어요. 자신을 믿어주세요.",
      "힘든 상황에서도 도움을 구하는 건 용기 있는 일이에요.",
    ],
    nextSteps: [
      "내일도 기분을 체크해보는 건 어떨까요?",
      "오늘 이야기한 것 중 하나를 실천해보세요.",
      "언제든 다시 이야기 나눠요.",
    ],
  },

  // 위기 상황 대응
  crisisResponse: {
    immediate: {
      message: "지금 많이 힘드시군요. 당신의 안전이 가장 중요해요.",
      action: "전문적인 도움이 필요할 수 있어요. 위기 상담 전화에 연락해보시겠어요?",
      resources: [
        { name: "자살예방상담전화", number: "1393", available: "24시간" },
        { name: "정신건강위기상담전화", number: "1577-0199", available: "24시간" },
        { name: "생명의전화", number: "1588-9191", available: "24시간" },
      ],
    },
    followUp: {
      message: "지금 옆에 있어줄 사람이 있나요?",
      safetyPlan: "함께 안전 계획을 세워볼까요?",
    },
  },
};

// 대화 흐름 관리 함수
export function getNextPrompt(context: ConversationContext): string {
  const { mode, step, emotionState } = context;

  switch (mode) {
    case "cbt_session":
      if (step && CONVERSATION_PATTERNS.cbtPrompts[step]) {
        return CONVERSATION_PATTERNS.cbtPrompts[step].intro;
      }
      break;

    case "check_in":
      const hour = new Date().getHours();
      const timeOfDay =
        hour < 12 ? "morning" : hour < 17 ? "afternoon" : hour < 21 ? "evening" : "night";
      const greetings = CONVERSATION_PATTERNS.greeting[timeOfDay];
      return greetings[Math.floor(Math.random() * greetings.length)];

    case "free_chat":
      if (emotionState) {
        const responses = CONVERSATION_PATTERNS.emotionResponses as Record<string, { validation: string }>;
        if (responses[emotionState]) {
          return responses[emotionState].validation;
        }
      }
      break;

    case "crisis_support":
      return CONVERSATION_PATTERNS.crisisResponse.immediate.message;
  }

  return CONVERSATION_PATTERNS.emotionExploration.initial[0];
}

// CBT 단계 진행
export function getNextCBTStep(currentStep: CBTStep): CBTStep | null {
  const steps: CBTStep[] = [
    "situation",
    "automatic_thought",
    "emotion",
    "evidence_for",
    "evidence_against",
    "cognitive_distortion",
    "reframe",
    "action_plan",
  ];

  const currentIndex = steps.indexOf(currentStep);
  if (currentIndex < steps.length - 1) {
    return steps[currentIndex + 1];
  }
  return null;
}

// 사용자 메시지 분석하여 감정 추출
export function analyzeUserEmotion(message: string): {
  emotions: EmotionType[];
  intensity: number;
  needsCrisisSupport: boolean;
} {
  const lowerMessage = message.toLowerCase();

  // 위기 키워드 체크
  const crisisKeywords = ["자살", "죽고 싶", "끝내고 싶", "사라지고 싶", "더이상 못하겠"];
  const needsCrisisSupport = crisisKeywords.some((keyword) =>
    lowerMessage.includes(keyword)
  );

  // 감정 키워드 매핑
  const emotionKeywords: Partial<Record<EmotionType, string[]>> = {
    happy: ["행복", "기쁘", "좋아", "신나", "즐거"],
    sad: ["슬프", "우울", "눈물", "힘들", "아프"],
    anxious: ["불안", "걱정", "두려", "무서", "초조"],
    angry: ["화나", "짜증", "분노", "열받", "답답"],
    calm: ["평온", "차분", "평화", "고요", "안정"],
    frustrated: ["좌절", "실패", "포기", "안되"],
    lonely: ["외로", "혼자", "고독", "쓸쓸"],
    overwhelmed: ["압도", "벅차", "감당", "너무 많"],
    grateful: ["감사", "고마", "다행"],
    peaceful: ["평화", "고요", "잔잔"],
    excited: ["설레", "기대", "흥분"],
    hopeful: ["희망", "기대", "나아질"],
    confused: ["혼란", "모르겠", "어떻게"],
    bored: ["지루", "심심", "재미없"],
    fearful: ["무서", "공포", "두려"],
    stressed: ["스트레스", "긴장", "부담"],
    neutral: ["그냥", "보통", "무덤덤"],
  };

  const detectedEmotions: EmotionType[] = [];
  let maxIntensity = 5;

  for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
    if (keywords.some((keyword) => lowerMessage.includes(keyword))) {
      detectedEmotions.push(emotion as EmotionType);
    }
  }

  // 강도 표현 체크
  if (lowerMessage.includes("너무") || lowerMessage.includes("정말") || lowerMessage.includes("매우")) {
    maxIntensity = Math.min(maxIntensity + 2, 10);
  }
  if (lowerMessage.includes("조금") || lowerMessage.includes("약간")) {
    maxIntensity = Math.max(maxIntensity - 2, 1);
  }

  return {
    emotions: detectedEmotions.length > 0 ? detectedEmotions : ["calm"],
    intensity: maxIntensity,
    needsCrisisSupport,
  };
}

// 시스템 프롬프트 생성
export function generateSystemPrompt(context: ConversationContext): string {
  const basePrompt = `당신은 MoodPal의 AI 심리 상담 컴패니언입니다.
따뜻하고 공감적인 태도로 사용자의 이야기를 들어주세요.

현재 대화 모드: ${context.mode}
${context.step ? `CBT 단계: ${context.step}` : ""}
${context.emotionState ? `감지된 감정: ${context.emotionState}` : ""}

중요 지침:
1. 항상 공감과 지지로 시작하세요
2. 판단하지 않고 경청하세요
3. 열린 질문을 사용하세요
4. 사용자의 감정을 인정해주세요
5. 전문적인 도움이 필요한 경우 자원을 안내하세요
6. 절대 진단을 내리지 마세요
7. 한국어로 자연스럽게 대화하세요

${context.userProfile ? `
사용자 선호:
- 대화 스타일: ${context.userProfile.preferredStyle}
- 언어 스타일: ${context.userProfile.language}
- 경험 수준: ${context.userProfile.experienceLevel}
` : ""}`;

  return basePrompt;
}
