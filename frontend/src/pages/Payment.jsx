import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import API_BASE_URL from '../config';
import {
    FaArrowLeft, FaLock, FaCreditCard, FaUser, FaEnvelope,
    FaCalendarCheck, FaCalendarTimes, FaCrown, FaShieldAlt
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const FALLBACK_IMG = 'https://placehold.co/400x300';

const handleImgError = (e) => {
    e.target.onerror = null;
    e.target.src = FALLBACK_IMG;
};

const Payment = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();

    const bookingData = location?.state || null;
    const room = bookingData?.room || null;

    const [cardName, setCardName] = useState(user?.name || '');
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    if (!bookingData || !room) {
        return (
            <div className="luxury-bg-mesh" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-color)', padding: '40px', textAlign: 'center' }}>
                <FaCreditCard size={48} style={{ color: 'var(--primary)', marginBottom: '20px' }} />
                <h2 style={{ fontFamily: 'Playfair Display', marginBottom: '10px' }}>No booking selected</h2>
                <p style={{ opacity: 0.7, marginBottom: '30px' }}>Please select a room first to proceed with payment.</p>
                <motion.button
                    className="gold-btn"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/rooms')}
                    style={{ padding: '14px 30px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                    Browse Suites
                </motion.button>
            </div>
        );
    }

    const checkIn = bookingData?.checkIn || 'N/A';
    const checkOut = bookingData?.checkOut || 'N/A';
    const guests = bookingData?.guests || 1;
    const totalPrice = bookingData?.totalPrice || (room?.price || 0);
    const roomImage = (room?.images && room.images[0]) || FALLBACK_IMG;

    const nights = (() => {
        if (!bookingData?.checkIn || !bookingData?.checkOut) return 0;
        const diff = (new Date(bookingData.checkOut) - new Date(bookingData.checkIn)) / (1000 * 60 * 60 * 24);
        return diff > 0 ? diff : 0;
    })();

    const serviceFee = 50;
    const displayTotal = totalPrice || (nights * (room?.price || 0)) + serviceFee;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (paymentMethod === 'card') {
            if (!cardNumber.trim() || !expiry.trim() || !cvv.trim() || !cardName.trim()) {
                return toast.error('Please fill in all payment details');
            }
        }
        setProcessing(true);
        try {
            const isCash = paymentMethod === 'cash';
            const calculatedTotal = displayTotal || (room?.price || 0);
            await axios.post(`${API_BASE_URL}/api/bookings`, {
                roomId: room?._id,
                userId: bookingData?.userId || user?._id,
                checkInDate: bookingData?.checkIn,
                checkOutDate: bookingData?.checkOut,
                paymentMethod: isCash ? 'cash_at_counter' : 'card',
                paymentType: isCash ? 'cash' : 'card',
                paymentStatus: isCash ? 'Unpaid' : 'Paid',
                totalAmount: Number(calculatedTotal || room?.price || 0),
                totalPrice: Number(calculatedTotal || room?.price || 0),
                amount: Number(calculatedTotal || room?.price || 0),
            });
            toast.success(isCash ? 'Booking confirmed! Pay at the hotel reception.' : 'Payment successful! Your booking is confirmed.');
            navigate('/profile', { replace: true });
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Payment failed. Please try again.');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="luxury-bg-mesh" style={{ color: 'var(--text-color)', minHeight: '100vh', paddingBottom: '100px', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '5%', right: '10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(212,175,55,0.04) 0%, transparent 60%)', borderRadius: '50%', animation: 'aurora 20s linear infinite', pointerEvents: 'none' }} />

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '100px 5% 40px', position: 'relative', zIndex: 1 }}>
                <motion.button
                    onClick={() => navigate(-1)}
                    whileHover={{ x: -4 }}
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-light)', color: 'var(--text-color)', cursor: 'pointer', padding: '10px 18px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', marginBottom: '24px' }}
                >
                    <FaArrowLeft /> Back
                </motion.button>

                <h1 style={{ fontFamily: 'Playfair Display', fontSize: 'clamp(2rem, 4vw, 3rem)', margin: '0 0 30px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <FaLock color="var(--primary)" /> Secure Payment
                </h1>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px', alignItems: 'start' }}>
                    {/* Booking Summary */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(20px)', padding: '30px', borderRadius: '20px', border: '1px solid var(--border)', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}
                    >
                        <h3 style={{ fontFamily: 'Playfair Display', fontSize: '1.6rem', margin: '0 0 20px' }}>Booking Summary</h3>

                        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                            <img
                                src={roomImage}
                                alt={room?.type || 'Room'}
                                onError={handleImgError}
                                style={{ width: '110px', height: '90px', objectFit: 'cover', borderRadius: '14px', border: '1px solid var(--border)' }}
                            />
                            <div style={{ minWidth: 0 }}>
                                <h4 style={{ margin: '0 0 6px', fontFamily: 'Playfair Display', fontSize: '1.2rem' }}>{room?.type || 'Suite'}</h4>
                                <p style={{ margin: 0, fontSize: '13px', opacity: 0.7 }}>Suite #{room?.roomNumber || 'N/A'}</p>
                                <p style={{ margin: '6px 0 0', fontSize: '13px', color: 'var(--primary)' }}>${room?.price || 0} / night</p>
                            </div>
                        </div>

                        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
                                <FaCalendarCheck color="var(--primary)" /> <span style={{ opacity: 0.6 }}>Check-In:</span> <strong>{checkIn}</strong>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
                                <FaCalendarTimes color="var(--primary)" /> <span style={{ opacity: 0.6 }}>Check-Out:</span> <strong>{checkOut}</strong>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
                                <FaUser color="var(--primary)" /> <span style={{ opacity: 0.6 }}>Guests:</span> <strong>{guests}</strong>
                            </div>
                        </div>

                        <div style={{ borderTop: '1px solid var(--border)', marginTop: '20px', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', opacity: 0.8 }}>
                                <span>${room?.price || 0} x {nights || 1} night{nights !== 1 ? 's' : ''}</span>
                                <span>${(nights || 1) * (room?.price || 0)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', opacity: 0.8 }}>
                                <span>Service Fee</span>
                                <span>${serviceFee}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--primary)', fontFamily: 'Playfair Display', marginTop: '8px' }}>
                                <span>Total</span>
                                <span>${displayTotal}</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Payment Form */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(20px)', padding: '30px', borderRadius: '20px', border: '1px solid var(--border)', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                            <FaShieldAlt color="var(--primary)" />
                            <h3 style={{ fontFamily: 'Playfair Display', fontSize: '1.6rem', margin: 0 }}>Payment Details</h3>
                        </div>

                        {/* Payment Method Selector */}
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '26px', background: 'rgba(0,0,0,0.18)', padding: '6px', borderRadius: '14px', border: '1px solid var(--border)' }}>
                            {[
                                { value: 'card', label: 'Credit / Debit Card', icon: '💳' },
                                { value: 'cash', label: 'Pay at Cash Counter', icon: '🏨' },
                            ].map(option => {
                                const active = paymentMethod === option.value;
                                return (
                                    <motion.button
                                        key={option.value}
                                        type="button"
                                        onClick={() => setPaymentMethod(option.value)}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        style={{
                                            flex: 1,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px',
                                            padding: '14px 10px',
                                            borderRadius: '10px',
                                            cursor: 'pointer',
                                            border: active ? '1px solid var(--primary)' : '1px solid transparent',
                                            background: active ? 'var(--gold-gradient)' : 'transparent',
                                            color: active ? '#000' : 'var(--text-color)',
                                            fontWeight: active ? 700 : 500,
                                            fontSize: '14px',
                                            transition: 'all 0.25s ease',
                                        }}
                                    >
                                        <span style={{ fontSize: '16px' }}>{option.icon}</span>
                                        {option.label}
                                    </motion.button>
                                );
                            })}
                        </div>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                            {paymentMethod === 'card' ? (
                                <>
                                    <div>
                                        <label style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.6 }}>Cardholder Name</label>
                                        <input
                                            className="luxury-input"
                                            value={cardName}
                                            onChange={(e) => setCardName(e.target.value)}
                                            placeholder="John Doe"
                                            style={{ width: '100%', marginTop: '6px', padding: '14px 16px', borderRadius: '12px', border: '1px solid var(--border)', background: 'rgba(0,0,0,0.15)', color: 'var(--text-color)', fontSize: '15px', outline: 'none' }}
                                        />
                                    </div>

                                    <div>
                                        <label style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.6 }}>Card Number</label>
                                        <div style={{ position: 'relative', marginTop: '6px' }}>
                                            <FaCreditCard style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                                            <input
                                                className="luxury-input"
                                                value={cardNumber}
                                                onChange={(e) => setCardNumber(e.target.value)}
                                                placeholder="1234 5678 9012 3456"
                                                inputMode="numeric"
                                                style={{ width: '100%', padding: '14px 16px 14px 44px', borderRadius: '12px', border: '1px solid var(--border)', background: 'rgba(0,0,0,0.15)', color: 'var(--text-color)', fontSize: '15px', outline: 'none' }}
                                            />
                                        </div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                        <div>
                                            <label style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.6 }}>Expiry</label>
                                            <input
                                                className="luxury-input"
                                                value={expiry}
                                                onChange={(e) => setExpiry(e.target.value)}
                                                placeholder="MM/YY"
                                                style={{ width: '100%', marginTop: '6px', padding: '14px 16px', borderRadius: '12px', border: '1px solid var(--border)', background: 'rgba(0,0,0,0.15)', color: 'var(--text-color)', fontSize: '15px', outline: 'none' }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.6 }}>CVV</label>
                                            <input
                                                className="luxury-input"
                                                value={cvv}
                                                onChange={(e) => setCvv(e.target.value)}
                                                placeholder="123"
                                                inputMode="numeric"
                                                style={{ width: '100%', marginTop: '6px', padding: '14px 16px', borderRadius: '12px', border: '1px solid var(--border)', background: 'rgba(0,0,0,0.15)', color: 'var(--text-color)', fontSize: '15px', outline: 'none' }}
                                            />
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', opacity: 0.6, marginTop: '4px' }}>
                                        <FaLock size={11} /> Your payment information is encrypted and secure.
                                    </div>
                                </>
                            ) : (
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '18px 20px', borderRadius: '14px', background: 'rgba(212, 175, 55, 0.08)', border: '1px solid var(--border)', fontSize: '15px', lineHeight: '1.6' }}>
                                    <span style={{ fontSize: '20px', lineHeight: '1' }}>ℹ️</span>
                                    <span>
                                        No prepayment required now. You can settle your bill of <strong style={{ color: 'var(--primary)' }}>${displayTotal}</strong> in cash or via card at the hotel reception during check-in.
                                    </span>
                                </div>
                            )}

                            <motion.button
                                type="submit"
                                className="gold-btn"
                                whileHover={{ scale: 1.02, boxShadow: '0 8px 40px rgba(212, 175, 55, 0.4)' }}
                                whileTap={{ scale: 0.98 }}
                                disabled={processing}
                                style={{ width: '100%', padding: '18px', fontSize: '16px', fontWeight: 'bold', cursor: processing ? 'not-allowed' : 'pointer', opacity: processing ? 0.7 : 1, marginTop: '6px' }}
                            >
                                {processing
                                    ? 'Processing...'
                                    : paymentMethod === 'cash'
                                        ? `Confirm Booking (Pay at Hotel)`
                                        : `Pay $${displayTotal}`} <FaCrown size={14} style={{ marginLeft: '8px' }} />
                            </motion.button>
                        </form>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Payment;
