import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../providers/AuthProvider'
import { Mail, Calendar, Edit, FileText, Tag, TrendingUp } from 'lucide-react'
import Button from '../../components/UI/Button'

const Profile: React.FC = () => {
  const { user } = useAuth()

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Profile Not Found</h1>
          <p className="text-gray-600 mb-6">Please log in to view your profile.</p>
          <Link to="/login">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-6">
            {/* Avatar */}
            <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-white">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            
            {/* User Info */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{user.name}</h1>
              <div className="flex items-center space-x-4 text-gray-600">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>Joined {new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long'
                  })}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Edit Profile Button */}
          <Button variant="outline" size="sm" disabled>
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <FileText className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">-</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Posts</h3>
          <p className="text-sm text-gray-600">Articles published</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="h-8 w-8 text-green-600" />
            <span className="text-2xl font-bold text-gray-900">-</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Total Views</h3>
          <p className="text-sm text-gray-600">Across all posts</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <Tag className="h-8 w-8 text-purple-600" />
            <span className="text-2xl font-bold text-gray-900">-</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Tags Used</h3>
          <p className="text-sm text-gray-600">Different topics</p>
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Manage Posts */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="bg-blue-100 rounded-lg p-3 mr-4">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Manage Posts</h3>
                <p className="text-sm text-gray-600">View and edit your blog posts</p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <Link to="/dashboard">
              <Button fullWidth variant="outline">
                Go to Dashboard
              </Button>
            </Link>
            <Link to="/create-post">
              <Button fullWidth>
                Create New Post
              </Button>
            </Link>
          </div>
        </div>

        {/* Account Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="bg-gray-100 rounded-lg p-3 mr-4">
                <Edit className="h-6 w-6 text-gray-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Account Settings</h3>
                <p className="text-sm text-gray-600">Manage your account preferences</p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <Button fullWidth variant="outline" disabled>
              Change Password
            </Button>
            <Button fullWidth variant="outline" disabled>
              Update Email
            </Button>
            <Button fullWidth variant="outline" disabled>
              Privacy Settings
            </Button>
          </div>
        </div>
      </div>

      {/* Coming Soon Notice */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">i</span>
            </div>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Profile Features Coming Soon
            </h3>
            <p className="mt-1 text-sm text-blue-700">
              Advanced profile editing, detailed statistics, and account settings will be available in a future update.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
