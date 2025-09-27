// Theme utility functions for Tailwind CSS
export const getThemeClasses = (isDark) => {
  return {
    // Background colors
    bgPrimary: isDark ? 'bg-slate-900' : 'bg-white',
    bgSecondary: isDark ? 'bg-slate-800' : 'bg-slate-50',
    bgTertiary: isDark ? 'bg-slate-700' : 'bg-slate-100',
    
    // Text colors
    textPrimary: isDark ? 'text-slate-100' : 'text-slate-900',
    textSecondary: isDark ? 'text-slate-300' : 'text-slate-600',
    textTertiary: isDark ? 'text-slate-400' : 'text-slate-500',
    
    // Border colors
    borderPrimary: isDark ? 'border-slate-700' : 'border-slate-200',
    borderSecondary: isDark ? 'border-slate-600' : 'border-slate-300',
    
    // Accent colors
    accent: 'text-blue-600',
    accentBg: 'bg-blue-600',
    accentHover: 'hover:bg-blue-700',
    
    // Interactive states
    hover: isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-100',
    focus: 'focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
    
    // Placeholder
    placeholder: isDark ? 'placeholder-slate-400' : 'placeholder-slate-500',
  };
};

// Common theme class combinations
export const getCommonClasses = (isDark) => {
  const theme = getThemeClasses(isDark);
  
  return {
    // Card styles
    card: `${theme.bgPrimary} ${theme.borderPrimary} border rounded-lg`,
    cardHover: `${theme.card} ${theme.hover} transition-colors`,
    
    // Input styles
    input: `${theme.bgPrimary} ${theme.textPrimary} ${theme.borderPrimary} border rounded-md px-3 py-2 ${theme.placeholder} focus:outline-none focus:ring-2 focus:ring-blue-500`,
    
    // Button styles
    buttonPrimary: `${theme.accentBg} text-white px-4 py-2 rounded-md ${theme.accentHover} transition-colors`,
    buttonSecondary: `${theme.bgSecondary} ${theme.textPrimary} ${theme.borderPrimary} border px-4 py-2 rounded-md ${theme.hover} transition-colors`,
    
    // Text styles
    heading: `${theme.textPrimary} font-semibold`,
    subheading: `${theme.textSecondary} font-medium`,
    body: `${theme.textPrimary}`,
    caption: `${theme.textTertiary} text-sm`,
    
    // Layout styles
    container: `${theme.bgPrimary} min-h-screen`,
    sidebar: `${theme.bgSecondary} ${theme.borderPrimary} border-r`,
    content: `${theme.bgPrimary} flex-1`,
  };
};
