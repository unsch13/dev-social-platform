import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, List, ListItem, ListItemText, ListItemAvatar, Avatar, TextField, Button, Paper, Divider } from '@mui/material';
import { Send } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import axios from 'axios';

interface Conversation {
  _id: string;
  otherParticipant: {
    _id: string;
    username: string;
    firstName: string;
    lastName: string;
    avatar: string;
  };
  lastMessage?: {
    content: string;
    sender: {
      username: string;
    };
    createdAt: string;
  };
  lastMessageAt: string;
  unreadCount: number;
}

interface Message {
  _id: string;
  content: string;
  sender: {
    _id: string;
    username: string;
    firstName: string;
    lastName: string;
    avatar: string;
  };
  createdAt: string;
  isRead: boolean;
}

const Messages: React.FC = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation && socket) {
      socket.emit('join-conversation', selectedConversation._id);
      fetchMessages();
    }
  }, [selectedConversation, socket]);

  const fetchConversations = async () => {
    try {
      const response = await axios.get('/api/messages/conversations');
      setConversations(response.data.conversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!selectedConversation) return;

    try {
      const response = await axios.get(`/api/messages/conversations/${selectedConversation._id}`);
      setMessages(response.data.messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const response = await axios.post('/api/messages', {
        conversationId: selectedConversation._id,
        content: newMessage
      });

      setMessages(prev => [...prev, response.data.message]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Typography>Loading messages...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>
        Messages
      </Typography>

      <Box sx={{ display: 'flex', height: '70vh', border: 1, borderColor: 'divider' }}>
        {/* Conversations List */}
        <Box sx={{ width: '300px', borderRight: 1, borderColor: 'divider' }}>
          <Typography variant="h6" sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            Conversations
          </Typography>
          
          {conversations.length === 0 ? (
            <Typography sx={{ p: 2, color: 'text.secondary' }}>
              No conversations yet
            </Typography>
          ) : (
            <List>
              {conversations.map((conversation) => (
                <ListItem
                  key={conversation._id}
                  button
                  selected={selectedConversation?._id === conversation._id}
                  onClick={() => setSelectedConversation(conversation)}
                >
                  <ListItemAvatar>
                    <Avatar src={conversation.otherParticipant.avatar}>
                      {conversation.otherParticipant.firstName[0]}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={conversation.otherParticipant.firstName + ' ' + conversation.otherParticipant.lastName}
                    secondary={conversation.lastMessage?.content || 'No messages yet'}
                  />
                  {conversation.unreadCount > 0 && (
                    <Box
                      sx={{
                        backgroundColor: 'primary.main',
                        color: 'white',
                        borderRadius: '50%',
                        minWidth: '20px',
                        height: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px'
                      }}
                    >
                      {conversation.unreadCount}
                    </Box>
                  )}
                </ListItem>
              ))}
            </List>
          )}
        </Box>

        {/* Messages Area */}
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="h6">
                  {selectedConversation.otherParticipant.firstName} {selectedConversation.otherParticipant.lastName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  @{selectedConversation.otherParticipant.username}
                </Typography>
              </Box>

              {/* Messages */}
              <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
                {messages.length === 0 ? (
                  <Typography color="text.secondary" align="center">
                    No messages yet. Start the conversation!
                  </Typography>
                ) : (
                  messages.map((message) => (
                    <Box
                      key={message._id}
                      sx={{
                        display: 'flex',
                        justifyContent: message.sender._id === user?._id ? 'flex-end' : 'flex-start',
                        mb: 2
                      }}
                    >
                      <Paper
                        sx={{
                          p: 2,
                          maxWidth: '70%',
                          backgroundColor: message.sender._id === user?._id ? 'primary.main' : 'grey.100',
                          color: message.sender._id === user?._id ? 'white' : 'text.primary'
                        }}
                      >
                        <Typography variant="body1">
                          {message.content}
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.7 }}>
                          {new Date(message.createdAt).toLocaleTimeString()}
                        </Typography>
                      </Paper>
                    </Box>
                  ))
                )}
              </Box>

              {/* Message Input */}
              <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    fullWidth
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <Button
                    variant="contained"
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    startIcon={<Send />}
                  >
                    Send
                  </Button>
                </Box>
              </Box>
            </>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <Typography color="text.secondary">
                Select a conversation to start messaging
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default Messages;
