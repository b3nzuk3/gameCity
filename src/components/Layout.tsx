import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import AnnouncementBar from './AnnouncementBar'
import Navbar from './Navbar'
import Footer from './Footer'

interface LayoutProps {
  children: React.ReactNode
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation()
  const [isAtTop, setIsAtTop] = useState(() =>
    typeof window === 'undefined' ? true : window.scrollY <= 0
  )

  useEffect(() => {
    const updateScrollPosition = () => setIsAtTop(window.scrollY <= 0)
    updateScrollPosition()
    window.addEventListener('scroll', updateScrollPosition, { passive: true })
    return () => window.removeEventListener('scroll', updateScrollPosition)
  }, [])

  useEffect(() => {
    // Scroll to top on route change
    if ('scrollRestoration' in window.history) {
      try {
        // Prevent browser restoring scroll on SPA navigations
        window.history.scrollRestoration = 'manual'
      } catch {
        // Older embedded browsers may expose history as read-only.
      }
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior })
  }, [location.pathname, location.search, location.hash])

  return (
    <div className="min-h-screen flex flex-col">
      <AnnouncementBar isVisible={isAtTop} />
      <Navbar announcementVisible={isAtTop} />
      <main
        className={`flex-1 ${
          isAtTop ? 'pt-[9.5rem] lg:pt-[6.5rem]' : 'pt-28 lg:pt-16'
        }`}
      >
        {children}
      </main>
      <Footer />
    </div>
  )
}

export default Layout
