import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import http from "../api/http";
import MoviesGrid from "./home/MoviesGrid";
import ShowtimesModal from "./home/ShowtimesModal";

// Local hero images
import STR from "../assets/str.jpg";
import TROLL from "../assets/123.jpg";
import JURASSIC from "../assets/1234.jpg";

export default function Home() {
  const nav = useNavigate();

  // =========================
  // HERO SLIDES
  // =========================
  const slides = useMemo(
    () => [
      {
        id: "s1",
        eyebrow: "PREMIUM CINEMA",
        title: "Experience",
        highlight: "Cinema Magic",
        desc: "Ultimate 4K visuals with Dolby Atmos sound. Book in seconds.",
        img: STR,
        primaryText: "See Bookings",
        primaryHref: "/my-bookings",
        secondaryText: "Book Seats",
        secondaryHref: "#now-showing",
        gradient: "linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)",
        color: "#8B5CF6"
      },
      {
        id: "s2",
        eyebrow: "LIVE SEAT MAP",
        title: "Real-Time",
        highlight: "Seat Selection",
        desc: "See available seats instantly. Lock and confirm with one click.",
        img: TROLL,
        primaryText: "See Bookings",
        primaryHref: "/my-bookings",
        secondaryText: "Book Seats",
        secondaryHref: "#now-showing",
        gradient: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
        color: "#10B981"
      },
      {
        id: "s3",
        eyebrow: "VIP LOUNGE",
        title: "Luxury",
        highlight: "Cinema Experience",
        desc: "Premium recliners, gourmet snacks, exclusive screenings.",
        img: JURASSIC,
        primaryText: "See Bookings",
        primaryHref: "/my-bookings",
        secondaryText: "Book Seats",
        secondaryHref: "#now-showing",
        gradient: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
        color: "#F59E0B"
      },
    ],
    []
  );

  const [index, setIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const timerRef = useRef(null);

  const goTo = (i) => {
    if (i === index || isAnimating) return;
    setIsAnimating(true);
    setTimeout(() => {
      setIndex(i);
      setIsAnimating(false);
    }, 500);
  };

  const prev = () => goTo((index - 1 + slides.length) % slides.length);
  const next = () => goTo((index + 1) % slides.length);

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => goTo((index + 1) % slides.length), 7000);
    return () => timerRef.current && clearInterval(timerRef.current);
  }, [index, slides.length]);

  const slide = slides[index];

  function goToHref(href) {
    if (!href) return;
    if (href.startsWith("/")) return nav(href);
    if (href.startsWith("#")) {
      const el = document.querySelector(href);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    window.location.href = href;
  }

  // =========================
  // MOVIES + MODAL SHOWTIMES
  // =========================
  const [movies, setMovies] = useState([]);
  const [q, setQ] = useState("");
  const [loadingMovies, setLoadingMovies] = useState(true);
  const [moviesError, setMoviesError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [shows, setShows] = useState([]);
  const [loadingShows, setLoadingShows] = useState(false);
  const [showsError, setShowsError] = useState("");
  const [popularMovies, setPopularMovies] = useState([]);

  useEffect(() => {
    (async () => {
      setLoadingMovies(true);
      setMoviesError("");
      try {
        const res = await http.get("/movies");
        const moviesData = Array.isArray(res.data) ? res.data : [];
        setMovies(moviesData);
        
        // Simulate popularity based on views/bookings
        const moviesWithPopularity = moviesData.map(movie => ({
          ...movie,
          popularity: (movie.rating || 0) * 10 + Math.floor(Math.random() * 50)
        }));
        
        // Sort by popularity for trending
        const sortedByPopularity = [...moviesWithPopularity].sort((a, b) => 
          (b.popularity || 0) - (a.popularity || 0)
        );
        setPopularMovies(sortedByPopularity);
        
      } catch (e) {
        console.error(e);
        setMoviesError("Unable to load movies right now. Please try again.");
      } finally {
        setLoadingMovies(false);
      }
    })();
  }, []);


// ✅ Stable Fisher–Yates shuffle (DO NOT shuffle inside JSX render)
function shuffleArray(arr) {
  const a = Array.isArray(arr) ? [...arr] : [];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ✅ Display lists (these make UI stable)
const [trendingDisplay, setTrendingDisplay] = useState([]);
const [topPicksDisplay, setTopPicksDisplay] = useState([]);

// ✅ Your existing computed lists (keep or adjust as you want)
const topPicks = useMemo(() => {
  if (!movies.length) return [];
  // pick base list (rating based / any stable rule)
  return [...movies].sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
}, [movies]);

const trendingNow = useMemo(() => {
  if (!popularMovies.length) return [];
  return [...popularMovies];
}, [popularMovies]);

// ✅ Freeze the cards (ONLY changes when movies list changes)
useEffect(() => {
  setTrendingDisplay(shuffleArray(trendingNow).slice(0, 4));
}, [trendingNow]);

useEffect(() => {
  setTopPicksDisplay(shuffleArray(topPicks).slice(0, 3));
}, [topPicks]);

// ✅ Manual refresh button
function refreshHighlights() {
  setTrendingDisplay(shuffleArray(trendingNow).slice(0, 4));
  setTopPicksDisplay(shuffleArray(topPicks).slice(0, 3));
}






  async function openMovie(m) {
    setSelectedMovie(m);
    setModalOpen(true);
    setLoadingShows(true);
    setShowsError("");
    try {
      const res = await http.get(`/shows/by-movie/${m._id}`);
      setShows(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error(e);
      setShows([]);
      setShowsError("Unable to load showtimes. Please try again.");
    } finally {
      setLoadingShows(false);
    }
  }

  const closeModal = () => setModalOpen(false);



// ✅ Freeze 4 Trending cards (only changes when trendingNow changes)
useEffect(() => {
  setTrendingDisplay(shuffleArray(trendingNow).slice(0, 4));
}, [trendingNow]);

// ✅ Freeze 3 Top Picks cards (only changes when topPicks changes)
useEffect(() => {
  setTopPicksDisplay(shuffleArray(topPicks).slice(0, 3));
}, [topPicks]);


  // =========================
  // NEWSLETTER
  // =========================
  const [email, setEmail] = useState("");
  const [subOk, setSubOk] = useState(false);

  function submitNewsletter(e) {
    e.preventDefault();
    setSubOk(true);
    setTimeout(() => setSubOk(false), 2500);
    setEmail("");
  }

  // =========================
  // STATISTICS
  // =========================
  const stats = [
    { value: "50K+", label: "Happy Customers", icon: "fa-solid fa-users", color: "#8B5CF6" },
    { value: "500+", label: "Monthly Screenings", icon: "fa-solid fa-film", color: "#3B82F6" },
    { value: "24/7", label: "Live Support", icon: "fa-solid fa-headset", color: "#10B981" },
    { value: "4.9★", label: "Average Rating", icon: "fa-solid fa-star", color: "#F59E0B" },
  ];

  // =========================
  // FEATURES
  // =========================
  const features = [
    {
      icon: "fa-solid fa-bolt",
      title: "Lightning Fast",
      desc: "Book tickets in under 60 seconds",
      color: "#8B5CF6",
      delay: "0s",
      bgColor: "rgba(139, 92, 246, 0.1)"
    },
    {
      icon: "fa-solid fa-shield-halved",
      title: "Secure Payments",
      desc: "Bank-level encryption for all transactions",
      color: "#3B82F6",
      delay: "0.1s",
      bgColor: "rgba(59, 130, 246, 0.1)"
    },
    {
      icon: "fa-solid fa-mobile-screen-button",
      title: "Mobile First",
      desc: "Optimized for all screen sizes",
      color: "#10B981",
      delay: "0.2s",
      bgColor: "rgba(16, 185, 129, 0.1)"
    },
    {
      icon: "fa-solid fa-chair",
      title: "Live Seat Map",
      desc: "Real-time seat availability",
      color: "#F59E0B",
      delay: "0.3s",
      bgColor: "rgba(245, 158, 11, 0.1)"
    },
  ];

  // =========================
  // TESTIMONIALS
  // =========================
  const testimonials = [
    {
      rating: 5,
      text: "The seat selection is incredibly smooth. I love how I can see exactly which seats are available in real-time!",
      name: "Sarah Chen",
      role: "Regular Customer",
      avatar: "SC",
      gradient: "linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)"
    },
    {
      rating: 5,
      text: "Booking tickets for my family has never been easier. The interface is intuitive and the process is lightning fast.",
      name: "Michael Rodriguez",
      role: "Movie Enthusiast",
      avatar: "MR",
      gradient: "linear-gradient(135deg, #10B981 0%, #059669 100%)"
    },
    {
      rating: 5,
      text: "As someone who watches movies weekly, this platform has completely transformed my booking experience.",
      name: "Jessica Park",
      role: "Film Critic",
      avatar: "JP",
      gradient: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)"
    },
  ];

  // =========================
  // CINEMA AMENITIES
  // =========================
  const amenities = [
    { icon: "fa-solid fa-maximize", label: "IMAX & 4DX", desc: "Premium formats", color: "#8B5CF6" },
    { icon: "fa-solid fa-couch", label: "Recliner Seats", desc: "Luxury comfort", color: "#3B82F6" },
    { icon: "fa-solid fa-ticket", label: "Easy Refunds", desc: "Hassle-free", color: "#10B981" },
    { icon: "fa-solid fa-user-group", label: "Group Booking", desc: "Save together", color: "#F59E0B" },
    { icon: "fa-solid fa-utensils", label: "Gourmet Food", desc: "Delicious snacks", color: "#EC4899" },
    { icon: "fa-solid fa-square-parking", label: "Free Parking", desc: "Convenient", color: "#06B6D4" },
    { icon: "fa-solid fa-wifi", label: "High-Speed WiFi", desc: "Stay connected", color: "#8B5CF6" },
    { icon: "fa-solid fa-snowflake", label: "AC Lounges", desc: "Comfort zones", color: "#3B82F6" },
  ];

  return (
    <div className="cinema-home">
      <style>{`
        /* =========================
           GLOBAL STYLES - MOBILE FIRST
        ========================== */
        :root {
          --primary: #8B5CF6;
          --primary-dark: #7C3AED;
          --primary-light: #A78BFA;
          --secondary: #3B82F6;
          --accent: #10B981;
          --accent-2: #F59E0B;
          --dark: #0F172A;
          --darker: #0A0F1E;
          --light: #F8FAFC;
          --muted: rgba(248, 250, 252, 0.7);
          --glass: rgba(255, 255, 255, 0.08);
          --glass-border: rgba(255, 255, 255, 0.12);
          --success: #10B981;
          --shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
          --shadow-lg: 0 20px 50px rgba(0, 0, 0, 0.4);
        }

        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        .cinema-home {
          min-height: 100vh;
          color: var(--light);
          background:
            radial-gradient(ellipse at 20% 20%, rgba(139, 92, 246, 0.15) 0%, transparent 60%),
            radial-gradient(ellipse at 80% 80%, rgba(59, 130, 246, 0.12) 0%, transparent 60%),
            linear-gradient(180deg, var(--darker) 0%, var(--dark) 100%);
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          overflow-x: hidden;
        }

        /* Smooth Scrolling */
        html {
          scroll-behavior: smooth;
        }

        /* Custom Scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        ::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
        }

        ::-webkit-scrollbar-thumb {
          background: linear-gradient(45deg, var(--primary), var(--secondary));
          border-radius: 8px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(45deg, var(--primary-dark), var(--accent));
        }

        /* Typography Enhancements */
        .text-gradient {
          background: linear-gradient(90deg, var(--primary-light), var(--secondary), var(--accent));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          background-size: 300% 100%;
          animation: gradient-shift 6s ease infinite;
        }

        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        /* Glass Effects */
        .glass {
          background: var(--glass);
          backdrop-filter: blur(10px) saturate(180%);
          -webkit-backdrop-filter: blur(10px) saturate(180%);
          border: 1px solid var(--glass-border);
          box-shadow: var(--shadow);
        }

        .glass-dark {
          background: rgba(15, 23, 42, 0.9);
          backdrop-filter: blur(10px) saturate(180%);
          -webkit-backdrop-filter: blur(10px) saturate(180%);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: var(--shadow);
        }

        /* Animations */
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.05); }
        }

        .fade-in-up {
          opacity: 0;
          animation: fadeInUp 0.6s ease-out forwards;
        }

        .fade-in {
          opacity: 0;
          animation: fadeIn 0.5s ease-out forwards;
        }

        .pulse-animation {
          animation: pulse 2s ease-in-out infinite;
        }

        /* Button Styles - Mobile First */
        .btn-cinema {
          padding: 12px 24px;
          border-radius: 50px;
          font-weight: 600;
          font-size: 14px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border: none;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          letter-spacing: 0.3px;
          position: relative;
          overflow: hidden;
          z-index: 1;
          width: 100%;
          max-width: 280px;
          margin: 4px 0;
        }

        .btn-cinema::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.15);
          transform: translate(-50%, -50%);
          transition: width 0.6s, height 0.6s;
          z-index: -1;
        }

        .btn-cinema:hover::before {
          width: 200px;
          height: 200px;
        }

        .btn-cinema-primary {
          background: linear-gradient(135deg, var(--primary), var(--primary-dark));
          color: white;
          box-shadow: 0 4px 20px rgba(139, 92, 246, 0.3);
        }

        .btn-cinema-primary:hover, .btn-cinema-primary:active {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(139, 92, 246, 0.4);
        }

        .btn-cinema-secondary {
          background: transparent;
          color: white;
          border: 1.5px solid rgba(255, 255, 255, 0.2);
        }

        .btn-cinema-secondary:hover, .btn-cinema-secondary:active {
          background: rgba(255, 255, 255, 0.05);
          border-color: var(--primary);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(139, 92, 246, 0.2);
        }

        /* Section Styles */
        .section-title {
          font-size: 1.8rem;
          font-weight: 800;
          margin-bottom: 0.75rem;
          color: white;
          letter-spacing: -0.3px;
          line-height: 1.2;
          background: linear-gradient(90deg, white, var(--primary-light));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .section-subtitle {
          font-size: 0.95rem;
          color: var(--muted);
          max-width: 100%;
          margin-bottom: 1.5rem;
          line-height: 1.5;
        }

        .section-header {
          margin-bottom: 2rem;
        }

        /* Hero Section - Mobile First */
        .hero-section {
          position: relative;
          min-height: 85vh;
          display: flex;
          align-items: center;
          overflow: hidden;
          padding: 20px 16px;
          padding-top: 70px;
        }

        .hero-content-wrapper {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
        }

        .hero-bg {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: center;
          transition: opacity 1.2s cubic-bezier(0.4, 0, 0.2, 1);
          filter: brightness(0.4) contrast(1.1) saturate(1.2);
          transform: scale(1.1);
        }

        .hero-bg::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(
            90deg,
            rgba(10, 15, 30, 0.95) 0%,
            rgba(10, 15, 30, 0.3) 40%,
            rgba(10, 15, 30, 0.1) 70%,
            rgba(10, 15, 30, 0.95) 100%
          ),
          radial-gradient(circle at 20% 50%, rgba(139, 92, 246, 0.2) 0%, transparent 50%),
          radial-gradient(circle at 80% 50%, rgba(59, 130, 246, 0.15) 0%, transparent 50%);
        }

        .hero-content {
          max-width: 100%;
          animation: fadeInUp 0.8s ease-out 0.2s both;
        }

        .hero-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: 50px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 1px;
          margin-bottom: 1.5rem;
          color: rgba(255, 255, 255, 0.95);
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          text-transform: uppercase;
        }

        .hero-title {
          font-size: 2.2rem;
          font-weight: 900;
          line-height: 1.1;
          margin-bottom: 1rem;
          color: white;
        }

        .hero-highlight {
          background: ${slide.gradient};
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-shadow: 0 0 30px rgba(139, 92, 246, 0.3);
        }

        .hero-description {
          font-size: 1rem;
          line-height: 1.5;
          color: rgba(255, 255, 255, 0.9);
          margin-bottom: 2rem;
          max-width: 100%;
        }

        .hero-buttons {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 60px;
        }

        .hero-slider-controls {
          position: absolute;
          bottom: 20px;
          left: 0;
          right: 0;
          display: flex;
          justify-content: center;
          gap: 8px;
          z-index: 3;
          padding: 0 16px;
        }

        .slider-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.3);
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          padding: 0;
        }

        .slider-dot::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: ${slide.gradient};
          transition: left 0.3s ease;
        }

        .slider-dot.active {
          width: 30px;
          border-radius: 8px;
        }

        .slider-dot.active::before {
          left: 0;
        }

        .hero-arrow {
          display: none;
        }

        /* Stats Section */
        .stats-section {
          position: relative;
          z-index: 2;
          padding: 40px 20px;
          background: linear-gradient(180deg, rgba(10, 15, 30, 0.5) 0%, rgba(10, 15, 30, 0.8) 100%);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          margin: -40px auto 0;
          max-width: calc(100% - 32px);
          width: 100%;
          box-shadow: var(--shadow);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
        }

        .stat-card {
          text-align: center;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          padding: 0 8px;
        }

        .stat-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: ${slide.color};
          border-radius: 1.5px;
        }

        .stat-icon {
          font-size: 1.8rem;
          margin-bottom: 0.75rem;
          color: ${slide.color};
        }

        .stat-value {
          font-size: 1.8rem;
          font-weight: 800;
          background: linear-gradient(90deg, var(--primary), var(--secondary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 0.25rem;
          line-height: 1;
        }

        .stat-label {
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.7);
          font-weight: 500;
        }

        /* Movie Cards - Clean Design with Titles UNDER Images */
        .movie-card {
          position: relative;
          border-radius: 16px;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          cursor: pointer;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.08);
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .movie-card:hover {
          transform: translateY(-8px);
          border-color: rgba(139, 92, 246, 0.3);
          box-shadow: var(--shadow-lg);
        }

        .movie-image-container {
          position: relative;
          width: 100%;
          overflow: hidden;
          border-radius: 16px 16px 0 0;
        }

        .movie-card img {
          width: 100%;
          height: 250px;
          object-fit: cover;
          transition: transform 0.6s ease;
          filter: saturate(1.05);
          display: block;
        }

        .movie-card:hover img {
          transform: scale(1.08);
        }

        .movie-badge {
          position: absolute;
          top: 16px;
          left: 16px;
          background: var(--secondary);
          color: white;
          padding: 4px 10px;
          border-radius: 40px;
          font-size: 10px;
          font-weight: 600;
          z-index: 2;
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        .movie-content {
          padding: 24px;
          flex: 1;
          display: flex;
          flex-direction: column;
          background: transparent;
          margin-top: 0;
        }

        .movie-title {
          font-size: 1.2rem;
          font-weight: 700;
          color: white;
          margin-bottom: 8px;
          line-height: 1.3;
          text-align: center;
        }

        .movie-meta {
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 20px;
          line-height: 1.4;
          text-align: center;
        }

        .movie-actions {
          margin-top: auto;
          display: flex;
          justify-content: center;
        }

        .movie-actions .btn-cinema {
          padding: 10px 24px;
          font-size: 13px;
          max-width: none;
          margin: 0;
          border-radius: 50px;
          width: auto;
          min-width: 140px;
        }

        /* Feature Cards */
        .feature-card {
          padding: 24px;
          border-radius: 16px;
          background: ${props => props.bgColor || 'linear-gradient(145deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02))'};
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.3s ease;
          height: 100%;
          position: relative;
          overflow: hidden;
        }

        .feature-card:hover {
          transform: translateY(-4px);
          border-color: var(--primary);
          box-shadow: 0 12px 40px rgba(139, 92, 246, 0.15);
        }

        .feature-icon {
          font-size: 2rem;
          margin-bottom: 1rem;
          color: ${props => props.color || 'var(--primary)'};
        }

        .feature-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: white;
          margin-bottom: 8px;
        }

        .feature-desc {
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.5;
        }

        /* Testimonial Cards */
        .testimonial-card {
          padding: 24px;
          border-radius: 16px;
          background: linear-gradient(145deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02));
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.3s ease;
          height: 100%;
        }

        .testimonial-card:hover {
          transform: translateY(-4px);
          border-color: var(--primary);
          box-shadow: 0 12px 40px rgba(139, 92, 246, 0.1);
        }

        .testimonial-rating {
          color: #FFD700;
          font-size: 0.95rem;
          margin-bottom: 16px;
        }

        .testimonial-text {
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.9);
          line-height: 1.5;
          margin-bottom: 20px;
          font-style: italic;
        }

        .testimonial-author {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .testimonial-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 1rem;
          color: white;
          flex-shrink: 0;
        }

        .testimonial-info h6 {
          font-size: 1rem;
          font-weight: 700;
          color: white;
          margin: 0 0 2px 0;
        }

        .testimonial-info small {
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.6);
        }

        /* Newsletter */
        .newsletter-form {
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-width: 100%;
          margin: 0 auto;
        }

        .newsletter-input {
          width: 100%;
          padding: 14px 20px;
          border-radius: 40px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.14);
          color: white;
          font-size: 14px;
          transition: all 0.3s ease;
        }

        .newsletter-input:focus {
          outline: none;
          border-color: var(--primary);
          background: rgba(255, 255, 255, 0.08);
          box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.1);
        }

        .newsletter-input::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }

        /* Footer */
        .footer {
          background: rgba(10, 15, 30, 0.98);
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding: 50px 0 20px;
          position: relative;
          overflow: hidden;
          margin-top: 60px;
        }

        .footer-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 16px;
        }

        .social-links {
          display: flex;
          gap: 12px;
          margin-top: 20px;
        }

        .social-link {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.06);
          color: white;
          transition: all 0.3s ease;
          text-decoration: none;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .social-link:hover, .social-link:active {
          background: var(--primary);
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(139, 92, 246, 0.3);
          border-color: transparent;
        }

        /* Amenities Grid */
        .amenities-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          margin-top: 20px;
        }

        .amenity-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.3s ease;
        }

        .amenity-item:hover {
          background: rgba(255, 255, 255, 0.08);
          transform: translateY(-2px);
          border-color: var(--primary);
        }

        .amenity-icon {
          font-size: 1rem;
          color: ${props => props.color || 'var(--primary)'};
          width: 20px;
          text-align: center;
        }

        .amenity-text h6 {
          font-size: 0.85rem;
          font-weight: 600;
          color: white;
          margin: 0 0 2px 0;
        }

        .amenity-text small {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.6);
        }

        /* CTA Section */
        .cta-section {
          position: relative;
          overflow: hidden;
          border-radius: 20px;
          margin: 40px 0;
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(59, 130, 246, 0.1));
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .cta-content {
          position: relative;
          z-index: 2;
          padding: 40px 20px;
        }

        /* Container & Grid System */
        .container {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 16px;
        }

        .row {
          display: flex;
          flex-wrap: wrap;
          margin: 0 -12px;
        }

        .col-12 {
          width: 100%;
          padding: 0 12px;
        }

        /* Responsive Design - Tablet (768px and up) */
        @media (min-width: 768px) {
          :root {
            --shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
            --shadow-lg: 0 25px 60px rgba(0, 0, 0, 0.5);
          }

          .btn-cinema {
            padding: 14px 28px;
            font-size: 15px;
            width: auto;
            max-width: none;
            margin: 0;
          }

          .hero-section {
            min-height: 90vh;
            padding: 30px 24px;
            padding-top: 80px;
          }

          .hero-eyebrow {
            font-size: 12px;
            padding: 10px 20px;
            gap: 10px;
          }

          .hero-title {
            font-size: 3rem;
          }

          .hero-description {
            font-size: 1.1rem;
            line-height: 1.6;
          }

          .hero-buttons {
            flex-direction: row;
            gap: 16px;
            justify-content: flex-start;
          }

          .hero-slider-controls {
            bottom: 30px;
            padding: 0 24px;
          }

          .slider-dot {
            width: 10px;
            height: 10px;
          }

          .slider-dot.active {
            width: 36px;
          }

          .hero-arrow {
            display: flex;
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            color: white;
            width: 48px;
            height: 48px;
            border-radius: 50%;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            z-index: 3;
            transition: all 0.3s ease;
            backdrop-filter: blur(8px);
            font-size: 1rem;
          }

          .hero-arrow:hover, .hero-arrow:active {
            background: rgba(255, 255, 255, 0.2);
            transform: translateY(-50%) scale(1.1);
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
          }

          .hero-arrow.left {
            left: 16px;
          }

          .hero-arrow.right {
            right: 16px;
          }

          .stats-section {
            padding: 50px 30px;
            border-radius: 24px;
            margin: -50px auto 0;
            max-width: calc(100% - 48px);
          }

          .stats-grid {
            grid-template-columns: repeat(4, 1fr);
            gap: 30px;
          }

          .stat-icon {
            font-size: 2.2rem;
          }

          .stat-value {
            font-size: 2.2rem;
          }

          .stat-label {
            font-size: 0.9rem;
          }

          .section-title {
            font-size: 2.2rem;
          }

          .section-subtitle {
            font-size: 1rem;
          }

          .movie-card img {
            height: 300px;
          }

          .movie-title {
            font-size: 1.3rem;
          }

          .movie-meta {
            font-size: 0.9rem;
          }

          .movie-actions .btn-cinema {
            padding: 12px 28px;
            font-size: 14px;
            min-width: 160px;
          }

          .feature-card {
            padding: 28px;
          }

          .feature-icon {
            font-size: 2.2rem;
          }

          .feature-title {
            font-size: 1.2rem;
          }

          .feature-desc {
            font-size: 0.9rem;
          }

          .testimonial-card {
            padding: 28px;
          }

          .newsletter-form {
            flex-direction: row;
            max-width: 500px;
          }

          .newsletter-input {
            font-size: 15px;
          }

          .footer {
            padding: 60px 0 30px;
            margin-top: 80px;
          }

          .footer-container {
            padding: 0 24px;
          }

          .social-links {
            gap: 14px;
          }

          .social-link {
            width: 42px;
            height: 42px;
          }

          .amenities-grid {
            grid-template-columns: repeat(4, 1fr);
            gap: 16px;
          }

          .cta-content {
            padding: 50px 40px;
          }

          .container {
            padding: 0 24px;
          }

          .row {
            margin: 0 -15px;
          }

          .col-md-6 {
            width: 50%;
            padding: 0 15px;
          }

          .col-12, .col-md-6 {
            margin-bottom: 24px;
          }

          .g-4 {
            margin: -16px;
          }

          .g-4 > [class*="col-"] {
            padding: 16px;
          }
        }

        /* Responsive Design - Desktop (992px and up) */
        @media (min-width: 992px) {
          .btn-cinema {
            padding: 16px 32px;
            font-size: 16px;
            gap: 10px;
            letter-spacing: 0.5px;
          }

          .hero-section {
            min-height: 100vh;
            padding: 40px 32px;
            padding-top: 100px;
          }

          .hero-content-wrapper {
            padding: 0 32px;
          }

          .hero-eyebrow {
            font-size: 14px;
            padding: 12px 24px;
            gap: 12px;
          }

          .hero-title {
            font-size: 4rem;
            margin-bottom: 1.25rem;
          }

          .hero-description {
            font-size: 1.25rem;
            max-width: 600px;
          }

          .hero-buttons {
            gap: 20px;
            margin-bottom: 80px;
          }

          .hero-slider-controls {
            bottom: 40px;
          }

          .hero-arrow {
            width: 56px;
            height: 56px;
            font-size: 1.2rem;
          }

          .hero-arrow.left {
            left: 24px;
          }

          .hero-arrow.right {
            right: 24px;
          }

          .stats-section {
            padding: 60px 40px;
            border-radius: 30px;
            margin: -60px auto 0;
            max-width: calc(100% - 64px);
          }

          .stat-icon {
            font-size: 2.5rem;
          }

          .stat-value {
            font-size: 2.5rem;
          }

          .section-title {
            font-size: 3rem;
          }

          .section-subtitle {
            font-size: 1.1rem;
            margin-bottom: 2rem;
          }

          .section-header {
            margin-bottom: 3rem;
          }

          .movie-card img {
            height: 350px;
          }

          .movie-content {
            padding: 28px;
          }

          .movie-title {
            font-size: 1.4rem;
          }

          .movie-meta {
            font-size: 0.95rem;
            margin-bottom: 24px;
          }

          .movie-actions .btn-cinema {
            padding: 14px 32px;
            font-size: 15px;
            min-width: 180px;
          }

          .feature-card {
            padding: 32px;
          }

          .feature-icon {
            font-size: 2.5rem;
          }

          .feature-title {
            font-size: 1.3rem;
          }

          .feature-desc {
            font-size: 0.95rem;
          }

          .testimonial-card {
            padding: 32px;
          }

          .testimonial-avatar {
            width: 56px;
            height: 56px;
          }

          .footer {
            padding: 80px 0 40px;
            margin-top: 100px;
          }

          .footer-container {
            padding: 0 32px;
          }

          .social-links {
            gap: 16px;
          }

          .social-link {
            width: 44px;
            height: 44px;
          }

          .amenities-grid {
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
          }

          .amenity-item {
            padding: 14px 16px;
          }

          .amenity-text h6 {
            font-size: 0.95rem;
          }

          .cta-content {
            padding: 60px;
          }

          .container {
            padding: 0 32px;
          }

          .col-lg-3 {
            width: 25%;
          }

          .col-lg-4 {
            width: 33.333%;
          }

          .col-lg-6 {
            width: 50%;
          }

          .g-4 {
            margin: -20px;
          }

          .g-4 > [class*="col-"] {
            padding: 20px;
          }
        }

        /* Responsive Design - Large Desktop (1200px and up) */
        @media (min-width: 1200px) {
          .hero-section {
            padding: 50px 40px;
            padding-top: 120px;
          }

          .hero-content-wrapper {
            padding: 0 40px;
          }

          .hero-title {
            font-size: 4.5rem;
          }

          .hero-description {
            font-size: 1.3rem;
          }

          .hero-arrow.left {
            left: 32px;
          }

          .hero-arrow.right {
            right: 32px;
          }

          .stats-section {
            max-width: calc(100% - 80px);
          }

          .container {
            padding: 0 40px;
          }

          .col-xl-3 {
            width: 25%;
          }

          .col-xl-6 {
            width: 50%;
          }
        }

        /* Utility Classes */
        .mb-0 { margin-bottom: 0 !important; }
        .mb-2 { margin-bottom: 8px !important; }
        .mb-3 { margin-bottom: 16px !important; }
        .mb-4 { margin-bottom: 24px !important; }
        .mb-5 { margin-bottom: 32px !important; }
        .mt-2 { margin-top: 8px !important; }
        .mt-3 { margin-top: 16px !important; }
        .mt-4 { margin-top: 24px !important; }
        .mt-5 { margin-top: 32px !important; }
        .me-2 { margin-right: 8px !important; }
        .ms-2 { margin-left: 8px !important; }
        .pt-3 { padding-top: 16px !important; }
        .pt-4 { padding-top: 24px !important; }
        .pb-3 { padding-bottom: 16px !important; }
        .pb-4 { padding-bottom: 24px !important; }

        .text-center { text-align: center !important; }
        .text-muted { color: rgba(255, 255, 255, 0.6) !important; }
        .d-flex { display: flex !important; }
        .flex-wrap { flex-wrap: wrap !important; }
        .align-items-center { align-items: center !important; }
        .justify-content-center { justify-content: center !important; }
        .justify-content-between { justify-content: space-between !important; }
        .gap-2 { gap: 8px !important; }
        .gap-3 { gap: 16px !important; }

        .border-top { border-top: 1px solid rgba(255, 255, 255, 0.1) !important; }

        .list-unstyled { list-style: none; padding-left: 0; }
        .text-decoration-none { text-decoration: none !important; }

        .mx-auto { margin-left: auto !important; margin-right: auto !important; }

        .py-4 { padding-top: 24px; padding-bottom: 24px; }
        .py-5 { padding-top: 32px; padding-bottom: 32px; }
        .py-6 { padding-top: 48px; padding-bottom: 48px; }
      `}</style>

      {/* ========================= HERO SECTION ========================= */}
      <section className="hero-section mt-0 mt-lg-3">
        {slides.map((s, i) => (
          <div
            key={s.id}
            className="hero-bg"
            style={{
              backgroundImage: `url(${s.img})`,
              opacity: i === index ? 1 : 0,
            }}
          />
        ))}

        <div className="hero-content-wrapper">
          <div className="hero-content">
            <div className="hero-eyebrow fade-in">
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: slide.color,
                  display: "inline-block",
                  boxShadow: `0 0 12px ${slide.color}`,
                  animation: "pulse 2s infinite"
                }}
              />
              {slide.eyebrow}
            </div>

            <h1 className="hero-title">
              {slide.title} <br />
              <span className="hero-highlight">{slide.highlight}</span>
            </h1>

            <p className="hero-description fade-in" style={{ animationDelay: "0.4s" }}>
              {slide.desc}
            </p>

            <div className="hero-buttons fade-in" style={{ animationDelay: "0.6s" }}>
              <button
                className="btn-cinema btn-cinema-primary"
                onClick={() => goToHref(slide.primaryHref)}
              >
                <i className="fa-solid fa-ticket" /> {slide.primaryText}
              </button>

              <button
                className="btn-cinema btn-cinema-secondary"
                onClick={() => goToHref(slide.secondaryHref)}
              >
                <i className="fa-solid fa-chair" /> {slide.secondaryText}
              </button>
            </div>
          </div>
        </div>

        <div className="hero-slider-controls">
          {slides.map((_, i) => (
            <button
              key={i}
              className={`slider-dot ${i === index ? "active" : ""}`}
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>

        <button className="hero-arrow left" onClick={prev} aria-label="Previous slide">
          <i className="fa-solid fa-chevron-left" />
        </button>

        <button className="hero-arrow right" onClick={next} aria-label="Next slide">
          <i className="fa-solid fa-chevron-right" />
        </button>
      </section>

      {/* ========================= STATS SECTION ========================= */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            {stats.map((stat, idx) => (
              <div
                key={idx}
                className="stat-card fade-in-up"
                style={{ 
                  animationDelay: `${0.5 + idx * 0.1}s`,
                }}
              >
                <div className="stat-icon">
                  <i className={stat.icon} style={{ color: stat.color }} />
                </div>
                <div className="stat-value" style={{ 
                  background: `linear-gradient(90deg, ${stat.color}, ${stat.color}AA)`,
                  WebkitBackgroundClip: 'text'
                }}>
                  {stat.value}
                </div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================= FEATURES ========================= */}
      <section className="container py-6" id="features">
        <div className="section-header text-center">
          <h2 className="section-title">Why Choose Us</h2>
          <p className="section-subtitle">
            Designed for speed, security, and seamless movie booking
          </p>
        </div>

        <div className="row g-4">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="col-12 col-md-6 col-lg-3 fade-in-up"
              style={{ animationDelay: feature.delay }}
            >
              <div 
                className="feature-card"
                style={{ 
                  background: feature.bgColor,
                  borderColor: `${feature.color}30`
                }}
              >
                <div className="feature-icon">
                  <i className={feature.icon} style={{ color: feature.color }} />
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-desc">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

{/* ========================= TRENDING NOW ========================= */}
<section className="container py-6 glass-dark" style={{ borderRadius: "20px" }}>
  <div className="section-header">
    <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
      <div>
        <div className="d-flex align-items-center gap-3 mb-2">
          <i
            className="fa-solid fa-fire"
            style={{ color: "var(--accent-2)", fontSize: "1.8rem" }}
          />
          <h2 className="section-title mb-0">Trending Now</h2>
        </div>
        <p className="section-subtitle mb-0">
          Popular movies selected for you (stable until refresh)
        </p>
      </div>

      <div className="d-flex gap-2 flex-wrap">
        <button
          className="btn-cinema btn-cinema-secondary"
          onClick={refreshHighlights}
          type="button"
        >
          Refresh <i className="fa-solid fa-rotate" />
        </button>

        <button
          className="btn-cinema btn-cinema-secondary"
          onClick={() => goToHref("#now-showing")}
          type="button"
        >
          View All <i className="fa-solid fa-arrow-right" />
        </button>
      </div>
    </div>
  </div>

  <div className="row g-4">
    {trendingDisplay.map((movie, idx) => (
      <div
        key={movie._id}
        className="col-12 col-md-6 col-lg-3 fade-in-up"
        style={{ animationDelay: `${idx * 0.1}s` }}
      >
        <div className="movie-card">
          <div className="movie-image-container">
            {idx < 2 && (
              <div className="movie-badge" style={{ background: "var(--accent-2)" }}>
                {idx === 0 ? "🔥 Hot" : "🎬 Trending"}
              </div>
            )}

            <img
              src={
                movie.posterUrl ||
                "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80"
              }
              alt={movie.title}
              loading="lazy"
            />
          </div>

          <div className="movie-content">
            <h3 className="movie-title">{movie.title}</h3>
            <div className="movie-meta">
              {movie.genre || "Action"} • {movie.durationMins || 120} min •{" "}
              {movie.language || "English"}
            </div>

            <div className="movie-actions">
              <button
                className="btn-cinema btn-cinema-primary"
                onClick={(e) => {
                  e.stopPropagation();
                  openMovie(movie);
                }}
                type="button"
              >
                <i className="fa-solid fa-ticket" /> Book Now
              </button>
            </div>
          </div>
        </div>
      </div>
    ))}

    {trendingDisplay.length === 0 && (
      <div className="text-center text-white-50 py-4">
        No trending movies available.
      </div>
    )}
  </div>
</section>

{/* ========================= TOP PICKS ========================= */}
<section className="container py-6" id="top-picks">
  <div className="section-header">
    <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
      <div className="d-flex align-items-center gap-3 mb-3">
        <i
          className="fa-solid fa-gem"
          style={{ color: "var(--primary)", fontSize: "1.8rem" }}
        />
        <div>
          <h2 className="section-title mb-0">Top Picks</h2>
          <p className="section-subtitle mb-0">
            Recommended picks (stable until refresh)
          </p>
        </div>
      </div>

      <button
        className="btn-cinema btn-cinema-secondary"
        onClick={refreshHighlights}
        type="button"
      >
        Refresh <i className="fa-solid fa-rotate" />
      </button>
    </div>
  </div>

  <div className="row g-4">
    {topPicksDisplay.map((movie, idx) => (
      <div
        key={movie._id}
        className="col-12 col-md-6 col-lg-4 fade-in-up"
        style={{ animationDelay: `${idx * 0.1}s` }}
      >
        <div className="movie-card">
          <div className="movie-image-container">
            {idx < 2 && (
              <div className="movie-badge" style={{ background: "var(--accent)" }}>
                <i className="fa-solid fa-crown" /> Popular
              </div>
            )}

            <img
              src={
                movie.posterUrl ||
                "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80"
              }
              alt={movie.title}
              loading="lazy"
            />
          </div>

          <div className="movie-content">
            <h3 className="movie-title">{movie.title}</h3>
            <div className="movie-meta">
              {movie.genre || "Drama"} • {movie.durationMins || 120} min •{" "}
              {movie.language || "English"}
            </div>

            <div className="movie-actions">
              <button
                className="btn-cinema btn-cinema-primary"
                onClick={(e) => {
                  e.stopPropagation();
                  openMovie(movie);
                }}
                type="button"
              >
                <i className="fa-solid fa-ticket" /> Book Now
              </button>
            </div>
          </div>
        </div>
      </div>
    ))}

    {topPicksDisplay.length === 0 && (
      <div className="text-center text-white-50 py-4">
        No top picks available.
      </div>
    )}
  </div>
</section>




      {/* ========================= CINEMA EXPERIENCE ========================= */}
      <section className="container py-6 glass-dark" id="cinema-experience" style={{ borderRadius: '20px' }}>
        <div className="row align-items-center">
          <div className="col-12 col-lg-6 mb-5 mb-lg-0 fade-in-up">
            <h2 className="section-title">Premium Cinema Experience</h2>
            <p className="section-subtitle">
              State-of-the-art facilities designed for ultimate movie enjoyment
            </p>

            <div className="amenities-grid">
              {amenities.map((amenity, idx) => (
                <div
                  key={idx}
                  className="amenity-item fade-in-up"
                  style={{ 
                    animationDelay: `${idx * 0.05}s`,
                    borderColor: `${amenity.color}30`
                  }}
                >
                  <div className="amenity-icon">
                    <i className={amenity.icon} style={{ color: amenity.color }} />
                  </div>
                  <div className="amenity-text">
                    <h6>{amenity.label}</h6>
                    <small>{amenity.desc}</small>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="col-12 col-lg-6 fade-in-up" style={{ animationDelay: "0.2s" }}>
            <div className="glass" style={{ borderRadius: "20px", padding: "32px", borderColor: "rgba(139, 92, 246, 0.3)" }}>
              <div className="d-flex align-items-center gap-3 mb-4">
                <i
                  className="fa-solid fa-crown"
                  style={{ color: "var(--primary)", fontSize: "2rem" }}
                />
                <h3 style={{ 
                  color: "white", 
                  fontWeight: 800, 
                  margin: 0,
                  background: "linear-gradient(90deg, white, var(--primary-light))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent"
                }}>
                  Ready for Movie Magic?
                </h3>
              </div>
              <p className="text-muted mb-4">
                Join thousands of movie lovers who choose us for their cinematic
                adventures. From blockbusters to indie gems, we've got something
                for everyone.
              </p>
              <button
                className="btn-cinema btn-cinema-primary"
                onClick={() => goToHref("#now-showing")}
              >
                <i className="fa-solid fa-ticket" /> Start Booking Now
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================= NOW SHOWING ========================= */}
      <section className="container py-6" id="now-showing">
        <div className="section-header">
          <div className="d-flex align-items-center gap-3 mb-3">
            <i
              className="fa-solid fa-film"
              style={{ color: "var(--primary)", fontSize: "1.8rem" }}
            />
            <div>
              <h2 className="section-title mb-0">Now Showing</h2>
              <p className="section-subtitle mb-0">
                Book your tickets for movies currently playing in theaters
              </p>
            </div>
          </div>
        </div>

        <div className="movies-grid-wrap">
          <MoviesGrid
            movies={movies}
            selectedMovieId={selectedMovie?._id || ""}
            onSelectMovie={openMovie}
            search={q}
            onSearch={setQ}
            loading={loadingMovies}
            error={moviesError}
            cardCols={{
              xl: 4,
              lg: 4,
              md: 6,
              sm: 12,
            }}
            showRatings={false}
          />
        </div>
      </section>

      {/* ========================= CTA SECTION ========================= */}
      <section className="container">
        <div className="cta-section">
          <div className="cta-content text-center">
            <h2 className="section-title mb-3">Don't Miss Out!</h2>
            <p className="section-subtitle mb-4 mx-auto">
              Book your favorite movies now and enjoy the best cinema experience
            </p>
            <button
              className="btn-cinema btn-cinema-primary"
              onClick={() => goToHref("#now-showing")}
            >
              <i className="fa-solid fa-ticket me-2" /> Book Tickets Now
            </button>
          </div>
        </div>
      </section>

      {/* ========================= TESTIMONIALS ========================= */}
      <section className="container py-6 glass-dark" style={{ borderRadius: '20px' }}>
        <div className="section-header text-center">
          <h2 className="section-title">What People Say</h2>
          <p className="section-subtitle mx-auto">
            Trusted by movie lovers for fast and easy booking
          </p>
        </div>

        <div className="row g-4">
          {testimonials.map((testimonial, idx) => (
            <div
              key={idx}
              className="col-12 col-md-6 col-lg-4 fade-in-up"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <div className="testimonial-card" style={{ borderColor: `${testimonial.gradient.split(' ')[0]}30` }}>
                <div className="testimonial-rating">
                  {[...Array(5)].map((_, i) => (
                    <i key={i} className="fa-solid fa-star" />
                  ))}
                </div>
                <p className="testimonial-text">"{testimonial.text}"</p>
                <div className="testimonial-author">
                  <div
                    className="testimonial-avatar"
                    style={{ background: testimonial.gradient }}
                  >
                    {testimonial.avatar}
                  </div>
                  <div className="testimonial-info">
                    <h6>{testimonial.name}</h6>
                    <small>{testimonial.role}</small>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================= NEWSLETTER ========================= */}
      <section className="container py-6">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-10 col-xl-8 text-center">
            <div className="glass" style={{ 
              borderRadius: "24px", 
              padding: "40px 24px",
              borderColor: "rgba(139, 92, 246, 0.3)" 
            }}>
              <i
                className="fa-solid fa-envelope pulse-animation"
                style={{ fontSize: "2.5rem", color: "var(--primary)", marginBottom: "20px" }}
              />
              <h2 className="section-title">Stay Updated</h2>
              <p className="section-subtitle mx-auto">
                Get exclusive offers, early access to tickets, and movie recommendations
              </p>

              <form onSubmit={submitNewsletter} className="newsletter-form mt-4">
                <input
                  type="email"
                  className="newsletter-input"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button type="submit" className="btn-cinema btn-cinema-primary">
                  <i className="fa-solid fa-paper-plane" /> Subscribe
                </button>
              </form>

              {subOk && (
                <div
                  className="mt-3 fade-in"
                  style={{
                    background: "rgba(16, 185, 129, 0.12)",
                    border: "1px solid rgba(16, 185, 129, 0.35)",
                    color: "#EFFFFA",
                    padding: "10px 16px",
                    borderRadius: "40px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    fontWeight: "600",
                    fontSize: "14px",
                  }}
                >
                  <i className="fa-solid fa-circle-check" /> Successfully subscribed!
                </div>
              )}

              <p className="text-muted mt-3 mb-0" style={{ fontSize: "14px" }}>
                We respect your privacy. Unsubscribe at any time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================= FOOTER ========================= */}
      <footer className="footer">
        <div className="footer-container">
          <div className="row">
            <div className="col-12 col-lg-4 mb-5 mb-lg-0 fade-in-up">
              <h4 className="mb-4" style={{ 
                color: "white", 
                fontWeight: 800,
                background: "linear-gradient(90deg, var(--primary), var(--secondary))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent"
              }}>
                CineBook
              </h4>
              <p className="text-muted mb-4" style={{ fontSize: "14px" }}>
                Your premier destination for cinema bookings. Experience movies like
                never before.
              </p>
              <div className="social-links">
                <a href="#" className="social-link" aria-label="Instagram">
                  <i className="fa-brands fa-instagram" />
                </a>
                <a href="#" className="social-link" aria-label="Twitter">
                  <i className="fa-brands fa-x-twitter" />
                </a>
                <a href="#" className="social-link" aria-label="Facebook">
                  <i className="fa-brands fa-facebook-f" />
                </a>
                <a href="#" className="social-link" aria-label="YouTube">
                  <i className="fa-brands fa-youtube" />
                </a>
              </div>
            </div>

            <div className="col-6 col-lg-2 mb-4 mb-lg-0 fade-in-up" style={{ animationDelay: "0.1s" }}>
              <h6 className="mb-4" style={{ color: "white", fontWeight: 700, fontSize: "15px" }}>
                Quick Links
              </h6>
              <ul className="list-unstyled">
                <li className="mb-3">
                  <a
                    href="#now-showing"
                    className="text-muted text-decoration-none"
                    style={{
                      transition: "color 0.2s",
                      fontSize: "14px"
                    }}
                    onMouseEnter={(e) => (e.target.style.color = "white")}
                    onMouseLeave={(e) => (e.target.style.color = "")}
                  >
                    Now Showing
                  </a>
                </li>
                <li className="mb-3">
                  <a
                    href="#top-picks"
                    className="text-muted text-decoration-none"
                    style={{
                      transition: "color 0.2s",
                      fontSize: "14px"
                    }}
                    onMouseEnter={(e) => (e.target.style.color = "white")}
                    onMouseLeave={(e) => (e.target.style.color = "")}
                  >
                    Top Picks
                  </a>
                </li>
                <li className="mb-3">
                  <a
                    href="#cinema-experience"
                    className="text-muted text-decoration-none"
                    style={{
                      transition: "color 0.2s",
                      fontSize: "14px"
                    }}
                    onMouseEnter={(e) => (e.target.style.color = "white")}
                    onMouseLeave={(e) => (e.target.style.color = "")}
                  >
                    Cinema Experience
                  </a>
                </li>
                <li>
                  <a
                    href="#features"
                    className="text-muted text-decoration-none"
                    style={{
                      transition: "color 0.2s",
                      fontSize: "14px"
                    }}
                    onMouseEnter={(e) => (e.target.style.color = "white")}
                    onMouseLeave={(e) => (e.target.style.color = "")}
                  >
                    Features
                  </a>
                </li>
              </ul>
            </div>

            <div className="col-6 col-lg-2 mb-4 mb-lg-0 fade-in-up" style={{ animationDelay: "0.2s" }}>
              <h6 className="mb-4" style={{ color: "white", fontWeight: 700, fontSize: "15px" }}>
                Support
              </h6>
              <ul className="list-unstyled">
                <li className="mb-3">
                  <a
                    href="/faq"
                    className="text-muted text-decoration-none"
                    style={{
                      transition: "color 0.2s",
                      fontSize: "14px"
                    }}
                    onMouseEnter={(e) => (e.target.style.color = "white")}
                    onMouseLeave={(e) => (e.target.style.color = "")}
                  >
                    FAQ
                  </a>
                </li>
                <li className="mb-3">
                  <a
                    href="/support"
                    className="text-muted text-decoration-none"
                    style={{
                      transition: "color 0.2s",
                      fontSize: "14px"
                    }}
                    onMouseEnter={(e) => (e.target.style.color = "white")}
                    onMouseLeave={(e) => (e.target.style.color = "")}
                  >
                    Help Center
                  </a>
                </li>
                <li className="mb-3">
                  <a
                    href="/refund"
                    className="text-muted text-decoration-none"
                    style={{
                      transition: "color 0.2s",
                      fontSize: "14px"
                    }}
                    onMouseEnter={(e) => (e.target.style.color = "white")}
                    onMouseLeave={(e) => (e.target.style.color = "")}
                  >
                    Refund Policy
                  </a>
                </li>
                <li>
                  <a
                    href="/terms"
                    className="text-muted text-decoration-none"
                    style={{
                      transition: "color 0.2s",
                      fontSize: "14px"
                    }}
                    onMouseEnter={(e) => (e.target.style.color = "white")}
                    onMouseLeave={(e) => (e.target.style.color = "")}
                  >
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>

            <div className="col-12 col-lg-4 fade-in-up" style={{ animationDelay: "0.3s" }}>
              <h6 className="mb-4" style={{ color: "white", fontWeight: 700, fontSize: "15px" }}>
                Download Our App
              </h6>
              <p className="text-muted mb-4" style={{ fontSize: "14px" }}>
                Get the best cinema experience on your mobile device.
              </p>
              <div className="d-flex flex-column flex-md-row gap-3">
                <button className="btn-cinema btn-cinema-secondary">
                  <i className="fa-brands fa-apple me-2" /> App Store
                </button>
                <button className="btn-cinema btn-cinema-secondary">
                  <i className="fa-brands fa-google-play me-2" /> Play Store
                </button>
              </div>
            </div>
          </div>

          <div className="row mt-5 pt-4 border-top border-secondary fade-in-up" style={{ animationDelay: "0.4s" }}>
            <div className="col-12 text-center">
              <p className="text-muted mb-0" style={{ fontSize: "14px" }}>
                © {new Date().getFullYear()} CineBook. All rights reserved. |
                <a
                  href="/privacy"
                  className="text-muted ms-2 text-decoration-none"
                  style={{
                    transition: "color 0.2s",
                    fontSize: "14px"
                  }}
                  onMouseEnter={(e) => (e.target.style.color = "white")}
                  onMouseLeave={(e) => (e.target.style.color = "")}
                >
                  Privacy Policy
                </a>
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* ========================= MODAL ========================= */}
      <ShowtimesModal
        open={modalOpen}
        onClose={closeModal}
        movie={selectedMovie}
        shows={shows}
        loading={loadingShows}
        error={showsError}
      />
    </div>
  );
}