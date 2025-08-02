import { Heart, Users, Globe, Leaf, Target, Lightbulb, Award, ArrowRight } from 'lucide-react';

export function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 via-white to-blue-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              About <span className="text-primary-600">Recap Food</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              We're on a mission to eliminate food waste while strengthening communities. 
              Every meal saved is a step toward a more sustainable future.
            </p>
            <div className="flex justify-center">
              <div className="bg-white rounded-xl shadow-lg p-6 max-w-md">
                <div className="text-3xl font-bold text-primary-600 mb-2">1.3 Billion Tons</div>
                <div className="text-gray-600">of food is wasted globally each year</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-6">
                <Target className="h-8 w-8 text-primary-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-lg text-gray-600 mb-6">
                To create a world where no food goes to waste while ensuring everyone has access to 
                fresh, nutritious meals. We believe that technology can bridge the gap between food 
                surplus and food insecurity.
              </p>
              <p className="text-gray-600">
                Through our platform, we're building a community of conscious consumers, generous 
                donors, and environmentally-minded individuals working together to make a real difference.
              </p>
            </div>
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-primary-100 to-blue-100 rounded-2xl p-8">
                <div className="h-full w-full bg-white rounded-xl shadow-lg flex items-center justify-center">
                  <div className="text-center">
                    <Heart className="h-24 w-24 text-primary-600 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Community First</h3>
                    <p className="text-gray-600">Building connections that last</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How We Make It Happen</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our simple yet powerful platform connects food surplus with those who need it most
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Lightbulb className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Smart Matching</h3>
              <p className="text-gray-600 mb-4">
                Our AI-powered system intelligently matches food surplus with nearby families, 
                organizations, and individuals who need it most.
              </p>
              <ArrowRight className="h-5 w-5 text-primary-600 mx-auto" />
            </div>

            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Community Network</h3>
              <p className="text-gray-600 mb-4">
                Connect with verified local donors, restaurants, grocery stores, and community 
                organizations all working toward the same goal.
              </p>
              <ArrowRight className="h-5 w-5 text-blue-600 mx-auto" />
            </div>

            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Leaf className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Impact Tracking</h3>
              <p className="text-gray-600 mb-4">
                See your real-time environmental impact with detailed sustainability metrics 
                and celebrate your contribution to the community.
              </p>
              <Award className="h-5 w-5 text-green-600 mx-auto" />
            </div>
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Growing Impact</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Together, our community has achieved remarkable results in the fight against food waste
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="text-center">
              <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="h-10 w-10 text-primary-600" />
              </div>
              <div className="text-4xl font-bold text-primary-600 mb-2">25.8K</div>
              <div className="text-gray-600 font-medium">kg Food Saved</div>
              <div className="text-sm text-gray-500 mt-1">This year alone</div>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Leaf className="h-10 w-10 text-green-600" />
              </div>
              <div className="text-4xl font-bold text-green-600 mb-2">18.2K</div>
              <div className="text-gray-600 font-medium">kg CO2 Reduced</div>
              <div className="text-sm text-gray-500 mt-1">Environmental impact</div>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-10 w-10 text-blue-600" />
              </div>
              <div className="text-4xl font-bold text-blue-600 mb-2">5.2K</div>
              <div className="text-gray-600 font-medium">Active Users</div>
              <div className="text-sm text-gray-500 mt-1">Growing community</div>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-10 w-10 text-red-500" />
              </div>
              <div className="text-4xl font-bold text-red-500 mb-2">32K</div>
              <div className="text-gray-600 font-medium">Meals Provided</div>
              <div className="text-sm text-gray-500 mt-1">Families helped</div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-2xl p-8 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Join Our Mission</h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Every action counts. Whether you're donating surplus food, finding affordable meals, 
              or simply spreading awareness, you're making a difference.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors duration-200">
                Start Donating Today
              </button>
              <button className="px-6 py-3 border-2 border-primary-600 text-primary-600 font-semibold rounded-lg hover:bg-primary-600 hover:text-white transition-colors duration-200">
                Find Food Near You
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Core Values</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              These principles guide everything we do at Recap Food
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">🌱 Sustainability</h3>
              <p className="text-gray-600">
                Environmental responsibility is at the heart of everything we do. We're committed to reducing 
                waste and promoting sustainable practices.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">🤝 Community</h3>
              <p className="text-gray-600">
                We believe in the power of community to create positive change. Together, we can solve 
                problems that seem impossible alone.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">💡 Innovation</h3>
              <p className="text-gray-600">
                We use cutting-edge technology and creative solutions to make food sharing easier, 
                safer, and more impactful than ever before.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">🔒 Trust</h3>
              <p className="text-gray-600">
                Safety and trust are paramount. We verify all users and provide secure, transparent 
                transactions for peace of mind.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">🎯 Impact</h3>
              <p className="text-gray-600">
                Every feature we build and every decision we make is measured by its potential to 
                reduce waste and help communities thrive.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">❤️ Compassion</h3>
              <p className="text-gray-600">
                We approach food insecurity with empathy and dignity, ensuring everyone feels 
                valued and respected in our community.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
