import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useSupabase } from '../context/SupabaseContext'
import { useAuth } from '../context/AuthContext'
import { FiPlus, FiFilter, FiX } from 'react-icons/fi'
import EventCard from '../components/events/EventCard'
import SearchBar from '../components/ui/SearchBar'
import LoadingSpinner from '../components/ui/LoadingSpinner'

const Events = () => {
  const { supabase } = useSupabase()
  const { currentUser } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  
  const [events, setEvents] = useState([])
  const [filteredEvents, setFilteredEvents] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeFilters, setActiveFilters] = useState({
    query: searchParams.get('query') || '',
    location: searchParams.get('location') || '',
    date: searchParams.get('date') ? new Date(searchParams.get('date')) : null,
    category: searchParams.get('category') || '',
  })
  
  // Fetch events
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .order('date_start', { ascending: true })
        
        if (error) throw error
        
        setEvents(data || [])
        
        // Get unique categories
        const uniqueCategories = [...new Set(data.map(event => event.category).filter(Boolean))]
        setCategories(uniqueCategories)
        
        // Apply initial filters from URL params
        handleFilterEvents({
          query: searchParams.get('query') || '',
          location: searchParams.get('location') || '',
          date: searchParams.get('date') ? new Date(searchParams.get('date')) : null,
          category: searchParams.get('category') || '',
        })
      } catch (error) {
        console.error('Error fetching events:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchEvents()
  }, [supabase, searchParams])
  
  // Filter events based on search params
  const handleFilterEvents = (filters) => {
    const { query, location, date, category } = filters
    
    setActiveFilters(filters)
    
    let filtered = [...events]
    
    // Filter by search query
    if (query) {
      const searchTerms = query.toLowerCase().split(' ')
      filtered = filtered.filter(event => {
        return searchTerms.every(term => 
          event.name.toLowerCase().includes(term) || 
          (event.description && event.description.toLowerCase().includes(term))
        )
      })
    }
    
    // Filter by location
    if (location) {
      filtered = filtered.filter(event => 
        event.location.toLowerCase().includes(location.toLowerCase())
      )
    }
    
    // Filter by date
    if (date) {
      const filterDate = new Date(date)
      filterDate.setHours(0, 0, 0, 0)
      
      filtered = filtered.filter(event => {
        const startDate = new Date(event.date_start)
        const endDate = new Date(event.date_end)
        
        return (
          (startDate <= filterDate && filterDate <= endDate) || 
          startDate.toDateString() === filterDate.toDateString()
        )
      })
    }
    
    // Filter by category
    if (category) {
      filtered = filtered.filter(event => 
        event.category === category
      )
    }
    
    setFilteredEvents(filtered)
  }
  
  // Clear all filters
  const clearFilters = () => {
    setActiveFilters({
      query: '',
      location: '',
      date: null,
      category: '',
    })
    
    // Clear URL params
    setSearchParams({})
    
    // Reset to all events
    setFilteredEvents(events)
  }
  
  // Update URL params when filters change
  useEffect(() => {
    const newParams = new URLSearchParams()
    
    if (activeFilters.query) newParams.set('query', activeFilters.query)
    if (activeFilters.location) newParams.set('location', activeFilters.location)
    if (activeFilters.date) newParams.set('date', activeFilters.date.toISOString())
    if (activeFilters.category) newParams.set('category', activeFilters.category)
    
    setSearchParams(newParams, { replace: true })
  }, [activeFilters, setSearchParams])
  
  // Check if any filters are active
  const hasActiveFilters = 
    activeFilters.query || 
    activeFilters.location || 
    activeFilters.date || 
    activeFilters.category
    
  // Show filtered events if there are any, otherwise show all events
  const displayEvents = hasActiveFilters ? filteredEvents : events
  
  return (
    <div className="min-h-screen pt-20 pb-12 bg-gray-50">
      <div className="container-custom">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Events</h1>
            <p className="text-gray-600">
              Browse and discover cultural events, festivals, and temple activities
            </p>
          </div>
          
          {currentUser && (
            <Link to="/create-event" className="btn-primary mt-4 md:mt-0 flex items-center justify-center">
              <FiPlus className="mr-2" />
              Create Event
            </Link>
          )}
        </div>
        
        {/* Search and Filters */}
        <div className="mb-8">
          <SearchBar 
            onSearch={handleFilterEvents} 
            type="events"
            categories={categories}
          />
          
          {/* Active filters */}
          {hasActiveFilters && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-gray-700 flex items-center">
                <FiFilter className="mr-1" />
                Active Filters:
              </span>
              
              {activeFilters.query && (
                <span className="bg-gray-100 text-gray-800 text-sm px-3 py-1 rounded-full flex items-center">
                  Search: {activeFilters.query}
                </span>
              )}
              
              {activeFilters.location && (
                <span className="bg-gray-100 text-gray-800 text-sm px-3 py-1 rounded-full flex items-center">
                  Location: {activeFilters.location}
                </span>
              )}
              
              {activeFilters.date && (
                <span className="bg-gray-100 text-gray-800 text-sm px-3 py-1 rounded-full flex items-center">
                  Date: {activeFilters.date.toLocaleDateString()}
                </span>
              )}
              
              {activeFilters.category && (
                <span className="bg-gray-100 text-gray-800 text-sm px-3 py-1 rounded-full flex items-center">
                  Category: {activeFilters.category}
                </span>
              )}
              
              <button 
                className="text-sm text-primary-600 hover:text-primary-800 flex items-center"
                onClick={clearFilters}
              >
                <FiX className="mr-1" />
                Clear All
              </button>
            </div>
          )}
        </div>
        
        {/* Events Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : displayEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {displayEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-lg shadow-sm">
            {hasActiveFilters ? (
              <>
                <h3 className="text-xl font-bold text-gray-800 mb-2">No events match your filters</h3>
                <p className="text-gray-600 mb-4">Try adjusting your search criteria or clear the filters</p>
                <button 
                  onClick={clearFilters}
                  className="btn-primary"
                >
                  Clear All Filters
                </button>
              </>
            ) : (
              <>
                <h3 className="text-xl font-bold text-gray-800 mb-2">No events available</h3>
                <p className="text-gray-600 mb-4">Be the first to create an event</p>
                {currentUser ? (
                  <Link to="/create-event" className="btn-primary">
                    Create Event
                  </Link>
                ) : (
                  <p className="text-gray-600">Sign in to create events</p>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Events