import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Card, CardContent, Avatar, Button, Chip, Grid, Paper } from '@mui/material';
import { PersonAdd, PersonRemove, GitHub, LinkedIn, Language } from '@mui/icons-material';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

interface UserProfile {
  _id: string;
  username: string;
  firstName: string;
  lastName: string;
  bio: string;
  avatar: string;
  skills: string[];
  githubUrl: string;
  linkedinUrl: string;
  websiteUrl: string;
  followers: Array<{
    _id: string;
    username: string;
    firstName: string;
    lastName: string;
    avatar: string;
  }>;
  following: Array<{
    _id: string;
    username: string;
    firstName: string;
    lastName: string;
    avatar: string;
  }>;
  createdAt: string;
}

interface Post {
  _id: string;
  content: string;
  images: Array<{ url: string }>;
  tags: string[];
  likes: string[];
  comments: any[];
  views: number;
  createdAt: string;
}

const Profile: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (username) {
      fetchProfile();
    }
  }, [username]);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`/api/users/${username}`);
      setProfile(response.data.user);
      setPosts(response.data.posts);
      setIsFollowing(response.data.isFollowing);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!profile) return;

    try {
      if (isFollowing) {
        await axios.delete(`/api/users/${profile._id}/follow`);
      } else {
        await axios.post(`/api/users/${profile._id}/follow`);
      }
      setIsFollowing(!isFollowing);
      // Update followers count
      setProfile(prev => prev ? {
        ...prev,
        followers: isFollowing 
          ? prev.followers.filter(f => f._id !== currentUser?._id)
          : [...prev.followers, { 
              _id: currentUser?._id || '', 
              username: currentUser?.username || '', 
              firstName: currentUser?.firstName || '', 
              lastName: currentUser?.lastName || '', 
              avatar: currentUser?.avatar || '' 
            }]
      } : null);
    } catch (error) {
      console.error('Error following/unfollowing:', error);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md">
        <Typography>Loading profile...</Typography>
      </Container>
    );
  }

  if (!profile) {
    return (
      <Container maxWidth="md">
        <Typography>Profile not found</Typography>
      </Container>
    );
  }

  const isOwnProfile = currentUser?._id === profile._id;

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Avatar
            src={profile.avatar}
            alt={profile.username}
            sx={{ width: 120, height: 120, mr: 3 }}
          >
            {profile.firstName[0]}{profile.lastName[0]}
          </Avatar>
          
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h4" gutterBottom>
              {profile.firstName} {profile.lastName}
            </Typography>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              @{profile.username}
            </Typography>
            
            {profile.bio && (
              <Typography variant="body1" sx={{ mb: 2 }}>
                {profile.bio}
              </Typography>
            )}

            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              {profile.githubUrl && (
                <Button
                  startIcon={<GitHub />}
                  href={profile.githubUrl}
                  target="_blank"
                  size="small"
                >
                  GitHub
                </Button>
              )}
              {profile.linkedinUrl && (
                <Button
                  startIcon={<LinkedIn />}
                  href={profile.linkedinUrl}
                  target="_blank"
                  size="small"
                >
                  LinkedIn
                </Button>
              )}
              {profile.websiteUrl && (
                <Button
                  startIcon={<Language />}
                  href={profile.websiteUrl}
                  target="_blank"
                  size="small"
                >
                  Website
                </Button>
              )}
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Typography variant="body2">
                <strong>{profile.followers.length}</strong> Followers
              </Typography>
              <Typography variant="body2">
                <strong>{profile.following.length}</strong> Following
              </Typography>
              <Typography variant="body2">
                <strong>{posts.length}</strong> Posts
              </Typography>
            </Box>
          </Box>

          {!isOwnProfile && currentUser && (
            <Button
              variant={isFollowing ? "outlined" : "contained"}
              startIcon={isFollowing ? <PersonRemove /> : <PersonAdd />}
              onClick={handleFollow}
            >
              {isFollowing ? 'Unfollow' : 'Follow'}
            </Button>
          )}
        </Box>

        {profile.skills.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Skills
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {profile.skills.map((skill, index) => (
                <Chip key={index} label={skill} variant="outlined" />
              ))}
            </Box>
          </Box>
        )}
      </Paper>

      <Typography variant="h5" gutterBottom>
        Posts
      </Typography>

      {posts.length === 0 ? (
        <Typography color="text.secondary">
          No posts yet
        </Typography>
      ) : (
        posts.map((post) => (
          <Card key={post._id} sx={{ mb: 2 }}>
            <CardContent>
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
    </Container>
  );
};

export default Profile;
