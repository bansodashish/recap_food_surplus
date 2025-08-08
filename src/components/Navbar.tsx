import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Leaf, User, ShoppingCart, Crown, LogOut } from 'lucide-react';
import { cn } from '../utils';
import { useAuth } from '../contexts/AuthContext';

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Browse', href: '/browse' },
  { name: 'Request', href: '/request' },
  { name: 'Donate', href: '/donate' },
  { name: 'Sell', href: '/sell' },
  { name: 'About', href: '/about' },
  { name: 'Sustainability', href: '/sustainability' },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <Leaf className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">
                Recap Food
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:ml-6 md:flex md:items-center md:space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'px-3 py-2 text-sm font-medium transition-colors duration-200',
                  location.pathname === item.href
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-gray-700 hover:text-primary-600 hover:border-b-2 hover:border-primary-300'
                )}
              >
                {item.name}
              </Link>
            ))}
            
            <div className="flex items-center space-x-4 ml-6 pl-6 border-l border-gray-200">
              <button className="p-2 text-gray-400 hover:text-gray-500">
                <ShoppingCart className="h-6 w-6" />
              </button>
              
              {user ? (
                <div className="flex items-center space-x-4">
                  <Link
                    to="/subscription"
                    className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors duration-200"
                  >
                    <Crown className="h-4 w-4" />
                    <span>
                      {user.subscriptionPlan === 'free' ? 'Upgrade' : 
                       user.subscriptionPlan === 'premium' ? 'Premium' : 'Enterprise'}
                    </span>
                  </Link>
                  
                  <Link
                    to="/profile"
                    className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors duration-200"
                  >
                    <User className="h-4 w-4" />
                    <span>{user.name}</span>
                  </Link>
                  
                  <button
                    onClick={handleSignOut}
                    className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors duration-200"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md transition-colors duration-200"
                >
                  <User className="h-4 w-4" />
                  <span>Login</span>
                </Link>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              {isOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'block px-3 py-2 text-base font-medium rounded-md transition-colors duration-200',
                  location.pathname === item.href
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                )}
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="border-t border-gray-200 pt-4">
              {user ? (
                <div className="space-y-2">
                  <Link
                    to="/subscription"
                    className="flex items-center space-x-2 px-3 py-2 text-base font-medium text-primary-600 hover:text-primary-700 rounded-md mx-3"
                    onClick={() => setIsOpen(false)}
                  >
                    <Crown className="h-4 w-4" />
                    <span>
                      {user.subscriptionPlan === 'free' ? 'Upgrade Plan' : 
                       user.subscriptionPlan === 'premium' ? 'Premium Plan' : 'Enterprise Plan'}
                    </span>
                  </Link>
                  
                  <Link
                    to="/profile"
                    className="flex items-center space-x-2 px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 rounded-md mx-3"
                    onClick={() => setIsOpen(false)}
                  >
                    <User className="h-4 w-4" />
                    <span>{user.name}</span>
                  </Link>
                  
                  <button
                    onClick={() => {
                      handleSignOut();
                      setIsOpen(false);
                    }}
                    className="flex items-center space-x-2 px-3 py-2 text-base font-medium text-gray-500 hover:text-gray-700 rounded-md mx-3 w-full text-left"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center space-x-2 px-3 py-2 text-base font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md mx-3"
                  onClick={() => setIsOpen(false)}
                >
                  <User className="h-4 w-4" />
                  <span>Login</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
