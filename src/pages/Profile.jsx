import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useSupabase } from '../context/SupabaseContext'
import { useAuth } from '../context/AuthContext'
import { FiPlus, FiCalendar, FiShoppingBag } from 'react-icons/fi'
import EventCard from '../components/events/EventCard'
import VendorCard from '../components/vendors/VendorCard'
import LoadingSpinner from '../components/ui/LoadingSpinner'

const Profile = () => {
  const { supabase } = useSupabase()
  const { currentUser } = useAuth()
  
  const [userEvents, setUserEvents] = useState([])
  const [userVendors, setUserVendors] = useState([])
  const [activeTab, setActiveTab] = useState('events')
  const [loading, setLoading] = useState(true)
  
  // Fetch user's events and vendors
  useEffect(() => {
    const fetchUserContent = async () => {
      if (!currentUser) return
      
      setLoading(true)
      try {
        // Fetch user's events
        const { data: eventsData, error: eventsError } = await supabase
          .from('events')
          .select('*')
          .eq('created_by', currentUser.uid)
          .order('created_at', { ascending: false })
        
        if (eventsError) throw eventsError
        
        setUserEvents(eventsData || [])
        
        // Fetch user's vendors
        const { data: vendorsData, error: vendorsError } = await supabase
          .from('vendors')
          .select('*')
          .eq('created_by', currentUser.uid)
          .order('created_at', { ascending: false })
        
        if (vendorsError) throw vendorsError
        
        setUserVendors(vendorsData || [])
      } catch (error) {
        console.error('Error fetching user content:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchUserContent()
  }, [supabase, currentUser])
  
  return (
    <div className="min-h-screen pt-24 pb-12 bg-gray-50">
      <div className="container-custom">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
          <p className="text-gray-600">
            Manage your events and vendors
          </p>
        </div>
        
        {/* User Info */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8 flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
            {currentUser?.photoURL ? (
              <img 
                src={currentUser.photoURL} 
                alt={currentUser.displayName || 'User'} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-primary-500 flex items-center justify-center text-white text-3xl font-bold">
                {currentUser?.displayName?.charAt(0) || currentUser?.email?.charAt(0) || 'U'}
              </div>
            )}
          </div>
          
          {/* User Details */}
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              {currentUser?.displayName || 'User'}
            </h2>
            <p className="text-gray-600 mb-4">{currentUser?.email}</p>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/create-event" className="btn-primary flex items-center justify-center">
                <FiPlus className="mr-2" />
                Create Event
              </Link>
              <Link to="/create-vendor" className="btn-secondary flex items-center justify-center">
                <FiPlus className="mr-2" />
                Register Vendor
              </Link>
            </div>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('events')}
              className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'events'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FiCalendar className="mr-2" />
              <span>My Events</span>
              <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                {userEvents.length}
              </span>
            </button>
            
            <button
              onClick={() => setActiveTab('vendors')}
              className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'vendors'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FiShoppingBag className="mr-2" />
              <span>My Vendors</span>
              <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                {userVendors.length}
              </span>
            </button>
          </nav>
        </div>
        
        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div>
            {/* Events Tab */}
            {activeTab === 'events' && (
              <div>
                {userEvents.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {userEvents.map(event => (
                      <EventCard key={event.id} event={event} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-white rounded-lg shadow-sm">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">No events created yet</h3>
                    <p className="text-gray-600 mb-4">Create your first event to get started</p>
                    <Link to="/create-event" className="btn-primary">
                      Create Event
                    </Link>
                  </div>
                )}
              </div>
            )}
            
            {/* Vendors Tab */}
            {activeTab === 'vendors' && (
              <div>
                {userVendors.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {userVendors.map(vendor => (
                      <VendorCard 
                        key={vendor.id} 
                        vendor={vendor} 
                        featured={vendor.is_featured}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-white rounded-lg shadow-sm">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">No vendors created yet</h3>
                    <p className="text-gray-600 mb-4">Register your first vendor to get started</p>
                    <Link to="/create-vendor" className="btn-primary">
                      Register as Vendor
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Profile