import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}

export function formatTime(date: Date | string): string {
  return new Intl.DateTimeFormat('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const target = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - target.getTime()) / 1000);

  if (diffInSeconds < 60) return '방금 전';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}시간 전`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}일 전`;

  return formatDate(date);
}

export function getMoodEmoji(mood: string): string {
  const emojis: Record<string, string> = {
    happy: '😊',
    sad: '😢',
    angry: '😠',
    anxious: '😰',
    fearful: '😨',
    disgusted: '🤢',
    surprised: '😮',
    calm: '😌',
    confused: '😕',
    hopeful: '🙂',
    lonely: '😔',
    frustrated: '😤',
    overwhelmed: '😩',
    grateful: '🙏',
    peaceful: '😇',
    excited: '🤩',
    bored: '😐',
  };
  return emojis[mood] || '😐';
}

export function getMoodColor(mood: string): string {
  const colors: Record<string, string> = {
    happy: '#FCD34D',
    sad: '#60A5FA',
    angry: '#F87171',
    anxious: '#A78BFA',
    fearful: '#F472B6',
    disgusted: '#34D399',
    surprised: '#FBBF24',
    calm: '#34D399',
    confused: '#9CA3AF',
    hopeful: '#A3E635',
    lonely: '#818CF8',
    frustrated: '#FB923C',
    overwhelmed: '#F97316',
    grateful: '#4ADE80',
    peaceful: '#22D3EE',
    excited: '#F472B6',
    bored: '#9CA3AF',
  };
  return colors[mood] || '#9CA3AF';
}

export function getMoodLabel(mood: string): string {
  const labels: Record<string, string> = {
    happy: '행복해요',
    sad: '슬퍼요',
    angry: '화나요',
    anxious: '불안해요',
    fearful: '두려워요',
    disgusted: '역겨워요',
    surprised: '놀랐어요',
    calm: '차분해요',
    confused: '혼란스러워요',
    hopeful: '희망차요',
    lonely: '외로워요',
    frustrated: '답답해요',
    overwhelmed: '벅차요',
    grateful: '감사해요',
    peaceful: '평화로워요',
    excited: '설레요',
    bored: '지루해요',
  };
  return labels[mood] || mood;
}

export function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    breathing: '호흡 명상',
    body_scan: '바디스캔',
    walking: '걷기 명상',
    sleep: '수면',
    anxiety_relief: '불안 완화',
    stress_relief: '스트레스 해소',
    morning_routine: '아침 루틴',
    evening_wind_down: '저녁 마무리',
    focus: '집중력',
    self_compassion: '자기자비',
    gratitude: '감사',
    sos: 'SOS',
  };
  return labels[category] || category;
}

export function getDistortionLabel(distortion: string): string {
  const labels: Record<string, string> = {
    all_or_nothing: '흑백논리',
    overgeneralization: '과일반화',
    mental_filter: '부정적 필터',
    disqualifying_positive: '긍정 폄하',
    jumping_to_conclusions: '성급한 결론',
    magnification: '확대/축소',
    emotional_reasoning: '감정적 추론',
    should_statements: '당위적 사고',
    labeling: '낙인찍기',
    personalization: '개인화',
  };
  return labels[distortion] || distortion;
}

export function calculateSleepDuration(bedTime: Date, wakeTime: Date): number {
  let duration = (wakeTime.getTime() - bedTime.getTime()) / (1000 * 60);
  if (duration < 0) duration += 24 * 60; // 다음날 기상
  return Math.round(duration);
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}분`;
  if (mins === 0) return `${hours}시간`;
  return `${hours}시간 ${mins}분`;
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 6) return '늦은 밤이에요';
  if (hour < 12) return '좋은 아침이에요';
  if (hour < 18) return '좋은 오후예요';
  if (hour < 22) return '좋은 저녁이에요';
  return '편안한 밤이에요';
}

export function generateId(): string {
  return crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
