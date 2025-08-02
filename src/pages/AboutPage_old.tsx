export function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">About Recap Food</h1>
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              Recap Food is a community-driven platform dedicated to reducing food waste and building stronger, more sustainable communities. Our mission is to connect surplus food with those who need it most while creating positive environmental impact.
            </p>
            
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Mission</h2>
            <p className="text-gray-600 mb-6">
              To create a world where no food goes to waste while ensuring everyone has access to fresh, nutritious meals. We believe that technology can bridge the gap between food surplus and food insecurity.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-primary-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-primary-800 mb-2">List</h3>
                <p className="text-primary-700">Post your surplus food items with photos and details</p>
              </div>
              <div className="bg-secondary-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-secondary-800 mb-2">Connect</h3>
                <p className="text-secondary-700">Our AI matches you with nearby people who need your items</p>
              </div>
              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-green-800 mb-2">Impact</h3>
                <p className="text-green-700">Track your environmental impact and community contribution</p>
              </div>
            </div>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Impact</h2>
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary-600">25.8K</div>
                  <div className="text-sm text-gray-600">kg Food Saved</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">18.2K</div>
                  <div className="text-sm text-gray-600">kg CO2 Reduced</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">5.2K</div>
                  <div className="text-sm text-gray-600">Active Users</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-500">32K</div>
                  <div className="text-sm text-gray-600">Meals Provided</div>
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Join Our Community</h2>
            <p className="text-gray-600 mb-6">
              Whether you're a household with occasional surplus, a restaurant with daily excess, or someone looking for affordable fresh food, Recap Food welcomes you. Together, we can make a significant impact on food waste and food security.
            </p>

            <div className="bg-primary-600 text-white p-6 rounded-lg text-center">
              <h3 className="text-xl font-semibold mb-2">Ready to Make a Difference?</h3>
              <p className="mb-4">Join thousands of users who are already reducing food waste and building stronger communities.</p>
              <button className="bg-white text-primary-600 px-6 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                Get Started Today
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
