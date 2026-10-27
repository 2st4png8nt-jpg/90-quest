import type React from 'react';
import { useEffect, useRef } from 'react';
import { AccessibilityInfo, Animated, Linking, Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Bite, SOURCES } from './content';
import { PIP, PIP_PAL, Sprite } from './Sprite';
import { C, F } from './theme';

/** Gentle idle bounce; skipped when the phone's Reduce Motion setting is on. */
export function Bob({ children }: { children: React.ReactNode }) {
  const y = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    let loop: Animated.CompositeAnimation | undefined;
    AccessibilityInfo.isReduceMotionEnabled().then(reduce => {
      if (reduce) return;
      loop = Animated.loop(Animated.sequence([
        Animated.timing(y, { toValue: -3, duration: 0, useNativeDriver: true, delay: 600 }),
        Animated.timing(y, { toValue: 0, duration: 0, useNativeDriver: true, delay: 600 }),
      ]));
      loop.start();
    });
    return () => loop?.stop();
  }, [y]);
  return <Animated.View style={{ transform: [{ translateY: y }] }}>{children}</Animated.View>;
}

export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[s.card, style]}>{children}</View>;
}

export function Heading({ children }: { children: React.ReactNode }) {
  return <Text accessibilityRole="header" style={s.heading}>{children}</Text>;
}

export function Btn({ title, onPress, variant = 'primary' }: { title: string; onPress: () => void; variant?: 'primary' | 'ghost' }) {
  const ghost = variant === 'ghost';
  return (
    <Pressable accessibilityRole="button" onPress={onPress}
      style={({ pressed }) => [s.btn, ghost && s.btnGhost, pressed && { opacity: 0.85, transform: [{ translateY: 2 }] }]}>
      <Text style={[s.btnText, ghost && { color: C.primary }]}>{title}</Text>
    </Pressable>
  );
}

export function LoreScroll({ bite, isNew }: { bite: Bite; isNew?: boolean }) {
  const src = SOURCES[bite.source];
  return (
    <View style={s.scroll}>
      {isNew && <Text style={s.new}>NEW</Text>}
      <View style={s.pipRow}>
        <Bob><Sprite rows={PIP} palette={PIP_PAL} px={4} /></Bob>
        <Text style={s.scrollTitle}>{bite.title}</Text>
      </View>
      {bite.body.map((p, i) => <Text key={i} style={s.scrollP}>{p}</Text>)}
      <View style={s.src}>
        <Text style={s.srcText}>Source: {src.cite}</Text>
        <Text accessibilityRole="link" style={s.srcLink} onPress={() => Linking.openURL(src.url)}>Read the study ↗</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: { backgroundColor: C.surface, borderWidth: 2, borderColor: C.line, borderRadius: 6, padding: 16, gap: 10 },
  heading: { fontFamily: F.bold, fontSize: 13, letterSpacing: 1, textTransform: 'uppercase', color: C.muted },
  btn: { backgroundColor: C.primary, paddingVertical: 14, paddingHorizontal: 16, borderRadius: 6, borderBottomWidth: 4, borderBottomColor: '#173f8c' },
  btnGhost: { backgroundColor: C.surface, borderWidth: 2, borderColor: C.primary, borderBottomWidth: 4 },
  btnText: { fontFamily: F.bold, fontSize: 16, color: '#FFFFFF', textAlign: 'center' },
  scroll: { backgroundColor: C.parch, borderWidth: 2, borderColor: C.parchLine, borderRadius: 6, padding: 16, gap: 10 },
  new: { position: 'absolute', top: -11, right: 12, backgroundColor: C.gold, color: C.text, fontFamily: F.bold, fontSize: 12, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, overflow: 'hidden' },
  pipRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  scrollTitle: { flex: 1, fontFamily: F.bold, fontSize: 19, lineHeight: 25, color: C.parchHead },
  scrollP: { fontFamily: F.body, fontSize: 17, lineHeight: 26, color: C.ink },
  src: { borderTopWidth: 1, borderColor: C.parchLine, paddingTop: 10, gap: 4 },
  srcText: { fontFamily: F.body, fontSize: 13, lineHeight: 19, color: C.parchMuted },
  srcLink: { fontFamily: F.bold, fontSize: 15, color: C.parchHead, textDecorationLine: 'underline', paddingVertical: 4 },
});
