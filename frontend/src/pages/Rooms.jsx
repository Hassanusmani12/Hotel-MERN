/**
 * @file Rooms.jsx
 * @description The main accommodations listing page for LuxuryStay.
 * Handles filtering, searching, pagination, comparison, and wishlist functionality.
 * Designed for high-performance rendering with Framer Motion animations.
 * @author LuxuryStay Dev Team
 * @version 2.2.0 (Stable VVIP - Fixed Imports & UI)
 */

import { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion as Motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import * as THREE from 'three';
import { 
    // Navigation & Actions
    FaSearch, FaArrowRight, FaArrowLeft, FaChevronLeft, FaChevronRight, FaTimes, FaExchangeAlt, FaFilter, FaSortAmountDown,
    // Room Features
    FaBed, FaWifi, FaStar, FaCrown, FaRulerCombined, FaUserFriends, FaMapMarkerAlt, 
    // Amenities
    FaSwimmingPool, FaTv, FaConciergeBell, FaCoffee, FaSpa, FaGlassMartiniAlt, FaUmbrellaBeach, FaDumbbell, FaParking, FaSnowflake, FaFire, FaGamepad,
    // UI Icons
    FaCheckCircle, FaInfoCircle, FaCalendarAlt, FaTh, FaThList, FaHeart, FaRegHeart,
    // ✅ FIXED: Missing Icons Added
    FaEnvelope 
} from 'react-icons/fa';

// ==========================================
// 1. CONSTANTS & CONFIGURATION
// ==========================================

const ITEMS_PER_PAGE = 6;
const CURRENCY = "$";

const ROOM_TYPES = [
    'All', 
    'Presidential Suite', 
    'Ocean Villa', 
    'Executive Loft', 
    'Deluxe King', 
    'Standard Room',
    'Penthouse',
    'Garden Suite',
    'Family Studio'
];

const SORT_OPTIONS = [
    { value: 'recommended', label: 'Recommended' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Top Rated' },
    { value: 'reviews', label: 'Most Reviewed' },
    { value: 'size', label: 'Largest Size' }
];

const AMENITY_OPTIONS = [
    { id: 'wifi', label: 'Free Wifi', icon: <FaWifi /> },
    { id: 'pool', label: 'Private Pool', icon: <FaSwimmingPool /> },
    { id: 'breakfast', label: 'Breakfast', icon: <FaCoffee /> },
    { id: 'gym', label: 'Private Gym', icon: <FaDumbbell /> },
    { id: 'spa', label: 'Spa Access', icon: <FaSpa /> },
    { id: 'butler', label: 'Butler Service', icon: <FaConciergeBell /> },
    { id: 'jacuzzi', label: 'Jacuzzi', icon: <FaGlassMartiniAlt /> },
    { id: 'ocean', label: 'Ocean View', icon: <FaUmbrellaBeach /> },
    { id: 'smart', label: 'Smart Home', icon: <FaTv /> },
    { id: 'parking', label: 'Valet Parking', icon: <FaParking /> },
    { id: 'ac', label: 'Climate Control', icon: <FaSnowflake /> },
    { id: 'fireplace', label: 'Fireplace', icon: <FaFire /> },
    { id: 'gaming', label: 'Gaming Setup', icon: <FaGamepad /> },
];

// ==========================================
// 2. STYLES OBJECT (CSS-IN-JS FOR CLEAN JSX)
// ==========================================

const styles = {
    pageContainer: {
        backgroundColor: '#0a0a0b',
        color: '#e4e4e7',
        minHeight: '100vh',
        overflowX: 'hidden'
    },
    heroSection: {
        height: '50vh',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'url("https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1600") center/cover fixed'
    },
    heroOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(0,0,0,0.6)'
    },
    searchBarContainer: {
        transform: 'translateY(-50%)',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 20px',
        position: 'relative',
        zIndex: 10
    },
    glassCard: {
        background: '#1a1a1d',
        borderRadius: '25px',
        border: '1px solid #1f1f23',
        overflow: 'hidden',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
    },
    searchCard: {
        background: '#1a1a1d',
        padding: '20px 30px',
        borderRadius: '100px',
        border: '1px solid var(--primary)',
        display: 'flex',
        flexWrap: 'wrap', // ✅ FIX: Wrap for smaller desktop screens
        alignItems: 'center',
        gap: '20px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
        justifyContent: 'space-between'
    },
    gridLayout: (isMobile) => ({
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '340px minmax(0, 1fr)',
        columnGap: isMobile ? '0' : '96px',
        rowGap: '50px',
        padding: '64px 5% 50px'
    })
};

// ==========================================
// 4. SUB-COMPONENTS (ATOMIC DESIGN)
// ==========================================

const RoomsThreeScene = () => {
    const mountRef = useRef(null);

    useEffect(() => {
        const mount = mountRef.current;
        if (!mount) return;

        const scene = new THREE.Scene();
        scene.fog = new THREE.Fog(0x050506, 10, 30);

        const camera = new THREE.PerspectiveCamera(48, mount.clientWidth / mount.clientHeight, 0.1, 100);
        camera.position.set(0, 3.2, 10);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(mount.clientWidth, mount.clientHeight);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.shadowMap.enabled = true;
        mount.appendChild(renderer.domElement);

        const roomGroup = new THREE.Group();
        scene.add(roomGroup);

        const ambient = new THREE.AmbientLight(0xffffff, 0.58);
        scene.add(ambient);

        const key = new THREE.DirectionalLight(0xffefb3, 2.8);
        key.position.set(5, 7, 6);
        key.castShadow = true;
        scene.add(key);

        const poolGlow = new THREE.PointLight(0x38d8ff, 2.6, 16);
        poolGlow.position.set(-3.6, 0.5, 3.2);
        scene.add(poolGlow);

        const goldGlow = new THREE.PointLight(0xd4af37, 2.4, 16);
        goldGlow.position.set(3.5, 2.8, 2.5);
        scene.add(goldGlow);

        const floorMat = new THREE.MeshStandardMaterial({ color: 0x111114, roughness: 0.34, metalness: 0.28 });
        const goldMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.2, metalness: 0.76 });
        const linenMat = new THREE.MeshStandardMaterial({ color: 0xf3eee1, roughness: 0.72, metalness: 0.02 });
        const darkMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.48, metalness: 0.4 });
        const glassMat = new THREE.MeshStandardMaterial({
            color: 0x88d8ff,
            roughness: 0.04,
            metalness: 0.15,
            transparent: true,
            opacity: 0.22,
        });
        const redMat = new THREE.MeshStandardMaterial({
            color: 0xff3b30,
            emissive: 0xff1f16,
            emissiveIntensity: 0.44,
            roughness: 0.26,
            metalness: 0.35,
        });

        const floor = new THREE.Mesh(new THREE.BoxGeometry(8.8, 0.24, 6.2), floorMat);
        floor.position.y = -1.95;
        floor.receiveShadow = true;
        roomGroup.add(floor);

        const rug = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.04, 2.4), new THREE.MeshStandardMaterial({ color: 0x2a2114, roughness: 0.7 }));
        rug.position.set(0.1, -1.78, 0.5);
        roomGroup.add(rug);

        const bedBase = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.52, 2.15), darkMat);
        bedBase.position.set(-0.8, -1.36, 0.55);
        bedBase.castShadow = true;
        roomGroup.add(bedBase);

        const mattress = new THREE.Mesh(new THREE.BoxGeometry(3.45, 0.42, 2.35), linenMat);
        mattress.position.set(-0.8, -0.9, 0.55);
        mattress.castShadow = true;
        roomGroup.add(mattress);

        const headboard = new THREE.Mesh(new THREE.BoxGeometry(3.75, 1.5, 0.22), darkMat);
        headboard.position.set(-0.8, -0.65, -0.72);
        headboard.castShadow = true;
        roomGroup.add(headboard);

        [-1.65, 0.05].forEach((x) => {
            const pillow = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.28, 0.58), linenMat);
            pillow.position.set(x, -0.55, -0.15);
            pillow.castShadow = true;
            roomGroup.add(pillow);
        });

        const throwBlanket = new THREE.Mesh(new THREE.BoxGeometry(3.25, 0.08, 0.62), goldMat);
        throwBlanket.position.set(-0.8, -0.62, 1.23);
        roomGroup.add(throwBlanket);

        const table = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.52, 0.22, 48), goldMat);
        table.position.set(2.4, -1.35, 0.9);
        table.castShadow = true;
        roomGroup.add(table);

        const tableLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.11, 1.1, 24), goldMat);
        tableLeg.position.set(2.4, -1.9, 0.9);
        roomGroup.add(tableLeg);

        const sofa = new THREE.Mesh(new THREE.BoxGeometry(2.25, 0.64, 0.82), darkMat);
        sofa.position.set(2.4, -1.18, -0.65);
        sofa.castShadow = true;
        roomGroup.add(sofa);

        const backGlass = new THREE.Mesh(new THREE.BoxGeometry(8.8, 3.4, 0.08), glassMat);
        backGlass.position.set(0, 0, -2.82);
        roomGroup.add(backGlass);

        const sideGlass = new THREE.Mesh(new THREE.BoxGeometry(0.08, 3.1, 6.2), glassMat);
        sideGlass.position.set(4.42, -0.08, 0);
        roomGroup.add(sideGlass);

        for (let i = 0; i < 4; i += 1) {
            const rail = new THREE.Mesh(new THREE.BoxGeometry(8.9, 0.04, 0.04), goldMat);
            rail.position.set(0, 1.45 - i * 0.92, -2.74);
            roomGroup.add(rail);
        }

        for (let i = 0; i < 5; i += 1) {
            const light = new THREE.Mesh(new THREE.SphereGeometry(0.09, 24, 24), redMat);
            light.position.set(-4 + i * 2, 1.85 + Math.sin(i) * 0.24, -2.68);
            roomGroup.add(light);
        }

        const cards = [];
        ['Ocean Villa', 'Penthouse', 'Garden Suite'].forEach((_, index) => {
            const card = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.78, 0.08), index === 1 ? goldMat : darkMat);
            const angle = index * 2.1 + 0.4;
            card.position.set(Math.cos(angle) * 4.1, 0.45 + index * 0.42, Math.sin(angle) * 2.1 + 1.2);
            card.rotation.y = -angle + Math.PI / 2;
            card.castShadow = true;
            roomGroup.add(card);
            cards.push(card);
        });

        const pointer = { x: 0, y: 0 };
        const handlePointerMove = (event) => {
            const rect = mount.getBoundingClientRect();
            pointer.x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
            pointer.y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
        };

        mount.addEventListener('pointermove', handlePointerMove);
        const clock = new THREE.Clock();
        let frameId;

        const animate = () => {
            const elapsed = clock.getElapsedTime();
            roomGroup.rotation.y = Math.sin(elapsed * 0.24) * 0.18 + pointer.x * 0.2;
            roomGroup.rotation.x = -0.08 + pointer.y * 0.08;
            roomGroup.position.y = Math.sin(elapsed * 0.8) * 0.08;
            cards.forEach((card, index) => {
                card.position.y += Math.sin(elapsed + index * 1.8) * 0.002;
                card.rotation.z = Math.sin(elapsed * 0.8 + index) * 0.06;
            });
            camera.position.x += (pointer.x * 0.5 - camera.position.x) * 0.035;
            camera.lookAt(0, -0.2, 0);
            renderer.render(scene, camera);
            frameId = requestAnimationFrame(animate);
        };

        animate();

        const handleResize = () => {
            camera.aspect = mount.clientWidth / mount.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(mount.clientWidth, mount.clientHeight);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            cancelAnimationFrame(frameId);
            window.removeEventListener('resize', handleResize);
            mount.removeEventListener('pointermove', handlePointerMove);
            renderer.dispose();
            scene.traverse((object) => {
                if (object.geometry) object.geometry.dispose();
                if (object.material) {
                    if (Array.isArray(object.material)) {
                        object.material.forEach((material) => material.dispose());
                    } else {
                        object.material.dispose();
                    }
                }
            });
            if (renderer.domElement.parentNode === mount) {
                mount.removeChild(renderer.domElement);
            }
        };
    }, []);

    return <div className="rooms-3d-canvas" ref={mountRef} aria-hidden="true" />;
};

/**
 * Renders a specialized checkbox for the filter sidebar
 */
const FilterCheckbox = ({ label, checked, onChange, icon }) => (
    <label 
        style={{ 
            display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', cursor: 'pointer', 
            padding: '12px', background: checked ? 'rgba(212, 175, 55, 0.1)' : 'rgba(255,255,255,0.02)', 
            borderRadius: '10px', border: checked ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.05)', 
            transition: '0.3s' 
        }}
    >
        <input 
            type="checkbox" 
            checked={checked} 
            onChange={onChange} 
            style={{ display: 'none' }} 
        />
        <span style={{ color: checked ? 'var(--primary)' : '#888', fontSize: '14px' }}>{icon}</span> 
        <span style={{ color: checked ? '#fff' : '#aaa', fontWeight: checked ? 'bold' : 'normal' }}>{label}</span>
    </label>
);

/**
 * 3D Tilt Card Container for hover effects
 */
const TiltCard = ({ children, className, onClick, style }) => {
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotateX = useTransform(y, [-100, 100], [5, -5]);
    const rotateY = useTransform(x, [-100, 100], [-5, 5]);

    const handleMouseMove = (event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        x.set(event.clientX - centerX);
        y.set(event.clientY - centerY);
    };

    return (
        <Motion.div
            style={{ x: 0, y: 0, rotateX, rotateY, z: 100, ...style }}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => { x.set(0); y.set(0); }}
            whileHover={{ scale: 1.02 }}
            className={className}
            onClick={onClick}
        >
            {children}
        </Motion.div>
    );
};

/**
 * Interactive Image Slider within the Room Card
 */
const CardImageSlider = ({ images }) => {
    const [index, setIndex] = useState(0);

    const nextImage = (e) => {
        e.stopPropagation();
        setIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = (e) => {
        e.stopPropagation();
        setIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }} className="slider-container">
            <Motion.img 
                key={index}
                initial={{ opacity: 0, scale: 1.1 }} 
                animate={{ opacity: 1, scale: 1 }} 
                transition={{ duration: 0.5 }}
                src={images[index]} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 40%)' }}></div>

            <div className="slider-nav" style={{ position: 'absolute', top: '50%', width: '100%', display: 'flex', justifyContent: 'space-between', padding: '0 10px', transform: 'translateY(-50%)', opacity: 0, transition: '0.3s' }}>
                <button onClick={prevImage} style={{ background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', borderRadius: '50%', padding: '8px', cursor: 'pointer', backdropFilter: 'blur(5px)' }}><FaChevronLeft/></button>
                <button onClick={nextImage} style={{ background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', borderRadius: '50%', padding: '8px', cursor: 'pointer', backdropFilter: 'blur(5px)' }}><FaChevronRight/></button>
            </div>
            
            <div style={{ position: 'absolute', bottom: '15px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '5px' }}>
                {images.map((_, i) => (
                    <Motion.div 
                        key={i} 
                        initial={false}
                        animate={{ width: i === index ? 20 : 6, backgroundColor: i === index ? '#d4af37' : 'rgba(255,255,255,0.5)' }}
                        style={{ height: '6px', borderRadius: '50px' }} 
                    />
                ))}
            </div>
            <style>{`.slider-container:hover .slider-nav { opacity: 1 !important; }`}</style>
        </div>
    );
};

/**
 * Skeleton Loader for realistic API simulation
 */
const RoomSkeleton = () => (
    <div className="glass-card" style={{ height: '480px', background: '#111114', borderRadius: '25px', overflow: 'hidden', border: '1px solid #1f1f23' }}>
        <div style={{ height: '280px', background: '#1f1f23', animation: 'pulse 1.5s infinite' }}></div>
        <div style={{ padding: '25px' }}>
            <div style={{ height: '30px', width: '70%', background: '#1f1f23', marginBottom: '15px', borderRadius: '5px', animation: 'pulse 1.5s infinite' }}></div>
            <div style={{ height: '20px', width: '40%', background: '#1f1f23', marginBottom: '30px', borderRadius: '5px', animation: 'pulse 1.5s infinite' }}></div>
            <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ height: '45px', flex: 1, background: '#1f1f23', borderRadius: '50px', animation: 'pulse 1.5s infinite' }}></div>
                <div style={{ height: '45px', flex: 1, background: '#1f1f23', borderRadius: '50px', animation: 'pulse 1.5s infinite' }}></div>
            </div>
        </div>
        <style>{`@keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }`}</style>
    </div>
);

/**
 * Quick View Modal Component
 */
const QuickViewModal = ({ room, onClose, navigate }) => {
    if (!room) return null;
    return (
        <Motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.95)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(15px)' }}
            onClick={onClose}
        >
            <Motion.div 
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} 
                style={{ width: '1000px', maxWidth: '95%', height: '600px', background: '#0a0a0b', borderRadius: '30px', overflow: 'hidden', border: '1px solid var(--primary)', position: 'relative', display: 'flex', boxShadow: '0 0 50px rgba(212, 175, 55, 0.2)' }}
                onClick={(e) => e.stopPropagation()}
            >
                <button onClick={onClose} style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 10, background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', fontSize: '20px' }}><FaTimes /></button>
                
                <div style={{ width: '55%', height: '100%', position: 'relative' }}>
                    <img src={room?.images?.[0] || "https://placehold.co/400x300"} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="quick view" onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/400x300"; }} />
                    <div style={{ position: 'absolute', bottom: '30px', left: '30px' }}>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            {room?.images?.slice(1, 4).map((img, i) => (
                                <img key={i} src={img} style={{ width: '60px', height: '60px', borderRadius: '10px', border: '2px solid #fff', objectFit: 'cover' }} alt="thumb" onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/400x300"; }} />
                            ))}
                        </div>
                    </div>
                </div>
                
                <div style={{ width: '45%', padding: '50px', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: '#111114' }}>
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                        <span style={{ padding: '6px 15px', background: 'rgba(212, 175, 55, 0.2)', color: 'var(--primary)', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Suite #{room.roomNumber}</span>
                        <span style={{ padding: '6px 15px', background: '#28a74520', color: '#28a745', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>{room.status}</span>
                    </div>
                    
                    <h2 style={{ fontFamily: 'Playfair Display', fontSize: '2.8rem', marginBottom: '10px', lineHeight: 1.1 }}>{room.type}</h2>
                    
                    <p style={{ opacity: 0.7, lineHeight: '1.8', marginBottom: '30px', fontSize: '15px' }}>{room.description}</p>
                    
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '25px' }}>
                        {(room.amenities || []).slice(0, 8).map(amenity => (
                            <span key={amenity} style={{ padding: '6px 14px', background: 'rgba(212,175,55,0.08)', borderRadius: '20px', fontSize: '12px', color: 'var(--primary)', border: '1px solid rgba(212,175,55,0.15)' }}>{amenity}</span>
                        ))}
                    </div>

                    <div style={{ borderTop: '1px solid #333', paddingTop: '30px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <h1 style={{ color: 'var(--primary)', fontFamily: 'Playfair Display', fontSize: '2.5rem', margin: 0 }}>${room.price}</h1>
                            <span style={{ fontSize: '12px', opacity: 0.5, textTransform: 'uppercase', letterSpacing: '2px' }}>Per Night</span>
                        </div>
                        <button onClick={() => navigate(`/rooms/${room._id}`)} className="gold-btn" style={{ padding: '15px 40px', borderRadius: '50px', fontSize: '14px' }}>VIEW FULL DETAILS <FaArrowRight /></button>
                    </div>
                </div>
            </Motion.div>
        </Motion.div>
    );
};

// --- PAGINATION COMPONENT ---
const Pagination = ({ currentPage, totalPages, handlePageChange }) => (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', marginTop: '80px' }}>
        <button 
            disabled={currentPage === 1} 
            onClick={() => handlePageChange(currentPage - 1)}
            style={{ 
                width: '50px', height: '50px', borderRadius: '50%', 
                background: '#111114', border: '1px solid #333', 
                color: currentPage === 1 ? '#666' : '#fff', 
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.3s'
            }}
        >
            <FaChevronLeft />
        </button>
        
        <div style={{ display: 'flex', gap: '10px' }}>
            {[...Array(totalPages)].map((_, i) => (
                <button 
                    key={i} 
                    onClick={() => handlePageChange(i + 1)}
                    style={{ 
                        width: '50px', height: '50px', borderRadius: '50%', border: 'none', cursor: 'pointer',
                        background: currentPage === i + 1 ? 'var(--primary)' : '#111114',
                        color: currentPage === i + 1 ? '#000' : '#fff',
                        fontWeight: 'bold', fontSize: '16px', transition: '0.3s',
                        boxShadow: currentPage === i + 1 ? '0 0 15px rgba(212, 175, 55, 0.4)' : 'none'
                    }}
                >
                    {i + 1}
                </button>
            ))}
        </div>

        <button 
            disabled={currentPage === totalPages} 
            onClick={() => handlePageChange(currentPage + 1)}
            style={{ 
                width: '50px', height: '50px', borderRadius: '50%', background: '#111114', border: '1px solid #333', 
                color: currentPage === totalPages ? '#666' : '#fff', 
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.3s'
            }}
        >
            <FaChevronRight />
        </button>
    </div>
);

// --- COMPARISON DRAWER ---
const CompareDrawer = ({ compareList, removeCompare, clearCompare }) => (
    <Motion.div 
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        style={{ 
            position: 'fixed', bottom: 0, left: 0, width: '100%', 
            background: '#1a1a1d', borderTop: '2px solid var(--primary)', 
            padding: '20px', zIndex: 1000, boxShadow: '0 -10px 30px rgba(0,0,0,0.5)' 
        }}
    >
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '20px' }}>
                {compareList.map(item => (
                    <div key={item._id} style={{ display: 'flex', alignItems: 'center', gap: '15px', background: '#111114', padding: '10px 20px', borderRadius: '15px', border: '1px solid #333' }}>
                        <img src={item.images[0]} style={{ width: '50px', height: '50px', borderRadius: '10px', objectFit: 'cover' }} alt="thumb" onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/400x300"; }} />
                        <div>
                            <h4 style={{ margin: 0, fontSize: '14px' }}>{item.type}</h4>
                            <p style={{ margin: 0, fontSize: '12px', color: 'var(--primary)' }}>${item.price}</p>
                        </div>
                        <button onClick={() => removeCompare(item._id)} style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer' }}><FaTimes/></button>
                    </div>
                ))}
            </div>
            <div style={{ display: 'flex', gap: '15px' }}>
                <button onClick={clearCompare} style={{ background: 'transparent', border: '1px solid #fff', color: '#fff', padding: '10px 25px', borderRadius: '50px', cursor: 'pointer' }}>Clear</button>
                <button className="gold-btn" style={{ padding: '10px 30px', borderRadius: '50px' }}>Compare ({compareList.length})</button>
            </div>
        </div>
    </Motion.div>
);

// ==========================================
// 5. MAIN COMPONENT LOGIC
// ==========================================

const Rooms = () => {
    // --- STATE MANAGEMENT ---
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('grid');
    const [quickViewRoom, setQuickViewRoom] = useState(null);
    
    // Filters State
    const [searchTerm, setSearchTerm] = useState('');
    const [priceRange, setPriceRange] = useState([0, 6000]);
    const [selectedAmenities, setSelectedAmenities] = useState([]);
    const [selectedType, setSelectedType] = useState('All');
    const [sortBy, setSortBy] = useState('recommended');
    const [showFavorites, setShowFavorites] = useState(false);
    
    // Pagination & Mobile
    const [currentPage, setCurrentPage] = useState(1);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
    
    // Features
    const [compareList, setCompareList] = useState([]);
    const [favorites, setFavorites] = useState([]);
    
    const navigate = useNavigate();

    // --- EFFECTS ---
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 1024);
        window.addEventListener('resize', handleResize);
        
        const fetchRooms = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/rooms');
                setRooms(res.data || []);
            } catch (error) {
                console.warn("API Error", error);
                setRooms([]);
            } finally {
                setLoading(false);
            }
        };

        fetchRooms();
        
        // Load Wishlist from LocalStorage
        const savedFavs = JSON.parse(localStorage.getItem('luxury_favs')) || [];
        setFavorites(savedFavs);

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // --- MEMOIZED FILTER LOGIC (THE BRAIN) ---
    const processedRooms = useMemo(() => {
        let result = [...rooms];

        // 1. Search Filter
        if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            result = result.filter(r => 
                r.type.toLowerCase().includes(lower) || 
                r.description.toLowerCase().includes(lower)
            );
        }

        // 2. Type Filter
        if (selectedType !== 'All') {
            result = result.filter(r => r.type === selectedType);
        }

        // 3. Price Filter
        result = result.filter(r => r.price >= priceRange[0] && r.price <= priceRange[1]);

        // 4. Amenities Filter (Smart Intersection)
        if (selectedAmenities.length > 0) {
            result = result.filter(r => 
                selectedAmenities.every(a => r.amenities.includes(a))
            );
        }

        // 5. Favorites Toggle
        if (showFavorites) {
            result = result.filter(r => favorites.includes(r._id));
        }

        // 6. Sorting Engine
        switch (sortBy) {
            case 'price-low': result.sort((a, b) => a.price - b.price); break;
            case 'price-high': result.sort((a, b) => b.price - a.price); break;
            case 'rating': result.sort((a, b) => b.rating - a.rating); break;
            case 'reviews': result.sort((a, b) => b.reviews - a.reviews); break;
            case 'size': result.sort((a, b) => b.size - a.size); break;
            default: break; // Recommended
        }

        return result;
    }, [rooms, searchTerm, selectedType, priceRange, selectedAmenities, sortBy, showFavorites, favorites]);

    // --- PAGINATION LOGIC ---
    const totalPages = Math.ceil(processedRooms.length / ITEMS_PER_PAGE);
    const paginatedRooms = processedRooms.slice(
        (currentPage - 1) * ITEMS_PER_PAGE, 
        currentPage * ITEMS_PER_PAGE
    );

    // --- EVENT HANDLERS ---
    const toggleCompare = (e, room) => {
        e.stopPropagation();
        if (compareList.find(r => r._id === room._id)) {
            setCompareList(prev => prev.filter(r => r._id !== room._id));
            toast.info("Removed from comparison");
        } else {
            if (compareList.length >= 3) {
                toast.warning("Compare limit reached (Max 3)");
                return;
            }
            setCompareList(prev => [...prev, room]);
            toast.success("Added to comparison");
        }
    };

    const toggleFavorite = (e, id) => {
        e.stopPropagation();
        setFavorites(prev => {
            const newFavs = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id];
            localStorage.setItem('luxury_favs', JSON.stringify(newFavs));
            return newFavs;
        });
        toast.success(favorites.includes(id) ? "Removed from Wishlist" : "Added to Wishlist");
    };

    const toggleAmenity = (label) => {
        setSelectedAmenities(prev => (
            prev.includes(label) ? prev.filter(item => item !== label) : [...prev, label]
        ));
        setCurrentPage(1);
    };

    const handlePageChange = (p) => {
        if (p >= 1 && p <= totalPages) {
            setCurrentPage(p);
            window.scrollTo({ top: 400, behavior: 'smooth' });
        }
    };

    const resetFilters = () => {
        setSearchTerm('');
        setPriceRange([0, 6000]);
        setSelectedAmenities([]);
        setSelectedType('All');
        setSortBy('recommended');
        setShowFavorites(false);
        setCurrentPage(1);
        toast.info("Filters reset successfully");
    };

    // ==========================================
    // 6. RENDER (JSX)
    // ==========================================
    return (
        <div className="rooms-3d-page" style={styles.pageContainer}>
            
            {/* --- HERO HEADER --- */}
            <div className="rooms-3d-hero">
                <RoomsThreeScene />
                <div className="rooms-3d-grid"></div>
                <div className="rooms-3d-hero-overlay"></div>
                <Motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8 }} className="rooms-hero-copy">
                    <div className="rooms-hero-kicker"><FaCrown /> 3D Suite Collection</div>
                    <h1>The Collection</h1>
                    <p>Browse rooms like a private showroom: live filters, cinematic cards, floating suite geometry, and quick booking paths.</p>
                    <div className="rooms-hero-stats">
                        <span><strong>{rooms.length}</strong> rooms</span>
                        <span><strong>{processedRooms.length}</strong> matches</span>
                        <span><strong>{favorites.length}</strong> saved</span>
                    </div>
                </Motion.div>
            </div>

            {/* --- ADVANCED SEARCH BAR (Sticky) --- */}
            <div style={styles.searchBarContainer}>
                <div style={styles.searchCard}>
                    {/* ✅ FIXED: Search bar layout issue */}
                    <div style={{ flex: '1 1 300px', display: 'flex', alignItems: 'center', gap: '15px', borderRight: isMobile ? 'none' : '1px solid rgba(255,255,255,0.1)', paddingRight: '20px', marginBottom: isMobile ? '15px' : '0' }}>
                        <FaSearch color="var(--primary)" size={20} />
                        <input placeholder="Search for suites, amenities..." style={{ background: 'transparent', border: 'none', color: '#fff', width: '100%', fontSize: '16px', outline: 'none' }} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                    </div>
                    <div style={{ flex: '1 1 200px', display: 'flex', alignItems: 'center', gap: '15px', borderRight: isMobile ? 'none' : '1px solid rgba(255,255,255,0.1)', paddingRight: '20px', marginBottom: isMobile ? '15px' : '0' }}>
                        <FaCalendarAlt color="var(--primary)" size={20} />
                        <span style={{ color: '#fff', fontSize: '14px' }}>Check In - Check Out</span>
                    </div>
                    <div style={{ flex: '1 1 150px', display: 'flex', alignItems: 'center', gap: '15px', paddingRight: '20px', marginBottom: isMobile ? '15px' : '0' }}>
                        <FaUserFriends color="var(--primary)" size={20} />
                        {/* ✅ FIXED: Dropdown styling for dark mode */}
                        <select style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '16px', outline: 'none', cursor: 'pointer', width: '100%' }}>
                            <option style={{ background: '#1a1a1d', color: '#fff' }}>2 Guests</option>
                            <option style={{ background: '#1a1a1d', color: '#fff' }}>4 Guests</option>
                            <option style={{ background: '#1a1a1d', color: '#fff' }}>6+ Guests</option>
                        </select>
                    </div>
                    <button className="gold-btn" style={{ padding: '15px 40px', borderRadius: '50px', fontSize: '16px', width: isMobile ? '100%' : 'auto' }}>SEARCH</button>
                </div>
            </div>

            {/* --- MAIN CONTENT GRID --- */}
            <div style={styles.gridLayout(isMobile)}>
                
                {/* --- LEFT SIDEBAR FILTERS --- */}
                {!isMobile && (
                    <div className="rooms-filter-shell" style={{ position: 'sticky', top: '100px', height: 'fit-content' }}>
                        <div style={styles.glassCard}>
                            <div style={{ padding: '30px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                                    <h3 style={{ margin: 0, fontFamily: 'Playfair Display', fontSize: '1.5rem' }}>Filters</h3>
                                    <button onClick={resetFilters} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', textDecoration: 'underline', fontSize: '12px' }}>Reset All</button>
                                </div>

                                {/* Favorites Filter */}
                                <div 
                                    onClick={() => setShowFavorites(!showFavorites)}
                                    style={{ 
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                                        marginBottom: '30px', padding: '15px', borderRadius: '15px', 
                                        background: showFavorites ? 'rgba(255, 77, 77, 0.1)' : '#0a0a0b', 
                                        border: `1px solid ${showFavorites ? '#ff4d4d' : '#333'}`, cursor: 'pointer', transition: '0.3s'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: showFavorites ? '#ff4d4d' : '#fff' }}><FaHeart /> Wishlist Only</div>
                                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: showFavorites ? '#ff4d4d' : '#333' }}></div>
                                </div>

                                {/* Room Type Filter */}
                                <div style={{ marginBottom: '30px' }}>
                                    <h4 style={{ fontSize: '12px', textTransform: 'uppercase', opacity: 0.6, marginBottom: '15px', letterSpacing: '1px' }}>Category</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {ROOM_TYPES.map(type => (
                                            <label key={type} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', opacity: selectedType === type ? 1 : 0.6, transition: '0.3s' }}>
                                                <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: '2px solid var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    {selectedType === type && <div style={{ width: '10px', height: '10px', background: 'var(--primary)', borderRadius: '50%' }}></div>}
                                                </div>
                                                <input type="radio" name="roomType" checked={selectedType === type} onChange={() => { setSelectedType(type); setCurrentPage(1); }} style={{ display: 'none' }} /> 
                                                {type}
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Price Slider */}
                                <div style={{ marginBottom: '30px' }}>
                                    <h4 style={{ fontSize: '12px', textTransform: 'uppercase', opacity: 0.6, marginBottom: '15px', letterSpacing: '1px' }}>Price Range</h4>
                                    <input type="range" min="0" max="6000" step="100" value={priceRange[1]} onChange={(e) => setPriceRange([0, parseInt(e.target.value)])} style={{ width: '100%', accentColor: 'var(--primary)', cursor: 'pointer' }} />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontWeight: 'bold', fontSize: '14px' }}>
                                        <span>$0</span><span style={{ color: 'var(--primary)' }}>${priceRange[1]}</span>
                                    </div>
                                </div>

                                {/* Amenities */}
                                <div>
                                    <h4 style={{ fontSize: '12px', textTransform: 'uppercase', opacity: 0.6, marginBottom: '15px', letterSpacing: '1px' }}>Amenities</h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
                                        {AMENITY_OPTIONS.map(amenity => (
                                            <FilterCheckbox 
                                                key={amenity.id}
                                                label={amenity.label}
                                                icon={amenity.icon}
                                                checked={selectedAmenities.includes(amenity.label)}
                                                onChange={() => toggleAmenity(amenity.label)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- RIGHT SIDE RESULTS --- */}
                <div className="rooms-results-shell">
                    {/* Toolbar */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '20px' }}>
                        <div>
                            <h3 style={{ margin: 0, fontFamily: 'Playfair Display', fontSize: '2rem' }}>Exclusive Suites</h3>
                            <p style={{ opacity: 0.6, margin: '5px 0 0' }}>Showing <strong>{processedRooms.length}</strong> results</p>
                        </div>
                        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                            <div style={{ position: 'relative' }}>
                                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ padding: '12px 40px 12px 15px', background: '#111114', border: '1px solid #333', color: '#fff', borderRadius: '10px', outline: 'none', cursor: 'pointer', appearance: 'none' }}>
                                    {SORT_OPTIONS.map(opt => (
                                        <option key={opt.value} value={opt.value} style={{ background: '#111114' }}>{opt.label}</option>
                                    ))}
                                </select>
                                <FaSortAmountDown style={{ position: 'absolute', right: '15px', top: '14px', pointerEvents: 'none', opacity: 0.6 }} />
                            </div>
                            <button onClick={() => setView('grid')} style={{ padding: '12px', background: view === 'grid' ? 'var(--primary)' : '#111114', border: '1px solid #333', borderRadius: '10px', color: view === 'grid' ? '#000' : '#fff', cursor: 'pointer' }}><FaTh/></button>
                            <button onClick={() => setView('list')} style={{ padding: '12px', background: view === 'list' ? 'var(--primary)' : '#111114', border: '1px solid #333', borderRadius: '10px', color: view === 'list' ? '#000' : '#fff', cursor: 'pointer' }}><FaThList/></button>
                        </div>
                    </div>

                    {/* Room Grid / List */}
                    {loading ? (
                        <div style={{ display: 'grid', gridTemplateColumns: view === 'grid' ? 'repeat(auto-fill, minmax(320px, 1fr))' : '1fr', gap: '30px' }}>
                            {[1, 2, 3, 4, 5, 6].map(n => <RoomSkeleton key={n} />)}
                        </div>
                    ) : processedRooms.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '100px', background: '#111114', borderRadius: '30px', border: '1px solid #1f1f23' }}>
                            <FaInfoCircle size={60} style={{ opacity: 0.1, marginBottom: '20px' }} />
                            <h3>No matches found</h3>
                            <p style={{ opacity: 0.6 }}>Try adjusting your filters or search criteria.</p>
                            <button onClick={resetFilters} className="gold-btn" style={{ marginTop: '20px', padding: '15px 40px', borderRadius: '50px' }}>Clear Filters</button>
                        </div>
                    ) : (
                        <Motion.div layout className="rooms-card-grid-3d" style={{ display: 'grid', gridTemplateColumns: view === 'grid' ? 'repeat(auto-fill, minmax(320px, 1fr))' : '1fr', gap: '30px' }}>
                            <AnimatePresence mode="popLayout">
                                {paginatedRooms.map((room) => (
                                    <TiltCard 
                                        key={room._id} 
                                        onClick={() => setQuickViewRoom(room)}
                                        className="glass-card" 
                                        style={{ 
                                            background: '#111114', borderRadius: '25px', overflow: 'hidden', border: '1px solid #1f1f23',
                                            display: view === 'list' ? 'flex' : 'block', height: view === 'list' ? '280px' : 'auto',
                                            boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
                                        }}
                                    >
                                        {/* Image Section with Slider */}
                                        <div style={{ height: view === 'list' ? '100%' : '280px', width: view === 'list' ? '400px' : '100%', position: 'relative' }} className="slider-container">
                                            <CardImageSlider images={room.images} />
                                            
                                            {/* Action Buttons */}
                                            <div style={{ position: 'absolute', top: '15px', right: '15px', display: 'flex', gap: '10px' }}>
                                                <button onClick={(e) => toggleFavorite(e, room._id)} style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: 'none', color: favorites.includes(room._id) ? '#ff4d4d' : '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)', transition: '0.3s' }}>
                                                    {favorites.includes(room._id) ? <FaHeart /> : <FaRegHeart />}
                                                </button>
                                                <button onClick={(e) => toggleCompare(e, room)} style={{ width: '40px', height: '40px', borderRadius: '50%', background: compareList.find(r => r._id === room._id) ? 'var(--primary)' : 'rgba(0,0,0,0.6)', border: 'none', color: compareList.find(r => r._id === room._id) ? '#000' : '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)', transition: '0.3s' }}>
                                                    <FaExchangeAlt />
                                                </button>
                                            </div>

                                            {/* Status Badge */}
                                            <div style={{ position: 'absolute', bottom: '15px', left: '15px', background: 'rgba(0,0,0,0.8)', padding: '5px 15px', borderRadius: '20px', color: '#fff', fontSize: '11px', backdropFilter: 'blur(5px)', border: '1px solid rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>
                                                <span style={{ width: '6px', height: '6px', background: room.status === 'Available' ? '#28a745' : '#dc3545', borderRadius: '50%', display: 'inline-block', marginRight: '8px' }}></span>
                                                {room.status}
                                            </div>
                                        </div>

                                        {/* Content Section */}
                                        <div style={{ padding: '30px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                                <div>
                                                    <h3 style={{ margin: 0, fontFamily: 'Playfair Display', fontSize: '1.6rem', color: '#fff' }}>{room.type}</h3>
                                                    <div style={{ display: 'flex', gap: '5px', alignItems: 'center', fontSize: '12px', color: 'var(--primary)', marginTop: '8px' }}>
                                                        <FaBed size={11} /> Suite #{room.roomNumber}
                                                    </div>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <h2 style={{ margin: 0, color: 'var(--primary)', fontFamily: 'Playfair Display', fontSize: '1.8rem' }}>${room.price}</h2>
                                                    <span style={{ fontSize: '10px', opacity: 0.5, letterSpacing: '1px', textTransform: 'uppercase' }}>Per Night</span>
                                                </div>
                                            </div>

                                            <div style={{ width: '100%', height: '1px', background: '#1f1f23', margin: '20px 0' }}></div>

                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '25px' }}>
                                                {(room.amenities || []).slice(0, 5).map(amenity => (
                                                    <span key={amenity} style={{ padding: '6px 12px', background: 'rgba(212,175,55,0.08)', borderRadius: '20px', fontSize: '11px', color: 'var(--primary)', border: '1px solid rgba(212,175,55,0.15)' }}>{amenity}</span>
                                                ))}
                                                {(room.amenities || []).length > 5 && <span style={{ padding: '6px 12px', fontSize: '11px', opacity: 0.5 }}>+{room.amenities.length - 5} more</span>}
                                            </div>

                                            <div style={{ marginTop: 'auto', display: 'flex', gap: '15px' }}>
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); navigate(`/rooms/${room._id}`); }}
                                                    className="gold-btn" 
                                                    style={{ flex: 1, padding: '14px', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', borderRadius: '50px' }}
                                                >
                                                    BOOK NOW <FaArrowRight />
                                                </button>
                                            </div>
                                        </div>
                                    </TiltCard>
                                ))}
                            </AnimatePresence>
                        </Motion.div>
                    )}

                    {/* Pagination */}
                    <Pagination 
                        currentPage={currentPage} 
                        totalPages={totalPages} 
                        handlePageChange={handlePageChange} 
                    />
                </div>
            </div>

            {/* --- COMPARISON DRAWER --- */}
            <AnimatePresence>
                {compareList.length > 0 && (
                    <CompareDrawer 
                        compareList={compareList} 
                        removeCompare={(id) => setCompareList(prev => prev.filter(r => r._id !== id))}
                        clearCompare={() => setCompareList([])}
                    />
                )}
            </AnimatePresence>

            {/* --- MODAL INJECTION --- */}
            <AnimatePresence>
                {quickViewRoom && <QuickViewModal room={quickViewRoom} onClose={() => setQuickViewRoom(null)} navigate={navigate} />}
            </AnimatePresence>

            {/* --- NEWSLETTER SECTION --- */}
            <section style={{ padding: '100px 5%', background: 'linear-gradient(to right, #111114, #0a0a0b)', borderTop: '1px solid #1f1f23', textAlign: 'center' }}>
                <FaEnvelope size={40} color="var(--primary)" style={{ marginBottom: '20px' }} />
                <h2 style={{ fontFamily: 'Playfair Display', fontSize: '3rem', margin: '0 0 20px 0' }}>Join the Inner Circle</h2>
                <p style={{ opacity: 0.6, maxWidth: '600px', margin: '0 auto 40px auto' }}>Unlock secret offers, early access to new suites, and curated travel guides delivered to your inbox.</p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
                    <input type="email" placeholder="Your Email Address" style={{ padding: '15px 30px', borderRadius: '50px', border: '1px solid #333', background: '#000', color: '#fff', width: '350px', outline: 'none' }} />
                    <button className="gold-btn" style={{ padding: '15px 40px', borderRadius: '50px' }}>SUBSCRIBE</button>
                </div>
            </section>

            <style>{`
                .rooms-3d-page {
                    background:
                        radial-gradient(circle at 80% 8%, rgba(212,175,55,0.18), transparent 31%),
                        radial-gradient(circle at 18% 28%, rgba(56,216,255,0.1), transparent 28%),
                        #050506 !important;
                }

                .rooms-3d-hero {
                    min-height: 82vh;
                    position: relative;
                    display: flex;
                    align-items: center;
                    padding: 110px 7% 130px;
                    overflow: hidden;
                    isolation: isolate;
                    background: linear-gradient(115deg, rgba(5,5,6,0.98), rgba(5,5,6,0.62) 45%, rgba(212,175,55,0.13));
                }

                .rooms-3d-canvas {
                    position: absolute;
                    inset: 0;
                    z-index: -3;
                }

                .rooms-3d-canvas canvas {
                    display: block;
                    width: 100%;
                    height: 100%;
                }

                .rooms-3d-grid {
                    position: absolute;
                    inset: 0;
                    z-index: -2;
                    background-image:
                        linear-gradient(rgba(255,255,255,0.07) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255,255,255,0.07) 1px, transparent 1px);
                    background-size: 70px 70px;
                    mask-image: linear-gradient(90deg, #000 0%, transparent 82%);
                    opacity: 0.42;
                }

                .rooms-3d-hero-overlay {
                    position: absolute;
                    inset: 0;
                    z-index: -1;
                    background:
                        radial-gradient(circle at 67% 50%, rgba(212,175,55,0.12), transparent 28%),
                        linear-gradient(90deg, rgba(0,0,0,0.88), rgba(0,0,0,0.48) 58%, rgba(0,0,0,0.22));
                }

                .rooms-hero-copy {
                    width: min(760px, 100%);
                    position: relative;
                    z-index: 2;
                }

                .rooms-hero-kicker {
                    display: inline-flex;
                    align-items: center;
                    gap: 12px;
                    color: var(--primary);
                    font-size: 12px;
                    font-weight: 900;
                    letter-spacing: 3px;
                    text-transform: uppercase;
                }

                .rooms-hero-copy h1 {
                    font-family: 'Playfair Display', serif;
                    font-size: clamp(4rem, 10vw, 9rem);
                    line-height: 0.9;
                    color: #fff;
                    margin: 18px 0 22px;
                    letter-spacing: 0;
                }

                .rooms-hero-copy p {
                    max-width: 650px;
                    color: rgba(255,255,255,0.72);
                    font-size: clamp(1rem, 1.7vw, 1.24rem);
                    line-height: 1.75;
                }

                .rooms-hero-stats {
                    display: flex;
                    gap: 14px;
                    flex-wrap: wrap;
                    margin-top: 34px;
                }

                .rooms-hero-stats span {
                    min-width: 132px;
                    padding: 16px 18px;
                    border: 1px solid rgba(255,255,255,0.14);
                    background: rgba(255,255,255,0.06);
                    backdrop-filter: blur(14px);
                    color: rgba(255,255,255,0.66);
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    font-size: 12px;
                }

                .rooms-hero-stats strong {
                    display: block;
                    color: #fff;
                    font-family: 'Playfair Display', serif;
                    font-size: 2.15rem;
                    line-height: 1;
                    margin-bottom: 6px;
                }

                .rooms-3d-page .gold-btn {
                    box-shadow: 0 18px 44px rgba(212,175,55,0.14);
                }

                .rooms-3d-page .glass-card {
                    transform-style: preserve-3d;
                    position: relative;
                }

                .rooms-3d-page .glass-card::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    z-index: 1;
                    pointer-events: none;
                    background: linear-gradient(135deg, rgba(255,255,255,0.12), transparent 32%, rgba(212,175,55,0.08));
                    opacity: 0;
                    transition: opacity 0.25s ease;
                }

                .rooms-3d-page .glass-card:hover::before {
                    opacity: 1;
                }

                .rooms-card-grid-3d {
                    perspective: 1200px;
                    padding-left: 18px;
                }

                .rooms-results-shell {
                    min-width: 0;
                    position: relative;
                    z-index: 1;
                    padding-left: 10px;
                }

                .rooms-filter-shell {
                    z-index: 3;
                    width: 100%;
                }

                .rooms-card-grid-3d .glass-card {
                    border-color: rgba(255,255,255,0.1) !important;
                    box-shadow: 0 32px 70px rgba(0,0,0,0.34), inset 0 1px 0 rgba(255,255,255,0.05) !important;
                    transition: border-color 0.25s ease, box-shadow 0.25s ease;
                }

                .rooms-card-grid-3d .glass-card:hover {
                    border-color: rgba(212,175,55,0.42) !important;
                    box-shadow: 0 44px 92px rgba(0,0,0,0.5), 0 0 44px rgba(212,175,55,0.08) !important;
                }

                .rooms-card-grid-3d .glass-card > div:last-child {
                    transform: translateZ(24px);
                    position: relative;
                    z-index: 2;
                }

                .rooms-card-grid-3d .slider-container {
                    transform: translateZ(34px);
                }

                .rooms-filter-shell > div {
                    transform-style: preserve-3d;
                    background:
                        linear-gradient(145deg, rgba(255,255,255,0.08), transparent 38%),
                        #101013 !important;
                    box-shadow: 0 34px 80px rgba(0,0,0,0.38), 18px 18px 0 rgba(212,175,55,0.06) !important;
                }

                .rooms-filter-shell label,
                .rooms-filter-shell input,
                .rooms-filter-shell button,
                .rooms-filter-shell h3,
                .rooms-filter-shell h4 {
                    transform: translateZ(18px);
                }

                .rooms-3d-page input[type="range"] {
                    filter: drop-shadow(0 0 10px rgba(212,175,55,0.2));
                }

                @media (max-width: 1024px) {
                    .rooms-3d-hero {
                        min-height: 74vh;
                        padding-left: 28px;
                        padding-right: 28px;
                    }

                    .rooms-3d-canvas {
                        opacity: 0.48;
                    }

                    .rooms-results-shell,
                    .rooms-card-grid-3d {
                        padding-left: 0;
                    }
                }

                @media (max-width: 700px) {
                    .rooms-3d-hero {
                        min-height: 82vh;
                        padding: 90px 20px 110px;
                    }

                    .rooms-hero-copy h1 {
                        font-size: clamp(3.5rem, 18vw, 5rem);
                    }

                    .rooms-hero-stats span {
                        flex: 1 1 130px;
                    }

                    .rooms-3d-page section div[style*="justify-content: center"] {
                        flex-direction: column;
                        align-items: stretch;
                    }

                    .rooms-3d-page section input[type="email"] {
                        width: 100% !important;
                    }
                }
            `}</style>

        </div>
    );
};

export default Rooms;
