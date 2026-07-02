import type { GroupStandings, Match, Team } from '../types/tournament';

export interface PodiumEntry {
  place: 1 | 2 | 3;
  teamId: string;
  teamName: string;
  members: string[];
}

export interface StatItem {
  icon: string;
  label: string;
  teamName: string;
  detail: string;
}

export interface Results {
  podium: PodiumEntry[];
  stats: StatItem[];
}

interface TeamRecord {
  wins: number;
  pointDiff: number;
  pointsFor: number;
}

interface GameTitle {
  game: string;
  icon: string;
  label: string;
}

const GAME_TITLES: GameTitle[] = [
  { game: 'Darts', icon: '🎯', label: 'Darts Deadeye' },
  { game: 'Bocce', icon: '🔴', label: 'Bocce Boss' },
  { game: 'Cornhole', icon: '🌽', label: 'Cornhole King' },
];

function teamName(teams: Map<string, Team>, id: string | undefined): string {
  return (id && teams.get(id)?.name) || 'TBD';
}

function members(teams: Map<string, Team>, id: string): string[] {
  return (teams.get(id)?.members ?? []).map((m) => m.name);
}

function recordOf(standings: GroupStandings[], teamId: string): TeamRecord {
  for (const group of standings) {
    for (const row of group.standings) {
      if (row.teamId === teamId) {
        return { wins: row.wins, pointDiff: row.pointDiff, pointsFor: row.pointsFor };
      }
    }
  }
  return { wins: 0, pointDiff: 0, pointsFor: 0 };
}

function betterRecord(a: TeamRecord, b: TeamRecord): boolean {
  if (a.wins !== b.wins) return a.wins > b.wins;
  if (a.pointDiff !== b.pointDiff) return a.pointDiff > b.pointDiff;
  return a.pointsFor > b.pointsFor;
}

function loserOf(m: Match): string | undefined {
  if (!m.winnerTeamId || !m.teamAId || !m.teamBId) return undefined;
  return m.winnerTeamId === m.teamAId ? m.teamBId : m.teamAId;
}

function buildPodium(
  bracket: Match[],
  standings: GroupStandings[],
  teams: Map<string, Team>
): PodiumEntry[] {
  const final = bracket.find((m) => !m.nextMatchId);
  if (!final || final.status !== 'completed' || !final.winnerTeamId) {
    return [];
  }

  const podium: PodiumEntry[] = [];
  const firstId = final.winnerTeamId;
  const secondId = firstId === final.teamAId ? final.teamBId : final.teamAId;

  podium.push({ place: 1, teamId: firstId, teamName: teamName(teams, firstId), members: members(teams, firstId) });
  if (secondId) {
    podium.push({ place: 2, teamId: secondId, teamName: teamName(teams, secondId), members: members(teams, secondId) });
  }

  // third place is the better of the two teams that lost in the semifinals
  const semiLosers = bracket
    .filter((m) => m.nextMatchId === final.id && m.status === 'completed')
    .map(loserOf)
    .filter((id): id is string => Boolean(id));

  let thirdId: string | undefined;
  for (const id of semiLosers) {
    if (!thirdId || betterRecord(recordOf(standings, id), recordOf(standings, thirdId))) {
      thirdId = id;
    }
  }
  if (thirdId) {
    podium.push({ place: 3, teamId: thirdId, teamName: teamName(teams, thirdId), members: members(teams, thirdId) });
  }

  return podium;
}

function buildStats(matches: Match[], teams: Map<string, Team>): StatItem[] {
  const played = matches.filter(
    (m) => m.status === 'completed' && m.teamAId && m.teamBId && m.winnerTeamId
  );
  if (played.length === 0) {
    return [];
  }

  const gameWins = new Map<string, Map<string, { wins: number; points: number }>>();
  const pointDiff = new Map<string, number>();

  const bump = (game: string, teamId: string, wins: number, points: number, diff: number) => {
    const perTeam = gameWins.get(game) ?? new Map<string, { wins: number; points: number }>();
    const cur = perTeam.get(teamId) ?? { wins: 0, points: 0 };
    cur.wins += wins;
    cur.points += points;
    perTeam.set(teamId, cur);
    gameWins.set(game, perTeam);
    pointDiff.set(teamId, (pointDiff.get(teamId) ?? 0) + diff);
  };

  let blowout: { m: Match; margin: number } | null = null;
  let shootout: { m: Match; total: number } | null = null;

  for (const m of played) {
    const aWon = m.winnerTeamId === m.teamAId;
    bump(m.gameType, m.teamAId!, aWon ? 1 : 0, m.teamAScore, m.teamAScore - m.teamBScore);
    bump(m.gameType, m.teamBId!, aWon ? 0 : 1, m.teamBScore, m.teamBScore - m.teamAScore);

    const margin = Math.abs(m.teamAScore - m.teamBScore);
    if (!blowout || margin > blowout.margin) blowout = { m, margin };

    const total = m.teamAScore + m.teamBScore;
    if (!shootout || total > shootout.total) shootout = { m, total };
  }

  const stats: StatItem[] = [];

  for (const { game, icon, label } of GAME_TITLES) {
    const perTeam = gameWins.get(game);
    if (!perTeam) continue;
    let bestId: string | null = null;
    let best = { wins: -1, points: -1 };
    for (const [teamId, rec] of perTeam) {
      if (rec.wins > best.wins || (rec.wins === best.wins && rec.points > best.points)) {
        best = rec;
        bestId = teamId;
      }
    }
    if (bestId && best.wins > 0) {
      stats.push({
        icon,
        label,
        teamName: teamName(teams, bestId),
        detail: `${best.wins} ${best.wins === 1 ? 'win' : 'wins'}`,
      });
    }
  }

  if (blowout) {
    const b = blowout;
    const winnerId = b.m.winnerTeamId === b.m.teamAId ? b.m.teamAId : b.m.teamBId;
    stats.push({
      icon: '💥',
      label: 'Biggest Blowout',
      teamName: teamName(teams, winnerId),
      detail: `won by ${b.margin} in ${b.m.gameType}`,
    });
  }

  if (shootout) {
    const s = shootout;
    stats.push({
      icon: '🔥',
      label: 'Highest Scoring Game',
      teamName: `${teamName(teams, s.m.teamAId)} vs ${teamName(teams, s.m.teamBId)}`,
      detail: `${s.m.teamAScore} to ${s.m.teamBScore} in ${s.m.gameType}`,
    });
  }

  let diffId: string | null = null;
  let bestDiff = -Infinity;
  for (const [teamId, diff] of pointDiff) {
    if (diff > bestDiff) {
      bestDiff = diff;
      diffId = teamId;
    }
  }
  if (diffId && bestDiff > 0) {
    stats.push({
      icon: '📈',
      label: 'Biggest Point Differential',
      teamName: teamName(teams, diffId),
      detail: `+${bestDiff} across all games`,
    });
  }

  return stats;
}

export function computeResults(
  bracket: Match[],
  matches: Match[],
  standings: GroupStandings[],
  teamList: Team[]
): Results {
  const teams = new Map<string, Team>(teamList.map((t) => [t.id, t] as const));
  return {
    podium: buildPodium(bracket, standings, teams),
    stats: buildStats(matches, teams),
  };
}
