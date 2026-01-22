import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, User, Search, Menu, X, Settings } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';

const Header = () => {
  const { user, signOut } = useAuth();
  const { cartCount } = useCart();
  const { wishlistItems } = useWishlist();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    { name: 'Outfits', href: '/?category=Outfits' },
    { name: 'Jewelry', href: '/?category=Jewelry' },
    { name: 'Bags', href: '/?category=Bags' },
    { name: 'Accessories', href: '/?category=Accessories' },
  ];

  return (
    <motion.header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-lg' 
          : 'bg-transparent'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4">
        {/* Main header */}
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <motion.div 
              className="w-12 h-12 rounded-full overflow-hidden border-2 border-pink-400 shadow-lg group-hover:border-pink-500 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <img 
                src="/lovable-uploads/348f1448-0870-4006-b782-dfb9a8d5927f.png" 
                alt="ELSO Boutique" 
                className="w-full h-full object-cover"
              />
            </motion.div>
            <span className={`hidden md:block font-bold text-xl tracking-tight transition-colors ${
              scrolled ? 'text-gray-900' : 'text-white drop-shadow-lg'
            }`}>
              ELSO <span className="text-pink-500">BOUTIQUE</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {categories.map((category) => (
              <Link 
                key={category.name}
                to={category.href} 
                className={`relative font-medium transition-colors group ${
                  scrolled ? 'text-gray-700 hover:text-pink-600' : 'text-white/90 hover:text-white'
                }`}
              >
                {category.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-pink-500 group-hover:w-full transition-all duration-300"></span>
              </Link>
            ))}
          </nav>

          {/* Right side icons */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Search */}
            <motion.button 
              className={`p-2 rounded-full transition-colors ${
                scrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white hover:bg-white/10'
              }`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Search size={20} />
            </motion.button>

            {/* Admin */}
            {isAdmin && (
              <Link to="/admin">
                <motion.div 
                  className={`p-2 rounded-full transition-colors ${
                    scrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white hover:bg-white/10'
                  }`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Settings size={20} />
                </motion.div>
              </Link>
            )}

            {/* Wishlist */}
            <Link to="/wishlist">
              <motion.div 
                className={`relative p-2 rounded-full transition-colors ${
                  scrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white hover:bg-white/10'
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Heart size={20} />
                <AnimatePresence>
                  {wishlistItems.length > 0 && (
                    <motion.span 
                      className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      {wishlistItems.length}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </Link>

            {/* Cart */}
            <Link to="/cart">
              <motion.div 
                className={`relative p-2 rounded-full transition-colors ${
                  scrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white hover:bg-white/10'
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ShoppingCart size={20} />
                <AnimatePresence>
                  {cartCount > 0 && (
                    <motion.span 
                      className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      {cartCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </Link>

            {/* User menu */}
            <div className="relative group">
              <motion.button 
                className={`p-2 rounded-full transition-colors ${
                  scrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white hover:bg-white/10'
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <User size={20} />
              </motion.button>
              <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 overflow-hidden">
                {user ? (
                  <>
                    <Link to="/profile" className="block px-4 py-3 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition-colors">
                      My Profile
                    </Link>
                    {isAdmin && (
                      <Link to="/admin" className="block px-4 py-3 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition-colors">
                        Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition-colors border-t border-gray-100"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <Link to="/auth" className="block px-4 py-3 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition-colors">
                    Sign In
                  </Link>
                )}
              </div>
            </div>

            {/* Mobile menu button */}
            <motion.button
              className={`lg:hidden p-2 rounded-full transition-colors ${
                scrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white hover:bg-white/10'
              }`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </motion.button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              className="lg:hidden bg-white rounded-2xl shadow-xl mb-4 overflow-hidden"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <nav className="py-4">
                <Link
                  to="/"
                  className="block px-6 py-3 text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition-colors font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Home
                </Link>
                <div className="px-6 py-2">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Categories</p>
                </div>
                {categories.map((category) => (
                  <Link
                    key={category.name}
                    to={category.href}
                    className="block px-6 py-3 text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {category.name}
                  </Link>
                ))}
                <div className="border-t border-gray-100 mt-2 pt-2">
                  <Link
                    to="/about"
                    className="block px-6 py-3 text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    About
                  </Link>
                  <Link
                    to="/contact"
                    className="block px-6 py-3 text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Contact
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="block px-6 py-3 text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Admin Panel
                    </Link>
                  )}
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
};

export default Header;
