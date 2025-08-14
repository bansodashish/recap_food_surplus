import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import BulletproofErrorBoundary from './components/BulletproofErrorBoundary';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { BrowsePage } from './pages/BrowsePage';
import { RequestPage } from './pages/RequestPage';
import { DonatePage } from './pages/DonatePage';
import { SellPage } from './pages/SellPage';
import { AboutPage } from './pages/AboutPage';
import { SustainabilityPage } from './pages/SustainabilityPage';
import { LoginPage } from './pages/LoginPage';
import BulletproofLoginPage from './pages/BulletproofLoginPage';
import { SignUpPage } from './pages/SignUpPage';
import { ConfirmSignUpPage } from './pages/ConfirmSignUpPage';
import { ProfilePage } from './pages/ProfilePage';
import { SubscriptionPage } from './pages/SubscriptionPage';
import { PaymentSuccessPage } from './pages/PaymentSuccessPage';
import AddItemPage from './pages/AddItemPage';
import AWSInfrastructureDiagnostic from './components/AWSInfrastructureDiagnostic';
import { PostLoginDashboard } from './pages/PostLoginDashboard';
import MyItemsPage from './pages/MyItemsPage';
import CognitoTestPage from './pages/CognitoTestPage';
import { Footer } from './components/Footer';

function App() {
  return (
    <BulletproofErrorBoundary>
      <AuthProvider>
        <Router>
          <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/browse" element={<BrowsePage />} />
              <Route path="/request" element={<RequestPage />} />
              <Route 
                path="/donate" 
                element={
                  <ProtectedRoute>
                    <DonatePage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/sell" 
                element={
                  <ProtectedRoute>
                    <SellPage />
                  </ProtectedRoute>
                } 
              />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/sustainability" element={<SustainabilityPage />} />
              <Route path="/login" element={<BulletproofLoginPage />} />
              <Route path="/login-old" element={<LoginPage />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route path="/confirm-signup" element={<ConfirmSignUpPage />} />
              <Route path="/cognito-test" element={<CognitoTestPage />} />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <PostLoginDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                } 
              />
              <Route path="/subscription" element={<SubscriptionPage />} />
              <Route 
                path="/subscription/success" 
                element={
                  <ProtectedRoute>
                    <PaymentSuccessPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/add-item" 
                element={
                  <ProtectedRoute>
                    <AddItemPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/my-items" 
                element={
                  <ProtectedRoute>
                    <MyItemsPage />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </main>
          <Footer />
          {/* Infrastructure diagnostic for troubleshooting */}
          <AWSInfrastructureDiagnostic />
        </div>
      </Router>
    </AuthProvider>
    </BulletproofErrorBoundary>
  );
}

export default App;
