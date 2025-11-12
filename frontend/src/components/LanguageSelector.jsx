import { useTranslation } from 'react-i18next';

export default function LanguageSelector() {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => changeLanguage('es')}
        className={`w-8 h-6 rounded overflow-hidden border-2 transition-all ${
          i18n.language === 'es' ? 'border-blue-500 shadow-lg scale-110' : 'border-gray-300 hover:border-gray-400'
        }`}
        title="Español"
      >
        <svg viewBox="0 0 3 2" className="w-full h-full">
          <rect width="3" height="2" fill="#c60b1e"/>
          <rect width="3" height="1" y="0.5" fill="#ffc400"/>
        </svg>
      </button>
      
      <button
        onClick={() => changeLanguage('en')}
        className={`w-8 h-6 rounded overflow-hidden border-2 transition-all ${
          i18n.language === 'en' ? 'border-blue-500 shadow-lg scale-110' : 'border-gray-300 hover:border-gray-400'
        }`}
        title="English"
      >
        <svg viewBox="0 0 60 30" className="w-full h-full">
          <clipPath id="s">
            <path d="M0,0 v30 h60 v-30 z"/>
          </clipPath>
          <clipPath id="t">
            <path d="M30,15 h30 v15 z v-30 h-30 z h-30 v15 z v-30 h30 z"/>
          </clipPath>
          <g clipPath="url(#s)">
            <path d="M0,0 v30 h60 v-30 z" fill="#012169"/>
            <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6"/>
            <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#t)" stroke="#C8102E" strokeWidth="4"/>
            <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10"/>
            <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6"/>
          </g>
        </svg>
      </button>
    </div>
  );
}
