import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, TextField, InputAdornment, IconButton, Card, CardContent, Avatar, Button, Chip, Tabs, Tab } from '@mui/material';
import { Search as SearchIcon, PersonAdd, PersonRemove } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

interface User {
  _id: string;
  username: string;
  firstName: string;
  lastName: string;
  avatar: string;
  bio: string;
  skills: string[];
  followersCount: number;
}

interface Post {
  _id: string;
  content: string;
  images: Array<{ url: string }>;
  tags: string[];
  author: {
    _id: string;
    username: string;
    firstName: string;
    lastName: string;
    avatar: string;
  };
  likes: string[];
  comments: any[];
  views: number;
  createdAt: string;
  isLiked?: boolean;
}

const Search: React.FC = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setUsers([]);
      setPosts([]);
      return;
    }

    setLoading(true);
    try {
      if (activeTab === 0) {
        // Search users
        const response = await axios.get(`/api/users/search?q=${encodeURIComponent(searchQuery)}`);
        setUsers(response.data.users);
      } else {
        // Search posts
        const response = await axios.get(`/api/posts/search?q=${encodeURIComponent(searchQuery)}`);
        setPosts(response.data.posts);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (userId: string) => {
    try {
      await axios.post(`/api/users/${userId}/follow`);
      setUsers(users.map(u => 
        u._id === userId 
          ? { ...u, followersCount: u.followersCount + 1 }
          : u
      ));
    } catch (error) {
      console.error('Follow error:', error);
    }
  };

  const handleUnfollow = async (userId: string) => {
    try {
      await axios.delete(`/api/users/${userId}/follow`);
      setUsers(users.map(u => 
        u._id === userId 
          ? { ...u, followersCount: u.followersCount - 1 }
          : u
      ));
    } catch (error) {
      console.error('Unfollow error:', error);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      await axios.post(`/api/posts/${postId}/like`);
      setPosts(posts.map(post => 
        post._id === postId 
          ? { 
              ...post, 
              isLiked: !post.isLiked,
              likes: post.isLiked 
                ? post.likes.filter(id => id !== user?._id)
                : [...post.likes, user?._id || '']
            }
          : post
      ));
    } catch (error) {
      console.error('Like error:', error);
    }
  };

  useEffect(() => {
    if (searchQuery.trim()) {
      handleSearch();
    }
  }, [activeTab]);

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom>
        Search
      </Typography>

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search users or posts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={handleSearch} disabled={loading}>
                  <SearchIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab label="Users" />
          <Tab label="Posts" />
        </Tabs>
      </Box>

      {loading && (
        <Typography>Searching...</Typography>
      )}

      {activeTab === 0 && (
        <Box>
          {users.length === 0 && searchQuery.trim() && !loading ? (
            <Typography color="text.secondary">
              No users found for "{searchQuery}"
            </Typography>
          ) : (
            users.map((userResult) => (
              <Card key={userResult._id} sx={{ mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar 
                        src={userResult.avatar} 
                        alt={userResult.username}
                        sx={{ mr: 2, width: 60, height: 60 }}
                      >
                        {userResult.firstName[0]}{userResult.lastName[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="h6">
                          {userResult.firstName} {userResult.lastName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          @{userResult.username}
                        </Typography>
                        {userResult.bio && (
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            {userResult.bio}
                          </Typography>
                        )}
                        <Typography variant="caption" color="text.secondary">
                          {userResult.followersCount} followers
                        </Typography>
                      </Box>
                    </Box>
                    
                    {user && user._id !== userResult._id && (
                      <Button
                        variant="outlined"
                        startIcon={<PersonAdd />}
                        onClick={() => handleFollow(userResult._id)}
                      >
                        Follow
                      </Button>
                    )}
                  </Box>
                  
                  {userResult.skills.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      {userResult.skills.map((skill, index) => (
                        <Chip 
                          key={index} 
                          label={skill} 
                          size="small" 
                          sx={{ mr: 1, mb: 1 }}
                        />
                      ))}
                    </Box>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </Box>
      )}

      {activeTab === 1 && (
        <Box>
          {posts.length === 0 && searchQuery.trim() && !loading ? (
            <Typography color="text.secondary">
              No posts found for "{searchQuery}"
            </Typography>
          ) : (
            posts.map((post) => (
              <Card key={post._id} sx={{ mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar 
                      src={post.author.avatar} 
                      alt={post.author.username}
                      sx={{ mr: 2 }}
                    >
                      {post.author.firstName[0]}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1">
                        {post.author.firstName} {post.author.lastName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        @{post.author.username}
                      </Typography>
                    </Box>
                  </Box>

                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {post.content}
                  </Typography>

                  {post.images.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      {post.images.map((image, index) => (
                        <img
                          key={index}
                          src={image.url}
                          alt={`Post ${index + 1}`}
                          style={{ 
                            width: '100%', 
                            maxWidth: '400px', 
                            height: 'auto',
                            borderRadius: '8px',
                            marginBottom: '8px'
                          }}
                        />
                      ))}
                    </Box>
                  )}

                  {post.tags.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      {post.tags.map((tag, index) => (
                        <Chip 
                          key={index} 
                          label={`#${tag}`} 
                          size="small" 
                          sx={{ mr: 1, mb: 1 }}
                        />
                      ))}
                    </Box>
                  )}

                  <Typography variant="caption" color="text.secondary">
                    {post.likes.length} likes • {post.comments.length} comments • {post.views} views • {new Date(post.createdAt).toLocaleDateString()}
                  </Typography>
                </CardContent>
              </Card>
            ))
          )}
        </Box>
      )}
    </Container>
  );
};

export default Search;
