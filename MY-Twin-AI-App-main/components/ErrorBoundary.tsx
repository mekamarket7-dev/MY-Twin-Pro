import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { COLORS, FONTS } from '../utils/theme';
import * as Clipboard from 'expo-clipboard';

interface Props {
  children: React.ReactNode;
  lang?: 'ar' | 'en';
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  handleCopyDetails = () => {
    const details = this.state.error
      ? `${this.state.error.name}: ${this.state.error.message}\n${this.state.error.stack}`
      : '';
    Clipboard.setStringAsync(details);
    Alert.alert(
      this.props.lang === 'en' ? 'Copied' : 'تم النسخ',
      this.props.lang === 'en' ? 'Error details copied to clipboard.' : 'تم نسخ تفاصيل الخطأ إلى الحافظة.',
    );
  };

  render() {
    const isRTL = this.props.lang === 'ar';
    const t = (ar: string, en: string) => (this.props.lang === 'en' ? en : ar);

    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={[styles.title, isRTL && { writingDirection: 'rtl' }]}>
            {t('حدث خطأ غير متوقع', 'An unexpected error occurred')}
          </Text>

          <ScrollView style={styles.errorScroll} contentContainerStyle={{ alignItems: 'center' }}>
            <Text
              style={[styles.error, isRTL && { writingDirection: 'rtl' }]}
              numberOfLines={10}
            >
              {this.state.error?.message || t('خطأ غير معروف', 'Unknown error')}
            </Text>
          </ScrollView>

          <TouchableOpacity style={styles.button} onPress={this.handleReset}>
            <Text style={styles.buttonText}>
              {t('إعادة المحاولة', 'Retry')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.copyButton]}
            onPress={this.handleCopyDetails}
          >
            <Text style={styles.copyButtonText}>
              {t('نسخ تفاصيل الخطأ', 'Copy Error Details')}
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: FONTS.title,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  errorScroll: {
    maxHeight: 120,
    width: '100%',
    marginBottom: 24,
  },
  error: {
    fontSize: FONTS.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 10,
    minWidth: 180,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: FONTS.body,
    fontWeight: '600',
  },
  copyButton: {
    backgroundColor: '#F3F0FF',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  copyButtonText: {
    color: COLORS.primary,
    fontSize: FONTS.body,
    fontWeight: '600',
  },
});
