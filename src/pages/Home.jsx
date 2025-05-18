import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useSupabase } from '../context/SupabaseContext'
import { FiCalendar, FiMapPin, FiSearch, FiShoppingBag } from 'react-icons/fi'
import EventCard from '../components/events/EventCard'
import VendorCard from '../components/vendors/VendorCard'
import SearchBar from '../components/ui/SearchBar'
import LoadingSpinner from '../components/ui/LoadingSpinner'

const Home = () => {
  const { supabase } = useSupabase()
  const [featuredEvents, setFeaturedEvents] = useState([])
  const [featuredVendors, setFeaturedVendors] = useState([])
  const [categories, setCategories] = useState([])
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Get event categories and locations for search filters
  useEffect(() => {
    const fetchCategoriesAndLocations = async () => {
      try {
        // Fetch categories
        const { data: eventCategories } = await supabase
          .from('events')
          .select('category')
          .not('category', 'is', null)
        
        const { data: vendorCategories } = await supabase
          .from('vendors')
          .select('category')
          .not('category', 'is', null)
        
        // Combine and deduplicate categories with null checks
        const allCategories = [
          ...(eventCategories?.map(item => item.category) || []),
          ...(vendorCategories?.map(item => item.category) || [])
        ]
        setCategories([...new Set(allCategories)])
        
        // Fetch locations
        const { data: eventLocations } = await supabase
          .from('events')
          .select('location')
          .not('location', 'is', null)
        
        const { data: vendorLocations } = await supabase
          .from('vendors')
          .select('location')
          .not('location', 'is', null)
        
        // Combine and deduplicate locations with null checks
        const allLocations = [
          ...(eventLocations?.map(item => item.location) || []),
          ...(vendorLocations?.map(item => item.location) || [])
        ]
        setLocations([...new Set(allLocations)])
      } catch (error) {
        console.error('Error fetching categories and locations:', error)
      }
    }
    
    fetchCategoriesAndLocations()
  }, [supabase])
  
  // Fetch featured events and vendors
  useEffect(() => {
    const fetchFeaturedItems = async () => {
      setLoading(true)
      try {
        // Get current date
        const currentDate = new Date().toISOString()
        
        // Fetch upcoming events
        const { data: events } = await supabase
          .from('events')
          .select('*')
          .gte('date_end', currentDate)
          .order('date_start', { ascending: true })
          .limit(3)
        
        setFeaturedEvents(events || [])
        
        // Fetch featured vendors
        const { data: vendors } = await supabase
          .from('vendors')
          .select('*')
          .eq('is_featured', true)
          .limit(4)
        
        setFeaturedVendors(vendors || [])
      } catch (error) {
        console.error('Error fetching featured items:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchFeaturedItems()
  }, [supabase])
  
  const handleSearch = (searchParams) => {
    // Redirect to events/vendors page with search params
    const { query, location, date, category } = searchParams
    const searchUrl = new URL(`${window.location.origin}/events`)
    
    if (query) searchUrl.searchParams.append('query', query)
    if (location) searchUrl.searchParams.append('location', location)
    if (date) searchUrl.searchParams.append('date', date.toISOString())
    if (category) searchUrl.searchParams.append('category', category)
    
    window.location.href = searchUrl.toString()
  }
  
  return (
    <div>
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-r from-blue-600 to-blue-400 text-white">
        <div className="container-custom relative z-10">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight animate-fade-in">
              Discover Cultural Events and Vendors
            </h1>
            <p className="text-xl text-white/90 mb-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              Find and connect with local events, temple activities, and vendors all in one place.
            </p>
            
            {/* Search Bar */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <SearchBar 
                onSearch={handleSearch} 
                type="events and vendors"
                categories={categories}
              />
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mt-10 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <div className="bg-white/10 backdrop-blur-md rounded-lg p-4">
                <FiCalendar className="w-6 h-6 mx-auto mb-2" />
                <p className="text-sm font-medium">Events</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-lg p-4">
                <FiShoppingBag className="w-6 h-6 mx-auto mb-2" />
                <p className="text-sm font-medium">Vendors</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-lg p-4">
                <FiMapPin className="w-6 h-6 mx-auto mb-2" />
                <p className="text-sm font-medium">Locations</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-lg p-4">
                <FiSearch className="w-6 h-6 mx-auto mb-2" />
                <p className="text-sm font-medium">Categories</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Featured Events Section */}
      <section className="py-12 bg-gray-50">
        <div className="container-custom">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                Upcoming Events
              </h2>
              <p className="text-gray-600 mt-1">
                Discover exciting cultural events happening soon
              </p>
            </div>
            <Link to="/events" className="btn-secondary">
              View All
            </Link>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-20">
              <LoadingSpinner size="lg" />
            </div>
          ) : featuredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredEvents.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-white rounded-lg shadow-sm">
              <p className="text-gray-500">No upcoming events found.</p>
              <Link to="/create-event" className="btn-primary inline-block mt-4">
                Create Event
              </Link>
            </div>
          )}
        </div>
      </section>
      
      {/* Featured Vendors Section */}
      <section className="py-12 bg-white">
        <div className="container-custom">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                Featured Vendors
              </h2>
              <p className="text-gray-600 mt-1">
                Top-rated vendors for your events
              </p>
            </div>
            <Link to="/vendors" className="btn-secondary">
              View All
            </Link>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-20">
              <LoadingSpinner size="lg" />
            </div>
          ) : featuredVendors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {featuredVendors.map(vendor => (
                <VendorCard key={vendor.id} vendor={vendor} featured={true} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-gray-50 rounded-lg shadow-sm">
              <p className="text-gray-500">No featured vendors available.</p>
              <Link to="/create-vendor" className="btn-primary inline-block mt-4">
                Register as Vendor
              </Link>
            </div>
          )}
        </div>
      </section>
      
      {/* How It Works Section */}
      <section className="py-12 bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              How It Works
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our platform makes it easy to find events and connect with vendors
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-card text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiSearch className="text-primary-600 w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Search & Discover</h3>
              <p className="text-gray-600">
                Find events and vendors based on your preferences, location, and dates.
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-card text-center">
              <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiCalendar className="text-secondary-600 w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Create Events</h3>
              <p className="text-gray-600">
                Easily create and manage your own events and add vendors to them.
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-card text-center">
              <div className="w-16 h-16 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiShoppingBag className="text-accent-600 w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Connect with Vendors</h3>
              <p className="text-gray-600">
                Find the perfect vendors for your events or register as a vendor yourself.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-12 bg-primary-500 text-white">
        <div className="container-custom text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Ready to get started?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Create your own events or register as a vendor to connect with our community.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/create-event" className="btn bg-white text-primary-600 hover:bg-gray-100">
              Create Event
            </Link>
            <Link to="/create-vendor" className="btn bg-secondary-700 text-white hover:bg-secondary-800">
              Register as Vendor
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home