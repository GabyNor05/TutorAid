import { FacebookLogo, InstagramLogo, LinkedinLogo, ArrowCircleUp, PhoneIcon, EnvelopeIcon } from "@phosphor-icons/react";
import BlueWallpaper from '../reusableAssets/blueWallpaper.png';

function Footer() {
  const onSubscribe = (e) => {
    e.preventDefault();
    // TODO: hook up newsletter
  };

  return (
    <footer style={{ backgroundImage: `url(${BlueWallpaper})` }} className="bg-cyan-900 mt-12 sm:mt-16 relative text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
        {/* Brand & Newsletter */}
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Tutor Aid</h2>
          <p className="text-sm text-white mb-4">
            Empowering students through quality tutoring and personal growth across South Africa.
          </p>
          <form
            className="w-full max-w-sm sm:max-w-md lg:max-w-none flex flex-col sm:flex-row gap-3 sm:gap-0"
            noValidate
          >
            <input
              type="email"
              placeholder="Enter email"
              autoComplete="email"
              className="w-full sm:w-2/3 sm:flex-1 min-w-0 p-2.5 rounded-lg sm:rounded-l-lg sm:rounded-r-none border border-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-transparent placeholder-white/80"
            />
            <button
              className="w-full sm:w-1/3 mt-0 sm:mt-0 sm:ml-2 bg-yellow-500 text-white px-4 py-2 rounded-lg sm:rounded-r-lg sm:rounded-l-none hover:bg-yellow-500 transition" onClick={onSubscribe}
            >
              Subscribe
            </button>
          </form>
        </div>

        {/* Quick Navigation */}
        <div>
          <h3 className="text-lg sm:text-xl font-semibold text-white mb-3">Quick Navigation</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="/" className="hover:text-yellow-600">Home</a></li>
            <li><a href="/about" className="hover:text-yellow-500">About Us</a></li>
            <li><a href="/tutors" className="hover:text-yellow-500">Book a Lesson</a></li>
            <li><a href="/contact" className="hover:text-yellow-500">Contact Us</a></li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h3 className="text-lg sm:text-xl font-semibold text-white mb-3">Legal</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="/terms" className="hover:text-yellow-500">Terms & Conditions</a></li>
            <li><a href="/privacy" className="hover:text-yellow-500">Privacy Policy</a></li>
            <li><a href="/refund" className="hover:text-yellow-500">Refund Policy</a></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-lg sm:text-xl font-semibold text-white mb-3">Contact</h3>
          <p className="text-sm text-white mb-2">
            45 Greenhill Road, Sandton, Johannesburg, 2196
          </p>
          <span className="text-sm text-white mb-1"><PhoneIcon size={18} /> +27 11 123 4567</span>
          <span className="text-sm text-white mb-4"><EnvelopeIcon size={18} /> tutoraid.dv200@gmail.com</span>

          <div className="flex space-x-3">
            <a href="#" aria-label="Facebook" className="p-2 rounded-full  text-white hover:bg-yellow-500">
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

      {/* Bottom bar */}
      <div className="border-t w-3/4 border-gray-200/50 mt-6 sm:mt-8 py-3 sm:py-4 text-center text-xs sm:text-sm text-gray-200/70">
        © 2025 Tutor Aid. All rights reserved.
      </div>

    </footer>
  );
}

export default Footer;
