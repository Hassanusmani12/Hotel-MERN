import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FaBars, FaTimes, FaUserCircle, FaChevronDown, FaSignOutAlt, FaCog, FaUser, FaCrown, FaHome, FaBed, FaImages, FaEnvelope, FaInfoCircle } from 'react-icons/fa';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTheme } from './context/ThemeContext';
import { useAuth } from './context/AuthContext';
import { setLogoutCallback } from './services/axiosInterceptor';
import ProtectedRoute from './components/ProtectedRoute';

import Register from './pages/Register';
import Login from './pages/Login';
import Rooms from './pages/Rooms';
import RoomDetails from './pages/RoomDetails';
import Profile from './pages/Profile';
import Home from './pages/Home';
import Admin from './pages/Admin';
import Contact from './pages/Contact';
import Gallery from './pages/Gallery';
import About from './pages/About';
import Payment from './pages/Payment';
import Footer from './components/Footer';
import FloatingAIAssistant from './components/ai/FloatingAIAssistant';
import './App.css';

const pageVariants = {
  initial: { opacity: 0, y: 24, scale: 0.98 },
  in: { opacity: 1, y: 0, scale: 1 },
  out: { opacity: 0, y: -24, scale: 0.98 },
};

const pageTransition = {
  type: 'spring',
  damping: 25,
  stiffness: 250,
  duration: 0.35,
};

const PageWrapper = ({ children }) => (
  <motion.div
    initial="initial"
    animate="in"
    exit="out"
    variants={pageVariants}
    transition={pageTransition}
    style={{ minHeight: '80vh' }}
  >
    {children}
  </motion.div>
);

const navLinks = [
  { to: '/', label: 'Home', icon: FaHome },
  { to: '/rooms', label: 'Suites', icon: FaBed },
  { to: '/gallery', label: 'Gallery', icon: FaImages },
  { to: '/contact', label: 'Contact', icon: FaEnvelope },
  { to: '/about', label: 'About', icon: FaInfoCircle },
];

const UserDropdown = ({ user, handleLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="user-dropdown-container" ref={dropdownRef}>
      <motion.div
        className="user-dropdown-trigger"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        style={{ background: isOpen ? 'rgba(212, 175, 55, 0.1)' : 'transparent', border: isOpen ? '1px solid rgba(212, 175, 55, 0.2)' : '1px solid transparent' }}
      >
        <div style={{
          width: '30px', height: '30px',
          borderRadius: '50%',
          background: 'var(--gold-gradient)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '13px',
          fontWeight: 700,
          color: '#000',
          boxShadow: '0 0 20px rgba(212, 175, 55, 0.2)',
        }}>
          {user.name?.charAt(0)?.toUpperCase() || 'U'}
        </div>
        <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-color)' }}>
          {user.name?.split(' ')[0] || 'User'}
        </span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
          <FaChevronDown size={10} style={{ color: 'var(--text-muted)' }} />
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="user-dropdown-menu"
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.2 }}
          >
            <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: '4px' }}>
              <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-dim)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Signed in as</p>
              <p style={{ margin: '6px 0 0', fontWeight: 600, fontSize: '0.85rem', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</p>
            </div>

            <Link to="/profile" className="dropdown-item" onClick={() => setIsOpen(false)}>
              <FaUser size={14} /> Profile
            </Link>

            {user.role === 'admin' && (
              <Link to="/admin" className="dropdown-item admin-highlight" onClick={() => setIsOpen(false)}>
                <FaCog size={14} /> Dashboard (Admin)
              </Link>
            )}

            <div className="dropdown-divider" />

            <motion.div
              className="dropdown-item"
              onClick={() => { handleLogout(); setIsOpen(false); }}
              style={{ color: '#ff4d4d' }}
              whileHover={{ x: 4 }}
            >
              <FaSignOutAlt size={14} /> Logout
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

function AppContent() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme } = useTheme();
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Set up the logout callback for axios interceptor
  useEffect(() => {
    setLogoutCallback(handleLogout);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <ToastContainer position="top-center" autoClose={3000} theme={theme === 'dark' ? 'dark' : 'light'} />

      <motion.nav
        className={`premium-navbar ${scrolled ? 'navbar-scrolled' : ''}`}
        animate={{ height: scrolled ? '64px' : '80px' }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        <div className="navbar-inner">
          <Link to="/" className="navbar-brand">
            <motion.div className="brand-icon-wrap" whileHover={{ rotate: 15, scale: 1.05 }}>
              <FaCrown size={18} color="#000" />
            </motion.div>
            <motion.span className="brand-name" whileHover={{ scale: 1.02 }}>
              Luxury<span>Stay</span>
            </motion.span>
          </Link>

          <div className="nav-links-desktop">
            {navLinks.map(link => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`nav-link ${isActive ? 'active' : ''}`}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <link.icon size={12} style={{ opacity: isActive ? 1 : 0.5 }} />
                    {link.label}
                  </span>
                  {isActive && (
                    <motion.div
                      className="nav-indicator"
                      layoutId="navIndicator"
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          <div className="nav-actions">
            {user ? (
              <UserDropdown user={user} handleLogout={handleLogout} />
            ) : (
              <motion.div className="auth-buttons" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
                <Link to="/login" className="auth-login">Login</Link>
                <Link to="/register" className="auth-register">Register</Link>
              </motion.div>
            )}

            <motion.div
              className="mobile-menu-btn"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              style={{ display: 'none' }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={isMobileMenuOpen ? 'close' : 'open'}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {isMobileMenuOpen ? <FaTimes size={16} /> : <FaBars size={16} />}
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </div>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              className="mobile-menu-overlay"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              {navLinks.map((link, i) => {
                const Icon = link.icon;
                return (
                  <motion.div
                    key={link.to}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                  >
                    <Link
                      to={link.to}
                      className={`mobile-link ${location.pathname === link.to ? 'mobile-link-active' : ''}`}
                    >
                      <Icon size={16} />
                      {link.label}
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      <div style={{ flex: 1 }}>
        <AnimatePresence mode="wait">
          <PageWrapper key={location.pathname}>
            <Routes location={location}>
              <Route path="/" element={<Home />} />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route path="/rooms" element={<Rooms />} />
              <Route path="/rooms/:id" element={<RoomDetails />} />
              
              {/* Protected Routes */}
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/payment" element={
                <ProtectedRoute>
                  <Payment />
                </ProtectedRoute>
              } />
              <Route path="/admin" element={
                <ProtectedRoute>
                  <Admin />
                </ProtectedRoute>
              } />
              
              {/* Public Routes */}
              <Route path="/contact" element={<Contact />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/about" element={<About />} />
            </Routes>
          </PageWrapper>
        </AnimatePresence>
      </div>

      <Footer />
      <FloatingAIAssistant />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
