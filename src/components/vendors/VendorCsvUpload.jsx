import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSupabase } from '../../context/SupabaseContext'
import { useAuth } from '../../context/AuthContext'
import { FiUpload, FiDownload, FiAlertCircle, FiCheckCircle } from 'react-icons/fi'
import { parseVendorsCsv, validateVendors, generateVendorCsvTemplate } from '../../utils/csvUtils'
import toast from 'react-hot-toast'

const VendorCsvUpload = ({ eventId }) => {
  const { supabase } = useSupabase()
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  
  const [isUploading, setIsUploading] = useState(false)
  const [csvFile, setCsvFile] = useState(null)
  const [uploadSummary, setUploadSummary] = useState(null)
  
  // Handle CSV file selection
  const handleCsvChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    // Check file type
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      toast.error('Please select a CSV file')
      return
    }
    
    setCsvFile(file)
  }
  
  // Download template CSV
  const downloadTemplate = () => {
    const csvContent = generateVendorCsvTemplate()
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.setAttribute('href', url)
    a.setAttribute('download', 'vendor_template.csv')
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }
  
  // Upload and process CSV
  const handleUpload = async () => {
    if (!csvFile) {
      toast.error('Please select a CSV file')
      return
    }
    
    if (!currentUser) {
      toast.error('You must be signed in to upload vendors')
      return
    }
    
    setIsUploading(true)
    
    try {
      // Parse CSV file
      const vendors = await parseVendorsCsv(csvFile)
      
      // Validate vendors
      const { validVendors, errors } = validateVendors(vendors)
      
      if (errors.length > 0) {
        setUploadSummary({
          success: false,
          total: vendors.length,
          valid: validVendors.length,
          errors
        })
        
        if (validVendors.length === 0) {
          toast.error('No valid vendors found in CSV')
          setIsUploading(false)
          return
        }
      }
      
      // Add event_id and created_by to each vendor
      const vendorsToInsert = validVendors.map(vendor => ({
        ...vendor,
        event_id: eventId,
        created_by: currentUser.uid
      }))
      
      // Insert vendors into database
      const { data, error } = await supabase
        .from('vendors')
        .insert(vendorsToInsert)
        .select()
      
      if (error) throw error
      
      setUploadSummary({
        success: true,
        total: vendors.length,
        valid: validVendors.length,
        inserted: data.length,
        errors: errors
      })
      
      toast.success(`Successfully uploaded ${data.length} vendors`)
    } catch (error) {
      console.error('Error uploading vendors:', error)
      toast.error('Failed to upload vendors. Please try again.')
      
      setUploadSummary({
        success: false,
        error: error.message
      })
    } finally {
      setIsUploading(false)
    }
  }
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-bold mb-4">Bulk Upload Vendors</h3>
      
      {/* Template download */}
      <div className="mb-6">
        <p className="text-sm text-gray-600 mb-2">
          Download our CSV template to get started. Fill in the vendor details and upload the file.
        </p>
        <button
          type="button"
          onClick={downloadTemplate}
          className="flex items-center text-primary-600 hover:text-primary-800"
        >
          <FiDownload className="mr-1" />
          Download Template
        </button>
      </div>
      
      {/* File upload */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Upload CSV File
        </label>
        <div className="flex items-center space-x-3">
          <label className="flex-grow flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
            <FiUpload className="mr-2" />
            <span>{csvFile ? csvFile.name : 'Choose file'}</span>
            <input
              type="file"
              className="sr-only"
              accept=".csv"
              onChange={handleCsvChange}
            />
          </label>
          <button
            type="button"
            onClick={handleUpload}
            disabled={!csvFile || isUploading}
            className={`btn-primary ${(!csvFile || isUploading) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isUploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </div>
      
      {/* Upload Summary */}
      {uploadSummary && (
        <div className={`mt-4 p-4 rounded-lg ${
          uploadSummary.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {uploadSummary.success ? (
                <FiCheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <FiAlertCircle className="h-5 w-5 text-red-500" />
              )}
            </div>
            <div className="ml-3">
              <h3 className={`text-sm font-medium ${
                uploadSummary.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {uploadSummary.success ? 'Upload Successful' : 'Upload Issues'}
              </h3>
              
              <div className="mt-2 text-sm text-gray-700">
                {uploadSummary.total && (
                  <p>Total records: {uploadSummary.total}</p>
                )}
                
                {uploadSummary.valid && (
                  <p>Valid records: {uploadSummary.valid}</p>
                )}
                
                {uploadSummary.inserted && (
                  <p>Inserted records: {uploadSummary.inserted}</p>
                )}
                
                {uploadSummary.error && (
                  <p className="text-red-600">{uploadSummary.error}</p>
                )}
                
                {uploadSummary.errors && uploadSummary.errors.length > 0 && (
                  <div className="mt-2">
                    <p className="font-medium">Errors:</p>
                    <ul className="list-disc pl-5 mt-1 text-xs text-red-700">
                      {uploadSummary.errors.slice(0, 5).map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                      {uploadSummary.errors.length > 5 && (
                        <li>...and {uploadSummary.errors.length - 5} more errors</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default VendorCsvUpload