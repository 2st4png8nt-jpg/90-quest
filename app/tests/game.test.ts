// Run with: npm test
import { bitesFor, SOURCES, TRACKS, WHY_LORE } from '../src/content';
import {
  achievementsFor, advanceDay, checkinDue, completeCheckin, coreWhy, cueLine, daysDone, demoGame, markLoreRead, minimumShare,
  newGame, questsFor, rateToday, toggleMinimum, toggleQuest,
} from '../src/game';

let fails = 0;
const ok = (c: boolean, m: string) => { if (!c) { fails++; console.log('FAIL', m); } else console.log('ok', m); };
const why = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
const habit = () => newGame({ goal: 'habit', hero: 'T', character: 'female', why, anchor: 'brush my teeth', habit: 'floss all', tiny: 'floss one', difficulty: 'standard' });

let s = habit();
ok(s.achievements.why === 1 && coreWhy(s) === 'g', 'why achievement + core why');
ok(cueLine(s) === 'After I brush my teeth, I will floss one', 'cue line uses tiny version early');
ok(questsFor(s, 1)[0].text === 'Floss one' && questsFor(s, 31)[0].text === 'Floss all', 'standard: tiny until day 30');
ok(questsFor({ ...s, difficulty: 'easy' }, 45)[0].text === 'Floss one' && questsFor({ ...s, difficulty: 'hard' }, 1)[0].text === 'Floss all', 'difficulty changes tiny window');
const fit = newGame({ goal: 'fitness', hero: 'F', character: 'male', why, anchor: 'get home', difficulty: 'easy' });
ok(questsFor(fit, 1)[0].text === 'Walk 5 minutes' && questsFor({ ...fit, difficulty: 'hard' }, 1)[0].text === 'Walk 15 minutes', 'fitness difficulty sets walk length');

let r = toggleQuest(s, 'do'); r = rateToday(r.state, 5);
ok(!!r.state.achievements.auto && daysDone(r.state) === 1, 'full day counts; On Autopilot unlocks');
r = advanceDay(r.state); ok(r.state.streak === 1 && r.state.history[1].completed && !r.state.history[1].minimum, 'history records full day');
r = toggleMinimum(r.state); ok(daysDone(r.state) === 2 && !!r.message?.includes('Kept going'), 'minimum day counts as done');
r = advanceDay(r.state); ok(r.state.streak === 2 && r.state.history[2].minimum, 'minimum day keeps streak, logged as minimum');
r = toggleMinimum(r.state); r = advanceDay(r.state); r = toggleMinimum(r.state); r = advanceDay(r.state);
ok(r.state.streak === 4, 'no weekly cap on minimum days');
r = advanceDay(r.state); ok(r.state.streak === 4 && r.state.history[5].shielded === true && !r.state.welcomeBack, 'one miss: shield, no welcome-back');
r = advanceDay(r.state); ok(r.state.streak === 0 && r.state.welcomeBack && !r.message?.match(/lost|reset|broke/i), 'second miss: warm restart, no loss words');
const before = daysDone(r.state);
r = toggleQuest(r.state, 'do'); ok(!r.state.welcomeBack && daysDone(r.state) >= before, 'checking off clears welcome-back; days done never drops');
ok(Math.abs(minimumShare(r.state) - 3 / 4) < 1e-9, 'minimum share = 3 of 4 completed days');

let t = r.state; while (t.day < 31) t = advanceDay(t).state;
ok(checkinDue(t) === 31 && checkinDue(completeCheckin(t, 31)) === null, 'day 31 check-in due once');
for (let i = 0; i < 120; i++) t = advanceDay(t).state;
ok(t.day === 90 && !!t.finished && !!t.achievements.done && !!t.achievements.day66, 'finishes at 90');
ok(markLoreRead(s, 5).state.seenLore.length === 1 && markLoreRead(markLoreRead(s, 5).state, 5).state.seenLore.length === 1, 'lore read once');

const d = demoGame();
ok(d.day === 12 && d.history[6].shielded === true && d.history[9].minimum && d.streak === 10 && daysDone(d) === 10, `demo state (streak ${d.streak}, done ${daysDone(d)})`);
ok(achievementsFor('fitness').every(a => a.goal !== 'habit'), 'habit-only achievements hidden for fitness');
for (const g of ['fitness', 'habit'] as const) for (const b of [TRACKS[g].intro, ...bitesFor(g)]) if (!SOURCES[b.source]) ok(false, `${g} day ${b.day} missing source`);
for (const b of WHY_LORE) if (!SOURCES[b.source]) ok(false, 'why lore missing source');
ok(!JSON.stringify([TRACKS, bitesFor('fitness'), bitesFor('habit')]).match(/\bXP\b|head start/i), 'no XP language in lessons');
console.log(fails ? `${fails} FAILED` : 'ALL PASSED');
process.exitCode = fails ? 1 : 0;
