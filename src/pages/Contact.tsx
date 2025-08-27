
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, MapPin, Clock, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      toast({
        title: "Message Sent!",
        description: "Thank you for contacting us. We'll get back to you soon.",
      });
      setFormData({ name: '', email: '', subject: '', message: '' });
      setIsSubmitting(false);
    }, 1000);
  };

  const handleWhatsAppJoin = () => {
    window.open('https://chat.whatsapp.com/your-group-link', '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Get In Touch</h1>
          <p className="text-gray-600 text-lg">We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Contact Form */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-pink-600">Send us a Message</CardTitle>
              <CardDescription>Fill out the form below and we'll get back to you shortly.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <Input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <Input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Subject
                  </label>
                  <Input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    placeholder="What is this regarding?"
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    placeholder="Tell us how we can help you..."
                    rows={5}
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-pink-600 hover:bg-pink-700 text-white py-3"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl text-pink-600">Contact Information</CardTitle>
                <CardDescription>Reach out to us through any of these channels.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start space-x-4">
                  <Mail className="w-6 h-6 text-pink-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-800">Email</h3>
                    <p className="text-gray-600">info@elsoboutique.com</p>
                    <p className="text-gray-600">support@elsoboutique.com</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <Phone className="w-6 h-6 text-pink-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-800">Phone</h3>
                    <p className="text-gray-600">+254 700 123 456</p>
                    <p className="text-gray-600">+254 722 987 654</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <MapPin className="w-6 h-6 text-pink-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-800">Address</h3>
                    <p className="text-gray-600">123 Fashion Street</p>
                    <p className="text-gray-600">Nairobi, Kenya</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <Clock className="w-6 h-6 text-pink-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-800">Business Hours</h3>
                    <p className="text-gray-600">Monday - Friday: 9:00 AM - 6:00 PM</p>
                    <p className="text-gray-600">Saturday: 10:00 AM - 4:00 PM</p>
                    <p className="text-gray-600">Sunday: Closed</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* WhatsApp Group Section */}
            <Card className="shadow-lg bg-gradient-to-r from-green-50 to-green-100 border-green-200">
              <CardHeader>
                <CardTitle className="text-2xl text-green-600 flex items-center gap-2">
                  <MessageCircle className="w-6 h-6" />
                  Join Our WhatsApp Group
                </CardTitle>
                <CardDescription className="text-green-700">
                  Get exclusive updates, offers, and connect with other fashion lovers!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-green-800">
                    <p className="mb-2">Join our community to:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Get first access to new arrivals</li>
                      <li>Receive exclusive discount codes</li>
                      <li>Share fashion tips and styling advice</li>
                      <li>Connect with fellow fashion enthusiasts</li>
                    </ul>
                  </div>
                  <Button 
                    onClick={handleWhatsAppJoin}
                    className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Join WhatsApp Group
                  </Button>
                  <p className="text-xs text-green-600 text-center">
                    By joining, you agree to our community guidelines and privacy policy.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Map or Additional Info Section */}
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-pink-600">Visit Our Store</CardTitle>
            <CardDescription>Come see our latest collections in person!</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="bg-pink-50 rounded-lg p-8">
              <p className="text-gray-600 mb-4">
                Our flagship store is located in the heart of Nairobi, easily accessible by public transport.
                We'd love to welcome you and help you find the perfect outfit!
              </p>
              <p className="text-sm text-gray-500">
                Free parking available • Wheelchair accessible • Personal styling consultation available
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Contact;
