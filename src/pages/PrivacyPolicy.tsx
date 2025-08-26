
import { SEOHead } from "@/components/SEOHead";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 py-16">
      <SEOHead 
        title="Privacy Policy - Elso Boutique"
        description="Learn about how Elso Boutique protects and handles your personal information. Read our comprehensive privacy policy."
      />
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-8 text-center">Privacy Policy</h1>
          
          <div className="prose prose-lg max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
              <p>
                At Elso Boutique, we collect information you provide directly to us, such as when you:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Create an account or make a purchase</li>
                <li>Subscribe to our newsletter</li>
                <li>Contact us for customer service</li>
                <li>Leave reviews or testimonials</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
              <p>We use the information we collect to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Process and fulfill your orders</li>
                <li>Communicate with you about your purchases</li>
                <li>Send you marketing communications (with your consent)</li>
                <li>Improve our products and services</li>
                <li>Prevent fraud and ensure security</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Information Sharing</h2>
              <p>
                We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, 
                except as described in this policy. We may share information with:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Service providers who help us operate our business</li>
                <li>Payment processors for transaction processing</li>
                <li>Shipping companies for order delivery</li>
                <li>Law enforcement when required by law</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Data Security</h2>
              <p>
                We implement appropriate security measures to protect your personal information against unauthorized 
                access, alteration, disclosure, or destruction. However, no method of transmission over the internet 
                is 100% secure.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Your Rights</h2>
              <p>You have the right to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Access your personal information</li>
                <li>Correct inaccurate information</li>
                <li>Delete your account and personal information</li>
                <li>Opt-out of marketing communications</li>
                <li>Request data portability</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Cookies</h2>
              <p>
                We use cookies and similar technologies to enhance your browsing experience, analyze site traffic, 
                and personalize content. You can control cookie settings through your browser preferences.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Children's Privacy</h2>
              <p>
                Our services are not intended for children under 13. We do not knowingly collect personal 
                information from children under 13. If we learn we have collected such information, 
                we will delete it promptly.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Changes to This Policy</h2>
              <p>
                We may update this privacy policy from time to time. We will notify you of any changes by 
                posting the new policy on this page and updating the "Last Updated" date.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
              <p>If you have questions about this privacy policy, please contact us:</p>
              <div className="bg-gray-50 p-4 rounded-lg mt-4">
                <p><strong>Email:</strong> privacy@elsoboutique.com</p>
                <p><strong>Phone:</strong> +254 712 345 678</p>
                <p><strong>Address:</strong> Kisumu, Kenya</p>
                <p><strong>WhatsApp:</strong> +254 712 345 678</p>
              </div>
            </section>

            <div className="text-sm text-gray-500 mt-8 pt-4 border-t">
              <p>Last Updated: January 2025</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
