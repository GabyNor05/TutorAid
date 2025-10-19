import React, { useEffect, useState } from 'react';
import { api, endpoints } from '../../api/client';
import { useNavigate } from 'react-router-dom';
import './home.css';
import logo from '../reusableAssets/logo.png';
import TutorCards from './TutorCards';
import HeroSection from './HeroSection';
import FAQSection from './FAQSection';
import Footer from './Footer';
import { useSEO } from '../../lib/seo';

function Home() {
  useSEO({
    title: 'Tutor Aid',
    description: 'University Project: Book vetted tutors for Maths, Science, English and more. Manage lessons and track progress with Tutor Aid.',
    keywords: 'tutoring, South Africa, maths tutor Johannesburg, online tutoring, private tutor, Cape Town, high school tutoring, exam prep',
    canonical: 'https://gabydv.xyz/',
    jsonLd: {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Tutor Aid",
    "url": "https://gabydv.xyz/",
    "logo": "https://gabydv.xyz/favicon_io/android-chrome-512x512.png"
  }
  });

  const navigate = useNavigate();
  const [tutors, setTutors] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState(null);

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

  if (loading) return <div className="p-6">Loading…</div>;
  if (err) return <div className="p-6 text-red-600">Error: {err}</div>;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="home-header">
        <HeroSection />
      </header>

      <main className="flex-1">
        {/* Subjects */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-cyan-800 mt-8 mb-5 text-center">Available Subjects</h2>
          <div className="flex flex-wrap gap-2 sm:gap-3 items-center justify-center">
            {filteredSubjects.map(subject => (
              <span
                key={subject.subjectID}
                className="tag bg-cyan-800 text-white px-3 py-1 rounded-lg font-medium text-sm sm:text-base"
              >
                {subject.name}
              </span>
            ))}
          </div>
        </section>

        {/* Tutors */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-cyan-800 mt-12 mb-5 text-center">Available Tutors</h2>

          {/* Grid on ≥sm, horizontal scroll on xs */}
          <div className="hidden sm:grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {tutorsArr.map(tutor => (
              <TutorCards
                key={tutor.tutorID}
                tutor={tutor}
                onClick={() => { setSelectedTutor(tutor); setModalOpen(true); }}
              />
            ))}
          </div>

          <div className="sm:hidden flex gap-3 overflow-x-auto py-2 snap-x snap-mandatory">
            {tutorsArr.map(tutor => (
              <div key={tutor.tutorID} className="snap-center">
                <TutorCards
                  tutor={tutor}
                  onClick={() => { setSelectedTutor(tutor); setModalOpen(true); }}
                />
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-cyan-800 mt-12 mb-5 text-center">
            Frequently Asked Questions
          </h2>
          <FAQSection />
        </section>
      </main>

      <footer className="mt-12">
        <Footer />
      </footer>

      {/* Tutor modal */}
      {modalOpen && selectedTutor && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-[95vw] max-w-4xl max-h-[90vh] overflow-auto flex flex-col md:flex-row relative">
            {/* Close */}
            <button
              className="absolute top-3 right-4 text-gray-500 hover:text-gray-700 text-3xl"
              onClick={() => setModalOpen(false)}
              aria-label="Close"
            >
              &times;
            </button>

            {/* Image */}
            <div className="w-full md:w-1/3 md:h-auto h-48 flex items-center justify-center bg-gray-100">
              <img
                src={selectedTutor.image}
                alt={selectedTutor.name}
                onError={(e) => { e.currentTarget.src = logo; }}
                className="h-full w-full object-cover"
              />
            </div>

            {/* Details */}
            <div className="flex-1 p-6 md:p-8">
              <h2 className="text-xl md:text-2xl font-bold mb-4">{selectedTutor.name}</h2>
              <dl className="space-y-2 text-sm md:text-base">
                <div><span className="font-semibold">Subjects:</span> {selectedTutor.subjects}</div>
                <div><span className="font-semibold">Fee per hour:</span> R{selectedTutor.fee_per_hour}</div>
                <div><span className="font-semibold">Experience:</span> {selectedTutor.experience}</div>
              </dl>
              {selectedTutor.bio && (
                <p className="text-gray-600 mt-4">{selectedTutor.bio}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;