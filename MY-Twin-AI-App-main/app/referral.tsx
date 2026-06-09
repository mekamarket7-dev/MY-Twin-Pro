import { View, Text, TouchableOpacity, StyleSheet, Alert, TextInput } from 'react-native';
import { useState } from 'react';
import { useTwinStore } from '../store/useTwinStore';
import { API } from '../lib/api';
import { COLORS, FONTS } from '../utils/theme';

export default function Referral() {
  const _store = useTwinStore();
  const [code, setCode] = useState('');
  const [myCode, setMyCode] = useState('');

  const generateCode = async () => {
    try {
      const { data } = await API.post('/api/referral/generate');
      setMyCode(data.code);
    } catch { Alert.alert('خطأ', 'تعذر إنشاء كود الدعوة.'); }
  };

  const activateCode = async () => {
    try {
      const { data } = await API.post('/api/referral/activate', { code });
      if (data.success) Alert.alert('تم', 'تم تفعيل الكود وحصلت على 500 توكن إضافية!');
      else Alert.alert('خطأ', 'كود غير صالح.');
    } catch { Alert.alert('خطأ', 'تعذر تفعيل الكود.'); }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎁 نظام الدعوات</Text>
      <TouchableOpacity style={styles.button} onPress={generateCode}>
        <Text style={styles.buttonText}>إنشاء كود الدعوة الخاص بي</Text>
      </TouchableOpacity>
      {myCode ? <Text style={styles.myCode}>كودك: {myCode}</Text> : null}
      <View style={styles.inputRow}>
        <Text style={styles.label}>أدخل كود صديق:</Text>
        <TextInput
          style={styles.input}
          value={code}
          onChangeText={setCode}
          placeholder="MTxxxxxx"
          placeholderTextColor={COLORS.textSecondary}
          autoCapitalize="characters"
        />
        <TouchableOpacity style={styles.button} onPress={activateCode}>
          <Text style={styles.buttonText}>تفعيل</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg, padding: 20 },
  title: { fontSize: FONTS.title, fontWeight: '800', color: COLORS.text, marginBottom: 24 },
  button: { backgroundColor: COLORS.primary, padding: 14, borderRadius: 12, alignItems: 'center', marginBottom: 12 },
  buttonText: { color: '#FFF', fontWeight: '700', fontSize: FONTS.body },
  myCode: { color: COLORS.primary, fontSize: FONTS.subtitle, textAlign: 'center', marginVertical: 12, fontWeight: '700' },
  inputRow: { marginTop: 20 },
  label: { color: COLORS.text, fontSize: FONTS.body, marginBottom: 8 },
  input: { backgroundColor: COLORS.card, color: COLORS.text, padding: 12, borderRadius: 10, fontSize: FONTS.body, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border },
});
