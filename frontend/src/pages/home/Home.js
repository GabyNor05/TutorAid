/* I need a home page layout with a header, main content area, and footer. 
In the header, I want a logo on the left and navigation links on the right. The main content area should have a welcome message,tags for all available subjects, carousel (with for tutors; image, names and subjects). The footer should contain copyright information and links to privacy policy and terms of service. 

This page should be responsive and work well on both desktop and mobile devices.*/
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './home.css';
import logo from '../reusableAssets/logo.png';
import TutorCards from './TutorCards';
import HeaderSection from './HeaderSection';

function Home() {
    const navigate = useNavigate();
    const [tutors, setTutors] = useState([]);
    const [subjects, setSubjects] = useState([]);

    useEffect(() => {
        // Replace with your actual backend endpoint
        fetch("http://localhost:5000/api/tutors")
            .then(res => res.json())
            .then(data => {
                console.log("Tutors data:", data);
                setTutors(data);
            })
            .catch(err => console.error("Failed to fetch tutors:", err));

        fetch("http://localhost:5000/api/subjects")
            .then(res => res.json())
            .then(data => setSubjects(data))
            .catch(err => console.error("Failed to fetch subjects:", err));
    }, []);

    return (
        <div className="">
            
            <div className="home-background min-h-screen flex flex-col">
                <header className="home-header">
                    <HeaderSection />
                </header>
                <main className="main-content">
                <h1>Welcome to TutorAid</h1>
                <p>Your one-stop solution for finding the best tutors.</p>
                <div className="subject-tags flex flex-wrap gap-2 mb-4">
                    {subjects.map(subject => (
                        <span key={subject.subjectID} className="tag bg-cyan-100 text-cyan-800 px-3 py-1 rounded-full font-medium">
                            {subject.name}
                        </span>
                    ))}
                </div>
                <div className="carousel flex gap-4 overflow-x-auto py-4">
                    <div className="w-full px-4">
                        <h2 className="text-lg font-semibold mb-3">Popular tutors</h2>
                        <div className="flex space-x-4 m-5 gap-2">
                        {Array.isArray(tutors) && tutors.map(tutor => (
                            <TutorCards key={tutor.tutorID} tutor={tutor} />
                        ))}
                        </div>
                    </div>
                </div>
            </main>
            </div>
            <footer className="footer">
                <p>&copy; 2023 TutorAid. All rights reserved.</p>
                <ul>
                    <li><a href="#privacy">Privacy Policy</a></li>
                    <li><a href="#terms">Terms of Service</a></li>
                </ul>
            </footer>
        </div>
    );
}

export default Home;