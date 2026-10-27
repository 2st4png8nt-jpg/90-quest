// All lore must cite a source below. Each was checked against the paper or publisher
// page on 2026-10-27; details live in /research/sources.json. Never add a claim
// without a verified source.

export type GoalId = 'fitness' | 'habit';

export type SourceId =
  | 'lally' | 'goll' | 'harkin' | 'wood' | 'dai' | 'kivetz'
  | 'who' | 'paluch' | 'burke' | 'morton' | 'watson'
  | 'sheldon' | 'koestner' | 'teixeira';

export const SOURCES: Record<SourceId, { cite: string; url: string }> = {
  lally: { cite: 'Lally, van Jaarsveld, Potts & Wardle (2010). European Journal of Social Psychology, 40, 998–1009.', url: 'https://doi.org/10.1002/ejsp.674' },
  goll: { cite: 'Gollwitzer & Sheeran (2006). Advances in Experimental Social Psychology, 38, 69–119.', url: 'https://doi.org/10.1016/S0065-2601(06)38002-1' },
  harkin: { cite: 'Harkin et al. (2016). Psychological Bulletin, 142(2), 198–229.', url: 'https://doi.org/10.1037/bul0000025' },
  wood: { cite: 'Wood & Rünger (2016). Annual Review of Psychology, 67.', url: 'https://doi.org/10.1146/annurev-psych-122414-033417' },
  dai: { cite: 'Dai, Milkman & Riis (2014). Management Science.', url: 'https://doi.org/10.1287/mnsc.2014.1901' },
  kivetz: { cite: 'Kivetz, Urminsky & Zheng (2006). Journal of Marketing Research, 43, 39–58.', url: 'https://business.columbia.edu/sites/default/files-efs/pubfiles/1200/goalgradient.pdf' },
  who: { cite: 'Bull et al. (2020). WHO guidelines on physical activity. British Journal of Sports Medicine, 54, 1451–1462.', url: 'https://doi.org/10.1136/bjsports-2020-102955' },
  paluch: { cite: 'Paluch et al. (2022). Lancet Public Health, 7, e219–28.', url: 'https://discovery.ucl.ac.uk/id/eprint/10170017/1/1-s2.0-S2468266721003029-main.pdf' },
  burke: { cite: 'Burke, Wang & Sevick (2011). Journal of the American Dietetic Association, 111(1), 92–102.', url: 'https://pubmed.ncbi.nlm.nih.gov/21185970/' },
  morton: { cite: 'Morton et al. (2018). British Journal of Sports Medicine, 52(6), 376–384.', url: 'https://bjsm.bmj.com/content/52/6/376' },
  sheldon: { cite: 'Sheldon & Elliot (1999). Journal of Personality and Social Psychology, 76(3), 482–497.', url: 'https://doi.org/10.1037/0022-3514.76.3.482' },
  koestner: { cite: 'Koestner (2008). Canadian Psychology, 49(1), 60–67.', url: 'https://selfdeterminationtheory.org/wp-content/uploads/2014/04/2008_Koestner_CanPsyc.pdf.pdf' },
  teixeira: { cite: 'Teixeira, Carraça, Markland, Silva & Ryan (2012). International Journal of Behavioral Nutrition and Physical Activity, 9, 78.', url: 'https://doi.org/10.1186/1479-5868-9-78' },
  watson: { cite: 'Watson et al. (2015). Journal of Clinical Sleep Medicine, 11(6), 591–592.', url: 'https://doi.org/10.5664/jcsm.4758' },
};

export type Bite = { day: number; title: string; source: SourceId; body: string[]; goal?: GoalId };

const SHARED: Bite[] = [
  { day: 2, goal: 'habit', title: 'Your if-then plan is a cheat code', source: 'goll', body: [
    'That “After I ___, I will ___” line you wrote has a name: an implementation intention.',
    'A 2006 meta-analysis pooled 94 tests and found if-then plans gave goal pursuit a medium-to-large boost (d = 0.65). You made the decision ahead of time, so future-you doesn\'t have to.'] },
  { day: 3, goal: 'habit', title: 'Cues do the heavy lifting', source: 'wood', body: [
    'Habits are triggered by context: a place, a time, or the action right before.',
    'Once a habit forms, seeing the cue calls up the behavior automatically. That\'s why your quest hooks onto something you already do.'] },
  { day: 5, title: 'Why you check things off', source: 'harkin', body: [
    'A 2016 review of 138 experiments, with nearly 20,000 people, found that tracking progress helped people reach their goals.',
    'The effect was bigger when progress was physically recorded, like tapping that checkbox.'] },
  { day: 7, title: 'Missed a day? You\'re fine', source: 'lally', body: [
    'In the UCL habit study, missing one chance to do the behavior didn\'t meaningfully set back habit building.',
    'That\'s why you get one Streak Shield per week. It\'s the long gaps that hurt.'] },
  { day: 10, title: 'The closer you get, the faster you go', source: 'kivetz', body: [
    'In a coffee-card study, people bought coffee more often as they got closer to their free drink. By the last stamp, they were coming back about 20% sooner.',
    'Progress you can see pulls you forward. Watch your next milestone on the map get closer.'] },
  { day: 14, title: 'Why checking off feels good', source: 'wood', body: [
    'Habits form when a rewarded action is repeated in the same context. The reward helps lock in the link between cue and action.',
    'That small hit of satisfaction when you check off today counts. Let yourself enjoy it.'] },
  { day: 31, title: 'Phase 2: a fresh start', source: 'dai', body: [
    'New chapters make people act on goals. In one study, the odds of a gym visit rose about 33% at the start of a week and 47% at the start of a semester.',
    'Phase 2 is your new chapter. Use it.'] },
  { day: 45, title: 'The curve is bending', source: 'lally', body: [
    'In habit-formation data, automaticity climbs fastest early and then levels off.',
    'If today felt easier than Day 1, that\'s the curve at work.'] },
  { day: 61, title: 'Phase 3: the final stretch', source: 'dai', body: [
    'Another landmark, another fresh start. The researchers saw goal-setting jump around new weeks, months, and years.',
    'Thirty days left. Finish strong.'] },
  { day: 66, title: 'Day 66', source: 'lally', body: [
    'In the UCL study, the median time for a habit to reach its peak automaticity was 66 days.',
    'The range was 18 to 254 days, so if it isn\'t automatic yet, you\'re still normal.'] },
  { day: 90, title: 'Quest complete', source: 'lally', body: [
    'You made it to Day 90, past the 66-day median from the UCL study.',
    'Some habits there were still strengthening when the study ended, so keep the chain going.'] },
];

export const TRACKS: Record<GoalId, { name: string; intro: Bite; bites: Bite[] }> = {
  fitness: {
    name: 'Fitness Quest',
    intro: { day: 1, title: 'Why 90 days, and why so small?', source: 'who', body: [
      'Welcome, adventurer. The World Health Organization recommends 150–300 minutes of moderate activity a week (or 75–150 vigorous), plus regular strength work.',
      'The good news: some activity beats none, and more brings more benefit. So we start small and level up.',
      'Your 90 days run in three phases. Habits in a real-world study took a median of 66 days to become automatic, so 90 gives you runway.'] },
    bites: [
      { day: 2, title: 'Plan the when and where', source: 'goll', body: [
        'Decide now: “When it\'s ___ and I\'m at ___, I\'ll walk.” Scientists call that an implementation intention.',
        'A 2006 meta-analysis pooled 94 tests and found if-then plans gave goal pursuit a medium-to-large boost (d = 0.65).'] },
      { day: 3, title: 'Same time, same place', source: 'wood', body: [
        'Habits are triggered by context: a place, a time, or the action right before.',
        'Once a habit forms, the cue calls up the behavior automatically. Walking at the same time each day builds that cue.'] },
      { day: 4, title: 'How many steps actually matter?', source: 'paluch', body: [
        'A 2022 analysis of 15 studies and 47,471 adults found that risk of death kept falling with more daily steps, then leveled off around 8,000–10,000 for adults under 60 and 6,000–8,000 for 60+.',
        'The most active group had about half the risk of the least active.'] },
      { day: 6, title: 'Writing it down works', source: 'burke', body: [
        'A review of 22 studies found a consistent link between self-monitoring (food, exercise, weight) and weight loss.',
        'The authors noted the studies had limits, but the pattern held. A quick log is enough.'] },
      { day: 9, title: 'Sleep is a stat', source: 'watson', body: [
        'Sleep experts recommend adults get 7 or more hours a night, regularly.',
        'Recovery happens here. Lights-out is a quest for a reason.'] },
      { day: 12, title: 'Protein, by the numbers', source: 'morton', body: [
        'A meta-analysis of 49 trials found protein supplements added modest muscle and strength gains on top of resistance training.',
        'Gains leveled off around 1.6 g of protein per kg of body weight per day, with a wide margin of error. Check with a doctor or dietitian before big diet changes.'] },
      { day: 18, title: 'Strength is for everyone', source: 'who', body: [
        'The WHO recommends regular muscle-strengthening activity for every age group, not just athletes.',
        'That\'s why bodyweight circuits show up in your plan.'] },
    ],
  },
  habit: {
    name: 'New Habit Quest',
    intro: { day: 1, title: 'Forget 21 days', source: 'lally', body: [
      'Welcome, adventurer. In a real-world UCL study, people picked one new daily behavior and tracked it for 12 weeks.',
      'The median time to reach peak automaticity was 66 days, with a range of 18 to 254.',
      'That\'s why your quest is 90 days: enough runway for most habits to lock in. We start tiny and grow it.'] },
    bites: [],
  },
};

/** Shown during "Find your why". */
export const WHY_LORE: Bite[] = [
  { day: 0, title: 'Why your why matters', source: 'sheldon', body: [
    'Researchers found that people whose goals connect to their own deeper values put in more sustained effort, and that effort made them more likely to reach the goal.',
    'Motivation fades. A real reason sticks around. Answer honestly; nobody sees this but you.'] },
  { day: 0, title: 'Your reasons beat pressure', source: 'koestner', body: [
    'Across 12 studies, people who pursued goals for their own reasons made more progress than people who felt pushed by guilt or others.',
    'The effect was modest but held up even after accounting for how hard or important the goal was.'] },
  { day: 0, title: 'It works for exercise too', source: 'teixeira', body: [
    'A review of 66 exercise studies found that people who exercised because they valued it, or enjoyed it, generally exercised more.',
    'Exercising out of guilt or pressure showed no link, or a negative one.'] },
];

/** Day-by-day lore for a goal, excluding the Day 1 intro. */
export function bitesFor(goal: GoalId): Bite[] {
  return [...TRACKS[goal].bites, ...SHARED.filter(b => !b.goal || b.goal === goal)].sort((a, b) => a.day - b.day);
}
