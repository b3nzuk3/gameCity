import { Routes, Route } from 'react-router-dom'
import Index from '@/pages/Index'
import CategoryPage from '@/pages/CategoryPage'
import SearchPage from '@/pages/SearchPage'
import SignIn from '@/pages/SignIn'
import SignUp from '@/pages/SignUp'
import Admin from '@/pages/Admin'
import Cart from '@/pages/Cart'
import BuildPC from '@/pages/BuildPC'
import Contact from '@/pages/Contact'
import Favorites from '@/pages/Favorites'
import Profile from '@/pages/Profile'
import Sitemap from '@/pages/Sitemap'
import DynamicSitemapGenerator from '@/pages/DynamicSitemapGenerator'
import NotFound from '@/pages/NotFound'
import ProtectedRoute from '@/components/ProtectedRoute'
import ResetPassword from '@/pages/ResetPassword'
import ForgotPassword from '@/pages/ForgotPassword'
import VerifyEmail from '@/pages/VerifyEmail'
import ProductPage from '@/pages/ProductPage'
import PrivacyPolicy from '@/pages/PrivacyPolicy'
import TermsOfService from '@/pages/TermsOfService'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/product/:id" element={<ProductPage />} />
      <Route path="/category/:category" element={<CategoryPage />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <Admin />
          </ProtectedRoute>
        }
      />
      <Route path="/cart" element={<Cart />} />
      <Route path="/build-pc" element={<BuildPC />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/favorites" element={<Favorites />} />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route path="/sitemap" element={<Sitemap />} />
      <Route path="/sitemap.xml" element={<DynamicSitemapGenerator />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsOfService />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
