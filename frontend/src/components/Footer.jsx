import { Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaCrown, FaInstagram, FaFacebook, FaTwitter, FaLinkedin, FaArrowRight } from 'react-icons/fa';
import { motion } from 'framer-motion';

const footerLinks = [
  { to: '/', label: 'Home' },
  { to: '/rooms', label: 'Suites & Rooms' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/about', label: 'About Us' },
  { to: '/contact', label: 'Contact' },
];

const socialLinks = [
  { icon: FaInstagram, href: '#', color: '#E1306C' },
  { icon: FaFacebook, href: '#', color: '#1877F2' },
  { icon: FaTwitter, href: '#', color: '#1DA1F2' },
  { icon: FaLinkedin, href: '#', color: '#0A66C2' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const Footer = () => {
  return (
    <motion.footer
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={containerVariants}
      style={{
        background: 'linear-gradient(180deg, var(--bg-secondary) 0%, #050506 100%)',
        borderTop: '1px solid var(--border-light)',
        padding: '100px 5% 30px',
        marginTop: 'auto',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Aurora effect */}
      <div style={{
        position: 'absolute',
        top: '-50%',
        left: '30%',
        width: '600px',
        height: '600px',
        background: 'radial-gradient(circle, rgba(212,175,55,0.03) 0%, transparent 70%)',
        borderRadius: '50%',
        pointerEvents: 'none',
        animation: 'aurora 20s linear infinite',
      }} />

      {/* Gold divider */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '500px',
        height: '2px',
        background: 'linear-gradient(90deg, transparent, var(--primary), var(--primary-light), var(--primary), transparent)',
        opacity: 0.4,
      }} />

      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '50px',
        position: 'relative',
        zIndex: 1,
      }}>
        <motion.div variants={itemVariants}>
          <motion.div
            style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}
            whileHover={{ x: 4 }}
          >
            <motion.div
              style={{
                width: '48px', height: '48px',
                background: 'var(--gold-gradient)',
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 30px rgba(212, 175, 55, 0.15)',
              }}
              whileHover={{ rotate: 10, scale: 1.05 }}
            >
              <FaCrown size={20} color="#000" />
            </motion.div>
            <span style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: '1.6rem',
              fontWeight: 700,
              color: 'var(--text-color)',
              letterSpacing: '-0.5px',
            }}>
              Luxury<span style={{ color: 'var(--primary)' }}>Stay</span>
            </span>
          </motion.div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.9', maxWidth: '340px', marginBottom: '24px' }}>
            Experience the pinnacle of luxury hospitality. Every moment curated with precision, every detail designed for your comfort since 1998.
          </p>
          <div style={{ display: 'flex', gap: '10px' }}>
            {socialLinks.map((social, i) => (
              <motion.a
                key={i}
                href={social.href}
                whileHover={{ y: -4, scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  width: '38px', height: '38px',
                  borderRadius: '12px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid var(--border-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-muted)',
                  transition: 'all 0.3s ease',
                  textDecoration: 'none',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = social.color; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = social.color; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border-light)'; }}
              >
                <social.icon size={14} />
              </motion.a>
            ))}
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <h4 style={{
            fontFamily: 'Playfair Display, serif',
            color: 'var(--text-color)',
            marginBottom: '28px',
            fontSize: '1.15rem',
            position: 'relative',
            display: 'inline-block',
          }}>
            Quick Links
            <span style={{
              position: 'absolute',
              bottom: '-8px',
              left: 0,
              width: '40px',
              height: '2px',
              background: 'var(--gold-gradient)',
              borderRadius: '2px',
            }} />
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {footerLinks.map((link, i) => (
              <motion.div
                key={link.to}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to={link.to}
                  style={{
                    color: 'var(--text-muted)',
                    textDecoration: 'none',
                    fontSize: '0.9rem',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                >
                  <motion.span
                    style={{
                      width: '6px', height: '6px',
                      background: 'var(--gold-gradient)',
                      borderRadius: '50%',
                      opacity: 0.4,
                    }}
                    whileHover={{ scale: 2, opacity: 1 }}
                  />
                  {link.label}
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <h4 style={{
            fontFamily: 'Playfair Display, serif',
            color: 'var(--text-color)',
            marginBottom: '28px',
            fontSize: '1.15rem',
            position: 'relative',
            display: 'inline-block',
          }}>
            Contact
            <span style={{
              position: 'absolute',
              bottom: '-8px',
              left: 0,
              width: '40px',
              height: '2px',
              background: 'var(--gold-gradient)',
              borderRadius: '2px',
            }} />
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {[
              { icon: FaMapMarkerAlt, text: '123 Beach Avenue, Karachi', href: null },
              { icon: FaPhone, text: '+92 300 123 4567', href: 'tel:+923001234567' },
              { icon: FaEnvelope, text: 'info@luxurystay.com', href: 'mailto:info@luxurystay.com' },
            ].map((item, i) => (
              <motion.div
                key={i}
                style={{ display: 'flex', alignItems: 'center', gap: '14px', color: 'var(--text-muted)', fontSize: '0.9rem' }}
                whileHover={{ x: 4 }}
              >
                <div style={{
                  width: '36px', height: '36px',
                  borderRadius: '10px',
                  background: 'rgba(212, 175, 55, 0.1)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <item.icon size={13} color="var(--primary)" />
                </div>
                {item.href ? (
                  <a href={item.href} style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }}
                    onMouseEnter={(e) => e.target.style.color = 'var(--primary)'}
                    onMouseLeave={(e) => e.target.style.color = 'inherit'}
                  >{item.text}</a>
                ) : (
                  <span>{item.text}</span>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <h4 style={{
            fontFamily: 'Playfair Display, serif',
            color: 'var(--text-color)',
            marginBottom: '28px',
            fontSize: '1.15rem',
            position: 'relative',
            display: 'inline-block',
          }}>
            Newsletter
            <span style={{
              position: 'absolute',
              bottom: '-8px',
              left: 0,
              width: '40px',
              height: '2px',
              background: 'var(--gold-gradient)',
              borderRadius: '2px',
            }} />
          </h4>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '20px', lineHeight: '1.7' }}>
            Subscribe for exclusive offers, early access to new suites, and luxury travel inspiration.
          </p>
          <motion.div
            style={{ display: 'flex', gap: '8px' }}
            whileHover={{ scale: 1.01 }}
          >
            <div style={{
              flex: 1,
              position: 'relative',
              borderRadius: '12px',
              border: '1px solid var(--border-light)',
              background: 'rgba(255,255,255,0.03)',
              display: 'flex',
              alignItems: 'center',
              transition: 'all 0.3s',
            }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(212,175,55,0.3)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-light)'}
            >
              <input
                placeholder="Your email address"
                style={{
                  flex: 1,
                  padding: '14px 16px',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-color)',
                  fontSize: '0.85rem',
                  outline: 'none',
                }}
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                padding: '14px 18px',
                background: 'var(--gold-gradient)',
                border: 'none',
                borderRadius: '12px',
                color: '#000',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <FaArrowRight size={12} />
            </motion.button>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom bar */}
      <motion.div
        variants={itemVariants}
        style={{
          maxWidth: '1200px',
          margin: '60px auto 0',
          paddingTop: '24px',
          borderTop: '1px solid var(--border-light)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          fontSize: '0.8rem',
          color: 'var(--text-dim)',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <motion.span whileHover={{ color: 'var(--text-muted)' }}>
          &copy; {new Date().getFullYear()} LuxuryStay Group. All rights reserved.
        </motion.span>
        <motion.span
          whileHover={{ color: 'var(--primary)' }}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--primary)', opacity: 0.5 }} />
          Designed with excellence
        </motion.span>
      </motion.div>
    </motion.footer>
  );
};

export default Footer;
