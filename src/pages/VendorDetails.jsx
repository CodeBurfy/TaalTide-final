import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useSupabase } from '../context/SupabaseContext'
import { useAuth } from '../context/AuthContext'
import { FiMapPin, FiTag, FiPhone, FiEdit2, FiTrash2, FiChevronLeft, FiCalendar, FiStar } from 'react-icons/fi'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

const VendorDetails = () => {
  const { id } = useParams()
  const { supabase } = useSupabase()
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  
  const [vendor, setVendor] = useState(null)
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isOwner, setIsOwner] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  
  // Fetch vendor and associated event
  useEffect(() => {
    const fetchVendorDetails = async () => {
      try {
        setLoading(true)
        
        // Fetch vendor
        const { data: vendorData, error: vendorError } = await supabase
          .from('vendors')
          .select('*')
          .eq('id', id)
          .single()
        
        if (vendorError) throw vendorError
        
        if (!vendorData) {
          toast.error('Vendor not found')
          navigate('/vendors')
          return
        }
        
        setVendor(vendorData)
        setIsOwner(currentUser && vendorData.created_by === currentUser.uid)
        
        // Fetch associated event if any
        if (vendorData.event_id) {
          const { data: eventData, error: eventError } = await supabase
            .from('events')
            .select('*')
            .eq('id', vendorData.event_id)
            .single()
          
          if (!eventError) {
            setEvent(eventData)
          }
        }
      } catch (error) {
        console.error('Error fetching vendor details:', error)
        toast.error('Failed to load vendor details')
      } finally {
        setLoading(false)
      }
    }
    
    fetchVendorDetails()
  }, [id, supabase, navigate, currentUser])
  
  // Handle vendor deletion
  const handleDeleteVendor = async () => {
    try {
      const { error } = await supabase
        .from('vendors')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      toast.success('Vendor deleted successfully')
      navigate('/vendors')
    } catch (error) {
      console.error('Error deleting vendor:', error)
      toast.error('Failed to delete vendor')
    } finally {
      setShowDeleteModal(false)
    }
  }
  
  // Format date range for event
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
                to="/vendors" 
                className="inline-flex items-center text-primary-600 hover:text-primary-800"
              >
                <FiChevronLeft className="mr-1" />
                Back to Vendors
              </Link>
            </div>
            
            {/* Vendor details */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              {/* Main info */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                  {/* Image */}
                  <div className="relative h-64 bg-gradient-to-r from-secondary-600 to-accent-600">
                    {vendor.image_url ? (
                      <img 
                        src={vendor.image_url} 
                        alt={vendor.name}
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <h2 className="text-white text-3xl font-bold">{vendor.name}</h2>
                      </div>
                    )}
                    
                    {/* Featured badge */}
                    {vendor.is_featured && (
                      <div className="absolute top-4 left-4 bg-primary-500 text-white px-3 py-1 rounded-full flex items-center">
                        <FiStar className="mr-1" />
                        Featured Vendor
                      </div>
                    )}
                    
                    {/* Owner actions */}
                    {isOwner && (
                      <div className="absolute top-4 right-4 flex space-x-2">
                        <Link 
                          to={`/edit-vendor/${id}`}
                          className="bg-white/90 text-primary-600 hover:bg-white p-2 rounded-full"
                          title="Edit Vendor"
                        >
                          <FiEdit2 />
                        </Link>
                        <button
                          onClick={() => setShowDeleteModal(true)}
                          className="bg-white/90 text-red-600 hover:bg-white p-2 rounded-full"
                          title="Delete Vendor"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="p-6 md:p-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">{vendor.name}</h1>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div className="flex items-center text-gray-600">
                        <FiMapPin className="mr-2 text-primary-500" />
                        <span>{vendor.location}</span>
                      </div>
                      
                      {vendor.category && (
                        <div className="flex items-center text-gray-600">
                          <FiTag className="mr-2 text-primary-500" />
                          <span>{vendor.category}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="border-t border-gray-200 pt-6 mb-6">
                      <h2 className="text-xl font-bold mb-4">About This Vendor</h2>
                      <p className="text-gray-700 whitespace-pre-line">
                        {vendor.description || 'No description provided.'}
                      </p>
                    </div>
                    
                    {vendor.contact_info && (
                      <div className="border-t border-gray-200 pt-6">
                        <h2 className="text-xl font-bold mb-4">Contact Information</h2>
                        <div className="flex items-center text-gray-600">
                          <FiPhone className="mr-2 text-primary-500" />
                          <span>{vendor.contact_info}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Sidebar */}
              <div className="lg:col-span-1">
                {/* Associated Event */}
                {event ? (
                  <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
                    <div className="p-6">
                      <h2 className="text-xl font-bold mb-4">Associated Event</h2>
                      
                      {event.image_url && (
                        <div className="mb-4">
                          <img 
                            src={event.image_url} 
                            alt={event.name}
                            className="w-full h-40 object-cover rounded-lg" 
                          />
                        </div>
                      )}
                      
                      <h3 className="text-lg font-semibold mb-2">{event.name}</h3>
                      
                      <div className="space-y-2 text-gray-600 mb-4">
                        <div className="flex items-center">
                          <FiCalendar className="mr-2 text-primary-500" />
                          <span>{formatDateRange(event.date_start, event.date_end)}</span>
                        </div>
                        
                        <div className="flex items-center">
                          <FiMapPin className="mr-2 text-primary-500" />
                          <span>{event.location}</span>
                        </div>
                      </div>
                      
                      <Link 
                        to={`/events/${event.id}`}
                        className="btn-primary w-full text-center"
                      >
                        View Event Details
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                    <h2 className="text-xl font-bold mb-2">Standalone Vendor</h2>
                    <p className="text-gray-600">
                      This vendor is not associated with any specific event.
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full animate-fade-in">
                  <h3 className="text-xl font-bold mb-4">Delete Vendor</h3>
                  <p className="mb-6 text-gray-700">
                    Are you sure you want to delete this vendor? This action cannot be undone.
                  </p>
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setShowDeleteModal(false)}
                      className="btn-outline"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeleteVendor}
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

export default VendorDetails