
import React from 'react';
import ReactDOM from 'react-dom/client';
import { AuthProvider } from 'react-oidc-context';
import App from './App.jsx';
import './App.css';

const authority = import.meta.env.VITE_COGNITO_AUTHORITY;
const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID;
const cognitoDomain = import.meta.env.VITE_COGNITO_DOMAIN;
const redirectUri = import.meta.env.VITE_COGNITO_REDIRECT_URI;

const oidcConfig = {
  authority,
  client_id: clientId,
  redirect_uri: redirectUri,
  response_type: 'code',
  scope: 'openid email',
  post_logout_redirect_uri: redirectUri,

  metadata: {
    issuer: authority,
    authorization_endpoint: `${cognitoDomain}/oauth2/authorize`,
    token_endpoint: `${cognitoDomain}/oauth2/token`,
    userinfo_endpoint: `${cognitoDomain}/oauth2/userInfo`,
    end_session_endpoint: `${cognitoDomain}/logout`,
  },
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider {...oidcConfig}>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
