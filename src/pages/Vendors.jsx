import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useSupabase } from '../context/SupabaseContext'
import { useAuth } from '../context/AuthContext'
import { FiPlus, FiFilter, FiX } from 'react-icons/fi'
import VendorCard from '../components/vendors/VendorCard'
import SearchBar from '../components/ui/SearchBar'
import LoadingSpinner from '../components/ui/LoadingSpinner'

const Vendors = () => {
  const { supabase } = useSupabase()
  const { currentUser } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  
  const [vendors, setVendors] = useState([])
  const [filteredVendors, setFilteredVendors] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeFilters, setActiveFilters] = useState({
    query: searchParams.get('query') || '',
    location: searchParams.get('location') || '',
    category: searchParams.get('category') || '',
  })
  
  // Fetch vendors
  useEffect(() => {
    const fetchVendors = async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('vendors')
          .select('*')
          .order('name')
        
        if (error) throw error
        
        setVendors(data || [])
        
        // Get unique categories
        const uniqueCategories = [...new Set(data.map(vendor => vendor.category).filter(Boolean))]
        setCategories(uniqueCategories)
        
        // Apply initial filters from URL params
        handleFilterVendors({
          query: searchParams.get('query') || '',
          location: searchParams.get('location') || '',
          category: searchParams.get('category') || '',
        })
      } catch (error) {
        console.error('Error fetching vendors:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchVendors()
  }, [supabase, searchParams])
  
  // Filter vendors based on search params
  const handleFilterVendors = (filters) => {
    const { query, location, category } = filters
    
    setActiveFilters(filters)
    
    let filtered = [...vendors]
    
    // Filter by search query
    if (query) {
      const searchTerms = query.toLowerCase().split(' ')
      filtered = filtered.filter(vendor => {
        return searchTerms.every(term => 
          vendor.name.toLowerCase().includes(term) || 
          (vendor.description && vendor.description.toLowerCase().includes(term))
        )
      })
    }
    
    // Filter by location
    if (location) {
      filtered = filtered.filter(vendor => 
        vendor.location.toLowerCase().includes(location.toLowerCase())
      )
    }
    
    // Filter by category
    if (category) {
      filtered = filtered.filter(vendor => 
        vendor.category === category
      )
    }
    
    setFilteredVendors(filtered)
  }
  
  // Clear all filters
  const clearFilters = () => {
    setActiveFilters({
      query: '',
      location: '',
      category: '',
    })
    
    // Clear URL params
    setSearchParams({})
    
    // Reset to all vendors
    setFilteredVendors(vendors)
  }
  
  // Update URL params when filters change
  useEffect(() => {
    const newParams = new URLSearchParams()
    
    if (activeFilters.query) newParams.set('query', activeFilters.query)
    if (activeFilters.location) newParams.set('location', activeFilters.location)
    if (activeFilters.category) newParams.set('category', activeFilters.category)
    
    setSearchParams(newParams, { replace: true })
  }, [activeFilters, setSearchParams])
  
  // Check if any filters are active
  const hasActiveFilters = 
    activeFilters.query || 
    activeFilters.location || 
    activeFilters.category
    
  // Show filtered vendors if there are any, otherwise show all vendors
  const displayVendors = hasActiveFilters ? filteredVendors : vendors
  
  return (
    <div className="min-h-screen pt-20 pb-12 bg-gray-50">
      <div className="container-custom">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Vendors</h1>
            <p className="text-gray-600">
              Find and connect with vendors for your events
            </p>
          </div>
          
          {currentUser && (
            <Link to="/create-vendor" className="btn-primary mt-4 md:mt-0 flex items-center justify-center">
              <FiPlus className="mr-2" />
              Register as Vendor
            </Link>
          )}
        </div>
        
        {/* Search and Filters */}
        <div className="mb-8">
          <SearchBar 
            onSearch={handleFilterVendors} 
            type="vendors"
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
        
        {/* Vendors Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : displayVendors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {displayVendors.map(vendor => (
              <VendorCard 
                key={vendor.id} 
                vendor={vendor} 
                featured={vendor.is_featured}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-lg shadow-sm">
            {hasActiveFilters ? (
              <>
                <h3 className="text-xl font-bold text-gray-800 mb-2">No vendors match your filters</h3>
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
                <h3 className="text-xl font-bold text-gray-800 mb-2">No vendors available</h3>
                <p className="text-gray-600 mb-4">Be the first to register as a vendor</p>
                {currentUser ? (
                  <Link to="/create-vendor" className="btn-primary">
                    Register as Vendor
                  </Link>
                ) : (
                  <p className="text-gray-600">Sign in to register as a vendor</p>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Vendors