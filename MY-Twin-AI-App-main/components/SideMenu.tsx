import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTwinStore } from '../store/useTwinStore';
import { router, Href, usePathname } from 'expo-router';
import { supabase } from '../lib/supabase';
import { useMemo } from 'react';
import {
  Home, MessageCircle, History, User, BrainCircuit, Palette,
  Diamond, Settings, HelpCircle, LogOut, X, PlusCircle, Gift,
  Sparkles, BatteryFull, BatteryMedium, BatteryLow, Heart
} from 'lucide-react-native';

// خارج الكومبوننت لتجنب إعادة الإنشاء
const TIER_LABELS: Record<string, { ar: string; en: string }> = {
  free:             { ar: 'مجاني', en: 'Free' },
  free_trial_14d:   { ar: 'تجربة مجانية', en: 'Free Trial' },
  premium_trial:    { ar: 'تجربة مميزة', en: 'Premium Trial' },
  plus:             { ar: 'Plus', en: 'Plus' },
  premium:          { ar: 'Premium', en: 'Premium' },
  pro:              { ar: 'Pro', en: 'Pro' },
  yearly:           { ar: 'سنوي', en: 'Yearly' },
};

// لون الطاقة حسب المستوى
const getEnergyColor = (val: number) => {
  if (val >= 70) return '#10B981';
  if (val >= 30) return '#F59E0B';
  return '#EF4444';
};

export default function SideMenu({ onClose }: { onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();

  const {
    lang, theme, twinName, bondLevel, energy, tier, clearHistory
  } = useTwinStore((s) => ({
    lang: s.lang, theme: s.theme, twinName: s.twinName,
    bondLevel: s.bondLevel, energy: s.energy, tier: s.tier,
    clearHistory: s.clearHistory,
  }));

  const isAr = lang === 'ar';
  const isDark = theme === 'dark';
  const t = (ar: string, en: string) => isAr ? ar : en;

  const navigate = (route: Href) => { router.replace(route); onClose(); };
  const startNewChat = () => { clearHistory(); onClose(); navigate('/chat'); };

  const handleLogout = () => {
    Alert.alert(t('تسجيل الخروج', 'Logout'), t('هل أنت متأكد؟', 'Are you sure?'), [
      { text: t('إلغاء', 'Cancel'), style: 'cancel' },
      {
        text: t('خروج', 'Logout'), style: 'destructive',
        onPress: async () => { await supabase.auth.signOut(); router.replace('/login'); },
      },
    ]);
  };

  const isActive = (route: string) => {
    if (route === '/chat' && (pathname === '/chat' || pathname === '/')) return true;
    return pathname === route;
  };

  // ✅ useMemo لمنع إعادة إنشاء المصفوفة في كل render
  const items = useMemo(() => [
    { icon: Home,          label: t('الرئيسية','Home'), route: '/chat' as Href },
    { icon: PlusCircle,    label: t('دردشة جديدة','New Chat'), onPress: startNewChat, isAction: true },
    { icon: Heart,         label: t('علاقتي','My Relationship'), route: '/relationship' as Href },
    { icon: History,       label: t('سجل المحادثات','History'), route: '/history' as Href },
    { icon: User,          label: t('الملف الشخصي','Profile'), route: '/profile' as Href },
    { icon: BrainCircuit,  label: t('ذكريات','Memories'), route: '/memories' as Href },
    { icon: Palette,       label: t('تخصيص','Customize'), route: '/customize' as Href },
    { icon: Diamond,       label: t('الاشتراكات','Subscription'), route: '/subscription' as Href },
    { icon: Gift,          label: t('الإحالة','Referral'), route: '/referral' as Href },
    { icon: Settings,      label: t('الإعدادات','Settings'), route: '/settings' as Href },
  ], [isAr, t]);

  // ✅ أيقونة الطاقة محسوبة بـ useMemo
  const energyIcon = useMemo(() => {
    const color = getEnergyColor(energy);
    if (energy >= 70) return <BatteryFull size={18} stroke={color} />;
    if (energy >= 30) return <BatteryMedium size={18} stroke={color} />;
    return <BatteryLow size={18} stroke={color} />;
  }, [energy]);

  // ✅ الترجمة من كائن ثابت خارجي
  const tierLabel = TIER_LABELS[tier] || TIER_LABELS.free;

  // ألوان ديناميكية (نواة لـ useTheme مستقبلاً)
  const colors = {
    bg: isDark ? '#1A1A1A' : '#FFFFFF',
    border: isDark ? '#333' : '#E8E8E3',
    text: isDark ? '#FFF' : '#1A1A1A',
    subtext: isDark ? '#CCC' : '#666',
    primary: isDark ? '#D8B4FE' : '#6B21A8',
    accent: '#A855F7',
    danger: '#EF4444',
    bond: isDark ? '#F472B6' : '#EC4899',
    energyFill: getEnergyColor(energy),
  };

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top + 20, backgroundColor: colors.bg }]}
      contentContainerStyle={{ paddingBottom: 40 }}
      keyboardShouldPersistTaps="handled"
      accessibilityRole="menu"
    >
      {/* زر الإغلاق */}
      <TouchableOpacity
        style={styles.closeBtn}
        onPress={onClose}
        accessibilityLabel={t('إغلاق القائمة', 'Close menu')}
        accessibilityRole="button"
      >
        <X size={24} stroke={colors.primary} />
      </TouchableOpacity>

      {/* بطاقة المستخدم */}
      <View style={[styles.userCard, { borderBottomColor: colors.border }]}>
        <View style={styles.avatar}>
          <Sparkles size={28} stroke={colors.accent} />
        </View>
        <View style={{ flex: 1, marginStart: isAr ? 12 : 0, marginEnd: isAr ? 0 : 12 }}>
          <Text style={[styles.userName, { color: colors.text }]}>
            {twinName || t('توأمك', 'Your Twin')}
          </Text>
          <View style={[styles.bondRow, isAr && { flexDirection: 'row-reverse' }]}>
            <Heart size={14} stroke={colors.bond} fill={colors.bond} />
            <Text style={[styles.bondValue, { color: colors.bond }]}>
              {t('رابطة', 'Bond')} {Math.round(bondLevel)}%
            </Text>
          </View>
          <Text style={[styles.tierText, { color: colors.primary }]}>
            {tierLabel[isAr ? 'ar' : 'en']}
          </Text>
        </View>
      </View>

      {/* مؤشرات حيوية */}
      <View style={[styles.vitalSection, { borderColor: colors.border }]}>
        <View style={styles.vitalRow}>
          {energyIcon}
          <Text style={[styles.vitalLabel, { color: colors.subtext }]}>
            {t('طاقة التوأم', 'Twin Energy')}
          </Text>
          <Text style={[styles.vitalValue, { color: colors.primary }]}>
            {Math.round(energy)}%
          </Text>
        </View>
        <View style={[styles.progressBar, { backgroundColor: isDark ? '#444' : '#F0F0F0' }]}>
          <View style={[styles.progressFill, { width: `${Math.min(energy, 100)}%`, backgroundColor: colors.energyFill }]} />
        </View>
      </View>

      {/* عناصر القائمة */}
      {items.map((item) => {
        const Icon = item.icon;
        const active = item.route ? isActive(item.route) : false;
        const onPress = item.onPress || (() => navigate(item.route!));
        return (
          <TouchableOpacity
            key={item.route || item.label}
            style={[
              styles.item,
              isAr && styles.itemRTL,
              active && [styles.activeItem, isAr && styles.activeItemRTL],
            ]}
            onPress={onPress}
            accessibilityLabel={item.label}
            accessibilityRole="menuitem"
            accessibilityState={{ selected: active }}
          >
            <Icon size={20} stroke={active ? colors.accent : colors.primary} />
            <Text style={[
              styles.itemLabel,
              { color: colors.text },
              active && { color: colors.accent, fontWeight: '600' },
            ]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}

      {/* مساعدة */}
      <TouchableOpacity
        style={[styles.item, isAr && styles.itemRTL]}
        onPress={() => navigate('/help' as Href)}
        accessibilityLabel={t('مساعدة', 'Help')}
        accessibilityRole="menuitem"
      >
        <HelpCircle size={20} stroke={colors.primary} />
        <Text style={[styles.itemLabel, { color: colors.text }]}>{t('مساعدة','Help')}</Text>
      </TouchableOpacity>

      {/* تسجيل الخروج */}
      <TouchableOpacity
        style={[styles.item, isAr && styles.itemRTL, { marginTop: 20 }]}
        onPress={handleLogout}
        accessibilityLabel={t('تسجيل الخروج', 'Logout')}
        accessibilityRole="menuitem"
      >
        <LogOut size={20} stroke={colors.danger} />
        <Text style={[styles.itemLabel, { color: colors.danger }]}>{t('تسجيل الخروج','Logout')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  closeBtn: { alignSelf: 'flex-end', marginBottom: 24 },
  userCard: {
    flexDirection: 'row', alignItems: 'center',
    paddingBottom: 16, marginBottom: 16,
    borderBottomWidth: 1,
  },
  avatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: '#F3F0FF',
    justifyContent: 'center', alignItems: 'center',
  },
  userName: { fontSize: 16, fontWeight: '700' },
  bondRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  bondValue: { fontSize: 12, fontWeight: '500' },
  tierText: { fontSize: 12, fontWeight: '500', marginTop: 2 },
  vitalSection: {
    borderTopWidth: 1, borderBottomWidth: 1,
    paddingVertical: 16, marginBottom: 16,
  },
  vitalRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  vitalLabel: { fontSize: 13, flex: 1 },
  vitalValue: { fontSize: 14, fontWeight: '700' },
  progressBar: { height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  item: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    padding: 14, borderRadius: 12, marginBottom: 2,
  },
  itemRTL: { flexDirection: 'row-reverse' },
  activeItem: { backgroundColor: '#F3F0FF', borderLeftWidth: 3, borderLeftColor: '#A855F7' },
  activeItemRTL: { borderLeftWidth: 0, borderRightWidth: 3, borderRightColor: '#A855F7' },
  itemLabel: { fontSize: 15, fontWeight: '500' },
});
