import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useSupabase } from '../context/SupabaseContext'
import { useAuth } from '../context/AuthContext'
import VendorForm from '../components/vendors/VendorForm'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

const ManageVendor = () => {
  const { id } = useParams()
  const { supabase } = useSupabase()
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  
  const [vendor, setVendor] = useState(null)
  const [loading, setLoading] = useState(id ? true : false)
  
  // Check if user is authenticated
  useEffect(() => {
    if (!currentUser) {
      toast.error('You must be signed in to manage vendors')
      navigate('/')
    }
  }, [currentUser, navigate])
  
  // Fetch vendor data if in edit mode
  useEffect(() => {
    const fetchVendor = async () => {
      if (!id) return
      
      try {
        setLoading(true)
        
        const { data, error } = await supabase
          .from('vendors')
          .select('*')
          .eq('id', id)
          .single()
        
        if (error) throw error
        
        if (!data) {
          toast.error('Vendor not found')
          navigate('/vendors')
          return
        }
        
        // Check if user is authorized to edit
        if (data.created_by !== currentUser?.uid) {
          toast.error('You are not authorized to edit this vendor')
          navigate('/vendors')
          return
        }
        
        setVendor(data)
      } catch (error) {
        console.error('Error fetching vendor:', error)
        toast.error('Failed to load vendor')
        navigate('/vendors')
      } finally {
        setLoading(false)
      }
    }
    
    fetchVendor()
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
              {mode === 'create' ? 'Register as Vendor' : 'Edit Vendor Profile'}
            </h1>
            <p className="text-gray-600">
              {mode === 'create' 
                ? 'Fill out the form below to register as a vendor' 
                : 'Update your vendor information'
              }
            </p>
          </div>
          
          {/* Content */}
          {loading ? (
            <div className="flex justify-center py-20">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6">
              <VendorForm vendor={vendor} mode={mode} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ManageVendor