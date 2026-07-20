import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import { 
    FaCamera, FaTimes, FaChevronLeft, FaChevronRight, 
    FaExpand, FaFilter, FaInbox
} from 'react-icons/fa';

// --- CATEGORIES ---
const CATEGORIES = ["All", "Suites", "Dining", "Wellness", "Events", "Exterior"];

// --- 🎬 FRAMER MOTION ENGINE VARIANTS ---
const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const imageVariant = {
    hidden: { opacity: 0, scale: 0.9, y: 30 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
};

// --- 🛠️ INTERACTIVE SUB-COMPONENTS ---

const Lightbox = ({ image, onClose, onNext, onPrev }) => {
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowRight') onNext();
            if (e.key === 'ArrowLeft') onPrev();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose, onNext, onPrev]);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(5,5,8,0.98)', zIndex: 100000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(20px)' }}>
            <button onClick={onClose} style={{ position: 'absolute', top: '30px', right: '30px', background: 'none', border: 'none', color: '#fff', fontSize: '30px', cursor: 'pointer', zIndex: 100001 }}><FaTimes /></button>
            <button onClick={onPrev} style={{ position: 'absolute', left: '30px', background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)', color: '#d4af37', fontSize: '24px', cursor: 'pointer', padding: '15px', borderRadius: '50%', transition: '0.3s', zIndex: 100001 }}><FaChevronLeft /></button>
            <button onClick={onNext} style={{ position: 'absolute', right: '30px', background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)', color: '#d4af37', fontSize: '24px', cursor: 'pointer', padding: '15px', borderRadius: '50%', transition: '0.3s', zIndex: 100001 }}><FaChevronRight /></button>
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} style={{ width: '80%', maxHeight: '85%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <img src={image.url} alt={image.caption} style={{ maxHeight: '70vh', maxWidth: '100%', objectFit: 'contain', borderRadius: '12px', boxShadow: '0 30px 100px rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)' }} onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/400x300"; }} />
                <div style={{ textAlign: 'center', marginTop: '25px', color: '#fff' }}>
                    <h2 style={{ fontFamily: 'Playfair Display', fontSize: '2.5rem', marginBottom: '10px', color: '#d4af37' }}>{image.caption}</h2>
                    <span style={{ fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', border: '1px solid #d4af37', padding: '6px 20px', borderRadius: '20px', color: '#d4af37', display: 'inline-block' }}>{image.category}</span>
                </div>
            </motion.div>
        </motion.div>
    );
};

const GalleryCard = ({ item, onClick }) => {
    const cardRef = useRef(null);

    // High performance real-time 3D isometric tilt handling
    const handleMouseMove = (e) => {
        if (!cardRef.current) return;
        const el = cardRef.current;
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const xc = rect.width / 2;
        const yc = rect.height / 2;
        const tiltX = (yc - y) / 10; // X axis rotation adjustment
        const tiltY = (x - xc) / 10; // Y axis rotation adjustment

        el.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.03, 1.03, 1.03)`;
    };

    const handleMouseLeave = () => {
        if (!cardRef.current) return;
        cardRef.current.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
    };

    return (
        <motion.div 
            layout 
            variants={imageVariant}
            style={{ perspective: '1000px', transformStyle: 'preserve-3d' }}
        >
            <div
                ref={cardRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                onClick={() => onClick(item)}
                className="gallery-card-3d"
                style={{ 
                    position: 'relative', 
                    borderRadius: '16px', 
                    overflow: 'hidden', 
                    cursor: 'pointer', 
                    height: '380px', 
                    boxShadow: '0 20px 40px rgba(0,0,0,0.4)', 
                    backgroundColor: '#141416',
                    border: '1px solid rgba(255,255,255,0.04)',
                    transformStyle: 'preserve-3d',
                    transition: 'transform 0.1s ease-out, box-shadow 0.3s ease'
                }}
            >
                {/* 3D Depth Image Layer */}
                <img 
                    src={item.url} 
                    alt={item.caption} 
                    onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/400x300"; }}
                    style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover', 
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        zIndex: 1,
                        transform: 'translateZ(10px)',
                        transition: 'transform 0.4s ease'
                    }} 
                    className="inner-3d-img"
                />
                
                {/* 3D Overlay Layer pops out closer to view */}
                <div 
                    className="gallery-overlay-3d" 
                    style={{ 
                        position: 'absolute', 
                        top: 0, 
                        left: 0, 
                        width: '100%', 
                        height: '100%', 
                        background: 'linear-gradient(to top, rgba(10,10,14,0.95) 0%, rgba(10,10,14,0.4) 50%, transparent 100%)', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        justifyContent: 'flex-end', 
                        padding: '30px', 
                        opacity: 0, 
                        zIndex: 2,
                        transform: 'translateZ(40px)',
                        transformStyle: 'preserve-3d',
                        transition: 'opacity 0.3s ease'
                    }}
                >
                    <div style={{ transform: 'translateZ(30px)' }}>
                        <span style={{ color: '#d4af37', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '3px', fontWeight: 'bold', display: 'inline-block', marginBottom: '8px' }}>{item.category}</span>
                        <h3 style={{ color: '#fff', fontFamily: 'Playfair Display', margin: '0 0 12px 0', fontSize: '1.6rem', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>{item.caption}</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.7)', fontSize: '12px', letterSpacing: '1px' }}><FaExpand size={11} color="#d4af37" /> CLICK TO EXPAND</div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

// --- 🚀 MAIN IMMERSIVE GALLERY COMPONENT ---
const Gallery = () => {
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [galleryData, setGalleryData] = useState([]);
    const [filteredImages, setFilteredImages] = useState([]);
    const [lightboxImage, setLightboxImage] = useState(null);

    const webglContainerRef = useRef(null);
    const filterDockRef = useRef(null);

    // 1. DATA SYNCHRONIZATION FIELD EFFECT
    useEffect(() => {
        const savedGallery = JSON.parse(localStorage.getItem('site_gallery')) || [];
        setGalleryData(savedGallery);
        setFilteredImages(savedGallery);
    }, []);

    useEffect(() => {
        if (selectedCategory === "All") {
            setFilteredImages(galleryData);
        } else {
            setFilteredImages(galleryData.filter(img => img.category === selectedCategory));
        }
    }, [selectedCategory, galleryData]);

    // 2. THREE.JS PIPELINE ENGINE BACKGROUND IMMERSION
    useEffect(() => {
        if (!webglContainerRef.current) return;

        const scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x0a0a0f, 0.05);

        const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 100);
        camera.position.z = 8;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        webglContainerRef.current.appendChild(renderer.domElement);

        // Core 3D Geometry: Floating Geometric Cluster Array
        const clusterGroup = new THREE.Group();
        scene.add(clusterGroup);

        const ringGeo = new THREE.TorusGeometry(2, 0.02, 16, 100);
        const goldWireMat = new THREE.MeshStandardMaterial({
            color: 0xd4af37,
            wireframe: true,
            roughness: 0.2,
            metalness: 0.9
        });

        const decorativeRing = new THREE.Mesh(ringGeo, goldWireMat);
        decorativeRing.position.set(0, 0, -2);
        clusterGroup.add(decorativeRing);

        // Grid Sparkle Starfield Vector Setup
        const particleCount = 700;
        const positions = new Float32Array(particleCount * 3);
        for (let i = 0; i < particleCount * 3; i++) {
            positions[i] = (Math.random() - 0.5) * 25;
        }

        const particleGeo = new THREE.BufferGeometry();
        particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const particleMat = new THREE.PointsMaterial({
            size: 0.035,
            color: 0xd4af37,
            transparent: true,
            opacity: 0.4
        });
        const starField = new THREE.Points(particleGeo, particleMat);
        scene.add(starField);

        // Ambient Volumetric Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        scene.add(ambientLight);

        const spotLight = new THREE.PointLight(0xd4af37, 2, 30);
        spotLight.position.set(5, 5, 5);
        scene.add(spotLight);

        // Interactivity Track
        let targetX = 0, targetY = 0;
        let currentX = 0, currentY = 0;

        const onGlobalMouseMove = (e) => {
            targetX = (e.clientX / window.innerWidth) - 0.5;
            targetY = (e.clientY / window.innerHeight) - 0.5;

            // Optional structural tilt calculation for the category filter dock
            if (filterDockRef.current) {
                const dockX = targetX * 12;
                const dockY = -targetY * 12;
                filterDockRef.current.style.transform = `perspective(1000px) rotateX(${dockY}deg) rotateY(${dockX}deg)`;
            }
        };
        window.addEventListener('mousemove', onGlobalMouseMove);

        // Core Rendering Loop
        const clock = new THREE.Clock();
        let animationFrameId;

        const updateFrame = () => {
            const elapsed = clock.getElapsedTime();

            // Smooth interpolation lerping curves
            currentX += (targetX - currentX) * 0.05;
            currentY += (targetY - currentY) * 0.05;

            // Animate backgrounds structures
            clusterGroup.rotation.y = elapsed * 0.08;
            decorativeRing.rotation.x = elapsed * 0.05;
            starField.rotation.y = -elapsed * 0.012;
            starField.position.y = Math.sin(elapsed * 0.2) * 0.5;

            // Camera reacts directly to global cursor layout positions
            camera.position.x += (currentX * 3 - camera.position.x) * 0.05;
            camera.position.y += (-currentY * 3 - camera.position.y) * 0.05;
            camera.lookAt(0, 0, 0);

            renderer.render(scene, camera);
            animationFrameId = requestAnimationFrame(updateFrame);
        };
        updateFrame();

        // Screen Adjuster
        const onResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', onResize);

        // Pure Execution Cleanup Layer
        return () => {
            window.removeEventListener('mousemove', onGlobalMouseMove);
            window.removeEventListener('resize', onResize);
            cancelAnimationFrame(animationFrameId);
            if (webglContainerRef.current && renderer.domElement) {
                webglContainerRef.current.removeChild(renderer.domElement);
            }
        };
    }, []);

    const handleNext = () => {
        if (!lightboxImage) return;
        const currentIndex = filteredImages.findIndex(img => img.id === lightboxImage.id);
        const nextIndex = (currentIndex + 1) % filteredImages.length;
        setLightboxImage(filteredImages[nextIndex]);
    };

    const handlePrev = () => {
        if (!lightboxImage) return;
        const currentIndex = filteredImages.findIndex(img => img.id === lightboxImage.id);
        const prevIndex = (currentIndex - 1 + filteredImages.length) % filteredImages.length;
        setLightboxImage(filteredImages[prevIndex]);
    };

    return (
        <div className="luxury-bg-mesh" style={{ backgroundColor: '#060608', color: '#f0f0f5', minHeight: '100vh', paddingBottom: '120px', position: 'relative', overflowX: 'hidden' }}>
            
            {/* Aurora Ambient Layers */}
            <div style={{ position: 'fixed', top: '-20%', left: '10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(212,175,55,0.04) 0%, transparent 70%)', borderRadius: '50%', animation: 'aurora 20s linear infinite', pointerEvents: 'none', zIndex: 0 }} />
            <div style={{ position: 'fixed', bottom: '-5%', right: '5%', width: '450px', height: '450px', background: 'radial-gradient(circle, rgba(78,188,255,0.03) 0%, transparent 60%)', borderRadius: '50%', animation: 'floatDrift 15s ease-in-out infinite', pointerEvents: 'none', zIndex: 0 }} />
            
            {/* 3D ENGINE TARGET OUTPUT CANVAS */}
            <div ref={webglContainerRef} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }} />

            {/* HERO PARALLAX HEADER BACKGROUND */}
            <div style={{ height: '55vh', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundImage: 'url("https://images.unsplash.com/photo-1522771753035-4a50423a5a63?w=1600")', backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed', zIndex: 1 }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(to bottom, rgba(6,6,8,0.3) 0%, #060608 100%)' }}></div>
                <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8 }} style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '20px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '8px 22px', borderRadius: '50px', background: 'rgba(212,175,55,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(212,175,55,0.2)', marginBottom: '20px' }}><FaCamera color="#d4af37" size={13} /><span style={{ color: '#d4af37', fontSize: '11px', letterSpacing: '3px', fontWeight: '800' }}>VISUAL HUB</span></div>
                    <h1 style={{ fontSize: '4.5rem', fontFamily: 'Playfair Display', color: '#fff', margin: '0', textShadow: '0 15px 40px rgba(0,0,0,0.6)' }}>Our <span style={{ color: '#d4af37', fontStyle: 'italic' }}>Gallery</span></h1>
                </motion.div>
            </div>

            <motion.div initial="hidden" animate="visible" variants={staggerContainer} style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 5%', position: 'relative', zIndex: 2 }}>
                
                {/* 3D FLOATING FILTER TABS CONTROL DECK */}
                <div 
                    ref={filterDockRef}
                    style={{ 
                        marginTop: '-40px', 
                        background: 'rgba(18, 18, 24, 0.75)', 
                        padding: '16px 30px', 
                        borderRadius: '50px', 
                        boxShadow: '0 30px 60px rgba(0,0,0,0.4)', 
                        border: '1px solid rgba(255,255,255,0.06)', 
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        display: 'flex', 
                        justifyContent: 'center', 
                        flexWrap: 'wrap', 
                        gap: '8px',
                        transformStyle: 'preserve-3d',
                        transition: 'transform 0.1s ease-out'
                    }}
                >
                    {CATEGORIES.map(cat => (
                        <button 
                            key={cat} 
                            onClick={() => setSelectedCategory(cat)} 
                            style={{ 
                                padding: '10px 24px', 
                                borderRadius: '50px', 
                                border: 'none', 
                                cursor: 'pointer', 
                                background: selectedCategory === cat ? '#d4af37' : 'transparent', 
                                color: selectedCategory === cat ? '#0a0a0f' : '#b5b5c0', 
                                fontWeight: '700', 
                                fontSize: '13px',
                                letterSpacing: '1px',
                                transition: '0.3s cubic-bezier(0.25, 1, 0.5, 1)', 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '8px',
                                transform: 'translateZ(15px)',
                                boxShadow: selectedCategory === cat ? '0 10px 20px rgba(212,175,55,0.25)' : 'none'
                            }}
                        >
                            {cat === selectedCategory && <FaFilter size={9} />}{cat}
                        </button>
                    ))}
                </div>

                {/* 3D PERSPECTIVE MASONRY GRID */}
                <motion.div 
                    layout 
                    variants={staggerContainer} 
                    initial="hidden" 
                    animate="visible" 
                    style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(365px, 1fr))', gap: '35px', marginTop: '70px' }}
                >
                    <AnimatePresence mode="popLayout">
                        {filteredImages.map(item => (
                            <GalleryCard key={item.id} item={item} onClick={setLightboxImage} />
                        ))}
                    </AnimatePresence>
                </motion.div>

                {/* ADVANCED EMPTY FALLBACK STATE */}
                {filteredImages.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '140px 0', color: 'rgba(255,255,255,0.3)' }}>
                        <FaInbox size={45} style={{ marginBottom: '20px', color: '#d4af37' }} />
                        <h3 style={{ fontFamily: 'Playfair Display', fontSize: '1.8rem', color: '#fff', marginBottom: '8px' }}>Matrix Vault Empty</h3>
                        <p style={{ fontSize: '14px' }}>Images deployed inside the admin controller dashboard sync live here.</p>
                    </div>
                )}
            </motion.div>

            {/* FULL SCREEN DOCK LIGHTBOX EXECUTIONS */}
            <AnimatePresence>
                {lightboxImage && (
                    <Lightbox image={lightboxImage} onClose={() => setLightboxImage(null)} onNext={handleNext} onPrev={handlePrev} />
                )}
            </AnimatePresence>

            {/* GLOBAL DESCRIPTOR INLINE CSS TRACERS */}
            <style>{`
                .gallery-card-3d:hover .gallery-overlay-3d { opacity: 1 !important; }
                .gallery-card-3d:hover .inner-3d-img { transform: translateZ(25px) scale(1.08) !important; }
                .gallery-card-3d:hover { box-shadow: 0 40px 80px rgba(212,175,55,0.12) !important; border-color: rgba(212,175,55,0.25) !important;}
            `}</style>
        </div>
    );
};

export default Gallery;