import { Stack, Typography } from '@mui/material';
import React from 'react';
import { Match } from '../utils/parser';

interface Props {
  match: Match;
}

const MatchHeader = ({ match }: Props) => {
  const {
    map,
    ct,
    terrorist,
    ctScore,
    tScore,
    roundsPlayed,
    mapTime,
    matchStart,
    matchEnd,
  } = match;

  const [date, startTime] = matchStart.split(' ');
  const endTime = matchEnd.split(' ')[1];
  return (
    <Stack direction="row" spacing={2}>
      <Stack alignItems="flex-end">
        <Typography>Map</Typography>
        <Typography>Date</Typography>
        <Typography>Start</Typography>
        <Typography>End</Typography>
        <Typography>Time</Typography>
        <Typography>Rounds Played</Typography>
        <Typography>Winner</Typography>
      </Stack>
      <Stack alignItems="flex-start">
        <Typography>{map}</Typography>
        <Typography>{date}</Typography>
        <Typography>{startTime}</Typography>
        <Typography>{endTime}</Typography>
        <Typography>{mapTime} min</Typography>
        <Typography>{roundsPlayed}</Typography>
        <Typography>{ctScore > tScore ? ct : terrorist}</Typography>
      </Stack>
    </Stack>
  );
};

export default MatchHeader;
