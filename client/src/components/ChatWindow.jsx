import { useState, useEffect, useRef } from 'react';
import { useSocket } from '../hooks/useSocket';
import { useAuth } from '../hooks/useAuth';
import { getChatMessages } from '../services/api';
import { Send, Image as ImageIcon, X } from 'lucide-react';
import { format } from 'date-fns';

const ChatWindow = ({ receiverId, receiverName, receiverImage, propertyId = null }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const { socket } = useSocket();
  const { user } = useAuth();

  useEffect(() => {
    if (receiverId) {
      fetchMessages();
    }
  }, [receiverId]);

  useEffect(() => {
    if (socket) {
      socket.on('receive_message', (message) => {
        if (message.sender._id === receiverId || message.receiver._id === receiverId) {
          setMessages((prev) => [...prev, message]);
          scrollToBottom();
        }
      });

      socket.on('message_sent', (message) => {
        setMessages((prev) => [...prev, message]);
        scrollToBottom();
      });

      return () => {
        socket.off('receive_message');
        socket.off('message_sent');
      };
    }
  }, [socket, receiverId]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await getChatMessages(receiverId);
      setMessages(response.data);
      scrollToBottom();
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !socket) return;

    socket.emit('send_message', {
      sender: user._id,
      receiver: receiverId,
      message: newMessage,
      propertyId,
    });

    setNewMessage('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg">
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white p-4 rounded-t-lg">
        <div className="flex items-center space-x-3">
          {receiverImage ? (
            <img src={receiverImage} alt={receiverName} className="h-10 w-10 rounded-full object-cover" />
          ) : (
            <div className="h-10 w-10 rounded-full bg-white bg-opacity-30 flex items-center justify-center">
              <span className="text-lg font-bold">{receiverName?.[0]}</span>
            </div>
          )}
          <div>
            <h3 className="font-semibold">{receiverName}</h3>
            <p className="text-xs text-white text-opacity-80">Online</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ maxHeight: '500px' }}>
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwn = message.sender._id === user._id || message.sender === user._id;
            
            return (
              <div key={message._id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-2' : 'order-1'}`}>
                  <div
                    className={`px-4 py-2 rounded-lg ${
                      isOwn
                        ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white'
                        : 'bg-gray-200 text-gray-800'
                    }`}
                  >
                    <p className="break-words">{message.message}</p>
                  </div>
                  <p className={`text-xs text-gray-500 mt-1 ${isOwn ? 'text-right' : 'text-left'}`}>
                    {format(new Date(message.createdAt), 'HH:mm')}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 input-field"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatWindow;
