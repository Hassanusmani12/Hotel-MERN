import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import useRequireAuth from '../hooks/useRequireAuth';
import {
    FaArrowLeft, FaBed, FaShower, 
    FaStar, FaShareAlt, FaHeart, FaRegHeart, FaChevronLeft, FaChevronRight, FaCrown
} from 'react-icons/fa';

const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const stagger = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } },
};

const ReviewCard = ({ review }) => (
    <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(12px)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border)', marginBottom: '15px' }}
    >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--gold-gradient)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                    {review.user.charAt(0).toUpperCase()}
                </div>
                <div>
                    <h4 style={{ margin: 0, fontSize: '14px' }}>{review.user}</h4>
                    <span style={{ fontSize: '12px', opacity: 0.6 }}>{review.date}</span>
                </div>
            </div>
            <div style={{ display: 'flex', color: '#ffc107', fontSize: '12px' }}>{[...Array(review.rating)].map((_, i) => <FaStar key={i} />)}</div>
        </div>
        <p style={{ fontSize: '14px', opacity: 0.8, fontStyle: 'italic', lineHeight: '1.5' }}>"{review.text}"</p>
    </motion.div>
);

const RoomDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const requireAuth = useRequireAuth();
    const [room, setRoom] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentImgIndex, setCurrentImgIndex] = useState(0);
    const [isFavorite, setIsFavorite] = useState(false);
    const [checkIn, setCheckIn] = useState('');
    const [checkOut, setCheckOut] = useState('');
    const [guests, setGuests] = useState(2);
    const [totalPrice, setTotalPrice] = useState(0);
    const [newReview, setNewReview] = useState({ rating: 5, text: '' });
    const [reviews, setReviews] = useState([]);

    const today = new Date().toISOString().split('T')[0];

    useEffect(() => {
        window.scrollTo(0, 0);
        const fetchRoom = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/rooms/${id}`);
                setRoom(res.data);
            } catch {
                toast.error("Room not found");
                navigate('/rooms');
            } finally { setLoading(false); }
        };
        fetchRoom();
    }, [id, navigate]);

    useEffect(() => {
        if (checkIn && checkOut && room) {
            const days = (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24);
            setTotalPrice(days > 0 ? days * room.price : 0);
        }
    }, [checkIn, checkOut, room]);

    const handleProceedToPayment = () => {
        // Use auth guard - redirects to login if not authenticated
        if (!requireAuth('Please log in to book a room')) return;
        
        if (!checkIn || !checkOut) return toast.error("Select dates first!");
        navigate('/payment', { state: { room, userId: user._id, checkIn, checkOut, guests, totalPrice: totalPrice + 50 } });
    };

    const handleSubmitReview = (e) => {
        e.preventDefault();
        
        // Use auth guard - redirects to login if not authenticated
        if (!requireAuth('Please log in to write a review')) return;
        
        if (!newReview.text.trim()) return toast.error("Please write something!");
        const reviewToAdd = { id: Date.now(), user: user.name, date: new Date().toLocaleDateString(), rating: newReview.rating, text: newReview.text };
        setReviews([reviewToAdd, ...reviews]);
        setNewReview({ rating: 5, text: '' });
        toast.success("Review Submitted!");
    };

    const nextSlide = () => setCurrentImgIndex((prev) => (prev === (room?.images.length - 1) ? 0 : prev + 1));
    const prevSlide = () => setCurrentImgIndex((prev) => (prev === 0 ? (room?.images.length - 1) : prev - 1));

    if (loading) return <div className="luxury-bg-mesh" style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-color)' }}>Loading...</div>;
    if (!room) return null;

    return (
        <div className="luxury-bg-mesh" style={{ color: 'var(--text-color)', minHeight: '100vh', paddingBottom: '100px', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '5%', right: '10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(212,175,55,0.04) 0%, transparent 60%)', borderRadius: '50%', animation: 'aurora 20s linear infinite', pointerEvents: 'none' }} />
            
            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '100px 5% 40px', position: 'relative', zIndex: 1 }}>
                <motion.div initial="hidden" animate="visible" variants={stagger}>
                    <motion.div variants={fadeUp} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <motion.button onClick={() => navigate(-1)} whileHover={{ x: -4 }}
                            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-light)', color: 'var(--text-color)', cursor: 'pointer', padding: '10px 18px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}
                        ><FaArrowLeft /> Back</motion.button>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <motion.button onClick={() => setIsFavorite(!isFavorite)} whileHover={{ scale: 1.1 }}
                                style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(12px)', border: '1px solid var(--border)', padding: '12px', borderRadius: '50%', color: isFavorite ? '#ff4d4d' : 'var(--text-color)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                            >{isFavorite ? <FaHeart /> : <FaRegHeart />}</motion.button>
                            <motion.button whileHover={{ scale: 1.1 }}
                                style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(12px)', border: '1px solid var(--border)', padding: '12px', borderRadius: '50%', color: 'var(--text-color)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                            ><FaShareAlt /></motion.button>
                        </div>
                    </motion.div>

                    <motion.div variants={fadeUp} style={{ marginBottom: '30px' }}>
                        <h1 style={{ fontFamily: 'Playfair Display', fontSize: 'clamp(2rem, 4vw, 3.5rem)', margin: '0 0 10px' }}>{room.type}</h1>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', fontSize: '14px', opacity: 0.8, flexWrap: 'wrap' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FaBed color="var(--primary)" /> Suite #{room.roomNumber}</span>
                            <span style={{ color: '#ffc107', display: 'flex', alignItems: 'center', gap: '6px' }}><FaStar /> {(room.rating || 'N/A')} {reviews.length > 0 && `(${reviews.length} reviews)`}</span>
                            <span style={{ color: '#28a745', background: 'rgba(40, 167, 69, 0.1)', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600 }}>{room.status}</span>
                        </div>
                    </motion.div>

                    <motion.div variants={fadeUp} style={{ position: 'relative', height: '500px', borderRadius: '20px', overflow: 'hidden', marginBottom: '16px', border: '1px solid var(--border)', background: '#000' }}>
                        <AnimatePresence mode='wait'>
                            <motion.img key={currentImgIndex} src={room.images[currentImgIndex]}
                                initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.5 }}
                                alt="Room" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/400x300"; }}
                            />
                        </AnimatePresence>
                        <motion.button onClick={prevSlide} whileHover={{ scale: 1.1 }} style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', padding: '14px', borderRadius: '50%', cursor: 'pointer', zIndex: 10 }}><FaChevronLeft /></motion.button>
                        <motion.button onClick={nextSlide} whileHover={{ scale: 1.1 }} style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', padding: '14px', borderRadius: '50%', cursor: 'pointer', zIndex: 10 }}><FaChevronRight /></motion.button>
                    </motion.div>

                    <motion.div variants={fadeUp} style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px', marginBottom: '40px' }}>
                        {room.images.map((img, idx) => (
                            <motion.img key={idx} src={img} onClick={() => setCurrentImgIndex(idx)}
                                whileHover={{ scale: 1.05, y: -4 }}
                                style={{ width: '100px', height: '70px', objectFit: 'cover', borderRadius: '12px', cursor: 'pointer', border: currentImgIndex === idx ? '2px solid var(--primary)' : '2px solid transparent', opacity: currentImgIndex === idx ? 1 : 0.5, transition: 'all 0.3s' }}
                                alt="thumb" onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/400x300"; }}
                            />
                        ))}
                    </motion.div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '50px', alignItems: 'start' }}>
                        <motion.div variants={fadeUp} style={{ minWidth: '0' }}>
                            <motion.div variants={stagger} style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '30px', marginBottom: '30px' }}>
                                <motion.div variants={fadeUp} style={{ textAlign: 'center', minWidth: '80px' }}>
                                    <FaBed size={24} color="var(--primary)" />
                                    <div style={{ fontSize: '13px', marginTop: '6px', opacity: 0.8 }}>Suite #{room.roomNumber}</div>
                                </motion.div>
                                <motion.div variants={fadeUp} style={{ textAlign: 'center', minWidth: '80px' }}>
                                    <FaShower size={24} color="var(--primary)" />
                                    <div style={{ fontSize: '13px', marginTop: '6px', opacity: 0.8 }}>{room.status}</div>
                                </motion.div>
                                {(room.amenities || []).slice(0, 3).map(amenity => (
                                    <motion.div key={amenity} variants={fadeUp} style={{ textAlign: 'center', minWidth: '80px' }}>
                                        <div style={{ width: '24px', height: '24px', margin: '0 auto', borderRadius: '50%', background: 'rgba(212,175,55,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontSize: '10px', fontWeight: 'bold' }}>✓</div>
                                        <div style={{ fontSize: '12px', marginTop: '6px', opacity: 0.8 }}>{amenity}</div>
                                    </motion.div>
                                ))}
                            </motion.div>

                            <motion.div variants={fadeUp} style={{ marginBottom: '40px' }}>
                                <h3 style={{ fontFamily: 'Playfair Display', fontSize: '1.8rem', marginBottom: '15px' }}>About this Suite</h3>
                                <p style={{ lineHeight: '1.8', opacity: 0.8, fontSize: '16px', whiteSpace: 'pre-line' }}>{room.description}</p>
                            </motion.div>

                            <motion.div variants={fadeUp}>
                                <h3 style={{ fontFamily: 'Playfair Display', fontSize: '1.8rem', marginBottom: '20px' }}>Guest Reviews</h3>
                                {reviews.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '40px', background: 'var(--glass-bg)', borderRadius: '16px', border: '1px solid var(--border)' }}>
                                        <p style={{ opacity: 0.5 }}>No reviews available</p>
                                    </div>
                                ) : (
                                    reviews.map((review) => <ReviewCard key={review.id} review={review} />)
                                )}
                            </motion.div>
                        </motion.div>

                        <motion.div variants={fadeUp} style={{ position: 'sticky', top: '100px' }}>
                            <motion.div
                                whileHover={{ y: -8 }}
                                style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(20px)', padding: '30px', borderRadius: '20px', border: '1px solid var(--border)', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: '20px' }}>
                                    <div>
                                        <span style={{ fontSize: '14px', opacity: 0.6, textDecoration: 'line-through' }}>${room.price + 200}</span>
                                        <div style={{ fontSize: '2.5rem', fontFamily: 'Playfair Display', color: 'var(--primary)', fontWeight: 'bold' }}>${room.price}</div>
                                    </div>
                                    <div style={{ paddingBottom: '10px', opacity: 0.8 }}>/ night</div>
                                </div>
                                <div style={{ border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden', marginBottom: '20px', background: 'rgba(0,0,0,0.15)' }}>
                                    <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
                                        <div style={{ flex: 1, padding: '16px', borderRight: '1px solid var(--border)' }}>
                                            <label style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.6 }}>Check-In</label>
                                            <input type="date" min={today} onChange={(e) => setCheckIn(e.target.value)}
                                                style={{ width: '100%', background: 'transparent', border: 'none', color: 'var(--text-color)', marginTop: '6px', fontSize: '14px' }}
                                            />
                                        </div>
                                        <div style={{ flex: 1, padding: '16px' }}>
                                            <label style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.6 }}>Check-Out</label>
                                            <input type="date" min={checkIn || today} onChange={(e) => setCheckOut(e.target.value)}
                                                style={{ width: '100%', background: 'transparent', border: 'none', color: 'var(--text-color)', marginTop: '6px', fontSize: '14px' }}
                                            />
                                        </div>
                                    </div>
                                    <div style={{ padding: '16px' }}>
                                        <label style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.6 }}>Guests</label>
                                        <select value={guests} onChange={(e) => setGuests(e.target.value)}
                                            style={{ width: '100%', background: 'transparent', border: 'none', color: 'var(--text-color)', marginTop: '6px', fontSize: '14px' }}
                                        >
                                            {[1, 2, 3, 4, 5, 6].map(num => (
                                                <option key={num} value={num} style={{ background: '#222', color: '#fff' }}>{num} Guest{num > 1 ? 's' : ''}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                {totalPrice > 0 && (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                        style={{ marginBottom: '20px', padding: '16px', background: 'rgba(212, 175, 55, 0.08)', borderRadius: '12px', border: '1px solid var(--border)' }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--primary)' }}>
                                            <span>Total</span>
                                            <span style={{ fontFamily: 'Playfair Display' }}>${totalPrice + 50}</span>
                                        </div>
                                        <p style={{ fontSize: '10px', textAlign: 'center', opacity: 0.6, margin: '6px 0 0' }}>Includes $50 service fee</p>
                                    </motion.div>
                                )}
                                <motion.button onClick={handleProceedToPayment} className="gold-btn"
                                    whileHover={{ scale: 1.02, boxShadow: '0 8px 40px rgba(212, 175, 55, 0.4)' }}
                                    whileTap={{ scale: 0.98 }}
                                    style={{ width: '100%', padding: '18px', fontSize: '16px', fontWeight: 'bold' }}
                                >
                                    {totalPrice > 0 ? 'Proceed to Payment' : 'Check Availability'} <FaCrown size={14} style={{marginLeft: '8px'}}/>
                                </motion.button>
                            </motion.div>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default RoomDetails;
