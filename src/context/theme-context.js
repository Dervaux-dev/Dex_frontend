import { createContext } from 'react';

export const THEME_STORAGE_KEY = 'dex_theme';

const ThemeContext = createContext(null);

export default ThemeContext;
