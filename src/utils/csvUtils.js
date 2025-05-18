import Papa from 'papaparse'

/**
 * Parse a CSV file and return an array of vendor objects
 * @param {File} file - The CSV file to parse
 * @returns {Promise<Array>} Array of parsed vendor objects
 */
export const parseVendorsCsv = (file) => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        // Map CSV fields to vendor object properties
        const vendors = results.data.map(vendor => {
          return {
            name: vendor.name || '',
            description: vendor.description || '',
            location: vendor.location || '',
            contact_info: vendor.contact_info || '',
            category: vendor.category || '',
            image_url: vendor.image_url || null,
            is_featured: vendor.is_featured === 'true' || false,
          }
        })
        
        resolve(vendors)
      },
      error: (error) => {
        reject(error)
      }
    })
  })
}

/**
 * Validate CSV data for vendors
 * @param {Array} vendors - Array of parsed vendor objects
 * @returns {Object} Object containing valid vendors and errors
 */
export const validateVendors = (vendors) => {
  const validVendors = []
  const errors = []
  
  vendors.forEach((vendor, index) => {
    // Check for required fields
    if (!vendor.name) {
      errors.push(`Row ${index + 1}: Vendor name is required`)
    }
    
    if (!vendor.location) {
      errors.push(`Row ${index + 1}: Vendor location is required`)
    }
    
    // Add to valid vendors if no errors
    if (vendor.name && vendor.location) {
      validVendors.push(vendor)
    }
  })
  
  return { validVendors, errors }
}

/**
 * Generate a CSV template for vendors
 * @returns {string} CSV string with headers
 */
export const generateVendorCsvTemplate = () => {
  const headers = [
    'name',
    'description',
    'location',
    'contact_info',
    'category',
    'image_url',
    'is_featured'
  ]
  
  // Create an empty row as an example
  const exampleRow = {
    name: 'Vendor Name',
    description: 'Description of vendor',
    location: 'City, State',
    contact_info: 'phone or email',
    category: 'Food',
    image_url: 'https://example.com/image.jpg',
    is_featured: 'false'
  }
  
  return Papa.unparse([exampleRow], { header: true })
}