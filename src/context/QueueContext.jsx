import { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';

const QueueContext = createContext();

// Configuration de l'URL du backend
const isLocal = window.location.hostname === 'localhost';
const BASE_URL = isLocal
  ? 'http://localhost:3001'                    // Développement local
  : 'https://marchermo.onrender.com';          // Production : Backend sur Render

// Configuration Socket.IO robuste
const socket = io(BASE_URL, {
  transports: ['polling', 'websocket'], // Essayer polling d'abord pour compatibilité max
  withCredentials: true,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
});
const API_URL = `${BASE_URL}/api`;


export const QueueProvider = ({ children }) => {
  const [queue, setQueue] = useState([]);
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('marchemo_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Charger la file initiale et écouter les mises à jour
  useEffect(() => {
    const fetchQueue = async () => {
      try {
        const res = await axios.get(`${API_URL}/queue`);
        setQueue(res.data);
      } catch (err) {
        console.error("Erreur chargement file:", err);
      }
    };

    fetchQueue();

    socket.on('queue_updated', (updatedQueue) => {
      setQueue(updatedQueue);
    });

    socket.on('client_called', (calledUser) => {
      // Si c'est nous qui sommes appelés, on met à jour notre état local
      if (currentUser && calledUser.id === currentUser.id) {
        setCurrentUser(prev => ({ ...prev, status: 'called' }));
      }
    });

    return () => {
      socket.off('queue_updated');
      socket.off('client_called');
    };
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('marchemo_current_user', JSON.stringify(currentUser));
    }
  }, [currentUser]);

  const joinQueue = async (phone) => {
    try {
      const res = await axios.post(`${API_URL}/queue/join`, { phone });
      setCurrentUser(res.data);
      return res.data;
    } catch (err) {
      console.error("Erreur joinQueue:", err);
    }
  };

  const callNext = async () => {
    try {
      const res = await axios.post(`${API_URL}/queue/call`);
      return res.data;
    } catch (err) {
      console.error("Erreur callNext:", err);
    }
  };

  const resetQueue = async () => {
    try {
      await axios.post(`${API_URL}/queue/reset`);
      setCurrentUser(null);
      localStorage.removeItem('marchemo_current_user');
    } catch (err) {
      console.error("Erreur resetQueue:", err);
    }
  };

  return (
    <QueueContext.Provider value={{ queue, joinQueue, callNext, currentUser, resetQueue }}>
      {children}
    </QueueContext.Provider>
  );
};

export const useQueue = () => useContext(QueueContext);
