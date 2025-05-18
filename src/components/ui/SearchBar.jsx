import { useState } from 'react'
import { FiSearch, FiX, FiMapPin, FiCalendar, FiTag } from 'react-icons/fi'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

const SearchBar = ({ onSearch, type = 'events', categories = [] }) => {
  const [searchParams, setSearchParams] = useState({
    query: '',
    location: '',
    date: null,
    category: '',
  })
  
  const [showFilters, setShowFilters] = useState(false)
  
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setSearchParams(prev => ({ ...prev, [name]: value }))
  }
  
  const handleDateChange = (date) => {
    setSearchParams(prev => ({ ...prev, date }))
  }
  
  const handleSearch = (e) => {
    e.preventDefault()
    onSearch(searchParams)
  }
  
  const clearSearch = () => {
    setSearchParams({
      query: '',
      location: '',
      date: null,
      category: '',
    })
    onSearch({
      query: '',
      location: '',
      date: null,
      category: '',
    })
  }

  return (
    <div className="w-full">
      <form 
        onSubmit={handleSearch}
        className="relative"
      >
        <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white shadow-sm">
          <div className="flex-grow flex items-center px-3 py-2">
            <FiSearch className="text-gray-400 mr-2" />
            <input
              type="text"
              name="query"
              value={searchParams.query}
              onChange={handleInputChange}
              placeholder={`Search ${type}...`}
              className="w-full focus:outline-none"
            />
          </div>
          
          <button 
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 border-l border-gray-300 font-medium text-sm ${
              showFilters ? 'bg-gray-100 text-primary-600' : 'text-gray-700'
            }`}
          >
            Filters
          </button>
          
          <button 
            type="submit"
            className="bg-primary-500 text-white px-5 py-2 font-medium text-sm"
          >
            Search
          </button>
        </div>
        
        {showFilters && (
          <div className="mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-4 grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in">
            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center mb-1">
                <FiMapPin className="mr-1" />
                Location
              </label>
              <input
                type="text"
                name="location"
                value={searchParams.location}
                onChange={handleInputChange}
                placeholder="Enter location..."
                className="input w-full"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center mb-1">
                <FiCalendar className="mr-1" />
                Date
              </label>
              <DatePicker
                selected={searchParams.date}
                onChange={handleDateChange}
                dateFormat="MMMM d, yyyy"
                placeholderText="Select date..."
                className="input w-full"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center mb-1">
                <FiTag className="mr-1" />
                Category
              </label>
              <select
                name="category"
                value={searchParams.category}
                onChange={handleInputChange}
                className="input w-full"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="md:col-span-3 flex justify-end mt-2">
              <button
                type="button"
                onClick={clearSearch}
                className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
              >
                <FiX className="mr-1" />
                Clear
              </button>
              <button
                type="submit"
                className="btn-primary"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  )
}

export default SearchBar