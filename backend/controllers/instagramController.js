const axios = require('axios');

// In-memory cache for live Instagram posts
let apiCache = {
  data: null,
  timestamp: 0
};
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

// Default mock posts fallback
const defaultMockPosts = [
  {
    _id: "mock1",
    src: '/a.png',
    caption: '💪 Fuel Your Legacy! Clean Whey delivering real results every session. #ELMEN #FuelYourLegacy',
    likes: 1284,
    comments: 47,
    handle: '@elmen_india',
    permalink: 'https://instagram.com/elmen_india'
  },
  {
    _id: "mock2",
    src: '/b.png',
    caption: '🔥 Unstoppable energy with Hunter Pre-Workout. Don\'t train without it. #PreWorkout #HunterMode',
    likes: 986,
    comments: 38,
    handle: '@elmen_india',
    permalink: 'https://instagram.com/elmen_india'
  },
  {
    _id: "mock3",
    src: '/c.png',
    caption: '🏆 Premium quality, real ingredients. Because you deserve the best. #NutritionGoals #ELMEN',
    likes: 2103,
    comments: 64,
    handle: '@elmen_india',
    permalink: 'https://instagram.com/elmen_india'
  },
  {
    _id: "mock4",
    src: '/d.png',
    caption: '⚡ Power, performance, and recovery — all in one stack. Shop the range now! #Gainz',
    likes: 1542,
    comments: 53,
    handle: '@elmen_india',
    permalink: 'https://instagram.com/elmen_india'
  },
  {
    _id: "mock5",
    src: '/aa.png',
    caption: '🌟 Your transformation starts here. Every rep counts. Every meal matters. #StrengthJourney',
    likes: 3218,
    comments: 92,
    handle: '@elmen_india',
    permalink: 'https://instagram.com/elmen_india'
  }
];

// Helper to generate deterministic-looking likes/comments for live posts
function generatePostStats(postId) {
  let hash = 0;
  const idStr = String(postId);
  for (let i = 0; i < idStr.length; i++) {
    hash = idStr.charCodeAt(i) + ((hash << 5) - hash);
  }
  const likes = Math.abs(hash % 1500) + 400; // between 400 and 1900
  const comments = Math.abs(hash % 120) + 15;  // between 15 and 135
  return { likes, comments };
}

// @desc    Get Instagram posts (Live API or Fallback)
// @route   GET /api/instagram
// @access  Public
const getInstagramPosts = async (req, res) => {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;

  // 1. If Token exists, try to fetch from Instagram API
  if (token) {
    const now = Date.now();
    if (apiCache.data && (now - apiCache.timestamp < CACHE_DURATION)) {
      return res.json({
        success: true,
        source: 'api', // API cache is still API sourced
        posts: apiCache.data
      });
    }

    try {
      const response = await axios.get('https://graph.instagram.com/me/media', {
        params: {
          fields: 'id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,username',
          access_token: token
        }
      });

      if (response.data && response.data.data) {
        // Filter and map the latest 6 posts
        const posts = response.data.data
          .filter(item => item.media_type === 'IMAGE' || item.media_type === 'CAROUSEL_ALBUM' || item.media_type === 'VIDEO')
          .slice(0, 5)
          .map(item => {
            const stats = generatePostStats(item.id);
            return {
              _id: item.id,
              src: item.media_type === 'VIDEO' ? (item.thumbnail_url || item.media_url) : item.media_url,
              caption: item.caption || '',
              likes: stats.likes,
              comments: stats.comments,
              permalink: item.permalink || 'https://instagram.com/elmen_india',
              handle: item.username ? `@${item.username}` : '@elmen_india'
            };
          });

        // Save to cache
        apiCache = {
          data: posts,
          timestamp: now
        };

        return res.json({
          success: true,
          source: 'api',
          posts
        });
      }
    } catch (error) {
      console.error('Error fetching from Instagram API:', error.response?.data || error.message);
      // Fall through to mock fallback on error
    }
  }

  // 2. Fallback to mock data
  return res.json({
    success: true,
    source: 'fallback',
    posts: defaultMockPosts
  });
};

module.exports = {
  getInstagramPosts
};
