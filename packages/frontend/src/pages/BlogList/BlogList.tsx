import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Clock, User, Tag } from 'lucide-react'
import { apiClient } from '../../services/apiClient'
import LoadingSpinner from '../../components/UI/LoadingSpinner'

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

const BlogList: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadPosts()
  }, [])

  const loadPosts = async () => {
    try {
      setIsLoading(true)
      const response = await apiClient.get('/posts?page=1&limit=20&sortBy=createdAt&sortOrder=desc')
      
      if (response.data.success) {
        setPosts(response.data.data.posts || [])
      }
    } catch (error) {
      console.error('Failed to load posts:', error)
      // Fallback: show empty state
      setPosts([])
    } finally {
      setIsLoading(false)
    }
  }

  const getReadingTime = (content: string) => {
    const words = content.trim().split(/\s+/).length
    return Math.ceil(words / 200)
  }

  const getExcerpt = (content: string) => {
    return content.length > 150 ? content.substring(0, 150) + '...' : content
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
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">All Blog Posts</h1>
        <p className="text-gray-600">
          Discover insights, tutorials, and stories from our community.
        </p>
      </div>

      {/* Posts Grid */}
      {posts.length === 0 ? (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <div className="bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <Tag className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No posts published yet
            </h3>
            <p className="text-gray-600 mb-6">
              Be the first to share your thoughts with the community!
            </p>
            <Link
              to="/register"
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Join the Community
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <article
              key={post._id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow overflow-hidden"
            >
              <div className="p-6">
                {/* Tags */}
                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {post.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </span>
                    ))}
                    {post.tags.length > 2 && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        +{post.tags.length - 2} more
                      </span>
                    )}
                  </div>
                )}

                {/* Title */}
                <h2 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">
                  <Link
                    to={`/blog/${post._id}`}
                    className="hover:text-blue-600 transition-colors"
                  >
                    {post.title}
                  </Link>
                </h2>

                {/* Excerpt */}
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {getExcerpt(post.content)}
                </p>

                {/* Meta Information */}
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      <span>{post.author.name}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{getReadingTime(post.content)} min read</span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Read More Button */}
              <div className="px-6 pb-4">
                <Link
                  to={`/blog/${post._id}`}
                  className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Read more →
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

export default BlogList
