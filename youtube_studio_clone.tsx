import React, { useState, useEffect } from 'react';
import { BarChart3, Video, TrendingUp, Users, Eye, ThumbsUp, MessageSquare, DollarSign, Upload, Settings, Home, PlayCircle, Clock, CheckCircle, XCircle, MoreVertical, Search, Bell, Menu, X } from 'lucide-react';

const YouTubeStudio = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [videos, setVideos] = useState([
    {
      id: 1,
      title: 'How to Build a React App in 2024',
      thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=225&fit=crop',
      views: 45230,
      likes: 3421,
      comments: 234,
      duration: '12:34',
      uploadDate: '2024-10-15',
      status: 'published',
      visibility: 'public'
    },
    {
      id: 2,
      title: 'JavaScript Tips & Tricks You Need to Know',
      thumbnail: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=400&h=225&fit=crop',
      views: 28901,
      likes: 2156,
      comments: 145,
      duration: '8:45',
      uploadDate: '2024-10-20',
      status: 'published',
      visibility: 'public'
    },
    {
      id: 3,
      title: 'CSS Grid Layout Complete Guide',
      thumbnail: 'https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?w=400&h=225&fit=crop',
      views: 12456,
      likes: 987,
      comments: 67,
      duration: '15:22',
      uploadDate: '2024-10-25',
      status: 'processing',
      visibility: 'unlisted'
    },
    {
      id: 4,
      title: 'Web Development Roadmap 2024',
      thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=225&fit=crop',
      views: 67823,
      likes: 5432,
      comments: 432,
      duration: '20:15',
      uploadDate: '2024-10-10',
      status: 'published',
      visibility: 'public'
    }
  ]);

  const [analytics, setAnalytics] = useState({
    totalViews: 154410,
    totalSubscribers: 45230,
    totalRevenue: 1234.56,
    avgViewDuration: '8:23',
    viewsGrowth: 12.5,
    subscribersGrowth: 8.3
  });

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const StatCard = ({ icon: Icon, title, value, growth, color }) => (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {growth && (
          <span className={`text-sm font-semibold ${growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {growth > 0 ? '+' : ''}{growth}%
          </span>
        )}
      </div>
      <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
  );

  const VideoCard = ({ video }) => (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden cursor-pointer"
         onClick={() => setSelectedVideo(video)}>
      <div className="relative">
        <img src={video.thumbnail} alt={video.title} className="w-full h-48 object-cover" />
        <span className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white text-xs px-2 py-1 rounded">
          {video.duration}
        </span>
        {video.status === 'processing' && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <Clock className="w-8 h-8 text-white animate-pulse" />
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{video.title}</h3>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            {formatNumber(video.views)}
          </span>
          <span className="flex items-center gap-1">
            <ThumbsUp className="w-4 h-4" />
            {formatNumber(video.likes)}
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare className="w-4 h-4" />
            {video.comments}
          </span>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-gray-500">{formatDate(video.uploadDate)}</span>
          <span className={`text-xs px-2 py-1 rounded-full ${
            video.status === 'published' ? 'bg-green-100 text-green-800' : 
            video.status === 'processing' ? 'bg-yellow-100 text-yellow-800' : 
            'bg-gray-100 text-gray-800'
          }`}>
            {video.status}
          </span>
        </div>
      </div>
    </div>
  );

  const UploadModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Upload Video</h2>
          <button onClick={() => setUploadModalOpen(false)} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center mb-6 hover:border-blue-500 transition-colors cursor-pointer">
          <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Select files to upload</h3>
          <p className="text-sm text-gray-500">Or drag and drop video files</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Enter video title" />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" rows="4" placeholder="Tell viewers about your video"></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Visibility</label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option>Public</option>
              <option>Unlisted</option>
              <option>Private</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button onClick={() => setUploadModalOpen(false)} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Upload
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard 
                icon={Eye} 
                title="Total Views" 
                value={formatNumber(analytics.totalViews)} 
                growth={analytics.viewsGrowth}
                color="bg-blue-500"
              />
              <StatCard 
                icon={Users} 
                title="Subscribers" 
                value={formatNumber(analytics.totalSubscribers)} 
                growth={analytics.subscribersGrowth}
                color="bg-red-500"
              />
              <StatCard 
                icon={DollarSign} 
                title="Revenue" 
                value={`$${analytics.totalRevenue.toFixed(2)}`}
                color="bg-green-500"
              />
              <StatCard 
                icon={Clock} 
                title="Avg View Duration" 
                value={analytics.avgViewDuration}
                color="bg-purple-500"
              />
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Channel Analytics</h2>
              <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                <BarChart3 className="w-16 h-16 text-gray-400" />
                <span className="ml-3 text-gray-500">Analytics Chart Placeholder</span>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Recent Videos</h2>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">View All</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.slice(0, 3).map(video => (
                  <VideoCard key={video.id} video={video} />
                ))}
              </div>
            </div>
          </div>
        );

      case 'content':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">Channel Content</h1>
              <button onClick={() => setUploadModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Upload className="w-5 h-5" />
                Create
              </button>
            </div>

            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="Search videos..." 
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option>All</option>
                    <option>Published</option>
                    <option>Processing</option>
                    <option>Draft</option>
                  </select>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {videos.map(video => (
                    <VideoCard key={video.id} video={video} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'analytics':
        return (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Channel Analytics</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard 
                icon={Eye} 
                title="Views (Last 28 Days)" 
                value={formatNumber(45230)} 
                growth={12.5}
                color="bg-blue-500"
              />
              <StatCard 
                icon={Clock} 
                title="Watch Time (Hours)" 
                value="3,421" 
                growth={8.2}
                color="bg-purple-500"
              />
              <StatCard 
                icon={Users} 
                title="Subscribers Gained" 
                value="+1,234" 
                growth={15.3}
                color="bg-red-500"
              />
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Views Over Time</h2>
              <div className="h-80 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                <TrendingUp className="w-16 h-16 text-gray-400" />
                <span className="ml-3 text-gray-500">Detailed Analytics Chart</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Top Videos</h2>
                <div className="space-y-3">
                  {videos.slice(0, 3).map((video, index) => (
                    <div key={video.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg">
                      <span className="text-lg font-bold text-gray-400">{index + 1}</span>
                      <img src={video.thumbnail} alt={video.title} className="w-24 h-14 object-cover rounded" />
                      <div className="flex-1">
                        <h3 className="font-medium text-sm text-gray-900 line-clamp-1">{video.title}</h3>
                        <p className="text-xs text-gray-500">{formatNumber(video.views)} views</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Traffic Sources</h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">YouTube Search</span>
                    <span className="text-sm font-bold text-gray-900">45.2%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Suggested Videos</span>
                    <span className="text-sm font-bold text-gray-900">28.7%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">External</span>
                    <span className="text-sm font-bold text-gray-900">15.3%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Browse Features</span>
                    <span className="text-sm font-bold text-gray-900">10.8%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden">
              <Menu className="w-6 h-6 text-gray-700" />
            </button>
            <div className="flex items-center gap-2">
              <PlayCircle className="w-8 h-8 text-red-600" />
              <span className="text-xl font-bold text-gray-900">Studio</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <Bell className="w-6 h-6 text-gray-700" />
            </button>
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
              YC
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transition-transform duration-300 mt-[57px] lg:mt-0`}>
          <nav className="p-4 space-y-2">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'dashboard' ? 'bg-red-50 text-red-600' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              <Home className="w-5 h-5" />
              <span className="font-medium">Dashboard</span>
            </button>
            
            <button 
              onClick={() => setActiveTab('content')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'content' ? 'bg-red-50 text-red-600' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              <Video className="w-5 h-5" />
              <span className="font-medium">Content</span>
            </button>
            
            <button 
              onClick={() => setActiveTab('analytics')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'analytics' ? 'bg-red-50 text-red-600' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              <BarChart3 className="w-5 h-5" />
              <span className="font-medium">Analytics</span>
            </button>
            
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
              <MessageSquare className="w-5 h-5" />
              <span className="font-medium">Comments</span>
            </button>
            
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
              <DollarSign className="w-5 h-5" />
              <span className="font-medium">Monetization</span>
            </button>
            
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
              <Settings className="w-5 h-5" />
              <span className="font-medium">Settings</span>
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8">
          {renderContent()}
        </main>
      </div>

      {/* Upload Modal */}
      {uploadModalOpen && <UploadModal />}

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-20 mt-[57px]" 
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default YouTubeStudio;