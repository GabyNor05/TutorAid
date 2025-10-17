import React, { useEffect, useState } from 'react';
import { api, endpoints } from '../../api/client';
import { useNavigate } from 'react-router-dom';
import './home.css';
import logo from '../reusableAssets/logo.png';
import TutorCards from './TutorCards';
import HeroSection from './HeroSection';  
import FAQSection from './FAQSection';  
import Footer from './Footer';


function Home() {
  const navigate = useNavigate();
  const [tutors, setTutors] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState(null);

  // API base is centralized in api/client.js
  useEffect(() => {
    const load = async () => {
      try {
        const [tutorsJson, subjectsJson] = await Promise.all([
          api.get(endpoints.tutors()),
          api.get(endpoints.subjects()),
        ]);
        setTutors(Array.isArray(tutorsJson) ? tutorsJson : []);
        setSubjects(Array.isArray(subjectsJson) ? subjectsJson : []);
      } catch (e) {
        console.error('Home load error:', e);
        setErr(e.message || 'Failed to load');
        setTutors([]);
        setSubjects([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const tutorsArr = Array.isArray(tutors) ? tutors : [];
  const subjectsArr = Array.isArray(subjects) ? subjects : [];

  const tutorSubjectsSet = new Set();
  tutorsArr.forEach(t => {
    if (typeof t?.subjects === 'string') {
      t.subjects.split(',').forEach(s => s && tutorSubjectsSet.add(s.trim()));
    } else if (Array.isArray(t?.subjects)) {
      t.subjects.forEach(s => s && tutorSubjectsSet.add(s.trim()));
    }
  });
  const filteredSubjects = subjectsArr.filter(s => s?.name && tutorSubjectsSet.has(s.name));

  if (loading) return <div style={{ padding: 24 }}>Loading…</div>;
  if (err) return <div style={{ padding: 24, color: 'crimson' }}>Error: {err}</div>;

  return (
    <div className="">
        
        <div className="home-background min-h-screen flex flex-col">
            <header className="home-header">
                <HeroSection />   
            </header>
            <main className="main-content">
                <div className="w-full px-4">
                    <h2 className="mt-8 mb-11">Available Subjects</h2>
            
            <div className="subject-tags flex flex-wrap gap-2 mb-4 items-center justify-center ">
                {filteredSubjects.map(subject => (
                    <span key={subject.subjectID} className="tag bg-cyan-800 text-white px-3 py-1 rounded-lg font-medium">
                        {subject.name}
                    </span>
                ))}
            </div>
                </div>
            
            <div className="carousel flex gap-4 overflow-x-auto py-4 ">
                <div className="w-full px-4">
                    <h2 className="mt-8 mb-11">Available tutors</h2>
                    <div className="flex space-x-4 m-5 gap-2 items-center justify-center">
                    {Array.isArray(tutors) && tutors.map(tutor => (
                        <TutorCards
                            key={tutor.tutorID}
                            tutor={tutor}
                            onClick={() => {
                                setSelectedTutor(tutor);
                                setModalOpen(true);
                            }}
                        />
                    ))}
                    </div>
                </div>
            </div>
            <h2 className="mt-8 mb-11">Frequently Asked Questions</h2>
            <FAQSection />
        </main>
        </div>
        <footer className="mt-auto">
            <Footer />
        </footer>

        {modalOpen && selectedTutor && (
<div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
    <div className="bg-white rounded-lg shadow-lg flex w-[900px] h-[500px] overflow-hidden relative">
        {/* Close button */}
        <button
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-5xl"
            onClick={() => setModalOpen(false)}
        >
            &times;
        </button>
        {/* Image section */}
        <div className="flex-shrink-0 w-1/3 h-full flex items-center justify-center bg-gray-100">
            <img
                src={selectedTutor.image}
                alt={selectedTutor.name}
                className="h-full w-full rounded-s object-cover"
            />
        </div>
        {/* Details section */}
        <div className="flex flex-col justify-center p-8 w-2/3">
            <h2 className="text-2xl font-bold mb-5">{selectedTutor.name}</h2>
            <p className="text-gray-700 mb-2"><span className="font-semibold">Subjects:</span> {selectedTutor.subjects}</p>
            <p className="text-gray-700 mb-2"><span className="font-semibold">Fee per hour:</span> R{selectedTutor.fee_per_hour}</p>
            <p className="text-gray-700 mb-2"><span className="font-semibold">Experience:</span> {selectedTutor.experience}</p>
            {selectedTutor.bio && (
                <p className="text-gray-600 mt-4">{selectedTutor.bio}</p>
            )}
            {/* Add more details as needed */}
        </div>
    </div>
</div>
)}
    </div>
  );
}

export default Home;