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
- Two original anime-style heroes, 24×32 pixels: male (spiky navy hair, teal tips, black battle coat) and female (violet hair, high ponytail, white long coat with gold trim).
- Style is inspired by shonen anime; no existing character is copied.
- Pip, the narrator, is a small glowing wisp.
