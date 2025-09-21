import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { PlusCircle, ArrowLeft, Eye } from 'lucide-react'
import Button from '../../components/UI/Button'
import toast from 'react-hot-toast'
import { apiClient } from '../../services/apiClient'
import { getPostErrorMessage } from '../../utils/errorMessages'
import type { CreatePost as CreatePostData } from '@repo/shared'

interface CreatePostForm {
  title: string
  content: string
  tags: string
}

const CreatePost: React.FC = () => {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<CreatePostForm>({
    defaultValues: {
      title: '',
      content: '',
      tags: '',
    },
  })

  const watchedContent = watch('content')
  const watchedTitle = watch('title')

  const onSubmit = async (data: CreatePostForm) => {
    try {
      setIsSubmitting(true)
      
      const postData: CreatePostData = {
        title: data.title.trim(),
        content: data.content.trim(),
        tags: data.tags
          .split(',')
          .map(tag => tag.trim())
          .filter(tag => tag.length > 0),
      }

      const response = await apiClient.post('/posts', postData)
      
      if (response.data.success) {
        toast.success('Post created successfully!')
        navigate('/dashboard')
      } else {
        throw new Error(response.data.error || 'Failed to create post')
      }
    } catch (error: any) {
      console.error('Create post error:', error)
      const userMessage = getPostErrorMessage(error, 'create')
      toast.error(userMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    if (watchedTitle || watchedContent) {
      if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
        navigate(-1)
      }
    } else {
      navigate(-1)
    }
  }

  const getWordCount = (text: string) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length
  }

  const getReadingTime = (text: string) => {
    const words = getWordCount(text)
    return Math.ceil(words / 200) // Average reading speed: 200 words per minute
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
          Back
        </button>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Post</h1>
        <p className="text-gray-600">Share your thoughts with the world</p>
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
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          
          <div className="flex items-center space-x-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => reset()}
              disabled={isSubmitting}
            >
              Clear
            </Button>
            <Button
              type="submit"
              loading={isSubmitting}
              loadingText="Publishing..."
              disabled={!watchedTitle || !watchedContent}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Publish Post
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default CreatePost
