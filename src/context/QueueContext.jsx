import { createContext, useContext, useState, useEffect } from 'react';

const QueueContext = createContext();

export const QueueProvider = ({ children }) => {
  const [queue, setQueue] = useState(() => {
    const saved = localStorage.getItem('marchemo_queue');
    return saved ? JSON.parse(saved) : [];
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('marchemo_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    localStorage.setItem('marchemo_queue', JSON.stringify(queue));
  }, [queue]);

  useEffect(() => {
    localStorage.setItem('marchemo_current_user', JSON.stringify(currentUser));
  }, [currentUser]);

  const joinQueue = (phone) => {
    const newUser = {
      id: Date.now().toString(),
      phone,
      status: 'waiting', // waiting, called
      timestamp: new Date().toISOString(),
      position: queue.filter(q => q.status === 'waiting').length + 1
    };
    setQueue([...queue, newUser]);
    setCurrentUser(newUser);
    return newUser;
  };

  const callNext = () => {
    const nextWaiting = queue.find(q => q.status === 'waiting');
    if (!nextWaiting) return null;

    const updatedQueue = queue.map(q => 
      q.id === nextWaiting.id ? { ...q, status: 'called' } : q
    );
    setQueue(updatedQueue);

    // Simulate notification
    console.log(`Notification sent to ${nextWaiting.phone}: C'est votre tour !`);
    
    // In a real app, you'd trigger a push or SMS here
    return nextWaiting;
  };

  const resetQueue = () => {
    setQueue([]);
    setCurrentUser(null);
  };

  return (
    <QueueContext.Provider value={{ queue, joinQueue, callNext, currentUser, resetQueue }}>
      {children}
    </QueueContext.Provider>
  );
};

export const useQueue = () => useContext(QueueContext);
