/**
 * MyTwin – Auth Module
 * إدارة جلسات المستخدم عبر Supabase Auth.
 */
import { supabase } from './supabase';

/**
 * جلب الجلسة الحالية.
 * @returns كائن الجلسة أو null
 */
export async function getSession() {
  try {
    const { data } = await supabase.auth.getSession();
    return data.session ?? null;
  } catch {
    return null;
  }
}

/**
 * جلب رمز الوصول (access token) من الجلسة الحالية.
 * @returns الرمز أو null
 */
export async function getAccessToken() {
  try {
    const session = await getSession();
    return session?.access_token || null;
  } catch {
    return null;
  }
}

/**
 * مراقبة تغيرات حالة المصادقة.
 * @param callback دالة تستدعى مع المستخدم عند كل تغير
 * @returns كائن الاشتراك لإلغاء المراقبة لاحقًا
 */
export function onAuthStateChange(callback: (user: unknown) => void) {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user || null);
  });
  return data.subscription;
}
