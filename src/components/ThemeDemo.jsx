import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { getCommonClasses } from '@/utils/themeUtils';

const ThemeDemo = () => {
  const { isDark, changeTheme } = useTheme();
  const { t, language, changeLanguage } = useLanguage();
  const classes = getCommonClasses(isDark);

  return (
    <div className={`min-h-screen p-8 ${classes.bgPrimary}`}>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className={`text-4xl font-bold mb-4 ${classes.textPrimary}`}>
            {t('settings.title')} Demo
          </h1>
          <p className={`text-lg ${classes.textSecondary}`}>
            {t('appearance.theme')}: {isDark ? t('appearance.dark') : t('appearance.light')} | 
            {t('appearance.language')}: {language === 'vi' ? 'Tiếng Việt' : 'English'}
          </p>
        </div>

        {/* Theme Controls */}
        <div className={classes.card}>
          <div className="p-6">
            <h2 className={`text-2xl font-semibold mb-4 ${classes.textPrimary}`}>
              {t('appearance.theme')} Controls
            </h2>
            <div className="flex gap-4">
              <button
                onClick={() => changeTheme('light')}
                className={`px-4 py-2 rounded-md ${isDark ? classes.buttonSecondary : classes.button}`}
              >
                {t('appearance.light')}
              </button>
              <button
                onClick={() => changeTheme('dark')}
                className={`px-4 py-2 rounded-md ${!isDark ? classes.buttonSecondary : classes.button}`}
              >
                {t('appearance.dark')}
              </button>
              <button
                onClick={() => changeTheme('system')}
                className={`px-4 py-2 rounded-md ${classes.buttonSecondary}`}
              >
                {t('appearance.system')}
              </button>
            </div>
          </div>
        </div>

        {/* Language Controls */}
        <div className={classes.card}>
          <div className="p-6">
            <h2 className={`text-2xl font-semibold mb-4 ${classes.textPrimary}`}>
              {t('appearance.language')} Controls
            </h2>
            <div className="flex gap-4">
              <button
                onClick={() => changeLanguage('en')}
                className={`px-4 py-2 rounded-md ${language === 'en' ? classes.button : classes.buttonSecondary}`}
              >
                English
              </button>
              <button
                onClick={() => changeLanguage('vi')}
                className={`px-4 py-2 rounded-md ${language === 'vi' ? classes.button : classes.buttonSecondary}`}
              >
                Tiếng Việt
              </button>
            </div>
          </div>
        </div>

        {/* Sample Components */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1 */}
          <div className={classes.card}>
            <div className="p-6">
              <h3 className={`text-xl font-semibold mb-3 ${classes.textPrimary}`}>
                Sample Card 1
              </h3>
              <p className={`mb-4 ${classes.textSecondary}`}>
                This is a sample card to demonstrate theme styling with Tailwind CSS.
              </p>
              <input
                type="text"
                placeholder="Enter some text..."
                className={`w-full ${classes.input}`}
              />
            </div>
          </div>

          {/* Card 2 */}
          <div className={classes.card}>
            <div className="p-6">
              <h3 className={`text-xl font-semibold mb-3 ${classes.textPrimary}`}>
                Sample Card 2
              </h3>
              <p className={`mb-4 ${classes.textSecondary}`}>
                Another sample card showing different styling patterns.
              </p>
              <div className="flex gap-2">
                <button className={classes.button}>
                  {t('common.save')}
                </button>
                <button className={classes.buttonSecondary}>
                  {t('common.cancel')}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Translation Examples */}
        <div className={classes.card}>
          <div className="p-6">
            <h3 className={`text-xl font-semibold mb-4 ${classes.textPrimary}`}>
              Translation Examples
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className={`p-4 rounded-lg ${classes.bgSecondary}`}>
                <h4 className={`font-medium ${classes.textPrimary}`}>Common</h4>
                <p className={`text-sm ${classes.textSecondary}`}>{t('common.save')}</p>
                <p className={`text-sm ${classes.textSecondary}`}>{t('common.cancel')}</p>
                <p className={`text-sm ${classes.textSecondary}`}>{t('common.loading')}</p>
              </div>
              <div className={`p-4 rounded-lg ${classes.bgSecondary}`}>
                <h4 className={`font-medium ${classes.textPrimary}`}>Settings</h4>
                <p className={`text-sm ${classes.textSecondary}`}>{t('settings.title')}</p>
                <p className={`text-sm ${classes.textSecondary}`}>{t('settings.editProfile')}</p>
                <p className={`text-sm ${classes.textSecondary}`}>{t('settings.privacy')}</p>
              </div>
              <div className={`p-4 rounded-lg ${classes.bgSecondary}`}>
                <h4 className={`font-medium ${classes.textPrimary}`}>Appearance</h4>
                <p className={`text-sm ${classes.textSecondary}`}>{t('appearance.theme')}</p>
                <p className={`text-sm ${classes.textSecondary}`}>{t('appearance.language')}</p>
                <p className={`text-sm ${classes.textSecondary}`}>{t('appearance.light')}</p>
              </div>
              <div className={`p-4 rounded-lg ${classes.bgSecondary}`}>
                <h4 className={`font-medium ${classes.textPrimary}`}>Profile</h4>
                <p className={`text-sm ${classes.textSecondary}`}>{t('profile.follow')}</p>
                <p className={`text-sm ${classes.textSecondary}`}>{t('profile.unfollow')}</p>
                <p className={`text-sm ${classes.textSecondary}`}>{t('profile.message')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeDemo;
