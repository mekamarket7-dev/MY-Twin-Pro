import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, FONTS } from '../utils/theme';

interface Props { children: React.ReactNode }
interface State { hasError: boolean; error?: Error }

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError(error: Error) { return { hasError: true, error }; }
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) { console.error('ErrorBoundary:', error, errorInfo); }
  handleReset = () => this.setState({ hasError: false, error: undefined });

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>حدث خطأ غير متوقع</Text>
          <Text style={styles.error}>{this.state.error?.message}</Text>
          <TouchableOpacity style={styles.button} onPress={this.handleReset}>
            <Text style={styles.buttonText}>إعادة المحاولة</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: FONTS.title, fontWeight: '700', color: COLORS.text, textAlign: 'center', marginBottom: 16 },
  error: { fontSize: FONTS.body, color: COLORS.textSecondary, textAlign: 'center', marginBottom: 24, maxHeight: 100 },
  button: { backgroundColor: COLORS.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  buttonText: { color: '#FFF', fontSize: FONTS.body, fontWeight: '600' },
});
