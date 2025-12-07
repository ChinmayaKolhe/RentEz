import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getConversations } from '../services/api';
import ChatWindow from '../components/ChatWindow';
import { MessageSquare } from 'lucide-react';
import axios from 'axios';

const Chat = () => {
  const { userId } = useParams();
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (userId) {
      // Check if user exists in conversations
      const existingConv = conversations.find((conv) => conv.user._id === userId);
      if (existingConv) {
        setSelectedUser(existingConv.user);
      } else {
        // Fetch user details for new conversation
        fetchUserDetails(userId);
      }
    }
  }, [userId, conversations]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await getConversations();
      setConversations(response.data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetails = async (userId) => {
    try {
      // Fetch user details from a simple endpoint
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/auth/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedUser(response.data.data);
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Messages</h1>

        <div className="grid md:grid-cols-3 gap-6" style={{ height: 'calc(100vh - 200px)' }}>
          {/* Conversations List */}
          <div className="md:col-span-1 card p-4 overflow-y-auto">
            <h2 className="text-lg font-bold mb-4">Conversations</h2>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="spinner"></div>
              </div>
            ) : conversations.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No conversations yet</p>
            ) : (
              <div className="space-y-2">
                {conversations.map((conv) => (
                  <button
                    key={conv.user._id}
                    onClick={() => setSelectedUser(conv.user)}
                    className={`w-full p-3 rounded-lg text-left transition-colors ${
                      selectedUser?._id === conv.user._id
                        ? 'bg-primary-100 border-2 border-primary-600'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      {conv.user.profilePicture ? (
                        <img
                          src={conv.user.profilePicture}
                          alt={conv.user.name}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-primary-200 flex items-center justify-center">
                          <span className="text-primary-700 font-bold">{conv.user.name?.[0]}</span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">{conv.user.name}</p>
                        <p className="text-sm text-gray-500 truncate">{conv.lastMessage?.message}</p>
                      </div>
                      {conv.unreadCount > 0 && (
                        <span className="bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Chat Window */}
          <div className="md:col-span-2">
            {selectedUser ? (
              <ChatWindow
                receiverId={selectedUser._id}
                receiverName={selectedUser.name}
                receiverImage={selectedUser.profilePicture}
              />
            ) : (
              <div className="card h-full flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg">Select a conversation to start chatting</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
