import { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { COLORS } from '../utils/theme';

const EMOJIS: Record<string, string> = {
  happy: '😊', sad: '😢', anxious: '😰', lonely: '🥺',
  motivated: '💪', grateful: '🙏', confused: '😕', excited: '🎉',
  neutral: '😌',
};

interface Props { emotion: string; size?: number; }

export default function EmotionalAvatar({ emotion, size = 60 }: Props) {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.08, duration: 800, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  const emoji = EMOJIS[emotion] ?? EMOJIS.neutral;

  return (
    <Animated.View
      style={[styles.container, { width: size, height: size, borderRadius: size / 2, transform: [{ scale: pulse }] }]}
      accessibilityLabel={`الحالة العاطفية: ${emotion}`}
      accessibilityRole="image"
    >
      <Animated.Text style={{ fontSize: size * 0.6 }}>{emoji}</Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F3F0FF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
});
