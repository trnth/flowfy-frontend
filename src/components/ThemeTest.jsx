import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { getCommonClasses } from '@/utils/themeUtils';

const ThemeTest = () => {
  const { isDark, changeTheme } = useTheme();
  const { t, language, changeLanguage } = useLanguage();
  const classes = getCommonClasses(isDark);

  return (
    <div className={`min-h-screen p-8 ${classes.container}`}>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className={`text-4xl font-bold mb-4 ${classes.heading}`}>
            Theme System Test
          </h1>
          <p className={`text-lg ${classes.subheading}`}>
            Current: {isDark ? 'Dark' : 'Light'} | Language: {language}
          </p>
        </div>

        {/* Theme Controls */}
        <div className={classes.card}>
          <div className="p-6">
            <h2 className={`text-2xl font-semibold mb-4 ${classes.heading}`}>
              Theme Controls
            </h2>
            <div className="flex gap-4 flex-wrap">
              <button
                onClick={() => changeTheme('light')}
                className={`px-4 py-2 rounded-md ${isDark ? classes.buttonSecondary : classes.button}`}
              >
                Light
              </button>
              <button
                onClick={() => changeTheme('dark')}
                className={`px-4 py-2 rounded-md ${!isDark ? classes.buttonSecondary : classes.button}`}
              >
                Dark
              </button>
              <button
                onClick={() => changeTheme('system')}
                className={`px-4 py-2 rounded-md ${classes.buttonSecondary}`}
              >
                System
              </button>
            </div>
          </div>
        </div>

        {/* Language Controls */}
        <div className={classes.card}>
          <div className="p-6">
            <h2 className={`text-2xl font-semibold mb-4 ${classes.heading}`}>
              Language Controls
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
              <h3 className={`text-xl font-semibold mb-3 ${classes.heading}`}>
                Sample Card 1
              </h3>
              <p className={`mb-4 ${classes.subheading}`}>
                This card demonstrates theme styling with getCommonClasses().
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
              <h3 className={`text-xl font-semibold mb-3 ${classes.heading}`}>
                Sample Card 2
              </h3>
              <p className={`mb-4 ${classes.subheading}`}>
                Another card showing different styling patterns.
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

        {/* Translation Test */}
        <div className={classes.card}>
          <div className="p-6">
            <h3 className={`text-xl font-semibold mb-4 ${classes.heading}`}>
              Translation Test
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className={`p-4 rounded-lg ${classes.bgSecondary}`}>
                <h4 className={`font-medium ${classes.heading}`}>Common</h4>
                <p className={`text-sm ${classes.subheading}`}>{t('common.save')}</p>
                <p className={`text-sm ${classes.subheading}`}>{t('common.cancel')}</p>
                <p className={`text-sm ${classes.subheading}`}>{t('common.loading')}</p>
              </div>
              <div className={`p-4 rounded-lg ${classes.bgSecondary}`}>
                <h4 className={`font-medium ${classes.heading}`}>Settings</h4>
                <p className={`text-sm ${classes.subheading}`}>{t('settings.title')}</p>
                <p className={`text-sm ${classes.subheading}`}>{t('settings.editProfile')}</p>
                <p className={`text-sm ${classes.subheading}`}>{t('settings.privacy')}</p>
              </div>
              <div className={`p-4 rounded-lg ${classes.bgSecondary}`}>
                <h4 className={`font-medium ${classes.heading}`}>Chat</h4>
                <p className={`text-sm ${classes.subheading}`}>{t('chat.send')}</p>
                <p className={`text-sm ${classes.subheading}`}>{t('chat.reply')}</p>
                <p className={`text-sm ${classes.subheading}`}>{t('chat.online')}</p>
              </div>
              <div className={`p-4 rounded-lg ${classes.bgSecondary}`}>
                <h4 className={`font-medium ${classes.heading}`}>Profile</h4>
                <p className={`text-sm ${classes.subheading}`}>{t('profile.follow')}</p>
                <p className={`text-sm ${classes.subheading}`}>{t('profile.unfollow')}</p>
                <p className={`text-sm ${classes.subheading}`}>{t('profile.message')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* System Messages Test */}
        <div className={classes.card}>
          <div className="p-6">
            <h3 className={`text-xl font-semibold mb-4 ${classes.heading}`}>
              System Messages Test
            </h3>
            <div className="space-y-2">
              <div className={`p-3 rounded-lg ${classes.bgSecondary}`}>
                <p className={`text-sm ${classes.subheading}`}>
                  {t('chat.someone')} {t('chat.groupCreated')}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${classes.bgSecondary}`}>
                <p className={`text-sm ${classes.subheading}`}>
                  {t('chat.someone')} {t('chat.userAdded').replace('{user}', 'John')}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${classes.bgSecondary}`}>
                <p className={`text-sm ${classes.subheading}`}>
                  {t('chat.someone')} {t('chat.userRemoved').replace('{user}', 'Jane')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeTest;
