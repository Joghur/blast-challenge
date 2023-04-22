import { Stack, Typography } from '@mui/material';
import React from 'react';
import { Match } from '../utils/parser';

interface Props {
  match: Match;
}

type AccoladeType =
  | 'pistolkills'
  | 'burndamage'
  | 'firstkills'
  | 'hsp'
  | 'kills'
  | '3k'
  | '4k'
  | 'hsp'
  | 'cashspent'
  | 'burndamage';

const findAccolade = (
  accoladeType: AccoladeType,
  accolades: Match['accolades'],
) => {
  return accolades.filter(accolade => accolade.accoladeType === accoladeType);
};

const Accolades = ({ match }: Props) => {
  const accolades = match.accolades;

  const pistolkills = findAccolade('pistolkills', accolades)[0];
  const firstkills = findAccolade('firstkills', accolades)[0];
  const burndamage = findAccolade('burndamage', accolades)[0];
  const hsp = findAccolade('hsp', accolades)[0];
  const threeK = findAccolade('3k', accolades)[0];
  const fourK = findAccolade('3k', accolades)[0];
  const cashspent = findAccolade('cashspent', accolades)[0];

  return (
    <>
      <Typography variant="h5">Accolades</Typography>
      <Stack direction="row" spacing={2}>
        <Stack alignItems="flex-end">
          <Typography>Most pistol kills</Typography>
          <Typography>Most first kills</Typography>
          <Typography>Highest burn damage</Typography>
          <Typography>Headshot</Typography>
          <Typography>Most 3ks</Typography>
          <Typography>Most 4ks</Typography>
          <Typography>Highest cash spender</Typography>
        </Stack>
        <Stack alignItems="flex-start">
          <Typography>{pistolkills.name}</Typography>
          <Typography>{firstkills.name}</Typography>
          <Typography>{burndamage.name}</Typography>
          <Typography>{hsp.name}</Typography>
          <Typography>{threeK.name}</Typography>
          <Typography>{fourK.name}</Typography>
          <Typography>{cashspent.name}</Typography>
        </Stack>
        <Stack alignItems="center">
          <Typography>{pistolkills.value.toFixed()}</Typography>
          <Typography>{firstkills.value.toFixed()}</Typography>
          <Typography>{burndamage.value.toFixed()}</Typography>
          <Typography>{hsp.value.toFixed()}%</Typography>
          <Typography>{threeK.value.toFixed()}</Typography>
          <Typography>{fourK.value.toFixed()}</Typography>
          <Typography>{cashspent.value.toFixed()}</Typography>
        </Stack>
      </Stack>
    </>
  );
};

export default Accolades;
