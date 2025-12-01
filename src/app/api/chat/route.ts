import { NextRequest, NextResponse } from 'next/server';
import {
  detectCrisis,
  buildSystemPrompt,
  analyzeEmotion,
  suggestActivity,
  formatMessagesForAPI
} from '@/lib/ai/companion';
import { CRISIS_RESPONSE_TEMPLATE, CRISIS_RESOURCES, COMPANIONS } from '@/lib/constants';
import { Message } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { message, messages, companionId, currentMood } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: '메시지가 필요합니다.' },
        { status: 400 }
      );
    }

    // 1. 위기 상황 체크 (최우선)
    const crisisCheck = detectCrisis(message);
    if (crisisCheck.isCrisis) {
      return NextResponse.json({
        message: CRISIS_RESPONSE_TEMPLATE,
        isCrisis: true,
        crisisLevel: crisisCheck.level,
        crisisResources: CRISIS_RESOURCES,
        emotionAnalysis: {
          detected: ['overwhelmed'],
          sentiment: -0.8,
          intensity: 9,
        },
      });
    }

    // 2. 감정 분석
    const emotionAnalysis = analyzeEmotion(message);

    // 3. 컴패니언 찾기
    const companion = COMPANIONS.find(c => c.id === companionId) || COMPANIONS[0];

    // 4. 시스템 프롬프트 생성
    const systemPrompt = buildSystemPrompt(companion, { currentMood });

    // 5. API 호출 준비
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      // API 키가 없으면 시뮬레이션 응답
      return NextResponse.json({
        message: getSimulatedResponse(companion.personality, emotionAnalysis.detected[0]),
        emotionAnalysis,
        suggestedActivity: suggestActivity(emotionAnalysis.detected),
        isCrisis: false,
      });
    }

    // 6. Claude API 호출
    const formattedMessages = messages ? formatMessagesForAPI(messages, systemPrompt) : [];
    formattedMessages.push({ role: 'user', content: message });

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 300,
        system: systemPrompt,
        messages: formattedMessages,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Claude API Error:', errorText);
      // API 에러 시 시뮬레이션 응답
      return NextResponse.json({
        message: getSimulatedResponse(companion.personality, emotionAnalysis.detected[0]),
        emotionAnalysis,
        suggestedActivity: suggestActivity(emotionAnalysis.detected),
        isCrisis: false,
      });
    }

    const data = await response.json();
    const aiMessage = data.content[0]?.text || '미안해요, 잠시 문제가 생겼어요. 다시 말해줄래요?';

    // 7. 활동 추천 (필요시)
    const suggestedActivityResult = suggestActivity(emotionAnalysis.detected);

    return NextResponse.json({
      message: aiMessage,
      emotionAnalysis,
      suggestedActivity: suggestedActivityResult,
      isCrisis: false,
    });

  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: '대화 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// API 키 없을 때 시뮬레이션 응답
function getSimulatedResponse(personality: string, emotion: string): string {
  const responses: Record<string, Record<string, string[]>> = {
    warm_listener: {
      sad: [
        '그랬구나... 많이 힘들었겠다. 💜 더 이야기해줄래?',
        '마음이 무겁겠다. 네 감정은 충분히 이해할 수 있어.',
        '힘든 시간을 보내고 있구나. 여기서 편하게 이야기해도 돼.',
      ],
      anxious: [
        '불안한 마음이 드는구나. 그런 감정 느끼는 거 당연해.',
        '마음이 많이 불안하구나. 지금 이 순간, 천천히 숨 쉬어보자.',
        '걱정되는 마음 충분히 이해해. 함께 이야기해볼까?',
      ],
      angry: [
        '화가 많이 났구나. 그럴 만한 상황이었던 것 같아.',
        '답답하고 화나는 마음, 느껴져. 어떤 일이 있었어?',
        '그 감정 충분히 이해해. 더 이야기해줄래?',
      ],
      default: [
        '오늘 하루 어땠어? 어떤 이야기든 들을 준비가 돼 있어. 💜',
        '지금 어떤 마음이야? 편하게 나눠줘.',
        '네 이야기가 궁금해. 오늘은 어땠어?',
      ],
    },
    gentle_guide: {
      sad: [
        '지금 이 순간, 네 마음을 느껴보자. 어떤 감각이 느껴져?',
        '슬픈 감정이 찾아왔구나. 잠깐 호흡에 집중해볼까?',
        '마음이 무겁구나. 지금 몸은 어때? 어디가 긴장돼 있어?',
      ],
      anxious: [
        '불안할 때는 호흡이 도움이 돼. 천천히 들이쉬고... 내쉬어보자.',
        '지금 이 순간에 집중해보자. 주변에서 뭐가 보여?',
        '마음이 많이 불안하구나. 잠깐 5-4-3-2-1 그라운딩 해볼까?',
      ],
      default: [
        '지금 이 순간, 네 마음은 어떤 상태야?',
        '오늘 하루, 마음에 남는 순간이 있었어?',
        '지금 몸과 마음의 상태를 한번 느껴보자.',
      ],
    },
    cheerful_friend: {
      sad: [
        '힘든 일이 있었구나. 이야기 들어줄게! 뭐가 있었어?',
        '그래도 여기 나한테 말해줘서 고마워. 같이 이야기하자!',
        '슬픈 날도 있지. 오늘은 어떤 일이 있었어?',
      ],
      happy: [
        '오! 좋은 일 있었어? 나도 덩달아 기분 좋아지네! ✨',
        '기분 좋아 보인다! 무슨 일이야?',
        '행복한 에너지가 느껴져! 어떤 좋은 일이 있었어?',
      ],
      default: [
        '안녕! 오늘은 어땠어? 재밌는 일 있었어? ✨',
        '반가워! 오늘 기분은 어때?',
        '하이! 오늘 하루 잘 보냈어?',
      ],
    },
  };

  const personalityResponses = responses[personality] || responses.warm_listener;
  const emotionResponses = personalityResponses[emotion] || personalityResponses.default;

  return emotionResponses[Math.floor(Math.random() * emotionResponses.length)];
}
