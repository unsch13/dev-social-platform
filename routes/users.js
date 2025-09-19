const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Post = require('../models/Post');
const { auth, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users/search
// @desc    Search users
// @access  Public
router.get('/search', optionalAuth, async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.status(400).json({ message: 'Search query must be at least 2 characters' });
    }

    const searchRegex = new RegExp(q.trim(), 'i');
    const skip = (page - 1) * limit;

    const users = await User.find({
      $and: [
        { isActive: true },
        {
          $or: [
            { username: searchRegex },
            { firstName: searchRegex },
            { lastName: searchRegex },
            { skills: { $in: [searchRegex] } }
          ]
        }
      ]
    })
    .select('username firstName lastName avatar bio skills followers')
    .skip(skip)
    .limit(parseInt(limit))
    .sort({ followers: -1 });

    const total = await User.countDocuments({
      $and: [
        { isActive: true },
        {
          $or: [
            { username: searchRegex },
            { firstName: searchRegex },
            { lastName: searchRegex },
            { skills: { $in: [searchRegex] } }
          ]
        }
      ]
    });

    res.json({
      users: users.map(user => ({
        _id: user._id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        bio: user.bio,
        skills: user.skills,
        followersCount: user.followers.length
      })),
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('User search error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/:username
// @desc    Get user profile by username
// @access  Public
router.get('/:username', optionalAuth, async (req, res) => {
  try {
    const { username } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const user = await User.findOne({ username, isActive: true })
      .populate('followers', 'username firstName lastName avatar')
      .populate('following', 'username firstName lastName avatar');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's posts
    const skip = (page - 1) * limit;
    const posts = await Post.find({ author: user._id, isPublic: true })
      .populate('author', 'username firstName lastName avatar')
      .populate('comments', 'author content createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalPosts = await Post.countDocuments({ author: user._id, isPublic: true });

    // Check if current user follows this user
    let isFollowing = false;
    if (req.user) {
      isFollowing = user.followers.some(follower => 
        follower._id.toString() === req.user._id.toString()
      );
    }

    res.json({
      user: {
        ...user.getPublicProfile(),
        followers: user.followers.map(f => ({
          _id: f._id,
          username: f.username,
          firstName: f.firstName,
          lastName: f.lastName,
          avatar: f.avatar
        })),
        following: user.following.map(f => ({
          _id: f._id,
          username: f.username,
          firstName: f.firstName,
          lastName: f.lastName,
          avatar: f.avatar
        }))
      },
      posts,
      isFollowing,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(totalPosts / limit),
        total: totalPosts
      }
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, [
  body('firstName').optional().trim().isLength({ min: 1 }),
  body('lastName').optional().trim().isLength({ min: 1 }),
  body('bio').optional().isLength({ max: 500 }),
  body('skills').optional().isArray(),
  body('githubUrl').optional().isURL(),
  body('linkedinUrl').optional().isURL(),
  body('websiteUrl').optional().isURL()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      firstName,
      lastName,
      bio,
      skills,
      githubUrl,
      linkedinUrl,
      websiteUrl,
      avatar
    } = req.body;

    const updateData = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (bio !== undefined) updateData.bio = bio;
    if (skills !== undefined) updateData.skills = skills;
    if (githubUrl !== undefined) updateData.githubUrl = githubUrl;
    if (linkedinUrl !== undefined) updateData.linkedinUrl = linkedinUrl;
    if (websiteUrl !== undefined) updateData.websiteUrl = websiteUrl;
    if (avatar !== undefined) updateData.avatar = avatar;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Profile updated successfully',
      user: user.getPublicProfile()
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/users/:userId/follow
// @desc    Follow a user
// @access  Private
router.post('/:userId/follow', auth, async (req, res) => {
  try {
    const { userId } = req.params;

    if (userId === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot follow yourself' });
    }

    const userToFollow = await User.findById(userId);
    if (!userToFollow) {
      return res.status(404).json({ message: 'User not found' });
    }

    const currentUser = await User.findById(req.user._id);

    // Check if already following
    if (currentUser.following.includes(userId)) {
      return res.status(400).json({ message: 'Already following this user' });
    }

    // Add to following and followers
    currentUser.following.push(userId);
    userToFollow.followers.push(req.user._id);

    await Promise.all([currentUser.save(), userToFollow.save()]);

    res.json({
      message: 'Successfully followed user',
      followersCount: userToFollow.followers.length
    });
  } catch (error) {
    console.error('Follow user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/users/:userId/follow
// @desc    Unfollow a user
// @access  Private
router.delete('/:userId/follow', auth, async (req, res) => {
  try {
    const { userId } = req.params;

    const userToUnfollow = await User.findById(userId);
    if (!userToUnfollow) {
      return res.status(404).json({ message: 'User not found' });
    }

    const currentUser = await User.findById(req.user._id);

    // Remove from following and followers
    currentUser.following = currentUser.following.filter(
      id => id.toString() !== userId
    );
    userToUnfollow.followers = userToUnfollow.followers.filter(
      id => id.toString() !== req.user._id.toString()
    );

    await Promise.all([currentUser.save(), userToUnfollow.save()]);

    res.json({
      message: 'Successfully unfollowed user',
      followersCount: userToUnfollow.followers.length
    });
  } catch (error) {
    console.error('Unfollow user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/:userId/followers
// @desc    Get user's followers
// @access  Public
router.get('/:userId/followers', async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const user = await User.findById(userId)
      .populate({
        path: 'followers',
        select: 'username firstName lastName avatar bio',
        options: {
          skip: (page - 1) * limit,
          limit: parseInt(limit)
        }
      });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      followers: user.followers,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(user.followers.length / limit),
        total: user.followers.length
      }
    });
  } catch (error) {
    console.error('Get followers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/:userId/following
// @desc    Get users that this user follows
// @access  Public
router.get('/:userId/following', async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const user = await User.findById(userId)
      .populate({
        path: 'following',
        select: 'username firstName lastName avatar bio',
        options: {
          skip: (page - 1) * limit,
          limit: parseInt(limit)
        }
      });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      following: user.following,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(user.following.length / limit),
        total: user.following.length
      }
    });
  } catch (error) {
    console.error('Get following error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
