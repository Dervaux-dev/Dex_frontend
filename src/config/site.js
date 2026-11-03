export const SITE_URL = (
  import.meta.env.VITE_SITE_URL || 'https://dexelearning.vercel.app'
).replace(/\/+$/, '');

export const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`;
