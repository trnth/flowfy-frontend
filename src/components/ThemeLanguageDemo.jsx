import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';

const ThemeLanguageDemo = () => {
  const { theme, changeTheme, isDark } = useTheme();
  const { language, changeLanguage, t, isVietnamese } = useLanguage();

  return (
    <div className={`p-6 rounded-lg border transition-all duration-300 ${
      isDark 
        ? "bg-gray-800 border-gray-700 text-white" 
        : "bg-white border-gray-200 text-gray-900"
    }`}>
      <h2 className="text-2xl font-bold mb-4">
        {t('demo.title') || 'Theme & Language Demo'}
      </h2>
      
      <div className="space-y-4">
        {/* Theme Section */}
        <div>
          <h3 className="text-lg font-semibold mb-2">
            {t('demo.theme') || 'Theme'}
          </h3>
          <div className="flex gap-2">
            {['light', 'dark', 'system'].map((themeOption) => (
              <button
                key={themeOption}
                onClick={() => changeTheme(themeOption)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  theme === themeOption
                    ? 'bg-blue-600 text-white'
                    : isDark
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {themeOption.charAt(0).toUpperCase() + themeOption.slice(1)}
              </button>
            ))}
          </div>
          <p className="text-sm mt-2 opacity-75">
            Current: {theme} | Is Dark: {isDark ? 'Yes' : 'No'}
          </p>
        </div>

        {/* Language Section */}
        <div>
          <h3 className="text-lg font-semibold mb-2">
            {t('demo.language') || 'Language'}
          </h3>
          <div className="flex gap-2">
            {['en', 'vi'].map((langOption) => (
              <button
                key={langOption}
                onClick={() => changeLanguage(langOption)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  language === langOption
                    ? 'bg-green-600 text-white'
                    : isDark
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {langOption === 'en' ? 'English' : 'Tiếng Việt'}
              </button>
            ))}
          </div>
          <p className="text-sm mt-2 opacity-75">
            Current: {language} | Is Vietnamese: {isVietnamese ? 'Yes' : 'No'}
          </p>
        </div>

        {/* Translation Test */}
        <div>
          <h3 className="text-lg font-semibold mb-2">
            {t('demo.translations') || 'Translation Test'}
          </h3>
          <div className="space-y-1 text-sm">
            <p>Settings: {t('settings.title')}</p>
            <p>Home: {t('sidebar.home')}</p>
            <p>Save: {t('common.save')}</p>
            <p>Cancel: {t('common.cancel')}</p>
          </div>
        </div>

        {/* CSS Variables Test */}
        <div>
          <h3 className="text-lg font-semibold mb-2">
            {t('demo.cssVariables') || 'CSS Variables Test'}
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white dark:bg-slate-900 p-2 rounded text-center text-sm">
              Primary BG
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded text-center text-sm">
              Secondary BG
            </div>
            <div className="text-slate-900 dark:text-slate-100 p-2 rounded text-center text-sm">
              Primary Text
            </div>
            <div className="text-slate-600 dark:text-slate-300 p-2 rounded text-center text-sm">
              Secondary Text
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeLanguageDemo;
