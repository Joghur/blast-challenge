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
  kills: number;
  dead: number;
}

type PatternCase = 'killed' | 'accolade' | 'error';

interface EvaluatePatternType {
  pattern: RegExp;
  case: PatternCase;
  match?: RegExpMatchArray | null;
}
interface MatchedType {
  case: PatternCase;
  match: RegExpMatchArray | null;
}

// (\d{2}\/\d{2}\/\d{4})\s-\s(\d{2}:\d{2}:\d{2}):\sGame\sOver:\s([a-z]+)

// eslint-disable-next-line prettier/prettier
const dateAndTime = '(d{2}/d{2}/d{4})s-s(d{2}:d{2}:d{2})';

const patterns: EvaluatePatternType[] = [
  {
    // three groups: map type, score and map time
    case: 'killed',
    pattern: /^.+(de_[a-z]+)\sscore\s(\d{1,2}:\d{1,2})\safter\s(\d{1,3})\smin$/,
  },
  {
    // 4 groups, accolade-type, name, value and score
    case: 'accolade',
    pattern:
      /ACCOLADE,\sFINAL:\s{(pistolkills|burndamage|firstkills|hsp|kills|3k|4k|hsp|cashspent|burndamage)},\s+(.+)<\d+>,\s+VALUE:\s(\d+.\d+),.+SCORE:\s(\d+.\d+)$/,
  },
];

const evaluateLines = (line: string): MatchedType | null => {
  const patternMatched = patterns.filter(ep => line.match(ep.pattern));
  //   console.log('patternMatched.length', patternMatched.length);

  if (patternMatched.length === 0) {
    return null;
  }

  if (patternMatched.length > 1) {
    return { case: 'error', match: null };
  }
  const matches = line.match(patternMatched[0].pattern);

  //   console.log('patternMatched', patternMatched);
  //   console.log(matches);
  // Will return only one type of MatchedType
  return { case: patternMatched[0].case, match: matches };
};

/**
 * Calculate player stats
 *
 * @param userKillStats - array of player kills
 * @param killer - player name
 * @returns new array with updated values
 */
const calculatePlayerStats = (
  userKillStats: KillStats[],
  killer: string,
  dead: string,
) => {
  // If array contains item with player name, it's kill/death score will be increased
  // otherwise a new entry will be added
  if (userKillStats.some(obj => obj.name === killer || obj.name === dead)) {
    return userKillStats.map(obj => {
      if (obj.name === killer) {
        return { ...obj, kills: ++obj.kills };
      }
      if (obj.name === dead) {
        return { ...obj, dead: ++obj.dead };
      }
      return obj;
    });
  } else {
    return [
      ...userKillStats,
      { name: killer, kills: killer ? 1 : 0, dead: dead ? 1 : 0 },
    ];
  }
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
        case 'killed':
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

        default:
          console.log('No pattern found for this line:', textLine);
          break;
      }
    }

    // Last Match_start counts
    if (logString?.includes('Match_Start')) {
      accMatch = { ...initMatch }; // Reset match when Match_Start
      accMatch.matchStart = timestamp;
    }
    if (logString?.includes('Round_End')) {
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
    if (logString?.includes('killed') && !logString?.includes('killed other')) {
      // Log example - 11/28/2021 - 21:30:04: "ZywOo<26><STEAM_1:1:76700232><TERRORIST>" [966 -585 -640] killed "b1t<35><STEAM_1:0:143170874><CT>" [798 -1313 -576] with "ak47"
      const killer = logString.split('<')[0].slice(1); // Quick and dirty way to get name from above text
      const dead = logString.split('killed "')[1].split('<')[0];
      if (killer) {
        accMatch.userStats = calculatePlayerStats(
          accMatch.userStats,
          killer,
          dead,
        );
      }
    }
  });

  return accMatch;
};
