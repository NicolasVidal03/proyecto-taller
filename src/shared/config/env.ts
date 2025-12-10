export const ENV = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  LOCAL_PASSWORD_PREFIX: import.meta.env.VITE_LOCAL_PASSWORD_PREFIX || 'sicme',
  AUTH0_DOMAIN: import.meta.env.VITE_AUTH0_DOMAIN || '',
  AUTH0_CLIENT_ID: import.meta.env.VITE_AUTH0_CLIENT_ID || '',
  AUTH0_AUDIENCE: import.meta.env.VITE_AUTH0_AUDIENCE || '',
  AUTH0_REDIRECT_URI: import.meta.env.VITE_AUTH0_REDIRECT_URI || (typeof window !== 'undefined' ? `${window.location.origin}/callback` : ''),
};
