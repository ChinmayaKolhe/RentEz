import { Server } from 'socket.io';
import ChatMessage from '../models/ChatMessage.js';

let io;

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Store connected users
  const connectedUsers = new Map();

  io.on('connection', (socket) => {
    console.log(`✅ User connected: ${socket.id}`);

    // Register user
    socket.on('register', (userId) => {
      connectedUsers.set(userId, socket.id);
      console.log(`User ${userId} registered with socket ${socket.id}`);
    });

    // Handle sending messages
    socket.on('send_message', async (data) => {
      try {
        const { sender, receiver, message, propertyId, image } = data;

        // Save message to database
        const newMessage = await ChatMessage.create({
          sender,
          receiver,
          message,
          property: propertyId,
          image,
          seen: false,
        });

        await newMessage.populate('sender receiver property');

        // Send to receiver if online
        const receiverSocketId = connectedUsers.get(receiver);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('receive_message', newMessage);
        }

        // Send confirmation to sender
        socket.emit('message_sent', newMessage);
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('message_error', { error: error.message });
      }
    });

    // Handle typing indicator
    socket.on('typing', (data) => {
      const receiverSocketId = connectedUsers.get(data.receiver);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('user_typing', {
          sender: data.sender,
          isTyping: data.isTyping,
        });
      }
    });

    // Handle message seen
    socket.on('mark_seen', async (data) => {
      try {
        await ChatMessage.updateMany(
          { sender: data.sender, receiver: data.receiver, seen: false },
          { seen: true }
        );

        const senderSocketId = connectedUsers.get(data.sender);
        if (senderSocketId) {
          io.to(senderSocketId).emit('messages_seen', {
            receiver: data.receiver,
          });
        }
      } catch (error) {
        console.error('Error marking messages as seen:', error);
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      // Remove user from connected users
      for (const [userId, socketId] of connectedUsers.entries()) {
        if (socketId === socket.id) {
          connectedUsers.delete(userId);
          console.log(`User ${userId} disconnected`);
          break;
        }
      }
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};
