
import { SEOHead } from "@/components/SEOHead";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 py-8">
      <SEOHead 
        title="Privacy Policy - Elso Boutique"
        description="Read our privacy policy to understand how we collect, use, and protect your personal information at Elso Boutique."
      />
      
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
            Privacy Policy
          </h1>
          
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-600 mb-6">
              <strong>Effective Date:</strong> January 1, 2024
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. Information We Collect</h2>
              <p className="text-gray-600 mb-4">
                We collect information you provide directly to us, such as when you create an account, 
                make a purchase, or contact us for support.
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Personal information (name, email address, phone number)</li>
                <li>Payment information (processed securely through M-Pesa)</li>
                <li>Shipping address and delivery preferences</li>
                <li>Communication preferences and marketing consent</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. How We Use Your Information</h2>
              <p className="text-gray-600 mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Process and fulfill your orders</li>
                <li>Communicate with you about your purchases</li>
                <li>Provide customer support and respond to inquiries</li>
                <li>Send you promotional offers and updates (with your consent)</li>
                <li>Improve our products and services</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. Information Sharing</h2>
              <p className="text-gray-600 mb-4">
                We do not sell, trade, or otherwise transfer your personal information to third parties 
                except as described in this policy:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>With service providers who assist in our operations</li>
                <li>When required by law or to protect our rights</li>
                <li>With your explicit consent</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. Data Security</h2>
              <p className="text-gray-600 mb-4">
                We implement appropriate security measures to protect your personal information against 
                unauthorized access, alteration, disclosure, or destruction. All payment processing is 
                handled securely through encrypted channels.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. Your Rights</h2>
              <p className="text-gray-600 mb-4">
                You have the right to:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Access and update your personal information</li>
                <li>Request deletion of your data</li>
                <li>Opt-out of marketing communications</li>
                <li>Request a copy of your data</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. Cookies and Tracking</h2>
              <p className="text-gray-600 mb-4">
                We use cookies and similar technologies to enhance your browsing experience, 
                analyze website traffic, and personalize content. You can control cookie 
                preferences through your browser settings.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. Contact Us</h2>
              <p className="text-gray-600 mb-4">
                If you have any questions about this Privacy Policy or our data practices, 
                please contact us:
              </p>
              <div className="bg-pink-50 p-4 rounded-lg">
                <p className="text-gray-700 mb-2">
                  <strong>Email:</strong> privacy@elsoboutique.com
                </p>
                <p className="text-gray-700 mb-2">
                  <strong>Phone:</strong> +254 712 345 678
                </p>
                <p className="text-gray-700 mb-2">
                  <strong>WhatsApp:</strong> +254 712 345 678
                </p>
                <p className="text-gray-700">
                  <strong>Address:</strong> 123 Fashion Street, Nairobi, Kenya
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">8. Updates to This Policy</h2>
              <p className="text-gray-600">
                We may update this Privacy Policy from time to time. We will notify you of any 
                material changes by posting the new Privacy Policy on our website and updating 
                the "Effective Date" at the top of this policy.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
