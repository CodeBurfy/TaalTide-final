import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSupabase } from '../../context/SupabaseContext'
import { useAuth } from '../../context/AuthContext'
import { FiUpload, FiX, FiInfo } from 'react-icons/fi'
import { processImage, uploadImage } from '../../utils/imageUtils'
import toast from 'react-hot-toast'

const VendorForm = ({ vendor, mode = 'create' }) => {
  const { supabase } = useSupabase()
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  
  const [events, setEvents] = useState([])
  const [categories, setCategories] = useState([])
  const [previewImage, setPreviewImage] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    contact_info: '',
    instagram_url: '',
    facebook_url: '',
    category: '',
    is_featured: false,
    event_id: '',
    image: null,
  })
  
  // Load vendor data if in edit mode
  useEffect(() => {
    if (mode === 'edit' && vendor) {
      setFormData({
        name: vendor.name || '',
        description: vendor.description || '',
        location: vendor.location || '',
        contact_info: vendor.contact_info || '',
        instagram_url: vendor.instagram_url || '',
        facebook_url: vendor.facebook_url || '',
        category: vendor.category || '',
        is_featured: vendor.is_featured || false,
        event_id: vendor.event_id || '',
        image: null,
      })
      
      if (vendor.image_url) {
        setPreviewImage(vendor.image_url)
      }
    }
  }, [vendor, mode])
  
  // Fetch categories and events
  useEffect(() => {
    const fetchCategoriesAndEvents = async () => {
      try {
        // Fetch vendor categories
        const { data: vendorCategories, error: vendorError } = await supabase
          .from('vendors')
          .select('category')
          .not('category', 'is', null)
        
        if (vendorError) throw vendorError
        
        const uniqueCategories = [...new Set(vendorCategories.map(item => item.category).filter(Boolean))]
        setCategories(uniqueCategories)
        
        // Fetch events (only if user is authenticated)
        if (currentUser) {
          const { data: eventsData, error: eventsError } = await supabase
            .from('events')
            .select('id, name')
            .order('date_start', { ascending: false })
          
          if (eventsError) throw eventsError
          
          setEvents(eventsData || [])
        }
      } catch (error) {
        console.error('Error fetching categories or events:', error)
      }
    }
    
    fetchCategoriesAndEvents()
  }, [supabase, currentUser])
  
  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }
  
  // Handle image selection
  const handleImageChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    // Check file type
    if (!file.type.match('image.*')) {
      toast.error('Please select an image file')
      return
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB')
      return
    }
    
    setFormData(prev => ({ ...prev, image: file }))
    
    try {
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => setPreviewImage(e.target.result)
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Error creating image preview:', error)
      toast.error('Failed to preview image')
    }
  }
  
  // Remove selected image
  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, image: null }))
    
    // If in edit mode and there was an existing image, keep the preview
    if (mode === 'edit' && vendor?.image_url) {
      setPreviewImage(vendor.image_url)
    } else {
      setPreviewImage(null)
    }
  }
  
  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!currentUser) {
      toast.error('You must be signed in to create or edit vendors')
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // Prepare vendor data
      let vendorData = {
        name: formData.name,
        description: formData.description,
        location: formData.location,
        contact_info: formData.contact_info,
        instagram_url: formData.instagram_url || null,
        facebook_url: formData.facebook_url || null,
        category: formData.category || null,
        is_featured: formData.is_featured,
        event_id: formData.event_id || null,
      }
      
      // Process image if provided
      if (formData.image) {
        const processedImage = await processImage(formData.image)
        
        if (processedImage) {
          // Upload to Supabase storage
          const imagePath = `vendors/${currentUser.uid}/${Date.now()}_${formData.image.name.split('.')[0]}.webp`
          const imageUrl = await uploadImage(supabase, processedImage.file, 'images', imagePath)
          
          if (imageUrl) {
            vendorData.image_url = imageUrl
          }
        }
      }
      
      let response
      
      if (mode === 'create') {
        // Add created_by field for new vendors
        vendorData.created_by = currentUser.uid
        
        // Insert new vendor
        response = await supabase
          .from('vendors')
          .insert(vendorData)
          .select()
          .single()
      } else {
        // Update existing vendor
        response = await supabase
          .from('vendors')
          .update(vendorData)
          .eq('id', vendor.id)
          .select()
          .single()
      }
      
      if (response.error) throw response.error
      
      toast.success(`Vendor ${mode === 'create' ? 'created' : 'updated'} successfully!`)
      
      // Redirect to vendor details page
      navigate(`/vendors/${response.data.id}`)
    } catch (error) {
      console.error(`Error ${mode}ing vendor:`, error)
      toast.error(`Failed to ${mode} vendor. Please try again.`)
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Vendor Name *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="input w-full"
          placeholder="Enter vendor name"
        />
      </div>
      
      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          className="input w-full"
          placeholder="Describe your vendor business"
        />
      </div>
      
      {/* Location */}
      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
          Location *
        </label>
        <input
          type="text"
          id="location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          required
          className="input w-full"
          placeholder="City, State or full address"
        />
      </div>
      
      {/* Contact Info */}
      <div>
        <label htmlFor="contact_info" className="block text-sm font-medium text-gray-700 mb-1">
          Contact Information
        </label>
        <input
          type="text"
          id="contact_info"
          name="contact_info"
          value={formData.contact_info}
          onChange={handleChange}
          className="input w-full"
          placeholder="Phone, email, or website"
        />
      </div>

      {/* Instagram URL */}
      <div>
        <label htmlFor="instagram_url" className="block text-sm font-medium text-gray-700 mb-1">
          Instagram (Optional)
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">@</span>
          </div>
          <input
            type="text"
            id="instagram_url"
            name="instagram_url"
            value={formData.instagram_url}
            onChange={handleChange}
            className="input w-full pl-7"
            placeholder="username"
          />
        </div>
      </div>

      {/* Facebook URL */}
      <div className="mt-4">
        <label htmlFor="facebook_url" className="block text-sm font-medium text-gray-700 mb-1">
          Facebook (Optional)
        </label>
        <div className="mt-1">
          <input
            type="text"
            id="facebook_url"
            name="facebook_url"
            value={formData.facebook_url}
            onChange={handleChange}
            className="input w-full"
            placeholder="https://facebook.com/username"
          />
        </div>
      </div>
      
      {/* Category */}
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
          Category
        </label>
        <div className="relative">
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="input w-full appearance-none pr-10"
          >
            <option value="">Select a category</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
            <option value="Food">Food</option>
            <option value="Crafts">Crafts</option>
            <option value="Art">Art</option>
            <option value="Clothing">Clothing</option>
            <option value="Jewelry">Jewelry</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Services">Services</option>
            <option value="Other">Other</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>
      </div>
      
      {/* Associated Event */}
      <div>
        <label htmlFor="event_id" className="block text-sm font-medium text-gray-700 mb-1">
          Associated Event (Optional)
        </label>
        <div className="relative">
          <select
            id="event_id"
            name="event_id"
            value={formData.event_id}
            onChange={handleChange}
            className="input w-full appearance-none pr-10"
          >
            <option value="">None (Standalone Vendor)</option>
            {events.map(event => (
              <option key={event.id} value={event.id}>
                {event.name}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          If this vendor is part of an event, select it here. Leave empty for standalone vendors.
        </p>
      </div>
      
      {/* Featured Checkbox */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="is_featured"
          name="is_featured"
          checked={formData.is_featured}
          onChange={handleChange}
          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
        />
        <label htmlFor="is_featured" className="ml-2 block text-sm text-gray-700">
          Featured Vendor
        </label>
      </div>
      
      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Vendor Image
        </label>
        
        {previewImage ? (
          <div className="relative mb-4">
            <img 
              src={previewImage} 
              alt="Vendor preview" 
              className="w-full h-48 object-cover rounded-lg"
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
            >
              <FiX />
            </button>
          </div>
        ) : (
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
            <div className="space-y-1 text-center">
              <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600">
                <label htmlFor="image" className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none">
                  <span>Upload an image</span>
                  <input 
                    id="image" 
                    name="image" 
                    type="file" 
                    className="sr-only"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">
                PNG, JPG, GIF up to 5MB
              </p>
            </div>
          </div>
        )}
        
        <p className="mt-2 text-sm text-gray-500">
          The image will be converted to WebP format for optimization.
        </p>
      </div>
      
      {/* Submit Button */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="btn-outline"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Vendor' : 'Update Vendor'}
        </button>
      </div>
    </form>
  )
}

export default VendorForm