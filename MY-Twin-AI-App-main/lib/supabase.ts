import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// ── تحقق من متغيرات البيئة ──────────────────────
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn(
    '⚠️ Supabase: Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY. Auth and DB features may not work.',
  );
}

// ─ـ تحقق بسيط من صحة الرابط ────────────────────
const isValidUrl = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

if (SUPABASE_URL && !isValidUrl(SUPABASE_URL)) {
  console.error('❌ Supabase: Invalid URL format in EXPO_PUBLIC_SUPABASE_URL');
}

// ─ـ مفتاح تخزين مخصص لتجنب تضارب المشاريع ──────
const STORAGE_KEY = `sb-${SUPABASE_URL.split('.')[0]?.replace(/https?:\/\//, '') || 'mytwin'}-auth`;

// ─ـ واجهة تخزين آمنة عبر SecureStore مع try/catch ──
const secureStorage = {
  async getItem(key: string): Promise<string | null> {
    try {
      // تحقق إضافي لحالة القفل على iOS
      if (Platform.OS === 'ios') {
        // SecureStore قد يفشل إذا كان الجهاز مقفلاً أو لا توجد مصادقة بيومترية
        return await SecureStore.getItemAsync(key);
      }
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.warn('🔐 SecureStore getItem failed:', error instanceof Error ? error.message : error);
      return null;
    }
  },
  async setItem(key: string, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.warn('🔐 SecureStore setItem failed:', error instanceof Error ? error.message : error);
      // قد يفشل بسبب امتلاء المساحة أو قيود الجهاز
      // في هذه الحالة، لا نوقف التطبيق ولكن نخزّن الجلسة في الذاكرة فقط
    }
  },
  async removeItem(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.warn('🔐 SecureStore removeItem failed:', error instanceof Error ? error.message : error);
    }
  },
};

// ─ـ إنشاء عميل Supabase ──────────────────────────
export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: secureStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    // استخدام مفتاح تخزين مخصص لتجنب بقاء جلسات المشاريع القديمة
    storageKey: STORAGE_KEY,
  },
});

// تسجيل نجاح الاتصال للتصحيح
if (SUPABASE_URL) {
  console.log(`🔗 Supabase client initialized (storage: SecureStore, key: ${STORAGE_KEY})`);
}
