import express from 'express';
import Post from '../models/post.model';

const router = express.Router();

// Get all posts
router.get('/', async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 });
        res.json(posts);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

// Create a post
router.post('/', async (req, res) => {
    const post = new Post({
        author: req.body.author || 'Anonymous',
        title: req.body.title,
        content: req.body.content,
        tag: req.body.tag || 'General'
    });

    try {
        const newPost = await post.save();
        res.status(201).json(newPost);
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
});

// Like a post
router.post('/:id/like', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        post.likes += 1;
        await post.save();
        res.json(post);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

// Add a comment
router.post('/:id/comment', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        const comment = {
            author: req.body.author || 'User',
            text: req.body.text,
            timestamp: new Date()
        };

        post.comments.push(comment);
        await post.save();
        res.json(post);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
