import { PublicClientApplication, Configuration } from '@azure/msal-browser';

const msalConfig: Configuration = {
  auth: {
    clientId: import.meta.env.VITE_MSAL_CLIENT_ID || '',
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_MSAL_TENANT_ID || 'common'}`,
    redirectUri: import.meta.env.VITE_MSAL_REDIRECT_URI || `${window.location.origin}/auth/microsoft-callback`,
  },
};

export const msalInstance = (() => {
  try {
    return new PublicClientApplication(msalConfig);
  } catch (err) {
    console.warn('MSAL initialization failed. This is expected in non-secure HTTP contexts over local IPs.', err);
    return null as unknown as PublicClientApplication;
  }
})();
