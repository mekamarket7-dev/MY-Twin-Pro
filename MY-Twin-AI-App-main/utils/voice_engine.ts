import * as Speech from "expo-speech";
import { useTwinStore } from "../store/useTwinStore";

export interface VoiceOptions {
  pitch?: number;
  rate?: number;
  language?: string;
  onDone?: () => void;
  emotion?: string;
  intensity?: number;
  personality?: string;
}

let speakQueue: Array<{ text: string; options: VoiceOptions }> = [];
let isSpeakingNow = false;
let currentInterrupt: (() => void) | null = null;

const EMOTION_PRESETS: Record<string, { pitch: number; rate: number }> = {
  joy: { pitch: 1.15, rate: 0.95 },
  sadness: { pitch: 0.85, rate: 0.75 },
  anger: { pitch: 1.0, rate: 1.0 },
  fear: { pitch: 0.9, rate: 0.85 },
  love: { pitch: 1.05, rate: 0.85 },
  surprise: { pitch: 1.2, rate: 1.0 },
  neutral: { pitch: 1.0, rate: 0.9 },
};

// ✅ أصوات حسب النوع
const GENDER_VOICES: Record<string, string> = {
  male: 'ar-SA-HamedNeural',
  female: 'ar-SA-ZariyahNeural',
};

function cleanTextForSpeech(text: string): string {
  if (!text) return "";
  return text
    .replace(/\p{Extended_Pictographic}/gu, "")
    .replace(/[❤️‍🔥✨🌟💜🫂🤗🫶💕💖💪🤝]/gu, "")
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .replace(/\n{2,}/g, "، ")
    .replace(/\n/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export async function speakResponse(text: string, options?: VoiceOptions): Promise<void> {
  try {
    const clean = cleanTextForSpeech(text);
    if (!clean) return;

    // ✅ جلب نوع التوأم من المتجر لاختيار الصوت المناسب
    const twinGender = useTwinStore.getState().twinGender || 'female';
    const defaultVoice = GENDER_VOICES[twinGender] || GENDER_VOICES.female;

    let pitch = options?.pitch ?? 1.0;
    let rate = options?.rate ?? 0.9;

    if (options?.emotion && EMOTION_PRESETS[options.emotion]) {
      const preset = EMOTION_PRESETS[options.emotion];
      pitch = preset.pitch;
      rate = preset.rate;
    }

    speakQueue.push({ text: clean, options: { ...options, pitch, rate } });

    if (!isSpeakingNow) processQueue();

    // تخزين الصوت المستخدم
    Speech.speak(clean, {
      language: "ar-SA",
      pitch,
      rate,
      voice: defaultVoice,
      onDone: () => {
        currentInterrupt = null;
        processQueue();
      },
      onError: (e) => {
        console.warn("TTS error:", e);
        currentInterrupt = null;
        processQueue();
      },
      onStopped: () => {
        currentInterrupt = null;
        processQueue();
      },
    });
  } catch (e) {
    console.warn("speakResponse error:", e);
  }
}

async function processQueue(): Promise<void> {
  if (speakQueue.length === 0) {
    isSpeakingNow = false;
    return;
  }
  isSpeakingNow = true;
  const item = speakQueue.shift()!;
  // النطق يحدث في speakResponse مباشرة
}

export function stopSpeaking(): void {
  if (currentInterrupt) currentInterrupt();
  speakQueue = [];
  Speech.stop();
}

export function isSpeaking(): Promise<boolean> {
  return Speech.isSpeakingAsync();
}

export function autoInterrupt(): void {
  stopSpeaking();
}
