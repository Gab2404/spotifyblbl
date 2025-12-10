import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function Callback({ onUserLoaded }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const code = searchParams.get('code');
    
    if (code) {
      // Le backend gère déjà l'échange du code
      // On récupère juste les paramètres de l'URL de retour
      
      // Simuler une requête au callback (déjà géré côté backend)
      fetch(`http://localhost:8000/auth/callback?code=${code}`)
        .then(res => res.json())
        .then(data => {
          if (data.user) {
            onUserLoaded(data.user);
            navigate('/');
          }
        })
        .catch(err => {
          console.error('Erreur callback:', err);
          navigate('/');
        });
    } else {
      navigate('/');
    }
  }, [searchParams, navigate, onUserLoaded]);

  return (
    <div style={styles.container}>
      <div style={styles.loading}>
        <h2>🎵 Connexion à Spotify...</h2>
        <p>Veuillez patienter</p>
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