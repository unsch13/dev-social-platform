import React, { useState, useEffect } from 'react';
import './App.css';

const API_BASE = window.location.hostname === 'localhost' 
  ? 'http://localhost:5000/api' 
  : 'https://dev-social-platform-1.onrender.com/api';

function App() {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('login');
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Login form state
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ 
    username: '', email: '', password: '', firstName: '', lastName: '' 
  });

  // Post form state
  const [postData, setPostData] = useState({ content: '', image: '' });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUserData(token);
    }
  }, []);

  const fetchUserData = async (token) => {
    try {
      const response = await fetch(`${API_BASE}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setCurrentView('dashboard');
        fetchPosts();
        fetchUsers();
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });
      const data = await response.json();
      if (data.token) {
        localStorage.setItem('token', data.token);
        setUser(data.user);
        setCurrentView('dashboard');
        fetchPosts();
        fetchUsers();
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (error) {
      setError('Login error: ' + error.message);
    }
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerData)
      });
      const data = await response.json();
      if (data.token) {
        localStorage.setItem('token', data.token);
        setUser(data.user);
        setCurrentView('dashboard');
        fetchPosts();
        fetchUsers();
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (error) {
      setError('Registration error: ' + error.message);
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setCurrentView('login');
    setPosts([]);
    setUsers([]);
  };

  const createPost = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/posts`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(postData)
      });
      const data = await response.json();
      if (data.success) {
        setPostData({ content: '', image: '' });
        fetchPosts();
      } else {
        setError(data.message || 'Post creation failed');
      }
    } catch (error) {
      setError('Post creation error: ' + error.message);
    }
    setLoading(false);
  };

  const fetchPosts = async () => {
    try {
      const response = await fetch(`${API_BASE}/posts`);
      const data = await response.json();
      setPosts(data.posts || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_BASE}/users/search?q=`);
      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const likePost = async (postId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/posts/${postId}/like`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        fetchPosts();
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const followUser = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/users/${userId}/follow`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        fetchUsers();
      }
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  // Authentication Views
  if (!user && currentView === 'login') {
  return (
    <div className="app">
      <div className="auth-container">
        <h1>🚀 DevSocial</h1>
        <h2>Developer Social Platform</h2>
          
          <div className="auth-tabs">
            <button 
              className={currentView === 'login' ? 'active' : ''}
              onClick={() => setCurrentView('login')}
            >
              Login
            </button>
            <button 
              className={currentView === 'register' ? 'active' : ''}
              onClick={() => setCurrentView('register')}
            >
              Register
            </button>
          </div>

          {error && <div className="error-message">{error}</div>}

          {currentView === 'login' ? (
            <form onSubmit={handleLogin} className="auth-form">
              <input
                type="email"
                placeholder="Email"
                value={loginData.email}
                onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={loginData.password}
                onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                required
              />
              <button type="submit" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="auth-form">
              <input
                type="text"
                placeholder="Username"
                value={registerData.username}
                onChange={(e) => setRegisterData({...registerData, username: e.target.value})}
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={registerData.email}
                onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                required
              />
              <input
                type="text"
                placeholder="First Name"
                value={registerData.firstName}
                onChange={(e) => setRegisterData({...registerData, firstName: e.target.value})}
                required
              />
              <input
                type="text"
                placeholder="Last Name"
                value={registerData.lastName}
                onChange={(e) => setRegisterData({...registerData, lastName: e.target.value})}
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={registerData.password}
                onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                required
              />
              <button type="submit" disabled={loading}>
                {loading ? 'Registering...' : 'Register'}
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // Main Application
  return (
    <div className="app">
      <header className="header">
        <h1>🚀 DevSocial</h1>
        <div className="user-info">
          <span>Welcome, {user?.firstName}!</span>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <nav className="nav">
        <button 
          className={currentView === 'dashboard' ? 'active' : ''}
          onClick={() => setCurrentView('dashboard')}
        >
          Dashboard
        </button>
        <button 
          className={currentView === 'posts' ? 'active' : ''}
          onClick={() => setCurrentView('posts')}
        >
          Posts
        </button>
        <button 
          className={currentView === 'users' ? 'active' : ''}
          onClick={() => setCurrentView('users')}
        >
          Users
        </button>
        <button 
          className={currentView === 'messages' ? 'active' : ''}
          onClick={() => setCurrentView('messages')}
        >
          Messages
        </button>
        <button 
          className={currentView === 'analytics' ? 'active' : ''}
          onClick={() => setCurrentView('analytics')}
        >
          Analytics
        </button>
      </nav>

      <main className="main">
        {error && <div className="error-message">{error}</div>}

        {currentView === 'dashboard' && (
          <div className="dashboard">
            <h2>Dashboard</h2>
            <div className="stats">
              <div className="stat-card">
                <h3>Posts</h3>
                <p>{posts.length}</p>
              </div>
              <div className="stat-card">
                <h3>Users</h3>
                <p>{users.length}</p>
              </div>
              <div className="stat-card">
                <h3>Following</h3>
                <p>{user?.following?.length || 0}</p>
              </div>
            </div>

            <div className="create-post">
              <h3>Create New Post</h3>
              <form onSubmit={createPost}>
                <textarea
                  placeholder="What's on your mind?"
                  value={postData.content}
                  onChange={(e) => setPostData({...postData, content: e.target.value})}
                  required
                />
                <input
                  type="url"
                  placeholder="Image URL (optional)"
                  value={postData.image}
                  onChange={(e) => setPostData({...postData, image: e.target.value})}
                />
                <button type="submit" disabled={loading}>
                  {loading ? 'Sharing...' : 'Share Post'}
                </button>
              </form>
            </div>

            <div className="recent-posts">
              <h3>Recent Posts</h3>
              {posts.slice(0, 5).map(post => (
                <div key={post._id} className="post-card">
                  <div className="post-header">
                    <h4>{post.author?.firstName} {post.author?.lastName}</h4>
                    <span className="post-time">{new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p>{post.content}</p>
                  {post.image && <img src={post.image} alt="Post" className="post-image" />}
                  <div className="post-actions">
                    <button onClick={() => likePost(post._id)}>
                      ❤️ {post.likes?.length || 0}
                    </button>
                    <button>💬 {post.comments?.length || 0}</button>
                    <button>🔄 Share</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentView === 'posts' && (
          <div className="posts">
            <h2>All Posts</h2>
            {posts.map(post => (
              <div key={post._id} className="post-card">
                <div className="post-header">
                  <h4>{post.author?.firstName} {post.author?.lastName}</h4>
                  <span className="post-time">{new Date(post.createdAt).toLocaleDateString()}</span>
                </div>
                <p>{post.content}</p>
                {post.image && <img src={post.image} alt="Post" className="post-image" />}
                <div className="post-actions">
                  <button onClick={() => likePost(post._id)}>
                    ❤️ {post.likes?.length || 0}
                  </button>
                  <button>💬 {post.comments?.length || 0}</button>
                  <button>🔄 Share</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {currentView === 'users' && (
          <div className="users">
            <h2>All Users</h2>
            <div className="users-grid">
              {users.map(user => (
                <div key={user._id} className="user-card">
                  <div className="user-avatar">
                    {user.firstName?.[0]}{user.lastName?.[0]}
                  </div>
                  <h4>{user.firstName} {user.lastName}</h4>
                  <p>@{user.username}</p>
                  <p className="user-bio">{user.bio || 'No bio available'}</p>
                  <button onClick={() => followUser(user._id)}>
                    Follow
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentView === 'messages' && (
          <div className="messages">
            <h2>Messages</h2>
            <div className="messages-container">
              <div className="conversations-list">
                <h3>Conversations</h3>
                <p>No conversations yet. Start following users to begin messaging!</p>
              </div>
              <div className="message-area">
                <h3>Select a conversation</h3>
                <p>Choose a conversation from the list to start messaging.</p>
              </div>
            </div>
          </div>
        )}

        {currentView === 'analytics' && (
          <div className="analytics">
            <h2>Analytics</h2>
            <div className="analytics-cards">
              <div className="analytics-card">
                <h3>Total Posts</h3>
                <p>{posts.length}</p>
              </div>
              <div className="analytics-card">
                <h3>Total Users</h3>
                <p>{users.length}</p>
              </div>
              <div className="analytics-card">
                <h3>Your Posts</h3>
                <p>{posts.filter(post => post.author?._id === user?._id).length}</p>
              </div>
              <div className="analytics-card">
                <h3>Your Followers</h3>
                <p>{user?.followers?.length || 0}</p>
              </div>
        </div>
      </div>
        )}
      </main>
    </div>
  );
}

export default App;