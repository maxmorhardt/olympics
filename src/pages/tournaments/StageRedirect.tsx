import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTournament } from '../../hooks/useTournament';
import { currentStagePath } from './stages';

// sends /tournaments/:id to whichever stage the tournament is currently in
export default function StageRedirect() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { tournament } = useTournament(id);

  useEffect(() => {
    // wait for the bundle for THIS tournament so we redirect to the correct,
    // currently-active stage (and never act on a previously-viewed tournament)
    if (tournament && tournament.id === id) {
      navigate(`/tournaments/${id}/${currentStagePath(tournament.status)}`, { replace: true });
    }
  }, [tournament, id, navigate]);

  return null;
}
