
import React from 'react';
import { SEOHead } from '@/components/SEOHead';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle, Mail, MapPin, Clock, Phone } from 'lucide-react';

const Contact = () => {
  const handleWhatsAppClick = () => {
    window.open('https://wa.me/254700000000', '_blank');
  };

  return (
    <>
      <SEOHead 
        title="Contact Us - Elso Boutique"
        description="Get in touch with Elso Boutique. Contact us via WhatsApp, email, or visit our store. We're here to help with all your fashion needs."
        keywords="contact Elso Boutique, customer service, WhatsApp, fashion boutique contact"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-16">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-pink-700 mb-6">
              Contact Us
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              We'd love to hear from you! Get in touch with our team for any questions, 
              support, or fashion advice. We're here to help make your shopping experience exceptional.
            </p>
          </div>

          {/* Contact Methods Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {/* WhatsApp */}
            <Card className="text-center shadow-lg border-pink-200 hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <MessageCircle className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle className="text-xl text-pink-700">WhatsApp</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Chat with us instantly for quick responses to your questions
                </p>
                <Button 
                  onClick={handleWhatsAppClick}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Start Chat
                </Button>
              </CardContent>
            </Card>

            {/* Email */}
            <Card className="text-center shadow-lg border-pink-200 hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Mail className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl text-pink-700">Email</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Send us detailed inquiries or feedback
                </p>
                <a 
                  href="mailto:info@elsoboutique.com"
                  className="text-pink-600 hover:text-pink-700 font-medium"
                >
                  info@elsoboutique.com
                </a>
              </CardContent>
            </Card>

            {/* Phone */}
            <Card className="text-center shadow-lg border-pink-200 hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <Phone className="w-8 h-8 text-purple-600" />
                </div>
                <CardTitle className="text-xl text-pink-700">Phone</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Call us for immediate assistance
                </p>
                <a 
                  href="tel:+254700000000"
                  className="text-pink-600 hover:text-pink-700 font-medium"
                >
                  +254 700 000 000
                </a>
              </CardContent>
            </Card>
          </div>

          {/* Business Hours & Location */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Card className="shadow-lg border-pink-200">
              <CardHeader className="bg-gradient-to-r from-pink-50 to-purple-50">
                <CardTitle className="text-pink-700 flex items-center">
                  <Clock className="mr-3 text-pink-500" />
                  Business Hours
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monday - Friday</span>
                    <span className="font-medium">9:00 AM - 7:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Saturday</span>
                    <span className="font-medium">9:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sunday</span>
                    <span className="font-medium">10:00 AM - 4:00 PM</span>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-4">
                  * Online orders are processed 24/7
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-pink-200">
              <CardHeader className="bg-gradient-to-r from-pink-50 to-purple-50">
                <CardTitle className="text-pink-700 flex items-center">
                  <MapPin className="mr-3 text-pink-500" />
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <p className="text-gray-700">
                    <strong>Elso Boutique</strong><br />
                    123 Fashion Street<br />
                    Nairobi, Kenya<br />
                    00100
                  </p>
                  <p className="text-sm text-gray-600">
                    We offer nationwide delivery across Kenya with fast and reliable shipping.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* FAQ Section */}
          <Card className="shadow-lg border-pink-200">
            <CardHeader className="bg-gradient-to-r from-pink-50 to-purple-50">
              <CardTitle className="text-2xl text-pink-700 text-center">
                Frequently Asked Questions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-pink-700 mb-2">How can I track my order?</h3>
                  <p className="text-gray-600">
                    Once your order is shipped, you'll receive a tracking number via SMS and email. 
                    You can also check your order status in your account dashboard.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-pink-700 mb-2">What is your return policy?</h3>
                  <p className="text-gray-600">
                    We offer a 30-day return policy for unworn items in their original condition. 
                    Contact us to initiate a return process.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-pink-700 mb-2">Do you offer size exchanges?</h3>
                  <p className="text-gray-600">
                    Yes! We offer free size exchanges within 14 days of purchase. 
                    Items must be unworn and in original condition.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-pink-700 mb-2">How long does delivery take?</h3>
                  <p className="text-gray-600">
                    Within Nairobi: 1-2 business days<br />
                    Other major cities: 2-3 business days<br />
                    Remote areas: 3-5 business days
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CTA Section */}
          <div className="text-center mt-16">
            <h3 className="text-2xl font-bold text-pink-700 mb-4">
              Ready to Get in Touch?
            </h3>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              We're always here to help! Whether you have questions about products, 
              need styling advice, or want to share feedback, don't hesitate to reach out.
            </p>
            <Button 
              onClick={handleWhatsAppClick}
              size="lg"
              className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <MessageCircle className="mr-2" />
              Contact Us Now
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Contact;
