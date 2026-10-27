
import { useState } from 'react';
import { useAuth } from 'react-oidc-context';

const COGNITO_DOMAIN = import.meta.env.VITE_COGNITO_DOMAIN;
const CLIENT_ID = import.meta.env.VITE_COGNITO_CLIENT_ID;
const REDIRECT_URI = import.meta.env.VITE_COGNITO_REDIRECT_URI;

export default function Auth({
  onBack,
  initialMode = 'login',
}) {
  const auth = useAuth();

  const [isSignup, setIsSignup] = useState(
    initialMode === 'signup'
  );
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setError('');
    setLoading(true);

    try {
      await auth.signinRedirect();
    } catch (err) {
      console.error('Cognito login error:', err);
      setError(
        'Unable to open login. Check your Cognito domain and app client settings.'
      );
      setLoading(false);
    }
  }

  function handleSignup() {
    setError('');

    try {
      if (!COGNITO_DOMAIN || !CLIENT_ID || !REDIRECT_URI) {
        throw new Error('Missing Cognito configuration in .env');
      }

      const signupUrl = new URL('/oauth2/authorize', COGNITO_DOMAIN);

      signupUrl.searchParams.set('client_id', CLIENT_ID);
      signupUrl.searchParams.set('response_type', 'code');
      signupUrl.searchParams.set('scope', 'openid email');
      signupUrl.searchParams.set('redirect_uri', REDIRECT_URI);
      signupUrl.searchParams.set('screen_hint', 'signup');

      setLoading(true);
      window.location.assign(signupUrl.toString());
    } catch (err) {
      console.error('Cognito signup error:', err);
      setError(
        'Unable to open registration. Verify your Cognito domain and app client configuration.'
      );
      setLoading(false);
    }
  }

  function toggleMode() {
    setIsSignup((previous) => !previous);
    setError('');
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <button
          type="button"
          className="auth-back"
          onClick={onBack}
        >
          ← Back to SkillBridge
        </button>

        <a
          className="brand auth-brand"
          href="#"
          onClick={(event) => {
            event.preventDefault();
            onBack?.();
          }}
        >
          <span className="brand-mark">S</span>
          SkillBridge<span className="brand-dot">.</span>
        </a>

        <div className="auth-heading">
          <span className="eyebrow">
            {isSignup ? 'JOIN THE COMMUNITY' : 'WELCOME BACK'}
          </span>

          <h1>
            {isSignup
              ? 'Create your account.'
              : 'Good to see you.'}
          </h1>

          <p>
            {isSignup
              ? 'Start sharing skills and learning together.'
              : 'Sign in to continue your learning journey.'}
          </p>
        </div>

        {error && (
          <div className="auth-error" role="alert">
            {error}
          </div>
        )}

        <div className="auth-form">
          <p>
            {isSignup
              ? 'Create your SkillBridge account securely with Amazon Cognito.'
              : 'Continue securely with your SkillBridge account.'}
          </p>

          <button
            className="button button-primary auth-submit"
            type="button"
            onClick={isSignup ? handleSignup : handleLogin}
            disabled={loading || auth.isLoading}
          >
            {loading
              ? 'Redirecting...'
              : isSignup
                ? 'Create account ↗'
                : 'Login ↗'}
          </button>
        </div>

        <p className="auth-switch">
          {isSignup
            ? 'Already have an account?'
            : "Don't have an account?"}{' '}

          <button type="button" onClick={toggleMode}>
            {isSignup ? 'Login' : 'Sign up'}
          </button>
        </p>

        <p className="auth-note">
          SkillBridge · Learn together. Grow together.
        </p>
      </div>
    </div>
  );
}
