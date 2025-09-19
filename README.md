# DevSocial - Developer Social Media Platform

A comprehensive developer-focused social media platform built with the MERN stack, enabling developers to share projects, connect with peers, and track engagement analytics.

## 🚀 Features

### User Management
- **JWT Authentication**: Secure user registration and login
- **Profile Management**: Complete profile creation and editing
- **Social Networking**: Follow/following system for developer connections
- **Skills & Links**: GitHub, LinkedIn, and personal website integration

### Post System
- **Rich Content**: Text posts with image uploads and links
- **Tagging System**: Categorize posts with hashtags
- **Media Upload**: Cloudinary integration for image storage
- **CRUD Operations**: Create, read, update, and delete posts

### Social Features
- **Engagement**: Like, comment, and share posts
- **Real-time Interactions**: Instant notifications for social activities
- **Search**: Find users and posts by keywords
- **Feed**: Personalized feed based on following

### Real-time Communication
- **Socket.IO Integration**: Real-time notifications and messaging
- **Direct Messaging**: Private conversations between users
- **Live Updates**: Instant updates for likes, comments, and follows

### Analytics Dashboard
- **Engagement Metrics**: Track likes, comments, views, and shares
- **Data Visualization**: Charts and graphs for post performance
- **Performance Insights**: Top posts and trending tags
- **Time-based Analysis**: Activity tracking over different periods

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Socket.IO** for real-time features
- **Cloudinary** for media storage
- **Express Validator** for input validation

### Frontend
- **React 18** with TypeScript
- **Material-UI** for modern UI components
- **React Router** for navigation
- **Axios** for API communication
- **Socket.IO Client** for real-time features
- **MUI X Charts** for data visualization

## 📁 Project Structure

```
mern-stack/
├── server.js                 # Main server file
├── package.json              # Backend dependencies
├── models/                   # MongoDB models
│   ├── User.js
│   ├── Post.js
│   ├── Comment.js
│   ├── Notification.js
│   ├── Message.js
│   └── Conversation.js
├── routes/                   # API routes
│   ├── auth.js
│   ├── users.js
│   ├── posts.js
│   ├── comments.js
│   ├── notifications.js
│   ├── messages.js
│   └── analytics.js
├── middleware/               # Custom middleware
│   └── auth.js
└── client/                   # React frontend
    ├── src/
    │   ├── components/       # Reusable components
    │   ├── contexts/         # React contexts
    │   ├── pages/            # Page components
    │   └── App.tsx
    └── package.json
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account
- Cloudinary account (for image uploads)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mern-stack
   ```

2. **Install backend dependencies**
   ```bash
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd client
   npm install
   cd ..
   ```

4. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/dev-social-platform
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRE=7d
   CLIENT_URL=http://localhost:3000
   CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
   CLOUDINARY_API_KEY=your-cloudinary-api-key
   CLOUDINARY_API_SECRET=your-cloudinary-api-secret
   ```

5. **Start the development servers**
   
   **Backend (Terminal 1):**
   ```bash
   npm run dev
   ```
   
   **Frontend (Terminal 2):**
   ```bash
   cd client
   npm start
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users/search` - Search users
- `GET /api/users/:username` - Get user profile
- `PUT /api/users/profile` - Update profile
- `POST /api/users/:userId/follow` - Follow user
- `DELETE /api/users/:userId/follow` - Unfollow user

### Posts
- `GET /api/posts` - Get all posts
- `GET /api/posts/feed` - Get personalized feed
- `GET /api/posts/:id` - Get single post
- `POST /api/posts` - Create post
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post
- `POST /api/posts/:id/like` - Like/unlike post

### Comments
- `GET /api/comments/post/:postId` - Get post comments
- `POST /api/comments` - Create comment
- `PUT /api/comments/:id` - Update comment
- `DELETE /api/comments/:id` - Delete comment

### Messages
- `GET /api/messages/conversations` - Get conversations
- `GET /api/messages/conversations/:id` - Get messages
- `POST /api/messages` - Send message

### Analytics
- `GET /api/analytics/dashboard` - Get dashboard data
- `GET /api/analytics/posts/:id` - Get post analytics

## 🔧 Configuration

### MongoDB Atlas Setup
1. Create a MongoDB Atlas cluster
2. Get your connection string
3. Update `MONGODB_URI` in `.env`

### Cloudinary Setup
1. Create a Cloudinary account
2. Get your cloud name, API key, and API secret
3. Update the Cloudinary variables in `.env`

## 🚀 Deployment

### Frontend (Vercel)
1. Push code to GitHub
2. Connect repository to Vercel
3. Set build command: `cd client && npm run build`
4. Set output directory: `client/build`

### Backend (Render/Heroku)
1. Create a new web service
2. Connect your GitHub repository
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Add environment variables

### Database (MongoDB Atlas)
- Already configured for cloud deployment
- Update connection string for production

## 🧪 Testing

Run tests with:
```bash
# Backend tests
npm test

# Frontend tests
cd client
npm test
```

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📞 Support

For support, email your-email@example.com or create an issue in the repository.

---

**Built with ❤️ using the MERN stack**
