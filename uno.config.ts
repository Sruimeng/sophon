import {
  defineConfig,
  presetIcons,
  presetWind3,
  transformerCompileClass,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss';
import presetAnimations from 'unocss-preset-animations';

export default defineConfig({
  presets: [
    presetWind3({
      breakpoints: {
        sm: '768px',
      },
    }),
    presetAnimations(),
    presetIcons({
      autoInstall: true,
    }),
  ],
  transformers: [transformerDirectives(), transformerVariantGroup(), transformerCompileClass()],
  theme: {
    colors: {
      // Legacy CSS variables
      background: 'rgba(var(--color-background) / <alpha-value>)',
      foreground: 'rgba(var(--color-foreground) / <alpha-value>)',
      primary: 'rgba(var(--color-primary) / <alpha-value>)',
      secondary: 'rgba(var(--color-secondary) / <alpha-value>)',
      accent: 'rgba(var(--color-accent) / <alpha-value>)',
      muted: 'rgba(var(--color-muted) / <alpha-value>)',

      // Nexus Design System tokens
      obsidian: {
        100: '#0a0a0f',
        200: '#12121a',
        300: '#1a1a24',
      },
      steel: {
        100: '#6b7280',
        200: '#9ca3af',
        300: '#d1d5db',
      },
      mist: {
        100: '#e5e7eb',
        200: '#f3f4f6',
        300: '#f9fafb',
      },
      core: {
        blue: '#3b82f6',
      },
      status: {
        error: '#ef4444',
        success: '#22c55e',
        warning: '#f59e0b',
      },
      surface: {
        primary: '#0a0a0f',
        secondary: '#12121a',
        dim: '#1a1a24',
        hover: '#252530',
      },
      border: {
        subtle: 'rgba(255, 255, 255, 0.1)',
        dim: 'rgba(255, 255, 255, 0.05)',
        focus: '#3b82f6',
      },
      text: {
        primary: '#f9fafb',
        secondary: '#9ca3af',
        disabled: '#6b7280',
        accent: '#3b82f6',
      },
    },
  },
  rules: [
    // 安全距离相关的工具类
    ['safe-area-pt', { 'padding-top': 'env(safe-area-inset-top, 0px)' }],
    ['safe-area-pb', { 'padding-bottom': 'env(safe-area-inset-bottom, 0px)' }],
    [
      'safe-area-px',
      {
        'padding-left': 'env(safe-area-inset-left, 0px)',
        'padding-right': 'env(safe-area-inset-right, 0px)',
      },
    ],
    [
      'safe-area-py',
      {
        'padding-top': 'env(safe-area-inset-top, 0px)',
        'padding-bottom': 'env(safe-area-inset-bottom, 0px)',
      },
    ],
    [
      'scrollbar-thin',
      {
        'scrollbar-width': 'thin',
        'border-radius': '30px',
        'scrollbar-color': 'rgba(153, 153, 153, 1) rgba(32, 32, 32, 1)',
      },
    ],
  ],
});
