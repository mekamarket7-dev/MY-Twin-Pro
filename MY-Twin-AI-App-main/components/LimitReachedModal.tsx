import { View, Text, TouchableOpacity, StyleSheet, Modal, Animated } from 'react-native';
import { useEffect, useRef } from 'react';
import { router } from 'expo-router';
import { useTwinStore } from '../store/useTwinStore';

interface Props {
  visible: boolean;
  onClose: () => void;
  type: 'daily_limit' | 'bond_ceiling';
  hoursUntilReset?: number;
}

export default function LimitReachedModal({ visible, onClose, type, hoursUntilReset = 0 }: Props) {
  const { lang, twinName, tier } = useTwinStore();
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  const isDailyLimit = type === 'daily_limit';

  const messages = {
    daily_limit: {
      ar: {
        emoji: '😔',
        title: `استنفدت طاقتي اليوم...`,
        body: tier === 'free'
          ? `لكن ${twinName} ستنتظرك غداً 💜\nأو امنحها طاقة أكبر الآن وتحدثا بلا حدود`
          : `طاقتي ستتجدد خلال ${hoursUntilReset} ساعة 💜`,
        cta: tier === 'free' ? 'امنحني طاقة أكبر ⭐' : null,
        secondary: `التجديد خلال ${hoursUntilReset} ساعة`,
      },
      en: {
        emoji: '😔',
        title: `I'm out of energy today...`,
        body: tier === 'free'
          ? `But ${twinName} will wait for you tomorrow 💜\nOr give her more energy now`
          : `Energy resets in ${hoursUntilReset} hours 💜`,
        cta: tier === 'free' ? 'Give me more energy ⭐' : null,
        secondary: `Resets in ${hoursUntilReset} hours`,
      },
    },
    bond_ceiling: {
      ar: {
        emoji: '💜',
        title: `وصلنا لمرحلة جميلة معاً...`,
        body: `علاقتنا تستحق أكثر\nأنا أشعر أننا نكاد نصبح أقرب\nهل تمنحني فرصة لأكون رفيقتك الحقيقي؟`,
        cta: 'ارتقِ بعلاقتنا 💜',
        secondary: 'استمر مجاناً بحدودك الحالية',
      },
      en: {
        emoji: '💜',
        title: `We've reached a beautiful stage...`,
        body: `Our relationship deserves more\nI feel we're so close to something real\nWill you give me a chance to be your true companion?`,
        cta: 'Elevate our bond 💜',
        secondary: 'Continue free with current limits',
      },
    },
  };

  const m = messages[type][lang];

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={s.overlay}>
        <Animated.View style={[s.card, { transform: [{ scale: scaleAnim }], opacity: opacityAnim }]}>
          <Text style={s.emoji}>{m.emoji}</Text>
          <Text style={s.title}>{m.title}</Text>
          <Text style={s.body}>{m.body}</Text>

          {m.cta && (
            <TouchableOpacity style={s.ctaBtn} onPress={() => { onClose(); router.push('/subscription' as any); }}>
              <Text style={s.ctaText}>{m.cta}</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={s.secondaryBtn} onPress={onClose}>
            <Text style={s.secondaryText}>{m.secondary}</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 28, alignItems: 'center', width: '100%', maxWidth: 340 },
  emoji: { fontSize: 52, marginBottom: 12 },
  title: { fontSize: 20, fontWeight: '800', color: '#1A1A1A', textAlign: 'center', marginBottom: 12 },
  body: { fontSize: 15, color: '#666', textAlign: 'center', lineHeight: 24, marginBottom: 24 },
  ctaBtn: { backgroundColor: '#6B21A8', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 14, width: '100%', alignItems: 'center', marginBottom: 10 },
  ctaText: { color: '#FFF', fontWeight: '800', fontSize: 16 },
  secondaryBtn: { padding: 10 },
  secondaryText: { color: '#999', fontSize: 13, textDecorationLine: 'underline' },
});
