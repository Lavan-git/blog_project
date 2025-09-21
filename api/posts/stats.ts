import { VercelRequest, VercelResponse } from '@vercel/node';
import mongoose from 'mongoose';
import { connectToDatabase, enableCors, handleError, requireAuth, AuthenticatedRequest } from '../_middleware';
import { Post } from '../../packages/backend/src/models/Post';

export default async function handler(req: AuthenticatedRequest, res: VercelResponse) {
  // Handle CORS
  if (enableCors(req, res)) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check authentication
  const isAuthenticated = await requireAuth(req, res);
  if (!isAuthenticated) return;

  try {
    await connectToDatabase();

    const userId = req.user!.id;

    // Get user's posts statistics
    const [totalPosts, recentPosts] = await Promise.all([
      Post.countDocuments({ author: userId }),
      Post.find({ author: userId })
        .populate('author', 'name email')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean()
    ]);

    // Calculate total views (if you have a views field) and reading time
    const totalReadingTime = await Post.aggregate([
      { $match: { author: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: null, totalTime: { $sum: '$readingTime' } } }
    ]);

    const stats = {
      totalPosts,
      totalReadingTime: totalReadingTime[0]?.totalTime || 0,
      recentPosts,
    };

    res.status(200).json({
      message: 'Statistics retrieved successfully',
      stats,
    });
  } catch (error) {
    handleError(error, res);
  }
}
