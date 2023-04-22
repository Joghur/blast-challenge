import { PatternCase, patterns } from './patterns';

interface Accolade {
  accoladeType: string;
  name: string;
  score: number;
  value: number;
}

export interface Match {
  map: string;
  matchStart: string;
  matchEnd: string;
  ctScore: number;
  tScore: number;
  ct: string;
  terrorist: string;
  roundsPlayed: number;
  mapTime: number;
  userStats: KillStats[];
  accolades: Accolade[];
}

export interface KillStats {
  name: string;
  kills?: number;
  deads?: number;
}

interface MatchedType {
  case: PatternCase;
  match: RegExpMatchArray | null;
}

/**
 * Go through array of regex patterns to see if provided line matches with one
 *
 * @param line - string
 * @returns - MatchedType | null
 */
const evaluateLines = (line: string): MatchedType | null => {
  const patternMatched = patterns.filter(ep => line.match(ep.pattern));

  if (patternMatched.length === 0) {
    return null;
  }

  if (patternMatched.length > 1) {
    return { case: 'error', match: null };
  }
  const matches = line.match(patternMatched[0].pattern);

  // Will return only one type of MatchedType
  return { case: patternMatched[0].case, match: matches };
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

/**
 * Handles parsing of raw url data
 *
 * @param text string
 * @returns Match - parsed values
 */
export const parseLogs = (text: string): Match => {
  const initMatch: Match = {
    map: '',
    matchStart: '',
    matchEnd: '',
    ctScore: 0,
    tScore: 0,
    ct: '',
    terrorist: '',
    roundsPlayed: 0,
    mapTime: 0,
    userStats: [],
    accolades: [],
  };

  let accMatch: Match = { ...initMatch };
  const logArray = text.split('\n');

  logArray.forEach((textLine: string) => {
    // Using split where text has a colon with a number on left and space on right which is unique for each line
    // Better way would be to use a proper regex but this was faster
    const [dateTimePart, logPart] = textLine.split(/\d:\s/);

    // Remove seconds and separate date from time
    const date = dateTimePart.slice(0, -2).split(' - ')[0];
    const time = dateTimePart.slice(0, -2).split(' - ')[1];
    const [month, day, year] = date.split('/');
    const timestamp = `${day}/${month}-${year} ${time}`; // this could also be handled by moment or datefns

    const logString = logPart?.trim();

    const matches = evaluateLines(logString);

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

    // TODO this should also be moved into the switch case
    if (logString?.includes('Round_End')) {
      // Last Round_End determines end game time
      accMatch.matchEnd = timestamp;
    }
    if (logString?.includes('MatchStatus')) {
      if (logString?.includes('CT')) {
        accMatch.ct = logString.split('"CT": ')[1];
      }
      if (logString?.includes('TERRORIST')) {
        accMatch.terrorist = logString.split('"TERRORIST": ')[1];
      }
      if (logString?.includes('Score')) {
        accMatch.roundsPlayed =
          Number(logString.split('RoundsPlayed: ')[1]) || 0;
      }
    }
  });

  return accMatch;
};
