import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useCart } from '@/contexts/CartContext'
import backendService, { type Product } from '@/services/backendService'
import { generateProductUrl } from '@/lib/slugUtils'
import {
  isMobileHeaderAtTop,
  isMobileHeaderState,
  nextMobileHeaderScrollState,
} from '@/lib/mobileHeader'
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
import MobileMenuCategories from '@/components/MobileMenuCategories'

const useBrowserLayoutEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect

type MobileHeaderState = 'top' | 'compact' | 'hidden'

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
  const [mobileHeaderState, setMobileHeaderState] =
    useState<MobileHeaderState>('top')
  const [mobileMainHeight, setMobileMainHeight] = useState(56)
  const mobileHeaderStateRef = useRef<MobileHeaderState>('top')
  const mainRowRef = useRef<HTMLDivElement>(null)
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

  useBrowserLayoutEffect(() => {
    const historyState = window.history.state || {}
    const restorationTarget = Number.isFinite(historyState.gameCityCatalogScrollY)
      ? Math.max(0, historyState.gameCityCatalogScrollY)
      : null
    const hasCatalogRestoration = Boolean(
      historyState.gameCityCatalogSnapshotKey &&
        restorationTarget !== null &&
        !isMobileHeaderAtTop(restorationTarget)
    )
    const storedState: MobileHeaderState = isMobileHeaderState(
      historyState.gameCityMobileHeaderState
    )
      ? historyState.gameCityMobileHeaderState
      : 'compact'
    const restoredAwayFromTopState =
      storedState === 'top' ? 'compact' : storedState
    let isRestoring = Boolean(
      hasCatalogRestoration &&
        restorationTarget !== null &&
        Math.abs(window.scrollY - restorationTarget) > 1
    )
    let anchorScrollY = isRestoring
      ? restorationTarget ?? window.scrollY
      : window.scrollY

    const commitHeaderState = (nextState: MobileHeaderState, force = false) => {
      if (force || mobileHeaderStateRef.current !== nextState) {
        mobileHeaderStateRef.current = nextState
        setMobileHeaderState(nextState)
        try {
          window.history.replaceState(
            {
              ...window.history.state,
              gameCityMobileHeaderState: nextState,
            },
            '',
            window.location.href
          )
        } catch {
          // Header motion should continue if history state is unavailable.
        }
      }
    }

    const initialState: MobileHeaderState =
      isMobileHeaderAtTop(window.scrollY) && !isRestoring
        ? 'top'
        : restoredAwayFromTopState
    commitHeaderState(initialState, true)

    const finishRestoration = () => {
      isRestoring = false
      anchorScrollY = window.scrollY
      commitHeaderState(
        isMobileHeaderAtTop(window.scrollY)
          ? 'top'
          : restoredAwayFromTopState
      )
    }

    const handleScroll = () => {
      if (
        isRestoring &&
        restorationTarget !== null &&
        Math.abs(window.scrollY - restorationTarget) <= 2
      ) {
        finishRestoration()
        return
      }
      if (isRestoring) return

      const next = nextMobileHeaderScrollState({
        scrollY: window.scrollY,
        anchorScrollY,
        currentState: mobileHeaderStateRef.current,
      })
      anchorScrollY = next.anchorScrollY
      commitHeaderState(next.state as MobileHeaderState)
    }

    const restorationTimeout = window.setTimeout(() => {
      if (isRestoring) finishRestoration()
    }, 1200)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.clearTimeout(restorationTimeout)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  useEffect(() => {
    const mainRow = mainRowRef.current
    if (!mainRow) return
    const updateHeight = () => {
      const nextHeight = mainRow.getBoundingClientRect().height
      if (nextHeight > 0) setMobileMainHeight(nextHeight)
    }
    updateHeight()
    if (typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(updateHeight)
    observer.observe(mainRow)
    return () => observer.disconnect()
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

  const renderSuggestions = (id: string) => {
    if (!searchOpen || !searchQuery.trim()) return null
    return (
      <div id={id} className="absolute left-0 right-0 top-full mt-2 overflow-hidden rounded-lg border border-gray-700 bg-[#171725] shadow-2xl z-[60]" role="listbox">
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
      data-mobile-header-state={mobileHeaderState}
      className={`bg-[#0f0f19]/95 backdrop-blur-md border-b border-gray-800 shadow-lg fixed top-[env(safe-area-inset-top)] lg:top-0 left-0 right-0 z-50 transition-transform duration-200 ease-out motion-reduce:transition-none lg:translate-y-0 ${
        mobileHeaderState === 'top'
          ? 'translate-y-0'
          : mobileHeaderState === 'compact'
            ? '-translate-y-[var(--mobile-main-height)]'
            : '-translate-y-[calc(100%+1px)]'
      }`}
      style={
        {
          '--mobile-main-height': `${mobileMainHeight}px`,
        } as React.CSSProperties
      }
    >
      <div
        ref={mainRowRef}
        data-mobile-header-row="main"
        className="container mx-auto px-3 sm:px-4 lg:w-full lg:max-w-none lg:px-[clamp(0.75rem,1.25vw,1.5rem)]"
      >
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
          <div
            data-navbar-search
            className="relative mx-[clamp(1rem,2vw,2.25rem)] hidden min-w-0 flex-1 lg:flex"
          >
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
            {renderSuggestions('navbar-search-suggestions')}
          </div>

          {/* Desktop Menu */}
          <div className="hidden shrink-0 items-center gap-1 lg:flex xl:gap-2">
            {/* Navigation Links with Hover Dropdown */}
            <div className="relative group">
              <Link
                to="/category/all"
                className="flex items-center rounded-md px-2 py-4 text-sm font-medium text-gray-300 transition-colors group-hover:text-yellow-400 xl:px-3"
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
              <div className="flex items-center gap-1">
                <Link to="/signin">
                  <Button
                    variant="ghost"
                    className="px-2 text-gray-300 hover:text-white xl:px-3"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button className="bg-yellow-500 px-3 text-black hover:bg-yellow-400 xl:px-4">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Actions */}
          <div className="lg:hidden flex items-center space-x-2">
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
                  {/* Mobile Navigation */}
                  <div className="space-y-2">
                    <MobileMenuCategories
                      isOpen={isMobileMenuOpen}
                      onNavigate={() => setIsMobileMenuOpen(false)}
                    />
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

      {/* Persistent Mobile Search Row */}
      <div
        data-mobile-header-row="search"
        data-navbar-search
        className="relative border-t border-gray-800/80 px-3 py-2 lg:hidden"
      >
        <form onSubmit={handleSearch} role="search" aria-label="Search products">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
              aria-hidden="true"
            />
            <Input
              type="search"
              inputMode="search"
              enterKeyHint="search"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              onFocus={() =>
                searchQuery.trim().length >= 2 && setSearchOpen(true)
              }
              onKeyDown={handleSearchKeyDown}
              role="combobox"
              aria-label="Search products"
              aria-expanded={searchOpen}
              aria-controls="mobile-search-suggestions"
              className="h-10 w-full rounded-lg border-gray-700 bg-gray-900 pl-10 pr-3 text-white placeholder:text-gray-400 focus:border-yellow-500 focus:ring-yellow-500"
            />
          </div>
        </form>
        {renderSuggestions('mobile-search-suggestions')}
      </div>
      <div id="mobile-catalog-nav-slot" className="lg:hidden" />
    </nav>
  )
}

export default Navbar
