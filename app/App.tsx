import { AtkinsonHyperlegible_400Regular, AtkinsonHyperlegible_700Bold } from '@expo-google-fonts/atkinson-hyperlegible';
import { PressStart2P_400Regular } from '@expo-google-fonts/press-start-2p';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View, type ScrollViewInstance } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { TRACKS } from './src/content';
import { advanceDay, demoGame, GameState, rateToday, Result, toggleQuest } from './src/game';
import { Home } from './src/screens/Home';
import { Setup } from './src/screens/Setup';
import { loadGame, saveGame } from './src/storage';
import { C, F } from './src/theme';
import { Btn, Card, LoreScroll } from './src/ui';

type Screen = 'loading' | 'setup' | 'intro' | 'home';

export default function App() {
  const [fontsLoaded] = useFonts({ PressStart2P_400Regular, AtkinsonHyperlegible_400Regular, AtkinsonHyperlegible_700Bold });
  const [game, setGame] = useState<GameState | null>(null);
  const [screen, setScreen] = useState<Screen>('loading');
  const [toast, setToast] = useState('');
  const scrollRef = useRef<ScrollViewInstance>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    loadGame().then(g => { setGame(g); setScreen(g ? 'home' : 'setup'); });
  }, []);

  function show(message?: string) {
    if (!message) return;
    setToast(message);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 2800);
  }
  function apply(r: Result) {
    setGame(r.state);
    saveGame(r.state);
    show(r.message);
  }
  function go(next: Screen) {
    setScreen(next);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }

  if (!fontsLoaded || screen === 'loading') {
    return <View style={[st.root, st.center]}><ActivityIndicator color={C.primary} /></View>;
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={st.root} edges={['top', 'left', 'right']}>
        <StatusBar style="dark" />
        <ScrollView ref={scrollRef} contentContainerStyle={st.content} keyboardShouldPersistTaps="handled">
          {screen === 'setup' && (
            <Setup
              onStart={g => { apply({ state: g }); go('intro'); }}
              onDemo={() => { const g = demoGame(); setGame(g); go('home'); }}
              onCancel={game && !game.demo ? () => go('home') : undefined}
            />
          )}
          {screen === 'intro' && game && (
            <View style={{ gap: 14 }}>
              <Text style={st.logo}>DAY 1</Text>
              <LoreScroll bite={TRACKS[game.goal].intro} />
              <Card>
                <Text style={st.body}>You start with 25 XP already in the bar. Pip will explain why on Day 10.</Text>
                <Btn title="Accept quest ▸" onPress={() => go('home')} />
              </Card>
            </View>
          )}
          {screen === 'home' && game && (
            <Home
              s={game}
              onToggle={id => apply(toggleQuest(game, id))}
              onRate={n => apply(rateToday(game, n))}
              onNextDay={() => { apply(advanceDay(game)); scrollRef.current?.scrollTo({ y: 0, animated: true }); }}
              onNewQuest={() => go('setup')}
            />
          )}
        </ScrollView>
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
  content: { padding: 16, paddingBottom: 48, gap: 14, maxWidth: 520, width: '100%', alignSelf: 'center' },
  logo: { fontFamily: F.logo, fontSize: 18, color: C.primary, textAlign: 'center', paddingVertical: 8 },
  body: { fontFamily: F.body, fontSize: 17, lineHeight: 25, color: C.text },
  toast: { position: 'absolute', left: 16, right: 16, bottom: 32, backgroundColor: C.text, borderRadius: 8, padding: 14 },
  toastText: { fontFamily: F.bold, fontSize: 15, color: '#FFFFFF', textAlign: 'center' },
});
