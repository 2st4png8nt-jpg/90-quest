// Palette decisions and the research behind them (see /docs/DESIGN.md):
// - Dark text on a light background: positive polarity improved acuity and proofreading
//   for younger and older adults (Piepenbrock et al. 2013, Ergonomics 56(7)).
// - Calm blue/green base, with bright saturated color saved for rewards: saturation and
//   brightness raised arousal, and blue was rated most pleasant at high saturation
//   (Wilms & Oberfeld 2018, Psychological Research 82, 896–914).
// - Every text color meets WCAG AA contrast (4.5:1) against the surface it sits on.
export const C = {
  bg: '#EAF3F8',        // pale sky
  surface: '#FFFFFF',
  surface2: '#F3F7FB',
  line: '#C9D8E6',
  text: '#16243A',      // 13.9:1 on bg
  muted: '#4F6178',     // 5.6:1 on bg
  primary: '#245BC4',   // buttons; white text 6.2:1
  xp: '#2FB36B',        // bar fill only
  xpText: '#1E7D4A',    // 5.1:1 on white
  gold: '#F5B82E',      // rewards; navy text 8.7:1
  streak: '#C2521A',    // 4.7:1 on white
  shield: '#127A75',    // 5.2:1 on white
  parch: '#FFF6DF', ink: '#3A2A12', parchHead: '#8A4B12', parchMuted: '#6A5532', parchLine: '#E3CF9F',
  outline: '#1c1a2e',
};

export const F = {
  logo: 'PressStart2P_400Regular', // pixel face for the logo and level badge only
  body: 'AtkinsonHyperlegible_400Regular',
  bold: 'AtkinsonHyperlegible_700Bold',
};
