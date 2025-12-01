import { NextRequest, NextResponse } from 'next/server';

// 감정 체크인 저장
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const {
      primaryMood,
      secondaryMood,
      intensity,
      valence,
      arousal,
      activities,
      location,
      socialContext,
      bodyFeelings,
      sleepQuality,
      energyLevel,
      note,
    } = data;

    if (!primaryMood) {
      return NextResponse.json(
        { error: '기본 감정이 필요합니다.' },
        { status: 400 }
      );
    }

    // TODO: 실제 DB 저장 (Prisma)
    // const moodEntry = await prisma.moodEntry.create({
    //   data: { ... }
    // });

    // AI 인사이트 생성 (간단한 버전)
    const aiInsights = generateMoodInsights(primaryMood, intensity, activities);

    // 시뮬레이션된 저장 결과
    const moodEntry = {
      id: crypto.randomUUID?.() || `${Date.now()}`,
      createdAt: new Date().toISOString(),
      primaryMood,
      secondaryMood,
      intensity,
      valence: valence ?? calculateValence(primaryMood),
      arousal: arousal ?? calculateArousal(primaryMood, intensity),
      activities: activities || [],
      location,
      socialContext,
      bodyFeelings: bodyFeelings || [],
      sleepQuality,
      energyLevel,
      note,
      aiInsights,
    };

    return NextResponse.json({
      success: true,
      data: moodEntry,
    });

  } catch (error) {
    console.error('Mood API Error:', error);
    return NextResponse.json(
      { error: '감정 기록 저장 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 감정 기록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'week'; // 'day', 'week', 'month'
    const limit = parseInt(searchParams.get('limit') || '20');

    // TODO: 실제 DB 조회 (Prisma)
    // const moodEntries = await prisma.moodEntry.findMany({
    //   where: { userId: session.user.id },
    //   orderBy: { createdAt: 'desc' },
    //   take: limit,
    // });

    // 시뮬레이션 데이터
    const moodEntries = generateSampleMoodData(7);

    return NextResponse.json({
      success: true,
      data: moodEntries,
    });

  } catch (error) {
    console.error('Mood GET Error:', error);
    return NextResponse.json(
      { error: '감정 기록 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 감정에 따른 valence 계산
function calculateValence(mood: string): number {
  const valenceMap: Record<string, number> = {
    happy: 0.8,
    excited: 0.7,
    grateful: 0.7,
    peaceful: 0.6,
    hopeful: 0.5,
    calm: 0.4,
    surprised: 0.2,
    confused: -0.1,
    bored: -0.2,
    anxious: -0.4,
    frustrated: -0.5,
    lonely: -0.5,
    sad: -0.6,
    angry: -0.6,
    overwhelmed: -0.7,
    fearful: -0.7,
    disgusted: -0.6,
  };
  return valenceMap[mood] ?? 0;
}

// 감정에 따른 arousal 계산
function calculateArousal(mood: string, intensity: number): number {
  const arousalMap: Record<string, number> = {
    excited: 8,
    angry: 8,
    anxious: 7,
    fearful: 7,
    overwhelmed: 6,
    frustrated: 6,
    happy: 6,
    surprised: 6,
    hopeful: 5,
    confused: 5,
    lonely: 4,
    grateful: 4,
    sad: 3,
    calm: 3,
    peaceful: 2,
    bored: 2,
    disgusted: 4,
  };
  const base = arousalMap[mood] ?? 5;
  // intensity가 높을수록 arousal도 조정
  return Math.min(10, Math.round(base * (intensity / 10) + 2));
}

// AI 인사이트 생성
function generateMoodInsights(mood: string, intensity: number, activities: string[]) {
  const affirmations: Record<string, string[]> = {
    happy: [
      '오늘의 기쁨을 충분히 느껴보세요.',
      '행복한 순간을 기억해두면 힘들 때 도움이 돼요.',
    ],
    sad: [
      '슬픔을 느끼는 것도 괜찮아요.',
      '모든 감정은 지나가요. 지금 느끼는 것에 친절해지세요.',
    ],
    anxious: [
      '불안은 자연스러운 감정이에요. 호흡에 집중해보세요.',
      '지금 이 순간에 집중하면 불안이 조금 줄어들 수 있어요.',
    ],
    angry: [
      '화가 나는 것도 자연스러운 거예요.',
      '감정을 인정하고, 천천히 내려놓아 보세요.',
    ],
    calm: [
      '평온한 상태를 유지하고 있네요. 잘하고 있어요.',
      '이 차분한 에너지를 즐겨보세요.',
    ],
    default: [
      '오늘 하루도 수고했어요.',
      '자신의 감정을 기록하는 것 자체가 의미 있는 일이에요.',
    ],
  };

  const suggestions = [];

  if (intensity >= 7) {
    if (['sad', 'anxious', 'angry', 'overwhelmed'].includes(mood)) {
      suggestions.push('강도가 높네요. 3분 호흡 명상을 추천해요.');
    }
  }

  if (activities.length === 0) {
    suggestions.push('오늘 무엇을 했는지 기록하면 패턴을 파악하는 데 도움이 돼요.');
  }

  const moodAffirmations = affirmations[mood] || affirmations.default;

  return {
    summary: `오늘은 ${mood} 감정을 느끼고 있네요.`,
    patterns: [],
    suggestions,
    affirmation: moodAffirmations[Math.floor(Math.random() * moodAffirmations.length)],
  };
}

// 샘플 데이터 생성 (개발용)
function generateSampleMoodData(days: number) {
  const moods = ['happy', 'sad', 'anxious', 'calm', 'frustrated', 'grateful', 'peaceful'];
  const entries = [];

  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    entries.push({
      id: `sample-${i}`,
      createdAt: date.toISOString(),
      primaryMood: moods[Math.floor(Math.random() * moods.length)],
      intensity: Math.floor(Math.random() * 5) + 3,
      valence: (Math.random() * 2) - 1,
      arousal: Math.floor(Math.random() * 5) + 3,
      activities: [],
    });
  }

  return entries;
}
