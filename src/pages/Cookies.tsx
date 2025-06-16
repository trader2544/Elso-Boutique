
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Footer from "@/components/Footer";

const Cookies = () => {
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
          Cookie Policy
        </h1>

        <div className="space-y-6 text-gray-700">
          <section>
            <h2 className="text-xl font-semibold mb-3 text-pink-600">1. What Are Cookies?</h2>
            <p>
              Cookies are small text files that are stored on your device (computer, tablet, or mobile) when you visit a website. They help websites remember information about your visit, like your preferred language and other settings, which can make your next visit easier and the site more useful to you.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-pink-600">2. How We Use Cookies</h2>
            <p className="mb-3">Elso Atelier uses cookies for several purposes:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Essential Cookies:</strong> Required for the website to function properly, including shopping cart and checkout processes</li>
              <li><strong>Performance Cookies:</strong> Help us understand how visitors interact with our website by collecting anonymous information</li>
              <li><strong>Functionality Cookies:</strong> Remember your preferences and settings to provide a personalized experience</li>
              <li><strong>Marketing Cookies:</strong> Track your browsing habits to show you relevant advertisements and measure campaign effectiveness</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-pink-600">3. Types of Cookies We Use</h2>
            
            <div className="space-y-4">
              <div className="bg-pink-50 p-4 rounded-lg">
                <h3 className="font-semibold text-pink-700 mb-2">Strictly Necessary Cookies</h3>
                <p className="text-sm">These cookies are essential for you to browse the website and use its features, such as accessing secure areas and making purchases. Without these cookies, services like shopping carts and checkout cannot be provided.</p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-700 mb-2">Analytics Cookies</h3>
                <p className="text-sm">These cookies collect information about how visitors use our website, such as which pages are visited most often. This data helps us improve our website's performance and user experience.</p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-700 mb-2">Preference Cookies</h3>
                <p className="text-sm">These cookies remember choices you make, such as your preferred language or region, to provide enhanced and personalized features.</p>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-semibold text-purple-700 mb-2">Marketing Cookies</h3>
                <p className="text-sm">These cookies track your browsing habits to deliver advertisements that are relevant to you and your interests. They also help measure the effectiveness of advertising campaigns.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-pink-600">4. Third-Party Cookies</h2>
            <p className="mb-3">We may also use third-party cookies from trusted partners, including:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Google Analytics for website traffic analysis</li>
              <li>Social media platforms for sharing functionality</li>
              <li>Payment processors for secure transactions</li>
              <li>Customer support tools for better service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-pink-600">5. Managing Your Cookie Preferences</h2>
            <div className="space-y-3">
              <h3 className="font-medium">Browser Settings:</h3>
              <p>You can control and manage cookies through your browser settings. Most browsers allow you to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>View and delete cookies</li>
                <li>Block third-party cookies</li>
                <li>Block cookies from specific sites</li>
                <li>Block all cookies</li>
                <li>Delete all cookies when you close your browser</li>
              </ul>
              
              <div className="bg-yellow-50 p-3 rounded-lg mt-3">
                <p className="text-sm text-yellow-700">
                  <strong>Note:</strong> Disabling cookies may affect the functionality of our website and your user experience.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-pink-600">6. Cookie Consent</h2>
            <p>
              By continuing to use our website, you consent to our use of cookies as described in this policy. If you do not agree with our use of cookies, you should set your browser to refuse cookies or stop using our website.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-pink-600">7. Updates to Cookie Policy</h2>
            <p>
              We may update this Cookie Policy from time to time to reflect changes in our practices or applicable laws. We encourage you to review this policy periodically for any updates.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-pink-600">8. Contact Us</h2>
            <p>
              If you have any questions about our use of cookies or this Cookie Policy, please contact us through WhatsApp at +254773482210 or visit our About page for more information.
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

export default Cookies;
