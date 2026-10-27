import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bite, bitesFor, SOURCES, TRACKS } from '../content';
import { achievementsFor, GameState, TOTAL_DAYS } from '../game';
import { C, F } from '../theme';
import { LoreScroll } from '../ui';

export function Sheet({ title, visible, onClose, children }: { title: string; visible: boolean; onClose: () => void; children: React.ReactNode }) {
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={st.sheet} edges={['top', 'bottom', 'left', 'right']}>
        <View style={st.sheetHead}>
          <Text accessibilityRole="header" style={st.sheetTitle}>{title}</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={onClose} hitSlop={12} style={st.close}>
            <Text style={st.closeText}>Done</Text>
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={st.sheetBody}>{children}</ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

export function TipBody({ bite }: { bite: Bite }) {
  return <LoreScroll bite={bite} />;
}

export function WhyBody({ s }: { s: GameState }) {
  return (
    <View style={{ gap: 10 }}>
      <Text style={st.p}>You went {s.why.length} levels deep. The last answer is your core why.</Text>
      {s.why.map((w, i) => (
        <View key={i} style={[st.chain, i === s.why.length - 1 && st.chainCore]}>
          <Text style={st.chainNum}>{i + 1}</Text>
          <Text style={[st.chainText, i === s.why.length - 1 && { fontFamily: F.bold, color: C.parchHead }]}>{w}</Text>
        </View>
      ))}
    </View>
  );
}

export function AchievementsBody({ s }: { s: GameState }) {
  return (
    <View style={st.grid}>
      {achievementsFor(s.goal).map(a => {
        const day = s.achievements[a.id];
        return (
          <View key={a.id} style={[st.badge, !day && st.badgeLocked]} accessibilityLabel={`${a.title}, ${day ? `earned on day ${day}` : 'locked'}`}>
            <Text style={st.badgeIcon}>{day ? '🏆' : '🔒'}</Text>
            <Text style={[st.badgeTitle, !day && { color: C.muted }]}>{a.title}</Text>
            <Text style={st.badgeDetail}>{a.detail}</Text>
            {!!day && <Text style={st.badgeDay}>Day {day}</Text>}
          </View>
        );
      })}
    </View>
  );
}

export function JourneyBody({ s }: { s: GameState }) {
  const unlocked = [TRACKS[s.goal].intro, ...bitesFor(s.goal).filter(b => b.day <= s.day)];
  const total = bitesFor(s.goal).length + 1;
  return (
    <View style={{ gap: 16 }}>
      <View style={{ gap: 8 }}>
        <Text style={st.h}>90-day map</Text>
        <View style={st.map}>
          {Array.from({ length: TOTAL_DAYS }, (_, i) => {
            const d = i + 1, l = s.log[d];
            const bg = d >= s.day ? C.surface : l === 'missed-shield' ? C.shield : Array.isArray(l) && l.length ? C.xp : '#D5DEE8';
            const milestone = [30, 60, 66, 90].includes(d);
            return <View key={d} style={[st.cell, { backgroundColor: bg }, milestone && { borderColor: C.gold, borderWidth: 2 }, d === s.day && st.today]} />;
          })}
        </View>
        <View style={st.phases}><Text style={st.phase}>Days 1–30</Text><Text style={st.phase}>31–60</Text><Text style={st.phase}>61–90</Text></View>
        <View style={st.legend}>
          <Legend color={C.xp} label="Done" /><Legend color={C.shield} label="Shield used" />
          <Legend color="#D5DEE8" label="Missed" /><Legend color={C.gold} label="Milestone" />
        </View>
      </View>
      <View style={{ gap: 4 }}>
        <Text style={st.h}>Lessons · {unlocked.length} of {total}</Text>
        {unlocked.map(b => <LessonRow key={`${b.day}-${b.title}`} bite={b} />)}
      </View>
    </View>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return <View style={st.legendItem}><View style={[st.swatch, { backgroundColor: color }]} /><Text style={st.legendText}>{label}</Text></View>;
}

function LessonRow({ bite }: { bite: Bite }) {
  const [open, setOpen] = useState(false);
  return (
    <View style={st.lesson}>
      <Pressable accessibilityRole="button" accessibilityState={{ expanded: open }} onPress={() => setOpen(!open)} style={st.lessonHead}>
        <Text style={st.lessonDay}>DAY {bite.day}</Text>
        <Text style={st.lessonTitle}>{bite.title}</Text>
        <Text style={st.lessonChev}>{open ? '–' : '+'}</Text>
      </Pressable>
      {open && (
        <View style={{ gap: 8, paddingBottom: 10 }}>
          {bite.body.map((p, i) => <Text key={i} style={st.p}>{p}</Text>)}
          <Text style={st.cite}>{SOURCES[bite.source].cite}</Text>
        </View>
      )}
    </View>
  );
}

const st = StyleSheet.create({
  sheet: { flex: 1, backgroundColor: C.bg },
  sheetHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderColor: C.line },
  sheetTitle: { fontFamily: F.bold, fontSize: 20, color: C.text },
  close: { paddingVertical: 6, paddingHorizontal: 4 },
  closeText: { fontFamily: F.bold, fontSize: 17, color: C.primary },
  sheetBody: { padding: 16, paddingBottom: 40, gap: 12, maxWidth: 560, width: '100%', alignSelf: 'center' },
  h: { fontFamily: F.bold, fontSize: 13, letterSpacing: 1, color: C.muted, textTransform: 'uppercase' },
  p: { fontFamily: F.body, fontSize: 16, lineHeight: 24, color: C.text },
  cite: { fontFamily: F.body, fontSize: 13, lineHeight: 19, color: C.muted },
  chain: { flexDirection: 'row', gap: 10, backgroundColor: C.surface, borderWidth: 2, borderColor: C.line, borderRadius: 8, padding: 12 },
  chainCore: { backgroundColor: C.parch, borderColor: C.parchLine },
  chainNum: { fontFamily: F.bold, fontSize: 14, color: C.primary, width: 16, paddingTop: 2 },
  chainText: { flex: 1, fontFamily: F.body, fontSize: 16, lineHeight: 22, color: C.text },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  badge: { flexBasis: '47%', flexGrow: 1, backgroundColor: C.surface, borderWidth: 2, borderColor: C.gold, borderRadius: 8, padding: 12, gap: 4 },
  badgeLocked: { borderColor: C.line, backgroundColor: C.surface2 },
  badgeIcon: { fontSize: 24 },
  badgeTitle: { fontFamily: F.bold, fontSize: 16, color: C.text },
  badgeDetail: { fontFamily: F.body, fontSize: 14, lineHeight: 19, color: C.muted },
  badgeDay: { fontFamily: F.bold, fontSize: 12, color: C.xpText },
  map: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  cell: { width: '5.6%', aspectRatio: 1, borderRadius: 2, borderWidth: 1, borderColor: C.line },
  today: { borderColor: C.primary, borderWidth: 2 },
  phases: { flexDirection: 'row', justifyContent: 'space-between' },
  phase: { fontFamily: F.bold, fontSize: 13, color: C.muted },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  swatch: { width: 12, height: 12, borderRadius: 2 },
  legendText: { fontFamily: F.body, fontSize: 14, color: C.muted },
  lesson: { borderTopWidth: 1, borderColor: C.line },
  lessonHead: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12 },
  lessonDay: { fontFamily: F.bold, fontSize: 12, color: C.primary, width: 54 },
  lessonTitle: { flex: 1, fontFamily: F.bold, fontSize: 16, color: C.text },
  lessonChev: { fontFamily: F.bold, fontSize: 20, color: C.muted },
});
