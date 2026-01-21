'use client';

import { useState, useEffect } from 'react';
import { themes, type Theme, applyTheme } from '@/lib/themes';
import { ChevronDown, Palette } from 'lucide-react';

export function ThemeSwitcher() {
  const [currentTheme, setCurrentTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('app-theme') as Theme | null;
      if (saved && themes[saved]) return saved;
    }
    return 'duster';
  });
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    applyTheme(themes[currentTheme]);
  }, [currentTheme]);

  const handleThemeChange = (theme: Theme) => {
    setCurrentTheme(theme);
    localStorage.setItem('app-theme', theme);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card border border-border hover:border-primary transition-all text-sm"
      >
        <Palette className="w-4 h-4" />
        <span className="hidden sm:inline">{themes[currentTheme].label}</span>
        <ChevronDown className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-lg bg-card border border-border shadow-lg overflow-hidden z-50">
          {(Object.entries(themes) as [Theme, typeof themes[Theme]][]).map(([key, theme]) => (
            <button
              key={key}
              onClick={() => handleThemeChange(key)}
              className={`w-full text-left px-4 py-3 transition-colors flex items-center gap-3 ${
                currentTheme === key
                  ? 'bg-primary/20 text-primary'
                  : 'hover:bg-border text-foreground'
              }`}
            >
              <div
                className="w-4 h-4 rounded-full border-2"
                style={{
                  backgroundColor: theme.colors.primary,
                  borderColor: theme.colors.secondary,
                }}
              />
              <div>
                <div className="font-medium">{theme.label}</div>
                <div className="text-xs text-muted">{theme.description}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
