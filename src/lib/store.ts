import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { MoodState, Emotion, MoodCompanion, Message } from '@/types';
import { COMPANIONS } from '@/lib/constants';

// 사용자 스토어
interface UserState {
  user: {
    id?: string;
    email?: string;
    name?: string;
    image?: string;
    plan: 'free' | 'premium' | 'premium_plus';
  } | null;
  preferences: {
    companionId: string;
    notificationEnabled: boolean;
    checkInReminder: string | null;
    darkMode: boolean;
  };
  setUser: (user: UserState['user']) => void;
  updatePreferences: (prefs: Partial<UserState['preferences']>) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      preferences: {
        companionId: 'hana',
        notificationEnabled: true,
        checkInReminder: 'evening',
        darkMode: false,
      },
      setUser: (user) => set({ user }),
      updatePreferences: (prefs) =>
        set((state) => ({
          preferences: { ...state.preferences, ...prefs },
        })),
      logout: () => set({ user: null }),
    }),
    {
      name: 'moodpal-user',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// 감정 체크인 스토어
interface MoodCheckInState {
  isOpen: boolean;
  step: number;
  data: {
    primaryMood: Emotion | null;
    secondaryMood: Emotion | null;
    intensity: number;
    bodyFeelings: string[];
    activities: string[];
    note: string;
  };
  openCheckIn: () => void;
  closeCheckIn: () => void;
  nextStep: () => void;
  prevStep: () => void;
  setStep: (step: number) => void;
  updateData: (data: Partial<MoodCheckInState['data']>) => void;
  reset: () => void;
}

const initialMoodData = {
  primaryMood: null,
  secondaryMood: null,
  intensity: 5,
  bodyFeelings: [],
  activities: [],
  note: '',
};

export const useMoodCheckInStore = create<MoodCheckInState>((set) => ({
  isOpen: false,
  step: 1,
  data: initialMoodData,
  openCheckIn: () => set({ isOpen: true, step: 1, data: initialMoodData }),
  closeCheckIn: () => set({ isOpen: false }),
  nextStep: () => set((state) => ({ step: Math.min(state.step + 1, 4) })),
  prevStep: () => set((state) => ({ step: Math.max(state.step - 1, 1) })),
  setStep: (step) => set({ step }),
  updateData: (data) =>
    set((state) => ({
      data: { ...state.data, ...data },
    })),
  reset: () => set({ step: 1, data: initialMoodData }),
}));

// 대화 스토어
interface ConversationState {
  conversationId: string | null;
  companion: MoodCompanion;
  messages: Message[];
  isLoading: boolean;
  isCrisisMode: boolean;
  startConversation: (companionId?: string) => void;
  addMessage: (message: Message) => void;
  setLoading: (loading: boolean) => void;
  setCrisisMode: (crisis: boolean) => void;
  clearConversation: () => void;
}

export const useConversationStore = create<ConversationState>((set) => ({
  conversationId: null,
  companion: COMPANIONS[0],
  messages: [],
  isLoading: false,
  isCrisisMode: false,
  startConversation: (companionId = 'hana') => {
    const companion = COMPANIONS.find((c) => c.id === companionId) || COMPANIONS[0];
    set({
      conversationId: crypto.randomUUID?.() || `${Date.now()}`,
      companion,
      messages: [
        {
          id: '1',
          role: 'companion',
          content: getGreetingMessage(companion),
          createdAt: new Date(),
        },
      ],
      isLoading: false,
      isCrisisMode: false,
    });
  },
  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),
  setLoading: (loading) => set({ isLoading: loading }),
  setCrisisMode: (crisis) => set({ isCrisisMode: crisis }),
  clearConversation: () =>
    set({
      conversationId: null,
      messages: [],
      isLoading: false,
      isCrisisMode: false,
    }),
}));

function getGreetingMessage(companion: MoodCompanion): string {
  const hour = new Date().getHours();
  let greeting = '';

  if (hour < 6) greeting = '늦은 밤까지 깨어 있네요.';
  else if (hour < 12) greeting = '좋은 아침이에요!';
  else if (hour < 18) greeting = '오후도 잘 보내고 있어요?';
  else if (hour < 22) greeting = '저녁 시간이에요.';
  else greeting = '밤이 깊어가고 있네요.';

  switch (companion.personality) {
    case 'warm_listener':
      return `${greeting} 저는 ${companion.name}이에요. 오늘 하루는 어땠어요? 어떤 이야기든 편하게 나눠주세요. 💜`;
    case 'gentle_guide':
      return `${greeting} ${companion.name}에요. 지금 이 순간, 당신의 마음은 어떤가요? 함께 알아가 볼까요?`;
    case 'cheerful_friend':
      return `${greeting} 안녕! ${companion.name}이야! 오늘 기분이 어때? 재밌는 이야기든, 힘든 이야기든 다 좋아! ✨`;
    default:
      return `${greeting} 저는 ${companion.name}이에요. 오늘 하루 어떠셨어요?`;
  }
}

// 명상 플레이어 스토어
interface MeditationPlayerState {
  isPlaying: boolean;
  currentProgramId: string | null;
  progress: number;
  duration: number;
  setPlaying: (playing: boolean) => void;
  setProgram: (programId: string, duration: number) => void;
  setProgress: (progress: number) => void;
  reset: () => void;
}

export const useMeditationPlayerStore = create<MeditationPlayerState>((set) => ({
  isPlaying: false,
  currentProgramId: null,
  progress: 0,
  duration: 0,
  setPlaying: (playing) => set({ isPlaying: playing }),
  setProgram: (programId, duration) =>
    set({
      currentProgramId: programId,
      duration,
      progress: 0,
      isPlaying: false,
    }),
  setProgress: (progress) => set({ progress }),
  reset: () =>
    set({
      isPlaying: false,
      currentProgramId: null,
      progress: 0,
      duration: 0,
    }),
}));

// 오늘의 상태 스토어
interface TodayState {
  todayMood: MoodState | null;
  checkInCount: number;
  conversationCount: number;
  meditationMinutes: number;
  setTodayMood: (mood: MoodState) => void;
  incrementCheckIn: () => void;
  incrementConversation: () => void;
  addMeditationMinutes: (minutes: number) => void;
  resetDaily: () => void;
}

export const useTodayStore = create<TodayState>()(
  persist(
    (set) => ({
      todayMood: null,
      checkInCount: 0,
      conversationCount: 0,
      meditationMinutes: 0,
      setTodayMood: (mood) => set({ todayMood: mood }),
      incrementCheckIn: () =>
        set((state) => ({ checkInCount: state.checkInCount + 1 })),
      incrementConversation: () =>
        set((state) => ({ conversationCount: state.conversationCount + 1 })),
      addMeditationMinutes: (minutes) =>
        set((state) => ({
          meditationMinutes: state.meditationMinutes + minutes,
        })),
      resetDaily: () =>
        set({
          todayMood: null,
          checkInCount: 0,
          conversationCount: 0,
          meditationMinutes: 0,
        }),
    }),
    {
      name: 'moodpal-today',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
