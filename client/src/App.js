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
      // Verify token and get user data
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
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
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
      } else {
        alert('Login failed: ' + data.message);
      }
    } catch (error) {
      alert('Login error: ' + error.message);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
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
      } else {
        alert('Registration failed: ' + data.message);
      }
    } catch (error) {
      alert('Registration error: ' + error.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setCurrentView('login');
  };

  const createPost = async (e) => {
    e.preventDefault();
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
        alert('Post created successfully!');
        setPostData({ content: '', image: '' });
        fetchPosts();
      } else {
        alert('Post creation failed: ' + data.message);
      }
    } catch (error) {
      alert('Post creation error: ' + error.message);
    }
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

  useEffect(() => {
    if (currentView === 'dashboard') {
      fetchPosts();
      fetchUsers();
    }
  }, [currentView]);

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
              <button type="submit">Login</button>
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
              <button type="submit">Register</button>
            </form>
          )}
        </div>
      </div>
    );
  }

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
        <button onClick={() => setCurrentView('dashboard')}>Dashboard</button>
        <button onClick={() => setCurrentView('posts')}>Posts</button>
        <button onClick={() => setCurrentView('users')}>Users</button>
        <button onClick={() => setCurrentView('messages')}>Messages</button>
        <button onClick={() => setCurrentView('analytics')}>Analytics</button>
      </nav>

      <main className="main">
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
                <button type="submit">Share Post</button>
              </form>
            </div>

            <div className="recent-posts">
              <h3>Recent Posts</h3>
              {posts.map(post => (
                <div key={post._id} className="post-card">
                  <h4>{post.author?.firstName} {post.author?.lastName}</h4>
                  <p>{post.content}</p>
                  {post.image && <img src={post.image} alt="Post" />}
                  <div className="post-actions">
                    <button>❤️ {post.likes?.length || 0}</button>
                    <button>💬 {post.comments?.length || 0}</button>
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
                <h4>{post.author?.firstName} {post.author?.lastName}</h4>
                <p>{post.content}</p>
                {post.image && <img src={post.image} alt="Post" />}
                <div className="post-actions">
                  <button>❤️ {post.likes?.length || 0}</button>
                  <button>💬 {post.comments?.length || 0}</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {currentView === 'users' && (
          <div className="users">
            <h2>All Users</h2>
            {users.map(user => (
              <div key={user._id} className="user-card">
                <h4>{user.firstName} {user.lastName}</h4>
                <p>@{user.username}</p>
                <p>{user.bio}</p>
                <button>Follow</button>
              </div>
            ))}
          </div>
        )}

        {currentView === 'messages' && (
          <div className="messages">
            <h2>Messages</h2>
            <p>Direct messaging feature coming soon!</p>
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
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
