import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { TRACKS } from '../content';
import { formatTime } from '../device';
import {
  achievementsFor, completedToday, coreWhy, cueLine, currentLore, dayDoneToday, days, daysDone, GameState, minimumAvailable,
  minimumFor, minimumToday, phase, PHASE_NAMES, questsFor, TOTAL_DAYS,
} from '../game';
import { HEROES, PIP, PIP_PAL, Sprite } from '../Sprite';
import { C, F } from '../theme';

export type SheetName = 'journey' | 'achievements' | 'why' | 'reminder';

type Props = {
  s: GameState;
  onToggle: (id: string) => void;
  onMinimum: () => void;
  onRate: (n: number) => void;
  onOpenTip: () => void;
  onOpen: (sheet: SheetName) => void;
  onDismissWelcome: () => void;
  onNextDay: () => void;
  onNewQuest: () => void;
};

export function Home({ s, onToggle, onMinimum, onRate, onOpenTip, onOpen, onDismissWelcome, onNextDay, onNewQuest }: Props) {
  const quests = questsFor(s, s.day);
  const done = completedToday(s);
  const lore = currentLore(s) ?? TRACKS[s.goal].intro;
  const tipNew = lore.day > 1 && !s.seenLore.includes(lore.day);
  const earned = achievementsFor(s.goal).filter(a => s.achievements[a.id]).length;
  const hero = HEROES[s.character];
  const total = daysDone(s);
  const minOn = minimumToday(s);
  const dayDone = dayDoneToday(s);

  return (
    <View style={st.page}>
      <View style={st.header}>
        <Image source={hero.image} accessibilityIgnoresInvertColors style={{ height: 92, width: 92 * hero.ratio }} />
        <View style={{ flex: 1, gap: 2 }}>
          <View style={st.row}>
            <Text style={st.name} numberOfLines={1}>{s.hero}</Text>
            {s.demo && <Text style={st.demo}>DEMO</Text>}
          </View>
          <Text style={st.done}>{days(total)} done</Text>
          <View style={st.progress} accessibilityLabel={`${total} of ${TOTAL_DAYS} days done`}>
            <View style={[st.progressFill, { width: `${Math.round((total / TOTAL_DAYS) * 100)}%` }]} />
          </View>
          <Text style={st.day}>{s.finished ? 'Quest complete' : `Day ${s.day} of ${TOTAL_DAYS}`} · {PHASE_NAMES[phase(s.day)]}</Text>
          <View style={st.stats}>
            <Text style={[st.stat, { color: C.streak }]} accessibilityLabel={`${s.streak} day streak`}>🔥 {s.streak}</Text>
            <Text style={[st.stat, { color: C.shield }]} accessibilityLabel={`${s.shields} Streak Shield`}>🛡 {s.shields}</Text>
            <Pressable accessibilityRole="button" accessibilityLabel={s.reminder ? `Reminder at ${formatTime(s.reminder)}` : 'Set a reminder'} onPress={() => onOpen('reminder')} hitSlop={8}>
              <Text style={[st.stat, { color: C.muted }]}>🔔 {s.reminder ? formatTime(s.reminder) : 'Off'}</Text>
            </Pressable>
          </View>
        </View>
      </View>

      {s.welcomeBack ? (
        <View style={st.welcome}>
          <Text style={st.welcomeTitle}>Welcome back, {s.hero}.</Text>
          <Text style={st.welcomeText}>{total > 0 ? `Your ${days(total)} still count. ` : ''}Missing days is normal. Start small today: even the minimum keeps the habit alive.</Text>
          <Pressable accessibilityRole="button" onPress={onDismissWelcome} hitSlop={8}><Text style={st.link}>Got it</Text></Pressable>
        </View>
      ) : !!coreWhy(s) && (
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
        <Text style={st.cue} numberOfLines={2}>{cueLine(s)}</Text>
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
        {minimumAvailable(s) && (!dayDone || minOn) && (
          <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: minOn }} accessibilityHint="A short version that still counts as a day done"
            onPress={onMinimum} style={[st.minimum, minOn && st.minimumOn]}>
            <View style={[st.check, st.checkSmall, minOn && st.checkKept]}>{minOn && <Text style={st.checkMark}>✓</Text>}</View>
            <Text style={st.minimumText}><Text style={{ fontFamily: F.bold }}>Short on time?</Text> Minimum day: {minimumFor(s).toLowerCase()}</Text>
          </Pressable>
        )}
      </View>

      <View style={st.nav}>
        <NavBtn label="Journey" sub="Map & lessons" onPress={() => onOpen('journey')} />
        <NavBtn label="Achievements" sub={`${earned} earned`} onPress={() => onOpen('achievements')} />
      </View>
      <View style={st.tester}>
        <Text style={st.testerLabel}>Tester:</Text>
        <Pressable accessibilityRole="button" onPress={onNextDay} hitSlop={8}><Text style={st.link}>Next day ›</Text></Pressable>
        <Pressable accessibilityRole="button" onPress={onNewQuest} hitSlop={8}><Text style={st.link}>{s.demo ? 'Start my own quest' : 'New quest'}</Text></Pressable>
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
  done: { fontFamily: F.bold, fontSize: 17, color: C.xpText },
  day: { fontFamily: F.body, fontSize: 14, color: C.muted },
  progress: { height: 8, backgroundColor: C.line, borderRadius: 4, overflow: 'hidden', marginVertical: 3 },
  progressFill: { height: '100%', backgroundColor: C.xp },
  stats: { flexDirection: 'row', gap: 14, marginTop: 2 },
  stat: { fontFamily: F.bold, fontSize: 15, fontVariant: ['tabular-nums'] },
  why: { backgroundColor: C.parch, borderWidth: 2, borderColor: C.parchLine, borderRadius: 8, paddingVertical: 10, paddingHorizontal: 14, gap: 2 },
  whyLabel: { fontFamily: F.bold, fontSize: 11, letterSpacing: 1.2, color: C.parchMuted },
  whyText: { fontFamily: F.bold, fontSize: 17, lineHeight: 23, color: C.parchHead },
  welcome: { backgroundColor: '#E3EDFC', borderWidth: 2, borderColor: C.primary, borderRadius: 8, padding: 14, gap: 6 },
  welcomeTitle: { fontFamily: F.bold, fontSize: 17, color: C.text },
  welcomeText: { fontFamily: F.body, fontSize: 15, lineHeight: 21, color: C.text },
  tip: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.surface, borderWidth: 2, borderColor: C.line, borderRadius: 8, padding: 12 },
  tipLabel: { fontFamily: F.bold, fontSize: 11, letterSpacing: 1.2, color: C.primary },
  new: { fontFamily: F.bold, fontSize: 10, color: C.text, backgroundColor: C.gold, paddingHorizontal: 5, paddingVertical: 1, borderRadius: 3, overflow: 'hidden' },
  tipTitle: { fontFamily: F.bold, fontSize: 17, color: C.text },
  tipPreview: { fontFamily: F.body, fontSize: 14, lineHeight: 19, color: C.muted },
  chev: { fontFamily: F.bold, fontSize: 26, color: C.muted },
  list: { gap: 8 },
  cue: { fontFamily: F.bold, fontSize: 14, lineHeight: 19, color: C.muted },
  task: { backgroundColor: C.surface, borderWidth: 2, borderColor: C.line, borderRadius: 8, padding: 12, gap: 8 },
  taskRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  taskDone: { borderColor: C.xp, backgroundColor: '#EAF7EF' },
  taskText: { flex: 1, fontFamily: F.body, fontSize: 17, lineHeight: 23, color: C.text },
  struck: { textDecorationLine: 'line-through', color: C.muted },
  check: { width: 28, height: 28, borderRadius: 6, borderWidth: 2, borderColor: C.muted, alignItems: 'center', justifyContent: 'center', backgroundColor: C.surface },
  checkSmall: { width: 22, height: 22, borderRadius: 5 },
  checkOn: { backgroundColor: C.xp, borderColor: C.xp },
  checkKept: { backgroundColor: C.kept, borderColor: C.kept },
  checkMark: { fontFamily: F.bold, fontSize: 14, color: '#FFFFFF' },
  rateRow: { flexDirection: 'row', gap: 8 },
  rate: { flex: 1, height: 40, borderRadius: 6, borderWidth: 2, borderColor: C.line, backgroundColor: C.surface2, alignItems: 'center', justifyContent: 'center' },
  rateOn: { backgroundColor: C.gold, borderColor: C.gold },
  rateText: { fontFamily: F.bold, fontSize: 16, color: C.muted },
  hint: { fontFamily: F.body, fontSize: 13, color: C.muted },
  minimum: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 2, borderStyle: 'dashed', borderColor: C.line, borderRadius: 8, paddingVertical: 10, paddingHorizontal: 12 },
  minimumOn: { borderStyle: 'solid', borderColor: C.kept, backgroundColor: '#EEF8F2' },
  minimumText: { flex: 1, fontFamily: F.body, fontSize: 15, lineHeight: 20, color: C.text },
  nav: { flexDirection: 'row', gap: 10 },
  navBtn: { flex: 1, backgroundColor: C.primary, borderRadius: 8, borderBottomWidth: 4, borderBottomColor: '#173f8c', paddingVertical: 10, paddingHorizontal: 12 },
  navLabel: { fontFamily: F.bold, fontSize: 16, color: '#FFFFFF' },
  navSub: { fontFamily: F.body, fontSize: 13, color: '#DCE7FB' },
  tester: { flexDirection: 'row', gap: 16, justifyContent: 'center', alignItems: 'center' },
  testerLabel: { fontFamily: F.body, fontSize: 13, color: C.muted },
  link: { fontFamily: F.bold, fontSize: 14, color: C.primary },
});
