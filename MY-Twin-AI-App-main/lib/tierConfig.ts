export interface TierConfig {
  tokens: number; conversations: number; memoryDays: number;
  memoryTypes: number; images: number; files: number;
  mic: boolean; camera: boolean | number;
  notifications: { min: number; max: number };
  dreamAnalysis: boolean; lifeCoaching: boolean; webSearch: boolean;
  voiceQuality: 'none' | 'basic' | 'advanced';
  customization: 'basic' | 'advanced' | 'full';
  smartHome: boolean; mediaIntegration: boolean;
  calendar: boolean; telegram: boolean; email: boolean;
  hybridAI: 'gemini' | 'gemini+groq' | 'full';
  support: 'community' | 'email' | 'priority' | 'vip';
  earlyTokens?: number;   // أول أسبوع
  week2Tokens?: number;   // الأسبوع الثاني
  week3Tokens?: number;   // الأسبوع الثالث
}

export const TIERS: Record<string, TierConfig> = {
  free: {
    tokens: 500, earlyTokens: 1500, week2Tokens: 1000, week3Tokens: 700,
    conversations: 30, memoryDays: 3,
    memoryTypes: 1, images: 1, files: 1,
    mic: false, camera: false,
    notifications: { min: 1, max: 3 },
    dreamAnalysis: false, lifeCoaching: false, webSearch: false,
    voiceQuality: 'none', customization: 'basic',
    smartHome: false, mediaIntegration: false,
    calendar: false, telegram: false, email: false,
    hybridAI: 'gemini', support: 'community',
  },
  plus: {
    tokens: 1500, conversations: 50, memoryDays: 7,
    memoryTypes: 3, images: 3, files: 2,
    mic: true, camera: false,
    notifications: { min: 3, max: 5 },
    dreamAnalysis: false, lifeCoaching: false, webSearch: true,
    voiceQuality: 'basic', customization: 'advanced',
    smartHome: false, mediaIntegration: false,
    calendar: false, telegram: false, email: false,
    hybridAI: 'gemini', support: 'email',
  },
  premium: {
    tokens: 4000, conversations: 150, memoryDays: 30,
    memoryTypes: 5, images: 5, files: 5,
    mic: true, camera: 2,
    notifications: { min: 3, max: 7 },
    dreamAnalysis: true, lifeCoaching: true, webSearch: true,
    voiceQuality: 'advanced', customization: 'full',
    smartHome: false, mediaIntegration: true,
    calendar: true, telegram: true, email: false,
    hybridAI: 'gemini+groq', support: 'priority',
  },
  pro: {
    tokens: 7000, conversations: 300, memoryDays: 90,
    memoryTypes: 5, images: 9, files: 7,
    mic: true, camera: true,
    notifications: { min: 3, max: 7 },
    dreamAnalysis: true, lifeCoaching: true, webSearch: true,
    voiceQuality: 'advanced', customization: 'full',
    smartHome: true, mediaIntegration: true,
    calendar: true, telegram: true, email: true,
    hybridAI: 'full', support: 'priority',
  },
  yearly: {
    tokens: 15000, conversations: 999, memoryDays: 365,
    memoryTypes: 5, images: 999, files: 999,
    mic: true, camera: true,
    notifications: { min: 5, max: 10 },
    dreamAnalysis: true, lifeCoaching: true, webSearch: true,
    voiceQuality: 'advanced', customization: 'full',
    smartHome: true, mediaIntegration: true,
    calendar: true, telegram: true, email: true,
    hybridAI: 'full', support: 'vip',
  },
};

export const getTierConfig = (tier: string): TierConfig => TIERS[tier] || TIERS.free;
