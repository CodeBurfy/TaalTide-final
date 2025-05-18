import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useSupabase } from '../context/SupabaseContext'
import { useAuth } from '../context/AuthContext'
import EventForm from '../components/events/EventForm'
import VendorCsvUpload from '../components/vendors/VendorCsvUpload'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

const ManageEvent = () => {
  const { id } = useParams()
  const { supabase } = useSupabase()
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(id ? true : false)
  const [showVendorUpload, setShowVendorUpload] = useState(false)
  
  // Check if user is authenticated
  useEffect(() => {
    if (!currentUser) {
      toast.error('You must be signed in to manage events')
      navigate('/')
    }
  }, [currentUser, navigate])
  
  // Fetch event data if in edit mode
  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return
      
      try {
        setLoading(true)
        
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('id', id)
          .single()
        
        if (error) throw error
        
        if (!data) {
          toast.error('Event not found')
          navigate('/events')
          return
        }
        
        // Check if user is authorized to edit
        if (data.created_by !== currentUser?.uid) {
          toast.error('You are not authorized to edit this event')
          navigate('/events')
          return
        }
        
        setEvent(data)
        setShowVendorUpload(true)
      } catch (error) {
        console.error('Error fetching event:', error)
        toast.error('Failed to load event')
        navigate('/events')
      } finally {
        setLoading(false)
      }
    }
    
    fetchEvent()
  }, [id, supabase, navigate, currentUser])
  
  // Determine if creating or editing
  const mode = id ? 'edit' : 'create'
  
  return (
    <div className="min-h-screen pt-24 pb-12 bg-gray-50">
      <div className="container-custom">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {mode === 'create' ? 'Create Event' : 'Edit Event'}
            </h1>
            <p className="text-gray-600">
              {mode === 'create' 
                ? 'Fill out the form below to create a new event' 
                : 'Update your event information'
              }
            </p>
          </div>
          
          {/* Content */}
          {loading ? (
            <div className="flex justify-center py-20">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <EventForm event={event} mode={mode} />
            </div>
          )}
          
          {/* Vendor CSV Upload (only shown in edit mode) */}
          {showVendorUpload && (
            <div className="mt-8">
              <VendorCsvUpload eventId={id} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ManageEvent