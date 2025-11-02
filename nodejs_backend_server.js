const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// File paths
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const VIDEOS_FILE = path.join(DATA_DIR, 'videos.json');
const ANALYTICS_FILE = path.join(DATA_DIR, 'analytics.json');
const COMMENTS_FILE = path.join(DATA_DIR, 'comments.json');

// Ensure data directory exists
const initializeDataFiles = async () => {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.mkdir('uploads', { recursive: true });
    
    const files = [
      { path: USERS_FILE, default: [] },
      { path: VIDEOS_FILE, default: [] },
      { path: ANALYTICS_FILE, default: {} },
      { path: COMMENTS_FILE, default: [] }
    ];

    for (const file of files) {
      try {
        await fs.access(file.path);
      } catch {
        await fs.writeFile(file.path, JSON.stringify(file.default, null, 2));
      }
    }
  } catch (error) {
    console.error('Error initializing data files:', error);
  }
};

// Helper functions for file operations
const readJSON = async (filePath) => {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return null;
  }
};

const writeJSON = async (filePath, data) => {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error);
    return false;
  }
};

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only video files are allowed.'));
    }
  }
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// ============= AUTH ROUTES =============

// Register new user
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password, channelName } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const users = await readJSON(USERS_FILE);
    
    if (users.find(u => u.email === email)) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: Date.now().toString(),
      username,
      email,
      password: hashedPassword,
      channelName: channelName || username,
      createdAt: new Date().toISOString(),
      subscribers: 0,
      totalViews: 0
    };

    users.push(newUser);
    await writeJSON(USERS_FILE, users);

    const token = jwt.sign({ id: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: '7d' });
    
    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json({ user: userWithoutPassword, token });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed', details: error.message });
  }
});

// Login user
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const users = await readJSON(USERS_FILE);
    const user = users.find(u => u.email === email);

    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    
    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword, token });
  } catch (error) {
    res.status(500).json({ error: 'Login failed', details: error.message });
  }
});

// ============= VIDEO ROUTES =============

// Get all videos for authenticated user
app.get('/api/videos', authenticateToken, async (req, res) => {
  try {
    const videos = await readJSON(VIDEOS_FILE);
    const userVideos = videos.filter(v => v.userId === req.user.id);
    res.json(userVideos);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch videos', details: error.message });
  }
});

// Get single video
app.get('/api/videos/:id', authenticateToken, async (req, res) => {
  try {
    const videos = await readJSON(VIDEOS_FILE);
    const video = videos.find(v => v.id === req.params.id && v.userId === req.user.id);
    
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }
    
    res.json(video);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch video', details: error.message });
  }
});

// Upload new video
app.post('/api/videos/upload', authenticateToken, upload.single('video'), async (req, res) => {
  try {
    const { title, description, visibility, tags } = req.body;

    if (!title || !req.file) {
      return res.status(400).json({ error: 'Title and video file are required' });
    }

    const videos = await readJSON(VIDEOS_FILE);
    
    const newVideo = {
      id: Date.now().toString(),
      userId: req.user.id,
      title,
      description: description || '',
      videoUrl: `/uploads/${req.file.filename}`,
      thumbnail: `/uploads/default-thumbnail.jpg`,
      visibility: visibility || 'public',
      tags: tags ? tags.split(',').map(t => t.trim()) : [],
      views: 0,
      likes: 0,
      dislikes: 0,
      comments: 0,
      duration: '00:00',
      uploadDate: new Date().toISOString(),
      status: 'processing',
      category: 'Education'
    };

    videos.push(newVideo);
    await writeJSON(VIDEOS_FILE, videos);

    // Simulate processing
    setTimeout(async () => {
      const updatedVideos = await readJSON(VIDEOS_FILE);
      const videoIndex = updatedVideos.findIndex(v => v.id === newVideo.id);
      if (videoIndex !== -1) {
        updatedVideos[videoIndex].status = 'published';
        await writeJSON(VIDEOS_FILE, updatedVideos);
      }
    }, 5000);

    res.status(201).json(newVideo);
  } catch (error) {
    res.status(500).json({ error: 'Upload failed', details: error.message });
  }
});

// Update video
app.put('/api/videos/:id', authenticateToken, async (req, res) => {
  try {
    const videos = await readJSON(VIDEOS_FILE);
    const videoIndex = videos.findIndex(v => v.id === req.params.id && v.userId === req.user.id);

    if (videoIndex === -1) {
      return res.status(404).json({ error: 'Video not found' });
    }

    videos[videoIndex] = { ...videos[videoIndex], ...req.body, updatedAt: new Date().toISOString() };
    await writeJSON(VIDEOS_FILE, videos);

    res.json(videos[videoIndex]);
  } catch (error) {
    res.status(500).json({ error: 'Update failed', details: error.message });
  }
});

// Delete video
app.delete('/api/videos/:id', authenticateToken, async (req, res) => {
  try {
    const videos = await readJSON(VIDEOS_FILE);
    const videoIndex = videos.findIndex(v => v.id === req.params.id && v.userId === req.user.id);

    if (videoIndex === -1) {
      return res.status(404).json({ error: 'Video not found' });
    }

    videos.splice(videoIndex, 1);
    await writeJSON(VIDEOS_FILE, videos);

    res.json({ message: 'Video deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Delete failed', details: error.message });
  }
});

// ============= ANALYTICS ROUTES =============

// Get channel analytics
app.get('/api/analytics', authenticateToken, async (req, res) => {
  try {
    const videos = await readJSON(VIDEOS_FILE);
    const userVideos = videos.filter(v => v.userId === req.user.id);

    const totalViews = userVideos.reduce((sum, v) => sum + v.views, 0);
    const totalLikes = userVideos.reduce((sum, v) => sum + v.likes, 0);
    const totalComments = userVideos.reduce((sum, v) => sum + v.comments, 0);

    const analytics = {
      totalViews,
      totalLikes,
      totalComments,
      totalVideos: userVideos.length,
      avgViews: userVideos.length > 0 ? Math.round(totalViews / userVideos.length) : 0,
      topVideos: userVideos.sort((a, b) => b.views - a.views).slice(0, 5),
      recentActivity: userVideos.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate)).slice(0, 10)
    };

    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analytics', details: error.message });
  }
});

// Get video-specific analytics
app.get('/api/analytics/video/:id', authenticateToken, async (req, res) => {
  try {
    const videos = await readJSON(VIDEOS_FILE);
    const video = videos.find(v => v.id === req.params.id && v.userId === req.user.id);

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    const analytics = {
      views: video.views,
      likes: video.likes,
      dislikes: video.dislikes,
      comments: video.comments,
      engagement: video.views > 0 ? ((video.likes + video.comments) / video.views * 100).toFixed(2) : 0,
      viewsGrowth: Math.floor(Math.random() * 30) - 10, // Simulated data
      likesGrowth: Math.floor(Math.random() * 20) - 5
    };

    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch video analytics', details: error.message });
  }
});

// ============= COMMENTS ROUTES =============

// Get comments for a video
app.get('/api/comments/:videoId', async (req, res) => {
  try {
    const comments = await readJSON(COMMENTS_FILE);
    const videoComments = comments.filter(c => c.videoId === req.params.videoId);
    res.json(videoComments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch comments', details: error.message });
  }
});

// Add comment to video
app.post('/api/comments', authenticateToken, async (req, res) => {
  try {
    const { videoId, text } = req.body;

    if (!videoId || !text) {
      return res.status(400).json({ error: 'Video ID and comment text are required' });
    }

    const comments = await readJSON(COMMENTS_FILE);
    const videos = await readJSON(VIDEOS_FILE);

    const newComment = {
      id: Date.now().toString(),
      videoId,
      userId: req.user.id,
      text,
      likes: 0,
      replies: [],
      createdAt: new Date().toISOString()
    };

    comments.push(newComment);
    await writeJSON(COMMENTS_FILE, comments);

    // Update video comment count
    const videoIndex = videos.findIndex(v => v.id === videoId);
    if (videoIndex !== -1) {
      videos[videoIndex].comments++;
      await writeJSON(VIDEOS_FILE, videos);
    }

    res.status(201).json(newComment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add comment', details: error.message });
  }
});

// Delete comment
app.delete('/api/comments/:id', authenticateToken, async (req, res) => {
  try {
    const comments = await readJSON(COMMENTS_FILE);
    const commentIndex = comments.findIndex(c => c.id === req.params.id && c.userId === req.user.id);

    if (commentIndex === -1) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    comments.splice(commentIndex, 1);
    await writeJSON(COMMENTS_FILE, comments);

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete comment', details: error.message });
  }
});

// ============= DASHBOARD ROUTES =============

// Get dashboard summary
app.get('/api/dashboard', authenticateToken, async (req, res) => {
  try {
    const videos = await readJSON(VIDEOS_FILE);
    const users = await readJSON(USERS_FILE);
    
    const userVideos = videos.filter(v => v.userId === req.user.id);
    const user = users.find(u => u.id === req.user.id);

    const last28Days = new Date(Date.now() - 28 * 24 * 60 * 60 * 1000);
    const recentVideos = userVideos.filter(v => new Date(v.uploadDate) > last28Days);

    const dashboard = {
      channelInfo: {
        name: user?.channelName,
        subscribers: user?.subscribers || 0,
        totalViews: userVideos.reduce((sum, v) => sum + v.views, 0)
      },
      last28Days: {
        views: recentVideos.reduce((sum, v) => sum + v.views, 0),
        newSubscribers: Math.floor(Math.random() * 100),
        watchTime: Math.floor(Math.random() * 10000),
        revenue: (Math.random() * 500).toFixed(2)
      },
      topVideos: userVideos.sort((a, b) => b.views - a.views).slice(0, 5),
      recentUploads: userVideos.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate)).slice(0, 5)
    };

    res.json(dashboard);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dashboard', details: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!', details: err.message });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Initialize and start server
const startServer = async () => {
  await initializeDataFiles();
  app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`📁 Data directory: ${DATA_DIR}`);
    console.log(`🚀 API ready for requests`);
  });
};

startServer();