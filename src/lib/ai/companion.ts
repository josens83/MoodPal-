import { MoodCompanion, CompanionResponse, Message, Emotion } from '@/types';
import { CRISIS_KEYWORDS, CRISIS_RESPONSE_TEMPLATE, CRISIS_RESOURCES } from '@/lib/constants';

interface ConversationContext {
  companion: MoodCompanion;
  messages: Message[];
  currentMood?: {
    primary: Emotion;
    intensity: number;
  };
  recentPatterns?: string[];
}

// 위기 상황 감지
export function detectCrisis(message: string): { isCrisis: boolean; level: 'low' | 'medium' | 'high' } {
  const lowerMessage = message.toLowerCase();

  const highRiskKeywords = ['자살', '죽고싶', '삶을끝', '목숨을끊'];
  const mediumRiskKeywords = ['자해', '사라지고싶', '없어지고싶'];
  const lowRiskKeywords = ['살기싫', '죽을것같', '힘들어죽겠'];

  for (const keyword of highRiskKeywords) {
    if (lowerMessage.includes(keyword)) {
      return { isCrisis: true, level: 'high' };
    }
  }

  for (const keyword of mediumRiskKeywords) {
    if (lowerMessage.includes(keyword)) {
      return { isCrisis: true, level: 'medium' };
    }
  }

  for (const keyword of lowRiskKeywords) {
    if (lowerMessage.includes(keyword)) {
      return { isCrisis: true, level: 'low' };
    }
  }

  return { isCrisis: false, level: 'low' };
}

// 컴패니언 시스템 프롬프트 생성
export function buildSystemPrompt(
  companion: MoodCompanion,
  context?: { currentMood?: ConversationContext['currentMood']; recentPatterns?: string[] }
): string {
  const personalityGuide = getPersonalityGuide(companion.personality);

  return `당신은 ${companion.name}, MoodPal의 AI 감정 케어 컴패니언입니다.

## 당신의 역할
- 사용자의 감정에 공감하고 경청하는 친구
- 판단하지 않고, 있는 그대로 받아들이기
- 필요시 CBT 기반의 부드러운 질문으로 사고 전환 유도
- 절대 의료적 조언이나 진단을 하지 않음

## 당신의 성격: ${companion.personality}
${personalityGuide}

${context?.currentMood ? `## 사용자 현재 감정
- 감정: ${context.currentMood.primary} (강도: ${context.currentMood.intensity}/10)
${context.recentPatterns ? `- 최근 패턴: ${context.recentPatterns.join(', ')}` : ''}
` : ''}

## 대화 가이드라인

### 해야 할 것
1. 감정을 인정하고 공감 표현 ("그런 마음이 들 수 있어")
2. 열린 질문으로 더 이야기하도록 유도
3. 작은 긍정적 측면 함께 찾기 (강요하지 않고)
4. 필요시 마음챙김/호흡 기법 제안
5. 응답은 2-4문장으로 짧고 따뜻하게
6. 이모지 적절히 사용 (과하지 않게)

### 하지 말아야 할 것
1. "걱정하지 마", "괜찮아" 등 감정 무시
2. 해결책을 바로 제시
3. 비교 ("다른 사람들은...")
4. 진단이나 의료적 조언
5. 길고 장황한 응답
6. 가르치려는 어조

### 위기 상황 대응
자살, 자해 관련 표현 감지 시 즉시:
1. 안전을 최우선으로 확인
2. 전문 상담 리소스 안내 (자살예방상담전화 1393)
3. 따뜻하지만 명확하게 전문가 도움 권유

## 응답 스타일
- 자연스러운 반말 (친구처럼)
- 짧고 따뜻하게 (2-4문장)
- 질문으로 대화 이어가기
- 한국어로만 응답`;
}

function getPersonalityGuide(personality: string): string {
  switch (personality) {
    case 'warm_listener':
      return `- 따뜻하고 포용적인 어조
- "그랬구나", "힘들었겠다" 등 공감 표현 자주 사용
- 조언보다 경청 우선
- 사용자가 스스로 답을 찾도록 질문`;
    case 'gentle_guide':
      return `- 차분하고 안정적인 어조
- 호흡, 마음챙김 기법 자연스럽게 제안
- 현재 순간에 집중하도록 유도
- 감각에 주의를 기울이는 질문`;
    case 'cheerful_friend':
      return `- 밝고 긍정적이지만 강요하지 않는 어조
- 작은 것에서 기쁨 찾기 도움
- 유머 적절히 사용
- 에너지를 주되 감정 무시 안 함`;
    case 'calm_mentor':
      return `- 지혜롭고 차분한 어조
- 큰 그림 보기 도움
- 인생 경험에서 오는 통찰 공유
- 서두르지 않는 대화`;
    default:
      return '';
  }
}

// 감정 분석
export function analyzeEmotion(message: string): {
  detected: Emotion[];
  sentiment: number;
  intensity: number;
} {
  const emotions: Emotion[] = [];
  const lowerMessage = message.toLowerCase();

  // 간단한 키워드 기반 감정 분석
  const emotionKeywords: Record<Emotion, string[]> = {
    happy: ['기뻐', '행복', '좋아', '신나', '즐거'],
    sad: ['슬퍼', '우울', '눈물', '울', '서글'],
    angry: ['화나', '짜증', '분노', '열받', '빡'],
    anxious: ['불안', '걱정', '두려', '무서', '초조'],
    fearful: ['무서', '두려', '공포', '겁나'],
    disgusted: ['역겨', '싫어', '불쾌'],
    surprised: ['놀라', '깜짝', '충격'],
    calm: ['평온', '편안', '차분', '안정'],
    confused: ['혼란', '모르겠', '헷갈', '복잡'],
    hopeful: ['희망', '기대', '바라'],
    lonely: ['외로', '혼자', '쓸쓸'],
    frustrated: ['답답', '막막', '속상'],
    overwhelmed: ['벅차', '힘들', '지쳐', '피곤'],
    grateful: ['감사', '고마', '다행'],
    peaceful: ['평화', '고요'],
    excited: ['설레', '기대', '두근'],
    bored: ['지루', '심심', '따분'],
  };

  for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
    for (const keyword of keywords) {
      if (lowerMessage.includes(keyword)) {
        emotions.push(emotion as Emotion);
        break;
      }
    }
  }

  // 기본 감정 (감지 안 되면)
  if (emotions.length === 0) {
    emotions.push('calm');
  }

  // 감정 강도 추정
  const intensityWords = ['너무', '정말', '진짜', '엄청', '완전'];
  let intensity = 5;
  for (const word of intensityWords) {
    if (lowerMessage.includes(word)) {
      intensity = 7;
      break;
    }
  }

  // 부정/긍정 감정
  const negativeEmotions = ['sad', 'angry', 'anxious', 'fearful', 'lonely', 'frustrated', 'overwhelmed'];
  const positiveEmotions = ['happy', 'calm', 'hopeful', 'grateful', 'peaceful', 'excited'];

  let sentiment = 0;
  for (const emotion of emotions) {
    if (negativeEmotions.includes(emotion)) sentiment -= 0.3;
    if (positiveEmotions.includes(emotion)) sentiment += 0.3;
  }
  sentiment = Math.max(-1, Math.min(1, sentiment));

  return { detected: emotions, sentiment, intensity };
}

// 활동 추천
export function suggestActivity(emotions: Emotion[]): { id: string; title: string; description: string } | null {
  const hasNegative = emotions.some(e =>
    ['sad', 'angry', 'anxious', 'lonely', 'frustrated', 'overwhelmed'].includes(e)
  );

  if (hasNegative) {
    const suggestions = [
      { id: 'breathing', title: '3분 호흡', description: '잠깐 호흡에 집중해볼까요?' },
      { id: 'grounding', title: '그라운딩', description: '현재 순간으로 돌아오는 연습이에요' },
      { id: 'walk', title: '짧은 산책', description: '가볍게 걸으면서 환기해보는 건 어때요?' },
      { id: 'journal', title: '감정 일기', description: '마음을 글로 정리해볼까요?' },
    ];
    return suggestions[Math.floor(Math.random() * suggestions.length)];
  }

  return null;
}

// 메시지 포맷팅 (API 호출용)
export function formatMessagesForAPI(
  messages: Message[],
  systemPrompt: string
): { role: 'user' | 'assistant'; content: string }[] {
  return messages.map(m => ({
    role: m.role === 'companion' ? 'assistant' as const : 'user' as const,
    content: m.content,
  }));
}
