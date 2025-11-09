'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { APP_CONFIG, APP_ROUTES } from '@/lib/constants';
import { auth } from '@/lib/api';
import { Button } from './ui';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState<string>('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    // Skip auth check on auth pages (they handle it themselves)
    const isAuthPage = pathname === APP_ROUTES.LOGIN || 
                       pathname === APP_ROUTES.SIGNUP || 
                       pathname === APP_ROUTES.HOME;
    
    if (!isAuthPage) {
    checkAuth();
    }
  }, [pathname]);

  // Detect scroll for landing page
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const checkAuth = async () => {
    try {
      const response = await auth.me();
      setIsLoggedIn(true);
      setUserName(response.user?.name || response.user?.email || '');
    } catch (err) {
      setIsLoggedIn(false);
      setUserName('');
    }
  };

  const handleLogout = async () => {
    try {
      await auth.logout();
    } catch (err) {
      // Ignore errors during logout
    }
    setIsLoggedIn(false);
    window.location.href = APP_ROUTES.LOGIN;
  };

  const isAuthPage = pathname === APP_ROUTES.LOGIN || pathname === APP_ROUTES.SIGNUP;
  const isLandingPage = pathname === APP_ROUTES.HOME;

  // Dynamic navbar styling
  const navbarClasses = isLandingPage
    ? `sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-dark-bg-card/95 backdrop-blur-xl border-b border-dark-border-primary shadow-lg'
          : 'bg-transparent border-b border-transparent'
      }`
    : 'sticky top-0 z-50 bg-dark-bg-card/80 backdrop-blur-xl border-b border-dark-border-primary';

  return (
    <nav className={navbarClasses}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href={APP_ROUTES.HOME} className="flex items-center gap-2 group">
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-600/20 blur-lg group-hover:bg-emerald-600/30 transition-all duration-300" />
              <div className="relative w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <span className="text-xl font-bold gradient-text">{APP_CONFIG.NAME}</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {isLoggedIn && !isAuthPage && (
              <>
                <Link
                  href={APP_ROUTES.DASHBOARD}
                  className={`text-sm font-medium transition-colors ${
                    pathname === APP_ROUTES.DASHBOARD
                      ? 'text-primary-400'
                      : 'text-dark-text-secondary hover:text-dark-text-primary'
                  }`}
                >
                  Dashboard
                </Link>
              </>
            )}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isLoggedIn && !isAuthPage ? (
              <>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-dark-bg-elevated">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">
                      {userName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-dark-text-primary">
                    {userName}
                  </span>
                </div>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : !isAuthPage ? (
              <>
                <Link href={APP_ROUTES.LOGIN}>
                  <Button variant="ghost" size="sm">
                    Log In
                  </Button>
                </Link>
                <Link href={APP_ROUTES.SIGNUP}>
                  <Button size="sm">
                    Get Started
                  </Button>
                </Link>
              </>
            ) : null}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-dark-text-primary p-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-dark-border-primary bg-dark-bg-card">
          <div className="px-4 py-4 space-y-3">
            {isLoggedIn && !isAuthPage && (
              <>
                <div className="flex items-center gap-3 px-3 py-2 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
                    <span className="text-white font-semibold">
                      {userName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-dark-text-primary">{userName}</p>
                  </div>
                </div>
                <Link
                  href={APP_ROUTES.DASHBOARD}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-dark-text-secondary hover:text-dark-text-primary hover:bg-dark-bg-elevated"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
              </>
            )}
            
            {isLoggedIn && !isAuthPage ? (
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-dark-text-secondary hover:text-dark-text-primary hover:bg-dark-bg-elevated"
              >
                Logout
              </button>
            ) : !isAuthPage ? (
              <>
                <Link
                  href={APP_ROUTES.LOGIN}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-dark-text-secondary hover:text-dark-text-primary hover:bg-dark-bg-elevated"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Log In
                </Link>
                <Link
                  href={APP_ROUTES.SIGNUP}
                  className="block px-3 py-2 rounded-lg text-sm font-medium bg-primary-600 text-white text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Get Started
                </Link>
              </>
            ) : null}
          </div>
        </div>
      )}
    </nav>
  );
}
