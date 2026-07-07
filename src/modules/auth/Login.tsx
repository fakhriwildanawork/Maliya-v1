import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../../logic/context/AuthContext';
import { KeyRound, ShieldAlert, CheckCircle2, Loader2, Lock } from 'lucide-react';
import Swal from 'sweetalert2';
import { MALIYA_LOGO_URL } from '../../assets';

export default function Login() {
  const { login } = useAuth();
  const [accessCode, setAccessCode] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessCode.trim() || !password) {
      setErrorMsg('Access code and password are required');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const result = await login(accessCode, password);
      if (!result.success) {
        if (result.error === 'KODE_NOT_FOUND') {
          setErrorMsg('Access code is not registered. Please contact your family administrator.');
        } else if (result.error === 'WRONG_PASSWORD') {
          setErrorMsg('Incorrect password. Please try again.');
        } else {
          setErrorMsg('A system error occurred. Please try again later.');
        }
      } else {
        // Success feedback in English
        Swal.fire({
          icon: 'success',
          title: 'Welcome Back!',
          text: 'Successfully logged in to Maliya.',
          showConfirmButton: false,
          timer: 1500,
          customClass: {
            popup: 'rounded-[1.5rem]'
          }
        });
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-screen h-screen flex items-center justify-center bg-gray-950 overflow-hidden select-none">
      
      {/* Green Plasma Animated Gradient Background */}
      <div className="absolute inset-0 z-0 bg-radial-[circle_at_center,rgba(6,78,59,0.15)_0%,rgba(9,9,11,1)_100%]">
        {/* Plasma Orb 1 */}
        <motion.div
          className="absolute w-[35rem] h-[35rem] rounded-full bg-emerald-500/20 blur-[6.25rem] -top-[5rem] -left-[5rem]"
          animate={{
            x: [0, 50, -30, 0],
            y: [0, -40, 60, 0],
            scale: [1, 1.1, 0.9, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Plasma Orb 2 */}
        <motion.div
          className="absolute w-[40rem] h-[40rem] rounded-full bg-green-500/15 blur-[7.5rem] -bottom-[10rem] -right-[5rem]"
          animate={{
            x: [0, -60, 40, 0],
            y: [0, 50, -40, 0],
            scale: [1, 0.95, 1.05, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Plasma Orb 3 */}
        <motion.div
          className="absolute w-[25rem] h-[25rem] rounded-full bg-teal-500/10 blur-[5rem] top-[25%] left-[35%]"
          animate={{
            x: [0, 80, -50, 0],
            y: [0, 60, -80, 0],
            scale: [1, 1.05, 0.9, 1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* Grid pattern overlay for techy polish */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_0.0625rem,transparent_0.0625rem),linear-gradient(to_bottom,rgba(255,255,255,0.015)_0.0625rem,transparent_0.0625rem)] bg-[size:2.5rem_2.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

      {/* Login Card Container */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-[28rem] px-6"
      >
        <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-2xl flex flex-col items-center">
          
          {/* Logo & Header */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="relative mb-4">
              <img
                src={MALIYA_LOGO_URL}
                alt="Maliya Logo"
                className="w-20 h-20 rounded-2xl object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 font-nunito">
              Maliya
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Finance Manager for Family
            </p>
          </div>

          {/* Error Message Box */}
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full flex items-start gap-3 p-3 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm mb-6"
            >
              <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" />
              <span>{errorMsg}</span>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">
            
            {/* Access Code Input */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Family Access Code
              </label>
              <div className="relative flex items-center">
                <Lock className="absolute left-4 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  placeholder="Enter access code..."
                  className="w-full pl-12 pr-4 py-3 min-h-[3rem] bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-sans"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative flex items-center">
                <KeyRound className="absolute left-4 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password..."
                  className="w-full pl-12 pr-4 py-3 min-h-[3rem] bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-sans"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-[3rem] mt-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-2xl transition-all shadow-lg shadow-emerald-600/10 active:scale-[0.98] disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <span>Sign In to Dashboard</span>
              )}
            </button>
          </form>

          {/* Footer Info */}
          <div className="mt-8 text-xs text-gray-400 text-center">
            Maliya uses modern encryption to protect your family's financial data securely.
          </div>
          
        </div>
      </motion.div>
    </div>
  );
}
