'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Check, Bell } from 'lucide-react';
import { getTimezoneOffsetMinutes, calculateTimeRemaining } from '@/lib/utils';

type Step = 'input' | 'processing' | 'armed';

interface FormData {
  service: string;
  date: string;
  email: string;
}

interface ReminderResponse {
  id: string;
  serviceName: string;
  deadline: string;
  triggerTime: string;
  timeRemaining: {
    days: number;
    hours: number;
    minutes: number;
    totalHours: number;
  };
}

export default function EgressInterface() {
  const [step, setStep] = useState<Step>('input');
  const [formData, setFormData] = useState<FormData>({
    service: '',
    date: '',
    email: ''
  });
  const [safeMode, setSafeMode] = useState(true);
  const [timezone, setTimezone] = useState<string>('');
  const [reminderData, setReminderData] = useState<ReminderResponse | null>(null);
  const [error, setError] = useState<string>('');

  // Auto-detect timezone on mount
  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      setTimezone(tz);
    } catch (e) {
      setTimezone('UTC');
    }
  }, []);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, date: e.target.value });
    setError('');
  };

  const handleQuickDate = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    const dateString = date.toISOString().split('T')[0];
    setFormData({ ...formData, date: dateString });
    setError('');
  };

  const handleArm = async () => {
    if (!formData.service || !formData.date || !formData.email) {
      setError('Please fill in all fields');
      return;
    }

    setStep('processing');
    setError('');

    try {
      const timezoneOffset = getTimezoneOffsetMinutes();
      
      const response = await fetch('/api/arm-egress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceName: formData.service,
          date: formData.date,
          email: formData.email,
          timezoneOffset,
          safeMode
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create reminder');
      }

      setReminderData(data.reminder);
      setStep('armed');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize sequence');
      setStep('input');
    }
  };

  const formatTimeRemaining = (reminder: ReminderResponse) => {
    const { days, hours, minutes } = reminder.timeRemaining;
    if (days > 0) {
      return `${days} day${days !== 1 ? 's' : ''}, ${hours} hour${hours !== 1 ? 's' : ''}`;
    }
    if (hours > 0) {
      return `${hours} hour${hours !== 1 ? 's' : ''}, ${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  };

  return (
    <div className="relative w-full min-h-screen bg-black overflow-y-auto flex items-center justify-center font-sans text-white selection:bg-cyan-500/30 py-12 md:py-20">
      {/* 1. ATMOSPHERE: The Sora-style Aurora Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] bg-indigo-900/30 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-cyan-900/20 rounded-full blur-[100px] mix-blend-screen" />
        {/* Noise overlay for texture */}
        <div className="absolute inset-0 opacity-20 brightness-100 contrast-150" style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")'
        }}></div>
      </div>

      {/* 2. THE LENS: The Glass Interface */}
      <div className="relative z-10 w-full max-w-2xl px-6 py-8">
        <AnimatePresence mode="wait">
          {step === 'input' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
              className="space-y-8 md:space-y-12"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-8 md:mb-12">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-sm md:text-base tracking-[0.2em] font-mono uppercase text-white/80">Egress Protocol v1.0</span>
                </div>
                {timezone && (
                  <span className="text-sm md:text-base tracking-[0.2em] font-mono uppercase text-white/70">
                    {timezone}
                  </span>
                )}
              </div>

              {/* The "Sentence Builder" */}
              <div className="text-3xl md:text-5xl leading-[1.5] font-light tracking-tight text-white/90 space-y-4 md:space-y-6">
                <div className="flex flex-wrap items-baseline gap-2">
                  <span>I need to escape from</span>
                  <span className="relative inline-block min-w-[280px] md:min-w-[350px]">
                    <input
                      type="text"
                      name="service"
                      placeholder="Subscription Name"
                      value={formData.service}
                      onChange={handleInput}
                      className="bg-transparent border-b-2 border-white/20 text-cyan-200 placeholder:text-white/40 placeholder:font-normal focus:outline-none focus:border-cyan-400 w-full transition-all font-mono text-3xl md:text-5xl pb-2"
                      autoComplete="off"
                    />
                  </span>
                </div>
                <div className="flex flex-wrap items-baseline gap-2">
                  <span>before</span>
                  <span className="relative inline-block min-w-[200px] md:min-w-[250px]">
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleDateChange}
                      className="bg-transparent border-b-2 border-white/20 text-cyan-200 focus:outline-none focus:border-cyan-400 w-full transition-all font-mono text-3xl md:text-5xl pb-2"
                      style={{
                        colorScheme: 'dark'
                      }}
                    />
                  </span>
                  <span>.</span>
                </div>
                <div className="flex flex-wrap items-baseline gap-2">
                  <span>Send the signal to</span>
                  <span className="relative inline-block min-w-[280px] md:min-w-[350px]">
                    <input
                      type="email"
                      name="email"
                      placeholder="my@email.com"
                      value={formData.email}
                      onChange={handleInput}
                      className="bg-transparent border-b-2 border-white/20 text-cyan-200 placeholder:text-white/40 placeholder:font-normal focus:outline-none focus:border-cyan-400 w-full transition-all font-mono text-3xl md:text-5xl pb-2"
                    />
                  </span>
                  <span>.</span>
                </div>
              </div>

              {/* Quick Date Chips */}
              {!formData.date && (
                <div className="flex flex-wrap gap-3 pt-4">
                  <button
                    onClick={() => handleQuickDate(7)}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-sm font-mono transition-all backdrop-blur-md"
                  >
                    7 Days
                  </button>
                  <button
                    onClick={() => handleQuickDate(14)}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-sm font-mono transition-all backdrop-blur-md"
                  >
                    14 Days
                  </button>
                  <button
                    onClick={() => handleQuickDate(30)}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-sm font-mono transition-all backdrop-blur-md"
                  >
                    30 Days
                  </button>
                </div>
              )}

              {/* Safe Mode Toggle */}
              <div className="flex items-center space-x-3 pt-6">
                <input
                  type="checkbox"
                  id="safeMode"
                  checked={safeMode}
                  onChange={(e) => setSafeMode(e.target.checked)}
                  className="w-4 h-4 bg-transparent border-white/20 rounded focus:ring-cyan-400 cursor-pointer"
                />
                <label htmlFor="safeMode" className="text-sm text-white/60 font-mono cursor-pointer">
                  Safe Mode (assume trial ends at 00:00:01)
                </label>
              </div>

              {/* Error Message */}
              {error && (
                <div className="text-red-400 text-sm font-mono pt-2">
                  {error}
                </div>
              )}

              {/* The Trigger Button */}
              <div className="pt-8 pb-4">
                <button
                  onClick={handleArm}
                  disabled={!formData.service || !formData.date || !formData.email}
                  className="group relative flex items-center space-x-4 pl-1 pr-6 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all disabled:opacity-30 disabled:cursor-not-allowed overflow-hidden backdrop-blur-md"
                >
                  <span className="flex items-center justify-center w-12 h-12 bg-white rounded-full text-black group-hover:scale-110 transition-transform">
                    <ArrowRight size={20} />
                  </span>
                  <span className="font-mono text-sm tracking-widest uppercase">
                    Initialize Sequence
                  </span>
                  {/* Glowing Effect on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center"
            >
              <div className="w-16 h-16 border-t-2 border-l-2 border-cyan-400 rounded-full animate-spin" />
              <p className="mt-8 font-mono text-xs tracking-[0.3em] text-cyan-400 animate-pulse">
                CALCULATING OFF-RAMP...
              </p>
            </motion.div>
          )}

          {step === 'armed' && reminderData && (
            <motion.div
              key="armed"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-md mx-auto"
            >
              {/* The Holographic Ticket */}
              <div className="relative bg-black/40 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-2xl p-8 shadow-2xl shadow-cyan-900/20">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-cyan-500" />

                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h2 className="text-2xl font-light text-white">Egress Armed</h2>
                    <p className="text-white/40 text-sm mt-1 font-mono">
                      Sequence #{reminderData.id.slice(0, 8).toUpperCase()}
                    </p>
                  </div>
                  <div className="p-2 bg-green-500/10 rounded-full text-green-400 border border-green-500/20">
                    <Check size={20} />
                  </div>
                </div>
                <div className="space-y-6 font-mono text-sm">
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-white/40">TARGET</span>
                    <span className="text-cyan-200">{reminderData.serviceName}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-white/40">DEADLINE</span>
                    <span className="text-white">
                      {new Date(reminderData.deadline).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-white/40 flex items-center gap-2">
                      <Bell size={12} /> REMINDER SET
                    </span>
                    <span className="text-yellow-400">
                      {formatTimeRemaining(reminderData)}
                    </span>
                  </div>
                </div>
                <div className="mt-8 pt-6 border-t border-white/10 text-center">
                  <p className="text-white/30 text-xs">
                    A confirmation signal has been sent to your email.
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setStep('input');
                  setFormData({ service: '', date: '', email: '' });
                  setReminderData(null);
                }}
                className="mt-8 w-full text-center text-white/30 hover:text-white text-xs font-mono tracking-widest uppercase transition-colors"
              >
                Create New Sequence
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

