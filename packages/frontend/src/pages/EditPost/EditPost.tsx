import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Save, ArrowLeft, Eye, Trash2 } from 'lucide-react'
import Button from '../../components/UI/Button'
import LoadingSpinner from '../../components/UI/LoadingSpinner'
import toast from 'react-hot-toast'
import { apiClient } from '../../services/apiClient'
import { getPostErrorMessage } from '../../utils/errorMessages'
import type { UpdatePost } from '@repo/shared'

interface EditPostForm {
  title: string
  content: string
  tags: string
}

interface Post {
  _id: string
  title: string
  content: string
  tags: string[]
  author: {
    _id: string
    username: string
    email: string
  }
  createdAt: string
  updatedAt: string
  slug: string
}

const EditPost: React.FC = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showPreview, setShowPreview] = useState(false)
  const [post, setPost] = useState<Post | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<EditPostForm>({
    defaultValues: {
      title: '',
      content: '',
      tags: '',
    },
  })

  const watchedContent = watch('content')
  const watchedTitle = watch('title')

  // Load post data
  useEffect(() => {
    const loadPost = async () => {
      if (!id) {
        toast.error('Invalid post ID')
        navigate('/dashboard')
        return
      }

      try {
        setIsLoading(true)
        const response = await apiClient.get(`/posts/${id}`)
        
        if (response.data.success) {
          const postData = response.data.data
          setPost(postData)
          
          // Populate form
          setValue('title', postData.title)
          setValue('content', postData.content)
          setValue('tags', postData.tags.join(', '))
        } else {
          throw new Error(response.data.error || 'Failed to load post')
        }
      } catch (error: any) {
        console.error('Load post error:', error)
        const userMessage = getPostErrorMessage(error, 'fetch')
        toast.error(userMessage)
        navigate('/dashboard')
      } finally {
        setIsLoading(false)
      }
    }

    loadPost()
  }, [id, navigate, setValue])

  const onSubmit = async (data: EditPostForm) => {
    if (!id) return

    try {
      setIsSubmitting(true)
      
      const updateData: UpdatePost = {
        title: data.title.trim(),
        content: data.content.trim(),
        tags: data.tags
          .split(',')
          .map(tag => tag.trim())
          .filter(tag => tag.length > 0),
      }

      const response = await apiClient.put(`/posts/${id}`, updateData)
      
      if (response.data.success) {
        toast.success('Post updated successfully!')
        navigate('/dashboard')
      } else {
        throw new Error(response.data.error || 'Failed to update post')
      }
    } catch (error: any) {
      console.error('Update post error:', error)
      const userMessage = getPostErrorMessage(error, 'update')
      toast.error(userMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!id || !post) return

    if (!window.confirm(`Are you sure you want to delete "${post.title}"? This action cannot be undone.`)) {
      return
    }

    try {
      setIsDeleting(true)
      
      const response = await apiClient.delete(`/posts/${id}`)
      
      if (response.data.success) {
        toast.success('Post deleted successfully!')
        navigate('/dashboard')
      } else {
        throw new Error(response.data.error || 'Failed to delete post')
      }
    } catch (error: any) {
      console.error('Delete post error:', error)
      const userMessage = getPostErrorMessage(error, 'delete')
      toast.error(userMessage)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCancel = () => {
    navigate('/dashboard')
  }

  const getWordCount = (text: string) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length
  }

  const getReadingTime = (text: string) => {
    const words = getWordCount(text)
    return Math.ceil(words / 200)
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center items-center min-h-[50vh]">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Post Not Found</h1>
          <Button onClick={() => navigate('/dashboard')}>Return to Dashboard</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={handleCancel}
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </button>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Post</h1>
        <p className="text-gray-600">Update your blog post</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Post Title
          </label>
          <input
            {...register('title', {
              required: 'Title is required',
              minLength: {
                value: 1,
                message: 'Title must be at least 1 character long'
              },
              maxLength: {
                value: 200,
                message: 'Title must be less than 200 characters long'
              }
            })}
            type="text"
            id="title"
            placeholder="Enter your post title..."
            className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-lg"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
          )}
        </div>

        {/* Content */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label htmlFor="content" className="block text-sm font-medium text-gray-700">
              Content
            </label>
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                <Eye className="h-4 w-4 mr-1" />
                {showPreview ? 'Edit' : 'Preview'}
              </button>
              <span className="text-sm text-gray-500">
                {getWordCount(watchedContent || '')} words • {getReadingTime(watchedContent || '')} min read
              </span>
            </div>
          </div>
          
          {showPreview ? (
            <div className="min-h-[300px] p-4 border border-gray-300 rounded-lg bg-gray-50 prose max-w-none">
              {watchedTitle && <h1 className="text-2xl font-bold mb-4">{watchedTitle}</h1>}
              {watchedContent ? (
                <div className="whitespace-pre-wrap">{watchedContent}</div>
              ) : (
                <p className="text-gray-500 italic">Start typing to see preview...</p>
              )}
            </div>
          ) : (
            <textarea
              {...register('content', {
                required: 'Content is required',
                minLength: {
                  value: 1,
                  message: 'Content cannot be empty'
                },
                maxLength: {
                  value: 10000,
                  message: 'Content must be less than 10000 characters long'
                }
              })}
              id="content"
              rows={12}
              placeholder="Write your post content here...\n\nYou can use plain text or basic formatting."
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 resize-y"
            />
          )}
          {errors.content && (
            <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
          )}
        </div>

        {/* Tags */}
        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
            Tags
          </label>
          <input
            {...register('tags')}
            type="text"
            id="tags"
            placeholder="react, javascript, tutorial (comma-separated)"
            className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="mt-1 text-sm text-gray-500">
            Add up to 10 tags separated by commas
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <Button
            type="button"
            variant="danger"
            onClick={handleDelete}
            loading={isDeleting}
            loadingText="Deleting..."
            disabled={isSubmitting || isDeleting}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Post
          </Button>
          
          <div className="flex items-center space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting || isDeleting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={isSubmitting}
              loadingText="Saving..."
              disabled={!watchedTitle || !watchedContent || isDeleting}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      </form>

      {/* Post Info */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Post Information</h3>
        <div className="text-sm text-gray-600 space-y-1">
          <p><span className="font-medium">Created:</span> {new Date(post.createdAt).toLocaleDateString()}</p>
          <p><span className="font-medium">Last Updated:</span> {new Date(post.updatedAt).toLocaleDateString()}</p>
          <p><span className="font-medium">Author:</span> {post.author.username}</p>
          <p><span className="font-medium">Slug:</span> {post.slug}</p>
        </div>
      </div>
    </div>
  )
}

export default EditPost
