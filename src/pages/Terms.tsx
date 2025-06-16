
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Footer from "@/components/Footer";

const Terms = () => {
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
          Terms of Service
        </h1>

        <div className="space-y-6 text-gray-700">
          <section>
            <h2 className="text-xl font-semibold mb-3 text-pink-600">1. Acceptance of Terms</h2>
            <p>
              By accessing and using Elso Atelier's website and services, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-pink-600">2. Products and Services</h2>
            <p>
              Elso Atelier offers fashion and lifestyle products through our online platform. We strive to display accurate product information, including descriptions, prices, and images. However, we cannot guarantee that all product information is completely accurate or error-free.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-pink-600">3. Orders and Payment</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>All orders are subject to availability and confirmation of the order price.</li>
              <li>We accept M-Pesa payments for all transactions.</li>
              <li>Payment must be completed within the specified time frame to secure your order.</li>
              <li>We reserve the right to cancel any order due to product unavailability or payment issues.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-pink-600">4. Delivery</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Free delivery is available within Kisumu CBD.</li>
              <li>Delivery fees apply for areas outside Kisumu CBD as specified during checkout.</li>
              <li>Delivery times are estimates and may vary due to circumstances beyond our control.</li>
              <li>Risk of loss and title for products pass to you upon delivery.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-pink-600">5. Returns and Exchanges</h2>
            <p>
              We want you to be completely satisfied with your purchase. If you are not satisfied, please contact us within 7 days of delivery to arrange a return or exchange, subject to our return policy conditions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-pink-600">6. Privacy Policy</h2>
            <p>
              Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use, and protect your personal information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-pink-600">7. Limitation of Liability</h2>
            <p>
              Elso Atelier shall not be liable for any direct, indirect, incidental, special, or consequential damages arising from the use of our products or services, except as required by law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-pink-600">8. Contact Information</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us through WhatsApp at +254773482210 or visit our About page for more information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-pink-600">9. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting on our website. Your continued use of our services constitutes acceptance of the modified terms.
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

export default Terms;
