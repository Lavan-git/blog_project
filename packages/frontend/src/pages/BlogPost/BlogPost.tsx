import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Calendar, Clock, User, Tag, ArrowLeft, Edit3 } from 'lucide-react'
import { apiClient } from '../../services/apiClient'
import { useAuth } from '../../providers/AuthProvider'
import LoadingSpinner from '../../components/UI/LoadingSpinner'
import Button from '../../components/UI/Button'
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

const BlogPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [post, setPost] = useState<Post | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (slug) {
      loadPost()
    }
  }, [slug])

  const loadPost = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await apiClient.get(`/posts/${slug}`)
      
      if (response.data.success) {
        setPost(response.data.data)
      } else {
        throw new Error('Post not found')
      }
    } catch (error: any) {
      console.error('Failed to load post:', error)
      const userMessage = getPostErrorMessage(error, 'fetch')
      setError(userMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const getReadingTime = (content: string) => {
    const words = content.trim().split(/\s+/).length
    return Math.ceil(words / 200)
  }

  const isAuthor = user && post && user._id === post.author._id

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center items-center min-h-[50vh]">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {error === 'Post not found' ? 'Post Not Found' : 'Error Loading Post'}
          </h1>
          <p className="text-gray-600 mb-6">
            {error === 'Post not found' 
              ? "The post you're looking for doesn't exist or has been removed." 
              : 'Something went wrong while loading the post. Please try again.'
            }
          </p>
          <div className="space-x-4">
            <Button onClick={() => navigate(-1)} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
            <Link to="/blog">
              <Button>Browse All Posts</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Navigation */}
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </button>
      </div>

      {/* Post Header */}
      <header className="mb-8">
        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
              >
                <Tag className="h-3 w-3 mr-1" />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <h1 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">
          {post.title}
        </h1>

        {/* Meta Information */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-6">
          <div className="flex items-center space-x-6 text-sm text-gray-600">
            <div className="flex items-center">
              <User className="h-4 w-4 mr-2" />
              <span className="font-medium">{post.author.name}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              <span>{new Date(post.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              <span>{getReadingTime(post.content)} min read</span>
            </div>
          </div>
          
          {/* Edit button for authors */}
          {isAuthor && (
            <Link to={`/edit-post/${post._id}`}>
              <Button size="sm" variant="outline">
                <Edit3 className="h-4 w-4 mr-2" />
                Edit Post
              </Button>
            </Link>
          )}
        </div>
      </header>

      {/* Post Content */}
      <div className="prose prose-lg max-w-none">
        <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
          {post.content}
        </div>
      </div>

      {/* Post Footer */}
      <footer className="mt-12 pt-8 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-sm text-gray-600">
              <span>Published by <span className="font-medium text-gray-900">{post.author.name}</span></span>
            </div>
            {post.updatedAt !== post.createdAt && (
              <div className="text-sm text-gray-500">
                Last updated: {new Date(post.updatedAt).toLocaleDateString()}
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            <Link
              to="/blog"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              ← More Posts
            </Link>
          </div>
        </div>
      </footer>
    </article>
  )
}

export default BlogPost
