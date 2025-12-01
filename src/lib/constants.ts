import { MoodCompanion, CrisisResource, MindfulnessProgram, Activity } from '@/types';

// 서비스 범위 명확화
export const SERVICE_SCOPE = {
  // MoodPal이 제공하는 것
  provides: [
    '감정 기록 및 트래킹',
    '마음챙김/명상 가이드',
    'CBT 기반 자가관리 도구',
    'AI 대화 상대 (공감, 경청)',
    '스트레스/불안 관리 기법',
    '수면 개선 프로그램',
    '전문가 연결 서비스',
  ],

  // MoodPal이 제공하지 않는 것
  doesNotProvide: [
    '의료적 진단',
    '처방 또는 치료',
    '위기 상황 직접 개입',
    '전문 상담사 대체',
  ],
};

// 면책 조항
export const DISCLAIMER = `
MoodPal은 전문 의료 서비스가 아닙니다.
심각한 정신건강 문제가 있다면 전문가 상담을 권장합니다.
위기 상황시 자살예방상담전화 1393으로 연락하세요.
`;

// 위기 키워드
export const CRISIS_KEYWORDS = [
  '자살', '죽고싶', '죽을', '자해', '끝내고싶',
  '사라지고싶', '없어지고싶', '살기싫', '삶을끝',
  '목숨', '삶을마감',
];

// 위기 상황 리소스
export const CRISIS_RESOURCES: CrisisResource[] = [
  { name: '자살예방상담전화', number: '1393', description: '24시간 운영' },
  { name: '정신건강위기상담전화', number: '1577-0199', description: '24시간 운영' },
  { name: '생명의전화', number: '1588-9191', description: '24시간 운영' },
];

// 위기 상황 응답 템플릿
export const CRISIS_RESPONSE_TEMPLATE = `지금 많이 힘드시군요. 당신의 안전이 가장 중요해요.

전문 상담이 도움이 될 수 있어요.
자살예방상담전화 1393 (24시간)으로 연락해주세요.

제가 계속 함께 있을게요. 💙`;

// AI 컴패니언 목록
export const COMPANIONS: MoodCompanion[] = [
  {
    id: 'hana',
    name: '하나',
    avatar: '/companions/hana.png',
    personality: 'warm_listener',
    voiceId: 'korean-female-warm',
    description: '항상 당신 편에서 들어주는 따뜻한 친구',
  },
  {
    id: 'miru',
    name: '미루',
    avatar: '/companions/miru.png',
    personality: 'gentle_guide',
    voiceId: 'korean-female-calm',
    description: '마음챙김과 명상을 안내하는 차분한 가이드',
  },
  {
    id: 'bom',
    name: '봄',
    avatar: '/companions/bom.png',
    personality: 'cheerful_friend',
    voiceId: 'korean-female-bright',
    description: '작은 것에서 기쁨을 찾도록 돕는 밝은 친구',
  },
];

// 감정 목록
export const EMOTIONS = [
  { id: 'happy', label: '행복해요', emoji: '😊', color: '#FCD34D' },
  { id: 'sad', label: '슬퍼요', emoji: '😢', color: '#60A5FA' },
  { id: 'angry', label: '화나요', emoji: '😠', color: '#F87171' },
  { id: 'anxious', label: '불안해요', emoji: '😰', color: '#A78BFA' },
  { id: 'calm', label: '차분해요', emoji: '😌', color: '#34D399' },
  { id: 'frustrated', label: '답답해요', emoji: '😤', color: '#FB923C' },
  { id: 'lonely', label: '외로워요', emoji: '😔', color: '#818CF8' },
  { id: 'overwhelmed', label: '벅차요', emoji: '😩', color: '#F97316' },
  { id: 'grateful', label: '감사해요', emoji: '🙏', color: '#4ADE80' },
  { id: 'peaceful', label: '평화로워요', emoji: '😇', color: '#22D3EE' },
  { id: 'excited', label: '설레요', emoji: '🤩', color: '#F472B6' },
  { id: 'hopeful', label: '희망차요', emoji: '🙂', color: '#A3E635' },
  { id: 'confused', label: '혼란스러워요', emoji: '😕', color: '#9CA3AF' },
  { id: 'bored', label: '지루해요', emoji: '😐', color: '#9CA3AF' },
];

// 신체 느낌 목록
export const BODY_FEELINGS = [
  { id: 'tense_shoulders', label: '어깨가 긴장돼요', icon: '💪' },
  { id: 'heavy_chest', label: '가슴이 답답해요', icon: '💔' },
  { id: 'headache', label: '머리가 아파요', icon: '🤕' },
  { id: 'stomach_ache', label: '배가 불편해요', icon: '🤢' },
  { id: 'fatigue', label: '피곤해요', icon: '😴' },
  { id: 'restless', label: '안절부절해요', icon: '😬' },
  { id: 'light', label: '가벼워요', icon: '🎈' },
  { id: 'energized', label: '활력이 넘쳐요', icon: '⚡' },
];

// 활동 목록
export const ACTIVITIES: Activity[] = [
  { id: 'work', title: '일/공부', category: 'achievement', icon: '💼' },
  { id: 'exercise', title: '운동', category: 'physical', icon: '🏃' },
  { id: 'social', title: '사람들과 시간', category: 'social', icon: '👥' },
  { id: 'hobby', title: '취미 활동', category: 'pleasure', icon: '🎨' },
  { id: 'rest', title: '휴식', category: 'relaxation', icon: '🛋️' },
  { id: 'nature', title: '자연 속에서', category: 'nature', icon: '🌳' },
  { id: 'meditation', title: '명상/요가', category: 'self_care', icon: '🧘' },
  { id: 'reading', title: '독서', category: 'pleasure', icon: '📚' },
  { id: 'music', title: '음악 감상', category: 'pleasure', icon: '🎵' },
  { id: 'cooking', title: '요리', category: 'creative', icon: '🍳' },
  { id: 'cleaning', title: '청소/정리', category: 'achievement', icon: '🧹' },
  { id: 'shopping', title: '쇼핑', category: 'pleasure', icon: '🛍️' },
];

// 인지 왜곡 정보
export const COGNITIVE_DISTORTIONS = {
  all_or_nothing: {
    name: '흑백논리',
    description: '모든 것을 극단적으로 보는 경향',
    example: '"시험에서 한 문제 틀렸으니 난 실패자야"',
    reframe: '"한 문제 틀렸지만 대부분은 맞았어. 완벽하지 않아도 괜찮아."',
  },
  overgeneralization: {
    name: '과일반화',
    description: '한 번의 일로 항상 그럴 것이라 생각',
    example: '"이번에도 거절당했어. 난 항상 거절당해"',
    reframe: '"이번 한 번이 모든 상황을 대표하진 않아."',
  },
  mental_filter: {
    name: '부정적 필터',
    description: '부정적인 것만 골라서 보는 경향',
    example: '"칭찬 10개 받았지만 비판 1개가 계속 생각나"',
    reframe: '"좋은 피드백도 많았어. 전체적으로 보면 긍정적이야."',
  },
  disqualifying_positive: {
    name: '긍정 폄하',
    description: '긍정적인 것을 인정하지 않는 경향',
    example: '"운이 좋았을 뿐이야. 내 실력이 아니야"',
    reframe: '"내가 노력한 결과도 분명히 있어."',
  },
  jumping_to_conclusions: {
    name: '성급한 결론',
    description: '근거 없이 부정적인 결론을 내리는 경향',
    example: '"답장이 늦네. 분명 나를 싫어하는 거야"',
    reframe: '"바쁜 걸 수도 있어. 확인해보기 전까지는 모르지."',
  },
  magnification: {
    name: '확대/축소',
    description: '나쁜 것은 크게, 좋은 것은 작게 보는 경향',
    example: '"작은 실수가 모든 걸 망칠 거야"',
    reframe: '"실수가 있지만 전체적인 영향은 크지 않아."',
  },
  emotional_reasoning: {
    name: '감정적 추론',
    description: '감정을 사실로 받아들이는 경향',
    example: '"기분이 우울하니까 상황도 최악인 거야"',
    reframe: '"기분이 안 좋다고 상황이 나쁜 건 아니야."',
  },
  should_statements: {
    name: '당위적 사고',
    description: '"~해야 한다"로 자신을 옥죄는 경향',
    example: '"항상 완벽해야 해. 실수하면 안 돼"',
    reframe: '"완벽하지 않아도 괜찮아. 인간이니까."',
  },
  labeling: {
    name: '낙인찍기',
    description: '자신이나 타인에게 극단적인 꼬리표를 붙이는 경향',
    example: '"난 루저야. 아무것도 못해"',
    reframe: '"한 번의 실패가 나 전체를 정의하지 않아."',
  },
  personalization: {
    name: '개인화',
    description: '모든 일을 자신 탓으로 돌리는 경향',
    example: '"팀 프로젝트가 망한 건 다 내 탓이야"',
    reframe: '"여러 요인이 있었고, 내가 할 수 있는 건 다 했어."',
  },
};

// 인지 왜곡 배열 (UI용)
export const COGNITIVE_DISTORTIONS_LIST = Object.entries(COGNITIVE_DISTORTIONS).map(
  ([id, data]) => ({
    id,
    ...data,
  })
);

// 명상 프로그램 (샘플)
export const MEDITATION_PROGRAMS: MindfulnessProgram[] = [
  // SOS (무료)
  {
    id: 'sos-3min-breathing',
    title: '3분 호흡',
    description: '급할 때 바로 마음을 가라앉히는 호흡법',
    category: 'sos',
    duration: 3,
    difficulty: 'beginner',
    type: 'audio',
    instructor: '미루',
    targetEmotions: ['anxious', 'overwhelmed', 'angry'],
    benefits: ['즉각적인 긴장 완화', '마음 진정'],
    accessType: 'free',
  },
  {
    id: 'sos-grounding',
    title: '5-4-3-2-1 그라운딩',
    description: '불안할 때 현재로 돌아오는 감각 명상',
    category: 'sos',
    duration: 5,
    difficulty: 'beginner',
    type: 'text_guided',
    instructor: '미루',
    targetEmotions: ['anxious', 'fearful', 'confused'],
    benefits: ['불안 완화', '현재에 집중'],
    accessType: 'free',
  },
  // 호흡 명상
  {
    id: 'breathing-basic',
    title: '기본 호흡 명상',
    description: '호흡에 집중하며 마음을 가라앉히는 명상',
    category: 'breathing',
    duration: 10,
    difficulty: 'beginner',
    type: 'audio',
    instructor: '미루',
    targetEmotions: ['anxious', 'overwhelmed'],
    benefits: ['스트레스 감소', '집중력 향상'],
    accessType: 'free',
  },
  // 수면
  {
    id: 'sleep-story-forest',
    title: '숲속 산책 이야기',
    description: '편안한 숲속을 거니는 수면 스토리',
    category: 'sleep',
    duration: 20,
    difficulty: 'beginner',
    type: 'audio',
    instructor: '하나',
    targetEmotions: ['anxious', 'overwhelmed'],
    benefits: ['수면 유도', '긴장 이완'],
    accessType: 'premium',
  },
  {
    id: 'sleep-body-scan',
    title: '수면 바디스캔',
    description: '온몸의 긴장을 풀어주는 수면 명상',
    category: 'sleep',
    duration: 15,
    difficulty: 'beginner',
    type: 'audio',
    instructor: '미루',
    targetEmotions: ['anxious', 'overwhelmed'],
    benefits: ['근육 이완', '수면 유도'],
    accessType: 'premium',
  },
  // 자기자비
  {
    id: 'self-compassion-basic',
    title: '나에게 따뜻하게',
    description: '자기 자신에게 친절해지는 명상',
    category: 'self_compassion',
    duration: 12,
    difficulty: 'beginner',
    type: 'audio',
    instructor: '하나',
    targetEmotions: ['sad', 'lonely', 'frustrated'],
    benefits: ['자존감 향상', '자기수용'],
    accessType: 'premium',
  },
  // 감사
  {
    id: 'gratitude-evening',
    title: '하루 감사 명상',
    description: '오늘 하루 감사한 것들을 떠올리는 저녁 명상',
    category: 'gratitude',
    duration: 8,
    difficulty: 'beginner',
    type: 'audio',
    instructor: '봄',
    targetEmotions: ['sad', 'lonely'],
    benefits: ['긍정적 마음', '수면 준비'],
    accessType: 'free',
  },
];

// 구독 플랜
export const SUBSCRIPTION_PLANS = {
  free: {
    name: '시작하기',
    price: 0,
    features: [
      '일일 감정 체크인',
      'AI 대화 3회/일',
      '무료 명상 5개',
      'SOS 호흡 (무제한)',
      '기본 통계',
    ],
    limitations: [
      'CBT 도구 제한',
      '수면 프로그램 제한',
      '전문가 연결 불가',
    ],
  },
  premium: {
    name: '프리미엄',
    monthlyPrice: 6900,
    yearlyPrice: 55000,
    features: [
      'AI 대화 무제한',
      '100+ 명상 프로그램',
      'CBT 도구 전체',
      '수면 프로그램 전체',
      '상세 분석 리포트',
      'AI 맞춤 추천',
      '광고 제거',
      '오프라인 다운로드',
      '전문가 상담 10% 할인',
    ],
  },
  premium_plus: {
    name: '프리미엄+',
    monthlyPrice: 14900,
    yearlyPrice: 119000,
    features: [
      '프리미엄 모든 기능',
      '전문 상담 월 1회 포함',
      '그룹 세션 접근',
      '커뮤니티 프리미엄',
    ],
  },
};
