import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Paper, Stack, Typography } from '@mui/material';
import { Match, parseLogs, KillStats } from '../utils/parser';
import Accolades from './Accolades';
import MatchHeader from './MatchHeader';
import MatchResult from './MatchResult';
import PlayerScores from './PlayerScores';
import { logSource } from '../sources/dataSource';

const MatchStatistics = () => {
  const [match, setMatch] = useState<Match | null>(null);
  const [log, setLog] = useState<string | null>(null);

  useEffect(() => {
    axios
      .get(logSource, {
        headers: {
          Accept: 'application/json',
        },
      })
      .then(response => {
        setLog(response.data);
      })
      .catch(() => {
        console.log('error when fetching');
      });
  }, []);

  useEffect(() => {
    if (log) {
      setMatch(parseLogs(log));
    }
  }, [log]);

  if (!log || !match) {
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
            <PlayerScores killStats={sortedKillStats} match={match} />
            <Accolades match={match} />
          </Stack>
        </Paper>
      </Stack>
    </>
  );
};

export default MatchStatistics;
