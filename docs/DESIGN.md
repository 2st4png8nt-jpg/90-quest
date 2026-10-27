# 90 Day Quest — visual design and the research behind it

## Colors
- **Light background, dark text.** Dark-on-light text improved visual acuity and proofreading accuracy for both younger and older adults. Piepenbrock et al. (2013), *Ergonomics*, 56(7). The likely reason: a brighter screen shrinks the pupil, which sharpens the image on the retina.
- **Calm blue/green base, bright color saved for rewards.** In a study of hue, saturation and brightness, higher saturation and brightness raised arousal, and blue was rated most pleasant at high saturation. Wilms & Oberfeld (2018), *Psychological Research*, 82, 896–914, doi:10.1007/s00426-017-0880-8. So the everyday UI is soft sky blue and white; saturated gold and green appear for XP, level-ups and badges.
- **Contrast.** Every text color meets WCAG AA (4.5:1) against its background. Ratios are listed in `app/src/theme.ts`.
- **Not used:** the claim that red hurts performance in achievement settings (Elliot et al. 2007). A 2020 meta-analysis (Gnambs, *Psychonomic Bulletin & Review*) found replications failed and no evidential value remained after correcting for publication bias. Red is simply avoided for failure states to keep the tone encouraging, not because of that study.

## Type
- **Atkinson Hyperlegible** for all reading text. Designed with the Braille Institute for people with low vision, with letterforms made as distinct as possible (e.g. I vs l vs 1).
- **Press Start 2P** (pixel font) only for the logo and level badge.

## Characters
- Male and female heroes come from Jon's ChatGPT character sheet (`art/hero-sheet-chatgpt.png`): spiky navy hair with teal glow and a black coat; violet ponytail with a white-and-gold coat.
- `art/pixelize.py` cuts each full-body figure from the sheet, removes the background, shrinks it to a 50×120 pixel grid with a 32-color palette, and saves it at 4× with hard edges (`app/assets/heroes/`).
- Pip, the narrator, is a small glowing wisp drawn in code.
