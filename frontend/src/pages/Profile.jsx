import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FaUser, FaSignOutAlt, FaCalendarCheck, FaCog, FaCreditCard, 
    FaHistory, FaCamera, FaLock, FaBell, FaCheckCircle, FaConciergeBell, FaPlus, FaTrash, FaShieldAlt, FaKey
} from 'react-icons/fa';

// --- ANIMATION VARIANTS ---
const tabContentVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.2 } }
};

const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const stagger = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } },
};

// --- SUB-COMPONENTS ---

const SidebarItem = ({ icon, label, active, onClick }) => (
    <motion.div 
        whileHover={{ x: 5, backgroundColor: 'rgba(212, 175, 55, 0.1)' }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        style={{
            display: 'flex', alignItems: 'center', gap: '15px',
            padding: '15px 20px', margin: '8px 0',
            borderRadius: '12px', cursor: 'pointer',
            background: active ? 'linear-gradient(90deg, rgba(212, 175, 55, 0.2), transparent)' : 'transparent',
            color: active ? 'var(--primary)' : 'var(--text-color)',
            borderLeft: active ? '4px solid var(--primary)' : '4px solid transparent',
            transition: 'all 0.3s ease'
        }}
    >
        <span style={{ fontSize: '1.2rem' }}>{icon}</span>
        <span style={{ fontSize: '1rem', fontWeight: active ? 'bold' : 'normal' }}>{label}</span>
    </motion.div>
);

const StatCard = ({ icon, title, value, color }) => (
    <div className="glass-card" style={{
        padding: '30px', display: 'flex', alignItems: 'center', gap: '20px',
        background: '#111114', border: '1px solid #1f1f23',
        borderRadius: '20px', flex: 1, minWidth: '220px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
    }}>
        <div style={{ width: '60px', height: '60px', borderRadius: '15px', background: `${color}15`, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem' }}>
            {icon}
        </div>
        <div>
            <p style={{ margin: 0, opacity: 0.5, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>{title}</p>
            <h2 style={{ margin: '5px 0 0 0', fontSize: '2rem', fontFamily: 'Playfair Display' }}>{value}</h2>
        </div>
    </div>
);

const CreditCard = ({ last4, brand, name }) => (
    <div style={{
        width: '100%', height: '220px', borderRadius: '25px',
        background: 'linear-gradient(135deg, #1e1e24 0%, #2d2d35 100%)',
        padding: '30px', position: 'relative', overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 50px rgba(0,0,0,0.4)', color: '#fff'
    }}>
        {/* Decorative Circles */}
        <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '200px', height: '200px', background: 'rgba(212, 175, 55, 0.15)', borderRadius: '50%', filter: 'blur(40px)' }}></div>
        <div style={{ position: 'absolute', bottom: '-40px', left: '-40px', width: '150px', height: '150px', background: 'rgba(0, 123, 255, 0.1)', borderRadius: '50%', filter: 'blur(30px)' }}></div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '50px', position: 'relative', zIndex: 2 }}>
            <span style={{ color: '#d4af37', fontWeight: 'bold', fontSize: '1.4rem', fontFamily: 'Playfair Display', letterSpacing: '1px' }}>LuxuryStay</span>
            <span style={{ fontSize: '2rem' }}>{brand === 'Visa' ? '💳' : '🏦'}</span>
        </div>
        
        <div style={{ fontSize: '1.8rem', letterSpacing: '6px', marginBottom: '30px', fontFamily: 'monospace', textShadow: '0 2px 4px rgba(0,0,0,0.5)', position: 'relative', zIndex: 2 }}>
            **** **** **** {last4}
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', opacity: 0.8, fontSize: '12px', position: 'relative', zIndex: 2 }}>
            <span>CARD HOLDER<br/><strong style={{ fontSize: '14px', color: '#fff' }}>{name.toUpperCase()}</strong></span>
            <span style={{ textAlign: 'right' }}>EXPIRES<br/><strong style={{ fontSize: '14px', color: '#fff' }}>12/28</strong></span>
        </div>
    </div>
);

// --- MAIN COMPONENT ---
const Profile = () => {
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Edit Form States
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({ name: '', email: '', phone: '', address: '' });
    
    // ✅ Password Logic State
    const [passData, setPassData] = useState({ current: '', new: '', confirm: '' });

    const navigate = useNavigate();

    useEffect(() => {
        const loggedInUser = JSON.parse(localStorage.getItem('user'));
        if (!loggedInUser) {
            navigate('/login');
        } else {
            setUser(loggedInUser);
            setEditData({ 
                name: loggedInUser.name || '', 
                email: loggedInUser.email || '', 
                phone: loggedInUser.phone || '', 
                address: loggedInUser.address || '' 
            });
            fetchBookings(loggedInUser._id);
        }
    }, [navigate]);

    const fetchBookings = async (userId) => {
        try {
            const res = await axios.get(`http://localhost:5000/api/bookings/${userId}`);
            setBookings(res.data);
        } catch (error) {
            console.error("Fetch error", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            await axios.put('http://localhost:5000/api/users/profile', { userId: user._id, ...editData });
            const updatedUser = { ...user, ...editData };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
            setIsEditing(false);
            toast.success("Profile details updated successfully.");
        } catch (error) {
            toast.error("Failed to update profile.");
        }
    };

    // ✅ VVIP SECURE PASSWORD LOGIC
    const handlePasswordChange = async (e) => {
        e.preventDefault();
        
        // 1. Basic Validation on Frontend
        if (!passData.current) return toast.error("Please enter your current password.");
        if (passData.new.length < 6) return toast.error("New password must be at least 6 characters.");
        if (passData.new !== passData.confirm) return toast.error("New passwords do not match!");

        // 2. Logic: Verify Old Password with Backend
        try {
            // NOTE: This endpoint needs to exist in your backend.
            // It should check `bcrypt.compare(currentPassword, user.password)`
            
            /* Backend Logic Example (Node.js):
               if (!isMatch) return res.status(400).json({ message: "Incorrect current password" });
            */

            const res = await axios.put('http://localhost:5000/api/users/change-password', {
                userId: user._id,
                oldPassword: passData.current, // ✅ Sending Old Password
                newPassword: passData.new
            });

            if (res.data.success) {
                toast.success("Password changed successfully! Please login again.");
                setPassData({ current: '', new: '', confirm: '' });
                // Optional: Logout user
                // handleLogout(); 
            } else {
                // If backend sends success: false but no error code
                toast.error(res.data.message || "Could not change password.");
            }
            
        } catch (error) {
            // 3. Handle "Incorrect Password" Error from Backend
            if (error.response && error.response.status === 400) {
                toast.error("❌ Incorrect Current Password. Access Denied.");
            } else {
                console.error(error);
                toast.error("Server Error. Try again later.");
            }
        }
    };

    const handleCancelBooking = (id) => {
        if(window.confirm("Are you sure you want to cancel this reservation?")) {
            setBookings(bookings.filter(b => b._id !== id));
            toast.info("Reservation Cancelled.");
        }
    };

    const handleAddCard = () => {
        const newCard = { id: Date.now(), last4: Math.floor(1000 + Math.random() * 9000), brand: 'MasterCard' };
        setCards([...cards, newCard]);
        toast.success("New payment method added.");
    };

    const handleRemoveCard = (id) => {
        if(window.confirm("Remove this card?")) {
            setCards(cards.filter(c => c.id !== id));
            toast.info("Payment method removed.");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
        toast.info("Logged out safely.");
    };

    if (!user) return <div style={{ height: '100vh', background: '#0a0a0b' }}></div>;

    return (
        <div className="luxury-bg-mesh" style={{ minHeight: '100vh', padding: '120px 5% 80px', background: '#0a0a0b', color: '#e4e4e7', position: 'relative', overflowX: 'hidden' }}>
            
            {/* Aurora Ambient Layers */}
            <div style={{ position: 'fixed', top: '-20%', left: '10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(212,175,55,0.04) 0%, transparent 70%)', borderRadius: '50%', animation: 'aurora 20s linear infinite', pointerEvents: 'none', zIndex: 0 }} />
            <div style={{ position: 'fixed', bottom: '-10%', right: '5%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(78,188,255,0.03) 0%, transparent 60%)', borderRadius: '50%', animation: 'floatDrift 15s ease-in-out infinite', pointerEvents: 'none', zIndex: 0 }} />
            
            <motion.div initial="hidden" animate="visible" variants={stagger} style={{ maxWidth: '1400px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '50px' }}>
                
                {/* --- LEFT SIDEBAR (Profile Card) --- */}
                <div style={{ maxWidth: '380px', width: '100%' }}>
                    <motion.div 
                        initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.5 }}
                        style={{ background: '#111114', padding: '40px', borderRadius: '30px', border: '1px solid #1f1f23', position: 'sticky', top: '120px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}
                    >
                        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                            <div style={{ width: '120px', height: '120px', margin: '0 auto 20px', borderRadius: '50%', background: '#0a0a0b', border: '3px solid var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                                <FaUser size={50} color="var(--primary)" />
                                <div style={{ position: 'absolute', bottom: '5px', right: '5px', background: 'var(--primary)', padding: '8px', borderRadius: '50%', cursor: 'pointer', border: '3px solid #111114' }}>
                                    <FaCamera size={14} color="#000" />
                                </div>
                            </div>
                            <h2 style={{ fontSize: '1.8rem', marginBottom: '5px', fontFamily: 'Playfair Display' }}>{user.name}</h2>
                            <p style={{ opacity: 0.5, fontSize: '14px' }}>{user.email}</p>
                            <div style={{ marginTop: '15px', display: 'inline-block', padding: '6px 18px', background: 'linear-gradient(90deg, #b8860b 0%, #f9d976 100%)', borderRadius: '20px', color: '#000', fontSize: '11px', fontWeight: '900', letterSpacing: '1px' }}>
                                VVIP MEMBER
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            <SidebarItem icon={<FaUser />} label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
                            <SidebarItem icon={<FaCalendarCheck />} label="My Bookings" active={activeTab === 'bookings'} onClick={() => setActiveTab('bookings')} />
                            <SidebarItem icon={<FaCreditCard />} label="Payments" active={activeTab === 'payments'} onClick={() => setActiveTab('payments')} />
                            <SidebarItem icon={<FaCog />} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
                        </div>

                        <div style={{ marginTop: '40px', paddingTop: '30px', borderTop: '1px solid #1f1f23' }}>
                            <button onClick={handleLogout} style={{ width: '100%', padding: '16px', background: 'rgba(255, 77, 77, 0.08)', color: '#ff4d4d', border: '1px solid rgba(255, 77, 77, 0.2)', borderRadius: '15px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontWeight: 'bold', transition: '0.3s' }}>
                                <FaSignOutAlt /> Sign Out
                            </button>
                        </div>
                    </motion.div>
                </div>

                {/* --- RIGHT CONTENT AREA --- */}
                <div style={{ minHeight: '600px', flex: 1 }}>
                    <AnimatePresence mode="wait">
                        
                        {/* 1. OVERVIEW TAB */}
                        {activeTab === 'overview' && (
                            <motion.div key="overview" variants={tabContentVariants} initial="hidden" animate="visible" exit="exit">
                                <h1 style={{ fontFamily: 'Playfair Display', marginBottom: '10px', fontSize: '2.5rem' }}>Welcome, {user.name.split(' ')[0]}</h1>
                                <p style={{ opacity: 0.5, marginBottom: '40px' }}>Your personal dashboard and activity summary.</p>

                                <div style={{ display: 'flex', gap: '20px', marginBottom: '40px', flexWrap: 'wrap' }}>
                                    <StatCard icon={<FaCalendarCheck />} title="Total Stays" value={bookings.length} color="#007bff" />
                                    <StatCard icon={<FaConciergeBell />} title="Upcoming" value={bookings.filter(b => b.status === 'Confirmed').length} color="#ffc107" />
                                    <StatCard icon={<FaCheckCircle />} title="Completed" value={bookings.filter(b => b.status === 'Completed').length} color="#28a745" />
                                </div>

                                <div style={{ background: '#111114', padding: '40px', borderRadius: '30px', border: '1px solid #1f1f23' }}>
                                    <h3 style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', fontFamily: 'Playfair Display', fontSize: '1.5rem' }}>
                                        <span>Personal Information</span>
                                        <button onClick={() => { setActiveTab('settings'); setIsEditing(true); }} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '14px', textDecoration: 'underline' }}>Edit</button>
                                    </h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px' }}>
                                        <div><label style={{ opacity: 0.4, fontSize: '11px', display: 'block', marginBottom: '8px', letterSpacing: '1px' }}>FULL NAME</label><p style={{ fontSize: '18px', fontWeight: '500', margin: 0 }}>{user.name}</p></div>
                                        <div><label style={{ opacity: 0.4, fontSize: '11px', display: 'block', marginBottom: '8px', letterSpacing: '1px' }}>EMAIL ADDRESS</label><p style={{ fontSize: '18px', fontWeight: '500', margin: 0 }}>{user.email}</p></div>
                                        <div><label style={{ opacity: 0.4, fontSize: '11px', display: 'block', marginBottom: '8px', letterSpacing: '1px' }}>PHONE</label><p style={{ fontSize: '18px', fontWeight: '500', margin: 0 }}>{editData.phone}</p></div>
                                        <div><label style={{ opacity: 0.4, fontSize: '11px', display: 'block', marginBottom: '8px', letterSpacing: '1px' }}>LOCATION</label><p style={{ fontSize: '18px', fontWeight: '500', margin: 0 }}>{editData.address}</p></div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* 2. BOOKINGS TAB */}
                        {activeTab === 'bookings' && (
                            <motion.div key="bookings" variants={tabContentVariants} initial="hidden" animate="visible" exit="exit">
                                <h2 style={{ fontFamily: 'Playfair Display', marginBottom: '30px', fontSize: '2rem' }}>Reservation History</h2>
                                {loading ? <p>Loading your stays...</p> : bookings.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '60px', background: '#111114', borderRadius: '30px', border: '1px solid #1f1f23' }}>
                                        <FaHistory size={60} style={{ opacity: 0.2, marginBottom: '20px' }} />
                                        <h3>No Bookings Yet</h3>
                                        <button onClick={() => navigate('/rooms')} className="gold-btn" style={{ marginTop: '20px' }}>Book a Suite</button>
                                    </div>
                                ) : (
                                    <div style={{ display: 'grid', gap: '20px' }}>
                                        {bookings.map(booking => (
                                            <div key={booking._id} className="glass-card" style={{ padding: '30px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', background: '#111114', border: '1px solid #1f1f23', gap: '20px', borderRadius: '20px' }}>
                                                <div style={{ display: 'flex', gap: '25px', alignItems: 'center' }}>
                                                    <div style={{ width: '70px', height: '70px', borderRadius: '15px', background: '#0a0a0b', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #1f1f23' }}>
                                                        <span style={{ fontSize: '2rem' }}>🏨</span>
                                                    </div>
                                                    <div>
                                                        <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{booking.room ? booking.room.type : "Unknown Room"}</h3>
                                                        <p style={{ margin: '5px 0', opacity: 0.5, fontSize: '14px' }}>Suite #{booking.room?.roomNumber}</p>
                                                        <span style={{ fontSize: '11px', padding: '5px 12px', borderRadius: '20px', background: booking.status === 'Confirmed' ? 'rgba(40, 167, 69, 0.15)' : 'rgba(255,255,255,0.1)', color: booking.status === 'Confirmed' ? '#28a745' : '#fff', border: `1px solid ${booking.status === 'Confirmed' ? '#28a745' : '#fff'}` }}>{booking.status}</span>
                                                    </div>
                                                </div>
                                                <div style={{ textAlign: 'right', minWidth: '150px' }}>
                                                    <p style={{ margin: 0, fontWeight: 'bold', fontSize: '1.4rem', color: 'var(--primary)', fontFamily: 'Playfair Display' }}>${booking.room?.price}</p>
                                                    <p style={{ fontSize: '13px', opacity: 0.6, marginTop: '5px' }}>{new Date(booking.checkInDate).toLocaleDateString()} - {new Date(booking.checkOutDate).toLocaleDateString()}</p>
                                                    {booking.status === 'Confirmed' && (
                                                        <button onClick={() => handleCancelBooking(booking._id)} style={{ marginTop: '15px', background: 'none', border: 'none', color: '#ff4d4d', fontSize: '13px', cursor: 'pointer', textDecoration: 'underline', opacity: 0.8 }}>Cancel Reservation</button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* 3. SETTINGS TAB (SECURE PASSWORD) */}
                        {activeTab === 'settings' && (
                            <motion.div key="settings" variants={tabContentVariants} initial="hidden" animate="visible" exit="exit">
                                <h2 style={{ fontFamily: 'Playfair Display', marginBottom: '30px', fontSize: '2rem' }}>Account Settings</h2>
                                
                                <div style={{ display: 'grid', gap: '40px' }}>
                                    
                                    {/* Edit Profile Form */}
                                    <div style={{ background: '#111114', padding: '40px', borderRadius: '30px', border: '1px solid #1f1f23' }}>
                                        <h3 style={{ marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.4rem' }}><FaUser color="var(--primary)" /> Personal Details</h3>
                                        <form onSubmit={handleUpdateProfile} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '25px' }}>
                                            <div><label style={{ display: 'block', fontSize: '11px', marginBottom: '8px', opacity: 0.5, letterSpacing: '1px' }}>FULL NAME</label><input className="luxury-input" value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} disabled={!isEditing} /></div>
                                            <div><label style={{ display: 'block', fontSize: '11px', marginBottom: '8px', opacity: 0.5, letterSpacing: '1px' }}>EMAIL ADDRESS</label><input className="luxury-input" value={editData.email} onChange={e => setEditData({...editData, email: e.target.value})} disabled={!isEditing} /></div>
                                            <div><label style={{ display: 'block', fontSize: '11px', marginBottom: '8px', opacity: 0.5, letterSpacing: '1px' }}>PHONE NUMBER</label><input className="luxury-input" value={editData.phone} onChange={e => setEditData({...editData, phone: e.target.value})} disabled={!isEditing} /></div>
                                            <div><label style={{ display: 'block', fontSize: '11px', marginBottom: '8px', opacity: 0.5, letterSpacing: '1px' }}>ADDRESS</label><input className="luxury-input" value={editData.address} onChange={e => setEditData({...editData, address: e.target.value})} disabled={!isEditing} /></div>
                                            
                                            <div style={{ gridColumn: '1 / -1', marginTop: '10px' }}>
                                                {isEditing ? (
                                                    <div style={{ display: 'flex', gap: '15px' }}>
                                                        <button type="submit" className="gold-btn">Save Changes</button>
                                                        <button type="button" onClick={() => setIsEditing(false)} style={{ padding: '14px 30px', background: 'transparent', border: '1px solid #fff', color: '#fff', borderRadius: '50px', cursor: 'pointer' }}>Cancel</button>
                                                    </div>
                                                ) : (
                                                    <button type="button" onClick={() => setIsEditing(true)} className="gold-btn" style={{ padding: '12px 30px', fontSize: '14px' }}>Edit Profile</button>
                                                )}
                                            </div>
                                        </form>
                                    </div>

                                    {/* ✅ SECURE PASSWORD SECTION */}
                                    <div style={{ background: '#111114', padding: '40px', borderRadius: '30px', border: '1px solid #1f1f23' }}>
                                        <h3 style={{ marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.4rem' }}><FaShieldAlt color="var(--primary)" /> Security & Password</h3>
                                        <p style={{ opacity: 0.6, fontSize: '14px', marginBottom: '25px', maxWidth: '600px' }}>Ensure your account is using a long, random password to stay secure.</p>
                                        
                                        <form onSubmit={handlePasswordChange} style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px', maxWidth: '500px' }}>
                                            <div style={{ position: 'relative' }}>
                                                <FaLock style={{ position: 'absolute', left: '15px', top: '15px', color: '#666' }} />
                                                <input 
                                                    type="password" 
                                                    className="luxury-input" 
                                                    placeholder="Current Password" 
                                                    style={{ paddingLeft: '40px' }}
                                                    value={passData.current} 
                                                    onChange={e => setPassData({...passData, current: e.target.value})} 
                                                />
                                            </div>
                                            
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                                <div style={{ position: 'relative' }}>
                                                    <FaKey style={{ position: 'absolute', left: '15px', top: '15px', color: '#666' }} />
                                                    <input 
                                                        type="password" 
                                                        className="luxury-input" 
                                                        placeholder="New Password" 
                                                        style={{ paddingLeft: '40px' }}
                                                        value={passData.new} 
                                                        onChange={e => setPassData({...passData, new: e.target.value})} 
                                                    />
                                                </div>
                                                <div style={{ position: 'relative' }}>
                                                    <FaKey style={{ position: 'absolute', left: '15px', top: '15px', color: '#666' }} />
                                                    <input 
                                                        type="password" 
                                                        className="luxury-input" 
                                                        placeholder="Confirm Password" 
                                                        style={{ paddingLeft: '40px' }}
                                                        value={passData.confirm} 
                                                        onChange={e => setPassData({...passData, confirm: e.target.value})} 
                                                    />
                                                </div>
                                            </div>
                                            <button className="gold-btn" style={{ width: 'fit-content', padding: '14px 40px', marginTop: '10px' }}>Update Password</button>
                                        </form>
                                    </div>

                                </div>
                            </motion.div>
                        )}

                        {/* 4. PAYMENTS TAB */}
                        {activeTab === 'payments' && (
                            <motion.div key="payments" variants={tabContentVariants} initial="hidden" animate="visible" exit="exit">
                                <h2 style={{ fontFamily: 'Playfair Display', marginBottom: '40px', fontSize: '2rem' }}>Payment Methods</h2>
                                <div style={{ textAlign: 'center', padding: '80px 40px', background: '#111114', borderRadius: '30px', border: '1px solid #1f1f23' }}>
                                    <FaCreditCard size={50} style={{ opacity: 0.2, marginBottom: '20px' }} />
                                    <h3 style={{ marginBottom: '10px' }}>No Payment Data</h3>
                                    <p style={{ opacity: 0.5 }}>Payment information will be available after your first booking.</p>
                                </div>

                                <div style={{ marginTop: '60px' }}>
                                    <h3 style={{ fontFamily: 'Playfair Display', marginBottom: '20px' }}>Billing History</h3>
                                    <div style={{ textAlign: 'center', padding: '60px 40px', background: '#111114', borderRadius: '30px', border: '1px solid #1f1f23' }}>
                                        <p style={{ opacity: 0.5 }}>No billing history available</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};

export default Profile;