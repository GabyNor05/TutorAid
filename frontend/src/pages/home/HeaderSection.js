import React from 'react';
import { useNavigate } from 'react-router';
import Illustration from './assets/tutoring.jpg';
import blueWallpaper from '../reusableAssets/blueWallpaper.png';
import './home.css';

function HeaderSection() {
    const navigate = useNavigate();
  return (
    <div className="bg-cyan-800 relative min-h-screen bg-cover bg-center text-white flex flex-col">
      
      {/* Hero Section */}
      <div className="flex flex-1 flex-col md:flex-row items-center justify-center px-8 md:px-16 lg:px-24 gap-12">
        {/* Left: Logo and Welcome Text */}
        <div className="text-center md:text-left max-w-lg">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Welcome to <span className="text-yellow-400">TutorAid</span>
          </h1>
          <p className="text-lg leading-relaxed mb-6">
            We connect students with passionate tutors who inspire confidence,
            curiosity, and academic growth. Whether it’s mastering tricky
            concepts, preparing for exams, or building long-term skills, we
            create a supportive learning environment where every student can
            thrive.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <button className="login-button bg-gradient-to-r from-yellow-500 to-orange-500 px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition" onClick={() => navigate('/login')}>
              Login
            </button>
            <button className="border border-yellow-400 px-6 py-3 rounded-lg font-semibold hover:bg-yellow-400 hover:text-black transition">
              Learn More
            </button>
          </div>
        </div>

        {/* Right: Hero Illustration */}
        <div className="absolute bottom-0 right-0 w-[500px] md:w-[600px] lg:w-[700px] pointer-events-none">
          <img
            src={Illustration}
            alt="Students illustration"
            className="w-full h-auto object-contain"
          />
        </div>

        <div style={{ backgroundImage: `url(${blueWallpaper})` }} className="header-bg absolute inset-0 bg-cover opacity-10 pointer-events-none"></div>

      </div>
    </div>
  );
}

export default HeaderSection;
