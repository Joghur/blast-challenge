import {
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';
import { log } from '../sources/match_log';
import { Match, parseLogs, KillStats } from '../utils/parser';

const MatchStatistics: React.FC = () => {
  const [match] = useState<Match>(parseLogs(log) || []);

  if (!match) {
    return null;
  }

  const {
    map,
    matchStart,
    matchEnd,
    ct,
    terrorist,
    ctScore,
    tScore,
    roundsPlayed,
    userStats,
  } = match;
  console.log('parsedLog', match);

  const [date, startTime] = matchStart.split(' ');
  const endTime = matchEnd.split(' ')[1];

  const sortedKillStats = userStats.sort(
    (a: KillStats, b: KillStats) => b.kills - a.kills,
  );

  return (
    <>
      <Stack alignItems="center">
        <Typography variant="h3">CSGO</Typography>
        <Paper elevation={2} sx={{ p: 2, m: 5 }}>
          <Stack alignItems="center" spacing={2}>
            <Stack direction="row" spacing={2}>
              <Stack alignItems="flex-end">
                <Typography>Map</Typography>
                <Typography>Date</Typography>
                <Typography>Start</Typography>
                <Typography>End</Typography>
                <Typography>Rounds Played</Typography>
                <Typography>Winner</Typography>
              </Stack>
              <Stack alignItems="flex-start">
                <Typography>{map}</Typography>
                <Typography>{date}</Typography>
                <Typography>{startTime}</Typography>
                <Typography>{endTime}</Typography>
                <Typography>{roundsPlayed}</Typography>
                <Typography>{ctScore > tScore ? ct : terrorist}</Typography>
              </Stack>
            </Stack>
            <Paper sx={{ p: 1 }}>
              <Stack direction="row" spacing={2}>
                <Stack alignItems="center">
                  <Typography color="blue">CT</Typography>
                  <Typography>{ct}</Typography>
                  <Typography>{ctScore}</Typography>
                </Stack>
                <Stack alignItems="center">
                  <Typography color="red">Terrorist</Typography>
                  <Typography>{terrorist}</Typography>
                  <Typography>{tScore && tScore}</Typography>
                </Stack>
              </Stack>
            </Paper>
            <Typography variant="h5">Player scores</Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell align="right">Kills</TableCell>
                    <TableCell align="right">Deaths</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedKillStats.map((stat: KillStats, index: number) => (
                    <TableRow
                      key={index}
                      sx={{
                        '&:last-child td, &:last-child th': { border: 0 },
                      }}>
                      <TableCell>{stat.name}</TableCell>
                      <TableCell align="right">{stat.kills}</TableCell>
                      <TableCell align="right">{stat.dead}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Stack>
        </Paper>
      </Stack>
    </>
  );
};

export default MatchStatistics;
