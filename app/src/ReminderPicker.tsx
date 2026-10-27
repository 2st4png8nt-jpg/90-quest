import { Pressable, StyleSheet, Text, View } from 'react-native';
import { formatTime } from './device';
import type { Reminder } from './game';
import { C, F } from './theme';

const PRESETS = [
  { hour: 7, minute: 0 }, { hour: 8, minute: 0 }, { hour: 12, minute: 30 },
  { hour: 17, minute: 30 }, { hour: 19, minute: 0 }, { hour: 21, minute: 0 },
];

/** Pick a daily reminder time (or none). Opt-in by design: "No reminder" is always one tap away. */
export function ReminderPicker({ value, onChange }: { value: Reminder; onChange: (r: Reminder) => void }) {
  const nudge = (mins: number) => {
    if (!value) return;
    const t = (value.hour * 60 + value.minute + mins + 1440) % 1440;
    onChange({ hour: Math.floor(t / 60), minute: t % 60 });
  };
  return (
    <View style={{ gap: 10 }}>
      <View style={st.grid}>
        {PRESETS.map(p => {
          const on = !!value && value.hour === p.hour && value.minute === p.minute;
          return (
            <Pressable key={`${p.hour}:${p.minute}`} accessibilityRole="radio" accessibilityState={{ selected: on }} onPress={() => onChange(p)} style={[st.chip, on && st.on]}>
              <Text style={[st.chipText, on && { color: C.text }]}>{formatTime(p)}</Text>
            </Pressable>
          );
        })}
      </View>
      {value && (
        <View style={st.fine}>
          <Pressable accessibilityRole="button" accessibilityLabel="15 minutes earlier" onPress={() => nudge(-15)} style={st.step}><Text style={st.stepText}>−15 min</Text></Pressable>
          <Text style={st.time}>{formatTime(value)}</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="15 minutes later" onPress={() => nudge(15)} style={st.step}><Text style={st.stepText}>+15 min</Text></Pressable>
        </View>
      )}
      <Pressable accessibilityRole="radio" accessibilityState={{ selected: !value }} onPress={() => onChange(null)} style={[st.none, !value && st.on]}>
        <Text style={[st.chipText, !value && { color: C.text }]}>No reminder</Text>
      </Pressable>
    </View>
  );
}

const st = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { flexBasis: '30%', flexGrow: 1, paddingVertical: 12, borderRadius: 8, borderWidth: 2, borderColor: C.line, backgroundColor: C.surface, alignItems: 'center' },
  on: { borderColor: C.primary, backgroundColor: '#E3EDFC' },
  chipText: { fontFamily: F.bold, fontSize: 15, color: C.muted },
  fine: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  step: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, borderWidth: 2, borderColor: C.line, backgroundColor: C.surface },
  stepText: { fontFamily: F.bold, fontSize: 14, color: C.primary },
  time: { fontFamily: F.bold, fontSize: 20, color: C.text, fontVariant: ['tabular-nums'] },
  none: { paddingVertical: 12, borderRadius: 8, borderWidth: 2, borderColor: C.line, backgroundColor: C.surface, alignItems: 'center' },
});
