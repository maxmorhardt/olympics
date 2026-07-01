import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { Box, Paper, Typography } from '@mui/material';
import { fadeInUp, stakesPulse } from '../landing/animations';
import { gradients } from '../../theme';
import type { Match } from '../../types/tournament';

interface Props {
  matches: Match[];
  canManage: boolean;
  onSelect: (m: Match) => void;
}

const COL_W = 230;
const CONNECTOR_W = 64;
const TITLE_H = 40;
const GOLD_LINE = 'rgba(245,166,35,0.45)';

interface Round {
  round: number;
  matches: Match[];
}

function toRounds(matches: Match[]): Round[] {
  const byRound = new Map<number, Match[]>();
  for (const m of matches) {
    const list = byRound.get(m.round) ?? [];
    list.push(m);
    byRound.set(m.round, list);
  }
  return [...byRound.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([round, ms]) => ({ round, matches: ms.sort((a, b) => a.matchNumber - b.matchNumber) }));
}

function roundLabel(round: number, totalRounds: number): string {
  const fromEnd = totalRounds - round;
  if (fromEnd === 0) return 'Final';
  if (fromEnd === 1) return 'Semifinals';
  if (fromEnd === 2) return 'Quarterfinals';
  return `Round ${round}`;
}

export function Bracket({ matches, canManage, onSelect }: Props) {
  const rounds = toRounds(matches);
  if (rounds.length === 0) {
    return null;
  }

  return (
    <Box
      sx={{
        maxWidth: '100%',
        overflowX: 'auto',
        overflowY: 'hidden',
        pb: 2,
        // hide the scrollbar chrome; bracket still pans via trackpad/drag
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': { display: 'none' },
      }}
    >
      <Box sx={{ display: 'flex', minHeight: 380, width: 'max-content' }}>
        {rounds.map((round, ri) => {
          const isFinalRound = ri === rounds.length - 1;
          return (
            <Box key={round.round} sx={{ display: 'flex' }}>
              <Box sx={{ width: COL_W, display: 'flex', flexDirection: 'column' }}>
                <Box
                  sx={{
                    height: TITLE_H,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 0.5,
                  }}
                >
                  {isFinalRound && (
                    <EmojiEventsIcon fontSize="small" sx={{ color: 'primary.main' }} />
                  )}
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 800,
                      letterSpacing: '.12em',
                      color: isFinalRound ? 'primary.main' : 'text.secondary',
                    }}
                  >
                    {roundLabel(round.round, rounds.length).toUpperCase()}
                  </Typography>
                </Box>
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  {round.matches.map((m, mi) => (
                    <Box
                      key={m.id}
                      sx={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        px: 0.75,
                        py: 1,
                        animation: `${fadeInUp} 0.5s ease both`,
                        animationDelay: `${ri * 0.12 + mi * 0.06}s`,
                      }}
                    >
                      <BracketMatch
                        match={m}
                        canManage={canManage}
                        onSelect={onSelect}
                        isFinal={isFinalRound}
                      />
                    </Box>
                  ))}
                </Box>
              </Box>

              {ri < rounds.length - 1 && (
                <Box sx={{ width: CONNECTOR_W, display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ height: TITLE_H }} />
                  <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {Array.from({ length: Math.ceil(round.matches.length / 2) }).map((_, k) => (
                      <Box
                        key={k}
                        sx={{
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Box
                          sx={{
                            position: 'relative',
                            width: '100%',
                            height: '50%',
                            borderLeft: `2px solid ${GOLD_LINE}`,
                            '&::after': {
                              content: '""',
                              position: 'absolute',
                              top: '50%',
                              left: 0,
                              right: 0,
                              borderTop: `2px solid ${GOLD_LINE}`,
                            },
                          }}
                        />
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

function BracketMatch({
  match,
  canManage,
  onSelect,
  isFinal,
}: {
  match: Match;
  canManage: boolean;
  onSelect: (m: Match) => void;
  isFinal: boolean;
}) {
  const completed = match.status === 'completed';
  const ready = Boolean(match.teamAId && match.teamBId);
  const clickable = canManage && !completed && ready;
  // an empty slot in a completed match is a bye; otherwise it is still to be decided
  const placeholder = completed ? 'Bye' : 'TBD';

  return (
    <Paper
      onClick={() => clickable && onSelect(match)}
      sx={{
        overflow: 'hidden',
        background: gradients.card,
        border: '1px solid',
        borderColor: isFinal ? 'primary.main' : 'rgba(255,255,255,0.08)',
        cursor: clickable ? 'pointer' : 'default',
        transition: 'transform 0.15s, border-color 0.2s',
        animation: isFinal ? `${stakesPulse} 2.4s ease-in-out infinite` : undefined,
        '&:hover': clickable ? { transform: 'translateY(-2px)', borderColor: 'primary.main' } : undefined,
      }}
    >
      {match.gameType && (
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            px: 1.25,
            pt: 0.5,
            fontWeight: 700,
            letterSpacing: '.06em',
            color: 'primary.main',
          }}
        >
          {match.gameType}
        </Typography>
      )}
      <BracketTeam
        name={match.teamA?.name}
        placeholder={placeholder}
        score={completed ? match.teamAScore : undefined}
        winner={completed && match.winnerTeamId === match.teamAId}
        crown={isFinal}
      />
      <Box sx={{ borderTop: '1px solid rgba(255,255,255,0.08)' }} />
      <BracketTeam
        name={match.teamB?.name}
        placeholder={placeholder}
        score={completed ? match.teamBScore : undefined}
        winner={completed && match.winnerTeamId === match.teamBId}
        crown={isFinal}
      />
    </Paper>
  );
}

function BracketTeam({
  name,
  placeholder,
  score,
  winner,
  crown,
}: {
  name?: string;
  placeholder: string;
  score?: number;
  winner: boolean;
  crown: boolean;
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        px: 1.25,
        py: 1,
        gap: 1,
        borderLeft: '4px solid',
        borderColor: winner ? 'primary.main' : 'transparent',
        background: winner ? 'rgba(245,166,35,0.12)' : 'transparent',
      }}
    >
      {winner && crown && <EmojiEventsIcon sx={{ fontSize: 16, color: 'primary.main' }} />}
      <Typography
        variant="body2"
        noWrap
        sx={{
          flexGrow: 1,
          fontWeight: winner ? 800 : 500,
          color: name ? 'text.primary' : 'text.disabled',
        }}
      >
        {name ?? placeholder}
      </Typography>
      {score !== undefined && (
        <Typography variant="body2" sx={{ fontWeight: winner ? 800 : 500, minWidth: 18, textAlign: 'right' }}>
          {score}
        </Typography>
      )}
    </Box>
  );
}
