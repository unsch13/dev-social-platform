import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Card, CardContent, CardMedia, CardActions, IconButton, Chip, Avatar, Button, TextField, InputAdornment, Grid } from '@mui/material';
import { Favorite, Comment, Share, Send, Search } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

interface Post {
  _id: string;
  content: string;
  images: Array<{ url: string; caption: string }>;
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

const Home: React.FC = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const endpoint = user ? '/api/posts/feed' : '/api/posts';
      const response = await axios.get(endpoint);
      setPosts(response.data.posts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
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
      console.error('Error liking post:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchPosts();
      return;
    }

    try {
      const response = await axios.get(`/api/posts/search?q=${encodeURIComponent(searchQuery)}`);
      setPosts(response.data.posts);
    } catch (error) {
      console.error('Error searching posts:', error);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md">
        <Typography>Loading posts...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          {user ? 'Your Feed' : 'Explore Posts'}
        </Typography>
        
        <TextField
          fullWidth
          placeholder="Search posts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={handleSearch}>
                  <Search />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {posts.length === 0 ? (
        <Typography variant="h6" color="text.secondary" align="center">
          No posts found
        </Typography>
      ) : (
        posts.map((post) => (
          <Card key={post._id} sx={{ mb: 3 }}>
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
                    <CardMedia
                      key={index}
                      component="img"
                      height="300"
                      image={image.url}
                      alt={image.caption || 'Post image'}
                      sx={{ borderRadius: 1 }}
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
            </CardContent>

            <CardActions>
              <IconButton 
                onClick={() => handleLike(post._id)}
                color={post.isLiked ? 'error' : 'default'}
              >
                <Favorite />
                <Typography sx={{ ml: 1 }}>{post.likes.length}</Typography>
              </IconButton>
              
              <IconButton>
                <Comment />
                <Typography sx={{ ml: 1 }}>{post.comments.length}</Typography>
              </IconButton>
              
              <IconButton>
                <Share />
              </IconButton>
              
              <Box sx={{ flexGrow: 1 }} />
              
              <Typography variant="caption" color="text.secondary">
                {new Date(post.createdAt).toLocaleDateString()}
              </Typography>
            </CardActions>
          </Card>
        ))
      )}
    </Container>
  );
};

export default Home;
