import React, { useState } from 'react';
import { MessageCircle, Phone, X } from 'lucide-react';

const LiveChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);

  const phoneNumber = '254745242174';
  const whatsappMessage = encodeURIComponent('Hello! I would like to inquire about your products.');

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <div className="bg-white rounded-lg shadow-2xl mb-4 p-4 w-64 border border-gray-200">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-semibold text-gray-800">Contact Us</h3>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-2">
            <a
              href={`https://wa.me/${phoneNumber}?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center w-full p-2 text-sm bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              WhatsApp Chat
            </a>
            <a
              href={`tel:+${phoneNumber}`}
              className="flex items-center w-full p-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              <Phone className="w-4 h-4 mr-2" />
              Call Now
            </a>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            We're here to help! Choose your preferred way to contact us.
          </p>
        </div>
      )}
      
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 animate-pulse"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    </div>
  );
};

export default LiveChatWidget;