import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/layout/Layout'
import LoadingSpinner from './components/ui/LoadingSpinner'

// Lazy-loaded components for better performance
const Home = lazy(() => import('./pages/Home'))
const Events = lazy(() => import('./pages/Events'))
const EventDetails = lazy(() => import('./pages/EventDetails'))
const ManageEvent = lazy(() => import('./pages/ManageEvent'))
const Vendors = lazy(() => import('./pages/Vendors'))
const VendorDetails = lazy(() => import('./pages/VendorDetails'))
const ManageVendor = lazy(() => import('./pages/ManageVendor'))
const Profile = lazy(() => import('./pages/Profile'))
const NotFound = lazy(() => import('./pages/NotFound'))

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth()
  
  if (loading) {
    return <LoadingSpinner />
  }
  
  if (!currentUser) {
    return <Navigate to="/" replace />
  }
  
  return children
}

function App() {
  const { checkAuthState } = useAuth()
  
  useEffect(() => {
    checkAuthState()
  }, [checkAuthState])

  return (
    <Layout>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:id" element={<EventDetails />} />
          <Route path="/create-event" element={
            <ProtectedRoute>
              <ManageEvent />
            </ProtectedRoute>
          } />
          <Route path="/edit-event/:id" element={
            <ProtectedRoute>
              <ManageEvent />
            </ProtectedRoute>
          } />
          <Route path="/vendors" element={<Vendors />} />
          <Route path="/vendors/:id" element={<VendorDetails />} />
          <Route path="/create-vendor" element={
            <ProtectedRoute>
              <ManageVendor />
            </ProtectedRoute>
          } />
          <Route path="/edit-vendor/:id" element={
            <ProtectedRoute>
              <ManageVendor />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </Layout>
  )
}

export default App