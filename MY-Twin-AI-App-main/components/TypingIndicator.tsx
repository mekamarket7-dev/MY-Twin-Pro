import React from 'react';
import { View, Animated, StyleSheet, Text } from 'react-native';
import { useEffect, useRef } from 'react';
import { COLORS, FONTS } from '../utils/theme';

interface TypingIndicatorProps {
  lang?: 'ar' | 'en';
  assistantName?: string;
}

const TypingIndicator = React.memo(({ lang = 'ar', assistantName }: TypingIndicatorProps) => {
  const displayName = assistantName || (lang === 'ar' ? 'التوأم' : 'Twin');
  const isRTL = lang === 'ar';

  // dots once
  const dots = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  useEffect(() => {
    const animations = dots.map((dot, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 200),
          Animated.timing(dot, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 400, useNativeDriver: true }),
        ])
      )
    );
    animations.forEach((a) => a.start());
    return () => animations.forEach((a) => a.stop());
  }, [dots]);

  // pre-calc interpolation
  const getOpacity = (dot: Animated.Value) =>
    dot.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] });
  const getTranslateY = (dot: Animated.Value) =>
    dot.interpolate({ inputRange: [0, 1], outputRange: [0, -6] });

  return (
    <View style={styles.container} accessibilityLabel={lang === 'ar' ? 'التوأم يكتب' : 'Typing indicator'} accessibilityRole="progressbar">
      <View style={[styles.bubble, isRTL && styles.bubbleRTL]}>
        <View style={[styles.dotsRow, isRTL && styles.dotsRowRTL]}>
          {dots.map((dot, i) => (
            <Animated.View
              key={i}
              style={[
                styles.dot,
                {
                  opacity: getOpacity(dot),
                  transform: [{ translateY: getTranslateY(dot) }],
                },
              ]}
            />
          ))}
        </View>
        <Text style={styles.text}>
          {lang === 'ar' ? `${displayName} يكتب...` : `${displayName} is typing...`}
        </Text>
      </View>
    </View>
  );
});

TypingIndicator.displayName = 'TypingIndicator';

export default TypingIndicator;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  bubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 18,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  bubbleRTL: {
    flexDirection: 'row-reverse',
  },
  dotsRow: {
    flexDirection: 'row',
    marginEnd: 8,
  },
  dotsRowRTL: {
    marginEnd: 0,
    marginStart: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.textSecondary,
    marginHorizontal: 2,
  },
  text: {
    color: COLORS.textSecondary,
    fontSize: FONTS.small,
  },
});
