import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { GoalId, WHY_LORE } from '../content';
import { CharacterChoice, Difficulty, DIFFICULTY_LABELS, GameState, newGame, Reminder, WHY_LEVELS } from '../game';
import { ReminderPicker } from '../ReminderPicker';
import { HEROES } from '../Sprite';
import { C, F } from '../theme';
import { Btn, Card, Heading, LoreScroll } from '../ui';

const GOALS: { id: GoalId | 'debt' | 'save' | 'study'; name: string; sub: string; live: boolean; verb: string }[] = [
  { id: 'fitness', name: 'Fitness', sub: 'Move, eat, sleep', live: true, verb: 'get fit' },
  { id: 'habit', name: 'New Habit', sub: 'Stack it on a routine', live: true, verb: 'build this habit' },
  { id: 'debt', name: 'Pay Down Debt', sub: 'Coming soon', live: false, verb: '' },
  { id: 'save', name: 'Save Money', sub: 'Coming soon', live: false, verb: '' },
  { id: 'study', name: 'Study / Learn', sub: 'Coming soon', live: false, verb: '' },
];

type Step = 'hero' | 'goal' | 'why' | 'summary' | 'reminder';
type Props = { onDone: (s: GameState) => void; onDemo: () => void; onCancel?: () => void };

export function Onboarding({ onDone, onDemo, onCancel }: Props) {
  const [step, setStep] = useState<Step>('hero');
  const [character, setCharacter] = useState<CharacterChoice | null>(null);
  const [hero, setHero] = useState('');
  const [goal, setGoal] = useState<GoalId | null>(null);
  const [anchor, setAnchor] = useState('');
  const [habit, setHabit] = useState('');
  const [tiny, setTiny] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('standard');
  const [reminder, setReminder] = useState<Reminder>(null);
  const [why, setWhy] = useState<string[]>([]);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');

  const fail = (m: string) => { setError(m); return false; };
  const goalVerb = goal === 'habit' && habit.trim() ? habit.trim() : GOALS.find(g => g.id === goal)?.verb ?? '';

  if (step === 'hero') {
    return (
      <View style={st.page}>
        <Text style={st.logo}>90 DAY QUEST</Text>
        <Text style={st.title}>Choose your hero</Text>
        <View style={st.chars}>
          {(['male', 'female'] as const).map(c => (
            <Pressable key={c} accessibilityRole="radio" accessibilityLabel={c === 'male' ? 'Male hero' : 'Female hero'}
              accessibilityState={{ selected: character === c }} onPress={() => { setCharacter(c); setError(''); }}
              style={[st.char, character === c && st.on]}>
              <Image source={HEROES[c].image} style={{ height: 190, width: 190 * HEROES[c].ratio }} />
            </Pressable>
          ))}
        </View>
        <Field label="Hero name" value={hero} onChange={setHero} placeholder="e.g. Jon" max={16} />
        {!!error && <Text style={st.error}>{error}</Text>}
        <Btn title="Next" onPress={() => {
          if (!character) return fail('Pick a hero to continue.');
          if (!hero.trim()) return fail('Give your hero a name.');
          setError(''); setStep('goal');
        }} />
        {onCancel ? <Btn variant="ghost" title="Back to my quest" onPress={onCancel} /> : <Btn variant="ghost" title="Peek at a demo first" onPress={onDemo} />}
      </View>
    );
  }

  if (step === 'goal') {
    return (
      <View style={st.page}>
        <Text style={st.title}>Pick your goal</Text>
        <View style={st.grid}>
          {GOALS.map(g => (
            <Pressable key={g.id} disabled={!g.live} accessibilityRole="radio" accessibilityState={{ selected: goal === g.id, disabled: !g.live }}
              onPress={() => { setGoal(g.id as GoalId); setError(''); }}
              style={[st.goal, goal === g.id && st.on, !g.live && { opacity: 0.5 }]}>
              <Text style={st.goalName}>{g.name}</Text>
              <Text style={st.goalSub}>{g.sub}</Text>
            </Pressable>
          ))}
        </View>
        {goal && (
          <Card>
            <Heading>{goal === 'habit' ? 'Stack it on something you already do' : 'Hook it to your routine'}</Heading>
            <Field label="After I… (something you already do every day)" value={anchor} onChange={setAnchor}
              placeholder={goal === 'habit' ? 'pour my morning coffee' : 'get home from work'} />
            {goal === 'habit' && (
              <>
                <Field label="I will… (the new habit)" value={habit} onChange={setHabit} placeholder="read 10 pages" />
                <Field label="Tiny version (optional, ~2 minutes)" value={tiny} onChange={setTiny} placeholder="read 1 page" />
              </>
            )}
            <Text style={st.hintText}>Linking the new action to a cue you already have is what turns it into a habit.</Text>
          </Card>
        )}
        {goal && (
          <Card>
            <Heading>How hard should it start?</Heading>
            <View style={st.diffRow}>
              {(['easy', 'standard', 'hard'] as const).map(d => (
                <Pressable key={d} accessibilityRole="radio" accessibilityState={{ selected: difficulty === d }} onPress={() => setDifficulty(d)} style={[st.diff, difficulty === d && st.on]}>
                  <Text style={st.goalName}>{DIFFICULTY_LABELS[d].name}</Text>
                  <Text style={st.goalSub}>{DIFFICULTY_LABELS[d][goal]}</Text>
                </Pressable>
              ))}
            </View>
            <Text style={st.hintText}>You can change this at your Day 31 and Day 61 check-ins.</Text>
          </Card>
        )}
        {!!error && <Text style={st.error}>{error}</Text>}
        <Btn title="Next: find your why" onPress={() => {
          if (!goal) return fail('Pick a goal to continue.');
          if (!anchor.trim()) return fail('Fill in “After I…” so the plan has a cue.');
          if (goal === 'habit' && !habit.trim()) return fail('Fill in “I will…”.');
          setError(''); setStep('why');
        }} />
        <Btn variant="ghost" title="Back" onPress={() => setStep('hero')} />
      </View>
    );
  }

  if (step === 'why') {
    const level = why.length; // 0-based index of the question being answered
    const question = level === 0 ? `Why do you want to ${goalVerb}?` : 'Why is that important to you?';
    // Pip explains the research at levels 1 and 4, plus the exercise study at level 7 for fitness.
    const shown = level === 0 ? WHY_LORE[0] : level === 3 ? WHY_LORE[1] : level === 6 && goal === 'fitness' ? WHY_LORE[2] : null;
    return (
      <View style={st.page}>
        <View style={st.levels} accessibilityLabel={`Level ${level + 1} of ${WHY_LEVELS}`}>
          {Array.from({ length: WHY_LEVELS }, (_, i) => <View key={i} style={[st.dot, i < level && st.dotDone, i === level && st.dotNow]} />)}
        </View>
        <Text style={st.levelLabel}>Level {level + 1} of {WHY_LEVELS}</Text>
        {level > 0 && <Text style={st.prev}>“{why[level - 1]}”</Text>}
        <Text style={st.title}>{question}</Text>
        <TextInput accessibilityLabel={question} value={draft} onChangeText={t => { setDraft(t); setError(''); }} multiline maxLength={140}
          placeholder="Be honest. Only you see this." placeholderTextColor="#7d8ca0" style={[st.input, { minHeight: 84, textAlignVertical: 'top' }]} />
        {!!error && <Text style={st.error}>{error}</Text>}
        <Btn title={level + 1 < WHY_LEVELS ? 'Go deeper' : 'That\'s my why'} onPress={() => {
          if (!draft.trim()) return fail('Write a few words to go deeper.');
          const next = [...why, draft.trim()];
          setWhy(next); setDraft('');
          if (next.length >= WHY_LEVELS) setStep('summary');
        }} />
        <Btn variant="ghost" title="Back" onPress={() => {
          if (level === 0) return setStep('goal');
          setDraft(why[level - 1]); setWhy(why.slice(0, -1));
        }} />
        {shown && <LoreScroll bite={shown} />}
      </View>
    );
  }

  if (step === 'reminder') {
    return (
      <View style={st.page}>
        <Text style={st.title}>Want a daily reminder?</Text>
        <Text style={st.sub}>One notification a day, at the time you usually {anchor ? `${anchor.replace(/^my /, 'your ')}` : 'do your routine'}. It shows your why and today's first task. That's it.</Text>
        <ReminderPicker value={reminder} onChange={setReminder} />
        <Btn title="Start Day 1" onPress={() => onDone(newGame({ goal: goal!, hero, character: character!, why, anchor, habit, tiny, difficulty, reminder }))} />
        <Btn variant="ghost" title="Back" onPress={() => setStep('summary')} />
      </View>
    );
  }

  return (
    <View style={st.page}>
      <Text style={st.title}>Your why</Text>
      <View style={st.whyCore}>
        <Text style={st.whyCoreText}>“{why[why.length - 1]}”</Text>
      </View>
      <Text style={st.sub}>This stays at the top of your screen every day. Here's how you got there:</Text>
      <View style={{ gap: 6 }}>
        {why.map((w, i) => (
          <View key={i} style={st.chainRow}>
            <Text style={st.chainNum}>{i + 1}</Text>
            <Text style={st.chainText}>{w}</Text>
          </View>
        ))}
      </View>
      <Btn title="Next" onPress={() => setStep('reminder')} />
      <Btn variant="ghost" title="Rewrite my answers" onPress={() => { setWhy([]); setDraft(''); setStep('why'); }} />
    </View>
  );
}

function Field({ label, value, onChange, placeholder, max = 60 }: { label: string; value: string; onChange: (v: string) => void; placeholder: string; max?: number }) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={st.label}>{label}</Text>
      <TextInput accessibilityLabel={label} value={value} onChangeText={onChange} placeholder={placeholder} maxLength={max}
        placeholderTextColor="#7d8ca0" style={st.input} />
    </View>
  );
}

const st = StyleSheet.create({
  page: { gap: 14 },
  logo: { fontFamily: F.logo, fontSize: 18, color: C.primary, textAlign: 'center', paddingTop: 8 },
  title: { fontFamily: F.bold, fontSize: 24, lineHeight: 30, color: C.text },
  sub: { fontFamily: F.body, fontSize: 16, lineHeight: 23, color: C.muted },
  chars: { flexDirection: 'row', gap: 12 },
  char: { flex: 1, alignItems: 'center', paddingVertical: 14, backgroundColor: C.surface, borderWidth: 2, borderColor: C.line, borderRadius: 8 },
  on: { borderColor: C.primary, backgroundColor: '#E3EDFC' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  goal: { flexBasis: '47%', flexGrow: 1, backgroundColor: C.surface, borderWidth: 2, borderColor: C.line, borderRadius: 8, padding: 14, gap: 4 },
  goalName: { fontFamily: F.bold, fontSize: 17, color: C.text },
  goalSub: { fontFamily: F.body, fontSize: 14, color: C.muted },
  label: { fontFamily: F.body, fontSize: 15, color: C.muted },
  input: { fontFamily: F.body, fontSize: 17, color: C.text, backgroundColor: C.surface, borderWidth: 2, borderColor: C.line, borderRadius: 8, padding: 12 },
  error: { fontFamily: F.bold, fontSize: 15, color: C.streak },
  hintText: { fontFamily: F.body, fontSize: 14, lineHeight: 20, color: C.muted },
  diffRow: { flexDirection: 'row', gap: 8 },
  diff: { flex: 1, backgroundColor: C.surface, borderWidth: 2, borderColor: C.line, borderRadius: 8, padding: 10, gap: 4 },
  levels: { flexDirection: 'row', gap: 6 },
  dot: { flex: 1, height: 8, borderRadius: 4, backgroundColor: C.line },
  dotDone: { backgroundColor: C.xp },
  dotNow: { backgroundColor: C.primary },
  levelLabel: { fontFamily: F.bold, fontSize: 13, letterSpacing: 1, color: C.muted, textTransform: 'uppercase' },
  prev: { fontFamily: F.body, fontSize: 16, fontStyle: 'italic', color: C.muted, borderLeftWidth: 3, borderLeftColor: C.line, paddingLeft: 10 },
  whyCore: { backgroundColor: C.parch, borderWidth: 2, borderColor: C.parchLine, borderRadius: 8, padding: 18 },
  whyCoreText: { fontFamily: F.bold, fontSize: 21, lineHeight: 29, color: C.parchHead },
  chainRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  chainNum: { fontFamily: F.bold, fontSize: 14, color: C.primary, width: 18, paddingTop: 2 },
  chainText: { flex: 1, fontFamily: F.body, fontSize: 16, lineHeight: 22, color: C.text },
});
