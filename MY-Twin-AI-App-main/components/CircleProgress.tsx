import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

interface Props {
  percentage: number;
  color: string;
  size?: number;
  label: string;
  icon?: string;
}

export default function CircleProgress({ percentage, color, size = 60, label, icon }: Props) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(percentage, 100) / 100) * circumference;

  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        <Circle cx={size/2} cy={size/2} r={radius} stroke="#E8E8E3" strokeWidth={4} fill="transparent" />
        <Circle cx={size/2} cy={size/2} r={radius} stroke={color} strokeWidth={4} fill="transparent"
          strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
          strokeLinecap="round" rotation="-90" origin={`${size/2}, ${size/2}`} />
      </Svg>
      <View style={[styles.center, { width: size, height: size }]}>
        <Text style={styles.icon}>{icon}</Text>
        <Text style={[styles.percent, { color }]}>{Math.round(percentage)}%</Text>
      </View>
      <Text style={[styles.label, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center' },
  center: { position: 'absolute', top: 0, justifyContent: 'center', alignItems: 'center' },
  icon: { fontSize: 12 },
  percent: { fontSize: 10, fontWeight: '700' },
  label: { fontSize: 10, fontWeight: '600', marginTop: 2 },
});
