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
import { KillStats } from '../utils/parser';

interface Props {
  killStats: KillStats[];
}

const PlayerScores = ({ killStats }: Props) => {
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
            </TableRow>
          </TableHead>
          <TableBody>
            {killStats.map((stat: KillStats, index: number) => {
              let scoreDiff;
              if (stat.kills && stat.deads) {
                scoreDiff = stat.kills - stat.deads;
              }
              return (
                <TableRow
                  key={index}
                  sx={{
                    '&:last-child td, &:last-child th': { border: 0 },
                  }}>
                  <TableCell>{stat.name}</TableCell>
                  <TableCell align="right">{stat.kills}</TableCell>
                  <TableCell align="right">{stat.deads}</TableCell>
                  {scoreDiff && (
                    <TableCell align="right">
                      <Typography color={scoreDiff < 0 ? 'red' : 'blue'}>
                        {scoreDiff}
                      </Typography>
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
