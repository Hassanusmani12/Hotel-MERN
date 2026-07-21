import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { FaEnvelope, FaLock, FaSignInAlt, FaCrown } from 'react-icons/fa';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import API_BASE_URL from '../config';

const staggerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.2 } },
};

const fieldVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: 'easeOut' } },
};

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async (e) => {
        e.preventDefault();
        if (!formData.email || !formData.password) return toast.error("Please enter email & password");
        setLoading(true);
        try {
            const res = await axios.post(`${API_BASE_URL}/api/users/login`, formData);
            const { token, ...userData } = res.data;
            
            // Use auth context to store user and token
            login(userData, token || 'user-token-placeholder');
            
            toast.success(`Welcome back, ${userData.name}!`);
            setTimeout(() => {
                if (userData.role === 'admin') navigate('/admin');
                else navigate('/');
            }, 1000);
        } catch (error) {
            const message = error?.response?.data?.message || error?.message || "Invalid Credentials";
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = {
        padding: '16px 16px 16px 50px', width: '100%',
        background: 'rgba(0,0,0,0.3)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '12px',
        color: '#fff',
        fontSize: '0.95rem',
        outline: 'none',
        transition: 'all 0.3s ease',
    };

    return (
        <div className="luxury-bg-mesh" style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
            padding: '20px',
        }}>
            <div style={{
                position: 'absolute', top: '-20%', right: '-10%',
                width: '500px', height: '500px',
                background: 'radial-gradient(circle, rgba(212,175,55,0.06) 0%, transparent 70%)',
                borderRadius: '50%',
                animation: 'aurora 20s linear infinite',
                pointerEvents: 'none',
            }} />
            <div style={{
                position: 'absolute', bottom: '-30%', left: '-10%',
                width: '600px', height: '600px',
                background: 'radial-gradient(circle, rgba(78,188,255,0.03) 0%, transparent 60%)',
                borderRadius: '50%',
                animation: 'floatDrift 10s ease-in-out infinite',
                pointerEvents: 'none',
            }} />

            <motion.div
                initial={{ opacity: 0, y: 40, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="card-3d"
                style={{
                    maxWidth: '420px', width: '100%', position: 'relative', zIndex: 1,
                }}
            >
                <motion.div
                    className="card-3d-inner"
                    style={{
                        background: 'rgba(16, 16, 18, 0.9)',
                        backdropFilter: 'blur(24px)',
                        WebkitBackdropFilter: 'blur(24px)',
                        padding: '50px 40px',
                        borderRadius: '24px',
                        border: '1px solid rgba(212, 175, 55, 0.15)',
                        boxShadow: '0 30px 80px rgba(0,0,0,0.5), 0 0 40px rgba(212, 175, 55, 0.03)',
                    }}
                >
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        style={{ marginBottom: '30px', textAlign: 'center' }}
                    >
                        <motion.div
                            whileHover={{ rotate: 10, scale: 1.05 }}
                            style={{
                                width: '72px', height: '72px',
                                background: 'var(--gold-gradient)',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 16px',
                                boxShadow: '0 0 40px rgba(212, 175, 55, 0.25)',
                            }}
                        >
                            <FaCrown size={32} color="#000" />
                        </motion.div>
                        <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem', margin: '0', color: '#fff' }}>
                            Welcome Back
                        </h2>
                        <p style={{ opacity: 0.5, fontSize: '0.9rem', marginTop: '8px' }}>
                            Access your personalized dashboard
                        </p>
                    </motion.div>

                    <motion.form
                        onSubmit={onSubmit}
                        variants={staggerVariants}
                        initial="hidden"
                        animate="visible"
                        style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}
                    >
                        {[
                            { icon: FaEnvelope, name: 'email', type: 'email', placeholder: 'Email Address' },
                            { icon: FaLock, name: 'password', type: 'password', placeholder: 'Password' },
                        ].map((field) => {
                            const Icon = field.icon;
                            return (
                                <motion.div key={field.name} variants={fieldVariants} style={{ position: 'relative' }}
                                    onMouseEnter={(e) => e.currentTarget.querySelector('.field-icon').style.color = 'var(--primary-light)'}
                                    onMouseLeave={(e) => e.currentTarget.querySelector('.field-icon').style.color = 'var(--primary)'}
                                >
                                    <Icon className="field-icon" style={{
                                        position: 'absolute', left: '20px', top: '50%',
                                        transform: 'translateY(-50%)', color: 'var(--primary)',
                                        fontSize: '16px', zIndex: 1,
                                        transition: 'color 0.3s ease',
                                    }} />
                                    <input
                                        className="luxury-input"
                                        name={field.name}
                                        type={field.type}
                                        placeholder={field.placeholder}
                                        value={formData[field.name]}
                                        onChange={onChange}
                                        style={inputStyle}
                                        onFocus={(e) => { e.target.style.borderColor = 'rgba(212,175,55,0.4)'; e.target.style.boxShadow = '0 0 20px rgba(212,175,55,0.06)'; }}
                                        onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
                                    />
                                </motion.div>
                            );
                        })}

                        <motion.button
                            variants={fieldVariants}
                            type="submit"
                            disabled={loading}
                            className="gold-btn"
                            whileHover={{ scale: 1.02, boxShadow: '0 8px 40px rgba(212, 175, 55, 0.4)' }}
                            whileTap={{ scale: 0.98 }}
                            style={{
                                padding: '16px', fontSize: '1rem', fontWeight: 700,
                                letterSpacing: '1px', display: 'flex',
                                alignItems: 'center', justifyContent: 'center', gap: '10px',
                                marginTop: '10px',
                            }}
                        >
                            {loading ? 'Authenticating...' : 'Sign In'} <FaSignInAlt />
                        </motion.button>
                    </motion.form>

                    <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
                        <span style={{ fontSize: '0.75rem', opacity: 0.4, textTransform: 'uppercase', letterSpacing: '1px' }}>Or</span>
                        <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
                    </div>

                    <div style={{ position: 'relative', width: '100%', overflow: 'hidden', borderRadius: '12px', marginTop: '20px' }}>
                        <div style={{
                            padding: '16px', borderRadius: '12px', width: '100%',
                            background: '#18181b',
                            border: '1px solid rgba(212, 175, 55, 0.4)',
                            color: '#fff',
                            fontWeight: 500,
                            fontSize: '0.95rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            transition: 'border-color 0.3s ease',
                            boxSizing: 'border-box',
                        }}
                            onMouseEnter={(e) => e.currentTarget.style.borderColor = '#d4af37'}
                            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.4)'}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            Continue with Google
                        </div>
                        <div style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', zIndex: 10 }}>
                            <GoogleLogin
                                onSuccess={async (credentialResponse) => {
                                    try {
                                        const res = await axios.post(`${API_BASE_URL}/api/users/google`, {
                                            credential: credentialResponse.credential,
                                            action: 'login'
                                        });
                                        const { token, ...userData } = res.data;
                                        login(userData, token);
                                        toast.success(`Welcome back, ${userData.name}!`);
                                        setTimeout(() => {
                                            if (userData.role === 'admin') navigate('/admin');
                                            else navigate('/');
                                        }, 1000);
                                    } catch (error) {
                                        const msg = error?.response?.data?.message || 'Google login failed';
                                        toast.error(msg);
                                    }
                                }}
                                onError={() => toast.error('Google login failed. Please try again.')}
                                width="100%"
                            />
                        </div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}
                    >
                        <p style={{ fontSize: '0.85rem', opacity: 0.5, margin: 0 }}>New to LuxuryStay?</p>
                        <Link to="/register" style={{
                            color: 'var(--primary)', fontWeight: 600, textDecoration: 'none',
                            fontSize: '0.9rem', display: 'inline-block', marginTop: '8px',
                            borderBottom: '1px solid var(--primary)', paddingBottom: '2px',
                            transition: 'color 0.2s',
                        }}
                            onMouseEnter={(e) => e.target.style.color = 'var(--primary-light)'}
                            onMouseLeave={(e) => e.target.style.color = 'var(--primary)'}
                        >
                            Create an Account
                        </Link>
                    </motion.div>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default Login;
