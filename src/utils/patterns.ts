import { KillStats, Match, MatchedType } from './parser';

/**
 * To make a new parser feature, add three parts:
 * 1. PatternCase - Name of feature in type PatternCase
 * 2. patterns - Add regex pattern
 * 3. updateMatch - Add the logic to add found values to match object
 */

/**
 * Add to this a new parserfeatures name
 */
export type PatternCase =
  | 'killed'
  | 'accolade'
  | 'matchStart'
  | 'mapScore'
  | 'error';

interface EvaluatePatternType {
  pattern: RegExp;
  case: PatternCase;
  match?: RegExpMatchArray | null;
}

/**
 * Add to this a regex pattern and name of the new feature
 */
export const patterns: EvaluatePatternType[] = [
  {
    // 3 groups: map type, score and map time
    case: 'mapScore',
    pattern: /^.+(de_[a-z]+)\sscore\s(\d{1,2}:\d{1,2})\safter\s(\d{1,3})\smin$/,
  },
  {
    // 4 groups: accolade-type, name, value and score
    case: 'accolade',
    pattern:
      /ACCOLADE,\sFINAL:\s{(pistolkills|burndamage|firstkills|hsp|kills|3k|4k|hsp|cashspent|burndamage)},\s+(.+)<\d+>,\s+VALUE:\s(\d+.\d+),.+SCORE:\s(\d+.\d+)$/,
  },
  {
    case: 'matchStart',
    pattern: /Match_Start/,
  },
  {
    // 3 groups: Killer, killer-side and killed
    case: 'killed',
    pattern:
      /"(.+?)<\d+><STEAM_\d:\d:\d+><(CT|TERRORIST)>" \[\d+ -?\d+ -?\d+\] killed "(.+?)<\d+><STEAM_\d:\d:\d+><(CT|TERRORIST)>" \[(\d+) (-?\d+) (-?\d+)\] with "(.*?)"/,
  },
];

/**
 * Add logic to this switch/case. If there is no logic accompanying the regex above an console log
 * will explain this
 *
 * @param matches found regex match
 * @param accMatch the match object to update
 * @param initMatch empty match object
 * @param timestamp
 * @param textLine
 * @returns updated match object
 */
export const updateMatch = (
  matches: MatchedType | null,
  accMatch: Match,
  initMatch: Match,
  timestamp: string,
  textLine: string,
) => {
  if (matches) {
    switch (matches.case) {
      case 'mapScore':
        if (matches.match) {
          const [, map, score, mapTime] = matches.match;
          accMatch.map = map;
          accMatch.ctScore = Number(score.split(':')[0]);
          accMatch.tScore = Number(score.split(':')[1]);
          accMatch.mapTime = Number(mapTime);
        }
        break;

      case 'accolade':
        if (matches.match) {
          const [, accoladeType, name, value, score] = matches.match;
          accMatch.accolades = [
            ...accMatch.accolades,
            {
              accoladeType,
              name,
              score: Number(score),
              value: Number(value),
            },
          ];
        }
        break;

      case 'matchStart':
        // Last Match_start counts
        if (matches.match) {
          accMatch = { ...initMatch }; // Reset match when Match_Start
          accMatch.matchStart = timestamp;
        }
        break;

      case 'killed':
        if (matches.match) {
          const [, killer, , dead] = matches.match;
          if (killer && dead) {
            accMatch.userStats = calculatePlayerStats(
              accMatch.userStats,
              killer,
              dead,
            );
          }
        }
        break;

      default:
        console.log('No pattern found for this line:', textLine);
        break;
    }
  }
  return accMatch;
};

/**
 * Calculate player stats
 *
 * @param playerKillStats - array of player kills
 * @param killer - player name
 * @returns new array with updated values
 */
const calculatePlayerStats = (
  playerKillStats: KillStats[],
  killer: string,
  dead: string,
) => {
  // If array contains item with player name, it's kill/death score will be increased
  // otherwise a new entry will be added

  const newKillstats: KillStats[] = [...playerKillStats];

  //Updating killer's stats
  const theKiller = newKillstats.find(o => o.name === killer);
  if (theKiller) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    theKiller.kills = ++theKiller.kills!;
  } else {
    newKillstats.push({ name: killer, kills: 1, deads: 0 });
  }

  const newDeathstats: KillStats[] = [...newKillstats];

  //   Updating dead's stats
  const theDead = newDeathstats.find(o => o.name === dead);
  if (theDead) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    theDead.deads = ++theDead.deads!;
  } else {
    newDeathstats.push({ name: dead, kills: 0, deads: 1 });
  }

  return newDeathstats;
};
