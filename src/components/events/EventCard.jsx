import { Link } from 'react-router-dom'
import { FiMapPin, FiCalendar, FiTag } from 'react-icons/fi'

const EventCard = ({ event }) => {
  // Format date range
  const formatDateRange = (startDate, endDate) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    const options = { month: 'short', day: 'numeric' }
    const startStr = start.toLocaleDateString('en-US', options)
    
    if (endDate) {
      const endStr = end.toLocaleDateString('en-US', options)
      return `${startStr} - ${endStr}`
    }
    
    return startStr
  }
  
  return (
    <div className="card group transition-all duration-300 overflow-hidden h-full flex flex-col">
      {/* Image */}
      <div className="relative overflow-hidden rounded-t-lg h-48">
        {event.image_url ? (
          <img 
            src={event.image_url} 
            alt={event.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-primary-400 to-secondary-500 flex items-center justify-center">
            <span className="text-white text-xl font-bold">{event.name.charAt(0)}</span>
          </div>
        )}
        
        {/* Category tag */}
        {event.category && (
          <span className="absolute top-2 right-2 bg-primary-500 text-white text-xs px-2 py-1 rounded-full">
            {event.category}
          </span>
        )}
      </div>
      
      {/* Content */}
      <div className="p-4 flex-grow flex flex-col">
        <h3 className="text-lg font-bold mb-2 line-clamp-2 text-gray-800">
          {event.name}
        </h3>
        
        <div className="mb-3 text-sm text-gray-600 flex-grow">
          <div className="flex items-center mb-1">
            <FiCalendar className="mr-2 text-primary-500" />
            <span>
              {formatDateRange(event.date_start, event.date_end)}
            </span>
          </div>
          
          <div className="flex items-center mb-1">
            <FiMapPin className="mr-2 text-primary-500" />
            <span className="truncate">{event.location}</span>
          </div>
          
          {event.category && (
            <div className="flex items-center">
              <FiTag className="mr-2 text-primary-500" />
              <span>{event.category}</span>
            </div>
          )}
        </div>
        
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
          {event.description}
        </p>
        
        <Link
          to={`/events/${event.id}`}
          className="btn-primary text-center mt-auto"
        >
          View Details
        </Link>
      </div>
    </div>
  )
}

export default EventCard