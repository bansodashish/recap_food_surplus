import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Leaf, Droplets, Zap, Utensils, TrendingUp, Award } from 'lucide-react';

const monthlyData = [
  { month: 'Jan', foodSaved: 2100, co2Reduced: 1580, meals: 2800 },
  { month: 'Feb', foodSaved: 2800, co2Reduced: 2100, meals: 3700 },
  { month: 'Mar', foodSaved: 3200, co2Reduced: 2400, meals: 4200 },
  { month: 'Apr', foodSaved: 2900, co2Reduced: 2180, meals: 3850 },
  { month: 'May', foodSaved: 3800, co2Reduced: 2850, meals: 5000 },
  { month: 'Jun', foodSaved: 4200, co2Reduced: 3150, meals: 5600 },
];

const categoryData = [
  { name: 'Fruits & Vegetables', value: 35, color: '#22c55e' },
  { name: 'Prepared Food', value: 28, color: '#3b82f6' },
  { name: 'Dairy', value: 18, color: '#f59e0b' },
  { name: 'Grains & Bread', value: 12, color: '#ef4444' },
  { name: 'Others', value: 7, color: '#8b5cf6' },
];

export function SustainabilityPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Sustainability Impact</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Track our collective impact on reducing food waste and building a more sustainable future for our communities.
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Leaf className="h-6 w-6 text-green-600" />
              </div>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">25.8K kg</h3>
            <p className="text-gray-600 text-sm">Food Saved from Waste</p>
            <div className="mt-2 text-xs text-green-600">↗ 12% from last month</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Zap className="h-6 w-6 text-blue-600" />
              </div>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">18.2K kg</h3>
            <p className="text-gray-600 text-sm">CO2 Emissions Reduced</p>
            <div className="mt-2 text-xs text-green-600">↗ 8% from last month</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center">
                <Droplets className="h-6 w-6 text-cyan-600" />
              </div>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">156K L</h3>
            <p className="text-gray-600 text-sm">Water Resources Saved</p>
            <div className="mt-2 text-xs text-green-600">↗ 15% from last month</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Utensils className="h-6 w-6 text-orange-600" />
              </div>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">32.1K</h3>
            <p className="text-gray-600 text-sm">Meals Provided</p>
            <div className="mt-2 text-xs text-green-600">↗ 18% from last month</div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Monthly Trends */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Monthly Impact Trends</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="foodSaved" 
                  stroke="#22c55e" 
                  strokeWidth={2}
                  name="Food Saved (kg)"
                />
                <Line 
                  type="monotone" 
                  dataKey="co2Reduced" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="CO2 Reduced (kg)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Food Categories */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Food Categories Saved</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-12">
          <h3 className="text-2xl font-semibold text-gray-900 mb-6 text-center">Community Achievements</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-yellow-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Zero Waste Champion</h4>
              <p className="text-gray-600 text-sm">
                Achieved zero food waste for 3 consecutive months
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Leaf className="h-8 w-8 text-green-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Eco Warrior</h4>
              <p className="text-gray-600 text-sm">
                Reduced carbon footprint by over 15,000 kg CO2
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Utensils className="h-8 w-8 text-blue-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Community Hero</h4>
              <p className="text-gray-600 text-sm">
                Provided over 30,000 meals to those in need
              </p>
            </div>
          </div>
        </div>

        {/* Environmental Impact Details */}
        <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-8">
          <h3 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
            Understanding Our Environmental Impact
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Carbon Footprint Reduction</h4>
              <p className="text-gray-700 mb-4">
                Every kilogram of food saved prevents approximately 0.7 kg of CO2 emissions from being released into the atmosphere through decomposition in landfills.
              </p>
              <div className="bg-white p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">18,200 kg CO2</div>
                <div className="text-sm text-gray-600">Equivalent to planting 827 trees</div>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Water Conservation</h4>
              <p className="text-gray-700 mb-4">
                Food production requires significant water resources. By saving food from waste, we're conserving the water that was used to produce it.
              </p>
              <div className="bg-white p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">156,000 L</div>
                <div className="text-sm text-gray-600">Enough water for 1,560 people daily</div>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-700 mb-4">
              Together, we're not just reducing waste – we're actively contributing to a more sustainable future for our planet.
            </p>
            <button className="bg-primary-600 text-white px-8 py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium">
              Join Our Sustainability Mission
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
