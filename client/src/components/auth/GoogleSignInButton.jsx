import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

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
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const tokenClientRef = useRef(null);
  const gsiContainerRef = useRef(null);

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  // Initialize official Google Identity Services
  useEffect(() => {
    if (!googleClientId) return;

    const setupGoogle = () => {
      if (!window.google?.accounts) return false;

      try {
        // Initialize ID token flow (One Tap / Credential)
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

        // Initialize OAuth 2.0 popup token client for direct button click
        if (window.google.accounts.oauth2) {
          tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
            client_id: googleClientId,
            scope: 'email profile openid',
            callback: async (tokenResponse) => {
              if (tokenResponse?.error) {
                console.error('Google OAuth token error:', tokenResponse);
                setIsLoading(false);
                return;
              }
              if (tokenResponse?.access_token) {
                setIsLoading(true);
                try {
                  const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
                  });
                  if (res.ok) {
                    const profile = await res.json();
                    const result = await googleLogin({
                      googleId: profile.sub,
                      email: profile.email,
                      name: profile.name,
                      avatar: profile.picture
                    });
                    if (result?.success) {
                      navigate('/dashboard');
                    }
                  } else {
                    addToast('Failed to fetch Google profile', 'error');
                  }
                } catch (err) {
                  addToast(err.message || 'Google authentication failed', 'error');
                } finally {
                  setIsLoading(false);
                }
              }
            }
          });
        }

        // Render official Google button inside container if desired
        if (gsiContainerRef.current) {
          window.google.accounts.id.renderButton(gsiContainerRef.current, {
            theme: 'outline',
            size: 'large',
            width: '100%',
            text: 'continue_with',
            shape: 'pill'
          });
        }

        return true;
      } catch (err) {
        console.warn('Google Identity Services setup warning:', err);
        return false;
      }
    };

    if (!setupGoogle()) {
      const interval = setInterval(() => {
        if (setupGoogle()) clearInterval(interval);
      }, 250);
      return () => clearInterval(interval);
    }
  }, [googleClientId, googleLogin, navigate, addToast]);

  const handleButtonClick = () => {
    if (!googleClientId) {
      addToast(
        'Google OAuth requires VITE_GOOGLE_CLIENT_ID to be set in client/.env or Vercel Environment Variables.',
        'warning'
      );
      return;
    }

    // Trigger OAuth popup directly via token client
    if (tokenClientRef.current) {
      setIsLoading(true);
      tokenClientRef.current.requestAccessToken();
      return;
    }

    // Fallback: trigger One Tap / prompt
    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    }
  };

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={handleButtonClick}
        disabled={isLoading}
        className={`w-full py-3 px-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white/90 dark:bg-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-sm flex items-center justify-center gap-3 shadow-sm hover:shadow transition-all duration-200 active:scale-[0.99] disabled:opacity-50 ${className}`}
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin flex-shrink-0" />
        ) : (
          <GoogleIcon className="w-5 h-5 flex-shrink-0" />
        )}
        <span>{isLoading ? 'Connecting to Google...' : text}</span>
      </button>
    </div>
  );
};

export default GoogleSignInButton;
