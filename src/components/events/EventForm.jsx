import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSupabase } from '../../context/SupabaseContext'
import { useAuth } from '../../context/AuthContext'
import { FiUpload, FiX, FiInfo } from 'react-icons/fi'
import DatePicker from 'react-datepicker'
import { processImage, uploadImage } from '../../utils/imageUtils'
import toast from 'react-hot-toast'
import 'react-datepicker/dist/react-datepicker.css'

const EventForm = ({ event, mode = 'create' }) => {
  const { supabase } = useSupabase()
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  
  const [categories, setCategories] = useState([])
  const [previewImage, setPreviewImage] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    dateRange: [new Date(), new Date(new Date().setDate(new Date().getDate() + 1))],
    category: '',
    image: null,
  })
  
  // Load event data if in edit mode
  useEffect(() => {
    if (mode === 'edit' && event) {
      setFormData({
        name: event.name || '',
        description: event.description || '',
        location: event.location || '',
        dateRange: [
          event.date_start ? new Date(event.date_start) : new Date(),
          event.date_end ? new Date(event.date_end) : new Date(new Date().setDate(new Date().getDate() + 1))
        ],
        category: event.category || '',
        image: null,
      })
      
      if (event.image_url) {
        setPreviewImage(event.image_url)
      }
    }
  }, [event, mode])
  
  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('events')
          .select('category')
          .not('category', 'is', null)
        
        if (error) throw error
        
        const uniqueCategories = [...new Set(data.map(item => item.category).filter(Boolean))]
        setCategories(uniqueCategories)
      } catch (error) {
        console.error('Error fetching categories:', error)
      }
    }
    
    fetchCategories()
  }, [supabase])
  
  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }
  
  // Handle date range changes
  const handleDateRangeChange = (dates) => {
    const [start, end] = dates
    setFormData(prev => ({ ...prev, dateRange: [start, end || start] }))
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
    if (mode === 'edit' && event?.image_url) {
      setPreviewImage(event.image_url)
    } else {
      setPreviewImage(null)
    }
  }
  
  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!currentUser) {
      toast.error('You must be signed in to create or edit events')
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const [startDate, endDate] = formData.dateRange
      
      // Validate dates
      if (!startDate || !endDate) {
        toast.error('Please select start and end dates')
        setIsSubmitting(false)
        return
      }
      
      // Prepare event data
      let eventData = {
        title: formData.name,
        description: formData.description,
        location: formData.location,
        date_start: startDate.toISOString(),
        date_end: endDate.toISOString(),
        category: formData.category || null,
        user_id: currentUser?.uid || null, // Make sure to set user_id
      }
      
      // Process image if provided
      if (formData.image) {
        const processedImage = await processImage(formData.image)
        
        if (processedImage) {
          // Upload to Supabase storage
          const imagePath = `events/${currentUser.uid}/${Date.now()}_${formData.image.name.split('.')[0]}.webp`
          const imageUrl = await uploadImage(supabase, processedImage.file, 'images', imagePath)
          
          if (imageUrl) {
            eventData.image_url = imageUrl
          }
        }
      }
      
      let response
      
      if (mode === 'create') {
        // Add user_id field for new events
        eventData.user_id = currentUser.uid
        
        // Insert new event
        response = await supabase
          .from('events')
          .insert(eventData)
          .select()
          .single()
      } else {
        // Update existing event
        response = await supabase
          .from('events')
          .update(eventData)
          .eq('id', event.id)
          .select()
          .single()
      }
      
      if (response.error) throw response.error
      
      toast.success(`Event ${mode === 'create' ? 'created' : 'updated'} successfully!`)
      
      // Redirect to event details page
      navigate(`/events/${response.data.id}`)
    } catch (error) {
      console.error(`Error ${mode}ing event:`, error)
      toast.error(`Failed to ${mode} event. Please try again.`)
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Event Name *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="input w-full"
          placeholder="Enter event name"
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
          placeholder="Describe your event"
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
      
      {/* Date Range */}
      <div>
        <label htmlFor="dateRange" className="block text-sm font-medium text-gray-700 mb-1">
          Event Dates *
        </label>
        <DatePicker
          selected={formData.dateRange[0]}
          onChange={handleDateRangeChange}
          startDate={formData.dateRange[0]}
          endDate={formData.dateRange[1]}
          selectsRange
          inline
          className="input w-full"
        />
        <div className="mt-2 text-sm text-gray-600 flex items-center">
          <FiInfo className="mr-1" />
          <span>
            {formData.dateRange[0]?.toLocaleDateString()} -&nbsp;
            {formData.dateRange[1]?.toLocaleDateString() || 'Select end date'}
          </span>
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
            <option value="Cultural">Cultural</option>
            <option value="Religious">Religious</option>
            <option value="Festival">Festival</option>
            <option value="Exhibition">Exhibition</option>
            <option value="Food">Food</option>
            <option value="Music">Music</option>
            <option value="Dance">Dance</option>
            <option value="Other">Other</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>
      </div>
      
      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Event Image
        </label>
        
        {previewImage ? (
          <div className="relative mb-4">
            <img 
              src={previewImage} 
              alt="Event preview" 
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
          {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Event' : 'Update Event'}
        </button>
      </div>
    </form>
  )
}

export default EventForm