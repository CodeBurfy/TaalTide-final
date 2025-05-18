import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useSupabase } from '../context/SupabaseContext'
import { useAuth } from '../context/AuthContext'
import { FiMapPin, FiCalendar, FiTag, FiEdit2, FiTrash2, FiChevronLeft, FiPlus } from 'react-icons/fi'
import VendorCard from '../components/vendors/VendorCard'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

const EventDetails = () => {
  const { id } = useParams()
  const { supabase } = useSupabase()
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  
  const [event, setEvent] = useState(null)
  const [vendors, setVendors] = useState([])
  const [loading, setLoading] = useState(true)
  const [isOwner, setIsOwner] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  
  // Fetch event and vendors
  useEffect(() => {
    const fetchEventAndVendors = async () => {
      try {
        setLoading(true)
        
        // Fetch event
        const { data: eventData, error: eventError } = await supabase
          .from('events')
          .select('*')
          .eq('id', id)
          .single()
        
        if (eventError) throw eventError
        
        if (!eventData) {
          toast.error('Event not found')
          navigate('/events')
          return
        }
        
        setEvent(eventData)
        setIsOwner(currentUser && eventData.created_by === currentUser.uid)
        
        // Fetch vendors for this event
        const { data: vendorsData, error: vendorsError } = await supabase
          .from('vendors')
          .select('*')
          .eq('event_id', id)
          .order('name')
        
        if (vendorsError) throw vendorsError
        
        setVendors(vendorsData || [])
      } catch (error) {
        console.error('Error fetching event details:', error)
        toast.error('Failed to load event details')
      } finally {
        setLoading(false)
      }
    }
    
    fetchEventAndVendors()
  }, [id, supabase, navigate, currentUser])
  
  // Format date range
  const formatDateRange = (startDate, endDate) => {
    if (!startDate || !endDate) return ''
    
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    const options = { year: 'numeric', month: 'long', day: 'numeric' }
    const startStr = start.toLocaleDateString('en-US', options)
    const endStr = end.toLocaleDateString('en-US', options)
    
    if (startStr === endStr) {
      return startStr
    }
    
    return `${startStr} - ${endStr}`
  }
  
  // Handle event deletion
  const handleDeleteEvent = async () => {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      toast.success('Event deleted successfully')
      navigate('/events')
    } catch (error) {
      console.error('Error deleting event:', error)
      toast.error('Failed to delete event')
    } finally {
      setShowDeleteModal(false)
    }
  }
  
  return (
    <div className="min-h-screen pt-20 pb-12 bg-gray-50">
      <div className="container-custom">
        {loading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
            {/* Back button */}
            <div className="mb-4">
              <Link 
                to="/events" 
                className="inline-flex items-center text-primary-600 hover:text-primary-800"
              >
                <FiChevronLeft className="mr-1" />
                Back to Events
              </Link>
            </div>
            
            {/* Event details */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
              {/* Image */}
              <div className="relative h-64 md:h-96 bg-gradient-to-r from-primary-600 to-secondary-600">
                {event.image_url ? (
                  <img 
                    src={event.image_url} 
                    alt={event.name}
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <h2 className="text-white text-3xl font-bold">{event.name}</h2>
                  </div>
                )}
                
                {/* Owner actions */}
                {isOwner && (
                  <div className="absolute top-4 right-4 flex space-x-2">
                    <Link 
                      to={`/edit-event/${id}`}
                      className="bg-white/90 text-primary-600 hover:bg-white p-2 rounded-full"
                      title="Edit Event"
                    >
                      <FiEdit2 />
                    </Link>
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="bg-white/90 text-red-600 hover:bg-white p-2 rounded-full"
                      title="Delete Event"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                )}
              </div>
              
              {/* Content */}
              <div className="p-6 md:p-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{event.name}</h1>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="flex items-center text-gray-600">
                    <FiCalendar className="mr-2 text-primary-500" />
                    <span>{formatDateRange(event.date_start, event.date_end)}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <FiMapPin className="mr-2 text-primary-500" />
                    <span>{event.location}</span>
                  </div>
                  
                  {event.category && (
                    <div className="flex items-center text-gray-600">
                      <FiTag className="mr-2 text-primary-500" />
                      <span>{event.category}</span>
                    </div>
                  )}
                </div>
                
                <div className="border-t border-gray-200 pt-6 mb-6">
                  <h2 className="text-xl font-bold mb-4">About This Event</h2>
                  <p className="text-gray-700 whitespace-pre-line">
                    {event.description || 'No description provided.'}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Vendors Section */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Vendors at this Event
                </h2>
                
                {isOwner && (
                  <div className="flex space-x-3">
                    <Link 
                      to={`/create-vendor?event=${id}`} 
                      className="btn-outline flex items-center"
                    >
                      <FiPlus className="mr-2" />
                      Add Vendor
                    </Link>
                    <Link 
                      to={`/edit-event/${id}`} 
                      className="btn-primary"
                    >
                      Bulk Upload Vendors
                    </Link>
                  </div>
                )}
              </div>
              
              {vendors.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {vendors.map(vendor => (
                    <VendorCard 
                      key={vendor.id} 
                      vendor={vendor} 
                      featured={vendor.is_featured}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                  <p className="text-gray-500 mb-4">No vendors found for this event.</p>
                  {isOwner && (
                    <div className="flex flex-col md:flex-row items-center justify-center space-y-3 md:space-y-0 md:space-x-3">
                      <Link 
                        to={`/create-vendor?event=${id}`} 
                        className="btn-outline flex items-center"
                      >
                        <FiPlus className="mr-2" />
                        Add Individual Vendor
                      </Link>
                      <Link 
                        to={`/edit-event/${id}`} 
                        className="btn-primary"
                      >
                        Bulk Upload Vendors
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full animate-fade-in">
                  <h3 className="text-xl font-bold mb-4">Delete Event</h3>
                  <p className="mb-6 text-gray-700">
                    Are you sure you want to delete this event? This action cannot be undone.
                  </p>
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setShowDeleteModal(false)}
                      className="btn-outline"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeleteEvent}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default EventDetails