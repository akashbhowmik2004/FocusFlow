import { useEffect } from 'react'
import { useApp } from '@/context/AppContext'
import LandingNavbar from '@/components/landing/LandingNavbar'
import LandingHero from '@/components/landing/LandingHero'
import LandingFeatures from '@/components/landing/LandingFeatures'
import LandingWhyFocusFlow from '@/components/landing/LandingWhyFocusFlow'
import LandingShowcase from '@/components/landing/LandingShowcase'
import LandingTestimonials from '@/components/landing/LandingTestimonials'
import LandingFaq from '@/components/landing/LandingFaq'
import LandingCtaBanner from '@/components/landing/LandingCtaBanner'
import LandingFooter from '@/components/landing/LandingFooter'

/**
 * FocusFlow Public Landing Page
 * Complete redesign matching the concept reference image.
 * Features:
 * - Premium academic productivity aesthetic
 * - 3D floating perspective dashboard hero
 * - 5 core feature pillars
 * - Editorial "Why FocusFlow" section
 * - Interactive multi-module product showcase
 * - Student testimonials
 * - Interactive accordion FAQ
 * - 3D academic books & graduation cap CTA banner
 * - Full light and dark theme fidelity with seamless toggle
 */
export default function Landing() {
  const { state, toggleTheme } = useApp()
  const isDark = state.theme === 'dark'

  useEffect(() => {
    // Scroll to top on initial page mount
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="min-h-screen bg-white dark:bg-[#070b14] text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-500 selection:text-white transition-colors duration-200 overflow-x-clip">
      {/* Sticky Glassmorphic Navigation Bar */}
      <LandingNavbar isDark={isDark} onToggleTheme={toggleTheme} />

      {/* Main Landing Sections */}
      <main>
        {/* Hero Section with 3D Floating Dashboard Preview */}
        <LandingHero isDark={isDark} />

        {/* 5 Core Feature Pillars */}
        <LandingFeatures />

        {/* Editorial "Why FocusFlow" Deep Work Comparison */}
        <LandingWhyFocusFlow />

        {/* Interactive Multi-Module Product Showcase */}
        <LandingShowcase isDark={isDark} />

        {/* Student Testimonials */}
        <LandingTestimonials />

        {/* Interactive FAQ Accordion */}
        <LandingFaq />

        {/* Closing 3D Academic CTA Banner */}
        <LandingCtaBanner />
      </main>

      {/* Footer with Academic Engine Links & Copyright */}
      <LandingFooter />
    </div>
  )
}
