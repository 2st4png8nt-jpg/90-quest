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

// Original anime-style heroes, 24×32. Male: spiky navy hair with teal tips, black battle coat.
// Female: violet hair with high ponytail, white long coat with gold trim.
export const MALE = ["......c...c..c..........", "......cn.cnocn..c.......", "......onnnnnnnnoc.......", ".....onNNnnnnnnnno......", "....onNNnnnnnnnnnno.....", "...connnnnnnnnnnnnoc....", "....onnnnnnnnnnnnnno....", "...cnnsnnnnnnnnsnnno....", "....onssnnssnnssnno.....", ".....onssssssssssnno....", "....onsoeesssseeosno....", "....onseiissssiiesno....", "......ossssssssssso.....", "......osssssSssssso.....", ".......ossssmmssso......", "........oSsssssSo.......", "......owwoSSSSowwo......", ".....okwwwkSSkwwwko.....", "...okkkwwwwwwwwkkkko....", "...okKkkwwWWwwkkKkko....", "...okKkkkwwwwkkkKkko....", "...osKkkkwwwwkkkKkso....", "...osgggggggggggggso....", "...oskkkkwwwwkkkkkso....", "....okkkkwwwwkkkkko.....", "....okKkkwwwwkkKkkko....", "...okKkkkwwwwkkkKkkko...", "...okkkkkpppppkkkkkko...", "....okkkpppopppkkko.....", "......oppppoppppo.......", "......obbbo.obbbo.......", ".....obbbbo.obbbbo......"];
export const MALE_PAL: Record<string, string> = {"o": "#12101c", "n": "#22264a", "N": "#3b4a8a", "c": "#2ec4c4", "s": "#f3d2b6", "S": "#d9a98a", "e": "#12101c", "i": "#2ec4c4", "m": "#c0756a", "w": "#f4f6fb", "W": "#c7cde0", "k": "#1d1d2b", "K": "#3a3a56", "g": "#2ec4c4", "p": "#2a2a3d", "b": "#3a2c3c"};
export const FEMALE = ["..............vv........", ".............vVvv.......", "..........oooovvvo......", "........onnNNnnnnvo.....", "......onnNNnnnnnnnvo....", "....onnnnnnnnnnnnnvo....", "....onnnnnnnnnnnnnnvo...", "..onnsnnnnnnnnsnnnnvo...", "..onnssnnssnnssnnnnvo...", "..onnssssssssssnnnnvo...", "..onnsoeesssseeosnnvo...", "..onnseyyssssyyesnnvo...", "..onnssssssssssssnnvo...", "...onnsssssSsssssnnvo...", "...onnnosssmmssonnnvo...", "...onnno.oSSSSo.onnvo...", "...onnowwwoSSowwwonvo...", "....onwwwwwSSwwwwwno....", "....owwgwwwwwwwwwgwwo...", "..owwwgwwWwwwWwwgwwwo...", "..owWwgwwwwwwwwwgwWwo...", "..oswwgwwwwwwwwwgwwso...", "..osvvvvvvvvvvvvvvvso...", "..oswwgwwwwwwwwwgwwso...", "....owwgwwwwwwwwwgwwo...", "....owWgwwwwwwwwwgWwo...", "..owwwgwwwddwwwwgwwwo...", "..owwwgwwdddddwwgwwwo...", "....oooooddoddoooooo....", ".......oddo.oddo........", ".......obbo.obbo........", "......obbbo.obbbo......."];
export const FEMALE_PAL: Record<string, string> = {"o": "#12101c", "n": "#4a2b6b", "N": "#7b4fa8", "c": "#2ec4c4", "s": "#f3d2b6", "S": "#d9a98a", "e": "#12101c", "i": "#2ec4c4", "m": "#c0756a", "w": "#f4f6fb", "W": "#c7cde0", "k": "#1d1d2b", "K": "#3a3a56", "g": "#d9a83a", "p": "#2a2a3d", "b": "#3a2c3c", "v": "#a77be0", "V": "#d9c2ff", "y": "#e0a526", "d": "#2a2a3d"};
export const CHARACTERS = { male: { rows: MALE, palette: MALE_PAL }, female: { rows: FEMALE, palette: FEMALE_PAL } } as const;
export type CharacterId = keyof typeof CHARACTERS;
export const PIP = ['...yy...', '..yYYy..', '.yYwwYy.', '.YwkwkY.', '.YwwwwY.', '..YYYY..', '...YY...', '....Y...'];
export const PIP_PAL = { y: '#c99a2e', Y: '#ffe08a', w: '#fff6d6', k: '#1b1b2f' };
