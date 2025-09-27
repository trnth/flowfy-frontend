import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/contexts/ToastContext';
import { getCommonClasses } from '@/utils/themeUtils';

const ToastTest = () => {
  const { isDark, changeTheme } = useTheme();
  const { t, language, changeLanguage } = useLanguage();
  const { success, error, warning, info, loading, promise, dismissAll } = useToast();
  const classes = getCommonClasses(isDark);

  const handleSuccess = () => {
    success('toast.success.login');
  };

  const handleError = () => {
    error('toast.error.network');
  };

  const handleWarning = () => {
    warning('toast.warning.unsavedChanges');
  };

  const handleInfo = () => {
    info('toast.info.newMessage');
  };

  const handleLoading = () => {
    const toastId = loading('toast.info.loading');
    setTimeout(() => {
      success('toast.success.profileUpdated');
    }, 2000);
  };

  const handlePromise = () => {
    const mockPromise = new Promise((resolve, reject) => {
      setTimeout(() => {
        Math.random() > 0.5 ? resolve() : reject();
      }, 2000);
    });

    promise(mockPromise, {
      loading: 'toast.info.saving',
      success: 'toast.success.settingsSaved',
      error: 'toast.error.settingsSave',
    });
  };

  const handleCustomMessage = () => {
    success('toast.success.login', {
      message: 'Custom success message!',
      description: 'This is a custom description',
    });
  };

  return (
    <div className={`min-h-screen p-8 ${classes.container}`}>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className={`text-4xl font-bold mb-4 ${classes.heading}`}>
            Toast System Test
          </h1>
          <p className={`text-lg ${classes.subheading}`}>
            Test toast notifications with theme and language support
          </p>
        </div>

        {/* Theme & Language Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={classes.card}>
            <div className="p-6">
              <h2 className={`text-xl font-semibold mb-4 ${classes.heading}`}>
                Theme Controls
              </h2>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => changeTheme('light')}
                  className={`px-3 py-2 rounded-md text-sm ${isDark ? classes.buttonSecondary : classes.button}`}
                >
                  Light
                </button>
                <button
                  onClick={() => changeTheme('dark')}
                  className={`px-3 py-2 rounded-md text-sm ${!isDark ? classes.buttonSecondary : classes.button}`}
                >
                  Dark
                </button>
                <button
                  onClick={() => changeTheme('system')}
                  className={`px-3 py-2 rounded-md text-sm ${classes.buttonSecondary}`}
                >
                  System
                </button>
              </div>
            </div>
          </div>

          <div className={classes.card}>
            <div className="p-6">
              <h2 className={`text-xl font-semibold mb-4 ${classes.heading}`}>
                Language Controls
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => changeLanguage('en')}
                  className={`px-3 py-2 rounded-md text-sm ${language === 'en' ? classes.button : classes.buttonSecondary}`}
                >
                  English
                </button>
                <button
                  onClick={() => changeLanguage('vi')}
                  className={`px-3 py-2 rounded-md text-sm ${language === 'vi' ? classes.button : classes.buttonSecondary}`}
                >
                  Tiếng Việt
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Toast Test Buttons */}
        <div className={classes.card}>
          <div className="p-6">
            <h2 className={`text-xl font-semibold mb-4 ${classes.heading}`}>
              Toast Types
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <button
                onClick={handleSuccess}
                className={`px-4 py-2 rounded-md ${classes.button}`}
              >
                Success Toast
              </button>
              <button
                onClick={handleError}
                className={`px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white`}
              >
                Error Toast
              </button>
              <button
                onClick={handleWarning}
                className={`px-4 py-2 rounded-md bg-yellow-600 hover:bg-yellow-700 text-white`}
              >
                Warning Toast
              </button>
              <button
                onClick={handleInfo}
                className={`px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white`}
              >
                Info Toast
              </button>
              <button
                onClick={handleLoading}
                className={`px-4 py-2 rounded-md bg-purple-600 hover:bg-purple-700 text-white`}
              >
                Loading Toast
              </button>
              <button
                onClick={handlePromise}
                className={`px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white`}
              >
                Promise Toast
              </button>
            </div>
          </div>
        </div>

        {/* Custom Toast */}
        <div className={classes.card}>
          <div className="p-6">
            <h2 className={`text-xl font-semibold mb-4 ${classes.heading}`}>
              Custom Toast
            </h2>
            <button
              onClick={handleCustomMessage}
              className={`px-4 py-2 rounded-md ${classes.button}`}
            >
              Custom Message Toast
            </button>
          </div>
        </div>

        {/* Clear All */}
        <div className={classes.card}>
          <div className="p-6">
            <h2 className={`text-xl font-semibold mb-4 ${classes.heading}`}>
              Clear All Toasts
            </h2>
            <button
              onClick={dismissAll}
              className={`px-4 py-2 rounded-md ${classes.buttonSecondary}`}
            >
              Dismiss All
            </button>
          </div>
        </div>

        {/* Translation Examples */}
        <div className={classes.card}>
          <div className="p-6">
            <h2 className={`text-xl font-semibold mb-4 ${classes.heading}`}>
              Translation Examples
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`p-4 rounded-lg ${classes.bgSecondary}`}>
                <h3 className={`font-medium ${classes.heading}`}>Success Messages</h3>
                <div className="space-y-2 mt-2">
                  <p className={`text-sm ${classes.subheading}`}>{t('toast.success.login')}</p>
                  <p className={`text-sm ${classes.subheading}`}>{t('toast.success.signup')}</p>
                  <p className={`text-sm ${classes.subheading}`}>{t('toast.success.profileUpdated')}</p>
                </div>
              </div>
              <div className={`p-4 rounded-lg ${classes.bgSecondary}`}>
                <h3 className={`font-medium ${classes.heading}`}>Error Messages</h3>
                <div className="space-y-2 mt-2">
                  <p className={`text-sm ${classes.subheading}`}>{t('toast.error.login')}</p>
                  <p className={`text-sm ${classes.subheading}`}>{t('toast.error.network')}</p>
                  <p className={`text-sm ${classes.subheading}`}>{t('toast.error.unauthorized')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToastTest;
