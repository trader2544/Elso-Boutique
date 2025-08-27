
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Card className="shadow-md">
          <CardHeader className="text-center bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-t-lg">
            <CardTitle className="text-3xl font-bold">Privacy Policy</CardTitle>
            <p className="text-pink-100 mt-2">Last updated: {new Date().toLocaleDateString()}</p>
          </CardHeader>
          
          <CardContent className="p-8 space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. Information We Collect</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                At ELSO Boutique, we collect information you provide directly to us, such as when you:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Create an account or make a purchase</li>
                <li>Subscribe to our newsletter</li>
                <li>Contact our customer service</li>
                <li>Participate in surveys or promotions</li>
              </ul>
            </section>

            <Separator />

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. How We Use Your Information</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Process and fulfill your orders</li>
                <li>Send you updates about your orders</li>
                <li>Provide customer support</li>
                <li>Improve our products and services</li>
                <li>Send promotional emails (with your consent)</li>
              </ul>
            </section>

            <Separator />

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. Information Sharing</h2>
              <p className="text-gray-600 leading-relaxed">
                We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, 
                except as described in this policy. We may share your information with trusted partners who assist us in 
                operating our website and conducting our business.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. Data Security</h2>
              <p className="text-gray-600 leading-relaxed">
                We implement appropriate security measures to protect your personal information against unauthorized access, 
                alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. Your Rights</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                You have the right to:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Access your personal information</li>
                <li>Correct inaccurate information</li>
                <li>Request deletion of your information</li>
                <li>Opt-out of marketing communications</li>
              </ul>
            </section>

            <Separator />

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. Contact Us</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                If you have any questions about this Privacy Policy, please contact us:
              </p>
              <div className="bg-pink-50 p-4 rounded-lg">
                <div className="space-y-2 text-gray-700">
                  <p><strong>Email:</strong> info@elsoboutique.com</p>
                  <p><strong>Phone:</strong> +254 700 123 456</p>
                  <p><strong>Address:</strong> 123 Fashion Street, Nairobi, Kenya</p>
                  <p><strong>Business Hours:</strong> Monday - Saturday, 9:00 AM - 6:00 PM</p>
                </div>
              </div>
            </section>

            <Separator />

            <section className="text-center">
              <p className="text-gray-500 text-sm">
                This privacy policy is effective as of the date listed above and may be updated from time to time.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
