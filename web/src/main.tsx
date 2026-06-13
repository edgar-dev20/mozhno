import { createRoot } from 'react-dom/client';
import App from '@/app/App';
import { loadLocale } from '@/i18n/locale';
import './styles/index.css';

document.documentElement.lang = loadLocale();
createRoot(document.getElementById('root')!).render(<App />);
