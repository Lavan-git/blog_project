/**
 * Convert API errors to user-friendly messages
 */
export const getErrorMessage = (error: any): string => {
  // Handle axios errors with response first (most common)
  if (error?.response?.data?.error) {
    return error.response.data.error
  }

  if (error?.response?.data?.message) {
    return error.response.data.message
  }

  // If error has a direct message, use it
  if (error?.message && typeof error.message === 'string' && !error.message.includes('status code')) {
    return error.message
  }

  // Handle specific HTTP status codes
  if (error?.response?.status) {
    switch (error.response.status) {
      case 400:
        return 'Please check your input and try again'
      case 401:
        return 'Invalid email or password. Please try again'
      case 403:
        return 'You do not have permission to perform this action'
      case 404:
        return 'The requested resource was not found'
      case 409:
        return 'This email address is already registered. Please use a different email or try logging in'
      case 422:
        return 'Please check your input - some fields may be invalid'
      case 429:
        return 'Too many requests. Please wait a moment and try again'
      case 500:
        return 'Server error occurred. Please try again later'
      case 502:
      case 503:
      case 504:
        return 'Service temporarily unavailable. Please try again later'
      default:
        return 'An unexpected error occurred. Please try again'
    }
  }

  // Handle network errors
  if (error?.code === 'NETWORK_ERROR' || error?.message?.includes('Network Error')) {
    return 'Network error. Please check your internet connection and try again'
  }

  if (error?.code === 'ECONNREFUSED' || error?.message?.includes('connect ECONNREFUSED')) {
    return 'Unable to connect to the server. Please try again later'
  }

  // Default fallback
  return 'An unexpected error occurred. Please try again'
}

/**
 * Specific error messages for authentication actions
 */
export const getAuthErrorMessage = (error: any, action: 'login' | 'register'): string => {
  // Debug logging
  console.log('🔍 Auth Error Debug:', {
    action,
    errorObject: error,
    hasResponse: !!error?.response,
    responseData: error?.response?.data,
    status: error?.response?.status,
    message: error?.message
  })

  // Handle specific cases for auth
  if (error?.response?.status === 409 && action === 'register') {
    return 'This email address is already registered. Please use a different email or try logging in instead'
  }

  if (error?.response?.status === 401 && action === 'login') {
    return 'Invalid email or password. Please check your credentials and try again'
  }

  // Use the general error message function
  return getErrorMessage(error)
}

/**
 * Error messages for post operations
 */
export const getPostErrorMessage = (error: any, action: 'create' | 'update' | 'delete' | 'fetch'): string => {
  if (error?.response?.status === 404) {
    return action === 'fetch' 
      ? 'Post not found or may have been deleted'
      : 'The post you are trying to modify was not found'
  }

  if (error?.response?.status === 403) {
    return 'You can only modify your own posts'
  }

  // Use the general error message function
  return getErrorMessage(error)
}
