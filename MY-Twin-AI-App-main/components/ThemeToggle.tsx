import { TouchableOpacity, StyleSheet } from 'react-native';
import { useTwinStore } from '../store/useTwinStore';
import { Ionicons } from '@expo/vector-icons';

/**
 * ThemeToggle – زر تبديل المظهر (فاتح/داكن).
 * يُدمج مع useTwinStore ويستخدم Ionicons.
 */
export default function ThemeToggle() {
  const { theme, toggleTheme } = useTwinStore();
  const isDark = theme === 'dark';

  return (
    <TouchableOpacity
      onPress={toggleTheme}
      style={styles.btn}
      accessibilityLabel={isDark ? 'تفعيل المظهر الفاتح' : 'تفعيل المظهر الداكن'}
      accessibilityRole="button"
    >
      <Ionicons
        name={isDark ? 'sunny-outline' : 'moon-outline'}
        size={20}
        color={isDark ? '#FFF' : '#1A1226'}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    padding: 6,
  },
});
