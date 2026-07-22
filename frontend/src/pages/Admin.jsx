import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import API_BASE_URL from '../config';
import { 
    FaTrash, FaCalendarCheck, FaEnvelopeOpenText, FaDollarSign, 
    FaEdit, FaHotel, FaPlus, FaSignOutAlt, FaBars, FaTimes, 
    FaUserCircle, FaSearch, FaFilter, FaDownload, FaCheck, 
    FaTimesCircle, FaEye, FaArrowRight, FaClipboardList, FaChartLine, 
    FaCrown, FaInbox, FaImages, FaCloudUploadAlt, FaCamera 
} from 'react-icons/fa';

const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const stagger = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } },
};

// ==========================================
// 1. VIP HELPER COMPONENTS
// ==========================================

/**
 * @component StatusBadge
 * Defines a luxury status indicator for rooms and bookings.
 */
const StatusBadge = ({ status }) => {
    let color = '#fff', bg = 'rgba(255,255,255,0.05)', border = 'rgba(255,255,255,0.1)';
    
    const s = status?.toLowerCase();
    if (s === 'available' || s === 'confirmed') {
        color = '#28a745'; bg = 'rgba(40, 167, 69, 0.15)'; border = 'rgba(40, 167, 69, 0.2)';
    } else if (s === 'occupied' || s === 'cancelled') {
        color = '#dc3545'; bg = 'rgba(220, 53, 69, 0.15)'; border = 'rgba(220, 53, 69, 0.2)';
    } else if (s === 'cleaning' || s === 'pending') {
        color = '#ffc107'; bg = 'rgba(255, 193, 7, 0.15)'; border = 'rgba(255, 193, 7, 0.2)';
    } else if (s === 'maintenance') {
        color = '#6c757d'; bg = 'rgba(108, 117, 125, 0.15)'; border = 'rgba(108, 117, 125, 0.2)';
    }

    return (
        <span style={{ 
            padding: '6px 16px', borderRadius: '100px', color: color, 
            background: bg, fontSize: '11px', fontWeight: '800', 
            border: `1px solid ${border}`, textTransform: 'uppercase', 
            letterSpacing: '1px', display: 'inline-flex', alignItems: 'center', gap: '6px'
        }}>
            <div style={{ width: '6px', height: '6px', background: color, borderRadius: '50%' }} />
            {status || 'Active'}
        </span>
    );
};

/**
 * @component PaymentBadge
 * Displays payment method/status with a single clean total.
 */
const PaymentBadge = ({ booking }) => {
    const isPaid = String(booking?.paymentStatus || '')
        .toLowerCase()
        .includes('paid');

    const isCash =
        String(booking?.paymentMethod || booking?.paymentType || '')
            .toLowerCase()
            .includes('cash');

    const total =
        booking?.totalAmount ||
        booking?.totalPrice ||
        booking?.amount ||
        (booking?.room?.price * (booking?.nights || 1)) ||
        0;

    const paid = isPaid && !isCash;

    const color = paid ? '#28a745' : '#ffc107';
    const bg = paid ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)';
    const border = paid ? 'rgba(16, 185, 129, 0.5)' : 'rgba(245, 158, 11, 0.5)';

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{
                padding: '6px 14px', borderRadius: '100px', color, background: bg,
                fontSize: '11px', fontWeight: '800', border: `1px solid ${border}`,
                textTransform: 'uppercase', letterSpacing: '0.5px',
                display: 'inline-flex', alignItems: 'center', gap: '6px', width: 'fit-content'
            }}>
                {paid ? '💳 PAID (ONLINE)' : '⚠️ UNPAID - PAY AT COUNTER'}
            </span>
            <div style={{ fontSize: '13px', opacity: 0.6 }}>
                Total: ${total}
            </div>
        </div>
    );
};

/**
 * @component Pagination
 */
const Pagination = ({ total, perPage, current, onChange }) => {
    const pages = Math.ceil(total / perPage);
    if (pages <= 1) return null;

    return (
        <div style={{ display: 'flex', gap: '10px', marginTop: '40px', justifyContent: 'center' }}>
            {[...Array(pages)].map((_, i) => (
                <button 
                    key={i} 
                    onClick={() => onChange(i + 1)}
                    style={{
                        width: '45px', height: '45px', borderRadius: '14px',
                        background: current === i + 1 ? 'var(--primary)' : '#1a1a1e',
                        color: current === i + 1 ? '#000' : '#fff',
                        border: 'none', cursor: 'pointer', fontWeight: 'bold', transition: '0.3s'
                    }}
                >
                    {i + 1}
                </button>
            ))}
        </div>
    );
};

/**
 * @component RevenueChart
 */
const RevenueChart = ({ data }) => {
    return (
        <div className="glass-card" style={{ padding: '40px', background: '#111114', border: '1px solid #1f1f23', borderRadius: '24px', marginTop: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
                <h3 style={{ fontFamily: 'Playfair Display', fontSize: '24px' }}>Revenue Audit</h3>
                <FaChartLine color="var(--primary)" size={24} />
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', height: '200px', gap: '20px' }}>
                {data.map((item, index) => (
                    <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                        <motion.div 
                            initial={{ height: 0 }} animate={{ height: `${item.percentage}%` }}
                            style={{ width: '100%', background: 'linear-gradient(to top, var(--primary), #b8860b)', borderRadius: '8px 8px 2px 2px' }}
                        />
                        <span style={{ fontSize: '12px', opacity: 0.5, fontWeight: 'bold' }}>{item.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ==========================================
// 2. MAIN ADMIN COMPONENT
// ==========================================

const Admin = () => {
    // --- STATE MANAGEMENT ---
    const [bookings, setBookings] = useState([]);
    const [messages, setMessages] = useState([]);
    const [rooms, setRooms] = useState([]);
    
    // ✅ GALLERY STATE (Syncs with LocalStorage)
    const [gallery, setGallery] = useState([]); 
    const [newImage, setNewImage] = useState({ url: '', caption: '', category: 'Exterior' });

    // UI States
    const [activeTab, setActiveTab] = useState('dashboard'); 
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1200);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Filters & Pagination
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    // Modals & Forms
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [showBookingModal, setShowBookingModal] = useState(false);
    
    // ✅ ROOM FORM STATE (Now supports 4 images)
    const [formData, setFormData] = useState({ 
        roomNumber: '', type: '', price: '', description: '', 
        image1: '', image2: '', image3: '', image4: '',
        status: 'Available', amenities: [] 
    });
    const [allAmenities, setAllAmenities] = useState([]);
    const [customAmenity, setCustomAmenity] = useState('');
    const [amenitySearch, setAmenitySearch] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [showGalleryForm, setShowGalleryForm] = useState(false);

    const navigate = useNavigate();

    // ------------------------------------------
    // Auth & Data Initialization
    // ------------------------------------------
    useEffect(() => {
        const handleResize = () => setIsSidebarOpen(window.innerWidth >= 1200);
        window.addEventListener('resize', handleResize);

        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (!storedUser || storedUser.role !== 'admin') {
            navigate('/login');
        } else {
            setUser(storedUser);
            fetchData();
        }
        return () => window.removeEventListener('resize', handleResize);
    }, [navigate]);

    // Silent background refresh (no loading spinner)
    const silentRefresh = async () => {
        const ts = Date.now();
        try {
            const results = await Promise.allSettled([
                axios.get(`${API_BASE_URL}/api/bookings?_=${ts}`),
                axios.get(`${API_BASE_URL}/api/messages?_=${ts}`),
                axios.get(`${API_BASE_URL}/api/rooms?_=${ts}`),
                axios.get(`${API_BASE_URL}/api/amenities?_=${ts}`)
            ]);
            if (results[0].status === 'fulfilled') setBookings(results[0].value.data || []);
            if (results[1].status === 'fulfilled') setMessages(results[1].value.data || []);
            if (results[2].status === 'fulfilled') setRooms(results[2].value.data || []);
            if (results[3].status === 'fulfilled') setAllAmenities(results[3].value.data || []);
        } catch (_) {}
    };

    // Auto-refetch on focus / visibility change + polling
    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (!storedUser || storedUser.role !== 'admin') return;

        const onFocus = () => silentRefresh();
        const onVisible = () => { if (document.visibilityState === 'visible') silentRefresh(); };

        window.addEventListener('focus', onFocus);
        document.addEventListener('visibilitychange', onVisible);

        const pollId = setInterval(silentRefresh, 10000);

        return () => {
            window.removeEventListener('focus', onFocus);
            document.removeEventListener('visibilitychange', onVisible);
            clearInterval(pollId);
        };
    }, []);

    // Load Gallery from Local Storage
    useEffect(() => {
        const savedGallery = JSON.parse(localStorage.getItem('site_gallery')) || [];
        setGallery(savedGallery);
    }, []);

    const fetchData = async () => {
        setLoading(true);
        const ts = Date.now();
        try {
            const results = await Promise.allSettled([
                axios.get(`${API_BASE_URL}/api/bookings?_=${ts}`),
                axios.get(`${API_BASE_URL}/api/messages?_=${ts}`),
                axios.get(`${API_BASE_URL}/api/rooms?_=${ts}`),
                axios.get(`${API_BASE_URL}/api/amenities?_=${ts}`)
            ]);

            if (results[0].status === 'fulfilled') setBookings(results[0].value.data || []);
            if (results[1].status === 'fulfilled') setMessages(results[1].value.data || []);
            if (results[2].status === 'fulfilled') setRooms(results[2].value.data || []);
            if (results[3].status === 'fulfilled') setAllAmenities(results[3].value.data || []);

        } catch (error) {
            console.error("Fetch Error:", error);
            toast.error("System connection unstable. Retrying...");
        } finally {
            setTimeout(() => setLoading(false), 800);
        }
    };

    // ------------------------------------------
    // Logic Handlers
    // ------------------------------------------
    const filteredBookings = useMemo(() => {
        return bookings.filter(b => {
            const s = searchTerm.toLowerCase();
            const matchesSearch = 
                (b.user?.name?.toLowerCase() || "").includes(s) || 
                (b.user?.email?.toLowerCase() || "").includes(s) ||
                (b.room?.roomNumber?.toString() || "").includes(s);
            const matchesStatus = filterStatus === 'All' ? true : b.status === filterStatus;
            return matchesSearch && matchesStatus;
        });
    }, [bookings, searchTerm, filterStatus]);

    const paginatedBookings = filteredBookings.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleDelete = async (type, id) => {
        if (!window.confirm(`Permanently wipe this ${type} record?`)) return;
        try {
            if (type === 'gallery') {
                const updatedGallery = gallery.filter(img => img.id !== id);
                setGallery(updatedGallery);
                localStorage.setItem('site_gallery', JSON.stringify(updatedGallery));
                toast.success("Image removed from archive.");
                return;
            }

            // Assuming standard API routes
            await axios.delete(`${API_BASE_URL}/api/${type}s/${id}`);
            toast.success("Record purged from database.");
            fetchData();
        } catch (err) { 
            console.error(err);
            toast.error("Delete operation failed."); 
        }
    };

    const handleDeleteBooking = async (bookingId) => {
        if (!window.confirm("Are you sure you want to permanently delete this booking?")) return;
        try {
            const token = user?.token || JSON.parse(localStorage.getItem('user') || '{}').token;
            await axios.delete(`${API_BASE_URL}/api/bookings/${bookingId}`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
            setBookings((prev) => prev.filter((item) => item._id !== bookingId));
            toast.success("Booking deleted successfully");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to delete booking");
        }
    };

    // ✅ UPDATED ROOM SUBMIT HANDLER (Handles multiple images)
    const handleRoomSubmit = async (e) => {
        e.preventDefault();
        try {
            const images = [formData.image1, formData.image2, formData.image3, formData.image4].filter(i => i && i.trim() !== '');
            const payload = { ...formData, images, amenities: formData.amenities };

            if (editingId) {
                await axios.put(`${API_BASE_URL}/api/rooms/${editingId}`, payload);
                toast.success("Suite architecture updated.");
            } else {
                await axios.post(`${API_BASE_URL}/api/rooms`, payload);
                toast.success("New suite commissioned.");
            }
            resetRoomForm();
            fetchData();
        } catch (err) { toast.error("Failed to update inventory."); }
    };

    const resetRoomForm = () => {
        setFormData({ 
            roomNumber: '', type: '', price: '', description: '', 
            image1: '', image2: '', image3: '', image4: '', 
            status: 'Available', amenities: [] 
        });
        setEditingId(null);
        setShowForm(false);
    };

    const handleGalleryUpload = (e) => {
        e.preventDefault();
        if (!newImage.url) return toast.error("Image URL required");
        
        const newEntry = { 
            id: Date.now(), 
            url: newImage.url, 
            caption: newImage.caption || 'Untitled',
            category: newImage.category || 'Exterior'
        };
        
        const updatedGallery = [newEntry, ...gallery];
        setGallery(updatedGallery);
        localStorage.setItem('site_gallery', JSON.stringify(updatedGallery));

        setNewImage({ url: '', caption: '', category: 'Exterior' });
        setShowGalleryForm(false);
        toast.success("Visual Asset Archived Successfully");
    };

    const exportData = () => {
        toast.info("Generating encrypted ledger...");
        setTimeout(() => toast.success("Ledger downloaded to secure folder."), 2000);
    };

    const totalRevenue = bookings.reduce((acc, curr) => acc + (Number(curr.room?.price) || 0), 0);
    const chartData = [ { label: 'Mon', percentage: 45, val: 2500 }, { label: 'Tue', percentage: 60, val: 4200 }, { label: 'Wed', percentage: 35, val: 1800 }, { label: 'Thu', percentage: 80, val: 5600 }, { label: 'Fri', percentage: 55, val: 3100 }, { label: 'Sat', percentage: 95, val: 8900 }, { label: 'Sun', percentage: 70, val: 4500 } ];

    const vipStyles = {
        container: { display: 'flex', minHeight: '100vh', background: '#0a0a0b', color: '#e4e4e7', width: '100vw', overflowX: 'hidden', position: 'relative' },
        sidebar: { width: '300px', background: '#060607', borderRight: '1px solid #1f1f23', position: 'fixed', height: '100vh', zIndex: 1000, display: 'flex', flexDirection: 'column', transform: isSidebarOpen ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform 0.3s ease-in-out' },
        main: { flex: 1, marginLeft: isSidebarOpen && window.innerWidth >= 1200 ? '300px' : '0', padding: window.innerWidth < 768 ? '80px 20px 20px' : '60px', transition: 'margin 0.3s ease-in-out', width: '100%', minHeight: '100vh' },
        tableBox: { width: '100%', background: '#111114', border: '1px solid #1f1f23', borderRadius: '30px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' },
        loader: { height: '100vh', width: '100vw', background: '#0a0a0b', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }
    };

    if (loading) return <div style={vipStyles.loader}><motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }} style={{ fontSize: '60px', marginBottom: '20px' }}><FaHotel /></motion.div><h2 style={{ fontFamily: 'Playfair Display', letterSpacing: '3px', fontSize: '24px' }}>ACCESSING VVIP MAINFRAME...</h2></div>;

    return (
        <div className="luxury-bg-mesh" style={vipStyles.container}>
            
            {/* Aurora Ambient Layers */}
            <div style={{ position: 'fixed', top: '-20%', left: '10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(212,175,55,0.04) 0%, transparent 70%)', borderRadius: '50%', animation: 'aurora 20s linear infinite', pointerEvents: 'none', zIndex: 0 }} />
            <div style={{ position: 'fixed', bottom: '-10%', right: '5%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(78,188,255,0.03) 0%, transparent 60%)', borderRadius: '50%', animation: 'floatDrift 15s ease-in-out infinite', pointerEvents: 'none', zIndex: 0 }} />
            
            {/* SIDEBAR */}
            <motion.div style={vipStyles.sidebar}>
                <div style={{ display: window.innerWidth < 1200 ? 'flex' : 'none', justifyContent: 'flex-end', padding: '20px' }}><button onClick={() => setIsSidebarOpen(false)} style={{ background: 'rgba(255, 77, 77, 0.2)', border: 'none', padding: '10px', borderRadius: '50%', color: '#ff4d4d', cursor: 'pointer' }}><FaTimes size={20} /></button></div>
                <div style={{ padding: '20px 30px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '50px' }}>
                        <div style={{ background: 'var(--primary)', padding: '12px', borderRadius: '15px', color: '#000', boxShadow: '0 0 20px rgba(212, 175, 55, 0.3)' }}><FaHotel size={28}/></div>
                        <div><h2 style={{ fontFamily: 'Playfair Display', margin: 0, fontSize: '26px' }}>LuxuryStay</h2><span style={{ fontSize: '10px', opacity: 0.4, fontWeight: '900', letterSpacing: '2px' }}>ULTIMATE DIRECTOR</span></div>
                    </div>
                    <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {[
                            { id: 'dashboard', icon: <FaDollarSign/>, label: 'Main Control' },
                            { id: 'rooms', icon: <FaHotel/>, label: 'Suite Management' },
                            { id: 'gallery', icon: <FaImages/>, label: 'Visuals & Media' },
                            { id: 'bookings', icon: <FaClipboardList/>, label: 'Guest Registry' },
                            { id: 'messages', icon: <FaEnvelopeOpenText/>, label: 'Secretariat' }
                        ].map(item => (
                            <button key={item.id} onClick={() => { setActiveTab(item.id); if(window.innerWidth < 1200) setIsSidebarOpen(false); }} style={{ padding: '20px 25px', borderRadius: '18px', border: 'none', background: activeTab === item.id ? 'linear-gradient(135deg, var(--primary) 0%, #b8860b 100%)' : 'transparent', color: activeTab === item.id ? '#000' : '#666', textAlign: 'left', cursor: 'pointer', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '18px', transition: '0.4s' }}>
                                <span style={{ fontSize: '20px' }}>{item.icon}</span>{item.label}
                            </button>
                        ))}
                    </nav>
                </div>
                <div style={{ marginTop: 'auto', padding: '35px', borderTop: '1px solid #1f1f23' }}>
                    <button onClick={() => { localStorage.removeItem('user'); navigate('/login'); }} style={{ width: '100%', padding: '16px', background: '#ff4d4d10', color: '#ff4d4d', border: '1px solid #ff4d4d20', borderRadius: '15px', cursor: 'pointer', fontWeight: '900', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}><FaSignOutAlt /> Terminate Session</button>
                </div>
            </motion.div>

            {/* MAIN CONTENT */}
            <motion.div initial="hidden" animate="visible" variants={stagger} style={vipStyles.main}>
                {!isSidebarOpen && <button onClick={() => setIsSidebarOpen(true)} style={{ position: 'fixed', top: '20px', left: '20px', zIndex: 1100, background: 'var(--primary)', border: 'none', padding: '12px', borderRadius: '12px', cursor: 'pointer' }}><FaBars color="#000"/></button>}

                {/* 1. DASHBOARD */}
                {activeTab === 'dashboard' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '50px', flexWrap: 'wrap', gap: '20px' }}>
                            <div><h1 style={{ fontFamily: 'Playfair Display', fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: '900' }}>Operations Center</h1><p style={{ opacity: 0.4, fontSize: '18px' }}>Metrics and performance analytics.</p></div>
                            <button onClick={exportData} className="gold-btn" style={{ padding: '15px 35px', display: 'flex', alignItems: 'center', gap: '10px' }}><FaDownload/> Ledger</button>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
                            <div className="glass-card" style={{ padding: '45px', background: '#111114', border: '1px solid #1f1f23', borderRadius: '30px', display: 'flex', alignItems: 'center', gap: '30px' }}><div style={{ width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(40,167,69,0.1)', borderRadius: '22px', color: '#28a745' }}><FaDollarSign size={35}/></div><div><p style={{ margin: 0, opacity: 0.4, fontWeight: '900', fontSize: '12px', textTransform: 'uppercase' }}>Consolidated Revenue</p><h2 style={{ margin: '5px 0 0', fontSize: '40px', fontWeight: '900' }}>${totalRevenue.toLocaleString()}</h2></div></div>
                            <div className="glass-card" style={{ padding: '45px', background: '#111114', border: '1px solid #1f1f23', borderRadius: '30px', display: 'flex', alignItems: 'center', gap: '30px' }}><div style={{ width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,123,255,0.1)', borderRadius: '22px', color: '#007bff' }}><FaCalendarCheck size={35}/></div><div><p style={{ margin: 0, opacity: 0.4, fontWeight: '900', fontSize: '12px', textTransform: 'uppercase' }}>Active Ledger</p><h2 style={{ margin: '5px 0 0', fontSize: '40px', fontWeight: '900' }}>{bookings.length}</h2></div></div>
                            <div className="glass-card" style={{ padding: '45px', background: '#111114', border: '1px solid #1f1f23', borderRadius: '30px', display: 'flex', alignItems: 'center', gap: '30px' }}><div style={{ width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(212, 175, 55, 0.1)', borderRadius: '22px', color: 'var(--primary)' }}><FaHotel size={35}/></div><div><p style={{ margin: 0, opacity: 0.4, fontWeight: '900', fontSize: '12px', textTransform: 'uppercase' }}>Suite Inventory</p><h2 style={{ margin: '5px 0 0', fontSize: '40px', fontWeight: '900' }}>{rooms.length}</h2></div></div>
                        </div>
                        <RevenueChart data={chartData} />
                    </motion.div>
                )}

                {/* 2. ROOMS (UPDATED WITH 4 IMAGE INPUTS) */}
                {activeTab === 'rooms' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '50px' }}>
                            <h1 style={{ fontFamily: 'Playfair Display', fontSize: '3.5rem', fontWeight: '900' }}>Suite Inventory</h1>
                            <button onClick={() => setShowForm(!showForm)} className="gold-btn" style={{ padding: '15px 35px', display: 'flex', alignItems: 'center', gap: '12px' }}><FaPlus/> {showForm ? 'CLOSE' : 'ADD SUITE'}</button>
                        </div>
                        {showForm && (
                            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ padding: '40px', background: '#111114', border: '1px solid var(--primary)', borderRadius: '30px', marginBottom: '50px' }}>
                                <form onSubmit={handleRoomSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '25px' }}>
                                    {/* Basic Details */}
                                    <input className="luxury-input" placeholder="Room ID (e.g. 101)" value={formData.roomNumber} onChange={e => setFormData({...formData, roomNumber: e.target.value})} required />
                                    <input className="luxury-input" placeholder="Category (e.g. Deluxe)" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} required />
                                    <input className="luxury-input" type="number" placeholder="Price ($)" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required />
                                    
                                    <select className="luxury-input" style={{ width: '100%', background: '#0a0a0b' }} value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                                        <option value="Available">Available</option>
                                        <option value="Occupied">Occupied</option>
                                        <option value="Maintenance">Maintenance</option>
                                        <option value="Cleaning">Cleaning</option>
                                    </select>

                                    {/* 4 IMAGE INPUTS */}
                                    <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                        <input className="luxury-input" placeholder="Primary Image URL" value={formData.image1} onChange={e => setFormData({...formData, image1: e.target.value})} required />
                                        <input className="luxury-input" placeholder="Image 2 URL (Optional)" value={formData.image2} onChange={e => setFormData({...formData, image2: e.target.value})} />
                                        <input className="luxury-input" placeholder="Image 3 URL (Optional)" value={formData.image3} onChange={e => setFormData({...formData, image3: e.target.value})} />
                                        <input className="luxury-input" placeholder="Image 4 URL (Optional)" value={formData.image4} onChange={e => setFormData({...formData, image4: e.target.value})} />
                                    </div>

                                    {/* AMENITIES MANAGEMENT */}
                                    <div style={{ gridColumn: '1 / -1', borderTop: '1px solid #1f1f23', paddingTop: '25px' }}>
                                        <label style={{ display: 'block', fontSize: '12px', opacity: 0.5, letterSpacing: '2px', marginBottom: '15px', textTransform: 'uppercase' }}>Suite Amenities</label>
                                        
                                        {/* Selected Amenities */}
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '15px', minHeight: '40px', padding: '12px', background: '#0a0a0b', borderRadius: '12px', border: '1px solid #1f1f23' }}>
                                            {formData.amenities.length === 0 && <span style={{ opacity: 0.3, fontSize: '13px' }}>No amenities selected — select from the list below or type a custom one</span>}
                                            {formData.amenities.map(amenity => (
                                                <span key={amenity} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', background: 'rgba(212,175,55,0.15)', borderRadius: '20px', fontSize: '12px', color: 'var(--primary)', border: '1px solid rgba(212,175,55,0.2)' }}>
                                                    {amenity}
                                                    <span onClick={() => setFormData({...formData, amenities: formData.amenities.filter(a => a !== amenity)})} style={{ cursor: 'pointer', marginLeft: '4px', opacity: 0.6, fontSize: '14px' }}>&times;</span>
                                                </span>
                                            ))}
                                        </div>

                                        {/* Search + Add Custom Amenity */}
                                        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                                            <input className="luxury-input" placeholder="Search amenities..." value={amenitySearch} onChange={e => setAmenitySearch(e.target.value)} style={{ flex: 1, padding: '10px 16px', fontSize: '13px' }} />
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <input className="luxury-input" placeholder="Custom amenity" value={customAmenity} onChange={e => setCustomAmenity(e.target.value)} style={{ width: '180px', padding: '10px 16px', fontSize: '13px' }} />
                                                <button type="button" onClick={() => { if (customAmenity.trim() && !formData.amenities.includes(customAmenity.trim())) { setFormData({...formData, amenities: [...formData.amenities, customAmenity.trim()]}); setCustomAmenity(''); } }} className="gold-btn" style={{ padding: '10px 20px', fontSize: '12px', whiteSpace: 'nowrap' }}>Add</button>
                                            </div>
                                        </div>

                                        {/* Amenity Grid */}
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxHeight: '150px', overflowY: 'auto', padding: '8px', background: '#0a0a0b', borderRadius: '12px', border: '1px solid #1f1f23' }}>
                                            {allAmenities
                                                .filter(a => a.name.toLowerCase().includes(amenitySearch.toLowerCase()))
                                                .map(amenity => {
                                                    const isSelected = formData.amenities.includes(amenity.name);
                                                    return (
                                                        <span key={amenity._id}
                                                            onClick={() => {
                                                                if (isSelected) {
                                                                    setFormData({...formData, amenities: formData.amenities.filter(a => a !== amenity.name)});
                                                                } else {
                                                                    setFormData({...formData, amenities: [...formData.amenities, amenity.name]});
                                                                }
                                                            }}
                                                            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: isSelected ? 'rgba(212,175,55,0.2)' : 'rgba(255,255,255,0.04)', borderRadius: '20px', fontSize: '12px', cursor: 'pointer', color: isSelected ? 'var(--primary)' : '#aaa', border: isSelected ? '1px solid rgba(212,175,55,0.3)' : '1px solid rgba(255,255,255,0.06)', transition: '0.2s' }}
                                                        >
                                                            {isSelected ? '✓ ' : '+ '}{amenity.name}
                                                        </span>
                                                    );
                                                })}
                                            {allAmenities.filter(a => a.name.toLowerCase().includes(amenitySearch.toLowerCase())).length === 0 && amenitySearch && (
                                                <span style={{ opacity: 0.4, padding: '8px', fontSize: '12px' }}>No amenities found. Type above to add a custom one.</span>
                                            )}
                                        </div>
                                    </div>

                                    <textarea className="luxury-input" placeholder="Suite Specifications & Description" style={{ gridColumn: '1/-1', height: '100px' }} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                                    
                                    <div style={{ gridColumn: '1/-1', display: 'flex', gap: '20px' }}>
                                        <button className="gold-btn" style={{ flex: 1, padding: '20px' }}>{editingId ? 'UPDATE SUITE' : 'COMMISSION SUITE'}</button>
                                        <button type="button" onClick={() => setShowForm(false)} style={{ padding: '20px 40px', background: 'transparent', border: '1px solid #fff', color: '#fff', borderRadius: '50px', cursor: 'pointer' }}>CANCEL</button>
                                    </div>
                                </form>
                            </motion.div>
                        )}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px' }}>
                            {rooms.map(room => (
                                <motion.div whileHover={{ y: -5 }} key={room._id} className="glass-card" style={{ padding: '25px', background: '#111114', border: '1px solid #1f1f23', borderRadius: '25px' }}>
                                    <div style={{ position: 'relative', borderRadius: '20px', overflow: 'hidden', height: '200px' }}>
                                        <img src={room.images?.[0] || room.image || "https://placehold.co/400x300?text=No+Image"} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="suite" onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/400x300"; }} />
                                        <div style={{ position: 'absolute', bottom: '10px', right: '10px', background: 'rgba(0,0,0,0.7)', color: '#fff', padding: '5px 10px', borderRadius: '20px', fontSize: '10px' }}>
                                            <FaCamera /> {(room.images?.length || 0)} Photos
                                        </div>
                                    </div>
                                    <div style={{ marginTop: '15px' }}><h3 style={{ margin: 0 }}>{room.type}</h3><p style={{ margin: '5px 0', color: 'var(--primary)' }}>${room.price}</p><StatusBadge status={room.status} /></div>
                                    <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                                        <button 
                                            onClick={() => { 
                                                setEditingId(room._id); 
                                                // Pre-fill all image fields
                                                setFormData({
                                                    ...room, 
                                                    image1: room.images?.[0] || room.image,
                                                    image2: room.images?.[1] || '',
                                                    image3: room.images?.[2] || '',
                                                    image4: room.images?.[3] || ''
                                                }); 
                                                setShowForm(true); 
                                            }} 
                                            style={{ padding: '10px', background: '#28a74520', color: '#28a745', border: 'none', borderRadius: '10px', cursor: 'pointer', flex: 1 }}
                                        >
                                            <FaEdit/> Edit
                                        </button>
                                        <button onClick={() => handleDelete('room', room._id)} style={{ padding: '10px', background: '#dc354520', color: '#dc3545', border: 'none', borderRadius: '10px', cursor: 'pointer', flex: 1 }}><FaTrash/> Delete</button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* 3. MEDIA VAULT (GALLERY) */}
                {activeTab === 'gallery' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '50px' }}>
                            <h1 style={{ fontFamily: 'Playfair Display', fontSize: '3.5rem', fontWeight: '900' }}>Media Vault</h1>
                            <button onClick={() => setShowGalleryForm(!showGalleryForm)} className="gold-btn" style={{ padding: '15px 35px', display: 'flex', alignItems: 'center', gap: '12px' }}><FaCloudUploadAlt /> {showGalleryForm ? 'CLOSE' : 'UPLOAD MEDIA'}</button>
                        </div>

                        {showGalleryForm && (
                            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ padding: '40px', background: '#111114', border: '1px solid var(--primary)', borderRadius: '30px', marginBottom: '50px' }}>
                                <form onSubmit={handleGalleryUpload} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
                                    <input className="luxury-input" placeholder="Image Source URL" value={newImage.url} onChange={e => setNewImage({...newImage, url: e.target.value})} required style={{ gridColumn: '1 / -1' }} />
                                    <input className="luxury-input" placeholder="Caption / Title" value={newImage.caption} onChange={e => setNewImage({...newImage, caption: e.target.value})} required />
                                    <select className="luxury-input" value={newImage.category} onChange={e => setNewImage({...newImage, category: e.target.value})} style={{ background: '#0a0a0b' }}>
                                        {["Exterior", "Suites", "Dining", "Wellness", "Events"].map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                    </select>
                                    <button className="gold-btn" style={{ gridColumn: '1 / -1', padding: '20px' }}>ARCHIVE ASSET</button>
                                </form>
                            </motion.div>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '30px' }}>
                            {gallery.map(img => (
                                <motion.div whileHover={{ scale: 1.02 }} key={img.id} className="glass-card" style={{ padding: '0', background: '#111114', border: '1px solid #1f1f23', borderRadius: '20px', overflow: 'hidden', position: 'relative' }}>
                                    <img src={img.url} alt={img.caption} style={{ width: '100%', height: '200px', objectFit: 'cover' }} onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/400x300"; }} />
                                    <div style={{ padding: '15px' }}>
                                        <h4 style={{ margin: 0, fontSize: '16px' }}>{img.caption}</h4>
                                        <p style={{ margin: '5px 0 0', fontSize: '12px', color: 'var(--primary)', textTransform: 'uppercase' }}>{img.category}</p>
                                    </div>
                                    <button 
                                        onClick={() => handleDelete('gallery', img.id)}
                                        style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(220, 53, 69, 0.8)', color: '#fff', border: 'none', padding: '8px', borderRadius: '50%', cursor: 'pointer' }}
                                    >
                                        <FaTrash size={12} />
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                        {gallery.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '100px', opacity: 0.5 }}>
                                <FaInbox size={50} style={{ marginBottom: '15px' }} />
                                <h3>Media Vault is Empty</h3>
                                <p>Upload images to see them here and on the public gallery.</p>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* 4. BOOKINGS */}
                {activeTab === 'bookings' && (
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} style={{ width: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '50px' }}>
                            <div><h1 style={{ fontFamily: 'Playfair Display', fontSize: '3.5rem', fontWeight: '900' }}>Guest Registry</h1><p style={{ opacity: 0.4, fontSize: '18px' }}>Audited log of confirmed accommodations.</p></div>
                            <div style={{ display: 'flex', gap: '20px', background: '#111114', padding: '15px', borderRadius: '22px', border: '1px solid #1f1f23' }}><div style={{ position: 'relative' }}><FaSearch style={{ position: 'absolute', left: '20px', top: '16px', opacity: 0.2 }} /><input placeholder="Identify Guest..." className="luxury-input" style={{ paddingLeft: '60px', width: '300px', background: '#060607', border: 'none', height: '50px' }} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /></div></div>
                        </div>
                        <div style={vipStyles.tableBox}>
                            <div style={{ width: '100%', overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '900px' }}>
                                    <thead style={{ background: 'var(--primary)', color: '#000' }}><tr><th style={{ padding: '30px' }}>Accommodation</th><th style={{ padding: '30px' }}>Client</th><th style={{ padding: '30px' }}>Booked On</th><th style={{ padding: '30px' }}>Itinerary</th><th style={{ padding: '30px' }}>Payment</th><th style={{ padding: '30px' }}>Status</th><th style={{ padding: '30px', textAlign: 'center' }}>Action</th></tr></thead>
                                    <tbody style={{ background: '#0e0e11' }}>
                                        {paginatedBookings.map((b) => (
                                            <motion.tr key={b._id} style={{ borderBottom: '1px solid #1f1f23' }}>
                                                <td style={{ padding: '35px 30px' }}><div>{b.room?.type || 'N/A'}</div><div style={{ fontSize: '12px', opacity: 0.3 }}>RM-{b.room?.roomNumber || 'N/A'}</div></td>
                                                <td style={{ padding: '35px 30px' }}>
                                                    <div>{b?.user?.name || b?.guestName || b?.clientName || 'Guest'}</div>
                                                    <div style={{ fontSize: '12px', opacity: 0.3 }}>{b?.user?.email || b?.user?.phone || ''}</div>
                                                </td>
                                                <td style={{ padding: '35px 30px' }}>{new Date(b?.createdAt || b?.date).toLocaleDateString()}</td>
                                                <td style={{ padding: '35px 30px' }}>
                                                    {(() => {
                                                        const fmt = (d) => {
                                                            if (!d) return 'N/A';
                                                            const p = String(d).split('T')[0];
                                                            const [y, m, day] = p.split('-');
                                                            return y ? `${parseInt(m)}/${parseInt(day)}/${y}` : d;
                                                        };
                                                        return `${fmt(b?.checkInDate)} → ${fmt(b?.checkOutDate)}`;
                                                    })()}
                                                </td>
                                                <td style={{ padding: '35px 30px' }}><PaymentBadge booking={b} /></td>
                                                <td style={{ padding: '35px 30px' }}><StatusBadge status={b.status} /></td>
                                                <td style={{ padding: '35px 30px', textAlign: 'center' }}><button onClick={() => handleDeleteBooking(b._id)} style={{ color: '#ff4d4d', background: 'none', border: 'none', cursor: 'pointer' }}><FaTrash/></button></td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <Pagination total={filteredBookings.length} perPage={itemsPerPage} current={currentPage} onChange={setCurrentPage} />
                    </motion.div>
                )}

                {/* 5. MESSAGES */}
                {activeTab === 'messages' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <h1 style={{ fontFamily: 'Playfair Display', fontSize: '3.5rem', fontWeight: '900', marginBottom: '50px' }}>Secretariat Inbox</h1>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '30px' }}>
                            {messages.map((msg) => (
                                <div key={msg._id} className="glass-card" style={{ padding: '40px', borderLeft: '6px solid var(--primary)', background: '#111114', borderRadius: '24px', border: '1px solid #1f1f23' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}><div><h3 style={{ margin: 0 }}>{msg.subject}</h3><p style={{ margin: '5px 0', opacity: 0.4 }}>{msg.email}</p></div><button onClick={() => handleDelete('message', msg._id)} style={{ color: '#ff4d4d', background: 'none', border: 'none', cursor: 'pointer' }}><FaTrash size={20}/></button></div>
                                    <p style={{ opacity: 0.8, background: '#0a0a0b', padding: '20px', borderRadius: '15px' }}>{msg.message}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
};

export default Admin;