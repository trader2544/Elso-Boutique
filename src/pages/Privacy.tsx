
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Footer from "@/components/Footer";

const Privacy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-pink-100 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="hover:bg-pink-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
          Privacy Policy
        </h1>

        <div className="space-y-6 text-gray-700">
          <section>
            <h2 className="text-xl font-semibold mb-3 text-pink-600">1. Information We Collect</h2>
            <div className="space-y-3">
              <h3 className="font-medium">Personal Information:</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Name and contact information (email, phone number)</li>
                <li>Delivery address and location details</li>
                <li>Payment information (M-Pesa phone number)</li>
                <li>Account credentials and preferences</li>
              </ul>
              
              <h3 className="font-medium">Usage Information:</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Browsing history and product views</li>
                <li>Purchase history and order details</li>
                <li>Device information and IP address</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-pink-600">2. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Process and fulfill your orders</li>
              <li>Send order confirmations and status updates</li>
              <li>Provide customer support and respond to inquiries</li>
              <li>Improve our products and services</li>
              <li>Send promotional offers and updates (with your consent)</li>
              <li>Prevent fraud and enhance security</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-pink-600">3. Information Sharing</h2>
            <p className="mb-3">We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>With delivery partners to fulfill your orders</li>
              <li>With payment processors (M-Pesa) to process transactions</li>
              <li>With service providers who assist in our operations</li>
              <li>When required by law or legal process</li>
              <li>To protect our rights and safety</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-pink-600">4. Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-pink-600">5. Cookies and Tracking</h2>
            <p>
              We use cookies and similar technologies to enhance your browsing experience, analyze usage patterns, and provide personalized content. You can control cookie settings through your browser preferences.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-pink-600">6. Your Rights</h2>
            <p className="mb-3">You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access and update your personal information</li>
              <li>Request deletion of your data</li>
              <li>Opt-out of marketing communications</li>
              <li>Data portability and correction</li>
              <li>Withdraw consent where applicable</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-pink-600">7. Data Retention</h2>
            <p>
              We retain your personal information for as long as necessary to provide our services, comply with legal obligations, resolve disputes, and enforce our agreements.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-pink-600">8. Children's Privacy</h2>
            <p>
              Our services are not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-pink-600">9. Changes to Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting the new policy on our website and updating the "Last Updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-pink-600">10. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy or our data practices, please contact us through WhatsApp at +254773482210 or visit our About page.
            </p>
          </section>

          <div className="bg-pink-50 p-4 rounded-lg mt-8">
            <p className="text-sm text-pink-700">
              <strong>Last Updated:</strong> December 2025
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Privacy;
