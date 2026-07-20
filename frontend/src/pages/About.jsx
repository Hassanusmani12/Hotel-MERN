import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import axios from 'axios';

const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
};

const stagger = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.15 } },
};

const About = () => {
    const mountRef = useRef(null);
    const contentRef = useRef(null);
    const statsRef = useRef(null);
    const [roomCount, setRoomCount] = useState(null);
    const [guestCount, setGuestCount] = useState(null);
    const [avgRating, setAvgRating] = useState(null);

    useEffect(() => {
        axios.get('http://localhost:5000/api/rooms')
            .then(res => {
                setRoomCount(res.data.length);
            })
            .catch(() => setRoomCount('No data'));
        axios.get('http://localhost:5000/api/bookings')
            .then(res => {
                const uniqueGuests = new Set(res.data.map(b => b.user?._id).filter(Boolean));
                setGuestCount(uniqueGuests.size);
            })
            .catch(() => setGuestCount('No data'));
        setAvgRating('No data');
    }, []);

    useEffect(() => {
        const scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x0a0a0a, 0.04);

        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 15;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        
        if (mountRef.current) mountRef.current.appendChild(renderer.domElement);

        const crystalsGroup = new THREE.Group();
        scene.add(crystalsGroup);

        const crystalGeo = new THREE.IcosahedronGeometry(1, 0);
        const crystalMat = new THREE.MeshStandardMaterial({
            color: 0xd4af37, wireframe: true, roughness: 0.1, metalness: 1
        });

        for (let i = 0; i < 30; i++) {
            const crystal = new THREE.Mesh(crystalGeo, crystalMat);
            crystal.position.set(
                (Math.random() - 0.5) * 40, (Math.random() - 0.5) * 40, (Math.random() - 0.5) * 20 - 5
            );
            crystal.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
            const scale = Math.random() * 1.5 + 0.5;
            crystal.scale.set(scale, scale, scale);
            crystalsGroup.add(crystal);
        }

        const particlesGeo = new THREE.BufferGeometry();
        const particlesCount = 1000;
        const posArray = new Float32Array(particlesCount * 3);
        for(let i = 0; i < particlesCount * 3; i++) posArray[i] = (Math.random() - 0.5) * 50;
        particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
        const particlesMat = new THREE.PointsMaterial({ size: 0.05, color: 0xd4af37, transparent: true, opacity: 0.6 });
        const particleMesh = new THREE.Points(particlesGeo, particlesMat);
        scene.add(particleMesh);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);
        const goldLight = new THREE.PointLight(0xd4af37, 2, 50);
        goldLight.position.set(5, 5, 5);
        scene.add(goldLight);

        let mouseX = 0;
        let mouseY = 0;
        const clock = new THREE.Clock();

        const handleMouseMove = (event) => {
            mouseX = (event.clientX / window.innerWidth) - 0.5;
            mouseY = (event.clientY / window.innerHeight) - 0.5;
            if (contentRef.current && statsRef.current) {
                const tiltX = mouseY * -15;
                const tiltY = mouseX * 15;
                contentRef.current.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-10px)`;
                statsRef.current.style.transform = `perspective(1000px) rotateX(${tiltX * 1.5}deg) rotateY(${tiltY * 1.5}deg) translateY(10px)`;
            }
        };

        window.addEventListener('mousemove', handleMouseMove);

        const animate = () => {
            const elapsedTime = clock.getElapsedTime();
            crystalsGroup.rotation.y = elapsedTime * 0.05;
            crystalsGroup.rotation.x = elapsedTime * 0.02;
            particleMesh.rotation.y = elapsedTime * 0.02;
            camera.position.x += (mouseX * 5 - camera.position.x) * 0.05;
            camera.position.y += (-mouseY * 5 - camera.position.y) * 0.05;
            camera.lookAt(scene.position);
            renderer.render(scene, camera);
            requestAnimationFrame(animate);
        };
        animate();

        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('resize', handleResize);
            if (mountRef.current) mountRef.current.removeChild(renderer.domElement);
            renderer.dispose();
            scene.traverse((obj) => {
                if (obj.geometry) obj.geometry.dispose();
                if (obj.material) {
                    if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
                    else obj.material.dispose();
                }
            });
        };
    }, []);

    return (
        <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            style={{
                position: 'relative', width: '100%', minHeight: '100vh', overflow: 'hidden',
                backgroundColor: '#0a0a0a', color: 'white',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', padding: '100px 20px',
            }}
        >
            <div style={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none'
            }} ref={mountRef} />

            <motion.div
                ref={contentRef}
                variants={fadeUp}
                style={{
                    position: 'relative', zIndex: 1, maxWidth: '1000px', width: '100%',
                    background: 'rgba(20, 20, 20, 0.5)',
                    backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
                    border: '1px solid rgba(212, 175, 55, 0.2)',
                    borderRadius: '24px', padding: '50px',
                    boxShadow: '0 30px 80px rgba(0,0,0,0.5), 0 0 40px rgba(212,175,55,0.03)',
                    transformStyle: 'preserve-3d', transition: 'transform 0.1s ease-out',
                    marginBottom: '40px',
                }}
            >
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '40px' }}>
                    <motion.div style={{ flex: '1 1 300px', transformStyle: 'preserve-3d' }}
                        whileHover={{ scale: 1.02 }}
                    >
                        <img
                            src="https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=800"
                            alt="Luxury Lobby"
                            onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/400x300"; }}
                            style={{
                                width: '100%', borderRadius: '16px',
                                border: '1px solid rgba(212, 175, 55, 0.3)',
                                boxShadow: '0 20px 40px rgba(212, 175, 55, 0.15)',
                                transform: 'translateZ(60px)',
                                transition: 'transform 0.3s ease',
                            }}
                        />
                    </motion.div>
                    <motion.div style={{ flex: '1 1 300px', transform: 'translateZ(40px)' }}>
                        <div className="section-eyebrow" style={{ marginBottom: '16px' }}>Our Story</div>
                        <h1 style={{ color: '#d4af37', fontFamily: 'Playfair Display', fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', margin: '0 0 20px 0', textShadow: '0 10px 20px rgba(0,0,0,0.5)' }}>
                            About LuxuryStay
                        </h1>
                        <div style={{ width: '60px', height: '2px', background: 'var(--gold-gradient)', marginBottom: '20px' }} />
                        <p style={{ lineHeight: '1.8', color: '#eaeaea', fontSize: '1.05rem' }}>
                            Established in 2020, LuxuryStay has been the definition of comfort and elegance in Pakistan. 
                            We started with a small guesthouse and have now grown into a 5-star experience.
                        </p>
                        <p style={{ lineHeight: '1.8', color: '#eaeaea', marginTop: '15px', fontSize: '1.05rem' }}>
                            Our mission is to provide every guest with a royal experience, blending traditional hospitality with modern luxury.
                        </p>
                    </motion.div>
                </div>
            </motion.div>

            <motion.div
                ref={statsRef}
                variants={fadeUp}
                style={{
                    display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '20px',
                    background: 'linear-gradient(135deg, rgba(30,30,30,0.8), rgba(10,10,10,0.9))',
                    padding: '40px', borderRadius: '20px',
                    border: '1px solid rgba(212, 175, 55, 0.3)',
                    boxShadow: '0 30px 60px rgba(0,0,0,0.6)',
                    transformStyle: 'preserve-3d', transition: 'transform 0.1s ease-out',
                    zIndex: 1, maxWidth: '900px', width: '100%',
                    backdropFilter: 'blur(12px)',
                }}
            >
                <div style={{ textAlign: 'center', transform: 'translateZ(50px)' }}>
                    <motion.h2
                        animate={{ textShadow: ['0 0 10px rgba(212,175,55,0.3)', '0 0 30px rgba(212,175,55,0.6)', '0 0 10px rgba(212,175,55,0.3)'] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        style={{ color: '#d4af37', fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', margin: 0 }}
                    >
                        {roomCount || '--'}
                    </motion.h2>
                    <p style={{ color: '#bbb', letterSpacing: '2px', textTransform: 'uppercase', fontSize: '0.85rem', marginTop: '10px' }}>Luxury Rooms</p>
                </div>
                <div style={{ textAlign: 'center', transform: 'translateZ(50px)' }}>
                    <motion.h2
                        animate={{ textShadow: ['0 0 10px rgba(212,175,55,0.3)', '0 0 30px rgba(212,175,55,0.6)', '0 0 10px rgba(212,175,55,0.3)'] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        style={{ color: '#d4af37', fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', margin: 0 }}
                    >
                        {guestCount || '--'}
                    </motion.h2>
                    <p style={{ color: '#bbb', letterSpacing: '2px', textTransform: 'uppercase', fontSize: '0.85rem', marginTop: '10px' }}>Happy Guests</p>
                </div>
                <div style={{ textAlign: 'center', transform: 'translateZ(50px)' }}>
                    <motion.h2
                        animate={{ textShadow: ['0 0 10px rgba(212,175,55,0.3)', '0 0 30px rgba(212,175,55,0.6)', '0 0 10px rgba(212,175,55,0.3)'] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        style={{ color: '#d4af37', fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', margin: 0 }}
                    >
                        {avgRating || '--'}
                    </motion.h2>
                    <p style={{ color: '#bbb', letterSpacing: '2px', textTransform: 'uppercase', fontSize: '0.85rem', marginTop: '10px' }}>Rating</p>
                </div>
            </motion.div>

            <div style={{ height: '1px', width: '80%', maxWidth: '600px', background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.3), transparent)', margin: '40px auto 0', zIndex: 1 }} />
        </motion.div>
    );
};

export default About;
