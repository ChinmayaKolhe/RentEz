import { createContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../hooks/useAuth';

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const socketURL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
      const newSocket = io(socketURL);

      newSocket.on('connect', () => {
        console.log('✅ Socket connected:', newSocket.id);
        newSocket.emit('register', user._id);
      });

      newSocket.on('disconnect', () => {
        console.log('❌ Socket disconnected');
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }
  }, [user]);

  const value = {
    socket,
    onlineUsers,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};
