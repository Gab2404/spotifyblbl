import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { roomService } from '../services/api';

export default function Room({ user }) {
  const { code } = useParams();
  const navigate = useNavigate();
  
  const [roomState, setRoomState] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasJoined, setHasJoined] = useState(false);

  const fetchRoomData = async () => {
    try {
      const state = await roomService.getRoomState(code);
      const participantsData = await roomService.getParticipants(code);
      
      setRoomState(state);
      setParticipants(participantsData.participants || []);
      setLoading(false);
    } catch (err) {
      console.error('Erreur:', err);
      setLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!user) return;
    try {
      await roomService.joinRoom(code, user.spotify_id);
      setHasJoined(true);
      fetchRoomData();
    } catch (err) {
      console.error('Erreur join:', err);
    }
  };

  const handleVote = async (isLike) => {
    if (!user || !roomState?.current_track?.uri) return;
    try {
      await roomService.vote(code, user.spotify_id, isLike);
      fetchRoomData();
    } catch (err) {
      console.error('Erreur vote:', err);
    }
  };

  const handleRandomTrack = async () => {
    try {
      await roomService.getRandomTrack(code);
      fetchRoomData();
    } catch (err) {
      console.error('Erreur random:', err);
    }
  };

  useEffect(() => {
    if (user && hasJoined) {
      fetchRoomData();
      const interval = setInterval(fetchRoomData, 3000);
      return () => clearInterval(interval);
    }
  }, [code, user, hasJoined]);

  useEffect(() => {
    if (user) {
      fetchRoomData();
    }
  }, [user]);

  if (loading) return <div style={styles.loading}>Chargement...</div>;

  if (!user) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h2>Connexion requise</h2>
          <button onClick={() => navigate('/')} style={styles.btn}>Retour</button>
        </div>
      </div>
    );
  }

  if (!hasJoined && user) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h1>Room {code}</h1>
          <button onClick={handleJoinRoom} style={styles.btn}>Rejoindre</button>
          <button onClick={() => navigate('/')} style={styles.btnSecondary}>Annuler</button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>Room: {code}</h1>
        <div>👥 {participants.length} participants</div>
      </div>

      {roomState?.current_track?.uri ? (
        <div style={styles.trackCard}>
          {roomState.current_track.image_url && (
            <img src={roomState.current_track.image_url} alt="Cover" style={styles.image} />
          )}
          <h2>{roomState.current_track.name}</h2>
          <p>{roomState.current_track.artists}</p>
          <div>👍 {roomState.likes} / {roomState.room.like_threshold}</div>
          
          <div style={styles.voteButtons}>
            <button onClick={() => handleVote(false)} style={styles.dislikeBtn}>👎 Dislike</button>
            <button onClick={() => handleVote(true)} style={styles.likeBtn}>👍 Like</button>
          </div>
        </div>
      ) : (
        <div style={styles.trackCard}>
          <p>Aucune musique sélectionnée</p>
        </div>
      )}

      <div style={styles.controls}>
        <button onClick={handleRandomTrack} style={styles.btn}>
          🎲 Musique aléatoire
        </button>
      </div>

      <div style={styles.participants}>
        <h3>Participants</h3>
        {participants.map((p, i) => (
          <div key={i}>{p.display_name || p.spotify_id}</div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: '800px', margin: '0 auto', padding: '2rem' },
  loading: { textAlign: 'center', marginTop: '3rem', fontSize: '1.5rem' },
  card: { backgroundColor: 'white', padding: '2rem', borderRadius: '10px', textAlign: 'center' },
  header: { backgroundColor: 'white', padding: '1rem', borderRadius: '10px', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between' },
  trackCard: { backgroundColor: 'white', padding: '2rem', borderRadius: '10px', marginBottom: '2rem', textAlign: 'center' },
  image: { width: '200px', borderRadius: '10px', marginBottom: '1rem' },
  voteButtons: { display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1rem' },
  likeBtn: { padding: '1rem 2rem', backgroundColor: '#667eea', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '1rem' },
  dislikeBtn: { padding: '1rem 2rem', backgroundColor: '#f5576c', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '1rem' },
  controls: { backgroundColor: 'white', padding: '1rem', borderRadius: '10px', marginBottom: '2rem' },
  btn: { padding: '1rem 2rem', backgroundColor: '#667eea', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', width: '100%' },
  btnSecondary: { padding: '1rem 2rem', backgroundColor: '#ccc', color: '#333', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '0.5rem' },
  participants: { backgroundColor: 'white', padding: '1rem', borderRadius: '10px' }
};