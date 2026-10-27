import { AtkinsonHyperlegible_400Regular, AtkinsonHyperlegible_700Bold } from '@expo-google-fonts/atkinson-hyperlegible';
import { PressStart2P_400Regular } from '@expo-google-fonts/press-start-2p';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View, type ScrollViewInstance } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { TRACKS } from './src/content';
import { scheduleReminder, success, tap } from './src/device';
import {
  advanceDay, checkinDue, completeCheckin, coreWhy, currentLore, dayDoneToday, demoGame, dismissWelcome, GameState, markLoreRead,
  rateToday, Reminder, Result, setDifficulty, setReminder, toggleMinimum, toggleQuest,
} from './src/game';
import { Home, SheetName } from './src/screens/Home';
import { Onboarding } from './src/screens/Onboarding';
import { AchievementsBody, CheckinBody, JourneyBody, ReminderBody, Sheet, TipBody, WhyBody } from './src/screens/Sheets';
import { loadGame, saveGame } from './src/storage';
import { C, F } from './src/theme';
import { Btn, LoreScroll } from './src/ui';

type Screen = 'loading' | 'onboarding' | 'intro' | 'home';
type SheetId = SheetName | 'tip' | 'checkin' | null;

function reminderBody(g: GameState) {
  const why = coreWhy(g);
  return `After you ${g.anchor}: today's plan is ready.${why ? ` Remember why: “${why}”` : ''}`;
}

export default function App() {
  const [fontsLoaded] = useFonts({ PressStart2P_400Regular, AtkinsonHyperlegible_400Regular, AtkinsonHyperlegible_700Bold });
  const [game, setGame] = useState<GameState | null>(null);
  const [screen, setScreen] = useState<Screen>('loading');
  const [sheet, setSheet] = useState<SheetId>(null);
  const [toast, setToast] = useState('');
  const scrollRef = useRef<ScrollViewInstance>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    loadGame().then(g => {
      setGame(g);
      setScreen(g ? 'home' : 'onboarding');
      if (g && checkinDue(g)) setSheet('checkin');
    });
  }, []);

  function show(message?: string) {
    if (!message) return;
    setToast(message);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 3200);
  }
  function commit(next: GameState) {
    setGame(next);
    if (!next.demo) saveGame(next);
  }
  function apply(r: Result) {
    commit(r.state);
    show(r.message);
  }
  function go(next: Screen) {
    setScreen(next);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }
  async function saveReminder(g: GameState, reminder: Reminder) {
    const next = setReminder(g, reminder);
    commit(next);
    if (next.demo) return;
    const ok = await scheduleReminder(reminder, reminderBody(next));
    if (!ok) { commit(setReminder(next, null)); show('Notifications are off for this app. You can allow them in your phone settings.'); }
  }
  function onCheck(r: Result, before: GameState) {
    if (!dayDoneToday(before) && dayDoneToday(r.state)) success(); else tap();
    apply(r);
  }
  function openTip() {
    if (!game) return;
    setSheet('tip');
    const lore = currentLore(game);
    if (lore) apply(markLoreRead(game, lore.day));
  }

  if (!fontsLoaded || screen === 'loading') {
    return <View style={[st.root, st.center]}><ActivityIndicator color={C.primary} /></View>;
  }

  const tip = game ? currentLore(game) ?? TRACKS[game.goal].intro : null;
  const due = game ? checkinDue(game) : null;
  const close = () => setSheet(null);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={st.root} edges={['top', 'left', 'right']}>
        <StatusBar style="dark" />
        <ScrollView ref={scrollRef} contentContainerStyle={st.content} keyboardShouldPersistTaps="handled">
          {screen === 'onboarding' && (
            <Onboarding
              onDone={g => { commit(g); if (g.reminder) saveReminder(g, g.reminder); go('intro'); }}
              onDemo={() => { setGame(demoGame()); go('home'); }}
              onCancel={game && !game.demo ? () => go('home') : undefined}
            />
          )}
          {screen === 'intro' && game && (
            <View style={{ gap: 14 }}>
              <Text style={st.logo}>DAY 1</Text>
              <LoreScroll bite={TRACKS[game.goal].intro} />
              <Btn title="Let's go" onPress={() => go('home')} />
            </View>
          )}
          {screen === 'home' && game && (
            <Home
              s={game}
              onToggle={id => onCheck(toggleQuest(game, id), game)}
              onMinimum={() => onCheck(toggleMinimum(game), game)}
              onRate={n => onCheck(rateToday(game, n), game)}
              onOpenTip={openTip}
              onOpen={setSheet}
              onDismissWelcome={() => commit(dismissWelcome(game))}
              onNextDay={() => {
                const r = advanceDay(game);
                apply(r);
                if (checkinDue(r.state)) setSheet('checkin');
              }}
              onNewQuest={() => go('onboarding')}
            />
          )}
        </ScrollView>

        {game && tip && (
          <>
            <Sheet title="Today's tip" visible={sheet === 'tip'} onClose={close}><TipBody bite={tip} /></Sheet>
            <Sheet title="My why" visible={sheet === 'why'} onClose={close}><WhyBody s={game} /></Sheet>
            <Sheet title="Journey" visible={sheet === 'journey'} onClose={close}><JourneyBody s={game} /></Sheet>
            <Sheet title="Achievements" visible={sheet === 'achievements'} onClose={close}><AchievementsBody s={game} /></Sheet>
            <Sheet title="Daily reminder" visible={sheet === 'reminder'} onClose={close}>
              <ReminderBody s={game} onSave={r => { saveReminder(game, r); close(); }} />
            </Sheet>
            <Sheet title="Check-in" visible={sheet === 'checkin' && !!due} onClose={() => { if (due) commit(completeCheckin(game, due)); close(); }}>
              {due && (
                <CheckinBody s={game} day={due} onDone={(d, r) => {
                  const next = completeCheckin(setDifficulty(game, d), due);
                  if (r !== game.reminder) saveReminder(next, r); else commit(next);
                  close();
                  show('Plan updated for the next 30 days.');
                }} />
              )}
            </Sheet>
          </>
        )}

        {!!toast && (
          <View pointerEvents="none" style={st.toast} accessibilityLiveRegion="polite">
            <Text style={st.toastText}>{toast}</Text>
          </View>
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  center: { alignItems: 'center', justifyContent: 'center' },
  content: { padding: 16, paddingBottom: 32, maxWidth: 520, width: '100%', alignSelf: 'center' },
  logo: { fontFamily: F.logo, fontSize: 18, color: C.primary, textAlign: 'center', paddingVertical: 8 },
  toast: { position: 'absolute', left: 16, right: 16, bottom: 32, backgroundColor: C.text, borderRadius: 8, padding: 14 },
  toastText: { fontFamily: F.bold, fontSize: 15, color: '#FFFFFF', textAlign: 'center' },
});
