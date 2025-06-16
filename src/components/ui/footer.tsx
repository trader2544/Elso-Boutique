
import { Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-pink-50 to-purple-50 border-t border-pink-100 mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Elso Atelier
            </h3>
            <p className="text-gray-600 mb-4">
              Your destination for premium fashion and lifestyle products. 
              We curate the finest collection to help you express your unique style.
            </p>
            <div className="flex items-center text-sm text-gray-500">
              Made with <Heart className="w-4 h-4 mx-1 text-pink-500" /> for fashion lovers
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a href="/about" className="text-gray-600 hover:text-pink-600 transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="/profile" className="text-gray-600 hover:text-pink-600 transition-colors">
                  My Account
                </a>
              </li>
              <li>
                <a href="/wishlist" className="text-gray-600 hover:text-pink-600 transition-colors">
                  Wishlist
                </a>
              </li>
              <li>
                <a href="/cart" className="text-gray-600 hover:text-pink-600 transition-colors">
                  Shopping Cart
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Contact</h4>
            <ul className="space-y-2 text-gray-600">
              <li>📧 team@elso-atelier.com</li>
              <li>📱 +254 773 482 210</li>
              <li>📍 Nairobi, Kenya</li>
              <li>
                <a 
                  href="https://wa.me/254773482210" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-green-600 hover:text-green-700 transition-colors"
                >
                  💬 WhatsApp Support
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-pink-200 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-500 text-sm mb-4 md:mb-0">
            © 2025 Elso Atelier. All rights reserved.
          </div>
          <div className="flex space-x-6 text-sm">
            <a href="/privacy" className="text-gray-500 hover:text-pink-600 transition-colors">
              Privacy Policy
            </a>
            <a href="/terms" className="text-gray-500 hover:text-pink-600 transition-colors">
              Terms of Service
            </a>
            <a href="/shipping" className="text-gray-500 hover:text-pink-600 transition-colors">
              Shipping Info
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
