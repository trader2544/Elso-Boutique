
import React from 'react';
import { SEOHead } from '@/components/SEOHead';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Award, Users, Sparkles } from 'lucide-react';

const AboutUs = () => {
  return (
    <>
      <SEOHead 
        title="About Us - Elso Boutique"
        description="Learn about Elso Boutique's story, mission, and commitment to providing premium fashion and exceptional customer service."
        keywords="about Elso Boutique, fashion boutique story, premium fashion, customer service"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-16">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-pink-700 mb-6">
              About Elso Boutique
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Your premier destination for curated fashion that celebrates individuality, 
              quality, and timeless style. Discover the story behind our passion for fashion.
            </p>
          </div>

          {/* Story Section */}
          <Card className="mb-12 shadow-lg border-pink-200">
            <CardHeader className="bg-gradient-to-r from-pink-50 to-purple-50">
              <CardTitle className="text-2xl text-pink-700 flex items-center">
                <Heart className="mr-3 text-pink-500" />
                Our Story
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="prose prose-lg max-w-none text-gray-700">
                <p className="mb-6">
                  Founded with a vision to make premium fashion accessible to everyone, 
                  Elso Boutique began as a small collection of carefully curated pieces 
                  that embodied elegance, quality, and affordability.
                </p>
                <p className="mb-6">
                  Our journey started with a simple belief: every person deserves to feel 
                  confident and beautiful in what they wear. This philosophy drives everything 
                  we do, from selecting our products to delivering exceptional customer experiences.
                </p>
                <p>
                  Today, we continue to grow while staying true to our core values of quality, 
                  authenticity, and customer satisfaction. Each piece in our collection is 
                  chosen with care, ensuring our customers receive only the finest fashion items.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Values Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <Card className="text-center shadow-lg border-pink-200 hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mb-4">
                  <Award className="w-8 h-8 text-pink-600" />
                </div>
                <CardTitle className="text-xl text-pink-700">Quality First</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  We source only the finest materials and work with trusted suppliers 
                  to ensure every product meets our high standards of quality and durability.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center shadow-lg border-pink-200 hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <Users className="w-8 h-8 text-purple-600" />
                </div>
                <CardTitle className="text-xl text-pink-700">Customer Focused</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Your satisfaction is our priority. We provide personalized service, 
                  quick support, and a seamless shopping experience from browse to delivery.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center shadow-lg border-pink-200 hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Sparkles className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl text-pink-700">Style Innovation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  We stay ahead of fashion trends while maintaining timeless appeal, 
                  offering pieces that are both contemporary and enduringly stylish.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Mission Section */}
          <Card className="shadow-lg border-pink-200">
            <CardHeader className="bg-gradient-to-r from-pink-50 to-purple-50">
              <CardTitle className="text-2xl text-pink-700 text-center">Our Mission</CardTitle>
            </CardHeader>
            <CardContent className="p-8 text-center">
              <p className="text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed">
                To empower individuals through fashion by providing premium, carefully curated 
                clothing and accessories that enhance confidence, express personality, and 
                celebrate the unique beauty in everyone. We're committed to delivering 
                exceptional quality, outstanding service, and an inspiring shopping experience 
                that makes fashion accessible and enjoyable for all.
              </p>
            </CardContent>
          </Card>

          {/* Contact CTA */}
          <div className="text-center mt-16">
            <h3 className="text-2xl font-bold text-pink-700 mb-4">
              Ready to Discover Your Style?
            </h3>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Join thousands of satisfied customers who trust Elso Boutique for their fashion needs. 
              Browse our collection and find pieces that speak to your unique style.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/"
                className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Shop Now
              </a>
              <a
                href="https://wa.me/254700000000"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-8 py-3 border border-pink-300 text-base font-medium rounded-md text-pink-700 bg-white hover:bg-pink-50 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AboutUs;
