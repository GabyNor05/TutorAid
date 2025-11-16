import React, {useState, useEffect} from 'react';
import './css/onboarding.css';
import onboardingImage from './assets/calendarImage.png';
import { useNavigate } from 'react-router-dom';
import { api, endpoints } from '../../api/client';

export default function Onboarding2() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [role, setRole] = useState('');
  const [funFact, setFunFact] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [feePerHour, setFeePerHour] = useState('');
  const [expValue, setExpValue] = useState('');
  const [expUnit, setExpUnit] = useState('years');
  const [tutorErrors, setTutorErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const id = localStorage.getItem('userID');
    if (!id) { navigate('/login'); return; }

    (async () => {
      try {
        const u = await api.get(endpoints.userById(id));
        setUser(u);
        setRole(u?.role || '');
        setFunFact(u?.funFact || '');
        setPreview(u?.image || '');

        if (u?.role === 'Tutor') {
          const t = await api.get(endpoints.tutorByUser(id)).catch(() => null);
          if (t) {
            if (t.fee_per_hour != null) setFeePerHour(String(t.fee_per_hour));
            if (t.experience) {
              const m = String(t.experience).match(/^(\d+)\s+(years|months)$/i);
              if (m) { setExpValue(m[1]); setExpUnit(m[2].toLowerCase()); }
            }
          }
        }
      } catch {
        // ignore
      }
    })();
  }, [navigate]);

  const validateTutorExtras = () => {
    const e = {};
    if (role === 'Tutor') {
      if (!feePerHour) e.feePerHour = 'Rate is required';
      if (!expValue) e.expValue = 'Experience value is required';
    }
    setTutorErrors(e);
    return e;
  };

  const onFile = (e) => {
    const f = e.target.files?.[0];
    setFile(f || null);
    if (f) setPreview(URL.createObjectURL(f));
  };

  const onSave = async () => {
    if (!user?.userID) return;
    const e = validateTutorExtras();
    if (Object.keys(e).length) return;

    setLoading(true);
    setError('');
    try {
      // 1) Update user image + funFact
      const form = new FormData();
      if (file) form.append('image', file);
      form.append('funFact', funFact || '');

      await api.put(endpoints.userById(user.userID), form);
      const tutorIsSelected = localStorage.getItem('selectedTutorID');

      // 2) Tutor extras
      if (role === 'Tutor') {
        const experience = expValue ? `${expValue} ${expUnit}` : '';
        await api.put(endpoints.tutorByUser(user.userID), {
          fee_per_hour: feePerHour ? Number(feePerHour) : 0,
          experience,
        });
      }

      if (tutorIsSelected !== null && role === "Student") {
        navigate("/booking");
        return;
      }else{
        navigate('/dashboard');
        return;
      }
      
    } catch (e) {
      setError(e.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-background min-h-dvh flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-5xl h-[75dvh] bg-white rounded-2xl shadow-md overflow-hidden grid grid-cols-1 md:grid-cols-2 items-stretch min-h-0">
        {/* Image */}
        <div className="hidden md:block bg-cyan-700/5 h-full min-h-0">
          <img src={onboardingImage} alt="onboarding step 2" className="h-full w-full object-cover" />
        </div>

        {/* Form */}
        <div className="h-full min-h-0 p-6 sm:p-8 overflow-y-auto flex flex-col justify-center items-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#2B5561] mb-6 text-center md:text-center">
            Make your profile yours
          </h2>

          <div className="space-y-4 w-full">
            {/* Photo */}
            <div className="flex flex-col items-start gap-3">
              <label className="min-w-28 pt-2">Photo</label>
              <div className="flex flex-col items-start gap-4 w-full">
                <div className="w-20 h-20 rounded-lg bg-gray-100 overflow-hidden border">
                  {preview ? <img src={preview} alt="preview" className="w-full h-full object-cover" /> :
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No image</div>}
                </div>
                <input
                  type="file" accept="image/*" onChange={onFile}
                  className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-[#2B5561] file:text-white hover:file:bg-[#2B5561]/80"
                />
              </div>
            </div>

            {/* Fun fact */}
            <div className="flex flex-col items-start gap-3">
              <label className="min-w-28 pt-2">Fun fact (Optional)</label>
              <input
                type="text" placeholder="Optional" value={funFact}
                onChange={(e) => setFunFact(e.target.value)}
                className="bg-transparent h-12 p-2 rounded-lg border-2 border-gray-300 shadow-inner w-full focus:outline-none focus:ring-2 focus:ring-[#2B5561]"
              />
            </div>

            {error && <div className="text-red-600 text-xs">{error}</div>}

            <button
              className="w-full h-11 rounded-lg bg-[#2B5561] hover:bg-[#2B5561]/80 text-white font-semibold transition disabled:opacity-60"
              type="button"
              onClick={onSave}
              disabled={loading}
            >
              {loading ? 'Saving…' : 'Finish'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}