import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../providers/AuthProvider'
import { PlusCircle, FileText, TrendingUp, Users, Edit3, Trash2, Eye } from 'lucide-react'
import { apiClient } from '../../services/apiClient'
import LoadingSpinner from '../../components/UI/LoadingSpinner'
import toast from 'react-hot-toast'
import { getPostErrorMessage } from '../../utils/errorMessages'

interface Post {
  _id: string
  title: string
  content: string
  tags: string[]
  author: {
    _id: string
    name: string
    email: string
  }
  createdAt: string
  updatedAt: string
}

interface Stats {
  totalPosts: number
  totalWords: number
  avgWordsPerPost: number
  totalTags: number
  uniqueTagsCount: number
}

const Dashboard: React.FC = () => {
  const { user } = useAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setIsLoading(true)
      const [postsResponse, statsResponse] = await Promise.all([
        apiClient.get('/posts?page=1&limit=5&sortBy=createdAt&sortOrder=desc'),
        apiClient.get('/posts/stats')
      ])

      if (postsResponse.data.success) {
        setPosts(postsResponse.data.data.posts || [])
      }

      if (statsResponse.data.success) {
        setStats(statsResponse.data.data)
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeletePost = async (postId: string, postTitle: string) => {
    if (!window.confirm(`Are you sure you want to delete "${postTitle}"? This action cannot be undone.`)) {
      return
    }

    try {
      setIsDeleting(postId)
      const response = await apiClient.delete(`/posts/${postId}`)
      
      if (response.data.success) {
        toast.success('Post deleted successfully!')
        // Reload data to reflect changes
        loadDashboardData()
      } else {
        throw new Error('Failed to delete post')
      }
    } catch (error: any) {
      console.error('Delete post error:', error)
      const userMessage = getPostErrorMessage(error, 'delete')
      toast.error(userMessage)
    } finally {
      setIsDeleting(null)
    }
  }

  const getReadingTime = (content: string) => {
    const words = content.trim().split(/\s+/).length
    return Math.ceil(words / 200)
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center items-center min-h-[50vh]">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.name || 'User'}! 👋
        </h1>
        <p className="text-gray-600">
          Manage your blog posts and track your progress from here.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Link
          to="/create-post"
          className="bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg p-6 transition-colors group"
        >
          <div className="flex items-center justify-between mb-4">
            <PlusCircle className="h-8 w-8 text-blue-600" />
            <span className="text-sm font-medium text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
              New Post
            </span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Create Post</h3>
          <p className="text-sm text-gray-600">Write and publish a new blog post</p>
        </Link>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <FileText className="h-8 w-8 text-green-600" />
            <span className="text-sm font-medium text-green-600">{stats?.totalPosts || 0} posts</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">My Posts</h3>
          <p className="text-sm text-gray-600">Total published articles</p>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="h-8 w-8 text-purple-600" />
            <span className="text-sm font-medium text-purple-600">{stats?.totalWords || 0} words</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Words</h3>
          <p className="text-sm text-gray-600">Across all your posts</p>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <Users className="h-8 w-8 text-orange-600" />
            <span className="text-sm font-medium text-orange-600">{stats?.uniqueTagsCount || 0} tags</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Unique Tags</h3>
          <p className="text-sm text-gray-600">Different topics covered</p>
        </div>
      </div>

      {/* Recent Posts */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Recent Posts</h2>
          <Link
            to="/create-post"
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors text-sm"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            New Post
          </Link>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
            <p className="text-gray-600 mb-6">
              Get started by creating your first blog post!
            </p>
            <Link
              to="/create-post"
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              <PlusCircle className="h-5 w-5 mr-2" />
              Create Your First Post
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900 mb-1">{post.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {post.content.length > 200 
                        ? post.content.substring(0, 200) + '...' 
                        : post.content
                      }
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                      <span>{getReadingTime(post.content)} min read</span>
                      {post.tags.length > 0 && (
                        <div className="flex items-center space-x-1">
                          {post.tags.slice(0, 3).map((tag) => (
                            <span 
                              key={tag} 
                              className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                          {post.tags.length > 3 && (
                            <span className="text-gray-500">+{post.tags.length - 3} more</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <Link
                      to={`/blog/${post._id}`}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View post"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    <Link
                      to={`/edit-post/${post._id}`}
                      className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Edit post"
                    >
                      <Edit3 className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => handleDeletePost(post._id, post.title)}
                      disabled={isDeleting === post._id}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Delete post"
                    >
                      {isDeleting === post._id ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            <div className="text-center pt-4 border-t border-gray-200">
              <Link
                to="/blog"
                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                View All Posts →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
