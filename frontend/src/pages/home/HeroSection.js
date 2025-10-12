import TutoringImage from './assets/tutoring.jpg';
import BlueWallpaper from '../reusableAssets/blueWallpaper.png';
import { useNavigate } from 'react-router-dom';
import './home.css';

const HeroSection = () => {
    const navigate = useNavigate();
    const userID = localStorage.getItem("userID");

    return (
        <section className="hero">
            <div style={{backgroundImage: `url(${BlueWallpaper})`}} className="hero-content h-dvh flex flex-1 flex-col md:flex-row items-center justify-center gap-12 text-white relative bg-cover bg-center">
                <div className='m-auto h-full flex items-center px-8 md:px-16 lg:px-24 justify-center'>
                    <div className="text-center md:text-center max-w-lg">
                        <h1 className="text-3xl md:text-5xl font-bold mb-4">
                            Welcome to TutorAid
                        </h1>
                        {userID ? (
                            <>
                                <p className="text-lg md:text-xl leading-relaxed mb-6 ">
                                    Welcome back! Explore new lessons, connect with tutors, or view your progress notes.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-center ">
                                    <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-center ">
                                        <button className="login-button" onClick={() => navigate('/dashboard')}>
                                        Visit Dashboard
                                        </button>
                                        <button className="signup-button border border-yellow-400 px-6 py-3 rounded-[4px] font-semibold transition w-40 h-12 mt-5" onClick={() => navigate('/userprofile')}>
                                        View Profile
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <p className="text-lg md:text-xl leading-relaxed mb-6 ">
                                    We connect students with passionate tutors who inspire confidence,
                                    curiosity, and academic growth. Whether it’s mastering tricky
                                    concepts, preparing for exams, or building long-term skills, we
                                    create a supportive learning environment where every student can
                                    thrive.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-center ">
                                    <button className="login-button"
                                        onClick={() => navigate('/login')}>
                                        Login
                                    </button>
                                    <button className="signup-button text-white border border-yellow-400 px-6 py-3 rounded-[4px] font-semibold transition w-40 h-12 mt-5"
                                        onClick={() => navigate('/signup')}>
                                        Sign Up
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
                <div className="relative h-full w-1/2 ml-auto flex items-center">
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
