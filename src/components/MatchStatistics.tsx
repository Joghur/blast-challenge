import { Paper, Stack, Typography } from '@mui/material';
import React, { useState } from 'react';
import { log } from '../sources/match_log';
import { Match, parseLogs, KillStats } from '../utils/parser';
import Accolades from './Accolades';
import MatchHeader from './MatchHeader';
import MatchResult from './MatchResult';
import PlayerScores from './PlayerScores';

const MatchStatistics = () => {
  const [match] = useState<Match>(parseLogs(log) || []);

  if (!match) {
    return null;
  }

  const { userStats } = match;

  const sortedKillStats = userStats.sort((a: KillStats, b: KillStats) => {
    if (b?.kills && a?.kills) {
      return b.kills - a.kills;
    }
    return 0;
  });

  return (
    <>
      <Stack alignItems="center">
        <Typography variant="h3">CSGO</Typography>
        <Paper elevation={2} sx={{ p: 2, m: 5 }}>
          <Stack alignItems="center" spacing={2}>
            <MatchHeader match={match} />
            <MatchResult match={match} />
            <PlayerScores killStats={sortedKillStats} />
            <Accolades match={match} />
          </Stack>
        </Paper>
      </Stack>
    </>
  );
};

export default MatchStatistics;
