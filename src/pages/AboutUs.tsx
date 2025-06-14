
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Phone, Mail, Clock, Instagram, Heart, Sparkles, Star, ShoppingBag, MessageCircle, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const AboutUs = () => {
  const navigate = useNavigate();
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [bulkOrderForm, setBulkOrderForm] = useState({
    businessName: '',
    contactPerson: '',
    email: '',
    phone: '',
    productCategory: '',
    quantity: '',
    budget: '',
    additionalInfo: ''
  });

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const whatsappMessage = `Hi ESLO Boutique! 

*Contact Form Submission:*
Name: ${contactForm.name}
Email: ${contactForm.email}
Phone: ${contactForm.phone}
Message: ${contactForm.message}

I'm interested in getting in touch with you!`;
    
    const encodedMessage = encodeURIComponent(whatsappMessage);
    window.open(`https://wa.me/254773482210?text=${encodedMessage}`, '_blank');
  };

  const handleBulkOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const whatsappMessage = `Hi ESLO Boutique! 

*Bulk Order Request:*
Business Name: ${bulkOrderForm.businessName}
Contact Person: ${bulkOrderForm.contactPerson}
Email: ${bulkOrderForm.email}
Phone: ${bulkOrderForm.phone}
Product Category: ${bulkOrderForm.productCategory}
Quantity Needed: ${bulkOrderForm.quantity}
Budget Range: ${bulkOrderForm.budget}
Additional Info: ${bulkOrderForm.additionalInfo}

I'm interested in placing a bulk order. Please let me know how we can proceed!`;
    
    const encodedMessage = encodeURIComponent(whatsappMessage);
    window.open(`https://wa.me/254773482210?text=${encodedMessage}`, '_blank');
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Glassmorphism Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-pink-200 via-purple-100 to-rose-200"></div>
      
      {/* Floating Glass Bubbles */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-white/20 backdrop-blur-md rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-pink-300/30 backdrop-blur-md rounded-full animate-bounce"></div>
        <div className="absolute bottom-20 left-20 w-40 h-40 bg-purple-200/20 backdrop-blur-md rounded-full"></div>
        <div className="absolute bottom-40 right-10 w-20 h-20 bg-rose-300/40 backdrop-blur-md rounded-full animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-gradient-to-r from-pink-200/10 to-purple-200/10 backdrop-blur-sm rounded-full"></div>
      </div>
      
      <div className="container mx-auto px-4 py-6 md:py-8 relative z-10">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6 bg-white/20 backdrop-blur-md hover:bg-white/30 text-pink-700 font-medium border border-white/30"
        >
          ← Back to Home
        </Button>

        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center items-center mb-6">
            <Sparkles className="w-8 h-8 text-pink-500 mr-3" />
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-rose-600 bg-clip-text text-transparent">
              ESLO Boutique
            </h1>
            <Sparkles className="w-8 h-8 text-pink-500 ml-3" />
          </div>
          <p className="text-lg md:text-xl text-gray-700 max-w-2xl mx-auto font-medium">
            Where dreams meet fashion ✨ Your luxury fashion destination in the heart of Kenya
          </p>
        </div>

        <div className="max-w-6xl mx-auto space-y-8">
          {/* About Section with Glassmorphism */}
          <Card className="bg-white/30 backdrop-blur-lg border border-white/40 shadow-2xl overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-100/20 to-purple-100/20"></div>
            <CardHeader className="bg-gradient-to-r from-pink-200/50 to-purple-200/50 backdrop-blur-md relative border-b border-white/30">
              <CardTitle className="text-2xl font-bold text-pink-800 flex items-center">
                <Heart className="w-6 h-6 mr-3 text-pink-600" />
                Our Story
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 relative">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="space-y-6">
                  <p className="text-gray-800 leading-relaxed text-lg font-medium">
                    ESLO Boutique is a luxury fashion house based in Kisumu, Kenya, dedicated to crafting timeless, elegant designs for the modern woman. We specialize in bespoke bridal gowns, evening wear, red-carpet looks, and ready-to-wear outfits.
                  </p>
                  <p className="text-gray-800 leading-relaxed text-lg font-medium">
                    Every piece is custom-made with precision, creativity, and quality craftsmanship to ensure you not only look stunning but feel confident and empowered.
                  </p>
                  <div className="flex items-center space-x-4 pt-4">
                    <div className="flex items-center">
                      <Star className="w-5 h-5 text-yellow-400 fill-current" />
                      <Star className="w-5 h-5 text-yellow-400 fill-current" />
                      <Star className="w-5 h-5 text-yellow-400 fill-current" />
                      <Star className="w-5 h-5 text-yellow-400 fill-current" />
                      <Star className="w-5 h-5 text-yellow-400 fill-current" />
                      <span className="ml-2 text-sm text-gray-700 font-semibold">Premium Quality</span>
                    </div>
                  </div>
                  
                  {/* Social Media Links */}
                  <div className="flex items-center space-x-4 pt-4">
                    <h4 className="text-lg font-semibold text-gray-800">Follow Us:</h4>
                    <a
                      href="https://www.instagram.com/elso.kisumu/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white px-4 py-2 rounded-full transition-all duration-300 hover:scale-105 shadow-lg"
                    >
                      <Instagram className="w-5 h-5" />
                      <span className="font-medium">Instagram</span>
                    </a>
                    <a
                      href="https://www.tiktok.com/@elso.kisumu"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-full transition-all duration-300 hover:scale-105 shadow-lg"
                    >
                      <span className="text-lg">📱</span>
                      <span className="font-medium">TikTok</span>
                    </a>
                  </div>
                </div>
                <div className="flex justify-center">
                  <div className="w-80 h-80 rounded-3xl overflow-hidden shadow-2xl border-4 border-white/50 backdrop-blur-sm">
                    <img
                      src="/lovable-uploads/47bf58bc-d36e-4ed7-ad7c-e44114aabbbc.png"
                      alt="ESLO Boutique Fashion"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bulk Order Section */}
          <Card className="bg-white/30 backdrop-blur-lg border border-white/40 shadow-2xl overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-100/20 to-pink-100/20"></div>
            <CardHeader className="bg-gradient-to-r from-purple-200/50 to-pink-200/50 backdrop-blur-md relative border-b border-white/30">
              <CardTitle className="text-2xl font-bold text-purple-800 flex items-center">
                <ShoppingBag className="w-6 h-6 mr-3 text-purple-600" />
                Bulk Orders & Retail Partnerships
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 relative">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-purple-100/60 to-pink-100/60 backdrop-blur-md p-6 rounded-2xl border border-white/40">
                    <div className="flex items-center mb-4">
                      <Users className="w-6 h-6 text-purple-600 mr-2" />
                      <h3 className="font-bold text-purple-700 text-lg">Wholesale Benefits</h3>
                    </div>
                    <ul className="space-y-3 text-gray-700">
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                        <span>Bulk pricing discounts (20-50% off retail)</span>
                      </li>
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                        <span>Custom branding and packaging</span>
                      </li>
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                        <span>Flexible payment terms</span>
                      </li>
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                        <span>Priority production scheduling</span>
                      </li>
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                        <span>Dedicated account manager</span>
                      </li>
                    </ul>
                  </div>
                  <div className="bg-gradient-to-r from-pink-100/60 to-rose-100/60 backdrop-blur-md p-6 rounded-2xl border border-white/40">
                    <h4 className="font-bold text-pink-700 mb-3 text-lg">Minimum Order Requirements</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-semibold text-pink-600">Clothing:</span>
                        <p className="text-gray-700">50+ pieces</p>
                      </div>
                      <div>
                        <span className="font-semibold text-pink-600">Accessories:</span>
                        <p className="text-gray-700">100+ pieces</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/40 backdrop-blur-md p-6 rounded-2xl border border-white/50">
                  <h3 className="font-bold text-gray-800 mb-4 text-lg">Request Bulk Quote</h3>
                  <form onSubmit={handleBulkOrderSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        placeholder="Business Name"
                        value={bulkOrderForm.businessName}
                        onChange={(e) => setBulkOrderForm({...bulkOrderForm, businessName: e.target.value})}
                        className="bg-white/60 backdrop-blur-sm border-white/60"
                        required
                      />
                      <Input
                        placeholder="Contact Person"
                        value={bulkOrderForm.contactPerson}
                        onChange={(e) => setBulkOrderForm({...bulkOrderForm, contactPerson: e.target.value})}
                        className="bg-white/60 backdrop-blur-sm border-white/60"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        type="email"
                        placeholder="Email Address"
                        value={bulkOrderForm.email}
                        onChange={(e) => setBulkOrderForm({...bulkOrderForm, email: e.target.value})}
                        className="bg-white/60 backdrop-blur-sm border-white/60"
                        required
                      />
                      <Input
                        placeholder="Phone Number"
                        value={bulkOrderForm.phone}
                        onChange={(e) => setBulkOrderForm({...bulkOrderForm, phone: e.target.value})}
                        className="bg-white/60 backdrop-blur-sm border-white/60"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        placeholder="Product Category"
                        value={bulkOrderForm.productCategory}
                        onChange={(e) => setBulkOrderForm({...bulkOrderForm, productCategory: e.target.value})}
                        className="bg-white/60 backdrop-blur-sm border-white/60"
                        required
                      />
                      <Input
                        placeholder="Quantity Needed"
                        value={bulkOrderForm.quantity}
                        onChange={(e) => setBulkOrderForm({...bulkOrderForm, quantity: e.target.value})}
                        className="bg-white/60 backdrop-blur-sm border-white/60"
                        required
                      />
                    </div>
                    <Input
                      placeholder="Budget Range (KSh)"
                      value={bulkOrderForm.budget}
                      onChange={(e) => setBulkOrderForm({...bulkOrderForm, budget: e.target.value})}
                      className="bg-white/60 backdrop-blur-sm border-white/60"
                    />
                    <Textarea
                      placeholder="Additional Information (designs, timeline, special requirements)"
                      rows={3}
                      value={bulkOrderForm.additionalInfo}
                      onChange={(e) => setBulkOrderForm({...bulkOrderForm, additionalInfo: e.target.value})}
                      className="bg-white/60 backdrop-blur-sm border-white/60"
                    />
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Send Bulk Order Request via WhatsApp
                    </Button>
                  </form>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Section */}
          <Card className="bg-white/30 backdrop-blur-lg border border-white/40 shadow-2xl overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-rose-100/20 to-pink-100/20"></div>
            <CardHeader className="bg-gradient-to-r from-rose-200/50 to-pink-200/50 backdrop-blur-md relative border-b border-white/30">
              <CardTitle className="text-2xl font-bold text-rose-800 flex items-center">
                <MessageCircle className="w-6 h-6 mr-3 text-rose-600" />
                Get In Touch
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 relative">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Contact Info */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-pink-100/60 to-rose-100/60 backdrop-blur-md rounded-2xl border border-white/40">
                    <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">Location</p>
                      <p className="text-gray-700">Kisumu, Kenya 🇰🇪</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-purple-100/60 to-pink-100/60 backdrop-blur-md rounded-2xl border border-white/40">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <Phone className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">Phone</p>
                      <p className="text-gray-700">+254 745 242 174</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-rose-100/60 to-pink-100/60 backdrop-blur-md rounded-2xl border border-white/40">
                    <div className="w-12 h-12 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full flex items-center justify-center">
                      <Mail className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">Email</p>
                      <p className="text-gray-700">elsokisumu@gmail.com</p>
                    </div>
                  </div>

                  <div className="p-6 bg-gradient-to-br from-purple-100/60 to-pink-100/60 backdrop-blur-md rounded-2xl border border-white/40">
                    <div className="flex items-center mb-4">
                      <Clock className="w-6 h-6 text-purple-600 mr-2" />
                      <h3 className="font-bold text-purple-700">Opening Hours</h3>
                    </div>
                    <div className="space-y-2 text-gray-700">
                      <p>📅 Monday to Saturday</p>
                      <p className="text-lg font-semibold text-purple-600">9:00 AM – 6:00 PM</p>
                      <p>📅 Sunday</p>
                      <p className="text-lg font-semibold text-purple-600">10:00 AM – 4:00 PM</p>
                    </div>
                  </div>
                </div>

                {/* Contact Form */}
                <div className="bg-white/40 backdrop-blur-md p-6 rounded-2xl border border-white/50">
                  <h3 className="font-bold text-gray-800 mb-4 text-lg">Send us a Message</h3>
                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <Input
                      placeholder="Your Name"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                      className="bg-white/60 backdrop-blur-sm border-white/60"
                      required
                    />
                    <Input
                      type="email"
                      placeholder="Your Email"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                      className="bg-white/60 backdrop-blur-sm border-white/60"
                      required
                    />
                    <Input
                      placeholder="Your Phone Number"
                      value={contactForm.phone}
                      onChange={(e) => setContactForm({...contactForm, phone: e.target.value})}
                      className="bg-white/60 backdrop-blur-sm border-white/60"
                      required
                    />
                    <Textarea
                      placeholder="Your Message"
                      rows={4}
                      value={contactForm.message}
                      onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                      className="bg-white/60 backdrop-blur-sm border-white/60"
                      required
                    />
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 shadow-lg"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Send Message via WhatsApp
                    </Button>
                  </form>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* WhatsApp Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <a
          href="https://wa.me/254773482210"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white p-4 rounded-full shadow-xl transition-all duration-300 hover:scale-110 flex items-center justify-center group backdrop-blur-md"
          title="Chat with us on WhatsApp"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
          </svg>
          <span className="ml-2 hidden group-hover:block text-sm font-medium">Chat with us!</span>
        </a>
      </div>
    </div>
  );
};

export default AboutUs;
