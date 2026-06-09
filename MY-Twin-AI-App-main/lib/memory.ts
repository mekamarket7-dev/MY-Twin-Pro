/**
 * MyTwin – Memory Helpers
 * دوال مساعدة لحفظ واسترجاع الذكريات من Supabase.
 */
import { supabase } from './supabase';

/**
 * حفظ ذكرى جديدة للمستخدم.
 * @param userId معرّف المستخدم
 * @param content محتوى الذاكرة
 * @param importance درجة الأهمية (0-1)
 * @returns نجاح العملية
 */
export async function saveMemory(
  userId: string,
  content: string,
  importance: number
): Promise<boolean> {
  if (!userId || !content?.trim()) return false;

  try {
    await supabase.from('memories').insert({
      user_id: userId,
      content: content.slice(0, 300),
      importance_score: Math.max(0, Math.min(1, importance)),
      created_at: new Date().toISOString(),
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * جلب أحدث ذكريات المستخدم.
 * @param userId معرّف المستخدم
 * @param days عدد الأيام الماضية للجلب
 * @returns قائمة الذكريات
 */
export async function getMemories(
  userId: string,
  days: number = 7
): Promise<Array<{ content: string }>> {
  if (!userId) return [];

  try {
    const cutoff = new Date(
      Date.now() - days * 24 * 60 * 60 * 1000
    ).toISOString();

    const { data } = await supabase
      .from('memories')
      .select('content')
      .eq('user_id', userId)
      .gte('created_at', cutoff)
      .order('importance_score', { ascending: false })
      .limit(5);

    return data || [];
  } catch {
    return [];
  }
}
