import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function Callback({ onUserLoaded }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Le backend a déjà géré l'auth
    // On récupère juste les infos user depuis l'URL ou on fait un appel /me
    
    const spotifyId = searchParams.get('spotify_id');
    
    if (spotifyId) {
      // Récupérer les infos user
      fetch(`http://localhost:8000/auth/me?spotify_id=${spotifyId}`)
        .then(res => res.json())
        .then(data => {
          onUserLoaded(data);
          navigate('/');
        })
        .catch(() => navigate('/'));
    } else {
      // Sinon on redirige direct
      navigate('/');
    }
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.loading}>
        <h2>🎵 Connexion réussie !</h2>
        <p>Redirection...</p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loading: {
    textAlign: 'center',
    color: '#667eea',
  }
};