import { Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { useRef, useState, createContext, useContext } from 'react';
import { COLORS } from '../utils/theme';

interface ToastContextType {
  showToast: (message: string, type?: 'success' | 'info' | 'warning') => void;
}
const ToastContext = createContext<ToastContextType>({ showToast: () => {} });
export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'success' | 'info' | 'warning'>('info');
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;

  const showToast = (msg: string, toastType: 'success' | 'info' | 'warning' = 'info') => {
    setMessage(msg);
    setType(toastType);
    setVisible(true);
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start();
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: -20, duration: 200, useNativeDriver: true }),
      ]).start(() => setVisible(false));
    }, 2500);
  };

  const bgColor = type === 'success' ? '#10B981' : type === 'warning' ? '#F59E0B' : COLORS.primary;

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {visible && (
        <Animated.View style={[styles.container, { opacity, transform: [{ translateY }], backgroundColor: bgColor }]}>
          <Text style={styles.text}>{message}</Text>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const styles = StyleSheet.create({
  container: { position: 'absolute', top: 60, left: SCREEN_WIDTH * 0.1, right: SCREEN_WIDTH * 0.1, padding: 16, borderRadius: 12, zIndex: 9999, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8, elevation: 10 },
  text: { color: '#FFF', fontWeight: '600', fontSize: 14 },
});
