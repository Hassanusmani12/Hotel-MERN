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

                    <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
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
                            theme="outline"
                            size="large"
                            shape="rectangular"
                            text="continue_with"
                            width="340"
                        />
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
