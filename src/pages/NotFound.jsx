import { Link } from 'react-router-dom'
import { FiArrowLeft } from 'react-icons/fi'

const NotFound = () => {
  return (
    <div className="min-h-screen pt-20 pb-12 bg-gray-50 flex flex-col items-center justify-center">
      <div className="container-custom text-center">
        <h1 className="text-9xl font-bold text-primary-500 mb-4">404</h1>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Link 
          to="/" 
          className="btn-primary inline-flex items-center"
        >
          <FiArrowLeft className="mr-2" />
          Return to Home
        </Link>
      </div>
    </div>
  )
}

export default NotFound