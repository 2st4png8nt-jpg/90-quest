import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { GoalId } from '../content';
import { CharacterChoice, GameState, newGame } from '../game';
import { HEROES } from '../Sprite';
import { C, F } from '../theme';
import { Btn, Card, Heading } from '../ui';

const GOALS: { id: GoalId | 'debt' | 'save' | 'study'; name: string; sub: string; live: boolean }[] = [
  { id: 'fitness', name: 'Fitness', sub: 'Move, eat, sleep', live: true },
  { id: 'habit', name: 'New Habit', sub: 'Stack it on a routine', live: true },
  { id: 'debt', name: 'Pay Down Debt', sub: 'Coming soon', live: false },
  { id: 'save', name: 'Save Money', sub: 'Coming soon', live: false },
  { id: 'study', name: 'Study / Learn', sub: 'Coming soon', live: false },
];

type Props = { onStart: (s: GameState) => void; onDemo: () => void; onCancel?: () => void };

export function Setup({ onStart, onDemo, onCancel }: Props) {
  const [goal, setGoal] = useState<GoalId>('habit');
  const [character, setCharacter] = useState<CharacterChoice>('male');
  const [hero, setHero] = useState('');
  const [anchor, setAnchor] = useState('');
  const [habit, setHabit] = useState('');
  const [tiny, setTiny] = useState('');
  const [error, setError] = useState('');

  function begin() {
    if (!hero.trim()) return setError('Give your hero a name to begin.');
    if (goal === 'habit' && (!anchor.trim() || !habit.trim())) return setError('Fill in “After I…” and “I will…” to build your habit stack.');
    onStart(newGame({ goal, hero, character, anchor, habit, tiny }));
  }

  return (
    <View style={{ gap: 14 }}>
      <Text style={st.logo}>90 DAY QUEST</Text>
      <Card>
        <Heading>Choose your quest</Heading>
        <View style={st.grid}>
          {GOALS.map(g => (
            <Pressable key={g.id} disabled={!g.live} accessibilityRole="radio" accessibilityState={{ selected: goal === g.id, disabled: !g.live }}
              onPress={() => setGoal(g.id as GoalId)}
              style={[st.goal, goal === g.id && st.goalOn, !g.live && { opacity: 0.5 }]}>
              <Text style={st.goalName}>{g.name}</Text>
              <Text style={st.goalSub}>{g.sub}</Text>
            </Pressable>
          ))}
        </View>
      </Card>

      <Card>
        <Heading>Your hero</Heading>
        <View style={st.chars}>
          {(['male', 'female'] as const).map(c => (
            <Pressable key={c} accessibilityRole="radio" accessibilityLabel={c === 'male' ? 'Male hero' : 'Female hero'} accessibilityState={{ selected: character === c }}
              onPress={() => setCharacter(c)} style={[st.char, character === c && st.goalOn]}>
              <Image source={HEROES[c].image} style={{ height: 150, width: 150 * HEROES[c].ratio }} />
            </Pressable>
          ))}
        </View>
        <Field label="Hero name" value={hero} onChange={setHero} placeholder="e.g. Jon" max={16} />
      </Card>

      {goal === 'habit' && (
        <Card>
          <Heading>Build your habit stack</Heading>
          <Field label="After I… (something you already do every day)" value={anchor} onChange={setAnchor} placeholder="pour my morning coffee" />
          <Field label="I will… (the new habit)" value={habit} onChange={setHabit} placeholder="read 10 pages" />
          <Field label="Tiny version for the first 30 days (optional)" value={tiny} onChange={setTiny} placeholder="read 1 page" />
        </Card>
      )}

      {!!error && <Text style={st.error}>{error}</Text>}
      <Btn title="Begin Day 1" onPress={begin} />
      {onCancel ? <Btn variant="ghost" title="Back to my quest" onPress={onCancel} /> : <Btn variant="ghost" title="Peek at a demo run" onPress={onDemo} />}
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
  logo: { fontFamily: F.logo, fontSize: 18, color: C.primary, textAlign: 'center', paddingVertical: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  goal: { flexBasis: '47%', flexGrow: 1, backgroundColor: C.surface2, borderWidth: 2, borderColor: C.line, borderRadius: 6, padding: 12, gap: 4 },
  goalOn: { borderColor: C.primary, backgroundColor: '#E3EDFC' },
  goalName: { fontFamily: F.bold, fontSize: 16, color: C.text },
  goalSub: { fontFamily: F.body, fontSize: 14, color: C.muted },
  chars: { flexDirection: 'row', gap: 12 },
  char: { flex: 1, alignItems: 'center', paddingVertical: 12, backgroundColor: C.surface2, borderWidth: 2, borderColor: C.line, borderRadius: 6 },
  label: { fontFamily: F.body, fontSize: 15, color: C.muted },
  input: { fontFamily: F.body, fontSize: 17, color: C.text, backgroundColor: C.surface2, borderWidth: 2, borderColor: C.line, borderRadius: 6, padding: 12 },
  error: { fontFamily: F.bold, fontSize: 15, color: C.streak, textAlign: 'center' },
});
