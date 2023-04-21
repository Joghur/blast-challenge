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
}

export interface KillStats {
  name: string;
  kills: number;
  dead: number;
}

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
  // Ir array contains player name the kill/death score will be increased
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
 * @param text
 * @returns parsed values in form of Match type
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
  };

  let accMatch: Match = { ...initMatch };
  const logArray = text.split('\n');

  logArray.forEach((textLine: string) => {
    // split where colon has a number on left and space on right which is unique for each line
    // Better way would be to use a proper regex but this was faster
    const [dateTimePart, logPart] = textLine.split(/\d:\s/);

    // remove seconds and separate date from time
    const date = dateTimePart.slice(0, -2).split(' - ')[0];
    const time = dateTimePart.slice(0, -2).split(' - ')[1];
    const [month, day, year] = date.split('/');
    const timestamp = `${day}/${month}-${year} ${time}`; // this could also be handled by moment or datefns

    const logString = logPart?.trim();

    // last Match_start counts
    if (logString?.includes('Match_Start')) {
      accMatch = { ...initMatch }; // Reset match when Match_Start
      accMatch.matchStart = timestamp;
    }
    if (logString?.includes('Round_End')) {
      accMatch.matchEnd = timestamp;
    }
    if (logString?.includes('Game Over')) {
      // log example - 11/28/2021 - 21:30:17: Game Over: competitive 1092904694 de_nuke score 6:16 after 50 min
      const pattern = // finding three groups: de_nuke, 6:16 score and the map time in minutes
        /^.+(de_[a-z]+)\sscore(\s\d{1,2}:\d{1,2})\safter\s(\d{1,3})/;

      const matches = logString.match(pattern);
      if (matches) {
        const [, map, score, mapTime] = matches;
        accMatch.map = map;
        accMatch.ctScore = Number(score.split(':')[0]);
        accMatch.tScore = Number(score.split(':')[1]);
        accMatch.mapTime = Number(mapTime);
      }
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
      // log example - 11/28/2021 - 21:30:04: "ZywOo<26><STEAM_1:1:76700232><TERRORIST>" [966 -585 -640] killed "b1t<35><STEAM_1:0:143170874><CT>" [798 -1313 -576] with "ak47"
      const killer = logString.split('<')[0].slice(1); // Quick and dirty way to get name from above text
      const dead = logString.split('killed "')[1].split('<')[0];
      if (killer) {
        accMatch.userStats = calculatePlayerStats(
          accMatch.userStats || [],
          killer,
          dead,
        );
      }
    }
  });

  return accMatch;
};
