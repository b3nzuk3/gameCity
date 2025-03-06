
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import Index from "@/pages/Index";
import SignIn from "@/pages/SignIn";
import SignUp from "@/pages/SignUp";
import Profile from "@/pages/Profile";
import Cart from "@/pages/Cart";
import Admin from "@/pages/Admin";
import CreateAdmin from "@/pages/CreateAdmin";
import NotFound from "@/pages/NotFound";

// Create placeholder pages for the missing routes
const Products = () => <div className="container py-16">Products page coming soon</div>;
const Checkout = () => <div className="container py-16">Checkout page coming soon</div>;
const OrderSuccess = () => <div className="container py-16">Order Success page coming soon</div>;
const OrderDetails = () => <div className="container py-16">Order Details page coming soon</div>;

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/products" element={<Products />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-success" element={<OrderSuccess />} />
        <Route path="/order/:id" element={<OrderDetails />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/create-admin" element={<CreateAdmin />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;
