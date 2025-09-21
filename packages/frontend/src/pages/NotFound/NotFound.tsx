import React from 'react'
import { Link } from 'react-router-dom'
import Button from '../../components/UI/Button'

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-gray-300">404</h1>
        </div>
        
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Page not found
          </h2>
          <p className="text-gray-600">
            Sorry, we couldn't find the page you're looking for.
          </p>
        </div>

        <div className="space-y-4">
          <Link to="/">
            <Button className="w-full">
              Go back home
            </Button>
          </Link>
          
          <Link to="/blog">
            <Button variant="outline" className="w-full">
              Browse blog posts
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default NotFound
