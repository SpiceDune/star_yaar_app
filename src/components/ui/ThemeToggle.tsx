import { useState, useEffect } from 'react';

const COLOR_THEMES = [
  { id: 'orange', label: 'Orange', swatch: 'hsl(24.6 95% 53.1%)' },
  { id: 'yellow', label: 'Yellow', swatch: 'hsl(47.9 95.8% 53.1%)' },
] as const;

type ColorTheme = (typeof COLOR_THEMES)[number]['id'];

export default function ThemeToggle() {
  const [colorTheme, setColorTheme] = useState<ColorTheme>('orange');

  useEffect(() => {
    const storedColor = localStorage.getItem('color-theme') as ColorTheme | null;
    if (storedColor && COLOR_THEMES.some(t => t.id === storedColor)) {
      setColorTheme(storedColor);
      applyColorTheme(storedColor);
    }
  }, []);

  function applyColorTheme(id: ColorTheme) {
    const el = document.documentElement;
    COLOR_THEMES.forEach(t => el.classList.remove(`theme-${t.id}`));
    if (id !== 'orange') el.classList.add(`theme-${id}`);
  }

  function cycleColor() {
    const idx = COLOR_THEMES.findIndex(t => t.id === colorTheme);
    const next = COLOR_THEMES[(idx + 1) % COLOR_THEMES.length];
    setColorTheme(next.id);
    applyColorTheme(next.id);
    localStorage.setItem('color-theme', next.id);
  }

  return (
    <button
      onClick={cycleColor}
      aria-label={`Switch color theme (current: ${colorTheme})`}
      title={`Theme: ${colorTheme}`}
      className="w-7 h-7 rounded-lg flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity"
    >
      <span
        className="w-4 h-4 rounded-full border-2 border-border"
        style={{ background: COLOR_THEMES.find(t => t.id === colorTheme)?.swatch }}
      />
    </button>
  );
}
