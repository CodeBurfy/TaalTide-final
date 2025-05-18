const LoadingSpinner = ({ size = 'md', fullscreen = false }) => {
  // Size variants
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  }
  
  const spinnerClass = `${sizeClasses[size]} rounded-full border-t-primary-500 border-r-primary-300 border-b-primary-100 border-l-primary-300 animate-spin`
  
  if (fullscreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className={spinnerClass}></div>
      </div>
    )
  }
  
  return <div className={spinnerClass}></div>
}

export default LoadingSpinner