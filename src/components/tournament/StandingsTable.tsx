import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import type { GroupStandings } from '../../types/tournament';

interface Props {
  group: GroupStandings;
  advancePerGroup: number;
}

export function StandingsTable({ group, advancePerGroup }: Props) {
  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
        {group.groupName}
      </Typography>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Team</TableCell>
            <TableCell align="right">W</TableCell>
            <TableCell align="right">L</TableCell>
            <TableCell align="right">+/-</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {group.standings.map((row, idx) => (
            <TableRow key={row.teamId}>
              <TableCell
                sx={{ fontWeight: idx < advancePerGroup ? 700 : 400 }}
              >
                {idx < advancePerGroup ? '✓ ' : ''}
                {row.teamName}
              </TableCell>
              <TableCell align="right">{row.wins}</TableCell>
              <TableCell align="right">{row.losses}</TableCell>
              <TableCell align="right">{row.pointDiff}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
}
