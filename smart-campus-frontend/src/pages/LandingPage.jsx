// FONT NOTE: Add to index.html <head>:
// <link href="https://fonts.cdnfonts.com/css/helvetica-neue-55" rel="stylesheet">

import { useState, useEffect, useRef } from 'react'
import { motion, useMotionValue, useSpring, useInView } from 'framer-motion'
import { Link } from 'react-router-dom'
import { 
  Building, 
  Calendar, 
  Users, 
  Ticket, 
  Wifi, 
  Monitor, 
  MapPin,
  ChevronRight,
  CheckCircle,
  Star,
  ArrowRight,
  Mail,
  Phone
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'

export default function LandingPage() {
  const { user } = useAuthStore()
  const [activeSection, setActiveSection] = useState('home')

  // Refs for sections to observe
  const heroRef = useRef(null)
  const featuresRef = useRef(null)
  const aboutRef = useRef(null)
  const contactRef = useRef(null)

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-50% 0px -50% 0px',
      threshold: 0
    }

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id || 'home')
        }
      })
    }

    const observer = new IntersectionObserver(observerCallback, observerOptions)

    // Observe sections
    if (heroRef.current) observer.observe(heroRef.current)
    if (featuresRef.current) observer.observe(featuresRef.current)
    if (aboutRef.current) observer.observe(aboutRef.current)
    if (contactRef.current) observer.observe(contactRef.current)

    return () => observer.disconnect()
  }, [])

  // If user is already logged in, redirect to dashboard
  if (user) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to dashboard...</p>
      </div>
    </div>
  }

// Animated Counter Component
function AnimatedCounter({ value, suffix = '', prefix = '' }) {
  const ref = useRef(null)
  const motionValue = useMotionValue(0)
  const springValue = useSpring(motionValue, { damping: 30, stiffness: 100 })
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    if (isInView) {
      motionValue.set(value)
    }
  }, [isInView, value, motionValue])

  useEffect(() => {
    const unsubscribe = springValue.on('change', (latest) => {
      setDisplayValue(Math.round(latest))
    })
    return unsubscribe
  }, [springValue])

  return (
    <span ref={ref}>
      {prefix}{displayValue.toLocaleString()}{suffix}
    </span>
  )
}

  const handleLogin = () => {
    window.location.href = 'http://localhost:8080/oauth2/authorization/google'
  }

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
  }

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } }
  }

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  }

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }
  }

  const slideInLeft = {
    hidden: { opacity: 0, x: -60 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
  }

  const slideInRight = {
    hidden: { opacity: 0, x: 60 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
  }

  const getNavLinkClass = (section) => {
    const baseClass = "font-medium transition-colors"
    return activeSection === section
      ? `${baseClass} text-orange-500`
      : `${baseClass} text-gray-600 hover:text-orange-500`
  }

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Helvetica Neue', sans-serif" }}>
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Left: Logo */}
          <div className="flex items-center space-x-2">
            <img 
              src="https://i.pinimg.com/1200x/7e/f6/9e/7ef69e2c667f0e9a53d69151a0071fb8.jpg"
              alt="Smart Campus Logo"
              className="w-8 h-8 rounded-lg object-cover"
            />
            <span className="text-xl font-bold text-gray-900">Smart Campus</span>
          </div>

          {/* Middle: Nav Links (desktop only) */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#" className={getNavLinkClass('home')}>Home</a>
            <a href="#features" className={getNavLinkClass('features')}>Features</a>
            <a href="#about" className={getNavLinkClass('about')}>About</a>
            <a href="#contact" className={getNavLinkClass('contact')}>Contact</a>
          </div>

          {/* Right: Login Button */}
          <button
            onClick={handleLogin}
            className="bg-gray-900 hover:bg-gray-800 text-white px-5 py-2.5 rounded-full font-medium text-sm transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Login with Google
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} id="home" className="relative overflow-hidden bg-gradient-to-b from-white via-orange-50 to-orange-100 pt-12 pb-0 px-4 sm:px-6 lg:px-8">
        {/* Headline */}
        <motion.h1
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 text-center leading-[1.1] tracking-tight max-w-4xl mx-auto mb-6 font-['Helvetica Neue']"
        >
          Manage Your Campus<br/>Smarter, Faster, Together
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ delay: 0.1 }}
          className="text-base sm:text-lg text-gray-500 text-center max-w-2xl mx-auto mb-6 leading-relaxed"
        >
          Book resources, raise support tickets, and manage campus operations all from one platform.
        </motion.p>

        {/* CTA Buttons Row */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button
            onClick={handleLogin}
            className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3.5 rounded-full font-semibold text-base transition-all shadow-lg shadow-orange-200 flex items-center gap-2"
          >
            Get Started Free
            <ArrowRight className="w-4 h-4" />
          </button>
          <a
            href="#features"
            className="border border-gray-300 text-gray-700 hover:border-orange-400 hover:text-orange-600 bg-white px-8 py-3.5 rounded-full font-medium text-base transition-all flex items-center gap-2"
          >
            Explore Features
            <ChevronRight className="w-4 h-4" />
          </a>
        </motion.div>

        {/* Social Proof */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-center gap-2 text-sm text-gray-400 mt-6"
        >
          <div className="flex -space-x-2">
            <motion.img whileHover={{ scale: 1.1, zIndex: 10 }} src="https://i.pinimg.com/1200x/30/65/13/306513fa0dd97c236910f9872c6e213a.jpg" alt="AS" className="w-8 h-8 rounded-full object-cover border-2 border-white" />
            <motion.img whileHover={{ scale: 1.1, zIndex: 10 }} src="https://i.pinimg.com/1200x/d9/47/81/d94781f355587941201a2fc3f2141152.jpg" alt="KL" className="w-8 h-8 rounded-full object-cover border-2 border-white" />
            <motion.img whileHover={{ scale: 1.1, zIndex: 10 }} src="https://i.pinimg.com/1200x/06/3b/d8/063bd8d9783e0aa676516558ee5b7cab.jpg" alt="RM" className="w-8 h-8 rounded-full object-cover border-2 border-white" />
            <motion.img whileHover={{ scale: 1.1, zIndex: 10 }} src="https://i.pinimg.com/1200x/80/73/b1/8073b1cba52b58d4cada17599332c6b5.jpg" alt="JP" className="w-8 h-8 rounded-full object-cover border-2 border-white" />
            <motion.img whileHover={{ scale: 1.1, zIndex: 10 }} src="https://i.pinimg.com/1200x/5d/c3/ef/5dc3efa5abd2109c2a127e528973d1b4.jpg" alt="NW" className="w-8 h-8 rounded-full object-cover border-2 border-white" />
          </div>
          <span className="ml-2">Join 500+ campus users already using Smart Campus</span>
        </motion.div>

        {/* Dashboard Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="mt-2 mx-auto max-w-5xl px-4"
        >
          {/* Browser Chrome */}
          <div className="bg-gray-100 rounded-t-2xl px-4 py-3 flex items-center gap-2 border border-gray-200 border-b-0">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
            <div className="flex-1 bg-white rounded-md h-5 mx-4 border border-gray-200"></div>
          </div>
          {/* Image */}
          <img
            src="https://res.cloudinary.com/djqnlrrrw/image/upload/v1775646381/FireShot_Capture_231_-_Smart_Campus_-_Resource_Management_System_-_localhost_rjgczy.png
"
            alt="Smart Campus Dashboard"
            loading="lazy"
            className="w-full h-auto object-cover rounded-b-2xl border border-gray-200 border-t-0 shadow-2xl shadow-orange-100"
          />
        </motion.div>

        {/* Trusted By Row */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center pt-12 pb-10"
        >
          <p className="text-sm text-gray-400 mb-6 uppercase tracking-widest font-medium">Trusted by leading institutions</p>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="flex flex-wrap justify-center items-center gap-10 opacity-50"
          >
            <motion.span variants={fadeIn} className="text-lg font-bold text-gray-700">Ministry of Education</motion.span>
            <motion.span variants={fadeIn} className="text-lg font-semibold text-gray-700">SLIIT</motion.span>
            <motion.span variants={fadeIn} className="text-lg font-bold text-gray-700">UniConnect</motion.span>
            <motion.span variants={fadeIn} className="text-lg font-medium text-gray-700">CampusLink</motion.span>
            <motion.span variants={fadeIn} className="text-lg font-bold text-gray-700">EduTech SL</motion.span>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <p className="text-sm font-semibold text-orange-500 uppercase tracking-widest mb-3">By the Numbers</p>
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4 font-['Helvetica Neue']">Campus at a Glance</h2>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-12 max-w-5xl mx-auto"
        >
          <motion.div variants={scaleIn} whileHover={{ y: -5 }} className="text-center p-8 rounded-2xl border border-gray-100 hover:border-orange-200 hover:shadow-md transition-all bg-white">
            <Building className="w-6 h-6 text-orange-500 mx-auto mb-4" />
            <div className="text-5xl font-extrabold text-gray-900 mb-2 font-['Helvetica Neue']"><AnimatedCounter value={50} suffix="+" /></div>
            <div className="text-sm text-gray-500 font-medium">Rooms Available</div>
          </motion.div>
          <motion.div variants={scaleIn} whileHover={{ y: -5 }} className="text-center p-8 rounded-2xl border border-gray-100 hover:border-orange-200 hover:shadow-md transition-all bg-white">
            <Monitor className="w-6 h-6 text-orange-500 mx-auto mb-4" />
            <div className="text-5xl font-extrabold text-gray-900 mb-2 font-['Helvetica Neue']"><AnimatedCounter value={200} suffix="+" /></div>
            <div className="text-sm text-gray-500 font-medium">Lab Equipment</div>
          </motion.div>
          <motion.div variants={scaleIn} whileHover={{ y: -5 }} className="text-center p-8 rounded-2xl border border-gray-100 hover:border-orange-200 hover:shadow-md transition-all bg-white">
            <Calendar className="w-6 h-6 text-orange-500 mx-auto mb-4" />
            <div className="text-5xl font-extrabold text-gray-900 mb-2 font-['Helvetica Neue']"><AnimatedCounter value={1000} suffix="+" /></div>
            <div className="text-sm text-gray-500 font-medium">Monthly Bookings</div>
          </motion.div>
          <motion.div variants={scaleIn} whileHover={{ y: -5 }} className="text-center p-8 rounded-2xl border border-gray-100 hover:border-orange-200 hover:shadow-md transition-all bg-white">
            <Users className="w-6 h-6 text-orange-500 mx-auto mb-4" />
            <div className="text-5xl font-extrabold text-gray-900 mb-2 font-['Helvetica Neue']"><AnimatedCounter value={500} suffix="+" /></div>
            <div className="text-sm text-gray-500 font-medium">Active Users</div>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-orange-50/50">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-600 text-xs font-semibold tracking-widest uppercase px-4 py-1.5 rounded-full mb-4">
            <span className="w-2 h-2 rounded-full bg-orange-500"></span>
            Core Features
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 font-['Helvetica Neue'] text-center mt-4 mb-4">
            Everything You Need in One Place
          </h2>
          <p className="text-lg text-gray-500 text-center max-w-2xl mx-auto">
            Our comprehensive suite of tools designed to streamline your campus experience.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto"
        >
          {/* Feature 1: Resource Booking */}
          <motion.div variants={fadeInUp} whileHover={{ y: -8 }} className="bg-white rounded-2xl p-8 border border-gray-100 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-50 transition-all duration-300 group">
            <div className="w-12 h-12 bg-orange-100 group-hover:bg-orange-500 rounded-xl flex items-center justify-center mb-6 transition-colors duration-300">
              <Calendar className="w-6 h-6 text-orange-500 group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-3 font-['Helvetica Neue']">Resource Booking</h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-5">
              Book rooms, labs, and equipment with real-time availability and conflict prevention.
            </p>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-orange-500" />
                Real-time availability
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-orange-500" />
                Conflict prevention
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-orange-500" />
                Calendar sync
              </li>
            </ul>
          </motion.div>

          {/* Feature 2: Support Tickets */}
          <motion.div variants={fadeInUp} whileHover={{ y: -8 }} className="bg-white rounded-2xl p-8 border border-gray-100 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-50 transition-all duration-300 group">
            <div className="w-12 h-12 bg-orange-100 group-hover:bg-orange-500 rounded-xl flex items-center justify-center mb-6 transition-colors duration-300">
              <Ticket className="w-6 h-6 text-orange-500 group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-3 font-['Helvetica Neue']">Support Tickets</h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-5">
              Submit and track IT support requests from anywhere. Get updates as technicians resolve your issues.
            </p>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-orange-500" />
                Priority levels
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-orange-500" />
                Status tracking
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-orange-500" />
                Technician assignment
              </li>
            </ul>
          </motion.div>

          {/* Feature 3: User Management */}
          <motion.div variants={fadeInUp} whileHover={{ y: -8 }} className="bg-white rounded-2xl p-8 border border-gray-100 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-50 transition-all duration-300 group">
            <div className="w-12 h-12 bg-orange-100 group-hover:bg-orange-500 rounded-xl flex items-center justify-center mb-6 transition-colors duration-300">
              <Users className="w-6 h-6 text-orange-500 group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-3 font-['Helvetica Neue']">User Management</h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-5">
              Role-based access control for students, faculty, technicians, and administrators.
            </p>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-orange-500" />
                Role-based access
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-orange-500" />
                Google OAuth
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-orange-500" />
                Profile management
              </li>
            </ul>
          </motion.div>

          {/* Feature 4: QR Code Check-In */}
          <motion.div variants={fadeInUp} whileHover={{ y: -8 }} className="bg-white rounded-2xl p-8 border border-gray-100 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-50 transition-all duration-300 group">
            <div className="w-12 h-12 bg-orange-100 group-hover:bg-orange-500 rounded-xl flex items-center justify-center mb-6 transition-colors duration-300">
              <Monitor className="w-6 h-6 text-orange-500 group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-3 font-['Helvetica Neue']">QR Code Check-In</h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-5">
              Scan QR codes to check into booked resources and validate bookings instantly.
            </p>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-orange-500" />
                Instant validation
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-orange-500" />
                Mobile friendly
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-orange-500" />
                Audit trail
              </li>
            </ul>
          </motion.div>

          {/* Feature 5: Campus Navigation */}
          <motion.div variants={fadeInUp} whileHover={{ y: -8 }} className="bg-white rounded-2xl p-8 border border-gray-100 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-50 transition-all duration-300 group">
            <div className="w-12 h-12 bg-orange-100 group-hover:bg-orange-500 rounded-xl flex items-center justify-center mb-6 transition-colors duration-300">
              <MapPin className="w-6 h-6 text-orange-500 group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-3 font-['Helvetica Neue']">Campus Navigation</h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-5">
              Discover available resources near you with interactive maps and building directories.
            </p>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-orange-500" />
                Interactive maps
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-orange-500" />
                Building directories
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-orange-500" />
                Room details
              </li>
            </ul>
          </motion.div>

          {/* Feature 6: Smart Integration */}
          <motion.div variants={fadeInUp} whileHover={{ y: -8 }} className="bg-white rounded-2xl p-8 border border-gray-100 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-50 transition-all duration-300 group">
            <div className="w-12 h-12 bg-orange-100 group-hover:bg-orange-500 rounded-xl flex items-center justify-center mb-6 transition-colors duration-300">
              <Wifi className="w-6 h-6 text-orange-500 group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-3 font-['Helvetica Neue']">Smart Integration</h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-5">
              Connect with existing campus systems for a seamless experience across all operations.
            </p>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-orange-500" />
                API access
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-orange-500" />
                Webhook support
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-orange-500" />
                Third-party integrations
              </li>
            </ul>
          </motion.div>
        </motion.div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 px-4 bg-white">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-600 text-xs font-semibold tracking-widest uppercase px-4 py-1.5 rounded-full mb-4">
            <span className="w-2 h-2 rounded-full bg-orange-500"></span>
            How It Works
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 font-['Helvetica Neue']">
            Three Simple Steps
          </h2>
        </motion.div>

        {/* Steps Container */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="flex flex-col md:flex-row gap-8 md:gap-0 max-w-5xl mx-auto mt-16 relative"
        >
          {/* Horizontal Connector Line (desktop only) */}
          <div className="hidden md:block absolute top-10 left-[16.66%] right-[16.66%] h-px bg-orange-200 z-0"></div>

          {/* Step 1 */}
          <motion.div variants={fadeInUp} className="flex-1 flex flex-col items-center text-center relative z-10">
            <motion.div whileHover={{ scale: 1.1 }} className="w-20 h-20 rounded-full bg-orange-500 text-white text-2xl font-extrabold flex items-center justify-center mb-6 shadow-lg shadow-orange-200 font-['Helvetica Neue']">
              1
            </motion.div>
            <h3 className="text-xl font-bold text-gray-900 mb-3 font-['Helvetica Neue']">Sign In with Google</h3>
            <p className="text-gray-500 text-sm max-w-xs leading-relaxed">
              Use your university Google account to access the platform securely. No extra passwords needed.
            </p>
          </motion.div>

          {/* Step 2 */}
          <motion.div variants={fadeInUp} className="flex-1 flex flex-col items-center text-center relative z-10">
            <motion.div whileHover={{ scale: 1.1 }} className="w-20 h-20 rounded-full bg-orange-500 text-white text-2xl font-extrabold flex items-center justify-center mb-6 shadow-lg shadow-orange-200 font-['Helvetica Neue']">
              2
            </motion.div>
            <h3 className="text-xl font-bold text-gray-900 mb-3 font-['Helvetica Neue']">Find & Book Resources</h3>
            <p className="text-gray-500 text-sm max-w-xs leading-relaxed">
              Browse available rooms, labs, and equipment. Reserve in seconds with real-time availability.
            </p>
          </motion.div>

          {/* Step 3 */}
          <motion.div variants={fadeInUp} className="flex-1 flex flex-col items-center text-center relative z-10">
            <motion.div whileHover={{ scale: 1.1 }} className="w-20 h-20 rounded-full bg-orange-500 text-white text-2xl font-extrabold flex items-center justify-center mb-6 shadow-lg shadow-orange-200 font-['Helvetica Neue']">
              3
            </motion.div>
            <h3 className="text-xl font-bold text-gray-900 mb-3 font-['Helvetica Neue']">Check In & Get Support</h3>
            <p className="text-gray-500 text-sm max-w-xs leading-relaxed">
              Scan QR codes to check in to your booking, or raise a support ticket if you need help.
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* About Section */}
      <section ref={aboutRef} id="about" className="py-24 px-4 sm:px-6 lg:px-8 bg-orange-50/30">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-600 text-xs font-semibold tracking-widest uppercase px-4 py-1.5 rounded-full mb-4">
              <span className="w-2 h-2 rounded-full bg-orange-500"></span>
              About Us
            </div>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 font-['Helvetica Neue'] text-center mt-4 mb-4">
              Building Smarter Campuses
            </h2>
            <p className="text-lg text-gray-500 text-center max-w-2xl mx-auto">
              We're on a mission to transform how educational institutions manage their resources and operations.
            </p>
          </motion.div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Story */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-4 font-['Helvetica Neue']">Our Story</h3>
              <p className="text-gray-500 leading-relaxed mb-6">
                Smart Campus was born from a simple observation: campus resources were being underutilized while students struggled to find available spaces. We set out to bridge that gap with technology.
              </p>
              <p className="text-gray-500 leading-relaxed mb-6">
                Today, we serve thousands of students and faculty across multiple institutions, helping them book resources, get support, and navigate campus life with ease.
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Star className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">Trusted by 500+ users</p>
                  <p className="text-sm text-gray-500">Across leading institutions</p>
                </div>
              </div>
            </motion.div>

            {/* Right: Values Cards */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="grid grid-cols-1 sm:grid-cols-2 gap-6"
            >
              <motion.div variants={scaleIn} whileHover={{ y: -5 }} className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-orange-200 hover:shadow-lg transition-all">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-5 h-5 text-orange-500" />
                </div>
                <h4 className="font-bold text-gray-900 mb-2 font-['Helvetica Neue']">Student First</h4>
                <p className="text-sm text-gray-500">Every feature is designed with students' needs in mind.</p>
              </motion.div>
              <motion.div variants={scaleIn} whileHover={{ y: -5 }} className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-orange-200 hover:shadow-lg transition-all">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <Monitor className="w-5 h-5 text-orange-500" />
                </div>
                <h4 className="font-bold text-gray-900 mb-2 font-['Helvetica Neue']">Innovation</h4>
                <p className="text-sm text-gray-500">Leveraging cutting-edge tech to simplify campus life.</p>
              </motion.div>
              <motion.div variants={scaleIn} whileHover={{ y: -5 }} className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-orange-200 hover:shadow-lg transition-all">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <Building className="w-5 h-5 text-orange-500" />
                </div>
                <h4 className="font-bold text-gray-900 mb-2 font-['Helvetica Neue']">Efficiency</h4>
                <p className="text-sm text-gray-500">Maximizing resource utilization across campus.</p>
              </motion.div>
              <motion.div variants={scaleIn} whileHover={{ y: -5 }} className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-orange-200 hover:shadow-lg transition-all">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <Wifi className="w-5 h-5 text-orange-500" />
                </div>
                <h4 className="font-bold text-gray-900 mb-2 font-['Helvetica Neue']">Connectivity</h4>
                <p className="text-sm text-gray-500">Seamless integration with existing systems.</p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section ref={contactRef} id="contact" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-600 text-xs font-semibold tracking-widest uppercase px-4 py-1.5 rounded-full mb-4">
              <span className="w-2 h-2 rounded-full bg-orange-500"></span>
              Contact
            </div>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 font-['Helvetica Neue'] text-center mt-4 mb-4">
              Get in Touch
            </h2>
            <p className="text-lg text-gray-500 text-center max-w-2xl mx-auto">
              Have questions? We'd love to hear from you. Reach out to our team.
            </p>
          </motion.div>

          {/* Contact Cards */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {/* Email Card */}
            <motion.div variants={fadeInUp} whileHover={{ y: -8 }} className="bg-white rounded-2xl p-8 border border-gray-100 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-50 transition-all text-center">
              <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Mail className="w-7 h-7 text-orange-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 font-['Helvetica Neue']">Email Us</h3>
              <p className="text-gray-500 text-sm mb-4">For general inquiries and support</p>
              <a href="mailto:support@smartcampus.edu" className="text-orange-600 font-medium hover:text-orange-700 transition-colors">
                support@smartcampus.edu
              </a>
            </motion.div>

            {/* Phone Card */}
            <motion.div variants={fadeInUp} whileHover={{ y: -8 }} className="bg-white rounded-2xl p-8 border border-gray-100 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-50 transition-all text-center">
              <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Phone className="w-7 h-7 text-orange-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 font-['Helvetica Neue']">Call Us</h3>
              <p className="text-gray-500 text-sm mb-4">Mon-Fri from 8am to 6pm</p>
              <a href="tel:+94112345678" className="text-orange-600 font-medium hover:text-orange-700 transition-colors">
                +94 11 234 5678
              </a>
            </motion.div>

            {/* Location Card */}
            <motion.div variants={fadeInUp} whileHover={{ y: -8 }} className="bg-white rounded-2xl p-8 border border-gray-100 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-50 transition-all text-center">
              <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <MapPin className="w-7 h-7 text-orange-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 font-['Helvetica Neue']">Visit Us</h3>
              <p className="text-gray-500 text-sm mb-4">Campus IT Department</p>
              <span className="text-orange-600 font-medium">
                Main Administration Building
              </span>
            </motion.div>
          </motion.div>

          {/* Quick Support Banner */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-12 bg-gradient-to-r from-orange-50 to-orange-100 rounded-2xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                <Ticket className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 font-['Helvetica Neue']">Need technical support?</h4>
                <p className="text-sm text-gray-500">Create a ticket and we'll get back to you quickly</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLogin}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-full font-semibold transition-all flex items-center gap-2 whitespace-nowrap"
            >
              Create Support Ticket
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-gradient-to-br from-orange-500 to-orange-600">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-white/20 text-white text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full mb-8 inline-block"
          >
            Ready to get started?
          </motion.div>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white text-center font-['Helvetica Neue'] leading-tight mb-6 max-w-2xl mx-auto">
            Transform Your Campus Experience Today
          </h2>
          <p className="text-orange-100 text-lg text-center mb-10 max-w-xl mx-auto">
            Join students and faculty already using Smart Campus.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogin}
            className="bg-white text-orange-600 hover:bg-orange-50 px-10 py-4 rounded-full font-bold text-lg transition-all shadow-xl flex items-center gap-2 mx-auto"
          >
            Start Using Smart Campus Free
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Top Section: 4-column grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Col 1: Brand */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                  <Building className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">Smart Campus</span>
              </div>
              <p className="text-gray-400 mb-4">
                Making campus management smarter, simpler, more efficient.
              </p>
              <div className="flex gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-800 hover:bg-orange-500 transition-colors flex items-center justify-center cursor-pointer">
                  <Building className="w-4 h-4 text-gray-400 hover:text-white" />
                </div>
                <div className="w-8 h-8 rounded-full bg-gray-800 hover:bg-orange-500 transition-colors flex items-center justify-center cursor-pointer">
                  <Users className="w-4 h-4 text-gray-400 hover:text-white" />
                </div>
                <div className="w-8 h-8 rounded-full bg-gray-800 hover:bg-orange-500 transition-colors flex items-center justify-center cursor-pointer">
                  <Star className="w-4 h-4 text-gray-400 hover:text-white" />
                </div>
              </div>
            </div>

            {/* Col 2: Features */}
            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Features</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-orange-400 text-sm transition-colors">Resource Booking</a></li>
                <li><a href="#" className="text-gray-400 hover:text-orange-400 text-sm transition-colors">Support Tickets</a></li>
                <li><a href="#" className="text-gray-400 hover:text-orange-400 text-sm transition-colors">User Management</a></li>
                <li><a href="#" className="text-gray-400 hover:text-orange-400 text-sm transition-colors">Analytics</a></li>
              </ul>
            </div>

            {/* Col 3: Resources */}
            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-orange-400 text-sm transition-colors">Documentation</a></li>
                <li><a href="#" className="text-gray-400 hover:text-orange-400 text-sm transition-colors">API Reference</a></li>
                <li><a href="#" className="text-gray-400 hover:text-orange-400 text-sm transition-colors">Support</a></li>
                <li><a href="#" className="text-gray-400 hover:text-orange-400 text-sm transition-colors">FAQ</a></li>
              </ul>
            </div>

            {/* Col 4: Contact */}
            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Contact</h4>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-gray-400 text-sm">
                  <Mail className="w-4 h-4 text-orange-500" />
                  support@smartcampus.edu
                </li>
                <li className="flex items-center gap-2 text-gray-400 text-sm">
                  <Phone className="w-4 h-4 text-orange-500" />
                  +94 11 234 5678
                </li>
                <li className="flex items-center gap-2 text-gray-400 text-sm">
                  <MapPin className="w-4 h-4 text-orange-500" />
                  Campus IT Department
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">© 2024 Smart Campus. All rights reserved.</p>
            <div className="flex gap-6 text-sm text-gray-500">
              <a href="#" className="hover:text-gray-400 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-gray-400 transition-colors">Terms</a>
              <a href="#" className="hover:text-gray-400 transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
