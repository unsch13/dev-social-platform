const express = require('express');
const Post = require('../models/Post');
const User = require('../models/User');
const Comment = require('../models/Comment');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/analytics/dashboard
// @desc    Get analytics dashboard data
// @access  Private
router.get('/dashboard', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { period = '30d' } = req.query;

    // Calculate date range based on period
    const now = new Date();
    let startDate;
    
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get user's posts in the period
    const userPosts = await Post.find({
      author: userId,
      createdAt: { $gte: startDate }
    });

    // Calculate engagement metrics
    const totalPosts = userPosts.length;
    const totalLikes = userPosts.reduce((sum, post) => sum + post.likes.length, 0);
    const totalComments = userPosts.reduce((sum, post) => sum + post.comments.length, 0);
    const totalViews = userPosts.reduce((sum, post) => sum + post.views, 0);
    const totalShares = userPosts.reduce((sum, post) => sum + post.shares.length, 0);

    // Calculate engagement rate
    const engagementRate = totalPosts > 0 ? 
      ((totalLikes + totalComments + totalShares) / totalPosts).toFixed(2) : 0;

    // Get top performing posts
    const topPosts = await Post.find({ author: userId })
      .sort({ 'engagement.totalLikes': -1, 'engagement.totalViews': -1 })
      .limit(5)
      .select('content images engagement createdAt');

    // Get follower growth over time
    const followerGrowth = await User.aggregate([
      { $match: { _id: userId } },
      { $unwind: '$followers' },
      { $lookup: {
        from: 'users',
        localField: 'followers',
        foreignField: '_id',
        as: 'followerData'
      }},
      { $unwind: '$followerData' },
      { $group: {
        _id: {
          year: { $year: '$followerData.createdAt' },
          month: { $month: '$followerData.createdAt' }
        },
        count: { $sum: 1 }
      }},
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Get posts by day for activity chart
    const postsByDay = await Post.aggregate([
      { $match: { author: userId, createdAt: { $gte: startDate } } },
      { $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        },
        count: { $sum: 1 },
        likes: { $sum: { $size: '$likes' } },
        comments: { $sum: { $size: '$comments' } },
        views: { $sum: '$views' }
      }},
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // Get most engaging tags
    const tagEngagement = await Post.aggregate([
      { $match: { author: userId, createdAt: { $gte: startDate } } },
      { $unwind: '$tags' },
      { $group: {
        _id: '$tags',
        count: { $sum: 1 },
        totalLikes: { $sum: { $size: '$likes' } },
        totalComments: { $sum: { $size: '$comments' } },
        totalViews: { $sum: '$views' }
      }},
      { $sort: { totalLikes: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      overview: {
        totalPosts,
        totalLikes,
        totalComments,
        totalViews,
        totalShares,
        engagementRate: parseFloat(engagementRate)
      },
      topPosts,
      followerGrowth,
      postsByDay,
      tagEngagement,
      period
    });
  } catch (error) {
    console.error('Analytics dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/analytics/posts/:postId
// @desc    Get analytics for a specific post
// @access  Private
router.get('/posts/:postId', auth, async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(postId)
      .populate('likes', 'username firstName lastName avatar')
      .populate({
        path: 'comments',
        populate: {
          path: 'author',
          select: 'username firstName lastName avatar'
        }
      })
      .populate('shares', 'username firstName lastName avatar');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.author.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to view analytics for this post' });
    }

    // Get view analytics by day
    const viewAnalytics = await Post.aggregate([
      { $match: { _id: post._id } },
      { $unwind: '$views' },
      { $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        },
        views: { $sum: 1 }
      }},
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // Get engagement timeline
    const engagementTimeline = await Post.aggregate([
      { $match: { _id: post._id } },
      { $unwind: '$likes' },
      { $lookup: {
        from: 'users',
        localField: 'likes',
        foreignField: '_id',
        as: 'likeUser'
      }},
      { $unwind: '$likeUser' },
      { $group: {
        _id: {
          year: { $year: '$likeUser.createdAt' },
          month: { $month: '$likeUser.createdAt' },
          day: { $dayOfMonth: '$likeUser.createdAt' }
        },
        likes: { $sum: 1 }
      }},
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    res.json({
      post: {
        _id: post._id,
        content: post.content,
        images: post.images,
        tags: post.tags,
        createdAt: post.createdAt,
        engagement: post.engagement
      },
      likes: post.likes,
      comments: post.comments,
      shares: post.shares,
      viewAnalytics,
      engagementTimeline
    });
  } catch (error) {
    console.error('Post analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/analytics/profile
// @desc    Get profile analytics
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { period = '30d' } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate;
    
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const user = await User.findById(userId)
      .populate('followers', 'username firstName lastName avatar createdAt')
      .populate('following', 'username firstName lastName avatar createdAt');

    // Get profile views (this would need to be implemented separately)
    const profileViews = 0; // Placeholder

    // Get follower demographics
    const followerDemographics = await User.aggregate([
      { $match: { _id: userId } },
      { $unwind: '$followers' },
      { $lookup: {
        from: 'users',
        localField: 'followers',
        foreignField: '_id',
        as: 'followerData'
      }},
      { $unwind: '$followerData' },
      { $group: {
        _id: null,
        totalFollowers: { $sum: 1 },
        avgFollowers: { $avg: { $size: '$followerData.followers' } },
        avgFollowing: { $avg: { $size: '$followerData.following' } }
      }}
    ]);

    res.json({
      profile: {
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        bio: user.bio,
        skills: user.skills,
        followersCount: user.followers.length,
        followingCount: user.following.length,
        createdAt: user.createdAt
      },
      followers: user.followers,
      following: user.following,
      followerDemographics: followerDemographics[0] || {},
      profileViews,
      period
    });
  } catch (error) {
    console.error('Profile analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
