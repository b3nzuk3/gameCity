
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CartProvider } from "./contexts/CartContext";
import { useState, useEffect } from "react";
import { supabase } from "./integrations/supabase/client";
import { authService } from "./services/authService";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import CategoryPage from "./pages/CategoryPage";
import SearchPage from "./pages/SearchPage";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Admin from "./pages/Admin";
import Cart from "./pages/Cart";
import BuildPC from "./pages/BuildPC";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Profile from "./pages/Profile";

const queryClient = new QueryClient();

const App = () => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthState = async () => {
      // Check active session
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      
      // Check if user data is in localStorage
      const userData = localStorage.getItem("user");
      if (userData) {
        setUser(JSON.parse(userData));
      } else if (session) {
        // If we have a session but no user data, get the user profile
        try {
          const userProfile = await authService.getCurrentUser();
          if (userProfile) {
            setUser(userProfile);
            localStorage.setItem("user", JSON.stringify(userProfile));
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      }
      
      setIsLoading(false);
    };

    checkAuthState();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session);
      setSession(session);
      
      if (event === 'SIGNED_IN' && session) {
        try {
          const userProfile = await authService.getCurrentUser();
          if (userProfile) {
            setUser(userProfile);
            localStorage.setItem("user", JSON.stringify(userProfile));
          }
        } catch (error) {
          console.error("Error fetching user profile on sign in:", error);
        }
      } else if (event === 'SIGNED_OUT') {
        localStorage.removeItem("user");
        setUser(null);
      }
    });

    // Cleanup on unmount
    return () => subscription.unsubscribe();
  }, []);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <CartProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/category/:categoryId" element={<CategoryPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/signin" element={session ? <Navigate to="/" /> : <SignIn />} />
              <Route path="/signup" element={session ? <Navigate to="/" /> : <SignUp />} />
              <Route path="/admin" element={user && user.isAdmin ? <Admin /> : <Navigate to="/" />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/build" element={<BuildPC />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/profile" element={session ? <Profile /> : <Navigate to="/signin" />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
