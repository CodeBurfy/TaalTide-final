import { Link } from 'react-router-dom'
import { FiInstagram, FiTwitter, FiFacebook } from 'react-icons/fi'

const Footer = () => {
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className="bg-gray-900 text-white pt-12 pb-8">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Logo and brief description */}
          <div>
            <Link to="/" className="text-2xl font-bold text-white flex items-center mb-4">
              <span className="text-primary-400">Taal</span>Tide
            </Link>
            <p className="text-gray-400 mb-4">
              Your one-stop platform for discovering and managing cultural events, 
              activities, and connecting with vendors.
            </p>
            <div className="flex space-x-4">
              <a 
                href="#" 
                className="text-gray-400 hover:text-primary-400 transition-colors"
                aria-label="Instagram"
              >
                <FiInstagram className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="text-gray-400 hover:text-primary-400 transition-colors"
                aria-label="Twitter"
              >
                <FiTwitter className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="text-gray-400 hover:text-primary-400 transition-colors"
                aria-label="Facebook"
              >
                <FiFacebook className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          {/* Quick links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white border-b border-gray-700 pb-2">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/events" 
                  className="text-gray-400 hover:text-primary-400 transition-colors"
                >
                  Browse Events
                </Link>
              </li>
              <li>
                <Link 
                  to="/vendors" 
                  className="text-gray-400 hover:text-primary-400 transition-colors"
                >
                  Find Vendors
                </Link>
              </li>
              <li>
                <Link 
                  to="/create-event" 
                  className="text-gray-400 hover:text-primary-400 transition-colors"
                >
                  Host an Event
                </Link>
              </li>
              <li>
                <Link 
                  to="/create-vendor" 
                  className="text-gray-400 hover:text-primary-400 transition-colors"
                >
                  Register as Vendor
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Contact information */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white border-b border-gray-700 pb-2">
              Contact Us
            </h3>
            <ul className="space-y-2 text-gray-400">
              <li>Email: info@taaltide.com</li>
              <li>Phone: +1 (123) 456-7890</li>
              <li>Address: 123 Event Street, City, Country</li>
            </ul>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="text-center pt-6 mt-6 border-t border-gray-800 text-gray-500 text-sm">
          <p>© {currentYear} TaalTide. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer