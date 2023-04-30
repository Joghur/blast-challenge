/* eslint-disable @typescript-eslint/no-non-null-assertion */
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
  | 'attacked'
  | 'matchStart'
  | 'mapScore'
  | 'accolade'
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
    // 3 groups: Killer, killer-side and killed
    case: 'killed',
    pattern:
      /"(.+?)<\d+><STEAM_\d:\d:\d+><(CT|TERRORIST)>" \[\d+ -?\d+ -?\d+\] killed "(.+?)<\d+><STEAM_\d:\d:\d+><(CT|TERRORIST)>" \[(\d+) (-?\d+) (-?\d+)\] with "(.*?)"/,
  },
  {
    // 3 groups: Attacker, attacked and damage given
    case: 'attacked',
    pattern:
      /"(.+?)<\d+><STEAM_\d:\d:\d+><.+>" \[\d+ -?\d+ -?\d+\] attacked "(.+?)<\d+><STEAM_\d:\d:\d+><.+>" \[\d+ -?\d+ -?\d+\].+\(damage\s"(\d+)"/,
  },
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
];

/**
 * Add logic to this switch/case.
 * If there is no logic accompanying the regex a console.log will explain this
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
              'killed',
              killer,
              dead,
            );
          }
        }
        break;

      case 'attacked':
        if (matches.match) {
          const [, attacker, attacked, damage] = matches.match;

          if (attacker && attacked) {
            accMatch.userStats = calculatePlayerStats(
              accMatch.userStats,
              'attacked',
              attacker,
              attacked,
              Number(damage),
            );
          }
        }
        break;

      default:
        console.log('No logic found for this line:', textLine);
        break;
    }
  }
  return accMatch;
};

/**
 * Calculate player stats
 *
 * @param playerKillStats - array of player kills
 * @param attacker - player name
 * @returns new array with updated values
 */
const calculatePlayerStats = (
  playerKillStats: KillStats[],
  type: 'attacked' | 'killed' = 'killed',
  attacker: string,
  attacked: string,
  damage = 0,
) => {
  // If array contains item with player name, it's kill/death/damage score will be increased
  // otherwise a new entry will be added

  const newAttackStats: KillStats[] = [...playerKillStats];

  //Updating attacker's stats
  const theAttacker = newAttackStats.find(o => o.name === attacker);
  if (theAttacker) {
    if (type === 'killed') {
      theAttacker.kills = ++theAttacker.kills!;
    } else {
      theAttacker.damageGiven = theAttacker.damageGiven! + damage;
    }
  } else {
    newAttackStats.push({
      name: attacker,
      kills: 1,
      deaths: 0,
      damageGiven: 0,
    });
  }

  const newAttackedstats: KillStats[] = [...newAttackStats];

  //   Updating attecked's stats
  const theAttacked = newAttackedstats.find(o => o.name === attacked);
  if (theAttacked) {
    if (type === 'killed') {
      theAttacked.deaths = ++theAttacked.deaths!;
    }
  } else {
    newAttackedstats.push({
      name: attacked,
      kills: 0,
      deaths: 1,
      damageGiven: 0,
    });
  }

  return newAttackedstats;
};
