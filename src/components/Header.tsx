
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, User, Search, Menu, X, Settings } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const Header = () => {
  const { user, signOut } = useAuth();
  const { cartCount } = useCart();
  const { wishlistItems } = useWishlist();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if user is admin
  useEffect(() => {
    const checkAdminRole = async () => {
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        
        setIsAdmin(profile?.role === 'admin');
      } else {
        setIsAdmin(false);
      }
    };

    checkAdminRole();
  }, [user]);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const categories = [
    { name: 'Dresses', href: '/?category=Dresses' },
    { name: 'Shoes', href: '/?category=Shoes' },
    { name: 'Bags', href: '/?category=Bags' },
    { name: 'Jewelry', href: '/?category=Jewelry' },
    { name: 'Accessories', href: '/?category=Accessories' },
  ];

  return (
    <header className="bg-white/90 backdrop-blur-sm border-b border-pink-100 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        {/* Top bar */}
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-pink-300 hover:border-pink-400 transition-colors">
              <img 
                src="/lovable-uploads/348f1448-0870-4006-b782-dfb9a8d5927f.png" 
                alt="ELSO Boutique" 
                className="w-full h-full object-cover"
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-pink-600 transition-colors">Home</Link>
            <Link to="/about" className="text-gray-700 hover:text-pink-600 transition-colors">About</Link>
            <Link to="/contact" className="text-gray-700 hover:text-pink-600 transition-colors">Contact</Link>
          </nav>

          {/* Right side icons */}
          <div className="flex items-center space-x-4">
            {/* Search icon */}
            <button className="text-gray-700 hover:text-pink-600 transition-colors">
              <Search size={20} />
            </button>

            {/* Admin icon - only show for admin users */}
            {isAdmin && (
              <Link to="/admin" className="text-gray-700 hover:text-pink-600 transition-colors">
                <Settings size={20} />
              </Link>
            )}

            {/* Wishlist */}
            <Link to="/wishlist" className="relative text-gray-700 hover:text-pink-600 transition-colors">
              <Heart size={20} />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link to="/cart" className="relative text-gray-700 hover:text-pink-600 transition-colors">
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User menu */}
            <div className="relative group">
              <button className="text-gray-700 hover:text-pink-600 transition-colors">
                <User size={20} />
              </button>
              <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                {user ? (
                  <>
                    <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600">
                      My Profile
                    </Link>
                    {isAdmin && (
                      <Link to="/admin" className="block px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600">
                        Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <Link to="/auth" className="block px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600">
                    Sign In
                  </Link>
                )}
              </div>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden text-gray-700 hover:text-pink-600 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-pink-100 py-4">
            <nav className="flex flex-col space-y-3">
              <Link
                to="/"
                className="text-gray-700 hover:text-pink-600 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/about"
                className="text-gray-700 hover:text-pink-600 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link
                to="/contact"
                className="text-gray-700 hover:text-pink-600 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="text-gray-700 hover:text-pink-600 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Admin Panel
                </Link>
              )}
              <div className="border-t border-pink-100 pt-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Categories</p>
                {categories.map((category) => (
                  <Link
                    key={category.name}
                    to={category.href}
                    className="block py-2 text-gray-700 hover:text-pink-600 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
