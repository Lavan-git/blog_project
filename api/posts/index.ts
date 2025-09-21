import { VercelRequest, VercelResponse } from '@vercel/node';
import { connectToDatabase, enableCors, handleError, requireAuth, AuthenticatedRequest } from '../_middleware';
import { Post } from '../../packages/backend/src/models/Post';

export default async function handler(req: AuthenticatedRequest, res: VercelResponse) {
  // Handle CORS
  if (enableCors(req, res)) return;

  try {
    await connectToDatabase();

    switch (req.method) {
      case 'GET':
        return await handleGetPosts(req, res);
      case 'POST':
        return await handleCreatePost(req, res);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    handleError(error, res);
  }
}

async function handleGetPosts(req: VercelRequest, res: VercelResponse) {
  try {
    const { page = '1', limit = '10', search } = req.query;
    
    const pageNumber = Math.max(1, parseInt(page as string));
    const limitNumber = Math.min(50, Math.max(1, parseInt(limit as string)));
    const skip = (pageNumber - 1) * limitNumber;

    // Build search query
    const searchQuery = search 
      ? {
          $or: [
            { title: { $regex: search, $options: 'i' } },
            { content: { $regex: search, $options: 'i' } },
            { tags: { $in: [new RegExp(search as string, 'i')] } }
          ]
        }
      : {};

    // Get posts with author information
    const posts = await Post.find(searchQuery)
      .populate('author', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber)
      .lean();

    // Get total count for pagination
    const total = await Post.countDocuments(searchQuery);

    res.status(200).json({
      posts,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        totalPages: Math.ceil(total / limitNumber),
        hasNextPage: pageNumber < Math.ceil(total / limitNumber),
        hasPrevPage: pageNumber > 1,
      },
    });
  } catch (error) {
    throw error;
  }
}

async function handleCreatePost(req: AuthenticatedRequest, res: VercelResponse) {
  // Check authentication
  const isAuthenticated = await requireAuth(req, res);
  if (!isAuthenticated) return;

  try {
    const { title, content, tags } = req.body;

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

    // Calculate reading time (average 200 words per minute)
    const wordCount = content.split(/\s+/).length;
    const readingTime = Math.max(1, Math.ceil(wordCount / 200));

    // Create post
    const post = await Post.create({
      title: title.trim(),
      content: content.trim(),
      tags: processedTags,
      author: req.user!.id,
      readingTime,
    });

    // Populate author info
    await post.populate('author', 'name email');

    res.status(201).json({
      message: 'Post created successfully',
      post,
    });
  } catch (error) {
    throw error;
  }
}
