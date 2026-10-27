import { AtkinsonHyperlegible_400Regular, AtkinsonHyperlegible_700Bold } from '@expo-google-fonts/atkinson-hyperlegible';
import { PressStart2P_400Regular } from '@expo-google-fonts/press-start-2p';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View, type ScrollViewInstance } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { TRACKS } from './src/content';
import { advanceDay, currentLore, demoGame, GameState, markLoreRead, rateToday, Result, toggleQuest } from './src/game';
import { Home } from './src/screens/Home';
import { Onboarding } from './src/screens/Onboarding';
import { AchievementsBody, JourneyBody, Sheet, TipBody, WhyBody } from './src/screens/Sheets';
import { loadGame, saveGame } from './src/storage';
import { C, F } from './src/theme';
import { Btn, LoreScroll } from './src/ui';

type Screen = 'loading' | 'onboarding' | 'intro' | 'home';
type SheetId = 'tip' | 'journey' | 'achievements' | 'why' | null;

export default function App() {
  const [fontsLoaded] = useFonts({ PressStart2P_400Regular, AtkinsonHyperlegible_400Regular, AtkinsonHyperlegible_700Bold });
  const [game, setGame] = useState<GameState | null>(null);
  const [screen, setScreen] = useState<Screen>('loading');
  const [sheet, setSheet] = useState<SheetId>(null);
  const [toast, setToast] = useState('');
  const scrollRef = useRef<ScrollViewInstance>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    loadGame().then(g => { setGame(g); setScreen(g ? 'home' : 'onboarding'); });
  }, []);

  function show(message?: string) {
    if (!message) return;
    setToast(message);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 3000);
  }
  function apply(r: Result) {
    setGame(r.state);
    if (!r.state.demo) saveGame(r.state);
    show(r.message);
  }
  function go(next: Screen) {
    setScreen(next);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
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

  return (
    <SafeAreaProvider>
      <SafeAreaView style={st.root} edges={['top', 'left', 'right']}>
        <StatusBar style="dark" />
        <ScrollView ref={scrollRef} contentContainerStyle={st.content} keyboardShouldPersistTaps="handled">
          {screen === 'onboarding' && (
            <Onboarding
              onDone={g => { apply({ state: g }); go('intro'); }}
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
              onToggle={id => apply(toggleQuest(game, id))}
              onRate={n => apply(rateToday(game, n))}
              onOpenTip={openTip}
              onOpen={setSheet}
              onNextDay={() => apply(advanceDay(game))}
              onNewQuest={() => go('onboarding')}
            />
          )}
        </ScrollView>

        {game && tip && (
          <>
            <Sheet title="Today's tip" visible={sheet === 'tip'} onClose={() => setSheet(null)}><TipBody bite={tip} /></Sheet>
            <Sheet title="My why" visible={sheet === 'why'} onClose={() => setSheet(null)}><WhyBody s={game} /></Sheet>
            <Sheet title="Journey" visible={sheet === 'journey'} onClose={() => setSheet(null)}><JourneyBody s={game} /></Sheet>
            <Sheet title="Achievements" visible={sheet === 'achievements'} onClose={() => setSheet(null)}><AchievementsBody s={game} /></Sheet>
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
