# 🧪 DevSocial Testing Guide

## ✅ Current Status
- **Backend Server**: ✅ Running on http://localhost:5000
- **Database**: ✅ Connected to MongoDB Atlas
- **Frontend**: 🔄 Starting React development server

## 🚀 How to Test Your Application

### 1. **Backend API Testing**

#### Test Basic Server
```bash
# Check if server is running
curl http://localhost:5000
# Expected: {"message":"DevSocial API is running!","status":"success",...}

# Health check
curl http://localhost:5000/health
# Expected: {"status":"healthy","uptime":...,"memory":{...}}
```

#### Test User Registration
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'
```

#### Test User Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 2. **Frontend Testing**

#### Start React Development Server
```bash
cd client
npm start
```
- Should open automatically at http://localhost:3000
- If not, manually navigate to http://localhost:3000

#### Test Frontend Features
1. **Home Page**: Should show welcome message and status
2. **Registration**: Try creating a new account
3. **Login**: Test with the account you created
4. **Profile**: View and edit your profile
5. **Posts**: Create, view, like, and comment on posts

### 3. **API Endpoints Testing**

#### Authentication Endpoints
- `GET /api/auth/me` - Get current user (requires token)
- `POST /api/auth/refresh` - Refresh JWT token

#### User Endpoints
- `GET /api/users/search?q=username` - Search users
- `GET /api/users/:username` - Get user profile
- `PUT /api/users/profile` - Update profile
- `POST /api/users/:userId/follow` - Follow user
- `DELETE /api/users/:userId/follow` - Unfollow user

#### Post Endpoints
- `GET /api/posts` - Get all posts
- `GET /api/posts/feed` - Get personalized feed
- `GET /api/posts/:id` - Get single post
- `POST /api/posts` - Create post
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post
- `POST /api/posts/:id/like` - Like/unlike post

#### Comment Endpoints
- `GET /api/comments/post/:postId` - Get post comments
- `POST /api/comments` - Create comment
- `PUT /api/comments/:id` - Update comment
- `DELETE /api/comments/:id` - Delete comment

#### Message Endpoints
- `GET /api/messages/conversations` - Get conversations
- `GET /api/messages/conversations/:id` - Get messages
- `POST /api/messages` - Send message

#### Analytics Endpoints
- `GET /api/analytics/dashboard` - Get dashboard data
- `GET /api/analytics/posts/:id` - Get post analytics

### 4. **Manual Testing Scenarios**

#### Scenario 1: User Registration & Login
1. Register a new user
2. Login with credentials
3. Verify JWT token is received
4. Test protected routes

#### Scenario 2: Profile Management
1. Update profile information
2. Add skills and social links
3. Upload profile picture
4. View public profile

#### Scenario 3: Social Features
1. Search for other users
2. Follow/unfollow users
3. View followers and following lists
4. Test user discovery

#### Scenario 4: Post Creation & Interaction
1. Create a text post
2. Add images to post
3. Use hashtags
4. Like and comment on posts
5. Share posts

#### Scenario 5: Real-time Features
1. Open multiple browser tabs
2. Test real-time notifications
3. Send direct messages
4. Verify Socket.IO connection

#### Scenario 6: Analytics
1. Create multiple posts
2. Generate engagement data
3. View analytics dashboard
4. Check charts and metrics

### 5. **Browser Testing**

#### Test in Different Browsers
- Chrome
- Firefox
- Safari
- Edge

#### Test Responsive Design
- Desktop (1920x1080)
- Tablet (768x1024)
- Mobile (375x667)

### 6. **Error Testing**

#### Test Error Handling
1. Invalid login credentials
2. Duplicate email registration
3. Invalid JWT tokens
4. Network connectivity issues
5. File upload errors

### 7. **Performance Testing**

#### Test Load Times
1. Page load speeds
2. API response times
3. Image upload performance
4. Real-time message delivery

## 🔧 Troubleshooting

### Common Issues

#### Backend Issues
- **Port 5000 in use**: Change PORT in .env file
- **MongoDB connection failed**: Check connection string
- **JWT errors**: Verify JWT_SECRET is set

#### Frontend Issues
- **Port 3000 in use**: React will suggest alternative port
- **Build errors**: Check for TypeScript errors
- **API calls failing**: Verify backend is running

#### Database Issues
- **Connection timeout**: Check MongoDB Atlas whitelist
- **Authentication failed**: Verify database credentials

## 📊 Testing Checklist

- [ ] Backend server starts successfully
- [ ] Database connection established
- [ ] Frontend loads without errors
- [ ] User registration works
- [ ] User login works
- [ ] Profile creation/editing works
- [ ] Post creation works
- [ ] Image upload works
- [ ] Like/comment functionality works
- [ ] Follow/unfollow works
- [ ] Search functionality works
- [ ] Real-time notifications work
- [ ] Direct messaging works
- [ ] Analytics dashboard loads
- [ ] Responsive design works
- [ ] Error handling works

## 🎯 Next Steps After Testing

1. **Fix any bugs found during testing**
2. **Add more test cases**
3. **Optimize performance**
4. **Deploy to production**
5. **Set up monitoring and logging**

---

**Happy Testing! 🚀**
