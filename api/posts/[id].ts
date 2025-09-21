import { VercelRequest, VercelResponse } from '@vercel/node';
import mongoose from 'mongoose';
import { connectToDatabase, enableCors, handleError, requireAuth, AuthenticatedRequest } from '../_middleware';
import { Post } from '../../packages/backend/src/models/Post';

export default async function handler(req: AuthenticatedRequest, res: VercelResponse) {
  // Handle CORS
  if (enableCors(req, res)) return;

  try {
    await connectToDatabase();

    const { id } = req.query;

    if (!id || !mongoose.Types.ObjectId.isValid(id as string)) {
      return res.status(400).json({ error: 'Invalid post ID' });
    }

    switch (req.method) {
      case 'GET':
        return await handleGetPost(req, res);
      case 'PUT':
        return await handleUpdatePost(req, res);
      case 'DELETE':
        return await handleDeletePost(req, res);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    handleError(error, res);
  }
}

async function handleGetPost(req: VercelRequest, res: VercelResponse) {
  try {
    const { id } = req.query;

    const post = await Post.findById(id)
      .populate('author', 'name email')
      .lean();

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.status(200).json({ post });
  } catch (error) {
    throw error;
  }
}

async function handleUpdatePost(req: AuthenticatedRequest, res: VercelResponse) {
  // Check authentication
  const isAuthenticated = await requireAuth(req, res);
  if (!isAuthenticated) return;

  try {
    const { id } = req.query;
    const { title, content, tags } = req.body;

    // Find the post
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check if user is the author
    if (post.author.toString() !== req.user!.id) {
      return res.status(403).json({ error: 'Not authorized to update this post' });
    }

    // Validation
    if (!title || !content) {
      return res.status(400).json({
        error: 'Title and content are required'
      });
    }

    if (title.length < 3 || title.length > 200) {
      return res.status(400).json({
        error: 'Title must be between 3 and 200 characters'
      });
    }

    if (content.length < 10 || content.length > 50000) {
      return res.status(400).json({
        error: 'Content must be between 10 and 50,000 characters'
      });
    }

    // Process tags
    const processedTags = tags 
      ? tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag.length > 0)
      : [];

    // Calculate reading time
    const wordCount = content.split(/\s+/).length;
    const readingTime = Math.max(1, Math.ceil(wordCount / 200));

    // Update post
    const updatedPost = await Post.findByIdAndUpdate(
      id,
      {
        title: title.trim(),
        content: content.trim(),
        tags: processedTags,
        readingTime,
        updatedAt: new Date(),
      },
      { new: true, runValidators: true }
    ).populate('author', 'name email');

    res.status(200).json({
      message: 'Post updated successfully',
      post: updatedPost,
    });
  } catch (error) {
    throw error;
  }
}

async function handleDeletePost(req: AuthenticatedRequest, res: VercelResponse) {
  // Check authentication
  const isAuthenticated = await requireAuth(req, res);
  if (!isAuthenticated) return;

  try {
    const { id } = req.query;

    // Find the post
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check if user is the author
    if (post.author.toString() !== req.user!.id) {
      return res.status(403).json({ error: 'Not authorized to delete this post' });
    }

    // Delete the post
    await Post.findByIdAndDelete(id);

    res.status(200).json({
      message: 'Post deleted successfully',
    });
  } catch (error) {
    throw error;
  }
}
