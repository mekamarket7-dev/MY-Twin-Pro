import React from 'react';
import { TouchableOpacity, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useTwinStore } from '../store/useTwinStore';
import { Sun, Moon } from 'lucide-react-native';

interface Props {
  size?: number;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

const ThemeToggle = React.memo(({ size = 22, style, testID }: Props) => {
  const theme = useTwinStore((s) => s.theme);
  const lang = useTwinStore((s) => s.lang);
  const toggleTheme = useTwinStore((s) => s.toggleTheme);
  const isDark = theme === 'dark';
  const isAr = lang === 'ar';

  const color = isDark ? '#FFF' : '#1A1226';

  const label = isDark
    ? isAr
      ? 'تفعيل المظهر الفاتح'
      : 'Switch to light mode'
    : isAr
    ? 'تفعيل المظهر الداكن'
    : 'Switch to dark mode';

  return (
    <TouchableOpacity
      onPress={toggleTheme}
      style={[styles.btn, style]}
      accessibilityLabel={label}
      accessibilityRole="button"
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      testID={testID || 'theme-toggle'}
    >
      {isDark ? (
        <Sun size={size} stroke={color} />
      ) : (
        <Moon size={size} stroke={color} />
      )}
    </TouchableOpacity>
  );
});

ThemeToggle.displayName = 'ThemeToggle';

export default ThemeToggle;

const styles = StyleSheet.create({
  btn: {
    padding: 12, // يضمن مساحة لمس لا تقل عن 44×44
    justifyContent: 'center',
    alignItems: 'center',
  },
});
