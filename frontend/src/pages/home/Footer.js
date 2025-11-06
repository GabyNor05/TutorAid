import { FacebookLogo, InstagramLogo, LinkedinLogo, ArrowCircleUp, PhoneIcon, EnvelopeIcon } from "@phosphor-icons/react";
import BlueWallpaper from '../reusableAssets/blueWallpaper.png';
import React, { useState } from 'react';
import { api, endpoints } from "../../api/client";
import { analytics } from "../../lib/analytics";

function Footer() {
  const [name, setName] = useState("");              // ADD
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState("");

  const onSubscribe = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setMsg("");

    const clean = String(email || '').trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
      setMsg("Please enter a valid email.");
      return;
    }

    setSubmitting(true);
    try {
      await api.post(endpoints.newsletterSubscribe(), { email: clean, name }); 
      setMsg("Thanks for subscribing! Please check your email.");
      const domain = clean.split('@')[1] || '';
      analytics.event('newsletter_subscribed', { placement: 'footer', email_domain: domain });
      setName(""); 
      setEmail("");
    } catch (err) {
      console.error('Subscribe failed:', err);
      setMsg("Subscription failed. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer style={{ backgroundImage: `url(${BlueWallpaper})` }} className="bg-cyan-900 mt-12 sm:mt-16 relative text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 flex flex-col sm:flex-row gap-8 sm:gap-10 justify-center sm:items-start items-start justify-items-center">
        {/* Brand & Newsletter */}
        <div className="sm:w-1/3 w-full">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Tutor Aid</h2>
          <p className="text-sm text-white mb-4">
            Empowering students through quality tutoring and personal growth across South Africa.
          </p>
          <form
            className="w-full flex flex-col justify-center items-center gap-2"
            noValidate
            onSubmit={onSubscribe}
          >
            <input type="text"
              placeholder="Enter name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full sm:flex-1 min-w-0 p-2.5 rounded-lg border border-white focus:outline-none focus:ring-2  bg-transparent placeholder-white/80 h-10"
              required
            />
            <div className="w-full flex flex-col sm:flex-row gap-2 sm:gap-0 h-10">
              <input
              type="email"
              placeholder="Enter email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full sm:flex-1 min-w-0 p-2.5 rounded-lg border border-white focus:outline-none focus:ring-2  bg-transparent placeholder-white/80 h-10"
              required
            />
            <button
              type="submit"
              disabled={submitting}
              className="bg-gradient-to-l from-[#E9AD53] to-[#866026]  w-full sm:w-1/3 mt-0 sm:mt-0 sm:ml-2 transition h-10"
            >
              {submitting ? 'Subscribing…' : 'Subscribe'}
            </button>
            </div>

          </form>
          {msg && <div className="mt-2 text-sm">{msg}</div>}
        </div>
        <div className="flex flex-col m-auto w-fit sm:flex-row gap-8 sm:gap-10 justify-center sm:place-items-start items-center">
          {/* Quick Navigation */}
        <div className="flex flex-col justify-center items-center text-center sm:items-start sm:text-left ">
          <h3 className="text-lg sm:text-xl font-semibold text-white mb-3">Quick Navigation</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="/" className="hover:text-yellow-500">Home</a></li>
            <li><a href="/about" className="hover:text-yellow-500">About Us</a></li>
            <li><a href="/tutors" className="hover:text-yellow-500">Book a Lesson</a></li>
            <li><a href="/contact" className="hover:text-yellow-500">Contact Us</a></li>
          </ul>
        </div>

        {/* Legal */}
        <div className="flex flex-col justify-center items-center text-center sm:items-start sm:text-left">
          <h3 className="text-lg sm:text-xl font-semibold text-white mb-3">Legal</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="/terms" className="hover:text-yellow-500">Terms & Conditions</a></li>
            <li><a href="/privacy" className="hover:text-yellow-500">Privacy Policy</a></li>
            <li><a href="/refund" className="hover:text-yellow-500">Refund Policy</a></li>
          </ul>
        </div>

        {/* Contact */}
        <div className="flex flex-col justify-center items-center text-center sm:items-start sm:text-left">
          <h3 className="text-lg sm:text-xl font-semibold text-white mb-3">Contact</h3>
          <p className="text-sm text-white mb-2">
            45 Greenhill Road, Sandton, Johannesburg, 2196
          </p>
          <div>
            <span className="flex flex-row gap-2 text-sm text-white mb-1 "><PhoneIcon size={18} /> +27 11 123 4567</span>
          </div>
          
          <span className=" flex flex-row gap-2 text-sm text-white mb-4"><EnvelopeIcon size={18} /> tutoraid.dv200@gmail.com</span>

          <div className="flex space-x-3">
            <a href="#" aria-label="Facebook" className="p-2 rounded-full  text-white hover:text-yellow-500">
              <FacebookLogo size={24} />
            </a>
            <a href="#" aria-label="Instagram" className="p-2 rounded-full  text-white hover:text-yellow-500 ">
              <InstagramLogo size={24} />
            </a>
            <a href="#" aria-label="LinkedIn" className="p-2 rounded-full  text-white hover:text-yellow-500">
              <LinkedinLogo size={24} />
            </a>
          </div>
        </div>
        </div>
        
      </div>

      {/* Bottom bar */}
      <div className="flex justify-center items-center border-t w-full border-gray-200/50 mt-6 sm:mt-8 py-3 sm:py-4 text-center text-xs sm:text-sm text-gray-200/70">
        © 2025 Tutor Aid. All rights reserved.
      </div>

    </footer>
  );
}

export default Footer;
