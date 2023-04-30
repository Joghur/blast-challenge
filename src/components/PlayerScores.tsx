import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import React from 'react';
import { KillStats, Match } from '../utils/parser';

interface Props {
  match: Match;
  killStats: KillStats[];
}

const PlayerScores = ({ killStats, match }: Props) => {
  return (
    <>
      <Typography variant="h5">Player scores</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell align="right">Kills</TableCell>
              <TableCell align="right">Deaths</TableCell>
              <TableCell align="right">+/-</TableCell>
              <TableCell align="right">ADR</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {killStats.map((stat: KillStats, index: number) => {
              let scoreDiff;
              if (stat.kills && stat.deaths) {
                scoreDiff = stat.kills - stat.deaths;
              }
              return (
                <TableRow
                  key={index}
                  sx={{
                    '&:last-child td, &:last-child th': { border: 0 },
                  }}>
                  <TableCell>{stat.name}</TableCell>
                  <TableCell align="right">{stat.kills}</TableCell>
                  <TableCell align="right">{stat.deaths}</TableCell>
                  {scoreDiff && (
                    <TableCell align="right">
                      <Typography color={scoreDiff < 0 ? 'red' : 'blue'}>
                        {scoreDiff}
                      </Typography>
                    </TableCell>
                  )}
                  {stat.damageGiven && (
                    <TableCell align="right">
                      {(stat.damageGiven / match.roundsPlayed).toFixed(1)}
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default PlayerScores;
