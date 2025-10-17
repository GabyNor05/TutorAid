import TutoringImage from './assets/tutoring.jpg';
import BlueWallpaper from '../reusableAssets/blueWallpaper.png';
import { useNavigate } from 'react-router-dom';
import './home.css';

const HeroSection = () => {
  const navigate = useNavigate();
  const userID = localStorage.getItem("userID");

  return (
    <section className="hero">
      <div
        style={{ backgroundImage: `url(${BlueWallpaper})` }}
        className="hero-content min-h-[70vh] md:min-h-[80vh] flex flex-1 flex-col md:flex-row items-center justify-center gap-10 text-white relative bg-cover bg-center"
      >
        {/* Text */}
        <div className="m-auto h-full flex items-center px-6 sm:px-10 lg:px-16 justify-center">
          <div className="text-center md:text-left max-w-xl">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">Welcome to TutorAid</h1>
            {userID ? (
              <>
                <p className="text-base md:text-xl leading-relaxed mb-6">
                  Welcome back! Explore new lessons, connect with tutors, or view your progress notes.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                  <button className="login-button" onClick={() => navigate('/dashboard')}>
                    Visit Dashboard
                  </button>
                  <button
                    className="signup-button text-white border border-yellow-400 px-6 py-3 rounded-[4px] font-semibold transition w-40 h-12 mt-2 sm:mt-0"
                    onClick={() => navigate('/userprofile')}
                  >
                    View Profile
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-base md:text-xl leading-relaxed mb-6">
                  We connect students with passionate tutors who inspire confidence, curiosity, and academic growth.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                  <button className="login-button" onClick={() => navigate('/login')}>Login</button>
                  <button
                    className="signup-button text-white border border-yellow-400 px-6 py-3 rounded-[4px] font-semibold transition w-40 h-12 mt-2 sm:mt-0"
                    onClick={() => navigate('/signup')}
                  >
                    Sign Up
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Image (hide on small screens) */}
        <div className="relative h-56 sm:h-72 md:h-full w-full md:w-1/2 ml-auto hidden md:block">
          <img
            src={TutoringImage}
            alt="Tutoring"
            className="h-full w-full object-cover [mask-image:linear-gradient(-230deg,transparent_20%,black_100%)]"
          />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
