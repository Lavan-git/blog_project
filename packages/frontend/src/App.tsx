import { Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import Layout from './components/Layout/Layout'
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute'
import LoadingSpinner from './components/UI/LoadingSpinner'
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary'

// Lazy load components for better performance
const Home = lazy(() => import('./pages/Home/Home'))
const BlogList = lazy(() => import('./pages/BlogList/BlogList'))
const BlogPost = lazy(() => import('./pages/BlogPost/BlogPost'))
const Login = lazy(() => import('./pages/Auth/Login'))
const Register = lazy(() => import('./pages/Auth/Register'))
const Profile = lazy(() => import('./pages/Profile/Profile'))
const CreatePost = lazy(() => import('./pages/CreatePost/CreatePost'))
const EditPost = lazy(() => import('./pages/EditPost/EditPost'))
const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard'))
const NotFound = lazy(() => import('./pages/NotFound/NotFound'))

function App() {
  return (
    <ErrorBoundary>
      <Layout>
        <Suspense 
          fallback={
            <div className="flex justify-center items-center min-h-[50vh]">
              <LoadingSpinner size="lg" />
            </div>
          }
        >
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/blog" element={<BlogList />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/create-post"
              element={
                <ProtectedRoute>
                  <CreatePost />
                </ProtectedRoute>
              }
            />
            <Route
              path="/edit-post/:id"
              element={
                <ProtectedRoute>
                  <EditPost />
                </ProtectedRoute>
              }
            />

            {/* Fallback Routes */}
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </Suspense>
      </Layout>
    </ErrorBoundary>
  )
}

export default App
