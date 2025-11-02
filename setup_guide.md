# 🚀 YouTube Studio Clone - Setup Guide

## Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v14.0.0 or higher)
- **npm** (v6.0.0 or higher) or **yarn**
- A code editor (VS Code recommended)

## 📁 Project Structure

```
youtube-studio-clone/
├── backend/
│   ├── data/
│   │   ├── users.json
│   │   ├── videos.json
│   │   ├── analytics.json
│   │   └── comments.json
│   ├── uploads/
│   ├── server.js
│   ├── package.json
│   ├── .env
│   └── .env.example
└── frontend/
    ├── src/
    ├── public/
    └── package.json
```

## 🔧 Backend Setup

### Step 1: Install Dependencies

```bash
cd backend
npm install
```

This will install:
- express
- cors
- multer
- jsonwebtoken
- bcryptjs
- dotenv
- And other dependencies

### Step 2: Environment Configuration

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit `.env` file with your configuration:
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-here
CORS_ORIGIN=http://localhost:3000
```

**Important:** Change `JWT_SECRET` to a secure random string in production!

### Step 3: Initialize Data Files

The server automatically creates the `data/` directory and JSON files on first run. You can also manually create them:

```bash
mkdir data
mkdir uploads
```

Copy the sample JSON files provided:
- `data/users.json`
- `data/videos.json`
- `data/comments.json`
- `data/analytics.json` (can be empty: `{}`)

### Step 4: Start the Server

**Development mode with auto-restart:**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

You should see:
```
✅ Server running on http://localhost:5000
📁 Data directory: /path/to/data
🚀 API ready for requests
```

### Step 5: Test the API

Test the health endpoint:
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2024-11-03T10:00:00.000Z"
}
```

## 🎨 Frontend Setup

### Step 1: Install Dependencies

```bash
cd frontend
npm install
```

### Step 2: Configure API Endpoint

Create or edit `src/config.js`:
```javascript
export const API_BASE_URL = 'http://localhost:5000/api';
```

### Step 3: Start Frontend

```bash
npm start
```

The app will open at `http://localhost:3000`

## 🔐 Testing Authentication

### Register a New User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "channelName": "Test Channel"
  }'
```

### Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

Save the returned token for authenticated requests.

### Test Protected Endpoint

```bash
curl http://localhost:5000/api/videos \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 📤 Testing Video Upload

Using curl:
```bash
curl -X POST http://localhost:5000/api/videos/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "video=@/path/to/video.mp4" \
  -F "title=My Test Video" \
  -F "description=This is a test video" \
  -F "visibility=public" \
  -F "tags=test,tutorial"
```

Using Postman:
1. Set method to POST
2. URL: `http://localhost:5000/api/videos/upload`
3. Headers: `Authorization: Bearer YOUR_JWT_TOKEN`
4. Body: form-data
   - video: [file]
   - title: "My Test Video"
   - description: "Description"
   - visibility: "public"

## 🐛 Troubleshooting

### Port Already in Use

If port 5000 is taken:
```bash
# Change PORT in .env file
PORT=5001
```

### CORS Errors

Ensure `CORS_ORIGIN` in `.env` matches your frontend URL:
```env
CORS_ORIGIN=http://localhost:3000
```

### File Upload Errors

Check upload directory permissions:
```bash
chmod 755 uploads/
```

### JWT Token Errors

- Verify JWT_SECRET is set in `.env`
- Check token format: `Bearer <token>`
- Ensure token hasn't expired (7 day expiry)

## 🔒 Security Best Practices

### For Development
- Use `.env` for sensitive data
- Never commit `.env` to version control
- Use strong JWT secrets

### For Production
- Enable HTTPS
- Use environment variables
- Implement rate limiting
- Add input validation
- Enable helmet for security headers
- Use secure password hashing (already implemented)
- Implement CSRF protection
- Add logging and monitoring

## 📊 Database Migration (Optional)

To migrate from JSON to MongoDB:

1. Install MongoDB and Mongoose:
```bash
npm install mongoose
```

2. Update connection in `server.js`:
```javascript
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI);
```

3. Create Mongoose schemas for users, videos, comments

## 🚀 Deployment

### Deploy to Heroku

1. Install Heroku CLI
2. Login: `heroku login`
3. Create app: `heroku create youtube-studio-api`
4. Set environment variables:
```bash
heroku config:set JWT_SECRET=your-secret
heroku config:set NODE_ENV=production
```
5. Deploy: `git push heroku main`

### Deploy to AWS EC2

1. Launch EC2 instance
2. Install Node.js
3. Clone repository
4. Install dependencies
5. Use PM2 for process management:
```bash
npm install -g pm2
pm2 start server.js
pm2 save
```

### Deploy to Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Configure environment variables in Vercel dashboard

## 📈 Performance Optimization

- Add Redis for caching
- Implement CDN for video delivery
- Use database indexing
- Enable compression middleware
- Implement lazy loading
- Add pagination for large datasets

## 🧪 Running Tests

```bash
npm test
```

## 📝 Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests
- `npm run seed` - Seed database with sample data

## 🆘 Getting Help

- Check API documentation: `API_DOCUMENTATION.md`
- View error logs in console
- Check network tab in browser DevTools
- Review server logs for detailed errors

## ✅ Verification Checklist

- [ ] Node.js installed
- [ ] Dependencies installed
- [ ] `.env` file configured
- [ ] Data directory created
- [ ] Server starts without errors
- [ ] Health endpoint responds
- [ ] Can register new user
- [ ] Can login successfully
- [ ] Can fetch videos with token
- [ ] Frontend connects to backend
- [ ] CORS configured correctly

## 🎉 Success!

If all steps completed successfully, you should have:
- Backend API running on port 5000
- Frontend app running on port 3000
- Ability to register, login, and manage videos
- Full YouTube Studio clone functionality

Happy coding! 🚀