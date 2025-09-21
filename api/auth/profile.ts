import { VercelRequest, VercelResponse } from '@vercel/node';
import { connectToDatabase, enableCors, handleError, requireAuth, AuthenticatedRequest } from '../_middleware';

export default async function handler(req: AuthenticatedRequest, res: VercelResponse) {
  // Handle CORS
  if (enableCors(req, res)) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectToDatabase();

    // Check authentication
    const isAuthenticated = await requireAuth(req, res);
    if (!isAuthenticated) return;

    res.status(200).json({
      message: 'Profile retrieved successfully',
      user: req.user,
    });
  } catch (error) {
    handleError(error, res);
  }
}
