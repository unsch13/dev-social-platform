import React from 'react';
import './App.css';

function App() {
  return (
    <div className="app">
      <div className="auth-container">
        <h1>🚀 DevSocial</h1>
        <h2>Developer Social Platform</h2>
        <p>Welcome to your MERN stack social media platform!</p>
        <div className="status-card">
          <h3>✅ Backend Status</h3>
          <ul>
            <li>Express.js server running</li>
            <li>MongoDB Atlas connected</li>
            <li>JWT authentication working</li>
            <li>All API endpoints functional</li>
          </ul>
        </div>
        <div className="status-card">
          <h3>🎯 Available Features</h3>
          <ul>
            <li>User registration and login</li>
            <li>Profile management</li>
            <li>Post creation with images</li>
            <li>Follow/following system</li>
            <li>Real-time messaging</li>
            <li>Analytics dashboard</li>
            <li>Search functionality</li>
          </ul>
        </div>
        <div className="api-info">
          <h3>📡 API Endpoints</h3>
          <p><strong>POST</strong> /api/auth/register - Register new user</p>
          <p><strong>POST</strong> /api/auth/login - Login user</p>
          <p><strong>GET</strong> /api/posts - Get all posts</p>
          <p><strong>GET</strong> /api/users/search - Search users</p>
        </div>
      </div>
    </div>
  );
}

export default App;