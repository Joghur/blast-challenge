import { Paper, Stack, Typography } from '@mui/material';
import React from 'react';
import { Match } from '../utils/parser';

interface Props {
  match: Match;
}

const MatchResult = ({ match }: Props) => {
  const { ct, terrorist, ctScore, tScore } = match;

  return (
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
  );
};

export default MatchResult;
