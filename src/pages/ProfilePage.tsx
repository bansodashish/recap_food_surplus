export function ProfilePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">User Profile</h1>
          <p className="text-gray-600">
            This page will show user profile information, including personal details, 
            donation/selling history, sustainability impact, and account settings.
          </p>
          
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Impact</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Food Items Donated:</span>
                  <span className="font-medium">24</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Food Items Sold:</span>
                  <span className="font-medium">16</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Food Saved:</span>
                  <span className="font-medium">128 kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">CO2 Reduced:</span>
                  <span className="font-medium">89 kg</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-gray-600">Member Since:</span>
                  <span className="ml-2 font-medium">March 2024</span>
                </div>
                <div>
                  <span className="text-gray-600">Rating:</span>
                  <span className="ml-2 font-medium">4.8/5 ⭐</span>
                </div>
                <div>
                  <span className="text-gray-600">Total Transactions:</span>
                  <span className="ml-2 font-medium">40</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
