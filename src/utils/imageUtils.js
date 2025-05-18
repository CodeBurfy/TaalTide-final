import imageCompression from 'browser-image-compression'

/**
 * Processes an image for upload - compresses and converts to WebP
 * @param {File} file - The image file to process
 * @returns {Promise<Object>} Object containing the processed file and dataURL
 */
export const processImage = async (file) => {
  if (!file) return null
  
  try {
    // Compress the image
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1200,
      useWebWorker: true,
    }
    
    const compressedFile = await imageCompression(file, options)
    
    // Convert to WebP
    const bitmap = await createImageBitmap(compressedFile)
    const canvas = document.createElement('canvas')
    canvas.width = bitmap.width
    canvas.height = bitmap.height
    
    const ctx = canvas.getContext('2d')
    ctx.drawImage(bitmap, 0, 0)
    
    // Get WebP data URL
    const webpDataUrl = canvas.toDataURL('image/webp', 0.85)
    
    // Convert data URL to File
    const webpBlob = await fetch(webpDataUrl).then(r => r.blob())
    const webpFile = new File(
      [webpBlob], 
      `${file.name.split('.')[0]}.webp`, 
      { type: 'image/webp' }
    )
    
    return {
      file: webpFile,
      dataUrl: webpDataUrl
    }
  } catch (error) {
    console.error('Error processing image:', error)
    return null
  }
}

/**
 * Uploads an image to Supabase storage
 * @param {Object} supabase - Supabase client
 * @param {File} file - The processed image file to upload
 * @param {string} bucket - The storage bucket to upload to
 * @param {string} path - The file path within the bucket
 * @returns {Promise<string>} The URL of the uploaded image
 */
export const uploadImage = async (supabase, file, bucket, path) => {
  if (!file) return null
  
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true
      })
    
    if (error) {
      throw error
    }
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path)
    
    return publicUrl
  } catch (error) {
    console.error('Error uploading image:', error)
    return null
  }
}