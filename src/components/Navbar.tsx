import React, { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useCart } from '@/contexts/CartContext'
import backendService, { type Product } from '@/services/backendService'
import { generateProductUrl } from '@/lib/slugUtils'
import { formatKESPrice } from '@/lib/currency'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  LogOut,
  Settings,
  Heart,
  Package,
  Shield,
} from 'lucide-react'

const Navbar = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { getCartCount } = useCart()
  const [searchQuery, setSearchQuery] = useState('')
  const [suggestions, setSuggestions] = useState<Product[]>([])
  const [suggestionsLoading, setSuggestionsLoading] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [highlightedSuggestion, setHighlightedSuggestion] = useState(-1)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isHidden, setIsHidden] = useState(false)
  const lastScrollYRef = useRef(0)
  const requestIdRef = useRef(0)

  useEffect(() => {
    const query = searchQuery.trim()
    if (query.length < 2) {
      setSuggestions([])
      setSuggestionsLoading(false)
      setHighlightedSuggestion(-1)
      return
    }

    const requestId = ++requestIdRef.current
    setSuggestionsLoading(true)
    setSearchOpen(true)
    const timer = window.setTimeout(async () => {
      try {
        const result = await backendService.products.getAll(1, query)
        if (requestId === requestIdRef.current) {
          setSuggestions(result.products.slice(0, 6))
          setHighlightedSuggestion(-1)
        }
      } catch {
        if (requestId === requestIdRef.current) setSuggestions([])
      } finally {
        if (requestId === requestIdRef.current) setSuggestionsLoading(false)
      }
    }, 300)

    return () => window.clearTimeout(timer)
  }, [searchQuery])

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!(event.target as HTMLElement).closest('[data-navbar-search]')) setSearchOpen(false)
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY || 0
      const lastY = lastScrollYRef.current

      // Always show when near the top
      if (currentY < 10) {
        setIsHidden(false)
        lastScrollYRef.current = currentY
        return
      }

      // Threshold to avoid jitter on tiny scrolls
      const threshold = 4
      if (Math.abs(currentY - lastY) < threshold) return

      // Hide on scroll down, show on scroll up
      if (currentY > lastY) {
        setIsHidden(true)
      } else {
        setIsHidden(false)
      }

      lastScrollYRef.current = currentY
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
      setIsMobileMenuOpen(false)
      setSearchOpen(false)
      setSuggestions([])
    }
  }

  const selectSuggestion = (product: Product) => {
    navigate(generateProductUrl({ _id: product.id, name: product.name, category: product.category }))
    setSearchQuery('')
    setSuggestions([])
    setSearchOpen(false)
    setIsMobileMenuOpen(false)
  }

  const handleSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      setSearchOpen(false)
      setHighlightedSuggestion(-1)
      return
    }
    if (!searchOpen || suggestions.length === 0) return
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setHighlightedSuggestion((current) => (current + 1) % suggestions.length)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setHighlightedSuggestion((current) => (current - 1 + suggestions.length) % suggestions.length)
    } else if (event.key === 'Enter' && highlightedSuggestion >= 0) {
      event.preventDefault()
      selectSuggestion(suggestions[highlightedSuggestion])
    }
  }

  const renderSuggestions = () => {
    if (!searchOpen || !searchQuery.trim()) return null
    return (
      <div className="absolute left-0 right-0 top-full mt-2 overflow-hidden rounded-lg border border-gray-700 bg-[#171725] shadow-2xl z-[60]" role="listbox">
        {suggestionsLoading ? (
          <div className="px-4 py-5 text-center text-sm text-gray-400">Searching...</div>
        ) : suggestions.length === 0 ? (
          <div className="px-4 py-5 text-center text-sm text-gray-400">No results found</div>
        ) : (
          suggestions.map((product, index) => (
            <button
              key={product.id}
              type="button"
              role="option"
              aria-selected={highlightedSuggestion === index}
              className={`flex w-full items-center gap-3 px-3 py-2 text-left transition-colors ${highlightedSuggestion === index ? 'bg-gray-800' : 'hover:bg-gray-800/80'}`}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => selectSuggestion(product)}
            >
              <img src={product.image} alt="" className="h-10 w-10 rounded object-cover bg-gray-800" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm text-white">{product.name}</span>
                <span className="block text-xs text-gray-400">{formatKESPrice(product.price)}</span>
              </span>
            </button>
          ))
        )}
      </div>
    )
  }

  const handleSignOut = async () => {
    try {
      await logout()
      navigate('/')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const totalItems = getCartCount()

  return (
    <nav
      className={`bg-[#0f0f19]/95 backdrop-blur-md border-b border-gray-800 shadow-lg fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ${
        isHidden ? '-translate-y-full' : 'translate-y-0'
      }`}
    >
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center space-x-1 sm:space-x-2 text-lg sm:text-xl font-bold text-[#FDB813] hover:text-[#ff9500] transition-colors"
          >
            <img
              src="/gamecity.png"
              alt="Gamecity Logo"
              className="h-6 w-6 sm:h-8 sm:w-8 object-contain"
            />
            <span className="hidden sm:inline">Gamecity Electronics</span>
            <span className="sm:hidden">Gamecity</span>
          </Link>

          {/* Search Bar - Desktop */}
          <div data-navbar-search className="hidden md:flex relative flex-1 max-w-lg mx-8">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search for games, accessories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery.trim().length >= 2 && setSearchOpen(true)}
                  onKeyDown={handleSearchKeyDown}
                  role="combobox"
                  aria-expanded={searchOpen}
                  aria-controls="navbar-search-suggestions"
                  className="w-full pl-10 pr-4 py-2 bg-gray-900 border-gray-700 text-white placeholder:text-gray-400 focus:border-yellow-500 focus:ring-yellow-500"
                />
              </div>
            </form>
            {renderSuggestions()}
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Navigation Links with Hover Dropdown */}
            <div className="relative group">
              <Link
                to="/category/all"
                className="text-gray-300 group-hover:text-yellow-400 transition-colors px-3 py-4 rounded-md text-sm font-medium flex items-center"
              >
                Categories
              </Link>
              
              {/* Dropdown Menu */}
              <div className="absolute left-0 top-[100%] pt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="rounded-md shadow-[0_8px_30px_rgb(0,0,0,0.5)] bg-gray-900 border border-gray-800 overflow-hidden glass-card">
                  <div className="py-1 flex flex-col">
                    <Link to="/category/pre-built" className="px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800 hover:text-yellow-400 transition-colors">Pre-built PCs</Link>
                    <Link to="/category/graphics-cards" className="px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800 hover:text-yellow-400 transition-colors">Graphics Cards</Link>
                    <Link to="/category/monitors" className="px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800 hover:text-yellow-400 transition-colors">Monitors</Link>
                    <Link to="/category/processors" className="px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800 hover:text-yellow-400 transition-colors">Processors</Link>
                    <Link to="/category/power-supply" className="px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800 hover:text-yellow-400 transition-colors">Power Supply</Link>
                    <Link to="/category/accessories" className="px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800 hover:text-yellow-400 transition-colors">Accessories</Link>
                    <div className="border-t border-gray-800 my-1"></div>
                    <Link to="/category/all" className="px-4 py-2.5 text-sm text-yellow-500 hover:bg-gray-800 hover:text-yellow-400 font-semibold transition-colors">View All Categories</Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Favorites */}
            <Link
              to="/favorites"
              aria-label="View favorites"
              className="text-gray-300 hover:text-yellow-400 transition-colors p-2 rounded-md"
            >
              <Heart className="h-5 w-5" aria-hidden="true" />
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              aria-label="View cart"
              className="relative text-gray-300 hover:text-yellow-400 transition-colors p-2 rounded-md"
            >
              <ShoppingCart className="h-5 w-5" aria-hidden="true" />
              {totalItems > 0 && (
                <span aria-hidden="true" className="absolute -top-1 -right-1 bg-yellow-500 text-black text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full bg-gray-800 hover:bg-gray-700"
                  >
                    <User className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-56 bg-gray-900 border-gray-700"
                  align="end"
                >
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium text-sm text-white">
                        {user.name}
                      </p>
                      <p className="w-[200px] truncate text-xs text-gray-400">
                        {user.email}
                      </p>
                      {user.isAdmin && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-500/20 text-yellow-400">
                          <Shield className="h-3 w-3 mr-1" />
                          Admin
                        </span>
                      )}
                    </div>
                  </div>
                  <DropdownMenuSeparator className="bg-gray-700" />
                  <DropdownMenuItem asChild>
                    <Link
                      to="/profile"
                      className="text-gray-300 hover:text-white"
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Profile Settings
                    </Link>
                  </DropdownMenuItem>
                  {user.isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link
                        to="/admin"
                        className="text-gray-300 hover:text-white"
                      >
                        <Shield className="mr-2 h-4 w-4" />
                        Admin Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator className="bg-gray-700" />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="text-red-400 hover:text-red-300 focus:text-red-300"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/signin">
                  <Button
                    variant="ghost"
                    className="text-gray-300 hover:text-white"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button className="bg-yellow-500 hover:bg-yellow-400 text-black">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Actions */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Mobile Search Button */}
            <Button
              variant="ghost"
              size="sm"
              aria-label="Open search"
              className="text-gray-300 hover:text-white p-2"
              onClick={() => {
                setIsMobileMenuOpen(true)
              }}
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Cart Button */}
            <Link
              to="/cart"
              aria-label="View cart"
              className="relative inline-flex items-center justify-center rounded-md text-sm font-medium text-gray-300 hover:text-white p-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <ShoppingCart className="h-5 w-5" aria-hidden="true" />
              {totalItems > 0 && (
                <span
                  aria-hidden="true"
                  className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
                >
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Mobile Menu Button */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label="Open menu"
                  className="text-gray-300"
                >
                  <Menu className="h-5 w-5" aria-hidden="true" />
                </Button>
              </SheetTrigger>
              <SheetContent className="bg-black border-gray-800">
                <SheetHeader>
                  <SheetTitle className="text-yellow-400">
                    Gamecity Menu
                  </SheetTitle>
                </SheetHeader>

                <div className="py-6 space-y-6">
                  {/* Mobile Search */}
                  <div data-navbar-search className="relative">
                  <form onSubmit={handleSearch} className="space-y-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        type="text"
                        placeholder="Search for games..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => searchQuery.trim().length >= 2 && setSearchOpen(true)}
                        onKeyDown={handleSearchKeyDown}
                        role="combobox"
                        aria-expanded={searchOpen}
                        aria-controls="mobile-search-suggestions"
                        className="w-full pl-10 bg-gray-900 border-gray-700"
                      />
                    </div>
                  </form>
                  {renderSuggestions()}
                  </div>

                  {/* Mobile Navigation */}
                  <div className="space-y-2">
                    <Link
                      to="/category/all"
                      className="block px-3 py-2 text-gray-300 hover:text-yellow-400 transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Categories
                    </Link>
                    <Link
                      to="/favorites"
                      className="block px-3 py-2 text-gray-300 hover:text-yellow-400 transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Favorites
                    </Link>
                    <Link
                      to="/cart"
                      className="flex items-center px-3 py-2 text-gray-300 hover:text-yellow-400 transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Cart ({totalItems})
                    </Link>
                  </div>

                  {/* Mobile User Menu */}
                  {user ? (
                    <div className="space-y-2 pt-4 border-t border-gray-800">
                      <div className="px-3 py-2">
                        <p className="font-medium text-white">{user.name}</p>
                        <p className="text-sm text-gray-400">{user.email}</p>
                        {user.isAdmin && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-500/20 text-yellow-400 mt-1">
                            <Shield className="h-3 w-3 mr-1" />
                            Admin
                          </span>
                        )}
                      </div>
                      <Link
                        to="/profile"
                        className="block px-3 py-2 text-gray-300 hover:text-yellow-400 transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Profile Settings
                      </Link>
                      {user.isAdmin && (
                        <Link
                          to="/admin"
                          className="block px-3 py-2 text-gray-300 hover:text-yellow-400 transition-colors"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Admin Dashboard
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          handleSignOut()
                          setIsMobileMenuOpen(false)
                        }}
                        className="block w-full text-left px-3 py-2 text-red-400 hover:text-red-300 transition-colors"
                      >
                        Sign Out
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2 pt-4 border-t border-gray-800">
                      <Link
                        to="/signin"
                        className="block px-3 py-2 text-gray-300 hover:text-yellow-400 transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Sign In
                      </Link>
                      <Link
                        to="/signup"
                        className="block px-3 py-2 text-yellow-400 hover:text-yellow-300 transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Sign Up
                      </Link>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
