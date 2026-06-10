import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, Text } from 'react-native';
import { useTwinStore } from '../store/useTwinStore';

const EMOTION_CONFIG: Record<string, { emoji: string; color: string; glowColor: string; pulseSpeed: number }> = {
  joy:       { emoji: '😊', color: '#F59E0B', glowColor: '#FEF3C7', pulseSpeed: 800 },
  happy:     { emoji: '😊', color: '#F59E0B', glowColor: '#FEF3C7', pulseSpeed: 800 },
  excited:   { emoji: '🤩', color: '#F59E0B', glowColor: '#FEF3C7', pulseSpeed: 600 },
  sad:       { emoji: '😢', color: '#3B82F6', glowColor: '#DBEAFE', pulseSpeed: 1800 },
  sadness:   { emoji: '😢', color: '#3B82F6', glowColor: '#DBEAFE', pulseSpeed: 1800 },
  angry:     { emoji: '😠', color: '#EF4444', glowColor: '#FEE2E2', pulseSpeed: 700 },
  anger:     { emoji: '😠', color: '#EF4444', glowColor: '#FEE2E2', pulseSpeed: 700 },
  fear:      { emoji: '😨', color: '#A78BFA', glowColor: '#EDE9FE', pulseSpeed: 1000 },
  anxious:   { emoji: '😰', color: '#A78BFA', glowColor: '#EDE9FE', pulseSpeed: 1000 },
  love:      { emoji: '💕', color: '#EC4899', glowColor: '#FCE7F3', pulseSpeed: 900 },
  surprise:  { emoji: '😮', color: '#8B5CF6', glowColor: '#EDE9FE', pulseSpeed: 700 },
  neutral:   { emoji: '😌', color: '#6B7280', glowColor: '#F3F4F6', pulseSpeed: 1500 },
  calm:      { emoji: '😌', color: '#10B981', glowColor: '#D1FAE5', pulseSpeed: 2000 },
  lonely:    { emoji: '🥺', color: '#6366F1', glowColor: '#E0E7FF', pulseSpeed: 1600 },
  motivated: { emoji: '💪', color: '#10B981', glowColor: '#D1FAE5', pulseSpeed: 750 },
  grateful:  { emoji: '🙏', color: '#8B5CF6', glowColor: '#EDE9FE', pulseSpeed: 1000 },
  confused:  { emoji: '😕', color: '#F59E0B', glowColor: '#FEF3C7', pulseSpeed: 900 },
  support:   { emoji: '🤝', color: '#6366F1', glowColor: '#E0E7FF', pulseSpeed: 1000 },
};

// ✅ واجهة موحدة: تقبل emotion أو mood (كلاهما اختياري، أحدهما على الأقل مطلوب)
interface Props {
  emotion?: string;
  mood?: string;
  emoji?: string;
  size?: number;
  animated?: boolean;
}

export default function EmotionalAvatar({ emotion, mood, emoji, size = 60, animated = true }: Props) {
  const { theme, relationshipDims } = useTwinStore();
  const isDark = theme === 'dark';

  // ✅ الأولوية لـ emotion، ثم mood، ثم "neutral"
  const effectiveEmotion = emotion || mood || 'neutral';
  const config = EMOTION_CONFIG[effectiveEmotion] || EMOTION_CONFIG.neutral;
  const displayEmoji = emoji || config.emoji;
  const color = config.color;
  const glowColor = config.glowColor;
  const pulseSpeed = config.pulseSpeed;

  const pulse = useRef(new Animated.Value(1)).current;
  const previousEmotion = useRef(effectiveEmotion);

  useEffect(() => {
    if (!animated || previousEmotion.current === effectiveEmotion) {
      previousEmotion.current = effectiveEmotion;
      return;
    }
    previousEmotion.current = effectiveEmotion;
    const animation = Animated.sequence([
      Animated.timing(pulse, { toValue: 1.15, duration: pulseSpeed * 0.4, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 1, duration: pulseSpeed * 0.6, useNativeDriver: true }),
    ]);
    animation.start();
    return () => animation.stop();
  }, [effectiveEmotion, pulseSpeed, animated]);

  const ringSize = size + 12;

  return (
    <View style={styles.outerContainer}>
      <Animated.View
        style={[
          styles.ring,
          {
            width: ringSize, height: ringSize, borderRadius: ringSize / 2,
            borderColor: isDark ? color + '80' : color + '30',
            backgroundColor: isDark ? glowColor + '15' : glowColor + '80',
            transform: [{ scale: pulse }],
            shadowColor: isDark ? 'transparent' : color,
            shadowOpacity: 0.2, shadowRadius: 12,
            shadowOffset: { width: 0, height: 4 },
            elevation: 4,
          },
        ]}
        accessibilityLabel={`الحالة العاطفية: ${effectiveEmotion}`}
        accessibilityRole="image"
      >
        <Text style={[styles.emoji, { fontSize: size * 0.55 }]}>{displayEmoji}</Text>
      </Animated.View>
      <View style={[styles.indicators, isDark && { backgroundColor: '#FFFFFF10' }]}>
        <View style={[styles.indicatorDot, { backgroundColor: color }]} />
        <View style={[styles.indicatorDot, { backgroundColor: (relationshipDims?.trust ?? 0) > 60 ? '#3B82F6' : '#6B7280' }]} />
        <View style={[styles.indicatorDot, { backgroundColor: (relationshipDims?.affection ?? 0) > 60 ? '#EC4899' : '#6B7280' }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: { alignItems: 'center', justifyContent: 'center' },
  ring: { justifyContent: 'center', alignItems: 'center', borderWidth: 2.5 },
  emoji: { textAlign: 'center' },
  indicators: { flexDirection: 'row', gap: 6, marginTop: 8, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, backgroundColor: '#F3F4F6' },
  indicatorDot: { width: 6, height: 6, borderRadius: 3 },
});
