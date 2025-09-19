const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { body, validationResult } = require('express-validator');
const Post = require('../models/Post');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { auth, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// @route   GET /api/posts
// @desc    Get all posts (feed)
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = 'recent' } = req.query;
    const skip = (page - 1) * limit;

    let sortOption = { createdAt: -1 };
    if (sort === 'popular') {
      sortOption = { 'engagement.totalLikes': -1, createdAt: -1 };
    } else if (sort === 'trending') {
      // Trending based on recent engagement
      sortOption = { 
        'engagement.totalViews': -1, 
        'engagement.totalLikes': -1, 
        createdAt: -1 
      };
    }

    const posts = await Post.find({ isPublic: true })
      .populate('author', 'username firstName lastName avatar')
      .populate({
        path: 'comments',
        populate: {
          path: 'author',
          select: 'username firstName lastName avatar'
        },
        options: { limit: 3, sort: { createdAt: -1 } }
      })
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Post.countDocuments({ isPublic: true });

    // Add like status for authenticated users
    if (req.user) {
      posts.forEach(post => {
        post.isLiked = post.isLikedBy(req.user._id);
      });
    }

    res.json({
      posts,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/posts/feed
// @desc    Get personalized feed for authenticated user
// @access  Private
router.get('/feed', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const user = await User.findById(req.user._id);
    const followingIds = user.following.map(id => id.toString());

    // Get posts from followed users and user's own posts
    const posts = await Post.find({
      $or: [
        { author: { $in: followingIds } },
        { author: req.user._id }
      ],
      isPublic: true
    })
    .populate('author', 'username firstName lastName avatar')
    .populate({
      path: 'comments',
      populate: {
        path: 'author',
        select: 'username firstName lastName avatar'
      },
      options: { limit: 3, sort: { createdAt: -1 } }
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

    const total = await Post.countDocuments({
      $or: [
        { author: { $in: followingIds } },
        { author: req.user._id }
      ],
      isPublic: true
    });

    // Add like status
    posts.forEach(post => {
      post.isLiked = post.isLikedBy(req.user._id);
    });

    res.json({
      posts,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get feed error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/posts/:id
// @desc    Get single post
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username firstName lastName avatar')
      .populate({
        path: 'comments',
        populate: {
          path: 'author',
          select: 'username firstName lastName avatar'
        },
        options: { sort: { createdAt: -1 } }
      });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Increment view count
    post.views += 1;
    await post.save();

    // Add like status for authenticated users
    if (req.user) {
      post.isLiked = post.isLikedBy(req.user._id);
    }

    res.json({ post });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/posts
// @desc    Create a new post
// @access  Private
router.post('/', auth, upload.array('images', 5), [
  body('content')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Content must be between 1 and 2000 characters'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { content, tags = [], links = [] } = req.body;
    const images = [];

    // Upload images to Cloudinary if any
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          const result = await cloudinary.uploader.upload(
            `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
            {
              folder: 'dev-social-posts',
              resource_type: 'auto'
            }
          );
          images.push({
            url: result.secure_url,
            publicId: result.public_id,
            caption: ''
          });
        } catch (uploadError) {
          console.error('Image upload error:', uploadError);
          return res.status(500).json({ message: 'Failed to upload image' });
        }
      }
    }

    const post = new Post({
      author: req.user._id,
      content,
      images,
      links: Array.isArray(links) ? links : [],
      tags: tags.map(tag => tag.toLowerCase().trim())
    });

    await post.save();
    await post.populate('author', 'username firstName lastName avatar');

    res.status(201).json({
      message: 'Post created successfully',
      post
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/posts/:id
// @desc    Update a post
// @access  Private
router.put('/:id', auth, [
  body('content')
    .optional()
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Content must be between 1 and 2000 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this post' });
    }

    const { content, tags } = req.body;
    
    if (content !== undefined) post.content = content;
    if (tags !== undefined) post.tags = tags.map(tag => tag.toLowerCase().trim());

    await post.save();
    await post.populate('author', 'username firstName lastName avatar');

    res.json({
      message: 'Post updated successfully',
      post
    });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/posts/:id
// @desc    Delete a post
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    // Delete images from Cloudinary
    if (post.images && post.images.length > 0) {
      for (const image of post.images) {
        try {
          await cloudinary.uploader.destroy(image.publicId);
        } catch (error) {
          console.error('Error deleting image from Cloudinary:', error);
        }
      }
    }

    await Post.findByIdAndDelete(req.params.id);

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/posts/:id/like
// @desc    Like/unlike a post
// @access  Private
router.post('/:id/like', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const isLiked = post.isLikedBy(req.user._id);

    if (isLiked) {
      await post.removeLike(req.user._id);
    } else {
      await post.addLike(req.user._id);

      // Create notification for post author (if not the same user)
      if (post.author.toString() !== req.user._id.toString()) {
        const notification = new Notification({
          recipient: post.author,
          sender: req.user._id,
          type: 'like',
          title: 'New Like',
          message: `${req.user.username} liked your post`,
          relatedPost: post._id
        });
        await notification.save();
      }
    }

    await post.populate('author', 'username firstName lastName avatar');

    res.json({
      message: isLiked ? 'Post unliked' : 'Post liked',
      isLiked: !isLiked,
      likeCount: post.likes.length
    });
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/posts/search
// @desc    Search posts
// @access  Public
router.get('/search', optionalAuth, async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.status(400).json({ message: 'Search query must be at least 2 characters' });
    }

    const searchRegex = new RegExp(q.trim(), 'i');
    const skip = (page - 1) * limit;

    const posts = await Post.find({
      $and: [
        { isPublic: true },
        {
          $or: [
            { content: searchRegex },
            { tags: { $in: [searchRegex] } }
          ]
        }
      ]
    })
    .populate('author', 'username firstName lastName avatar')
    .populate({
      path: 'comments',
      populate: {
        path: 'author',
        select: 'username firstName lastName avatar'
      },
      options: { limit: 3, sort: { createdAt: -1 } }
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

    const total = await Post.countDocuments({
      $and: [
        { isPublic: true },
        {
          $or: [
            { content: searchRegex },
            { tags: { $in: [searchRegex] } }
          ]
        }
      ]
    });

    // Add like status for authenticated users
    if (req.user) {
      posts.forEach(post => {
        post.isLiked = post.isLikedBy(req.user._id);
      });
    }

    res.json({
      posts,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Search posts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
