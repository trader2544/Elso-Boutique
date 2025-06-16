
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="bg-gradient-to-br from-pink-50 via-white to-purple-50 border-t border-pink-200/50 backdrop-blur-xl">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">EA</span>
              </div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                Elso Atelier
              </h3>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              Your premier destination for quality fashion and lifestyle products. 
              Discover elegance, style, and exceptional craftsmanship with every purchase.
            </p>
            <div className="flex space-x-4">
              {/* Social Media Icons */}
              <a 
                href="#" 
                className="w-10 h-10 bg-gradient-to-r from-pink-100 to-purple-100 rounded-lg flex items-center justify-center text-pink-600 hover:from-pink-200 hover:to-purple-200 transition-all duration-300 hover:scale-110 shadow-sm"
                aria-label="Twitter"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
              </a>
              <a 
                href="#" 
                className="w-10 h-10 bg-gradient-to-r from-pink-100 to-purple-100 rounded-lg flex items-center justify-center text-pink-600 hover:from-pink-200 hover:to-purple-200 transition-all duration-300 hover:scale-110 shadow-sm"
                aria-label="Facebook"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                </svg>
              </a>
              <a 
                href="#" 
                className="w-10 h-10 bg-gradient-to-r from-pink-100 to-purple-100 rounded-lg flex items-center justify-center text-pink-600 hover:from-pink-200 hover:to-purple-200 transition-all duration-300 hover:scale-110 shadow-sm"
                aria-label="Instagram"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.098.119.112.223.083.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.749-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.012.001z.017-.001z"/>
                </svg>
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-bold text-gray-800 text-lg">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <button 
                  onClick={() => navigate("/")} 
                  className="text-gray-600 hover:text-pink-600 transition-colors duration-200 text-sm font-medium hover:translate-x-1 transform transition-transform"
                >
                  Home
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate("/about")} 
                  className="text-gray-600 hover:text-pink-600 transition-colors duration-200 text-sm font-medium hover:translate-x-1 transform transition-transform"
                >
                  About Us
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate("/cart")} 
                  className="text-gray-600 hover:text-pink-600 transition-colors duration-200 text-sm font-medium hover:translate-x-1 transform transition-transform"
                >
                  Shopping Cart
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate("/wishlist")} 
                  className="text-gray-600 hover:text-pink-600 transition-colors duration-200 text-sm font-medium hover:translate-x-1 transform transition-transform"
                >
                  Wishlist
                </button>
              </li>
            </ul>
          </div>
          
          {/* Customer Service */}
          <div className="space-y-4">
            <h4 className="font-bold text-gray-800 text-lg">Customer Service</h4>
            <ul className="space-y-3">
              <li>
                <button 
                  onClick={() => navigate("/profile")} 
                  className="text-gray-600 hover:text-pink-600 transition-colors duration-200 text-sm font-medium hover:translate-x-1 transform transition-transform"
                >
                  My Account
                </button>
              </li>
              <li>
                <a 
                  href="https://wa.me/254773482210" 
                  className="text-gray-600 hover:text-pink-600 transition-colors duration-200 text-sm font-medium hover:translate-x-1 transform transition-transform inline-flex items-center"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Contact Support
                  <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-gray-600 hover:text-pink-600 transition-colors duration-200 text-sm font-medium hover:translate-x-1 transform transition-transform"
                >
                  Returns & Exchanges
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-gray-600 hover:text-pink-600 transition-colors duration-200 text-sm font-medium hover:translate-x-1 transform transition-transform"
                >
                  Shipping Info
                </a>
              </li>
            </ul>
          </div>
          
          {/* Legal & Policies */}
          <div className="space-y-4">
            <h4 className="font-bold text-gray-800 text-lg">Legal & Policies</h4>
            <ul className="space-y-3">
              <li>
                <button 
                  onClick={() => navigate("/terms")} 
                  className="text-gray-600 hover:text-pink-600 transition-colors duration-200 text-sm font-medium hover:translate-x-1 transform transition-transform"
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate("/privacy")} 
                  className="text-gray-600 hover:text-pink-600 transition-colors duration-200 text-sm font-medium hover:translate-x-1 transform transition-transform"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate("/cookies")} 
                  className="text-gray-600 hover:text-pink-600 transition-colors duration-200 text-sm font-medium hover:translate-x-1 transform transition-transform"
                >
                  Cookie Policy
                </button>
              </li>
              <li>
                <a 
                  href="https://telvix.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-purple-600 transition-colors duration-200 text-sm font-medium hover:translate-x-1 transform transition-transform inline-flex items-center"
                >
                  Powered by Telvix
                  <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Bottom Section */}
        <div className="border-t border-pink-200/50 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
              <p className="text-sm text-gray-600">
                © 2025 Elso Atelier. All rights reserved.
              </p>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <span>Secure payments with</span>
                <div className="flex items-center space-x-1">
                  <div className="w-8 h-5 bg-green-600 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">M</span>
                  </div>
                  <span className="font-medium text-green-600">M-Pesa</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <span>Made with ❤️ in Kenya</span>
              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
              <a 
                href="https://telvix.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-purple-600 transition-colors duration-200 font-medium"
              >
                Powered by Telvix
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
