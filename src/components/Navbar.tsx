
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  ShoppingCart, 
  User, 
  Menu, 
  X, 
  Search,
  Monitor,
  Database,
  Settings,
  CreditCard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const categories = [
    { name: "Monitors", icon: <Monitor size={16} />, path: "/category/monitors" },
    { name: "Components", icon: <Database size={16} />, path: "/category/components" },
    { name: "PC Building", icon: <Settings size={16} />, path: "/category/pc-building" },
    { name: "Accessories", icon: <CreditCard size={16} />, path: "/category/accessories" }
  ];

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-forest-800/90 backdrop-blur-lg shadow-md"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-xl font-bold text-emerald-400">GreenBits</span>
          </Link>

          {/* Desktop Menu */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-sm text-foreground hover:text-emerald-400 transition-colors">
              Home
            </Link>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="text-sm text-foreground hover:text-emerald-400 transition-colors p-0"
                >
                  Products
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-60 bg-forest-800 border-emerald-700/50">
                <DropdownMenuLabel className="text-emerald-400">Categories</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-emerald-800/30" />
                {categories.map((category) => (
                  <Link to={category.path} key={category.name}>
                    <DropdownMenuItem 
                      className="cursor-pointer hover:bg-emerald-900/30"
                    >
                      <div className="flex items-center gap-2">
                        {category.icon}
                        <span>{category.name}</span>
                      </div>
                    </DropdownMenuItem>
                  </Link>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Link to="/build" className="text-sm text-foreground hover:text-emerald-400 transition-colors">
              Build Your PC
            </Link>
            <Link to="/about" className="text-sm text-foreground hover:text-emerald-400 transition-colors">
              About
            </Link>
            <Link to="/contact" className="text-sm text-foreground hover:text-emerald-400 transition-colors">
              Contact
            </Link>
          </nav>

          {/* Right Side Icons */}
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-foreground hover:text-emerald-400 bg-transparent hover:bg-forest-700/40"
            >
              <Search size={20} />
            </Button>
            <Link to="/account">
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-foreground hover:text-emerald-400 bg-transparent hover:bg-forest-700/40"
              >
                <User size={20} />
              </Button>
            </Link>
            <Link to="/cart">
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-foreground hover:text-emerald-400 bg-transparent hover:bg-forest-700/40 relative"
              >
                <ShoppingCart size={20} />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-emerald-500 text-[10px]">
                  3
                </Badge>
              </Button>
            </Link>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-foreground hover:text-emerald-400 bg-transparent hover:bg-forest-700/40"
              onClick={toggleMobileMenu}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-forest-800 shadow-lg animate-fade-in">
          <div className="py-4 px-4 space-y-2">
            <Link
              to="/"
              className="block py-3 px-4 text-foreground hover:bg-forest-700/40 rounded-md transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </Link>
            <div className="py-3 px-4 text-foreground">
              <div className="mb-2 font-medium">Categories</div>
              <div className="ml-3 space-y-2">
                {categories.map((category) => (
                  <Link
                    key={category.name}
                    to={category.path}
                    className="flex items-center gap-2 py-2 text-sm text-muted-foreground hover:text-emerald-400"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {category.icon}
                    <span>{category.name}</span>
                  </Link>
                ))}
              </div>
            </div>
            <Link
              to="/build"
              className="block py-3 px-4 text-foreground hover:bg-forest-700/40 rounded-md transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Build Your PC
            </Link>
            <Link
              to="/about"
              className="block py-3 px-4 text-foreground hover:bg-forest-700/40 rounded-md transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About
            </Link>
            <Link
              to="/contact"
              className="block py-3 px-4 text-foreground hover:bg-forest-700/40 rounded-md transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Contact
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
