import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTournament } from '../../hooks/useTournament';
import { currentStagePath } from './stages';

export default function StageRedirect() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { tournament } = useTournament(id);

  useEffect(() => {
    if (tournament && tournament.id === id) {
      navigate(`/tournaments/${id}/${currentStagePath(tournament.status)}`, { replace: true });
    }
  }, [tournament, id, navigate]);

  return null;
}
