import { useState, useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { FiMenu, FiX, FiUser, FiLogIn, FiLogOut } from 'react-icons/fi'

const Navbar = ({ isScrolled }) => {
  const { currentUser, signInWithGoogle, signOut } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const location = useLocation()
  
  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false)
  }, [location.pathname])

  // Apply navbar styles based on scroll position
  const navbarClasses = `fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
    isScrolled ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'
  }`
  
  // Active link styles
  const activeLinkClass = "text-primary-600 font-medium"
  const linkClass = "text-gray-700 hover:text-primary-500 transition-colors"

  return (
    <nav className={navbarClasses}>
      <div className="container-custom flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-primary-500 flex items-center">
          <span className="text-secondary-800">Taal</span>Tide
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <NavLink 
            to="/" 
            end
            className={({ isActive }) => isActive ? activeLinkClass : linkClass}
          >
            Home
          </NavLink>
          <NavLink 
            to="/events" 
            className={({ isActive }) => isActive ? activeLinkClass : linkClass}
          >
            Events
          </NavLink>
          <NavLink 
            to="/vendors" 
            className={({ isActive }) => isActive ? activeLinkClass : linkClass}
          >
            Vendors
          </NavLink>
          
          {/* Auth buttons */}
          {currentUser ? (
            <div className="relative">
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-2 text-gray-700 hover:text-primary-500"
              >
                {currentUser.photoURL ? (
                  <img 
                    src={currentUser.photoURL} 
                    alt="Profile" 
                    className="w-8 h-8 rounded-full object-cover border-2 border-primary-300"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                    <FiUser className="text-primary-600" />
                  </div>
                )}
                <span className="font-medium">
                  {currentUser.displayName?.split(' ')[0] || 'User'}
                </span>
              </button>
              
              {/* Dropdown menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-10 animate-fade-in">
                  <Link 
                    to="/profile" 
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link 
                    to="/create-event" 
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Create Event
                  </Link>
                  <Link 
                    to="/create-vendor" 
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Create Vendor
                  </Link>
                  <button 
                    onClick={() => {
                      signOut()
                      setIsDropdownOpen(false)
                    }}
                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    <div className="flex items-center space-x-2">
                      <FiLogOut />
                      <span>Sign Out</span>
                    </div>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button 
              onClick={signInWithGoogle}
              className="btn-primary flex items-center space-x-2"
            >
              <FiLogIn />
              <span>Sign In</span>
            </button>
          )}
        </div>
        
        {/* Mobile menu button */}
        <button
          className="md:hidden text-gray-700"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? (
            <FiX className="h-6 w-6" />
          ) : (
            <FiMenu className="h-6 w-6" />
          )}
        </button>
      </div>
      
      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 animate-slide-up">
          <div className="container-custom py-4 space-y-3">
            <NavLink 
              to="/" 
              end
              className={({ isActive }) => 
                `block py-2 ${isActive ? activeLinkClass : linkClass}`
              }
            >
              Home
            </NavLink>
            <NavLink 
              to="/events" 
              className={({ isActive }) => 
                `block py-2 ${isActive ? activeLinkClass : linkClass}`
              }
            >
              Events
            </NavLink>
            <NavLink 
              to="/vendors" 
              className={({ isActive }) => 
                `block py-2 ${isActive ? activeLinkClass : linkClass}`
              }
            >
              Vendors
            </NavLink>
            
            {/* Auth options for mobile */}
            {currentUser ? (
              <div className="pt-2 border-t border-gray-100">
                <div className="flex items-center space-x-3 mb-3">
                  {currentUser.photoURL ? (
                    <img 
                      src={currentUser.photoURL} 
                      alt="Profile" 
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                      <FiUser className="text-primary-600" />
                    </div>
                  )}
                  <span className="font-medium">
                    {currentUser.displayName || currentUser.email}
                  </span>
                </div>
                <Link 
                  to="/profile" 
                  className="block py-2 text-gray-700 hover:text-primary-500"
                >
                  Profile
                </Link>
                <Link 
                  to="/create-event" 
                  className="block py-2 text-gray-700 hover:text-primary-500"
                >
                  Create Event
                </Link>
                <Link 
                  to="/create-vendor" 
                  className="block py-2 text-gray-700 hover:text-primary-500"
                >
                  Create Vendor
                </Link>
                <button 
                  onClick={signOut}
                  className="flex items-center space-x-2 py-2 text-gray-700 hover:text-primary-500"
                >
                  <FiLogOut />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <button 
                onClick={signInWithGoogle}
                className="btn-primary mt-2 w-full flex items-center justify-center space-x-2"
              >
                <FiLogIn />
                <span>Sign In with Google</span>
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar