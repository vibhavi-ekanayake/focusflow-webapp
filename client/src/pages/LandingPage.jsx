import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Button from '../components/common/Button';
import {
  Timer,
  BarChart3,
  Target,
  Flame,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  BookOpen,
  Calendar,
  Shield,
  Layers,
  Clock,
  Award
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleStartStudying = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/register');
    }
  };

  const features = [
    {
      icon: Timer,
      title: 'Distraction-Free Focus Timer',
      description: 'Customizable Pomodoro, Deep Work (50m), and Extended (90m) timers engineered with timestamp accuracy that never drifts when tabs sleep.'
    },
    {
      icon: Target,
      title: 'Adaptive Daily & Weekly Goals',
      description: 'Set ambitious study targets and monitor your live progress as completed focus sessions automatically update your metrics.'
    },
    {
      icon: BarChart3,
      title: 'Progress Analytics',
      description: 'Explore visual breakdowns of study hours over 7 and 30 days, subject distribution, and week-over-week performance with interactive charts.'
    },
    {
      icon: Flame,
      title: 'Habit-Forming Streak System',
      description: 'Build unbreakable momentum with an intelligent streak counter computed dynamically from your authenticated study history.'
    },
    {
      icon: BookOpen,
      title: 'Subject & Session Notes Tracking',
      description: 'Tag each study block with the subject and retain notes on what you accomplished for effortless midterm and final exam revision.'
    },
    {
      icon: Layers,
      title: 'Unified Student Dashboard',
      description: 'A clean, centralized command center displaying your daily stats, active streak, motivational quote, and quick timer launcher.'
    }
  ];

  const steps = [
    {
      step: '01',
      title: 'Create Your Account',
      description: 'Sign up in seconds and configure your personal study goals and default focus durations.'
    },
    {
      step: '02',
      title: 'Start a Focused Study Session',
      description: 'Select your subject, set your timer preset, and dive into distraction-free deep work.'
    },
    {
      step: '03',
      title: 'Track Your Progress',
      description: 'Review saved sessions, inspect analytics, maintain your daily study streak, and watch your habits compound.'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-32 overflow-hidden">
        {/* Ambient background glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-indigo-500/15 to-violet-500/15 dark:from-indigo-500/20 dark:to-violet-500/20 blur-3xl rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200/60 dark:border-indigo-800/80 text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Built for university students, high schoolers & lifelong learners</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-[1.1]">
            Focus Better.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-500">
              Study Smarter.
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            The modern education platform designed to eliminate distractions, track deep work, and build lasting academic study habits.
          </p>

          {/* Call to Actions */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              onClick={handleStartStudying}
              variant="primary"
              size="lg"
              icon={ArrowRight}
              className="w-full sm:w-auto shadow-lg shadow-indigo-500/25 text-base px-8 py-3.5"
            >
              Start Studying
            </Button>
            <a href="#features" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full text-base px-8 py-3.5">
                Explore Features
              </Button>
            </a>
          </div>

          {/* Interactive Visual Preview Mockup */}
          <div className="mt-14 sm:mt-20 max-w-5xl mx-auto rounded-3xl p-2 sm:p-4 bg-gradient-to-b from-indigo-500/20 via-slate-200/40 dark:via-slate-800/40 to-transparent border border-slate-200/80 dark:border-slate-800 shadow-2xl">
            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-inner">
              {/* Window Mockup Header */}
              <div className="h-10 bg-slate-100 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 px-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                </div>
                <div className="text-xs font-mono text-slate-400">
                  focusflow.app/dashboard
                </div>
                <div className="w-12" />
              </div>

              {/* Preview Content */}
              <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                {/* Timer Mockup */}
                <div className="md:col-span-2 p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 flex flex-col items-center justify-center text-center">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 mb-3">
                    Computer Science • Algorithms
                  </span>
                  <div className="text-6xl font-mono font-extrabold text-slate-900 dark:text-white tracking-tight">
                    25:00
                  </div>
                  <div className="flex gap-2 mt-4">
                    <span className="px-3 py-1 text-xs rounded-lg bg-indigo-600 text-white font-medium">Start Focus</span>
                    <span className="px-3 py-1 text-xs rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium">Reset</span>
                  </div>
                </div>

                {/* Quick Stats Mockup */}
                <div className="flex flex-col gap-4">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800">
                    <span className="text-[11px] font-bold uppercase text-slate-400">Today's Focus</span>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">2h 45m</div>
                    <span className="text-xs text-emerald-500 font-medium">+30m from yesterday</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800">
                    <span className="text-[11px] font-bold uppercase text-slate-400">Current Streak</span>
                    <div className="text-2xl font-bold text-amber-500 mt-1 flex items-center gap-1.5">
                      <Flame className="w-5 h-5 fill-amber-500" />
                      <span>7 Days</span>
                    </div>
                    <span className="text-xs text-slate-400">Personal best: 14 days</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white dark:bg-slate-900/60 border-y border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-2">
              Features
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
              Everything you need for productive study sessions
            </p>
            <p className="mt-4 text-slate-600 dark:text-slate-300 text-base">
              A distraction-free productivity system engineered to help students get into the zone and achieve high academic performance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  className="p-7 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 hover:border-indigo-500/40 dark:hover:border-indigo-500/40 hover:shadow-lg transition-all duration-300 group flex flex-col justify-between"
                >
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-2">
              Workflow
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
              How FocusFlow Works
            </p>
            <p className="mt-4 text-slate-600 dark:text-slate-300 text-base">
              Three simple steps to transform your academic consistency.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {steps.map((item, idx) => (
              <div
                key={idx}
                className="relative p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <span className="text-4xl font-extrabold text-indigo-600/30 dark:text-indigo-400/30 font-mono">
                    {item.step}
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-4 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-slate-100/60 dark:bg-slate-900/40 border-t border-slate-200/80 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto mb-6 shadow-md shadow-indigo-500/20">
            <Clock className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-4">
            Designed for Academic Excellence
          </h2>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-base">
            FocusFlow was created to solve the digital fatigue and distraction student face daily. By blending the science of the Pomodoro technique with rigorous habit-tracking principles and clean SaaS design, FocusFlow provides students with a calm, motivating digital space to study deeply.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden bg-gradient-to-b from-indigo-900 to-indigo-950 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Ready to upgrade your study sessions?
          </h2>
          <p className="mt-4 text-base sm:text-lg text-indigo-200 max-w-xl mx-auto">
            Join students who track their study hours, master their exams, and study with clarity every day.
          </p>
          <div className="mt-8 flex justify-center">
            <Button
              onClick={handleStartStudying}
              variant="primary"
              size="lg"
              className="bg-white text-indigo-950 hover:bg-slate-100 hover:text-indigo-900 font-bold px-8 shadow-xl"
            >
              Get Started for Free
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <Clock className="w-4 h-4" />
              </div>
              <span className="font-bold text-lg text-slate-900 dark:text-white">
                Focus<span className="text-indigo-600 dark:text-indigo-400">Flow</span>
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500 dark:text-slate-400">
              <a href="#about" className="hover:text-indigo-600 dark:hover:text-indigo-400">About</a>
              <a href="#features" className="hover:text-indigo-600 dark:hover:text-indigo-400">Features</a>
              <a href="#how-it-works" className="hover:text-indigo-600 dark:hover:text-indigo-400">How It Works</a>
              <span className="hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer">Privacy</span>
              <span className="hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer">Terms</span>
              <span className="hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer">Contact</span>
            </div>

            <div className="text-xs text-slate-400">
              © {new Date().getFullYear()} FocusFlow. Built for focused minds.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
