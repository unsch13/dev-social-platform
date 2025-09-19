import React from 'react';
import ReactDOM from 'react-dom/client';

function App() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🚀 DevSocial - Developer Social Platform</h1>
      <p>Welcome to your MERN stack social media platform!</p>
      <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h2>✅ Backend Status</h2>
        <p>✅ Express.js server running on port 5000</p>
        <p>✅ MongoDB Atlas connected</p>
        <p>✅ JWT authentication ready</p>
        <p>✅ Socket.IO for real-time features</p>
      </div>
      <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h2>🎯 Features Available</h2>
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
      <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#f0f8ff', borderRadius: '8px' }}>
        <h2>🧪 How to Test</h2>
        <ol>
          <li><strong>Backend API:</strong> <a href="http://localhost:5000" target="_blank">http://localhost:5000</a></li>
          <li><strong>Health Check:</strong> <a href="http://localhost:5000/health" target="_blank">http://localhost:5000/health</a></li>
          <li><strong>Test Registration:</strong> POST to http://localhost:5000/api/auth/register</li>
          <li><strong>Test Login:</strong> POST to http://localhost:5000/api/auth/login</li>
        </ol>
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
