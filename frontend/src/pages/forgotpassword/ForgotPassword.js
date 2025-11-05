import React, { useState } from 'react';
import { api, endpoints } from '../../api/client';

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [userID, setUserID] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const requestCode = async (e) => {
    e.preventDefault();
    setLoading(true); setMsg('');
    try {
      await api.post(endpoints.forgotPasswordRequest(), { email });
      setStep(2);
      setMsg('If the email exists, a 6-digit code was sent. Check your inbox.');
    } catch (err) {
      setMsg(err.message || 'Failed to request code');
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async (e) => {
    e.preventDefault();
    setLoading(true); setMsg('');
    try {
      const res = await api.post(endpoints.forgotPasswordVerify(), { email, otp });
      setUserID(res.userID);
      setStep(3);
    } catch (err) {
      setMsg(err.message || 'Invalid or expired code');
    } finally {
      setLoading(false);
    }
  };

  const resetPass = async (e) => {
    e.preventDefault();
    if (!userID) return setMsg('Missing userID; verify your code again.');
    setLoading(true); setMsg('');
    try {
      await api.post(endpoints.resetPasswordById(userID), { newPassword });
      setMsg('Password reset successful. You can now sign in.');
      setStep(4);
    } catch (err) {
      setMsg(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow p-6">
        <h1 className="text-2xl font-semibold text-[#2B5561] mb-4">
          {step === 1 ? 'Forgot Password' : step === 2 ? 'Enter Code' : step === 3 ? 'Set New Password' : 'Done'}
        </h1>

        {msg && <div className="mb-3 text-sm text-gray-700">{msg}</div>}

        {step === 1 && (
          <form onSubmit={requestCode} className="space-y-4">
            <div>
              <label className="block text-sm mb-1">Email</label>
              <input
                type="email"
                className="w-full h-11 px-3 rounded-lg border-2 border-gray-300"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full h-11 rounded bg-[#2B5561] text-white font-medium hover:bg-[#2B5561]/80 disabled:opacity-60"
              disabled={loading}
            >
              {loading ? 'Sending…' : 'Send Code'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={verifyCode} className="space-y-4">
            <div>
              <label className="block text-sm mb-1">6-digit Code</label>
              <input
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                className="w-full h-11 px-3 rounded-lg border-2 border-gray-300"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full h-11 rounded bg-[#2B5561] text-white font-medium hover:bg-[#2B5561]/80 disabled:opacity-60"
              disabled={loading}
            >
              {loading ? 'Verifying…' : 'Verify Code'}
            </button>
            <button type="button" className="w-full h-11 rounded border mt-2" onClick={() => setStep(1)}>
              Back
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={resetPass} className="space-y-4">
            <div>
              <label className="block text-sm mb-1">New Password</label>
              <input
                type="password"
                minLength={8}
                className="w-full h-11 px-3 rounded-lg border-2 border-gray-300"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full h-11 rounded bg-[#2B5561] text-white font-medium hover:bg-[#2B5561]/80 disabled:opacity-60"
              disabled={loading}
            >
              {loading ? 'Resetting…' : 'Reset Password'}
            </button>
          </form>
        )}

        {step === 4 && (
          <div className="space-y-3">
            <p className="text-gray-700">Your password has been changed.</p>
            <a className="inline-block w-full text-center h-11 leading-[44px] rounded bg-[#2B5561] text-white hover:bg-[#2B5561]/80" href="/login">
              Go to Sign In
            </a>
          </div>
        )}
      </div>
    </div>
  );
}