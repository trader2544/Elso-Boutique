
import React from 'react';
import { Mail, Phone, MapPin, MessageCircle } from 'lucide-react';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 text-gray-900">Privacy Policy</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Information We Collect</h2>
            <p className="text-gray-600 leading-relaxed">
              At Elso Boutique, we collect information you provide directly to us, such as when you create an account, 
              make a purchase, or contact us. This may include your name, email address, phone number, shipping address, 
              and payment information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">How We Use Your Information</h2>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Process and fulfill your orders</li>
              <li>Send you order confirmations and updates</li>
              <li>Provide customer support</li>
              <li>Send promotional emails (with your consent)</li>
              <li>Improve our services and website</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Information Sharing</h2>
            <p className="text-gray-600 leading-relaxed">
              We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, 
              except as described in this policy. We may share information with trusted service providers who assist us in 
              operating our website and conducting business.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Data Security</h2>
            <p className="text-gray-600 leading-relaxed">
              We implement appropriate security measures to protect your personal information against unauthorized access, 
              alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Cookies</h2>
            <p className="text-gray-600 leading-relaxed">
              Our website uses cookies to enhance your browsing experience. You can choose to disable cookies through your 
              browser settings, though this may affect website functionality.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Your Rights</h2>
            <p className="text-gray-600 leading-relaxed">
              You have the right to access, update, or delete your personal information. You may also opt out of receiving 
              promotional communications from us at any time.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Contact Us</h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              If you have any questions about this Privacy Policy or our data practices, please contact us:
            </p>
            
            <div className="bg-pink-50 rounded-lg p-6 space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-pink-600" />
                <div>
                  <p className="font-medium text-gray-800">Email</p>
                  <a href="mailto:elsokisumu@gmail.com" className="text-pink-600 hover:text-pink-700">
                    elsokisumu@gmail.com
                  </a>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-pink-600" />
                <div>
                  <p className="font-medium text-gray-800">Phone</p>
                  <a href="tel:+254745242174" className="text-pink-600 hover:text-pink-700">
                    +254 745 242174
                  </a>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <MessageCircle className="w-5 h-5 text-pink-600" />
                <div>
                  <p className="font-medium text-gray-800">WhatsApp</p>
                  <a 
                    href="https://wa.me/254745242174" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-pink-600 hover:text-pink-700"
                  >
                    Chat with us on WhatsApp
                  </a>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-pink-600" />
                <div>
                  <p className="font-medium text-gray-800">Location</p>
                  <p className="text-gray-700">Kisumu, Kenya</p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Changes to This Policy</h2>
            <p className="text-gray-600 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new 
              Privacy Policy on this page and updating the "Last Updated" date.
            </p>
          </section>

          <div className="text-center text-sm text-gray-500 pt-8 border-t">
            <p>Last Updated: January 2025</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
