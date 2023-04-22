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

export const patterns: EvaluatePatternType[] = [
  {
    // three groups: map type, score and map time
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

// (\d{2}\/\d{2}\/\d{4})\s-\s(\d{2}:\d{2}:\d{2}):\sGame\sOver:\s([a-z]+)

// eslint-disable-next-line prettier/prettier
// const dateAndTime = '(d{2}/d{2}/d{4})s-s(d{2}:d{2}:d{2})';
