import { updateMatch, PatternCase, patterns } from './patterns';

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

export interface MatchedType {
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

    //   This will do the heavy lifting
    accMatch = updateMatch(matches, accMatch, initMatch, timestamp, textLine);

    // TODO this should also be moved into the switch case in above function call
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
