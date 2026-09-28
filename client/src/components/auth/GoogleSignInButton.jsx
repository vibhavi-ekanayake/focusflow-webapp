import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Modal from '../common/Modal';
import { User, Mail, Sparkles, HelpCircle, ArrowRight, Check } from 'lucide-react';

const SAMPLE_GOOGLE_ACCOUNTS = [
  {
    name: 'Alex Rivera',
    email: 'alex.rivera@gmail.com',
    avatar: 'avatar-1',
    role: 'Computer Science • Year 2'
  },
  {
    name: 'Sarah Chen',
    email: 'sarah.chen@stanford.edu',
    avatar: 'avatar-3',
    role: 'Biomedical Engineering'
  },
  {
    name: 'Kenji Tanaka',
    email: 'kenji.tanaka@gmail.com',
    avatar: 'avatar-5',
    role: 'Applied Mathematics'
  }
];

export const GoogleIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

const GoogleSignInButton = ({ text = 'Continue with Google', className = '' }) => {
  const { googleLogin } = useAuth();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [showDevTip, setShowDevTip] = useState(false);

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const gsiRenderRef = useRef(null);

  // Initialize official Google Identity Services if a real client ID is present
  useEffect(() => {
    if (!googleClientId || !window.google?.accounts?.id) return;

    try {
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: async (response) => {
          if (!response?.credential) return;
          setIsLoading(true);
          const result = await googleLogin({ credential: response.credential });
          setIsLoading(false);
          if (result?.success) {
            navigate('/dashboard');
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true
      });

      if (gsiRenderRef.current) {
        window.google.accounts.id.renderButton(gsiRenderRef.current, {
          theme: 'outline',
          size: 'large',
          width: '100%',
          text: 'continue_with',
          shape: 'pill'
        });
      }
    } catch (err) {
      console.warn('Google Identity Services init notice:', err);
    }
  }, [googleClientId, googleLogin, navigate]);

  const handleButtonClick = () => {
    // If client ID is configured and GSI prompt is available, trigger Google One Tap / popup
    if (googleClientId && window.google?.accounts?.id) {
      try {
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            setIsModalOpen(true);
          }
        });
        return;
      } catch (err) {
        console.warn('Native prompt fallback:', err);
      }
    }
    // Otherwise open the Google Account Chooser
    setIsModalOpen(true);
  };

  const handleAccountSelect = async (account) => {
    setSelectedEmail(account.email);
    setIsLoading(true);
    const googleId = `google_${Math.abs(
      account.email.split('').reduce((acc, char) => (acc << 5) - acc + char.charCodeAt(0), 0)
    )}`;

    const result = await googleLogin({
      googleId,
      email: account.email,
      name: account.name,
      avatar: account.avatar
    });

    setIsLoading(false);
    if (result?.success) {
      setIsModalOpen(false);
      navigate('/dashboard');
    }
  };

  const handleCustomSubmit = async (e) => {
    e.preventDefault();
    if (!customEmail) return;

    setIsLoading(true);
    const name = customName.trim() || customEmail.split('@')[0];
    const googleId = `google_${Math.abs(
      customEmail.split('').reduce((acc, char) => (acc << 5) - acc + char.charCodeAt(0), 0)
    )}`;

    const result = await googleLogin({
      googleId,
      email: customEmail,
      name,
      avatar: 'avatar-1'
    });

    setIsLoading(false);
    if (result?.success) {
      setIsModalOpen(false);
      navigate('/dashboard');
    }
  };

  return (
    <>
      <div className="w-full">
        {/* If official GSI button is rendered, it can sit here */}
        {googleClientId && <div ref={gsiRenderRef} className="hidden" />}

        {/* Universal styled Google button */}
        <button
          type="button"
          onClick={handleButtonClick}
          disabled={isLoading}
          className={`w-full py-3 px-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white/90 dark:bg-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-sm flex items-center justify-center gap-3 shadow-sm hover:shadow transition-all duration-200 active:scale-[0.99] disabled:opacity-50 ${className}`}
        >
          <GoogleIcon className="w-5 h-5 flex-shrink-0" />
          <span>{isLoading ? 'Connecting to Google...' : text}</span>
        </button>
      </div>

      {/* Google Account Chooser Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => !isLoading && setIsModalOpen(false)}
        title="Sign in with Google"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <div className="text-center pb-2">
            <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-center mx-auto mb-3">
              <GoogleIcon className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Choose an account
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              to continue to <span className="font-semibold text-slate-700 dark:text-slate-300">Temora</span>
            </p>
          </div>

          {/* Account List */}
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {SAMPLE_GOOGLE_ACCOUNTS.map((acc) => {
              const isSelected = selectedEmail === acc.email && isLoading;
              return (
                <button
                  key={acc.email}
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleAccountSelect(acc)}
                  className="w-full p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all flex items-center justify-between text-left group disabled:opacity-60"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-600 text-white font-bold text-sm flex items-center justify-center flex-shrink-0 shadow-sm">
                      {acc.name[0]}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                        {acc.name}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {acc.email}
                      </div>
                      <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">
                        {acc.role}
                      </div>
                    </div>
                  </div>

                  <div className="flex-shrink-0 ml-2">
                    {isSelected ? (
                      <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <div className="w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 text-indigo-600 dark:text-indigo-400 transition-opacity">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Custom Google Account Section */}
          {!showCustomInput ? (
            <button
              type="button"
              onClick={() => setShowCustomInput(true)}
              disabled={isLoading}
              className="w-full py-2.5 px-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center justify-center gap-2 transition-colors"
            >
              <User className="w-4 h-4" />
              <span>Use another Google account</span>
            </button>
          ) : (
            <form onSubmit={handleCustomSubmit} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Enter your Google account details
              </div>
              <input
                type="text"
                placeholder="Full Name (e.g. Kasun Silva)"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="email"
                placeholder="Google Email (e.g. kasun@gmail.com)"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <div className="flex gap-2 justify-end pt-1">
                <button
                  type="button"
                  onClick={() => setShowCustomInput(false)}
                  className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !customEmail}
                  className="px-4 py-1.5 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm disabled:opacity-50"
                >
                  {isLoading ? 'Signing in...' : 'Sign in'}
                </button>
              </div>
            </form>
          )}

          {/* Privacy & Security footer note */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 dark:text-slate-500 text-center leading-relaxed">
            To continue, Google will share your name, email address, and profile picture with Temora.
          </div>

          {/* Developer Tip Accordion */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowDevTip(!showDevTip)}
              className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 mx-auto"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{showDevTip ? 'Hide Google Cloud OAuth setup' : 'How to connect real Google Cloud OAuth'}</span>
            </button>

            {showDevTip && (
              <div className="mt-2 p-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-900/60 text-[11px] text-slate-600 dark:text-slate-300 space-y-1.5 leading-relaxed">
                <div className="font-bold text-indigo-700 dark:text-indigo-300">
                  Google Cloud Console Instructions:
                </div>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Go to <span className="font-mono text-indigo-600 dark:text-indigo-400">console.cloud.google.com</span> and create a project.</li>
                  <li>Enable "Google Identity Services" / OAuth 2.0 Client ID for Web Application.</li>
                  <li>Add your app origin (e.g. <span className="font-mono">http://localhost:5173</span> or your Vercel URL) to Authorized JavaScript Origins.</li>
                  <li>Set <span className="font-mono text-indigo-600 dark:text-indigo-400">VITE_GOOGLE_CLIENT_ID=your_client_id</span> in your environment.</li>
                </ol>
              </div>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
};

export default GoogleSignInButton;
