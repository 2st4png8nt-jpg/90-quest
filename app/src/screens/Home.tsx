import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { bitesFor, SOURCES, TRACKS } from '../content';
import { completedToday, currentLore, GameState, level, phase, PHASE_NAMES, questsFor, TOTAL_DAYS } from '../game';
import { CHARACTERS, Sprite } from '../Sprite';
import { C, F } from '../theme';
import { Bob, Btn, Card, Heading, LoreScroll } from '../ui';

type Props = {
  s: GameState;
  onToggle: (id: string) => void;
  onRate: (n: number) => void;
  onNextDay: () => void;
  onNewQuest: () => void;
};

export function Home({ s, onToggle, onRate, onNextDay, onNewQuest }: Props) {
  const lv = level(s.xp);
  const quests = questsFor(s, s.day);
  const done = completedToday(s);
  const lore = currentLore(s);
  const all = bitesFor(s.goal);
  const unlocked = [TRACKS[s.goal].intro, ...all.filter(b => b.day <= s.day)];
  const ch = CHARACTERS[s.character];

  return (
    <View style={{ gap: 14 }}>
      <View style={st.top}>
        <Text style={st.logo}>90 DAY QUEST</Text>
        {s.demo && <Text style={st.demo}>DEMO RUN</Text>}
      </View>

      <Card style={st.hero}>
        <Bob><Sprite rows={ch.rows} palette={ch.palette} px={4} /></Bob>
        <View style={{ flex: 1, gap: 6 }}>
          <View style={st.nameRow}>
            <Text style={st.name} numberOfLines={1}>{s.hero}</Text>
            <Text style={st.lv}>LV {lv.level}</Text>
          </View>
          <Text style={st.sub}>{TRACKS[s.goal].name} · Day {s.day} of {TOTAL_DAYS}</Text>
          <Text style={st.sub}>{PHASE_NAMES[phase(s.day)]}</Text>
          <View style={st.bar} accessibilityRole="progressbar" accessibilityLabel={`${lv.current} of ${lv.needed} XP to next level`}>
            <View style={[st.barFill, { width: `${Math.round((lv.current / lv.needed) * 100)}%` }]} />
          </View>
          <Text style={st.xpText}>{lv.current} / {lv.needed} XP</Text>
          <View style={st.stats}>
            <Text style={[st.stat, { color: C.streak }]}>🔥 {s.streak}-day streak</Text>
            <Text style={[st.stat, { color: C.shield }]}>🛡 {s.shields} shield</Text>
          </View>
        </View>
      </Card>

      <Card>
        <Heading>Today's quests</Heading>
        {quests.map(q => {
          const on = done.includes(q.id);
          if (q.rating) {
            const v = s.ratings[s.day];
            return (
              <View key={q.id} style={[st.quest, on && st.questDone]}>
                <Check on={on} />
                <View style={{ flex: 1, gap: 8 }}>
                  <Text style={st.questText}>{q.text}</Text>
                  <View style={st.rateRow}>
                    {[1, 2, 3, 4, 5].map(n => (
                      <Pressable key={n} accessibilityRole="button" accessibilityLabel={`Rate ${n} of 5`} accessibilityState={{ selected: v === n }}
                        onPress={() => onRate(n)} style={[st.rate, v === n && st.rateOn]}>
                        <Text style={[st.rateText, v === n && { color: C.text }]}>{n}</Text>
                      </Pressable>
                    ))}
                  </View>
                  <Text style={st.rateHint}>1 = took real effort · 5 = did it without thinking</Text>
                </View>
                <Text style={st.questXp}>+{q.xp}</Text>
              </View>
            );
          }
          return (
            <Pressable key={q.id} accessibilityRole="checkbox" accessibilityState={{ checked: on }} onPress={() => onToggle(q.id)}
              style={[st.quest, on && st.questDone]}>
              <Check on={on} />
              <Text style={[st.questText, { flex: 1 }, on && st.struck]}>{q.text}</Text>
              <Text style={st.questXp}>+{q.xp}</Text>
            </Pressable>
          );
        })}
      </Card>

      {lore && (
        <View style={{ gap: 8 }}>
          <Heading>Pip's lore · Day {lore.day}</Heading>
          <LoreScroll bite={lore} isNew={!s.seenLore.includes(lore.day)} />
        </View>
      )}

      <Card>
        <Heading>90-day map</Heading>
        <View style={st.map}>
          {Array.from({ length: TOTAL_DAYS }, (_, i) => {
            const d = i + 1, l = s.log[d];
            const bg = d >= s.day ? C.surface2 : l === 'missed-shield' ? C.shield : Array.isArray(l) && l.length ? C.xp : '#D5DEE8';
            const milestone = [30, 60, 66, 90].includes(d);
            return <View key={d} style={[st.cell, { backgroundColor: bg }, milestone && { borderColor: C.gold, borderWidth: 2 }, d === s.day && st.today]} />;
          })}
        </View>
        <View style={st.phases}>
          <Text style={st.phase}>1–30 Spawn</Text><Text style={st.phase}>31–60 Grind</Text><Text style={st.phase}>61–90 Boss</Text>
        </View>
        <View style={st.legend}>
          <Legend color={C.xp} label="Cleared" /><Legend color={C.shield} label="Shield used" />
          <Legend color="#D5DEE8" label="Missed" /><Legend color={C.gold} label="Milestone" />
        </View>
      </Card>

      <Card>
        <Heading>Codex · {unlocked.length} of {all.length + 1} unlocked</Heading>
        {unlocked.map(b => <CodexRow key={`${b.day}-${b.title}`} day={b.day} title={b.title} body={b.body} cite={SOURCES[b.source].cite} />)}
      </Card>

      <Card>
        <Heading>Tester controls</Heading>
        <Text style={st.sub}>“Next day” simulates time passing so you can see streaks, shields and new lore unlock.</Text>
        <Btn title="Next day ▸" onPress={onNextDay} />
        <Btn variant="ghost" title={s.demo ? 'Start my own quest' : 'Start a new quest'} onPress={onNewQuest} />
      </Card>
    </View>
  );
}

function Check({ on }: { on: boolean }) {
  return <View style={[st.check, on && st.checkOn]}>{on && <Text style={st.checkMark}>✓</Text>}</View>;
}
function Legend({ color, label }: { color: string; label: string }) {
  return <View style={st.legendItem}><View style={[st.swatch, { backgroundColor: color }]} /><Text style={st.legendText}>{label}</Text></View>;
}
function CodexRow({ day, title, body, cite }: { day: number; title: string; body: string[]; cite: string }) {
  const [open, setOpen] = useState(false);
  return (
    <View style={st.codex}>
      <Pressable accessibilityRole="button" accessibilityState={{ expanded: open }} onPress={() => setOpen(!open)} style={st.codexHead}>
        <Text style={st.codexDay}>DAY {day}</Text>
        <Text style={st.codexTitle}>{title}</Text>
        <Text style={st.codexChevron}>{open ? '–' : '+'}</Text>
      </Pressable>
      {open && (
        <View style={{ gap: 8, paddingBottom: 8 }}>
          {body.map((p, i) => <Text key={i} style={st.codexBody}>{p}</Text>)}
          <Text style={st.codexCite}>{cite}</Text>
        </View>
      )}
    </View>
  );
}

const st = StyleSheet.create({
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  logo: { fontFamily: F.logo, fontSize: 16, color: C.primary },
  demo: { fontFamily: F.bold, fontSize: 12, color: C.text, backgroundColor: C.gold, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, overflow: 'hidden' },
  hero: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: { flexShrink: 1, fontFamily: F.bold, fontSize: 20, color: C.text },
  lv: { fontFamily: F.logo, fontSize: 10, color: C.text, backgroundColor: C.gold, paddingHorizontal: 6, paddingVertical: 5, borderRadius: 4, overflow: 'hidden' },
  sub: { fontFamily: F.body, fontSize: 15, color: C.muted, lineHeight: 21 },
  bar: { height: 14, backgroundColor: C.surface2, borderWidth: 2, borderColor: C.line, borderRadius: 7, overflow: 'hidden', marginTop: 4 },
  barFill: { height: '100%', backgroundColor: C.xp },
  xpText: { fontFamily: F.bold, fontSize: 14, color: C.xpText, fontVariant: ['tabular-nums'] },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  stat: { fontFamily: F.bold, fontSize: 14 },
  quest: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.surface2, borderWidth: 2, borderColor: C.line, borderRadius: 6, padding: 12 },
  questDone: { borderColor: C.xp, backgroundColor: '#EAF7EF' },
  questText: { fontFamily: F.body, fontSize: 17, lineHeight: 23, color: C.text },
  struck: { textDecorationLine: 'line-through', color: C.muted },
  questXp: { fontFamily: F.bold, fontSize: 14, color: C.xpText },
  check: { width: 28, height: 28, borderRadius: 4, borderWidth: 2, borderColor: C.muted, alignItems: 'center', justifyContent: 'center', backgroundColor: C.surface },
  checkOn: { backgroundColor: C.xp, borderColor: C.xp },
  checkMark: { fontFamily: F.bold, fontSize: 16, color: '#FFFFFF' },
  rateRow: { flexDirection: 'row', gap: 8 },
  rate: { width: 40, height: 40, borderRadius: 6, borderWidth: 2, borderColor: C.line, backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center' },
  rateOn: { backgroundColor: C.gold, borderColor: C.gold },
  rateText: { fontFamily: F.bold, fontSize: 16, color: C.muted },
  rateHint: { fontFamily: F.body, fontSize: 13, color: C.muted },
  map: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  cell: { width: '5.6%', aspectRatio: 1, borderRadius: 2, borderWidth: 1, borderColor: C.line },
  today: { borderColor: C.primary, borderWidth: 2 },
  phases: { flexDirection: 'row', justifyContent: 'space-between' },
  phase: { fontFamily: F.bold, fontSize: 13, color: C.muted },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  swatch: { width: 12, height: 12, borderRadius: 2 },
  legendText: { fontFamily: F.body, fontSize: 14, color: C.muted },
  codex: { borderTopWidth: 1, borderColor: C.line },
  codexHead: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12 },
  codexDay: { fontFamily: F.bold, fontSize: 12, color: C.primary, width: 54 },
  codexTitle: { flex: 1, fontFamily: F.bold, fontSize: 16, color: C.text },
  codexChevron: { fontFamily: F.bold, fontSize: 20, color: C.muted },
  codexBody: { fontFamily: F.body, fontSize: 16, lineHeight: 24, color: C.text },
  codexCite: { fontFamily: F.body, fontSize: 13, lineHeight: 19, color: C.muted },
});
