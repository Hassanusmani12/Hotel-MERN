import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion as Motion, useScroll, useTransform } from 'framer-motion';
import * as THREE from 'three';
import {
    FaArrowRight,
    FaAward,
    FaCheckCircle,
    FaCocktail,
    FaCrown,
    FaEnvelope,
    FaMapMarkerAlt,
    FaPlay,
    FaWifi,
} from 'react-icons/fa';
import axios from 'axios';
import API_BASE_URL from '../config';

const WHY_STAYS = [
    {
        number: '01',
        title: 'Fast. Elegant. Personal.',
        text: 'Move from discovery to booking with the calm precision of a private concierge. Rooms, dining, wellness, and transport sit in one polished experience.',
        accent: 'Arrival',
    },
    {
        number: '02',
        title: 'Luxury That Scales Around You',
        text: 'Whether it is a weekend suite, a wedding floor, or a private corporate retreat, LuxuryStay adapts the entire property around the shape of your visit.',
        accent: 'Suites',
    },
    {
        number: '03',
        title: 'A Resort System, Not Just Rooms',
        text: 'Dining, spa, beach, transfers, events, and room service connect like one living hotel network so every guest request feels immediate.',
        accent: 'Network',
    },
    {
        number: '04',
        title: 'Human Service With Digital Flow',
        text: 'Guests get the speed of a modern booking platform and the warmth of a team that remembers the small details.',
        accent: 'Care',
    },
];

const fadeUp = {
    hidden: { opacity: 0, y: 34 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
};

const stagger = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.12 } },
};

const LuxuryScene = () => {
    const mountRef = useRef(null);

    useEffect(() => {
        const mount = mountRef.current;
        if (!mount) return;

        const scene = new THREE.Scene();
        scene.fog = new THREE.Fog(0x070708, 8, 26);

        const camera = new THREE.PerspectiveCamera(48, mount.clientWidth / mount.clientHeight, 0.1, 100);
        camera.position.set(0, 3.2, 11);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(mount.clientWidth, mount.clientHeight);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.shadowMap.enabled = true;
        mount.appendChild(renderer.domElement);

        const group = new THREE.Group();
        scene.add(group);

        const ambient = new THREE.AmbientLight(0xffffff, 0.58);
        scene.add(ambient);

        const keyLight = new THREE.DirectionalLight(0xfff1b0, 2.4);
        keyLight.position.set(6, 8, 8);
        keyLight.castShadow = true;
        scene.add(keyLight);

        const redLight = new THREE.PointLight(0xff3b30, 3.2, 20);
        redLight.position.set(-4, 3, 5);
        scene.add(redLight);

        const goldMaterial = new THREE.MeshStandardMaterial({
            color: 0xd4af37,
            metalness: 0.72,
            roughness: 0.22,
        });
        const darkGlass = new THREE.MeshStandardMaterial({
            color: 0x151518,
            metalness: 0.45,
            roughness: 0.18,
            transparent: true,
            opacity: 0.88,
        });
        const blackMetal = new THREE.MeshStandardMaterial({
            color: 0x08080a,
            metalness: 0.6,
            roughness: 0.34,
        });
        const windowMaterial = new THREE.MeshStandardMaterial({
            color: 0xffe7a0,
            emissive: 0xd4af37,
            emissiveIntensity: 0.48,
            metalness: 0.2,
            roughness: 0.18,
        });

        const base = new THREE.Mesh(new THREE.CylinderGeometry(4.8, 5.6, 0.42, 6), blackMetal);
        base.position.y = -2.2;
        base.rotation.y = Math.PI / 6;
        base.receiveShadow = true;
        group.add(base);

        const tower = new THREE.Mesh(new THREE.BoxGeometry(2.9, 5.9, 1.55), darkGlass);
        tower.position.y = 0.65;
        tower.castShadow = true;
        tower.receiveShadow = true;
        group.add(tower);

        const sideTower = new THREE.Mesh(new THREE.BoxGeometry(1.25, 4.6, 1.2), darkGlass);
        sideTower.position.set(2.15, -0.02, -0.18);
        sideTower.rotation.y = -0.13;
        sideTower.castShadow = true;
        group.add(sideTower);

        const leftTower = new THREE.Mesh(new THREE.BoxGeometry(1.05, 4.25, 1.05), darkGlass);
        leftTower.position.set(-2.05, -0.18, -0.12);
        leftTower.rotation.y = 0.14;
        leftTower.castShadow = true;
        group.add(leftTower);

        const crown = new THREE.Mesh(new THREE.ConeGeometry(1.65, 1.25, 4), goldMaterial);
        crown.position.set(0, 4.3, 0);
        crown.rotation.y = Math.PI / 4;
        crown.castShadow = true;
        group.add(crown);

        const windowMeshes = [];
        const addWindowGrid = (xStart, yStart, z, cols, rows, gapX, gapY, parentGroup = group) => {
            for (let row = 0; row < rows; row += 1) {
                for (let col = 0; col < cols; col += 1) {
                    const lit = (row + col) % 3 !== 0;
                    const mesh = new THREE.Mesh(
                        new THREE.BoxGeometry(0.22, 0.34, 0.035),
                        lit ? windowMaterial : blackMetal
                    );
                    mesh.position.set(xStart + col * gapX, yStart - row * gapY, z);
                    mesh.userData.baseIntensity = lit ? 0.34 + ((row + col) % 4) * 0.08 : 0;
                    parentGroup.add(mesh);
                    windowMeshes.push(mesh);
                }
            }
        };

        addWindowGrid(-0.92, 3, 0.81, 5, 8, 0.46, 0.56);
        addWindowGrid(1.72, 2.35, 0.45, 3, 6, 0.34, 0.56);
        addWindowGrid(-2.38, 2.1, 0.37, 3, 5, 0.31, 0.58);

        const entry = new THREE.Mesh(new THREE.BoxGeometry(1.18, 0.9, 0.12), goldMaterial);
        entry.position.set(0, -1.86, 0.86);
        group.add(entry);

        const platformLineMaterial = new THREE.LineBasicMaterial({ color: 0xd4af37, transparent: true, opacity: 0.42 });
        for (let i = 0; i < 4; i += 1) {
            const points = [];
            const radius = 3.6 + i * 0.7;
            for (let step = 0; step <= 6; step += 1) {
                const angle = (Math.PI * 2 * step) / 6 + Math.PI / 6;
                points.push(new THREE.Vector3(Math.cos(angle) * radius, -2.43 - i * 0.02, Math.sin(angle) * radius * 0.65));
            }
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(geometry, platformLineMaterial);
            line.rotation.x = -0.1;
            group.add(line);
        }

        const nodeMaterial = new THREE.MeshStandardMaterial({
            color: 0xff4b3f,
            emissive: 0xff261c,
            emissiveIntensity: 0.52,
            roughness: 0.28,
            metalness: 0.4,
        });
        const nodes = [];
        for (let i = 0; i < 34; i += 1) {
            const geometry = new THREE.BoxGeometry(0.07, 0.07, 0.07);
            const node = new THREE.Mesh(geometry, nodeMaterial);
            const angle = i * 0.74;
            const radius = 5.8 + Math.sin(i) * 1.2;
            node.position.set(Math.cos(angle) * radius, Math.sin(i * 1.7) * 2.8 + 0.7, Math.sin(angle) * radius - 2.8);
            node.rotation.set(i * 0.2, i * 0.13, i * 0.17);
            scene.add(node);
            nodes.push(node);
        }

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
            group.rotation.y = elapsed * 0.16 + pointer.x * 0.18;
            group.rotation.x = -0.08 + pointer.y * 0.08;
            group.position.y = Math.sin(elapsed * 0.8) * 0.12;

            windowMeshes.forEach((mesh, index) => {
                if (mesh.material.emissive) {
                    mesh.material.emissiveIntensity = mesh.userData.baseIntensity + Math.sin(elapsed * 2 + index) * 0.08;
                }
            });

            nodes.forEach((node, index) => {
                node.rotation.x += 0.006 + index * 0.00008;
                node.rotation.y += 0.01;
                node.position.y += Math.sin(elapsed + index) * 0.0018;
            });

            camera.position.x += (pointer.x * 0.45 - camera.position.x) * 0.04;
            camera.position.y += (3.2 + pointer.y * -0.22 - camera.position.y) * 0.04;
            camera.lookAt(0, 0.45, 0);
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

    return <div className="luxury3d-canvas" ref={mountRef} aria-hidden="true" />;
};

const SectionEyebrow = ({ label }) => (
    <div className="section-eyebrow">
        <span />
        {label}
    </div>
);

const Home = () => {
    const { scrollYProgress } = useScroll();
    const heroLift = useTransform(scrollYProgress, [0, 0.45], [0, -180]);
    const [rooms, setRooms] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get(`${API_BASE_URL}/api/rooms`)
            .then(res => {
                const data = res.data;
                setRooms(data);
                const available = data.filter(r => r.status === 'Available').length;
                const occupied = data.filter(r => r.status === 'Occupied').length;
                setStats({ total: data.length, available, occupied });
            })
            .catch(() => setStats(null))
            .finally(() => setLoading(false));
    }, []);

    return (
        <main className="home3d-page">
            <section className="home3d-hero">
                <LuxuryScene />
                <div className="hero-grid-layer" />

                <Motion.div className="hero-copy" style={{ y: heroLift }}>
                    <Motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                    >
                        <div className="hero-kicker">
                            <FaCrown />
                            LuxuryStay 3D Hospitality Network
                        </div>
                        <h1>Stay inside the future of luxury hospitality.</h1>
                        <p>
                            A cinematic hotel experience where suites, wellness, dining, transfers, and concierge service move together in one elegant digital world.
                        </p>
                        <div className="hero-actions">
                            <Link to="/rooms" className="home3d-btn primary">
                                Explore Rooms <FaArrowRight />
                            </Link>
                            <Link to="/gallery" className="home3d-btn ghost">
                                <FaPlay /> View Gallery
                            </Link>
                        </div>
                    </Motion.div>
                </Motion.div>

                <Motion.div
                    className="hero-side-panel"
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                >
                    <div className="side-panel-top">
                        <span>Resort Status</span>
                        <strong style={{ color: stats?.available > 0 ? '#28a745' : 'var(--primary)' }}>{loading ? '...' : stats ? 'Online' : 'No data'}</strong>
                    </div>
                    {loading ? (
                        <div className="hero-stat-row"><span>Loading...</span><strong>--</strong></div>
                    ) : stats ? (
                        <>
                            <div className="hero-stat-row">
                                <span>Total Rooms</span>
                                <strong>{stats.total}</strong>
                            </div>
                            <div className="hero-stat-row">
                                <span>Available</span>
                                <strong style={{ color: '#28a745' }}>{stats.available}</strong>
                            </div>
                            <div className="hero-stat-row">
                                <span>Occupied</span>
                                <strong style={{ color: '#ff4d4d' }}>{stats.occupied}</strong>
                            </div>
                        </>
                    ) : (
                        <div className="hero-stat-row"><span>No data available</span><strong>--</strong></div>
                    )}
                </Motion.div>

                <div className="scroll-cue">
                    <span>Scroll</span>
                    <strong>to explore page</strong>
                </div>
            </section>

            <section className="feature-story-section">
                <div className="feature-story-heading">
                    <SectionEyebrow label="Why LuxuryStay" />
                    <h2>Designed like a living resort system.</h2>
                </div>

                <Motion.div
                    className="feature-story-grid"
                    variants={stagger}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.25 }}
                >
                    {WHY_STAYS.map((item) => (
                        <Motion.article className="feature-story-card" variants={fadeUp} key={item.number}>
                            <div className="feature-number">{item.number}</div>
                            <div className="feature-cube">
                                <span>{item.accent}</span>
                            </div>
                            <h3>{item.title}</h3>
                            <p>{item.text}</p>
                        </Motion.article>
                    ))}
                </Motion.div>
            </section>



            <section className="rooms-3d-section">
                <div className="rooms-heading">
                    <SectionEyebrow label="Accommodations" />
                    <h2>Choose your private world.</h2>
                    <Link to="/rooms" className="text-link">
                        View all rooms <FaArrowRight />
                    </Link>
                </div>

                <div className="room-card-grid">
                    {loading ? (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px 0', opacity: 0.5 }}>Loading rooms...</div>
                    ) : rooms.length === 0 ? (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px 0', opacity: 0.5 }}>No rooms available</div>
                    ) : (
                        rooms.slice(0, 3).map((room, index) => (
                            <Link to={`/rooms/${room._id}`} key={room._id} style={{ textDecoration: 'none', color: 'inherit' }}>
                                <Motion.article
                                    className="room-tilt-card"
                                    initial={{ opacity: 0, y: 40, rotateX: 8 }}
                                    whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                                    whileHover={{ y: -16, rotateX: 5, rotateY: index % 2 === 0 ? -6 : 6 }}
                                    viewport={{ once: true, amount: 0.25 }}
                                    transition={{ duration: 0.55 }}
                                >
                                    <img src={room.images?.[0] || room.image} alt={room.type} onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/400x300"; }} />
                                    <div className="room-card-overlay">
                                        <span>{room.status}</span>
                                        <h3>{room.type}</h3>
                                        <strong>${room.price}<small>/ night</small></strong>
                                        <ul>
                                            {(room.amenities || []).slice(0, 3).map((feature) => (
                                                <li key={feature}>
                                                    <FaCheckCircle /> {feature}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </Motion.article>
                            </Link>
                        ))
                    )}
                </div>
            </section>

            <section className="stories-section">
                <div className="stories-heading">
                    <SectionEyebrow label="Hotel Stories" />
                    <h2>Moments from the property.</h2>
                </div>
                <div className="story-grid">
                    <article className="story-card large">
                        <img src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80" alt="Luxury hotel exterior" />
                        <div>
                            <span>Featured</span>
                            <h3>Inside the new coastal arrival experience</h3>
                            <p>From private transfers to a lobby that feels like a calm performance, the first ten minutes now set the tone for the entire stay.</p>
                        </div>
                    </article>
                    <article className="story-card">
                        <FaCocktail />
                        <span>Dining</span>
                        <h3>Late-night sky lounge menus</h3>
                    </article>
                    <article className="story-card">
                        <FaWifi />
                        <span>Business</span>
                        <h3>Executive suites built for quiet focus</h3>
                    </article>
                    <article className="story-card">
                        <FaAward />
                        <span>Awards</span>
                        <h3>Recognized for guest-first design</h3>
                    </article>
                </div>
            </section>

            <section className="community-section">
                <div>
                    <SectionEyebrow label="Community" />
                    <h2>Join the guests who return before they leave.</h2>
                    <p>
                        Private offers, seasonal experiences, wellness retreats, chef events, and city guides delivered with the same polish as the stay itself.
                    </p>
                </div>
                <form className="home3d-form">
                    <label>
                        <span>Email address</span>
                        <input type="email" placeholder="you@example.com" />
                    </label>
                    <button type="button" className="home3d-btn primary">
                        Join List <FaEnvelope />
                    </button>
                </form>
            </section>

            <section className="final-cta">
                <div className="final-cta-inner">
                    <FaMapMarkerAlt />
                    <h2>Start your stay in three dimensions.</h2>
                    <p>Explore suites, plan the visit, and let the concierge shape the details around you.</p>
                    <Link to="/contact" className="home3d-btn primary">
                        Contact Concierge <FaArrowRight />
                    </Link>
                </div>
            </section>

            <style>{`
                .home3d-page {
                    --red: #ff3b30;
                    --gold: #d4af37;
                    --paper: #f5f2ea;
                    --ink: #070707;
                    --muted: rgba(255,255,255,0.68);
                    background: #050506;
                    color: #fff;
                    overflow: hidden;
                }

                .home3d-hero {
                    position: relative;
                    min-height: 100svh;
                    isolation: isolate;
                    display: flex;
                    align-items: center;
                    padding: 120px 7% 90px;
                    background:
                        linear-gradient(115deg, rgba(5,5,6,0.96) 0%, rgba(5,5,6,0.72) 44%, rgba(255,59,48,0.16) 100%),
                        #060607;
                }

                .luxury3d-canvas {
                    position: absolute;
                    inset: 0;
                    z-index: -2;
                }

                .luxury3d-canvas canvas {
                    display: block;
                    width: 100%;
                    height: 100%;
                }

                .hero-grid-layer {
                    position: absolute;
                    inset: 0;
                    z-index: -1;
                    opacity: 0.34;
                    background-image:
                        linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px);
                    background-size: 72px 72px;
                    mask-image: linear-gradient(90deg, #000 0%, transparent 78%);
                }

                .hero-copy {
                    width: min(760px, 100%);
                    position: relative;
                    z-index: 2;
                }

                .hero-kicker,
                .section-eyebrow {
                    display: inline-flex;
                    align-items: center;
                    gap: 12px;
                    color: var(--gold);
                    font-size: 12px;
                    font-weight: 800;
                    letter-spacing: 3px;
                    text-transform: uppercase;
                }

                .hero-kicker svg {
                    font-size: 18px;
                }

                .section-eyebrow span {
                    width: 42px;
                    height: 2px;
                    background: currentColor;
                }

                .hero-copy h1 {
                    margin: 22px 0 24px;
                    max-width: 850px;
                    font-family: 'Playfair Display', serif;
                    font-size: clamp(4rem, 9.5vw, 8.8rem);
                    line-height: 0.88;
                    letter-spacing: 0;
                    color: #fff;
                }

                .hero-copy p {
                    max-width: 650px;
                    color: rgba(255,255,255,0.76);
                    font-size: clamp(1rem, 1.5vw, 1.25rem);
                    line-height: 1.75;
                }

                .hero-actions {
                    display: flex;
                    gap: 16px;
                    flex-wrap: wrap;
                    margin-top: 34px;
                }

                .home3d-btn {
                    width: auto;
                    min-height: 52px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    padding: 0 24px;
                    border-radius: 999px;
                    text-decoration: none;
                    border: 1px solid rgba(255,255,255,0.18);
                    font-weight: 800;
                    letter-spacing: 0.5px;
                    transition: transform 0.25s ease, border-color 0.25s ease, background 0.25s ease;
                }

                .home3d-btn:hover {
                    transform: translateY(-3px);
                }

                .home3d-btn.primary {
                    background: #fff;
                    color: #050506;
                    border-color: #fff;
                }

                .home3d-btn.ghost {
                    color: #fff;
                    background: rgba(255,255,255,0.06);
                    backdrop-filter: blur(12px);
                }

                .hero-side-panel {
                    position: absolute;
                    right: 7%;
                    bottom: 9%;
                    width: min(330px, 31vw);
                    padding: 18px;
                    border: 1px solid rgba(255,255,255,0.14);
                    background: rgba(10,10,12,0.66);
                    backdrop-filter: blur(18px);
                    box-shadow: 0 30px 80px rgba(0,0,0,0.35);
                }

                .side-panel-top,
                .hero-stat-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 18px;
                    padding: 14px 0;
                    border-bottom: 1px solid rgba(255,255,255,0.1);
                }

                .side-panel-top span,
                .hero-stat-row span {
                    color: var(--muted);
                    font-size: 13px;
                }

                .side-panel-top strong {
                    color: #42ff9b;
                    font-size: 12px;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                }

                .hero-stat-row strong {
                    font-size: 28px;
                    font-family: 'Playfair Display', serif;
                }

                .scroll-cue {
                    position: absolute;
                    left: 7%;
                    bottom: 34px;
                    color: rgba(255,255,255,0.72);
                    display: flex;
                    gap: 10px;
                    align-items: center;
                    font-size: 12px;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                }

                .scroll-cue::before {
                    content: '';
                    width: 8px;
                    height: 48px;
                    border: 1px solid rgba(255,255,255,0.4);
                    border-radius: 999px;
                }

                .feature-story-section,
                .experience-band,
                .rooms-3d-section,
                .live-network-section,
                .stories-section,
                .community-section,
                .final-cta {
                    padding: 120px 7%;
                }

                .feature-story-section {
                    background: var(--paper);
                    color: var(--ink);
                }

                .feature-story-heading,
                .rooms-heading,
                .stories-heading {
                    display: flex;
                    align-items: end;
                    justify-content: space-between;
                    gap: 32px;
                    margin-bottom: 56px;
                }

                .feature-story-heading h2,
                .experience-copy h2,
                .rooms-heading h2,
                .live-copy h2,
                .stories-heading h2,
                .community-section h2,
                .final-cta h2 {
                    font-family: 'Playfair Display', serif;
                    font-size: clamp(2.8rem, 6vw, 6.3rem);
                    line-height: 0.96;
                    letter-spacing: 0;
                    margin: 16px 0 0;
                    max-width: 900px;
                }

                .feature-story-grid {
                    display: grid;
                    grid-template-columns: repeat(4, minmax(0, 1fr));
                    border-top: 1px solid rgba(0,0,0,0.12);
                    border-left: 1px solid rgba(0,0,0,0.12);
                }

                .feature-story-card {
                    min-height: 430px;
                    padding: 28px;
                    border-right: 1px solid rgba(0,0,0,0.12);
                    border-bottom: 1px solid rgba(0,0,0,0.12);
                    display: flex;
                    flex-direction: column;
                    perspective: 900px;
                }

                .feature-number {
                    color: var(--red);
                    font-size: 14px;
                    font-weight: 900;
                }

                .feature-cube {
                    width: 112px;
                    height: 112px;
                    margin: 42px 0 auto;
                    display: grid;
                    place-items: center;
                    color: #fff;
                    background: linear-gradient(145deg, #111, #ff3b30);
                    transform: rotateX(58deg) rotateZ(45deg);
                    box-shadow: 20px 20px 0 rgba(0,0,0,0.1);
                    animation: cubeDrift 5s ease-in-out infinite;
                }

                .feature-cube span {
                    transform: rotateZ(-45deg) rotateX(-58deg);
                    font-size: 11px;
                    font-weight: 900;
                    letter-spacing: 1px;
                    text-transform: uppercase;
                }

                .feature-story-card h3 {
                    margin: 34px 0 14px;
                    font-size: clamp(1.4rem, 2vw, 2rem);
                }

                .feature-story-card p,
                .experience-copy p,
                .live-copy p,
                .community-section p,
                .final-cta p {
                    color: rgba(0,0,0,0.62);
                    line-height: 1.75;
                    max-width: 660px;
                }

                .experience-band {
                    display: grid;
                    grid-template-columns: minmax(280px, 0.8fr) minmax(0, 1.2fr);
                    gap: 70px;
                    background: #050506;
                }

                .experience-copy {
                    position: sticky;
                    top: 110px;
                    align-self: start;
                }

                .experience-copy p,
                .live-copy p,
                .community-section p,
                .final-cta p {
                    color: rgba(255,255,255,0.68);
                }

                .experience-grid {
                    display: grid;
                    grid-template-columns: repeat(2, minmax(0, 1fr));
                    gap: 18px;
                    perspective: 1200px;
                }

                .experience-card {
                    min-height: 250px;
                    padding: 26px;
                    background: rgba(255,255,255,0.055);
                    border: 1px solid rgba(255,255,255,0.1);
                    transform-style: preserve-3d;
                    transition: transform 0.25s ease, background 0.25s ease;
                }

                .experience-card:hover {
                    transform: rotateX(6deg) rotateY(-7deg) translateY(-8px);
                    background: rgba(255,255,255,0.09);
                }

                .experience-icon {
                    width: 54px;
                    height: 54px;
                    display: grid;
                    place-items: center;
                    color: #050506;
                    background: #fff;
                    margin-bottom: 32px;
                    transform: translateZ(32px);
                }

                .experience-card h3,
                .experience-card p {
                    transform: translateZ(24px);
                }

                .experience-card h3 {
                    font-size: 1.35rem;
                    margin-bottom: 12px;
                }

                .experience-card p {
                    color: rgba(255,255,255,0.62);
                    line-height: 1.65;
                }

                .trusted-section {
                    background: #fff;
                    color: #050506;
                    padding: 46px 0;
                    overflow: hidden;
                    border-top: 1px solid rgba(0,0,0,0.1);
                    border-bottom: 1px solid rgba(0,0,0,0.1);
                }

                .trusted-section p {
                    padding: 0 7% 22px;
                    font-size: 13px;
                    letter-spacing: 2px;
                    text-transform: uppercase;
                    color: rgba(0,0,0,0.55);
                }

                .trusted-track {
                    display: flex;
                    gap: 18px;
                    width: max-content;
                    animation: marquee 28s linear infinite;
                }

                .trusted-track span {
                    min-width: 220px;
                    padding: 24px 30px;
                    border: 1px solid rgba(0,0,0,0.1);
                    font-family: 'Playfair Display', serif;
                    font-size: 1.55rem;
                    font-weight: 700;
                    text-align: center;
                }

                .rooms-3d-section {
                    background: #0b0b0d;
                }

                .text-link {
                    color: #fff;
                    text-decoration: none;
                    display: inline-flex;
                    align-items: center;
                    gap: 10px;
                    font-weight: 800;
                }

                .room-card-grid {
                    display: grid;
                    grid-template-columns: repeat(3, minmax(0, 1fr));
                    gap: 24px;
                    perspective: 1200px;
                }

                .room-tilt-card {
                    position: relative;
                    min-height: 560px;
                    overflow: hidden;
                    border: 1px solid rgba(255,255,255,0.14);
                    transform-style: preserve-3d;
                    background: #111;
                    box-shadow: 0 45px 90px rgba(0,0,0,0.28);
                }

                .room-tilt-card img {
                    position: absolute;
                    inset: 0;
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transform: scale(1.06);
                    filter: saturate(0.94) contrast(1.06);
                }

                .room-card-overlay {
                    position: absolute;
                    inset: auto 0 0;
                    padding: 32px;
                    background: linear-gradient(transparent, rgba(0,0,0,0.93) 28%, #030304);
                    transform: translateZ(46px);
                }

                .room-card-overlay span {
                    color: var(--gold);
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    font-size: 12px;
                    font-weight: 900;
                }

                .room-card-overlay h3 {
                    font-family: 'Playfair Display', serif;
                    font-size: 2.6rem;
                    margin: 10px 0;
                }

                .room-card-overlay strong {
                    display: block;
                    font-size: 1.4rem;
                    color: #fff;
                    margin-bottom: 16px;
                }

                .room-card-overlay small {
                    color: rgba(255,255,255,0.55);
                    font-size: 13px;
                    margin-left: 6px;
                }

                .room-card-overlay ul {
                    list-style: none;
                    display: grid;
                    gap: 9px;
                }

                .room-card-overlay li {
                    color: rgba(255,255,255,0.72);
                    display: flex;
                    gap: 9px;
                    align-items: center;
                }

                .room-card-overlay svg {
                    color: var(--gold);
                }

                .live-network-section {
                    display: grid;
                    grid-template-columns: minmax(300px, 0.78fr) minmax(0, 1.22fr);
                    gap: 54px;
                    background: var(--paper);
                    color: var(--ink);
                }

                .live-tabs {
                    display: inline-flex;
                    border: 1px solid rgba(0,0,0,0.12);
                    margin-top: 28px;
                    padding: 5px;
                }

                .live-tabs button {
                    border: none;
                    background: transparent;
                    color: #050506;
                    padding: 12px 18px;
                    font-weight: 800;
                }

                .live-tabs button.is-active {
                    background: #050506;
                    color: #fff;
                }

                .live-terminal {
                    background: #050506;
                    color: #fff;
                    padding: 28px;
                    border: 1px solid rgba(0,0,0,0.14);
                    box-shadow: 24px 24px 0 rgba(255,59,48,0.18);
                }

                .terminal-head {
                    display: flex;
                    justify-content: space-between;
                    gap: 24px;
                    align-items: baseline;
                }

                .terminal-head span {
                    color: var(--gold);
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    font-size: 12px;
                    font-weight: 900;
                }

                .terminal-head strong {
                    font-size: clamp(3rem, 7vw, 6rem);
                    line-height: 1;
                    font-family: 'Playfair Display', serif;
                }

                .terminal-label {
                    color: rgba(255,255,255,0.56);
                    margin: 10px 0 26px;
                }

                .terminal-rows {
                    display: grid;
                    gap: 12px;
                }

                .terminal-row {
                    display: flex;
                    justify-content: space-between;
                    gap: 20px;
                    padding: 16px;
                    border: 1px solid rgba(255,255,255,0.1);
                    background: rgba(255,255,255,0.045);
                }

                .terminal-row div {
                    display: grid;
                    gap: 5px;
                }

                .terminal-row div:last-child {
                    text-align: right;
                }

                .terminal-row span {
                    color: rgba(255,255,255,0.58);
                    font-size: 13px;
                }

                .stories-section {
                    background: #050506;
                }

                .story-grid {
                    display: grid;
                    grid-template-columns: 1.35fr 0.65fr 0.65fr;
                    gap: 18px;
                }

                .story-card {
                    min-height: 260px;
                    position: relative;
                    overflow: hidden;
                    border: 1px solid rgba(255,255,255,0.12);
                    background: rgba(255,255,255,0.055);
                    padding: 28px;
                    display: flex;
                    flex-direction: column;
                    justify-content: flex-end;
                }

                .story-card.large {
                    min-height: 540px;
                    grid-row: span 2;
                    padding: 0;
                }

                .story-card.large img {
                    position: absolute;
                    inset: 0;
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .story-card.large::after {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(transparent, rgba(0,0,0,0.88));
                }

                .story-card.large div {
                    position: relative;
                    z-index: 1;
                    padding: 34px;
                }

                .story-card svg {
                    color: var(--gold);
                    font-size: 32px;
                    margin-bottom: auto;
                }

                .story-card span {
                    color: var(--gold);
                    font-size: 12px;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    font-weight: 900;
                }

                .story-card h3 {
                    font-size: clamp(1.35rem, 2.2vw, 2.25rem);
                    margin: 12px 0 0;
                }

                .story-card p {
                    color: rgba(255,255,255,0.66);
                    line-height: 1.65;
                    max-width: 600px;
                    margin-top: 12px;
                }

                .community-section {
                    display: grid;
                    grid-template-columns: minmax(0, 1fr) minmax(300px, 470px);
                    gap: 50px;
                    align-items: end;
                    background: #111114;
                    border-top: 1px solid rgba(255,255,255,0.1);
                }

                .home3d-form {
                    display: grid;
                    gap: 14px;
                    padding: 22px;
                    border: 1px solid rgba(255,255,255,0.12);
                    background: rgba(255,255,255,0.05);
                }

                .home3d-form label {
                    display: grid;
                    gap: 9px;
                    color: rgba(255,255,255,0.7);
                    font-size: 13px;
                    text-transform: uppercase;
                    letter-spacing: 1.4px;
                }

                .home3d-form input {
                    min-height: 54px;
                    border: 1px solid rgba(255,255,255,0.16);
                    background: #050506;
                    color: #fff;
                    padding: 0 16px;
                    outline: none;
                }

                .final-cta {
                    min-height: 76vh;
                    display: grid;
                    place-items: center;
                    text-align: center;
                    background:
                        linear-gradient(120deg, rgba(255,59,48,0.18), rgba(212,175,55,0.14)),
                        url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1920&q=80') center/cover;
                    position: relative;
                }

                .final-cta::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: rgba(0,0,0,0.58);
                }

                .final-cta-inner {
                    position: relative;
                    z-index: 1;
                    max-width: 820px;
                    display: grid;
                    justify-items: center;
                    gap: 20px;
                }

                .final-cta-inner > svg {
                    color: var(--gold);
                    font-size: 34px;
                }

                @keyframes cubeDrift {
                    0%, 100% { translate: 0 0; }
                    50% { translate: 0 -12px; }
                }

                @keyframes marquee {
                    from { transform: translateX(0); }
                    to { transform: translateX(-50%); }
                }

                @media (max-width: 1100px) {
                    .hero-side-panel {
                        display: none;
                    }

                    .feature-story-grid,
                    .room-card-grid {
                        grid-template-columns: repeat(2, minmax(0, 1fr));
                    }

                    .experience-band,
                    .live-network-section,
                    .community-section {
                        grid-template-columns: 1fr;
                    }

                    .experience-copy {
                        position: static;
                    }

                    .story-grid {
                        grid-template-columns: 1fr 1fr;
                    }
                }

                @media (max-width: 760px) {
                    .home3d-hero,
                    .feature-story-section,
                    .experience-band,
                    .rooms-3d-section,
                    .live-network-section,
                    .stories-section,
                    .community-section,
                    .final-cta {
                        padding-left: 20px !important;
                        padding-right: 20px !important;
                    }

                    .home3d-hero {
                        padding-top: 92px !important;
                    }

                    .hero-copy h1 {
                        font-size: clamp(3.2rem, 18vw, 5rem);
                    }

                    .feature-story-heading,
                    .rooms-heading,
                    .stories-heading {
                        display: grid;
                        align-items: start;
                    }

                    .feature-story-grid,
                    .experience-grid,
                    .room-card-grid,
                    .story-grid {
                        grid-template-columns: 1fr;
                    }

                    .feature-story-card {
                        min-height: 340px;
                    }

                    .room-tilt-card {
                        min-height: 500px;
                    }

                    .terminal-row,
                    .terminal-head {
                        align-items: start;
                    }

                    .scroll-cue {
                        display: none;
                    }
                }
            `}</style>
        </main>
    );
};

export default Home;
