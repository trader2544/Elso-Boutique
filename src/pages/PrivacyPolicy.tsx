
import React from 'react';
import { SEOHead } from '@/components/SEOHead';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const PrivacyPolicy = () => {
  return (
    <>
      <SEOHead 
        title="Privacy Policy - Elso Boutique"
        description="Read Elso Boutique's privacy policy to understand how we collect, use, and protect your personal information."
        keywords="privacy policy, data protection, Elso Boutique privacy, personal information"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-pink-700 mb-6">
                Privacy Policy
              </h1>
              <p className="text-lg text-gray-600">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </div>

            {/* Introduction */}
            <Card className="mb-8 shadow-lg border-pink-200">
              <CardHeader className="bg-gradient-to-r from-pink-50 to-purple-50">
                <CardTitle className="text-2xl text-pink-700">Introduction</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-gray-700 leading-relaxed">
                  At Elso Boutique, we are committed to protecting your privacy and ensuring the security of your personal information. 
                  This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website, 
                  make a purchase, or interact with our services.
                </p>
              </CardContent>
            </Card>

            {/* Information We Collect */}
            <Card className="mb-8 shadow-lg border-pink-200">
              <CardHeader className="bg-gradient-to-r from-pink-50 to-purple-50">
                <CardTitle className="text-2xl text-pink-700">Information We Collect</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-pink-600 mb-3">Personal Information</h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-2">
                      <li>Name and contact information (email, phone number, address)</li>
                      <li>Payment information (processed securely through third-party processors)</li>
                      <li>Account credentials (username, password)</li>
                      <li>Order history and preferences</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-pink-600 mb-3">Automatically Collected Information</h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-2">
                      <li>IP address and browser information</li>
                      <li>Device information and operating system</li>
                      <li>Website usage patterns and analytics data</li>
                      <li>Cookies and similar tracking technologies</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* How We Use Your Information */}
            <Card className="mb-8 shadow-lg border-pink-200">
              <CardHeader className="bg-gradient-to-r from-pink-50 to-purple-50">
                <CardTitle className="text-2xl text-pink-700">How We Use Your Information</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ul className="list-disc list-inside text-gray-700 space-y-3">
                  <li>Process and fulfill your orders</li>
                  <li>Provide customer service and support</li>
                  <li>Send order confirmations and shipping updates</li>
                  <li>Improve our website and services</li>
                  <li>Send marketing communications (with your consent)</li>
                  <li>Prevent fraud and ensure security</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </CardContent>
            </Card>

            {/* Information Sharing */}
            <Card className="mb-8 shadow-lg border-pink-200">
              <CardHeader className="bg-gradient-to-r from-pink-50 to-purple-50">
                <CardTitle className="text-2xl text-pink-700">Information Sharing and Disclosure</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <p className="text-gray-700">
                    We do not sell, trade, or rent your personal information to third parties. We may share your information in the following circumstances:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2">
                    <li><strong>Service Providers:</strong> Third-party companies that help us operate our business (payment processors, shipping companies, etc.)</li>
                    <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and safety</li>
                    <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets</li>
                    <li><strong>With Your Consent:</strong> When you explicitly agree to share information</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Data Security */}
            <Card className="mb-8 shadow-lg border-pink-200">
              <CardHeader className="bg-gradient-to-r from-pink-50 to-purple-50">
                <CardTitle className="text-2xl text-pink-700">Data Security</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-gray-700 leading-relaxed mb-4">
                  We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, 
                  alteration, disclosure, or destruction. These measures include:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>SSL encryption for data transmission</li>
                  <li>Secure servers and databases</li>
                  <li>Regular security audits and updates</li>
                  <li>Access controls and authentication</li>
                  <li>Employee training on data protection</li>
                </ul>
              </CardContent>
            </Card>

            {/* Your Rights */}
            <Card className="mb-8 shadow-lg border-pink-200">
              <CardHeader className="bg-gradient-to-r from-pink-50 to-purple-50">
                <CardTitle className="text-2xl text-pink-700">Your Rights</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-gray-700 mb-4">You have the right to:</p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Access and review your personal information</li>
                  <li>Correct inaccurate or incomplete information</li>
                  <li>Delete your personal information (subject to legal requirements)</li>
                  <li>Opt-out of marketing communications</li>
                  <li>Request data portability</li>
                  <li>Lodge a complaint with relevant authorities</li>
                </ul>
              </CardContent>
            </Card>

            {/* Cookies */}
            <Card className="mb-8 shadow-lg border-pink-200">
              <CardHeader className="bg-gradient-to-r from-pink-50 to-purple-50">
                <CardTitle className="text-2xl text-pink-700">Cookies and Tracking</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-gray-700 leading-relaxed mb-4">
                  We use cookies and similar tracking technologies to enhance your browsing experience, analyze website traffic, 
                  and understand user preferences. You can manage cookie settings through your browser preferences.
                </p>
                <p className="text-gray-700">
                  Types of cookies we use: essential cookies, analytics cookies, and functionality cookies.
                </p>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="shadow-lg border-pink-200">
              <CardHeader className="bg-gradient-to-r from-pink-50 to-purple-50">
                <CardTitle className="text-2xl text-pink-700">Contact Us</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-gray-700 mb-4">
                  If you have questions about this Privacy Policy or our data practices, please contact us:
                </p>
                <div className="space-y-2 text-gray-700">
                  <p><strong>Email:</strong> privacy@elsoboutique.com</p>
                  <p><strong>Phone:</strong> +254 700 000 000</p>
                  <p><strong>Address:</strong> 123 Fashion Street, Nairobi, Kenya 00100</p>
                </div>
                <p className="text-sm text-gray-600 mt-4">
                  We will respond to your inquiries within 30 days.
                </p>
              </CardContent>
            </Card>

            {/* Updates */}
            <div className="mt-8 p-6 bg-pink-50 rounded-lg border border-pink-200">
              <h3 className="text-lg font-semibold text-pink-700 mb-2">Policy Updates</h3>
              <p className="text-gray-700">
                We may update this Privacy Policy from time to time. We will notify you of significant changes by posting 
                the updated policy on our website and updating the "Last updated" date above.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PrivacyPolicy;
