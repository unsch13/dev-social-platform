import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Card, CardContent, CardMedia, CardActions, IconButton, Chip, Avatar, TextField, Button } from '@mui/material';
import { Favorite, Comment, Share, Send } from '@mui/icons-material';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const PostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchPost();
      fetchComments();
    }
  }, [id]);

  const fetchPost = async () => {
    try {
      const response = await axios.get(`/api/posts/${id}`);
      setPost(response.data.post);
    } catch (error) {
      console.error('Error fetching post:', error);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await axios.get(`/api/comments/post/${id}`);
      setComments(response.data.comments);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!post) return;
    
    try {
      await axios.post(`/api/posts/${post._id}/like`);
      setPost({
        ...post,
        isLiked: !post.isLiked,
        likes: post.isLiked 
          ? post.likes.filter((id: string) => id !== user?._id)
          : [...post.likes, user?._id || '']
      });
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleComment = async () => {
    if (!newComment.trim() || !user) return;

    try {
      await axios.post('/api/comments', {
        content: newComment,
        postId: id
      });
      setNewComment('');
      fetchComments();
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md">
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  if (!post) {
    return (
      <Container maxWidth="md">
        <Typography>Post not found</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Card sx={{ mb: 3 }}>
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
              {post.images.map((image: any, index: number) => (
                <CardMedia
                  key={index}
                  component="img"
                  height="400"
                  image={image.url}
                  alt={image.caption || 'Post image'}
                  sx={{ borderRadius: 1, mb: 1 }}
                />
              ))}
            </Box>
          )}

          {post.tags.length > 0 && (
            <Box sx={{ mb: 2 }}>
              {post.tags.map((tag: string, index: number) => (
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
            onClick={handleLike}
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

      {/* Comments Section */}
      <Typography variant="h6" gutterBottom>
        Comments ({comments.length})
      </Typography>

      {user && (
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            InputProps={{
              endAdornment: (
                <Button
                  onClick={handleComment}
                  disabled={!newComment.trim()}
                  startIcon={<Send />}
                >
                  Post
                </Button>
              ),
            }}
          />
        </Box>
      )}

      {comments.map((comment) => (
        <Card key={comment._id} sx={{ mb: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Avatar 
                src={comment.author.avatar} 
                alt={comment.author.username}
                sx={{ width: 32, height: 32, mr: 2 }}
              >
                {comment.author.firstName[0]}
              </Avatar>
              <Box>
                <Typography variant="subtitle2">
                  {comment.author.firstName} {comment.author.lastName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  @{comment.author.username}
                </Typography>
              </Box>
            </Box>
            <Typography variant="body2">
              {comment.content}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {new Date(comment.createdAt).toLocaleDateString()}
            </Typography>
          </CardContent>
        </Card>
      ))}
    </Container>
  );
};

export default PostDetail;
