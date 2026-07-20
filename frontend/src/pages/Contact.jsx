import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import { 
    FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaPaperPlane, 
    FaClock, FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, 
    FaChevronDown, FaChevronUp, FaQuestionCircle, FaGlobe
} from 'react-icons/fa';

// --- 🎬 FRAMER MOTION 3D ENGINE VARIANTS ---
const pageVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.6 } },
    exit: { opacity: 0 }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.12 } }
};

// --- DATA: FAQS ---
const FAQ_DATA = [
    {
        question: "What are the check-in and check-out times?",
        answer: "Check-in is from 3:00 PM, and check-out is until 12:00 PM. Early check-in and late check-out options are available upon request for VVIP members."
    },
    {
        question: "Do you offer airport transportation?",
        answer: "Yes, we provide complimentary luxury chauffeur service from Jinnah International Airport for our Suite guests. Please share your flight details 24 hours prior."
    },
    {
        question: "Is breakfast included in the room rate?",
        answer: "Absolutely. All our bookings include a complimentary gourmet breakfast buffet served at our rooftop restaurant 'The Horizon'."
    },
    {
        question: "Can I host a private event at the hotel?",
        answer: "Our banquet halls and rooftop terraces are perfect for exclusive events. Please contact our events team via the form below for a tailored proposal."
    }
];

// --- 🛠️ 3D INTERACTIVE SUB-COMPONENTS ---

// 1. Live 3D Wireframe Globe (Replaces static map)
const Interactive3DGlobe = () => {
    const mountRef = useRef(null);

    useEffect(() => {
        const currentMount = mountRef.current;
        if (!currentMount) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, currentMount.clientWidth / currentMount.clientHeight, 0.1, 100);
        camera.position.z = 4.5;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        currentMount.appendChild(renderer.domElement);

        // Create Golden Wireframe Earth
        const geometry = new THREE.SphereGeometry(1.6, 26, 26);
        const material = new THREE.MeshStandardMaterial({
            color: 0xd4af37,
            wireframe: true,
            transparent: true,
            opacity: 0.75,
        });
        const globe = new THREE.Mesh(geometry, material);
        scene.add(globe);

        // Add a glowing "LuxuryStay Location Pin" Core inside the globe
        const coreGeo = new THREE.SphereGeometry(0.7, 16, 16);
        const coreMat = new THREE.MeshBasicMaterial({ color: 0x111116 });
        const core = new THREE.Mesh(coreGeo, coreMat);
        scene.add(core);

        const ambientLight = new THREE.AmbientLight(0xffffff, 1);
        scene.add(ambientLight);

        // Mouse Drag Orbit Simulation
        let isDragging = false;
        let previousMousePosition = { x: 0, y: 0 };

        const onMouseDown = (e) => { isDragging = true; };
        const onMouseUp = (e) => { isDragging = false; };
        const onMouseMove = (e) => {
            if (!isDragging) return;
            const deltaX = e.offsetX - previousMousePosition.x;
            const deltaY = e.offsetY - previousMousePosition.y;
            globe.rotation.y += deltaX * 0.008;
            globe.rotation.x += deltaY * 0.008;
            previousMousePosition = { x: e.offsetX, y: e.offsetY };
        };

        currentMount.addEventListener('mousedown', onMouseDown);
        window.addEventListener('mouseup', onMouseUp);
        currentMount.addEventListener('mousemove', onMouseMove);

        let animationFrameId;
        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);
            if (!isDragging) {
                globe.rotation.y += 0.003; // Auto spin when idle
            }
            renderer.render(scene, camera);
        };
        animate();

        const handleResize = () => {
            if (!currentMount) return;
            renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
            camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
            camera.updateProjectionMatrix();
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            currentMount.removeEventListener('mousedown', onMouseDown);
            window.removeEventListener('mouseup', onMouseUp);
            currentMount.removeEventListener('mousemove', onMouseMove);
            cancelAnimationFrame(animationFrameId);
            currentMount.removeChild(renderer.domElement);
        };
    }, []);

    return <div ref={mountRef} style={{ width: '100%', height: '100%', cursor: 'grab' }} />;
};

// 2. 3D Tilt Contact Info Card
const ContactCard3D = ({ icon, title, info, subInfo }) => {
    const cardRef = useRef(null);

    const handleMouseMove = (e) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (centerY - y) / 12;
        const rotateY = (x - centerX) / 12;

        cardRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
    };

    const handleMouseLeave = () => {
        if (!cardRef.current) return;
        cardRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
    };

    return (
        <div style={{ perspective: '1000px', flex: 1, minWidth: '260px' }}>
            <div 
                ref={cardRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                className="contact-card-3d"
                style={{ 
                    padding: '35px 25px', 
                    textAlign: 'center', 
                    background: '#121216', 
                    border: '1px solid rgba(255,255,255,0.05)',
                    borderRadius: '20px',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
                    transition: 'transform 0.15s ease-out, border-color 0.3s ease',
                    transformStyle: 'preserve-3d'
                }}
            >
                <div style={{ 
                    width: '75px', height: '75px', margin: '0 auto 20px', 
                    borderRadius: '50%', background: 'rgba(212, 175, 55, 0.08)', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#d4af37', fontSize: '1.8rem',
                    border: '1px solid rgba(212, 175, 55, 0.3)',
                    transform: 'translateZ(30px)',
                    boxShadow: '0 10px 25px rgba(212,175,55,0.2)'
                }}>
                    {icon}
                </div>
                <div style={{ transform: 'translateZ(20px)' }}>
                    <h3 style={{ marginBottom: '10px', fontSize: '1.2rem', color: '#fff' }}>{title}</h3>
                    <p style={{ margin: '0', fontWeight: 'bold', fontSize: '1.05rem', color: '#d4af37' }}>{info}</p>
                    {subInfo && <p style={{ margin: '6px 0 0', opacity: 0.5, fontSize: '0.85rem', color: '#fff' }}>{subInfo}</p>}
                </div>
            </div>
        </div>
    );
};

// 3. 3D FAQ Accordion Item
const FaqItem3D = ({ faq, isOpen, toggle }) => (
    <motion.div 
        layout
        onClick={toggle}
        style={{ 
            background: isOpen ? 'linear-gradient(145deg, #16161e, #101015)' : '#121216', 
            border: `1px solid ${isOpen ? 'rgba(212,175,55,0.4)' : 'rgba(255,255,255,0.05)'}`, 
            borderRadius: '14px', 
            marginBottom: '16px',
            overflow: 'hidden',
            cursor: 'pointer',
            boxShadow: isOpen ? '0 15px 30px rgba(0,0,0,0.5)' : 'none',
            transform: isOpen ? 'scale(1.01)' : 'scale(1)',
            transition: 'all 0.3s ease'
        }}
    >
        <div style={{ padding: '22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: isOpen ? '#d4af37' : '#e0e0e5' }}>{faq.question}</h4>
            <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
                <FaChevronDown color={isOpen ? "#d4af37" : "rgba(255,255,255,0.3)"} />
            </motion.div>
        </div>
        <AnimatePresence>
            {isOpen && (
                <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    style={{ overflow: 'hidden' }}
                >
                    <div style={{ padding: '0 22px 22px 22px', color: 'rgba(255,255,255,0.7)', fontSize: '14px', lineHeight: '1.7', borderTop: '1px solid rgba(255,255,255,0.03)', marginTop: '5px', paddingTop: '15px' }}>
                        {faq.answer}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    </motion.div>
);

const SocialIcon = ({ icon, href }) => (
    <motion.a 
        href={href} 
        target="_blank"
        whileHover={{ scale: 1.25, y: -5, backgroundColor: '#d4af37', color: '#000', borderColor: '#d4af37', boxShadow: '0 10px 20px rgba(212,175,55,0.4)' }}
        style={{ 
            width: '45px', height: '45px', borderRadius: '50%', 
            border: '1px solid rgba(255,255,255,0.1)', display: 'flex', 
            alignItems: 'center', justifyContent: 'center',
            color: '#fff', textDecoration: 'none',
            fontSize: '1.2rem', transition: 'all 0.2s ease'
        }}
    >
        {icon}
    </motion.a>
);

// --- 🚀 MAIN COMPONENT ---
const Contact = () => {
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
    const [loading, setLoading] = useState(false);
    const [openFaqIndex, setOpenFaqIndex] = useState(0); // First open by default
    const [focusedInput, setFocusedInput] = useState(null);
    const bgCanvasRef = useRef(null);

    useEffect(() => { window.scrollTo(0, 0); }, []);

    // Master Background Floating Embers Scene
    useEffect(() => {
        const bgEl = bgCanvasRef.current;
        if (!bgEl) return;
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
        camera.position.z = 200;

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
        renderer.setSize(window.innerWidth, window.innerHeight);
        bgEl.appendChild(renderer.domElement);

        const particleCount = 250;
        const geo = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        for (let i = 0; i < particleCount * 3; i++) positions[i] = (Math.random() - 0.5) * 600;
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const mat = new THREE.PointsMaterial({ color: 0xd4af37, size: 1.5, transparent: true, opacity: 0.3 });
        const particles = new THREE.Points(geo, mat);
        scene.add(particles);

        let animId;
        const renderBg = () => {
            particles.rotation.y += 0.001;
            particles.position.y += 0.1;
            if (particles.position.y > 100) particles.position.y = 0;
            renderer.render(scene, camera);
            animId = requestAnimationFrame(renderBg);
        };
        renderBg();

        const onRsz = () => {
            renderer.setSize(window.innerWidth, window.innerHeight);
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
        };
        window.addEventListener('resize', onRsz);
        return () => {
            window.removeEventListener('resize', onRsz);
            cancelAnimationFrame(animId);
            bgEl.removeChild(renderer.domElement);
        };
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post('http://localhost:5000/api/messages', formData);
            toast.success("📨 Transmission Secured! Concierge will reach out.");
            setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
        } catch (error) {
            toast.error("Network distortion. Please retry.");
        } finally { setLoading(false); }
    };

    return (
        <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" style={{ backgroundColor: '#060608', color: '#f0f0f5', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
            
            {/* Aurora Background Layers */}
            <div style={{ position: 'absolute', top: '-20%', left: '10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(212,175,55,0.05) 0%, transparent 70%)', borderRadius: '50%', animation: 'aurora 25s linear infinite', pointerEvents: 'none', zIndex: 0 }} />
            <div style={{ position: 'absolute', bottom: '-10%', right: '5%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(78,188,255,0.03) 0%, transparent 60%)', borderRadius: '50%', animation: 'floatDrift 12s ease-in-out infinite', pointerEvents: 'none', zIndex: 0 }} />
            
            {/* Background Particles Canvas */}
            <div ref={bgCanvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }} />

            {/* --- 1. HERO SECTION --- */}
            <div style={{ position: 'relative', height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundImage: `url('https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600')`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'brightness(0.3) contrast(1.2)' }} />
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(to bottom, transparent 40%, #060608 100%)' }} />
                
                <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '0 20px' }}>
                    <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8 }}>
                        <div style={{ display: 'inline-block', border: '1px solid rgba(212,175,55,0.3)', padding: '6px 20px', borderRadius: '50px', backgroundColor: 'rgba(212,175,55,0.05)', backdropFilter: 'blur(5px)', marginBottom: '15px' }}>
                            <span style={{ color: '#d4af37', letterSpacing: '4px', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase' }}>SECURE CHANNEL</span>
                        </div>
                        <h1 style={{ fontSize: '4.5rem', fontFamily: 'Playfair Display', margin: '0 0 15px 0', color: '#fff', textShadow: '0 10px 30px rgba(0,0,0,0.8)' }}>Get In <span style={{ color: '#d4af37', fontStyle: 'italic' }}>Touch</span></h1>
                        <p style={{ maxWidth: '600px', margin: '0 auto', fontSize: '1.1rem', color: 'rgba(255,255,255,0.7)', lineHeight: '1.6' }}>
                            Initiate a private dialogue with our guest relations suite. Available round the clock.
                        </p>
                    </motion.div>
                </div>
            </div>

            <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 5%', position: 'relative', zIndex: 2 }}>

                {/* --- 2. 3D CONTACT INFO CARDS DOCK --- */}
                <motion.div variants={staggerContainer} initial="hidden" animate="visible" style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', marginTop: '-75px' }}>
                    <ContactCard3D icon={<FaPhoneAlt />} title="Direct Line" info="+92 300 1234567" subInfo="24/7 Priority Desk" />
                    <ContactCard3D icon={<FaEnvelope />} title="Electronic Mail" info="concierge@luxurystay.com" subInfo="Encrypted & Monitored" />
                    <ContactCard3D icon={<FaMapMarkerAlt />} title="Coordinates" info="123 Beach Avenue" subInfo="Karachi, Pakistan" />
                </motion.div>

                {/* --- 3. MAIN CONTENT MATRIX GRID --- */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '70px', marginTop: '120px', marginBottom: '120px' }}>
                    
                    {/* LEFT: 3D ELEVATING FORM */}
                    <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                        <div style={{ background: '#101014', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '24px', padding: '45px', boxShadow: '0 30px 70px rgba(0,0,0,0.5)', perspective: '1000px' }}>
                            <span style={{ color: '#d4af37', fontSize: '12px', letterSpacing: '3px', fontWeight: '700' }}>DISPATCH A WIRE</span>
                            <h2 style={{ fontFamily: 'Playfair Display', fontSize: '2.4rem', color: '#fff', margin: '10px 0 35px 0' }}>State your inquiry</h2>

                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px', transformStyle: 'preserve-3d' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    
                                    {/* Name Input */}
                                    <div className="input-wrap-3d" style={{ transform: focusedInput === 'name' ? 'translateZ(20px)' : 'translateZ(0px)', transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
                                        <label style={{ fontSize: '11px', color: focusedInput === 'name' ? '#d4af37' : '#888', marginBottom: '8px', display: 'block', fontWeight: '600', letterSpacing: '1px' }}>YOUR FULL NAME</label>
                                        <input 
                                            type="text" className="luxury-input-3d" required
                                            value={formData.name} onChange={(e)=>setFormData({...formData, name:e.target.value})}
                                            onFocus={() => setFocusedInput('name')} onBlur={() => setFocusedInput(null)}
                                        />
                                    </div>

                                    {/* Phone Input */}
                                    <div className="input-wrap-3d" style={{ transform: focusedInput === 'phone' ? 'translateZ(20px)' : 'translateZ(0px)', transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
                                        <label style={{ fontSize: '11px', color: focusedInput === 'phone' ? '#d4af37' : '#888', marginBottom: '8px', display: 'block', fontWeight: '600', letterSpacing: '1px' }}>SECURE TELEPHONE</label>
                                        <input 
                                            type="text" className="luxury-input-3d" required
                                            value={formData.phone} onChange={(e)=>setFormData({...formData, phone:e.target.value})}
                                            onFocus={() => setFocusedInput('phone')} onBlur={() => setFocusedInput(null)}
                                        />
                                    </div>

                                </div>

                                {/* Email Input */}
                                <div className="input-wrap-3d" style={{ transform: focusedInput === 'email' ? 'translateZ(20px)' : 'translateZ(0px)', transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
                                    <label style={{ fontSize: '11px', color: focusedInput === 'email' ? '#d4af37' : '#888', marginBottom: '8px', display: 'block', fontWeight: '600', letterSpacing: '1px' }}>ELECTRONIC RETURN ADDRESS</label>
                                    <input 
                                        type="email" className="luxury-input-3d" required
                                        value={formData.email} onChange={(e)=>setFormData({...formData, email:e.target.value})}
                                        onFocus={() => setFocusedInput('email')} onBlur={() => setFocusedInput(null)}
                                    />
                                </div>

                                {/* Subject Select */}
                                <div className="input-wrap-3d" style={{ transform: focusedInput === 'subject' ? 'translateZ(20px)' : 'translateZ(0px)', transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
                                    <label style={{ fontSize: '11px', color: focusedInput === 'subject' ? '#d4af37' : '#888', marginBottom: '8px', display: 'block', fontWeight: '600', letterSpacing: '1px' }}>DEPARTMENT</label>
                                    <select 
                                        className="luxury-input-3d" required
                                        value={formData.subject} onChange={(e)=>setFormData({...formData, subject:e.target.value})}
                                        onFocus={() => setFocusedInput('subject')} onBlur={() => setFocusedInput(null)}
                                    >
                                        <option value="" style={{ background: '#101014' }}>Select a Protocol</option>
                                        <option value="Suite Reservation" style={{ background: '#101014' }}>Suite Reservation</option>
                                        <option value="Private Charter/Events" style={{ background: '#101014' }}>Private Charter / Events</option>
                                        <option value="VVIP Concierge" style={{ background: '#101014' }}>VVIP Concierge</option>
                                        <option value="Security/Privacy" style={{ background: '#101014' }}>Security / Privacy</option>
                                    </select>
                                </div>

                                {/* Message Textarea */}
                                <div className="input-wrap-3d" style={{ transform: focusedInput === 'msg' ? 'translateZ(20px)' : 'translateZ(0px)', transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
                                    <label style={{ fontSize: '11px', color: focusedInput === 'msg' ? '#d4af37' : '#888', marginBottom: '8px', display: 'block', fontWeight: '600', letterSpacing: '1px' }}>TRANSMISSION BODY</label>
                                    <textarea 
                                        rows="4" className="luxury-input-3d" required style={{ resize: 'none' }}
                                        value={formData.message} onChange={(e)=>setFormData({...formData, message:e.target.value})}
                                        onFocus={() => setFocusedInput('msg')} onBlur={() => setFocusedInput(null)}
                                    />
                                </div>

                                <motion.button 
                                    disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                    style={{ 
                                        padding: '20px', background: loading ? '#333' : 'linear-gradient(90deg, #d4af37, #f3e5ab, #d4af37)', 
                                        color: '#000', border: 'none', borderRadius: '12px', fontWeight: '800', fontSize: '15px', 
                                        cursor: loading ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
                                        boxShadow: '0 15px 30px rgba(212,175,55,0.3)', letterSpacing: '1px', textTransform: 'uppercase'
                                    }}
                                >
                                    {loading ? 'ENCRYPTING & SENDING...' : <><FaPaperPlane /> TRANSMIT MESSAGE</>}
                                </motion.button>
                            </form>
                        </div>
                    </motion.div>

                    {/* RIGHT: 3D GLOBE & FAQS */}
                    <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} style={{ display: 'flex', flexDirection: 'column', gap: '50px' }}>
                        
                        {/* 3D WebGL Globe Container */}
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
                                <h3 style={{ fontFamily: 'Playfair Display', fontSize: '1.8rem', margin: 0, display: 'flex', alignItems: 'center', gap: '12px', color: '#fff' }}>
                                    <FaGlobe color="#d4af37" /> Global Hub
                                </h3>
                                <span style={{ fontSize: '11px', color: '#888', letterSpacing: '1px' }}>(CLICK & DRAG TO ORBIT)</span>
                            </div>

                            <div style={{ 
                                width: '100%', height: '340px', borderRadius: '24px', background: 'radial-gradient(circle at center, #181822 0%, #0c0c10 100%)', 
                                border: '1px solid rgba(212,175,55,0.15)', position: 'relative', overflow: 'hidden', boxShadow: '0 25px 50px rgba(0,0,0,0.7)' 
                            }}>
                                <Interactive3DGlobe />
                                
                                <div style={{ position: 'absolute', bottom: '20px', left: '20px', pointerEvents: 'none', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', padding: '8px 16px', borderRadius: '50px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00ff66', boxShadow: '0 0 10px #00ff66' }} />
                                    <span style={{ fontSize: '12px', fontWeight: '700', letterSpacing: '1px', color: '#fff' }}>KARACHI APEX</span>
                                </div>
                            </div>
                        </div>

                        {/* FAQ Accordion */}
                        <div>
                            <h3 style={{ fontFamily: 'Playfair Display', fontSize: '1.8rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px', color: '#fff' }}>
                                <FaQuestionCircle color="#d4af37" /> Intelligence Base
                            </h3>
                            <div>
                                {FAQ_DATA.map((faq, idx) => (
                                    <FaqItem3D key={idx} faq={faq} isOpen={openFaqIndex === idx} toggle={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)} />
                                ))}
                            </div>
                        </div>

                    </motion.div>
                </div>

            </div>

            {/* --- 4. FOOTER TEASER --- */}
            <div style={{ background: '#0c0c10', borderTop: '1px solid rgba(255,255,255,0.05)', padding: '80px 5%', position: 'relative', zIndex: 2 }}>
                <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
                    <FaClock size={35} color="#d4af37" style={{ marginBottom: '15px' }} />
                    <h2 style={{ fontFamily: 'Playfair Display', fontSize: '2.5rem', margin: '0 0 10px 0', color: '#fff' }}>Uncompromising Availability</h2>
                    <p style={{ color: '#888', marginBottom: '35px', fontSize: '1.1rem' }}>Our operational matrix operates independently of timezones.</p>
                    
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '40px' }}>
                        <SocialIcon href="#" icon={<FaFacebookF />} />
                        <SocialIcon href="#" icon={<FaTwitter />} />
                        <SocialIcon href="#" icon={<FaInstagram />} />
                        <SocialIcon href="#" icon={<FaLinkedinIn />} />
                    </div>

                    <div style={{ width: '100%', height: '1px', background: 'rgba(255,255,255,0.05)', marginBottom: '30px' }} />
                    <p style={{ color: '#666', fontSize: '13px', letterSpacing: '1px' }}>
                        Direct corporate liaisons: <span style={{ color: '#d4af37', fontWeight: 'bold', cursor: 'pointer' }}>executive@luxurystay.com</span>
                    </p>
                </div>
            </div>

            {/* --- INLINE CSS FOR 3D INPUTS --- */}
            <style>{`
                .luxury-input-3d {
                    width: 100%;
                    padding: 16px 20px;
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    color: #fff;
                    border-radius: 10px;
                    font-size: 14px;
                    outline: none;
                    transition: all 0.3s ease;
                }
                .luxury-input-3d:focus {
                    background: rgba(212, 175, 55, 0.03);
                    border-color: #d4af37;
                    box-shadow: 0 0 20px rgba(212, 175, 55, 0.15);
                }
                .contact-card-3d:hover {
                    border-color: rgba(212, 175, 55, 0.4) !important;
                }
            `}</style>

        </motion.div>
    );
};

export default Contact;