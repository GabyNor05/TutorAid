import { FacebookLogo, InstagramLogo, LinkedinLogo, ArrowCircleUp } from "phosphor-react";

export default function Footer() {
  const onSubscribe = (e) => {
    e.preventDefault();
    // TODO: hook up newsletter
  };

  return (
    <footer className="bg-cyan-900 mt-12 sm:mt-16 relative ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
        {/* 1️⃣ Brand & Newsletter */}
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">TutorAid</h2>
          <p className="text-sm text-white mb-4">
            Empowering students through quality tutoring and personal growth across South Africa.
          </p>
          <form className="flex flex-col sm:flex-row" onSubmit={onSubscribe} noValidate>
            <input
              type="email"
              placeholder="Enter email"
              className="flex-1 p-2.5 rounded-lg sm:rounded-l-lg sm:rounded-r-none border border-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
            />
            <button
              type="submit"
              className="mt-3 sm:mt-0 sm:ml-2 bg-yellow-500 text-white px-4 py-2 rounded-lg sm:rounded-r-lg sm:rounded-l-none hover:bg-yellow-600 transition"
            >
              Subscribe
            </button>
          </form>
        </div>

        {/* 2️⃣ Quick Links */}
        <div>
          <h3 className="text-lg sm:text-xl font-semibold text-white mb-3">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="/" className="hover:text-yellow-600">Home</a></li>
            <li><a href="/about" className="hover:text-yellow-600">About Us</a></li>
            <li><a href="/tutors" className="hover:text-yellow-600">Book a Lesson</a></li>
            <li><a href="/contact" className="hover:text-yellow-600">Contact Us</a></li>
          </ul>
        </div>

        {/* 3️⃣ Legal */}
        <div>
          <h3 className="text-lg sm:text-xl font-semibold text-white mb-3">Legal</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="/terms" className="hover:text-yellow-600">Terms & Conditions</a></li>
            <li><a href="/privacy" className="hover:text-yellow-600">Privacy Policy</a></li>
            <li><a href="/refund" className="hover:text-yellow-600">Refund Policy</a></li>
          </ul>
        </div>

        {/* 4️⃣ Contact */}
        <div>
          <h3 className="text-lg sm:text-xl font-semibold text-green-800 mb-3">Contact</h3>
          <p className="text-sm text-green-800/90 mb-2">
            45 Greenhill Road, Sandton, Johannesburg, 2196
          </p>
          <p className="text-sm text-gray-700 mb-1">📞 +27 11 123 4567</p>
          <p className="text-sm text-gray-700 mb-4">✉️ info@tutoraid.co.za</p>

          <div className="flex space-x-3">
            <a href="#" aria-label="Facebook" className="p-2 rounded-full  text-white hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500">
              <FacebookLogo size={18} />
            </a>
            <a href="#" aria-label="Instagram" className="p-2 rounded-full  text-white hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500">
              <InstagramLogo size={18} />
            </a>
            <a href="#" aria-label="LinkedIn" className="p-2 rounded-full  text-white hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500">
              <LinkedinLogo size={18} />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-yellow-200 mt-6 sm:mt-8 py-3 sm:py-4 text-center text-xs sm:text-sm text-green-800/80">
        © 2025 TutorAid. All rights reserved.
      </div>

      {/* Back to top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="absolute right-4 sm:right-6 bottom-4 sm:bottom-6 bg-yellow-500 text-white p-2 sm:p-3 rounded-full shadow-lg hover:bg-yellow-600 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
        aria-label="Back to top"
      >
        <ArrowCircleUp size={18} />
      </button>
    </footer>
  );
}
