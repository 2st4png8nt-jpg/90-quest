import type React from 'react';
import Svg, { Rect } from 'react-native-svg';

type Props = { rows: string[]; palette: Record<string, string>; px: number };

/** Draws a pixel-art sprite from a grid of characters; each character maps to a palette color. */
export function Sprite({ rows, palette, px }: Props) {
  const w = rows[0].length, h = rows.length;
  const rects: React.ReactElement[] = [];
  rows.forEach((row, y) =>
    [...row].forEach((c, x) => {
      if (palette[c]) rects.push(<Rect key={`${x}-${y}`} x={x} y={y} width={1.02} height={1.02} fill={palette[c]} />);
    }),
  );
  return (
    <Svg width={w * px} height={h * px} viewBox={`0 0 ${w} ${h}`}>
      {rects}
    </Svg>
  );
}

export const PIP = ['...yy...', '..yYYy..', '.yYwwYy.', '.YwkwkY.', '.YwwwwY.', '..YYYY..', '...YY...', '....Y...'];
export const PIP_PAL = { y: '#c99a2e', Y: '#ffe08a', w: '#fff6d6', k: '#1b1b2f' };

// Hero art: made from Jon's ChatGPT character sheet (art/hero-sheet-chatgpt.png), converted to a
// 50×120 pixel grid by art/pixelize.py and stored at 4× with hard pixel edges.
export const HEROES = {
  male: { image: require('../assets/heroes/male.png'), ratio: 50 / 120 },
  female: { image: require('../assets/heroes/female.png'), ratio: 49 / 120 },
} as const;
