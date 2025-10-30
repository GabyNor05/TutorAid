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

// ADD: helpers to normalize and extract subjects from tutors
function normalizeSubjectName(s) {
  if (!s) return '';
  const t = String(s).trim();
  const lower = t.toLowerCase();
  if (lower === 'afrikans') return 'Afrikaans';
  return t;
}
function extractSubjectsFromTutors(tutors) {
  const out = new Map(); // key: lower-case -> display value
  (Array.isArray(tutors) ? tutors : []).forEach(t => {
    const subj = t?.subjects;
    if (!subj) return;
    const arr = Array.isArray(subj) ? subj : String(subj).split(',');
    arr.forEach(x => {
      const n = normalizeSubjectName(x);
      if (!n) return;
      const key = n.toLowerCase();
      if (!out.has(key)) out.set(key, n);
    });
  });
  return Array.from(out.values()).sort((a, b) => a.localeCompare(b));
}
function subjectMatches(tutor, subject) {
  if (!tutor || !subject) return false;
  const target = normalizeSubjectName(subject).toLowerCase();
  const subj = tutor.subjects;
  const arr = Array.isArray(subj) ? subj : String(subj || '').split(',');
  return arr.some(x => normalizeSubjectName(x).toLowerCase() === target);
}

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
  const [subjects, setSubjects] = useState([]); // kept but no longer used for display
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [loadingTutorDetails, setLoadingTutorDetails] = useState(false);

  // ADD: derived subjects and selected subject filter
  const [subjectsFromTutors, setSubjectsFromTutors] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [tutorsJson, subjectsJson] = await Promise.all([
          api.get(endpoints.tutors()),
          api.get(endpoints.subjects()),
        ]);
        const tArr = Array.isArray(tutorsJson) ? tutorsJson : [];
        setTutors(tArr);
        setSubjects(Array.isArray(subjectsJson) ? subjectsJson : []);
        // compute subjects only from tutors
        setSubjectsFromTutors(extractSubjectsFromTutors(tArr));
      } catch (e) {
        console.error('Home load error:', e);
        setErr(e.message || 'Failed to load');
        setTutors([]);
        setSubjects([]);
        setSubjectsFromTutors([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Recompute subjects when tutors change (e.g., future updates)
  useEffect(() => {
    setSubjectsFromTutors(extractSubjectsFromTutors(tutors));
  }, [tutors]);

  const formatSubjects = (subs) => {
    if (Array.isArray(subs)) return subs.filter(Boolean).join(', ');
    if (typeof subs === 'string') return subs;
    return '—';
  };

  // ADD: filter tutors by selected subject (client-side)
  const tutorsArr = Array.isArray(tutors) ? tutors : [];
  const displayedTutors = selectedSubject
    ? tutorsArr.filter(t => subjectMatches(t, selectedSubject))
    : tutorsArr;

  const onSubjectClick = (subject) => {
    setSelectedSubject(prev => (prev === subject ? '' : subject)); // toggle
  };

  const openTutorModal = async (tutor) => {
    setSelectedTutor(tutor);
    setModalOpen(true);
    try {
      setLoadingTutorDetails(true);

      // Prefer full tutor profile by userID; fallback by tutorID
      let full = null;
      try {
        full = await api.get(endpoints.tutorByUser(tutor.userID));
      } catch {}
      if (!full) {
        try {
          full = await api.get(endpoints.tutorById(tutor.tutorID));
        } catch {}
      }
      if (full) {
        setSelectedTutor(prev => ({
          ...prev,
          ...full,
          subjects: formatSubjects(full.subjects),
        }));
      }
    } catch (e) {
      console.warn('Failed to load tutor details:', e);
    } finally {
      setLoadingTutorDetails(false);
    }
  };

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
            {/* Clear filter pill (only when a subject is selected) */}
            {selectedSubject && (
              <button
                type="button"
                onClick={() => setSelectedSubject('')}
                className="tag bg-gray-200 text-gray-700 px-3 py-1 rounded-lg font-medium text-sm sm:text-base"
                aria-label="Clear subject filter"
              >
                Show all
              </button>
            )}
            {/* Render only subjects derived from tutors */}
            {subjectsFromTutors.map(subject => (
              <button
                key={subject}
                type="button"
                onClick={() => onSubjectClick(subject)}
                className={`tag px-3 py-1 rounded-lg font-medium text-sm sm:text-base transition
                  ${selectedSubject === subject
                    ? 'bg-cyan-900 text-white'
                    : 'bg-cyan-800 text-white hover:bg-cyan-700'}`}
                aria-pressed={selectedSubject === subject}
              >
                {subject}
              </button>
            ))}
          </div>
        </section>

        {/* Tutors */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-cyan-800 mt-12 mb-5 text-center">
            {selectedSubject ? `Tutors for ${selectedSubject}` : 'Available Tutors'}
          </h2>

          {selectedSubject && displayedTutors.length === 0 && (
            <div className="text-center text-gray-600 mb-4">
              No tutors found for {selectedSubject}. Try another subject.
            </div>
          )}

          <div className="hidden sm:grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {displayedTutors.map(tutor => (
              <TutorCards
                key={tutor.tutorID}
                tutor={tutor}
                onClick={() => openTutorModal(tutor)}
              />
            ))}
          </div>

          <div className="sm:hidden flex gap-3 overflow-x-auto py-2 snap-x snap-mandatory">
            {displayedTutors.map(tutor => (
              <div key={tutor.tutorID} className="snap-center">
                <TutorCards
                  tutor={tutor}
                  onClick={() => openTutorModal(tutor)}
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
              {loadingTutorDetails && <div className="text-sm text-gray-500 mb-2">Loading details…</div>}
              <dl className="space-y-2 text-sm md:text-base">
                <div><span className="font-semibold">Subjects:</span> {selectedTutor.subjects || '—'}</div>
                <div><span className="font-semibold">Fee per hour:</span> {selectedTutor.fee_per_hour != null ? `R${selectedTutor.fee_per_hour}` : '—'}</div>
                <div><span className="font-semibold">Experience:</span> {selectedTutor.experience || '—'}</div>
                <div><span className="font-semibold">Qualifications:</span> {selectedTutor.qualifications || '—'}</div>
                <div><span className="font-semibold">Bio:</span> {selectedTutor.bio || '—'}</div>
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