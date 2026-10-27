import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { TRACKS } from '../content';
import { achievementsFor, completedToday, coreWhy, currentLore, GameState, phase, PHASE_NAMES, questsFor, TOTAL_DAYS } from '../game';
import { HEROES, PIP, PIP_PAL, Sprite } from '../Sprite';
import { C, F } from '../theme';

type Props = {
  s: GameState;
  onToggle: (id: string) => void;
  onRate: (n: number) => void;
  onOpenTip: () => void;
  onOpen: (sheet: 'journey' | 'achievements' | 'why') => void;
  onNextDay: () => void;
  onNewQuest: () => void;
};

export function Home({ s, onToggle, onRate, onOpenTip, onOpen, onNextDay, onNewQuest }: Props) {
  const quests = questsFor(s, s.day);
  const done = completedToday(s);
  const lore = currentLore(s) ?? TRACKS[s.goal].intro;
  const tipNew = lore.day > 1 && !s.seenLore.includes(lore.day);
  const earned = achievementsFor(s.goal).filter(a => s.achievements[a.id]).length;
  const total = achievementsFor(s.goal).length;
  const hero = HEROES[s.character];

  return (
    <View style={st.page}>
      <View style={st.header}>
        <Image source={hero.image} accessibilityIgnoresInvertColors style={{ height: 92, width: 92 * hero.ratio }} />
        <View style={{ flex: 1, gap: 2 }}>
          <View style={st.row}>
            <Text style={st.name} numberOfLines={1}>{s.hero}</Text>
            {s.demo && <Text style={st.demo}>DEMO</Text>}
          </View>
          <Text style={st.day}>{s.finished ? 'Quest complete' : `Day ${s.day} of ${TOTAL_DAYS}`} · {PHASE_NAMES[phase(s.day)]}</Text>
          <View style={st.progress} accessibilityLabel={`${s.day} of ${TOTAL_DAYS} days`}>
            <View style={[st.progressFill, { width: `${Math.round((s.day / TOTAL_DAYS) * 100)}%` }]} />
          </View>
          <View style={st.stats}>
            <Text style={[st.stat, { color: C.streak }]}>🔥 {s.streak}</Text>
            <Text style={[st.stat, { color: C.shield }]}>🛡 {s.shields}</Text>
            <Pressable accessibilityRole="button" accessibilityLabel={`Achievements, ${earned} of ${total}`} onPress={() => onOpen('achievements')} hitSlop={8}>
              <Text style={[st.stat, { color: C.text }]}>🏆 {earned}/{total}</Text>
            </Pressable>
          </View>
        </View>
      </View>

      {!!coreWhy(s) && (
        <Pressable accessibilityRole="button" accessibilityHint="Shows all 7 levels of your why" onPress={() => onOpen('why')} style={st.why}>
          <Text style={st.whyLabel}>MY WHY</Text>
          <Text style={st.whyText} numberOfLines={2}>{coreWhy(s)}</Text>
        </Pressable>
      )}

      <Pressable accessibilityRole="button" accessibilityHint="Opens the full tip and its source" onPress={onOpenTip} style={st.tip}>
        <Sprite rows={PIP} palette={PIP_PAL} px={4} />
        <View style={{ flex: 1, gap: 2 }}>
          <View style={st.row}>
            <Text style={st.tipLabel}>TODAY'S TIP</Text>
            {tipNew && <Text style={st.new}>NEW</Text>}
          </View>
          <Text style={st.tipTitle} numberOfLines={1}>{lore.title}</Text>
          <Text style={st.tipPreview} numberOfLines={2}>{lore.body[0]}</Text>
        </View>
        <Text style={st.chev}>›</Text>
      </Pressable>

      <View style={st.list}>
        <Text style={st.listLabel}>TODAY</Text>
        {quests.map(q => {
          const on = done.includes(q.id);
          if (q.rating) {
            const v = s.ratings[s.day];
            return (
              <View key={q.id} style={[st.task, on && st.taskDone]}>
                <Text style={[st.taskText, { flex: 0 }]}>{q.text}</Text>
                <View style={st.rateRow}>
                  {[1, 2, 3, 4, 5].map(n => (
                    <Pressable key={n} accessibilityRole="button" accessibilityLabel={`${n} of 5`} accessibilityState={{ selected: v === n }}
                      onPress={() => onRate(n)} style={[st.rate, v === n && st.rateOn]}>
                      <Text style={[st.rateText, v === n && { color: C.text }]}>{n}</Text>
                    </Pressable>
                  ))}
                </View>
                <Text style={st.hint}>1 = real effort · 5 = didn't even think</Text>
              </View>
            );
          }
          return (
            <Pressable key={q.id} accessibilityRole="checkbox" accessibilityState={{ checked: on }} onPress={() => onToggle(q.id)} style={[st.task, st.taskRow, on && st.taskDone]}>
              <View style={[st.check, on && st.checkOn]}>{on && <Text style={st.checkMark}>✓</Text>}</View>
              <Text style={[st.taskText, on && st.struck]}>{q.text}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={st.nav}>
        <NavBtn label="Journey" sub="Map & lessons" onPress={() => onOpen('journey')} />
        <NavBtn label="Achievements" sub={`${earned} of ${total}`} onPress={() => onOpen('achievements')} />
      </View>
      <View style={st.tester}>
        <Text style={st.testerLabel}>Tester:</Text>
        <Pressable accessibilityRole="button" onPress={onNextDay} hitSlop={8}><Text style={st.testerLink}>Next day ›</Text></Pressable>
        <Pressable accessibilityRole="button" onPress={onNewQuest} hitSlop={8}><Text style={st.testerLink}>{s.demo ? 'Start my own quest' : 'New quest'}</Text></Pressable>
      </View>
    </View>
  );
}

function NavBtn({ label, sub, onPress }: { label: string; sub: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [st.navBtn, pressed && { opacity: 0.8 }]}>
      <Text style={st.navLabel}>{label}</Text>
      <Text style={st.navSub}>{sub}</Text>
    </Pressable>
  );
}

const st = StyleSheet.create({
  page: { gap: 12 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: { flexShrink: 1, fontFamily: F.bold, fontSize: 22, color: C.text },
  demo: { fontFamily: F.bold, fontSize: 11, color: C.text, backgroundColor: C.gold, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, overflow: 'hidden' },
  day: { fontFamily: F.body, fontSize: 15, color: C.muted },
  progress: { height: 8, backgroundColor: C.line, borderRadius: 4, overflow: 'hidden', marginVertical: 4 },
  progressFill: { height: '100%', backgroundColor: C.xp },
  stats: { flexDirection: 'row', gap: 16 },
  stat: { fontFamily: F.bold, fontSize: 16, fontVariant: ['tabular-nums'] },
  why: { backgroundColor: C.parch, borderWidth: 2, borderColor: C.parchLine, borderRadius: 8, paddingVertical: 10, paddingHorizontal: 14, gap: 2 },
  whyLabel: { fontFamily: F.bold, fontSize: 11, letterSpacing: 1.2, color: C.parchMuted },
  whyText: { fontFamily: F.bold, fontSize: 17, lineHeight: 23, color: C.parchHead },
  tip: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.surface, borderWidth: 2, borderColor: C.line, borderRadius: 8, padding: 12 },
  tipLabel: { fontFamily: F.bold, fontSize: 11, letterSpacing: 1.2, color: C.primary },
  new: { fontFamily: F.bold, fontSize: 10, color: C.text, backgroundColor: C.gold, paddingHorizontal: 5, paddingVertical: 1, borderRadius: 3, overflow: 'hidden' },
  tipTitle: { fontFamily: F.bold, fontSize: 17, color: C.text },
  tipPreview: { fontFamily: F.body, fontSize: 14, lineHeight: 19, color: C.muted },
  chev: { fontFamily: F.bold, fontSize: 26, color: C.muted },
  list: { gap: 8 },
  listLabel: { fontFamily: F.bold, fontSize: 11, letterSpacing: 1.2, color: C.muted },
  task: { backgroundColor: C.surface, borderWidth: 2, borderColor: C.line, borderRadius: 8, padding: 12, gap: 8 },
  taskRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  taskDone: { borderColor: C.xp, backgroundColor: '#EAF7EF' },
  taskText: { flex: 1, fontFamily: F.body, fontSize: 17, lineHeight: 23, color: C.text },
  struck: { textDecorationLine: 'line-through', color: C.muted },
  check: { width: 28, height: 28, borderRadius: 6, borderWidth: 2, borderColor: C.muted, alignItems: 'center', justifyContent: 'center', backgroundColor: C.surface },
  checkOn: { backgroundColor: C.xp, borderColor: C.xp },
  checkMark: { fontFamily: F.bold, fontSize: 16, color: '#FFFFFF' },
  rateRow: { flexDirection: 'row', gap: 8 },
  rate: { flex: 1, height: 40, borderRadius: 6, borderWidth: 2, borderColor: C.line, backgroundColor: C.surface2, alignItems: 'center', justifyContent: 'center' },
  rateOn: { backgroundColor: C.gold, borderColor: C.gold },
  rateText: { fontFamily: F.bold, fontSize: 16, color: C.muted },
  hint: { fontFamily: F.body, fontSize: 13, color: C.muted },
  nav: { flexDirection: 'row', gap: 10 },
  navBtn: { flex: 1, backgroundColor: C.primary, borderRadius: 8, borderBottomWidth: 4, borderBottomColor: '#173f8c', paddingVertical: 10, paddingHorizontal: 12 },
  navLabel: { fontFamily: F.bold, fontSize: 16, color: '#FFFFFF' },
  navSub: { fontFamily: F.body, fontSize: 13, color: '#DCE7FB' },
  tester: { flexDirection: 'row', gap: 16, justifyContent: 'center', alignItems: 'center' },
  testerLabel: { fontFamily: F.body, fontSize: 13, color: C.muted },
  testerLink: { fontFamily: F.bold, fontSize: 14, color: C.primary },
});
