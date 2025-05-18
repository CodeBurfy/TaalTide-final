import { Link } from 'react-router-dom'
import { FiMapPin, FiTag, FiStar } from 'react-icons/fi'

const VendorCard = ({ vendor, featured = false }) => {
  return (
    <div 
      className={`card group h-full flex flex-col transition-all duration-300 ${
        featured ? 'border-primary-300 bg-primary-50' : ''
      }`}
    >
      {/* Image */}
      <div className="relative overflow-hidden rounded-t-lg h-40">
        {vendor.image_url ? (
          <img 
            src={vendor.image_url} 
            alt={vendor.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-secondary-400 to-accent-500 flex items-center justify-center">
            <span className="text-white text-xl font-bold">{vendor.name.charAt(0)}</span>
          </div>
        )}
        
        {/* Featured badge */}
        {featured && (
          <div className="absolute top-2 left-2 bg-primary-500 text-white text-xs px-2 py-1 rounded-full flex items-center">
            <FiStar className="mr-1" />
            Featured
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="p-4 flex-grow flex flex-col">
        <h3 className="text-lg font-bold mb-2 line-clamp-2 text-gray-800">
          {vendor.name}
        </h3>
        
        <div className="mb-3 text-sm text-gray-600">
          <div className="flex items-center mb-1">
            <FiMapPin className="mr-2 text-primary-500" />
            <span className="truncate">{vendor.location}</span>
          </div>
          
          {vendor.category && (
            <div className="flex items-center">
              <FiTag className="mr-2 text-primary-500" />
              <span>{vendor.category}</span>
            </div>
          )}
        </div>
        
        <p className="text-sm text-gray-600 line-clamp-2 mb-3 flex-grow">
          {vendor.description}
        </p>
        
        <Link
          to={`/vendors/${vendor.id}`}
          className={`text-center mt-auto ${
            featured ? 'btn-secondary' : 'btn-primary'
          }`}
        >
          View Details
        </Link>
      </div>
    </div>
  )
}

export default VendorCard